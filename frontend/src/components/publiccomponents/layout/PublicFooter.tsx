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
                to="/analytics"
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
            <Link to="/" className="flex items-center gap-3 mb-3 group">
              <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-emerald-600 via-teal-600 to-sky-500 flex items-center justify-center text-white font-extrabold text-xl shadow-md group-hover:scale-105 transition-transform shrink-0 overflow-hidden">
                <img src="/logo1.jpeg" alt="Jeelani Fest Logo" className="w-full h-full object-cover rounded-full" />
              </div>
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
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

            {/* Social Icons Row */}
            <div className="flex items-center gap-3">
              <a
                href="https://www.instagram.com/gousiyyamedia"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-700 hover:text-sky-600 hover:border-sky-300 hover:scale-105 transition-all"
                title="Instagram"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>
              </a>
              <a
                href="https://youtube.com/@gousiyyamedia1519?si=NzlQbkN-S778VVJB"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-700 hover:text-red-600 hover:border-red-300 hover:scale-105 transition-all"
                title="YouTube"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg>
              </a>
              <a
                href="https://www.facebook.com/share/1M5nPepACv/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-700 hover:text-blue-600 hover:border-blue-300 hover:scale-105 transition-all"
                title="Facebook"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
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
        <div className="pt-8 border-t border-slate-200/90 flex flex-col md:flex-row items-center justify-between gap-6 text-xs font-semibold text-slate-500">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-center sm:text-left">
            <span>&copy; {new Date().getFullYear()} Gousiyya Students Centre. All rights reserved.</span>
            <span className="hidden sm:inline text-slate-300">•</span>
            <span className="text-emerald-700 font-bold">Jeelani Fest 2026 Edition</span>
          </div>

          <button
            onClick={scrollToTop}
            className="px-4 py-2 rounded-full bg-white border border-slate-200 text-slate-700 hover:text-sky-600 hover:border-sky-300 shadow-sm transition-all flex items-center gap-1.5 font-bold cursor-pointer"
          >
            Back to Top ↑
          </button>
        </div>

        {/* ── DEVELOPER CREDIT ATTRIBUTION ── */}
        <div className="mt-8 pt-6 border-t border-slate-200/50 flex flex-col items-center justify-center gap-2.5 text-center">
          <p className="text-[11px] font-medium tracking-wide text-slate-500 flex flex-wrap items-center justify-center gap-1.5">
            <span>Designed & Built with</span>
            <span className="text-red-500">♥</span>
            <span className="text-slate-400 font-normal">and endless cups of chai</span>

            <span>by</span>
            <a
              href="https://www.abdullhakalamban.online/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-slate-800 hover:text-sky-600 underline underline-offset-4 decoration-sky-400/40 hover:decoration-sky-600 transition-colors"
              title="Abdullha Ks Portfolio"
            >
              Abdullha Ks
            </a>
          </p>

          <a
            href="https://www.abdullhakalamban.online/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Visit Abdullha Ks portfolio"
            title="Visit Portfolio"
            className="group inline-flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1 rounded-full border border-slate-200/80 bg-white/60 text-slate-600 backdrop-blur-sm transition-all duration-300 hover:border-sky-300 hover:bg-white hover:text-sky-600 hover:shadow-sm"
          >
            <span>Meet the Person Behind</span>
            <svg className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="9" />
              <path d="M3 12h18" />
              <path d="M12 3c2.5 2.5 3.8 5.5 3.8 9s-1.3 6.5-3.8 9c-2.5-2.5-3.8-5.5-3.8-9S9.5 5.5 12 3z" />
            </svg>
          </a>
        </div>

      </div>
    </footer>
  );
};

export default PublicFooter;
