import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 });
  }

  try {
    // Example TikTok API (public/free)
    const apiUrl = `https://www.tikwm.com/api/?url=${encodeURIComponent(url)}`;
    const response = await fetch(apiUrl);
    const data = await response.json();

    if (!data.data) {
      return NextResponse.json({ error: 'Failed to fetch TikTok data' }, { status: 404 });
    }

    const formats = [];
    
    if (data.data.hdplay) {
      formats.push({
        quality: 'HD',
        url: data.data.hdplay,
        size: data.data.hd_size ? `${(data.data.hd_size / 1024 / 1024).toFixed(2)} MB` : undefined
      });
    }
    
    if (data.data.play) {
      formats.push({
        quality: 'SD',
        url: data.data.play,
        size: data.data.size ? `${(data.data.size / 1024 / 1024).toFixed(2)} MB` : undefined
      });
    }

    return NextResponse.json({
      title: data.data.title,
      cover: data.data.cover,
      video: data.data.play,
      formats: formats,
      music: data.data.music,
      author: {
        name: data.data.author.nickname,
        avatar: data.data.author.avatar
      }
    });

  } catch (error) {
    console.error('TikTok API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
