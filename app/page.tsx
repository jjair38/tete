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
  ShieldCheck
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
  const [selectedFormatIndex, setSelectedFormatIndex] = useState<number>(0);

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
    try {
      const response = await fetch(`/api/download?url=${encodeURIComponent(url)}`);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Download failed:', err);
      // Fallback: open in new tab
      window.open(url, '_blank');
    } finally {
      setDownloading(null);
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
                  
                  <div className="space-y-4">
                    {videoData.formats && videoData.formats.length > 0 ? (
                      <div className="space-y-4">
                        <div className="flex flex-col gap-2">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 ml-1">
                            Selecione a Qualidade
                          </label>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {videoData.formats.map((format, idx) => (
                              <button
                                key={idx}
                                onClick={() => setSelectedFormatIndex(idx)}
                                className={`py-3 px-2 rounded-xl text-xs font-bold transition-all border ${
                                  selectedFormatIndex === idx 
                                    ? 'bg-[#25f4ee] text-black border-[#25f4ee]' 
                                    : 'bg-white/5 text-white/60 border-white/10 hover:border-white/30'
                                }`}
                              >
                                {format.quality}
                                {format.size && <span className="block opacity-60 text-[9px] font-medium">{format.size}</span>}
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
                            className="flex-1 py-4 px-6 rounded-2xl bg-white text-black font-bold flex items-center justify-between hover:bg-[#25f4ee] hover:text-black transition-all active:scale-[0.98] disabled:opacity-50 group shadow-xl shadow-black/20"
                          >
                            <div className="flex items-center gap-3">
                              {downloading === 'video' ? <Loader2 className="w-5 h-5 animate-spin" /> : <Video className="w-5 h-5 group-hover:animate-bounce" />}
                              <span>{downloading === 'video' ? 'Baixando...' : 'Baixar Vídeo'}</span>
                            </div>
                            <div className="flex flex-col items-end">
                              <span className="text-[10px] uppercase tracking-widest opacity-50">{videoData.formats[selectedFormatIndex].quality}</span>
                            </div>
                          </button>
                          <button 
                            onClick={() => openDirectly(videoData.formats![selectedFormatIndex].url)}
                            title="Abrir link original"
                            className="px-4 rounded-2xl bg-white/10 hover:bg-white/20 transition-all active:scale-95"
                          >
                            <ExternalLink className="w-5 h-5 text-white/60" />
                          </button>
                        </div>
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
