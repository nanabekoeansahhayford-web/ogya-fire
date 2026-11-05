import { initializeApp } from 'firebase/app';
import {
  initializeFirestore,
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
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import { Listing } from '../types/marketplace';
import { Product, Vendor, Order, OrderStatus } from '../types/store';
import { SEED_PRODUCTS } from '../data/seedProducts';

// Initialize Firebase App & Services
const app = initializeApp(firebaseConfig);
export const db = initializeFirestore(app, {
  experimentalAutoDetectLongPolling: true,
}, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

/**
 * Save user profile to Firestore in collection 'users'
 * with doc id = user uid, fields: email, createdAt = serverTimestamp, role = 'customer', displayName = email
 * Uses Firebase Firestore setDoc with merge: true
 */
export async function saveUserProfileToFirestore(
  uid: string,
  email: string
): Promise<{ success: boolean; error?: string }> {
  const path = `users/${uid}`;
  try {
    const cleanEmail = email.trim().toLowerCase();
    const userDocRef = doc(db, 'users', uid);
    await setDoc(
      userDocRef,
      {
        email: cleanEmail,
        createdAt: serverTimestamp(),
        role: 'customer',
        displayName: cleanEmail,
      },
      { merge: true }
    );
    return { success: true };
  } catch (error) {
    console.error(`Failed to save user profile for uid ${uid} to Firestore:`, error);
    try {
      handleFirestoreError(error, OperationType.WRITE, path);
    } catch {
      // logged
    }
    return { success: false, error: String(error) };
  }
}

/**
 * When user logs in, if no doc exists in 'users', create it.
 * Fields: email, createdAt = serverTimestamp, role = 'customer', displayName = email
 * Uses Firebase Firestore setDoc with merge: true
 */
export async function ensureUserDocOnLogin(
  uid: string,
  email: string
): Promise<void> {
  if (!uid || !email) return;
  const path = `users/${uid}`;
  try {
    const cleanEmail = email.trim().toLowerCase();
    const userDocRef = doc(db, 'users', uid);
    const snap = await getDoc(userDocRef);
    if (!snap.exists()) {
      await setDoc(
        userDocRef,
        {
          email: cleanEmail,
          createdAt: serverTimestamp(),
          role: 'customer',
          displayName: cleanEmail,
        },
        { merge: true }
      );
      console.log(`Created user profile document in Firestore users/${uid} on login.`);
    }
  } catch (error) {
    console.warn(`Could not verify or create user doc on login for uid ${uid}:`, error);
  }
}

/**
 * Register user in Firebase Auth
 */
export async function firebaseAuthSignUp(
  email: string,
  password?: string
): Promise<{ uid?: string; user?: any; error?: string }> {
  const cleanEmail = email.trim().toLowerCase();
  if (!password) {
    return { error: 'Password required' };
  }
  try {
    const cred = await createUserWithEmailAndPassword(auth, cleanEmail, password);
    return { uid: cred.user.uid, user: cred.user };
  } catch (err: any) {
    console.warn('Firebase createUserWithEmailAndPassword notice:', err?.code || err?.message);
    return { error: err?.code || err?.message };
  }
}

/**
 * Sign in user with Firebase Auth (non-blocking)
 */
export async function firebaseAuthSignIn(
  email: string,
  password?: string
): Promise<{ uid?: string; user?: any; error?: string }> {
  const cleanEmail = email.trim().toLowerCase();
  if (!password) return { error: 'Password required' };
  try {
    const cred = await signInWithEmailAndPassword(auth, cleanEmail, password);
    return { uid: cred.user.uid, user: cred.user };
  } catch (err: any) {
    return { error: err?.code || err?.message };
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
  error?: string;
}> {
  try {
    const provider = new GoogleAuthProvider();
    const cred = await signInWithPopup(auth, provider);
    return {
      uid: cred.user.uid,
      email: cred.user.email || undefined,
      displayName: cred.user.displayName || undefined,
    };
  } catch (err: any) {
    console.warn('Firebase Google Sign-In notice:', err?.code || err?.message);
    return { error: err?.code || err?.message };
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
      console.warn('Firestore offline: please check your Firebase network connection.');
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
 * Save product listing directly to Firestore
 */
export async function saveListingToFirestore(listing: Listing): Promise<Listing> {
  const path = `listings/${listing.id}`;
  try {
    // Ensure all required fields exist and sanitize undefined values
    const docData: Record<string, any> = {
      id: listing.id,
      title: listing.title,
      categoryId: listing.categoryId,
      categoryName: listing.categoryName,
      subcategory: listing.subcategory,
      price: Number(listing.price),
      currency: listing.currency || 'GHS',
      isNegotiable: Boolean(listing.isNegotiable),
      location: listing.location,
      region: listing.region,
      condition: listing.condition,
      description: listing.description || '',
      images: Array.isArray(listing.images) ? listing.images : [],
      seller: {
        name: listing.seller?.name || 'Seller',
        phone: listing.seller?.phone || '+233 24 000 0000',
        whatsapp: listing.seller?.whatsapp || listing.seller?.phone || '+233 24 000 0000',
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
    };

    if (listing.soldAt) docData.soldAt = listing.soldAt;
    if (listing.userId) docData.userId = listing.userId;
    if (listing.attributes) docData.attributes = listing.attributes;
    if (listing.cvDetails) docData.cvDetails = listing.cvDetails;
    if (listing.jobDetails) docData.jobDetails = listing.jobDetails;

    await setDoc(doc(db, 'listings', listing.id), docData);
    return listing;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    return listing;
  }
}

/**
 * Update a listing status in Firestore (e.g. mark as sold or active)
 */
export async function updateListingStatusInFirestore(
  listingId: string,
  status: 'active' | 'sold',
  isSold: boolean = status === 'sold'
): Promise<boolean> {
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
    await setDoc(docRef, updates, { merge: true });
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
      items.push(d.data() as Listing);
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
          items.push(d.data() as Listing);
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
   PRODUCTS (FIRE SAFETY STORE)
   ========================================================================= */

/**
 * Save or update a product in Firestore collection 'products'
 */
export async function saveProductToFirestore(product: Product): Promise<boolean> {
  const path = `products/${product.id}`;
  try {
    const docRef = doc(db, 'products', product.id);
    const data: Record<string, any> = {
      id: product.id,
      name: product.name.trim(),
      description: product.description || '',
      price: Number(product.price),
      category: product.category,
      imageUrl: product.imageUrl || '',
      stock: Number(product.stock) || 0,
      vendorId: product.vendorId,
      vendorName: product.vendorName,
      createdAt: serverTimestamp(),
    };
    await setDoc(docRef, data, { merge: true });
    return true;
  } catch (error) {
    console.error(`Failed to save product ${product.id} to Firestore:`, error);
    try {
      handleFirestoreError(error, OperationType.WRITE, path);
    } catch {
      // logged
    }
    return false;
  }
}

/**
 * Delete a product from Firestore
 */
export async function deleteProductFromFirestore(productId: string): Promise<boolean> {
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
    return false;
  }
}

/**
 * Fetch all products from Firestore, seeding with initial fire safety equipment if collection is fresh
 */
export async function fetchProductsFromFirestore(): Promise<Product[]> {
  const path = 'products';
  try {
    const snap = await getDocs(collection(db, path));
    if (snap.empty) {
      // Seed default fire safety products in background
      for (const p of SEED_PRODUCTS) {
        saveProductToFirestore(p).catch(() => {});
      }
      return SEED_PRODUCTS;
    }
    const items: Product[] = [];
    snap.forEach((d) => {
      items.push(d.data() as Product);
    });
    return items;
  } catch (error) {
    console.warn('Could not fetch products from Firestore, returning seed products:', error);
    return SEED_PRODUCTS;
  }
}

/**
 * Subscribe to real-time products updates
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
          // If Firestore collection is empty, provide seed products
          onUpdate(SEED_PRODUCTS);
          return;
        }
        const items: Product[] = [];
        snapshot.forEach((d) => {
          items.push(d.data() as Product);
        });
        onUpdate(items);
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
   VENDOR SHOPS & VENDOR ROLE
   ========================================================================= */

/**
 * Save vendor shop in Firestore collection 'vendors'
 */
export async function saveVendorToFirestore(vendor: Vendor): Promise<boolean> {
  const path = `vendors/${vendor.id}`;
  try {
    const docRef = doc(db, 'vendors', vendor.id);
    const data: Record<string, any> = {
      id: vendor.id,
      ownerId: vendor.ownerId,
      shopName: vendor.shopName.trim(),
      phone: vendor.phone.trim(),
      location: vendor.location.trim(),
      description: vendor.description?.trim() || '',
      createdAt: serverTimestamp(),
    };
    await setDoc(docRef, data, { merge: true });
    return true;
  } catch (error) {
    console.error(`Failed to save vendor ${vendor.id}:`, error);
    try {
      handleFirestoreError(error, OperationType.WRITE, path);
    } catch {
      // logged
    }
    return false;
  }
}

/**
 * Update user profile role in collection 'users' to 'vendor'
 */
export async function updateUserRoleToVendor(uid: string): Promise<boolean> {
  const path = `users/${uid}`;
  try {
    const userDocRef = doc(db, 'users', uid);
    await setDoc(userDocRef, { role: 'vendor' }, { merge: true });
    console.log(`Updated user ${uid} role to 'vendor' in Firestore.`);
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
 * Fetch vendor shop by owner uid
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
 * Create order in Firestore collection 'orders'
 * fields: userId, items, total, deliveryAddress, phone, status, paymentMethod, createdAt
 */
export async function createOrderInFirestore(order: Order): Promise<boolean> {
  const path = `orders/${order.id}`;
  try {
    const docRef = doc(db, 'orders', order.id);
    const data: Record<string, any> = {
      id: order.id,
      userId: order.userId,
      items: order.items,
      total: Number(order.total),
      deliveryAddress: order.deliveryAddress.trim(),
      phone: order.phone.trim(),
      status: order.status,
      paymentMethod: order.paymentMethod,
      createdAt: serverTimestamp(),
    };
    if (order.buyerName) {
      data.buyerName = order.buyerName.trim();
    }
    if (order.vendorId) {
      data.vendorId = order.vendorId.trim();
    }
    if (order.momoNumber) {
      data.momoNumber = order.momoNumber.trim();
    }
    await setDoc(docRef, data, { merge: true });
    console.log(`Order ${order.id} created in Firestore successfully.`);
    return true;
  } catch (error) {
    console.error(`Failed to create order ${order.id} in Firestore:`, error);
    try {
      handleFirestoreError(error, OperationType.WRITE, path);
    } catch {
      // logged
    }
    return false;
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
 * Fetch all orders from Firestore, seeding initial orders if empty
 */
export async function fetchAllOrdersFromFirestore(): Promise<Order[]> {
  const path = 'orders';
  try {
    const snap = await getDocs(collection(db, path));
    if (snap.empty) {
      // Seed initial sample vendor orders in background
      for (const order of SEED_ORDERS) {
        createOrderInFirestore(order).catch(() => {});
      }
      return SEED_ORDERS;
    }
    const list: Order[] = [];
    snap.forEach((d) => {
      list.push(d.data() as Order);
    });
    return list;
  } catch (error) {
    console.warn('Could not fetch all orders from Firestore:', error);
    return SEED_ORDERS;
  }
}

/**
 * Subscribe to all orders from Firestore in real-time
 */
export function subscribeToAllOrdersFromFirestore(
  onUpdate: (orders: Order[]) => void
): () => void {
  const path = 'orders';
  try {
    return onSnapshot(
      collection(db, path),
      (snapshot) => {
        if (snapshot.empty) {
          onUpdate(SEED_ORDERS);
          return;
        }
        const list: Order[] = [];
        snapshot.forEach((d) => {
          list.push(d.data() as Order);
        });
        onUpdate(list);
      },
      (error) => {
        console.warn('Firestore all orders listener warning:', error);
      }
    );
  } catch (error) {
    console.warn('Error setting up onSnapshot for all orders:', error);
    return () => {};
  }
}

/**
 * Update order status in Firestore (e.g. pending -> shipped, or shipped -> delivered)
 */
export async function updateOrderStatusInFirestore(
  orderId: string,
  status: OrderStatus
): Promise<boolean> {
  const path = `orders/${orderId}`;
  try {
    const docRef = doc(db, 'orders', orderId);
    await setDoc(docRef, { status, updatedAt: serverTimestamp() }, { merge: true });
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
 * Fetch customer orders by userId from Firestore
 */
export async function fetchOrdersByUserId(userId: string): Promise<Order[]> {
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
 * Subscribe in real-time to orders by userId
 */
export function subscribeToOrdersByUserId(
  userId: string,
  onUpdate: (orders: Order[]) => void
): () => void {
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
