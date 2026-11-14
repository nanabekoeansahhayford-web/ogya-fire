import React from 'react';
import { CATEGORIES } from '../data/categories';
import { CategoryId } from '../types/marketplace';
import { ShieldCheck, MapPin, Lock } from 'lucide-react';
import { LegalPageId } from './LegalPagesModal';

interface FooterProps {
  onSelectCategory: (catId: CategoryId) => void;
  onOpenSafety: () => void;
  onOpenLegalPage?: (page: LegalPageId) => void;
  onOpenPostAd: () => void;
  onOpenAuth?: (mode?: 'register' | 'signin') => void;
  onOpenCourierHub?: () => void;
  onOpenVerifiedSubscription?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onSelectCategory,
  onOpenSafety,
  onOpenLegalPage,
  onOpenPostAd,
  onOpenAuth,
  onOpenCourierHub,
  onOpenVerifiedSubscription,
}) => {
  const openLegal = (page: LegalPageId) => {
    if (onOpenLegalPage) {
      onOpenLegalPage(page);
    } else if (page === 'safety') {
      onOpenSafety();
    }
  };

  return (
    <footer className="bg-slate-950 text-slate-400 text-xs border-t border-slate-900 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-24 md:pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 lg:gap-10 pb-12 border-b border-slate-800">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <span className="bg-gradient-to-tr from-[#00875A] via-emerald-600 to-[#FF6600] text-white w-9 h-9 rounded-xl flex items-center justify-center font-black text-base shadow-sm">
                🔥
              </span>
              <span className="text-xl font-black text-white tracking-tight flex items-center gap-1.5">
                <span>OGYA</span>
                <span className="text-[#FF6600] text-xs font-extrabold uppercase">(FIRE)</span>
                <span>🔥</span>
              </span>
            </div>
            <div className="text-white font-extrabold text-sm flex items-center gap-1.5">
              <MapPin size={15} className="text-[#00875A]" />
              <span>OGYA Accra, Ghana</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
              OGYA Accra, Ghana is the premier multi-vendor commerce hub connecting buyers directly with verified merchants in Accra and across Ghana. Fast 1–2 hour doorstep delivery and protected Mobile Money payments.
            </p>
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs pt-1">
              <ShieldCheck size={16} className="text-[#00875A]" />
              <span>Verified Ghana Vendors &amp; Doorstep Escrow Protection</span>
            </div>

            {/* Short Escrow Explanation */}
            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 max-w-md space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <Lock size={12} />
                  <span>How OGYA Escrow Works</span>
                </span>
                <button
                  type="button"
                  onClick={() => openLegal('escrow')}
                  className="text-[11px] font-bold text-emerald-400 hover:underline cursor-pointer"
                >
                  Full Policy →
                </button>
              </div>
              <ul className="space-y-1 text-[11px] text-slate-300 leading-relaxed">
                <li>
                  <strong className="text-white">Who holds payment:</strong> Buyer pays via MoMo to OGYA; OGYA holds the money securely—never sent to the seller upfront.
                </li>
                <li>
                  <strong className="text-white">When seller gets paid:</strong> Released only after buyer inspects &amp; confirms receipt (or 24h after courier delivery if undisputed).
                </li>
                <li>
                  <strong className="text-white">How buyer gets refund:</strong> Do not confirm receipt; tap Report / Dispute within 24 hours with photo/video proof (reviewed in 48 hours).
                </li>
              </ul>
            </div>
          </div>

          {/* Core Categories Col 1 */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
              Popular Sectors
            </h4>
            <ul className="space-y-2">
              {CATEGORIES.slice(0, 6).map((cat) => (
                <li key={cat.id}>
                  <button
                    onClick={() => onSelectCategory(cat.id)}
                    className="hover:text-amber-400 transition-colors cursor-pointer text-left"
                  >
                    {cat.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Core Categories Col 2 */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
              Trade &amp; Services
            </h4>
            <ul className="space-y-2">
              {CATEGORIES.slice(6, 12).map((cat) => (
                <li key={cat.id}>
                  <button
                    onClick={() => onSelectCategory(cat.id)}
                    className="hover:text-amber-400 transition-colors cursor-pointer text-left"
                  >
                    {cat.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* LEGAL Column */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
              LEGAL
            </h4>
            <ul className="space-y-2">
              <li>
                <button
                  type="button"
                  onClick={() => openLegal('privacy')}
                  className="hover:text-amber-400 transition-colors cursor-pointer text-left"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => openLegal('terms')}
                  className="hover:text-amber-400 transition-colors cursor-pointer text-left"
                >
                  Terms of Service
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => openLegal('escrow')}
                  className="hover:text-amber-400 transition-colors cursor-pointer text-left"
                >
                  Refund / Escrow Policy
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => openLegal('safety')}
                  className="hover:text-amber-400 transition-colors cursor-pointer text-left"
                >
                  Safe Trading Guide
                </button>
              </li>
            </ul>
          </div>

          {/* Community & Marketplace */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
              Community &amp; Safety
            </h4>
            <ul className="space-y-2">
              {onOpenCourierHub && (
                <li>
                  <button
                    onClick={onOpenCourierHub}
                    className="hover:text-amber-400 text-amber-400 font-bold transition-colors cursor-pointer flex items-center gap-1 text-left"
                  >
                    <span>🚚 Door-to-Door Courier Ghana</span>
                  </button>
                </li>
              )}
              {onOpenAuth && (
                <>
                  <li>
                    <button
                      onClick={() => onOpenAuth('register')}
                      className="hover:text-amber-400 text-amber-500 font-bold transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <span>🔥 Register Free Account</span>
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => onOpenAuth('signin')}
                      className="hover:text-amber-400 transition-colors cursor-pointer"
                    >
                      Member Sign In
                    </button>
                  </li>
                </>
              )}
              {onOpenVerifiedSubscription && (
                <li>
                  <button
                    onClick={onOpenVerifiedSubscription}
                    className="hover:text-emerald-400 text-emerald-400 font-bold transition-colors cursor-pointer flex items-center gap-1 text-left"
                  >
                    <span>🇬🇭 Verified Badge (100 GHS/mo)</span>
                  </button>
                </li>
              )}
              <li>
                <button
                  onClick={onOpenPostAd}
                  className="hover:text-amber-400 transition-colors cursor-pointer"
                >
                  + Post Free Ad
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectCategory('seeking-work-cvs')}
                  className="hover:text-amber-400 transition-colors cursor-pointer"
                >
                  Seeking Work - CVs
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectCategory('jobs')}
                  className="hover:text-amber-400 transition-colors cursor-pointer"
                >
                  Post or Find Jobs
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectCategory('food-agriculture')}
                  className="hover:text-amber-400 transition-colors cursor-pointer"
                >
                  Food &amp; Agriculture
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500 text-xs">
          <div className="font-semibold text-slate-400">
            © {new Date().getFullYear()} OGYA Accra, Ghana. All rights reserved.
          </div>
          <div className="flex flex-wrap items-center justify-center gap-5">
            <button onClick={() => openLegal('privacy')} className="hover:text-slate-300 transition-colors cursor-pointer">
              Privacy Policy
            </button>
            <button onClick={() => openLegal('terms')} className="hover:text-slate-300 transition-colors cursor-pointer">
              Terms of Service
            </button>
            <button onClick={() => openLegal('escrow')} className="hover:text-slate-300 transition-colors cursor-pointer">
              Refund / Escrow Policy
            </button>
            <button onClick={() => openLegal('safety')} className="hover:text-slate-300 transition-colors cursor-pointer">
              Safe Trading Guide
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
