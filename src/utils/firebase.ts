import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  getDoc,
  getDocFromServer,
  collection,
  setDoc,
  updateDoc,
  getDocs,
  onSnapshot,
  serverTimestamp,
  deleteDoc,
  query,
  where,
} from 'firebase/firestore';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  signInWithPopup,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  onAuthStateChanged,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
  updateProfile,
  deleteUser,
  EmailAuthProvider,
  reauthenticateWithCredential,
  reauthenticateWithPopup,
  User as FirebaseUser,
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import { Listing, WantedItem } from '../types/marketplace';
import { Product, Vendor, Order, OrderStatus } from '../types/store';
import { SEED_PRODUCTS } from '../data/seedProducts';

// Initialize Firebase App & Services (Auth + Firestore only; images use Cloudinary)
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId); /* CRITICAL: The app will break without this line */
export const auth = getAuth(app);

export type { FirebaseUser, ConfirmationResult };

/**
 * Subscribe to Firebase Auth state changes
 */
export function subscribeToAuthState(
  callback: (user: FirebaseUser | null) => void
): () => void {
  return onAuthStateChanged(auth, callback);
}

/**
 * Format Ghana or international phone numbers into E.164 format (+233...)
 */
export function formatGhanaPhoneE164(rawPhone: string): string {
  const cleaned = rawPhone.replace(/[\s\-()]/g, '').trim();
  if (!cleaned) return '';
  if (cleaned.startsWith('+')) return cleaned;
  if (cleaned.startsWith('233')) return `+${cleaned}`;
  if (cleaned.startsWith('0')) return `+233${cleaned.slice(1)}`;
  return `+233${cleaned}`;
}

let activeRecaptchaVerifier: RecaptchaVerifier | null = null;

/**
 * Send SMS OTP to phone number via Firebase Phone Auth
 */
export async function sendPhoneOtp(
  rawPhoneNumber: string,
  recaptchaContainerId: string = 'recaptcha-container'
): Promise<{ confirmationResult?: ConfirmationResult; formattedPhone?: string; error?: string }> {
  const formattedPhone = formatGhanaPhoneE164(rawPhoneNumber);
  if (!formattedPhone || formattedPhone.length < 10) {
    return { error: 'Please enter a valid Ghana or international phone number (e.g. 024 555 8899 or +233245558899).' };
  }

  try {
    if (activeRecaptchaVerifier) {
      try {
        activeRecaptchaVerifier.clear();
      } catch {
        // ignore clear error
      }
      activeRecaptchaVerifier = null;
    }

    const verifier = new RecaptchaVerifier(auth, recaptchaContainerId, {
      size: 'invisible',
    });
    activeRecaptchaVerifier = verifier;

    const confirmationResult = await signInWithPhoneNumber(auth, formattedPhone, verifier);
    return { confirmationResult, formattedPhone };
  } catch (err: any) {
    const code = err?.code || '';
    let friendly = err?.message || 'Could not send SMS verification code.';
    if (code === 'auth/operation-not-allowed') {
      friendly = 'Phone Sign-In is not enabled yet in Firebase Console. Enable Phone provider under Authentication -> Sign-in method.';
    } else if (code === 'auth/invalid-phone-number') {
      friendly = 'Invalid phone number format. Use +233 followed by 9 digits (e.g. +233245558899).';
    } else if (code === 'auth/too-many-requests') {
      friendly = 'Too many SMS attempts. Please wait a moment before trying again.';
    } else if (code === 'auth/captcha-check-failed') {
      friendly = 'reCAPTCHA verification failed. Please ensure this domain is authorized in Firebase Console.';
    }
    return { error: friendly };
  }
}

/**
 * Verify SMS OTP code and complete Firebase Phone Auth sign-in
 */
export async function verifyPhoneOtp(
  confirmationResult: ConfirmationResult,
  code: string
): Promise<{ uid?: string; phoneNumber?: string; user?: FirebaseUser; error?: string }> {
  const cleanCode = code.trim();
  if (!cleanCode || cleanCode.length < 6) {
    return { error: 'Please enter the 6-digit SMS verification code.' };
  }
  try {
    const cred = await confirmationResult.confirm(cleanCode);
    return {
      uid: cred.user.uid,
      phoneNumber: cred.user.phoneNumber || undefined,
      user: cred.user,
    };
  } catch (err: any) {
    const errCode = err?.code || '';
    if (errCode === 'auth/invalid-verification-code') {
      return { error: 'Incorrect SMS verification code. Please check and try again.' };
    }
    if (errCode === 'auth/code-expired') {
      return { error: 'Verification code expired. Please request a new SMS code.' };
    }
    return { error: err?.message || 'Failed to verify SMS code.' };
  }
}

/**
 * Save user profile to Firestore in collection 'users'
 * Strictly scoped to authenticated user's own UID
 */
export async function saveUserProfileToFirestore(
  uid: string,
  email?: string,
  phone?: string,
  displayName?: string
): Promise<{ success: boolean; error?: string }> {
  if (!auth.currentUser || auth.currentUser.uid !== uid) {
    return { success: false, error: 'Authentication required to update user profile.' };
  }
  const path = `users/${uid}`;
  try {
    const cleanEmail = (email || auth.currentUser.email || '').trim().toLowerCase();
    const cleanPhone = (phone || auth.currentUser.phoneNumber || '').trim();
    const cleanDisplayName =
      (displayName || auth.currentUser.displayName || cleanEmail || cleanPhone || 'OGYA User').trim();

    const userDocRef = doc(db, 'users', uid);
    const existingSnap = await getDoc(userDocRef);

    const payload: Record<string, any> = {
      displayName: cleanDisplayName.slice(0, 256),
      updatedAt: serverTimestamp(),
    };
    if (cleanEmail) payload.email = cleanEmail.slice(0, 256);
    if (cleanPhone) payload.phone = cleanPhone.slice(0, 64);

    if (!existingSnap.exists()) {
      payload.role = 'customer';
      payload.createdAt = serverTimestamp();
    } else {
      payload.role = existingSnap.data()?.role || 'customer';
    }

    await setDoc(userDocRef, payload, { merge: true });
    return { success: true };
  } catch (error) {
    console.error(`Failed to save user profile for uid ${uid} to Firestore:`, error);
    return { success: false, error: String(error) };
  }
}

/**
 * When user logs in, if no doc exists in 'users', create it.
 */
