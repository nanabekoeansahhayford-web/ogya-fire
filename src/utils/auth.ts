import { UserProfile, AccountType } from '../types/marketplace';
import {
  auth,
  FirebaseUser,
  saveUserProfileToFirestore,
  ensureUserDocOnLogin,
  firebaseAuthSignUp,
  firebaseAuthSignIn,
  firebaseGoogleSignIn,
  firebaseAuthSignOut,
} from './firebase';

const STORAGE_KEY_CURRENT_USER = 'ogya_auth_current_user';
const STORAGE_KEY_USERS_DB = 'ogya_auth_users_registry';

/**
 * Check if user is registered as a buyer
 */
export function isUserBuyer(user: UserProfile | null | undefined): boolean {
  if (!user) return false;
  return user.accountType === 'buyer' || user.userRole === 'buyer';
}

/**
 * Check if user is registered as a seller / merchant
 */
export function isUserSeller(user: UserProfile | null | undefined): boolean {
  if (!user) return false;
  return (
    user.accountType === 'seller' ||
    user.accountType === 'business' ||
    user.accountType === 'individual' ||
    user.userRole === 'seller' ||
    user.userRole === 'vendor' ||
    user.role === 'vendor'
  );
}

/**
 * Retrieve cached user profiles keyed in localStorage (UI metadata cache only, never replaces Firebase Auth)
 */
export function getAllRegisteredUsers(): UserProfile[] {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return [];
    }
    const stored = localStorage.getItem(STORAGE_KEY_USERS_DB);
    if (!stored) return [];
    const parsed: UserProfile[] = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveRegisteredUsers(users: UserProfile[]): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(STORAGE_KEY_USERS_DB, JSON.stringify(users));
    }
  } catch (e) {
    console.error('Failed to save users metadata cache:', e);
  }
}

/**
 * Retrieve currently authenticated user profile ONLY when Firebase Auth session exists.
 * Never auto-logs into any fake/demo account — guests remain null until Firebase Auth confirms a user.
 */
export function getCurrentUser(): UserProfile | null {
  try {
    if (!auth.currentUser) {
      return null;
    }
    return syncUserProfileFromFirebaseAuth(auth.currentUser);
  } catch {
    return null;
  }
}

/**
 * Set or clear cached user profile in localStorage
 */
export function setCurrentUser(user: UserProfile | null): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      if (user) {
        localStorage.setItem(STORAGE_KEY_CURRENT_USER, JSON.stringify(user));
        const existing = getAllRegisteredUsers();
        const filtered = existing.filter((u) => u.id !== user.id);
        saveRegisteredUsers([user, ...filtered]);
      } else {
        localStorage.removeItem(STORAGE_KEY_CURRENT_USER);
      }
    }
  } catch (e) {
    console.error('Failed to set current user in storage:', e);
  }
}

/**
 * Map an authenticated FirebaseUser into an OGYA UserProfile with authoritative `id = fbUser.uid`.
 */
export function syncUserProfileFromFirebaseAuth(
  fbUser: FirebaseUser,
  overrides?: Partial<UserProfile>
): UserProfile {
  const cachedAll = getAllRegisteredUsers();
  let cachedCurrent: UserProfile | null = null;
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY_CURRENT_USER) : null;
    if (raw) {
      const parsed = JSON.parse(raw) as UserProfile;
      if (parsed && parsed.id === fbUser.uid) {
        cachedCurrent = parsed;
      }
    }
  } catch {
    // ignore
  }

  const cachedById = cachedCurrent || cachedAll.find((u) => u.id === fbUser.uid);
  const dateStr = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const resolvedName =
    overrides?.name?.trim() ||
    cachedById?.name ||
    fbUser.displayName ||
    fbUser.email?.split('@')[0] ||
    fbUser.phoneNumber ||
    'OGYA Member';

  const resolvedEmail = (overrides?.email || fbUser.email || cachedById?.email || '').trim().toLowerCase();
  const resolvedPhone = (overrides?.phone || fbUser.phoneNumber || cachedById?.phone || '').trim();
  const resolvedRole = overrides?.userRole || cachedById?.userRole || 'buyer';
  const resolvedAccountType: AccountType =
    overrides?.accountType ||
    cachedById?.accountType ||
    (resolvedRole === 'seller' || resolvedRole === 'vendor' ? 'seller' : 'buyer');

  const profile: UserProfile = {
    ...(cachedById || {}),
    ...(overrides || {}),
    id: fbUser.uid,
    name: resolvedName,
    email: resolvedEmail,
    phone: resolvedPhone,
    whatsapp: overrides?.whatsapp || cachedById?.whatsapp || resolvedPhone,
    accountType: resolvedAccountType,
    userRole: resolvedRole,
    region: overrides?.region || cachedById?.region || 'Greater Accra (Accra, Tema, Legon)',
    city: overrides?.city || cachedById?.city || 'Accra',
    bio:
      overrides?.bio ||
      cachedById?.bio ||
      (resolvedRole === 'buyer'
        ? 'Verified buyer on OGYA marketplace.'
        : 'Verified seller on OGYA marketplace.'),
    isVerified: overrides?.isVerified ?? cachedById?.isVerified ?? Boolean(fbUser.emailVerified || fbUser.phoneNumber),
    memberSince: cachedById?.memberSince || dateStr,
    avatarUrl:
      overrides?.avatarUrl ||
      fbUser.photoURL ||
      cachedById?.avatarUrl ||
      `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(resolvedName)}&backgroundColor=${
        resolvedRole === 'buyer' ? '0284c7,38bdf8' : 'f59e0b,ea580c,dc2626'
      }`,
  };

  setCurrentUser(profile);
  return profile;
}

