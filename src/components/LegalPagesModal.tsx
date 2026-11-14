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
  { id: 'terms', label: 'Terms of Service', shortLabel: 'Terms', icon: FileText },
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
                OGYA Accra, Ghana · Last Updated: November 14, 2026
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
        <div className="overflow-y-auto p-5 sm:p-7 space-y-6 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed flex-1">
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
              <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#00875A] dark:text-emerald-400">
                  Last Updated: November 14, 2026
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-slate-950 dark:text-white mt-1">
                  OGYA (FIRE) - Privacy Policy
                </h2>
              </div>

              <section className="space-y-2">
                <h4 className="font-extrabold text-slate-950 dark:text-white text-sm">
                  1. Who We Are
                </h4>
                <p>
                  OGYA Accra, Ghana (&ldquo;OGYA&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;) operates a multi-vendor marketplace connecting buyers and verified merchants in Accra and across Ghana.
                </p>
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  Contact:{' '}
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
                    0205749630 (WhatsApp)
                  </a>
                </p>
              </section>

              <section className="space-y-2">
                <h4 className="font-extrabold text-slate-950 dark:text-white text-sm">
                  2. Data We Collect
                </h4>
                <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm">
                  <li>
                    <strong>Account Data:</strong> Name, phone number, email, profile photo, location (Accra / Region)
                  </li>
                  <li>
                    <strong>Listing Data:</strong> Photos, titles, prices, descriptions you post
                  </li>
                  <li>
                    <strong>Transaction Data:</strong> Orders, delivery address, Mobile Money transaction reference (we do NOT store your Mobile Money PIN)
                  </li>
                  <li>
                    <strong>Device Data:</strong> Device type, app version, crash logs
                  </li>
                  <li>
                    <strong>Messages:</strong> In-app chat between buyer and seller for safety and dispute resolution
                  </li>
                </ul>
              </section>

              <section className="space-y-2">
                <h4 className="font-extrabold text-slate-950 dark:text-white text-sm">
                  3. How We Use Data
                </h4>
                <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm">
                  <li>To create and manage your account</li>
                  <li>To show listings near you</li>
                  <li>To process orders, deliveries, and escrow payments</li>
                  <li>To verify sellers and prevent fraud</li>
                  <li>To send order updates, safety alerts, and support messages</li>
                  <li>To improve the app and fix bugs</li>
                </ul>
              </section>

              <section className="space-y-2">
                <h4 className="font-extrabold text-slate-950 dark:text-white text-sm">
                  4. What We Do NOT Do
                </h4>
                <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm">
                  <li>We do NOT sell your personal data</li>
                  <li>We do NOT share your phone number publicly without your permission</li>
                  <li>We do NOT store your Mobile Money PIN or bank password</li>
                </ul>
              </section>

              <section className="space-y-2">
                <h4 className="font-extrabold text-slate-950 dark:text-white text-sm">
                  5. Sharing Data
                </h4>
                <p>We share data only with:</p>
                <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm">
                  <li>Delivery couriers (only your delivery address and phone for that order)</li>
                  <li>Payment providers (MTN MoMo, Telecel Cash, AirtelTigo Money) to process payment</li>
                  <li>Law enforcement if required by Ghana law</li>
                </ul>
              </section>

              <section className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                <h4 className="font-extrabold text-slate-950 dark:text-white text-sm">
                  6. Your Rights
                </h4>
                <p className="text-xs">You can:</p>
                <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm">
                  <li>View and edit your profile at any time</li>
                  <li>Request a copy of your data</li>
                  <li>
                    Request deletion of your account and data in{' '}
                    <strong>App &gt; Profile &gt; Settings &gt; Delete Account</strong>
                  </li>
                </ul>
                <p className="text-xs pt-1">
                  Contact us at{' '}
                  <a
                    href="mailto:nanabekoeansahhayford@gmail.com"
                    className="font-bold text-[#00875A] dark:text-emerald-400 hover:underline"
                  >
                    nanabekoeansahhayford@gmail.com
                  </a>{' '}
                  for any privacy request. We will respond within 30 days.
                </p>
              </section>

              <section className="space-y-1.5">
                <h4 className="font-extrabold text-slate-950 dark:text-white text-sm">
                  7. Children
                </h4>
                <p>
                  OGYA is for users 18 years and older. We do not knowingly collect data from children under 18.
                </p>
              </section>

              <section className="space-y-1.5">
                <h4 className="font-extrabold text-slate-950 dark:text-white text-sm">
                  8. Changes
                </h4>
                <p>
                  If we change this policy, we will update the date above and notify you in the app.
                </p>
              </section>
            </div>
          )}

          {/* 2. TERMS OF SERVICE */}
          {activePage === 'terms' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#FF6600]">
                  Last Updated: November 14, 2026
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-slate-950 dark:text-white mt-1">
                  OGYA (FIRE) - Terms of Service
                </h2>
              </div>

              <section className="space-y-1.5">
                <h4 className="font-extrabold text-slate-950 dark:text-white text-sm">
                  1. What OGYA Is
                </h4>
                <p>
                  OGYA is a marketplace platform. We connect buyers and sellers. We are not the seller of most products listed. Sellers are responsible for the accuracy of their listings.
                </p>
              </section>

              <section className="space-y-2">
                <h4 className="font-extrabold text-slate-950 dark:text-white text-sm">
                  2. Accounts
                </h4>
                <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm">
                  <li>You must be 18+ to register</li>
                  <li>You must provide accurate name and phone number</li>
                  <li>You are responsible for keeping your account secure</li>
                  <li>One account per person. Fake accounts will be banned</li>
                </ul>
              </section>

              <section className="space-y-2">
                <h4 className="font-extrabold text-slate-950 dark:text-white text-sm">
                  3. Verified Sellers
                </h4>
                <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm">
                  <li>&ldquo;GH Verified Badge&rdquo; means the seller has completed phone verification and ID check with OGYA</li>
                  <li>It does NOT mean OGYA guarantees every product. Buyers must still inspect items on delivery</li>
                  <li>OGYA may remove a Verified Badge if a seller violates these terms</li>
                </ul>
              </section>

              <section className="space-y-2">
                <h4 className="font-extrabold text-slate-950 dark:text-white text-sm">
                  4. Listings
                </h4>
                <p>Sellers agree NOT to post:</p>
                <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm">
                  <li>Stolen goods, fake products, weapons, drugs, or illegal items</li>
                  <li>Misleading photos, prices, or descriptions</li>
                  <li>Contact info to bypass OGYA escrow and scam buyers</li>
                </ul>
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  OGYA may remove any listing without notice.
                </p>
              </section>

              <section className="space-y-2">
                <h4 className="font-extrabold text-slate-950 dark:text-white text-sm">
                  5. Orders and Delivery
                </h4>
                <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm">
                  <li>OGYA offers 1-2 hour doorstep delivery in Accra where available. Delivery times outside Accra may vary</li>
                  <li>Buyer must inspect item on delivery before confirming receipt</li>
                  <li>If buyer is not available, courier may reschedule</li>
                </ul>
              </section>

              <section className="space-y-2">
                <h4 className="font-extrabold text-slate-950 dark:text-white text-sm">
                  6. Prohibited Conduct
                </h4>
                <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm">
                  <li>Fraud, scamming, harassment, threats, or abusive language</li>
                  <li>Creating multiple accounts to evade a ban</li>
                  <li>Using OGYA to launder money or commit fraud</li>
                </ul>
                <p className="text-xs font-semibold text-rose-700 dark:text-rose-400">
                  Violation will result in warning, suspension, or permanent ban.
                </p>
              </section>

              <section className="space-y-1.5">
                <h4 className="font-extrabold text-slate-950 dark:text-white text-sm">
                  7. Liability
                </h4>
                <p>
                  OGYA provides the platform &ldquo;as is&rdquo;. To the maximum extent allowed by Ghana law, OGYA is not liable for loss caused by a seller&apos;s product, but we will assist in dispute resolution and escrow refunds as described in our Refund Policy.
                </p>
              </section>

              <section className="space-y-2">
                <h4 className="font-extrabold text-slate-950 dark:text-white text-sm">
                  8. Changes &amp; Governing Law
                </h4>
                <p>
                  We may update these terms. Continued use of the app means you accept the new terms.
                </p>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white">
                  Governing Law: Laws of the Republic of Ghana.
                </div>
              </section>
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
                    Buyer pays via Mobile Money to OGYA. <strong>OGYA holds the money securely</strong> — the seller does NOT get paid yet.
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
                    Do NOT confirm receipt. Tap <strong>Report / Dispute within 24 hours</strong> with photo/video proof; OGYA Support reviews within 48 hours.
                  </p>
                </div>
              </div>

              <section className="space-y-2">
                <h4 className="font-extrabold text-slate-950 dark:text-white text-sm">
                  1. How Escrow Works
                </h4>
                <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm">
                  <li>Buyer pays via Mobile Money to OGYA</li>
                  <li>OGYA holds the money securely — seller does NOT get paid yet</li>
                  <li>Courier delivers the item</li>
                  <li>Buyer inspects the item on delivery and confirms receipt in the app</li>
                  <li>OGYA then releases payment to the seller, minus OGYA service fee</li>
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
                  <li>OGYA Support will review within 48 hours and decide</li>
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
                    Never send mobile money deposits, delivery fees, or &ldquo;holding fees&rdquo; to an individual&apos;s personal number before inspecting goods. Use OGYA Escrow at checkout so your funds stay protected until delivery.
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
                      OGYA staff will never ask for your Mobile Money PIN or password. When receiving a courier delivery, inspect the item at your doorstep first before sharing your 4-digit release OTP.
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
