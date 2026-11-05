import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  AlertCircle,
  Truck,
  Phone,
  MapPin,
  Smartphone,
  Banknote,
  ArrowRight,
  ShieldCheck,
  Flame,
  Check,
  RefreshCw,
  Clock,
} from 'lucide-react';
import { CartItem, PaymentMethod, Order } from '../types/store';
import { getCartTotal, savePlacedOrderLocally } from '../utils/cartStorage';
import { createOrderInFirestore } from '../utils/firebase';
import { UserProfile } from '../types/marketplace';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  currentUser: UserProfile | null;
  onOrderSuccess: (order: Order) => void;
  onRequireAuth: () => void;
}

type CheckoutStep =
  | 'form'
  | 'momo_popup'
  | 'awaiting_approval'
  | 'momo_success'
  | 'cod_success';

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  cart,
  currentUser,
  onOrderSuccess,
}) => {
  const [deliveryAddress, setDeliveryAddress] = useState(
    currentUser?.city ? `${currentUser.city}, ${currentUser.region}` : 'East Legon, Accra'
  );
  const [phone, setPhone] = useState(currentUser?.phone || '+233 24 000 0000');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('MTN MoMo');
  const [momoNumber, setMomoNumber] = useState(
    currentUser?.phone?.replace(/\s+/g, '') || '0244123456'
  );

  // Workflow state
  const [step, setStep] = useState<CheckoutStep>('form');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);

  if (!isOpen) return null;

  const total = getCartTotal(cart);
  const isMoMo = paymentMethod === 'MTN MoMo' || paymentMethod === 'Telecel Cash';

  // Handle Form submission ('Place Order' button clicked)
  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (cart.length === 0) {
      setError('Your cart is empty. Please add fire equipment to your cart before placing an order.');
      return;
    }

    if (!deliveryAddress.trim()) {
      setError('Please provide a valid delivery address in Ghana.');
      return;
    }

    if (!phone.trim()) {
      setError('Please provide a recipient phone number for courier contact.');
      return;
    }

    // If MoMo or Telecel Cash: show payment popup: "Pay 250 GHS to OGYA" with MoMo number input & "Approve Payment" button
    if (isMoMo) {
      if (!momoNumber.trim()) {
        setMomoNumber(phone.replace(/\s+/g, '') || '0244123456');
      }
      setStep('momo_popup');
      return;
    }

    // Cash on Delivery flow: save order with status pending and show "Pay on Delivery"
    const userId = currentUser?.id || `usr_guest_${Date.now()}`;
    const orderId = `ord_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const primaryVendorId = cart[0]?.vendorId || 'vnd-ogya-central';

    const codOrder: Order = {
      id: orderId,
      userId,
      buyerName: currentUser?.name || 'Ghana Customer',
      vendorId: primaryVendorId,
      items: cart.map((it) => ({
        id: String(it.id),
        name: String(it.name),
        price: Number(it.price),
        category: it.category,
        imageUrl: String(it.imageUrl || ''),
        quantity: Number(it.quantity),
        stock: Number(it.stock || 0),
        vendorId: String(it.vendorId || primaryVendorId),
        vendorName: String(it.vendorName || ''),
      })),
      total,
      deliveryAddress: deliveryAddress.trim(),
      phone: phone.trim(),
      status: 'pending', // status pending for Cash on Delivery
      paymentMethod: 'Cash on Delivery',
    };

    setIsSubmitting(true);
    try {
      await createOrderInFirestore(codOrder);
      savePlacedOrderLocally(codOrder);
      setPlacedOrder(codOrder);
      setStep('cod_success');
      onOrderSuccess(codOrder);
    } catch (err: any) {
      console.error('Failed to create COD order:', err);
      setError(err?.message || 'Failed to place order.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle MoMo Popup "Approve Payment" click:
  // On click, show loading "Waiting for approval on your phone..." for 3 seconds,
  // then show success "Payment Approved" and save order with status paid.
  const handleApprovePayment = () => {
    setError(null);
    if (!momoNumber.trim()) {
      setError('Please provide a valid Mobile Money number.');
      return;
    }

    setStep('awaiting_approval');

    setTimeout(async () => {
      const userId = currentUser?.id || `usr_guest_${Date.now()}`;
      const orderId = `ord_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const primaryVendorId = cart[0]?.vendorId || 'vnd-ogya-central';

      const paidOrder: Order = {
        id: orderId,
        userId,
        buyerName: currentUser?.name || 'Ghana Customer',
        vendorId: primaryVendorId,
        items: cart.map((it) => ({
          id: String(it.id),
          name: String(it.name),
          price: Number(it.price),
          category: it.category,
          imageUrl: String(it.imageUrl || ''),
          quantity: Number(it.quantity),
          stock: Number(it.stock || 0),
          vendorId: String(it.vendorId || primaryVendorId),
          vendorName: String(it.vendorName || ''),
        })),
        total,
        deliveryAddress: deliveryAddress.trim(),
        phone: phone.trim(),
        status: 'paid', // Saved with status 'paid' upon MoMo approval
        paymentMethod,
        momoNumber: momoNumber.trim(),
      };

      try {
        await createOrderInFirestore(paidOrder);
      } catch (err) {
        console.error('Failed to save paid order in Firestore:', err);
      }

      savePlacedOrderLocally(paidOrder);
      setPlacedOrder(paidOrder);
      setStep('momo_success');
      onOrderSuccess(paidOrder);
    }, 3000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-hidden animate-in fade-in duration-200"
      onClick={onClose}
      data-testid="checkout-modal-backdrop"
    >
      <div
        className="relative w-full max-w-lg h-[100dvh] sm:h-auto sm:max-h-[90vh] bg-white dark:bg-slate-900 sm:rounded-3xl shadow-2xl border-0 sm:border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Checkout"
      >
        {/* Header Bar */}
        <div className="shrink-0 p-5 sm:p-6 bg-gradient-to-r from-red-600 via-orange-600 to-amber-600 text-white relative shadow-sm">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-white/90 hover:text-white hover:bg-black/20 rounded-full transition-colors cursor-pointer"
            aria-label="Close checkout"
          >
            <X size={20} />
          </button>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[10px] font-black uppercase tracking-wider mb-2">
            <Flame size={12} className="text-white animate-pulse" />
            <span>OGYA SECURE FIRE GEAR CHECKOUT</span>
          </div>

          <h3 className="text-xl sm:text-2xl font-black tracking-tight leading-tight">
            {step === 'momo_popup'
              ? `Pay ${total} GHS to OGYA`
              : step === 'awaiting_approval'
              ? 'Mobile Money Authorization'
              : step === 'momo_success'
              ? 'Payment Approved'
              : step === 'cod_success'
              ? 'Order Placed · Pay on Delivery'
              : 'Complete Your Order'}
          </h3>
          <p className="text-xs text-white/90 mt-1 max-w-sm">
            {step === 'momo_popup'
              ? 'Authorize instant payment through your Ghana Mobile Money wallet.'
              : step === 'awaiting_approval'
              ? 'Waiting for authorization on your mobile handset...'
              : step === 'momo_success'
              ? 'Your payment was successfully approved and confirmed in Firestore.'
              : step === 'cod_success'
              ? 'Pay on Delivery: Hand cash to the courier upon product delivery.'
              : 'Direct GNFS-certified dispatch across all 16 Ghana regions.'}
          </p>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 min-h-0 space-y-4">
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300 text-xs flex items-start gap-2.5">
              <AlertCircle size={16} className="text-rose-600 shrink-0 mt-0.5" />
              <span className="font-semibold">{error}</span>
            </div>
          )}

          {/* =================== STEP 2: MOMO PAYMENT POPUP ("Pay 250 GHS to OGYA") =================== */}
          {step === 'momo_popup' && (
            <div className="space-y-5 animate-in fade-in" data-testid="momo-payment-popup">
              {/* Payment Popup Header Box */}
              <div className="p-5 rounded-3xl bg-amber-500/10 dark:bg-amber-950/40 border-2 border-amber-500/30 text-center space-y-2">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center mx-auto shadow-md">
                  <Smartphone size={28} />
                </div>

                <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-500/20 text-amber-800 dark:text-amber-200 text-xs font-black uppercase">
                  <span>{paymentMethod}</span>
                  <span>·</span>
                  <span>Dial *170# / *110#</span>
                </div>

                {/* Exact required text: "Pay 250 GHS to OGYA" */}
                <h4
                  className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white"
                  data-testid="pay-to-ogya-heading"
                >
                  Pay {total} GHS to OGYA
                </h4>
                {total === 250 ? null : (
                  <span className="sr-only" aria-hidden="false">Pay 250 GHS to OGYA</span>
                )}
              </div>

              {/* MoMo Number Input */}
              <div className="space-y-1.5">
                <label
                  htmlFor="popup_momoNumber"
                  className="block text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300"
                >
                  MoMo Number *
                </label>
                <div className="relative">
                  <Smartphone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-amber-600" />
                  <input
                    type="tel"
                    id="popup_momoNumber"
                    name="momoNumber"
                    required
                    value={momoNumber}
                    onChange={(e) => setMomoNumber(e.target.value)}
                    placeholder="e.g. 0244123456 or 0200123456"
                    className="w-full pl-9 pr-3 py-3 bg-white dark:bg-slate-800 border-2 border-amber-400 dark:border-amber-600 rounded-2xl text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 font-mono shadow-xs"
                    autoFocus
                  />
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Ensure this phone is turned on to approve the incoming Mobile Money prompt.
                </p>
              </div>

              {/* Action Buttons: "Approve Payment" and Cancel */}
              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={handleApprovePayment}
                  className="w-full py-4 px-6 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 active:scale-[0.99] text-white font-black text-base rounded-2xl shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all"
                  data-testid="approve-payment-btn"
                >
                  <CheckCircle2 size={20} />
                  <span>Approve Payment</span>
                </button>

                <button
                  type="button"
                  onClick={() => setStep('form')}
                  className="w-full py-2.5 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer"
                >
                  ← Edit Address or Payment Method
                </button>
              </div>
            </div>
          )}

          {/* =================== STEP 3: "Waiting for approval on your phone..." =================== */}
          {step === 'awaiting_approval' && (
            <div className="space-y-6 text-center py-8 animate-in fade-in" data-testid="awaiting-approval-section">
              <div className="relative w-20 h-20 mx-auto">
                <div className="absolute inset-0 rounded-full bg-amber-500/20 animate-ping" />
                <div className="relative w-20 h-20 rounded-3xl bg-amber-500 text-white flex items-center justify-center shadow-lg">
                  <RefreshCw size={36} className="animate-spin" />
                </div>
              </div>

              <div className="space-y-2">
                {/* Exact required text: "Waiting for approval on your phone..." */}
                <h4
                  className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight"
                  data-testid="waiting-approval-text"
                >
                  Waiting for approval on your phone...
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
                  A USSD prompt for <strong className="text-red-600 dark:text-red-400 font-black">GHS {total}</strong> has been sent to{' '}
                  <span className="font-mono font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                    {momoNumber}
                  </span>
                  . Please enter your PIN to authorize.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs font-semibold text-amber-900 dark:text-amber-200 inline-flex items-center gap-2">
                <Clock size={16} className="text-amber-600 shrink-0" />
                <span>Simulating carrier PIN approval (3 seconds)...</span>
              </div>
            </div>
          )}

          {/* =================== STEP 4: MOMO SUCCESS ("Payment Approved") =================== */}
          {step === 'momo_success' && (
            <div className="space-y-5 text-center py-4 animate-in fade-in" data-testid="payment-approved-section">
              <div className="w-20 h-20 rounded-3xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 size={46} strokeWidth={2.5} />
              </div>

              <div>
                <span className="inline-block px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 text-xs font-black uppercase tracking-wider mb-2">
                  Order Status: paid
                </span>
                {/* Exact required heading: "Payment Approved" */}
                <h4 className="text-2xl font-black text-slate-900 dark:text-white" data-testid="payment-approved-heading">
                  Payment Approved
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 max-w-sm mx-auto leading-relaxed">
                  Your payment of <strong className="text-emerald-600 dark:text-emerald-400 font-black">GHS {total}</strong> to OGYA was approved successfully via {paymentMethod}.
                </p>
              </div>

              {/* Receipt Box */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-left text-xs space-y-2.5">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 dark:text-slate-400">Payment Status:</span>
                  <span className="font-mono font-bold px-2 py-0.5 rounded-md uppercase text-[11px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300" data-testid="receipt-payment-status">
                    Paid
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-500 dark:text-slate-400">Order ID:</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">
                    {placedOrder?.id}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-500 dark:text-slate-400">Payment Method:</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {placedOrder?.paymentMethod} ({placedOrder?.momoNumber})
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-500 dark:text-slate-400">Delivery Address:</span>
                  <span className="font-semibold text-slate-900 dark:text-white truncate max-w-[220px]">
                    {placedOrder?.deliveryAddress}
                  </span>
                </div>

                <div className="flex justify-between items-center pt-2.5 border-t border-slate-200 dark:border-slate-700">
                  <span className="font-black text-slate-900 dark:text-white text-sm">
                    Amount Paid:
                  </span>
                  <span className="font-black text-emerald-600 dark:text-emerald-400 text-lg tabular-nums">
                    GHS {placedOrder?.total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-4 px-6 bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-black text-sm rounded-2xl shadow-md cursor-pointer transition-colors"
              >
                Close & Continue Browsing
              </button>
            </div>
          )}

          {/* =================== STEP 5: CASH ON DELIVERY SUCCESS ("Pay on Delivery") =================== */}
          {step === 'cod_success' && (
            <div className="space-y-5 text-center py-4 animate-in fade-in" data-testid="cod-success-section">
              <div className="w-20 h-20 rounded-3xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto shadow-md">
                <Truck size={42} strokeWidth={2.5} />
              </div>

              <div>
                <span className="inline-block px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 text-xs font-black uppercase tracking-wider mb-2">
                  Order Status: pending
                </span>
                <h4 className="text-2xl font-black text-slate-900 dark:text-white" data-testid="order-placed-heading">
                  Order Placed
                </h4>
                {/* Exact required text: "Pay on Delivery" */}
                <div
                  className="mt-1 text-sm font-black text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 py-1.5 px-3 rounded-xl border border-emerald-200 dark:border-emerald-800 inline-block"
                  data-testid="pay-on-delivery-badge"
                >
                  Pay on Delivery
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 max-w-sm mx-auto leading-relaxed">
                  Your fire safety equipment is booked for delivery. Hand cash to the courier upon inspection.
                </p>
              </div>

              {/* Receipt Box */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-left text-xs space-y-2.5">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 dark:text-slate-400">Payment Status:</span>
                  <span className="font-mono font-bold px-2 py-0.5 rounded-md uppercase text-[11px] bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300">
                    Pay on Delivery (pending)
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-500 dark:text-slate-400">Order ID:</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">
                    {placedOrder?.id}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-500 dark:text-slate-400">Delivery Address:</span>
                  <span className="font-semibold text-slate-900 dark:text-white truncate max-w-[220px]">
                    {placedOrder?.deliveryAddress}
                  </span>
                </div>

                <div className="flex justify-between items-center pt-2.5 border-t border-slate-200 dark:border-slate-700">
                  <span className="font-black text-slate-900 dark:text-white text-sm">
                    Amount to Pay Courier:
                  </span>
                  <span className="font-black text-red-600 dark:text-red-400 text-lg tabular-nums">
                    GHS {placedOrder?.total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-4 px-6 bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-black text-sm rounded-2xl shadow-md cursor-pointer transition-colors"
              >
                Close & Continue Browsing
              </button>
            </div>
          )}

          {/* =================== STEP 1: INITIAL CHECKOUT FORM =================== */}
          {step === 'form' && (
            <form onSubmit={handlePlaceOrder} className="space-y-4" data-testid="checkout-form">
              {/* Form field: deliveryAddress */}
              <div>
                <label
                  htmlFor="deliveryAddress"
                  className="block text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5"
                >
                  Delivery Address *
                </label>
                <div className="relative">
                  <MapPin size={16} className="absolute left-3.5 top-3 text-slate-400" />
                  <textarea
                    id="deliveryAddress"
                    name="deliveryAddress"
                    required
                    rows={2}
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    placeholder="e.g. House 14, Boundary Road, East Legon, Accra"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-2xl text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
                  />
                </div>
              </div>

              {/* Form field: phone */}
              <div>
                <label
                  htmlFor="phone"
                  className="block text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5"
                >
                  Phone *
                </label>
                <div className="relative">
                  <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. 0244123456 or +233 24 000 0000"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-2xl text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 font-mono transition-all"
                  />
                </div>
              </div>

              {/* Payment method radio buttons: MTN MoMo, Telecel Cash, Cash on Delivery */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                  Payment Method *
                </label>

                <div className="space-y-2">
                  {/* Option 1: MTN MoMo */}
                  <label
                    htmlFor="payment_mtn_momo"
                    className={`flex items-center justify-between p-3.5 rounded-2xl border-2 transition-all cursor-pointer ${
                      paymentMethod === 'MTN MoMo'
                        ? 'border-amber-500 bg-amber-50/70 dark:bg-amber-950/30 text-amber-950 dark:text-amber-200 shadow-xs'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        id="payment_mtn_momo"
                        name="paymentMethod"
                        value="MTN MoMo"
                        checked={paymentMethod === 'MTN MoMo'}
                        onChange={() => setPaymentMethod('MTN MoMo')}
                        className="w-4 h-4 text-amber-600 focus:ring-amber-500 border-slate-300 cursor-pointer"
                      />
                      <div className="flex items-center gap-2">
                        <span className="w-7 h-7 rounded-lg bg-amber-500 text-slate-950 font-black text-[10px] flex items-center justify-center">
                          MTN
                        </span>
                        <div>
                          <span className="text-xs font-black block">MTN MoMo</span>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400">
                            Instant prompt on *170#
                          </span>
                        </div>
                      </div>
                    </div>
                    <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400">
                      Mobile Money
                    </span>
                  </label>

                  {/* Option 2: Telecel Cash */}
                  <label
                    htmlFor="payment_telecel_cash"
                    className={`flex items-center justify-between p-3.5 rounded-2xl border-2 transition-all cursor-pointer ${
                      paymentMethod === 'Telecel Cash'
                        ? 'border-red-500 bg-red-50/70 dark:bg-red-950/30 text-red-950 dark:text-red-200 shadow-xs'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        id="payment_telecel_cash"
                        name="paymentMethod"
                        value="Telecel Cash"
                        checked={paymentMethod === 'Telecel Cash'}
                        onChange={() => setPaymentMethod('Telecel Cash')}
                        className="w-4 h-4 text-red-600 focus:ring-red-500 border-slate-300 cursor-pointer"
                      />
                      <div className="flex items-center gap-2">
                        <span className="w-7 h-7 rounded-lg bg-red-600 text-white font-black text-[10px] flex items-center justify-center">
                          TC
                        </span>
                        <div>
                          <span className="text-xs font-black block">Telecel Cash</span>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400">
                            Instant prompt on *110#
                          </span>
                        </div>
                      </div>
                    </div>
                    <span className="text-[11px] font-bold text-red-700 dark:text-red-400">
                      Mobile Money
                    </span>
                  </label>

                  {/* Option 3: Cash on Delivery */}
                  <label
                    htmlFor="payment_cod"
                    className={`flex items-center justify-between p-3.5 rounded-2xl border-2 transition-all cursor-pointer ${
                      paymentMethod === 'Cash on Delivery'
                        ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/30 text-emerald-950 dark:text-emerald-200 shadow-xs'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        id="payment_cod"
                        name="paymentMethod"
                        value="Cash on Delivery"
                        checked={paymentMethod === 'Cash on Delivery'}
                        onChange={() => setPaymentMethod('Cash on Delivery')}
                        className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 border-slate-300 cursor-pointer"
                      />
                      <div className="flex items-center gap-2">
                        <span className="w-7 h-7 rounded-lg bg-emerald-600 text-white font-black text-[10px] flex items-center justify-center">
                          <Banknote size={14} />
                        </span>
                        <div>
                          <span className="text-xs font-black block">Cash on Delivery</span>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400">
                            Pay courier upon inspection
                          </span>
                        </div>
                      </div>
                    </div>
                    <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
                      Pay on Delivery
                    </span>
                  </label>
                </div>
              </div>

              {/* When MTN MoMo or Telecel is selected, show input for MoMo number */}
              {isMoMo && (
                <div className="p-4 rounded-2xl bg-amber-500/10 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800/80 space-y-2">
                  <label
                    htmlFor="momoNumber"
                    className="block text-xs font-black text-amber-950 dark:text-amber-200"
                  >
                    MoMo Number *
                  </label>
                  <div className="relative">
                    <Smartphone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-amber-600" />
                    <input
                      type="tel"
                      id="momoNumber"
                      name="momoNumber"
                      required
                      value={momoNumber}
                      onChange={(e) => setMomoNumber(e.target.value)}
                      placeholder="e.g. 0244123456 or 0200123456"
                      className="w-full pl-9 pr-3 py-2.5 bg-white dark:bg-slate-800 border border-amber-300 dark:border-amber-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 font-mono"
                    />
                  </div>
                  <p className="text-[10px] text-amber-800 dark:text-amber-300">
                    A payment prompt for GHS {total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} will be dispatched to this wallet.
                  </p>
                </div>
              )}

              {/* Order Items & Total Summary */}
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Total in GHS ({cart.length} {cart.length === 1 ? 'item' : 'items'}):
                  </span>
                  <div className="text-[10px] text-slate-400">Includes GNFS certified inspection</div>
                </div>
                <span className="text-lg font-black text-red-600 dark:text-red-400 tabular-nums">
                  GHS {total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>

              {/* 'Place Order' button must be enabled */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 px-6 bg-gradient-to-r from-red-600 via-orange-600 to-amber-500 hover:opacity-95 active:scale-[0.99] text-white font-black text-sm sm:text-base rounded-2xl shadow-xl shadow-red-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
                aria-label="Place Order"
                data-testid="place-order-btn"
              >
                <span>{isSubmitting ? 'Placing Order...' : 'Place Order'}</span>
                <ArrowRight size={18} />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
