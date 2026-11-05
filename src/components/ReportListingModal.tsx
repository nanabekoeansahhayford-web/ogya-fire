import React, { useState, useEffect } from 'react';
import {
  X,
  Flag,
  AlertTriangle,
  ShieldAlert,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Ban,
  Clock,
  DollarSign,
  Trash2,
} from 'lucide-react';
import { Listing } from '../types/marketplace';
import { saveListingReport, deleteListingReport, AdReportRecord, formatPrice } from '../utils/storage';

export interface ReportReasonOption {
  id: string;
  name: string; // Short recognizable label: 'Spam', 'Scam', 'Sold', etc.
  title: string;
  description: string;
  badge: string;
  colorClass: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

export const REPORT_REASONS: ReportReasonOption[] = [
  {
    id: 'scam',
    name: 'Scam',
    title: 'Scam, Fraud, or Suspicious Seller',
    description: 'Seller requests advance deposit/mobile money before inspection, or appears to be a scammer.',
    badge: 'Scam',
    colorClass: 'text-red-600 bg-red-50 dark:bg-red-950/60 border-red-200 dark:border-red-900',
    icon: ShieldAlert,
  },
  {
    id: 'spam',
    name: 'Spam',
    title: 'Spam, Duplicate, or Misleading Ad',
    description: 'Duplicate listings, irrelevant advertising, misleading title, or posted in wrong category.',
    badge: 'Spam',
    colorClass: 'text-amber-600 bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-900',
    icon: Flag,
  },
  {
    id: 'sold',
    name: 'Sold',
    title: 'Item Already Sold or Unavailable',
    description: 'The item or property has already been sold, rented out, or is no longer available.',
    badge: 'Sold',
    colorClass: 'text-sky-600 bg-sky-50 dark:bg-sky-950/60 border-sky-200 dark:border-sky-900',
    icon: CheckCircle2,
  },
  {
    id: 'counterfeit',
    name: 'Counterfeit',
    title: 'Counterfeit, Fake, or Prohibited Goods',
    description: 'Fake brand replicas, stolen property, illegal items, or prohibited substances.',
    badge: 'Prohibited',
    colorClass: 'text-purple-600 bg-purple-50 dark:bg-purple-950/60 border-purple-200 dark:border-purple-900',
    icon: Ban,
  },
  {
    id: 'wrong_price',
    name: 'Wrong Price',
    title: 'Deceptive Price or Fake Location',
    description: 'Actual price is significantly higher than advertised or item is in a different city.',
    badge: 'Pricing',
    colorClass: 'text-blue-600 bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-900',
    icon: DollarSign,
  },
  {
    id: 'inappropriate',
    name: 'Inappropriate',
    title: 'Inappropriate Photos or Abusive Content',
    description: 'Offensive images, harassment, adult content, or abusive communication from seller.',
    badge: 'Safety',
    colorClass: 'text-rose-600 bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-900',
    icon: AlertCircle,
  },
];

interface ReportListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  listing: Listing;
  onReportSuccess: (report: AdReportRecord) => void;
  onReportWithdraw?: (listingId: string) => void;
  existingReport?: AdReportRecord;
}

