import React, { useState } from 'react';
import { Download, Share, X, Smartphone } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

const INSTALL_DISMISSED_KEY = 'ogya_fire_install_dismissed';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled) {
    return null;
  }

  if (isInstallable) {
    return (
      <button
        type="button"
        onClick={install}
        className="flex items-center gap-1.5 rounded-xl bg-[#FF6600] hover:bg-orange-600 px-3 py-1.5 text-xs font-black text-white shadow-xs transition-all cursor-pointer shrink-0"
        title="Install OGYA (FIRE) App"
      >
        <Download size={14} />
        <span>Install OGYA (FIRE)</span>
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          type="button"
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-1.5 rounded-xl border border-orange-500/40 bg-orange-500/10 hover:bg-orange-500/20 px-2.5 py-1.5 text-xs font-bold text-[#FF6600] transition-colors cursor-pointer shrink-0"
          title="Install OGYA (FIRE) on iPhone or iPad"
        >
          <Smartphone size={14} />
          <span>Install App</span>
        </button>

        {showIOSGuide && (
          <IOSInstallModal onClose={() => setShowIOSGuide(false)} />
        )}
      </>
    );
  }

  return null;
};

export const PWAInstallBanner: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [dismissed, setDismissed] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    try {
      return localStorage.getItem(INSTALL_DISMISSED_KEY) === '1';
    } catch {
      return false;
    }
  });

  if (isInstalled || dismissed || (!isInstallable && !isIOS)) {
    return null;
  }

  const handleDismiss = () => {
    setDismissed(true);
    try {
      localStorage.setItem(INSTALL_DISMISSED_KEY, '1');
    } catch {
      // ignore
    }
  };

  return (
    <>
      <div className="fixed bottom-20 md:bottom-5 left-3 right-3 sm:left-auto sm:right-5 sm:max-w-sm z-40 bg-slate-950 text-white border border-[#FF6600]/60 rounded-2xl p-3.5 shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom-4 duration-200">
        <div className="w-11 h-11 rounded-xl overflow-hidden flex items-center justify-center shrink-0 shadow-md bg-[#FF6B00]">
          <img
            src="/assets/aistudio/OGYA_SPECIAL_11_d4fab9c1.webp"
            alt="OGYA (FIRE) App Icon"
            className="w-full h-full object-cover scale-[1.06]"
          />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-xs font-black text-white leading-tight">
            Install OGYA (FIRE)
          </p>
          <p className="text-[11px] text-slate-300 mt-0.5 leading-snug">
            Add OGYA (FIRE) to your home screen for instant Ghana Marketplace access.
          </p>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => {
              if (isInstallable) {
                void install();
              } else if (isIOS) {
                setShowIOSGuide(true);
              }
            }}
            className="px-3 py-2 rounded-xl bg-[#FF6600] hover:bg-orange-600 text-white font-black text-xs cursor-pointer transition-colors"
          >
            Install
          </button>
          <button
            type="button"
            onClick={handleDismiss}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
            aria-label="Dismiss OGYA (FIRE) install prompt"
          >
            <X size={15} />
          </button>
        </div>
      </div>

      {showIOSGuide && <IOSInstallModal onClose={() => setShowIOSGuide(false)} />}
    </>
  );
};

const IOSInstallModal: React.FC<{ onClose: () => void }> = ({ onClose }) => (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-xs p-4"
    onClick={onClose}
  >
    <div
      className="w-full max-w-sm rounded-2xl bg-slate-900 text-white border border-slate-800 p-6 shadow-2xl space-y-4"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center shrink-0 bg-[#FF6B00]">
          <img
            src="/assets/aistudio/OGYA_SPECIAL_11_d4fab9c1.webp"
            alt="OGYA (FIRE) App Icon"
            className="w-full h-full object-cover scale-[1.06]"
          />
        </div>
        <div>
          <h3 className="text-base font-black text-white">
            Install OGYA (FIRE)
          </h3>
          <p className="text-[11px] text-amber-400 font-bold">
            Add to iPhone / iPad Home Screen
          </p>
        </div>
      </div>

      <ol className="space-y-2 text-xs text-slate-300 leading-relaxed">
        <li className="flex items-center gap-2">
          <span className="w-5 h-5 rounded-full bg-slate-800 text-[#FF6600] font-black flex items-center justify-center shrink-0">
            1
          </span>
          <span>
            Tap the <strong className="text-white inline-flex items-center gap-1"><Share size={12} /> Share</strong> button in Safari&apos;s toolbar.
          </span>
        </li>
        <li className="flex items-center gap-2">
          <span className="w-5 h-5 rounded-full bg-slate-800 text-[#FF6600] font-black flex items-center justify-center shrink-0">
            2
          </span>
          <span>
            Scroll down and tap <strong className="text-white">Add to Home Screen</strong> to install <strong className="text-white">OGYA (FIRE)</strong>.
          </span>
        </li>
      </ol>

      <button
        type="button"
        onClick={onClose}
        className="w-full rounded-xl bg-[#FF6600] hover:bg-orange-600 py-2.5 text-xs font-black text-white cursor-pointer transition-colors"
      >
        Got it
      </button>
    </div>
  </div>
);
