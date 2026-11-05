import { Listing, ChatMessage } from '../types/marketplace';
import { SEED_LISTINGS } from '../data/seedListings';

const STORAGE_KEY_LISTINGS = 'aste_saaa_user_listings';
const STORAGE_KEY_SAVED = 'aste_saaa_saved_ids';
const STORAGE_KEY_CHATS = 'aste_saaa_chat_messages';
const STORAGE_KEY_PRICE_ALERTS = 'ogya_price_alerts';

export const getStoredListings = (): Listing[] => {
  try {
    const custom = localStorage.getItem(STORAGE_KEY_LISTINGS);
    const parsedCustom: Listing[] = custom ? JSON.parse(custom) : [];
    const customIds = new Set(parsedCustom.map((item) => item.id));
    const filteredSeed = SEED_LISTINGS.filter((item) => !customIds.has(item.id));
    const boostedIds = getBoostedListingIds();
    const combined = [...parsedCustom, ...filteredSeed];
    return combined.map((item) => {
      if (boostedIds.includes(item.id)) {
        return { ...item, isPromoted: true };
      }
      return item;
    });
  } catch (e) {
    console.error('Failed to load listings from storage', e);
    return SEED_LISTINGS;
  }
};

export const saveCustomListing = (listing: Listing): void => {
  try {
    const existing = localStorage.getItem(STORAGE_KEY_LISTINGS);
    const current: Listing[] = existing ? JSON.parse(existing) : [];
    localStorage.setItem(STORAGE_KEY_LISTINGS, JSON.stringify([listing, ...current]));
  } catch (e) {
    console.error('Failed to save custom listing', e);
  }
};

export const updateStoredListing = (listingId: string, updates: Partial<Listing>): Listing | null => {
  try {
    const existing = localStorage.getItem(STORAGE_KEY_LISTINGS);
    const current: Listing[] = existing ? JSON.parse(existing) : [];
    const index = current.findIndex((item) => item.id === listingId);
    let updatedListing: Listing | null = null;
    if (index !== -1) {
      current[index] = { ...current[index], ...updates };
      updatedListing = current[index];
      localStorage.setItem(STORAGE_KEY_LISTINGS, JSON.stringify(current));
    } else {
      const seedItem = SEED_LISTINGS.find((item) => item.id === listingId);
      if (seedItem) {
        updatedListing = { ...seedItem, ...updates };
        current.unshift(updatedListing);
        localStorage.setItem(STORAGE_KEY_LISTINGS, JSON.stringify(current));
      }
    }
    return updatedListing;
  } catch (e) {
    console.error('Failed to update stored listing', e);
    return null;
  }
};

export const markListingAsSold = (listingId: string, isSold: boolean = true): Listing | null => {
  return updateStoredListing(listingId, {
    status: isSold ? 'sold' : 'active',
    isSold,
    soldAt: isSold ? new Date().toISOString() : undefined,
  });
};

export const getSavedListingIds = (): string[] => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_SAVED);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

export const toggleSaveListingId = (id: string): string[] => {
  try {
    const current = getSavedListingIds();
    const updated = current.includes(id)
      ? current.filter(item => item !== id)
      : [...current, id];
    localStorage.setItem(STORAGE_KEY_SAVED, JSON.stringify(updated));
    return updated;
  } catch {
    return [];
  }
};

export const getPriceAlertIds = (): string[] => {
  try {
    const alerts = localStorage.getItem(STORAGE_KEY_PRICE_ALERTS);
    return alerts ? JSON.parse(alerts) : [];
  } catch {
    return [];
  }
};

export const togglePriceAlertId = (id: string): { updated: string[]; added: boolean } => {
  try {
    const current = getPriceAlertIds();
    const isPresent = current.includes(id);
    const updated = isPresent
      ? current.filter(item => item !== id)
      : [...current, id];
    localStorage.setItem(STORAGE_KEY_PRICE_ALERTS, JSON.stringify(updated));
    return { updated, added: !isPresent };
  } catch {
    return { updated: [id], added: true };
  }
};

export const getChatMessages = (listingId: string): ChatMessage[] => {
  try {
    const chats = localStorage.getItem(STORAGE_KEY_CHATS);
    const allChats: Record<string, ChatMessage[]> = chats ? JSON.parse(chats) : {};
    return allChats[listingId] || [
      {
        id: 'init-msg-1',
        listingId,
        sender: 'seller',
        text: 'Hello! Thanks for your interest in this listing. Feel free to ask any questions or propose an inspection time.',
        timestamp: 'Today'
      }
    ];
  } catch {
    return [];
  }
};

