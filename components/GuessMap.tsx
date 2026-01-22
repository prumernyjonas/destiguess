'use client';

import dynamic from 'next/dynamic';

// Dynamically import the entire map component with SSR disabled
const DynamicMap = dynamic(
  () => import('./GuessMapClient'),
  { ssr: false }
);

interface GuessMapProps {
  onGuess: (lat: number, lng: number) => void;
  disabled?: boolean;
  mapKey?: string;
}

export default function GuessMap({ onGuess, disabled, mapKey }: GuessMapProps) {
  return <DynamicMap mapKey={mapKey} onGuess={onGuess} disabled={disabled} />;
}
