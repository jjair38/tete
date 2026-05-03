import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');
  const filename = searchParams.get('filename') || 'download.mp4';

  if (!url) {
    return NextResponse.json({ error: 'Nenhum URL fornecido' }, { status: 400 });
  }

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
        'Accept': '*/*',
        'Referer': 'https://www.tiktok.com/',
      },
    });

    if (!response.ok) {
      console.error(`Falha no proxy: ${response.status}`);
      return NextResponse.json({ error: 'Erro ao acessar o arquivo original' }, { status: response.status });
    }

    const contentType = response.headers.get('content-type') || 'application/octet-stream';
    const contentLength = response.headers.get('content-length');

    // Usamos arrayBuffer para garantir que o conteúdo seja lido completamente antes de ser enviado
    // Isso evita problemas com streams interrompidos em certos ambientes
    const buffer = await response.arrayBuffer();

    const headers = new Headers();
    headers.set('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`);
    headers.set('Content-Type', contentType);
    if (contentLength) headers.set('Content-Length', contentLength);
    headers.set('Cache-Control', 'public, max-age=3600');

    return new NextResponse(buffer, {
      status: 200,
      headers,
    });
  } catch (error: any) {
    console.error('Erro no download proxy:', error);
    return NextResponse.json({ 
      error: 'Falha ao processar o download',
      message: error.message 
    }, { status: 500 });
  }
}
