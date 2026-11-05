import { UserProfile, AccountType } from '../types/marketplace';
import {
  saveUserProfileToFirestore,
  ensureUserDocOnLogin,
  firebaseAuthSignIn,
  firebaseAuthSignOut,
} from './firebase';

const STORAGE_KEY_CURRENT_USER = 'ogya_auth_current_user';
const STORAGE_KEY_LOGGED_OUT = 'ogya_auth_explicit_logged_out';
const STORAGE_KEY_USERS_DB = 'ogya_auth_users_registry';

export const DEMO_BUYER_USER: UserProfile = {
  id: 'usr-buyer-kofi-01',
  name: 'Kofi Mensah (Buyer)',
  email: 'kofi.buyer@ogya.gh',
  phone: '+233 24 888 1234',
  whatsapp: '+233248881234',
  accountType: 'buyer',
  userRole: 'buyer',
  region: 'Greater Accra (Accra, Tema, Legon)',
  city: 'Osu, Accra',
  bio: 'Verified buyer actively scouting authentic smartphones, laptops, electronics, and vehicles across Ghana.',
  isVerified: true,
  memberSince: 'March 2024',
  avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  password: 'password123',
};

export const DEFAULT_AF_USER: UserProfile = {
  id: 'usr-ansah-01',
  name: 'Ansah Ford',
  email: 'nanabekoeansahhayford@gmail.com',
  phone: '+233 24 555 8899',
  whatsapp: '+233245558899',
  accountType: 'business',
  userRole: 'seller',
  businessName: 'AF Prestige Electronics & Motors',
  businessCategory: 'Electronics & Automotive',
  region: 'Greater Accra (Accra, Tema, Legon)',
  city: 'East Legon, Accra',
  bio: 'Trusted Ghanaian dealer in verified smartphones, tech devices, and prime vehicles in Accra.',
  isVerified: true,
  memberSince: 'January 2023',
  avatarUrl: '', // Empty avatar displays prominent 'AF' initials
  password: 'password123',
  ghanaCardNumber: 'GHA-724891204-7',
  ghanaCardStatus: 'verified',
};

export const DEMO_SELLER_INDIVIDUAL: UserProfile = {
  id: 'usr-kwame-01',
  name: 'Kwame Mensah (Seller)',
  email: 'kwame@ogya.gh',
  phone: '+233 24 555 1290',
  whatsapp: '+233245551290',
  accountType: 'individual',
  userRole: 'seller',
  region: 'Greater Accra (Accra, Tema, Legon)',
  city: 'East Legon, Accra',
  bio: 'Trusted private electronics and automobile trader in Accra. Fast responses and verified deals only.',
  isVerified: true,
  memberSince: 'March 2022',
  avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  password: 'password123',
  ghanaCardStatus: 'verified',
  ghanaCardNumber: 'GHA-718290312-4',
};

export const DEMO_USERS: UserProfile[] = [
  DEMO_BUYER_USER,
  DEFAULT_AF_USER,
  DEMO_SELLER_INDIVIDUAL,
  {
    id: 'usr-prestige-02',
    name: 'Prestige Motors West Africa',
    email: 'sales@prestigemotors.gh',
    phone: '+233 24 489 1204',
    whatsapp: '+233244891204',
    accountType: 'business',
    userRole: 'seller',
    businessName: 'Prestige Motors Ltd',
    businessCategory: 'Vehicles & Automotive Dealership',
    region: 'Greater Accra (Accra, Tema, Legon)',
    city: 'Airport Residential Area, Accra',
    bio: 'Licensed premium automobile importer & showroom in Accra. Specializing in luxury SUVs, sports sedans & genuine parts.',
    isVerified: true,
    memberSince: 'January 2021',
    avatarUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80',
    password: 'password123',
    ghanaCardStatus: 'verified',
    ghanaCardNumber: 'GHA-709124819-2',
  },
  {
    id: 'usr-sarah-03',
    name: 'Sarah Osei',
    email: 'sarah.tech@ogya.gh',
    phone: '+233 20 740 9912',
    whatsapp: '+233207409912',
    accountType: 'jobseeker',
    profession: 'Senior Full-Stack Engineer',
    experience: '6 Years Experience',
    region: 'Greater Accra (Accra, Tema, Legon)',
    city: 'Cantonments, Accra',
    bio: 'Certified React & TypeScript engineer open to full-time or contract roles with leading tech teams.',
    isVerified: true,
    memberSince: 'November 2023',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    password: 'password123',
  },
];

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
    user.userRole === 'seller'
  );
}

