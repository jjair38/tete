'use client';

import React from 'react';
import Image from 'next/image';
import { Smartphone } from 'lucide-react';

interface VideoInfoCardProps {
  cover: string;
  title: string;
}

export default function VideoInfoCard({ cover, title }: VideoInfoCardProps) {
  return (
    <div className="relative aspect-[9/16] rounded-3xl overflow-hidden shadow-2xl shadow-[#fe2c55]/20 bg-white/5 border border-white/10 group">
      <Image 
        src={cover} 
        alt={title} 
        fill 
        className="object-cover group-hover:scale-105 transition-transform duration-700"
        referrerPolicy="no-referrer"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-80 group-hover:opacity-100 transition-opacity" />
      <div className="absolute bottom-6 left-6 right-6 transform transition-transform duration-300 group-hover:-translate-y-1">
        <p className="text-white text-[10px] mb-3 font-black uppercase tracking-widest opacity-60 flex items-center gap-2">
           <span className="w-1.5 h-1.5 rounded-full bg-[#fe2c55] animate-pulse" />
           <Smartphone className="w-3 h-3" />
           Preview do Conteúdo
        </p>
        <p className="text-white text-lg font-black line-clamp-2 leading-tight tracking-tight">
          {title || 'Sem título'}
        </p>
      </div>
    </div>
  );
}
