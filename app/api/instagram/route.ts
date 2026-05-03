import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 });
  }

  let videoUrl = '';
  let formats: any[] = [];
  let musicUrl = '';
  let cover = 'https://picsum.photos/400/600';
  let title = 'Vídeo do Instagram';
  let authorName = 'Instagram User';

  const sources = [
    `https://api.vkrdown.com/api/v1/get_data?url=${encodeURIComponent(url)}`,
    `https://api2.vkrdown.com/api/v1/get_data?url=${encodeURIComponent(url)}`,
    `https://pub-api.vkrdown.com/api/get_data?url=${encodeURIComponent(url)}`
  ];

  for (const apiUrl of sources) {
    if (videoUrl) break;

    try {
      const response = await fetch(apiUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36'
        },
        next: { revalidate: 0 }
      });
      
      if (!response.ok) continue;
      
      const data = await response.json();

      if (data.data && (data.data.url || data.data.medias)) {
        if (data.data.url) {
          videoUrl = data.data.url;
          formats.push({ quality: 'Normal', url: videoUrl });
        }
        
        if (data.data.medias && data.data.medias.length > 0) {
          const videoMedias = data.data.medias.filter((m: any) => m.type === 'video');
          if (videoMedias.length > 0) {
            const uniqueVideoFormats = videoMedias.map((m: any) => ({
              quality: m.quality || 'HD',
              url: m.url,
              size: m.size_display || undefined
            }));
            
            uniqueVideoFormats.sort((a: any, b: any) => (parseInt(b.quality) || 0) - (parseInt(a.quality) || 0));
            formats = uniqueVideoFormats;
            videoUrl = formats[0].url;
          }
        }
        
        if (videoUrl) {
          cover = data.data.thumbnail || data.data.cover || cover;
          title = data.data.title || title;
          authorName = data.data.author || authorName;
          musicUrl = data.data.music_url || data.data.audio || '';
        }
      }
    } catch (e) {
      console.error(`Instagram Source failed: ${apiUrl}`, e);
    }
  }

  if (!videoUrl) {
    return NextResponse.json({ error: 'Não foi possível encontrar o vídeo do Instagram.' }, { status: 404 });
  }

  return NextResponse.json({
    title,
    cover,
    video: videoUrl,
    formats,
    music: musicUrl,
    author: { name: authorName, avatar: '' }
  });
}
