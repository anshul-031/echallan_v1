import { NextResponse } from 'next/server';
import { PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { r2Client, BUCKET_NAME } from '@/lib/cloudflare';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';

// Map document types to database field names
const docTypeToField: Record<string, string> = {
  'Road Tax': 'roadTaxDoc',
  'Fitness': 'fitnessDoc',
  'Insurance': 'insuranceDoc',
  'Pollution': 'pollutionDoc',
  'Permit': 'statePermitDoc',
  'National Permit': 'nationalPermitDoc'
};

export async function POST(req: Request) {
  let fileKey = '';

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const vrn = formData.get('vrn') as string;
    const docType = formData.get('docType') as string;
    const userId = session.user.id;

    console.log('Received file:', file);
    console.log('Received vrn:', vrn);  

    if (!file || !vrn || !docType || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size must be less than 10MB' },
        { status: 400 }
      );
    }

    // Validate file type
    const validTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Only PDF, JPG, and PNG files are allowed' },
        { status: 400 }
      );
    }

    // Get the corresponding database field name
    const dbField = docTypeToField[docType];
    if (!dbField) {
      return NextResponse.json(
        { error: 'Invalid document type' },
        { status: 400 }
      );
    }

    // Find the vehicle first
    const existingVehicle = await prisma.vehicle.findFirst({
      where: {
        vrn,
        ownerId: userId
      }
    });
    console.log('Existing vehicle:', existingVehicle);

    if (!existingVehicle) {
      return NextResponse.json(
        { error: 'Vehicle not found or does not belong to the user' },
        { status: 404 }
      );
    }

    const buffer = await file.arrayBuffer();
    
    // Use the new file structure with userId
    fileKey = `${userId}/${vrn}/${docType}/${file.name}`;
    const r2Url = `https://${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}/${fileKey}`;

    try {
      // Upload to R2
      const uploadCommand = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: fileKey,
        Body: Buffer.from(buffer),
        ContentType: file.type,
      });
      
      await r2Client.send(uploadCommand);

      // Update the vehicle document URL in database
      const updatedVehicle = await prisma.vehicle.update({
        where: { 
          id: existingVehicle.id
        },
        data: {
          [dbField]: r2Url,
          lastUpdated: new Date().toISOString()
        }
      });

      if (!updatedVehicle) {
        throw new Error('Failed to update vehicle document');
      }

      return NextResponse.json({ 
        success: true,
        fileKey,
        url: r2Url 
      });

    } catch (error) {
      // If anything fails after file upload, try to delete the uploaded file
      try {
        const deleteCommand = new DeleteObjectCommand({
          Bucket: BUCKET_NAME,
          Key: fileKey
        });
        await r2Client.send(deleteCommand);
      } catch (deleteError) {
        console.error('Failed to delete R2 object after error:', deleteError);
      }
      throw error;
    }

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to upload file' },
      { status: 500 }
    );
  }
}