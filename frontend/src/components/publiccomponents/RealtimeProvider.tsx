import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import confetti from 'canvas-confetti';
import { Modal, Tag, notification } from 'antd';
import { TrophyOutlined, StarFilled } from '@ant-design/icons';
import { motion } from 'framer-motion';

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
      triggerConfetti();
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
      triggerMassiveConfetti();
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#C9A063', '#0F4C3A', '#F2C879', '#6E2430'] // brand palette
    });
  };

  const triggerMassiveConfetti = () => {
    const duration = 5 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) {
        return clearInterval(interval);
      }
      const particleCount = 50 * (timeLeft / duration);
      confetti(Object.assign({}, defaults, {
        particleCount,
        origin: { x: Math.random(), y: Math.random() - 0.2 },
        colors: ['#C9A063', '#F2C879', '#0F4C3A', '#1A7A5E']
      }));
    }, 250);
  };

  return (
    <>
      {children}

      {/* Per-Program Result Modal */}
      <Modal
        open={resultVisible}
        footer={null}
        onCancel={() => setResultVisible(false)}
        centered
        width={500}
        styles={{ body: { padding: 0 } }}
        closable={false}
      >
        <div className="rounded-t-2xl p-6 text-center" style={{ background: 'linear-gradient(135deg, var(--emerald-deep), var(--emerald-muted))' }}>
          <TrophyOutlined className="text-5xl mb-2" style={{ color: 'var(--brass-gold)' }} />
          <h3 className="text-2xl font-bold m-0" style={{ fontFamily: 'var(--font-display)', color: 'var(--ivory-parchment)' }}>
            Results Announced!
          </h3>
          <p style={{ color: 'rgba(243, 236, 221, 0.6)' }}>{resultData?.competition?.name}</p>
        </div>
        <div className="p-6 max-h-[60vh] overflow-y-auto" style={{ background: 'var(--ink-navy)' }}>
          {resultData?.winners?.sort((a:any, b:any) => a.rank.localeCompare(b.rank)).map((w: any, idx: number) => (
            <div
              key={idx}
              className="mb-3 p-4 rounded-xl flex items-center justify-between"
              style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="text-lg font-bold w-12 text-center font-mono"
                  style={{
                    color: w.rank === '1st' ? 'var(--brass-gold)' : w.rank === '2nd' ? 'var(--ivory-parchment)' : '#E8A0AC'
                  }}
                >
                  {w.rank}
                </div>
                <div>
                  <div className="font-semibold text-base" style={{ fontFamily: 'var(--font-display)', color: 'var(--ivory-parchment)' }}>
                    {w.participant?.name}
                  </div>
                  <span className="text-xs uppercase" style={{ color: 'rgba(243, 236, 221, 0.35)' }}>{w.participantType}</span>
                </div>
              </div>
              <Tag style={{ background: 'rgba(26,122,94,0.15)', border: '1px solid rgba(26,122,94,0.25)', color: 'var(--emerald-light)' }}>
                +{w.pointsAwarded} pts
              </Tag>
            </div>
          ))}
          <div className="text-center mt-4">
            <button
              onClick={() => setResultVisible(false)}
              className="px-6 py-2.5 rounded-full font-medium transition-all"
              style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', color: 'var(--ivory-parchment)' }}
            >
              Close
            </button>
          </div>
        </div>
      </Modal>

      {/* Final Championship Modal */}
      <Modal
        open={finalVisible}
        footer={null}
        onCancel={() => setFinalVisible(false)}
        centered
        width={700}
        styles={{ body: { padding: 0 } }}
        closable={false}
      >
        <div className="p-10 text-center rounded-2xl shadow-2xl relative overflow-hidden" style={{ background: 'linear-gradient(135deg, var(--ink-navy), var(--ink-soft))' }}>
          {/* Decorative background star */}
          <StarFilled className="absolute -right-20 -top-20 text-9xl" style={{ color: 'rgba(201, 160, 99, 0.06)' }} />

          <TrophyOutlined className="text-7xl mb-4 animate-bounce" style={{ color: 'var(--brass-gold)' }} />
          <h2
            className="text-3xl md:text-4xl uppercase tracking-widest font-bold m-0"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--ivory-parchment)' }}
          >
            Champions of Jeelani Fest
          </h2>
          <p className="block mb-10 tracking-widest uppercase text-xs" style={{ color: 'rgba(243, 236, 221, 0.35)' }}>
            The Wait is Over
          </p>

          <div className="flex justify-center items-end gap-4 mb-10 h-48">
            {/* 2nd Place */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="w-1/3 flex flex-col items-center"
            >
              <div className="font-bold mb-2 text-lg truncate w-full px-2" style={{ color: 'var(--ivory-parchment)' }}>
                {finalData?.secondPlaceGroup?.name}
              </div>
              <div
                className="w-full h-32 rounded-t-lg flex flex-col items-center justify-end pb-4"
                style={{ background: 'linear-gradient(to top, rgba(243,236,221,0.08), rgba(243,236,221,0.15))' }}
              >
                <div className="text-3xl font-bold font-mono" style={{ color: 'var(--ivory-parchment)' }}>2nd</div>
              </div>
            </motion.div>

            {/* 1st Place */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              className="w-1/3 flex flex-col items-center z-10"
            >
              <div className="font-bold mb-2 text-2xl truncate w-full px-2" style={{ color: 'var(--brass-gold)' }}>
                {finalData?.firstPlaceGroup?.name}
              </div>
              <div
                className="w-full h-44 rounded-t-lg flex flex-col items-center justify-end pb-4"
                style={{
                  background: 'linear-gradient(to top, rgba(201,160,99,0.15), rgba(201,160,99,0.3))',
                  boxShadow: 'var(--shadow-glow-brass)',
                }}
              >
                <div className="text-5xl font-bold font-mono" style={{ color: 'var(--brass-gold)' }}>1st</div>
                <StarFilled style={{ color: 'var(--brass-gold)' }} className="mt-1" />
              </div>
            </motion.div>

            {/* 3rd Place */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="w-1/3 flex flex-col items-center"
            >
              <div className="font-bold mb-2 text-base truncate w-full px-2" style={{ color: '#E8A0AC' }}>
                {finalData?.thirdPlaceGroup?.name}
              </div>
              <div
                className="w-full h-24 rounded-t-lg flex flex-col items-center justify-end pb-4"
                style={{ background: 'linear-gradient(to top, rgba(110,36,48,0.15), rgba(110,36,48,0.25))' }}
              >
                <div className="text-2xl font-bold font-mono" style={{ color: '#E8A0AC' }}>3rd</div>
              </div>
            </motion.div>
          </div>

          <button
            onClick={() => setFinalVisible(false)}
            className="px-8 py-3 rounded-full font-medium transition backdrop-blur-sm"
            style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', color: 'var(--ivory-parchment)' }}
          >
            Continue to Site
          </button>
        </div>
      </Modal>
    </>
  );
};