export const ReportListingModal: React.FC<ReportListingModalProps> = ({
  isOpen,
  onClose,
  listing,
  onReportSuccess,
  onReportWithdraw,
  existingReport,
}) => {
  const [selectedReasonId, setSelectedReasonId] = useState<string>('scam');
  const [additionalDetails, setAdditionalDetails] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [ticketId, setTicketId] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      if (existingReport) {
        const found = REPORT_REASONS.find((r) => r.title === existingReport.reason);
        if (found) {
          setSelectedReasonId(found.id);
        }
        setAdditionalDetails(existingReport.details || '');
        setTicketId(existingReport.referenceId);
      } else {
        setSelectedReasonId('scam');
        setAdditionalDetails('');
        setIsSubmitted(false);
        setTicketId('');
      }
    }
  }, [isOpen, existingReport]);

  if (!isOpen) return null;

  const currentReason = REPORT_REASONS.find((r) => r.id === selectedReasonId) || REPORT_REASONS[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const generatedTicket = existingReport?.referenceId || `REP-${Math.floor(100000 + Math.random() * 900000)}`;
    setTicketId(generatedTicket);

    const reportRecord: AdReportRecord = {
      listingId: listing.id,
      reason: currentReason.title,
      details: additionalDetails.trim() || undefined,
      reportedAt: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      referenceId: generatedTicket,
    };

    setTimeout(() => {
      saveListingReport(reportRecord);
      setIsSubmitting(false);
      setIsSubmitted(true);
      onReportSuccess(reportRecord);
    }, 450);
  };

  const handleWithdraw = () => {
    deleteListingReport(listing.id);
    onReportWithdraw?.(listing.id);
    onClose();
  };

  const handleClose = () => {
    setIsSubmitted(false);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-60 overflow-y-auto bg-slate-950/80 dark:bg-black/85 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 md:p-6 animate-in fade-in duration-200"
      onClick={handleClose}
    >
      <div
        className="relative bg-white dark:bg-slate-900 rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto max-h-[92vh] flex flex-col text-slate-900 dark:text-slate-100 transition-colors duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/90 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-red-500/10 dark:bg-red-500/20 text-red-600 dark:text-red-400 flex items-center justify-center font-bold border border-red-200 dark:border-red-900/50">
              <Flag size={16} />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-slate-950 dark:text-white leading-tight">
                {isSubmitted ? 'Report Submitted' : existingReport ? 'Reported Listing Details' : 'Report Ad'}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {isSubmitted
                  ? 'Thank you for helping keep OGYA safe'
                  : 'Select a reason for reporting this suspicious listing'}
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto p-5 sm:p-6 space-y-4 flex-1">
          {/* Ad Summary Capsule */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-3 text-xs">
            <div className="min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                Target Listing
              </span>
              <p className="font-extrabold text-slate-900 dark:text-white truncate">
                {listing.title}
              </p>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                {formatPrice(listing.price, listing.currency)} · Seller:{' '}
                <strong className="text-slate-700 dark:text-slate-300">{listing.seller.name}</strong>
              </span>
            </div>
            {listing.images && listing.images.length > 0 && (
              <img
                src={listing.images[0]}
                alt={listing.title}
                className="w-12 h-12 rounded-lg object-cover border border-slate-200 dark:border-slate-700 shrink-0"
              />
            )}
          </div>

          {/* SUCCESS SCREEN */}
          {isSubmitted ? (
            <div className="py-4 text-center space-y-4 animate-in fade-in zoom-in-95 duration-200">
              <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center mx-auto shadow-xs border border-emerald-300 dark:border-emerald-800">
                <CheckCircle2 size={30} />
              </div>

              <div className="space-y-1">
                <h4 className="text-base font-black text-slate-950 dark:text-white">
                  Report Received for Moderation
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 max-w-sm mx-auto">
                  Our Trust & Safety team will review this ad within 2–4 hours. If it violates our community policies, it will be unlisted immediately.
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-left max-w-md mx-auto space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">Ticket Reference:</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded">
                    {ticketId}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">Selected Reason:</span>
                  <span className="font-bold text-red-600 dark:text-red-400 truncate max-w-[220px]">
                    {currentReason.title}
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-6 py-2.5 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer shadow-xs"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            /* REPORT FORM */
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                  Select Reason for Reporting:
                </label>

                {/* Grid of Reasons */}
                <div className="space-y-2">
                  {REPORT_REASONS.map((reason) => {
                    const isSelected = selectedReasonId === reason.id;
                    const IconComponent = reason.icon;
                    return (
                      <label
                        key={reason.id}
                        className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-3 select-none ${
                          isSelected
                            ? 'bg-amber-500/10 dark:bg-amber-950/30 border-amber-500 dark:border-amber-500/80 shadow-2xs'
                            : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/80 hover:border-slate-300 dark:hover:border-slate-600'
                        }`}
                      >
                        <div className="pt-0.5 shrink-0">
                          <input
                            type="radio"
                            name="report_reason"
                            value={reason.id}
                            checked={isSelected}
                            onChange={() => setSelectedReasonId(reason.id)}
                            className="w-4 h-4 text-amber-500 focus:ring-amber-500 border-slate-300 cursor-pointer"
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-1 flex-wrap">
                            <span className="text-xs font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                              <IconComponent size={14} className="text-red-500 shrink-0" />
                              <span>{reason.title}</span>
                            </span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${reason.colorClass}`}>
                              {reason.badge}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug">
                            {reason.description}
                          </p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Optional comments */}
              <div>
                <label
                  htmlFor="report_details"
                  className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1"
                >
                  Additional Comments (Optional):
                </label>
                <textarea
                  id="report_details"
                  rows={2}
                  value={additionalDetails}
                  onChange={(e) => setAdditionalDetails(e.target.value)}
                  placeholder="Provide any additional details or evidence (e.g. 'Seller asked for mobile money deposit before inspection', 'Already marked sold on phone call', etc.)..."
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:border-amber-500 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                />
              </div>

              {/* Safety Confidentiality Disclaimer */}
              <div className="p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/80 dark:border-slate-800 flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                <ShieldCheck size={15} className="text-emerald-500 shrink-0" />
                <span>Reports are 100% anonymous. The seller will not see who reported their ad.</span>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-between gap-2.5">
                {existingReport ? (
                  <button
                    type="button"
                    onClick={handleWithdraw}
                    className="px-3.5 py-2 text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 border border-red-200 dark:border-red-900/40"
                  >
                    <Trash2 size={13} />
                    <span>Withdraw Report</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleClose}
                    className="px-4 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-red-600 hover:bg-red-500 active:bg-red-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition-all shadow-xs flex items-center gap-2 cursor-pointer ml-auto"
                >
                  {isSubmitting ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <Flag size={14} />
                      <span>{existingReport ? 'Update Report' : 'Submit Report'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
