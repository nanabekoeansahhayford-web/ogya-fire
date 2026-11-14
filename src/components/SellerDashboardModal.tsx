import React, { useState, useMemo } from 'react';
import {
  X,
  Package,
  Eye,
  MessageCircle,
  ShieldCheck,
  Plus,
  Zap,
  TrendingUp,
  Clock,
  Phone,
  CheckCircle2,
  AlertCircle,
  Lock,
  Unlock,
  Check,
  Trash2,
  ExternalLink,
  ChevronRight,
  Sparkles,
  BarChart3,
  Users,
  Search,
  Filter,
  RefreshCw,
  Send,
  Building2,
  DollarSign,
  ShieldAlert,
  Sliders,
  FileCheck,
  LogOut,
} from 'lucide-react';
import { Listing, UserProfile } from '../types/marketplace';
import { formatPrice, markListingAsSold } from '../utils/storage';
import {
  updateListingStatusInFirestore,
  clearTestProductsFromFirestore,
  removeDuplicateProductsFromFirestore,
} from '../utils/firebase';
import {
  getVerificationRequests,
  getVerificationRequestByUserId,
  submitGhanaCardVerification,
  approveGhanaCardVerification,
  rejectGhanaCardVerification,
  validateGhanaCardNumber,
  GhanaCardVerificationRequest,
  SAMPLE_GHANA_CARD_FRONT,
  getMoMoVerificationRequests,
  getMoMoVerificationRequestByUserId,
  submitMoMoVerification,
  approveMoMoVerification,
  rejectMoMoVerification,
  recordSuccessfulSale,
  MoMoVerificationRequest,
} from '../utils/verification';
import { getAllWhatsAppClicks, generateGhanaWhatsAppUrl } from '../utils/whatsapp';

interface SellerDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  allListings: Listing[];
  onOpenListing: (listing: Listing) => void;
  onOpenPostAd: () => void;
  onOpenBoost?: (listing: Listing) => void;
  onOpenVerifiedSubscription?: () => void;
  onListingUpdated: (listing: Listing) => void;
  onProfileUpdated: (user: UserProfile) => void;
  onToast: (msg: string) => void;
  onLogout?: () => void;
  onOpenSettings?: () => void;
}

