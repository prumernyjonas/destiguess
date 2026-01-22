'use client';

import { useEffect, useState, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

interface ResultMapClientProps {
  guessLat: number;
  guessLng: number;
  correctLat: number;
  correctLng: number;
  mapKey?: string;
}

export default function ResultMapClient({ guessLat, guessLng, correctLat, correctLng, mapKey }: ResultMapClientProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted || !mapContainer.current) return;

    // Clean up existing map if it exists
    if (map.current) {
      map.current.remove();
      map.current = null;
    }

    // Calculate center and bounds
    const centerLat = (guessLat + correctLat) / 2;
    const centerLng = (guessLng + correctLng) / 2;
    const distance = Math.sqrt(
      Math.pow(guessLat - correctLat, 2) + Math.pow(guessLng - correctLng, 2)
    );
    const zoom = distance > 0.1 ? 3 : distance > 0.01 ? 5 : distance > 0.001 ? 7 : 10;

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
      center: [centerLng, centerLat],
      zoom: Math.max(2, Math.min(zoom, 10)),
    });

    map.current.on('load', () => {
      if (!map.current) return;

      // Add line between points
      map.current.addSource('line', {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: [
              [guessLng, guessLat],
              [correctLng, correctLat],
            ],
          },
        },
      });

      map.current.addLayer({
        id: 'line',
        type: 'line',
        source: 'line',
        layout: {
          'line-join': 'round',
          'line-cap': 'round',
        },
        paint: {
          'line-color': '#3b82f6',
          'line-width': 3,
          'line-dasharray': [2, 2],
        },
      });

      // Add markers
      const guessEl = document.createElement('div');
      guessEl.className = 'custom-marker';
      guessEl.style.width = '20px';
      guessEl.style.height = '20px';
      guessEl.style.borderRadius = '50%';
      guessEl.style.backgroundColor = '#ef4444';
      guessEl.style.border = '3px solid white';
      guessEl.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)';

      const correctEl = document.createElement('div');
      correctEl.className = 'custom-marker';
      correctEl.style.width = '20px';
      correctEl.style.height = '20px';
      correctEl.style.borderRadius = '50%';
      correctEl.style.backgroundColor = '#10b981';
      correctEl.style.border = '3px solid white';
      correctEl.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)';

      new maplibregl.Marker(guessEl)
        .setLngLat([guessLng, guessLat])
        .addTo(map.current);

      new maplibregl.Marker(correctEl)
        .setLngLat([correctLng, correctLat])
        .addTo(map.current);
    });

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [isMounted, mapKey, guessLat, guessLng, correctLat, correctLng]);

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
    />
  );
}