/**
 * Retrieve all registered users from localStorage, defaulting to DEMO_USERS
 */
export function getAllRegisteredUsers(): UserProfile[] {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return DEMO_USERS;
    }
    const stored = localStorage.getItem(STORAGE_KEY_USERS_DB);
    if (!stored) {
      localStorage.setItem(STORAGE_KEY_USERS_DB, JSON.stringify(DEMO_USERS));
      return DEMO_USERS;
    }
    const parsed: UserProfile[] = JSON.parse(stored);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEMO_USERS;
  } catch {
    return DEMO_USERS;
  }
}

/**
 * Save updated list of registered users
 */
function saveRegisteredUsers(users: UserProfile[]): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(STORAGE_KEY_USERS_DB, JSON.stringify(users));
    }
  } catch (e) {
    console.error('Failed to save users database', e);
  }
}

/**
 * Retrieve currently logged-in user profile from localStorage.
 * If user explicitly logged out, returns null.
 */
export function getCurrentUser(): UserProfile | null {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return null;
    }
    // Check if user has explicitly logged out
    const isExplicitlyLoggedOut = localStorage.getItem(STORAGE_KEY_LOGGED_OUT) === 'true';
    if (isExplicitlyLoggedOut) {
      return null;
    }

    const current = localStorage.getItem(STORAGE_KEY_CURRENT_USER);
    if (!current || current === 'null' || current === 'undefined') {
      // By default on initial load, start with Ansah Ford demo account for seamless showcase
      localStorage.setItem(STORAGE_KEY_CURRENT_USER, JSON.stringify(DEFAULT_AF_USER));
      return DEFAULT_AF_USER;
    }
    return JSON.parse(current);
  } catch {
    return null;
  }
}

/**
 * Set or clear currently active user session
 */
export function setCurrentUser(user: UserProfile | null): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      if (user) {
        localStorage.removeItem(STORAGE_KEY_LOGGED_OUT);
        localStorage.setItem(STORAGE_KEY_CURRENT_USER, JSON.stringify(user));
      } else {
        localStorage.setItem(STORAGE_KEY_LOGGED_OUT, 'true');
        localStorage.removeItem(STORAGE_KEY_CURRENT_USER);
      }
    }
  } catch (e) {
    console.error('Failed to set current user in storage', e);
  }
}

export interface RegistrationPayload {
  name: string;
  email: string;
  phone: string;
  whatsapp?: string;
  password?: string;
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
 * Register a new user on OGYA Marketplace (Buyer or Seller)
 * Also saves profile to Firestore in collection 'users' with doc id = user uid, fields: email, createdAt, role = 'customer'
 */
export function registerUser(
  payload: RegistrationPayload,
  customUid?: string
): {
  success: boolean;
  user?: UserProfile;
  error?: string;
} {
  const emailClean = payload.email.trim().toLowerCase();
  const phoneClean = payload.phone.trim();

  if (!payload.name.trim()) {
    return { success: false, error: 'Full name or business name is required.' };
  }
  if (!emailClean || !emailClean.includes('@')) {
    return { success: false, error: 'A valid email address is required.' };
  }
  if (!phoneClean) {
    return { success: false, error: 'A mobile phone number is required.' };
  }
  if (payload.password && payload.password.length < 6) {
    return { success: false, error: 'Password must be at least 6 characters long.' };
  }

  const existingUsers = getAllRegisteredUsers();
  const duplicate = existingUsers.find(
    (u) =>
      u.email.toLowerCase() === emailClean ||
      (phoneClean && u.phone.replace(/\s+/g, '') === phoneClean.replace(/\s+/g, ''))
  );

  if (duplicate) {
    return {
      success: false,
      error: 'An account with this email or phone number already exists. Please Sign In.',
    };
  }

  const dateStr = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const newId = customUid || `usr-${payload.accountType}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

  const isBuyerRole = payload.accountType === 'buyer';
  const role: 'buyer' | 'seller' = isBuyerRole ? 'buyer' : 'seller';

  const defaultBio = isBuyerRole
    ? 'Active buyer on OGYA marketplace discovering the best deals in Ghana.'
    : payload.accountType === 'business'
    ? 'Verified merchant offering genuine products with fast fulfillment.'
    : 'Individual seller offering verified quality items.';

  const newUser: UserProfile = {
    id: newId,
    name: payload.name.trim(),
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
    bio: payload.bio?.trim() || defaultBio,
    isVerified: payload.accountType === 'business', // Business accounts receive initial verification pass
    memberSince: dateStr,
    avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(payload.name.trim())}&backgroundColor=${isBuyerRole ? '0284c7,38bdf8' : 'f59e0b,ea580c,dc2626'}`,
    password: payload.password || 'password123',
  };

