import React from 'react';
import { X, ShieldCheck, AlertTriangle, Eye, CheckCircle2, Lock } from 'lucide-react';

interface SafetyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SafetyModal: React.FC<SafetyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 dark:bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 md:p-6 animate-in fade-in duration-200">
      <div
        className="relative bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto max-h-[90vh] flex flex-col transition-colors duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/90 shrink-0">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-500" />
            <h3 className="text-base font-black text-slate-950 dark:text-white flex items-center gap-1.5">
              <span>OGYA (FIRE) Safe Trading Guide</span>
              <span>🔥</span>
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <div className="overflow-y-auto p-6 space-y-5 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 rounded-xl flex items-start gap-3">
            <Lock className="w-5 h-5 text-emerald-700 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-emerald-950 dark:text-emerald-300 text-sm mb-1">Our #1 Rule: Never Pay in Advance</h4>
              <p className="text-emerald-900 dark:text-emerald-300/90 text-xs sm:text-sm">
                Under no circumstances should you send mobile money deposits, shipping fees, or inspection retainers prior to physically seeing and testing the goods or vehicle.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 size={18} className="text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
              <div>
                <h5 className="font-bold text-slate-900 dark:text-slate-100 text-xs sm:text-sm mb-0.5">Meet in Populated, Public Places</h5>
                <p className="text-slate-600 dark:text-slate-400 text-xs">
                  Choose shopping malls, busy fuel service stations, police stations, or banking halls in broad daylight. If inspecting high-value items (smartphones, jewelry, laptops), never go to secluded or unknown alleys alone.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle2 size={18} className="text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
              <div>
                <h5 className="font-bold text-slate-900 dark:text-slate-100 text-xs sm:text-sm mb-0.5">Inspect & Verify Before Handing Over Money</h5>
                <p className="text-slate-600 dark:text-slate-400 text-xs">
                  For phones and tablets, check iCloud/Google lock status and test IMEI. For cars, confirm chassis numbers and verify ownership documents at the DVLA. For land/property, conduct an official search at the Lands Commission.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle2 size={18} className="text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
              <div>
                <h5 className="font-bold text-slate-900 dark:text-slate-100 text-xs sm:text-sm mb-0.5">Beware of Unrealistic Prices</h5>
                <p className="text-slate-600 dark:text-slate-400 text-xs">
                  If a brand new flagship phone or luxury vehicle is advertised at 80% below prevailing market value with claims that the seller is in a rush or travelling, exercise extreme caution.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle2 size={18} className="text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
              <div>
                <h5 className="font-bold text-slate-900 dark:text-slate-100 text-xs sm:text-sm mb-0.5">Protect Your Personal Banking PINs</h5>
                <p className="text-slate-600 dark:text-slate-400 text-xs">
                  OGYA (FIRE) 🔥 representatives will NEVER call you requesting your Mobile Money PIN, bank OTP, or personal account password.
                </p>
              </div>
            </div>

            {/* Strict Courier Security Directive */}
            <div className="flex items-start gap-3 p-3 bg-red-50/70 dark:bg-red-950/40 rounded-xl border border-red-200 dark:border-red-900/50">
              <Lock size={18} className="text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
              <div>
                <h5 className="font-bold text-red-900 dark:text-red-300 text-xs sm:text-sm mb-0.5">
                  Strict Door-to-Door Courier Protocol Across Ghana
                </h5>
                <p className="text-red-800 dark:text-red-300/90 text-xs leading-relaxed">
                  When ordering courier delivery: <strong>NEVER give your 4-digit release OTP to any dispatch rider or seller over a phone call or WhatsApp in advance.</strong> Inspect the parcel contents at your doorstep, verify the rider's ID and vehicle plate number, and only then provide your OTP.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2.5 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold rounded-xl text-xs cursor-pointer transition-colors border border-transparent dark:border-slate-700"
            >
              I Understand, Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
