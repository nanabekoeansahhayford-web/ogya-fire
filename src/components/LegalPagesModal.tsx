import React, { useState, useEffect } from 'react';
import {
  X,
  ShieldCheck,
  FileText,
  Scale,
  Lock,
  CheckCircle2,
  RefreshCw,
  AlertTriangle,
  Wallet,
  Truck,
  ArrowRight,
} from 'lucide-react';

export type LegalPageId = 'privacy' | 'terms' | 'escrow' | 'safety';

interface LegalPagesModalProps {
  isOpen: boolean;
  initialPage?: LegalPageId;
  onClose: () => void;
}

const LEGAL_TABS: {
  id: LegalPageId;
  label: string;
  shortLabel: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}[] = [
  { id: 'privacy', label: 'Privacy Policy', shortLabel: 'Privacy', icon: Lock },
  { id: 'terms', label: 'Terms of Use', shortLabel: 'Terms', icon: FileText },
  { id: 'escrow', label: 'Refund / Escrow Policy', shortLabel: 'Escrow & Refunds', icon: Scale },
  { id: 'safety', label: 'Safe Trading Guide', shortLabel: 'Safe Trading', icon: ShieldCheck },
];

export const LegalPagesModal: React.FC<LegalPagesModalProps> = ({
  isOpen,
  initialPage = 'privacy',
  onClose,
}) => {
  const [activePage, setActivePage] = useState<LegalPageId>(initialPage);

  useEffect(() => {
    if (isOpen && initialPage) {
      setActivePage(initialPage);
    }
  }, [isOpen, initialPage]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[70] overflow-y-auto bg-slate-950/75 dark:bg-black/85 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 md:p-6 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative bg-white dark:bg-slate-900 rounded-2xl max-w-4xl w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto max-h-[90vh] flex flex-col text-slate-900 dark:text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-5 sm:px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/90 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 text-[#00875A] dark:text-emerald-400 flex items-center justify-center border border-emerald-200 dark:border-emerald-900/50">
              <Scale size={18} />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-slate-950 dark:text-white leading-tight">
                OGYA (FIRE) Legal, Escrow &amp; Safety Center
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                OGYA (FIRE) · Accra, Ghana · Last Updated: 14 November 2026
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close legal center"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="px-4 sm:px-6 py-2.5 bg-slate-100/70 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2 overflow-x-auto shrink-0">
          {LEGAL_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activePage === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActivePage(tab.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                  isActive
                    ? 'bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950 shadow-xs'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white border border-slate-200 dark:border-slate-800'
                }`}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Page Content */}
        <div className="overflow-y-auto overscroll-contain p-4 sm:p-7 space-y-6 text-sm text-slate-700 dark:text-slate-300 leading-relaxed flex-1">
          <LegalDocumentContent activePage={activePage} onSelectPage={setActivePage} />
        </div>

        {/* Modal Footer */}
        <div className="px-5 sm:px-6 py-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/80 flex items-center justify-between gap-3 shrink-0">
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            OGYA (FIRE) Accra, Ghana · Verified Ghana Vendors &amp; Escrow Protection
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold rounded-xl text-xs cursor-pointer transition-colors border border-transparent dark:border-slate-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

interface LegalDocumentContentProps {
  activePage: LegalPageId;
  onSelectPage: (page: LegalPageId) => void;
}

export const LegalDocumentContent: React.FC<LegalDocumentContentProps> = ({
  activePage,
  onSelectPage,
}) => {
  const setActivePage = onSelectPage;
  return (
    <>
          {/* 1. PRIVACY POLICY */}
          {activePage === 'privacy' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="border-b border-slate-200 dark:border-slate-800 pb-4 space-y-1.5">
                <span className="inline-block text-[11px] font-bold uppercase tracking-wider text-[#00875A] dark:text-emerald-400">
                  Last Updated: 14 November 2026
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-slate-950 dark:text-white">
                  PRIVACY POLICY - OGYA (FIRE)
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  OGYA (FIRE) is a Ghana marketplace app. This policy explains what we collect.
                </p>
              </div>

              <section className="space-y-1.5">
                <h4 className="font-extrabold text-slate-950 dark:text-white text-sm sm:text-base">
                  1. What We Collect
                </h4>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  Name, phone number, location (town/area), product photos, order details, MoMo payment proof screenshots, reviews.
                </p>
              </section>

              <section className="space-y-1.5">
                <h4 className="font-extrabold text-slate-950 dark:text-white text-sm sm:text-base">
                  2. How We Use It
                </h4>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  To show your products to buyers near you, to let buyers order via WhatsApp, to show order status, to show reviews and verified badges.
                </p>
              </section>

              <section className="space-y-1.5">
                <h4 className="font-extrabold text-slate-950 dark:text-white text-sm sm:text-base">
                  3. Where We Store It
                </h4>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  We use Firebase Firestore for data and Cloudinary for images. Data is stored securely.
                </p>
              </section>

              <section className="space-y-1.5">
                <h4 className="font-extrabold text-slate-950 dark:text-white text-sm sm:text-base">
                  4. What We Do NOT Do
                </h4>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  We do NOT sell your personal data. We do NOT share your phone number publicly except to the buyer/seller you are ordering from via WhatsApp.
                </p>
              </section>

              <section className="space-y-1.5">
                <h4 className="font-extrabold text-slate-950 dark:text-white text-sm sm:text-base">
                  5. Payments
                </h4>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  Buyers pay sellers directly via MTN MoMo or other MoMo. OGYA (FIRE) does not hold buyer money. Verified Seller fee GH₵50 is paid directly to OGYA (FIRE) via MoMo.
                </p>
              </section>

              <section className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2.5">
                <h4 className="font-extrabold text-slate-950 dark:text-white text-sm sm:text-base">
                  6. Delete Your Account
                </h4>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  To delete your data, WhatsApp us from the app and ask &ldquo;Delete my account&rdquo;. We will delete within 7 days.
                </p>
                <a
                  href="https://wa.me/233205749630?text=Delete%20my%20account"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#25D366] hover:bg-[#1fb857] text-white font-bold text-xs transition-colors"
                >
                  <span>WhatsApp: Delete my account</span>
                </a>
              </section>

              <section className="space-y-1.5">
                <h4 className="font-extrabold text-slate-950 dark:text-white text-sm sm:text-base">
                  7. Children
                </h4>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  You must be 18+ or have parent permission to use OGYA (FIRE).
                </p>
              </section>

              <section className="space-y-2">
                <h4 className="font-extrabold text-slate-950 dark:text-white text-sm sm:text-base">
                  8. Contact
                </h4>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  Contact us via WhatsApp button inside the app.
                </p>
                <a
                  href="https://wa.me/233205749630"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors"
                >
                  <span>Contact via WhatsApp (0205749630)</span>
                </a>
              </section>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-500 dark:text-slate-400">
                Last Updated: 14 November 2026
              </div>
            </div>
          )}

          {/* 2. TERMS OF USE */}
          {activePage === 'terms' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="border-b border-slate-200 dark:border-slate-800 pb-4 space-y-1.5">
                <span className="inline-block text-[11px] font-bold uppercase tracking-wider text-[#FF6600]">
                  Last Updated: 14 November 2026
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-slate-950 dark:text-white">
                  TERMS OF USE - OGYA (FIRE)
                </h2>
              </div>

              <section className="space-y-1.5">
                <h4 className="font-extrabold text-slate-950 dark:text-white text-sm sm:text-base">
                  1. About OGYA (FIRE)
                </h4>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  OGYA (FIRE) is a marketplace connecting buyers and sellers in Ghana. We do not sell products ourselves.
                </p>
              </section>

              <section className="space-y-1.5">
                <h4 className="font-extrabold text-slate-950 dark:text-white text-sm sm:text-base">
                  2. Sellers
                </h4>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  Sellers are responsible for their products, prices, quality, and delivery. Fake products, scams, or stolen items will be removed and account banned.
                </p>
              </section>

              <section className="space-y-1.5">
                <h4 className="font-extrabold text-slate-950 dark:text-white text-sm sm:text-base">
                  3. Buyers
                </h4>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  Buyers must confirm price and delivery with seller on WhatsApp before paying. Check product on delivery.
                </p>
              </section>

              <section className="space-y-1.5">
                <h4 className="font-extrabold text-slate-950 dark:text-white text-sm sm:text-base">
                  4. Orders
                </h4>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  Order status: Pending -&gt; Confirmed -&gt; On Delivery -&gt; Delivered. Sellers must update status.
                </p>
              </section>

              <section className="p-4 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 space-y-1.5">
                <h4 className="font-extrabold text-slate-950 dark:text-white text-sm sm:text-base">
                  5. Verified Sellers
                </h4>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  Verified badge costs GH₵50 for 30 days. It gives top placement. It is non-refundable after activation. OGYA (FIRE) can remove badge for fraud.
                </p>
              </section>

              <section className="space-y-2">
                <h4 className="font-extrabold text-slate-950 dark:text-white text-sm sm:text-base">
                  6. No Liability
                </h4>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  OGYA (FIRE) is not responsible for delivery delays, food quality, or disputes between buyer and seller. Resolve disputes on WhatsApp first, then contact us.
                </p>
                <a
                  href="https://wa.me/233205749630"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold text-xs transition-colors"
                >
                  <span>Contact OGYA (FIRE) via WhatsApp</span>
                </a>
              </section>

              <section className="space-y-1.5">
                <h4 className="font-extrabold text-slate-950 dark:text-white text-sm sm:text-base">
                  7. Changes
                </h4>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  We can update these terms. Continued use means you accept.
                </p>
              </section>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-500 dark:text-slate-400">
                Last Updated: 14 November 2026
              </div>
            </div>
          )}

          {/* 3. REFUND / ESCROW POLICY */}
          {activePage === 'escrow' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  Last Updated: November 14, 2026
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-slate-950 dark:text-white mt-1">
                  OGYA (FIRE) - Escrow &amp; Refund Policy
                </h2>
              </div>

              {/* Short Clear 3-Part Escrow Explanation */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                <div className="p-4 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/60 space-y-1.5">
                  <div className="flex items-center gap-2 text-[#00875A] dark:text-emerald-400 font-black text-xs uppercase tracking-wider">
                    <Wallet size={15} />
                    <span>1. Who Holds Payment</span>
                  </div>
                  <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed">
                    Buyer pays via Mobile Money to OGYA (FIRE). <strong>OGYA (FIRE) holds the money securely</strong> — the seller does NOT get paid yet.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 space-y-1.5">
                  <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-black text-xs uppercase tracking-wider">
                    <Truck size={15} />
                    <span>2. When Seller Gets Paid</span>
                  </div>
                  <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed">
                    Sellers are paid <strong>after buyer confirms receipt</strong>, or after 24 hours if buyer does not raise a dispute and delivery is confirmed by courier.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-sky-50/70 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-900/60 space-y-1.5">
                  <div className="flex items-center gap-2 text-sky-700 dark:text-sky-400 font-black text-xs uppercase tracking-wider">
                    <RefreshCw size={15} />
                    <span>3. How Buyer Gets Refund</span>
                  </div>
                  <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed">
                    Do NOT confirm receipt. Tap <strong>Report / Dispute within 24 hours</strong> with photo/video proof; OGYA (FIRE) Support reviews within 48 hours.
                  </p>
                </div>
              </div>

              <section className="space-y-2">
                <h4 className="font-extrabold text-slate-950 dark:text-white text-sm">
                  1. How Escrow Works
                </h4>
                <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm">
                  <li>Buyer pays via Mobile Money to OGYA (FIRE)</li>
                  <li>OGYA (FIRE) holds the money securely — seller does NOT get paid yet</li>
                  <li>Courier delivers the item</li>
                  <li>Buyer inspects the item on delivery and confirms receipt in the app</li>
                  <li>OGYA (FIRE) then releases payment to the seller, minus OGYA (FIRE) service fee</li>
                </ul>
                <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                  This is &ldquo;Doorstep Escrow Protection&rdquo; — your money is protected until you receive what you ordered.
                </p>
              </section>

              <section className="space-y-2">
                <h4 className="font-extrabold text-slate-950 dark:text-white text-sm">
                  2. When You Get A Full Refund
                </h4>
                <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm">
                  <li>Item never arrived</li>
                  <li>Item is wrong, damaged, fake, or very different from listing</li>
                  <li>Seller cancels the order</li>
                </ul>
              </section>

              <section className="space-y-2">
                <h4 className="font-extrabold text-slate-950 dark:text-white text-sm">
                  3. When You Do NOT Get A Refund
                </h4>
                <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm">
                  <li>You changed your mind after confirming receipt</li>
                  <li>You damaged the item after delivery</li>
                  <li>You confirmed receipt, then later complained without photo/video proof</li>
                </ul>
              </section>

              <section className="space-y-2">
                <h4 className="font-extrabold text-slate-950 dark:text-white text-sm">
                  4. How To Request A Refund
                </h4>
                <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm">
                  <li>Do NOT confirm receipt</li>
                  <li>Tap Report / Dispute on the order within 24 hours of delivery</li>
                  <li>Upload photo/video proof</li>
                  <li>OGYA (FIRE) Support will review within 48 hours and decide</li>
                </ul>
              </section>

              <section className="space-y-1.5">
                <h4 className="font-extrabold text-slate-950 dark:text-white text-sm">
                  5. Seller Payout
                </h4>
                <p>
                  Sellers are paid after buyer confirms receipt, or after 24 hours if buyer does not raise a dispute and delivery is confirmed by courier.
                </p>
              </section>

              <section className="p-4 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 space-y-2">
                <h4 className="font-extrabold text-slate-950 dark:text-white text-sm">
                  6. GH Verified Badge Subscription (100 GHS/mo)
                </h4>
                <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm">
                  <li>This is a digital subscription for sellers to get a Verified Badge</li>
                  <li>Billed via Google Play Billing / Apple In-App Purchase inside the app</li>
                  <li>You can cancel anytime in Play Store / App Store subscriptions</li>
                  <li>No refund for the current month after badge is activated, unless required by store policy</li>
                </ul>
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 pt-1">
                  Contact for disputes:{' '}
                  <a
                    href="mailto:nanabekoeansahhayford@gmail.com"
                    className="text-[#00875A] dark:text-emerald-400 hover:underline"
                  >
                    nanabekoeansahhayford@gmail.com
                  </a>{' '}
                  /{' '}
                  <a
                    href="https://wa.me/233205749630"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#00875A] dark:text-emerald-400 hover:underline"
                  >
                    WhatsApp us on 0205749630
                  </a>
                </p>
              </section>
            </div>
          )}

          {/* 4. SAFE TRADING GUIDE */}
          {activePage === 'safety' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  Document 04 · Buyer & Seller Safety
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-slate-950 dark:text-white mt-1">
                  Safe Trading Guide
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Essential rules for safe buying, selling, and doorstep courier delivery in Ghana.
                </p>
              </div>

              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 rounded-xl flex items-start gap-3">
                <Lock className="w-5 h-5 text-emerald-700 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-emerald-950 dark:text-emerald-300 text-sm mb-1">
                    Our #1 Rule: Never Send Personal Advance MoMo Transfers
                  </h4>
                  <p className="text-emerald-900 dark:text-emerald-300/90 text-xs sm:text-sm">
                    Never send mobile money deposits, delivery fees, or &ldquo;holding fees&rdquo; to an individual&apos;s personal number before inspecting goods. Use OGYA (FIRE) Escrow at checkout so your funds stay protected until delivery.
                  </p>
                </div>
              </div>

              <div className="space-y-3.5">
                <div className="flex items-start gap-3">
                  <CheckCircle2 size={18} className="text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-bold text-slate-900 dark:text-slate-100 text-xs sm:text-sm mb-0.5">
                      Meet in Populated, Public Places
                    </h5>
                    <p className="text-slate-600 dark:text-slate-400 text-xs">
                      Choose busy malls (Accra Mall, Junction Mall, Kumasi City Mall), fuel stations, banking halls, or police stations in daylight.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle2 size={18} className="text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-bold text-slate-900 dark:text-slate-100 text-xs sm:text-sm mb-0.5">
                      Inspect & Verify Documents Before Paying
                    </h5>
                    <p className="text-slate-600 dark:text-slate-400 text-xs">
                      Check phone IMEI and iCloud/Google lock status. For cars, verify chassis numbers and DVLA / GRA customs paperwork. For land/property, run an official Lands Commission search.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle2 size={18} className="text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-bold text-slate-900 dark:text-slate-100 text-xs sm:text-sm mb-0.5">
                      Protect Your 4-Digit Release OTP & Banking PINs
                    </h5>
                    <p className="text-slate-600 dark:text-slate-400 text-xs">
                      OGYA (FIRE) staff will never ask for your Mobile Money PIN or password. When receiving a courier delivery, inspect the item at your doorstep first before sharing your 4-digit release OTP.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 bg-rose-50/70 dark:bg-rose-950/30 rounded-xl border border-rose-200 dark:border-rose-900/50">
                  <AlertTriangle size={18} className="text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-bold text-rose-900 dark:text-rose-300 text-xs sm:text-sm mb-0.5">
                      Report Suspicious Listings or Sellers Immediately
                    </h5>
                    <p className="text-rose-800 dark:text-rose-300/90 text-xs leading-relaxed">
                      Every listing includes a <strong>Report</strong> button so you can flag scammers, counterfeit items, fake pricing, or abusive behavior directly to our Trust &amp; Safety team.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3 flex-wrap">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Want to know how refunds and escrow payouts work?
                </span>
                <button
                  type="button"
                  onClick={() => setActivePage('escrow')}
                  className="text-xs font-bold text-[#00875A] dark:text-emerald-400 hover:underline inline-flex items-center gap-1 cursor-pointer"
                >
                  <span>Read Refund / Escrow Policy</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            </div>
          )}
    </>
  );
};
