import { NextRequest, NextResponse } from 'next/server';
import { listDocuments } from '@/lib/cloudflare'; // Assuming you have a function to list documents in Cloudflare

// Add export config for dynamic rendering
 

export async function GET(req: NextRequest) {
  try {
    const vrn = req.nextUrl.searchParams.get('vrn');

    if (!vrn) {
      return NextResponse.json({ message: 'VRN is required' }, { status: 400 });
    }

    const documents = await listDocuments(vrn);

    return NextResponse.json(documents);
  } catch (error) {
    console.error('Error listing documents:', error);
    return NextResponse.json({ message: 'Failed to list documents' }, { status: 500 });
  }
}
