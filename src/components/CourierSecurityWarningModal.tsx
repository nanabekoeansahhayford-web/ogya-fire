import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Lock,
  UserCheck,
  PackageSearch,
  CreditCard,
  X,
  ArrowRight,
  Eye,
  FileCheck2,
} from 'lucide-react';

interface CourierSecurityWarningModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmSecurity: () => void;
  itemTitle?: string;
}

export const CourierSecurityWarningModal: React.FC<CourierSecurityWarningModalProps> = ({
  isOpen,
  onClose,
  onConfirmSecurity,
  itemTitle,
}) => {
  const [agreedOtp, setAgreedOtp] = useState(false);
  const [agreedRiderBadge, setAgreedRiderBadge] = useState(false);
  const [agreedEscrow, setAgreedEscrow] = useState(false);
  const [agreedInspection, setAgreedInspection] = useState(false);

  if (!isOpen) return null;

  const allAgreed = agreedOtp && agreedRiderBadge && agreedEscrow && agreedInspection;

  const handleProceed = () => {
    if (!allAgreed) return;
    onConfirmSecurity();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 md:p-6 animate-in fade-in duration-200">
      <div
        className="relative bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full shadow-2xl border-2 border-red-500/80 dark:border-red-500/60 overflow-hidden my-auto max-h-[92vh] flex flex-col text-slate-900 dark:text-slate-100 transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Security Alert Header */}
        <div className="bg-gradient-to-r from-red-600 via-amber-600 to-red-600 text-white px-6 py-4.5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0 border border-white/30 shadow-xs">
              <ShieldAlert size={24} className="text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-black tracking-wider uppercase bg-white/20 px-2 py-0.5 rounded text-white">
                  Strict Security Mandate
                </span>
                <span className="text-xs text-amber-200 font-semibold hidden sm:inline">
                  Ghana Postal & Cyber Safety Compliance
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black tracking-tight text-white mt-0.5">
                Mandatory Courier Security & Anti-Fraud Advisory
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
            aria-label="Cancel"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto p-5 sm:p-6 space-y-5 text-xs sm:text-sm">
          {itemTitle && (
            <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl flex items-center gap-2.5">
              <PackageSearch size={18} className="text-amber-600 dark:text-amber-400 shrink-0" />
              <div className="min-w-0">
                <span className="text-[11px] font-bold text-amber-900 dark:text-amber-300 block uppercase">
                  Shipment In Order:
                </span>
                <p className="font-extrabold text-slate-900 dark:text-slate-100 truncate text-xs sm:text-sm">
                  {itemTitle}
                </p>
              </div>
            </div>
          )}

          {/* Warning Message Notice */}
          <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-xl p-4 text-red-950 dark:text-red-200 space-y-2">
            <div className="flex items-center gap-2 font-black text-red-700 dark:text-red-400 text-sm uppercase tracking-wide">
              <AlertTriangle size={17} className="shrink-0" />
              <span>Please read carefully before ordering delivery</span>
            </div>
            <p className="text-xs leading-relaxed text-red-900 dark:text-red-200/90 font-medium">
              To eradicate courier impersonation, parcel theft, and fraudulent advance payments across Ghana, OGYA enforces a zero-tolerance secure delivery protocol. You must read and agree to each condition below to unlock dispatch.
            </p>
          </div>

          {/* 4 Strict Security Directives */}
          <div className="space-y-3">
            {/* Directive 1 */}
            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800 flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0 mt-0.5">
                <Lock size={17} />
              </div>
              <div className="space-y-1 min-w-0">
                <h4 className="font-extrabold text-slate-900 dark:text-slate-100 text-xs sm:text-sm">
                  1. Never Disclose Your 4-Digit Release OTP Over Phone or WhatsApp
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Your delivery comes with a unique 4-digit code. <strong>NEVER give this code to the rider or seller over a phone call</strong> before the rider arrives and places the package into your hands. Releasing the OTP authorises payout immediately.
                </p>
              </div>
            </div>

            {/* Directive 2 */}
            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800 flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                <UserCheck size={17} />
              </div>
              <div className="space-y-1 min-w-0">
                <h4 className="font-extrabold text-slate-900 dark:text-slate-100 text-xs sm:text-sm">
                  2. Verify Rider ID Badge & Vehicle Plate Number at Doorstep
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  All authorized OGYA riders wear official high-visibility branded gear and carry a registered digital ID badge. Check that their motorbike or van number plate matches the plate shown in your app tracking receipt before handing over or accepting parcels.
                </p>
              </div>
            </div>

            {/* Directive 3 */}
            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800 flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                <Eye size={17} />
              </div>
              <div className="space-y-1 min-w-0">
                <h4 className="font-extrabold text-slate-900 dark:text-slate-100 text-xs sm:text-sm">
                  3. Doorstep Inspection Rights Before Handover
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Recipients have the full legal right to inspect package contents in the courier’s presence. Verify device IMEI, serial numbers, seal integrity, and condition. If the item is defective or does not match description, you may refuse delivery and trigger an immediate escrow refund.
                </p>
              </div>
            </div>

            {/* Directive 4 */}
            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800 flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                <CreditCard size={17} />
              </div>
              <div className="space-y-1 min-w-0">
                <h4 className="font-extrabold text-slate-900 dark:text-slate-100 text-xs sm:text-sm">
                  4. Secure Escrow Guarantee — No Unverified Personal MoMo Transfers
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Never transfer direct Mobile Money to personal numbers without OGYA Escrow protection. Funds are held in a regulated escrow account until both buyer and rider confirm authentic delivery.
                </p>
              </div>
            </div>
          </div>

          {/* Mandatory Checkboxes */}
          <div className="p-4 bg-slate-100 dark:bg-slate-950/80 rounded-xl border border-slate-300 dark:border-slate-700/80 space-y-3">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <FileCheck2 size={15} className="text-red-500" />
              <span>Mandatory Confirmation Checklist (Check All 4 to Proceed):</span>
            </h4>

            <label className="flex items-start gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={agreedOtp}
                onChange={(e) => setAgreedOtp(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded text-red-600 focus:ring-red-500 border-slate-300 dark:border-slate-700 cursor-pointer shrink-0"
              />
              <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                I will <strong>never</strong> give my 4-digit security OTP to any rider or seller over a phone call or WhatsApp before physical door delivery.
              </span>
            </label>

            <label className="flex items-start gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={agreedRiderBadge}
                onChange={(e) => setAgreedRiderBadge(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded text-red-600 focus:ring-red-500 border-slate-300 dark:border-slate-700 cursor-pointer shrink-0"
              />
              <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                I will verify the rider's official OGYA ID badge and motorcycle/vehicle number plate against the app receipt before taking or handing over the package.
              </span>
            </label>

            <label className="flex items-start gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={agreedInspection}
                onChange={(e) => setAgreedInspection(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded text-red-600 focus:ring-red-500 border-slate-300 dark:border-slate-700 cursor-pointer shrink-0"
              />
              <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                I understand I have the right to inspect package contents at my doorstep before releasing delivery approval.
              </span>
            </label>

            <label className="flex items-start gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={agreedEscrow}
                onChange={(e) => setAgreedEscrow(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded text-red-600 focus:ring-red-500 border-slate-300 dark:border-slate-700 cursor-pointer shrink-0"
              />
              <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                I agree to pay only via OGYA Safe Escrow or Verified Courier COD, and confirm this shipment contains zero illegal contraband.
              </span>
            </label>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/80 flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Cancel / Back
          </button>

          <button
            type="button"
            onClick={handleProceed}
            disabled={!allAgreed}
            className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold flex items-center gap-2 transition-all cursor-pointer shadow-md ${
              allAgreed
                ? 'bg-gradient-to-r from-red-600 via-amber-600 to-orange-500 hover:opacity-95 text-white active:scale-98'
                : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed shadow-none'
            }`}
          >
            <ShieldCheck size={16} />
            <span>I Accept Security Directives & Proceed</span>
            <ArrowRight size={15} />
          </button>
        </div>
      </div>
    </div>
  );
};
