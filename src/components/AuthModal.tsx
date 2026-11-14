import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  User,
  Lock,
  Mail,
  Phone,
  MapPin,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
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
  MessageSquareCode,
} from 'lucide-react';
import { REGIONS } from '../data/categories';
import { AccountType, UserProfile } from '../types/marketplace';
import {
  registerUser,
  loginUser,
  loginWithGoogle,
  syncUserProfileFromFirebaseAuth,
} from '../utils/auth';
import {
  ConfirmationResult,
  sendFirebasePasswordReset,
  saveUserProfileToFirestore,
  ensureUserDocOnLogin,
  sendPhoneOtp,
  verifyPhoneOtp,
  formatGhanaPhoneE164,
} from '../utils/firebase';

import type { LegalPageId } from './LegalPagesModal';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'register' | 'signin';
  defaultRole?: 'buyer' | 'seller';
  onAuthSuccess: (user: UserProfile, message: string) => void;
  onOpenLegalPage?: (page: LegalPageId) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'signin',
  defaultRole = 'buyer',
  onAuthSuccess,
  onOpenLegalPage,
}) => {
  const [mode, setMode] = useState<'register' | 'signin' | 'forgot_password'>(initialMode);
  const [authMethod, setAuthMethod] = useState<'email' | 'phone'>('email');
  const [selectedRole, setSelectedRole] = useState<'buyer' | 'seller'>(defaultRole);
  const [sellerSubType, setSellerSubType] = useState<'individual' | 'business'>('business');

  // Sync modal mode & role when opened
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setSelectedRole(defaultRole);
      setError(null);
      setGoogleDomainBlocked(false);
      setPhoneConfirmation(null);
      setOtpCode('');
    }
  }, [isOpen, initialMode, defaultRole]);

  // Email Registration form states
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

  // Email Sign in states
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');

  // Phone OTP Auth states
  const [phoneAuthNumber, setPhoneAuthNumber] = useState('+233 ');
  const [phoneAuthName, setPhoneAuthName] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [phoneConfirmation, setPhoneConfirmation] = useState<ConfirmationResult | null>(null);
  const [sentPhoneDisplay, setSentPhoneDisplay] = useState('');

  // Password Recovery state (Firebase Auth)
  const [resetEmail, setResetEmail] = useState('');
  const [resetSentMessage, setResetSentMessage] = useState<string | null>(null);
  const [resetError, setResetError] = useState<string | null>(null);
  const [isSendingReset, setIsSendingReset] = useState(false);

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [googleDomainBlocked, setGoogleDomainBlocked] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const signInEmailInputRef = useRef<HTMLInputElement>(null);
  const registerEmailInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please re-enter your password.');
      return;
    }

    if (!agreeTerms) {
      setError('Please agree to the OGYA Safe Trade Rules and Terms of Service to continue.');
      return;
    }

    setIsSubmitting(true);

    try {
      const finalAccountType: AccountType =
        selectedRole === 'buyer'
          ? 'buyer'
          : sellerSubType === 'business'
          ? 'business'
          : 'individual';

      const res = await registerUser({
        name:
          selectedRole === 'seller' && sellerSubType === 'business' && businessName.trim()
            ? businessName.trim()
            : name,
        email: email.trim().toLowerCase(),
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
      });

      if (!res.success || !res.user) {
        setError(res.error || 'Failed to complete registration.');
        setIsSubmitting(false);
        return;
      }

      const roleLabel = selectedRole === 'buyer' ? 'Buyer' : 'Seller';
      onAuthSuccess(
        res.user,
        `Welcome to OGYA, ${res.user.name}! Your ${roleLabel} account is now active.`
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
      const res = await loginUser(signInEmail, signInPassword);
      if (!res.success || !res.user) {
        setError(res.error || 'Invalid email or password.');
        setIsSubmitting(false);
        return;
      }

      const roleBadge = res.user.accountType === 'buyer' ? 'Buyer' : 'Seller';
      onAuthSuccess(res.user, `Welcome back, ${res.user.name} (${roleBadge})!`);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to sign in.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const switchToEmailLoginFallback = () => {
    setMode('signin');
    setAuthMethod('email');
    setPhoneConfirmation(null);
    setTimeout(() => {
      signInEmailInputRef.current?.focus();
    }, 50);
  };

  const handleGoogleSignIn = async (asRole: 'buyer' | 'seller') => {
    setError(null);
    setGoogleDomainBlocked(false);
    setIsSubmitting(true);
    try {
      const res = await loginWithGoogle(asRole);
      if (!res.success || !res.user) {
        const errMsg = res.error || 'Google Sign-In failed. Please try again.';
        const isUnauthorizedDomain =
          res.errorCode === 'auth/unauthorized-domain' ||
          errMsg.includes('unauthorized-domain') ||
          errMsg.includes('Firebase Authorized Domains');

        if (isUnauthorizedDomain) {
          setGoogleDomainBlocked(true);
          setError(
            'Google Sign-In not enabled for this preview domain. Please use Email & Password or add this domain to Firebase Authorized Domains'
          );
          // Fallback directly to Email & Password login
          setAuthMethod('email');
          setPhoneConfirmation(null);
          setTimeout(() => {
            if (mode === 'signin') {
              signInEmailInputRef.current?.focus();
            } else {
              registerEmailInputRef.current?.focus();
            }
          }, 50);
        } else {
          setError(errMsg);
        }
        return;
      }

      onAuthSuccess(res.user, `Signed in with Google as ${res.user.name}.`);
      onClose();
    } catch (err: any) {
      const rawMsg = String(err?.message || '');
      const isUnauthorizedDomain =
        err?.code === 'auth/unauthorized-domain' ||
        rawMsg.includes('auth/unauthorized-domain');
      if (isUnauthorizedDomain) {
        setGoogleDomainBlocked(true);
        setError(
          'Google Sign-In not enabled for this preview domain. Please use Email & Password or add this domain to Firebase Authorized Domains'
        );
        setAuthMethod('email');
        setPhoneConfirmation(null);
        setTimeout(() => {
          if (mode === 'signin') {
            signInEmailInputRef.current?.focus();
          } else {
            registerEmailInputRef.current?.focus();
          }
        }, 50);
      } else {
        setError(err?.message || 'Google Sign-In failed.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendPhoneOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const res = await sendPhoneOtp(phoneAuthNumber, 'ogya-recaptcha-container');
      if (res.error || !res.confirmationResult) {
        setError(res.error || 'Failed to dispatch SMS code.');
        return;
      }
      setPhoneConfirmation(res.confirmationResult);
      setSentPhoneDisplay(res.formattedPhone || formatGhanaPhoneE164(phoneAuthNumber));
    } catch (err: any) {
      setError(err?.message || 'Could not send verification SMS.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyPhoneOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneConfirmation) return;
    setError(null);
    setIsSubmitting(true);

    try {
      const res = await verifyPhoneOtp(phoneConfirmation, otpCode);
      if (res.error || !res.user) {
        setError(res.error || 'Invalid verification code.');
        return;
      }

      const formattedPhone = res.phoneNumber || sentPhoneDisplay;
      const finalName = phoneAuthName.trim() || formattedPhone || 'OGYA Member';
      const accountType: AccountType =
        selectedRole === 'buyer'
          ? 'buyer'
          : sellerSubType === 'business'
          ? 'business'
          : 'individual';

      const user = syncUserProfileFromFirebaseAuth(res.user, {
        name: finalName,
        phone: formattedPhone,
        whatsapp: formattedPhone,
        accountType,
        userRole: selectedRole,
        isVerified: true,
      });

      await saveUserProfileToFirestore(user.id, user.email, formattedPhone, user.name);
      await ensureUserDocOnLogin(user.id, user.email, formattedPhone, user.name);

      onAuthSuccess(user, `Phone verified! Signed in as ${user.name}.`);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to verify SMS OTP.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenForgotPassword = () => {
    setMode('forgot_password');
    setError(null);
    setResetError(null);
    setResetSentMessage(null);
    if (signInEmail.includes('@')) {
      setResetEmail(signInEmail.trim());
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
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Invisible reCAPTCHA anchor for Firebase Phone Auth */}
        <div id="ogya-recaptcha-container" />

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
            <ShieldCheck size={14} />
            <span>
              {mode === 'forgot_password'
                ? 'FIREBASE AUTH RECOVERY'
                : 'OGYA FIRE · SECURE SIGN IN'}
            </span>
          </div>

          <h3 className="text-2xl font-black tracking-tight">
            {mode === 'register'
              ? 'Create an OGYA Account'
              : mode === 'forgot_password'
              ? 'Recover Your Password'
              : 'Sign In to OGYA FIRE'}
          </h3>
          <p className="text-xs text-white/90 mt-1 max-w-sm mx-auto">
            {mode === 'register'
              ? 'Register with Email, Phone OTP, or Google to buy with MoMo checkout or sell across Ghana.'
              : mode === 'forgot_password'
              ? 'Enter your registered email address to receive a Firebase password reset link.'
              : 'Sign in with Email, Ghana Phone OTP, or Google to complete checkout, track orders, or sell products.'}
          </p>

          {/* Mode Switcher Tabs */}
          {mode !== 'forgot_password' ? (
            <div className="grid grid-cols-2 p-1 bg-black/25 rounded-xl mt-5 max-w-xs mx-auto">
              <button
                type="button"
                onClick={() => {
                  setMode('signin');
                  setError(null);
                  setPhoneConfirmation(null);
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
                  setPhoneConfirmation(null);
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
        <div className="p-6 sm:p-7 max-h-[75vh] overflow-y-auto space-y-4">
          {error && mode !== 'forgot_password' && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300 text-xs space-y-2.5">
              <div className="flex items-start gap-2">
                <AlertCircle size={15} className="text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                <span className="leading-tight font-semibold">{error}</span>
              </div>

              {googleDomainBlocked && (
                <div className="pl-5.5 space-y-2 border-t border-rose-200/80 dark:border-rose-900/60 pt-2">
                  {typeof window !== 'undefined' && window.location?.hostname && (
                    <div className="text-[11px] text-rose-700 dark:text-rose-300">
                      Preview domain:{' '}
                      <code className="px-1.5 py-0.5 rounded bg-rose-100 dark:bg-rose-900/70 font-mono font-bold select-all">
                        {window.location.hostname}
                      </code>
                    </div>
                  )}
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={switchToEmailLoginFallback}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-extrabold text-[11px] shadow-xs hover:opacity-90 transition-opacity cursor-pointer"
                    >
                      <Mail size={12} />
                      <span>Use Email &amp; Password Login</span>
                    </button>
                    {mode !== 'register' && (
                      <button
                        type="button"
                        onClick={() => {
                          setMode('register');
                          setAuthMethod('email');
                          setTimeout(() => registerEmailInputRef.current?.focus(), 50);
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200 font-bold text-[11px] hover:bg-rose-100/70 dark:hover:bg-rose-900/40 cursor-pointer"
                      >
                        <UserPlus size={12} />
                        <span>Create Account with Email</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {mode === 'forgot_password' ? (
            /* =================== FORGOT PASSWORD VIEW =================== */
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-amber-500/10 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800/80 text-xs text-amber-950 dark:text-amber-200 flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-600 to-orange-500 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                  <KeyRound size={16} />
                </div>
                <div className="leading-relaxed">
                  <span className="font-extrabold text-amber-900 dark:text-amber-300 block mb-0.5">
                    Firebase Authentication Password Reset
                  </span>
                  <span>
                    We will send a verified password reset link to your email address.
                  </span>
                </div>
              </div>

              {resetSentMessage && (
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-200 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-emerald-800 dark:text-emerald-300">
                    <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
                    <span>Recovery Email Dispatched!</span>
                  </div>
                  <p className="leading-relaxed">{resetSentMessage}</p>
                </div>
              )}

              {resetError && (
                <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300 text-xs flex items-start gap-2">
                  <AlertCircle size={15} className="text-rose-600 shrink-0 mt-0.5" />
                  <span className="leading-tight">{resetError}</span>
                </div>
              )}

              <form onSubmit={handlePasswordResetSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Registered Email Address *
                  </label>
                  <div className="relative">
                    <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="email"
                      required
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSendingReset}
                  className="w-full py-3 px-4 bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 hover:opacity-95 text-white font-black text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Send size={15} />
                  <span>{isSendingReset ? 'Sending Reset Email...' : 'Send Recovery Email'}</span>
                </button>
              </form>
            </div>
          ) : (
            <>
              {/* Account Role Selector (Buyer vs Seller) */}
              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
                  Account Role
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setSelectedRole('buyer')}
                    className={`p-2.5 rounded-2xl border-2 text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                      selectedRole === 'buyer'
                        ? 'border-sky-500 bg-sky-50/70 dark:bg-sky-950/40 text-sky-950 dark:text-sky-100'
                        : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 bg-slate-50/50 dark:bg-slate-800/40'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-xl bg-sky-500/20 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
                      <ShoppingCart size={16} />
                    </div>
                    <div>
                      <div className="font-extrabold text-xs text-slate-900 dark:text-white">Buyer</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">Order & Checkout</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedRole('seller')}
                    className={`p-2.5 rounded-2xl border-2 text-left flex items-center gap-2.5 transition-all cursor-pointer ${
                      selectedRole === 'seller'
                        ? 'border-amber-500 bg-amber-50/70 dark:bg-amber-950/40 text-amber-950 dark:text-amber-100'
                        : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 bg-slate-50/50 dark:bg-slate-800/40'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                      <Store size={16} />
                    </div>
                    <div>
                      <div className="font-extrabold text-xs text-slate-900 dark:text-white">Seller</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">List & Manage Store</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Google Auth Button (Instant 1-Click) */}
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => handleGoogleSignIn(selectedRole)}
                className="w-full py-2.5 px-3 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl border border-slate-300 dark:border-slate-700 transition-colors flex items-center justify-center gap-2.5 cursor-pointer shadow-2xs disabled:opacity-50"
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

              <div className="relative text-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200 dark:border-slate-800" />
                </div>
                <span className="relative bg-white dark:bg-slate-900 px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Or continue with Email or Phone OTP
                </span>
              </div>

              {/* Auth Method Toggle: Email vs Phone OTP */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMethod('email');
                    setError(null);
                  }}
                  className={`py-2 rounded-lg text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    authMethod === 'email'
                      ? 'bg-white dark:bg-slate-900 text-slate-950 dark:text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  <Mail size={14} />
                  <span>Email & Password</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMethod('phone');
                    setError(null);
                  }}
                  className={`py-2 rounded-lg text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    authMethod === 'phone'
                      ? 'bg-white dark:bg-slate-900 text-slate-950 dark:text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  <Phone size={14} />
                  <span>Phone (SMS OTP)</span>
                </button>
              </div>

              {authMethod === 'phone' ? (
                /* =================== PHONE NUMBER SMS OTP FLOW =================== */
                !phoneConfirmation ? (
                  <form onSubmit={handleSendPhoneOtp} className="space-y-3.5">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Your Name / Shop Name {mode === 'register' ? '*' : '(Optional)'}
                      </label>
                      <div className="relative">
                        <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="text"
                          required={mode === 'register'}
                          value={phoneAuthName}
                          onChange={(e) => setPhoneAuthName(e.target.value)}
                          placeholder={selectedRole === 'seller' ? 'e.g. Accra Tech Hub' : 'e.g. Kofi Mensah'}
                          className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Mobile Phone Number (Ghana +233) *
                      </label>
                      <div className="relative">
                        <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="tel"
                          required
                          value={phoneAuthNumber}
                          onChange={(e) => setPhoneAuthNumber(e.target.value)}
                          placeholder="+233 24 555 8899"
                          className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500 font-mono"
                        />
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                        We will send a 6-digit SMS verification code to sign you in securely.
                      </p>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3 px-4 bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 hover:opacity-95 text-white font-black text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      <MessageSquareCode size={16} />
                      <span>{isSubmitting ? 'Sending SMS Code...' : 'Send 6-Digit SMS Code'}</span>
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleVerifyPhoneOtp} className="space-y-3.5">
                    <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-200">
                      SMS verification code sent to <strong className="font-mono">{sentPhoneDisplay}</strong>.
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Enter 6-Digit OTP Code *
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        required
                        autoFocus
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                        placeholder="123456"
                        className="w-full px-4 py-3 text-center tracking-[0.4em] bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-base font-black text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 font-mono"
                      />
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setPhoneConfirmation(null);
                          setOtpCode('');
                        }}
                        className="px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 cursor-pointer"
                      >
                        Change Phone
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting || otpCode.length < 6}
                        className="flex-1 py-3 px-4 bg-gradient-to-r from-emerald-500 to-green-600 hover:opacity-95 text-white font-black text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                      >
                        <CheckCircle2 size={16} />
                        <span>{isSubmitting ? 'Verifying...' : 'Verify & Sign In'}</span>
                      </button>
                    </div>
                  </form>
                )
              ) : mode === 'register' ? (
                /* =================== EMAIL REGISTRATION VIEW =================== */
                <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
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
                          <div className="text-[10px] opacity-75">Private trader</div>
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
                          <div className="text-[10px] opacity-75">Shop / Business</div>
                        </button>
                      </div>
                    </div>
                  )}

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
                            ? 'e.g. Accra Tech & Fashion Store'
                            : 'e.g. Kofi Mensah'
                        }
                        className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

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
                        <option>Food & Restaurants</option>
                        <option>Phones & Accessories</option>
                        <option>Laptops & Computers</option>
                        <option>Cars & Car Accessories</option>
                        <option>Fashion & Apparel</option>
                        <option>Home Items & Appliances</option>
                        <option>Electronics & Smart Tech</option>
                      </select>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Email Address *
                      </label>
                      <div className="relative">
                        <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          ref={registerEmailInputRef}
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
                        placeholder="e.g. East Legon, Osu, Kumasi"
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

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

                  <label className="flex items-start gap-2.5 cursor-pointer pt-1">
                    <input
                      type="checkbox"
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                      className="mt-0.5 rounded text-amber-500 focus:ring-0 cursor-pointer"
                    />
                    <span className="text-[11px] text-slate-600 dark:text-slate-400 leading-tight">
                      I agree to the{' '}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          onOpenLegalPage?.('terms');
                        }}
                        className="font-bold text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
                      >
                        Terms of Service
                      </button>
                      ,{' '}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          onOpenLegalPage?.('privacy');
                        }}
                        className="font-bold text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
                      >
                        Privacy Policy
                      </button>
                      , and{' '}
                      <strong className="text-slate-900 dark:text-slate-200">
                        OGYA Safe Trade Guidelines
                      </strong>
                      .
                    </span>
                  </label>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 px-4 bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 hover:opacity-95 text-white font-black text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? <RefreshCw size={16} className="animate-spin" /> : null}
                    <span>
                      {isSubmitting
                        ? 'Creating Account...'
                        : `Create ${selectedRole === 'buyer' ? 'Buyer' : 'Seller'} Account`}
                    </span>
                    <ArrowRight size={16} />
                  </button>
                </form>
              ) : (
                /* =================== EMAIL SIGN IN VIEW =================== */
                <form onSubmit={handleSignInSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Email Address *
                    </label>
                    <div className="relative">
                      <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        ref={signInEmailInputRef}
                        type="email"
                        required
                        value={signInEmail}
                        onChange={(e) => setSignInEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                        Password *
                      </label>
                      <button
                        type="button"
                        onClick={handleOpenForgotPassword}
                        className="text-[11px] font-bold text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
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
                        aria-label="Toggle password visibility"
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
                    {isSubmitting ? <RefreshCw size={16} className="animate-spin" /> : null}
                    <span>{isSubmitting ? 'Signing In...' : 'Sign In with Email'}</span>
                    <ArrowRight size={16} />
                  </button>
                </form>
              )}
            </>
          )}

          {/* Legal Notice on Sign Up Screen (Applies to Email, Phone OTP & Google Sign Up) */}
          {mode === 'register' && (
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-center text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              By creating an account, you agree to OGYA&apos;s{' '}
              <button
                type="button"
                onClick={() => onOpenLegalPage?.('terms')}
                className="font-bold text-[#00875A] dark:text-emerald-400 hover:underline cursor-pointer"
              >
                Terms of Service
              </button>{' '}
              and{' '}
              <button
                type="button"
                onClick={() => onOpenLegalPage?.('privacy')}
                className="font-bold text-[#00875A] dark:text-emerald-400 hover:underline cursor-pointer"
              >
                Privacy Policy
              </button>
              .
            </div>
          )}

          {/* Switch Prompt */}
          <div className="pt-2 text-center text-xs text-slate-500 dark:text-slate-400">
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
                  Sign In here
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
                New to OGYA FIRE?{' '}
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
