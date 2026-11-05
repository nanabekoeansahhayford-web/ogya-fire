import React, { useEffect, useState } from 'react';
import {
  X,
  PackageCheck,
  Clock,
  CheckCircle2,
  AlertCircle,
  Truck,
  Smartphone,
  Banknote,
  Flame,
  ChevronDown,
  ChevronUp,
  RefreshCw,
} from 'lucide-react';
import { Order, OrderStatus } from '../types/store';
import { fetchOrdersByUserId, subscribeToOrdersByUserId, updateOrderStatusInFirestore } from '../utils/firebase';
import { getLocalPlacedOrders } from '../utils/cartStorage';
import { UserProfile } from '../types/marketplace';

interface MyOrdersModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  onOpenStore: () => void;
}

export const MyOrdersModal: React.FC<MyOrdersModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onOpenStore,
}) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [simulatingOrderId, setSimulatingOrderId] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const localOrders: Order[] = getLocalPlacedOrders();

    if (currentUser?.id) {
      // Fetch user's orders from Firestore and merge with local placed orders
      fetchOrdersByUserId(currentUser.id).then((items) => {
        const orderMap = new Map<string, Order>();
        items.forEach((o) => orderMap.set(o.id, o));
        localOrders.forEach((o) => {
          if (!orderMap.has(o.id)) orderMap.set(o.id, o);
        });
        setOrders(Array.from(orderMap.values()));
        setIsLoading(false);
      });

      // Real-time listener
      const unsubscribe = subscribeToOrdersByUserId(currentUser.id, (realtimeOrders) => {
        const orderMap = new Map<string, Order>();
        realtimeOrders.forEach((o) => orderMap.set(o.id, o));
        localOrders.forEach((o) => {
          if (!orderMap.has(o.id)) orderMap.set(o.id, o);
        });
        setOrders(Array.from(orderMap.values()));
        setIsLoading(false);
      });

      return () => {
        unsubscribe();
      };
    } else {
      // Guest orders from local storage
      setOrders(localOrders);
      setIsLoading(false);
    }
  }, [isOpen, currentUser]);

  if (!isOpen) return null;

  const toggleExpand = (orderId: string) => {
    setExpandedOrderId((prev) => (prev === orderId ? null : orderId));
  };

  const handleSimulateMoMoApproval = async (orderId: string) => {
    setSimulatingOrderId(orderId);
    try {
      await updateOrderStatusInFirestore(orderId, 'paid');
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: 'paid' } : o))
      );
    } catch (e) {
      console.error(e);
    } finally {
      setSimulatingOrderId(null);
    }
  };

  // Helper to get formatted payment status text
  const getPaymentStatusText = (order: Order): string => {
    if (order.status === 'paid') return 'Paid';
    if (order.paymentMethod === 'Cash on Delivery') return 'Pay on Delivery';
    if (order.status === 'pending_payment') return 'Pending Payment';
    return order.status;
  };

  const getStatusBadge = (order: Order) => {
    const { status, paymentMethod } = order;

    if (status === 'paid') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
          <CheckCircle2 size={12} />
          <span>Paid</span>
        </span>
      );
    }

    if (paymentMethod === 'Cash on Delivery' || status === 'pending') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
          <Banknote size={12} />
          <span>Pay on Delivery</span>
        </span>
      );
    }

    if (status === 'pending_payment') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
          <Clock size={12} className="animate-spin" />
          <span>Pending Payment</span>
        </span>
      );
    }

    if (status === 'shipped') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-800">
          <Truck size={12} />
          <span>Shipped</span>
        </span>
      );
    }

    if (status === 'delivered') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 border border-purple-300 dark:border-purple-800">
          <PackageCheck size={12} />
          <span>Delivered</span>
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
        <Clock size={12} />
        <span>{status}</span>
      </span>
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-6 animate-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="My Orders"
      >
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-red-600 via-orange-600 to-amber-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
              <PackageCheck size={20} />
            </div>
            <div>
              <h3 className="text-xl font-black tracking-tight leading-tight">
                My Fire Gear Orders
              </h3>
              <p className="text-xs text-white/90">
                Track your equipment deliveries & Mobile Money payments in Ghana
              </p>
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

        {/* Content Body */}
        <div className="p-6 flex-1 overflow-y-auto space-y-4">
          {isLoading ? (
            <div className="py-12 text-center text-slate-500 space-y-2">
              <RefreshCw size={24} className="animate-spin mx-auto text-red-500" />
              <p className="text-xs font-bold">Loading your orders from Firestore...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12 px-4 space-y-3">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                <PackageCheck size={28} />
              </div>
              <h4 className="text-base font-black text-slate-900 dark:text-white">
                No orders found yet
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                You haven't placed any fire safety equipment orders yet. Browse our store to order extinguishers, smoke detectors, and fire blankets with MTN MoMo.
              </p>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenStore();
                }}
                className="mt-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer transition-all"
              >
                Browse Fire Safety Gear
              </button>
            </div>
          ) : (
            orders.map((order) => {
              const isExpanded = expandedOrderId === order.id;
              const isPendingPayment = order.status === 'pending_payment';
              const paymentStatus = getPaymentStatusText(order);

              return (
                <div
                  key={order.id}
                  className="rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 overflow-hidden transition-all shadow-xs"
                >
                  {/* Order Card Header */}
                  <div
                    className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer hover:bg-slate-100/50 dark:hover:bg-slate-800 transition-colors"
                    onClick={() => toggleExpand(order.id)}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-black text-slate-900 dark:text-white">
                          #{order.id.slice(-8).toUpperCase()}
                        </span>
                        {getStatusBadge(order)}
                      </div>

                      {/* Explicit Payment Status */}
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-slate-500 dark:text-slate-400 font-semibold">Payment Status:</span>
                        <span
                          className={`font-black uppercase text-[11px] ${
                            order.status === 'paid'
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-amber-600 dark:text-amber-400'
                          }`}
                          data-testid="order-payment-status"
                        >
                          {paymentStatus}
                        </span>
                      </div>

                      <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2 flex-wrap">
                        <span>{order.paymentMethod}</span>
                        <span>·</span>
                        <span>{order.items?.length || 1} items</span>
                        <span>·</span>
                        <span className="truncate max-w-[150px]">{order.deliveryAddress}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">
                          Total (GHS)
                        </span>
                        <span className="text-base font-black text-red-600 dark:text-red-400">
                          GHS {order.total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className="p-1 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Order Breakdown */}
                  {isExpanded && (
                    <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 space-y-3">
                      <div className="space-y-2">
                        <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                          Purchased Items:
                        </span>
                        {order.items?.map((item, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between text-xs py-1 border-b border-slate-100 dark:border-slate-800 last:border-0"
                          >
                            <div className="flex items-center gap-2 truncate pr-2">
                              {item.imageUrl && (
                                <img
                                  src={item.imageUrl}
                                  alt={item.name}
                                  className="w-8 h-8 rounded-lg object-cover shrink-0"
                                />
                              )}
                              <span className="font-bold text-slate-800 dark:text-slate-200 truncate">
                                {item.name} × {item.quantity}
                              </span>
                            </div>
                            <span className="font-black text-slate-900 dark:text-white shrink-0">
                              GHS {(item.price * item.quantity).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Recipient & MoMo Info with Explicit Payment Status line */}
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs space-y-1.5">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-600 dark:text-slate-400 font-semibold">Payment Status:</span>
                          <span className={`font-black uppercase text-xs ${
                            order.status === 'paid'
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-amber-600 dark:text-amber-400'
                          }`}>
                            {paymentStatus}
                          </span>
                        </div>
                        <div className="flex justify-between text-slate-600 dark:text-slate-400">
                          <span>Payment Method:</span>
                          <span className="font-bold text-slate-900 dark:text-white">
                            {order.paymentMethod}
                          </span>
                        </div>
                        <div className="flex justify-between text-slate-600 dark:text-slate-400">
                          <span>Recipient Phone:</span>
                          <span className="font-bold text-slate-900 dark:text-white font-mono">
                            {order.phone}
                          </span>
                        </div>
                        {order.momoNumber && (
                          <div className="flex justify-between text-slate-600 dark:text-slate-400">
                            <span>MoMo Wallet:</span>
                            <span className="font-bold text-slate-900 dark:text-white font-mono">
                              {order.momoNumber}
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between text-slate-600 dark:text-slate-400">
                          <span>Delivery Address:</span>
                          <span className="font-bold text-slate-900 dark:text-white truncate max-w-[220px]">
                            {order.deliveryAddress}
                          </span>
                        </div>
                      </div>

                      {/* If still pending MoMo payment, offer instant prompt approval */}
                      {isPendingPayment && (
                        <div className="pt-2">
                          <button
                            type="button"
                            disabled={simulatingOrderId === order.id}
                            onClick={() => handleSimulateMoMoApproval(order.id)}
                            className="w-full py-2.5 px-3 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-black text-xs rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all"
                          >
                            {simulatingOrderId === order.id ? (
                              <>
                                <RefreshCw size={14} className="animate-spin" />
                                <span>Approving Payment via USSD...</span>
                              </>
                            ) : (
                              <>
                                <Smartphone size={14} />
                                <span>Approve MoMo USSD Prompt (Mock Approval)</span>
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
