import { NextResponse } from 'next/server';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { r2Client, BUCKET_NAME } from '@/lib/cloudflare';

const MAX_FILE_SIZE = 500 * 1024; // 500KB
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/jpg'];

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;
        const userId = formData.get('userId') as string;

        if (!file) {
            return new NextResponse('No file provided', { status: 400 });
        }

        // Validate file size
        if (file.size > MAX_FILE_SIZE) {
            return new NextResponse('File size should be less than 500KB', { status: 400 });
        }

        // Validate file type
        if (!ALLOWED_FILE_TYPES.includes(file.type)) {
            return new NextResponse('Only JPEG, JPG and PNG files are allowed', { status: 400 });
        }

        // Convert file to buffer
        const buffer = await file.arrayBuffer();

        // Generate unique filename
        const timestamp = Date.now();
        const filename = `users/${userId}/${timestamp}-${file.name}`;

        // Upload to R2
        await r2Client.send(
            new PutObjectCommand({
                Bucket: BUCKET_NAME,
                Key: filename,
                Body: Buffer.from(buffer),
                ContentType: file.type,
            })
        );

        // Generate public URL
        const baseUrl = process.env.R2_PUBLIC_URL?.replace(/^https?:\/\//, '');
        const imageUrl = `https://${baseUrl}/${filename}`;

        return NextResponse.json({ url: imageUrl });
    } catch (error) {
        console.error('Error uploading image:', error);
        return new NextResponse('Error uploading image', { status: 500 });
    }
}