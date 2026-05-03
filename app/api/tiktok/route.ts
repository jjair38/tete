import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { url } = await request.json();

    if (!url || !url.includes('tiktok.com')) {
      return NextResponse.json(
        { error: 'URL do TikTok inválida' },
        { status: 400 }
      );
    }

    // Using TikWM public API (Unofficial)
    // This is a common public API for fetching TikTok metadata
    const response = await fetch('https://www.tikwm.com/api/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        url: url,
        count: '12',
        cursor: '0',
        web: '1',
        hd: '1',
      }),
    });

    const data = await response.json();

    if (data.code !== 0) {
      return NextResponse.json(
        { error: data.msg || 'Falha ao buscar dados do vídeo' },
        { status: 500 }
      );
    }

    const baseUrl = 'https://www.tikwm.com';
    const ensureAbsolute = (path: string) => {
      if (!path) return '';
      if (path.startsWith('http')) return path;
      return path.startsWith('/') ? `${baseUrl}${path}` : `${baseUrl}/${path}`;
    };

    // Extracting needed data
    const result = {
      title: data.data.title,
      cover: ensureAbsolute(data.data.cover),
      video: ensureAbsolute(data.data.play), // Normal quality
      videoHd: ensureAbsolute(data.data.hdplay), // HD quality
      music: ensureAbsolute(data.data.music),
      author: {
        name: data.data.author.nickname,
        avatar: ensureAbsolute(data.data.author.avatar),
      },
      stats: {
        plays: data.data.play_count,
        digg: data.data.digg_count,
        comments: data.data.comment_count,
        share: data.data.share_count,
      },
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('TikTok downloader error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
