'use client';

import React, { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, increment, setDoc, serverTimestamp } from 'firebase/firestore';
import { Users } from 'lucide-react';
import { motion } from 'motion/react';

export default function AccessCounter() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    const trackAccess = async () => {
      try {
        const statsRef = doc(db, 'stats', 'global');
        const statsSnap = await getDoc(statsRef);

        const hasAccessBeenTracked = sessionStorage.getItem('access_tracked');

        if (!hasAccessBeenTracked) {
          if (statsSnap.exists()) {
            await updateDoc(statsRef, {
              accessCount: increment(1),
              lastUpdated: serverTimestamp()
            });
            setCount(statsSnap.data().accessCount + 1);
          } else {
            await setDoc(statsRef, {
              accessCount: 1,
              lastUpdated: serverTimestamp()
            });
            setCount(1);
          }
          sessionStorage.setItem('access_tracked', 'true');
        } else {
          if (statsSnap.exists()) {
            setCount(statsSnap.data().accessCount);
          }
        }
      } catch (error) {
        console.error('Error tracking access:', error);
      }
    };

    trackAccess();
  }, []);

  if (count === null) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-white/50 hover:bg-white/10 transition-colors cursor-default"
    >
      <Users className="w-3.5 h-3.5 text-[#25f4ee]" />
      <span className="text-[10px] font-bold uppercase tracking-wider">
        {count.toLocaleString()} acessos
      </span>
    </motion.div>
  );
}