  const updatedUsers = [newUser, ...existingUsers];
  saveRegisteredUsers(updatedUsers);
  setCurrentUser(newUser);

  // When a user signs up, also save their profile to Firestore in collection 'users' with doc id = user uid, fields: email, createdAt, role = 'customer'
  saveUserProfileToFirestore(newUser.id, newUser.email).catch((err) => {
    console.warn('saveUserProfileToFirestore on registration notice:', err);
  });

  return { success: true, user: newUser };
}

/**
 * Sign in existing user with email/phone & password
 */
export function loginUser(
  identifier: string,
  password?: string
): { success: boolean; user?: UserProfile; error?: string } {
  const cleanId = identifier.trim().toLowerCase();
  const cleanPhone = identifier.trim().replace(/\s+/g, '');

  if (!cleanId) {
    return { success: false, error: 'Please enter your email or phone number.' };
  }

  const users = getAllRegisteredUsers();
  const user = users.find(
    (u) =>
      u.email.toLowerCase() === cleanId ||
      u.phone.replace(/\s+/g, '') === cleanPhone
  );

  if (!user) {
    return {
      success: false,
      error: 'No account found with this email or phone. Please create an account.',
    };
  }

  // If password provided, verify (or bypass if empty for demo login)
  if (password && user.password && user.password !== password) {
    return {
      success: false,
      error: 'Incorrect password. Please verify and try again.',
    };
  }

  setCurrentUser(user);

  // When user logs in, if no doc exists in 'users', create it with merge true
  if (user.id && user.email) {
    ensureUserDocOnLogin(user.id, user.email).catch((err) => {
      console.warn('ensureUserDocOnLogin notice:', err);
    });
  }

  // Non-blocking Firebase Auth sync if password provided
  if (user.email && password) {
    firebaseAuthSignIn(user.email, password).catch(() => {});
  }

  return { success: true, user };
}

/**
 * Simulate quick Google Sign-In / Sign-Up
 * Also saves profile to Firestore in collection 'users' with doc id = user uid, fields: email, createdAt = serverTimestamp, role = 'customer', displayName = email
 */
export function loginWithGoogle(
  email = 'user@gmail.com',
  name = 'Google User',
  asRole: 'buyer' | 'seller' = 'buyer',
  customUid?: string
): UserProfile {
  const users = getAllRegisteredUsers();
  const existing = users.find((u) => u.email.toLowerCase() === email.toLowerCase());

  if (existing) {
    setCurrentUser(existing);
    if (existing.id && existing.email) {
      ensureUserDocOnLogin(existing.id, existing.email).catch(() => {});
    }
    return existing;
  }

  const dateStr = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const uid = customUid || `usr-google-${Date.now()}`;
  const newUser: UserProfile = {
    id: uid,
    name,
    email: email.toLowerCase(),
    phone: '+233 24 000 0000',
    whatsapp: '+233 24 000 0000',
    accountType: asRole === 'buyer' ? 'buyer' : 'seller',
    userRole: asRole,
    region: 'Greater Accra (Accra, Tema, Legon)',
    city: 'Accra',
    bio: `Google authenticated verified OGYA ${asRole}.`,
    isVerified: true,
    memberSince: dateStr,
    avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=ea580c`,
  };

  saveRegisteredUsers([newUser, ...users]);
  setCurrentUser(newUser);

  // When a user signs up, save their profile to Firestore in collection 'users' with doc id = user uid, fields: email, createdAt, role = 'customer'
  saveUserProfileToFirestore(newUser.id, newUser.email).catch((err) => {
    console.warn('saveUserProfileToFirestore for Google user notice:', err);
  });

  return newUser;
}

/**
 * Update an existing user's profile
 */
export function updateUserProfile(
  userId: string,
  updates: Partial<UserProfile>
): UserProfile | null {
  const users = getAllRegisteredUsers();
  const index = users.findIndex((u) => u.id === userId);

  if (index === -1) return null;

  const updated: UserProfile = { ...users[index], ...updates };
  users[index] = updated;
  saveRegisteredUsers(users);

  const current = getCurrentUser();
  if (current && current.id === userId) {
    setCurrentUser(updated);
  }

  return updated;
}

/**
 * Sign out user
 */
export function logoutUser(): void {
  setCurrentUser(null);
  firebaseAuthSignOut().catch(() => {});
}
