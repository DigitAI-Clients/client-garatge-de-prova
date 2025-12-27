'use client';

import { useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface ProductGalleryProps {
  images: string[];
  title: string;
}

export function ProductGallery({ images, title }: ProductGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const hasImages = images && images.length > 0;

  return (
    <div className="space-y-4">
      {/* Imatge Principal */}
      <div className="relative aspect-square bg-card rounded-4xl overflow-hidden border border-border/50 shadow-sm">
        <AnimatePresence mode="wait">
            {hasImages ? (
            <motion.div
                key={selectedImage}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="relative w-full h-full"
            >
                <Image
                    src={images[selectedImage]}
                    alt={`${title} - Vista ${selectedImage + 1}`}
                    fill
                    className="object-cover"
                    priority
                />
            </motion.div>
            ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground bg-muted">
                <span>Sense imatge</span>
            </div>
            )}
        </AnimatePresence>
      </div>

      {/* Miniatures */}
      {hasImages && images.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedImage(idx)}
              className={cn(
                "relative w-20 h-20 rounded-xl overflow-hidden border-2 shrink-0 transition-all duration-300",
                selectedImage === idx 
                  ? "border-primary ring-2 ring-primary/20 scale-105" 
                  : "border-transparent opacity-70 hover:opacity-100"
              )}
            >
              <Image 
                src={img} 
                alt={`Miniatura ${idx}`} 
                fill 
                className="object-cover" 
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}