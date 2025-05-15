import { NextRequest, NextResponse } from 'next/server';
import https from 'https';

const API_KEY = 'abcd123';

 
 

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const rc_no = searchParams.get('rc_no');

  if (!rc_no) {
    return NextResponse.json({ error: 'Missing rc_no parameter' }, { status: 400 });
  }

  const vahanApiUrl = `https://number.vahanfin.com/vehiclenumber/${rc_no}`;

  try {
    // REMOVE SSL VERIFICATION BYPASS BEFORE PRODUCTION
    const response = await fetch(vahanApiUrl, {
      headers: {
        'x-api-key': API_KEY,
      },
    });

    if (!response.ok) {
      console.error(`Vahan API request failed with status ${response.status}`);
      return NextResponse.json({ error: `Vahan API request failed with status ${response.status}` }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Proxy error:', error);
    return NextResponse.json({ error: 'Failed to fetch vehicle data' }, { status: 500 });
  }
}
