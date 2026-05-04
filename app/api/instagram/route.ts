import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  let url = searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 });
  }

  // Ensure URL has protocol
  if (url && !url.startsWith('http')) {
    url = 'https://' + url;
  }

  // Clean URL - remove unnecessary tracking params but keep the URL intact
  if (url && url.includes('?')) {
    try {
      const urlObj = new URL(url);
      if (urlObj.pathname.includes('/reel/') || urlObj.pathname.includes('/p/') || urlObj.pathname.includes('/reels/')) {
        url = urlObj.origin + urlObj.pathname;
        if (!url.endsWith('/')) url += '/';
      }
    } catch (e) {
      // Fallback to simple split if URL parsing fails
      url = url.split('?')[0];
    }
  }

  let videoUrl = '';
  let formats: any[] = [];
  let musicUrl = '';
  let cover = 'https://picsum.photos/400/600';
  let title = 'Vídeo do Instagram';
  let authorName = 'Instagram User';

  interface Source {
    name: string;
    url: string;
    method: string;
    headers?: Record<string, string>;
    body?: (url: string) => string;
    parser: (data: any) => any;
  }

  const sources: Source[] = [
    {
      name: 'Cobalt',
      url: 'https://api.cobalt.tools/api/json',
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36'
      },
      body: (url: string) => JSON.stringify({ url, videoQuality: '1080' }),
      parser: (data: any) => {
        if (['stream', 'redirect', 'tunnel'].includes(data.status) && data.url) {
          return {
            videoUrl: data.url,
            formats: [{ quality: 'HD', url: data.url }],
            cover: '',
            title: 'Instagram Video',
            authorName: 'Instagram User',
            musicUrl: ''
          };
        }
        if (data.status === 'picker' && data.picker && data.picker.length > 0) {
          const video = data.picker.find((item: any) => item.type === 'video');
          if (video) {
            return {
              videoUrl: video.url,
              formats: data.picker.filter((p: any) => p.type === 'video').map((v: any) => ({
                quality: v.quality || 'HD',
                url: v.url
              })),
              cover: '',
              title: 'Instagram Video',
              authorName: 'Instagram User',
              musicUrl: ''
            };
          }
        }
        return null;
      }
    },
    {
      name: 'VKRDown',
      url: `https://api.vkrdown.com/api/v1/get_data?url=${encodeURIComponent(url)}`,
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36'
      },
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
      name: 'SocialDownloader',
      url: `https://api.socialdownloader.app/instagram/v1/info?url=${encodeURIComponent(url)}`,
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36'
      },
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
      name: 'TikVids',
      url: `https://api.tikvids.com/instagram/v1/info?url=${encodeURIComponent(url)}`,
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36'
      },
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
      name: 'SnapInsta',
      url: `https://api.snap-insta.com/api/get_data?url=${encodeURIComponent(url)}`,
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36'
      },
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
      name: 'SaveTube',
      url: `https://api.v1.savetube.me/instagram/v1/info?url=${encodeURIComponent(url)}`,
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36'
      },
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
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout per source

      const response = await fetch(source.url, {
        method: source.method || 'GET',
        headers: source.headers || {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36'
        },
        body: source.method === 'POST' && source.body ? source.body(url) : undefined,
        next: { revalidate: 0 },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        console.warn(`Source ${source.name} failed with status: ${response.status}`);
        continue;
      }
      
      let data;
      try {
        const text = await response.text();
        try {
          data = JSON.parse(text);
        } catch (e) {
          console.error(`Failed to parse JSON from source ${source.name}:`, text.substring(0, 100));
          continue;
        }
      } catch (e) {
        console.error(`Failed to read response body from source ${source.name}`);
        continue;
      }

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
