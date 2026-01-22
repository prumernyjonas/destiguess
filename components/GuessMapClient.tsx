'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { createClient } from '@/lib/supabase/client';

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
  const [mapLoaded, setMapLoaded] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const mapInitialized = useRef<boolean>(false);
  const currentMapKey = useRef<string | undefined>(undefined);
  const clickHandlerRef = useRef<((e: maplibregl.MapMouseEvent) => void) | null>(null);
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
            setAvatarUrl(data.avatarUrl || null);
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

  // Stable callback for onGuess to prevent re-renders
  const handleGuessCallback = useCallback((lat: number, lng: number) => {
    onGuess(lat, lng);
  }, [onGuess]);

  // Create click handler function
  const createClickHandler = useCallback(() => {
    return (e: maplibregl.MapMouseEvent) => {
      if (disabled || !map.current) return;
      
      const { lng, lat } = e.lngLat;
      
      if (typeof lng !== 'number' || typeof lat !== 'number' || isNaN(lng) || isNaN(lat)) {
        return;
      }

      // Remove existing marker
      if (marker.current) {
        marker.current.remove();
        marker.current = null;
      }

      // Create marker element - MapLibre GL handles positioning automatically
      const markerDiv = document.createElement('div');
      // Set visual styles - MapLibre GL will handle positioning via transform
      markerDiv.style.width = '40px';
      markerDiv.style.height = '40px';
      markerDiv.style.margin = '0';
      markerDiv.style.padding = '0';
      markerDiv.style.borderRadius = '50%';
      markerDiv.style.background = 'white';
      markerDiv.style.border = '3px solid #10b981';
      markerDiv.style.display = 'flex';
      markerDiv.style.alignItems = 'center';
      markerDiv.style.justifyContent = 'center';
      markerDiv.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)';
      markerDiv.style.cursor = 'pointer';
      markerDiv.style.boxSizing = 'border-box';
      markerDiv.style.overflow = 'hidden';
      // CRITICAL: MapLibre GL handles ALL positioning - don't set any positioning CSS
      
      // Použít profilovou ikonku, pokud existuje
      if (avatarUrl) {
        const img = document.createElement('img');
        img.src = avatarUrl;
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.objectFit = 'cover';
        img.style.borderRadius = '50%';
        markerDiv.appendChild(img);
      } else {
        // Fallback na SVG ikonku, pokud není avatar
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', '20');
        svg.setAttribute('height', '20');
        svg.setAttribute('viewBox', '0 0 24 24');
        svg.style.cssText = 'display: block; margin: 0; padding: 0;';
        
        // Head circle
        const headCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        headCircle.setAttribute('cx', '12');
        headCircle.setAttribute('cy', '8');
        headCircle.setAttribute('r', '4');
        headCircle.setAttribute('fill', '#10b981');
        
        // Body path
        const bodyPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        bodyPath.setAttribute('d', 'M6 21c0-3.314 2.686-6 6-6s6 2.686 6 6');
        bodyPath.setAttribute('fill', '#10b981');
        
        svg.appendChild(headCircle);
        svg.appendChild(bodyPath);
        markerDiv.appendChild(svg);
      }
      
      // NO HOVER EFFECT - it can interfere with MapLibre GL positioning

      // Create and add marker - SIMPLE AND DIRECT
      // MapLibre GL will handle positioning automatically
      if (!map.current.loaded()) {
        // Wait for map to load first
        map.current.once('load', () => {
          addMarkerDirectly();
        });
      } else {
        // Map is loaded, add marker immediately
        addMarkerDirectly();
      }

      function addMarkerDirectly() {
        if (!map.current) return;
        
        // Wait for map to be idle (not moving/zooming) before adding marker
        if (map.current.isMoving() || map.current.isZooming()) {
          map.current.once('idle', () => {
            addMarkerDirectly();
          });
          return;
        }
        
        try {
          // Create marker - SIMPLE, NO COMPLEX LOGIC
          marker.current = new maplibregl.Marker({ 
            element: markerDiv, 
            draggable: false,
            anchor: 'center'
          })
            .setLngLat([lng, lat])
            .addTo(map.current);
          
          // Call callback
          handleGuessCallback(lat, lng);
        } catch (error) {
          console.error('Error creating marker:', error);
        }
      }
    };
  }, [disabled, handleGuessCallback, avatarUrl]);

  useEffect(() => {
    if (!isMounted || !mapContainer.current) return;

    // Clean up existing map only if mapKey changed
    if (map.current && currentMapKey.current !== mapKey) {
      if (marker.current) {
        marker.current.remove();
        marker.current = null;
      }
      if (clickHandlerRef.current && map.current) {
        map.current.off('click', clickHandlerRef.current);
        clickHandlerRef.current = null;
      }
      map.current.remove();
      map.current = null;
      mapInitialized.current = false;
      setMapLoaded(false);
    }

    // Create new map if it doesn't exist
    if (!map.current) {
      // Create new map with MapTiler
      const mapStyle: string | maplibregl.StyleSpecification = maptilerApiKey
        ? `https://api.maptiler.com/maps/streets-v2/style.json?key=${maptilerApiKey}`
        : {
            version: 8 as const,
            sources: {
              'raster-tiles': {
                type: 'raster' as const,
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
                type: 'raster' as const,
                source: 'raster-tiles',
                minzoom: 0,
                maxzoom: 22,
              },
            ],
          };

      map.current = new maplibregl.Map({
        container: mapContainer.current,
        style: mapStyle,
        center: [0, 20],
        zoom: 2,
      });

      // Set cursor when map loads
      const setCursor = () => {
        try {
          const canvas = map.current?.getCanvas();
          if (canvas) {
            canvas.style.cursor = disabled ? 'not-allowed' : 'crosshair';
          }
        } catch (e) {
          // Ignore cursor setting errors
        }
      };

      // Set cursor and mark as initialized when map loads
      map.current.once('load', () => {
        if (!map.current) return;
        setCursor();
        mapInitialized.current = true;
        currentMapKey.current = mapKey;
        setMapLoaded(true);
        
        // Ensure canvas is clickable
        try {
          const canvas = map.current.getCanvas();
          if (canvas) {
            canvas.style.pointerEvents = 'auto';
          }
        } catch (e) {
          // Ignore errors
        }
      });
      
      // Also try to set cursor immediately
      setCursor();
    }

    return () => {
      if (marker.current) {
        marker.current.remove();
        marker.current = null;
      }
      // Only remove map if mapKey changed
      if (currentMapKey.current !== mapKey && map.current) {
        if (clickHandlerRef.current && map.current) {
          map.current.off('click', clickHandlerRef.current);
          clickHandlerRef.current = null;
        }
        map.current.remove();
        map.current = null;
        mapInitialized.current = false;
        setMapLoaded(false);
      }
    };
  }, [isMounted, mapKey, disabled, maptilerApiKey]);

  // Separate effect for click handler - always updates when disabled changes or map loads
  useEffect(() => {
    if (!map.current) return;

    // Setup function to add click handler
    const setupClickHandler = () => {
      if (!map.current) return;

      // Remove old handler if exists
      if (clickHandlerRef.current) {
        map.current.off('click', clickHandlerRef.current);
        clickHandlerRef.current = null;
      }

      // Add new click handler
      const handleClick = createClickHandler();
      clickHandlerRef.current = handleClick;
      map.current.on('click', handleClick);
      
      // Update cursor and ensure canvas is clickable
      try {
        const canvas = map.current.getCanvas();
        if (canvas) {
          canvas.style.cursor = disabled ? 'not-allowed' : 'crosshair';
          canvas.style.pointerEvents = 'auto';
          // Ensure the map container is also clickable
          if (mapContainer.current) {
            mapContainer.current.style.pointerEvents = 'auto';
          }
        }
      } catch (e) {
        // Ignore cursor setting errors
      }
    };

    // If map is already loaded, setup immediately
    if (mapLoaded && map.current.loaded()) {
      setupClickHandler();
    } else if (map.current) {
      // Otherwise wait for map to load
      const onLoad = () => {
        setupClickHandler();
        if (map.current) {
          map.current.off('load', onLoad);
        }
      };
      map.current.on('load', onLoad);
    }

    return () => {
      if (map.current && clickHandlerRef.current) {
        map.current.off('click', clickHandlerRef.current);
        clickHandlerRef.current = null;
      }
    };
  }, [mapLoaded, disabled, createClickHandler]);

  if (!isMounted) {
    return (
      <div className="w-full h-full bg-gray-900 flex items-center justify-center">
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
    <div
      ref={mapContainer}
      className="w-full h-full"
      style={{ 
        cursor: disabled ? 'not-allowed' : 'crosshair',
        position: 'relative',
        width: '100%',
        height: '100%',
        pointerEvents: 'auto' // Ensure map container is clickable
      }}
    />
  );
}
