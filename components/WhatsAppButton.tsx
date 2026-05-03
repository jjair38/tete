'use client';

import React from 'react';
import { MessageCircle } from 'lucide-react';
import { motion } from 'motion/react';

export default function WhatsAppButton() {
  const phoneNumber = '5511916922835';
  const message = 'Olá! Gostaria de saber mais sobre como ter um site como este.';
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  return (
    <motion.a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 bg-[#25d366] text-white rounded-full shadow-2xl shadow-[#25d366]/40 hover:bg-[#20ba5a] transition-colors group"
      title="Fale conosco no WhatsApp"
    >
      <div className="absolute inset-0 rounded-full bg-[#25d366] animate-ping opacity-20 group-hover:hidden" />
      <MessageCircle className="w-7 h-7 fill-white" />
    </motion.a>
  );
}
