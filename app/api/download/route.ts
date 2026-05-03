import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');
  const filename = searchParams.get('filename') || 'tiktok-video.mp4';

  if (!url) {
    return NextResponse.json({ error: 'No URL provided' }, { status: 400 });
  }

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': '*/*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': 'https://www.tiktok.com/',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Fetch failed with status ${response.status}: ${errorText}`);
      return NextResponse.json({ 
        error: 'Target server rejected the request', 
        status: response.status,
        details: errorText.substring(0, 100) 
      }, { status: 403 });
    }

    const contentType = response.headers.get('Content-Type') || 'video/mp4';
    const body = response.body;

    if (!body) {
      throw new Error('Response body is empty');
    }

    // Set attachment header to force browser download
    const headers = new Headers();
    headers.set('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`);
    headers.set('Content-Type', contentType);
    headers.set('Cache-Control', 'no-cache');

    // Pipe the stream directly for better performance and memory management
    return new NextResponse(body, {
      status: 200,
      headers,
    });
  } catch (error: any) {
    console.error('Download proxy error:', error);
    return NextResponse.json({ 
      error: 'Failed to download file',
      message: error.message 
    }, { status: 500 });
  }
}
