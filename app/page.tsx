'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  Loader2, 
  CheckCircle2, 
  Zap, 
  AlertCircle,
  ClipboardPaste,
  X,
} from 'lucide-react';
import AdBanner from '@/components/AdBanner';
import AccessCounter from '@/components/AccessCounter';
import OnlineCounter from '@/components/OnlineCounter';
import WhatsAppButton from '@/components/WhatsAppButton';
import VideoInfoCard from '@/components/VideoInfoCard';
import DownloadPanel from '@/components/DownloadPanel';
import FeaturesGrid from '@/components/FeaturesGrid';
import { formatBytes } from '@/lib/utils';
import RecentDownloads from '@/components/RecentDownloads';

interface HistoryItem {
  id: string;
  title: string;
  cover: string;
  timestamp: number;
  platform: string;
  url: string;
}

interface VideoFormat {
  quality: string;
  url: string;
  size?: string;
}

interface DownloadData {
  title: string;
  cover: string;
  video: string;
  formats?: VideoFormat[];
  music?: string;
  platform: 'tiktok' | 'instagram';
  author: {
    name: string;
    avatar: string;
  };
}

export default function Home() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [videoData, setVideoData] = useState<DownloadData | null>(null);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadMetrics, setDownloadMetrics] = useState({ speed: '', eta: '', received: '', total: '' });
  const [selectedFormatIndex, setSelectedFormatIndex] = useState<number>(0);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    const savedHistory = localStorage.getItem('social-save-history');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error('Failed to parse history');
      }
    }
  }, []);

  const saveToHistory = (data: any, originalUrl: string) => {
    const newItem: HistoryItem = {
      id: Math.random().toString(36).substr(2, 9),
      title: data.title,
      cover: data.cover,
      timestamp: Date.now(),
      platform: data.platform,
      url: originalUrl
    };

    setHistory(prev => {
      const updated = [newItem, ...prev.filter(h => h.url !== originalUrl)].slice(0, 5);
      localStorage.setItem('social-save-history', JSON.stringify(updated));
      return updated;
    });
  };

  const handleClearHistory = () => {
    setHistory([]);
    localStorage.removeItem('social-save-history');
  };

  const handleSelectHistory = (item: HistoryItem) => {
    setUrl(item.url);
    // Explicitly search if selected
    setTimeout(() => {
      const searchBtn = document.getElementById('search-button');
      searchBtn?.click();
    }, 100);
  };

  const handlePaste = async () => {
    if (typeof window === 'undefined') return;
    
    if (!navigator.clipboard || !navigator.clipboard.readText) {
      setError('O seu navegador bloqueou o acesso automático à área de transferência. Por favor, use Ctrl+V para colar o link manualmente.');
      setTimeout(() => setError(null), 5000);
      return;
    }

    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setUrl(text);
        setError(null);
      }
    } catch (err) {
      console.error('Failed to read clipboard:', err);
      setError('Não foi possível acessar a área de transferência. Por favor, cole manualmente.');
    }
  };

  const handleClear = () => {
    setUrl('');
    setError(null);
    setVideoData(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setLoading(true);
    setError(null);
    setVideoData(null);

    try {
      const isInstagram = url.includes('instagram.com');
      const isTikTok = url.includes('tiktok.com');

      if (!isInstagram && !isTikTok) {
        throw new Error('Por favor, insira um link válido do TikTok ou Instagram.');
      }

      const endpoint = isInstagram ? '/api/instagram' : '/api/tiktok';
      const response = await fetch(`${endpoint}?url=${encodeURIComponent(url)}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Não foi possível buscar o vídeo.');
      }

      const videoInfo = { ...data, platform: isInstagram ? 'instagram' : 'tiktok' as const };
      setVideoData(videoInfo);
      saveToHistory(videoInfo, url);
      setSelectedFormatIndex(0);
      
      // Scroll to results
      setTimeout(() => {
        window.scrollTo({ top: 400, behavior: 'smooth' });
      }, 500);
    } catch (err: any) {
      setError(err.message || 'Algo deu errado');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (url: string, filename: string, type: string) => {
    setDownloading(type);
    setDownloadProgress(0);
    setDownloadMetrics({ speed: 'Iniciando...', eta: '--:--', received: '0 MB', total: '...' });
    
    try {
      const response = await fetch(`/api/download?url=${encodeURIComponent(url)}`);
      if (!response.ok) throw new Error('Download failed');
      
      const contentLength = response.headers.get('content-length');
      const total = contentLength ? parseInt(contentLength, 10) : 0;
      
      const reader = response.body?.getReader();
      if (!reader) throw new Error('Download stream unavailable');

      const chunks = [];
      let receivedBytes = 0;
      const startTime = Date.now();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        chunks.push(value);
        receivedBytes += value.length;

        if (total > 0) {
          const progress = Math.round((receivedBytes / total) * 100);
          setDownloadProgress(progress);
          
          const elapsedTime = (Date.now() - startTime) / 1000;
          const speedBytesPerSec = receivedBytes / elapsedTime;
          const remainingBytes = total - receivedBytes;
          const etaSeconds = speedBytesPerSec > 0 ? remainingBytes / speedBytesPerSec : 0;
          
          setDownloadMetrics({
            speed: `${formatBytes(speedBytesPerSec)}/s`,
            eta: etaSeconds < 60 ? `${Math.round(etaSeconds)}s` : `${Math.round(etaSeconds / 60)}m`,
            received: formatBytes(receivedBytes),
            total: formatBytes(total)
          });
        } else {
          setDownloadMetrics(prev => ({ ...prev, received: formatBytes(receivedBytes) }));
        }
      }

      const blob = new Blob(chunks, { type: response.headers.get('content-type') || 'video/mp4' });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      console.error('Download failed:', err);
      window.open(url, '_blank');
    } finally {
      setDownloading(null);
      setDownloadProgress(0);
    }
  };

  const openDirectly = (url: string) => {
    window.open(url, '_blank');
  };

  return (
    <main className="min-h-screen relative overflow-x-hidden selection:bg-[#fe2c55]/30">
      {/* Background with multiple layers */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[#0f0f0f]" />
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[#fe2c55]/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-[#25f4ee]/10 blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 py-8 md:py-16">
        {/* Header */}
        <header className="text-center mb-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-4 mb-4"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10">
              <span className="w-2 h-2 rounded-full bg-[#fe2c55] animate-pulse" />
              <span className="text-xs font-medium tracking-wider uppercase text-white/70">Downloader Online</span>
            </div>
            <div className="flex flex-wrap justify-center gap-3">
              <AccessCounter />
              <OnlineCounter />
            </div>
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-5xl md:text-7xl font-black mb-4 tracking-tighter"
          >
            Social <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#fe2c55] via-[#ffffff] to-[#25f4ee]">Save</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-white/40 text-lg md:text-xl font-medium"
          >
            Baixe vídeos do <span className="text-white">TikTok</span> e <span className="text-white">Instagram</span> sem marca d'água.
          </motion.p>
        </header>

        {/* Search Input */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="mb-12"
        >
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 group">
            <div className="relative">
              <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
                <Search className="w-5 h-5 text-white/40 group-focus-within:text-[#fe2c55] transition-colors" />
              </div>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Cole o link do TikTok ou Instagram aqui..."
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-6 pl-14 pr-24 text-white text-lg placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-[#fe2c55]/50 focus:border-[#fe2c55]/50 transition-all shadow-2xl shadow-black"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 pr-2">
                {url && (
                  <button
                    type="button"
                    onClick={handleClear}
                    className="p-2 hover:bg-white/10 rounded-lg text-white/40 hover:text-white transition-colors"
                    title="Limpar"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={handlePaste}
                  className="p-2 hover:bg-white/10 rounded-lg text-white/40 hover:text-white transition-colors"
                  title="Colar link"
                >
                  <ClipboardPaste className="w-5 h-5" />
                </button>
              </div>
            </div>
            <button
              type="submit"
              id="search-button"
              disabled={loading || !url}
              className="w-full py-5 rounded-2xl bg-white text-black font-bold text-lg hover:bg-[#fe2c55] hover:text-white transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 shadow-xl"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                <>
                  <Zap className="w-5 h-5" />
                  <span>Buscar Vídeo</span>
                </>
              )}
            </button>
          </form>
          
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="mt-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 flex items-center gap-3"
              >
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p className="text-sm font-medium">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Results Area */}
        <AnimatePresence mode="wait">
          {videoData && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -40 }}
              className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start mb-16"
            >
              <div className="md:col-span-5">
                <VideoInfoCard 
                  cover={videoData.cover} 
                  title={videoData.title} 
                />
              </div>

              <div className="md:col-span-7 space-y-8">
                <DownloadPanel 
                  videoData={videoData}
                  selectedFormatIndex={selectedFormatIndex}
                  setSelectedFormatIndex={setSelectedFormatIndex}
                  downloading={downloading}
                  downloadProgress={downloadProgress}
                  downloadMetrics={downloadMetrics}
                  onDownload={handleDownload}
                  onOpenDirectly={openDirectly}
                />

                {/* Bottom Ad Space */}
                <AdBanner adSlot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_BOTTOM || ""} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <RecentDownloads 
          items={history} 
          onSelect={handleSelectHistory} 
          onClear={handleClearHistory} 
        />

        {/* Features Grid */}
        <FeaturesGrid />

        {/* Info Paragraphs */}
        <section className="space-y-12 text-white/40 max-w-2xl mx-auto text-sm leading-relaxed text-center px-4">
          <p>
            Nossa plataforma oferece a maneira mais simples de baixar seus vídeos favoritos do TikTok e Instagram. 
            Basta copiar o link da postagem, colar em nossa barra de busca e selecionar a qualidade desejada.
          </p>
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 py-8 border-t border-white/5">
            <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#25f4ee]" /> No Captcha</span>
            <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#25f4ee]" /> MP4 & MP3</span>
            <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#25f4ee]" /> HD Quality</span>
          </div>
        </section>

        <footer className="mt-16 pt-8 border-t border-white/5 text-center text-white/20 text-xs font-bold uppercase tracking-widest flex flex-col gap-2">
           <div>&copy; {new Date().getFullYear()} Social Save Downloader</div>
           <div className="normal-case opacity-60">Tenha seu próprio site / APP &bull; Entre em contato: 11-91692-2835</div>
        </footer>
      </div>
      <WhatsAppButton />
    </main>
  );
}
