import React from 'react';
import { CATEGORIES } from '../data/categories';
import { CategoryId } from '../types/marketplace';
import { ShieldCheck, PhoneCall, Mail, MapPin } from 'lucide-react';

interface FooterProps {
  onSelectCategory: (catId: CategoryId) => void;
  onOpenSafety: () => void;
  onOpenPostAd: () => void;
  onOpenAuth?: (mode?: 'register' | 'signin') => void;
  onOpenCourierHub?: () => void;
  onOpenVercelDeployGuide?: () => void;
  onOpenVerifiedSubscription?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onSelectCategory,
  onOpenSafety,
  onOpenPostAd,
  onOpenAuth,
  onOpenCourierHub,
  onOpenVercelDeployGuide,
  onOpenVerifiedSubscription,
}) => {
  return (
    <footer className="bg-slate-950 text-slate-400 text-xs border-t border-slate-900 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-24 md:pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12 pb-12 border-b border-slate-800">
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
              <span>100% Verified Ghana Vendors & Doorstep Escrow Protection</span>
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
              Trade & Services
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

          {/* Quick links & Support */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
              Community & Safety
            </h4>
            <ul className="space-y-2">
              {onOpenCourierHub && (
                <li>
                  <button
                    onClick={onOpenCourierHub}
                    className="hover:text-amber-400 text-amber-400 font-bold transition-colors cursor-pointer flex items-center gap-1"
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
                    className="hover:text-emerald-400 text-emerald-400 font-bold transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <span>🇬🇭 Verified Badge (100 GHS/mo)</span>
                  </button>
                </li>
              )}
              {onOpenVercelDeployGuide && (
                <li>
                  <button
                    onClick={onOpenVercelDeployGuide}
                    className="hover:text-white text-slate-300 font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <span>▲ Vercel Auto-Deploy Ready</span>
                  </button>
                </li>
              )}
              <li>
                <button
                  onClick={onOpenSafety}
                  className="hover:text-amber-400 transition-colors cursor-pointer"
                >
                  Safe Trading Guide
                </button>
              </li>
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
                  Food & Agriculture
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
          <div className="flex items-center gap-6">
            <button onClick={onOpenSafety} className="hover:text-slate-300 transition-colors cursor-pointer">
              Terms & Safety
            </button>
            <button onClick={onOpenSafety} className="hover:text-slate-300 transition-colors cursor-pointer">
              Privacy Policy
            </button>
            <button onClick={onOpenSafety} className="hover:text-slate-300 transition-colors cursor-pointer">
              Fraud Reporting
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
