'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import pannellum CSS
import 'pannellum/build/pannellum.css';

interface PanoViewerProps {
  panoUrl: string;
}

declare global {
  interface Window {
    pannellum: {
      viewer: (container: HTMLElement, config: any) => any;
    };
  }
}

function PanoViewerClient({ panoUrl }: PanoViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<any>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!containerRef.current || typeof window === 'undefined' || !panoUrl) return;

    let mounted = true;

    // Validate URL - check if it's a placeholder
    if (!panoUrl || panoUrl.includes('example.com') || panoUrl.includes('placeholder')) {
      setError('Panoramatický obrázek není k dispozici. Prosím nahrajte vlastní obrázek.');
      setIsLoading(false);
      return;
    }

    // Validate URL format
    if (!panoUrl.startsWith('http') && !panoUrl.startsWith('/') && !panoUrl.startsWith('data:')) {
      setError('Neplatná URL panoramatického obrázku');
      setIsLoading(false);
      return;
    }

    // Dynamically import pannellum
    import('pannellum/build/pannellum.js')
      .then(() => {
        // Wait for pannellum to be available on window
        return new Promise<void>((resolve, reject) => {
          let attempts = 0;
          const maxAttempts = 50;

          const checkPannellum = () => {
            attempts++;
            if (window.pannellum && window.pannellum.viewer) {
              resolve();
            } else if (attempts >= maxAttempts) {
              reject(new Error('Pannellum failed to initialize'));
            } else {
              setTimeout(checkPannellum, 100);
            }
          };

          checkPannellum();
        });
      })
      .then(() => {
        if (!mounted || !containerRef.current) return;

        // Clean up previous viewer
        if (viewerRef.current) {
          try {
            viewerRef.current.destroy();
          } catch (e) {
            // Ignore destroy errors
          }
        }

        // Clear any existing timeout
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        // Create new viewer with comprehensive error handling
        if (window.pannellum && window.pannellum.viewer) {
          try {
            viewerRef.current = window.pannellum.viewer(containerRef.current, {
              type: 'equirectangular',
              panorama: panoUrl,
              autoLoad: true,
              autoRotate: 0,
              compass: true,
              showControls: true,
              keyboardZoom: true,
              mouseZoom: true,
              onError: (error: any) => {
                console.error('Pannellum error:', error);
                if (mounted) {
                  // Check for CORS or network errors
                  const errorStr = String(error || '');
                  if (errorStr.includes('CORS') || errorStr.includes('network') || errorStr.includes('Failed to load')) {
                    setError('Obrázek není dostupný (CORS nebo síťová chyba). Zkontrolujte URL.');
                  } else {
                    setError('Nepodařilo se načíst panoramatický obrázek');
                  }
                  setIsLoading(false);
                  if (timeoutRef.current) {
                    clearTimeout(timeoutRef.current);
                    timeoutRef.current = null;
                  }
                }
              },
              onLoad: () => {
                if (mounted) {
                  setIsLoading(false);
                  setError(null);
                  if (timeoutRef.current) {
                    clearTimeout(timeoutRef.current);
                    timeoutRef.current = null;
                  }
                }
              },
            });

            // Set a timeout to catch loading errors
            timeoutRef.current = setTimeout(() => {
              if (mounted) {
                setError('Načítání obrázku trvá příliš dlouho. Zkontrolujte URL.');
                setIsLoading(false);
                timeoutRef.current = null;
              }
            }, 10000); // 10 second timeout
          } catch (err: any) {
            console.error('Error creating pannellum viewer:', err);
            if (mounted) {
              if (err.message && err.message.includes('FileReader')) {
                setError('Chyba při načítání obrázku. Zkontrolujte, že URL odkazuje na validní panoramatický obrázek.');
              } else {
                setError('Nepodařilo se vytvořit panoramatický viewer');
              }
              setIsLoading(false);
            }
          }
        } else {
          throw new Error('Pannellum viewer function not available');
        }
      })
      .catch((err) => {
        console.error('Error loading pannellum:', err);
        if (mounted) {
          setError('Nepodařilo se načíst panoramatický viewer');
          setIsLoading(false);
        }
      });

    return () => {
      mounted = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      if (viewerRef.current) {
        try {
          viewerRef.current.destroy();
        } catch (e) {
          // Ignore destroy errors
        }
        viewerRef.current = null;
      }
    };
  }, [panoUrl]);

  if (error) {
    return (
      <div className="w-full h-full min-h-[400px] rounded-lg overflow-hidden bg-gray-900 flex items-center justify-center">
        <div className="text-center p-4 max-w-md">
          <p className="text-red-400 mb-2 text-lg">{error}</p>
          <p className="text-sm text-gray-400 break-all">{panoUrl}</p>
          <p className="text-xs text-gray-500 mt-4">
            Pro použití vlastních obrázků nahrajte 360° panoramatické obrázky na Cloudinary nebo jiný hosting a aktualizujte URL v databázi.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full min-h-[400px] rounded-lg overflow-hidden bg-gray-900 relative">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900 z-10">
          <p className="text-gray-400">Načítání panorámy...</p>
        </div>
      )}
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
}

// Export with SSR disabled
export default dynamic(() => Promise.resolve(PanoViewerClient), {
  ssr: false,
});
