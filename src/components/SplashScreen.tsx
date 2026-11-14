import React, { useEffect, useState } from 'react';

const SPLASH_SEEN_KEY = 'ogya_fire_splash_shown';

export const SplashScreen: React.FC = () => {
  const [visible, setVisible] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    try {
      return !sessionStorage.getItem(SPLASH_SEEN_KEY);
    } catch {
      return false;
    }
  });
  const [fading, setFading] = useState(false);

  useEffect(() => {
    if (!visible) return;
    try {
      sessionStorage.setItem(SPLASH_SEEN_KEY, '1');
    } catch {
      // ignore storage errors
    }

    const fadeTimer = setTimeout(() => setFading(true), 550);
    const hideTimer = setTimeout(() => setVisible(false), 850);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
    };
  }, [visible]);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] bg-[#0b0f19] flex flex-col items-center justify-center p-6 transition-opacity duration-300 ${
        fading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      aria-label="OGYA (FIRE) Splash Screen"
    >
      <div className="flex flex-col items-center text-center space-y-4">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-orange-600 via-[#FF6600] to-amber-400 flex items-center justify-center shadow-2xl shadow-orange-600/30 border border-orange-400/40 animate-pulse">
          <span className="text-4xl" role="img" aria-label="OGYA (FIRE) Flame Logo">
            🔥
          </span>
        </div>

        <div className="space-y-1">
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            OGYA <span className="text-[#FF6600]">(FIRE)</span>
          </h1>
          <p className="text-xs sm:text-sm font-bold uppercase tracking-widest text-amber-400">
            Ghana Marketplace
          </p>
        </div>

        <div className="w-28 h-1 rounded-full bg-slate-800 overflow-hidden mt-2">
          <div className="h-full w-2/3 bg-gradient-to-r from-[#FF6600] to-amber-400 rounded-full animate-pulse" />
        </div>
      </div>
    </div>
  );
};
