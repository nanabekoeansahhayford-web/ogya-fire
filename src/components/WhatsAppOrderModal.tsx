import React, { useState, useEffect } from 'react';
import {
  X,
  MapPin,
  Phone,
  User,
  MessageCircle,
  Upload,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  PackageCheck,
  Sparkles,
} from 'lucide-react';
import { Order } from '../types/store';
import { UserProfile } from '../types/marketplace';
import { generateOrderWhatsAppUrl } from '../utils/whatsapp';
import { placeWhatsAppOrder, updateOrderProofUrlInFirestore } from '../utils/firebase';
import { uploadImageToCloudinary } from '../utils/imageUpload';
import { HOME_LOCATIONS } from '../utils/marketplaceHelpers';

export interface WhatsAppOrderTarget {
  productId: string;
  productName: string;
  price: number;
  category: string;
  imageUrl: string;
  sellerId?: string;
  vendorId: string;
  sellerName: string;
  sellerPhone: string;
  sellerLocation?: string;
  isVerified?: boolean;
}

interface WhatsAppOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  target: WhatsAppOrderTarget | null;
  currentUser: UserProfile | null;
  onOrderCreated?: (order: Order) => void;
  onOpenMyOrders?: () => void;
}

const LOCATION_CHIPS = HOME_LOCATIONS.filter((l) => l !== 'All');

