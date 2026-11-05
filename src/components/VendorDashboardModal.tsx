import React, { useState, useMemo } from 'react';
import {
  X,
  Store,
  Plus,
  Trash2,
  Edit3,
  Package,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  Flame,
  Search,
  RefreshCw,
  Image as ImageIcon,
  Star,
  ShieldCheck,
  TrendingUp,
  Truck,
} from 'lucide-react';
import { Product, ProductCategory, PRODUCT_CATEGORIES, Vendor } from '../types/store';
import { saveProductToFirestore, deleteProductFromFirestore } from '../utils/firebase';
import { UserProfile } from '../types/marketplace';

interface VendorDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  vendor: Vendor | null;
  products: Product[];
  onProductUpdated: () => void;
}

export const VendorDashboardModal: React.FC<VendorDashboardModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  vendor,
  products,
  onProductUpdated,
}) => {
  const [activeTab, setActiveTab] = useState<'inventory' | 'add_product'>('inventory');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Add/Edit Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState<ProductCategory>('Fire Extinguisher');
  const [imageUrl, setImageUrl] = useState('');
  const [stock, setStock] = useState('10');

  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Vendor's own products only
  const vendorProducts = useMemo(() => {
    if (!currentUser) return [];
    return products.filter(
      (p) =>
        p.vendorId === currentUser.id ||
        (vendor && p.vendorId === vendor.id) ||
        p.vendorName.toLowerCase().includes(currentUser.name.toLowerCase())
    );
  }, [products, currentUser, vendor]);

  if (!isOpen) return null;

  const resetForm = () => {
    setName('');
    setDescription('');
    setPrice('');
    setCategory('Fire Extinguisher');
    setImageUrl('');
    setStock('10');
    setEditingProduct(null);
    setErrorMessage(null);
  };

  const startEditProduct = (p: Product) => {
    setEditingProduct(p);
    setName(p.name);
    setDescription(p.description);
    setPrice(String(p.price));
    setCategory(p.category);
    setImageUrl(p.imageUrl);
    setStock(String(p.stock));
    setActiveTab('add_product');
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!name.trim()) {
      setErrorMessage('Product title is required.');
      return;
    }
    const numPrice = Number(price);
    if (isNaN(numPrice) || numPrice < 0) {
      setErrorMessage('Please enter a valid price in GHS.');
      return;
    }
    const numStock = Number(stock);
    if (isNaN(numStock) || numStock < 0) {
      setErrorMessage('Please enter a valid stock count.');
      return;
    }

    const defaultImages: Record<ProductCategory, string> = {
      'Fire Extinguisher': 'https://images.unsplash.com/photo-1582139329536-e7284fece509?w=600&auto=format&fit=crop&q=80',
      'Smoke Detector': 'https://images.unsplash.com/photo-1558002038-1055907df827?w=600&auto=format&fit=crop&q=80',
      'Fire Blanket': 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600&auto=format&fit=crop&q=80',
      'Alarm': 'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f7?w=600&auto=format&fit=crop&q=80',
      'Hose': 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=600&auto=format&fit=crop&q=80',
    };

    const finalImage = imageUrl.trim() || defaultImages[category];
    const vendorId = currentUser?.id || vendor?.id || 'vnd-custom';
    const vendorName = vendor?.shopName || currentUser?.name || 'Verified OGYA Vendor';

    const productId = editingProduct ? editingProduct.id : `prod-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

    const productData: Product = {
      id: productId,
      name: name.trim(),
      description: description.trim(),
      price: numPrice,
      category,
      imageUrl: finalImage,
      stock: numStock,
      vendorId,
      vendorName,
    };

    setIsSaving(true);
    try {
      await saveProductToFirestore(productData);
      setSuccessMessage(
        editingProduct ? 'Product updated in Firestore!' : 'New product published to Firestore store!'
      );
      resetForm();
      setActiveTab('inventory');
      onProductUpdated();
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to save product.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!window.confirm('Are you sure you want to delete this fire safety product?')) return;
    try {
      await deleteProductFromFirestore(productId);
      onProductUpdated();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-6 animate-in zoom-in-95 duration-200 flex flex-col max-h-[88vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-[#00875A] via-emerald-700 to-[#FF6600] text-white flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            {/* Vendor Logo */}
            <div className="w-14 h-14 rounded-2xl overflow-hidden ring-2 ring-white/30 bg-white/20 backdrop-blur-md shrink-0 shadow-md">
              <img
                src={vendor?.logoUrl || '/src/assets/images/vendor_store_showcase_1793870144741.jpg'}
                alt={vendor?.shopName || 'Vendor'}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg sm:text-xl font-black tracking-tight leading-tight">
                  {vendor?.shopName || currentUser?.businessName || 'OGYA Verified Vendor'}
                </h3>
                {/* Verified badge */}
                <span className="px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-black uppercase flex items-center gap-1">
                  <ShieldCheck size={12} className="text-amber-300" />
                  <span>🇬🇭 Verified Vendor</span>
                </span>
              </div>

              {/* Ratings Stars */}
              <div className="flex items-center gap-1.5 text-xs text-white/95 mt-0.5">
                <div className="flex items-center text-amber-300">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={13} fill="currentColor" strokeWidth={0} />
                  ))}
                </div>
                <span className="font-black text-sm">4.9</span>
                <span className="text-white/80">(148 reviews)</span>
                <span className="text-white/50">·</span>
                <span className="text-white/90 font-bold flex items-center gap-1">
                  <Truck size={12} />
                  <span>1–2 hr Accra Courier</span>
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-white/80 hover:text-white hover:bg-black/20 rounded-full transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Quick Big Stats Cards Banner in ₵ */}
        <div className="grid grid-cols-3 gap-3 p-4 bg-slate-50 dark:bg-slate-850 border-b border-slate-200 dark:border-slate-800">
          <div className="p-3 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xs">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
              Total Sales
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-xs font-black text-[#00875A]">₵</span>
              <span className="text-sm sm:text-base font-black text-slate-900 dark:text-white tabular-nums">
                38,450.00
              </span>
            </div>
            <span className="text-[10px] text-emerald-600 font-bold block mt-0.5">
              +18.4% this week
            </span>
          </div>

          <div className="p-3 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xs">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
              Total Orders
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-sm sm:text-base font-black text-slate-900 dark:text-white tabular-nums">
                54
              </span>
              <span className="text-[10px] text-slate-400 font-bold">Orders</span>
            </div>
            <span className="text-[10px] text-slate-500 font-medium block mt-0.5">
              39 Delivered
            </span>
          </div>

          <div className="p-3 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xs">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
              Inventory
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-sm sm:text-base font-black text-slate-900 dark:text-white tabular-nums">
                {vendorProducts.length}
              </span>
              <span className="text-[10px] text-slate-400 font-bold">Products</span>
            </div>
            <span className="text-[10px] text-emerald-600 font-bold block mt-0.5">
              Live in Firestore
            </span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 px-6 pt-3 bg-slate-50 dark:bg-slate-850">
          <button
            type="button"
            onClick={() => {
              setActiveTab('inventory');
              setEditingProduct(null);
            }}
            className={`pb-3 px-4 text-xs font-black border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'inventory'
                ? 'border-red-600 text-red-600 dark:text-red-400'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Package size={15} />
            <span>My Inventory ({vendorProducts.length})</span>
          </button>

          <button
            type="button"
            onClick={() => {
              resetForm();
              setActiveTab('add_product');
            }}
            className={`pb-3 px-4 text-xs font-black border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'add_product'
                ? 'border-red-600 text-red-600 dark:text-red-400'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Plus size={15} />
            <span>{editingProduct ? 'Edit Product' : 'Add New Product'}</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 flex-1 overflow-y-auto">
          {successMessage && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle size={16} className="text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {activeTab === 'inventory' ? (
            /* =================== INVENTORY VIEW =================== */
            <div className="space-y-4">
              {vendorProducts.length === 0 ? (
                <div className="text-center py-12 px-4 space-y-3">
                  <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                    <Package size={28} />
                  </div>
                  <h4 className="text-base font-black text-slate-900 dark:text-white">
                    No products added yet
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                    Add your first fire safety product to the OGYA store. Set your price in GHS, upload photos, and start receiving MoMo orders.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      resetForm();
                      setActiveTab('add_product');
                    }}
                    className="mt-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer transition-all inline-flex items-center gap-2"
                  >
                    <Plus size={15} />
                    <span>Add Fire Safety Product</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {vendorProducts.map((p) => (
                    <div
                      key={p.id}
                      className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-750 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3.5">
                        <img
                          src={p.imageUrl}
                          alt={p.name}
                          className="w-16 h-16 rounded-xl object-cover bg-slate-200 dark:bg-slate-700 shrink-0"
                        />
                        <div>
                          <span className="text-[10px] font-black uppercase text-red-600 dark:text-red-400 tracking-wider">
                            {p.category}
                          </span>
                          <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white leading-snug">
                            {p.name}
                          </h4>
                          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-3">
                            <span className="font-black text-slate-900 dark:text-white flex items-baseline gap-0.5">
                              <span className="text-[#00875A]">₵</span>
                              <span>{p.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                            </span>
                            <span>·</span>
                            <span
                              className={`font-bold ${
                                p.stock > 0 ? 'text-emerald-600' : 'text-rose-600'
                              }`}
                            >
                              {p.stock} in stock
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Action buttons (Edit & Delete only vendor's own products) */}
                      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                        <button
                          type="button"
                          onClick={() => startEditProduct(p)}
                          className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                        >
                          <Edit3 size={13} />
                          <span>Edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteProduct(p.id)}
                          className="px-3 py-1.5 rounded-xl border border-rose-200 dark:border-rose-900/60 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                        >
                          <Trash2 size={13} />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* =================== ADD / EDIT PRODUCT FORM =================== */
            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-black uppercase tracking-wider text-slate-500">
                  {editingProduct ? 'Editing Product in Firestore' : 'Create New Fire Safety Product'}
                </span>
                {editingProduct && (
                  <button
                    type="button"
                    onClick={() => {
                      resetForm();
                      setActiveTab('inventory');
                    }}
                    className="text-xs text-slate-500 hover:underline cursor-pointer"
                  >
                    Cancel Edit
                  </button>
                )}
              </div>

              {/* Product Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Product Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. 6KG ABC Dry Powder Extinguisher (GNFS Approved)"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-red-500"
                />
              </div>

              {/* Category & Price (GHS) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Category (Certified Fire Gear) *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ProductCategory)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-red-500"
                  >
                    {PRODUCT_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Price in Ghana Cedis (GH₵) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="e.g. 450.00"
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-red-500 font-mono"
                  />
                </div>
              </div>

              {/* Stock & Image URL */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Available Stock Count *
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    placeholder="e.g. 25"
                    className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-red-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Product Image URL (Optional)
                  </label>
                  <div className="relative">
                    <ImageIcon size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="url"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-red-500"
                    />
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Product Specifications & Usage Guide
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe certification, discharge duration, suitable fire classes (A, B, C), and mounting specifications..."
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-red-500"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSaving}
                className="w-full py-4 px-4 bg-gradient-to-r from-red-600 via-orange-600 to-amber-500 hover:opacity-95 text-white font-black text-sm rounded-xl shadow-lg shadow-red-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.99] disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" />
                    <span>Saving to Firestore 'products'...</span>
                  </>
                ) : (
                  <>
                    <Plus size={16} />
                    <span>{editingProduct ? 'Update Product in Firestore' : 'Save & Publish Product to Store'}</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
