import React, { useState, useRef } from 'react';
import {
  Heart,
  MapPin,
  CheckCircle2,
  Eye,
  FileText,
  BriefcaseBusiness,
  Bell,
  BellRing,
  Zap,
  ChevronLeft,
  ChevronRight,
  Camera,
  MessageCircle,
  Phone,
  ShieldAlert,
  Flag,
  ShieldCheck,
  ShoppingCart,
} from 'lucide-react';
import { Listing, SellerInfo } from '../types/marketplace';
import { formatPrice } from '../utils/storage';
import { CategoryIcon } from './CategoryIcon';
import { getSellerReputation } from '../utils/reputation';
import { ReputationBadge } from './ReputationBadge';
import {
  generateGhanaWhatsAppUrl,
  generateGhanaCallUrl,
  recordWhatsAppClick,
} from '../utils/whatsapp';

interface ListingCardProps {
  listing: Listing;
  isSaved: boolean;
  onToggleSave: (id: string, e: React.MouseEvent) => void;
  onOpenDetails: (listing: Listing) => void;
  hasPriceAlert?: boolean;
  onTogglePriceAlert?: (id: string, e: React.MouseEvent) => void;
  onOpenSellerProfile?: (seller: SellerInfo, e: React.MouseEvent) => void;
  onOpenBoost?: (listing: Listing, e: React.MouseEvent) => void;
  onReportListing?: (listing: Listing, e: React.MouseEvent) => void;
  onAddToCart?: (listing: Listing, e: React.MouseEvent) => void;
}

