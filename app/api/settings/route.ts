import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Since we're using localStorage in the front-end, we'll return a simple success response
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error with settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    // Since we're using localStorage in the front-end, we'll return a simple success response
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error with settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 