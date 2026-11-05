import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Smartphone,
  CreditCard,
  Building2,
  Sparkles,
  Zap,
  ArrowRight,
  Award,
  Users,
  Eye,
  Check,
} from 'lucide-react';
import { UserProfile } from '../types/marketplace';
import { subscribeSellerVerified, VerifiedSubscriptionRecord } from '../utils/verification';

interface VerifiedSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  onOpenAuth: () => void;
  onSubscriptionSuccess: (updatedUser: UserProfile, msg: string) => void;
}

export const VerifiedSubscriptionModal: React.FC<VerifiedSubscriptionModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onOpenAuth,
  onSubscriptionSuccess,
}) => {
  const [paystackChannel, setPaystackChannel] = useState<'momo' | 'card' | 'bank'>('momo');
  const [momoProvider, setMomoProvider] = useState<'mtn' | 'telecel' | 'at'>('mtn');
  const [phone, setPhone] = useState(currentUser?.phone || '024 489 1204');
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('883');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [paystackRef, setPaystackRef] = useState('');

  if (!isOpen) return null;

  const handlePaystackSubscribe = (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser) {
      onClose();
      onOpenAuth();
      return;
    }

    setIsProcessing(true);
    const ref = `PSTK_VER_${Date.now()}_${Math.floor(Math.random() * 89999 + 10000)}`;
    setPaystackRef(ref);

    // Realistic Paystack transaction simulation
    setTimeout(() => {
      const record = subscribeSellerVerified({
        userId: currentUser.id,
        sellerName: currentUser.name,
        paymentMethod: paystackChannel === 'momo' ? `${momoProvider.toUpperCase()} MoMo` : 'Card',
        paystackReference: ref,
        amount: 100,
      });

      const updatedUser: UserProfile = {
        ...currentUser,
        isVerified: true,
        isSubscribedVerified: true,
        subscriptionPlan: 'Verified Pro Seller (100 GHS/month)',
        verifiedAmount: 100,
        verifiedExpiresAt: record.expiresAt,
      };

      setIsProcessing(false);
      setIsSuccess(true);

      setTimeout(() => {
        onSubscriptionSuccess(
          updatedUser,
          '🎉 Congratulations! Your 100 GHS/month Verified Seller Badge is active across all your listings.'
        );
        setIsSuccess(false);
        onClose();
      }, 1800);
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 dark:bg-black/85 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 md:p-6 animate-in fade-in duration-200">
      <div
        className="relative bg-white dark:bg-slate-900 rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto max-h-[94vh] flex flex-col text-slate-900 dark:text-slate-100 transition-colors duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-amber-400 flex items-center justify-center font-bold text-white shadow-md">
              <ShieldCheck size={22} />
            </div>
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-1.5">
                <span>Verified Seller Badge</span>
                <span className="text-[10px] bg-emerald-500 text-slate-950 font-extrabold uppercase px-2 py-0.5 rounded">
                  100 GHS / Month
                </span>
              </h3>
              <p className="text-[11px] text-slate-300">
                Subscribe for 100 GHS/month via Paystack to unlock verified status across all products
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

        {/* Body */}
        <div className="overflow-y-auto p-6 space-y-5 flex-1">
          {isSuccess ? (
            /* Success Celebration */
            <div className="py-8 text-center space-y-4 animate-in zoom-in-95 duration-200">
              <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
                <ShieldCheck size={44} />
              </div>
              <h4 className="text-lg font-black text-slate-900 dark:text-white">
                Verified Seller Badge Activated!
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 max-w-sm mx-auto leading-relaxed">
                Thank you! Your monthly subscription of <strong>GH₵ 100.00</strong> was approved via Paystack. The <strong>🇬🇭 Verified Pro</strong> badge is now displayed on your profile and all your current & future product listings.
              </p>
              <div className="p-2.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-[11px] font-mono text-slate-600 dark:text-slate-300">
                Paystack Ref: {paystackRef}
              </div>
            </div>
          ) : (
            <form onSubmit={handlePaystackSubscribe} className="space-y-5">
              {/* Badge Preview Showcase */}
              <div className="p-4 bg-gradient-to-r from-emerald-50 via-teal-50/50 to-amber-50/50 dark:from-emerald-950/40 dark:via-slate-800/60 dark:to-amber-950/20 border border-emerald-200/80 dark:border-emerald-800/60 rounded-2xl flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-500 to-emerald-500 flex items-center justify-center text-white shadow-md">
                    <Award size={24} />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-black text-slate-900 dark:text-white">
                        {currentUser?.name || 'Seller Account'}
                      </span>
                      <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/60 px-2 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-700 flex items-center gap-1">
                        <ShieldCheck size={12} className="text-emerald-600 dark:text-emerald-400" />
                        <span>🇬🇭 Verified Pro</span>
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">
                      Trusted Merchant · 100 GHS/month Verified Subscription
                    </span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-lg font-black text-slate-950 dark:text-white tabular-nums">
                    GH₵ 100
                  </span>
                  <span className="text-[10px] text-slate-400 block font-semibold">/ month</span>
                </div>
              </div>

              {/* What You Get Grid */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                  What You Get with Verified Pro Badge
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700/80 flex items-start gap-2.5">
                    <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <h5 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                        Official Ghana Verified Badge
                      </h5>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                        Distinctive green and gold badge on all your listings and seller profile.
                      </p>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700/80 flex items-start gap-2.5">
                    <Users size={16} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <h5 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                        Inclusion in "Verified Only" Filter
                      </h5>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                        Buyers actively filter for verified sellers to avoid scams and buy safely.
                      </p>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700/80 flex items-start gap-2.5">
                    <Zap size={16} className="text-orange-500 shrink-0 mt-0.5" />
                    <div>
                      <h5 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                        4x More WhatsApp Messages
                      </h5>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                        Verified sellers close 4x more sales through direct buyer trust and confidence.
                      </p>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700/80 flex items-start gap-2.5">
                    <ShieldCheck size={16} className="text-blue-500 shrink-0 mt-0.5" />
                    <div>
                      <h5 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                        Priority Courier Haulage
                      </h5>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                        Immediate parcel dispatch and direct courier pickup across all 16 Ghana regions.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Paystack Payment Channel Selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                  Paystack Ghana Payment Method
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaystackChannel('momo')}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                      paystackChannel === 'momo'
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-950 dark:text-emerald-200 shadow-xs'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    <Smartphone size={16} className="text-emerald-600 dark:text-emerald-400" />
                    <span>Mobile Money</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaystackChannel('card')}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                      paystackChannel === 'card'
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/50 text-blue-950 dark:text-blue-200 shadow-xs'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    <CreditCard size={16} className="text-blue-600 dark:text-blue-400" />
                    <span>Card / Visa</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaystackChannel('bank')}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                      paystackChannel === 'bank'
                        ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/50 text-amber-950 dark:text-amber-200 shadow-xs'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    <Building2 size={16} className="text-amber-600 dark:text-amber-400" />
                    <span>Bank Transfer</span>
                  </button>
                </div>
              </div>

              {/* Paystack Channel Fields */}
              {paystackChannel === 'momo' && (
                <div className="space-y-3 p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setMomoProvider('mtn')}
                      className={`py-1.5 px-2 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                        momoProvider === 'mtn'
                          ? 'bg-amber-400 text-slate-950 border-amber-500 font-black'
                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                      }`}
                    >
                      MTN MoMo
                    </button>
                    <button
                      type="button"
                      onClick={() => setMomoProvider('telecel')}
                      className={`py-1.5 px-2 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                        momoProvider === 'telecel'
                          ? 'bg-red-600 text-white border-red-700 font-black'
                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                      }`}
                    >
                      Telecel Cash
                    </button>
                    <button
                      type="button"
                      onClick={() => setMomoProvider('at')}
                      className={`py-1.5 px-2 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                        momoProvider === 'at'
                          ? 'bg-blue-600 text-white border-blue-700 font-black'
                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                      }`}
                    >
                      AT Money
                    </button>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Mobile Money Number for Paystack Push Prompt
                    </label>
                    <input
                      type="text"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="024 123 4567"
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-bold focus:outline-none focus:border-emerald-500"
                    />
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      Paystack will send an instant USSD authorization prompt for GH₵ 100.00 to this handset.
                    </span>
                  </div>
                </div>
              )}

              {paystackChannel === 'card' && (
                <div className="space-y-3 p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Card Number (Visa / Mastercard / GH-Link)
                    </label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      placeholder="4242 •••• •••• 4242"
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-bold focus:outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Expiry Date
                      </label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        placeholder="MM/YY"
                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-bold focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                        CVV
                      </label>
                      <input
                        type="text"
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        placeholder="123"
                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-bold focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {paystackChannel === 'bank' && (
                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 text-xs space-y-2">
                  <p className="font-semibold text-slate-800 dark:text-slate-200">
                    Pay via instant Bank Transfer (GCB, Ecobank, Zenith, Stanbic):
                  </p>
                  <div className="p-2.5 bg-white dark:bg-slate-900 rounded-lg font-mono text-[11px] text-slate-600 dark:text-slate-300">
                    Bank: Paystack Titan / GCB Ghana<br />
                    Account: 9940148912<br />
                    Beneficiary: OGYA FIRE Verified Services (100 GHS)
                  </div>
                </div>
              )}

              {/* Submit CTA */}
              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isProcessing}
                  className="px-4 py-2.5 text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isProcessing}
                  className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:opacity-95 text-white font-black text-xs sm:text-sm rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50 active:scale-98"
                >
                  {isProcessing ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Processing Paystack GH₵ 100...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck size={16} />
                      <span>Pay GH₵ 100/mo & Get Verified</span>
                      <ArrowRight size={14} />
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
