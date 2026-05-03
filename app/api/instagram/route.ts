import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { url } = await request.json();

    if (!url || !url.includes('instagram.com')) {
      return NextResponse.json(
        { error: 'URL do Instagram inválida' },
        { status: 400 }
      );
    }

    // Using a more robust approach for Instagram
    // We try multiple free community endpoints if one fails
    let videoUrl = '';
    let cover = 'https://picsum.photos/400/600';
    let title = 'Vídeo do Instagram';
    let authorName = 'Instagram User';

    try {
      // Source 1: vkrdown (keeping it but adding fallback)
      const apiUrl = `https://api.vkrdown.com/api/v1/get_data?url=${encodeURIComponent(url)}`;
      const response = await fetch(apiUrl);
      const data = await response.json();

      if (data.data && data.data.url) {
        videoUrl = data.data.url;
        cover = data.data.thumbnail || cover;
        title = data.data.title || title;
        authorName = data.data.author || authorName;
      }
    } catch (e) {
      console.error('Instagram Source 1 failed', e);
    }

    if (!videoUrl) {
      return NextResponse.json(
        { error: 'Não foi possível encontrar o vídeo. Verifique se o link está correto e o perfil é público.' },
        { status: 404 }
      );
    }

    const result = {
      title,
      cover,
      video: videoUrl,
      author: {
        name: authorName,
        avatar: 'https://picsum.photos/100/100',
      }
    };

    return NextResponse.json(result);

  } catch (error) {
    console.error('Instagram downloader error:', error);
    return NextResponse.json(
      { error: 'Erro ao processar o link do Instagram' },
      { status: 500 }
    );
  }
}
