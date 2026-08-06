import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CircularItem {
  id: string | number;
  image: string;
  title: string;
  caption?: string;
  category?: string;
}

interface CircularGalleryProps {
  items?: CircularItem[];
}

const defaultItems: CircularItem[] = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1000&auto=format&fit=crop',
    title: 'Grand Stage Performance',
    caption: 'Senior Qira\'at & Nasheed finals on Main Stage',
    category: 'Stage Event',
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=1000&auto=format&fit=crop',
    title: 'Calligraphy Workshop',
    caption: 'Live Islamic Calligraphy & Canvas painting',
    category: 'Art & Craft',
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=1000&auto=format&fit=crop',
    title: 'Championship Trophy',
    caption: 'The coveted Jeelani Fest overall trophy',
    category: 'Awards',
  },
  {
    id: 4,
    image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1000&auto=format&fit=crop',
    title: 'Sub-Junior Festival',
    caption: 'Pencil drawing and story recitation by young talents',
    category: 'Sub-Junior',
  },
  {
    id: 5,
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=1000&auto=format&fit=crop',
    title: 'Audience & Cultural Night',
    caption: 'Packed auditorium cheering for competing houses',
    category: 'Highlights',
  },
];

export const CircularGallery: React.FC<CircularGalleryProps> = ({ items = defaultItems }) => {
  const galleryItems = items.length > 0 ? items : defaultItems;
  const [activeIndex, setActiveIndex] = useState(0);

  // Auto spin slowly
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex(prev => (prev + 1) % galleryItems.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [galleryItems.length]);

  const handleNext = () => setActiveIndex(prev => (prev + 1) % galleryItems.length);
  const handlePrev = () => setActiveIndex(prev => (prev - 1 + galleryItems.length) % galleryItems.length);

  return (
    <div className="relative w-full py-12 overflow-hidden select-none">
      {/* Background Decorative Radial Gradient */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,rgba(2,132,199,0.06)_0%,transparent_70%)]" />

      {/* 3D Cylindrical Gallery Stage */}
      <div className="max-w-6xl mx-auto px-6 relative z-10 flex flex-col items-center">
        <div className="relative w-full h-[380px] md:h-[440px] flex items-center justify-center perspective-[1200px]">
          {galleryItems.map((item, index) => {
            const count = galleryItems.length;
            const offset = (index - activeIndex + count) % count;

            // Compute 3D circular positioning
            let angle = (offset / count) * 360;
            if (angle > 180) angle -= 360;

            const isCenter = offset === 0;
            const isLeft = offset === count - 1 || angle < 0;
            const isRight = offset === 1 || angle > 0;

            // Scale & Translate X/Z for 3D Carousel arc
            let x = 0;
            let z = 0;
            let scale = 0.75;
            let opacity = 0.4;
            let zIndex = 1;

            if (isCenter) {
              x = 0;
              z = 100;
              scale = 1;
              opacity = 1;
              zIndex = 30;
            } else if (offset === 1) {
              x = 240;
              z = -60;
              scale = 0.85;
              opacity = 0.7;
              zIndex = 20;
            } else if (offset === count - 1) {
              x = -240;
              z = -60;
              scale = 0.85;
              opacity = 0.7;
              zIndex = 20;
            } else {
              x = offset > 1 ? 420 : -420;
              z = -180;
              scale = 0.65;
              opacity = 0.2;
              zIndex = 10;
            }

            return (
              <motion.div
                key={item.id}
                animate={{
                  x,
                  z,
                  scale,
                  opacity,
                  rotateY: isCenter ? 0 : offset === 1 ? -15 : offset === count - 1 ? 15 : 0,
                }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                onClick={() => setActiveIndex(index)}
                className="absolute w-[280px] sm:w-[340px] md:w-[380px] h-[340px] md:h-[390px] rounded-3xl overflow-hidden cursor-pointer shadow-xl border border-white/80 bg-white/90 backdrop-blur-md flex flex-col justify-between"
                style={{ zIndex }}
              >
                {/* Photo Container */}
                <div className="relative w-full h-[65%] overflow-hidden bg-slate-900">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover transform transition-transform duration-700 hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                  {item.category && (
                    <span className="absolute top-4 left-4 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-white/80 backdrop-blur-md text-slate-900 shadow border border-white">
                      {item.category}
                    </span>
                  )}
                </div>

                {/* Caption & Details */}
                <div className="p-5 bg-white flex-1 flex flex-col justify-center text-center">
                  <h4 className="font-extrabold text-slate-900 text-lg md:text-xl line-clamp-1" style={{ fontFamily: 'var(--font-display)' }}>
                    {item.title}
                  </h4>
                  {item.caption && (
                    <p className="text-xs text-slate-500 font-medium mt-1 line-clamp-2">
                      {item.caption}
                    </p>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Carousel Controls & Indicators */}
        <div className="flex items-center gap-6 mt-6">
          <button
            onClick={handlePrev}
            className="w-11 h-11 rounded-full bg-white border border-slate-200 shadow-md text-slate-800 font-bold flex items-center justify-center hover:bg-slate-50 hover:scale-105 transition-all"
            aria-label="Previous slide"
          >
            ‹
          </button>

          <div className="flex gap-2">
            {galleryItems.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveIndex(idx)}
                className={`transition-all duration-300 rounded-full ${
                  activeIndex === idx ? 'w-8 h-2.5 bg-sky-600' : 'w-2.5 h-2.5 bg-slate-300 hover:bg-slate-400'
                }`}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            className="w-11 h-11 rounded-full bg-white border border-slate-200 shadow-md text-slate-800 font-bold flex items-center justify-center hover:bg-slate-50 hover:scale-105 transition-all"
            aria-label="Next slide"
          >
            ›
          </button>
        </div>
      </div>
    </div>
  );
};