export async function ensureUserDocOnLogin(
  uid: string,
  email?: string,
  phone?: string,
  displayName?: string
): Promise<void> {
  if (!uid || !auth.currentUser || auth.currentUser.uid !== uid) return;
  try {
    const userDocRef = doc(db, 'users', uid);
    const snap = await getDoc(userDocRef);
    if (!snap.exists()) {
      await saveUserProfileToFirestore(uid, email, phone, displayName);
    }
  } catch (error) {
    console.warn(`Could not verify or create user doc on login for uid ${uid}:`, error);
  }
}

/**
 * Register user in Firebase Auth (Email + Password)
 */
export async function firebaseAuthSignUp(
  email: string,
  password?: string,
  displayName?: string
): Promise<{ uid?: string; user?: FirebaseUser; error?: string }> {
  const cleanEmail = email.trim().toLowerCase();
  if (!password || password.length < 6) {
    return { error: 'Password must be at least 6 characters.' };
  }
  try {
    const cred = await createUserWithEmailAndPassword(auth, cleanEmail, password);
    if (displayName?.trim()) {
      await updateProfile(cred.user, { displayName: displayName.trim() }).catch(() => {});
    }
    return { uid: cred.user.uid, user: cred.user };
  } catch (err: any) {
    const code = err?.code || '';
    let friendly = err?.message || 'Sign up failed.';
    if (code === 'auth/email-already-in-use') {
      friendly = 'An account with this email already exists. Please switch to Sign In.';
    } else if (code === 'auth/weak-password') {
      friendly = 'Password is too weak. Please choose at least 6 characters.';
    } else if (code === 'auth/operation-not-allowed') {
      friendly = 'Email/Password sign-up is not enabled yet in Firebase Console Authentication settings.';
    } else if (code === 'auth/invalid-email') {
      friendly = 'Please enter a valid email address.';
    }
    return { error: friendly };
  }
}

/**
 * Sign in user with Firebase Auth (Email + Password)
 */
export async function firebaseAuthSignIn(
  email: string,
  password?: string
): Promise<{ uid?: string; user?: FirebaseUser; error?: string }> {
  const cleanEmail = email.trim().toLowerCase();
  if (!password) return { error: 'Password is required.' };
  try {
    const cred = await signInWithEmailAndPassword(auth, cleanEmail, password);
    return { uid: cred.user.uid, user: cred.user };
  } catch (err: any) {
    const code = err?.code || '';
    let friendly = err?.message || 'Sign in failed.';
    if (code === 'auth/invalid-credential' || code === 'auth/wrong-password' || code === 'auth/user-not-found') {
      friendly = 'Invalid email or password. Please check your credentials or create an account.';
    } else if (code === 'auth/too-many-requests') {
      friendly = 'Too many failed login attempts. Please wait a few minutes or reset your password.';
    } else if (code === 'auth/operation-not-allowed') {
      friendly = 'Email/Password sign-in is not enabled yet in Firebase Console Authentication settings.';
    }
    return { error: friendly };
  }
}

/**
 * Sign out of Firebase Auth
 */
export async function firebaseAuthSignOut(): Promise<void> {
  try {
    await signOut(auth);
  } catch (err) {
    console.warn('Firebase signOut notice:', err);
  }
}

/**
 * Google Sign In / Sign Up popup
 */
export async function firebaseGoogleSignIn(): Promise<{
  uid?: string;
  email?: string;
  displayName?: string;
  photoURL?: string;
  user?: FirebaseUser;
  error?: string;
  errorCode?: string;
}> {
  try {
    const provider = new GoogleAuthProvider();
    const cred = await signInWithPopup(auth, provider);
    return {
      uid: cred.user.uid,
      email: cred.user.email || undefined,
      displayName: cred.user.displayName || undefined,
      photoURL: cred.user.photoURL || undefined,
      user: cred.user,
    };
  } catch (err: any) {
    const code = err?.code || '';
    const rawMsg = String(err?.message || '');
    let friendly = rawMsg || 'Google Sign-In failed.';

    if (
      code === 'auth/unauthorized-domain' ||
      rawMsg.includes('auth/unauthorized-domain')
    ) {
      friendly =
        'Google Sign-In not enabled for this preview domain. Please use Email & Password or add this domain to Firebase Authorized Domains';
    } else if (code === 'auth/popup-closed-by-user') {
      friendly = 'Google Sign-In window was closed before completing login.';
    } else if (code === 'auth/cancelled-popup-request') {
      friendly = 'Google Sign-In request was cancelled. Please try again or use Email & Password.';
    } else if (code === 'auth/popup-blocked') {
      friendly = 'Pop-up was blocked by your browser. Please allow pop-ups or use Email & Password.';
    } else if (code === 'auth/operation-not-allowed') {
      friendly = 'Google Sign-In is not enabled in Firebase Console. Please use Email & Password.';
    } else if (code === 'auth/network-request-failed') {
      friendly = 'Network error while connecting to Google Sign-In. Please check your connection or use Email & Password.';
    }

    return {
      error: friendly,
      errorCode:
        code ||
        (rawMsg.includes('auth/unauthorized-domain')
          ? 'auth/unauthorized-domain'
          : undefined),
    };
  }
}

/**
 * Trigger Firebase Auth password recovery email flow
 */
export async function sendFirebasePasswordReset(email: string): Promise<{
  success: boolean;
  message: string;
  error?: string;
}> {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail || !cleanEmail.includes('@')) {
    return {
      success: false,
      message: 'Please provide a valid email address to receive password reset instructions.',
    };
  }

  try {
    await sendPasswordResetEmail(auth, cleanEmail);
    return {
      success: true,
      message: `Password reset link sent to ${cleanEmail} via Firebase Auth. Please check your inbox and spam folder.`,
    };
  } catch (err: any) {
    console.warn('Firebase sendPasswordResetEmail notice:', err);
    const code = err?.code || '';

    let friendlyMessage = 'Failed to send recovery email. Please try again.';
    if (code === 'auth/user-not-found') {
      friendlyMessage = `No account found for ${cleanEmail}. Please check the email or create a new account.`;
    } else if (code === 'auth/invalid-email') {
      friendlyMessage = 'The email address format is invalid.';
    } else if (code === 'auth/too-many-requests') {
      friendlyMessage = 'Too many password reset requests. Please wait a few moments before trying again.';
    } else if (code === 'auth/network-request-failed') {
      friendlyMessage = 'Network error. Please check your internet connection.';
    } else if (err?.message) {
      friendlyMessage = err.message;
    }

    return {
      success: false,
      message: friendlyMessage,
      error: code,
    };
  }
}

// Test connection on boot
export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firestore: operating with local data and cache.');
    }
    return false;
  }
}

// Structured error handling as required by Firebase integration
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

