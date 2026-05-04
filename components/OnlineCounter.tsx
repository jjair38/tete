'use client';

import React, { useEffect, useState } from 'react';
import { auth, db } from '@/lib/firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  where, 
  Timestamp, 
  serverTimestamp 
} from 'firebase/firestore';
import { Users } from 'lucide-react';
import { motion } from 'motion/react';

export default function OnlineCounter() {
  const [onlineCount, setOnlineCount] = useState<number>(1);
  const [cities, setCities] = useState<string[]>([]);
  const [userCity, setUserCity] = useState<string | null>(null);

  useEffect(() => {
    // Get or fetch user city
    const fetchCity = async () => {
      try {
        const cachedCity = localStorage.getItem('user_city');
        if (cachedCity) {
          setUserCity(cachedCity);
          return;
        }

        const res = await fetch('https://ipapi.co/json/');
        const data = await res.json();
        if (data.city) {
          localStorage.setItem('user_city', data.city);
          setUserCity(data.city);
        }
      } catch (e) {
        console.warn('Failed to fetch city information');
      }
    };
    fetchCity();

    // Generate or get session ID
    let sessionId = sessionStorage.getItem('presence_session_id');
    if (!sessionId) {
      sessionId = Math.random().toString(36).substring(2) + Date.now().toString(36);
      sessionStorage.setItem('presence_session_id', sessionId);
    }

    const presenceRef = doc(db, 'presence', sessionId);

    const handleFirestoreError = (error: any, operation: string, path: string) => {
      const errInfo = {
        error: error?.message || String(error),
        operationType: operation,
        path: path,
        authInfo: {
          userId: auth.currentUser?.uid,
          email: auth.currentUser?.email,
          emailVerified: auth.currentUser?.emailVerified,
        }
      };
      console.error('Firestore Error:', JSON.stringify(errInfo));
    };

    // Initial heartbeat
    const updatePresence = async () => {
      try {
        const cityToSave = userCity || localStorage.getItem('user_city');
        await setDoc(presenceRef, {
          lastSeen: serverTimestamp(),
          city: cityToSave || 'Invisível'
        });
      } catch (err) {
        handleFirestoreError(err, 'write', `presence/${sessionId}`);
      }
    };

    if (userCity) {
      updatePresence();
    } else {
      // Still try to update even without city initially
      updatePresence();
    }

    // Heartbeat interval (every 30s)
    const intervalId = setInterval(updatePresence, 30000);

    // Clean up on window close if possible (best effort)
    const handleUnload = () => {
      deleteDoc(presenceRef).catch((err) => {
        handleFirestoreError(err, 'delete', `presence/${sessionId}`);
      });
    };
    window.addEventListener('beforeunload', handleUnload);

    // Listen to online users (last 2 minutes)
    let unsubscribeSnapshot: () => void;

    const startListening = () => {
      if (unsubscribeSnapshot) unsubscribeSnapshot();

      const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);
      const q = query(
        collection(db, 'presence'),
        where('lastSeen', '>=', Timestamp.fromDate(twoMinutesAgo))
      );

      unsubscribeSnapshot = onSnapshot(q, (snapshot) => {
        setOnlineCount(Math.max(1, snapshot.size));
        
        const activeCities = new Set<string>();
        snapshot.docs.forEach(doc => {
          const data = doc.data();
          if (data.city && data.city !== 'Invisível') {
            activeCities.add(data.city);
          }
        });
        setCities(Array.from(activeCities).slice(0, 3)); // Show up to 3 cities
      }, (error) => {
        handleFirestoreError(error, 'list', 'presence');
      });
    };

    startListening();
    const refreshListenerId = setInterval(startListening, 60000);

    return () => {
      clearInterval(intervalId);
      clearInterval(refreshListenerId);
      window.removeEventListener('beforeunload', handleUnload);
      deleteDoc(presenceRef).catch(() => {});
      if (unsubscribeSnapshot) unsubscribeSnapshot();
    };
  }, [userCity]);

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#fe2c55]/10 border border-[#fe2c55]/20 text-[#fe2c55] cursor-default"
    >
      <span className="relative flex h-2 w-2 shrink-0">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#fe2c55] opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-[#fe2c55]"></span>
      </span>
      <div className="flex flex-col">
        <span className="text-[10px] font-bold uppercase tracking-wider leading-tight">
          {onlineCount} Online Agora
        </span>
        {cities.length > 0 && (
          <span className="text-[9px] opacity-70 font-medium normal-case leading-tight truncate max-w-[150px]">
            {cities.join(', ')}
            {onlineCount > cities.length && '...'}
          </span>
        )}
      </div>
    </motion.div>
  );
}
