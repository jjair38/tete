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

    // Using a more reliable public API for Instagram
    const apiUrl = `https://api.vkrdown.com/api/v1/get_data?url=${encodeURIComponent(url)}`;
    const response = await fetch(apiUrl);
    const data = await response.json();

    if (!data.data || !data.data.url) {
      return NextResponse.json(
        { error: 'Não foi possível encontrar o vídeo. Verifique se o perfil é público.' },
        { status: 500 }
      );
    }

    const result = {
      title: data.data.title || 'Vídeo do Instagram',
      cover: data.data.thumbnail || 'https://picsum.photos/400/600',
      video: data.data.url, // URL direta para o vídeo
      author: {
        name: data.data.author || 'Instagram User',
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
