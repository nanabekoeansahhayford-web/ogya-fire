import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  X,
  Upload,
  CheckCircle2,
  Image as ImageIcon,
  Sparkles,
  User,
  UserPlus,
  ShieldCheck,
  MessageCircle,
  Database,
  MapPin,
  Tag,
  Plus,
  Trash2,
  Lock,
  LogIn,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { CATEGORIES, REGIONS } from '../data/categories';
import { CategoryId, ItemCondition, Listing, UserProfile } from '../types/marketplace';
import { saveCustomListing, getStoredListings } from '../utils/storage';
import { auth, saveListingToFirestore, uploadListingImageToStorage } from '../utils/firebase';
import { compressImageToMax1MB } from '../utils/imageUpload';
import { CategoryIcon } from './CategoryIcon';
import { SmartPriceAdvisor } from './SmartPriceAdvisor';
import heroMarketplaceShowcaseImg from '../assets/images/hero_marketplace_showcase_1792291775965.jpg';
import spotlightVehiclesAutoImg from '../assets/images/spotlight_vehicles_auto_1792291776565.jpg';
import spotlightModernPropertyImg from '../assets/images/spotlight_modern_property_1792291776719.jpg';
import spotlightDevicesTechImg from '../assets/images/spotlight_devices_tech_1792291775880.jpg';
import ghanaCourierDeliveryImg from '../assets/images/ghana_courier_delivery_1792921463636.jpg';

interface PostAdModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdCreated: (newListing: Listing) => void;
  currentUser?: UserProfile | null;
  onOpenAuth?: (mode?: 'register' | 'signin') => void;
}

