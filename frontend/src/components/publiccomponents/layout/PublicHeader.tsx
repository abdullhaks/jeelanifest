import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const navLinks = [
  { name: 'Home', path: '/' },
  { name: 'Groups', path: '/groups' },
  { name: 'Results', path: '/results' },
  { name: 'Participants', path: '/participants' },
  { name: 'Gallery', path: '/festgallery' },
  { name: 'Pro Live Arena 📊', path: '/analytics' },
];

const PublicHeader: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  return (
    <>
      {/* Floating Glassmorphism Top Bar */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-3 left-1/2 -translate-x-1/2 w-[92%] max-w-7xl z-50 transition-all duration-300"
      >
        <div 
          className={`w-full rounded-full transition-all duration-300 px-6 py-3 flex justify-between items-center border ${
            scrolled 
              ? 'bg-white/90 backdrop-blur-xl border-slate-200/90 shadow-lg shadow-slate-900/5' 
              : 'bg-white/80 backdrop-blur-lg border-slate-200/60 shadow-md'
          }`}
        >
          {/* Back & Logo */}
          <div className="flex items-center gap-3">
            {location.pathname !== '/' && (
              <button 
                onClick={() => navigate(-1)}
                className="w-9 h-9 rounded-full bg-slate-100/80 hover:bg-slate-200 flex items-center justify-center text-slate-700 transition-colors border border-slate-200"
                aria-label="Go Back"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
              </button>
            )}
            <Link to="/" className="group flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-emerald-600 via-teal-600 to-sky-500 flex items-center justify-center text-white font-extrabold text-lg shadow-md group-hover:scale-105 transition-transform">
              <img src="logo1.jpeg" alt="" className='w-full h-full object-cover rounded-full' />
            </div>
            <div className="flex flex-col">
              <span
                className="font-extrabold text-lg md:text-xl tracking-tight text-slate-900 leading-tight group-hover:text-sky-600 transition-colors"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Jeelani Fest <span className='text-amber-600'>2026</span>
              </span>
              <span className="text-[9px] tracking-[0.2em] uppercase font-bold text-emerald-700">
                Sheikh Jeelani Islamic Academy
              </span>
            </div>
            </Link>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex gap-1 items-center bg-slate-100/80 p-1.5 rounded-full border border-slate-200/80">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`text-xs font-extrabold tracking-wider uppercase px-4 py-2 rounded-full relative transition-colors ${
                    isActive ? 'text-slate-900' : 'text-slate-500 hover:text-slate-900'
                  }`}
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  <span className="relative z-10">{link.name}</span>
                  {isActive && (
                    <motion.div
                      layoutId="active-pill"
                      className="absolute inset-0 bg-white rounded-full shadow-sm border border-slate-200/80"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Login Action CTA */}
          <div className="hidden md:flex items-center gap-3">
            {/* <Link
              to="/admin/login"
              className="px-5 py-2.5 rounded-full text-xs font-extrabold uppercase tracking-wider transition-all bg-slate-900 text-white hover:bg-sky-600 shadow-sm hover:shadow-md hover:scale-105"
            >
              Login
            </Link> */}
             <Link to="/" className="group flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-emerald-600 via-teal-600 to-sky-500 flex items-center justify-center text-white font-extrabold text-lg shadow-md group-hover:scale-105 transition-transform">
              <img src="gsc.jpeg" alt=""  className='rounded-full w-9 h-9'/>
            </div>
          </Link>
          </div>

          {/* Mobile Hamburger */}
          <button
            className="md:hidden p-2.5 rounded-full bg-slate-100 text-slate-800 flex flex-col gap-1 items-center justify-center w-10 h-10 border border-slate-200"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle navigation menu"
          >
            <motion.span
              animate={mobileOpen ? { rotate: 45, y: 5 } : { rotate: 0, y: 0 }}
              className="block w-5 h-[2px] bg-slate-800 rounded-full"
            />
            <motion.span
              animate={mobileOpen ? { opacity: 0 } : { opacity: 1 }}
              className="block w-5 h-[2px] bg-slate-800 rounded-full"
            />
            <motion.span
              animate={mobileOpen ? { rotate: -45, y: -5 } : { rotate: 0, y: 0 }}
              className="block w-5 h-[2px] bg-slate-800 rounded-full"
            />
          </button>
        </div>
      </motion.header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 flex flex-col items-center justify-center gap-6 md:hidden bg-white/95 text-slate-900 backdrop-blur-2xl p-6"
          >
            <div className="font-display-ar text-amber-600 font-bold text-2xl mb-2">مهرجان الجيلاني</div>
            {navLinks.map((link, i) => (
              <motion.div
                key={link.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
              >
                <Link
                  to={link.path}
                  className={`text-xl font-extrabold uppercase tracking-widest px-6 py-2 rounded-full ${
                    location.pathname === link.path
                      ? 'text-sky-600 bg-sky-50 font-black'
                      : 'text-slate-700'
                  }`}
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  {link.name}
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default PublicHeader;
