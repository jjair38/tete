'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'motion/react';
import { 
  Download, 
  Video, 
  Music, 
  ExternalLink, 
  Loader2, 
  Zap 
} from 'lucide-react';
import DownloadProgress from './DownloadProgress';

interface VideoFormat {
  quality: string;
  url: string;
  size?: string;
}

interface DownloadPanelProps {
  videoData: {
    author: {
      name: string;
      avatar: string;
    };
    formats?: VideoFormat[];
    video: string;
    music?: string;
    platform: string;
  };
  selectedFormatIndex: number;
  setSelectedFormatIndex: (idx: number) => void;
  downloading: string | null;
  downloadProgress: number;
  downloadMetrics: any;
  onDownload: (url: string, filename: string, type: string) => void;
  onOpenDirectly: (url: string) => void;
}

export default function DownloadPanel({
  videoData,
  selectedFormatIndex,
  setSelectedFormatIndex,
  downloading,
  downloadProgress,
  downloadMetrics,
  onDownload,
  onOpenDirectly
}: DownloadPanelProps) {
  return (
    <div className="p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-xl relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
        <Zap className="w-24 h-24" />
      </div>
      
      {/* Author Section */}
      <div className="flex items-center gap-4 mb-10">
        <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-white/10 shadow-lg shadow-black/20">
          <Image 
            src={videoData.author.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${videoData.author.name}`} 
            alt={videoData.author.name} 
            fill
            className="object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
        <div>
          <h2 className="text-2xl font-black tracking-tight">{videoData.author.name}</h2>
          <p className="text-[10px] text-white/40 font-black uppercase tracking-widest flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
            Criador de Conteúdo
          </p>
        </div>
      </div>

      <h3 className="text-sm font-black uppercase tracking-widest mb-6 flex items-center gap-3 text-white/60">
        <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center border border-white/5">
          <Download className="w-4 h-4" />
        </div>
        Downloads Disponíveis
      </h3>
      
      <div className="space-y-6">
        {videoData.formats && videoData.formats.length > 0 ? (
          <div className="space-y-6">
            {/* Format Selector */}
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/40">
                  Resolucões Detectadas
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
                    className={`relative group/btn py-3 px-2 rounded-2xl text-xs font-black transition-all border overflow-hidden ${
                      selectedFormatIndex === idx 
                        ? 'bg-[#25f4ee] text-black border-[#25f4ee] shadow-[0_0_20px_rgba(37,244,238,0.2)]' 
                        : 'bg-white/5 text-white/60 border-white/10 hover:border-white/30 hover:bg-white/10'
                    }`}
                  >
                    <div className="relative z-10">
                      {format.quality}
                      {format.size && (
                        <span className={`block text-[9px] font-bold mt-0.5 ${
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

            {/* Main Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                disabled={!!downloading}
                onClick={() => {
                  const format = videoData.formats![selectedFormatIndex];
                  onDownload(format.url, `${videoData.platform}_${format.quality}_${Date.now()}.mp4`, 'video');
                }}
                className="flex-[2] py-5 px-6 rounded-2xl bg-white text-black font-black flex items-center justify-between hover:bg-[#fe2c55] hover:text-white transition-all active:scale-[0.98] disabled:opacity-50 group shadow-2xl shadow-black/40"
              >
                <div className="flex items-center gap-4">
                  <div className="bg-black/5 p-2.5 rounded-xl group-hover:bg-white/20 transition-colors">
                    {downloading === 'video' ? <Loader2 className="w-5 h-5 animate-spin" /> : <Video className="w-5 h-5" />}
                  </div>
                  <div className="text-left leading-tight">
                    <span className="block text-base tracking-tight">{downloading === 'video' ? 'Baixando...' : 'Baixar Vídeo'}</span>
                    {!downloading && <span className="text-[10px] font-bold uppercase opacity-40">Salvar MP4</span>}
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-xs font-black uppercase tracking-widest">{videoData.formats[selectedFormatIndex].quality}</span>
                </div>
              </button>
              
              <button 
                onClick={() => onOpenDirectly(videoData.formats![selectedFormatIndex].url)}
                title="Ver link direto"
                className="flex-1 py-5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all active:scale-95 flex items-center justify-center text-white/40 hover:text-white gap-2"
              >
                <ExternalLink className="w-5 h-5" />
                <span className="sm:hidden font-bold">Link Direto</span>
              </button>
            </div>

            <DownloadProgress 
              progress={downloadProgress} 
              metrics={downloadMetrics} 
              isVisible={downloading === 'video'} 
            />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                disabled={!!downloading}
                onClick={() => onDownload(videoData.video, `${videoData.platform}_${Date.now()}.mp4`, 'sd')}
                className="flex-[2] py-5 px-6 rounded-2xl bg-white text-black font-black flex items-center justify-between hover:bg-[#25f4ee] hover:text-black transition-all active:scale-[0.98] disabled:opacity-50 group shadow-xl"
              >
                <div className="flex items-center gap-4">
                  <div className="bg-black/5 p-2.5 rounded-xl group-hover:bg-black/10 transition-colors">
                    {downloading === 'sd' ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5 group-hover:translate-y-1 transition-transform" />}
                  </div>
                  <div className="text-left leading-tight">
                    <span className="block text-base tracking-tight">{downloading === 'sd' ? 'Baixando...' : 'Baixar Vídeo'}</span>
                    {!downloading && <span className="text-[10px] font-bold uppercase opacity-40">Resolução Padrão</span>}
                  </div>
                </div>
                <span className="text-xs font-black uppercase tracking-widest opacity-30">SD</span>
              </button>
              <button 
                onClick={() => onOpenDirectly(videoData.video)}
                title="Abrir link original"
                className="flex-1 py-5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all active:scale-95 flex items-center justify-center text-white/30 hover:text-white gap-2"
              >
                <ExternalLink className="w-5 h-5" />
                <span className="sm:hidden font-bold">Original</span>
              </button>
            </div>
            
            <DownloadProgress 
              progress={downloadProgress} 
              metrics={downloadMetrics} 
              isVisible={downloading === 'sd'} 
            />
          </div>
        )}
        
        {/* Audio Section */}
        <div className="pt-4 border-t border-white/5">
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              disabled={!!downloading}
              onClick={() => {
                const audioUrl = videoData.music || (videoData.formats && videoData.formats.length > 0 ? videoData.formats[0].url : videoData.video);
                onDownload(audioUrl, `${videoData.platform}_audio_${Date.now()}.mp3`, 'audio');
              }}
              className="flex-[2] py-4 px-6 rounded-2xl bg-white/5 border border-white/10 text-white font-bold flex items-center justify-between hover:bg-white/10 transition-all active:scale-[0.98] disabled:opacity-50 group"
            >
              <div className="flex items-center gap-4">
                <div className="bg-white/5 p-2 rounded-xl group-hover:bg-white/10 transition-colors">
                  {downloading === 'audio' ? <Loader2 className="w-5 h-5 animate-spin" /> : <Music className="w-5 h-5 group-hover:rotate-12 transition-transform" />}
                </div>
                <div className="text-left leading-tight">
                  <span className="block">{downloading === 'audio' ? 'Baixando Áudio...' : 'Baixar Som / MP3'}</span>
                  {!downloading && <span className="text-[9px] font-black uppercase opacity-40 tracking-widest">Extrair Áudio do Vídeo</span>}
                </div>
              </div>
            </button>
            <button 
              onClick={() => onOpenDirectly(videoData.music || (videoData.formats && videoData.formats.length > 0 ? videoData.formats[0].url : videoData.video))}
              title="Abrir link original"
              className="flex-1 py-5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all active:scale-95 flex items-center justify-center text-white/30 hover:text-white gap-2"
            >
              <ExternalLink className="w-5 h-5" />
              <span className="sm:hidden font-bold">Áudio</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
