import { NextResponse } from 'next/server';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { r2Client, BUCKET_NAME } from '@/lib/cloudflare';

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;
        const vehicleId = formData.get('vehicleId') as string;
        const docType = formData.get('docType') as string;

        if (!file) {
            return NextResponse.json(
                { error: 'No file provided' },
                { status: 400 }
            );
        }

        // Validate file size (10MB max)
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

        // Convert file to buffer
        const buffer = await file.arrayBuffer();
        
        // Generate unique filename
        const timestamp = Date.now();
        const filename = `vehicles/${vehicleId}/${docType}/${timestamp}-${file.name}`;

        // Upload to R2
        const command = new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: filename,
            Body: Buffer.from(buffer),
            ContentType: file.type
        });
        
        await r2Client.send(command);

        // Generate public URL
        const baseUrl = process.env.R2_PUBLIC_URL?.replace(/^https?:\/\//, '');
        const url = `https://${baseUrl}/${filename}`;

        return NextResponse.json({
            success: true,
            url
        });
    } catch (error) {
        console.error('Error uploading document:', error);
        return NextResponse.json(
            { error: 'Failed to upload document' },
            { status: 500 }
        );
    }
}

// Increase payload size limit for file uploads
export const config = {
    api: {
        bodyParser: {
            sizeLimit: '10mb',
        },
    },
};