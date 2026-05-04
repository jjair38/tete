'use client';

import React from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, Zap, History } from 'lucide-react';

const features = [
  { 
    icon: <ShieldCheck className="w-6 h-6 text-[#25f4ee]" />, 
    title: 'Sem Marca d\'Água', 
    desc: 'Download limpo em alta definição.' 
  },
  { 
    icon: <Zap className="w-6 h-6 text-[#fe2c55]" />, 
    title: 'Super Rápido', 
    desc: 'Processamento instantâneo de links.' 
  },
  { 
    icon: <History className="w-6 h-6 text-white" />, 
    title: 'Totalmente Grátis', 
    desc: 'Use quantas vezes quiser sem custos.' 
  },
];

export default function FeaturesGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
      {features.map((feature, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.1 }}
          className="p-6 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors group"
        >
          <div className="mb-4 transform group-hover:scale-110 transition-transform duration-300">
            {feature.icon}
          </div>
          <h3 className="text-lg font-bold mb-2 group-hover:text-white transition-colors">
            {feature.title}
          </h3>
          <p className="text-white/40 text-sm leading-relaxed">
            {feature.desc}
          </p>
        </motion.div>
      ))}
    </div>
  );
}
