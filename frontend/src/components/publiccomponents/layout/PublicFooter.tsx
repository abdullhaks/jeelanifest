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
              <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-emerald-600 via-teal-600 to-sky-500 flex items-center justify-center text-white font-extrabold text-xl shadow-md group-hover:scale-105 transition-transform shrink-0">
                <img src="logo1.png" alt="" className='w-full h-full object-cover rounded-full' />
              </div>
              <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                <span className="font-extrabold text-2xl tracking-tight text-slate-900 leading-none" style={{ fontFamily: 'var(--font-display)' }}>
                  Jeelani Fest 2026
                </span>
                <span className="text-xl font-extrabold text-amber-600 tracking-wide" dir="rtl" style={{ fontFamily: 'var(--font-display-ar)' }}>
                  مهرجان الجيلاني 2026
                </span>
              </div>
            </Link>

            <span className="text-[10px] tracking-[0.25em] uppercase font-bold text-emerald-700 block mb-3">
              Sheikh Jeelani Islamic Academy
            </span>

            <p className="text-slate-600 text-sm font-medium leading-relaxed max-w-sm mb-6">
              The premier art and cultural festival of Sheikh Jeelani Islamic Academy, Kerala. Celebrating creative excellence, competitive spirit, and artistic talent.
            </p>

            {/* Social Icons Pill */}
            <div className="flex gap-3">
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-700 hover:text-sky-600 hover:border-sky-300 hover:scale-105 transition-all"
                title="Instagram"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-700 hover:text-red-600 hover:border-red-300 hover:scale-105 transition-all"
                title="YouTube"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-700 hover:text-blue-600 hover:border-blue-300 hover:scale-105 transition-all"
                title="Facebook"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-700 hover:text-emerald-600 hover:border-emerald-300 hover:scale-105 transition-all"
                title="WhatsApp"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
              </a>
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
