'use client';

import { useEffect, useState, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';

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
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const supabase = createClient();

  const maptilerApiKey = process.env.NEXT_PUBLIC_MAPTILER_API_KEY || '';

  // Načíst profil uživatele pro avatar
  useEffect(() => {
    const loadProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        try {
          const response = await fetch('/api/user/profile');
          if (response.ok) {
            const data = await response.json();
            setAvatarUrl(data.avatarUrl || data.avatar_url || null);
          }
        } catch (error) {
          console.error('Error loading profile:', error);
        }
      }
    };
    loadProfile();
  }, [supabase]);

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

    // Střed pro počáteční zobrazení (před load)
    const centerLat = (guessLat + correctLat) / 2;
    const centerLng = (guessLng + correctLng) / 2;

    // Create map with MapTiler
    const mapStyle = maptilerApiKey
      ? `https://api.maptiler.com/maps/streets-v2/style.json?key=${maptilerApiKey}`
      : {
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
        };

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: mapStyle,
      center: [centerLng, centerLat],
      zoom: 4,
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

      // Add guess marker (user's guess) - použít profilovou ikonku
      const guessMarkerContainer = document.createElement('div');
      guessMarkerContainer.style.display = 'flex';
      guessMarkerContainer.style.flexDirection = 'column';
      guessMarkerContainer.style.alignItems = 'center';
      guessMarkerContainer.style.gap = '4px';
      
      const guessLabel = document.createElement('div');
      guessLabel.textContent = 'Váš tip';
      guessLabel.style.backgroundColor = '#ef4444';
      guessLabel.style.color = 'white';
      guessLabel.style.padding = '2px 8px';
      guessLabel.style.borderRadius = '4px';
      guessLabel.style.fontSize = '11px';
      guessLabel.style.fontWeight = 'bold';
      guessLabel.style.whiteSpace = 'nowrap';
      guessLabel.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';
      
      const guessEl = document.createElement('div');
      guessEl.style.width = '40px';
      guessEl.style.height = '40px';
      guessEl.style.borderRadius = '50%';
      guessEl.style.border = '3px solid #ef4444';
      guessEl.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.6)';
      guessEl.style.cursor = 'pointer';
      guessEl.style.overflow = 'hidden';
      guessEl.style.backgroundColor = 'white';
      guessEl.style.display = 'flex';
      guessEl.style.alignItems = 'center';
      guessEl.style.justifyContent = 'center';
      
      // Použít profilovou ikonku, pokud existuje
      if (avatarUrl) {
        const img = document.createElement('img');
        img.src = avatarUrl;
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.objectFit = 'cover';
        img.style.borderRadius = '50%';
        guessEl.appendChild(img);
      } else {
        // Fallback na červený kruh, pokud není avatar
        guessEl.style.backgroundColor = '#ef4444';
      }
      
      guessMarkerContainer.appendChild(guessLabel);
      guessMarkerContainer.appendChild(guessEl);

      // Add correct marker (actual location) - GREEN
      const correctMarkerContainer = document.createElement('div');
      correctMarkerContainer.style.display = 'flex';
      correctMarkerContainer.style.flexDirection = 'column';
      correctMarkerContainer.style.alignItems = 'center';
      correctMarkerContainer.style.gap = '4px';
      
      const correctLabel = document.createElement('div');
      correctLabel.textContent = 'Správně';
      correctLabel.style.backgroundColor = '#10b981';
      correctLabel.style.color = 'white';
      correctLabel.style.padding = '2px 8px';
      correctLabel.style.borderRadius = '4px';
      correctLabel.style.fontSize = '11px';
      correctLabel.style.fontWeight = 'bold';
      correctLabel.style.whiteSpace = 'nowrap';
      correctLabel.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';
      
      const correctEl = document.createElement('div');
      correctEl.style.width = '28px';
      correctEl.style.height = '28px';
      correctEl.style.borderRadius = '50%';
      correctEl.style.backgroundColor = '#10b981';
      correctEl.style.border = '4px solid white';
      correctEl.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.6)';
      correctEl.style.cursor = 'pointer';
      
      correctMarkerContainer.appendChild(correctLabel);
      correctMarkerContainer.appendChild(correctEl);

      new maplibregl.Marker({ element: guessMarkerContainer, anchor: 'center' })
        .setLngLat([guessLng, guessLat])
        .addTo(map.current);

      new maplibregl.Marker({ element: correctMarkerContainer, anchor: 'center' })
        .setLngLat([correctLng, correctLat])
        .addTo(map.current);

      // Automatické přiblížení na oba body (tip + správné místo) s odsazením
      const west = Math.min(guessLng, correctLng);
      const south = Math.min(guessLat, correctLat);
      const east = Math.max(guessLng, correctLng);
      const north = Math.max(guessLat, correctLat);
      const minSpan = 0.0008; // minimální rozměr (~90 m) když jsou body stejné/velmi blízko
      const padWest = east - west < minSpan ? (minSpan - (east - west)) / 2 : 0;
      const padSouth = north - south < minSpan ? (minSpan - (north - south)) / 2 : 0;
      const bounds = new maplibregl.LngLatBounds(
        [west - padWest, south - padSouth],
        [east + padWest, north + padSouth]
      );
      map.current.fitBounds(bounds, {
        padding: { top: 100, bottom: 100, left: 100, right: 100 },
        maxZoom: 16,
        minZoom: 2,
        duration: 0,
      });
    });

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [isMounted, mapKey, guessLat, guessLng, correctLat, correctLng, maptilerApiKey, avatarUrl]);

  if (!isMounted) {
    return (
      <div className="w-full h-full min-h-[400px] rounded-lg bg-gray-900 flex items-center justify-center">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div 
            className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto mb-2"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <p className="text-gray-400 text-sm sm:text-base">Načítání mapy...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div
      key={mapKey}
      ref={mapContainer}
      className="w-full h-full min-h-[400px] rounded-lg overflow-hidden border border-white/10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    />
  );
}
