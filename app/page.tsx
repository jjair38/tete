'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Download, Video, Music, User, Eye, Heart, MessageCircle, Share2, AlertCircle, Loader2 } from 'lucide-react';
import Image from 'next/image';

interface DownloadData {
  title: string;
  cover: string;
  video: string;
  videoHd?: string;
  music?: string;
  platform: 'tiktok' | 'instagram';
  author: {
    name: string;
    avatar: string;
  };
  stats?: {
    plays?: number;
    digg?: number;
    comments?: number;
    share?: number;
  };
}

export default function TikTokDownloader() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [videoData, setVideoData] = useState<DownloadData | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setLoading(true);
    setError(null);
    setVideoData(null);

    try {
      const isInstagram = url.includes('instagram.com');
      const apiEndpoint = isInstagram ? '/api/instagram' : '/api/tiktok';

      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Falha ao buscar vídeo');
      }

      setVideoData({ ...data, platform: isInstagram ? 'instagram' : 'tiktok' });
    } catch (err: any) {
      setError(err.message || 'Algo deu errado');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (mediaUrl: string, filename: string) => {
    if (!mediaUrl) return;
    setLoading(true);
    setError(null);
    
    try {
      // Pequeno truque: tentamos um fetch HEAD ou GET rápido para ver se o proxy retorna erro
      // antes de redirecionar a página para o download
      const proxyUrl = `/api/download?url=${encodeURIComponent(mediaUrl)}&filename=${encodeURIComponent(filename)}`;
      
      const response = await fetch(proxyUrl, { method: 'GET' });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao processar download');
      }

      // Se OK, transformamos a resposta em um blob para disparar o download real
      // Isso é mais seguro que o redirect direto pois garante que o conteúdo é válido
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
    } catch (err: any) {
      console.error('Erro ao baixar:', err);
      setError(err.message || 'Não foi possível baixar o arquivo. O link original pode ter expirado.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#010101] text-white font-sans selection:bg-[#fe2c55] selection:text-white">
      {/* Background Glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[#fe2c55]/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-[#25f4ee]/10 blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 py-12 md:py-24">
        {/* Header */}
        <header className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-4"
          >
            <span className="w-2 h-2 rounded-full bg-[#fe2c55] animate-pulse" />
            <span className="text-xs font-medium tracking-wider uppercase text-white/70">Downloader Online</span>
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-black tracking-tighter mb-4"
          >
            SOCIAL <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#fe2c55] via-[#25f4ee] to-[#fe2c55] bg-[length:200%_auto] animate-gradient">DOWNLOADER</span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-white/50 text-lg md:text-xl max-w-xl mx-auto"
          >
            Baixe vídeos do TikTok e Instagram sem marca d&apos;água em alta qualidade.
          </motion.p>
        </header>

        {/* Search Input */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="mb-12"
        >
          <form onSubmit={handleSubmit} className="relative group">
            <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
              <Search className="w-5 h-5 text-white/40 group-focus-within:text-[#fe2c55] transition-colors" />
            </div>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Cole o link do TikTok ou Instagram aqui..."
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-6 pl-14 pr-36 text-white text-lg placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-[#fe2c55]/50 focus:border-[#fe2c55]/50 transition-all shadow-2xl shadow-black"
            />
            <button
              type="submit"
              id="search-button"
              disabled={loading || !url}
              className="absolute right-3 top-3 bottom-3 px-8 rounded-xl bg-white text-black font-bold hover:bg-[#fe2c55] hover:text-white transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none flex items-center gap-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Buscar'}
            </button>
          </form>
          
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-4 rounded-xl bg-[#fe2c55]/10 border border-[#fe2c55]/20 flex items-center gap-3 text-[#fe2c55]"
            >
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm font-medium">{error}</p>
            </motion.div>
          )}
        </motion.div>

        {/* Results Section */}
        <AnimatePresence mode="wait">
          {videoData && (
            <motion.div
              key="results"
              id="results-section"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="grid grid-cols-1 md:grid-cols-12 gap-8"
            >
              {/* Preview Card */}
              <div className="md:col-span-12 lg:col-span-5 relative group rounded-3xl overflow-hidden aspect-[9/16] bg-white/5 border border-white/10 shadow-2xl shadow-black max-h-[600px] mx-auto md:w-[350px] lg:w-full">
                <Image
                  src={videoData.cover}
                  alt="Video Cover"
                  fill
                  className="object-cover transition-transform group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 p-6 flex flex-col justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full border-2 border-white overflow-hidden relative">
                      <Image
                        src={videoData.author.avatar}
                        alt={videoData.author.name}
                        fill
                        className="object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm leading-tight">@{videoData.author.name}</h4>
                      <p className="text-[10px] text-white/70 uppercase tracking-widest">Criador</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <p className="text-sm font-medium line-clamp-2 leading-relaxed">
                      {videoData.title}
                    </p>
                    <div className="flex items-center justify-between text-xs font-bold text-white/80 border-t border-white/10 pt-4">
                      {videoData.stats?.plays !== undefined && (
                        <div className="flex flex-col items-center gap-1">
                          <Eye className="w-4 h-4 text-[#25f4ee]" />
                          <span>{videoData.stats.plays.toLocaleString()}</span>
                        </div>
                      )}
                      {videoData.stats?.digg !== undefined && (
                        <div className="flex flex-col items-center gap-1">
                          <Heart className="w-4 h-4 text-[#fe2c55]" />
                          <span>{videoData.stats.digg.toLocaleString()}</span>
                        </div>
                      )}
                      {videoData.stats?.comments !== undefined && (
                        <div className="flex flex-col items-center gap-1">
                          <MessageCircle className="w-4 h-4 text-[#25f4ee]" />
                          <span>{videoData.stats.comments.toLocaleString()}</span>
                        </div>
                      )}
                      {videoData.stats?.share !== undefined && (
                        <div className="flex flex-col items-center gap-1">
                          <Share2 className="w-4 h-4 text-[#fe2c55]" />
                          <span>{videoData.stats.share.toLocaleString()}</span>
                        </div>
                      )}
                      {/* Mostrar uma mensagem simples se não houver stats (comum no Instagram) */}
                      {!videoData.stats && (
                        <div className="flex items-center justify-center w-full py-2 opacity-50">
                          <span className="text-[10px] uppercase tracking-widest text-[#25f4ee]">Social Media Content</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions Section */}
              <div className="md:col-span-12 lg:col-span-7 flex flex-col gap-6">
                <div className="p-6 rounded-3xl bg-white/5 border border-white/10">
                  <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                      <Download className="w-4 h-4" />
                    </div>
                    Opções de Download
                  </h3>
                  
                  <div className="space-y-4">
                    {videoData.videoHd && (
                      <button
                        onClick={() => handleDownload(videoData.videoHd!, `${videoData.platform}_hd_${Date.now()}.mp4`)}
                        className="w-full py-4 px-6 rounded-2xl bg-white text-black font-bold flex items-center justify-between hover:bg-[#25f4ee] hover:text-black transition-all active:scale-[0.98] group"
                      >
                        <div className="flex items-center gap-3">
                          <Video className="w-5 h-5 group-hover:animate-bounce" />
                          <span>Baixar Vídeo HD</span>
                        </div>
                        <span className="text-[10px] uppercase tracking-widest opacity-50">Melhor Qualidade</span>
                      </button>
                    )}
                    
                    {videoData.video && (
                      <button
                        onClick={() => handleDownload(videoData.video, `${videoData.platform}_${Date.now()}.mp4`)}
                        className="w-full py-4 px-6 rounded-2xl bg-white/5 border border-white/10 text-white font-bold flex items-center justify-between hover:bg-white/10 transition-all active:scale-[0.98] group"
                      >
                        <div className="flex items-center gap-3">
                          <Download className="w-5 h-5 group-hover:translate-y-1 transition-transform" />
                          <span>{videoData.videoHd ? 'Download Padrão' : 'Baixar Vídeo'}</span>
                        </div>
                        <span className="text-[10px] uppercase tracking-widest opacity-30">Rápido</span>
                      </button>
                    )}

                    {videoData.music && (
                      <button
                        onClick={() => handleDownload(videoData.music!, `music_${Date.now()}.mp3`)}
                        className="w-full py-4 px-6 rounded-2xl bg-white/5 border border-white/10 text-white font-bold flex items-center justify-between hover:bg-white/10 transition-all active:scale-[0.98] group"
                      >
                        <div className="flex items-center gap-3">
                          <Music className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                          <span>Baixar Música MP3</span>
                        </div>
                        <span className="text-[10px] uppercase tracking-widest opacity-30">Somente Áudio</span>
                      </button>
                    )}
                  </div>
                </div>

                <div className="p-6 rounded-3xl bg-[#fe2c55]/5 border border-[#fe2c55]/20">
                  <div className="flex items-center gap-3 mb-2">
                    <User className="w-4 h-4 text-[#fe2c55]" />
                    <h5 className="text-xs font-bold uppercase tracking-widest text-[#fe2c55]">Aviso do Artista</h5>
                  </div>
                  <p className="text-sm text-white/60 leading-relaxed">
                    Sempre dê os créditos ao criador original ao compartilhar o conteúdo. Esta ferramenta é apenas para uso pessoal e backup.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {!videoData && !loading && (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20 border-2 border-dashed border-white/5 rounded-3xl"
            >
              <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Video className="w-8 h-8 text-white/20" />
              </div>
              <p className="text-white/30 font-medium italic">Seus resultados aparecerão aqui</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <footer className="mt-24 text-center border-t border-white/5 pt-12">
          <p className="text-white/20 text-xs font-medium tracking-widest uppercase mb-4">Como baixar?</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
            {[
              { t: 'Copiar Link', d: 'Encontre o vídeo no TikTok ou Instagram e copie o URL' },
              { t: 'Colar Aqui', d: 'Cole o link na barra de busca acima' },
              { t: 'Obter Conteúdo', d: 'Escolha a qualidade e salve no seu dispositivo!' },
            ].map((step, i) => (
              <div key={i} className="p-4 rounded-xl hover:bg-white/5 transition-colors">
                <span className="text-[10px] font-bold text-[#fe2c55] mb-2 block tracking-widest uppercase">Passo {i+1}</span>
                <h4 className="font-bold text-white/80 mb-1">{step.t}</h4>
                <p className="text-xs text-white/40">{step.d}</p>
              </div>
            ))}
          </div>
        </footer>
      </div>

      <style jsx global>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient {
          animation: gradient 3s linear infinite;
        }
      `}</style>
    </main>
  );
}