export const SellerDashboardModal: React.FC<SellerDashboardModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  allListings,
  onOpenListing,
  onOpenPostAd,
  onOpenBoost,
  onOpenVerifiedSubscription,
  onListingUpdated,
  onProfileUpdated,
  onToast,
  onLogout,
  onOpenSettings,
}) => {
  const [activeTab, setActiveTab] = useState<'products' | 'views' | 'chats' | 'verification'>('products');
  const [productFilter, setProductFilter] = useState<'all' | 'active' | 'sold'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Ghana Card Verification Form State
  const [ghanaCardPin, setGhanaCardPin] = useState(currentUser.ghanaCardNumber || 'GHA-724891204-7');
  const [fullNameOnCard, setFullNameOnCard] = useState(currentUser.name || 'Ansah Ford');
  const [cardPhoto, setCardPhoto] = useState<string>(currentUser.ghanaCardPhotoUrl || SAMPLE_GHANA_CARD_FRONT);
  const [isPhotoBlurred, setIsPhotoBlurred] = useState(true);
  const [isSubmittingCard, setIsSubmittingCard] = useState(false);
  const [adminMode, setAdminMode] = useState(false);
  const [adminInspectionId, setAdminInspectionId] = useState<string | null>(null);
  const [adminInspectionUnblur, setAdminInspectionUnblur] = useState(false);
  const [isClearingTestData, setIsClearingTestData] = useState(false);

  // MoMo Verification Form State
  const [momoName, setMomoName] = useState(currentUser.momoName || currentUser.name || 'Ansah Ford');
  const [momoNumber, setMomoNumber] = useState(currentUser.momoNumber || currentUser.phone || '0245558899');
  const [momoNetwork, setMomoNetwork] = useState<'MTN' | 'Telecel' | 'AT'>(
    (currentUser.momoNetwork as 'MTN' | 'Telecel' | 'AT') || 'MTN'
  );
  const [momoRequests, setMomoRequests] = useState<MoMoVerificationRequest[]>(getMoMoVerificationRequests());
  const [isSubmittingMoMo, setIsSubmittingMoMo] = useState(false);

  // In-Dashboard Chat reply state
  const [activeChatId, setActiveChatId] = useState<string>('chat-1');
  const [chatReplyText, setChatReplyText] = useState('');
  const [demoChats, setDemoChats] = useState([
    {
      id: 'chat-1',
      buyerName: 'Kojo Antwi',
      buyerPhone: '+233 24 991 2233',
      listingId: 'ast-af-01',
      listingTitle: 'Apple iPhone 15 Pro Max 256GB - Natural Titanium',
      price: 13800,
      unread: true,
      lastMessage: 'Hello Mr. Ansah! Can we meet at Accra Mall tomorrow afternoon for inspection?',
      timestamp: '12 mins ago',
      messages: [
        { sender: 'buyer', text: 'Hello, is this iPhone 15 Pro Max still available?', time: '10:45 AM' },
        { sender: 'seller', text: 'Hello Kojo! Yes, it is brand new sealed with 1-year Apple warranty.', time: '10:48 AM' },
        { sender: 'buyer', text: 'Great. Can we meet at Accra Mall tomorrow afternoon for inspection?', time: '11:15 AM' },
      ],
    },
    {
      id: 'chat-2',
      buyerName: 'Ama Serwaa',
      buyerPhone: '+233 20 882 1100',
      listingId: 'ast-af-02',
      listingTitle: '2023 Toyota Land Cruiser Prado TX-L 2.8L Turbo Diesel',
      price: 890000,
      unread: false,
      lastMessage: 'Are the GRA custom clearance duty papers completely verified?',
      timestamp: '2 hours ago',
      messages: [
        { sender: 'buyer', text: 'Good day! I am interested in the Prado TX-L.', time: '9:10 AM' },
        { sender: 'seller', text: 'Good day Ama! You are very welcome. The vehicle is in Airport Residential.', time: '9:20 AM' },
        { sender: 'buyer', text: 'Are the GRA custom clearance duty papers completely verified?', time: '9:25 AM' },
      ],
    },
    {
      id: 'chat-3',
      buyerName: 'Prince Boateng',
      buyerPhone: '+233 55 410 8899',
      listingId: 'ast-veh-01',
      listingTitle: '2022 Range Rover Autobiography 4.4L V8',
      price: 1850000,
      unread: false,
      lastMessage: 'Can you accept a deposit via Bank Guarantee or Escrow?',
      timestamp: 'Yesterday',
      messages: [
        { sender: 'buyer', text: 'Hi, inquiring about the Autobiography.', time: 'Yesterday 3:00 PM' },
        { sender: 'seller', text: 'Hello Prince, yes available for executive inspection.', time: 'Yesterday 3:30 PM' },
        { sender: 'buyer', text: 'Can you accept a deposit via Bank Guarantee or Escrow?', time: 'Yesterday 4:15 PM' },
      ],
    },
  ]);

  if (!isOpen) return null;

  // Filter listings belonging to this seller
  const sellerListings = allListings.filter(
    (l) =>
      l.userId === currentUser.id ||
      l.seller.name.toLowerCase().trim() === currentUser.name.toLowerCase().trim() ||
      (currentUser.businessName && l.seller.name.toLowerCase().trim() === currentUser.businessName.toLowerCase().trim())
  );

  const activeListings = sellerListings.filter((l) => l.status !== 'sold' && !l.isSold);
  const soldListings = sellerListings.filter((l) => l.status === 'sold' || l.isSold);

  const filteredListings = sellerListings.filter((l) => {
    const isItemSold = l.status === 'sold' || Boolean(l.isSold);
    if (productFilter === 'active' && isItemSold) return false;
    if (productFilter === 'sold' && !isItemSold) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return l.title.toLowerCase().includes(q) || l.categoryName.toLowerCase().includes(q);
    }
    return true;
  });

  // Analytics Computations
  const totalViews = sellerListings.reduce((sum, item) => sum + (item.viewsCount || 0), 0);
  const totalLikes = sellerListings.reduce((sum, item) => sum + (item.likesCount || 0), 0);
  const allWhatsAppClicks = getAllWhatsAppClicks();
  const totalWhatsAppClicks = sellerListings.reduce((sum, item) => {
    const recorded = allWhatsAppClicks[item.id] || 0;
    const base = item.whatsappClicks || 0;
    return sum + Math.max(recorded, base);
  }, 0);
  const totalInventoryValue = activeListings.reduce((sum, item) => sum + (item.price || 0), 0);

  // Verification request status
  const currentVerificationReq = getVerificationRequestByUserId(currentUser.id);
  const isVerifiedSeller = currentUser.isVerified || currentVerificationReq?.status === 'verified';
  const verificationRequests = getVerificationRequests();

  // MoMo verification status
  const currentMoMoReq = getMoMoVerificationRequestByUserId(currentUser.id);
  const isMoMoVerified = Boolean(
    currentUser.momoVerified ||
    currentUser.momoStatus === 'verified' ||
    currentMoMoReq?.status === 'verified'
  );
  const isMoMoPending = (!isMoMoVerified) && Boolean(
    currentUser.momoStatus === 'pending' ||
    currentMoMoReq?.status === 'pending'
  );
  const salesCount = currentUser.salesCount || 0;
  const isTrusted = Boolean(currentUser.isTrustedSeller || salesCount >= 3);

  // Handlers
  const handleToggleSold = async (listing: Listing, e: React.MouseEvent) => {
    e.stopPropagation();
    const currentSold = listing.status === 'sold' || Boolean(listing.isSold);
    const nextSold = !currentSold;
    const nextStatus: 'active' | 'sold' = nextSold ? 'sold' : 'active';

    try {
      await updateListingStatusInFirestore(listing.id, nextStatus, nextSold);
      markListingAsSold(listing.id, nextSold);
      const updated: Listing = {
        ...listing,
        status: nextStatus,
        isSold: nextSold,
        soldAt: nextSold ? new Date().toISOString() : undefined,
      };
      onListingUpdated(updated);
      onToast(nextSold ? `🎉 Listing "${listing.title.slice(0, 24)}..." marked as SOLD!` : `Listing restored to Active!`);
    } catch {
      markListingAsSold(listing.id, nextSold);
      const updated: Listing = { ...listing, status: nextStatus, isSold: nextSold };
      onListingUpdated(updated);
      onToast(nextSold ? 'Listing marked as SOLD.' : 'Listing restored to Active.');
    }
  };

  const handleSendChatReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatReplyText.trim()) return;

    setDemoChats((prev) =>
      prev.map((c) => {
        if (c.id === activeChatId) {
          return {
            ...c,
            lastMessage: chatReplyText.trim(),
            timestamp: 'Just now',
            messages: [
              ...c.messages,
              { sender: 'seller', text: chatReplyText.trim(), time: 'Just now' },
            ],
          };
        }
        return c;
      })
    );
    setChatReplyText('');
    onToast('Reply sent to buyer.');
  };

  const handleSubmitGhanaCard = (e: React.FormEvent) => {
    e.preventDefault();
    const pinValidation = validateGhanaCardNumber(ghanaCardPin);
    if (!pinValidation.valid) {
      onToast(`⚠️ ${pinValidation.error || 'Invalid Ghana Card PIN format.'}`);
      return;
    }

    setIsSubmittingCard(true);
    setTimeout(() => {
      submitGhanaCardVerification({
        userId: currentUser.id,
        sellerName: fullNameOnCard.trim() || currentUser.name,
        sellerEmail: currentUser.email,
        sellerPhone: currentUser.phone,
        ghanaCardNumber: pinValidation.formatted,
        cardFrontPhoto: cardPhoto,
      });

      const updatedUser: UserProfile = {
        ...currentUser,
        ghanaCardNumber: pinValidation.formatted,
        ghanaCardPhotoUrl: cardPhoto,
        ghanaCardStatus: 'pending',
      };
      onProfileUpdated(updatedUser);
      setIsSubmittingCard(false);
      onToast('🇬🇭 Ghana Card submitted! Our Verification Officer will manually inspect your card.');
    }, 600);
  };

  const handleAdminApprove = (reqId: string) => {
    const updated = approveGhanaCardVerification(reqId);
    if (updated) {
      if (updated.userId === currentUser.id) {
        const verifiedUser: UserProfile = {
          ...currentUser,
          isVerified: true,
          ghanaCardStatus: 'verified',
        };
        onProfileUpdated(verifiedUser);
      }
      onToast(`✅ Approved! Verified Badge issued to ${updated.sellerName} (Ghana Card ${updated.ghanaCardNumber})`);
    }
  };

  const handleAdminReject = (reqId: string) => {
    const reason = prompt('Please enter rejection reason (e.g., photo blurry, PIN mismatch):', 'Card photo is blurry / expired.');
    if (!reason) return;

    const updated = rejectGhanaCardVerification(reqId, reason);
    if (updated) {
      if (updated.userId === currentUser.id) {
        onProfileUpdated({
          ...currentUser,
          ghanaCardStatus: 'rejected',
          ghanaCardRejectReason: reason,
        });
      }
      onToast(`Submission rejected with feedback.`);
    }
  };

  const handleSubmitMoMoVerification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!momoName.trim()) {
      onToast('⚠️ Please enter the registered account name on your MoMo SIM.');
      return;
    }
    const cleanNumber = momoNumber.replace(/[^0-9]/g, '');
    if (cleanNumber.length < 9) {
      onToast('⚠️ Please enter a valid 10-digit Ghana Mobile Money phone number.');
      return;
    }

    setIsSubmittingMoMo(true);
    setTimeout(() => {
      submitMoMoVerification({
        userId: currentUser.id,
        sellerName: currentUser.name,
        momoName: momoName.trim(),
        momoNumber: momoNumber.trim(),
        network: momoNetwork,
      });

      const updatedUser: UserProfile = {
        ...currentUser,
        momoName: momoName.trim(),
        momoNumber: momoNumber.trim(),
        momoNetwork: momoNetwork,
        momoStatus: 'pending',
      };
      onProfileUpdated(updatedUser);
      setMomoRequests(getMoMoVerificationRequests());
      setIsSubmittingMoMo(false);
      onToast('✅ MoMo verification submitted! Shown as "Pending Verification" until admin approval.');
    }, 500);
  };

  const handleAdminApproveMoMo = (reqId: string) => {
    const updated = approveMoMoVerification(reqId);
    if (updated) {
      setMomoRequests(getMoMoVerificationRequests());
      if (updated.userId === currentUser.id) {
        const verifiedUser: UserProfile = {
          ...currentUser,
          momoVerified: true,
          momoStatus: 'verified',
          momoName: updated.momoName,
          momoNumber: updated.momoNumber,
          momoNetwork: updated.network || updated.momoNetwork || 'MTN',
        };
        onProfileUpdated(verifiedUser);
      }
      sellerListings.forEach((item) => {
        onListingUpdated({
          ...item,
          seller: {
            ...item.seller,
            momoVerified: true,
            momoStatus: 'verified',
            momoName: updated.momoName,
            momoNumber: updated.momoNumber,
          },
        });
      });
      onToast(`✅ MoMo Verified badge granted to ${updated.momoName}! Badge is now visible everywhere.`);
    }
  };

  const handleAdminRejectMoMo = (reqId: string) => {
    const reason = prompt('Please enter rejection reason:', 'Account name does not match SIM KYC registration.');
    if (!reason) return;
    const updated = rejectMoMoVerification(reqId, reason);
    if (updated) {
      setMomoRequests(getMoMoVerificationRequests());
      if (updated.userId === currentUser.id) {
        onProfileUpdated({
          ...currentUser,
          momoVerified: false,
          momoStatus: 'rejected',
        });
      }
      onToast('MoMo request marked as rejected.');
    }
  };

  const handleSimulateSale = () => {
    const newCount = recordSuccessfulSale(currentUser.id, currentUser.name);
    const updatedUser: UserProfile = {
      ...currentUser,
      salesCount: newCount,
      isTrustedSeller: newCount >= 3,
    };
    onProfileUpdated(updatedUser);
    sellerListings.forEach((item) => {
      onListingUpdated({
        ...item,
        seller: {
          ...item.seller,
          salesCount: newCount,
          isTrustedSeller: newCount >= 3,
        },
      });
    });
    onToast(
      newCount >= 3
        ? `🎉 Sale recorded! (${newCount} completed sales). ⭐ "Trusted Seller" badge UNLOCKED and active everywhere!`
        : `Sale recorded! (${newCount} completed sales). Reach 3 sales to unlock ⭐ Trusted Seller badge.`
    );
  };

  const handleClearTestData = async () => {
    setIsClearingTestData(true);
    try {
      const result = await clearTestProductsFromFirestore();
      onToast(
        result.deletedCount > 0
          ? `✅ Cleared ${result.deletedCount} test product(s). Kept all ${result.keptCount} real marketplace products.`
          : `No test products found. All ${result.keptCount} real marketplace products are safe.`
      );
    } catch (err: any) {
      onToast(`⚠️ ${err?.message || 'Could not clear test data.'}`);
    } finally {
      setIsClearingTestData(false);
    }
  };

  const handleRemoveExactDuplicates = async () => {
    setIsClearingTestData(true);
    try {
      const result = await removeDuplicateProductsFromFirestore();
      onToast(
        result.deletedCount > 0
          ? `✅ Removed ${result.deletedCount} exact duplicate(s). Kept ${result.keptCount} unique products.`
          : `No exact duplicates found. All ${result.keptCount} products are unique.`
      );
    } catch (err: any) {
      onToast(`⚠️ ${err?.message || 'Could not remove duplicates.'}`);
    } finally {
      setIsClearingTestData(false);
    }
  };

  const handleSampleCardSelect = () => {
    setCardPhoto(SAMPLE_GHANA_CARD_FRONT);
    onToast('Standard Biometric Ghana Card loaded.');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setCardPhoto(reader.result);
          onToast('Ghana Card photo uploaded securely.');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const selectedChat = demoChats.find((c) => c.id === activeChatId) || demoChats[0];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 md:p-6 animate-in fade-in duration-200">
      <div
        className="relative bg-white dark:bg-slate-900 rounded-2xl max-w-6xl w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto max-h-[94vh] flex flex-col text-slate-900 dark:text-slate-100 transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        <div className="px-5 sm:px-6 py-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/90 shrink-0">
          <div className="flex items-center gap-3">
            {/* AF Avatar */}
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 via-orange-500 to-red-600 text-white font-black text-base flex items-center justify-center shadow-md ring-2 ring-orange-500/30 shrink-0">
              AF
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-slate-950 dark:text-white tracking-tight flex items-center gap-1.5">
                  <span>{currentUser.name}</span>
                  <span className="text-xs px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 font-extrabold border border-amber-200 dark:border-amber-900/50">
                    Seller Dashboard
                  </span>
                </h2>
                {isMoMoVerified ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-black px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 shadow-2xs">
                    <span>✅</span>
                    <span>MoMo Verified</span>
                  </span>
                ) : isMoMoPending ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-700">
                    <span>⏳</span>
                    <span>Pending Verification</span>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => setActiveTab('verification')}
                    className="inline-flex items-center gap-1 text-[11px] font-black px-2 py-0.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer shadow-2xs transition-colors"
                    title="Click to verify your Mobile Money number and stop buyer fraud"
                  >
                    <span>✅</span>
                    <span>Verify My MoMo</span>
                  </button>
                )}

                {isTrusted ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-black px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-700 shadow-2xs">
                    <span>⭐</span>
                    <span>Trusted Seller ({salesCount} sales)</span>
                  </span>
                ) : (
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    {salesCount} / 3 sales to ⭐ Trusted
                  </span>
                )}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-0.5">
                <span>{currentUser.businessName || 'Merchant'}</span>
                <span>·</span>
                <span>{currentUser.city || 'Accra, Ghana'}</span>
                <span>·</span>
                <span className="text-amber-600 dark:text-amber-400 font-semibold">{activeListings.length} Active Listings</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenPostAd}
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-xs cursor-pointer transition-all"
            >
              <Plus size={14} />
              <span>Post Product</span>
            </button>
            {onOpenSettings && (
              <button
                type="button"
                onClick={onOpenSettings}
                className="py-1.5 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                title="Open Profile > Settings & Legal"
              >
                <Sliders size={14} className="text-amber-500" />
                <span className="hidden sm:inline">Settings &amp; Legal</span>
              </button>
            )}
            {onLogout && (
              <button
                type="button"
                onClick={() => {
                  onLogout();
                  onClose();
                }}
                className="py-1.5 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-700 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                title="Log Out of Seller Account"
              >
                <LogOut size={14} />
                <span className="hidden sm:inline">Log Out</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-950 dark:hover:text-white rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Close dashboard"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Dashboard Navigation Tabs */}
        <div className="px-5 sm:px-6 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between gap-4 overflow-x-auto shrink-0">
          <nav className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm font-bold">
            <button
              onClick={() => setActiveTab('products')}
              className={`py-3 px-3 sm:px-4 border-b-2 flex items-center gap-2 cursor-pointer transition-all whitespace-nowrap ${
                activeTab === 'products'
                  ? 'border-orange-500 text-orange-600 dark:text-orange-400 font-black'
                  : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white'
              }`}
            >
              <Package size={16} />
              <span>My Products</span>
              <span className="text-xs px-1.5 py-0.2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                {sellerListings.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('views')}
              className={`py-3 px-3 sm:px-4 border-b-2 flex items-center gap-2 cursor-pointer transition-all whitespace-nowrap ${
                activeTab === 'views'
                  ? 'border-orange-500 text-orange-600 dark:text-orange-400 font-black'
                  : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white'
              }`}
            >
              <Eye size={16} />
              <span>Views & Analytics</span>
              <span className="text-xs px-1.5 py-0.2 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 font-mono">
                {totalViews.toLocaleString()}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('chats')}
              className={`py-3 px-3 sm:px-4 border-b-2 flex items-center gap-2 cursor-pointer transition-all whitespace-nowrap ${
                activeTab === 'chats'
                  ? 'border-orange-500 text-orange-600 dark:text-orange-400 font-black'
                  : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white'
              }`}
            >
              <MessageCircle size={16} />
              <span>Chats & Inquiries</span>
              <span className="text-xs px-1.5 py-0.2 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 font-bold">
                {demoChats.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('verification')}
              className={`py-3 px-3 sm:px-4 border-b-2 flex items-center gap-2 cursor-pointer transition-all whitespace-nowrap ${
                activeTab === 'verification'
                  ? 'border-orange-500 text-orange-600 dark:text-orange-400 font-black'
                  : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white'
              }`}
            >
              <ShieldCheck size={16} className={isMoMoVerified ? 'text-emerald-500' : 'text-amber-500'} />
              <span>Trust & MoMo Verification</span>
              {isMoMoVerified ? (
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-600 text-white font-black flex items-center gap-0.5">
                  <span>✅</span>
                  <span>MOMO</span>
                </span>
              ) : isMoMoPending ? (
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500 text-slate-950 font-black flex items-center gap-0.5">
                  <span>⏳</span>
                  <span>PENDING</span>
                </span>
              ) : (
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 font-black">
                  VERIFY NOW
                </span>
              )}
            </button>
          </nav>
        </div>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto p-4 sm:p-6 flex-1 space-y-6">
          {/* TAB 1: MY PRODUCTS */}
          {activeTab === 'products' && (
            <div className="space-y-4">
              {/* Trust & MoMo Verification Quick Callout */}
              {!isMoMoVerified && (
                <div className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  isMoMoPending
                    ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200'
                    : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                }`}>
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl shrink-0">{isMoMoPending ? '⏳' : '🛡️'}</span>
                    <div className="text-xs">
                      <p className="font-extrabold">
                        {isMoMoPending
                          ? 'MoMo Verification Pending Review'
                          : 'Stop Scams & Build Trust: Add the ✅ MoMo Verified Badge to Your Products!'}
                      </p>
                      <p className="text-[11px] opacity-90 mt-0.5">
                        {isMoMoPending
                          ? 'Your Mobile Money details are being reviewed by OGYA administrators. Once approved, the green ✅ MoMo badge will show on every ad.'
                          : 'Buyers in Ghana trust sellers whose MoMo SIM registration is confirmed. Takes 30 seconds to verify.'}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('verification')}
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-xs transition-colors shrink-0 cursor-pointer self-start sm:self-auto"
                  >
                    {isMoMoPending ? 'Check Status' : 'Verify My MoMo →'}
                  </button>
                </div>
              )}

              {/* Filter and Search Bar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 flex-1 max-w-sm shadow-2xs">
                  <Search size={15} className="text-slate-400 shrink-0" />
                  <input
                    type="text"
                    placeholder="Search your products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-transparent text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none w-full font-medium"
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery('')} className="text-slate-400 hover:text-slate-600">
                      <X size={13} />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <div className="inline-flex rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-0.5 text-xs font-semibold">
                    <button
                      onClick={() => setProductFilter('all')}
                      className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                        productFilter === 'all'
                          ? 'bg-orange-500 text-white font-bold shadow-2xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white'
                      }`}
                    >
                      All ({sellerListings.length})
                    </button>
                    <button
                      onClick={() => setProductFilter('active')}
                      className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                        productFilter === 'active'
                          ? 'bg-emerald-600 text-white font-bold shadow-2xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white'
                      }`}
                    >
                      Active ({activeListings.length})
                    </button>
                    <button
                      onClick={() => setProductFilter('sold')}
                      className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                        productFilter === 'sold'
                          ? 'bg-red-600 text-white font-bold shadow-2xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white'
                      }`}
                    >
                      Sold ({soldListings.length})
                    </button>
                  </div>

                  <button
                    onClick={onOpenPostAd}
                    className="sm:hidden px-3 py-1.5 bg-orange-500 text-white font-bold text-xs rounded-lg flex items-center gap-1 shadow-2xs"
                  >
                    <Plus size={13} />
                    <span>New Ad</span>
                  </button>
                </div>
              </div>

              {/* Product List Cards */}
              {filteredListings.length === 0 ? (
                <div className="text-center py-12 px-4 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                  <Package size={40} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" />
                  <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">No products match your filter</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                    {searchQuery ? 'Try clearing your search query or switching tabs.' : 'Post your first item to start receiving buyer inquiries on WhatsApp!'}
                  </p>
                  <button
                    onClick={onOpenPostAd}
                    className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-bold text-xs rounded-xl shadow-sm cursor-pointer"
                  >
                    <Plus size={14} />
                    <span>Post New Product Now</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {filteredListings.map((item) => {
                    const isSold = item.status === 'sold' || Boolean(item.isSold);
                    const clicks = Math.max(allWhatsAppClicks[item.id] || 0, item.whatsappClicks || 0);

                    return (
                      <div
                        key={item.id}
                        className={`p-3.5 sm:p-4 rounded-xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                          isSold
                            ? 'bg-slate-50/70 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800/80 opacity-85'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-2xs'
                        }`}
                      >
                        {/* Left: Thumbnail & Info */}
                        <div className="flex items-center gap-3.5 min-w-0 flex-1">
                          <div
                            onClick={() => onOpenListing(item)}
                            className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0 cursor-pointer group"
                          >
                            <img
                              src={item.images?.[0] || SAMPLE_GHANA_CARD_FRONT}
                              alt={item.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                            {isSold && (
                              <div className="absolute inset-0 bg-red-950/70 flex items-center justify-center">
                                <span className="text-[10px] font-black uppercase text-white bg-red-600 px-1 rounded">SOLD</span>
                              </div>
                            )}
                          </div>

                          <div className="min-w-0 space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                                {item.categoryName} · {item.subcategory}
                              </span>
                              {isSold ? (
                                <span className="text-[10px] font-black uppercase text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-950/80 px-2 py-0.5 rounded border border-red-200 dark:border-red-900/60">
                                  Marked Sold
                                </span>
                              ) : (
                                <span className="text-[10px] font-black uppercase text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-900/60 flex items-center gap-1">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                  Active Listing
                                </span>
                              )}
                              {item.isPromoted && !isSold && (
                                <span className="text-[10px] font-extrabold uppercase text-white bg-gradient-to-r from-red-600 to-amber-500 px-2 py-0.5 rounded flex items-center gap-0.5 shadow-2xs">
                                  <Zap size={10} fill="currentColor" />
                                  Promoted
                                </span>
                              )}
                            </div>

                            <h3
                              onClick={() => onOpenListing(item)}
                              className="text-sm font-bold text-slate-900 dark:text-slate-100 hover:text-amber-600 dark:hover:text-amber-400 transition-colors cursor-pointer truncate"
                            >
                              {item.title}
                            </h3>

                            <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
                              <span className="font-extrabold text-sm text-slate-950 dark:text-white tabular-nums">
                                {formatPrice(item.price, item.currency)}
                              </span>
                              <span>·</span>
                              <span className="flex items-center gap-1">
                                <Eye size={12} className="text-slate-400" />
                                <span className="tabular-nums font-mono font-medium">{item.viewsCount} views</span>
                              </span>
                              <span>·</span>
                              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                                <MessageCircle size={12} className="fill-current" />
                                <span className="tabular-nums font-mono">{clicks} WhatsApp leads</span>
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Right: Quick Action Buttons */}
                        <div className="flex items-center gap-2 self-end sm:self-center shrink-0 w-full sm:w-auto justify-end border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100 dark:border-slate-800">
                          {/* Toggle Active / Sold */}
                          <button
                            type="button"
                            onClick={(e) => handleToggleSold(item, e)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
                              isSold
                                ? 'bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                                : 'bg-slate-100 hover:bg-red-50 dark:bg-slate-800 dark:hover:bg-red-950/60 text-slate-700 hover:text-red-700 dark:text-slate-300 dark:hover:text-red-300 border-slate-300 dark:border-slate-700'
                            }`}
                            title={isSold ? 'Click to re-activate this listing' : 'Mark this product as SOLD'}
                          >
                            <CheckCircle2 size={13} className={isSold ? 'text-emerald-600' : 'text-slate-400'} />
                            <span>{isSold ? 'Mark Active' : 'Mark as Sold'}</span>
                          </button>

                          {/* Boost / Pin */}
                          {!isSold && (
                            <button
                              type="button"
                              onClick={() => onOpenBoost?.(item)}
                              className="px-3 py-1.5 bg-gradient-to-r from-red-600 via-orange-500 to-amber-500 hover:opacity-95 text-white text-xs font-black rounded-xl flex items-center gap-1 shadow-2xs cursor-pointer active:scale-98"
                              title="Pay 50 GHS via Paystack to pin product to top for 7 days"
                            >
                              <Zap size={12} fill="currentColor" />
                              <span>Boost (50 GHS)</span>
                            </button>
                          )}

                          {/* View in site */}
                          <button
                            type="button"
                            onClick={() => onOpenListing(item)}
                            className="p-2 text-slate-500 hover:text-slate-950 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-xl cursor-pointer"
                            title="View product details"
                          >
                            <ExternalLink size={14} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: VIEWS & ANALYTICS */}
          {activeTab === 'views' && (
            <div className="space-y-6">
              {/* Stat Highlights Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider">Total Product Views</span>
                    <Eye size={17} className="text-amber-500" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tabular-nums">
                    {totalViews.toLocaleString()}
                  </div>
                  <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1 flex items-center gap-1">
                    <TrendingUp size={12} />
                    <span>+24% impressions this week</span>
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider">WhatsApp Clicks</span>
                    <MessageCircle size={17} className="text-[#25D366]" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tabular-nums">
                    {totalWhatsAppClicks.toLocaleString()}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-1">
                    Direct buyer chats initiated
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider">Active Inventory</span>
                    <Package size={17} className="text-blue-500" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tabular-nums">
                    {activeListings.length}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-1">
                    {soldListings.length} products successfully sold
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider">Total Value</span>
                    <DollarSign size={17} className="text-emerald-500" />
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tabular-nums truncate">
                    GH₵ {totalInventoryValue.toLocaleString()}
                  </div>
                  <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
                    Live asking price volume
                  </div>
                </div>
              </div>

              {/* Product Views Breakdown Table */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
                <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
                    Per-Product Views & WhatsApp Engagement
                  </h4>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Ranked by views
                  </span>
                </div>

                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {sellerListings
                    .slice()
                    .sort((a, b) => (b.viewsCount || 0) - (a.viewsCount || 0))
                    .map((item, idx) => {
                      const clicks = Math.max(allWhatsAppClicks[item.id] || 0, item.whatsappClicks || 0);
                      const conversionRate = item.viewsCount > 0 ? ((clicks / item.viewsCount) * 100).toFixed(1) : '0';

                      return (
                        <div
                          key={item.id}
                          className="p-3.5 sm:p-4 flex items-center justify-between gap-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors"
                        >
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <span className="w-6 text-center font-mono font-bold text-xs text-slate-400">
                              #{idx + 1}
                            </span>
                            <img
                              src={item.images?.[0] || SAMPLE_GHANA_CARD_FRONT}
                              alt=""
                              className="w-11 h-11 rounded-lg object-cover shrink-0"
                            />
                            <div className="min-w-0">
                              <h5 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                                {item.title}
                              </h5>
                              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                                {item.categoryName} · {formatPrice(item.price, item.currency)}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-6 shrink-0 text-right">
                            <div>
                              <div className="text-xs sm:text-sm font-black text-slate-900 dark:text-slate-100 tabular-nums">
                                {item.viewsCount}
                              </div>
                              <div className="text-[10px] text-slate-400 uppercase font-medium">Views</div>
                            </div>

                            <div>
                              <div className="text-xs sm:text-sm font-black text-[#25D366] tabular-nums">
                                {clicks}
                              </div>
                              <div className="text-[10px] text-slate-400 uppercase font-medium">WhatsApp</div>
                            </div>

                            <div className="hidden sm:block">
                              <div className="text-xs sm:text-sm font-black text-amber-600 dark:text-amber-400 tabular-nums">
                                {conversionRate}%
                              </div>
                              <div className="text-[10px] text-slate-400 uppercase font-medium">Inquiry Rate</div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CHATS & INQUIRIES */}
          {activeTab === 'chats' && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 h-[520px]">
              {/* Left Column: Inquiry Threads List (4 cols) */}
              <div className="md:col-span-5 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                <div className="p-3 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Buyer Messages ({demoChats.length})
                  </span>
                  <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 font-bold px-2 py-0.5 rounded-full">
                    Live
                  </span>
                </div>

                {demoChats.map((chat) => (
                  <button
                    key={chat.id}
                    onClick={() => setActiveChatId(chat.id)}
                    className={`w-full text-left p-3.5 transition-colors cursor-pointer flex items-start gap-3 ${
                      activeChatId === chat.id
                        ? 'bg-amber-50 dark:bg-amber-950/40 border-l-4 border-amber-500'
                        : 'hover:bg-slate-100 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-slate-700 to-slate-900 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs">
                      {chat.buyerName.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="font-extrabold text-xs text-slate-900 dark:text-slate-100 truncate">
                          {chat.buyerName}
                        </span>
                        <span className="text-[10px] text-slate-400 shrink-0 font-medium">{chat.timestamp}</span>
                      </div>
                      <div className="text-[11px] font-semibold text-amber-700 dark:text-amber-400 truncate mb-1">
                        {chat.listingTitle}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                        {chat.lastMessage}
                      </p>
                    </div>
                  </button>
                ))}
              </div>

              {/* Right Column: Active Conversation (7 cols) */}
              <div className="md:col-span-7 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col bg-white dark:bg-slate-900 overflow-hidden">
                {/* Chat Header */}
                <div className="p-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/60">
                  <div className="min-w-0">
                    <h4 className="font-black text-sm text-slate-900 dark:text-white flex items-center gap-1.5 truncate">
                      <span>{selectedChat.buyerName}</span>
                      <span className="text-xs font-normal text-slate-400">({selectedChat.buyerPhone})</span>
                    </h4>
                    <span className="text-xs text-amber-600 dark:text-amber-400 font-bold truncate block">
                      Inquiring on: {selectedChat.listingTitle} · {formatPrice(selectedChat.price)}
                    </span>
                  </div>

                  {/* Jump to WhatsApp Button */}
                  <a
                    href={generateGhanaWhatsAppUrl(selectedChat.buyerPhone, selectedChat.listingTitle, selectedChat.price, selectedChat.buyerName)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-bold rounded-xl shadow-2xs transition-colors shrink-0"
                    title="Open chat in WhatsApp"
                  >
                    <MessageCircle size={14} className="fill-current" />
                    <span>WhatsApp</span>
                  </a>
                </div>

                {/* Message Thread */}
                <div className="p-4 flex-1 overflow-y-auto space-y-3 bg-slate-50/30 dark:bg-slate-950/20">
                  {selectedChat.messages.map((m, idx) => (
                    <div
                      key={idx}
                      className={`flex flex-col ${m.sender === 'seller' ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-xs leading-relaxed shadow-2xs ${
                          m.sender === 'seller'
                            ? 'bg-amber-500 text-slate-950 font-medium rounded-br-xs'
                            : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-bl-xs'
                        }`}
                      >
                        {m.text}
                      </div>
                      <span className="text-[10px] text-slate-400 mt-1 px-1">{m.time}</span>
                    </div>
                  ))}
                </div>

                {/* Reply Box */}
                <form onSubmit={handleSendChatReply} className="p-3 border-t border-slate-200 dark:border-slate-800 flex gap-2">
                  <input
                    type="text"
                    placeholder={`Reply to ${selectedChat.buyerName}...`}
                    value={chatReplyText}
                    onChange={(e) => setChatReplyText(e.target.value)}
                    className="flex-1 px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-amber-500 font-medium"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Send size={13} />
                    <span>Send</span>
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* TAB 4: GHANA CARD VERIFICATION & MANUAL REVIEW */}
          {activeTab === 'verification' && (
            <div className="space-y-6">
              {/* Header Banner */}
              <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-emerald-500/10 border border-amber-300 dark:border-amber-800/80 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold text-lg shrink-0 shadow-xs">
                    🇬🇭
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white flex items-center gap-2">
                      <span>Official Ghana Card Verification</span>
                      {isVerifiedSeller ? (
                        <span className="text-xs bg-emerald-600 text-white font-bold px-2 py-0.5 rounded-full">
                          Verified Seller
                        </span>
                      ) : (
                        <span className="text-xs bg-amber-500 text-slate-950 font-bold px-2 py-0.5 rounded-full">
                          Pending Approval
                        </span>
                      )}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                      Sellers upload their Ghana Card photo (blurred for strict privacy). Verified manually by OGYA administrators.
                    </p>
                  </div>
                </div>

                {/* Admin Mode Switch Toggle */}
                <button
                  type="button"
                  onClick={() => setAdminMode(!adminMode)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
                    adminMode
                      ? 'bg-purple-600 text-white border-purple-500 shadow-sm'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-100'
                  }`}
                  title="Switch between Seller View and Admin Verification Queue"
                >
                  <Sliders size={13} />
                  <span>{adminMode ? 'Viewing as: Verifier Admin' : 'Switch to Admin Review Mode'}</span>
                </button>
              </div>

              {/* ADMIN VERIFICATION QUEUE & DATA CLEANUP */}
              {adminMode ? (
                <div className="space-y-6">
                  {/* Marketplace Admin: Clear Test Data & Duplicates */}
                  <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h4 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                        <Trash2 size={16} className="text-rose-600 dark:text-rose-400" />
                        <span>Admin Marketplace Cleanup (Test Data Only)</span>
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Deletes ONLY products marked as test (&quot;TEST - Delete Me&quot;, &quot;test test&quot;, or isTest=true). Real products including Phone Accessories are never deleted.
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 flex-wrap">
                      <button
                        type="button"
                        disabled={isClearingTestData}
                        onClick={handleClearTestData}
                        className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-black rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-60"
                      >
                        <Trash2 size={13} />
                        <span>{isClearingTestData ? 'Clearing...' : 'Clear Test Data'}</span>
                      </button>
                      <button
                        type="button"
                        disabled={isClearingTestData}
                        onClick={handleRemoveExactDuplicates}
                        className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer disabled:opacity-60"
                      >
                        Remove Duplicates
                      </button>
                    </div>
                  </div>

                  {/* MoMo Verification Applications Queue */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                        <ShieldCheck size={16} className="text-emerald-600 dark:text-emerald-400" />
                        <span>MoMo Verification Queue (Instant KYC Anti-Scam)</span>
                      </h4>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {momoRequests.filter((r) => r.status === 'pending').length} pending MoMo requests
                      </span>
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                      {momoRequests.map((mReq) => (
                        <div
                          key={mReq.id}
                          className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                              MoMo
                            </div>
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                                  {mReq.sellerName}
                                </span>
                                {mReq.status === 'verified' && (
                                  <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded-full font-bold flex items-center gap-0.5">
                                    <span>✅</span>
                                    <span>Approved</span>
                                  </span>
                                )}
                                {mReq.status === 'pending' && (
                                  <span className="text-[10px] bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded-full font-bold">
                                    Pending Review
                                  </span>
                                )}
                                {mReq.status === 'rejected' && (
                                  <span className="text-[10px] bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 px-2 py-0.5 rounded-full font-bold">
                                    Rejected
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-0.5 flex-wrap">
                                <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                                  SIM Name: {mReq.momoName}
                                </span>
                                <span>·</span>
                                <span className="font-mono">{mReq.momoNumber} ({mReq.network || mReq.momoNetwork || 'MTN'})</span>
                                <span>·</span>
                                <span>Submitted {mReq.submittedAt}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {mReq.status !== 'verified' && (
                              <button
                                type="button"
                                onClick={() => handleAdminApproveMoMo(mReq.id)}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1"
                              >
                                <Check size={13} />
                                <span>Approve MoMo & Grant Badge</span>
                              </button>
                            )}
                            {mReq.status === 'pending' && (
                              <button
                                type="button"
                                onClick={() => handleAdminRejectMoMo(mReq.id)}
                                className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400 text-xs font-bold rounded-xl border border-rose-200 dark:border-rose-900 transition-colors cursor-pointer"
                              >
                                Reject
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Ghana Card Queue */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                        <FileCheck size={16} className="text-purple-600 dark:text-purple-400" />
                        <span>Ghana National Card Queue (Manual Inspection)</span>
                      </h4>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {verificationRequests.filter((r) => r.status === 'pending').length} pending applications
                      </span>
                    </div>

                  <div className="grid grid-cols-1 gap-4">
                    {verificationRequests.map((req) => {
                      const isInspecting = adminInspectionId === req.id;

                      return (
                        <div
                          key={req.id}
                          className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-xs"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white font-black text-sm flex items-center justify-center shrink-0">
                                {req.sellerName.slice(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <h5 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                                  <span>{req.sellerName}</span>
                                  {req.status === 'verified' && (
                                    <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded-full font-bold">
                                      Approved
                                    </span>
                                  )}
                                  {req.status === 'pending' && (
                                    <span className="text-[10px] bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded-full font-bold">
                                      Pending Review
                                    </span>
                                  )}
                                  {req.status === 'rejected' && (
                                    <span className="text-[10px] bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 px-2 py-0.5 rounded-full font-bold">
                                      Rejected
                                    </span>
                                  )}
                                </h5>
                                <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-0.5">
                                  <span className="font-mono text-amber-600 dark:text-amber-400 font-bold">{req.ghanaCardNumber}</span>
                                  <span>·</span>
                                  <span>{req.sellerPhone}</span>
                                  <span>·</span>
                                  <span>Submitted {req.submittedAt}</span>
                                </div>
                              </div>
                            </div>

                            {/* Verification Actions */}
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  if (isInspecting) {
                                    setAdminInspectionId(null);
                                  } else {
                                    setAdminInspectionId(req.id);
                                    setAdminInspectionUnblur(false);
                                  }
                                }}
                                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-1"
                              >
                                {isInspecting ? 'Hide Card' : 'Inspect Card'}
                              </button>

                              {req.status !== 'verified' && (
                                <button
                                  type="button"
                                  onClick={() => handleAdminApprove(req.id)}
                                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer transition-colors flex items-center gap-1"
                                >
                                  <Check size={14} />
                                  <span>Approve & Grant Badge</span>
                                </button>
                              )}

                              {req.status === 'pending' && (
                                <button
                                  type="button"
                                  onClick={() => handleAdminReject(req.id)}
                                  className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400 text-xs font-bold rounded-xl border border-rose-200 dark:border-rose-900 transition-colors cursor-pointer"
                                >
                                  Reject
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Inspection Panel */}
                          {isInspecting && (
                            <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3 animate-in fade-in">
                              <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
                                <span className="font-bold flex items-center gap-1.5">
                                  <Lock size={13} className="text-amber-500" />
                                  <span>Ghana National Identity Card Inspection</span>
                                </span>
                                <button
                                  type="button"
                                  onClick={() => setAdminInspectionUnblur(!adminInspectionUnblur)}
                                  className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
                                >
                                  {adminInspectionUnblur ? <Lock size={12} /> : <Unlock size={12} />}
                                  <span>{adminInspectionUnblur ? 'Re-blur Card' : 'Unblur Card to Inspect'}</span>
                                </button>
                              </div>

                              <div className="relative rounded-xl overflow-hidden max-w-lg mx-auto border border-slate-300 dark:border-slate-700 shadow-md">
                                <img
                                  src={req.cardFrontPhoto}
                                  alt="Ghana Card Preview"
                                  className={`w-full h-auto transition-all duration-300 ${
                                    adminInspectionUnblur ? 'filter-none' : 'blur-md'
                                  }`}
                                />
                                {!adminInspectionUnblur && (
                                  <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-xs flex flex-col items-center justify-center text-white text-center p-4">
                                    <Lock size={28} className="text-amber-400 mb-2" />
                                    <span className="font-bold text-xs uppercase tracking-wider">
                                      Encrypted Preview (Blurred for Privacy)
                                    </span>
                                    <span className="text-[11px] text-slate-300 mt-0.5">
                                      Click "Unblur Card to Inspect" above to view full details
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              /* SELLER VERIFICATION SUBMISSION FORM */
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* FEATURE 1: VERIFY MY MOMO (Anti-Scam Verification for Ghana) */}
                  <div className="lg:col-span-12">
                    {isMoMoVerified ? (
                      /* Approved MoMo Verified Card */
                      <div className="p-5 bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-emerald-500/15 border-2 border-emerald-500/50 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
                        <div className="flex items-start gap-3.5">
                          <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white font-black text-xl flex items-center justify-center shrink-0 shadow-sm">
                            ✅
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="text-base font-black text-slate-900 dark:text-white">
                                ✅ MoMo Verified Seller Active
                              </h4>
                              <span className="text-[11px] font-black bg-emerald-600 text-white px-2.5 py-0.5 rounded-full uppercase tracking-wide">
                                Verified
                              </span>
                            </div>
                            <p className="text-xs text-slate-700 dark:text-slate-300">
                              Registered Name: <strong className="text-slate-950 dark:text-white">{currentUser.momoName || currentUser.name}</strong> · MoMo Number: <strong className="font-mono text-emerald-700 dark:text-emerald-400">{currentUser.momoNumber || currentUser.phone} ({currentUser.momoNetwork || 'MTN'})</strong>
                            </p>
                            <p className="text-[11px] text-emerald-800 dark:text-emerald-300/90 font-medium pt-0.5">
                              The small green ✅ MoMo Verified badge is live on all your product cards and profile. This reassures buyers that your identity is genuine and protects against scams.
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className="inline-flex items-center gap-1 text-xs font-black px-3 py-1.5 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-700 shadow-2xs">
                            <span>✅</span>
                            <span>Badges Live on Products</span>
                          </span>
                        </div>
                      </div>
                    ) : isMoMoPending ? (
                      /* Pending Verification Card */
                      <div className="p-5 bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/15 border-2 border-amber-400 dark:border-amber-700 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
                        <div className="flex items-start gap-3.5">
                          <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 font-black text-xl flex items-center justify-center shrink-0 shadow-sm animate-pulse">
                            ⏳
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="text-base font-black text-slate-900 dark:text-white">
                                MoMo Verification: Pending Admin Review
                              </h4>
                              <span className="text-[11px] font-black bg-amber-500 text-slate-950 px-2.5 py-0.5 rounded-full uppercase tracking-wide">
                                Pending
                              </span>
                            </div>
                            <p className="text-xs text-slate-700 dark:text-slate-300">
                              Submitted Name: <strong className="text-slate-950 dark:text-white">{currentUser.momoName || momoName}</strong> · Phone: <strong className="font-mono text-amber-700 dark:text-amber-400">{currentUser.momoNumber || momoNumber} ({currentUser.momoNetwork || momoNetwork})</strong>
                            </p>
                            <p className="text-[11px] text-amber-800 dark:text-amber-300/90 font-medium pt-0.5">
                              Your details are currently awaiting verification by OGYA administrators. Once approved, the green ✅ MoMo Verified badge will appear automatically on all your product cards.
                            </p>
                          </div>
                        </div>

                        {/* One-Click Approval for Testing */}
                        <div className="flex flex-col sm:flex-row items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleAdminApproveMoMo(currentMoMoReq?.id || 'req-momo-ansah-01')}
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer active:scale-98"
                            title="Simulate immediate admin approval to grant green badge"
                          >
                            <Check size={14} />
                            <span>Instant Admin Approve (Demo KYC)</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* Not Verified: Form with "Verify My MoMo" Button */
                      <form onSubmit={handleSubmitMoMoVerification} className="p-5 bg-white dark:bg-slate-900 rounded-2xl border-2 border-emerald-500/30 shadow-md space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white font-black text-lg flex items-center justify-center shrink-0">
                              🛡️
                            </div>
                            <div>
                              <h4 className="text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                                <span>Verify My MoMo (Stop Scams & Earn Trust)</span>
                                <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded-full font-bold">
                                  Ghana KYC
                                </span>
                              </h4>
                              <p className="text-xs text-slate-500 dark:text-slate-400">
                                Enter your Mobile Money account name and number to earn the green ✅ MoMo Verified badge on all your listings.
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                              MoMo Registered Name
                            </label>
                            <input
                              type="text"
                              required
                              value={momoName}
                              onChange={(e) => setMomoName(e.target.value)}
                              placeholder="e.g. Ansah Ford / Daniel Aboagye"
                              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                              MoMo Phone Number
                            </label>
                            <input
                              type="tel"
                              required
                              value={momoNumber}
                              onChange={(e) => setMomoNumber(e.target.value)}
                              placeholder="e.g. 024 555 8899"
                              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                              Network Provider
                            </label>
                            <select
                              value={momoNetwork}
                              onChange={(e) => setMomoNetwork(e.target.value as 'MTN' | 'Telecel' | 'AT')}
                              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
                            >
                              <option value="MTN">MTN Mobile Money (MoMo)</option>
                              <option value="Telecel">Telecel Cash</option>
                              <option value="AT">AT Money (AirtelTigo)</option>
                            </select>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            Submitting sends your request to administrators with status <strong>"Pending Verification"</strong>. Upon approval, your green badge activates instantly.
                          </p>
                          <button
                            type="submit"
                            disabled={isSubmittingMoMo}
                            className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:opacity-95 text-white font-black text-xs sm:text-sm rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5 shrink-0 active:scale-98"
                          >
                            {isSubmittingMoMo ? (
                              <RefreshCw size={15} className="animate-spin" />
                            ) : (
                              <ShieldCheck size={16} />
                            )}
                            <span>Verify My MoMo</span>
                          </button>
                        </div>
                      </form>
                    )}
                  </div>

                  {/* FEATURE 2: ⭐ TRUSTED SELLER (3+ SALES) TRACKER & SIMULATOR */}
                  <div className="lg:col-span-12 p-5 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10 border-2 border-amber-300 dark:border-amber-800/80 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
                    <div className="flex items-start gap-3.5">
                      <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 font-black text-xl flex items-center justify-center shrink-0 shadow-sm">
                        ⭐
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-base font-black text-slate-900 dark:text-white">
                            ⭐ Trusted Seller Milestone (3+ Successful Sales)
                          </h4>
                          {isTrusted ? (
                            <span className="text-[11px] font-black bg-amber-500 text-slate-950 px-2.5 py-0.5 rounded-full uppercase tracking-wide">
                              ⭐ Badge Active
                            </span>
                          ) : (
                            <span className="text-[11px] font-bold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-full">
                              {salesCount} / 3 Completed
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-700 dark:text-slate-300">
                          {isTrusted
                            ? `You have completed ${salesCount} successful sales on OGYA! The ⭐ Trusted Seller badge is active across all your product cards and profile.`
                            : `Complete 3 successful transactions to automatically unlock the ⭐ Trusted Seller badge on all your listings.`}
                        </p>
                        {/* Progress bar */}
                        <div className="w-48 bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden mt-1.5">
                          <div
                            className="bg-amber-500 h-full rounded-full transition-all duration-300"
                            style={{ width: `${Math.min(100, (salesCount / 3) * 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleSimulateSale}
                      className="px-4 py-2.5 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer shrink-0 active:scale-98"
                      title="Simulate recording a completed sale to test the 3+ sales Trusted Seller milestone"
                    >
                      <Plus size={14} />
                      <span>Record Completed Sale (+1)</span>
                    </button>
                  </div>

                  {/* 100 GHS/Month Verified Subscription Fast-Track Banner */}
                  <div className="lg:col-span-12 p-4 bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-amber-500/15 border-2 border-emerald-500/40 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black shrink-0 shadow-sm">
                        <ShieldCheck size={22} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-black text-slate-900 dark:text-white">
                            Verified Seller Pro Badge (100 GHS / Month)
                          </h4>
                          <span className="text-[10px] bg-emerald-600 text-white font-black px-2 py-0.5 rounded uppercase">
                            Paystack Instant
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                          Skip waiting for manual verification! Pay 100 GHS/month via Paystack (MTN MoMo, Telecel or Card) to instantly activate the Verified Seller Badge on all your products.
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenVerifiedSubscription?.();
                      }}
                      className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:opacity-95 text-white font-black text-xs rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer shrink-0 active:scale-98"
                    >
                      <ShieldCheck size={14} />
                      <span>Subscribe 100 GHS/mo</span>
                    </button>
                  </div>

                  {/* Left 6 Columns: Upload & Card Preview */}
                  <div className="lg:col-span-6 space-y-4">
                    <div className="bg-slate-50 dark:bg-slate-800/40 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                          <Lock size={14} className="text-amber-500" />
                          <span>Ghana Card Photo (Encrypted & Blurred)</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => setIsPhotoBlurred(!isPhotoBlurred)}
                          className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          {isPhotoBlurred ? <Unlock size={12} /> : <Lock size={12} />}
                          <span>{isPhotoBlurred ? 'Toggle Unblur' : 'Blur Document'}</span>
                        </button>
                      </div>

                      {/* Card Preview Container with Blur */}
                      <div className="relative rounded-2xl overflow-hidden border border-slate-300 dark:border-slate-700 shadow-md aspect-[16/10] bg-slate-900 flex items-center justify-center">
                        <img
                          src={cardPhoto}
                          alt="Ghana Card Document"
                          className={`w-full h-full object-contain transition-all duration-300 ${
                            isPhotoBlurred ? 'filter blur-md select-none' : 'filter-none'
                          }`}
                        />
                        {isPhotoBlurred && (
                          <div className="absolute inset-0 bg-slate-950/45 backdrop-blur-[1px] flex flex-col items-center justify-center text-white text-center p-4 select-none">
                            <Lock size={26} className="text-amber-400 mb-2" />
                            <span className="font-black text-xs uppercase tracking-wide">
                              Blurred For Your Privacy
                            </span>
                            <span className="text-[11px] text-slate-300 mt-1 max-w-xs">
                              Only authorized verification administrators can inspect this document during manual verification.
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Upload and Sample Actions */}
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <label className="py-2 px-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs transition-colors">
                          <Plus size={13} />
                          <span>Upload File</span>
                          <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                        </label>

                        <button
                          type="button"
                          onClick={handleSampleCardSelect}
                          className="py-2 px-3 bg-amber-500/10 hover:bg-amber-500/20 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-800 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                        >
                          Use Sample Card
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Right 6 Columns: Submission Details Form */}
                  <div className="lg:col-span-6 space-y-4">
                    <form onSubmit={handleSubmitGhanaCard} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-xs">
                      <h4 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                        Seller Verification Submission
                      </h4>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Full Legal Name (as on Ghana Card)
                        </label>
                        <input
                          type="text"
                          required
                          value={fullNameOnCard}
                          onChange={(e) => setFullNameOnCard(e.target.value)}
                          placeholder="e.g. ANSAH FORD NANA BEKOE"
                          className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center justify-between">
                          <span>Ghana Card PIN Number</span>
                          <span className="text-[10px] text-amber-600 font-mono">Format: GHA-XXXXXXXXX-X</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={ghanaCardPin}
                          onChange={(e) => setGhanaCardPin(e.target.value.toUpperCase())}
                          placeholder="GHA-724891204-7"
                          className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500 tracking-wider"
                        />
                      </div>

                      <div className="p-3 bg-amber-50/70 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-900/50 text-xs text-amber-950 dark:text-amber-200 space-y-1">
                        <div className="font-bold flex items-center gap-1.5 text-amber-900 dark:text-amber-300">
                          <ShieldCheck size={14} className="text-amber-600" />
                          <span>Why verify with Ghana Card?</span>
                        </div>
                        <p className="text-[11px] leading-relaxed text-amber-800/90 dark:text-amber-300/80">
                          Verified sellers receive 5x more inquiries, the official 🇬🇭 Ghana Card Verified badge on all listings, and enhanced buyer trust.
                        </p>
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmittingCard}
                        className="w-full py-3 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 hover:opacity-95 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                      >
                        {isSubmittingCard ? (
                          <RefreshCw size={16} className="animate-spin" />
                        ) : (
                          <CheckCircle2 size={16} />
                        )}
                        <span>{isVerifiedSeller ? 'Update Ghana Card Verification' : 'Submit Ghana Card for Verification'}</span>
                      </button>

                      {/* Quick Admin Test Trigger */}
                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-center">
                        <button
                          type="button"
                          onClick={() => {
                            setAdminMode(true);
                            setAdminInspectionId('req-ansah-01');
                          }}
                          className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline cursor-pointer flex items-center justify-center gap-1 mx-auto"
                        >
                          <span>Open Admin Manual Verification Queue →</span>
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
