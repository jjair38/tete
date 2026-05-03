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

    // Se o conteúdo for muito pequeno (ex: uma página de erro HTML de 500 bytes), avisamos
    // Vídeos raramente têm menos de 10KB
    const buffer = await response.arrayBuffer();
    if (buffer.byteLength < 1000 && contentType.includes('text')) {
      return new NextResponse(JSON.stringify({ 
        error: 'O link gerado não é um arquivo de mídia válido',
        details: new TextDecoder().decode(buffer).substring(0, 100)
      }), {
        status: 415,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const headers = new Headers();
    headers.set('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`);
    headers.set('Content-Type', contentType);
    if (contentLength) headers.set('Content-Length', buffer.byteLength.toString());
    headers.set('Cache-Control', 'no-store'); // Evitar cache de links expirados

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
