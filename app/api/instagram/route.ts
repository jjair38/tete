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
    {
      url: `https://api.vkrdown.com/api/v1/get_data?url=${encodeURIComponent(url)}`,
      parser: (data: any) => {
        if (data.data && (data.data.url || data.data.medias)) {
          let videoUrl = '';
          let formats: any[] = [];
          if (data.data.url) {
            videoUrl = data.data.url;
            formats.push({ quality: 'Normal', url: videoUrl });
          }
          if (data.data.medias && data.data.medias.length > 0) {
            const videoMedias = data.data.medias.filter((m: any) => m.type === 'video');
            if (videoMedias.length > 0) {
              formats = videoMedias.map((m: any) => ({
                quality: m.quality || 'HD',
                url: m.url,
                size: m.size_display || undefined
              }));
              
              // Improved sorting: HD/4K > numbers (large to small) > others
              formats.sort((a, b) => {
                const qA = String(a.quality).toLowerCase();
                const qB = String(b.quality).toLowerCase();
                if (qA.includes('4k')) return -1;
                if (qB.includes('4k')) return 1;
                if (qA.includes('hd') && !qB.includes('hd')) return -1;
                if (qB.includes('hd') && !qA.includes('hd')) return 1;
                const numA = parseInt(qA.replace(/[^0-9]/g, '')) || 0;
                const numB = parseInt(qB.replace(/[^0-9]/g, '')) || 0;
                return numB - numA;
              });
              videoUrl = formats[0].url;
            }
          }
          if (videoUrl) {
            return {
              videoUrl,
              formats,
              cover: data.data.thumbnail || data.data.cover,
              title: data.data.title,
              authorName: data.data.author,
              musicUrl: data.data.music_url || data.data.audio
            };
          }
        }
        return null;
      }
    },
    {
      url: `https://api.socialdownloader.app/instagram/v1/info?url=${encodeURIComponent(url)}`,
      parser: (data: any) => {
        if (data.data && data.data.video) {
          return {
            videoUrl: data.data.video,
            formats: [{ quality: 'HD', url: data.data.video }],
            cover: data.data.thumbnail,
            title: data.data.title,
            authorName: data.data.username,
            musicUrl: data.data.music
          };
        }
        return null;
      }
    },
    {
      url: `https://api.tikvids.com/instagram/v1/info?url=${encodeURIComponent(url)}`,
      parser: (data: any) => {
        if (data.data && data.data.video) {
          return {
            videoUrl: data.data.video,
            formats: [{ quality: 'HD', url: data.data.video }],
            cover: data.data.thumbnail,
            title: data.data.title,
            authorName: data.data.username,
            musicUrl: data.data.music
          };
        }
        return null;
      }
    },
    {
      url: `https://api.snap-insta.com/api/get_data?url=${encodeURIComponent(url)}`,
      parser: (data: any) => {
        if (data.data && (data.data.url || data.data.medias)) {
          let videoUrl = '';
          let formats: any[] = [];
          if (data.data.url) {
            videoUrl = data.data.url;
            formats.push({ quality: 'Normal', url: videoUrl });
          }
          if (data.data.medias && data.data.medias.length > 0) {
            const videoMedias = data.data.medias.filter((m: any) => m.type === 'video');
            if (videoMedias.length > 0) {
              formats = videoMedias.map((m: any) => ({
                quality: m.quality || 'HD',
                url: m.url,
                size: m.size_display || undefined
              }));
              
              // Improved sorting
              formats.sort((a, b) => {
                const qA = String(a.quality).toLowerCase();
                const qB = String(b.quality).toLowerCase();
                if (qA.includes('4k')) return -1;
                if (qB.includes('4k')) return 1;
                if (qA.includes('hd') && !qB.includes('hd')) return -1;
                if (qB.includes('hd') && !qA.includes('hd')) return 1;
                const numA = parseInt(qA.replace(/[^0-9]/g, '')) || 0;
                const numB = parseInt(qB.replace(/[^0-9]/g, '')) || 0;
                return numB - numA;
              });
              videoUrl = formats[0].url;
            }
          }
          if (videoUrl) {
            return {
              videoUrl,
              formats,
              cover: data.data.thumbnail || data.data.cover,
              title: data.data.title,
              authorName: data.data.author,
              musicUrl: data.data.music_url || data.data.audio
            };
          }
        }
        return null;
      }
    },
    {
      url: `https://api.v1.savetube.me/instagram/v1/info?url=${encodeURIComponent(url)}`,
      parser: (data: any) => {
        if (data.data && data.data.video) {
          return {
            videoUrl: data.data.video,
            formats: [{ quality: 'HD', url: data.data.video }],
            cover: data.data.thumbnail,
            title: data.data.title,
            authorName: data.data.username,
            musicUrl: data.data.music
          };
        }
        return null;
      }
    }
  ];

  for (const source of sources) {
    if (videoUrl) break;

    try {
      const response = await fetch(source.url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36'
        },
        next: { revalidate: 0 }
      });
      
      if (!response.ok) continue;
      
      const data = await response.json();
      const parsed = source.parser(data);

      if (parsed) {
        videoUrl = parsed.videoUrl;
        formats = parsed.formats;
        cover = parsed.cover || cover;
        title = parsed.title || title;
        authorName = parsed.authorName || authorName;
        musicUrl = parsed.musicUrl || musicUrl;
      }
    } catch (e) {
      console.error(`Instagram Source failed: ${source.url}`, e);
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
