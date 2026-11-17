import React, { useState } from 'react';
import {
  ArrowLeft,
  BadgeCheck,
  CheckCircle2,
  Upload,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Smartphone,
  AlertCircle,
  MapPin,
} from 'lucide-react';
import { UserProfile } from '../types/marketplace';
import { uploadImageToCloudinary } from '../utils/imageUpload';
import { subscribeSellerVerified } from '../utils/verification';
import { submitVerifiedBadgeMoMoProof } from '../utils/firebase';
import { HOME_LOCATIONS } from '../utils/marketplaceHelpers';

interface BecomeVerifiedPageProps {
  currentUser: UserProfile | null;
  onNavigateHome: () => void;
  onOpenAuth: (mode?: 'register' | 'signin', role?: 'buyer' | 'seller') => void;
  onVerificationSuccess: (updatedUser: UserProfile, message: string) => void;
}

const SELLER_LOCATIONS = HOME_LOCATIONS.filter((l) => l !== 'All');

export const BecomeVerifiedPage: React.FC<BecomeVerifiedPageProps> = ({
  currentUser,
  onNavigateHome,
  onOpenAuth,
  onVerificationSuccess,
}) => {
  const [shopName, setShopName] = useState(currentUser?.businessName || currentUser?.name || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [location, setLocation] = useState(currentUser?.city || 'Accra');
  const [momoNetwork, setMomoNetwork] = useState<'MTN MoMo' | 'Telecel Cash' | 'AT Money'>('MTN MoMo');
  const [proofUrl, setProofUrl] = useState('');
  const [proofPreview, setProofPreview] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activated, setActivated] = useState(Boolean(currentUser?.isSubscribedVerified || currentUser?.isVerified));

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    setIsUploading(true);
    setUploadProgress(5);
    setProofPreview(URL.createObjectURL(file));

    try {
      const result = await uploadImageToCloudinary(file, (pct) => setUploadProgress(pct));
      setProofUrl(result.secureUrl);
    } catch (err: any) {
      console.log('Verification MoMo proof upload error:', err);
      setUploadError(err?.message || 'Failed to upload MoMo screenshot.');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const handleActivate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      onOpenAuth('signin', 'seller');
      return;
    }
    if (!proofUrl) {
      setUploadError('Please upload your GH₵50 MoMo payment screenshot first.');
      return;
    }

    setIsSubmitting(true);
    try {
      const record = subscribeSellerVerified({
        userId: currentUser.id,
        sellerName: shopName.trim() || currentUser.name,
        paymentMethod: momoNetwork,
        proofUrl,
        amount: 50,
      });

      await submitVerifiedBadgeMoMoProof({
        uid: currentUser.id,
        shopName: shopName.trim() || currentUser.name,
        phone: phone.trim() || currentUser.phone,
        location,
        proofUrl,
      });

      const updatedUser: UserProfile = {
        ...currentUser,
        businessName: shopName.trim() || currentUser.businessName,
        city: location,
        isVerified: true,
        isSubscribedVerified: true,
        subscriptionPlan: 'Verified Seller (GH₵50)',
        verifiedAmount: 50,
        verifiedExpiresAt: record.expiresAt,
        verificationProofUrl: proofUrl,
        verificationStatus: 'verified',
      };

      setActivated(true);
      onVerificationSuccess(
        updatedUser,
        '✅ Verified Seller Badge (GH₵50) activated! Your shop & products now show ✅ VERIFIED.'
      );
    } catch (err: any) {
      setUploadError(err?.message || 'Could not activate Verified Badge. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white pb-16 overflow-x-hidden">
      {/* Top Bar */}
      <div className="border-b border-slate-800 bg-slate-950/95 sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 py-3.5 flex items-center justify-between flex-wrap gap-2 sm:gap-3">
          <button
            type="button"
            onClick={onNavigateHome}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-bold text-slate-200 cursor-pointer transition-colors"
          >
            <ArrowLeft size={15} />
            <span>Back to Marketplace</span>
          </button>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[11px] sm:text-xs font-black">
            ✅ VERIFIED SELLER PROGRAM
          </span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-3 sm:px-4 py-6 sm:py-8 space-y-6">
        {/* Hero Banner */}
        <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-slate-950 to-orange-950/70 border border-orange-500/40 p-5 sm:p-8 shadow-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 sm:gap-6">
            <div className="space-y-2.5 min-w-0">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/20 border border-orange-500/40 text-amber-300 text-xs font-black uppercase tracking-wider">
                <Sparkles size={13} />
                <span>Priority Placement + Buyer Trust</span>
              </span>
              <h1 className="text-[clamp(1.35rem,4vw,2.25rem)] font-black tracking-tight text-white leading-tight">
                Become Verified - <span className="text-amber-400">GH₵50</span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
                Stand out across Accra, Kumasi, Tema & all of Ghana. Verified sellers get ranked{' '}
                <strong className="text-white">FIRST</strong> in every search & category and display the green{' '}
                <strong className="text-emerald-400">✅ VERIFIED</strong> badge on their shop and every product.
              </p>
            </div>

            <div className="bg-slate-900 border border-amber-500/50 rounded-2xl p-4 text-center shrink-0 w-full sm:w-auto sm:min-w-[160px]">
              <span className="text-[11px] uppercase font-bold text-slate-400 block">Verification Fee</span>
              <span className="text-3xl font-black text-amber-400 block mt-0.5">GH₵50</span>
              <span className="text-[11px] text-emerald-400 font-bold block mt-1">Instant MoMo Proof</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6">
            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-start gap-2.5">
              <BadgeCheck size={18} className="text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-xs font-black text-white">✅ VERIFIED Badge</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Displayed on your shop profile and all products.</p>
              </div>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-start gap-2.5">
              <TrendingUp size={18} className="text-amber-400 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-xs font-black text-white">Sorted First</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Verified sellers automatically appear above unverified listings.</p>
              </div>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-start gap-2.5">
              <ShieldCheck size={18} className="text-[#FF6600] shrink-0 mt-0.5" />
              <div>
                <h3 className="text-xs font-black text-white">More WhatsApp Orders</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Buyers trust verified shops with their MoMo orders.</p>
              </div>
            </div>
          </div>
        </div>

        {/* MoMo Instructions + Proof Form */}
        {activated ? (
          <div className="rounded-3xl bg-emerald-950/50 border border-emerald-500/40 p-6 sm:p-8 text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center mx-auto">
              <CheckCircle2 size={30} />
            </div>
            <h2 className="text-xl font-black text-white">You Are Now a Verified Seller! ✅ VERIFIED</h2>
            <p className="text-xs sm:text-sm text-emerald-200 max-w-md mx-auto">
              Your OGYA account and products now display the green <strong>✅ VERIFIED</strong> badge and rank first in marketplace feeds.
            </p>
            <button
              type="button"
              onClick={onNavigateHome}
              className="mt-2 px-6 py-3 rounded-xl bg-[#FF6600] hover:bg-orange-600 text-white font-black text-xs sm:text-sm cursor-pointer transition-colors"
            >
              Return to Marketplace
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left: MoMo Payment Instructions */}
            <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 sm:p-6 space-y-4">
              <div className="flex items-center gap-2 text-amber-400 font-black text-sm">
                <Smartphone size={18} />
                <span>Step 1: Send GH₵50 via Mobile Money</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-amber-500/40 space-y-2 text-xs">
                <div className="flex justify-between items-center flex-wrap gap-1.5">
                  <span className="text-slate-400">MTN MoMo Number:</span>
                  <span className="font-mono font-black text-amber-400 text-sm">054 976 9720</span>
                </div>
                <div className="flex justify-between items-center flex-wrap gap-1.5">
                  <span className="text-slate-400">Merchant Name:</span>
                  <span className="font-black text-white">OGYA (FIRE) Ghana Marketplace</span>
                </div>
                <div className="flex justify-between items-center flex-wrap gap-1.5">
                  <span className="text-slate-400">Amount:</span>
                  <span className="font-black text-emerald-400">GH₵ 50.00</span>
                </div>
                <div className="flex justify-between items-center flex-wrap gap-1.5">
                  <span className="text-slate-400">Reference:</span>
                  <span className="font-mono font-bold text-white">OGYA VERIFIED</span>
                </div>
              </div>

              <ol className="text-xs text-slate-300 space-y-2 list-decimal list-inside leading-relaxed">
                <li>Dial <strong>*170#</strong> (MTN MoMo) or open your Telecel Cash / AT Money app.</li>
                <li>Transfer <strong>GH₵50.00</strong> to <strong>054 976 9720</strong> using reference <strong>OGYA VERIFIED</strong>.</li>
                <li>Take a screenshot of your MoMo confirmation SMS / receipt.</li>
                <li>Upload the screenshot on the right to activate your <strong>✅ VERIFIED</strong> badge immediately.</li>
              </ol>
            </div>

            {/* Right: Upload MoMo Screenshot & Submit */}
            <form onSubmit={handleActivate} className="rounded-2xl bg-slate-900 border border-orange-500/40 p-5 sm:p-6 space-y-4">
              <h2 className="text-sm font-black text-white">Step 2: Upload MoMo Payment Screenshot</h2>

              {!currentUser && (
                <div className="p-3 rounded-xl bg-orange-500/15 border border-orange-500/40 text-xs text-amber-200 flex items-center justify-between gap-2">
                  <span>Sign in as a seller to activate your badge.</span>
                  <button
                    type="button"
                    onClick={() => onOpenAuth('signin', 'seller')}
                    className="px-3 py-1.5 rounded-lg bg-[#FF6600] text-white font-black text-[11px] cursor-pointer shrink-0"
                  >
                    Sign In
                  </button>
                </div>
              )}

              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">Shop / Seller Name</label>
                  <input
                    type="text"
                    value={shopName}
                    onChange={(e) => setShopName(e.target.value)}
                    placeholder="e.g. Kofi Electronics Accra"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 focus:border-[#FF6600] text-white text-xs font-semibold focus:outline-none"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-1">MoMo / Phone</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="024 000 0000"
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 focus:border-[#FF6600] text-white text-xs font-semibold focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-1 flex items-center gap-1">
                      <MapPin size={11} className="text-amber-400" />
                      <span>Location</span>
                    </label>
                    <select
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 focus:border-[#FF6600] text-white text-xs font-semibold focus:outline-none"
                    >
                      {SELLER_LOCATIONS.map((loc) => (
                        <option key={loc} value={loc}>
                          {loc}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">Network Used</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(['MTN MoMo', 'Telecel Cash', 'AT Money'] as const).map((net) => (
                      <button
                        key={net}
                        type="button"
                        onClick={() => setMomoNetwork(net)}
                        className={`py-2 px-2 rounded-xl text-[11px] font-black border cursor-pointer transition-all ${
                          momoNetwork === net
                            ? 'bg-amber-500 text-slate-950 border-amber-400'
                            : 'bg-slate-950 text-slate-300 border-slate-700'
                        }`}
                      >
                        {net}
                      </button>
                    ))}
                  </div>
                </div>

                {(proofPreview || proofUrl) && (
                  <div className="relative rounded-xl overflow-hidden border border-slate-700 bg-black">
                    <img
                      src={proofUrl || proofPreview}
                      alt="GH₵50 MoMo proof screenshot"
                      className="w-full max-h-40 object-contain"
                    />
                    {isUploading && (
                      <div className="absolute inset-0 bg-black/75 flex flex-col items-center justify-center p-3 gap-1.5">
                        <span className="text-xs font-black text-amber-400">Uploading... {uploadProgress}%</span>
                        <div className="w-40 h-2 bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-[#FF6600]" style={{ width: `${uploadProgress}%` }} />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {uploadError && (
                  <div className="p-2.5 rounded-xl bg-rose-950/70 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-1.5">
                    <AlertCircle size={14} className="shrink-0" />
                    <span>{uploadError}</span>
                  </div>
                )}

                <label className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors">
                  <Upload size={15} className="text-amber-400" />
                  <span>
                    {isUploading
                      ? `Uploading Screenshot... ${uploadProgress}%`
                      : proofUrl
                      ? 'MoMo Proof Uploaded ✅ (Change)'
                      : 'Upload GH₵50 MoMo Screenshot'}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    disabled={isUploading}
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || isUploading}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#FF6600] to-amber-500 hover:opacity-95 text-slate-950 font-black text-sm shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
              >
                <BadgeCheck size={18} />
                <span>{isSubmitting ? 'Activating Badge...' : 'Activate ✅ VERIFIED Badge (GH₵50)'}</span>
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
