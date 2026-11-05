/**
 * Ghana Card Verification System for OGYA Marketplace
 * Supports secure seller uploads, blurred privacy previews, and manual verification by admin.
 */

import { UserProfile, Listing } from '../types/marketplace';
import { updateUserProfile, getAllRegisteredUsers } from './auth';
import { getStoredListings, updateStoredListing } from './storage';

export interface GhanaCardVerificationRequest {
  id: string;
  userId: string;
  sellerName: string;
  sellerEmail: string;
  sellerPhone: string;
  ghanaCardNumber: string; // e.g. GHA-723456789-1
  cardFrontPhoto: string; // Data URL or secure sample image
  cardBackPhoto?: string;
  submittedAt: string;
  status: 'pending' | 'verified' | 'rejected';
  reviewedAt?: string;
  reviewerNotes?: string;
}

const STORAGE_KEY_VERIFICATION_REQUESTS = 'ogya_ghana_card_verifications';

// Realistic sample Ghana Card SVG data URI for demo / testing
export const SAMPLE_GHANA_CARD_FRONT =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 380" width="600" height="380">
  <defs>
    <linearGradient id="cardBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fdfbf7"/>
      <stop offset="50%" stop-color="#f4eee3"/>
      <stop offset="100%" stop-color="#e2d8c3"/>
    </linearGradient>
    <linearGradient id="ghanaFlag" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#ce1126"/>
      <stop offset="33%" stop-color="#ce1126"/>
      <stop offset="33%" stop-color="#fcd116"/>
      <stop offset="66%" stop-color="#fcd116"/>
      <stop offset="66%" stop-color="#006b3f"/>
      <stop offset="100%" stop-color="#006b3f"/>
    </linearGradient>
  </defs>
  <!-- Card base -->
  <rect width="600" height="380" rx="18" fill="url(#cardBg)" stroke="#b59f78" stroke-width="2"/>
  
  <!-- Ghana Flag Accent Bar -->
  <rect x="0" y="0" width="18" height="380" rx="18" fill="url(#ghanaFlag)"/>
  
  <!-- Header Republic of Ghana -->
  <text x="50" y="42" font-family="Arial, sans-serif" font-size="20" font-weight="900" fill="#1b2a4a" letter-spacing="2">REPUBLIC OF GHANA</text>
  <text x="50" y="64" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="#006b3f" letter-spacing="1">NATIONAL IDENTITY CARD · GHANA CARD</text>
  <text x="460" y="42" font-family="Arial, sans-serif" font-size="11" font-weight="bold" fill="#7a6237">ECOWAS / CEDEAO</text>

  <!-- Gold Biometric Chip -->
  <rect x="50" y="90" width="68" height="52" rx="6" fill="#dfb15b" stroke="#aa7e2a" stroke-width="1.5"/>
  <rect x="66" y="90" width="36" height="52" fill="none" stroke="#aa7e2a" stroke-width="1"/>
  <line x1="50" y1="116" x2="118" y2="116" stroke="#aa7e2a" stroke-width="1"/>

  <!-- Photo Box -->
  <rect x="50" y="160" width="120" height="150" rx="8" fill="#cbd5e1" stroke="#94a3b8" stroke-width="1.5"/>
  <!-- Silhouette / Avatar -->
  <circle cx="110" cy="210" r="32" fill="#475569"/>
  <path d="M 68 300 Q 110 248 152 300 Z" fill="#475569"/>

  <!-- Coat of Arms / Black Star Watermark -->
  <polygon points="510,120 522,156 560,156 530,178 542,214 510,192 478,214 490,178 460,156 498,156" fill="#1e293b" opacity="0.12"/>

  <!-- Cardholder Data -->
  <text x="195" y="112" font-family="Arial, sans-serif" font-size="10" font-weight="bold" fill="#64748b">SURNAME / NOM</text>
  <text x="195" y="132" font-family="Arial, sans-serif" font-size="16" font-weight="900" fill="#0f172a">ANSAH FORD</text>

  <text x="195" y="162" font-family="Arial, sans-serif" font-size="10" font-weight="bold" fill="#64748b">FIRST NAMES / PRÉNOMS</text>
  <text x="195" y="180" font-family="Arial, sans-serif" font-size="15" font-weight="800" fill="#0f172a">NANA BEKOE</text>

  <text x="195" y="210" font-family="Arial, sans-serif" font-size="10" font-weight="bold" fill="#64748b">NATIONALITY / NATIONALITÉ</text>
  <text x="195" y="228" font-family="Arial, sans-serif" font-size="13" font-weight="bold" fill="#0f172a">GHANAIAN</text>

  <text x="340" y="210" font-family="Arial, sans-serif" font-size="10" font-weight="bold" fill="#64748b">SEX / SEXE</text>
  <text x="340" y="228" font-family="Arial, sans-serif" font-size="13" font-weight="bold" fill="#0f172a">M</text>

  <text x="400" y="210" font-family="Arial, sans-serif" font-size="10" font-weight="bold" fill="#64748b">DATE OF BIRTH</text>
  <text x="400" y="228" font-family="Arial, sans-serif" font-size="13" font-weight="bold" fill="#0f172a">14 / 08 / 1992</text>

  <!-- Ghana Card ID Number -->
  <rect x="195" y="250" width="360" height="42" rx="6" fill="#0f172a"/>
  <text x="210" y="266" font-family="Arial, sans-serif" font-size="9" font-weight="bold" fill="#94a3b8">PERSONAL ID NUMBER (PIN)</text>
  <text x="210" y="284" font-family="'Space Mono', monospace, Arial" font-size="16" font-weight="900" fill="#38bdf8" letter-spacing="2">GHA-724891204-7</text>

  <!-- MRZ Barcode simulation -->
  <rect x="50" y="332" width="505" height="26" rx="4" fill="#f8fafc" stroke="#cbd5e1"/>
  <text x="65" y="349" font-family="'Courier New', monospace" font-size="11" font-weight="bold" fill="#334155" letter-spacing="3">I&lt;GHAGHA7248912047&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;9208144M3011028GHA&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;4</text>
