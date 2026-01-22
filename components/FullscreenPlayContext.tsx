'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface FullscreenPlayContextValue {
  isFullscreenPlay: boolean;
  setFullscreenPlay: (v: boolean) => void;
}

const FullscreenPlayContext = createContext<FullscreenPlayContextValue | null>(null);

export function FullscreenPlayProvider({ children }: { children: ReactNode }) {
  const [isFullscreenPlay, setIsFullscreenPlay] = useState(false);
  const setFullscreenPlay = useCallback((v: boolean) => setIsFullscreenPlay(v), []);
  return (
    <FullscreenPlayContext.Provider value={{ isFullscreenPlay, setFullscreenPlay }}>
      {children}
    </FullscreenPlayContext.Provider>
  );
}

export function useFullscreenPlay() {
  const ctx = useContext(FullscreenPlayContext);
  if (!ctx) return { isFullscreenPlay: false, setFullscreenPlay: () => {} };
  return ctx;
}
