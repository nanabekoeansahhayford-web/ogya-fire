import { CartItem, Product } from '../types/store';

const STORAGE_KEY_CART = 'ogya_fire_cart_items_v1';

export function getCart(): CartItem[] {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return [];
    const raw = localStorage.getItem(STORAGE_KEY_CART);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveCart(items: CartItem[]): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(STORAGE_KEY_CART, JSON.stringify(items));
    }
  } catch (e) {
    console.error('Failed to save cart to localStorage', e);
  }
}

export function addToCart(product: Product, quantity = 1): CartItem[] {
  const current = getCart();
  const existingIndex = current.findIndex((item) => item.id === product.id);

  let updated: CartItem[];
  if (existingIndex > -1) {
    updated = [...current];
    const newQty = updated[existingIndex].quantity + quantity;
    // Cap at available stock
    updated[existingIndex].quantity = Math.min(newQty, product.stock || 999);
  } else {
    const newItem: CartItem = {
      id: product.id,
      name: product.name,
      price: product.price,
      category: product.category,
      imageUrl: product.imageUrl,
      quantity: Math.min(quantity, product.stock || 999),
      stock: product.stock,
      vendorId: product.vendorId,
      vendorName: product.vendorName,
    };
    updated = [newItem, ...current];
  }

  saveCart(updated);
  return updated;
}

export function updateCartQuantity(productId: string, quantity: number): CartItem[] {
  const current = getCart();
  let updated: CartItem[];

  if (quantity <= 0) {
    updated = current.filter((item) => item.id !== productId);
  } else {
    updated = current.map((item) => {
      if (item.id === productId) {
        return { ...item, quantity: Math.min(quantity, item.stock || 999) };
      }
      return item;
    });
  }

  saveCart(updated);
  return updated;
}

export function removeFromCart(productId: string): CartItem[] {
  const current = getCart();
  const updated = current.filter((item) => item.id !== productId);
  saveCart(updated);
  return updated;
}

export function clearCart(): void {
  saveCart([]);
}

export function getCartTotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

export function getCartItemCount(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}

const STORAGE_KEY_PLACED_ORDERS = 'ogya_placed_orders_v1';

export function savePlacedOrderLocally(order: any): void {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return;
    const existing = getLocalPlacedOrders();
    const updated = [order, ...existing.filter((o) => o.id !== order.id)];
    localStorage.setItem(STORAGE_KEY_PLACED_ORDERS, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save order to localStorage', e);
  }
}

export function getLocalPlacedOrders(): any[] {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return [];
    const raw = localStorage.getItem(STORAGE_KEY_PLACED_ORDERS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
