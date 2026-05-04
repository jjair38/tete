'use client';

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Activity, Clock } from 'lucide-react';

interface DownloadProgressProps {
  progress: number;
  metrics: {
    speed: string;
    eta: string;
    received: string;
    total: string;
  };
  isVisible: boolean;
}

export default function DownloadProgress({ progress, metrics, isVisible }: DownloadProgressProps) {
  return (
    <AnimatePresence>
      {isVisible && (
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
                <span className="text-[11px] font-bold uppercase tracking-wider text-white/40">{metrics.speed}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#25f4ee]" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-white/40">Restam {metrics.eta}</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-end">
                <span className="text-2xl font-black text-white">{progress}%</span>
                <span className="text-[10px] font-bold text-white/40 uppercase mb-1">
                  {metrics.received} / {metrics.total}
                </span>
              </div>
              <div className="h-3 w-full bg-white/5 rounded-full p-0.5 border border-white/5">
                <motion.div 
                  className="h-full bg-gradient-to-r from-[#fe2c55] to-[#25f4ee] rounded-full shadow-[0_0_10px_rgba(254,44,85,0.4)]"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ type: 'spring', bounce: 0, duration: 0.5 }}
                />
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
