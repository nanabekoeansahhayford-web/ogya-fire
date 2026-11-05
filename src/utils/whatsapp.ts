/**
 * Ghana Phone & WhatsApp link utilities for OGYA Marketplace
 */

export function cleanGhanaPhoneNumber(phone: string): string {
  if (!phone) return '233244891204';
  // Strip all non-digit characters
  const digits = phone.replace(/\D/g, '');

  if (digits.startsWith('233')) {
    return digits;
  }
  if (digits.startsWith('0')) {
    return '233' + digits.slice(1);
  }
  if (digits.length === 9) {
    return '233' + digits;
  }
  return digits || '233244891204';
}

export function formatGhanaDisplayPhone(phone: string): string {
  const clean = cleanGhanaPhoneNumber(phone);
  if (clean.startsWith('233') && clean.length === 12) {
    return `+233 ${clean.slice(3, 5)} ${clean.slice(5, 8)} ${clean.slice(8)}`;
  }
  return phone;
}

export function generateGhanaWhatsAppUrl(
  phone: string,
  listingTitle?: string,
  price?: number,
  sellerName?: string
): string {
  const cleanPhone = cleanGhanaPhoneNumber(phone);
  const greeting = sellerName ? `Hello ${sellerName}` : 'Hello';
  let message = `${greeting}, I am contacting you from OGYA (FIRE) 🔥.`;

  if (listingTitle) {
    message += ` I am interested in your listing: "${listingTitle}"`;
    if (price !== undefined && price !== null) {
      message += ` (GH₵ ${price.toLocaleString('en-US')})`;
    }
    message += `. Is it still available for inspection / purchase?`;
  }

  const encoded = encodeURIComponent(message);
  return `https://wa.me/${cleanPhone}?text=${encoded}`;
}

export function generateGhanaCallUrl(phone: string): string {
  const clean = cleanGhanaPhoneNumber(phone);
  return `tel:+${clean}`;
}

const STORAGE_KEY_WHATSAPP_CLICKS = 'ogya_whatsapp_clicks_registry';

export function getAllWhatsAppClicks(): Record<string, number> {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return {};
    const raw = localStorage.getItem(STORAGE_KEY_WHATSAPP_CLICKS);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function getWhatsAppClickCount(listingId: string): number {
  const all = getAllWhatsAppClicks();
  return all[listingId] || 0;
}

export function recordWhatsAppClick(listingId: string): number {
  try {
    const all = getAllWhatsAppClicks();
    const current = all[listingId] || 0;
    const next = current + 1;
    all[listingId] = next;
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(STORAGE_KEY_WHATSAPP_CLICKS, JSON.stringify(all));
    }
    return next;
  } catch {
    return 1;
  }
}
