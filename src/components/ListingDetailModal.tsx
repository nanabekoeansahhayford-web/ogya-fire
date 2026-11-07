import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Heart,
  Share2,
  Phone,
  MessageSquare,
  MapPin,
  CheckCircle2,
  ShieldAlert,
  ShieldCheck,
  Clock,
  Eye,
  Calendar,
  Building,
  GraduationCap,
  Briefcase,
  DollarSign,
  Copy,
  Check,
  Send,
  Bell,
  BellRing,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  Zap,
  Flag,
  Camera,
  Mail,
  Truck,
  MessageCircle,
  Maximize2,
  ZoomIn,
  ShoppingCart,
} from 'lucide-react';
import { Listing, SellerInfo } from '../types/marketplace';
import { formatPrice, getListingReport, AdReportRecord, getStoredListings } from '../utils/storage';
import { CategoryIcon } from './CategoryIcon';
import { PriceTrendChart } from './PriceTrendChart';
import { getSellerReputation } from '../utils/reputation';
import { ReputationBadge } from './ReputationBadge';
import { ReportListingModal } from './ReportListingModal';
import { ListingLightboxModal } from './ListingLightboxModal';
import { LocationMapPlaceholder } from './LocationMapPlaceholder';
import { EstimatedMarketPriceBadge } from './EstimatedMarketPriceBadge';
import { MarketPriceAnalysisCard } from './MarketPriceAnalysisCard';
import { MarketPriceEstimate } from '../types/marketPrice';
import { fetchAiMarketPriceEstimate, calculateLocalMarketEstimate } from '../utils/marketPrice';
import {
  generateGhanaWhatsAppUrl,
  generateGhanaCallUrl,
  recordWhatsAppClick,
} from '../utils/whatsapp';

interface ListingDetailModalProps {
  listing: Listing | null;
  isOpen: boolean;
  onClose: () => void;
  isSaved: boolean;
  onToggleSave: (id: string, e: React.MouseEvent) => void;
  onOpenChat: (listing: Listing) => void;
  hasPriceAlert: boolean;
  onTogglePriceAlert: (listingId: string) => void;
  onOpenSellerProfile?: (seller: SellerInfo) => void;
  onOpenBoost?: (listing: Listing) => void;
  onShareSuccess?: (message: string) => void;
  onOrderCourier?: (listing: Listing) => void;
  allListings?: Listing[];
  onSelectListing?: (listing: Listing) => void;
  onAddToCart?: (listing: Listing) => void;
}

