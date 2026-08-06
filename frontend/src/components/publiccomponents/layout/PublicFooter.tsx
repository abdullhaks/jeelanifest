import React from 'react';
import { Link } from 'react-router-dom';
import { LatticeBackground } from '../DesignSystem';

const PublicFooter: React.FC = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative overflow-hidden pt-24 pb-12 bg-[#F1F5F9] border-t border-slate-200/90 text-slate-800">
      {/* Subtle lattice background motif */}
      <LatticeBackground opacity={0.03} parallax={false} />

      <div className="max-w-7xl w-full mx-auto px-6 relative z-10">
        
        {/* ── TOP HERO CTA CARD (Newsletter / Live Updates Banner) ── */}
        <div className="relative rounded-3xl overflow-hidden bg-slate-900 text-white p-8 md:p-14 mb-20 shadow-2xl border border-slate-800">
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-gradient-to-br from-sky-500/20 via-emerald-500/20 to-transparent blur-3xl pointer-events-none" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(2,132,199,0.15)_0%,transparent_70%)]" />

          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8 text-center lg:text-left">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-widest bg-amber-400/20 text-amber-300 border border-amber-400/30 mb-4">
                ✨ Jeelani Fest 2026 Live Updates
              </div>
              <h3 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white leading-tight" style={{ fontFamily: 'var(--font-display)' }}>
                Follow the Battle of Champions
              </h3>
              <p className="text-sm md:text-base text-slate-300 font-medium mt-3 leading-relaxed">
                Stay updated with real-time stage scores, overall house rankings, and published results.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
              <Link
                to="/results"
                className="w-full sm:w-auto px-8 py-4 rounded-full font-extrabold text-sm bg-gradient-to-r from-sky-500 to-blue-600 text-white hover:from-sky-400 hover:to-blue-500 shadow-lg shadow-sky-500/25 transition-all text-center"
              >
                View Live Results &rarr;
              </Link>
              <Link
                to="/groups"
                className="w-full sm:w-auto px-8 py-4 rounded-full font-extrabold text-sm bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-md transition-all text-center"
              >
                Competing Houses
              </Link>
            </div>
          </div>
        </div>

        {/* ── MAIN FOOTER NAVIGATION GRID ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-16">
          
          {/* Column 1 & 2: Brand & Calligraphy */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-3 mb-4 group">
              <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-emerald-600 via-teal-600 to-sky-500 flex items-center justify-center text-white font-extrabold text-xl shadow-md group-hover:scale-105 transition-transform">
                ✨
              </div>
              <div>
                <span className="font-extrabold text-2xl tracking-tight text-slate-900 leading-none block" style={{ fontFamily: 'var(--font-display)' }}>
                  Jeelani Fest 2026
                </span>
                <span className="text-[10px] tracking-[0.25em] uppercase font-bold text-emerald-700">
                  Sheikh Jeelani Academy
                </span>
              </div>
            </Link>

            <h4 className="text-3xl font-extrabold text-amber-600 mb-4" dir="rtl" style={{ fontFamily: 'var(--font-display-ar)' }}>
              مهرجان الجيلاني
            </h4>

            <p className="text-slate-600 text-sm font-medium leading-relaxed max-w-sm mb-6">
              The premier art and cultural festival of Sheikh Jeelani Islamic Academy, Kerala. Celebrating creative excellence, competitive spirit, and artistic talent.
            </p>

            {/* Social Icons Pill */}
            <div className="flex gap-3">
              {[
                { name: 'Instagram', label: 'IG' },
                { name: 'YouTube', label: 'YT' },
                { name: 'Facebook', label: 'FB' },
              ].map(s => (
                <a
                  key={s.name}
                  href="#"
                  className="w-10 h-10 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center text-xs font-black text-slate-700 hover:text-sky-600 hover:border-sky-300 hover:scale-105 transition-all"
                  title={s.name}
                >
                  {s.label}
                </a>
              ))}
            </div>
          </div>

          {/* Column 3: Navigation */}
          <div>
            <h5 className="font-extrabold uppercase text-xs tracking-[0.2em] text-sky-700 mb-5">
              Navigation
            </h5>
            <ul className="space-y-3">
              {[
                { to: '/', label: 'Home Page' },
                { to: '/groups', label: 'House Leaderboard' },
                { to: '/results', label: 'Published Results' },
                { to: '/participants', label: 'Participants Roster' },
                { to: '/festgallery', label: 'Visual Gallery' },
              ].map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sm font-bold text-slate-600 hover:text-sky-600 transition-colors flex items-center gap-1.5"
                  >
                    <span>›</span> {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Categories & Stages */}
          <div>
            <h5 className="font-extrabold uppercase text-xs tracking-[0.2em] text-sky-700 mb-5">
              Fest Stages
            </h5>
            <ul className="space-y-3 text-sm text-slate-600 font-semibold">
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" /> Stage 1: Main Stage
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-sky-500" /> Stage 2: Auditorium
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500" /> Stage 3: Conference Hall
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-purple-500" /> Calligraphy Pavilion
              </li>
            </ul>
          </div>

          {/* Column 5: Administration */}
          <div>
            <h5 className="font-extrabold uppercase text-xs tracking-[0.2em] text-sky-700 mb-5">
              Portal Access
            </h5>
            <p className="text-xs text-slate-500 font-medium mb-4 leading-relaxed">
              Official scoring management portal for judges and tabulators.
            </p>
            <Link
              to="/admin/login"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-extrabold uppercase tracking-wider bg-slate-900 text-white hover:bg-sky-600 shadow-sm transition-all"
            >
              Admin Login &rarr;
            </Link>
          </div>

        </div>

        {/* ── BOTTOM FOOTER BAR & BACK TO TOP ── */}
        <div className="pt-8 border-t border-slate-200/90 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-semibold text-slate-500">
          <div>
            &copy; {new Date().getFullYear()} Sheikh Jeelani Islamic Academy. All rights reserved.
          </div>

          <div className="flex items-center gap-6">
            <span>Jeelani Fest 2026 Edition</span>
            <button
              onClick={scrollToTop}
              className="px-4 py-2 rounded-full bg-white border border-slate-200 text-slate-700 hover:text-sky-600 hover:border-sky-300 shadow-sm transition-all flex items-center gap-1.5 font-bold"
            >
              Back to Top ↑
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default PublicFooter;