export interface RegistrationPayload {
  name: string;
  email: string;
  phone: string;
  whatsapp?: string;
  password: string;
  accountType: AccountType;
  userRole?: 'buyer' | 'seller';
  businessName?: string;
  profession?: string;
  experience?: string;
  businessCategory?: string;
  region: string;
  city?: string;
  bio?: string;
}

/**
 * Register a new user via real Firebase Auth (Email + Password) & persist to /users/{uid}.
 */
export async function registerUser(
  payload: RegistrationPayload
): Promise<{
  success: boolean;
  user?: UserProfile;
  error?: string;
}> {
  const emailClean = payload.email.trim().toLowerCase();
  const phoneClean = payload.phone.trim();
  const displayName =
    payload.accountType === 'business' && payload.businessName?.trim()
      ? payload.businessName.trim()
      : payload.name.trim();

  if (!displayName) {
    return { success: false, error: 'Full name or business name is required.' };
  }
  if (!emailClean || !emailClean.includes('@')) {
    return { success: false, error: 'A valid email address is required.' };
  }
  if (!phoneClean) {
    return { success: false, error: 'A mobile phone number is required.' };
  }
  if (!payload.password || payload.password.length < 6) {
    return { success: false, error: 'Password must be at least 6 characters long.' };
  }

  const authRes = await firebaseAuthSignUp(emailClean, payload.password, displayName);
  if (authRes.error || !authRes.user) {
    return { success: false, error: authRes.error || 'Could not create Firebase account.' };
  }

  const isBuyerRole = payload.accountType === 'buyer';
  const role: 'buyer' | 'seller' = isBuyerRole ? 'buyer' : 'seller';

  const newUser = syncUserProfileFromFirebaseAuth(authRes.user, {
    name: displayName,
    email: emailClean,
    phone: phoneClean,
    whatsapp: payload.whatsapp?.trim() || phoneClean,
    accountType: payload.accountType,
    userRole: role,
    businessName: payload.businessName?.trim(),
    profession: payload.profession?.trim(),
    experience: payload.experience?.trim(),
    businessCategory: payload.businessCategory?.trim(),
    region: payload.region || 'Greater Accra (Accra, Tema, Legon)',
    city: payload.city?.trim() || payload.region?.split('(')[0].trim() || 'Accra',
    bio: payload.bio?.trim(),
    isVerified: payload.accountType === 'business',
  });

  await saveUserProfileToFirestore(newUser.id, emailClean, phoneClean, displayName);
  return { success: true, user: newUser };
}

/**
 * Sign in existing user via real Firebase Auth (Email + Password).
 */
export async function loginUser(
  email: string,
  password: string
): Promise<{ success: boolean; user?: UserProfile; error?: string }> {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail || !cleanEmail.includes('@')) {
    return { success: false, error: 'Please enter a valid email address (or use Phone OTP tab to sign in by phone).' };
  }
  if (!password) {
    return { success: false, error: 'Please enter your password.' };
  }

  const authRes = await firebaseAuthSignIn(cleanEmail, password);
  if (authRes.error || !authRes.user) {
    return {
      success: false,
      error: authRes.error || 'Invalid email or password.',
    };
  }

  const user = syncUserProfileFromFirebaseAuth(authRes.user);
  await ensureUserDocOnLogin(user.id, user.email, user.phone, user.name);
  return { success: true, user };
}

/**
 * Sign in with real Google Firebase Auth popup.
 */
export async function loginWithGoogle(
  asRole: 'buyer' | 'seller' = 'buyer'
): Promise<{ success: boolean; user?: UserProfile; error?: string }> {
  const googleRes = await firebaseGoogleSignIn();
  if (googleRes.error || !googleRes.user) {
    return {
      success: false,
      error: googleRes.error || 'Google Sign-In did not complete.',
    };
  }

  const user = syncUserProfileFromFirebaseAuth(googleRes.user, {
    accountType: asRole === 'buyer' ? 'buyer' : 'seller',
    userRole: asRole,
    isVerified: true,
  });

  await saveUserProfileToFirestore(user.id, user.email, user.phone, user.name);
  return { success: true, user };
}

/**
 * Update an existing user's cached profile (for the signed-in user)
 */
export function updateUserProfile(
  userId: string,
  updates: Partial<UserProfile>
): UserProfile | null {
  const users = getAllRegisteredUsers();
  const index = users.findIndex((u) => u.id === userId);
  const current = getCurrentUser();
  const base = index !== -1 ? users[index] : current?.id === userId ? current : null;

  if (!base) return null;

  const updated: UserProfile = { ...base, ...updates, id: userId };
  if (index !== -1) {
    users[index] = updated;
    saveRegisteredUsers(users);
  } else {
    saveRegisteredUsers([updated, ...users]);
  }

  if (auth.currentUser && auth.currentUser.uid === userId) {
    setCurrentUser(updated);
  }

  return updated;
}

/**
 * Sign out user cleanly from both Firebase Auth and local cache
 */
export function logoutUser(): void {
  setCurrentUser(null);
  firebaseAuthSignOut().catch(() => {});
}
