import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import confetti from 'canvas-confetti';
import { notification } from 'antd';
import { TrophyOutlined, StarFilled, CrownOutlined, RightOutlined, CloseOutlined } from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';
import apiClient from '../../services/apiClient';

export const RealtimeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {

  // Modals state
  const [resultVisible, setResultVisible] = useState(false);
  const [resultData, setResultData] = useState<any>(null);

  const [finalVisible, setFinalVisible] = useState(false);
  const [finalData, setFinalData] = useState<any>(null);

  useEffect(() => {
    // Determine websocket URL (strip /api if present)
    const backendUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3000';
    const newSocket = io(`${backendUrl}/realtime`, {
      transports: ['websocket'],
    });

    newSocket.on('connect', () => console.log('🟢 Realtime connected'));

    newSocket.on('result:published', (data: any) => {
      setResultData(data);
      setResultVisible(true);
      trigger10ConfettiPops();
      window.dispatchEvent(new CustomEvent('refresh-graphs'));
    });

    newSocket.on('program:status-changed', (comp: any) => {
      if (comp && comp.name) {
        notification.info({
          message: comp.status === 'started' ? '⚡ Live Event Alert' : '📢 Program Status Update',
          description: `${comp.name} ${comp.stage ? `is now LIVE on ${comp.stage.toUpperCase()}` : `status set to ${comp.status.toUpperCase()}`}`,
          placement: 'topRight',
          duration: 5,
        });
      }
    });

    newSocket.on('final:announced', (data: any) => {
      setFinalData(data);
      setFinalVisible(true);
    });

    // Fetch initial final announcement if published (welcoming user/admin on site load)
    apiClient.get('/public/results/final')
      .then(res => {
        if (res.data && res.data._id) {
          setFinalData(res.data);
          setFinalVisible(true);
        }
      })
      .catch(() => {});

    return () => {
      newSocket.disconnect();
    };
  }, []);

  // Continuous confetti pops for published result modal until closed
  useEffect(() => {
    if (!resultVisible) return;

    window.dispatchEvent(new CustomEvent('refresh-graphs'));

    // Continuous confetti interval while modal is open
    const interval = setInterval(() => {
      confetti({
        particleCount: 30,
        angle: Math.random() * 60 + 60,
        spread: 60,
        origin: { x: Math.random() * 0.8 + 0.1, y: Math.random() * 0.4 + 0.1 },
        colors: ['#0284C7', '#10B981', '#D97706', '#7C3AED', '#EC4899', '#F59E0B'],
        zIndex: 999999
      });
    }, 450);

    // Auto close timer after 25 seconds
    const timer = setTimeout(() => {
      setResultVisible(false);
    }, 25000);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [resultVisible]);

  // Continuous confetti pops one-by-one for final result modal until closed
  useEffect(() => {
    if (!finalVisible) return;

    window.dispatchEvent(new CustomEvent('refresh-graphs'));
    const interval = setInterval(() => {
      confetti({
        particleCount: 25,
        angle: Math.random() * 60 + 60,
        spread: 55,
        origin: { x: Math.random(), y: Math.random() * 0.5 },
        colors: ['#C9A063', '#F2C879', '#0F4C3A', '#0284C7', '#EAB308'],
        zIndex: 999999
      });
    }, 400);

    return () => clearInterval(interval);
  }, [finalVisible]);

  // Pop confetti 10 times in rapid sequence
  const trigger10ConfettiPops = () => {
    let count = 0;
    const interval = setInterval(() => {
      count++;
      confetti({
        particleCount: 40,
        spread: 60 + count * 5,
        origin: { x: Math.random() * 0.8 + 0.1, y: 0.6 },
        colors: ['#C9A063', '#0F4C3A', '#F2C879', '#0284C7', '#EAB308'],
        zIndex: 999999
      });
      if (count >= 10) {
        clearInterval(interval);
      }
    }, 300);
  };

  // Extract Event Info safely
  const compObj = typeof resultData?.competition === 'object' ? resultData?.competition : null;
  const eventName =
    compObj?.name ||
    resultData?.competitionName ||
    resultData?.competitionId?.name ||
    (typeof resultData?.competition === 'string' ? resultData?.competition : '') ||
    'Competition Event Result';

  const categoryMap: Record<string, string> = {
    subJunior: 'Sub Junior',
    junior: 'Junior',
    senior: 'Senior',
    general: 'General',
  };
  const eventCategory = compObj?.category ? (categoryMap[compObj.category] || compObj.category) : null;
  const eventType = compObj?.type === 'group' ? '👥 Group Event' : compObj?.type === 'individual' ? '👤 Individual Event' : null;
  const eventStage = compObj?.stage ? compObj.stage.toUpperCase() : null;

  return (
    <>
      {children}

      {/* ═══════════════════════════════════════════════════════════════
          REAL-TIME COMPETITION RESULT PUBLISHED MODAL (PREMIUM REDESIGN)
         ═══════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {resultVisible && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[99999] flex items-center justify-center p-4 md:p-6 overflow-hidden"
            style={{
              background: 'rgba(0, 0, 0, 0.45)',
              backdropFilter: 'blur(10px)',
            }}
            onClick={() => setResultVisible(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.88, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.88, y: 30 }}
              transition={{ type: 'spring', stiffness: 350, damping: 26 }}
              className="relative w-full max-w-lg my-auto max-h-[80vh] flex flex-col justify-between rounded-3xl overflow-hidden shadow-2xl border border-amber-400/40"
              style={{ background: 'linear-gradient(145deg, #0F172A 0%, #0B1120 60%, #070A14 100%)' }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Background Glow Orbs */}
              <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-amber-500/20 blur-3xl pointer-events-none" />
              <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none" />

              {/* Close Button */}
              <button
                onClick={() => setResultVisible(false)}
                className="absolute top-3.5 right-3.5 z-20 w-8 h-8 rounded-full bg-slate-800/80 border border-slate-700/80 text-slate-400 hover:text-white hover:bg-slate-700 flex items-center justify-center transition-all shadow-md"
                aria-label="Close Modal"
              >
                <CloseOutlined className="text-xs" />
              </button>

              {/* Modal Header */}
              <div className="relative pt-5 pb-4 px-5 text-center shrink-0 border-b border-slate-800/80">
                {/* Live Release Badge */}
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-amber-500/10 border border-amber-400/40 mb-2 shadow-inner">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-300">
                    ⚡ OFFICIAL RESULT RELEASED
                  </span>
                </div>

                {/* Trophy Icon */}
                <div className="my-1 flex justify-center">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400/20 via-amber-500/10 to-transparent border border-amber-400/30 flex items-center justify-center shadow-md shadow-amber-500/10">
                    <TrophyOutlined className="text-2xl text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.6)]" />
                  </div>
                </div>

                {/* Main Event Name Title - HIGH VISIBILITY & PREMIUM GRADIENT */}
                <h2 className="text-xl md:text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-300 to-yellow-100 leading-tight mt-2 mb-1.5 tracking-wide text-center drop-shadow-md" style={{ fontFamily: 'var(--font-display)' }}>
                  {eventName}
                </h2>

                {/* Event Tags (Category, Type, Stage) */}
                <div className="flex flex-wrap items-center justify-center gap-1.5 mt-1.5">
                  {eventCategory && (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-400/15 text-amber-300 border border-amber-400/30">
                      {eventCategory}
                    </span>
                  )}
                  {eventType && (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-sky-500/15 text-sky-300 border border-sky-500/30">
                      {eventType}
                    </span>
                  )}
                  {eventStage && (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                      STAGE: {eventStage}
                    </span>
                  )}
                </div>
              </div>

              {/* Modal Body - Winners List (Compact, no-scroll) */}
              <div className="p-4 md:p-5 flex-1 min-h-0 overflow-y-auto custom-scrollbar">
                <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
                  <span>🏆 OFFICIAL LEADERBOARD WINNERS</span>
                  <div className="h-[1px] flex-1 bg-slate-800" />
                </div>

                {resultData?.winners && resultData.winners.length > 0 ? (
                  <div className="space-y-2">
                    {resultData.winners
                      .slice()
                      .sort((a: any, b: any) => a.rank?.localeCompare(b.rank))
                      .map((w: any, idx: number) => {
                        const is1st = w.rank === '1st';
                        const is2nd = w.rank === '2nd';
                        const is3rd = w.rank === '3rd';

                        return (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.05 + idx * 0.05 }}
                            className={`p-2.5 px-3.5 rounded-xl flex items-center justify-between transition-all border ${
                              is1st
                                ? 'bg-gradient-to-r from-amber-950/50 via-slate-900/90 to-slate-900/90 border-amber-400/60 shadow-[0_0_15px_rgba(245,158,11,0.15)]'
                                : is2nd
                                ? 'bg-gradient-to-r from-slate-800/60 via-slate-900/90 to-slate-900/90 border-slate-400/40 shadow-[0_0_10px_rgba(226,232,240,0.08)]'
                                : is3rd
                                ? 'bg-gradient-to-r from-amber-900/30 via-slate-900/90 to-slate-900/90 border-amber-700/40 shadow-[0_0_10px_rgba(217,119,6,0.08)]'
                                : 'bg-slate-900/70 border-slate-800/80'
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              {/* Rank Badge */}
                              <div
                                className={`w-9 h-9 rounded-lg flex items-center justify-center font-extrabold text-xs shadow-md shrink-0 ${
                                  is1st
                                    ? 'bg-gradient-to-br from-amber-300 via-amber-400 to-yellow-600 text-slate-950 shadow-amber-500/30'
                                    : is2nd
                                    ? 'bg-gradient-to-br from-slate-100 via-slate-300 to-slate-400 text-slate-950 shadow-slate-400/20'
                                    : is3rd
                                    ? 'bg-gradient-to-br from-amber-600 via-amber-700 to-amber-900 text-amber-100 shadow-amber-700/20'
                                    : 'bg-slate-800 text-slate-300 border border-slate-700'
                                }`}
                              >
                                {is1st ? <CrownOutlined className="text-sm" /> : w.rank}
                              </div>

                              {/* Participant Info */}
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-1.5">
                                  <span className={`font-bold text-sm truncate ${is1st ? 'text-amber-200' : 'text-slate-100'}`} style={{ fontFamily: 'var(--font-display)' }}>
                                    {w.participant?.name || 'Winner'}
                                  </span>
                                  {w.grade && (
                                    <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                      {w.grade}
                                    </span>
                                  )}
                                </div>
                                <div className="text-[11px] text-slate-400 flex items-center gap-1.5 truncate mt-0.5">
                                  <span>{w.participantType === 'Group' ? '👥 Group' : '👤 Student'}</span>
                                  {w.participant?.groupName && (
                                    <>
                                      <span>•</span>
                                      <span className="text-amber-300/80 font-medium">{w.participant.groupName}</span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Points Badge */}
                            <div className="shrink-0 ml-2">
                              <span className="px-3 py-1 rounded-lg font-extrabold text-[11px] bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-sm inline-block">
                                +{w.pointsAwarded} pts
                              </span>
                            </div>
                          </motion.div>
                        );
                      })}
                  </div>
                ) : (
                  <div className="py-6 text-center text-slate-400 text-xs">No winners recorded for this event.</div>
                )}
              </div>

              {/* Modal Footer / Actions */}
              <div className="p-4 px-5 shrink-0 bg-slate-950/60 border-t border-slate-800/80 flex flex-col sm:flex-row items-center gap-2.5">
                <button
                  onClick={() => {
                    setResultVisible(false);
                    if (resultData?._id) {
                      window.location.href = `/results/${resultData._id}`;
                    } else {
                      window.location.href = '/results';
                    }
                  }}
                  className="w-full sm:flex-1 py-2.5 px-4 rounded-xl font-extrabold text-xs bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 text-slate-950 shadow-md shadow-amber-500/25 transition-all flex items-center justify-center gap-1.5 group cursor-pointer"
                >
                  <span>View Full Leaderboard & Poster</span>
                  <RightOutlined className="text-[10px] group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  onClick={() => setResultVisible(false)}
                  className="w-full sm:w-auto py-2.5 px-4 rounded-xl font-bold text-xs bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700/70 transition-all cursor-pointer"
                >
                  Dismiss
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════════════════════════════════════════════════════════════
          GRAND FINAL CHAMPIONSHIP ANNOUNCEMENT MODAL (PREMIUM REDESIGN)
         ═══════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {finalVisible && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100000] flex items-center justify-center p-4 md:p-6 overflow-hidden"
            style={{
              background: 'rgba(0, 0, 0, 0.45)',
              backdropFilter: 'blur(12px)',
            }}
            onClick={() => setFinalVisible(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.85, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.85, y: 40 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="relative w-full max-w-2xl my-auto max-h-[90vh] flex flex-col justify-between rounded-[2.5rem] overflow-hidden shadow-2xl border-2 border-amber-400/50"
              style={{ background: 'linear-gradient(145deg, #0F172A 0%, #0B1120 60%, #070A14 100%)' }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Decorative Ambient Radial Orbs */}
              <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-amber-500/20 blur-3xl pointer-events-none" />
              <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none" />

              {/* Close Button */}
              <button
                onClick={() => setFinalVisible(false)}
                className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-slate-800/80 border border-slate-700/80 text-slate-400 hover:text-white hover:bg-slate-700 flex items-center justify-center transition-all shadow-md"
                aria-label="Close Modal"
              >
                <CloseOutlined className="text-xs" />
              </button>

              {/* Header */}
              <div className="relative pt-6 pb-4 px-6 text-center shrink-0 border-b border-slate-800/80">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                  className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-amber-400/15 text-amber-300 border border-amber-400/30 text-[10px] font-black uppercase tracking-[0.25em] mb-2 shadow-inner"
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

              {/* Body: Podium Showcase (90vh height, spring stagger animations) */}
              <div className="p-6 md:p-8 flex-1 min-h-0 overflow-y-auto flex flex-col justify-center">
                {(() => {
                  const firstGroup = finalData?.firstPlaceGroup || (Array.isArray(finalData) ? finalData[0] : null);
                  const secondGroup = finalData?.secondPlaceGroup || (Array.isArray(finalData) ? finalData[1] : null);
                  const thirdGroup = finalData?.thirdPlaceGroup || (Array.isArray(finalData) ? finalData[2] : null);

                  return (
                    <div className="flex justify-center items-end gap-3 md:gap-5 max-w-xl mx-auto w-full">
                      {/* 2nd Place */}
                      <motion.div
                        initial={{ opacity: 0, y: 60, scale: 0.8 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ type: 'spring', stiffness: 240, damping: 20, delay: 0.5 }}
                        className="w-1/3 flex flex-col items-center"
                      >
                        <div className="text-center mb-2 px-1">
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-0.5">2nd Place</span>
                          <div className="font-bold text-sm md:text-base text-slate-200 truncate max-w-[110px]" style={{ fontFamily: 'var(--font-display)' }}>
                            {secondGroup?.name || '2nd Runner Up'}
                          </div>
                          {(secondGroup?.totalPoints || secondGroup?.points) && (
                            <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.9 }} className="text-[11px] font-mono font-bold text-sky-400 block mt-0.5">
                              {secondGroup?.totalPoints || secondGroup?.points} pts
                            </motion.span>
                          )}
                        </div>
                        <div className="w-full h-32 md:h-36 rounded-t-2xl bg-gradient-to-t from-slate-800/90 to-slate-700/50 border-t border-x border-slate-600/50 flex flex-col items-center justify-end pb-3 shadow-lg">
                          <span className="text-2xl font-black font-mono text-slate-300">2nd</span>
                        </div>
                      </motion.div>

                      {/* 1st Place (Gold Champion) */}
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
                            {firstGroup?.name || 'Grand Champion'}
                          </div>
                          {(firstGroup?.totalPoints || firstGroup?.points) && (
                            <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.8 }} className="text-xs font-mono font-extrabold text-amber-300 block mt-0.5">
                              {firstGroup?.totalPoints || firstGroup?.points} PTS
                            </motion.span>
                          )}
                        </div>
                        <div className="w-full h-40 md:h-48 rounded-t-2xl bg-gradient-to-t from-amber-950/90 via-amber-800/40 to-yellow-600/30 border-t-2 border-x border-amber-400/80 flex flex-col items-center justify-end pb-4 shadow-[0_0_30px_rgba(245,158,11,0.3)]">
                          <span className="text-4xl md:text-5xl font-black font-mono text-amber-300">1st</span>
                          <StarFilled className="text-amber-400 text-sm mt-1 animate-pulse" />
                        </div>
                      </motion.div>

                      {/* 3rd Place */}
                      <motion.div
                        initial={{ opacity: 0, y: 60, scale: 0.8 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ type: 'spring', stiffness: 240, damping: 20, delay: 0.7 }}
                        className="w-1/3 flex flex-col items-center"
                      >
                        <div className="text-center mb-2 px-1">
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-700/80 block mb-0.5">3rd Place</span>
                          <div className="font-bold text-sm text-slate-300 truncate max-w-[110px]" style={{ fontFamily: 'var(--font-display)' }}>
                            {thirdGroup?.name || '3rd Runner Up'}
                          </div>
                          {(thirdGroup?.totalPoints || thirdGroup?.points) && (
                            <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1 }} className="text-[11px] font-mono font-bold text-amber-500/90 block mt-0.5">
                              {thirdGroup?.totalPoints || thirdGroup?.points} pts
                            </motion.span>
                          )}
                        </div>
                        <div className="w-full h-28 md:h-32 rounded-t-2xl bg-gradient-to-t from-amber-950/60 to-amber-900/30 border-t border-x border-amber-800/40 flex flex-col items-center justify-end pb-3 shadow-lg">
                          <span className="text-xl font-black font-mono text-amber-600/90">3rd</span>
                        </div>
                      </motion.div>
                    </div>
                  );
                })()}
              </div>

              {/* Action Footer */}
              <div className="p-4 px-6 shrink-0 bg-slate-950/70 border-t border-slate-800/80 text-center">
                <button
                  onClick={() => setFinalVisible(false)}
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
