import React from 'react';
import { ArrowLeft, ShieldCheck, Lock, FileText, Scale } from 'lucide-react';
import { LegalDocumentContent, LegalPageId } from './LegalPagesModal';

interface LegalPageViewProps {
  page: LegalPageId;
  onSelectPage: (page: LegalPageId) => void;
  onNavigateHome: () => void;
}

const PAGE_LINKS: {
  id: LegalPageId;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}[] = [
  { id: 'privacy', label: 'Privacy Policy', icon: Lock },
  { id: 'terms', label: 'Terms of Service', icon: FileText },
  { id: 'escrow', label: 'Refund / Escrow Policy', icon: Scale },
  { id: 'safety', label: 'Safe Trading Guide', icon: ShieldCheck },
];

export const LegalPageView: React.FC<LegalPageViewProps> = ({
  page,
  onSelectPage,
  onNavigateHome,
}) => {
  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FA] dark:bg-[#0b0f19] text-slate-900 dark:text-slate-100">
      {/* Top Bar */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onNavigateHome}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 transition-colors cursor-pointer"
          >
            <ArrowLeft size={16} />
            <span>Back to Marketplace</span>
          </button>

          <button
            type="button"
            onClick={onNavigateHome}
            className="flex items-center gap-2 cursor-pointer"
          >
            <span className="bg-gradient-to-tr from-[#00875A] via-emerald-600 to-[#FF6600] text-white w-8 h-8 rounded-xl flex items-center justify-center font-black text-base shadow-sm">
              🔥
            </span>
            <span className="text-base sm:text-lg font-black tracking-tight text-slate-950 dark:text-white">
              OGYA <span className="text-[#FF6600] text-xs font-extrabold uppercase">FIRE</span>
            </span>
          </button>
        </div>

        {/* Legal Navigation Tabs */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-3 flex items-center gap-2 overflow-x-auto">
          {PAGE_LINKS.map((item) => {
            const Icon = item.icon;
            const active = page === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectPage(item.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                  active
                    ? 'bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950 shadow-xs'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white border border-slate-200 dark:border-slate-800'
                }`}
              >
                <Icon size={14} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Document Card */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-10 shadow-sm text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed space-y-6">
          <LegalDocumentContent activePage={page} onSelectPage={onSelectPage} />
        </div>
      </main>

      <footer className="border-t border-slate-200 dark:border-slate-800 py-6 text-center text-xs text-slate-500 dark:text-slate-400">
        © {new Date().getFullYear()} OGYA Accra, Ghana · Verified Ghana Vendors &amp; Doorstep Escrow Protection
      </footer>
    </div>
  );
};