/**
 * Save product listing directly to Firestore (requires Firebase Auth; binds userId & sellerId = auth.currentUser.uid)
 */
export async function saveListingToFirestore(listing: Listing): Promise<Listing> {
  if (!auth.currentUser) {
    throw new Error('You must be signed in to publish a product listing.');
  }
  const uid = auth.currentUser.uid;
  const path = `listings/${listing.id}`;
  try {
    const safeImages = Array.isArray(listing.images)
      ? listing.images.filter((img) => typeof img === 'string' && img.length <= 2048).slice(0, 12)
      : [];
    const safePrimaryImageUrl = (
      (typeof listing.imageUrl === 'string' && listing.imageUrl.trim()) ||
      safeImages[0] ||
      ''
    ).slice(0, 2048);

    const docData: Record<string, any> = {
      id: listing.id,
      userId: uid,
      sellerId: uid,
      title: listing.title.trim().slice(0, 200),
      categoryId: listing.categoryId,
      categoryName: (listing.categoryName || '').slice(0, 128),
      subcategory: (listing.subcategory || '').slice(0, 128),
      price: Number(listing.price) || 0,
      currency: (listing.currency || 'GHS').slice(0, 16),
      isNegotiable: Boolean(listing.isNegotiable),
      location: listing.location.trim().slice(0, 256),
      region: (listing.region || '').slice(0, 128),
      condition: (listing.condition || 'Brand New').slice(0, 64),
      description: (listing.description || '').slice(0, 5000),
      imageUrl: safePrimaryImageUrl,
      images: safeImages.length > 0 ? safeImages : safePrimaryImageUrl ? [safePrimaryImageUrl] : [],
      seller: {
        name: (listing.seller?.name || 'Seller').slice(0, 128),
        phone: (listing.seller?.phone || '+233 24 000 0000').slice(0, 64),
        whatsapp: (listing.seller?.whatsapp || listing.seller?.phone || '+233 24 000 0000').slice(0, 64),
        isVerified: Boolean(listing.seller?.isVerified),
        memberSince: listing.seller?.memberSince || 'November 2026',
        rating: Number(listing.seller?.rating) || 5.0,
        reviewCount: Number(listing.seller?.reviewCount) || 1,
        responseTime: listing.seller?.responseTime || 'Under 10 mins',
        location: listing.seller?.location || listing.location,
        badges: Array.isArray(listing.seller?.badges) ? listing.seller.badges : ['verified-pro'],
      },
      postedAt: listing.postedAt || 'Just now',
      viewsCount: Number(listing.viewsCount) || 1,
      likesCount: Number(listing.likesCount) || 0,
      status: listing.status || 'active',
      isSold: Boolean(listing.isSold),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    if (listing.soldAt) docData.soldAt = listing.soldAt;
    if (listing.attributes) docData.attributes = listing.attributes;
    if (listing.cvDetails) docData.cvDetails = listing.cvDetails;
    if (listing.jobDetails) docData.jobDetails = listing.jobDetails;

    await setDoc(doc(db, 'listings', listing.id), docData);
    return { ...listing, userId: uid, sellerId: uid };
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    return listing;
  }
}

/**
 * Update a listing status in Firestore (owner-only)
 */
export async function updateListingStatusInFirestore(
  listingId: string,
  status: 'active' | 'sold',
  isSold: boolean = status === 'sold'
): Promise<boolean> {
  if (!auth.currentUser) {
    throw new Error('You must be signed in to update your listing.');
  }
  const path = `listings/${listingId}`;
  try {
    const docRef = doc(db, 'listings', listingId);
    const updates: Record<string, any> = {
      status,
      isSold,
      updatedAt: serverTimestamp(),
    };
    if (isSold) {
      updates.soldAt = new Date().toISOString();
    }
    await updateDoc(docRef, updates);
    return true;
  } catch (error) {
    console.error(`Failed to update listing ${listingId} status in Firestore:`, error);
    try {
      handleFirestoreError(error, OperationType.UPDATE, path);
    } catch {
      // already logged
    }
    return false;
  }
}

/**
 * Fetch all listings from Firestore
 */
export async function fetchListingsFromFirestore(): Promise<Listing[]> {
  const path = 'listings';
  try {
    const snap = await getDocs(collection(db, path));
    const items: Listing[] = [];
    snap.forEach((d) => {
      const data = d.data() as Listing;
      const normalizedImages =
        Array.isArray(data.images) && data.images.length > 0
          ? data.images
          : data.imageUrl
          ? [data.imageUrl]
          : [];
      items.push({
        ...data,
        imageUrl: data.imageUrl || normalizedImages[0] || undefined,
        images: normalizedImages,
      });
    });
    return items;
  } catch (error) {
    console.warn('Could not fetch listings from Firestore, falling back to local:', error);
    return [];
  }
}

/**
 * Real-time listener for Firestore listings
 */
export function subscribeToListingsFromFirestore(
  onUpdate: (listings: Listing[]) => void
): () => void {
  const path = 'listings';
  try {
    return onSnapshot(
      collection(db, path),
      (snapshot) => {
        const items: Listing[] = [];
        snapshot.forEach((d) => {
          const data = d.data() as Listing;
          const normalizedImages =
            Array.isArray(data.images) && data.images.length > 0
              ? data.images
              : data.imageUrl
              ? [data.imageUrl]
              : [];
          items.push({
            ...data,
            imageUrl: data.imageUrl || normalizedImages[0] || undefined,
            images: normalizedImages,
          });
        });
        onUpdate(items);
      },
      (error) => {
        console.warn('Firestore listings snapshot listener warning:', error);
      }
    );
  } catch (error) {
    console.warn('Error setting up onSnapshot for listings:', error);
    return () => {};
  }
}

/* =========================================================================
   PRODUCTS (GENERAL MARKETPLACE STORE - ALL CATEGORIES)
   ========================================================================= */

let hasRunInitialProductCleanup = false;

/**
 * Returns true ONLY if the product is explicitly flagged as test data (`isTest: true`)
 * or has exact test title "TEST - Delete Me" or "test test".
 * NEVER returns true for real products (e.g., Phone Accessories, Earbuds, Chargers, etc.).
 */
export function isTestProduct(product: Partial<Product>): boolean {
  if (!product) return false;
  if (product.isTest === true) return true;
  const normalizedName = (product.name || '').trim().replace(/\s+/g, ' ').toLowerCase();
  return normalizedName === 'test - delete me' || normalizedName === 'test test';
}

/**
 * Finds exact duplicate products: same normalized name + same numeric price + same seller twice.
 * Keeps the first occurrence and returns Firestore IDs of exact duplicate copies only.
 */
export function getExactDuplicateProductIds(items: Product[]): string[] {
  const seen = new Set<string>();
  const duplicateIds: string[] = [];

  for (const item of items) {
    const normName = (item.name || '').trim().replace(/\s+/g, ' ').toLowerCase();
    const normPrice = Number(item.price) || 0;
    const normSeller = (item.vendorId || item.vendorName || '').trim().toLowerCase();
    const key = `${normName}||${normPrice}||${normSeller}`;

    if (seen.has(key)) {
      if (item.id) {
        duplicateIds.push(item.id);
      }
    } else {
      seen.add(key);
    }
  }
  return duplicateIds;
}

/**
 * Deduplicate product list in-memory (keeping first copy of exact duplicates)
 */
export function deduplicateProductsList(items: Product[]): Product[] {
  const duplicateIdSet = new Set(getExactDuplicateProductIds(items));
  return items.filter((item) => !duplicateIdSet.has(item.id));
}

/**
 * Save or update a product in Firestore collection 'products'.
 * Strictly requires Firebase Auth and enforces sellerId === auth.currentUser.uid.
 */
export async function saveProductToFirestore(product: Product): Promise<boolean> {
  if (!auth.currentUser) {
    throw new Error('Please sign in with Email, Phone, or Google before publishing a product.');
  }
  if (!product.category || !product.category.trim()) {
    throw new Error('Product category is required before saving to Firestore.');
  }
  const uid = auth.currentUser.uid;
  const path = `products/${product.id}`;

  const safeImageUrl = (product.imageUrl || '').trim();
  if (safeImageUrl.length > 2048) {
    throw new Error('Image URL must be 2048 characters or less.');
  }

  try {
    const docRef = doc(db, 'products', product.id);
    const data: Record<string, any> = {
      id: product.id,
      name: product.name.trim().slice(0, 256),
      description: (product.description || '').slice(0, 5000),
      price: Math.max(0, Number(product.price) || 0),
      category: product.category.trim().slice(0, 100),
      imageUrl: safeImageUrl,
      stock: Math.max(0, Number(product.stock) || 0),
      sellerId: uid,
      vendorId: uid,
      vendorName: (product.vendorName || auth.currentUser.displayName || 'Verified OGYA Seller').slice(0, 256),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    if (typeof product.isTest === 'boolean') {
      data.isTest = product.isTest;
    }
    await setDoc(docRef, data, { merge: true });
    return true;
  } catch (error) {
    console.error(`Failed to save product ${product.id} to Firestore:`, error);
    try {
      handleFirestoreError(error, OperationType.WRITE, path);
    } catch {
      // logged
    }
    throw error;
  }
}

/**
 * Delete a product from Firestore (only allowed for product owner)
 */
export async function deleteProductFromFirestore(productId: string): Promise<boolean> {
  if (!auth.currentUser) {
    throw new Error('Please sign in to delete your product.');
  }
  const path = `products/${productId}`;
  try {
    await deleteDoc(doc(db, 'products', productId));
    return true;
  } catch (error) {
    console.error(`Failed to delete product ${productId}:`, error);
    try {
      handleFirestoreError(error, OperationType.DELETE, path);
    } catch {
      // logged
    }
    throw error;
  }
}

/**
 * Clear ONLY test products owned by the signed-in user (isTest === true or named "TEST - Delete Me" / "test test").
 * NEVER deletes real marketplace products or products owned by other sellers.
 */
export async function clearTestProductsFromFirestore(): Promise<{
  deletedCount: number;
  keptCount: number;
  deletedNames: string[];
}> {
  if (!auth.currentUser) {
    throw new Error('Please sign in to manage your test products.');
  }
  const uid = auth.currentUser.uid;
  const path = 'products';
  const snap = await getDocs(collection(db, path));
  const allProducts: Product[] = [];
  snap.forEach((d) => {
    const data = d.data() as Product;
    allProducts.push({ ...data, id: data.id || d.id });
  });

  const ownTestProducts = allProducts.filter(
    (p) => isTestProduct(p) && ((p.sellerId || p.vendorId) === uid)
  );
  const realProductsCount = allProducts.length - ownTestProducts.length;
  const deletedNames: string[] = [];

  for (const tp of ownTestProducts) {
    try {
      await deleteDoc(doc(db, path, tp.id));
      deletedNames.push(tp.name || tp.id);
    } catch (err) {
      console.error(`Failed to delete test product ${tp.id}:`, err);
    }
  }

  return {
    deletedCount: deletedNames.length,
    keptCount: realProductsCount,
    deletedNames,
  };
}

/**
 * Delete ONLY exact duplicate products owned by the signed-in user.
 */
export async function removeDuplicateProductsFromFirestore(): Promise<{
  deletedCount: number;
  keptCount: number;
}> {
  if (!auth.currentUser) {
    throw new Error('Please sign in to remove duplicate products from your store.');
  }
  const uid = auth.currentUser.uid;
  const path = 'products';
  const snap = await getDocs(collection(db, path));
  const allProducts: Product[] = [];
  snap.forEach((d) => {
    const data = d.data() as Product;
    allProducts.push({ ...data, id: data.id || d.id });
  });

  const ownProducts = allProducts.filter((p) => (p.sellerId || p.vendorId) === uid);
  const duplicateIds = getExactDuplicateProductIds(ownProducts);
  let deletedCount = 0;

  for (const dupId of duplicateIds) {
    try {
      await deleteDoc(doc(db, path, dupId));
      deletedCount += 1;
    } catch (err) {
      console.error(`Failed to delete duplicate product ${dupId}:`, err);
    }
  }

  return {
    deletedCount,
    keptCount: allProducts.length - deletedCount,
  };
}

/**
 * Fetch all products from Firestore (public read for guest & logged-in buyers).
 * Filters exact duplicates & test items safely in-memory without unauthorized mutations.
 */
export async function fetchProductsFromFirestore(): Promise<Product[]> {
  const path = 'products';
  try {
    const snap = await getDocs(collection(db, path));
    if (snap.empty) {
      return SEED_PRODUCTS;
    }
    const items: Product[] = [];
    snap.forEach((d) => {
      const data = d.data() as Product;
      items.push({ ...data, id: data.id || d.id });
    });

    const filtered = deduplicateProductsList(items).filter((p) => !isTestProduct(p));
    return filtered.length > 0 ? filtered : SEED_PRODUCTS;
  } catch (error) {
    console.warn('Could not fetch products from Firestore, returning seed products:', error);
    return SEED_PRODUCTS;
  }
}

/**
 * Subscribe to real-time products updates (public read)
 */
export function subscribeToProductsFromFirestore(
  onUpdate: (products: Product[]) => void
): () => void {
  const path = 'products';
  try {
    return onSnapshot(
      collection(db, path),
      (snapshot) => {
        if (snapshot.empty) {
          onUpdate(SEED_PRODUCTS);
          return;
        }
        const items: Product[] = [];
        snapshot.forEach((d) => {
          const data = d.data() as Product;
          items.push({ ...data, id: data.id || d.id });
        });
        const cleanItems = deduplicateProductsList(items).filter((p) => !isTestProduct(p));
        onUpdate(cleanItems);
      },
      (error) => {
        console.warn('Firestore products listener warning:', error);
      }
    );
  } catch (error) {
    console.warn('Error setting up onSnapshot for products:', error);
    return () => {};
  }
}

/* =========================================================================
   VENDOR SHOPS, SELLER PUBLIC PROFILES & VENDOR ROLE
   ========================================================================= */

/**
 * Save vendor shop in Firestore collection 'vendors' & public profile in 'sellers'
 */
export async function saveVendorToFirestore(vendor: Vendor): Promise<boolean> {
  if (!auth.currentUser) {
    throw new Error('Please sign in to register a vendor shop.');
  }
  const uid = auth.currentUser.uid;
  const path = `vendors/${vendor.id}`;
  try {
    const docRef = doc(db, 'vendors', vendor.id);
    const data: Record<string, any> = {
      id: vendor.id,
      ownerId: uid,
      shopName: vendor.shopName.trim().slice(0, 256),
      phone: vendor.phone.trim().slice(0, 64),
      location: vendor.location.trim().slice(0, 256),
      description: (vendor.description?.trim() || '').slice(0, 3000),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    await setDoc(docRef, data, { merge: true });

    // Also keep public seller profile synced in /sellers/{uid}
    await setDoc(
      doc(db, 'sellers', uid),
      {
        id: uid,
        sellerId: uid,
        ownerId: uid,
        shopName: vendor.shopName.trim().slice(0, 256),
        phone: vendor.phone.trim().slice(0, 64),
        location: vendor.location.trim().slice(0, 256),
        bio: (vendor.description?.trim() || '').slice(0, 3000),
        isVerified: true,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );

    return true;
  } catch (error) {
    console.error(`Failed to save vendor ${vendor.id}:`, error);
    try {
      handleFirestoreError(error, OperationType.WRITE, path);
    } catch {
      // logged
    }
    throw error;
  }
}

/**
 * Update user profile role in collection 'users' to 'vendor' (owner-only)
 */
export async function updateUserRoleToVendor(uid: string): Promise<boolean> {
  if (!auth.currentUser || auth.currentUser.uid !== uid) {
    throw new Error('Authentication required to update vendor role.');
  }
  const path = `users/${uid}`;
  try {
    await ensureUserDocOnLogin(
      uid,
      auth.currentUser.email || undefined,
      auth.currentUser.phoneNumber || undefined,
      auth.currentUser.displayName || undefined
    );
    const userDocRef = doc(db, 'users', uid);
    await updateDoc(userDocRef, { role: 'vendor', updatedAt: serverTimestamp() });
    return true;
  } catch (error) {
    console.error(`Failed to update user role to vendor in Firestore:`, error);
    try {
      handleFirestoreError(error, OperationType.UPDATE, path);
    } catch {
      // logged
    }
    return false;
  }
}

/**
 * Fetch vendor shop by owner uid (public read)
 */
export async function fetchVendorByOwnerId(ownerId: string): Promise<Vendor | null> {
  const path = 'vendors';
  try {
    const q = query(collection(db, path), where('ownerId', '==', ownerId));
    const snap = await getDocs(q);
    if (!snap.empty) {
      return snap.docs[0].data() as Vendor;
    }
    return null;
  } catch (error) {
    console.warn(`Could not fetch vendor for owner ${ownerId}:`, error);
    return null;
  }
}

/* =========================================================================
   ORDERS & MOBILE MONEY CHECKOUT
   ========================================================================= */

/**
 * Create order in Firestore collection 'orders'.
 * Strictly requires logged-in buyer (`userId === buyerId === auth.currentUser.uid`)
 * and records `sellerIds` so only product sellers can read orders for their products.
 */
export async function createOrderInFirestore(order: Order): Promise<boolean> {
  if (!auth.currentUser) {
    throw new Error('Please sign in to place an order.');
  }
  const buyerUid = auth.currentUser.uid;
  const path = `orders/${order.id}`;

  const itemSellerIds = (order.items || [])
    .map((it) => it.vendorId)
    .filter((v): v is string => typeof v === 'string' && v.trim().length > 0);
  const combinedSellerIds = Array.from(
    new Set([
      ...(order.sellerIds || []),
      ...itemSellerIds,
      ...(order.sellerId ? [order.sellerId] : []),
      ...(order.vendorId ? [order.vendorId] : []),
    ])
  ).slice(0, 50);

  if (combinedSellerIds.length === 0) {
    combinedSellerIds.push('vnd-ogya-central');
  }
  const primarySellerId = combinedSellerIds[0];

  try {
    const docRef = doc(db, 'orders', order.id);
    const data: Record<string, any> = {
      id: order.id,
      userId: buyerUid,
      buyerId: buyerUid,
      sellerId: primarySellerId,
      vendorId: primarySellerId,
      sellerIds: combinedSellerIds,
      items: order.items,
      total: Math.max(0, Number(order.total) || 0),
      deliveryAddress: order.deliveryAddress.trim().slice(0, 500),
      phone: order.phone.trim().slice(0, 64),
      status: order.status,
      paymentMethod: order.paymentMethod,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    if (order.buyerName) {
      data.buyerName = order.buyerName.trim().slice(0, 128);
    }
    if (order.momoNumber) {
      data.momoNumber = order.momoNumber.trim().slice(0, 64);
    }
    await setDoc(docRef, data);
    return true;
  } catch (error) {
    console.error(`Failed to create order ${order.id} in Firestore:`, error);
    try {
      handleFirestoreError(error, OperationType.CREATE, path);
    } catch {
      // logged
    }
    throw error;
  }
}

/**
 * Seed initial mock orders for OGYA certified vendor
 */
export const SEED_ORDERS: Order[] = [
  {
    id: 'ord-ogya-101',
    userId: 'usr-customer-kwame',
    buyerName: 'Kwame Mensah',
    vendorId: 'vnd-ogya-central',
    items: [
      {
        id: 'prod-fe-6kg-abc',
        name: '6KG ABC Dry Powder Fire Extinguisher (ISO & GNFS Approved)',
        price: 450,
        category: 'Fire Extinguisher',
        imageUrl: 'https://images.unsplash.com/photo-1582139329536-e7284fece509?w=600&auto=format&fit=crop&q=80',
        quantity: 2,
        stock: 24,
        vendorId: 'vnd-ogya-central',
        vendorName: 'OGYA Fire Direct Ltd (Accra)',
      },
    ],
    total: 900,
    deliveryAddress: 'Plot 18, Ring Road Central, Kokomlemle, Accra',
    phone: '+233 24 412 3456',
    status: 'pending',
    paymentMethod: 'MTN MoMo',
    momoNumber: '0244123456',
  },
  {
    id: 'ord-ogya-102',
    userId: 'usr-customer-akosua',
    buyerName: 'Akosua Darko',
    vendorId: 'vnd-ogya-central',
    items: [
      {
        id: 'prod-sd-optical-photo',
        name: 'Dual Photoelectric Smoke & Heat Detector with 85dB Siren',
        price: 180,
        category: 'Smoke Detector',
        imageUrl: 'https://images.unsplash.com/photo-1558002038-1055907df827?w=600&auto=format&fit=crop&q=80',
        quantity: 4,
        stock: 40,
        vendorId: 'vnd-ogya-central',
        vendorName: 'OGYA Fire Direct Ltd (Accra)',
      },
    ],
    total: 720,
    deliveryAddress: 'House 4, Boundary Road, East Legon, Accra',
    phone: '+233 20 890 1234',
    status: 'shipped',
    paymentMethod: 'Telecel Cash',
    momoNumber: '0208901234',
  },
  {
    id: 'ord-ogya-103',
    userId: 'usr-customer-kofi',
    buyerName: 'Kofi Boakye',
    vendorId: 'vnd-ogya-central',
    items: [
      {
        id: 'prod-fe-co2-2kg',
        name: '2KG CO2 Clean Agent Fire Extinguisher for Server Rooms & Tech',
        price: 520,
        category: 'Fire Extinguisher',
        imageUrl: 'https://images.unsplash.com/photo-1554744512-d6c603f27c54?w=600&auto=format&fit=crop&q=80',
        quantity: 1,
        stock: 15,
        vendorId: 'vnd-ogya-central',
        vendorName: 'OGYA Fire Direct Ltd (Accra)',
      },
      {
        id: 'prod-al-break-glass',
        name: 'Manual Call Point Break-Glass Emergency Fire Alarm Station',
        price: 210,
        category: 'Alarm',
        imageUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f7?w=600&auto=format&fit=crop&q=80',
        quantity: 2,
        stock: 30,
        vendorId: 'vnd-ogya-central',
        vendorName: 'OGYA Fire Direct Ltd (Accra)',
      },
    ],
    total: 940,
    deliveryAddress: 'Industrial Area, North Kaneshie, Accra',
    phone: '+233 27 123 4567',
    status: 'delivered',
    paymentMethod: 'Cash on Delivery',
  },
];

/**
 * Fetch orders ONLY for the currently authenticated seller's products
 */
export async function fetchAllOrdersFromFirestore(sellerUid?: string): Promise<Order[]> {
  const uid = sellerUid || auth.currentUser?.uid;
  if (!uid || !auth.currentUser) {
    return [];
  }
  const path = 'orders';
  try {
    const q = query(collection(db, path), where('sellerIds', 'array-contains', uid));
    const snap = await getDocs(q);
    const list: Order[] = [];
    snap.forEach((d) => {
      list.push(d.data() as Order);
    });
    return list;
  } catch (error) {
    console.warn('Could not fetch seller orders from Firestore:', error);
    return [];
  }
}

/**
 * Subscribe in real-time ONLY to orders for the authenticated seller's products
 */
export function subscribeToAllOrdersFromFirestore(
  onUpdate: (orders: Order[]) => void,
  sellerUid?: string
): () => void {
  const uid = sellerUid || auth.currentUser?.uid;
  if (!uid || !auth.currentUser) {
    onUpdate([]);
    return () => {};
  }
  const path = 'orders';
  try {
    const q = query(collection(db, path), where('sellerIds', 'array-contains', uid));
    return onSnapshot(
      q,
      (snapshot) => {
        const list: Order[] = [];
        snapshot.forEach((d) => {
          list.push(d.data() as Order);
        });
        onUpdate(list);
      },
      (error) => {
        console.warn('Firestore seller orders listener warning:', error);
      }
    );
  } catch (error) {
    console.warn('Error setting up onSnapshot for seller orders:', error);
    return () => {};
  }
}

/**
 * Update order status in Firestore (restricted by rules to buyer or involved seller)
 */
export async function updateOrderStatusInFirestore(
  orderId: string,
  status: OrderStatus
): Promise<boolean> {
  if (!auth.currentUser) {
    throw new Error('Please sign in to update order status.');
  }
  const path = `orders/${orderId}`;
  try {
    const docRef = doc(db, 'orders', orderId);
    await updateDoc(docRef, { status, updatedAt: serverTimestamp() });
    return true;
  } catch (error) {
    console.error(`Failed to update order ${orderId} status:`, error);
    try {
      handleFirestoreError(error, OperationType.UPDATE, path);
    } catch {
      // logged
    }
    return false;
  }
}

/**
 * Fetch customer orders strictly for the authenticated buyer
 */
export async function fetchOrdersByUserId(userId: string): Promise<Order[]> {
  if (!auth.currentUser || auth.currentUser.uid !== userId) {
    return [];
  }
  const path = 'orders';
  try {
    const q = query(collection(db, path), where('userId', '==', userId));
    const snap = await getDocs(q);
    const list: Order[] = [];
    snap.forEach((d) => {
      list.push(d.data() as Order);
    });
    return list;
  } catch (error) {
    console.warn(`Could not fetch orders for user ${userId}:`, error);
    return [];
  }
}

/**
 * Subscribe in real-time strictly to the authenticated buyer's own orders
 */
export function subscribeToOrdersByUserId(
  userId: string,
  onUpdate: (orders: Order[]) => void
): () => void {
  if (!auth.currentUser || auth.currentUser.uid !== userId) {
    onUpdate([]);
    return () => {};
  }
  const path = 'orders';
  try {
    const q = query(collection(db, path), where('userId', '==', userId));
    return onSnapshot(
      q,
      (snapshot) => {
        const list: Order[] = [];
        snapshot.forEach((d) => {
          list.push(d.data() as Order);
        });
        onUpdate(list);
      },
      (error) => {
        console.warn('Firestore orders snapshot listener warning:', error);
      }
    );
  } catch (error) {
    console.warn('Error setting up onSnapshot for orders:', error);
    return () => {};
  }
}

/* =========================================================================
   "I WANT THIS" - BUYERS WANTED ITEMS
   ========================================================================= */

const STORAGE_KEY_WANTED_ITEMS = 'ogya_fire_wanted_items';

export const SEED_WANTED_ITEMS: WantedItem[] = [
  {
    id: 'wanted-101',
    item: 'iPhone 12 128GB (Factory Unlocked / Clean Condition)',
    budget: 2200,
    location: 'Madina, Accra',
    whatsapp: '+233549769720',
    notes: 'Urgent buyer. Prefer Blue or Black with charger. Cash or MoMo ready today.',
    createdAtFormatted: '12 mins ago',
    status: 'active',
  },
  {
    id: 'wanted-102',
    item: 'Toyota Corolla 2014 (Registered / Clean Engine)',
    budget: 52000,
    location: 'Spintex Road, Accra',
    whatsapp: '+233244123456',
    notes: 'Looking for a clean home-used automatic sedan. Serious buyer ready to inspect.',
    createdAtFormatted: '25 mins ago',
    status: 'active',
  },
  {
    id: 'wanted-103',
    item: 'Self-Contained Chamber & Hall Apartment',
    budget: 800,
    location: 'Kumasi, Ahodwo / Bantama',
    whatsapp: '+233208901234',
    notes: 'Looking for 1 or 2 years advance with separate ECG prepaid meter and running water.',
    createdAtFormatted: '45 mins ago',
    status: 'active',
  },
  {
    id: 'wanted-104',
    item: 'Sony PlayStation 5 (Disc Edition + 2 Controllers)',
    budget: 4500,
    location: 'Tema Community 1, Tema',
    whatsapp: '+233501234567',
    notes: 'Must be in pristine working condition with FIFA 24 / FC 24 or GTA V.',
    createdAtFormatted: '1 hour ago',
    status: 'active',
  },
  {
    id: 'wanted-105',
    item: 'HP Pavilion or Dell Core i7 Laptop (16GB RAM / 512GB SSD)',
    budget: 3500,
    location: 'East Legon, Accra',
    whatsapp: '+233559876543',
    notes: 'For coding and graphic design. Battery should last at least 3 hours.',
    createdAtFormatted: '2 hours ago',
    status: 'active',
  },
  {
    id: 'wanted-106',
    item: 'Tecno Camon 20 Pro 5G',
    budget: 1400,
    location: 'Takoradi Market Circle',
    whatsapp: '+233271234567',
    notes: 'Full box with original receipt. No cracked screen please.',
    createdAtFormatted: '3 hours ago',
    status: 'active',
  },
];

export const getLocalWantedItems = (): WantedItem[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_WANTED_ITEMS);
    if (!raw) return SEED_WANTED_ITEMS;
    const parsed: WantedItem[] = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) return SEED_WANTED_ITEMS;
    // Merge user created items with seed items
    const customIds = new Set(parsed.map((item) => item.id));
    const seedsToAdd = SEED_WANTED_ITEMS.filter((seed) => !customIds.has(seed.id));
    return [...parsed, ...seedsToAdd];
  } catch {
    return SEED_WANTED_ITEMS;
  }
};

export const saveLocalWantedItem = (item: WantedItem) => {
  try {
    const current = getLocalWantedItems();
    const updated = [item, ...current.filter((w) => w.id !== item.id)];
    localStorage.setItem(STORAGE_KEY_WANTED_ITEMS, JSON.stringify(updated));
  } catch (e) {
    console.warn('Could not cache wanted item locally:', e);
  }
};

/**
 * Save a wanted item request to Firestore collection 'wanted_items' (authenticated write, local fallback)
 */
export async function saveWantedItemToFirestore(item: WantedItem): Promise<boolean> {
  const path = `wanted_items/${item.id}`;
  saveLocalWantedItem(item);

  if (!auth.currentUser) {
    return false;
  }

  try {
    const docRef = doc(db, 'wanted_items', item.id);
    const data: Record<string, any> = {
      id: item.id,
      userId: auth.currentUser.uid,
      item: item.item.trim().slice(0, 256),
      budget: Math.max(0, Number(item.budget) || 0),
      location: item.location.trim().slice(0, 256),
      whatsapp: item.whatsapp.trim().slice(0, 64),
      status: item.status || 'active',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    if (item.notes) {
      data.notes = item.notes.trim().slice(0, 1000);
    }
    await setDoc(docRef, data, { merge: true });
    return true;
  } catch (error) {
    console.warn(`Could not save wanted item ${item.id} to Firestore (saved locally):`, error);
    return false;
  }
}

/**
 * Fetch all wanted items from Firestore (public read), falling back to local storage
 */
export async function fetchWantedItemsFromFirestore(): Promise<WantedItem[]> {
  const path = 'wanted_items';
  try {
    const snap = await getDocs(collection(db, path));
    if (snap.empty) {
      return getLocalWantedItems();
    }
    const list: WantedItem[] = [];
    snap.forEach((d) => {
      const data = d.data();
      list.push({
        id: data.id || d.id,
        item: data.item,
        budget: Number(data.budget) || 0,
        location: data.location || 'Accra, Ghana',
        whatsapp: data.whatsapp || '+233549769720',
        notes: data.notes || '',
        createdAtFormatted: data.createdAt?.toDate ? 'Recently' : 'Just now',
        status: data.status || 'active',
      });
    });
    // Merge with any offline-saved local items
    const local = getLocalWantedItems();
    const firestoreIds = new Set(list.map((w) => w.id));
    const localOnly = local.filter((w) => !firestoreIds.has(w.id));
    return [...localOnly, ...list];
  } catch (error) {
    console.warn('Could not fetch wanted items from Firestore, using local storage:', error);
    return getLocalWantedItems();
  }
}

/**
 * Subscribe in real-time to wanted items collection in Firestore
 */
export function subscribeToWantedItemsFromFirestore(
  onUpdate: (items: WantedItem[]) => void
): () => void {
  const path = 'wanted_items';
  try {
    return onSnapshot(
      collection(db, path),
      (snapshot) => {
        if (snapshot.empty) {
          onUpdate(getLocalWantedItems());
          return;
        }
        const list: WantedItem[] = [];
        snapshot.forEach((d) => {
          const data = d.data();
          list.push({
            id: data.id || d.id,
            item: data.item,
            budget: Number(data.budget) || 0,
            location: data.location || 'Accra, Ghana',
            whatsapp: data.whatsapp || '+233549769720',
            notes: data.notes || '',
            createdAtFormatted: data.createdAt?.toDate ? 'Recently' : 'Just now',
            status: data.status || 'active',
          });
        });
        const local = getLocalWantedItems();
        const firestoreIds = new Set(list.map((w) => w.id));
        const localOnly = local.filter((w) => !firestoreIds.has(w.id));
        onUpdate([...localOnly, ...list]);
      },
      (error) => {
        console.warn('Firestore wanted_items listener warning:', error);
        onUpdate(getLocalWantedItems());
      }
    );
  } catch (error) {
    console.warn('Error setting up onSnapshot for wanted_items:', error);
    return () => {};
  }
}

/* =========================================================================
   ACCOUNT & DATA DELETION (Firebase Auth + User Firestore Data)
   ========================================================================= */

/**
 * Permanently deletes the signed-in user's Firestore data (listings, products,
 * vendors, public seller profile, wanted items, and user profile doc) and then
 * deletes their Firebase Auth account.
 */
export async function deleteCurrentAccountAndData(password?: string): Promise<{
  success: boolean;
  deletedCounts?: {
    listings: number;
    products: number;
    vendors: number;
    wantedItems: number;
  };
  requiresRecentLogin?: boolean;
  error?: string;
}> {
  const user = auth.currentUser;
  if (!user) {
    return { success: false, error: 'You must be signed in to delete your account.' };
  }

  const uid = user.uid;
  const hasPasswordProvider = user.providerData.some((p) => p.providerId === 'password');
  const hasGoogleProvider = user.providerData.some((p) => p.providerId === 'google.com');

  // Re-authenticate upfront if password is provided or if login session is older than 4 minutes
  const lastSignInMs = user.metadata?.lastSignInTime ? Date.parse(user.metadata.lastSignInTime) : 0;
  const sessionAgeMs = lastSignInMs ? Date.now() - lastSignInMs : Infinity;

  try {
    if (password && password.trim() && user.email && hasPasswordProvider) {
      const cred = EmailAuthProvider.credential(user.email, password);
      await reauthenticateWithCredential(user, cred);
    } else if (sessionAgeMs > 4 * 60 * 1000 && hasGoogleProvider && !hasPasswordProvider) {
      await reauthenticateWithPopup(user, new GoogleAuthProvider());
    } else if (sessionAgeMs > 4 * 60 * 1000 && hasPasswordProvider && !password?.trim()) {
      return {
        success: false,
        requiresRecentLogin: true,
        error: 'Please enter your account password to confirm permanent account deletion.',
      };
    }
  } catch (reauthErr: any) {
    const code = reauthErr?.code || '';
    if (code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
      return {
        success: false,
        requiresRecentLogin: true,
        error: 'Incorrect password. Please enter your valid password to delete your account.',
      };
    }
    if (code === 'auth/popup-closed-by-user') {
      return {
        success: false,
        requiresRecentLogin: true,
        error: 'Google verification popup was closed before confirming deletion.',
      };
    }
    if (
      code === 'auth/unauthorized-domain' ||
      String(reauthErr?.message || '').includes('auth/unauthorized-domain')
    ) {
      return {
        success: false,
        requiresRecentLogin: true,
        error:
          'Google Sign-In not enabled for this preview domain. Please use Email & Password or add this domain to Firebase Authorized Domains',
      };
    }
    return {
      success: false,
      requiresRecentLogin: true,
      error: reauthErr?.message || 'Re-authentication failed. Please sign in again and retry.',
    };
  }

  const deletedCounts = {
    listings: 0,
    products: 0,
    vendors: 0,
    wantedItems: 0,
  };

  try {
    // 1. Delete user's listings
    const listingsByUser = await getDocs(query(collection(db, 'listings'), where('userId', '==', uid)));
    const deletedListingIds = new Set<string>();
    for (const d of listingsByUser.docs) {
      await deleteDoc(doc(db, 'listings', d.id));
      deletedListingIds.add(d.id);
      deletedCounts.listings += 1;
    }
    const listingsBySeller = await getDocs(query(collection(db, 'listings'), where('sellerId', '==', uid)));
    for (const d of listingsBySeller.docs) {
      if (!deletedListingIds.has(d.id)) {
        await deleteDoc(doc(db, 'listings', d.id));
        deletedCounts.listings += 1;
      }
    }

    // 2. Delete user's products
    const productsBySeller = await getDocs(query(collection(db, 'products'), where('sellerId', '==', uid)));
    const deletedProductIds = new Set<string>();
    for (const d of productsBySeller.docs) {
      await deleteDoc(doc(db, 'products', d.id));
      deletedProductIds.add(d.id);
      deletedCounts.products += 1;
    }
    const productsByVendor = await getDocs(query(collection(db, 'products'), where('vendorId', '==', uid)));
    for (const d of productsByVendor.docs) {
      if (!deletedProductIds.has(d.id)) {
        await deleteDoc(doc(db, 'products', d.id));
        deletedCounts.products += 1;
      }
    }

    // 3. Delete user's vendor shop(s)
    const vendorsSnap = await getDocs(query(collection(db, 'vendors'), where('ownerId', '==', uid)));
    for (const d of vendorsSnap.docs) {
      await deleteDoc(doc(db, 'vendors', d.id));
      deletedCounts.vendors += 1;
    }

    // 4. Delete user's public seller profile if present
    try {
      const sellerDocRef = doc(db, 'sellers', uid);
      const sellerSnap = await getDoc(sellerDocRef);
      if (sellerSnap.exists()) {
        await deleteDoc(sellerDocRef);
      }
    } catch {
      // ignore if absent
    }

    // 5. Delete user's wanted_items
    const wantedSnap = await getDocs(query(collection(db, 'wanted_items'), where('userId', '==', uid)));
    for (const d of wantedSnap.docs) {
      await deleteDoc(doc(db, 'wanted_items', d.id));
      deletedCounts.wantedItems += 1;
    }

    // 6. Delete user's private profile document (/users/{uid})
    try {
      await deleteDoc(doc(db, 'users', uid));
    } catch {
      // ignore if already absent
    }

    // 7. Delete Firebase Authentication account
    await deleteUser(user);

    return { success: true, deletedCounts };
  } catch (err: any) {
    const code = err?.code || '';
    if (code === 'auth/requires-recent-login') {
      return {
        success: false,
        requiresRecentLogin: true,
        error: 'For security, please enter your password (or sign out and sign back in) before deleting your account.',
      };
    }
    console.error('Account deletion error:', err);
    return {
      success: false,
      error: err?.message || 'Could not complete account deletion. Please try again.',
    };
  }
}


