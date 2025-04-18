import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    try {
        // Get the URL parameters
        const url = new URL(request.url);
        const fileUrl = url.searchParams.get('url');
        const fileName = url.searchParams.get('fileName');

        if (!fileUrl || !fileName) {
            return new NextResponse('Missing url or fileName', { status: 400 });
        }

        // Fetch the file from R2
        const response = await fetch(fileUrl);
        
        if (!response.ok) {
            throw new Error('Failed to fetch file');
        }

        // Get the file content as blob
        const blob = await response.blob();

        // Set response headers for download
        const headers = new Headers();
        headers.set('Content-Type', blob.type);
        headers.set('Content-Disposition', `attachment; filename="${fileName}"`);
        headers.set('Content-Length', blob.size.toString());

        return new NextResponse(blob, {
            headers,
            status: 200
        });
    } catch (error) {
        console.error('Download error:', error);
        return new NextResponse('Failed to download file', { status: 500 });
    }
}