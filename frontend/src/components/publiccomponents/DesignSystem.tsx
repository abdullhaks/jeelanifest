import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

/**
 * LatticeBackground — Animated mashrabiya/jaali geometric lattice SVG pattern.
 * The single signature visual motif that recurs across the entire public UI.
 * Animates with subtle parallax drift on scroll.
 */
export const LatticeBackground: React.FC<{
  className?: string;
  opacity?: number;
  parallax?: boolean;
}> = ({ className = '', opacity = 0.06, parallax = true }) => {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, 60]);

  return (
    <motion.div
      className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}
      style={parallax ? { y } : undefined}
    >
      <svg
        className="w-full h-full animate-lattice-drift"
        style={{ opacity }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id="jaali-lattice"
            x="0" y="0"
            width="80" height="80"
            patternUnits="userSpaceOnUse"
          >
            {/* Octagonal mashrabiya screen pattern */}
            <path
              d="M40 0 L56 16 L56 64 L40 80 L24 64 L24 16 Z"
              fill="none"
              stroke="var(--brass-gold)"
              strokeWidth="0.5"
            />
            <path
              d="M0 40 L16 24 L64 24 L80 40 L64 56 L16 56 Z"
              fill="none"
              stroke="var(--brass-gold)"
              strokeWidth="0.5"
            />
            {/* Inner star */}
            <circle cx="40" cy="40" r="6" fill="none" stroke="var(--brass-gold)" strokeWidth="0.3" />
            {/* Corner connectors */}
            <path d="M0 0 L16 16 M80 0 L64 16 M0 80 L16 64 M80 80 L64 64" 
              fill="none" stroke="var(--brass-gold)" strokeWidth="0.3" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#jaali-lattice)" />
      </svg>
    </motion.div>
  );
};

/**
 * GlassCard — Reusable glass panel with brass-tinted border
 */
export const GlassCard: React.FC<{
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  notched?: boolean;
  onClick?: () => void;
}> = ({ children, className = '', hover = true, notched = false, onClick }) => {
  return (
    <motion.div
      whileHover={hover ? { y: -4, scale: 1.01 } : undefined}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      onClick={onClick}
      className={`glass-card ${notched ? 'notched-corner' : ''} ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {children}
    </motion.div>
  );
};

/**
 * BentoGrid — Responsive grid for bento layout
 */
export const BentoGrid: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 ${className}`}>
      {children}
    </div>
  );
};

/**
 * BentoCell — Individual bento tile 
 * span: 1 = 1x1, 2 = 2x1, 'wide' = spans 2 cols, 'tall' = spans 2 rows, 'large' = 2x2
 */
export const BentoCell: React.FC<{
  children: React.ReactNode;
  span?: 'default' | 'wide' | 'tall' | 'large';
  className?: string;
}> = ({ children, span = 'default', className = '' }) => {
  const spanClass = {
    default: '',
    wide: 'md:col-span-2',
    tall: 'md:row-span-2',
    large: 'md:col-span-2 md:row-span-2',
  }[span];

  return (
    <div className={`${spanClass} ${className}`}>
      {children}
    </div>
  );
};

/**
 * LiveBadge — Pulsing "LIVE" indicator
 */
export const LiveBadge: React.FC<{ label?: string }> = ({ label = 'LIVE' }) => {
  return <span className="live-badge">{label}</span>;
};

/**
 * FloatingPillTag — Frosted glass rounded pill tag overlaid on images (as in Photomator bento reference)
 */
export const FloatingPillTag: React.FC<{ label: string; className?: string }> = ({ label, className = '' }) => {
  return (
    <div
      className={`px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm transition-transform hover:scale-105 ${className}`}
      style={{
        background: 'rgba(255, 255, 255, 0.75)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: '1px solid rgba(255, 255, 255, 0.9)',
        color: '#0F172A',
      }}
    >
      {label}
    </div>
  );
};

/**
 * StatCounter — Animated counter with scoreboard styling
 */
export const StatCounter: React.FC<{
  value: number;
  label: string;
  color?: string;
}> = ({ value, label, color = '#0284C7' }) => {
  return (
    <div className="text-center">
      <div className="stat-counter text-5xl md:text-6xl mb-2" style={{ color }}>
        {value}
      </div>
      <div className="text-xs uppercase tracking-[0.2em] font-semibold text-slate-500">
        {label}
      </div>
    </div>
  );
};

/**
 * SectionHeading — Consistent section title with optional Arabic
 */
export const SectionHeading: React.FC<{
  title: string;
  titleAr?: string;
  subtitle?: string;
  centered?: boolean;
  className?: string;
}> = ({ title, titleAr, subtitle, centered = true, className = '' }) => {
  return (
    <div className={`mb-10 ${centered ? 'text-center' : 'text-left'} ${className}`}>
      {titleAr && (
        <div className="font-display-ar text-amber-600 font-bold text-xl md:text-2xl mb-1.5" dir="rtl">
          {titleAr}
        </div>
      )}
      <h2 className="section-heading text-3xl md:text-4xl lg:text-5xl tracking-tight text-slate-900 font-extrabold">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-3 text-sm md:text-base text-slate-500 max-w-2xl mx-auto font-medium">
          {subtitle}
        </p>
      )}
    </div>
  );
};

