'use client';

import dynamic from 'next/dynamic';

// Dynamically import the entire map component with SSR disabled
const DynamicMap = dynamic(
  () => import('./ResultMapClient'),
  { ssr: false }
);

interface ResultMapProps {
  guessLat: number;
  guessLng: number;
  correctLat: number;
  correctLng: number;
  mapKey?: string;
}

export default function ResultMap({ mapKey, ...props }: ResultMapProps) {
  return <DynamicMap mapKey={mapKey} {...props} />;
}
