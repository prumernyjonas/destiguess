'use client';

import { useEffect, useState, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

interface GuessMapClientProps {
  onGuess: (lat: number, lng: number) => void;
  disabled?: boolean;
  mapKey?: string;
}

export default function GuessMapClient({ onGuess, disabled, mapKey }: GuessMapClientProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const marker = useRef<maplibregl.Marker | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted || !mapContainer.current || map.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          'raster-tiles': {
            type: 'raster',
            tiles: [
              'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
            ],
            tileSize: 256,
            attribution: '© OpenStreetMap contributors',
          },
        },
        layers: [
          {
            id: 'simple-tiles',
            type: 'raster',
            source: 'raster-tiles',
            minzoom: 0,
            maxzoom: 22,
          },
        ],
      },
      center: [0, 20],
      zoom: 2,
    });

    map.current.on('load', () => {
      if (!map.current) return;

      map.current.on('click', (e) => {
        if (disabled) return;
        const { lng, lat } = e.lngLat;

        // Remove existing marker
        if (marker.current) {
          marker.current.remove();
        }

        // Add new marker
        const el = document.createElement('div');
        el.className = 'custom-marker';
        el.style.width = '20px';
        el.style.height = '20px';
        el.style.borderRadius = '50%';
        el.style.backgroundColor = '#10b981';
        el.style.border = '3px solid white';
        el.style.cursor = 'pointer';
        el.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)';

        marker.current = new maplibregl.Marker(el)
          .setLngLat([lng, lat])
          .addTo(map.current);

        onGuess(lat, lng);
      });
    });

    return () => {
      if (marker.current) {
        marker.current.remove();
        marker.current = null;
      }
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [isMounted, mapKey, disabled, onGuess]);

  if (!isMounted) {
    return (
      <div className="w-full h-full min-h-[400px] rounded-lg bg-gray-900 flex items-center justify-center">
        <p className="text-gray-400">Načítání mapy...</p>
      </div>
    );
  }

  return (
    <div
      key={mapKey}
      ref={mapContainer}
      className="w-full h-full min-h-[400px] rounded-lg overflow-hidden"
      style={{ cursor: disabled ? 'not-allowed' : 'crosshair' }}
    />
  );
}
