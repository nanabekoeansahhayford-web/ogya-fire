import React, { useState } from 'react';
import {
  X,
  Store,
  CheckCircle2,
  AlertCircle,
  Building2,
  Phone,
  MapPin,
  FileText,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  LogIn,
} from 'lucide-react';
import { Vendor } from '../types/store';
import { saveVendorToFirestore, updateUserRoleToVendor } from '../utils/firebase';
import { UserProfile } from '../types/marketplace';

interface BecomeVendorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  onVendorCreated: (vendor: Vendor) => void;
  onOpenAuth: () => void;
}

export const BecomeVendorModal: React.FC<BecomeVendorModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onVendorCreated,
  onOpenAuth,
}) => {
  const [shopName, setShopName] = useState(
    currentUser?.businessName || (currentUser?.name ? `${currentUser.name} Store` : '')
  );
  const [phone, setPhone] = useState(currentUser?.phone || '+233 24 000 0000');
  const [location, setLocation] = useState(currentUser?.city || 'Accra, Greater Accra');
  const [description, setDescription] = useState(
    'Registered vendor offering quality products, food, and verified delivery across Ghana.'
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!currentUser) {
      setError('Please log in or register before creating a vendor shop.');
      return;
    }

    if (!shopName.trim()) {
      setError('Please enter your Fire Equipment Shop Name.');
      return;
    }
    if (!phone.trim()) {
      setError('A contact phone number is required for your store.');
      return;
    }
    if (!location.trim()) {
      setError('Please specify your shop location in Ghana.');
      return;
    }

    setIsSubmitting(true);

    try {
      const vendorId = `vnd-${currentUser.id}`;
      const newVendor: Vendor = {
        id: vendorId,
        ownerId: currentUser.id,
        shopName: shopName.trim(),
        phone: phone.trim(),
        location: location.trim(),
        description: description.trim(),
      };

      // 1. Create vendor document in Firestore collection 'vendors'
      await saveVendorToFirestore(newVendor);

      // 2. Set users/{uid} role = 'vendor' in Firestore
      await updateUserRoleToVendor(currentUser.id);

      onVendorCreated(newVendor);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to register vendor shop. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-6 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 text-white relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-white/80 hover:text-white hover:bg-black/20 rounded-full transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X size={18} />
          </button>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[10px] font-black uppercase tracking-wider mb-2">
            <Store size={12} className="text-white" />
            <span>OGYA VENDOR ONBOARDING</span>
          </div>

          <h3 className="text-2xl font-black tracking-tight">
            Become a Verified Vendor
          </h3>
          <p className="text-xs text-white/90 mt-1 max-w-sm">
            Open your dedicated shop in collection 'vendors' and manage your own product listings across Ghana.
          </p>
        </div>

        {/* Body */}
        <div className="p-6 max-h-[75vh] overflow-y-auto">
          {!currentUser ? (
            /* Prompt to Login first */
            <div className="text-center py-6 space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center mx-auto">
                <LogIn size={26} />
              </div>
              <div>
                <h4 className="text-base font-black text-slate-900 dark:text-white">
                  Log in to create your Vendor Shop
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">
                  You must be logged in so your vendor store is linked to your user account (UID) in Firestore.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenAuth();
                }}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-black text-xs rounded-xl shadow-md cursor-pointer hover:opacity-95 transition-all"
              >
                Log In or Create Free Account
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300 text-xs flex items-start gap-2">
                  <AlertCircle size={15} className="text-rose-600 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Vendor Privileges Banner */}
              <div className="p-3.5 rounded-2xl bg-amber-500/10 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800/80 text-xs text-amber-950 dark:text-amber-200 space-y-1">
                <span className="font-extrabold flex items-center gap-1.5 text-amber-900 dark:text-amber-300">
                  <Sparkles size={14} />
                  <span>Instant Vendor Privileges</span>
                </span>
                <p className="text-[11px] leading-relaxed">
                  Submitting will create your store document in collection <code className="font-mono text-red-600 font-bold">'vendors'</code> and set your user profile to <code className="font-mono text-red-600 font-bold">role='vendor'</code> in <code className="font-mono">'users'</code>.
                </p>
              </div>

              {/* Shop Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Shop / Business Name *
                </label>
                <div className="relative">
                  <Building2 size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={shopName}
                    onChange={(e) => setShopName(e.target.value)}
                    placeholder="e.g. Osu Quality Merchants Ghana"
                    className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Phone & Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Store Phone (Ghana) *
                  </label>
                  <div className="relative">
                    <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+233 24 000 0000"
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Store Location (Accra / City) *
                  </label>
                  <div className="relative">
                    <MapPin size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g. Accra, Greater Accra"
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>

              {/* Store Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Shop Description & Specialization
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your equipment stock, refilling services, and GNFS inspection capabilities..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 px-4 bg-gradient-to-r from-amber-500 via-orange-600 to-red-600 hover:opacity-95 text-white font-black text-sm rounded-xl shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.99] disabled:opacity-50"
              >
                <span>{isSubmitting ? 'Registering Vendor...' : 'Create Vendor Store & Unlock Dashboard'}</span>
                <ArrowRight size={17} />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
