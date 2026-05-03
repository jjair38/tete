'use client';

import { useEffect, useRef } from 'react';

interface AdBannerProps {
  adSlot: string;
  className?: string;
}

export default function AdBanner({ adSlot, className = "" }: AdBannerProps) {
  useEffect(() => {
    try {
      // @ts-ignore
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      console.error('AdsError', e);
    }
  }, []);

  return (
    <div className={`overflow-hidden flex items-center justify-center p-4 bg-white/5 rounded-2xl border border-white/10 ${className}`}>
      <ins className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_CLIENT}
        data-ad-slot={adSlot}
        data-ad-format="auto"
        data-full-width-responsive="true"></ins>
        <span className="text-[10px] uppercase tracking-widest text-white/20 absolute">Espaço Publicitário</span>
    </div>
  );
}
