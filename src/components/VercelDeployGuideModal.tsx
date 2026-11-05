import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  GitBranch,
  Terminal,
  Copy,
  Check,
  ExternalLink,
  Cpu,
  Globe,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react';

interface VercelDeployGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VercelDeployGuideModal: React.FC<VercelDeployGuideModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [copiedCmd, setCopiedCmd] = useState(false);

  if (!isOpen) return null;

  const cliCmd = 'npx vercel --prod';

  const handleCopyCli = () => {
    navigator.clipboard?.writeText(cliCmd);
    setCopiedCmd(true);
    setTimeout(() => setCopiedCmd(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 dark:bg-black/85 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 md:p-6 animate-in fade-in duration-200">
      <div
        className="relative bg-white dark:bg-slate-900 rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto max-h-[92vh] flex flex-col text-slate-900 dark:text-slate-100 transition-colors duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Vercel iconic triangle mark */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-black text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white text-black flex items-center justify-center font-black shadow-md">
              <svg width="18" height="18" viewBox="0 0 76 65" fill="none">
                <path d="M38 0L76 65H0L38 0Z" fill="black" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-white">Vercel Auto-Deployment</h3>
                <span className="text-[10px] bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-extrabold px-2 py-0.2 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Ready
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Configured with <code className="text-white font-mono">vercel.json</code> for instant redeploys
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1 text-xs">
          {/* Status Box */}
          <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 rounded-xl flex items-start gap-3">
            <CheckCircle2 size={18} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-extrabold text-emerald-900 dark:text-emerald-200 block text-xs">
                Automatic Git-Push Deployment is Configured
              </span>
              <p className="text-[11px] text-emerald-800 dark:text-emerald-300/90 mt-0.5 leading-snug">
                Your repository has a root <code className="font-mono font-bold">vercel.json</code> file configured with Vite SPA routing, build command <code className="font-mono font-bold">npm run build</code>, and output directory <code className="font-mono font-bold">dist</code>.
              </p>
            </div>
          </div>

          {/* Deployment steps */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2.5">
              How Automatic Redeployment Works:
            </label>
            <div className="space-y-2.5">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/80 flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-slate-900 dark:bg-slate-700 text-white font-black text-xs flex items-center justify-center shrink-0">
                  1
                </span>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white">Push to GitHub or GitLab</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Any commit pushed to your <code className="font-mono font-semibold">main</code> branch automatically triggers a fresh production build on Vercel's global edge network.
                  </p>
                </div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/80 flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-slate-900 dark:bg-slate-700 text-white font-black text-xs flex items-center justify-center shrink-0">
                  2
                </span>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white">Automated Build & Cache</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Vercel runs <code className="font-mono">npm run build</code>, compiles Vite assets into <code className="font-mono">dist/</code>, and deploys without zero-downtime rollouts.
                  </p>
                </div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/80 flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-slate-900 dark:bg-slate-700 text-white font-black text-xs flex items-center justify-center shrink-0">
                  3
                </span>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white">Global Edge CDN & SSL</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Your marketplace app is served globally with automated SSL certificates, low-latency edge caching, and mobile responsiveness.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Direct CLI Deployment Option */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Or Deploy Directly via Vercel CLI:
            </label>
            <div className="flex items-center justify-between gap-2 p-3 bg-slate-900 text-white rounded-xl font-mono text-xs border border-slate-800">
              <span className="text-amber-400">{cliCmd}</span>
              <button
                type="button"
                onClick={handleCopyCli}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors flex items-center gap-1 cursor-pointer text-[11px]"
              >
                {copiedCmd ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                <span>{copiedCmd ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-2 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">
              Configuration: <code className="font-mono">vercel.json</code>
            </span>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white font-bold rounded-xl text-xs cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
