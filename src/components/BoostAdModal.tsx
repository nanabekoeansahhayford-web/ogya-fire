import React, { useState } from 'react';
import {
  X,
  Zap,
  CheckCircle2,
  ShieldCheck,
  CreditCard,
  Smartphone,
  ArrowRight,
  Pin,
  Lock,
  Building2,
  Clock,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { Listing } from '../types/marketplace';
import { formatPrice } from '../utils/storage';

interface BoostPlan {
  id: string;
  name: string;
  duration: string;
  days: number;
  price: number;
  badgeText: string;
  description: string;
  isPopular?: boolean;
}

const BOOST_PLANS: BoostPlan[] = [
  {
    id: 'boost-7d',
    name: 'OGYA Fire Pin 🔥 (Paystack)',
    duration: '7 Days Top Pin',
    days: 7,
    price: 50,
    badgeText: '🔥 Most Popular · 50 GHS',
    description: 'Pin your product to the very top of all homepage feeds and category results across Ghana for 7 days with a verified Promoted badge.',
    isPopular: true,
  },
  {
    id: 'boost-3d',
    name: 'Quick Lite Boost',
    duration: '3 Days Pin',
    days: 3,
    price: 25,
    badgeText: 'Weekend Boost',
    description: 'Higher ranking in category searches with a Promoted badge for 3 days.',
  },
  {
    id: 'boost-14d',
    name: 'Mega Blaze Pro',
    duration: '14 Days Top Pin',
    days: 14,
    price: 90,
    badgeText: 'Maximum Visibility',
    description: 'Extended 2-week maximum top priority ranking, spotlight feature, and direct WhatsApp buyer promotion.',
  },
];

interface BoostAdModalProps {
  listing: Listing | null;
  isOpen: boolean;
  onClose: () => void;
  onBoostSuccess: (listingId: string, planName: string, durationDays: number) => void;
}

export const BoostAdModal: React.FC<BoostAdModalProps> = ({
  listing,
  isOpen,
  onClose,
  onBoostSuccess,
}) => {
  const [selectedPlanId, setSelectedPlanId] = useState<string>('boost-7d');
  const [isPaystackCheckoutOpen, setIsPaystackCheckoutOpen] = useState(false);
  const [paystackChannel, setPaystackChannel] = useState<'momo' | 'card' | 'bank'>('momo');
  const [momoProvider, setMomoProvider] = useState<'mtn' | 'telecel' | 'at'>('mtn');
  const [phoneOrAccount, setPhoneOrAccount] = useState('024 489 1204');
  const [customerEmail, setCustomerEmail] = useState('nanabekoeansahhayford@gmail.com');
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('11/28');
  const [cardCvv, setCardCvv] = useState('883');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paystackRef, setPaystackRef] = useState('');

  if (!isOpen || !listing) return null;

  const currentPlan = BOOST_PLANS.find((p) => p.id === selectedPlanId) || BOOST_PLANS[0];

  const handleStartPaystackCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    setIsPaystackCheckoutOpen(true);
    setPaymentSuccess(false);
  };

  const handleAuthorizePaystackPayment = () => {
    setIsProcessing(true);
    const generatedRef = `PSTK_GHA_${Date.now()}_${Math.floor(Math.random() * 89999 + 10000)}`;
    setPaystackRef(generatedRef);

    // Realistic Paystack processing flow (USSD push prompt simulation)
    setTimeout(() => {
      setIsProcessing(false);
      setPaymentSuccess(true);

      setTimeout(() => {
        onBoostSuccess(listing.id, currentPlan.name, currentPlan.days);
        setIsPaystackCheckoutOpen(false);
        setPaymentSuccess(false);
        onClose();
      }, 1600);
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 dark:bg-black/85 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 md:p-6 animate-in fade-in duration-200">
      <div
        className="relative bg-white dark:bg-slate-900 rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto max-h-[94vh] flex flex-col text-slate-900 dark:text-slate-100 transition-colors duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 via-orange-500 to-red-600 flex items-center justify-center font-bold text-white shadow-md">
              <Zap size={20} fill="currentColor" />
            </div>
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-1.5">
                <span>Boost Product to Top (7 Days)</span>
                <span>🔥</span>
              </h3>
              <p className="text-[11px] text-slate-300">
                Pay 50 GHS via Paystack to pin your listing to the very top for 7 days
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close boost modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        {!isPaystackCheckoutOpen ? (
          <form onSubmit={handleStartPaystackCheckout} className="overflow-y-auto p-6 space-y-5 flex-1 text-slate-900 dark:text-slate-100">
            {/* Listing Target Card */}
            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl flex items-center gap-3">
              {listing.images && listing.images[0] && (
                <img
                  src={listing.images[0]}
                  alt={listing.title}
                  referrerPolicy="no-referrer"
                  className="w-16 h-16 object-cover rounded-lg shrink-0 border border-slate-200 dark:border-slate-700"
                />
              )}
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-black text-amber-700 dark:text-amber-400 uppercase tracking-wider block">
                  Product To Put On Top
                </span>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 truncate">{listing.title}</h4>
                <div className="text-xs font-black text-slate-950 dark:text-white tabular-nums">
                  {formatPrice(listing.price, listing.currency)}
                </div>
              </div>
            </div>

            {/* Paystack Guarantee Banner */}
            <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 rounded-xl p-3 flex items-center justify-between gap-3 text-xs text-emerald-900 dark:text-emerald-200">
              <div className="flex items-center gap-2">
                <ShieldCheck size={18} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span className="font-semibold">
                  Secure instant processing powered by <strong>Paystack Ghana</strong> (MTN MoMo, Telecel & Cards)
                </span>
              </div>
              <span className="text-[10px] uppercase font-bold bg-emerald-600 text-white px-2 py-0.5 rounded shrink-0">
                Live Gateway
              </span>
            </div>

            {/* Package Selection */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                Choose Promotion Plan
              </label>
              <div className="space-y-2.5">
                {BOOST_PLANS.map((plan) => {
                  const isSelected = selectedPlanId === plan.id;
                  return (
                    <div
                      key={plan.id}
                      onClick={() => setSelectedPlanId(plan.id)}
                      className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        isSelected
                          ? 'border-orange-500 bg-orange-50/50 dark:bg-orange-950/40 shadow-sm'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5">
                          <input
                            type="radio"
                            name="boostPlan"
                            checked={isSelected}
                            onChange={() => setSelectedPlanId(plan.id)}
                            className="text-orange-500 focus:ring-0 cursor-pointer"
                          />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-extrabold text-xs sm:text-sm text-slate-950 dark:text-white">
                              {plan.name}
                            </span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                                plan.isPopular
                                  ? 'bg-gradient-to-r from-red-600 to-orange-500 text-white shadow-xs'
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                              }`}
                            >
                              {plan.badgeText}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">
                            {plan.description}
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="text-sm sm:text-base font-black text-slate-950 dark:text-white tabular-nums">
                          GH₵ {plan.price}
                        </div>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold block">
                          {plan.duration}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Perks breakdown */}
            <div className="bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-xl p-3.5 space-y-2 text-xs text-amber-950 dark:text-amber-200">
              <span className="font-bold flex items-center gap-1.5 text-amber-900 dark:text-amber-300 text-[11px] uppercase tracking-wider">
                <Pin size={13} className="text-amber-700 dark:text-amber-400" />
                <span>What happens when you boost for 50 GHS?</span>
              </span>
              <ul className="space-y-1 text-xs text-slate-700 dark:text-slate-300 list-disc list-inside">
                <li>Your product immediately moves to <strong>position #1</strong> at the top of the feed</li>
                <li>Displays the glowing <strong>'Promoted'</strong> badge on the card</li>
                <li>Stays pinned for <strong>7 days</strong> with continuous priority visibility</li>
                <li>Direct WhatsApp button generates up to <strong>8x more inquiries and sales</strong></li>
              </ul>
            </div>

            {/* Modal Actions */}
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="px-6 py-2.5 bg-gradient-to-r from-red-600 via-orange-500 to-amber-500 hover:opacity-95 text-white font-black text-xs sm:text-sm rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer active:scale-98"
              >
                <Zap size={16} fill="currentColor" />
                <span>Pay GH₵ {currentPlan.price} via Paystack</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </form>
        ) : (
          /* Paystack Checkout Screen */
          <div className="p-6 space-y-5 flex-1 overflow-y-auto">
            {/* Paystack Header Badge */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#0BA4DB] flex items-center justify-center text-white font-black text-xs">
                  P
                </div>
                <div>
                  <div className="text-xs font-black text-slate-950 dark:text-white flex items-center gap-1.5">
                    <span>Paystack Ghana</span>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-0.5">
                      <Lock size={10} />
                      Secured
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400">Merchant: OGYA FIRE Classifieds</span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Amount to Pay</span>
                <span className="text-base font-black text-slate-950 dark:text-white tabular-nums">
                  GH₵ {currentPlan.price}.00
                </span>
              </div>
            </div>

            {paymentSuccess ? (
              /* Success Celebration */
              <div className="py-8 text-center space-y-3 animate-in zoom-in-95 duration-200">
                <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
                  <CheckCircle2 size={36} />
                </div>
                <h4 className="text-base font-black text-slate-900 dark:text-white">
                  Payment of GH₵ {currentPlan.price} Approved!
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 max-w-sm mx-auto">
                  Your ad <strong>"{listing.title.slice(0, 32)}..."</strong> is now promoted and pinned to the top of OGYA for {currentPlan.duration}.
                </p>
                <div className="p-2.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-[11px] font-mono text-slate-600 dark:text-slate-300">
                  Paystack Ref: {paystackRef}
                </div>
              </div>
            ) : (
              <>
                {/* Paystack Channel Tabs */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                    Select Paystack Payment Channel
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setPaystackChannel('momo')}
                      className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                        paystackChannel === 'momo'
                          ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/50 text-amber-900 dark:text-amber-200 shadow-xs'
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      <Smartphone size={16} className="text-amber-600 dark:text-amber-400" />
                      <span>Mobile Money</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaystackChannel('card')}
                      className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                        paystackChannel === 'card'
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/50 text-blue-900 dark:text-blue-200 shadow-xs'
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
                          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-900 dark:text-emerald-200 shadow-xs'
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      <Building2 size={16} className="text-emerald-600 dark:text-emerald-400" />
                      <span>Bank / GH-Link</span>
                    </button>
                  </div>
                </div>

                {/* Mobile Money Details */}
                {paystackChannel === 'momo' && (
                  <div className="space-y-3 p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                        Choose Network Provider
                      </label>
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
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Ghana Mobile Money Number
                      </label>
                      <input
                        type="text"
                        value={phoneOrAccount}
                        onChange={(e) => setPhoneOrAccount(e.target.value)}
                        placeholder="024 123 4567"
                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-bold focus:outline-none focus:border-amber-500"
                      />
                      <span className="text-[10px] text-slate-400 mt-1 block">
                        A Paystack USSD prompt will be sent to your phone to authorize GH₵ {currentPlan.price}.00.
                      </span>
                    </div>
                  </div>
                )}

                {/* Card Details */}
                {paystackChannel === 'card' && (
                  <div className="space-y-3 p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Card Number
                      </label>
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        placeholder="4242 •••• •••• 4242"
                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-bold focus:outline-none focus:border-blue-500"
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

                {/* Bank / GH-Link */}
                {paystackChannel === 'bank' && (
                  <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 text-xs space-y-2">
                    <p className="font-semibold text-slate-800 dark:text-slate-200">
                      Pay via instant Bank Transfer (GCB, Ecobank, Stanbic, Zenith, CalBank):
                    </p>
                    <div className="p-2.5 bg-white dark:bg-slate-900 rounded-lg font-mono text-[11px] text-slate-600 dark:text-slate-300">
                      Bank: Paystack Titan / GCB Ghana<br />
                      Account: 9920148912<br />
                      Beneficiary: OGYA FIRE Boost Services
                    </div>
                  </div>
                )}

                {/* Authorize Action Button */}
                <div className="pt-2 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => setIsPaystackCheckoutOpen(false)}
                    disabled={isProcessing}
                    className="px-3 py-2 text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                  >
                    Back
                  </button>

                  <button
                    type="button"
                    onClick={handleAuthorizePaystackPayment}
                    disabled={isProcessing}
                    className="px-6 py-2.5 bg-[#0BA4DB] hover:bg-[#0993c4] active:bg-[#077fa8] text-white font-extrabold text-xs sm:text-sm rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isProcessing ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Sending Paystack Prompt...</span>
                      </>
                    ) : (
                      <>
                        <Lock size={14} />
                        <span>Authorize Paystack GH₵ {currentPlan.price}.00</span>
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