export const appendChatMessage = (listingId: string, message: ChatMessage): ChatMessage[] => {
  try {
    const chats = localStorage.getItem(STORAGE_KEY_CHATS);
    const allChats: Record<string, ChatMessage[]> = chats ? JSON.parse(chats) : {};
    const existing = allChats[listingId] || [];
    const updated = [...existing, message];
    allChats[listingId] = updated;
    localStorage.setItem(STORAGE_KEY_CHATS, JSON.stringify(allChats));
    return updated;
  } catch {
    return [];
  }
};

export const formatPrice = (amount: number, currency = 'GH₵'): string => {
  const symbol = currency.includes('₵') ? currency : `GH₵`;
  return `${symbol} ${amount.toLocaleString('en-US')}`;
};

export const formatCedi = (amount: number): string => {
  return `₵ ${amount.toLocaleString('en-US')}`;
};

const STORAGE_KEY_BOOSTED = 'ogya_boosted_listings';

export const getBoostedListingIds = (): string[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_BOOSTED);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const markListingAsBoosted = (listingId: string): string[] => {
  try {
    const current = getBoostedListingIds();
    if (!current.includes(listingId)) {
      const updated = [listingId, ...current];
      localStorage.setItem(STORAGE_KEY_BOOSTED, JSON.stringify(updated));
      return updated;
    }
    return current;
  } catch {
    return [listingId];
  }
};

const STORAGE_KEY_REPORTED = 'ogya_reported_listings';

export interface AdReportRecord {
  listingId: string;
  reason: string;
  details?: string;
  reportedAt: string;
  referenceId: string;
}

export const getReportedListingIds = (): string[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_REPORTED);
    const reports: AdReportRecord[] = raw ? JSON.parse(raw) : [];
    return reports.map((r) => r.listingId);
  } catch {
    return [];
  }
};

export const getListingReport = (listingId: string): AdReportRecord | undefined => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_REPORTED);
    const reports: AdReportRecord[] = raw ? JSON.parse(raw) : [];
    return reports.find((r) => r.listingId === listingId);
  } catch {
    return undefined;
  }
};

export const saveListingReport = (report: AdReportRecord): void => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_REPORTED);
    const reports: AdReportRecord[] = raw ? JSON.parse(raw) : [];
    const filtered = reports.filter((r) => r.listingId !== report.listingId);
    localStorage.setItem(STORAGE_KEY_REPORTED, JSON.stringify([report, ...filtered]));
  } catch (e) {
    console.error('Failed to save listing report', e);
  }
};

export const deleteListingReport = (listingId: string): void => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_REPORTED);
    const reports: AdReportRecord[] = raw ? JSON.parse(raw) : [];
    const filtered = reports.filter((r) => r.listingId !== listingId);
    localStorage.setItem(STORAGE_KEY_REPORTED, JSON.stringify(filtered));
  } catch (e) {
    console.error('Failed to delete listing report', e);
  }
};

const STORAGE_KEY_RECENT_SEARCHES = 'ogya_recent_searches';

export const getRecentSearches = (): string[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_RECENT_SEARCHES);
    if (!raw) return [];
    const parsed: string[] = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((q) => typeof q === 'string' && q.trim().length > 0).slice(0, 8)
      : [];
  } catch {
    return [];
  }
};

export const addRecentSearch = (query: string): string[] => {
  const trimmed = query.trim();
  if (!trimmed || trimmed.length < 2) return getRecentSearches();

  try {
    const current = getRecentSearches();
    const filtered = current.filter((item) => item.toLowerCase() !== trimmed.toLowerCase());
    const updated = [trimmed, ...filtered].slice(0, 8);
    localStorage.setItem(STORAGE_KEY_RECENT_SEARCHES, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error('Failed to save recent search', e);
    return [];
  }
};

export const removeRecentSearch = (query: string): string[] => {
  try {
    const current = getRecentSearches();
    const updated = current.filter((item) => item.toLowerCase() !== query.toLowerCase());
    localStorage.setItem(STORAGE_KEY_RECENT_SEARCHES, JSON.stringify(updated));
    return updated;
  } catch {
    return [];
  }
};

export const clearRecentSearches = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY_RECENT_SEARCHES);
  } catch (e) {
    console.error('Failed to clear recent searches', e);
  }
};


