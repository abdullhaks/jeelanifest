import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { useModalStore } from '../../store/modalStore';
import { GlassCard, LiveBadge } from './DesignSystem';
import apiClient from '../../services/apiClient';

export const LiveModals: React.FC = () => {
  const { liveModalOpen, finalModalOpen, selectedEventId, closeLiveModal, closeFinalModal } = useModalStore();

  const [liveEventDetails, setLiveEventDetails] = useState<any>(null);
  const [finalResult, setFinalResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Fetch Live Event Details when modal opens
  useEffect(() => {
    if (liveModalOpen && selectedEventId) {
      setLoading(true);
      apiClient.get(`/public/dashboard/ongoing-programs`)
        .then(res => {
          const ev = res.data.find((p: any) => p._id === selectedEventId);
          setLiveEventDetails(ev || null);
        })
        .finally(() => setLoading(false));
    }
  }, [liveModalOpen, selectedEventId]);

  // Fetch Final Result (Overall winner) when final modal opens
  useEffect(() => {
    if (finalModalOpen) {
      setLoading(true);
      apiClient.get(`/public/groups?sortBy=totalPoints&sortOrder=desc`)
        .then(res => {
          const topGroups = res.data.data;
          setFinalResult(topGroups);
        })
        .finally(() => setLoading(false));

      // Confetti effect
      const duration = 5 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 35, spread: 360, ticks: 70, zIndex: 99999 };

      const interval: any = setInterval(function() {
        const timeLeft = animationEnd - Date.now();
        if (timeLeft <= 0) {
          return clearInterval(interval);
        }
        const particleCount = 60 * (timeLeft / duration);
        confetti(Object.assign({}, defaults, { particleCount, origin: { x: Math.random(), y: Math.random() - 0.2 } }));
      }, 250);

      return () => clearInterval(interval);
    }
  }, [finalModalOpen]);

  return (
    <>
      {/* ═══════════════════════════════════════
          REAL-TIME LIVE EVENT MODAL (PREMIUM)
         ═══════════════════════════════════════ */}
      <AnimatePresence>
        {liveModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-6"
            style={{ background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(16px)' }}
            onClick={closeLiveModal}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              transition={{ type: 'spring', stiffness: 350, damping: 25 }}
              className="relative w-full max-w-lg"
              onClick={e => e.stopPropagation()}
            >
              <GlassCard className="p-8 md:p-10 bg-white border border-slate-200/90 shadow-2xl text-slate-900 rounded-3xl relative overflow-hidden">
                {/* Background Radiant Aura */}
                <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-sky-500/10 blur-3xl pointer-events-none" />

                {/* Close Button */}
                <button
                  className="absolute top-6 right-6 w-10 h-10 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 font-bold flex items-center justify-center transition-all shadow-sm z-10"
                  onClick={closeLiveModal}
                  aria-label="Close modal"
                >
                  ✕
                </button>

                <div className="flex items-center gap-3 mb-6">
                  <span className="live-badge px-3 py-1 text-xs font-black tracking-widest">
                    🔴 ON AIR STAGE UPDATE
                  </span>
                </div>

                {loading ? (
                  <div className="py-16 text-center text-sky-600 font-bold font-mono">
                    Loading live stage details...
                  </div>
                ) : liveEventDetails ? (
                  <div>
                    <span className="text-xs font-extrabold uppercase tracking-widest text-sky-600 bg-sky-50 px-3 py-1 rounded-full border border-sky-100 mb-3 inline-block">
                      {liveEventDetails.category || 'General'} Event
                    </span>

                    <h2 className="text-3xl md:text-4xl font-extrabold mb-3 text-slate-900 leading-tight" style={{ fontFamily: 'var(--font-display)' }}>
                      {liveEventDetails.name}
                    </h2>

                    {/* Stage Banner */}
                    <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-900 to-teal-900 text-white shadow-lg mb-6 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="w-3.5 h-3.5 rounded-full bg-emerald-400 animate-ping" />
                        <div>
                          <div className="text-[10px] font-black uppercase tracking-widest text-emerald-300">CURRENT VENUE</div>
                          <div className="font-extrabold text-lg">Stage {liveEventDetails.stage || '1'}</div>
                        </div>
                      </div>
                      <span className="text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full bg-emerald-800/80 border border-emerald-500">
                        PERFORMING NOW
                      </span>
                    </div>

                    <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 text-center">
                      <p className="text-xs text-slate-600 font-medium leading-relaxed">
                        Judges are evaluating live performances. Results will be published in real-time immediately after completion.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="py-12 text-center text-slate-400 font-medium">Event details not found.</div>
                )}
              </GlassCard>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════════════════════════════════════
          GRAND FINAL CHAMPIONS MODAL (PREMIUM)
         ═══════════════════════════════════════ */}
      <AnimatePresence>
        {finalModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[10000] flex items-center justify-center p-4 md:p-6 overflow-y-auto"
            style={{ 
              background: 'radial-gradient(ellipse at center, rgba(15, 23, 42, 0.95) 0%, rgba(2, 6, 23, 0.98) 100%)',
              backdropFilter: 'blur(20px)'
            }}
            onClick={closeFinalModal}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.85, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.85, y: 50 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-4xl my-auto"
              onClick={e => e.stopPropagation()}
            >
              <GlassCard className="p-8 md:p-16 text-center shadow-2xl relative overflow-hidden bg-white/95 border-4 border-amber-400 text-slate-900 rounded-[2.5rem]">
                {/* Close Button */}
                <button
                  className="absolute top-6 right-6 w-11 h-11 rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold flex items-center justify-center transition-colors z-20 shadow-md"
                  onClick={closeFinalModal}
                >
                  ✕
                </button>

                {/* Top Championship Header Badge */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="relative z-10"
                >
                  <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-xs font-black uppercase tracking-[0.25em] bg-amber-100 text-amber-900 border border-amber-300 mb-4 shadow-sm">
                    🏆 OFFICIAL CHAMPIONSHIP ANNOUNCEMENT
                  </div>
                  
                  <h3 className="text-3xl md:text-4xl font-extrabold text-amber-600 mb-1" dir="rtl" style={{ fontFamily: 'var(--font-display-ar)' }}>
                    مهرجان الجيلاني 2026
                  </h3>

                  <h2 className="text-4xl md:text-6xl font-black mb-8 text-slate-900" style={{ fontFamily: 'var(--font-display)' }}>
                    Grand Champions
                  </h2>

                  {loading ? (
                    <div className="py-20 text-xl font-mono font-bold text-sky-600">
                      Calculating Final Scores...
                    </div>
                  ) : finalResult && finalResult.length > 0 ? (
                    <>
                      {/* Champion Emblem & Title */}
                      <div className="flex flex-col items-center mb-10">
                        <motion.div 
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ type: 'spring', delay: 0.6, duration: 1.2 }}
                          className="w-36 h-36 md:w-44 md:h-44 rounded-full flex items-center justify-center font-extrabold text-6xl shadow-2xl mb-4 overflow-hidden border-4 border-amber-300 bg-gradient-to-tr from-amber-500 via-sky-600 to-emerald-600 text-white"
                          style={{
                            boxShadow: '0 0 80px rgba(217, 119, 6, 0.4)',
                          }}
                        >
                          {finalResult[0].logoUrl ? (
                            <img src={finalResult[0].logoUrl} alt={finalResult[0].name} className="w-full h-full object-cover" />
                          ) : (
                            finalResult[0].name.charAt(0)
                          )}
                        </motion.div>

                        <motion.h1 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.9 }}
                          className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight" 
                          style={{ fontFamily: 'var(--font-display)' }}
                        >
                          {finalResult[0].name}
                        </motion.h1>

                        <motion.div 
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 1.1 }}
                          className="font-mono text-3xl md:text-4xl font-black mt-3 text-sky-600 bg-sky-50 px-6 py-2 rounded-full border border-sky-100 shadow-sm" 
                        >
                          {finalResult[0].totalPoints || finalResult[0].points || 0} POINTS
                        </motion.div>
                      </div>

                      {/* Runner Up Podium Cards */}
                      {finalResult.length > 1 && (
                        <motion.div 
                          initial={{ opacity: 0, y: 30 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 1.4 }}
                          className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto border-t border-slate-200 pt-8 mt-6"
                        >
                          {finalResult[1] && (
                            <div className="bg-gradient-to-b from-slate-100 to-white p-5 rounded-2xl border-2 border-slate-300 shadow-md">
                              <div className="text-xs font-black uppercase tracking-wider text-slate-600 mb-1">🥈 1st Runner Up</div>
                              <div className="text-xl font-extrabold text-slate-900" style={{ fontFamily: 'var(--font-display)' }}>{finalResult[1].name}</div>
                              <div className="font-mono text-base font-black text-sky-600 mt-1">{finalResult[1].totalPoints || finalResult[1].points || 0} pts</div>
                            </div>
                          )}
                          {finalResult[2] && (
                            <div className="bg-gradient-to-b from-amber-50 to-white p-5 rounded-2xl border-2 border-amber-300 shadow-md">
                              <div className="text-xs font-black uppercase tracking-wider text-amber-800 mb-1">🥉 2nd Runner Up</div>
                              <div className="text-xl font-extrabold text-slate-900" style={{ fontFamily: 'var(--font-display)' }}>{finalResult[2].name}</div>
                              <div className="font-mono text-base font-black text-sky-600 mt-1">{finalResult[2].totalPoints || finalResult[2].points || 0} pts</div>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </>
                  ) : (
                    <div className="py-16 text-slate-400 font-medium">No results published yet.</div>
                  )}
                </motion.div>
              </GlassCard>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
