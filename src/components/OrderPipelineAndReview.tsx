import React, { useState } from 'react';
import {
  CheckCircle2,
  Clock,
  Truck,
  PackageCheck,
  Upload,
  Star,
  AlertCircle,
  Send,
  Receipt,
} from 'lucide-react';
import { Order, Review, normalizeOrderStatus } from '../types/store';
import { uploadImageToCloudinary } from '../utils/imageUpload';
import { updateOrderProofUrlInFirestore, saveReviewToFirestore } from '../utils/firebase';

interface OrderPipelineAndReviewProps {
  order: Order;
  currentUserId?: string;
  currentUserName?: string;
  onOrderUpdated?: (orderId: string, updates: Partial<Order>) => void;
  onReviewCreated?: (review: Review) => void;
}

const PIPELINE_STEPS = ['Pending', 'Confirmed', 'On Delivery', 'Delivered'] as const;

export const OrderPipelineAndReview: React.FC<OrderPipelineAndReviewProps> = ({
  order,
  currentUserId,
  currentUserName,
  onOrderUpdated,
  onReviewCreated,
}) => {
  const [isUploadingProof, setIsUploadingProof] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [localProofUrl, setLocalProofUrl] = useState<string>(order.proofUrl || '');

  // Review state (shown when Delivered)
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [reviewSubmitted, setReviewSubmitted] = useState<boolean>(Boolean(order.hasReviewed));

  const canonical = normalizeOrderStatus(order.status);
  const activeStepIndex =
    canonical === 'Cancelled'
      ? -1
      : PIPELINE_STEPS.indexOf(canonical);

  const displayProofUrl = localProofUrl || order.proofUrl || '';
  const isDelivered = canonical === 'Delivered';

  const handleUploadProof = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    setIsUploadingProof(true);
    setUploadProgress(5);

    try {
      const res = await uploadImageToCloudinary(file, (pct) => setUploadProgress(pct));
      setLocalProofUrl(res.secureUrl);
      await updateOrderProofUrlInFirestore(order.id, res.secureUrl);
      onOrderUpdated?.(order.id, { proofUrl: res.secureUrl });
    } catch (err: any) {
      console.log('Order MoMo proof upload error:', err);
      setUploadError(err?.message || 'Could not upload MoMo payment screenshot.');
    } finally {
      setIsUploadingProof(false);
      e.target.value = '';
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setReviewError(null);

    if (!comment.trim()) {
      setReviewError('Please write a brief review comment before submitting.');
      return;
    }

    setIsSubmittingReview(true);
    try {
      const firstItem = order.items?.[0];
      const reviewId = `rev-${Date.now()}-${Math.floor(Math.random() * 900 + 100)}`;
      const newReview: Review = {
        id: reviewId,
        orderId: /^[a-zA-Z0-9_-]+$/.test(order.id) ? order.id : undefined,
        productId:
          order.productId || (firstItem?.id && /^[a-zA-Z0-9_-]+$/.test(firstItem.id) ? firstItem.id : undefined),
        listingId:
          order.productId || (firstItem?.id && /^[a-zA-Z0-9_-]+$/.test(firstItem.id) ? firstItem.id : undefined),
        sellerId:
          order.sellerId || order.vendorId || firstItem?.vendorId || undefined,
        sellerName: order.sellerName || firstItem?.vendorName || 'OGYA Verified Vendor',
        userId: currentUserId || order.userId || 'guest-buyer',
        buyerName: currentUserName || order.buyerName || 'OGYA Buyer',
        rating,
        comment: comment.trim(),
        createdAt: new Date().toISOString(),
      };

      const res = await saveReviewToFirestore(newReview);
      setReviewSubmitted(true);
      onOrderUpdated?.(order.id, { hasReviewed: true, reviewId: res.review.id });
      onReviewCreated?.(res.review);
    } catch (err: any) {
      setReviewError(err?.message || 'Failed to save review. Please try again.');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  return (
    <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-700/70">
      {/* 1. Order Status 4-Step Pipeline */}
      {canonical !== 'Cancelled' && (
        <div className="p-3 rounded-xl bg-slate-950 text-white border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-wider">
            <span className="text-amber-400">Order Progress</span>
            <span className="text-emerald-400">{canonical}</span>
          </div>
          <div className="grid grid-cols-4 gap-1.5">
            {PIPELINE_STEPS.map((step, idx) => {
              const reached = idx <= activeStepIndex;
              const isCurrent = idx === activeStepIndex;
              const Icon =
                step === 'Pending'
                  ? Clock
                  : step === 'Confirmed'
                  ? CheckCircle2
                  : step === 'On Delivery'
                  ? Truck
                  : PackageCheck;
              return (
                <div
                  key={step}
                  className={`p-2 rounded-lg border text-center transition-all ${
                    isCurrent
                      ? 'bg-[#FF6600]/20 border-[#FF6600] text-amber-300'
                      : reached
                      ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                      : 'bg-slate-900 border-slate-800 text-slate-500'
                  }`}
                >
                  <Icon size={13} className="mx-auto mb-1" />
                  <span className="block text-[10px] font-bold leading-tight">{step}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. Upload / View MoMo Payment Proof */}
      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
            <Receipt size={14} className="text-[#FF6600]" />
            <span>MoMo Payment Proof</span>
          </span>
          {displayProofUrl ? (
            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              ✅ Proof Uploaded
            </span>
          ) : (
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
              Not uploaded yet
            </span>
          )}
        </div>

        {displayProofUrl && (
          <a
            href={displayProofUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 bg-black/5 max-w-[200px]"
          >
            <img
              src={displayProofUrl}
              alt="MoMo payment proof screenshot"
              className="w-full h-28 object-cover"
            />
          </a>
        )}

        {uploadError && (
          <div className="text-[11px] text-rose-600 dark:text-rose-400 font-semibold flex items-center gap-1">
            <AlertCircle size={12} />
            <span>{uploadError}</span>
          </div>
        )}

        <label className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#FF6600] hover:bg-orange-600 text-white font-black text-xs cursor-pointer transition-colors shadow-2xs">
          <Upload size={13} />
          <span>
            {isUploadingProof
              ? `Uploading Proof... ${uploadProgress}%`
              : displayProofUrl
              ? 'Update MoMo Payment Proof'
              : 'Upload MoMo Payment Proof'}
          </span>
          <input
            type="file"
            accept="image/*"
            disabled={isUploadingProof}
            onChange={handleUploadProof}
            className="hidden"
          />
        </label>
      </div>

      {/* 3. Leave 1-5 Star Review after Order is Delivered */}
      {isDelivered && (
        <div className="p-3.5 rounded-xl bg-amber-50/70 dark:bg-slate-950 border border-amber-300/70 dark:border-amber-500/40 space-y-2.5">
          {reviewSubmitted ? (
            <div className="flex items-center gap-2 text-xs font-black text-emerald-700 dark:text-emerald-400">
              <CheckCircle2 size={15} />
              <span>Thank you! Your review has been published to OGYA.</span>
            </div>
          ) : (
            <form onSubmit={handleSubmitReview} className="space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-black text-slate-900 dark:text-amber-300">
                  Rate Your Order (1–5 Stars)
                </span>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((starVal) => (
                    <button
                      key={starVal}
                      type="button"
                      onClick={() => setRating(starVal)}
                      className="p-0.5 cursor-pointer transition-transform hover:scale-110"
                      aria-label={`Rate ${starVal} stars`}
                    >
                      <Star
                        size={18}
                        className={
                          starVal <= rating
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-slate-300 dark:text-slate-600'
                        }
                      />
                    </button>
                  ))}
                </div>
              </div>

              <textarea
                rows={2}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="How was the item quality and delivery speed?"
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-[#FF6600]"
                required
              />

              {reviewError && (
                <div className="text-[11px] text-rose-600 dark:text-rose-400 font-semibold">
                  {reviewError}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmittingReview}
                className="px-4 py-2 rounded-xl bg-slate-950 dark:bg-[#FF6600] hover:bg-slate-800 dark:hover:bg-orange-600 text-white font-black text-xs inline-flex items-center gap-1.5 cursor-pointer transition-colors disabled:opacity-50"
              >
                <Send size={12} />
                <span>{isSubmittingReview ? 'Submitting Review...' : 'Submit Review'}</span>
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
};
