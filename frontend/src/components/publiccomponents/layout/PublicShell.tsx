import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import PublicHeader from './PublicHeader';
import PublicFooter from './PublicFooter';
import Lenis from 'lenis';
import { LiveModals } from '../LiveModals';
import { useModalStore } from '../../../store/modalStore';
import { io } from 'socket.io-client';

const PublicShell: React.FC = () => {
  const location = useLocation();
  const openFinalModal = useModalStore(state => state.openFinalModal);

  useEffect(() => {
    // Lenis smooth scroll
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      wheelMultiplier: 1,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    // Scroll to top on route change
    window.scrollTo(0, 0);

    return () => lenis.destroy();
  }, [location.pathname]);

  // Global socket listener for final result reveal
  useEffect(() => {
    const socketUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3000';
    const socket = io(socketUrl);

    socket.on('results:final', () => {
      openFinalModal();
    });

    return () => {
      socket.disconnect();
    };
  }, [openFinalModal]);

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FA] text-slate-900">
      <PublicHeader />
      
      {/* Main content wraps full width/height; padding handled internally by pages */}
      <main className="flex-1 flex flex-col relative w-full overflow-hidden">
        <Outlet />
      </main>
      
      <PublicFooter />
      <LiveModals />
    </div>
  );
};

export default PublicShell;
