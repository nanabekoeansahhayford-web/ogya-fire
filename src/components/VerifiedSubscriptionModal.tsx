import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  CheckCircle2,
  Smartphone,
  Upload,
  Award,
  Users,
  Zap,
  AlertCircle,
  BadgeCheck,
  TrendingUp,
} from 'lucide-react';
import { UserProfile } from '../types/marketplace';
import { subscribeSellerVerified } from '../utils/verification';
import { submitVerifiedBadgeMoMoProof } from '../utils/firebase';
import { uploadImageToCloudinary } from '../utils/imageUpload';

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
  const [momoProvider, setMomoProvider] = useState<'MTN MoMo' | 'Telecel Cash' | 'AT Money'>('MTN MoMo');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [proofUrl, setProofUrl] = useState('');
  const [proofPreview, setProofPreview] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSelectScreenshot = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    setIsUploading(true);
    setUploadProgress(5);
    setProofPreview(URL.createObjectURL(file));

    try {
      const res = await uploadImageToCloudinary(file, (pct) => setUploadProgress(pct));
      setProofUrl(res.secureUrl);
    } catch (err: any) {
      console.log('Verified badge proof upload error:', err);
      setUploadError(err?.message || 'Failed to upload MoMo screenshot.');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const handleActivateVerified = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser) {
      onClose();
      onOpenAuth();
      return;
    }

    if (!proofUrl) {
      setUploadError('Please upload your GH₵50 MoMo payment screenshot first.');
      return;
    }

    setIsProcessing(true);
    setUploadError(null);
    try {
      const record = subscribeSellerVerified({
        userId: currentUser.id,
        sellerName: currentUser.businessName || currentUser.name,
        paymentMethod: momoProvider,
        proofUrl,
        amount: 50,
      });

      await submitVerifiedBadgeMoMoProof({
        uid: currentUser.id,
        shopName: currentUser.businessName || currentUser.name,
        phone: phone.trim() || currentUser.phone,
        location: currentUser.city || currentUser.region || 'Accra',
        proofUrl,
      });

      const updatedUser: UserProfile = {
        ...currentUser,
        isVerified: true,
        isSubscribedVerified: true,
        subscriptionPlan: 'Verified Seller (GH₵50)',
        verifiedAmount: 50,
        verifiedExpiresAt: record.expiresAt,
        verificationProofUrl: proofUrl,
        verificationStatus: 'verified',
      };

      setIsProcessing(false);
      setIsSuccess(true);

      setTimeout(() => {
        onSubscriptionSuccess(
          updatedUser,
          '✅ Verified Seller Badge (GH₵50) activated! Your shop & products now show ✅ VERIFIED.'
        );
        setIsSuccess(false);
        onClose();
      }, 1500);
    } catch (err: any) {
      setUploadError(err?.message || 'Could not activate Verified Badge. Please try again.');
      setIsProcessing(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 md:p-6 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative bg-slate-950 text-white rounded-2xl max-w-xl w-full shadow-2xl border border-orange-500/40 overflow-hidden my-auto max-h-[94vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-slate-950 via-slate-900 to-orange-950/80 text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#FF6600] to-amber-400 flex items-center justify-center font-bold text-slate-950 shadow-md">
              <BadgeCheck size={22} />
            </div>
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-1.5 flex-wrap">
                <span>Become Verified - GH₵50</span>
                <span className="text-[10px] bg-emerald-500 text-slate-950 font-extrabold uppercase px-2 py-0.5 rounded">
                  ✅ VERIFIED BADGE
                </span>
              </h3>
              <p className="text-[11px] text-amber-300">
                Pay GH₵50 via Mobile Money & upload screenshot to unlock Verified Seller status
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto p-5 sm:p-6 space-y-5 flex-1">
          {isSuccess ? (
            <div className="py-8 text-center space-y-4 animate-in zoom-in-95 duration-200">
              <div className="w-20 h-20 rounded-full bg-emerald-950/80 border border-emerald-500/50 text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 size={44} />
              </div>
              <h4 className="text-lg font-black text-white">
                ✅ VERIFIED Badge Activated!
              </h4>
              <p className="text-xs text-slate-300 max-w-sm mx-auto leading-relaxed">
                Your <strong>GH₵50 Verified Seller</strong> badge is active. Your shop & products now show{' '}
                <strong className="text-emerald-400">✅ VERIFIED</strong> and sort first in all lists.
              </p>
            </div>
          ) : (
            <form onSubmit={handleActivateVerified} className="space-y-4">
              {/* Showcase */}
              <div className="p-4 bg-slate-900 border border-orange-500/30 rounded-2xl flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-[#FF6600] to-amber-400 flex items-center justify-center text-slate-950 shadow-md shrink-0">
                    <Award size={22} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-black text-white truncate">
                        {currentUser?.businessName || currentUser?.name || 'Your OGYA Shop'}
                      </span>
                      <span className="text-[10px] font-black text-white bg-emerald-600 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                        ✅ VERIFIED
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400 block mt-0.5">
                      Sorted FIRST in all searches & product grids
                    </span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-xl font-black text-amber-400 tabular-nums">GH₵50</span>
                  <span className="text-[10px] text-slate-400 block">MoMo Fee</span>
                </div>
              </div>

              {/* Perks */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex items-start gap-2">
                  <TrendingUp size={15} className="text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-xs font-bold text-white">Ranked First</h5>
                    <p className="text-[11px] text-slate-400 mt-0.5">Verified sellers always sort before unverified sellers.</p>
                  </div>
                </div>
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex items-start gap-2">
                  <Zap size={15} className="text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-xs font-bold text-white">✅ VERIFIED Badge</h5>
                    <p className="text-[11px] text-slate-400 mt-0.5">Green verified badge shown on your shop & every product.</p>
                  </div>
                </div>
              </div>

              {/* MoMo Payment Instructions */}
              <div className="p-4 rounded-xl bg-slate-900 border border-amber-500/40 space-y-2.5 text-xs">
                <div className="flex items-center gap-2 font-black text-amber-400">
                  <Smartphone size={16} />
                  <span>MoMo Payment Instructions (GH₵50)</span>
                </div>
                <div className="grid grid-cols-2 gap-2 p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Send GH₵50 To (MTN MoMo)</span>
                    <span className="font-mono font-black text-amber-400 text-sm">054 976 9720</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Account Name / Ref</span>
                    <span className="font-bold text-white">OGYA Ghana · VERIFIED</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-1.5">
                  {(['MTN MoMo', 'Telecel Cash', 'AT Money'] as const).map((net) => (
                    <button
                      key={net}
                      type="button"
                      onClick={() => setMomoProvider(net)}
                      className={`py-1.5 px-2 rounded-lg text-[11px] font-black border cursor-pointer transition-colors ${
                        momoProvider === net
                          ? 'bg-amber-400 text-slate-950 border-amber-500'
                          : 'bg-slate-950 text-slate-300 border-slate-700'
                      }`}
                    >
                      {net}
                    </button>
                  ))}
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    Your MoMo Number Used
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. 024 123 4567"
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 focus:border-[#FF6600] text-white text-xs font-bold focus:outline-none"
                    required
                  />
                </div>
              </div>

              {/* Cloudinary MoMo Proof Upload */}
              <div className="space-y-2.5">
                {(proofPreview || proofUrl) && (
                  <div className="relative rounded-xl overflow-hidden border border-slate-700 bg-black">
                    <img
                      src={proofUrl || proofPreview}
                      alt="GH₵50 MoMo screenshot"
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
                      : 'Upload GH₵50 MoMo Payment Proof'}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    disabled={isUploading}
                    onChange={handleSelectScreenshot}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Submit CTA */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isProcessing}
                  className="px-4 py-2.5 text-xs font-bold text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isProcessing || isUploading}
                  className="px-6 py-2.5 bg-gradient-to-r from-[#FF6600] to-amber-500 hover:opacity-95 text-slate-950 font-black text-xs sm:text-sm rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <ShieldCheck size={16} />
                  <span>{isProcessing ? 'Activating...' : 'Activate ✅ VERIFIED (GH₵50)'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

