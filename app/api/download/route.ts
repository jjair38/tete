import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 });
  }

  try {
    let response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
      },
      redirect: 'follow'
    });

    // If forbidden, try with Instagram referer
    if (response.status === 403) {
      response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
          'Referer': 'https://www.instagram.com/',
        },
        redirect: 'follow'
      });
    }

    if (!response.ok) throw new Error(`Failed to fetch video: ${response.status}`);

    const contentType = response.headers.get('content-type') || 'video/mp4';
    const contentLength = response.headers.get('content-length');
    
    const headers: Record<string, string> = {
      'Content-Type': contentType,
      'Content-Disposition': `attachment; filename="social_save_${Date.now()}_video.mp4"`,
      'Cache-Control': 'no-cache'
    };

    if (contentLength) {
      headers['Content-Length'] = contentLength;
    }

    return new Response(response.body, {
      headers,
    });
  } catch (error) {
    console.error('Proxy Error:', error);
    return NextResponse.json({ error: 'Failed to download file' }, { status: 500 });
  }
}
