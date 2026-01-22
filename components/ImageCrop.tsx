'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check } from 'lucide-react';

interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface ImageCropProps {
  imageSrc: string;
  onCrop: (croppedImageBlob: Blob) => void;
  onCancel: () => void;
  aspectRatio?: number; // width/height, např. 1 pro čtverec
}

export default function ImageCrop({ 
  imageSrc, 
  onCrop, 
  onCancel,
  aspectRatio = 1 
}: ImageCropProps) {
  const [cropArea, setCropArea] = useState<CropArea | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [displaySize, setDisplaySize] = useState<{ width: number; height: number } | null>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleImageLoad = useCallback(() => {
    if (imageRef.current) {
      const rect = imageRef.current.getBoundingClientRect();
      setDisplaySize({ width: rect.width, height: rect.height });
      
      // Nastavit výchozí crop area (čtverec uprostřed)
      const size = Math.min(rect.width, rect.height) * 0.8;
      const cropWidth = size;
      const cropHeight = size / aspectRatio;
      const x = (rect.width - cropWidth) / 2;
      const y = (rect.height - cropHeight) / 2;
      setCropArea({ x, y, width: cropWidth, height: cropHeight });
    }
  }, [aspectRatio]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!imageRef.current || !cropArea || !displaySize) return;
    
    const rect = imageRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Zkontrolovat, zda kliknutí je uvnitř crop area
    if (
      x >= cropArea.x &&
      x <= cropArea.x + cropArea.width &&
      y >= cropArea.y &&
      y <= cropArea.y + cropArea.height
    ) {
      setIsDragging(true);
      setDragStart({ x: x - cropArea.x, y: y - cropArea.y });
    }
  }, [cropArea, displaySize]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !imageRef.current || !cropArea || !dragStart || !displaySize) return;
    
    const rect = imageRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - dragStart.x;
    const y = e.clientY - rect.top - dragStart.y;
    
    const maxX = displaySize.width - cropArea.width;
    const maxY = displaySize.height - cropArea.height;
    
    setCropArea({
      ...cropArea,
      x: Math.max(0, Math.min(x, maxX)),
      y: Math.max(0, Math.min(y, maxY)),
    });
  }, [isDragging, cropArea, dragStart, displaySize]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setDragStart(null);
  }, []);

  const handleCrop = useCallback(async () => {
    if (!imageRef.current || !cropArea || !displaySize) return;
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Vypočítat skutečné rozměry obrázku
    const img = imageRef.current;
    const scaleX = img.naturalWidth / displaySize.width;
    const scaleY = img.naturalHeight / displaySize.height;
    
    // Nastavit velikost canvasu na oříznutou část
    canvas.width = cropArea.width * scaleX;
    canvas.height = cropArea.height * scaleY;
    
    // Vykreslit oříznutou část obrázku
    ctx.drawImage(
      img,
      cropArea.x * scaleX,
      cropArea.y * scaleY,
      cropArea.width * scaleX,
      cropArea.height * scaleY,
      0,
      0,
      cropArea.width * scaleX,
      cropArea.height * scaleY
    );
    
    // Konvertovat na blob
    canvas.toBlob((blob) => {
      if (blob) {
        onCrop(blob);
      }
    }, 'image/png', 0.95);
  }, [cropArea, displaySize, onCrop]);

  // Resetovat crop area při změně obrázku
  useEffect(() => {
    if (imageRef.current?.complete) {
      handleImageLoad();
    }
  }, [imageSrc, handleImageLoad]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
        onClick={(e) => {
          if (e.target === e.currentTarget) onCancel();
        }}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-gray-900 rounded-2xl p-6 max-w-2xl w-full mx-4 border border-white/10"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold">Oříznout obrázek</h3>
            <button
              onClick={onCancel}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div
            ref={containerRef}
            className="relative bg-gray-800 rounded-lg overflow-hidden mb-4"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            style={{ cursor: isDragging ? 'grabbing' : cropArea ? 'grab' : 'default' }}
          >
            <img
              ref={imageRef}
              src={imageSrc}
              alt="Crop preview"
              onLoad={handleImageLoad}
              className="max-w-full h-auto block"
              draggable={false}
            />
            
            {cropArea && displaySize && (
              <div
                className="absolute border-2 border-emerald-500 bg-emerald-500/10 pointer-events-none"
                style={{
                  left: `${(cropArea.x / displaySize.width) * 100}%`,
                  top: `${(cropArea.y / displaySize.height) * 100}%`,
                  width: `${(cropArea.width / displaySize.width) * 100}%`,
                  height: `${(cropArea.height / displaySize.height) * 100}%`,
                }}
              >
                <div className="absolute inset-0 grid grid-cols-3 grid-rows-3">
                  {[...Array(9)].map((_, i) => (
                    <div
                      key={i}
                      className="border border-emerald-400/30"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <div className="flex gap-3 justify-end">
            <button
              onClick={onCancel}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
            >
              Zrušit
            </button>
            <button
              onClick={handleCrop}
              disabled={!cropArea}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 disabled:bg-gray-600 disabled:cursor-not-allowed text-black font-semibold rounded-lg transition-colors flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              Použít
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
