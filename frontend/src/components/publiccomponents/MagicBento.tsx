import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface MagicCardProps {
  title: string;
  subtitle?: string;
  tag?: string;
  image?: string;
  className?: string;
  badge?: string;
  gradient?: string;
  children?: React.ReactNode;
  onClick?: () => void;
}

export const MagicCard: React.FC<MagicCardProps> = ({
  title,
  subtitle,
  tag,
  image,
  className = '',
  badge,
  gradient = 'from-sky-500/20 via-blue-500/10 to-transparent',
  children,
  onClick
}) => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.01 }}
      transition={{ type: 'spring', stiffness: 350, damping: 25 }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      className={`relative rounded-3xl overflow-hidden bg-white/90 border border-slate-200 shadow-md backdrop-blur-xl group cursor-pointer transition-shadow hover:shadow-xl ${className}`}
    >
      {/* Mouse Spotlight Glow Overlay */}
      {isHovered && (
        <div
          className="pointer-events-none absolute -inset-px transition-opacity duration-300 z-10"
          style={{
            background: `radial-gradient(600px circle at ${mousePos.x}px ${mousePos.y}px, rgba(2, 132, 199, 0.12), transparent 40%)`,
          }}
        />
      )}

      {/* Image Background Layer if available */}
      {image && (
        <div className="absolute inset-0 z-0 overflow-hidden">
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-108"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-transparent" />
        </div>
      )}

      {/* Radiant Gradient Corner Glow */}
      <div className={`absolute -top-24 -right-24 w-64 h-64 rounded-full bg-gradient-to-br ${gradient} blur-3xl pointer-events-none`} />

      {/* Card Content Layer */}
      <div className="relative z-20 p-8 h-full flex flex-col justify-between">
        <div>
          {/* Top Pill Badges */}
          <div className="flex items-center justify-between mb-4">
            {tag && (
              <span className={`px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider ${
                image 
                  ? 'bg-white/80 backdrop-blur text-slate-900 shadow-sm border border-white' 
                  : 'bg-sky-50 text-sky-700 border border-sky-100'
              }`}>
                {tag}
              </span>
            )}
            {badge && (
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-amber-100 text-amber-800 border border-amber-200 shadow-sm">
                {badge}
              </span>
            )}
          </div>

          {/* Striking Title */}
          <h3
            className={`text-2xl md:text-3xl font-extrabold leading-tight tracking-tight ${
              image ? 'text-white drop-shadow' : 'text-slate-900'
            }`}
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {title}
          </h3>

          {/* Subtitle */}
          {subtitle && (
            <p className={`mt-2.5 text-xs md:text-sm font-medium leading-relaxed ${
              image ? 'text-slate-200' : 'text-slate-500'
            }`}>
              {subtitle}
            </p>
          )}
        </div>

        {/* Children components or Action link */}
        {children && <div className="mt-6">{children}</div>}
      </div>
    </motion.div>
  );
};

export const MagicBento: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}>
      {children}
    </div>
  );
};
