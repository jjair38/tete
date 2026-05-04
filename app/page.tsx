'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  Download, 
  Loader2, 
  Video, 
  Music, 
  CheckCircle2, 
  Zap, 
  Smartphone, 
  AlertCircle,
  ExternalLink,
  ClipboardPaste,
  X,
  History,
  TrendingUp,
  ShieldCheck,
  Activity,
  Clock
} from 'lucide-react';
import Image from 'next/image';
import AdBanner from '@/components/AdBanner';
import AccessCounter from '@/components/AccessCounter';
import OnlineCounter from '@/components/OnlineCounter';
import WhatsAppButton from '@/components/WhatsAppButton';

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

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
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

      setVideoData({ ...data, platform: isInstagram ? 'instagram' : 'tiktok' });
      setSelectedFormatIndex(0);
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
                <div className="relative aspect-[9/16] rounded-3xl overflow-hidden shadow-2xl shadow-[#fe2c55]/20 bg-white/5 border border-white/10">
                  <Image 
                    src={videoData.cover} 
                    alt={videoData.title} 
                    fill 
                    className="object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <div className="absolute bottom-6 left-6 right-6">
                    <p className="text-white text-xs mb-3 font-medium opacity-60 flex items-center gap-2">
                       <Smartphone className="w-3 h-3" />
                       Visualização do Vídeo
                    </p>
                    <p className="text-white text-lg font-bold line-clamp-2 leading-tight">
                      {videoData.title || 'Sem título'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="md:col-span-7 space-y-8">
                <div className="p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Zap className="w-24 h-24" />
                  </div>
                  
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white/20">
                      <Image 
                        src={videoData.author.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${videoData.author.name}`} 
                        alt={videoData.author.name} 
                        width={64} 
                        height={64}
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black">{videoData.author.name}</h2>
                      <p className="text-sm text-white/40 font-bold uppercase tracking-wider">Criador de Conteúdo</p>
                    </div>
                  </div>

                  <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                      <Download className="w-4 h-4" />
                    </div>
                    Opções de Download
                  </h3>
                  
                  <div className="space-y-6">
                    {videoData.formats && videoData.formats.length > 0 ? (
                      <div className="space-y-6">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between px-1">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-white/40">
                              Escolha a Qualidade
                            </label>
                            {videoData.formats[selectedFormatIndex].quality.toLowerCase().includes('hd') && (
                              <span className="flex items-center gap-1 text-[10px] font-black text-[#25f4ee] uppercase tracking-tighter">
                                <Zap className="w-3 h-3 fill-current" />
                                Alta Resolução
                              </span>
                            )}
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {videoData.formats.map((format, idx) => (
                              <button
                                key={idx}
                                onClick={() => setSelectedFormatIndex(idx)}
                                className={`relative group/btn py-3 px-2 rounded-xl text-xs font-bold transition-all border overflow-hidden ${
                                  selectedFormatIndex === idx 
                                    ? 'bg-[#25f4ee] text-black border-[#25f4ee] shadow-[0_0_20px_rgba(37,244,238,0.3)]' 
                                    : 'bg-white/5 text-white/60 border-white/10 hover:border-white/30 hover:bg-white/10'
                                }`}
                              >
                                <div className="relative z-10">
                                  {format.quality}
                                  {format.size && (
                                    <span className={`block text-[9px] font-medium mt-0.5 ${
                                      selectedFormatIndex === idx ? 'opacity-70' : 'opacity-40'
                                    }`}>
                                      {format.size}
                                    </span>
                                  )}
                                </div>
                                {selectedFormatIndex === idx && (
                                  <motion.div 
                                    layoutId="active-quality"
                                    className="absolute inset-0 bg-white/20 mix-blend-overlay"
                                  />
                                )}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <button
                            disabled={!!downloading}
                            onClick={() => {
                              const format = videoData.formats![selectedFormatIndex];
                              handleDownload(format.url, `${videoData.platform}_${format.quality}_${Date.now()}.mp4`, 'video');
                            }}
                            className="flex-1 py-5 px-6 rounded-2xl bg-white text-black font-black flex items-center justify-between hover:bg-[#fe2c55] hover:text-white transition-all active:scale-[0.98] disabled:opacity-50 group shadow-2xl shadow-black/40"
                          >
                            <div className="flex items-center gap-4">
                              <div className="bg-black/5 p-2 rounded-lg group-hover:bg-white/20 transition-colors">
                                {downloading === 'video' ? <Loader2 className="w-5 h-5 animate-spin" /> : <Video className="w-5 h-5" />}
                              </div>
                              <div className="text-left leading-tight">
                                <span className="block text-base">{downloading === 'video' ? 'Baixando...' : 'Baixar Vídeo'}</span>
                                {!downloading && <span className="text-[10px] font-bold uppercase opacity-40">Salvar no dispositivo</span>}
                              </div>
                            </div>
                            <div className="flex flex-col items-end">
                              <span className="text-xs font-black uppercase tracking-widest">{videoData.formats[selectedFormatIndex].quality}</span>
                            </div>
                          </button>
                          <button 
                            onClick={() => openDirectly(videoData.formats![selectedFormatIndex].url)}
                            title="Ver link direto"
                            className="px-5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/20 transition-all active:scale-95 flex items-center justify-center text-white/40 hover:text-white"
                          >
                            <ExternalLink className="w-6 h-6" />
                          </button>
                        </div>

                        {/* Progress Bar UI */}
                        <AnimatePresence>
                          {downloading === 'video' && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="mt-4 p-5 rounded-2xl bg-white/5 border border-white/10 space-y-4">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <Activity className="w-4 h-4 text-[#fe2c55]" />
                                    <span className="text-[11px] font-bold uppercase tracking-wider text-white/40">{downloadMetrics.speed}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-[#25f4ee]" />
                                    <span className="text-[11px] font-bold uppercase tracking-wider text-white/40">Restam {downloadMetrics.eta}</span>
                                  </div>
                                </div>

                                <div className="space-y-2">
                                  <div className="flex justify-between items-end">
                                    <span className="text-2xl font-black text-white">{downloadProgress}%</span>
                                    <span className="text-[10px] font-bold text-white/40 uppercase mb-1">
                                      {downloadMetrics.received} / {downloadMetrics.total}
                                    </span>
                                  </div>
                                  <div className="h-3 w-full bg-white/5 rounded-full p-0.5 border border-white/5">
                                    <motion.div 
                                      className="h-full bg-gradient-to-r from-[#fe2c55] to-[#25f4ee] rounded-full shadow-[0_0_10px_rgba(254,44,85,0.4)]"
                                      initial={{ width: 0 }}
                                      animate={{ width: `${downloadProgress}%` }}
                                      transition={{ type: 'spring', bounce: 0, duration: 0.5 }}
                                    />
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          disabled={!!downloading}
                          onClick={() => handleDownload(videoData.video, `${videoData.platform}_${Date.now()}.mp4`, 'sd')}
                          className="flex-1 py-4 px-6 rounded-2xl bg-white text-black font-bold flex items-center justify-between hover:bg-[#25f4ee] hover:text-black transition-all active:scale-[0.98] disabled:opacity-50 group shadow-xl"
                        >
                          <div className="flex items-center gap-3">
                            {downloading === 'sd' ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5 group-hover:translate-y-1 transition-transform" />}
                            <span>{downloading === 'sd' ? 'Baixando...' : 'Baixar Vídeo'}</span>
                          </div>
                          <span className="text-[10px] uppercase tracking-widest opacity-30">Padrão</span>
                        </button>
                        <button 
                          onClick={() => openDirectly(videoData.video)}
                          title="Abrir link original"
                          className="px-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all active:scale-95"
                        >
                          <ExternalLink className="w-5 h-5 text-white/30" />
                        </button>
                      </div>
                    )}
                    
                    {videoData.music && (
                      <div className="flex gap-2">
                        <button
                          disabled={!!downloading}
                          onClick={() => handleDownload(videoData.music!, `${videoData.platform}_audio_${Date.now()}.mp3`, 'audio')}
                          className="flex-1 py-4 px-6 rounded-2xl bg-white/5 border border-white/10 text-white font-bold flex items-center justify-between hover:bg-white/10 transition-all active:scale-[0.98] disabled:opacity-50 group"
                        >
                          <div className="flex items-center gap-3">
                            {downloading === 'audio' ? <Loader2 className="w-5 h-5 animate-spin" /> : <Music className="w-5 h-5 group-hover:scale-110 transition-transform" />}
                            <span>{downloading === 'audio' ? 'Baixando Áudio...' : 'Baixar Som/MP3'}</span>
                          </div>
                        </button>
                         <button 
                          onClick={() => openDirectly(videoData.music!)}
                          title="Abrir link original"
                          className="px-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all active:scale-95"
                        >
                          <ExternalLink className="w-5 h-5 text-white/30" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom Ad Space */}
                <AdBanner adSlot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_BOTTOM || ""} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {[
            { icon: <ShieldCheck className="w-6 h-6 text-[#25f4ee]" />, title: 'Sem Marca d\'Água', desc: 'Download limpo em alta definição.' },
            { icon: <Zap className="w-6 h-6 text-[#fe2c55]" />, title: 'Super Rápido', desc: 'Processamento instantâneo de links.' },
            { icon: <History className="w-6 h-6 text-white" />, title: 'Totalmente Grátis', desc: 'Use quantas vezes quiser sem custos.' },
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="p-6 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
            >
              <div className="mb-4">{feature.icon}</div>
              <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
              <p className="text-white/40 text-sm">{feature.desc}</p>
            </motion.div>
          ))}
        </div>

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