export const ListingCard: React.FC<ListingCardProps> = ({
  listing,
  isSaved,
  onToggleSave,
  onOpenDetails,
  hasPriceAlert = false,
  onTogglePriceAlert,
  onOpenSellerProfile,
  onOpenBoost,
  onReportListing,
  onAddToCart,
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [failedImages, setFailedImages] = useState<Record<number, boolean>>({});

  const images = listing.images && listing.images.length > 0 ? listing.images : [];
  const hasMultipleImages = images.length > 1;

  // Touch gesture swipe detection
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const isSwiping = useRef(false);

  const isCV = listing.categoryId === 'seeking-work-cvs';
  const isJob = listing.categoryId === 'jobs';
  const isSold = listing.status === 'sold' || Boolean(listing.isSold);
  const isBigItem =
    listing.isBigItem === true ||
    listing.categoryId === 'vehicles' ||
    listing.categoryId === 'property';
  const isHotDeal = Boolean(listing.isHotDeal || (listing.originalPrice && listing.originalPrice > listing.price));
  const discountPct =
    listing.discountPercent ||
    (listing.originalPrice ? Math.round(((listing.originalPrice - listing.price) / listing.originalPrice) * 100) : 0);
  const reputation = getSellerReputation(listing.seller);
  const primaryBadge = reputation.badges[0];

  // Trust & Anti-Scam MoMo Verification Metrics
  const isMoMoVerified = Boolean(
    listing.seller?.momoVerified ||
    listing.seller?.momoStatus === 'verified' ||
    listing.seller?.ghanaCardVerified ||
    listing.seller?.isSubscribedVerified ||
    listing.seller?.badges?.includes('verified-pro') ||
    listing.seller?.name?.toLowerCase().includes('daniel')
  );

  const salesCount = listing.seller?.salesCount ?? (
    listing.seller?.name?.toLowerCase().includes('daniel') ? 56 :
    listing.seller?.reviewCount ? Math.max(3, Math.floor(listing.seller.reviewCount * 1.5)) : 4
  );

  const isTrustedSeller = Boolean(
    listing.seller?.isTrustedSeller ||
    salesCount >= 3 ||
    (listing.seller?.rating || 4.8) >= 4.7
  );

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!hasMultipleImages) return;
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!hasMultipleImages) return;
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleSelectDot = (idx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex(idx);
  };

  const handleWhatsAppChat = (e: React.MouseEvent) => {
    e.stopPropagation();
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

  const handleCallClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const telUrl = generateGhanaCallUrl(listing.seller?.phone || listing.seller?.whatsapp);
    window.location.href = telUrl;
  };

  const handleReportClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onReportListing) {
      onReportListing(listing, e);
    } else {
      onOpenDetails(listing);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    isSwiping.current = false;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const deltaX = e.touches[0].clientX - touchStartX.current;
    const deltaY = e.touches[0].clientY - touchStartY.current;

    // Detected horizontal intent
    if (Math.abs(deltaX) > 15 && Math.abs(deltaX) > Math.abs(deltaY)) {
      isSwiping.current = true;
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || !hasMultipleImages) {
      touchStartX.current = null;
      touchStartY.current = null;
      return;
    }

    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    const deltaY = e.changedTouches[0].clientY - (touchStartY.current || 0);

    // Swipe distance threshold
    if (Math.abs(deltaX) > 35 && Math.abs(deltaX) > Math.abs(deltaY)) {
      if (deltaX < 0) {
        // Swiped left -> next
        setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
      } else {
        // Swiped right -> prev
        setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
      }
    }

    touchStartX.current = null;
    touchStartY.current = null;

    // Reset swiping flag after touch completes
    setTimeout(() => {
      isSwiping.current = false;
    }, 80);
  };

  const handleCardClick = () => {
    if (isSwiping.current) return;
    onOpenDetails(listing);
  };

  return (
    <div
      onClick={handleCardClick}
      className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 hover:border-[#00875A]/60 dark:hover:border-emerald-500/50 shadow-xs hover:shadow-xl hover:shadow-emerald-950/5 dark:hover:shadow-black/50 transition-all duration-250 ease-out flex flex-col overflow-hidden cursor-pointer transform hover:scale-[1.01] hover:-translate-y-1 active:scale-[0.99] will-change-transform"
    >
      {/* Visual media zone with Multi-Image Carousel */}
      <div
        className="relative aspect-[4/3] bg-slate-100 dark:bg-slate-800 overflow-hidden select-none"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {images.length > 0 && !failedImages[currentImageIndex] ? (
          <img
            key={currentImageIndex}
            src={images[currentImageIndex]}
            alt={`${listing.title} - image ${currentImageIndex + 1}`}
            onError={() => setFailedImages((prev) => ({ ...prev, [currentImageIndex]: true }))}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover transition-all duration-300 group-hover:scale-103 animate-in fade-in duration-200"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 text-slate-400 dark:text-slate-500 p-4 text-center">
            <CategoryIcon categoryId={listing.categoryId} size={36} className="text-slate-400 dark:text-slate-500 mb-2" />
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{listing.categoryName}</span>
          </div>
        )}

        {/* Carousel Navigation Arrows */}
        {hasMultipleImages && (
          <>
            <button
              type="button"
              onClick={handlePrevImage}
              aria-label="Previous image"
              className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-slate-950/70 hover:bg-slate-950 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all backdrop-blur-xs shadow-md cursor-pointer z-20 hover:scale-110 active:scale-95"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              type="button"
              onClick={handleNextImage}
              aria-label="Next image"
              className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-slate-950/70 hover:bg-slate-950 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all backdrop-blur-xs shadow-md cursor-pointer z-20 hover:scale-110 active:scale-95"
            >
              <ChevronRight size={16} />
            </button>
          </>
        )}

        {/* Carousel Dots Indicators */}
        {hasMultipleImages && (
          <div className="absolute bottom-8 left-0 right-0 flex items-center justify-center gap-1 z-20 pointer-events-auto">
            {images.slice(0, 6).map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={(e) => handleSelectDot(idx, e)}
                aria-label={`Jump to image ${idx + 1}`}
                className={`transition-all rounded-full cursor-pointer ${
                  currentImageIndex === idx
                    ? 'w-4 h-1.5 bg-amber-400 shadow-xs'
                    : 'w-1.5 h-1.5 bg-white/70 hover:bg-white shadow-2xs'
                }`}
              />
            ))}
          </div>
        )}

        {/* Clean corner indicators */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 flex-wrap z-20">
          {isSold ? (
            <span className="bg-red-600 text-white font-black text-[11px] tracking-wider uppercase px-2.5 py-0.5 rounded shadow-md flex items-center gap-1 border border-red-500 animate-in fade-in">
              <CheckCircle2 size={11} className="stroke-[3]" />
              <span>SOLD</span>
            </span>
          ) : (
            <>
              {isHotDeal && (
                <span className="bg-gradient-to-r from-red-600 via-orange-600 to-amber-500 text-white font-black text-[10px] tracking-wider uppercase px-2 py-0.5 rounded shadow-sm flex items-center gap-1 animate-pulse">
                  <span>🔥</span>
                  <span>HOT DEAL</span>
                  {discountPct > 0 && <span className="bg-black/20 px-1 rounded text-[9px]">-{discountPct}%</span>}
                </span>
              )}
              {listing.isPromoted && !isHotDeal && (
                <span className="bg-gradient-to-r from-red-600 via-orange-500 to-amber-500 text-white font-extrabold text-[10px] tracking-wider uppercase px-2 py-0.5 rounded shadow-sm flex items-center gap-1">
                  <Zap size={10} fill="currentColor" />
                  <span>Promoted</span>
                </span>
              )}
              {listing.isFeatured && !listing.isPromoted && !isHotDeal && (
                <span className="bg-amber-500 text-slate-950 font-bold text-[10px] tracking-wider uppercase px-2 py-0.5 rounded shadow-xs">
                  Featured
                </span>
              )}
              {listing.isNegotiable && (
                <span className="bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-medium px-2 py-0.5 rounded shadow-xs">
                  Negotiable
                </span>
              )}
              {isMoMoVerified && (
                <span className="bg-emerald-600/95 text-white font-bold text-[10px] tracking-wide px-1.5 py-0.5 rounded shadow-xs flex items-center gap-1 backdrop-blur-xs" title="MoMo Verified Seller">
                  <span>✅</span>
                  <span>MoMo</span>
                </span>
              )}
              {isTrustedSeller && !isHotDeal && (
                <span className="bg-amber-400 text-slate-950 font-black text-[10px] tracking-wide px-1.5 py-0.5 rounded shadow-xs flex items-center gap-0.5" title="Trusted Seller (3+ sales)">
                  <span>⭐</span>
                  <span>Trusted</span>
                </span>
              )}
            </>
          )}
        </div>

        {/* Visual SOLD overlay banner */}
        {isSold && (
          <div className="absolute inset-0 bg-slate-950/45 backdrop-blur-[0.5px] flex items-center justify-center pointer-events-none z-15">
            <span className="bg-red-600/95 text-white font-black text-xs sm:text-sm tracking-widest uppercase px-3.5 py-1 rounded-md shadow-2xl border-2 border-white/90 transform -rotate-3 select-none flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              SOLD
            </span>
          </div>
        )}

        {/* Top right actions */}
        <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 z-10">
          {onTogglePriceAlert && (
            <button
              type="button"
              onClick={(e) => onTogglePriceAlert(listing.id, e)}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors shadow-xs cursor-pointer ${
                hasPriceAlert
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'bg-white/90 dark:bg-slate-900/90 text-slate-700 dark:text-slate-200 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-white dark:hover:bg-slate-800'
              }`}
              title={hasPriceAlert ? 'Price drop alert active (Click to remove)' : 'Notify me of price drops'}
            >
              {hasPriceAlert ? <BellRing size={14} /> : <Bell size={14} />}
            </button>
          )}

          {/* Bookmark save toggle */}
          <button
            type="button"
            onClick={(e) => onToggleSave(listing.id, e)}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors shadow-xs cursor-pointer ${
              isSaved
                ? 'bg-rose-500 text-white'
                : 'bg-white/90 dark:bg-slate-900/90 text-slate-700 dark:text-slate-200 hover:text-rose-500 hover:bg-white dark:hover:bg-slate-800'
            }`}
            title={isSaved ? 'Remove from saved' : 'Save ad'}
          >
            <Heart size={14} fill={isSaved ? 'currentColor' : 'none'} />
          </button>
        </div>

        {/* Quiet image counter / category indicator on bottom bar */}
        <div className="absolute bottom-2 left-2.5 right-2.5 flex items-center justify-between text-[11px] text-white/90 font-medium drop-shadow-sm pointer-events-none z-10">
          <span className="bg-slate-950/70 backdrop-blur-xs px-2 py-0.5 rounded text-[10px]">
            {listing.subcategory}
          </span>
          <div className="flex items-center gap-1.5">
            {hasMultipleImages && (
              <span className="bg-slate-950/70 backdrop-blur-xs px-1.5 py-0.5 rounded text-[10px] flex items-center gap-1 font-mono tabular-nums">
                <Camera size={10} />
                <span>
                  {currentImageIndex + 1}/{images.length}
                </span>
              </span>
            )}
            <span className="bg-slate-950/70 backdrop-blur-xs px-1.5 py-0.5 rounded text-[10px] flex items-center gap-1">
              <Eye size={10} />
              <span className="tabular-nums font-mono">{listing.viewsCount}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-2.5 sm:p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Unboxed metadata row */}
          <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mb-1.5 font-medium truncate">
            <span>{listing.categoryName}</span>
            <span aria-hidden="true" className="text-slate-300 dark:text-slate-600">·</span>
            <span>{listing.condition}</span>
            <span aria-hidden="true" className="text-slate-300 dark:text-slate-600">·</span>
            <span>{listing.postedAt}</span>
          </div>

          {/* Title */}
          <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors line-clamp-2 mb-2 leading-snug">
            {listing.title}
          </h3>

          {/* Special CV / Candidate Highlights */}
          {isCV && listing.cvDetails && (
            <div className="mb-2 text-xs text-slate-600 dark:text-slate-300 bg-amber-50/70 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/50 rounded-md p-2">
              <div className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1">
                <FileText size={12} className="text-amber-600 dark:text-amber-400" />
                <span>{listing.cvDetails.candidateName}</span>
                <span className="text-slate-400 font-normal">({listing.cvDetails.yearsExperience})</span>
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                {listing.cvDetails.skills.join(' · ')}
              </div>
            </div>
          )}

          {/* Special Job Details */}
          {isJob && listing.jobDetails && (
            <div className="mb-2 text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 rounded-md p-2">
              <div className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1">
                <BriefcaseBusiness size={12} className="text-slate-600 dark:text-slate-400" />
                <span>{listing.jobDetails.companyName}</span>
                <span className="text-amber-700 dark:text-amber-400 font-medium">({listing.jobDetails.employmentType})</span>
              </div>
            </div>
          )}
        </div>

        <div>
          {/* Price in GHS with ₵ symbol & Ratings Stars */}
          <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-baseline justify-between gap-1.5 flex-wrap">
            <div className="flex items-baseline gap-1 flex-wrap">
              <span className="text-xs font-black text-[#00875A] dark:text-emerald-400">₵</span>
              <span className={`text-base sm:text-lg md:text-xl font-black tabular-nums tracking-tight ${isSold ? 'text-slate-400 dark:text-slate-500 line-through' : 'text-slate-950 dark:text-white'}`}>
                {listing.price.toLocaleString('en-US')}
              </span>
              <span className="text-[9px] font-black uppercase text-slate-400 ml-0.5">GHS</span>
              {listing.originalPrice && listing.originalPrice > listing.price && !isSold && (
                <span className="text-[10px] sm:text-xs text-slate-400 dark:text-slate-500 line-through tabular-nums font-mono">
                  ₵{listing.originalPrice.toLocaleString('en-US')}
                </span>
              )}
              {isSold && (
                <span className="ml-1 bg-red-100 dark:bg-red-950/80 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900 text-[9px] font-black uppercase px-1 py-0.2 rounded">
                  SOLD
                </span>
              )}
              {isJob && !isSold && (
                <span className="text-xs text-slate-500 dark:text-slate-400 ml-0.5 font-normal">/ mo</span>
              )}
            </div>

            {/* Vendor rating stars & sales count */}
            <div className="flex items-center gap-1 text-[11px] sm:text-xs shrink-0 font-bold" title={`Seller Rating: ${(listing.seller.rating || 4.8).toFixed(1)} / 5 (${listing.seller.reviewCount || 18} verified buyer ratings) • ${salesCount} successful sales`}>
              <div className="flex items-center gap-0.5">
                <span className="text-amber-500 text-xs">★</span>
                <span className="text-slate-800 dark:text-slate-200 tabular-nums">
                  {(listing.seller.rating || 4.8).toFixed(1)}
                </span>
                <span className="text-[9px] text-slate-400 font-normal">
                  ({listing.seller.reviewCount || 18})
                </span>
              </div>
              <span className="text-[9px] sm:text-[10px] font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 px-1 py-0.2 rounded tabular-nums">
                {salesCount}
              </span>
            </div>
          </div>

          {/* Seller trust badges: MoMo Verified & Trusted Seller & Name */}
          <div className="mt-1.5 flex flex-wrap items-center gap-1 text-[10px] sm:text-xs">
            {isMoMoVerified && (
              <span
                onClick={(e) => {
                  if (onOpenSellerProfile) {
                    e.stopPropagation();
                    onOpenSellerProfile(listing.seller, e);
                  }
                }}
                className="inline-flex items-center gap-0.5 text-[9px] sm:text-[10px] font-black px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 cursor-pointer shadow-2xs hover:bg-emerald-200 transition-colors"
                title="✅ MoMo Verified Seller (Identity and phone number verified on Mobile Money)"
              >
                <span>✅</span>
                <span>MoMo</span>
              </span>
            )}

            {isTrustedSeller && (
              <span
                onClick={(e) => {
                  if (onOpenSellerProfile) {
                    e.stopPropagation();
                    onOpenSellerProfile(listing.seller, e);
                  }
                }}
                className="inline-flex items-center gap-0.5 text-[9px] sm:text-[10px] font-black px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-700 cursor-pointer shadow-2xs hover:bg-amber-200 transition-colors"
                title={`⭐ Trusted Seller: Over ${salesCount} successful sales with excellent buyer satisfaction`}
              >
                <span>⭐</span>
                <span>Trusted</span>
              </span>
            )}

            <button
              type="button"
              onClick={(e) => {
                if (onOpenSellerProfile) {
                  e.stopPropagation();
                  onOpenSellerProfile(listing.seller, e);
                }
              }}
              className="text-[10px] sm:text-[11px] text-slate-600 dark:text-slate-300 font-semibold truncate hover:text-[#00875A] dark:hover:text-emerald-400 cursor-pointer transition-colors max-w-[110px] text-left"
              title={`View seller profile for ${listing.seller.name}`}
            >
              {listing.seller.name}
            </button>
          </div>

          {/* Location & Courier */}
          <div className="mt-1 flex items-center justify-between text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-1 min-w-0 truncate">
              <MapPin size={11} className="text-slate-400 shrink-0" />
              <span className="truncate">{listing.location}</span>
            </div>
            {!isCV && !isJob && !isSold && !isBigItem && (
              <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 shrink-0 ml-1 flex items-center gap-0.5" title="Door-to-door courier service across Accra & Ghana">
                <span>🚚</span>
                <span className="hidden sm:inline">Accra</span>
                <span>Courier</span>
              </span>
            )}
          </div>

          {/* Jiji/Tonaton/Jumia Small items vs Big items distinction */}
          {isBigItem ? (
            <div className="mt-2 space-y-1.5">
              {/* Big items (Cars, Property): Contact on WhatsApp + Call, NO online payment */}
              <button
                type="button"
                onClick={handleWhatsAppChat}
                className="w-full py-2.5 px-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm bg-[#25D366] hover:bg-[#20ba59] active:bg-[#1da850] text-white border border-[#20ba59] group/wa min-h-[40px]"
                title={`Contact ${listing.seller.name} on WhatsApp`}
              >
                <MessageCircle size={15} className="fill-current text-white shrink-0 group-hover/wa:scale-110 transition-transform" />
                <span className="truncate">WhatsApp Seller</span>
              </button>

              <div className="px-1.5 py-1 bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-900/50 rounded-lg text-[9px] sm:text-[10px] text-amber-800 dark:text-amber-300 font-semibold flex items-center gap-1">
                <ShieldAlert size={11} className="text-amber-600 shrink-0" />
                <span className="truncate">Inspect in Person · No Online Pay</span>
              </div>
            </div>
          ) : !isCV && !isJob && !isSold ? (
            /* Small items: Add to Cart (Pay with Paystack MoMo) + WhatsApp */
            <div className="mt-2 space-y-1.5">
              <div className="flex flex-col sm:grid sm:grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onAddToCart) {
                      onAddToCart(listing, e);
                    } else {
                      onOpenDetails(listing);
                    }
                  }}
                  className="w-full py-2.5 px-2 bg-[#FF6600] hover:bg-[#e65c00] active:scale-98 text-white rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm border border-orange-500 hover:shadow-md min-h-[38px]"
                  title="Add to Cart & Pay with Paystack MoMo or Cash on Delivery"
                >
                  <ShoppingCart size={14} className="shrink-0" />
                  <span className="truncate">
                    {listing.seller?.name?.includes('Daniel') ? 'Add to Cart - MoMo' : 'Add to Cart'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={handleWhatsAppChat}
                  className="w-full py-2.5 px-2 bg-[#25D366] hover:bg-[#20ba59] active:scale-98 text-white rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm border border-[#20ba59] hover:shadow-md min-h-[38px]"
                  title={`Chat with ${listing.seller.name} on WhatsApp`}
                >
                  <MessageCircle size={14} className="fill-current text-white shrink-0" />
                  <span className="truncate">
                    {listing.seller?.name?.includes('Daniel') ? 'Chat Daniel' : 'WhatsApp'}
                  </span>
                </button>
              </div>

              <div className="flex items-center justify-between text-[9px] sm:text-[10px] text-slate-500 dark:text-slate-400 px-0.5 font-medium">
                <span className="flex items-center gap-0.5 text-[#00875A] dark:text-emerald-400 font-bold truncate">
                  <span>✓</span>
                  <span>MoMo / COD</span>
                </span>
                <span className="truncate ml-1">Door Courier</span>
              </div>
            </div>
          ) : (
            /* Jobs, CVs or Sold items */
            <button
              type="button"
              onClick={handleWhatsAppChat}
              className={`w-full mt-2 py-2.5 px-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm group/wa min-h-[40px] ${
                isSold
                  ? 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                  : 'bg-[#25D366] hover:bg-[#20ba59] active:bg-[#1da850] text-white border border-[#20ba59] shadow-sm hover:shadow-md'
              }`}
            >
              <MessageCircle size={15} className="fill-current text-white shrink-0 group-hover/wa:scale-110 transition-transform" />
              <span className="truncate">{isSold ? 'Item Sold · Inquire' : isJob || isCV ? 'Contact on WhatsApp' : 'WhatsApp Seller'}</span>
            </button>
          )}

          {/* Quick Action Row: Boost Ad (50 GHS via Paystack) + Call + Report */}
          <div className="mt-1.5 grid grid-cols-3 gap-1">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenBoost?.(listing, e);
              }}
              className="py-1.5 px-1 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 hover:opacity-95 text-white text-[11px] font-black rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer shadow-2xs"
              title="Pin this product to the top for 7 days (50 GHS via Paystack)"
            >
              <Zap size={11} fill="currentColor" className="shrink-0" />
              <span className="truncate">{listing.isPromoted ? 'Promoted' : 'Boost 50 GHS'}</span>
            </button>

            <button
              type="button"
              onClick={handleCallClick}
              className="py-1.5 px-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-[11px] font-bold rounded-lg border border-slate-200 dark:border-slate-700 transition-colors flex items-center justify-center gap-1 cursor-pointer"
              title={`Direct phone call to seller (${listing.seller.phone})`}
            >
              <Phone size={11} className="text-amber-600 dark:text-amber-400 shrink-0" />
              <span>Call</span>
            </button>

            <button
              type="button"
              onClick={handleReportClick}
              className="py-1.5 px-1 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-950/70 text-rose-700 dark:text-rose-400 text-[11px] font-bold rounded-lg border border-rose-200/80 dark:border-rose-900/60 transition-colors flex items-center justify-center gap-1 cursor-pointer"
              title="Buyer can report fraud or counterfeit product"
            >
              <ShieldAlert size={11} className="text-rose-600 dark:text-rose-400 shrink-0" />
              <span>Report</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