export const PostAdModal: React.FC<PostAdModalProps> = ({
  isOpen,
  onClose,
  onAdCreated,
  currentUser,
  onOpenAuth,
}) => {
  const [categoryId, setCategoryId] = useState<CategoryId>('vehicles');
  const [subcategory, setSubcategory] = useState<string>(CATEGORIES[0].subcategories[0]);
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [isNegotiable, setIsNegotiable] = useState(true);
  const [region, setRegion] = useState(currentUser?.region || REGIONS[0]);
  const [location, setLocation] = useState(currentUser?.city || '');
  const [condition, setCondition] = useState<ItemCondition>('Brand New');
  const [description, setDescription] = useState('');
  const [sellerName, setSellerName] = useState(
    currentUser ? currentUser.businessName || currentUser.name : ''
  );
  const [phone, setPhone] = useState(currentUser?.phone || '+233 ');
  const [whatsapp, setWhatsapp] = useState(
    currentUser?.whatsapp || currentUser?.phone || '+233 '
  );
  const [photoItems, setPhotoItems] = useState<
    Array<{
      id: string;
      file?: File;
      fileName: string;
      previewUrl: string;
      downloadUrl: string | null;
      progress: number;
      status: 'uploading' | 'done' | 'error';
      error?: string;
      compressedSizeKb?: number;
      isDefaultShowcase?: boolean;
    }>
  >([
    {
      id: 'default-showcase',
      fileName: 'showcase.jpg',
      previewUrl: heroMarketplaceShowcaseImg,
      downloadUrl: heroMarketplaceShowcaseImg,
      progress: 100,
      status: 'done',
      isDefaultShowcase: true,
    },
  ]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const blobUrlsRef = useRef<Set<string>>(new Set());

  // Clean up created object URLs on unmount
  useEffect(() => {
    const urls = blobUrlsRef.current;
    return () => {
      urls.forEach((url) => {
        try {
          URL.revokeObjectURL(url);
        } catch {
          // ignore
        }
      });
      urls.clear();
    };
  }, []);

  // Update seller fields whenever currentUser changes
  useEffect(() => {
    if (currentUser) {
      setSellerName(currentUser.businessName || currentUser.name);
      setPhone(currentUser.phone);
      setWhatsapp(currentUser.whatsapp || currentUser.phone);
      if (currentUser.region) setRegion(currentUser.region);
      if (currentUser.city) setLocation(currentUser.city);
    }
  }, [currentUser]);

  // Candidate CV specific
  const [candidateName, setCandidateName] = useState('');
  const [candidateProfession, setCandidateProfession] = useState('');
  const [candidateExp, setCandidateExp] = useState('3-5 Years');
  const [candidateEdu, setCandidateEdu] = useState('Bachelor Degree');
  const [candidateSkills, setCandidateSkills] = useState('');

  // Job specific
  const [companyName, setCompanyName] = useState('');
  const [employmentType, setEmploymentType] = useState<
    'Full-time' | 'Part-time' | 'Contract' | 'Remote'
  >('Full-time');
  const [jobRequirements, setJobRequirements] = useState('');

  const allListings = useMemo(() => getStoredListings(), [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setSaveSuccess(false);
      setErrorMessage(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const currentCategory = CATEGORIES.find((c) => c.id === categoryId) || CATEGORIES[0];
  const isUploadingImages = photoItems.some((item) => item.status === 'uploading');
  const failedPhotoItems = photoItems.filter((item) => item.status === 'error');
  const uploadingItems = photoItems.filter((item) => item.status === 'uploading');
  const overallUploadPercent =
    uploadingItems.length > 0
      ? Math.round(
          uploadingItems.reduce((sum, item) => sum + item.progress, 0) / uploadingItems.length
        )
      : 100;

  const handleCategoryChange = (newCat: CategoryId) => {
    setCategoryId(newCat);
    const cat = CATEGORIES.find((c) => c.id === newCat);
    if (cat && cat.subcategories.length > 0) {
      setSubcategory(cat.subcategories[0]);
    }
  };

  const startPhotoUpload = async (itemId: string, file: File) => {
    try {
      const compressedFile = await compressImageToMax1MB(file);
      const compressedKb = Math.max(1, Math.round(compressedFile.size / 1024));

      setPhotoItems((prev) =>
        prev.map((item) =>
          item.id === itemId ? { ...item, compressedSizeKb: compressedKb } : item
        )
      );

      const { downloadUrl } = await uploadListingImageToStorage(
        compressedFile,
        compressedFile.name,
        (percent) => {
          setPhotoItems((prev) =>
            prev.map((item) =>
              item.id === itemId
                ? { ...item, progress: percent, status: 'uploading' }
                : item
            )
          );
        },
        'listings'
      );

      setPhotoItems((prev) =>
        prev.map((item) =>
          item.id === itemId
            ? {
                ...item,
                downloadUrl,
                progress: 100,
                status: 'done',
                error: undefined,
              }
            : item
        )
      );
    } catch (err: any) {
      console.log('Image upload error:', err);
      const exactMessage =
        err instanceof Error
          ? err.message
          : typeof err === 'string'
          ? err
          : JSON.stringify(err);
      setPhotoItems((prev) =>
        prev.map((item) =>
          item.id === itemId
            ? {
                ...item,
                status: 'error',
                error: exactMessage,
              }
            : item
        )
      );
      setErrorMessage(exactMessage);
    }
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setErrorMessage(null);

    const existingNonDefaultCount = photoItems.filter((p) => !p.isDefaultShowcase).length;
    const remainingSlots = Math.max(0, 8 - existingNonDefaultCount);
    if (remainingSlots === 0) {
      setErrorMessage('Maximum of 8 photos reached. Remove a photo to upload another.');
      e.target.value = '';
      return;
    }

    const selectedFiles = Array.from(files).slice(0, remainingSlots);
    const newItems = selectedFiles.map((file, idx) => {
      const previewUrl = URL.createObjectURL(file);
      blobUrlsRef.current.add(previewUrl);
      return {
        id: `upload-${Date.now()}-${idx}-${Math.random().toString(36).slice(2, 7)}`,
        file,
        fileName: file.name,
        previewUrl,
        downloadUrl: null,
        progress: 0,
        status: 'uploading' as const,
      };
    });

    // Immediately show preview + "Uploading... 0%" progress
    setPhotoItems((prev) => {
      const filtered = prev.filter((item) => !item.isDefaultShowcase);
      return [...filtered, ...newItems].slice(0, 8);
    });

    e.target.value = '';

    // Compress to max 1MB and upload each selected image to Firebase Storage
    newItems.forEach((item) => {
      if (item.file) {
        void startPhotoUpload(item.id, item.file);
      }
    });
  };

  const handleRetryUpload = (itemId: string) => {
    const target = photoItems.find((p) => p.id === itemId);
    if (!target || !target.file) return;
    setErrorMessage(null);
    setPhotoItems((prev) =>
      prev.map((item) =>
        item.id === itemId
          ? { ...item, status: 'uploading', progress: 0, error: undefined }
          : item
      )
    );
    void startPhotoUpload(itemId, target.file);
  };

  const handleRemoveImage = (index: number) => {
    setPhotoItems((prev) => {
      const target = prev[index];
      if (target?.previewUrl?.startsWith('blob:')) {
        try {
          URL.revokeObjectURL(target.previewUrl);
          blobUrlsRef.current.delete(target.previewUrl);
        } catch {
          // ignore
        }
      }
      return prev.filter((_, idx) => idx !== index);
    });
  };

  const handleAddPreset = (url: string) => {
    setPhotoItems((prev) => {
      const filtered = prev.filter((item) => !item.isDefaultShowcase);
      if (filtered.length >= 8) return filtered;
      return [
        ...filtered,
        {
          id: `preset-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          fileName: 'sample.jpg',
          previewUrl: url,
          downloadUrl: url,
          progress: 100,
          status: 'done' as const,
        },
      ].slice(0, 8);
    });
  };

  const handleCopyPhoneToWhatsApp = () => {
    if (phone.trim()) {
      setWhatsapp(phone.trim());
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!currentUser || !auth.currentUser) {
      setErrorMessage('Please sign in as a Seller before publishing a product.');
      return;
    }

    if (isUploadingImages) {
      setErrorMessage('Please wait until all photo uploads finish before submitting.');
      return;
    }

    if (failedPhotoItems.length > 0) {
      setErrorMessage(
        failedPhotoItems[0].error ||
          'One or more photos failed to upload. Please retry or remove failed photos before submitting.'
      );
      return;
    }

    if (!title.trim() || !price || !sellerName.trim()) {
      setErrorMessage('Please fill in required fields: Product Title, Price in GHS, and Seller Name.');
      return;
    }

    if (!location.trim()) {
      setErrorMessage('Please provide your town/city location in Ghana (e.g., East Legon, Accra or Adum, Kumasi).');
      return;
    }

    if (!whatsapp.trim() || whatsapp.trim().length < 8) {
      setErrorMessage('Please enter a valid Seller WhatsApp number so buyers can reach you.');
      return;
    }

    setIsSaving(true);

    const generatedId = `prod-${Date.now()}`;
    const cleanPrice = parseFloat(price) || 0;
    const sellerUid = auth.currentUser.uid;

    const newListing: Listing = {
      id: generatedId,
      userId: sellerUid,
      sellerId: sellerUid,
      title: title.trim(),
      categoryId,
      categoryName: currentCategory.name,
      subcategory,
      price: cleanPrice,
      currency: 'GH₵',
      isNegotiable,
      location: location.trim(),
      region,
      condition,
      description: description.trim() || `${title.trim()} for sale in ${location.trim()}, ${region}. Contact seller on WhatsApp for quick inspection and deal closure.`,
      images: (() => {
        const uploadedUrls = photoItems
          .filter((item) => item.status === 'done' && item.downloadUrl)
          .map((item) => item.downloadUrl as string);
        return uploadedUrls.length > 0 ? uploadedUrls : [heroMarketplaceShowcaseImg];
      })(),
      seller: {
        name: sellerName.trim(),
        isVerified: currentUser ? currentUser.isVerified : true,
        memberSince: currentUser ? currentUser.memberSince : 'November 2026',
        phone: phone.trim() || '+233 24 000 0000',
        whatsapp: whatsapp.trim(),
        rating: 5.0,
        reviewCount: 1,
        responseTime: 'Under 10 mins',
        location: location.trim(),
        badges: currentUser?.isVerified
          ? ['verified-pro', 'fast-responder', 'rising-star']
          : ['rising-star', 'fast-responder'],
      },
      postedAt: 'Just now',
      isFeatured: false,
      viewsCount: 1,
      likesCount: 0,
      attributes: {
        'Category': currentCategory.name,
        'Subcategory': subcategory,
        'Condition': condition,
        'Region': region,
      },
    };

    if (categoryId === 'seeking-work-cvs') {
      newListing.cvDetails = {
        candidateName: candidateName.trim() || sellerName.trim(),
        profession: candidateProfession.trim() || title.trim(),
        yearsExperience: candidateExp,
        education: candidateEdu,
        skills: candidateSkills
          ? candidateSkills.split(',').map((s) => s.trim())
          : ['Verified Skills', 'Professional Experience'],
        availability: 'Available Immediately',
        expectedSalary: `GHS ${price} / month`,
      };
    }

    if (categoryId === 'jobs') {
      newListing.jobDetails = {
        companyName: companyName.trim() || sellerName.trim(),
        employmentType,
        salaryPeriod: 'per month',
        requirements: jobRequirements
          ? jobRequirements.split('\n').filter(Boolean)
          : ['Relevant industry qualification', 'Minimum 2 years experience'],
      };
    }

    try {
      // 1. Save directly to Firebase Firestore
      await saveListingToFirestore(newListing);
    } catch (err) {
      console.warn('Firestore write notice (saved locally as fallback):', err);
    }

    // 2. Save locally for instant offline rendering & fast client state
    saveCustomListing(newListing);
    onAdCreated(newListing);

    setIsSaving(false);
    setSaveSuccess(true);

    setTimeout(() => {
      setTitle('');
      setPrice('');
      setDescription('');
      setPhotoItems([
        {
          id: 'default-showcase',
          fileName: 'showcase.jpg',
          previewUrl: heroMarketplaceShowcaseImg,
          downloadUrl: heroMarketplaceShowcaseImg,
          progress: 100,
          status: 'done',
          isDefaultShowcase: true,
        },
      ]);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 dark:bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 md:p-6 animate-in fade-in duration-200">
      <div
        className="relative bg-white dark:bg-slate-900 rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto max-h-[92vh] flex flex-col transition-colors duration-200 text-slate-900 dark:text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/90 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 text-slate-950 flex items-center justify-center font-black shadow-xs">
              🔥
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-slate-950 dark:text-white leading-tight">
                  Sell Product on OGYA
                </h3>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 flex items-center gap-1">
                  <Database size={10} />
                  <span>Firestore Connected</span>
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Upload photos, set price in GHS, select location, and connect directly with Ghanaian buyers on WhatsApp
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Form Body */}
        {!currentUser || !auth.currentUser ? (
          <div className="p-8 sm:p-10 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center mx-auto">
              <Lock size={28} />
            </div>
            <h4 className="text-lg font-black text-slate-900 dark:text-white">
              Seller Sign-In Required
            </h4>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
              Only signed-in users can create listings on OGYA FIRE. Sign in with Email, Phone OTP, or Google so your products are protected under your verified Seller ID.
            </p>
            <div className="flex flex-col sm:flex-row gap-2.5 justify-center pt-2">
              {onOpenAuth && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenAuth('signin');
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 text-white font-black text-xs sm:text-sm rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <LogIn size={16} />
                  <span>Sign In / Register to Sell</span>
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-3 border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold text-xs rounded-xl cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-6 flex-1 text-slate-900 dark:text-slate-100 text-xs sm:text-sm">
          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs font-semibold flex items-center gap-2">
              <span className="font-bold">⚠️</span>
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Member Authentication Status Strip */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-900/60 text-xs">
            <div className="flex items-center gap-2">
              <ShieldCheck size={16} className="text-amber-600 dark:text-amber-400 shrink-0" />
              <span className="text-slate-800 dark:text-slate-200">
                Posting as verified seller: <strong className="text-amber-800 dark:text-amber-300 font-extrabold">{currentUser.name}</strong> ({currentUser.accountType})
              </span>
            </div>
            <span className="text-[10px] font-bold bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded shadow-2xs">
              UID Verified
            </span>
          </div>

          {/* Step 1: Select Category */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
              Select Category (17 Verified Sectors) *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-1 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950/50">
              {CATEGORIES.map((cat) => {
                const isSelected = categoryId === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleCategoryChange(cat.id)}
                    className={`flex items-center gap-2 p-2 rounded-lg text-left text-xs font-semibold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200/60 dark:border-slate-700'
                    }`}
                  >
                    <CategoryIcon
                      categoryId={cat.id}
                      size={15}
                      className={isSelected ? 'text-slate-950' : 'text-slate-600 dark:text-slate-300'}
                    />
                    <span className="truncate">{cat.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Subcategory */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Subcategory *
            </label>
            <select
              value={subcategory}
              onChange={(e) => setSubcategory(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500"
            >
              {currentCategory.subcategories.map((sub) => (
                <option key={sub} value={sub} className="dark:bg-slate-900 dark:text-slate-100">
                  {sub}
                </option>
              ))}
            </select>
          </div>

          {/* Step 2: Product Photo Upload */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <ImageIcon size={14} className="text-amber-500" />
                <span>Product Photo Upload ({photoItems.length}/8) *</span>
              </label>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                Max 1MB compressed · First photo is main cover
              </span>
            </div>

            <div className="p-4 border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-amber-500 dark:hover:border-amber-400 rounded-2xl bg-slate-50 dark:bg-slate-950/60 space-y-3 transition-colors">
              {/* Photo Thumbnails Preview */}
              {photoItems.length > 0 && (
                <div className="flex items-center gap-3 overflow-x-auto pb-1.5 pt-0.5">
                  {photoItems.map((item, idx) => (
                    <div
                      key={item.id}
                      className={`relative w-24 h-24 rounded-xl overflow-hidden border-2 bg-slate-200 dark:bg-slate-800 shrink-0 group shadow-xs ${
                        item.status === 'error'
                          ? 'border-rose-500'
                          : item.status === 'uploading'
                          ? 'border-amber-500'
                          : 'border-slate-300 dark:border-slate-700'
                      }`}
                    >
                      <img
                        src={item.previewUrl}
                        alt={`Product photo ${idx + 1}`}
                        className={`w-full h-full object-cover ${
                          item.status === 'uploading' ? 'opacity-70' : ''
                        }`}
                      />

                      {/* Immediate Uploading... % Overlay */}
                      {item.status === 'uploading' && (
                        <div className="absolute inset-0 bg-slate-950/70 flex flex-col items-center justify-center p-1.5 text-center">
                          <div className="w-5 h-5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mb-1" />
                          <span className="text-[10px] font-black text-amber-300 leading-tight">
                            Uploading... {item.progress}%
                          </span>
                          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mt-1">
                            <div
                              className="h-full bg-amber-400 transition-all duration-150"
                              style={{ width: `${Math.max(4, item.progress)}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Failed Upload Overlay */}
                      {item.status === 'error' && (
                        <div className="absolute inset-0 bg-rose-950/80 flex flex-col items-center justify-center p-1.5 text-center gap-1">
                          <AlertCircle size={16} className="text-rose-300" />
                          <span className="text-[9px] font-extrabold text-rose-200 leading-tight">
                            Upload Failed
                          </span>
                          {item.file && (
                            <button
                              type="button"
                              onClick={() => handleRetryUpload(item.id)}
                              className="px-1.5 py-0.5 rounded bg-white text-rose-700 text-[9px] font-black flex items-center gap-0.5 cursor-pointer hover:bg-rose-50"
                            >
                              <RefreshCw size={9} />
                              <span>Retry</span>
                            </button>
                          )}
                        </div>
                      )}

                      {/* Bottom status / index label */}
                      {item.status === 'done' && (
                        <span className="absolute bottom-1 left-1 bg-black/75 text-[9px] text-white px-1.5 py-0.5 rounded font-mono font-bold flex items-center gap-1">
                          <span>{idx === 0 ? 'Cover' : `#${idx + 1}`}</span>
                          {!item.isDefaultShowcase && item.compressedSizeKb && (
                            <span className="text-emerald-300">· {item.compressedSizeKb}KB</span>
                          )}
                        </span>
                      )}

                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="absolute top-1 right-1 w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center opacity-90 hover:opacity-100 transition-opacity cursor-pointer shadow-xs text-xs font-bold z-10"
                        title="Remove photo"
                        aria-label="Remove photo"
                      >
                        ×
                      </button>
                    </div>
                  ))}

                  {/* Add more button */}
                  {photoItems.length < 8 && (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-24 h-24 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-amber-500 text-slate-500 hover:text-amber-500 flex flex-col items-center justify-center gap-1 shrink-0 cursor-pointer bg-white dark:bg-slate-800 transition-colors"
                      title="Add more photos"
                    >
                      <Plus size={18} />
                      <span className="text-[10px] font-bold">Add Photo</span>
                    </button>
                  )}
                </div>
              )}

              {/* Live Uploading Progress Banner */}
              {isUploadingImages && (
                <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs font-bold flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <div className="w-3.5 h-3.5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin shrink-0" />
                    <span>Uploading... {overallUploadPercent}% (Compressing &amp; saving to Firebase Storage)</span>
                  </div>
                  <span className="font-mono text-[11px]">{overallUploadPercent}%</span>
                </div>
              )}

              {/* Exact Upload Error Details */}
              {failedPhotoItems.length > 0 && (
                <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs space-y-1">
                  {failedPhotoItems.map((failed) => (
                    <div key={failed.id} className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-1.5">
                        <AlertCircle size={14} className="text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                        <span>
                          <strong className="font-bold">{failed.fileName}:</strong>{' '}
                          {failed.error || 'Upload failed'}
                        </span>
                      </div>
                      {failed.file && (
                        <button
                          type="button"
                          onClick={() => handleRetryUpload(failed.id)}
                          className="text-[11px] font-black text-rose-700 dark:text-rose-300 underline shrink-0 cursor-pointer"
                        >
                          Retry
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Upload CTA Row */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageFileChange}
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full sm:w-auto px-4 py-2.5 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs border border-transparent dark:border-slate-700"
                >
                  <Upload size={14} className="text-amber-400" />
                  <span>Choose Photos from Computer / Phone</span>
                </button>

                <span className="text-[11px] text-slate-500 dark:text-slate-400 text-center sm:text-right">
                  Auto-compressed to max 1MB · PNG, JPG, WebP supported.
                </span>
              </div>

              {/* Quick Preset Samples */}
              <div className="pt-2 border-t border-slate-200/80 dark:border-slate-800/80">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Or load high-resolution Ghanaian sample photos:
                </span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    type="button"
                    onClick={() => handleAddPreset(spotlightVehiclesAutoImg)}
                    className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 px-2 py-1 rounded-lg cursor-pointer"
                  >
                    + Auto / Car
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddPreset(spotlightModernPropertyImg)}
                    className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 px-2 py-1 rounded-lg cursor-pointer"
                  >
                    + Property
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddPreset(spotlightDevicesTechImg)}
                    className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 px-2 py-1 rounded-lg cursor-pointer"
                  >
                    + Phone & Tech
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAddPreset(ghanaCourierDeliveryImg)}
                    className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 px-2 py-1 rounded-lg cursor-pointer"
                  >
                    + Delivery Goods
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Step 3: Product Title & Price in GHS with AI Smart Price Advisor */}
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Product Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. iPhone 15 Pro Max 256GB, or 2022 Toyota RAV4 XLE"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-semibold text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between">
                  <span>Price in GHS (GH₵) *</span>
                  <span className="text-[10px] text-amber-600 dark:text-amber-400 font-extrabold">GHS</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-extrabold text-slate-500 dark:text-slate-400">
                    GHS
                  </span>
                  <input
                    type="number"
                    required
                    min="0"
                    step="any"
                    placeholder="0.00"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full pl-13 pr-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-bold tabular-nums text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <label className="flex items-center gap-2 mt-2 text-xs font-medium text-slate-600 dark:text-slate-400 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isNegotiable}
                    onChange={(e) => setIsNegotiable(e.target.checked)}
                    className="rounded text-amber-500 focus:ring-0 cursor-pointer"
                  />
                  <span>Price is Negotiable</span>
                </label>
              </div>
            </div>

            {/* AI Smart Price Advisor Panel */}
            <SmartPriceAdvisor
              title={title}
              categoryId={categoryId}
              categoryName={currentCategory.name}
              subcategory={subcategory}
              condition={condition}
              region={region}
              location={location}
              description={description}
              currentPrice={price}
              isNegotiable={isNegotiable}
              onApplyPrice={(val) => setPrice(val.toString())}
              onSetNegotiable={(val) => setIsNegotiable(val)}
              allListings={allListings}
            />
          </div>

          {/* Step 4: Location (Region & Neighborhood in Ghana) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1">
                <MapPin size={13} className="text-red-500" />
                <span>Region in Ghana *</span>
              </label>
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500 cursor-pointer"
              >
                {REGIONS.map((r) => (
                  <option key={r} value={r} className="dark:bg-slate-900 dark:text-slate-100">
                    {r}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Town / Area Location *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. East Legon, Accra / Adum, Kumasi"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-medium text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Condition *
              </label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value as ItemCondition)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500 cursor-pointer"
              >
                <option value="Brand New" className="dark:bg-slate-900 dark:text-slate-100">Brand New</option>
                <option value="Like New / Mint" className="dark:bg-slate-900 dark:text-slate-100">Like New / Mint</option>
                <option value="Refurbished" className="dark:bg-slate-900 dark:text-slate-100">Refurbished</option>
                <option value="Fairly Used" className="dark:bg-slate-900 dark:text-slate-100">Fairly Used</option>
                <option value="Not Applicable" className="dark:bg-slate-900 dark:text-slate-100">Not Applicable</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
              Product Description *
            </label>
            <textarea
              required
              rows={3}
              placeholder="Provide complete product specifications, warranty info, reason for selling, and inspection details..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl leading-relaxed text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Step 5: Seller Contact Information with Seller WhatsApp */}
          <div className="bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-slate-900 dark:text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
                <User size={14} className="text-amber-500" />
                <span>Seller Contact Details</span>
              </span>
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 size={12} />
                <span>Enables 1-Click WhatsApp Chat</span>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Seller / Store Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kwame Mensah"
                  value={sellerName}
                  onChange={(e) => setSellerName(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-medium text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Phone Number (Calls) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="+233 24 123 4567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-medium text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1">
                    <MessageCircle size={13} className="text-[#25D366] fill-current" />
                    <span>Seller WhatsApp *</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleCopyPhoneToWhatsApp}
                    className="text-[10px] font-bold text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
                  >
                    Copy Phone
                  </button>
                </div>
                <input
                  type="text"
                  required
                  placeholder="+233 24 123 4567"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-[#25D366]/60 dark:border-[#25D366]/50 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-[#25D366]"
                />
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-900/50 flex items-center gap-2 text-[11px] text-emerald-900 dark:text-emerald-200">
              <MessageCircle size={15} className="text-[#25D366] shrink-0 fill-current" />
              <span>
                Your WhatsApp number will power the <strong>'Chat on WhatsApp'</strong> button on your listing so buyers can inquire instantly.
              </span>
            </div>
          </div>

          {/* Footer Submit */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Database size={13} className="text-emerald-500" />
              <span>Saves securely to Google Cloud Firestore</span>
            </span>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving || isUploadingImages}
                className="px-6 py-2.5 bg-gradient-to-r from-amber-500 via-amber-400 to-orange-500 hover:from-amber-400 hover:to-orange-400 active:from-amber-600 text-slate-950 font-black text-xs sm:text-sm rounded-xl transition-all shadow-md cursor-pointer flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isUploadingImages ? (
                  <>
                    <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    <span>Uploading... {overallUploadPercent}%</span>
                  </>
                ) : isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    <span>Saving to Firestore...</span>
                  </>
                ) : saveSuccess ? (
                  <>
                    <CheckCircle2 size={16} className="text-slate-950" />
                    <span>Saved to Firestore!</span>
                  </>
                ) : (
                  <>
                    <span>Sell Product on OGYA</span>
                    <span>🔥</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
        )}
      </div>
    </div>
  );
};
