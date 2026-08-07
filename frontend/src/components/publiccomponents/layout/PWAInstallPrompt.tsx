import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DownloadOutlined, CloseOutlined, ShareAltOutlined, PlusSquareOutlined } from '@ant-design/icons';

export const PWAInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState<boolean>(false);
  const [isIOSDevice, setIsIOSDevice] = useState<boolean>(false);
  const [showIOSModal, setShowIOSModal] = useState<boolean>(false);

  useEffect(() => {
    // 1. Check if already running in standalone PWA app mode
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;

    if (isStandalone) {
      return;
    }

    // 2. Check if user dismissed prompt in this session
    const isDismissed = sessionStorage.getItem('pwa_prompt_dismissed');
    if (isDismissed) {
      return;
    }

    // 3. Detect iOS device
    const isIOS =
      /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

    setIsIOSDevice(isIOS);

    if (isIOS) {
      const timer = setTimeout(() => setShowPrompt(true), 2500);
      return () => clearTimeout(timer);
    }

    // 4. Listen for beforeinstallprompt event (Android / Chrome / Edge)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isIOSDevice) {
      setShowIOSModal(true);
      return;
    }

    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    sessionStorage.setItem('pwa_prompt_dismissed', 'true');
  };

  if (!showPrompt) return null;

  return (
    <>
      {/* Floating Bottom PWA Install Banner */}
      <AnimatePresence>
        {showPrompt && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
            className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-md pointer-events-auto"
          >
            <div className="bg-slate-900/95 text-white backdrop-blur-xl border border-slate-700/80 p-3.5 sm:p-4 rounded-2xl shadow-2xl flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src="/logo1.jpeg"
                  alt="Jeelani Fest App"
                  className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl object-cover border border-slate-700 shrink-0 shadow-md"
                />
                <div className="min-w-0">
                  <h4 className="font-extrabold text-xs sm:text-sm text-white truncate">
                    Install Jeelani Fest App
                  </h4>
                  <p className="text-[10px] sm:text-xs text-slate-300 line-clamp-1">
                    Add to home screen for fast access & live scores
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handleInstallClick}
                  className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-extrabold text-xs shadow-md flex items-center gap-1.5 transition-transform active:scale-95 cursor-pointer"
                >
                  <DownloadOutlined />
                  <span>Install</span>
                </button>
                <button
                  onClick={handleDismiss}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                  aria-label="Close"
                >
                  <CloseOutlined className="text-xs" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* iOS Instructions Modal */}
      {showIOSModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-slate-900 text-white border border-slate-800 p-6 rounded-3xl max-w-sm w-full shadow-2xl text-center"
          >
            <img src="/logo1.jpeg" alt="Logo" className="w-16 h-16 rounded-2xl mx-auto mb-4 border border-slate-700 shadow-md" />
            <h3 className="text-lg font-extrabold text-white mb-1">
              Install on iPhone / iPad
            </h3>
            <p className="text-xs text-slate-300 mb-5">
              Follow these simple steps in Safari or Chrome to add Jeelani Fest to your Home Screen:
            </p>

            <div className="space-y-3 text-left bg-slate-800/80 p-4 rounded-2xl border border-slate-700/60 mb-6 text-xs text-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold shrink-0">1</div>
                <span>Tap the <ShareAltOutlined className="text-sky-400 font-bold" /> <strong>Share</strong> button in browser toolbar</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold shrink-0">2</div>
                <span>Scroll & tap <PlusSquareOutlined className="text-emerald-400 font-bold" /> <strong>Add to Home Screen</strong></span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold shrink-0">3</div>
                <span>Tap <strong>Add</strong> at top-right corner</span>
              </div>
            </div>

            <button
              onClick={() => setShowIOSModal(false)}
              className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs cursor-pointer border border-slate-700"
            >
              Got it!
            </button>
          </motion.div>
        </div>
      )}
    </>
  );
};
