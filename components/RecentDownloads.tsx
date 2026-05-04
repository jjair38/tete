'use client';

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { History, ExternalLink, Video } from 'lucide-react';
import Image from 'next/image';

export interface HistoryItem {
  id: string;
  title: string;
  cover: string;
  timestamp: number;
  platform: string;
  url: string;
}

interface RecentDownloadsProps {
  items: HistoryItem[];
  onSelect: (item: HistoryItem) => void;
  onClear: () => void;
}

export default function RecentDownloads({ items, onSelect, onClear }: RecentDownloadsProps) {
  if (items.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-12 bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-md"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-black uppercase tracking-widest text-white/60 flex items-center gap-2">
          <History className="w-4 h-4" />
          Downloads Recentes
        </h3>
        <button 
          onClick={onClear}
          className="text-[10px] font-black uppercase tracking-widest text-[#fe2c55]/60 hover:text-[#fe2c55] transition-colors"
        >
          Limpar Tudo
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
        <AnimatePresence mode="popLayout">
          {items.map((item) => (
            <motion.button
              key={item.id}
              layout
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={() => onSelect(item)}
              className="group relative aspect-[9/16] rounded-xl overflow-hidden border border-white/10 hover:border-[#fe2c55]/50 transition-colors bg-black"
            >
              <Image 
                src={item.cover} 
                alt={item.title} 
                fill 
                className="object-cover opacity-60 group-hover:opacity-80 transition-opacity"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              <div className="absolute bottom-2 left-2 right-2 text-left">
                <p className="text-[8px] font-black uppercase text-[#25f4ee] mb-0.5 tracking-tighter">
                  {item.platform}
                </p>
                <p className="text-[10px] text-white/80 font-bold line-clamp-1 leading-tight">
                  {item.title || 'Sem título'}
                </p>
              </div>
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                <Video className="w-8 h-8 text-white scale-75 group-hover:scale-100 transition-transform" />
              </div>
            </motion.button>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
