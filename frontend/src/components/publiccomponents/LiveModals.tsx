import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { CrownOutlined, StarFilled } from '@ant-design/icons';
import { useModalStore } from '../../store/modalStore';
import { GlassCard } from './DesignSystem';
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
      const defaults = { startVelocity: 35, spread: 360, ticks: 70, zIndex: 999999 };

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
      {/* ═══════════════════════════════════════
          GRAND FINAL CHAMPIONS MODAL (PREMIUM)
         ═══════════════════════════════════════ */}
      <AnimatePresence>
        {finalModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[10000] flex items-center justify-center p-4 md:p-6 overflow-hidden"
            style={{ 
              background: 'rgba(0, 0, 0, 0.45)',
              backdropFilter: 'blur(12px)'
            }}
            onClick={closeFinalModal}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.85, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.85, y: 40 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-2xl my-auto max-h-[90vh] flex flex-col justify-between rounded-[2.5rem] overflow-hidden shadow-2xl border-2 border-amber-400/50"
              style={{ background: 'linear-gradient(145deg, #0F172A 0%, #0B1120 60%, #070A14 100%)' }}
              onClick={e => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-800/80 text-slate-300 hover:bg-slate-700 font-bold flex items-center justify-center transition-colors z-20 shadow-md border border-slate-700/80"
                onClick={closeFinalModal}
              >
                ✕
              </button>

              {/* Top Championship Header Badge */}
              <div className="pt-6 pb-4 px-6 text-center shrink-0 border-b border-slate-800/80 relative z-10">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                  className="inline-flex items-center gap-2 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.25em] bg-amber-400/15 text-amber-300 border border-amber-400/30 mb-2 shadow-inner"
                >
                  🏆 OFFICIAL CHAMPIONSHIP ANNOUNCEMENT
                </motion.div>
                
                <h3 className="text-xl md:text-2xl font-extrabold text-amber-400 mb-0.5" dir="rtl" style={{ fontFamily: 'var(--font-display-ar)' }}>
                  مهرجان الجيلاني 2026
                </h3>

                <h2 className="text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-100 tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
                  Grand Champions
                </h2>
              </div>

              {/* Body: Podium Showcase */}
              <div className="p-6 md:p-8 flex-1 min-h-0 overflow-y-auto flex flex-col justify-center">
                {loading ? (
                  <div className="py-12 text-center text-sm font-mono font-bold text-amber-400">
                    Calculating Final Scores...
                  </div>
                ) : finalResult && finalResult.length > 0 ? (
                  <div className="flex justify-center items-end gap-3 md:gap-5 max-w-xl mx-auto w-full">
                    {/* 2nd Place */}
                    {finalResult[1] && (
                      <motion.div
                        initial={{ opacity: 0, y: 60, scale: 0.8 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ type: 'spring', stiffness: 240, damping: 20, delay: 0.5 }}
                        className="w-1/3 flex flex-col items-center"
                      >
                        <div className="text-center mb-2 px-1">
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-0.5">2nd Place</span>
                          <div className="font-bold text-sm md:text-base text-slate-200 truncate max-w-[110px]" style={{ fontFamily: 'var(--font-display)' }}>
                            {finalResult[1].name}
                          </div>
                          <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.9 }} className="text-[11px] font-mono font-bold text-sky-400 block mt-0.5">
                            {finalResult[1].totalPoints || finalResult[1].points || 0} pts
                          </motion.span>
                        </div>
                        <div className="w-full h-32 md:h-36 rounded-t-2xl bg-gradient-to-t from-slate-800/90 to-slate-700/50 border-t border-x border-slate-600/50 flex flex-col items-center justify-end pb-3 shadow-lg">
                          <span className="text-2xl font-black font-mono text-slate-300">2nd</span>
                        </div>
                      </motion.div>
                    )}

                    {/* 1st Place (Gold Champion) */}
                    {finalResult[0] && (
                      <motion.div
                        initial={{ opacity: 0, y: 80, scale: 0.7 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.3 }}
                        className="w-1/3 flex flex-col items-center z-10"
                      >
                        <div className="text-center mb-2 px-1">
                          <motion.div
                            animate={{ y: [0, -6, 0] }}
                            transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
                            className="w-11 h-11 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 text-slate-950 flex items-center justify-center font-black mx-auto mb-1 shadow-lg shadow-amber-500/40 border border-amber-200"
                          >
                            <CrownOutlined className="text-xl" />
                          </motion.div>
                          <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 block">CHAMPION</span>
                          <div className="font-black text-base md:text-lg text-amber-200 truncate max-w-[130px]" style={{ fontFamily: 'var(--font-display)' }}>
                            {finalResult[0].name}
                          </div>
                          <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.8 }} className="text-xs font-mono font-extrabold text-amber-300 block mt-0.5">
                            {finalResult[0].totalPoints || finalResult[0].points || 0} PTS
                          </motion.span>
                        </div>
                        <div className="w-full h-40 md:h-48 rounded-t-2xl bg-gradient-to-t from-amber-950/90 via-amber-800/40 to-yellow-600/30 border-t-2 border-x border-amber-400/80 flex flex-col items-center justify-end pb-4 shadow-[0_0_30px_rgba(245,158,11,0.3)]">
                          <span className="text-4xl md:text-5xl font-black font-mono text-amber-300">1st</span>
                          <StarFilled className="text-amber-400 text-sm mt-1 animate-pulse" />
                        </div>
                      </motion.div>
                    )}

                    {/* 3rd Place */}
                    {finalResult[2] && (
                      <motion.div
                        initial={{ opacity: 0, y: 60, scale: 0.8 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ type: 'spring', stiffness: 240, damping: 20, delay: 0.7 }}
                        className="w-1/3 flex flex-col items-center"
                      >
                        <div className="text-center mb-2 px-1">
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-700/80 block mb-0.5">3rd Place</span>
                          <div className="font-bold text-sm text-slate-300 truncate max-w-[110px]" style={{ fontFamily: 'var(--font-display)' }}>
                            {finalResult[2].name}
                          </div>
                          <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1 }} className="text-[11px] font-mono font-bold text-amber-500/90 block mt-0.5">
                            {finalResult[2].totalPoints || finalResult[2].points || 0} pts
                          </motion.span>
                        </div>
                        <div className="w-full h-28 md:h-32 rounded-t-2xl bg-gradient-to-t from-amber-950/60 to-amber-900/30 border-t border-x border-amber-800/40 flex flex-col items-center justify-end pb-3 shadow-lg">
                          <span className="text-xl font-black font-mono text-amber-600/90">3rd</span>
                        </div>
                      </motion.div>
                    )}
                  </div>
                ) : (
                  <div className="py-12 text-center text-slate-400 text-sm font-medium">No final results published yet.</div>
                )}
              </div>

              {/* Action Footer */}
              <div className="p-4 px-6 shrink-0 bg-slate-950/70 border-t border-slate-800/80 text-center">
                <button
                  onClick={closeFinalModal}
                  className="px-8 py-3 rounded-full font-extrabold text-xs bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 text-slate-950 shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
                >
                  Continue to Festival Site
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