</svg>`);

// Initial demo submissions
const INITIAL_DEMO_REQUESTS: GhanaCardVerificationRequest[] = [
  {
    id: 'req-ansah-01',
    userId: 'usr-ansah-01',
    sellerName: 'Ansah Ford',
    sellerEmail: 'nanabekoeansahhayford@gmail.com',
    sellerPhone: '+233 24 555 8899',
    ghanaCardNumber: 'GHA-724891204-7',
    cardFrontPhoto: SAMPLE_GHANA_CARD_FRONT,
    submittedAt: 'Today, 10:15 AM',
    status: 'pending',
  },
  {
    id: 'req-kwame-02',
    userId: 'usr-kwame-01',
    sellerName: 'Kwame Mensah',
    sellerEmail: 'kwame@ogya.gh',
    sellerPhone: '+233 24 555 1290',
    ghanaCardNumber: 'GHA-718290312-4',
    cardFrontPhoto: SAMPLE_GHANA_CARD_FRONT,
    submittedAt: 'Yesterday, 4:30 PM',
    status: 'verified',
    reviewedAt: 'Yesterday, 5:10 PM',
    reviewerNotes: 'Biometric photo matches registered profile. GHA-PIN verified with NIA directory.',
  },
];

export function getVerificationRequests(): GhanaCardVerificationRequest[] {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return INITIAL_DEMO_REQUESTS;
    }
    const stored = localStorage.getItem(STORAGE_KEY_VERIFICATION_REQUESTS);
    if (!stored) {
      localStorage.setItem(STORAGE_KEY_VERIFICATION_REQUESTS, JSON.stringify(INITIAL_DEMO_REQUESTS));
      return INITIAL_DEMO_REQUESTS;
    }
    const parsed: GhanaCardVerificationRequest[] = JSON.parse(stored);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_DEMO_REQUESTS;
  } catch {
    return INITIAL_DEMO_REQUESTS;
  }
}

function saveVerificationRequests(requests: GhanaCardVerificationRequest[]): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(STORAGE_KEY_VERIFICATION_REQUESTS, JSON.stringify(requests));
    }
  } catch (e) {
    console.error('Failed to save verification requests', e);
  }
}

export function getVerificationRequestByUserId(userId: string): GhanaCardVerificationRequest | undefined {
  const all = getVerificationRequests();
  return all.find((r) => r.userId === userId);
}

export function validateGhanaCardNumber(cardNumber: string): { valid: boolean; formatted: string; error?: string } {
  const clean = cardNumber.trim().toUpperCase();
  // Standard Ghana Card format: GHA-XXXXXXXXX-X (e.g. GHA-712345678-9)
  const regex = /^GHA-\d{9}-\d$/;
  if (!clean) {
    return { valid: false, formatted: '', error: 'Ghana Card PIN is required.' };
  }
  if (!clean.startsWith('GHA-')) {
    // Attempt auto-fix if user typed without GHA- prefix
    const digitsOnly = clean.replace(/[^0-9]/g, '');
    if (digitsOnly.length === 10) {
      const fixed = `GHA-${digitsOnly.slice(0, 9)}-${digitsOnly.slice(9)}`;
      return { valid: true, formatted: fixed };
    }
    return { valid: false, formatted: clean, error: 'Must begin with "GHA-" (e.g. GHA-712345678-9)' };
  }
  if (!regex.test(clean)) {
    return {
      valid: false,
      formatted: clean,
      error: 'Format must be GHA-XXXXXXXXX-X (GHA followed by 9 digits and 1 check digit)',
    };
  }
  return { valid: true, formatted: clean };
}

export function submitGhanaCardVerification(payload: {
  userId: string;
  sellerName: string;
  sellerEmail: string;
  sellerPhone: string;
  ghanaCardNumber: string;
  cardFrontPhoto?: string;
  cardBackPhoto?: string;
}): GhanaCardVerificationRequest {
  const all = getVerificationRequests();
  const existingIndex = all.findIndex((r) => r.userId === payload.userId);

  const formattedDate = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const newReq: GhanaCardVerificationRequest = {
    id: existingIndex !== -1 ? all[existingIndex].id : `req-${Date.now()}`,
    userId: payload.userId,
    sellerName: payload.sellerName,
    sellerEmail: payload.sellerEmail,
    sellerPhone: payload.sellerPhone,
    ghanaCardNumber: payload.ghanaCardNumber,
    cardFrontPhoto: payload.cardFrontPhoto || SAMPLE_GHANA_CARD_FRONT,
    cardBackPhoto: payload.cardBackPhoto,
    submittedAt: formattedDate,
    status: 'pending',
  };

  if (existingIndex !== -1) {
    all[existingIndex] = newReq;
  } else {
    all.unshift(newReq);
  }
  saveVerificationRequests(all);

  // Update user profile status
  updateUserProfile(payload.userId, {
    ghanaCardNumber: payload.ghanaCardNumber,
    ghanaCardPhotoUrl: newReq.cardFrontPhoto,
    ghanaCardStatus: 'pending',
    ghanaCardSubmittedAt: formattedDate,
  });

  return newReq;
}

/**
 * Manual Verification Approval by Admin / Verifier
 */
export function approveGhanaCardVerification(
  requestId: string,
  reviewerNotes = 'Ghana Card Verified manually by OGYA Verification Officer. Identity, PIN, and photo authenticated.'
): GhanaCardVerificationRequest | null {
  const all = getVerificationRequests();
  const index = all.findIndex((r) => r.id === requestId);
  if (index === -1) return null;

  const req = all[index];
  const now = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const updatedReq: GhanaCardVerificationRequest = {
    ...req,
    status: 'verified',
    reviewedAt: now,
    reviewerNotes,
  };
  all[index] = updatedReq;
  saveVerificationRequests(all);

  // 1. Update user profile to verified
  updateUserProfile(req.userId, {
    isVerified: true,
    ghanaCardStatus: 'verified',
    ghanaCardVerifiedAt: now,
    ghanaCardRejectReason: undefined,
  });

  // 2. Update all listings belonging to this seller in localStorage
  try {
    const listings = getStoredListings();
    listings.forEach((listing) => {
      if (
        listing.userId === req.userId ||
        listing.seller.name.toLowerCase().trim() === req.sellerName.toLowerCase().trim()
      ) {
        updateStoredListing(listing.id, {
          seller: {
            ...listing.seller,
            isVerified: true,
            ghanaCardVerified: true,
          },
        });
      }
    });
  } catch (e) {
    console.error('Error updating listings for verified seller', e);
  }

  return updatedReq;
}

/**
 * Manual Verification Rejection by Admin / Verifier
 */
export function rejectGhanaCardVerification(
  requestId: string,
  reason: string
): GhanaCardVerificationRequest | null {
  const all = getVerificationRequests();
  const index = all.findIndex((r) => r.id === requestId);
  if (index === -1) return null;

  const req = all[index];
  const now = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const updatedReq: GhanaCardVerificationRequest = {
    ...req,
    status: 'rejected',
    reviewedAt: now,
    reviewerNotes: reason,
  };
  all[index] = updatedReq;
  saveVerificationRequests(all);

  // Update user profile status
  updateUserProfile(req.userId, {
    ghanaCardStatus: 'rejected',
    ghanaCardRejectReason: reason,
  });

  return updatedReq;
}

const STORAGE_KEY_VERIFIED_SUBSCRIPTIONS = 'ogya_verified_subscriptions';

export interface VerifiedSubscriptionRecord {
  userId: string;
  sellerName: string;
  amount: number; // e.g. 100 GHS
  billingCycle: 'monthly';
  subscribedAt: string;
  expiresAt: string;
  paymentMethod: string;
  paystackReference: string;
  isActive: boolean;
}

export function getVerifiedSubscriptions(): VerifiedSubscriptionRecord[] {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return [];
    const stored = localStorage.getItem(STORAGE_KEY_VERIFIED_SUBSCRIPTIONS);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

/**
 * Activate or Renew Paid Verified Seller Badge (100 GHS/month) via Paystack
 */
export function subscribeSellerVerified(payload: {
  userId: string;
  sellerName: string;
  paymentMethod?: string;
  paystackReference?: string;
  amount?: number;
}): VerifiedSubscriptionRecord {
  const amount = payload.amount || 100;
  const now = new Date();
  const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days active
  const reference = payload.paystackReference || `PSTK_VER_${Date.now()}_${Math.floor(Math.random() * 8999 + 1000)}`;

  const record: VerifiedSubscriptionRecord = {
    userId: payload.userId,
    sellerName: payload.sellerName,
    amount,
    billingCycle: 'monthly',
    subscribedAt: now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    expiresAt: expires.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    paymentMethod: payload.paymentMethod || 'Paystack Ghana (MoMo & Card)',
    paystackReference: reference,
    isActive: true,
  };

  const all = getVerifiedSubscriptions().filter((s) => s.userId !== payload.userId);
  all.unshift(record);

  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(STORAGE_KEY_VERIFIED_SUBSCRIPTIONS, JSON.stringify(all));
    }
  } catch (e) {
    console.error('Failed to save subscription record', e);
  }

  // 1. Update user profile
  updateUserProfile(payload.userId, {
    isVerified: true,
    isSubscribedVerified: true,
    subscriptionPlan: `Verified Pro Seller (${amount} GHS/month)`,
    verifiedAmount: amount,
    verifiedExpiresAt: record.expiresAt,
  });

  // 2. Mark all listings belonging to this seller as Verified
  try {
    const listings = getStoredListings();
    listings.forEach((listing) => {
      if (
        listing.userId === payload.userId ||
        listing.seller.name.toLowerCase().trim() === payload.sellerName.toLowerCase().trim()
      ) {
        updateStoredListing(listing.id, {
          seller: {
            ...listing.seller,
            isVerified: true,
            isSubscribedVerified: true,
            verifiedPlan: `Verified Pro (${amount} GHS/mo)`,
          },
        });
      }
    });
  } catch (e) {
    console.error('Error updating listings for subscribed verified seller', e);
  }

  return record;
}