/**
 * BrassDivider — Horizontal brass gradient line
 */
export const BrassDivider: React.FC<{ className?: string }> = ({ className = '' }) => {
  return <div className={`brass-divider my-16 ${className}`} />;
};

import defaultDpSrc from '../../assets/dp.jpg';

/**
 * PodiumCard — Used for 1st/2nd/3rd place display with rich Gold, Silver, and Bronze themes & avatar support
 */
export const PodiumCard: React.FC<{
  rank: '1st' | '2nd' | '3rd';
  name: string;
  subtitle?: string;
  points?: number;
  image?: string;
  groupName?: string;
  elevated?: boolean;
}> = ({ rank, name, subtitle, points, image, groupName, elevated = false }) => {
  const isSecond = rank === '2nd';
  const isThird = rank === '3rd';

  // Rich themed styling
  let cardBg = 'bg-gradient-to-b from-amber-400/20 via-yellow-100/40 to-amber-500/10 border-2 border-amber-400 shadow-xl shadow-amber-500/20';
  let ringBg = 'bg-gradient-to-tr from-amber-500 via-yellow-300 to-amber-600 shadow-amber-500/30';
  let badgeBg = 'bg-amber-500 text-slate-950 font-black';
  let pointsColor = 'text-amber-600';
  let medalIcon = '🥇';

  if (isSecond) {
    cardBg = 'bg-gradient-to-b from-slate-200/60 via-slate-100/30 to-white border-2 border-slate-300 shadow-lg shadow-slate-400/15';
    ringBg = 'bg-gradient-to-tr from-slate-400 via-slate-200 to-slate-600 shadow-slate-400/20';
    badgeBg = 'bg-slate-600 text-white font-extrabold';
    pointsColor = 'text-slate-600';
    medalIcon = '🥈';
  } else if (isThird) {
    cardBg = 'bg-gradient-to-b from-amber-900/15 via-orange-950/5 to-white border-2 border-amber-700/40 shadow-md shadow-amber-900/10';
    ringBg = 'bg-gradient-to-tr from-amber-700 via-orange-400 to-amber-900 shadow-amber-900/20';
    badgeBg = 'bg-amber-800 text-white font-extrabold';
    pointsColor = 'text-amber-800';
    medalIcon = '🥉';
  }

  const avatarSrc = image || defaultDpSrc;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={`p-4 md:p-6 rounded-3xl text-center transition-all relative overflow-hidden flex flex-col items-center justify-between min-h-[260px] ${cardBg} ${elevated ? 'scale-105 z-10' : ''}`}
    >
      {/* Background Decorative Accent */}
      <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-white/30 blur-2xl pointer-events-none" />

      {/* Top Medal Tag */}
      <div className="flex items-center justify-center gap-1.5 mb-2 relative z-10">
        <span className="text-xl md:text-2xl">{medalIcon}</span>
        <span className={`px-2.5 py-0.5 rounded-full text-[10px] md:text-xs tracking-wider uppercase ${badgeBg}`}>
          {rank} Place
        </span>
      </div>

      {/* Student / Participant Avatar Photo */}
      <div className="relative mb-2 group z-10">
        <div className={`w-20 h-20 md:w-24 md:h-24 rounded-full p-1 shadow-lg ${ringBg}`}>
          <img
            src={avatarSrc}
            alt={name}
            onError={(e: any) => { e.target.src = defaultDpSrc; }}
            className="w-full h-full rounded-full object-cover border-2 border-white bg-slate-100"
          />
        </div>
      </div>

      {/* Student Name */}
      <div className="font-extrabold text-base md:text-lg text-slate-900 leading-snug mb-0.5 z-10 break-words max-w-full px-2" style={{ fontFamily: 'var(--font-display)' }}>
        {name}
      </div>

      {/* Subtitle / Chest Code */}
      {subtitle && (
        <div className="text-xs font-semibold text-slate-500 mb-1 z-10">
          Chest Code: <span className="font-bold text-sky-600">{subtitle}</span>
        </div>
      )}

      {/* Group Badge if present */}
      {groupName && (
        <div className="inline-block px-3 py-0.5 rounded-full bg-slate-100/90 border border-slate-200 text-[10px] font-extrabold text-slate-700 uppercase tracking-wider mb-2 z-10">
          {groupName}
        </div>
      )}

      {/* Points Tag */}
      {points !== undefined && (
        <div className={`font-mono font-black text-base md:text-lg z-10 ${pointsColor}`}>
          +{points} pts
        </div>
      )}
    </motion.div>
  );
};