export const WhatsAppOrderModal: React.FC<WhatsAppOrderModalProps> = ({
  isOpen,
  onClose,
  target,
  currentUser,
  onOrderCreated,
  onOpenMyOrders,
}) => {
  const [step, setStep] = useState<'order' | 'proof'>('order');
  const [buyerLocation, setBuyerLocation] = useState<string>('Accra');
  const [buyerName, setBuyerName] = useState<string>('');
  const [buyerPhone, setBuyerPhone] = useState<string>('');
  const [deliveryPreference, setDeliveryPreference] = useState<'Delivery' | 'Pickup'>('Delivery');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Step 2: Post-order + MoMo proof upload state
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);
  const [whatsappUrl, setWhatsappUrl] = useState<string>('');
  const [proofPreviewUrl, setProofPreviewUrl] = useState<string>('');
  const [proofUrl, setProofUrl] = useState<string>('');
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploadingProof, setIsUploadingProof] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [proofSaved, setProofSaved] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setStep('order');
      setError(null);
      setCreatedOrder(null);
      setWhatsappUrl('');
      setProofPreviewUrl('');
      setProofUrl('');
      setUploadProgress(0);
      setIsUploadingProof(false);
      setUploadError(null);
      setProofSaved(false);
      setBuyerName(currentUser?.name || '');
      setBuyerPhone(currentUser?.phone || '');
      if (currentUser?.city) {
        setBuyerLocation(currentUser.city);
      }
    }
  }, [isOpen, target?.productId, currentUser]);

  if (!isOpen || !target) return null;

  const trimmedLoc = buyerLocation.trim() || 'Accra';
  const previewMessage = `Hi, I want to order ${target.productName} - GH₵${Number(
    target.price || 0
  ).toLocaleString('en-US')} from OGYA. My location is ${trimmedLoc}. Delivery or Pickup?`;

  const handlePlaceWhatsAppOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!trimmedLoc) {
      setError('Please select or enter your location so the vendor can arrange delivery.');
      return;
    }

    const phoneToSave = buyerPhone.trim() || currentUser?.phone || '+233 00 000 0000';
    const nameToSave = buyerName.trim() || currentUser?.name || 'OGYA Guest Buyer';

    setIsSubmitting(true);
    try {
      const orderId = `ord-wa-${Date.now()}-${Math.floor(Math.random() * 900 + 100)}`;
      const safeSellerId =
        target.sellerId && /^[a-zA-Z0-9_-]+$/.test(target.sellerId)
          ? target.sellerId
          : target.vendorId && /^[a-zA-Z0-9_-]+$/.test(target.vendorId)
          ? target.vendorId
          : 'vnd-ogya-central';

      const newOrder: Order = {
        id: orderId,
        userId: currentUser?.id || `guest-${Date.now()}`,
        buyerId: currentUser?.id || `guest-${Date.now()}`,
        buyerName: nameToSave,
        vendorId: safeSellerId,
        sellerId: safeSellerId,
        sellerIds: [safeSellerId],
        sellerName: target.sellerName,
        sellerPhone: target.sellerPhone,
        productId: /^[a-zA-Z0-9_-]+$/.test(target.productId) ? target.productId : undefined,
        items: [
          {
            id: target.productId,
            name: target.productName,
            price: target.price,
            category: target.category || 'Everything',
            imageUrl: target.imageUrl || '',
            quantity: 1,
            stock: 99,
            vendorId: safeSellerId,
            vendorName: target.sellerName,
          },
        ],
        total: target.price,
        deliveryAddress: `${trimmedLoc} (${deliveryPreference})`,
        buyerLocation: trimmedLoc,
        phone: phoneToSave,
        status: 'Pending',
        paymentMethod: 'WhatsApp + MoMo',
        whatsappOrder: true,
        createdAt: new Date().toISOString(),
      };

      const { order } = await placeWhatsAppOrder(newOrder);
      const waUrl = generateOrderWhatsAppUrl(
        target.sellerPhone,
        target.productName,
        target.price,
        trimmedLoc
      );

      setCreatedOrder(order);
      setWhatsappUrl(waUrl);
      setStep('proof');
      onOrderCreated?.(order);

      // Open WhatsApp immediately in a new tab; clickable anchor stays rendered in Step 2 as reliable fallback
      try {
        window.open(waUrl, '_blank', 'noopener,noreferrer');
      } catch {
        // Fallback link in Step 2 handles blocked popups cleanly
      }
    } catch (err: any) {
      setError(err?.message || 'Could not create order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelectProofFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !createdOrder) return;

    setUploadError(null);
    setProofSaved(false);
    setIsUploadingProof(true);
    setUploadProgress(5);

    const objectPreview = URL.createObjectURL(file);
    setProofPreviewUrl(objectPreview);

    try {
      const result = await uploadImageToCloudinary(file, (pct) => {
        setUploadProgress(pct);
      });
      setProofUrl(result.secureUrl);
      await updateOrderProofUrlInFirestore(createdOrder.id, result.secureUrl);
      setCreatedOrder((prev) => (prev ? { ...prev, proofUrl: result.secureUrl } : prev));
      setProofSaved(true);
    } catch (err: any) {
      console.log('MoMo proof upload error:', err);
      setUploadError(err?.message || 'Failed to upload MoMo screenshot. Please try again.');
    } finally {
      setIsUploadingProof(false);
      e.target.value = '';
    }
  };

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg bg-slate-950 text-white rounded-2xl sm:rounded-3xl border border-orange-500/40 shadow-2xl overflow-hidden my-4 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Order on WhatsApp"
      >
        {/* Header - OGYA Black & Orange */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-950 via-slate-900 to-orange-950/80 border-b border-orange-500/30 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-[#25D366]/20 border border-[#25D366]/50 text-[#25D366] flex items-center justify-center shrink-0">
              <MessageCircle size={20} />
            </div>
            <div className="min-w-0">
              <h3 className="text-base sm:text-lg font-black text-white truncate">
                {step === 'order' ? 'Order on WhatsApp' : 'Upload MoMo Payment Proof'}
              </h3>
              <p className="text-xs text-amber-400 font-semibold truncate">
                {step === 'order'
                  ? 'Direct order with vendor + OGYA tracking'
                  : `Order #${createdOrder?.id.slice(-8).toUpperCase()} · Status: Pending`}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer shrink-0"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Product Summary Strip */}
        <div className="px-4 sm:px-5 py-3 bg-slate-900/90 border-b border-slate-800 flex items-center gap-3">
          {target.imageUrl ? (
            <img
              src={target.imageUrl}
              alt={target.productName}
              className="w-14 h-14 rounded-xl object-cover border border-slate-700 shrink-0"
            />
          ) : (
            <div className="w-14 h-14 rounded-xl bg-slate-800 flex items-center justify-center text-orange-400 shrink-0">
              <PackageCheck size={22} />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h4 className="text-xs sm:text-sm font-black text-white truncate">{target.productName}</h4>
              {target.isVerified && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-600 text-white text-[10px] font-black uppercase">
                  ✅ VERIFIED
                </span>
              )}
            </div>
            <div className="flex items-center justify-between gap-2 mt-1">
              <span className="text-xs text-slate-400 truncate">Seller: {target.sellerName}</span>
              <span className="text-sm sm:text-base font-black text-amber-400 shrink-0 tabular-nums">
                GH₵ {Number(target.price || 0).toLocaleString('en-US')}
              </span>
            </div>
          </div>
        </div>

        {step === 'order' ? (
          <form onSubmit={handlePlaceWhatsAppOrder} className="p-4 sm:p-5 space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-rose-950/70 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-2">
                <AlertCircle size={15} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Quick Location Chips */}
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <MapPin size={13} />
                <span>Your Location in Ghana</span>
              </label>
              <div className="flex flex-wrap gap-1.5">
                {LOCATION_CHIPS.map((loc) => (
                  <button
                    key={loc}
                    type="button"
                    onClick={() => setBuyerLocation(loc)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      buyerLocation.toLowerCase() === loc.toLowerCase()
                        ? 'bg-[#FF6600] text-white shadow-sm'
                        : 'bg-slate-900 text-slate-300 border border-slate-700 hover:border-orange-500/50'
                    }`}
                  >
                    {loc}
                  </button>
                ))}
              </div>
              <input
                type="text"
                value={buyerLocation}
                onChange={(e) => setBuyerLocation(e.target.value)}
                placeholder="Or enter exact area (e.g. East Legon, Adenta, Circle)..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 focus:border-[#FF6600] text-white text-xs sm:text-sm font-medium placeholder:text-slate-500 focus:outline-none"
                required
              />
            </div>

            {/* Buyer Contact & Delivery/Pickup */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1 flex items-center gap-1">
                  <User size={12} className="text-orange-400" />
                  <span>Your Name</span>
                </label>
                <input
                  type="text"
                  value={buyerName}
                  onChange={(e) => setBuyerName(e.target.value)}
                  placeholder="e.g. Kwame Boateng"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 focus:border-[#FF6600] text-white text-xs font-medium placeholder:text-slate-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1 flex items-center gap-1">
                  <Phone size={12} className="text-emerald-400" />
                  <span>Your WhatsApp / Phone</span>
                </label>
                <input
                  type="tel"
                  value={buyerPhone}
                  onChange={(e) => setBuyerPhone(e.target.value)}
                  placeholder="e.g. 024 000 0000"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 focus:border-[#FF6600] text-white text-xs font-medium placeholder:text-slate-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Delivery vs Pickup */}
            <div className="flex items-center gap-2">
              {(['Delivery', 'Pickup'] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setDeliveryPreference(mode)}
                  className={`flex-1 py-2 px-3 rounded-xl text-xs font-black border transition-all cursor-pointer ${
                    deliveryPreference === mode
                      ? 'bg-orange-500/20 border-[#FF6600] text-amber-300'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {mode === 'Delivery' ? '🚚 Doorstep Delivery' : '🏪 Self Pickup'}
                </button>
              ))}
            </div>

            {/* Exact WhatsApp Message Preview */}
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 block">
                WhatsApp Message Preview
              </span>
              <p className="text-xs text-slate-200 italic leading-relaxed">"{previewMessage}"</p>
            </div>

            {/* Big Green Order on WhatsApp Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-5 rounded-xl bg-[#25D366] hover:bg-[#1ebe5d] active:scale-[0.99] text-slate-950 font-black text-sm shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-60"
            >
              <MessageCircle size={19} />
              <span>{isSubmitting ? 'Creating Order...' : 'Order on WhatsApp'}</span>
            </button>
          </form>
        ) : (
          <div className="p-4 sm:p-5 space-y-4">
            {/* Order Created Confirmation + Clickable WhatsApp Fallback */}
            <div className="p-3.5 rounded-2xl bg-emerald-950/50 border border-emerald-500/40 space-y-2.5">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 size={18} className="text-[#25D366] shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs sm:text-sm font-black text-white">
                    Order Recorded · Send WhatsApp Message to Vendor
                  </h4>
                  <p className="text-[11px] text-emerald-200/90 mt-0.5">
                    If WhatsApp didn&apos;t open automatically, tap the green button below to send your order message to{' '}
                    <strong>{target.sellerName}</strong>.
                  </p>
                </div>
              </div>

              {whatsappUrl && (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-4 rounded-xl bg-[#25D366] hover:bg-[#1ebe5d] text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all"
                >
                  <MessageCircle size={17} />
                  <span>Open WhatsApp Chat Now</span>
                  <ExternalLink size={14} />
                </a>
              )}
            </div>

            {/* Upload MoMo Payment Proof */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-orange-500/40 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Sparkles size={16} className="text-amber-400" />
                  <h4 className="text-sm font-black text-white">Upload MoMo Payment Proof</h4>
                </div>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-orange-500/20 text-amber-300 border border-orange-500/30">
                  Optional / Faster Dispatch
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                Paid via MTN MoMo, Telecel Cash, or AT Money? Upload your MoMo screenshot so the vendor confirms your order immediately.
              </p>

              {uploadError && (
                <div className="p-2.5 rounded-xl bg-rose-950/70 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-2">
                  <AlertCircle size={14} className="shrink-0" />
                  <span>{uploadError}</span>
                </div>
              )}

              {(proofPreviewUrl || proofUrl) && (
                <div className="relative rounded-xl overflow-hidden border border-slate-700 bg-black">
                  <img
                    src={proofUrl || proofPreviewUrl}
                    alt="MoMo payment proof"
                    className="w-full max-h-48 object-contain"
                  />
                  {isUploadingProof && (
                    <div className="absolute inset-0 bg-black/75 flex flex-col items-center justify-center gap-2 p-4">
                      <span className="text-xs font-black text-amber-400">
                        Uploading MoMo Proof... {uploadProgress}%
                      </span>
                      <div className="w-full max-w-xs h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#FF6600] transition-all duration-150"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {proofSaved && (
                <div className="p-2.5 rounded-xl bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2">
                  <ShieldCheck size={15} className="shrink-0" />
                  <span>MoMo payment proof saved to your order!</span>
                </div>
              )}

              <label className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#FF6600] to-amber-500 hover:opacity-95 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all">
                <Upload size={16} />
                <span>
                  {isUploadingProof
                    ? `Uploading... ${uploadProgress}%`
                    : proofUrl
                    ? 'Replace MoMo Proof Screenshot'
                    : 'Upload MoMo Payment Proof'}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  disabled={isUploadingProof}
                  onChange={handleSelectProofFile}
                  className="hidden"
                />
              </label>
            </div>

            <div className="flex items-center gap-2 pt-1">
              {onOpenMyOrders && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenMyOrders();
                  }}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs cursor-pointer transition-colors"
                >
                  Track in My Orders
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 px-4 rounded-xl bg-orange-500/20 hover:bg-orange-500/30 text-amber-300 border border-orange-500/40 font-black text-xs cursor-pointer transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
