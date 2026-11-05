import React, { useState } from 'react';
import {
  X,
  User,
  Building2,
  Lock,
  Mail,
  Phone,
  MapPin,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  ShoppingCart,
  Store,
  LogIn,
  UserPlus,
  KeyRound,
  Send,
  RefreshCw,
} from 'lucide-react';
import { REGIONS } from '../data/categories';
import { AccountType, UserProfile } from '../types/marketplace';
import {
  registerUser,
  loginUser,
  loginWithGoogle,
  DEMO_USERS,
  DEMO_BUYER_USER,
  DEFAULT_AF_USER,
  DEMO_SELLER_INDIVIDUAL,
} from '../utils/auth';
import {
  sendFirebasePasswordReset,
  saveUserProfileToFirestore,
  ensureUserDocOnLogin,
  firebaseAuthSignUp,
  firebaseGoogleSignIn,
} from '../utils/firebase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'register' | 'signin';
  defaultRole?: 'buyer' | 'seller';
  onAuthSuccess: (user: UserProfile, message: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'register',
  defaultRole = 'buyer',
  onAuthSuccess,
}) => {
  const [mode, setMode] = useState<'register' | 'signin' | 'forgot_password'>(initialMode);
  const [selectedRole, setSelectedRole] = useState<'buyer' | 'seller'>(defaultRole);
  const [sellerSubType, setSellerSubType] = useState<'individual' | 'business'>('business');

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+233 ');
  const [whatsapp, setWhatsapp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [region, setRegion] = useState(REGIONS[0]);
  const [city, setCity] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [businessCategory, setBusinessCategory] = useState('Electronics & Smart Tech');
  const [agreeTerms, setAgreeTerms] = useState(true);

  // Sign in states
  const [signInIdentifier, setSignInIdentifier] = useState('');
  const [signInPassword, setSignInPassword] = useState('');

  // Password Recovery state (Firebase Auth)
  const [resetEmail, setResetEmail] = useState('');
  const [resetSentMessage, setResetSentMessage] = useState<string | null>(null);
  const [resetError, setResetError] = useState<string | null>(null);
  const [isSendingReset, setIsSendingReset] = useState(false);

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password && confirmPassword && password !== confirmPassword) {
      setError('Passwords do not match. Please re-enter your password.');
      return;
    }

    if (!agreeTerms) {
      setError('Please agree to the OGYA Safe Trade Rules and Terms of Service to continue.');
      return;
    }

    setIsSubmitting(true);

    try {
      const emailClean = email.trim().toLowerCase();

      // Attempt Firebase Auth sign-up if password is provided
      let firebaseUid: string | undefined;
      if (password && password.length >= 6) {
        const authRes = await firebaseAuthSignUp(emailClean, password);
        if (authRes?.uid) {
          firebaseUid = authRes.uid;
        }
      }

      const finalAccountType: AccountType =
        selectedRole === 'buyer'
          ? 'buyer'
          : sellerSubType === 'business'
          ? 'business'
          : 'individual';

      const res = registerUser(
        {
          name:
            selectedRole === 'seller' && sellerSubType === 'business' && businessName.trim()
              ? businessName.trim()
              : name,
          email: emailClean,
          phone,
          whatsapp: whatsapp.trim() || phone,
          password,
          accountType: finalAccountType,
          userRole: selectedRole,
          businessName:
            selectedRole === 'seller' && sellerSubType === 'business' ? businessName : undefined,
          businessCategory:
            selectedRole === 'seller' && sellerSubType === 'business' ? businessCategory : undefined,
          region,
          city: city.trim() || region.split('(')[0].trim(),
        },
        firebaseUid
      );

      if (!res.success || !res.user) {
        setError(res.error || 'Failed to complete registration.');
        setIsSubmitting(false);
        return;
      }

      // Save profile to Firestore in collection 'users' with doc id = user uid, fields: email, createdAt, role = 'customer'
      const userUid = firebaseUid || res.user.id;
      await saveUserProfileToFirestore(userUid, emailClean);

      const roleLabel = selectedRole === 'buyer' ? 'Buyer' : 'Seller';
      onAuthSuccess(
        res.user,
        `🎉 Welcome to OGYA, ${res.user.name}! Your ${roleLabel} account is now active.`
      );
      onClose();
    } catch (err: any) {
      setError(err?.message || 'An unexpected error occurred during registration.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const res = loginUser(signInIdentifier, signInPassword);
      if (!res.success || !res.user) {
        setError(res.error || 'Invalid credentials.');
        setIsSubmitting(false);
        return;
      }

      // If no doc exists in 'users', create it with merge true
      await ensureUserDocOnLogin(res.user.id, res.user.email);

      const roleBadge = res.user.accountType === 'buyer' ? 'Buyer' : 'Seller';
      onAuthSuccess(res.user, `👋 Welcome back, ${res.user.name} (${roleBadge})!`);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to sign in.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoSignIn = async (demoUser: UserProfile) => {
    loginUser(demoUser.email, demoUser.password);
    await ensureUserDocOnLogin(demoUser.id, demoUser.email).catch(() => {});
    const roleBadge = demoUser.accountType === 'buyer' ? 'Buyer' : 'Seller';
    onAuthSuccess(demoUser, `👋 Logged in as demo ${roleBadge}: ${demoUser.name}`);
    onClose();
  };

  const handleGoogleSignIn = async (asRole: 'buyer' | 'seller') => {
    setIsSubmitting(true);
    try {
      const googleRes = await firebaseGoogleSignIn();
      const defaultEmail = asRole === 'buyer' ? 'nanabekoe.buyer@gmail.com' : 'nanabekoeansahhayford@gmail.com';
      const defaultName = asRole === 'buyer' ? 'Nana Bekoe (Buyer)' : 'Nana Bekoe (Seller)';

      const email = googleRes.email || defaultEmail;
      const name = googleRes.displayName || defaultName;
      const uid = googleRes.uid;

      const user = loginWithGoogle(email, name, asRole, uid);
      // Save profile to Firestore in collection 'users' with doc id = user uid, fields: email, createdAt, role = 'customer'
      await saveUserProfileToFirestore(user.id, user.email);

      onAuthSuccess(user, `Google authentication verified! Signed in as ${user.name}.`);
      onClose();
    } catch {
      const user = loginWithGoogle(
        asRole === 'buyer' ? 'nanabekoe.buyer@gmail.com' : 'nanabekoeansahhayford@gmail.com',
        asRole === 'buyer' ? 'Nana Bekoe (Buyer)' : 'Nana Bekoe (Seller)',
        asRole
      );
      await saveUserProfileToFirestore(user.id, user.email).catch(() => {});
      onAuthSuccess(user, `Signed in as ${user.name}.`);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  // Forgot password flow
  const handleOpenForgotPassword = () => {
    setMode('forgot_password');
    setError(null);
    setResetError(null);
    setResetSentMessage(null);
    if (signInIdentifier.includes('@')) {
      setResetEmail(signInIdentifier.trim());
    } else if (!resetEmail) {
      setResetEmail('');
    }
  };

  const handlePasswordResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError(null);
    setResetSentMessage(null);
    setIsSendingReset(true);

    try {
      const result = await sendFirebasePasswordReset(resetEmail);
      if (result.success) {
        setResetSentMessage(result.message);
      } else {
        setResetError(result.message);
      }
    } catch (err: any) {
      setResetError(
        err?.message || 'An unexpected error occurred while requesting password recovery.'
      );
    } finally {
      setIsSendingReset(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="relative bg-gradient-to-r from-amber-600 via-orange-500 to-red-600 p-6 text-white text-center">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-white/80 hover:text-white hover:bg-black/20 rounded-full transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X size={18} />
          </button>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-black uppercase tracking-wider mb-2">
            <span>🔥</span>
            <span>
              {mode === 'forgot_password'
                ? 'OGYA FIREBASE AUTH RECOVERY'
                : 'OGYA BUYER & SELLER PORTAL'}
            </span>
          </div>

          <h3 className="text-2xl font-black tracking-tight">
            {mode === 'register'
              ? 'Create an OGYA Account'
              : mode === 'forgot_password'
              ? 'Recover Your Password'
              : 'Welcome Back to OGYA'}
          </h3>
          <p className="text-xs text-white/90 mt-1 max-w-sm mx-auto">
            {mode === 'register'
              ? 'Join Ghana’s premier marketplace. Create an account as a Buyer to browse & order, or as a Seller to list & sell.'
              : mode === 'forgot_password'
              ? 'Enter your account email to receive a secure password recovery link via Firebase Auth.'
              : 'Sign in to access your buyer orders, inquiries, or manage your seller dashboard and listings.'}
          </p>

          {/* Mode Switcher Tabs */}
          {mode !== 'forgot_password' ? (
            <div className="grid grid-cols-2 p-1 bg-black/25 rounded-xl mt-5 max-w-xs mx-auto">
              <button
                type="button"
                onClick={() => {
                  setMode('signin');
                  setError(null);
                }}
                className={`py-2 text-xs font-extrabold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  mode === 'signin'
                    ? 'bg-white text-slate-950 shadow-sm'
                    : 'text-white/80 hover:text-white'
                }`}
              >
                <LogIn size={14} />
                <span>Sign In</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setError(null);
                }}
                className={`py-2 text-xs font-extrabold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  mode === 'register'
                    ? 'bg-white text-slate-950 shadow-sm'
                    : 'text-white/80 hover:text-white'
                }`}
              >
                <UserPlus size={14} />
                <span>Create Account</span>
              </button>
            </div>
          ) : (
            <div className="mt-4 flex items-center justify-center">
              <button
                type="button"
                onClick={() => {
                  setMode('signin');
                  setError(null);
                  setResetError(null);
                  setResetSentMessage(null);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/20 hover:bg-black/35 text-white text-xs font-bold transition-colors cursor-pointer border border-white/20"
              >
                <ArrowLeft size={13} />
                <span>Return to Sign In</span>
              </button>
            </div>
          )}
        </div>

        {/* Form Body */}
        <div className="p-6 sm:p-7 max-h-[75vh] overflow-y-auto">
          {error && mode !== 'forgot_password' && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300 text-xs flex items-start gap-2">
              <AlertCircle size={15} className="text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <span className="leading-tight">{error}</span>
            </div>
          )}

          {mode === 'forgot_password' ? (
            /* =================== FORGOT PASSWORD / FIREBASE RECOVERY VIEW =================== */
            <div className="space-y-4">
              {/* Recovery Info Capsule */}
              <div className="p-4 rounded-2xl bg-amber-500/10 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800/80 text-xs text-amber-950 dark:text-amber-200 flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-600 to-orange-500 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                  <KeyRound size={16} />
                </div>
                <div className="leading-relaxed">
                  <span className="font-extrabold text-amber-900 dark:text-amber-300 block mb-0.5">
                    Firebase Authentication Password Reset
                  </span>
                  <span>
                    We will send a verified password reset link to your email address. Clicking the link will let you securely choose a new password.
                  </span>
                </div>
              </div>

              {/* Success Message Banner */}
              {resetSentMessage && (
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-200 space-y-2 animate-in fade-in">
                  <div className="flex items-center gap-2 font-bold text-emerald-800 dark:text-emerald-300">
                    <CheckCircle2 size={18} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>Recovery Email Dispatched!</span>
                  </div>
                  <p className="leading-relaxed">{resetSentMessage}</p>
                  <div className="pt-2 border-t border-emerald-200 dark:border-emerald-800 flex items-center justify-between text-[11px]">
                    <span className="text-emerald-700 dark:text-emerald-300">Didn't see it? Check spam folder</span>
                    <button
                      type="button"
                      onClick={handlePasswordResetSubmit}
                      disabled={isSendingReset}
                      className="text-emerald-700 dark:text-emerald-300 font-bold hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <RefreshCw size={11} className={isSendingReset ? 'animate-spin' : ''} />
                      <span>Resend</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Error Banner */}
              {resetError && (
                <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300 text-xs flex items-start gap-2">
                  <AlertCircle size={15} className="text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                  <span className="leading-tight">{resetError}</span>
                </div>
              )}

              <form onSubmit={handlePasswordResetSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Your Registered Email Address *
                  </label>
                  <div className="relative">
                    <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="email"
                      required
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      placeholder="e.g. kofi.buyer@ogya.gh or nanabekoeansahhayford@gmail.com"
                      className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                {/* Quick suggestions from demo profiles */}
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                    Quick Demo Emails:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => setResetEmail('nanabekoeansahhayford@gmail.com')}
                      className="text-[10px] font-semibold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900 px-2 py-0.5 rounded cursor-pointer hover:bg-amber-100"
                    >
                      nanabekoeansahhayford@gmail.com (Seller)
                    </button>
                    <button
                      type="button"
                      onClick={() => setResetEmail('kofi.buyer@ogya.gh')}
                      className="text-[10px] font-semibold text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-900 px-2 py-0.5 rounded cursor-pointer hover:bg-sky-100"
                    >
                      kofi.buyer@ogya.gh (Buyer)
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSendingReset}
                  className="w-full py-3 px-4 bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 hover:opacity-95 text-white font-black text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Send size={15} />
                  <span>
                    {isSendingReset
                      ? 'Dispatching Firebase Recovery Email...'
                      : 'Send Recovery Email via Firebase 🔥'}
                  </span>
                </button>

                <div className="pt-2 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setMode('signin');
                      setError(null);
                      setResetError(null);
                      setResetSentMessage(null);
                    }}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                  >
                    <ArrowLeft size={13} />
                    <span>Back to Log In</span>
                  </button>
                </div>
              </form>
            </div>
          ) : mode === 'register' ? (
            /* =================== REGISTRATION / CREATE ACCOUNT =================== */
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              {/* PRIMARY ROLE SELECTION: BUYER vs SELLER */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
                  1. Choose Your Account Type
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  {/* Buyer Option */}
                  <button
                    type="button"
                    onClick={() => setSelectedRole('buyer')}
                    className={`p-3 rounded-2xl border-2 text-left flex flex-col justify-between transition-all cursor-pointer ${
                      selectedRole === 'buyer'
                        ? 'border-sky-500 bg-sky-50/70 dark:bg-sky-950/40 text-sky-950 dark:text-sky-100 ring-2 ring-sky-500/20 shadow-xs'
                        : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="w-8 h-8 rounded-xl bg-sky-500/20 text-sky-600 dark:text-sky-400 flex items-center justify-center">
                        <ShoppingCart size={18} />
                      </div>
                      {selectedRole === 'buyer' && (
                        <span className="w-5 h-5 rounded-full bg-sky-500 text-white flex items-center justify-center text-[10px] font-bold">
                          ✓
                        </span>
                      )}
                    </div>
                    <div>
                      <div className="font-extrabold text-sm text-slate-900 dark:text-white">
                        Buyer Account
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                        Browse, save ads, chat with sellers, make offers & order courier delivery
                      </div>
                    </div>
                  </button>

                  {/* Seller Option */}
                  <button
                    type="button"
                    onClick={() => setSelectedRole('seller')}
                    className={`p-3 rounded-2xl border-2 text-left flex flex-col justify-between transition-all cursor-pointer ${
                      selectedRole === 'seller'
                        ? 'border-amber-500 bg-amber-50/70 dark:bg-amber-950/40 text-amber-950 dark:text-amber-100 ring-2 ring-amber-500/20 shadow-xs'
                        : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                        <Store size={18} />
                      </div>
                      {selectedRole === 'seller' && (
                        <span className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center text-[10px] font-bold">
                          ✓
                        </span>
                      )}
                    </div>
                    <div>
                      <div className="font-extrabold text-sm text-slate-900 dark:text-white">
                        Seller Account
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                        Post ads, boost listings, seller dashboard, Ghana Card badge & analytics
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* IF SELLER: Sub-type (Individual vs Business Store) */}
              {selectedRole === 'seller' && (
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                  <span className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">
                    Seller Category:
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => setSellerSubType('individual')}
                      className={`p-2 rounded-lg border text-left transition-all cursor-pointer ${
                        sellerSubType === 'individual'
                          ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 font-bold'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <div className="font-bold">Individual Seller</div>
                      <div className="text-[10px] opacity-75">Private trader / Freelance</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSellerSubType('business')}
                      className={`p-2 rounded-lg border text-left transition-all cursor-pointer ${
                        sellerSubType === 'business'
                          ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 font-bold'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <div className="font-bold">Merchant Store</div>
                      <div className="text-[10px] opacity-75">Dealership / Shop / Co.</div>
                    </button>
                  </div>
                </div>
              )}

              {/* Name / Business Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {selectedRole === 'seller' && sellerSubType === 'business'
                    ? 'Registered Business / Store Name *'
                    : 'Your Full Name *'}
                </label>
                <div className="relative">
                  <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (selectedRole === 'seller' && sellerSubType === 'business') {
                        setBusinessName(e.target.value);
                      }
                    }}
                    placeholder={
                      selectedRole === 'seller' && sellerSubType === 'business'
                        ? 'e.g. Apex Autos Ghana Ltd or Kumasi Fashion Hub'
                        : selectedRole === 'buyer'
                        ? 'e.g. Kofi Mensah or Akua Donkor'
                        : 'e.g. Nana Kwame Mensah'
                    }
                    className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Store Category if Business Seller */}
              {selectedRole === 'seller' && sellerSubType === 'business' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Primary Business Category
                  </label>
                  <select
                    value={businessCategory}
                    onChange={(e) => setBusinessCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500"
                  >
                    <option>Vehicles & Automotive Dealership</option>
                    <option>Property & Real Estate Agency</option>
                    <option>Electronics & Smart Tech</option>
                    <option>Home, Furniture & Appliances</option>
                    <option>Fashion & African Apparel</option>
                    <option>Professional Services & Repairs</option>
                    <option>Food & Agricultural Supply</option>
                  </select>
                </div>
              )}

              {/* Email & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Mobile Phone (Ghana) *
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
              </div>

              {/* Region & Town */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Region (Ghana)
                  </label>
                  <div className="relative">
                    <MapPin size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <select
                      value={region}
                      onChange={(e) => setRegion(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500 truncate"
                    >
                      {REGIONS.filter((r) => r !== 'All Regions').map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    City / Neighborhood
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. East Legon, Osu, Kumasi Central"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Password & Confirm */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Create Password *
                  </label>
                  <div className="relative">
                    <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min 6 characters"
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Confirm Password *
                  </label>
                  <div className="relative">
                    <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat password"
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>

              {/* Terms Checkbox */}
              <div className="pt-2">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="mt-0.5 rounded text-amber-500 focus:ring-0 cursor-pointer"
                  />
                  <span className="text-[11px] text-slate-600 dark:text-slate-400 leading-tight">
                    I agree to the{' '}
                    <strong className="text-slate-900 dark:text-slate-200">
                      OGYA Safe Trade Guidelines
                    </strong>{' '}
                    and confirm my account information is accurate.
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-4 bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 hover:opacity-95 text-white font-black text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <span>
                  {isSubmitting
                    ? 'Creating Account...'
                    : `Create Free ${selectedRole === 'buyer' ? 'Buyer' : 'Seller'} Account 🔥`}
                </span>
                <ArrowRight size={16} />
              </button>

              <div className="relative my-4 text-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200 dark:border-slate-800" />
                </div>
                <span className="relative bg-white dark:bg-slate-900 px-3 text-[11px] font-bold text-slate-400 uppercase">
                  Or sign up with Google
                </span>
              </div>

              {/* Google Sign In Button */}
              <button
                type="button"
                onClick={() => handleGoogleSignIn(selectedRole)}
                className="w-full py-2.5 px-3 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl border border-slate-300 dark:border-slate-700 transition-colors flex items-center justify-center gap-2.5 cursor-pointer shadow-2xs"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continue with Google as {selectedRole === 'buyer' ? 'Buyer' : 'Seller'}</span>
              </button>
            </form>
          ) : (
            /* =================== SIGN IN VIEW (FOR BUYERS & SELLERS) =================== */
            <form onSubmit={handleSignInSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Email Address or Ghana Phone Number
                </label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={signInIdentifier}
                    onChange={(e) => setSignInIdentifier(e.target.value)}
                    placeholder="e.g. kofi.buyer@ogya.gh or +233 24 555 8899"
                    className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Password
                  </label>
                  {/* FORGOT PASSWORD LINK TRIGGER */}
                  <button
                    type="button"
                    onClick={handleOpenForgotPassword}
                    className="text-[11px] font-bold text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 hover:underline cursor-pointer"
                    title="Recover password via Firebase Auth email"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={signInPassword}
                    onChange={(e) => setSignInPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-8 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-4 bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 hover:opacity-95 text-white font-extrabold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <span>{isSubmitting ? 'Signing In...' : 'Log In to OGYA 🔥'}</span>
                <ArrowRight size={16} />
              </button>

              {/* 1-Click Demo Logins for Instant Testing */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                <span className="block text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                  ⚡ 1-Click Instant Demo Logins
                </span>
                <div className="grid grid-cols-1 gap-2">
                  {/* Demo Buyer Login */}
                  <button
                    type="button"
                    onClick={() => handleDemoSignIn(DEMO_BUYER_USER)}
                    className="w-full text-left p-2.5 rounded-xl bg-sky-50 dark:bg-sky-950/40 hover:bg-sky-100 dark:hover:bg-sky-900/60 border border-sky-200 dark:border-sky-800/80 transition-all flex items-center justify-between cursor-pointer group shadow-2xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-sky-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                        🛒
                      </div>
                      <div>
                        <div className="text-xs font-black text-sky-950 dark:text-sky-200 group-hover:text-sky-600 transition-colors">
                          Log In as Buyer ({DEMO_BUYER_USER.name})
                        </div>
                        <div className="text-[10px] text-sky-700 dark:text-sky-400">
                          Buyer Account · Wishlist & Courier Orders
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] font-black text-sky-700 dark:text-sky-300 bg-sky-200/80 dark:bg-sky-900/80 px-2 py-1 rounded-md">
                      Buyer Login →
                    </span>
                  </button>

                  {/* Demo Store Seller Login (Ansah Ford) */}
                  <button
                    type="button"
                    onClick={() => handleDemoSignIn(DEFAULT_AF_USER)}
                    className="w-full text-left p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/60 border border-amber-200 dark:border-amber-800/80 transition-all flex items-center justify-between cursor-pointer group shadow-2xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-600 to-red-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                        AF
                      </div>
                      <div>
                        <div className="text-xs font-black text-amber-950 dark:text-amber-200 group-hover:text-amber-600 transition-colors">
                          Log In as Store Seller ({DEFAULT_AF_USER.name})
                        </div>
                        <div className="text-[10px] text-amber-700 dark:text-amber-400">
                          Merchant Store · Seller Dashboard & Ghana Card
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] font-black text-amber-800 dark:text-amber-300 bg-amber-200/80 dark:bg-amber-900/80 px-2 py-1 rounded-md">
                      Seller Login →
                    </span>
                  </button>

                  {/* Demo Private Seller Login (Kwame Mensah) */}
                  <button
                    type="button"
                    onClick={() => handleDemoSignIn(DEMO_SELLER_INDIVIDUAL)}
                    className="w-full text-left p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700 transition-all flex items-center justify-between cursor-pointer group shadow-2xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-slate-800 dark:bg-slate-700 text-white font-black text-xs flex items-center justify-center shrink-0">
                        KM
                      </div>
                      <div>
                        <div className="text-xs font-black text-slate-900 dark:text-slate-100 group-hover:text-amber-600 transition-colors">
                          Log In as Individual Seller ({DEMO_SELLER_INDIVIDUAL.name})
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400">
                          Private Electronics & Vehicles Trader
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 bg-slate-200/80 dark:bg-slate-700 px-2 py-1 rounded-md">
                      Sign In →
                    </span>
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Switch Prompt */}
          <div className="mt-5 text-center text-xs text-slate-500 dark:text-slate-400">
            {mode === 'register' ? (
              <p>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('signin');
                    setError(null);
                  }}
                  className="font-black text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
                >
                  Log In here
                </button>
              </p>
            ) : mode === 'forgot_password' ? (
              <p>
                Remembered your password?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('signin');
                    setError(null);
                    setResetError(null);
                    setResetSentMessage(null);
                  }}
                  className="font-black text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
                >
                  Back to Sign In
                </button>
              </p>
            ) : (
              <p>
                New to OGYA (FIRE) 🔥?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    setError(null);
                  }}
                  className="font-black text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
                >
                  Create a Free Buyer or Seller Account
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