export const ListingDetailModal: React.FC<ListingDetailModalProps> = ({
  listing,
  isOpen,
  onClose,
  isSaved,
  onToggleSave,
  onOpenChat,
  hasPriceAlert,
  onTogglePriceAlert,
  onOpenSellerProfile,
  onOpenBoost,
  onShareSuccess,
  onOrderCourier,
  allListings,
  onSelectListing,
  onAddToCart,
}) => {
  const [showPhone, setShowPhone] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [shareFeedback, setShareFeedback] = useState<string | null>(null);
  const [offerInput, setOfferInput] = useState('');
  const [offerSubmitted, setOfferSubmitted] = useState(false);
  const [estimate, setEstimate] = useState<MarketPriceEstimate | null>(null);
  const [isLoadingEstimate, setIsLoadingEstimate] = useState<boolean>(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [currentReport, setCurrentReport] = useState<AdReportRecord | undefined>(() =>
    listing ? getListingReport(listing.id) : undefined
  );

  // Carousel touch swipe gesture references
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  const images = listing?.images && listing.images.length > 0 ? listing.images : [];
  const hasMultipleImages = images.length > 1;

  const isBigItem = Boolean(
    listing?.isBigItem === true ||
    listing?.categoryId === 'vehicles' ||
    listing?.categoryId === 'property'
  );
  const isHotDeal = Boolean(
    listing?.isHotDeal || (listing?.originalPrice && listing.originalPrice > listing.price)
  );
  const discountPct = listing
    ? listing.discountPercent ||
      (listing.originalPrice ? Math.round(((listing.originalPrice - listing.price) / listing.originalPrice) * 100) : 0)
    : 0;

  const handlePrevImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!hasMultipleImages) return;
    setActiveImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!hasMultipleImages) return;
    setActiveImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || !hasMultipleImages) {
      touchStartX.current = null;
      touchStartY.current = null;
      return;
    }
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    const deltaY = e.changedTouches[0].clientY - (touchStartY.current || 0);

    if (Math.abs(deltaX) > 35 && Math.abs(deltaX) > Math.abs(deltaY)) {
      if (deltaX < 0) {
        // Swiped left -> next image
        handleNextImage();
      } else {
        // Swiped right -> prev image
        handlePrevImage();
      }
    }
    touchStartX.current = null;
    touchStartY.current = null;
  };

  // Keyboard arrow keys navigation for gallery
  useEffect(() => {
    if (!isOpen || !listing || !hasMultipleImages || isLightboxOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrevImage();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNextImage();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, listing?.id, hasMultipleImages, isLightboxOpen]);

  // Reset active image index whenever the listing changes
  useEffect(() => {
    setActiveImageIndex(0);
  }, [listing?.id]);

  useEffect(() => {
    if (listing) {
      setCurrentReport(getListingReport(listing.id));
    }
  }, [listing?.id]);

  const allListingsSource = allListings || getStoredListings();

  useEffect(() => {
    if (!isOpen || !listing) {
      setEstimate(null);
      setIsLoadingEstimate(false);
      return;
    }

    if (listing.categoryId === 'seeking-work-cvs' || listing.categoryId === 'jobs') {
      setEstimate(null);
      setIsLoadingEstimate(false);
      return;
    }

    // Immediately calculate local statistical baseline so badge displays with zero lag
    const localEst = calculateLocalMarketEstimate(listing, allListingsSource);
    setEstimate(localEst);

    let isCancelled = false;
    setIsLoadingEstimate(true);

    fetchAiMarketPriceEstimate(listing, allListingsSource)
      .then((aiEst) => {
        if (!isCancelled) {
          setEstimate(aiEst);
        }
      })
      .catch((err) => {
        console.warn('AI market valuation fetch error:', err);
      })
      .finally(() => {
        if (!isCancelled) {
          setIsLoadingEstimate(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [isOpen, listing?.id, listing?.price]);

  const handleRefreshEstimate = () => {
    if (!listing) return;
    setIsLoadingEstimate(true);
    fetchAiMarketPriceEstimate(listing, allListingsSource, true)
      .then((fresh) => {
        setEstimate(fresh);
      })
      .finally(() => {
        setIsLoadingEstimate(false);
      });
  };

  if (!isOpen || !listing) return null;

  const isCV = listing.categoryId === 'seeking-work-cvs';
  const isJob = listing.categoryId === 'jobs';
  const isSold = listing.status === 'sold' || Boolean(listing.isSold);
  const reputation = getSellerReputation(listing.seller);

  const handleCopyPhone = () => {
    navigator.clipboard.writeText(listing.seller.phone);
    setCopiedPhone(true);
    setTimeout(() => setCopiedPhone(false), 2000);
  };

  const getShareUrl = () => {
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('listingId', listing.id);
      return url.toString();
    } catch {
      return window.location.href;
    }
  };

  const getEmailShareUrl = () => {
    const shareUrl = getShareUrl();
    const subject = encodeURIComponent(`Check out "${listing.title}" on OGYA (FIRE) 🔥`);
    const bodyContent = [
      `Hi,`,
      ``,
      `I found this listing on OGYA (FIRE) 🔥 Ghana's Premier Classifieds & Marketplace and thought you might be interested:`,
      ``,
      `• Title: ${listing.title}`,
      `• Category: ${listing.categoryName} > ${listing.subcategory}`,
      `• Price: ${formatPrice(listing.price, listing.currency)}${listing.isNegotiable ? ' (Negotiable)' : ''}`,
      `• Condition: ${listing.condition}`,
      `• Location: ${listing.location}`,
      `• Seller: ${listing.seller.name} (${listing.seller.phone})`,
      ``,
      `Overview:`,
      `${listing.description}`,
      ``,
      `View full details, photo gallery, and seller contact on OGYA:`,
      `${shareUrl}`,
      ``,
      `Best regards,`,
      `Shared from OGYA (FIRE) 🔥`,
    ].join('\n');

    return `mailto:?subject=${subject}&body=${encodeURIComponent(bodyContent)}`;
  };

  const copyToClipboard = async (text: string): Promise<boolean> => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch {
      // ignore & try execCommand fallback
    }

    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-9999px';
      textArea.style.top = '0';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      return successful;
    } catch {
      return false;
    }
  };

  const handleShare = async () => {
    const shareUrl = getShareUrl();
    const shareData = {
      title: `${listing.title} | OGYA (FIRE) 🔥`,
      text: `Check out "${listing.title}" (${formatPrice(listing.price, listing.currency)}) on OGYA (FIRE) 🔥 Ghana's Premier Classifieds!`,
      url: shareUrl,
    };

    // Attempt Web Share API if supported
    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      try {
        await navigator.share(shareData);
        setShareFeedback('Shared successfully via device menu!');
        onShareSuccess?.(`Shared "${listing.title.slice(0, 24)}..." via device menu`);
        setTimeout(() => setShareFeedback(null), 3000);
        return;
      } catch (err: any) {
        // User closed/cancelled the native share menu
        if (err && (err.name === 'AbortError' || err.code === 20)) {
          return;
        }
        // Other errors: proceed to clipboard copy fallback
      }
    }

    // Fallback: Copy link directly to clipboard
    const copied = await copyToClipboard(shareUrl);
    if (copied) {
      setCopiedLink(true);
      setShareFeedback('Listing link copied to clipboard!');
      onShareSuccess?.('📋 Listing link copied to clipboard!');
      setTimeout(() => {
        setCopiedLink(false);
        setShareFeedback(null);
      }, 3000);
    } else {
      setShareFeedback(`Listing URL: ${shareUrl}`);
      setTimeout(() => setShareFeedback(null), 4000);
    }
  };

  const handleWhatsApp = () => {
    recordWhatsAppClick(listing.id);
    const isDaniel = listing.seller?.name?.includes('Daniel Arnan Aboagye') || listing.id?.startsWith('daniel-');
    const targetUrl = isDaniel
      ? 'https://wa.me/233549769720?text=Hello%20Daniel%20I%20saw%20your%20accessories%20on%20OGYA%20FIRE'
      : generateGhanaWhatsAppUrl(
          listing.seller?.whatsapp || listing.seller?.phone,
          listing.title,
          listing.price,
          listing.seller.name
        );
    window.open(targetUrl, '_blank', 'noopener,noreferrer');
  };

  const handleDirectCall = () => {
    const telUrl = generateGhanaCallUrl(listing.seller?.phone || listing.seller?.whatsapp);
    window.location.href = telUrl;
  };

  const handleSendOffer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!offerInput.trim()) return;
    setOfferSubmitted(true);
    setTimeout(() => {
      onOpenChat(listing);
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 dark:bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 md:p-6 animate-in fade-in duration-200">
      <div
        className="relative bg-white dark:bg-slate-900 rounded-2xl max-w-5xl w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto max-h-[92vh] flex flex-col text-slate-900 dark:text-slate-100 transition-colors duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header */}
        <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/90 shrink-0">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 truncate mr-3">
            <span className="flex items-center gap-1.5 text-slate-800 dark:text-slate-200">
              <CategoryIcon categoryId={listing.categoryId} size={15} />
              {listing.categoryName}
            </span>
            <span aria-hidden="true" className="text-slate-300 dark:text-slate-600">/</span>
            <span className="text-slate-600 dark:text-slate-400 truncate">{listing.subcategory}</span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setIsReportOpen(true)}
              className={`px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer text-xs flex items-center gap-1.5 font-bold ${
                currentReport
                  ? 'bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/60'
                  : 'text-slate-600 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50/50 dark:hover:bg-red-950/30 border border-transparent hover:border-red-200 dark:hover:border-red-900/50'
              }`}
              title={currentReport ? `You reported this ad: ${currentReport.reason}` : 'Report suspicious ad (Spam, Scam, Sold...)'}
              aria-label="Report Ad"
            >
              <Flag size={14} className={currentReport ? 'fill-current text-red-600 dark:text-red-400' : 'text-red-500'} />
              <span>{currentReport ? 'Reported' : 'Report Ad'}</span>
            </button>

            <button
              onClick={handleShare}
              className={`p-2 rounded-lg transition-colors cursor-pointer text-xs flex items-center gap-1.5 font-semibold ${
                copiedLink
                  ? 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800'
              }`}
              title="Share listing via Web Share API or copy link"
              aria-label="Share listing"
            >
              {copiedLink ? <Check size={16} className="text-emerald-600 dark:text-emerald-400" /> : <Share2 size={16} />}
              <span className="hidden sm:inline">{copiedLink ? 'Link Copied!' : 'Share'}</span>
            </button>

            {/* Share via Email button */}
            <a
              href={getEmailShareUrl()}
              onClick={() => {
                setShareFeedback('Opening your email client with listing details...');
                onShareSuccess?.(`Pre-filled email for "${listing.title.slice(0, 24)}..."`);
                setTimeout(() => setShareFeedback(null), 3000);
              }}
              className="p-2 rounded-lg transition-colors cursor-pointer text-xs flex items-center gap-1.5 font-semibold text-slate-600 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-slate-200/60 dark:hover:bg-slate-800"
              title="Share listing via Email (mailto)"
              aria-label="Share via Email"
            >
              <Mail size={16} className="text-slate-500 dark:text-slate-400" />
              <span className="hidden sm:inline">Email</span>
            </a>

            <button
              onClick={(e) => onToggleSave(listing.id, e)}
              className={`p-2 rounded-lg transition-colors cursor-pointer text-xs flex items-center gap-1 ${
                isSaved
                  ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800'
              }`}
              title={isSaved ? 'Saved' : 'Save to wishlist'}
            >
              <Heart size={16} fill={isSaved ? 'currentColor' : 'none'} />
              <span className="hidden sm:inline">{isSaved ? 'Saved' : 'Save'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer ml-1"
              aria-label="Close dialog"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Scrollable Modal Body */}
        <div className="overflow-y-auto p-5 sm:p-6 lg:p-8 flex-1 space-y-5">
          {/* Item Sold Notice Banner */}
          {isSold && (
            <div className="bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/80 text-red-900 dark:text-red-200 text-xs px-4 py-3 rounded-xl flex items-center justify-between gap-3 shadow-2xs animate-in fade-in">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-600 shrink-0 animate-pulse" />
                <div>
                  <span className="font-black block text-red-800 dark:text-red-300 text-xs uppercase tracking-wide">
                    This Listing Has Been Marked as SOLD
                  </span>
                  <span className="text-[11px] text-red-700 dark:text-red-300/80">
                    The item is no longer available. You can still message the seller or check similar items below.
                  </span>
                </div>
              </div>
              <span className="bg-red-600 text-white font-black text-xs uppercase px-2.5 py-1 rounded shadow-sm shrink-0">
                SOLD
              </span>
            </div>
          )}

          {/* Active Report Status Banner */}
          {currentReport && (
            <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-900 dark:text-red-200 text-xs px-4 py-3 rounded-xl flex items-start justify-between gap-3 shadow-2xs animate-in fade-in">
              <div className="flex items-start gap-2.5">
                <ShieldAlert size={18} className="text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-extrabold block text-red-800 dark:text-red-300">
                    You flagged this ad for "{currentReport.reason}"
                  </span>
                  <span className="text-[11px] text-red-700 dark:text-red-300/80">
                    Reference ID: #{currentReport.referenceId} · Flagged on {currentReport.reportedAt}. Our Trust & Safety team is currently investigating.
                  </span>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-900/60 text-red-800 dark:text-red-300 shrink-0">
                Under Priority Review
              </span>
            </div>
          )}
          {/* Share Feedback Toast / Banner */}
          {shareFeedback && (
            <div className="bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-semibold px-4 py-2.5 rounded-xl flex items-center justify-between shadow-xs animate-in fade-in slide-in-from-top-1">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>{shareFeedback}</span>
              </div>
              <button
                type="button"
                onClick={() => setShareFeedback(null)}
                className="text-emerald-700 dark:text-emerald-300 hover:text-emerald-950 dark:hover:text-white p-0.5 rounded cursor-pointer"
                aria-label="Dismiss"
              >
                <X size={14} />
              </button>
            </div>
          )}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left 7 Columns: Visual Gallery + Detailed Specs */}
            <div className="lg:col-span-7 space-y-6">
              {/* Main Photo Gallery Carousel */}
              <div className="space-y-3">
                <div
                  className={`relative aspect-[4/3] rounded-2xl overflow-hidden bg-slate-900 border border-slate-200 dark:border-slate-800 select-none group ${
                    images.length > 0 ? 'cursor-pointer' : ''
                  }`}
                  onClick={() => {
                    if (images.length > 0) {
                      setIsLightboxOpen(true);
                    }
                  }}
                  onTouchStart={handleTouchStart}
                  onTouchEnd={handleTouchEnd}
                  title={images.length > 0 ? "Click to view full-screen & zoom" : undefined}
                >
                  {images.length > 0 ? (
                    <img
                      key={activeImageIndex}
                      src={images[activeImageIndex] || images[0]}
                      alt={`${listing.title} - photo ${activeImageIndex + 1}`}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover animate-in fade-in duration-200 group-hover:scale-[1.02] transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                      <CategoryIcon categoryId={listing.categoryId} size={48} />
                    </div>
                  )}

                  {/* Corner Badges */}
                  <div className="absolute top-3 left-3 flex items-center gap-2 flex-wrap z-10 pointer-events-none">
                    {isSold && (
                      <span className="bg-red-600 text-white font-black text-xs uppercase px-3 py-1 rounded shadow-md flex items-center gap-1.5 border border-red-500 animate-in fade-in">
                        <CheckCircle2 size={13} className="stroke-[3]" />
                        <span>SOLD</span>
                      </span>
                    )}
                    {listing.isFeatured && !isSold && (
                      <span className="bg-amber-500 text-slate-950 font-bold text-xs uppercase px-2.5 py-1 rounded shadow-sm">
                        Featured Ad
                      </span>
                    )}
                    {listing.isPromoted && !isSold && (
                      <span className="bg-gradient-to-r from-red-600 to-amber-500 text-white font-extrabold text-xs uppercase px-2.5 py-1 rounded shadow-sm flex items-center gap-1">
                        <Zap size={12} fill="currentColor" />
                        <span>Promoted</span>
                      </span>
                    )}
                  </div>

                  {/* Top-Right Badge: Photo Counter Overlay */}
                  {hasMultipleImages && (
                    <div className="absolute top-3 right-3 bg-slate-950/75 backdrop-blur-xs text-white text-xs font-semibold px-2.5 py-1 rounded-lg flex items-center gap-1.5 shadow-sm z-10 tabular-nums pointer-events-none">
                      <Camera size={13} className="text-amber-400" />
                      <span>{activeImageIndex + 1} / {images.length}</span>
                    </div>
                  )}

                  {/* Hover Overlay Prompt: Fullscreen & Zoom */}
                  {images.length > 0 && (
                    <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none z-10">
                      <span className="bg-slate-950/90 text-white text-xs font-bold px-4 py-2 rounded-full backdrop-blur-md border border-white/25 flex items-center gap-2 shadow-2xl transform translate-y-2 group-hover:translate-y-0 transition-all duration-200">
                        <ZoomIn size={16} className="text-amber-400" />
                        <span>Click to View Full-Screen & Zoom</span>
                      </span>
                    </div>
                  )}

                  {/* Fullscreen & Zoom Button Overlay */}
                  {images.length > 0 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsLightboxOpen(true);
                      }}
                      className="absolute bottom-3 right-3 bg-slate-950/80 hover:bg-slate-950 text-white text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-lg backdrop-blur-xs border border-white/20 transition-all cursor-pointer z-10 hover:scale-105 active:scale-95 group/btn"
                      title="Open Full-Screen Zoomable Gallery"
                      aria-label="Open Fullscreen Gallery"
                    >
                      <Maximize2 size={13} className="text-amber-400 group-hover/btn:rotate-45 transition-transform" />
                      <span className="hidden sm:inline">Fullscreen & Zoom</span>
                    </button>
                  )}

                  {/* Carousel Left / Right Navigation Arrows */}
                  {hasMultipleImages && (
                    <>
                      <button
                        type="button"
                        onClick={handlePrevImage}
                        aria-label="Previous photo"
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-slate-950/70 hover:bg-slate-950 text-white flex items-center justify-center transition-all backdrop-blur-xs shadow-lg cursor-pointer z-10 hover:scale-105 active:scale-95 border border-white/10"
                      >
                        <ChevronLeft size={22} />
                      </button>
                      <button
                        type="button"
                        onClick={handleNextImage}
                        aria-label="Next photo"
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-slate-950/70 hover:bg-slate-950 text-white flex items-center justify-center transition-all backdrop-blur-xs shadow-lg cursor-pointer z-10 hover:scale-105 active:scale-95 border border-white/10"
                      >
                        <ChevronRight size={22} />
                      </button>
                    </>
                  )}

                  {/* Dot Indicators */}
                  {hasMultipleImages && (
                    <div className="absolute bottom-3 left-0 right-0 flex items-center justify-center gap-1.5 z-10 pointer-events-auto">
                      {images.map((_, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveImageIndex(idx);
                          }}
                          aria-label={`Jump to photo ${idx + 1}`}
                          className={`transition-all rounded-full cursor-pointer ${
                            activeImageIndex === idx
                              ? 'w-6 h-2 bg-amber-400 shadow-md'
                              : 'w-2 h-2 bg-white/70 hover:bg-white shadow-sm'
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Multiple image thumbnails strip */}
                {hasMultipleImages && (
                  <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-0.5">
                    {images.map((img, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setActiveImageIndex(idx)}
                        className={`relative w-20 h-16 rounded-xl overflow-hidden border-2 shrink-0 cursor-pointer transition-all ${
                          activeImageIndex === idx
                            ? 'border-amber-500 ring-2 ring-amber-500/30 scale-95 opacity-100'
                            : 'border-slate-200 dark:border-slate-700 opacity-60 hover:opacity-100'
                        }`}
                        title={`View photo ${idx + 1}`}
                      >
                        <img
                          src={img}
                          alt={`Thumbnail ${idx + 1}`}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <span className="absolute bottom-1 right-1 bg-black/70 text-[9px] text-white px-1 rounded font-mono">
                          {idx + 1}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Special CV Details Card */}
              {isCV && listing.cvDetails && (
                <div className="bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/50 rounded-xl p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-400">
                        Candidate Curriculum Vitae Summary
                      </span>
                      <h4 className="text-xl font-extrabold text-slate-950 dark:text-white mt-1">
                        {listing.cvDetails.candidateName}
                      </h4>
                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        {listing.cvDetails.profession}
                      </p>
                    </div>
                    <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60 px-2.5 py-1 rounded-md border border-emerald-200 dark:border-emerald-800/60">
                      {listing.cvDetails.availability}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs mb-4">
                    <div className="flex items-center gap-2">
                      <Clock size={15} className="text-amber-600 dark:text-amber-400 shrink-0" />
                      <span className="text-slate-600 dark:text-slate-300">Experience: <strong className="text-slate-900 dark:text-white">{listing.cvDetails.yearsExperience}</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <GraduationCap size={15} className="text-amber-600 dark:text-amber-400 shrink-0" />
                      <span className="text-slate-600 dark:text-slate-300">Education: <strong className="text-slate-900 dark:text-white">{listing.cvDetails.education}</strong></span>
                    </div>
                  </div>

                  <div>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">Core Competencies:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {listing.cvDetails.skills.map((skill, i) => (
                        <span key={i} className="text-xs font-medium text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-800 border border-amber-200 dark:border-amber-900/40 px-2.5 py-1 rounded-md">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Special Job Details Card */}
              {isJob && listing.jobDetails && (
                <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Company Job Opening
                    </span>
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100 bg-slate-200 dark:bg-slate-700 px-2.5 py-1 rounded-md">
                      {listing.jobDetails.employmentType}
                    </span>
                  </div>
                  <h4 className="text-lg font-bold text-slate-950 dark:text-white">
                    {listing.jobDetails.companyName}
                  </h4>
                  {listing.jobDetails.deadline && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Application Deadline: <strong className="text-slate-800 dark:text-slate-200">{listing.jobDetails.deadline}</strong>
                    </p>
                  )}

                  <div className="mt-4">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                      Role Requirements:
                    </h5>
                    <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                      {listing.jobDetails.requirements.map((req, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle2 size={14} className="text-amber-500 mt-0.5 shrink-0" />
                          <span>{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Full Description */}
              <div>
                <h4 className="text-sm font-bold text-slate-950 dark:text-white uppercase tracking-wider mb-2.5">
                  Description
                </h4>
                <div className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line bg-slate-50/60 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200/70 dark:border-slate-800">
                  {listing.description}
                </div>
              </div>

              {/* Key Attributes & Technical Specs */}
              {listing.attributes && Object.keys(listing.attributes).length > 0 && (
                <div>
                  <h4 className="text-sm font-bold text-slate-950 dark:text-white uppercase tracking-wider mb-2.5">
                    Specifications & Details
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {Object.entries(listing.attributes).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-100 dark:border-slate-800">
                        <span className="text-slate-500 dark:text-slate-400 font-medium">{key}</span>
                        <span className="text-slate-900 dark:text-slate-100 font-bold text-right">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Item Location & Geographic Context Map */}
              <div id="listing-map-section" className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-950 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                    <MapPin size={16} className="text-red-500" />
                    <span>Location & Geographic Context</span>
                  </h4>
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    {listing.region}
                  </span>
                </div>

                <LocationMapPlaceholder
                  location={listing.location}
                  region={listing.region}
                  categoryName={listing.categoryName}
                  title={listing.title}
                />
              </div>

              {/* Safe Trade Advisory */}
              <div className="bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-900/50 rounded-xl p-4 flex flex-col gap-2.5 text-xs text-emerald-950 dark:text-emerald-200">
                <div className="flex items-start gap-3">
                  <ShieldAlert size={20} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="font-bold text-emerald-900 dark:text-emerald-300 mb-1 flex items-center gap-1.5">
                      <span>OGYA (FIRE) 🔥 Safety Reminder</span>
                    </h5>
                    <p className="text-emerald-800 dark:text-emerald-300/90 leading-relaxed">
                      Always meet in a public location. Inspect the item or vehicle thoroughly before making payment. Never send advance deposits via mobile money to unverified individuals.
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-emerald-200/70 dark:border-emerald-900/60 flex items-center justify-between text-[11px]">
                  <span className="text-emerald-800 dark:text-emerald-300 font-medium">Suspect spam, scam, or sold item?</span>
                  <button
                    type="button"
                    onClick={() => setIsReportOpen(true)}
                    className="inline-flex items-center gap-1 font-bold text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:underline cursor-pointer"
                  >
                    <Flag size={12} className={currentReport ? 'fill-current' : ''} />
                    <span>{currentReport ? 'Ad Reported' : 'Report Ad'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Right 5 Columns: Contiguous Purchase / Contact Module */}
            <div className="lg:col-span-5 space-y-6">
              {/* Price & Location Header */}
              <div className="bg-slate-50 dark:bg-slate-950/70 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
                <div className="flex items-baseline justify-between mb-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-2xl sm:text-3xl font-black tabular-nums ${isSold ? 'text-slate-400 dark:text-slate-500 line-through' : 'text-slate-950 dark:text-white'}`}>
                      {formatPrice(listing.price, listing.currency)}
                    </span>
                    {listing.originalPrice && listing.originalPrice > listing.price && !isSold && (
                      <span className="text-base text-slate-400 dark:text-slate-500 line-through tabular-nums font-mono">
                        {formatPrice(listing.originalPrice, listing.currency)}
                      </span>
                    )}
                    {isHotDeal && (
                      <span className="bg-gradient-to-r from-red-600 via-orange-600 to-amber-500 text-white font-black text-xs uppercase px-2.5 py-0.5 rounded shadow-sm flex items-center gap-1 animate-pulse">
                        <span>🔥</span>
                        <span>HOT DEAL</span>
                        {discountPct > 0 && <span className="bg-black/20 px-1 rounded text-[10px]">-{discountPct}%</span>}
                      </span>
                    )}
                    {isSold && (
                      <span className="bg-red-600 text-white font-black text-xs uppercase px-2.5 py-0.5 rounded shadow-xs">
                        SOLD
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5">
                    {listing.isPromoted && !isSold && (
                      <span className="bg-gradient-to-r from-red-600 via-orange-500 to-amber-500 text-white font-extrabold text-[10px] tracking-wider uppercase px-2 py-0.5 rounded shadow-xs flex items-center gap-1">
                        <Zap size={10} fill="currentColor" />
                        <span>Promoted</span>
                      </span>
                    )}
                    {listing.isNegotiable && !isSold && (
                      <span className="text-xs font-bold text-amber-700 dark:text-amber-300 bg-amber-100/80 dark:bg-amber-950/60 border border-transparent dark:border-amber-900/40 px-2 py-0.5 rounded">
                        Negotiable
                      </span>
                    )}
                  </div>
                </div>

                {/* AI-powered Estimated Market Price Badge */}
                {!isCV && !isJob && (
                  <div className="my-2.5">
                    <EstimatedMarketPriceBadge
                      estimate={estimate}
                      isLoading={isLoadingEstimate}
                      onOpenAnalysis={() => {
                        const el = document.getElementById('ai-market-price-card');
                        if (el) {
                          el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                        }
                      }}
                      currency={listing.currency}
                    />
                  </div>
                )}

                <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 mt-2 mb-3 leading-snug">
                  {listing.title}
                </h2>

                <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400 pt-3 border-t border-slate-200 dark:border-slate-800">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <MapPin size={14} className="text-red-500 shrink-0" />
                      <span className="font-medium text-slate-900 dark:text-slate-200 truncate">{listing.location}</span>
                    </div>
                    <a
                      href="#listing-map-section"
                      className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900/60 px-2 py-0.5 rounded shrink-0 hover:bg-amber-100 dark:hover:bg-amber-900/80 transition-colors"
                      title="Jump to Map Preview"
                    >
                      Map Pin ↓
                    </a>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Condition:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{listing.condition}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Posted:</span>
                    <span className="font-medium text-slate-700 dark:text-slate-300">{listing.postedAt}</span>
                  </div>
                </div>

                {/* Action Buttons: Price Alert + Share Listing + Boost Ad */}
                <div className="mt-4 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => onTogglePriceAlert(listing.id)}
                      className={`py-2.5 px-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer border ${
                        hasPriceAlert
                          ? 'bg-amber-500/15 border-amber-500/50 text-amber-900 dark:text-amber-300 hover:bg-amber-500/25 shadow-xs'
                          : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 shadow-2xs'
                      }`}
                      title={hasPriceAlert ? 'Click to cancel price drop notification' : 'Get notified when the price of this item is reduced'}
                    >
                      {hasPriceAlert ? (
                        <>
                          <BellRing size={14} className="text-amber-600 dark:text-amber-400 animate-pulse shrink-0" />
                          <span className="truncate">Alert Active</span>
                        </>
                      ) : (
                        <>
                          <Bell size={14} className="text-slate-600 dark:text-slate-400 shrink-0" />
                          <span className="truncate">Price Drop Alert</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={handleShare}
                      className={`py-2.5 px-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer border ${
                        copiedLink
                          ? 'bg-emerald-50 dark:bg-emerald-950/70 border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 shadow-xs'
                          : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 shadow-2xs'
                      }`}
                      title="Share this listing via Web Share API (native menu) or copy link"
                      aria-label="Share listing"
                    >
                      {copiedLink ? (
                        <>
                          <Check size={14} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                          <span className="truncate">Link Copied!</span>
                        </>
                      ) : (
                        <>
                          <Share2 size={14} className="text-slate-600 dark:text-slate-400 shrink-0" />
                          <span className="truncate">Share Listing</span>
                        </>
                      )}
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => onOpenBoost?.(listing)}
                    className="w-full py-2.5 px-3.5 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-2 cursor-pointer bg-gradient-to-r from-red-600 via-orange-500 to-amber-500 hover:opacity-95 text-white shadow-md active:scale-98"
                    title="Pay 50 GHS via Paystack to pin this ad to top for 7 days"
                  >
                    <Zap size={15} fill="currentColor" />
                    <span>{listing.isPromoted ? 'Ad is Promoted (Top of Feed)' : 'Boost to Top (50 GHS via Paystack · 7 Days)'}</span>
                  </button>
                </div>
              </div>

              {/* AI-powered Estimated Market Price Analysis & Category Comparison Card */}
              {!isCV && !isJob && (
                <MarketPriceAnalysisCard
                  listing={listing}
                  estimate={estimate}
                  isLoading={isLoadingEstimate}
                  onRefresh={handleRefreshEstimate}
                  onSelectComparable={(compId) => {
                    const target = allListingsSource.find((l) => l.id === compId);
                    if (target) {
                      onSelectListing?.(target);
                    }
                  }}
                  currency={listing.currency}
                />
              )}

              {/* Price Trend Line Chart (Recharts) */}
              <PriceTrendChart listing={listing} />

              {/* Seller Profile Box */}
              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400">
                    Seller Information
                  </span>
                  <button
                    type="button"
                    onClick={() => onOpenSellerProfile?.(listing.seller)}
                    className="text-[11px] font-bold text-amber-700 dark:text-amber-400 hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <span>{reputation.tierName}</span>
                    <span>({reputation.score}%)</span>
                  </button>
                </div>

                <div className="flex items-start justify-between mb-2">
                  <div>
                    <button
                      type="button"
                      onClick={() => onOpenSellerProfile?.(listing.seller)}
                      className="font-extrabold text-slate-900 dark:text-white text-base hover:text-amber-600 dark:hover:text-amber-400 transition-colors cursor-pointer text-left flex items-center gap-1 group"
                    >
                      <span>{listing.seller.name}</span>
                      <ChevronRight size={15} className="text-slate-400 group-hover:text-amber-600 dark:group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all" />
                    </button>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">★ {listing.seller.rating.toFixed(1)}</span>
                      <span>({listing.seller.reviewCount} reviews)</span>
                      <span>·</span>
                      <span>Since {listing.seller.memberSince}</span>
                    </div>
                  </div>

                  {(listing.seller.isSubscribedVerified || listing.seller.isVerified || listing.seller.ghanaCardVerified) && (
                    <span className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-md border shadow-2xs ${
                      listing.seller.isSubscribedVerified
                        ? 'text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/70 border-amber-300 dark:border-amber-700/80'
                        : 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/70 border-emerald-300 dark:border-emerald-800'
                    }`}>
                      <ShieldCheck size={14} className={listing.seller.isSubscribedVerified ? "text-amber-600 dark:text-amber-400 shrink-0" : "text-emerald-600 dark:text-emerald-400 shrink-0"} />
                      <span>{listing.seller.isSubscribedVerified ? '🇬🇭 Verified Pro Seller' : listing.seller.ghanaCardVerified ? '🇬🇭 Ghana Card Verified' : 'Verified Seller'}</span>
                    </span>
                  )}
                </div>

                {/* Reputation Badges Row */}
                <div className="flex items-center gap-1.5 flex-wrap my-2.5 pt-1">
                  {reputation.badges.map((b) => (
                    <ReputationBadge
                      key={b.badgeId}
                      badge={b}
                      size="xs"
                      interactive={true}
                      onClick={() => onOpenSellerProfile?.(listing.seller)}
                    />
                  ))}
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-4 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-1.5">
                    <Clock size={13} className="text-orange-500 dark:text-orange-400" />
                    <span>Replies {listing.seller.responseTime}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => onOpenSellerProfile?.(listing.seller)}
                    className="text-xs font-bold text-amber-700 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-300 hover:underline cursor-pointer"
                  >
                    View Full Profile →
                  </button>
                </div>

                {/* Primary Action Buttons */}
                <div className="space-y-2.5">
                  {/* Small items: Add to Cart & Pay with Paystack MoMo button */}
                  {!isBigItem && listing.categoryId !== 'seeking-work-cvs' && listing.categoryId !== 'jobs' && !isSold && (
                    <button
                      type="button"
                      onClick={() => onAddToCart?.(listing)}
                      className="w-full py-3.5 px-4 bg-[#FF6600] hover:bg-[#e65c00] active:scale-98 text-white font-black text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2.5 cursor-pointer border border-orange-500 hover:shadow-lg group"
                      title="Add to Cart and Pay with Paystack MoMo or Cash on Delivery"
                    >
                      <ShoppingCart size={19} className="shrink-0 group-hover:scale-110 transition-transform" />
                      <span>Add to Cart (Pay with Paystack MoMo)</span>
                    </button>
                  )}

                  {/* Big items: In-person inspection warning */}
                  {isBigItem && (
                    <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 rounded-xl text-xs text-amber-900 dark:text-amber-200 space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-amber-800 dark:text-amber-300">
                        <ShieldAlert size={16} className="text-amber-600 shrink-0" />
                        <span>🚫 No Online Payment for Vehicles & Property</span>
                      </div>
                      <p className="text-[11px] text-amber-700 dark:text-amber-400 leading-relaxed">
                        To protect buyers, online payment is disabled for vehicles and properties. Always meet the seller in person in a safe, public location to inspect before making any financial transaction.
                      </p>
                    </div>
                  )}

                  {/* WhatsApp Direct Chat */}
                  <button
                    type="button"
                    onClick={handleWhatsApp}
                    className="w-full py-3.5 px-4 bg-[#25D366] hover:bg-[#20ba59] active:bg-[#1da850] text-white font-extrabold text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2.5 cursor-pointer border border-[#20ba59] group"
                    title={`Chat Seller on WhatsApp: wa.me/${(listing.seller.whatsapp || listing.seller.phone).replace(/[^0-9]/g, '')}`}
                  >
                    <MessageCircle size={19} className="fill-current text-white shrink-0 group-hover:scale-110 transition-transform" />
                    <span>{isBigItem ? 'Contact Seller on WhatsApp' : 'Chat Seller on WhatsApp'}</span>
                  </button>

                  {/* Ghana Door-to-Door Courier Dispatch Button (for small/medium deliverable items) */}
                  {!isBigItem && listing.categoryId !== 'seeking-work-cvs' && listing.categoryId !== 'jobs' && (
                    <div className="space-y-1.5 pb-1">
                      <button
                        type="button"
                        onClick={() => onOrderCourier?.(listing)}
                        className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-900 dark:text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer border border-slate-200 dark:border-slate-700"
                      >
                        <Truck size={16} className="text-emerald-600 dark:text-emerald-400" />
                        <span>Dispatch via Ghana Courier</span>
                      </button>
                    </div>
                  )}

                  {/* Direct Call Button */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={handleDirectCall}
                      className="py-2.5 px-3 bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs border border-transparent dark:border-slate-700"
                      title={`Direct Call: ${listing.seller.phone}`}
                    >
                      <Phone size={15} className="text-amber-400 shrink-0" />
                      <span>Direct Call ({listing.seller.phone.slice(-4)})</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleCopyPhone}
                      className="py-2.5 px-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-slate-200 dark:border-slate-700"
                      title="Copy full phone number"
                    >
                      {copiedPhone ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                      <span>{copiedPhone ? 'Copied Number!' : 'Copy Number'}</span>
                    </button>
                  </div>

                  {/* Real-Time In-App Chat */}
                  <button
                    onClick={() => onOpenChat(listing)}
                    className="w-full py-2.5 px-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 active:from-amber-600 active:to-orange-600 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-2xs flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <MessageSquare size={15} />
                    <span>Chat on OGYA (In-App) 🔥</span>
                  </button>

                  {/* Report Fraud / Suspicious Listing Button */}
                  <button
                    type="button"
                    onClick={() => setIsReportOpen(true)}
                    className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer border ${
                      currentReport
                        ? 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-900/60 text-red-600 dark:text-red-400 shadow-2xs'
                        : 'bg-rose-50/70 hover:bg-rose-100/80 dark:bg-rose-950/30 dark:hover:bg-rose-950/60 border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-400 shadow-2xs'
                    }`}
                    title="Buyer can report fraud, advance fee scams, counterfeit items, or fake listings"
                  >
                    <ShieldAlert size={15} className={currentReport ? 'fill-current text-red-600 dark:text-red-400' : 'text-rose-600 dark:text-rose-400'} />
                    <span>{currentReport ? `Fraud Reported (${currentReport.reason})` : 'Report Fraud / Suspicious Listing'}</span>
                  </button>
                </div>
              </div>

              {/* Make an Offer Section */}
              {listing.isNegotiable && (
                <div className="bg-slate-50 dark:bg-slate-950/70 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-2 flex items-center gap-1.5">
                    <DollarSign size={14} className="text-amber-600 dark:text-amber-400" />
                    <span>Make a Direct Counter Offer</span>
                  </h4>
                  {offerSubmitted ? (
                    <div className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 p-2.5 rounded-lg border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5">
                      <CheckCircle2 size={14} />
                      <span>Offer sent! Redirecting to chat...</span>
                    </div>
                  ) : (
                    <form onSubmit={handleSendOffer} className="flex gap-2">
                      <input
                        type="number"
                        placeholder={`Offer (e.g. ${Math.round(listing.price * 0.9)})`}
                        value={offerInput}
                        onChange={(e) => setOfferInput(e.target.value)}
                        className="flex-1 px-3 py-2 text-xs bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:border-amber-500 font-semibold text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                      />
                      <button
                        type="submit"
                        className="px-3.5 py-2 bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 dark:hover:bg-slate-600 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer border border-transparent dark:border-slate-600"
                      >
                        Send Offer
                      </button>
                    </form>
                  )}
                </div>
              )}

              {/* Bottom Quick Flag Link */}
              <div className="pt-1 text-center">
                <button
                  type="button"
                  onClick={() => setIsReportOpen(true)}
                  className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors cursor-pointer font-medium"
                >
                  <Flag size={13} className={currentReport ? 'text-red-500 fill-current' : 'text-red-500'} />
                  <span>{currentReport ? 'Ad Reported · Under Review' : 'Notice a suspicious or sold listing? Report Ad'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Report Listing Modal Flow */}
      <ReportListingModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        listing={listing}
        existingReport={currentReport}
        onReportSuccess={(report) => {
          setCurrentReport(report);
          onShareSuccess?.(`Ad reported for "${report.reason}". Thank you!`);
        }}
        onReportWithdraw={() => {
          setCurrentReport(undefined);
          onShareSuccess?.('Ad report withdrawn.');
        }}
      />

      {/* Full-Screen Zoomable Lightbox Modal Gallery */}
      <ListingLightboxModal
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
        images={images}
        initialIndex={activeImageIndex}
        listingTitle={listing.title}
        categoryName={listing.categoryName}
        price={listing.price}
        currency={listing.currency}
        onIndexChange={(newIdx) => setActiveImageIndex(newIdx)}
      />
    </div>
  );
};
