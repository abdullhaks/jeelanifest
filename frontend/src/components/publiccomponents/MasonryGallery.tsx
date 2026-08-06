import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface GalleryItem {
  _id: string;
  image: string;
  title?: string;
  description?: string;
  category?: string;
}

interface MasonryGalleryProps {
  items: GalleryItem[];
  loading?: boolean;
}

export const MasonryGallery: React.FC<MasonryGalleryProps> = ({ items }) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  // Keyboard navigation for Lightbox Viewer Container
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (selectedIndex === null) return;
    if (e.key === 'Escape') setSelectedIndex(null);
    if (e.key === 'ArrowRight') setSelectedIndex(prev => prev !== null ? (prev + 1) % items.length : null);
    if (e.key === 'ArrowLeft') setSelectedIndex(prev => prev !== null ? (prev - 1 + items.length) % items.length : null);
  }, [selectedIndex, items.length]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const selectedImage = selectedIndex !== null ? items[selectedIndex] : null;

  return (
    <div className="w-full relative">
      {/* Staggered Responsive Masonry Layout Columns */}
      <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
        {items.map((item, idx) => (
          <motion.div
            key={item._id || idx}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: (idx % 4) * 0.06 }}
            whileHover={{ y: -6, scale: 1.02 }}
            onClick={() => setSelectedIndex(idx)}
            className="relative group rounded-3xl overflow-hidden cursor-pointer break-inside-avoid shadow-sm hover:shadow-xl border border-slate-200 bg-white transition-all duration-300"
          >
            <img
              src={item.image}
              alt={item.description || item.title || 'Fest Gallery'}
              className="w-full h-auto object-cover transform transition-transform duration-700 group-hover:scale-108"
              loading="lazy"
            />

            {/* Glass Hover Scrim Overlay */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-t from-slate-950/85 via-slate-950/30 to-transparent flex flex-col justify-end p-5 text-white">
              {item.category && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-sky-500 text-white w-max mb-2 shadow">
                  {item.category}
                </span>
              )}
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-extrabold text-base line-clamp-1" style={{ fontFamily: 'var(--font-display)' }}>
                    {item.title || 'Jeelani Fest Highlight'}
                  </h4>
                  {item.description && (
                    <p className="text-xs text-slate-200 mt-0.5 line-clamp-2">
                      {item.description}
                    </p>
                  )}
                </div>
                <div className="w-9 h-9 rounded-full bg-white/20 backdrop-blur border border-white/40 flex items-center justify-center text-white shrink-0 ml-3 shadow-md">
                  ⤢
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Enhanced Lightbox Image Viewer Container */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-8"
            style={{ background: 'rgba(15, 23, 42, 0.92)', backdropFilter: 'blur(20px)' }}
            onClick={() => setSelectedIndex(null)}
          >
            {/* Close Button */}
            <button
              className="absolute top-6 right-6 text-xl text-slate-900 bg-white/90 hover:bg-white w-11 h-11 rounded-full flex items-center justify-center z-20 font-bold shadow-lg transition-transform hover:scale-105"
              onClick={(e) => { e.stopPropagation(); setSelectedIndex(null); }}
              aria-label="Close viewer"
            >
              ✕
            </button>

            {/* Navigation Arrows */}
            {items.length > 1 && (
              <>
                <button
                  className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/80 hover:bg-white text-slate-900 font-bold text-2xl z-20 flex items-center justify-center shadow-lg transition-transform hover:scale-110"
                  onClick={(e) => { e.stopPropagation(); setSelectedIndex(prev => prev !== null ? (prev - 1 + items.length) % items.length : null); }}
                  aria-label="Previous image"
                >
                  ‹
                </button>
                <button
                  className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/80 hover:bg-white text-slate-900 font-bold text-2xl z-20 flex items-center justify-center shadow-lg transition-transform hover:scale-110"
                  onClick={(e) => { e.stopPropagation(); setSelectedIndex(prev => prev !== null ? (prev + 1) % items.length : null); }}
                  aria-label="Next image"
                >
                  ›
                </button>
              </>
            )}

            {/* Image Viewer Container Box */}
            <motion.div
              key={selectedIndex}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="relative max-w-5xl w-full flex flex-col items-center bg-white/10 backdrop-blur-2xl p-4 md:p-6 rounded-3xl border border-white/20 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={selectedImage.image}
                alt={selectedImage.description || selectedImage.title || 'Fest Photo'}
                className="max-h-[75vh] w-auto object-contain rounded-2xl shadow-2xl"
              />
              
              <div className="mt-4 text-center text-white max-w-xl">
                {selectedImage.title && (
                  <h3 className="text-xl font-extrabold" style={{ fontFamily: 'var(--font-display)' }}>
                    {selectedImage.title}
                  </h3>
                )}
                {selectedImage.description && (
                  <p className="mt-1 text-sm text-slate-200 font-medium">
                    {selectedImage.description}
                  </p>
                )}
                <div className="mt-2 font-mono text-xs text-slate-300">
                  {(selectedIndex ?? 0) + 1} of {items.length}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
