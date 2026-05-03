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
      // Se falhar o acesso ao arquivo original, retornamos o erro como JSON sem o header de attachment
      return new NextResponse(JSON.stringify({ 
        error: 'Arquivo original inacessível', 
        status: response.status 
      }), {
        status: response.status,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const contentType = response.headers.get('content-type') || 'application/octet-stream';
    const contentLength = response.headers.get('content-length');

    // Usar streaming em vez de arrayBuffer para evitar estouro de memória e timeout
    const body = response.body;

    if (!body) {
      throw new Error('Corpo da resposta vazio');
    }

    const headers = new Headers();
    headers.set('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`);
    headers.set('Content-Type', contentType);
    if (contentLength) headers.set('Content-Length', contentLength);
    headers.set('Cache-Control', 'no-store');

    return new NextResponse(body, {
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
