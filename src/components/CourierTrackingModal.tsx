import React, { useState } from 'react';
import {
  X,
  Truck,
  MapPin,
  ShieldCheck,
  Lock,
  Phone,
  Copy,
  Check,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  User,
  ShieldAlert,
  ChevronRight,
  ExternalLink,
  Package,
  Navigation,
} from 'lucide-react';
import { CourierOrder, CourierOrderStatus } from '../types/courier';
import { advanceCourierOrderStatus } from '../utils/courierStorage';
import { formatPrice } from '../utils/storage';
import { CourierLiveLocationTracker } from './CourierLiveLocationTracker';

interface CourierTrackingModalProps {
  order: CourierOrder | null;
  isOpen: boolean;
  onClose: () => void;
  onOrderUpdated?: (order: CourierOrder) => void;
}

export const CourierTrackingModal: React.FC<CourierTrackingModalProps> = ({
  order,
  isOpen,
  onClose,
  onOrderUpdated,
}) => {
  const [copiedOtp, setCopiedOtp] = useState(false);
  const [copiedWaybill, setCopiedWaybill] = useState(false);
  const [isAdvancing, setIsAdvancing] = useState(false);
  const [trackerTab, setTrackerTab] = useState<'map' | 'timeline' | 'receipt'>('map');

  if (!isOpen || !order) return null;

  const handleCopyOtp = () => {
    navigator.clipboard.writeText(order.securityOtp);
    setCopiedOtp(true);
    setTimeout(() => setCopiedOtp(false), 2500);
  };

  const handleCopyWaybill = () => {
    navigator.clipboard.writeText(order.waybillNumber);
    setCopiedWaybill(true);
    setTimeout(() => setCopiedWaybill(false), 2500);
  };

  const handleSimulateNextStep = () => {
    setIsAdvancing(true);
    setTimeout(() => {
      const updated = advanceCourierOrderStatus(order.id);
      if (updated && onOrderUpdated) {
        onOrderUpdated(updated);
      }
      setIsAdvancing(false);
    }, 600);
  };

  const isDelivered = order.status === 'delivered';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 md:p-6 animate-in fade-in duration-200">
      <div
        className="relative bg-white dark:bg-slate-900 rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto max-h-[92vh] flex flex-col text-slate-900 dark:text-slate-100 transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950 text-white flex items-center justify-between shrink-0 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-slate-950 shadow-sm shrink-0 font-black">
              <Truck size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded">
                  Live Dispatch Tracking
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  Waybill: {order.waybillNumber}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black tracking-tight text-white mt-0.5">
                {order.itemTitle}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyWaybill}
              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 font-mono flex items-center gap-1 transition-colors cursor-pointer"
              title="Copy Waybill Number"
            >
              {copiedWaybill ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
              <span className="hidden sm:inline">{copiedWaybill ? 'Copied' : 'Copy Waybill'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Secret Security OTP Banner (Strict Safety Highlight) */}
        <div className="bg-gradient-to-r from-red-600 via-amber-600 to-orange-500 text-white p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-inner">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0 border border-white/30">
              <Lock size={22} className="text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-black uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded text-white">
                  Strict Security Handover OTP
                </span>
                {isDelivered && (
                  <span className="text-[10px] font-bold bg-emerald-500 text-slate-950 px-2 py-0.5 rounded">
                    Verified & Delivered
                  </span>
                )}
              </div>
              <p className="text-xs text-white/90 mt-1 leading-relaxed max-w-md">
                <strong>STRICT SAFETY RULE:</strong> Do <strong>NOT</strong> share this 4-digit code over the phone or WhatsApp. Only disclose this OTP to the dispatch rider when you are physically inspecting the package at your door.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-slate-950/80 px-4 py-2.5 rounded-xl border border-white/20 backdrop-blur-xs shrink-0">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-mono block">Your Delivery OTP</span>
              <span className="text-2xl font-black font-mono tracking-widest text-amber-400 tabular-nums">
                {order.securityOtp}
              </span>
            </div>
            <button
              onClick={handleCopyOtp}
              className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer ml-2"
              title="Copy OTP"
            >
              {copiedOtp ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
            </button>
          </div>
        </div>

        {/* Tab Navigation for Location Tracker vs Timeline vs Receipt */}
        <div className="px-6 bg-slate-100 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 flex items-center gap-6 text-xs font-bold text-slate-500 dark:text-slate-400 shrink-0">
          <button
            type="button"
            onClick={() => setTrackerTab('map')}
            className={`py-3 transition-colors cursor-pointer border-b-2 flex items-center gap-1.5 ${
              trackerTab === 'map'
                ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                : 'border-transparent hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Navigation size={14} />
            <span>Live GPS Location Tracker & Radar</span>
          </button>

          <button
            type="button"
            onClick={() => setTrackerTab('timeline')}
            className={`py-3 transition-colors cursor-pointer border-b-2 flex items-center gap-1.5 ${
              trackerTab === 'timeline'
                ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                : 'border-transparent hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Clock size={14} />
            <span>Milestone Checkpoints ({order.trackingEvents.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setTrackerTab('receipt')}
            className={`py-3 transition-colors cursor-pointer border-b-2 flex items-center gap-1.5 ${
              trackerTab === 'receipt'
                ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                : 'border-transparent hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Package size={14} />
            <span>Waybill & Escrow Receipt</span>
          </button>
        </div>

        {/* Scrollable Tracking Body */}
        <div className="overflow-y-auto p-5 sm:p-6 lg:p-8 space-y-6 flex-1 text-xs sm:text-sm">
          {/* TAB 1: Real-Time Interactive Live Location Tracker */}
          {trackerTab === 'map' && (
            <div className="space-y-6">
              <CourierLiveLocationTracker
                order={order}
                onAdvanceMilestone={handleSimulateNextStep}
              />
            </div>
          )}

          {/* TAB 2 & shared summary: Highway Corridor Overview */}
          {(trackerTab === 'timeline' || trackerTab === 'receipt') && (
            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-xs shrink-0">
                  A
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Pickup Origin</span>
                  <span className="font-extrabold text-slate-900 dark:text-white">
                    {order.sender.cityOrArea}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 block">
                    {order.sender.region} Region {order.sender.ghanaPostGps ? `(${order.sender.ghanaPostGps})` : ''}
                  </span>
                </div>
              </div>

              <div className="flex flex-col items-center justify-center px-4 w-full sm:w-auto text-slate-400">
                <span className="text-[10px] font-mono text-amber-600 dark:text-amber-400 font-bold">
                  {order.distanceKmEstimated} km
                </span>
                <div className="flex items-center gap-1.5 my-1 w-full max-w-[120px]">
                  <div className="h-0.5 bg-amber-500/40 flex-1" />
                  <Truck size={14} className="text-amber-500 shrink-0" />
                  <div className="h-0.5 bg-amber-500/40 flex-1" />
                </div>
                <span className="text-[10px] capitalize font-medium">{order.deliverySpeed.replace('-', ' ')}</span>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto justify-start sm:justify-end">
                <div className="text-left sm:text-right">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Drop-off Destination</span>
                  <span className="font-extrabold text-slate-900 dark:text-white">
                    {order.recipient.cityOrArea}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 block">
                    {order.recipient.region} Region {order.recipient.ghanaPostGps ? `(${order.recipient.ghanaPostGps})` : ''}
                  </span>
                </div>
                <div className="w-8 h-8 rounded-full bg-red-500/20 text-red-600 dark:text-red-400 flex items-center justify-center font-bold text-xs shrink-0">
                  B
                </div>
              </div>
            </div>
          )}

          {/* Assigned Rider Verification Card (Always accessible) */}
          {order.rider && (
            <div className="p-4.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <User size={14} className="text-amber-500" />
                  <span>Assigned Verified Courier Rider</span>
                </span>
                <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800/60 flex items-center gap-1">
                  <ShieldCheck size={12} />
                  <span>{order.rider.verificationBadge}</span>
                </span>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center text-white font-black text-base shadow-sm shrink-0">
                    {order.rider.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-900 dark:text-white text-sm sm:text-base">
                      {order.rider.name}
                    </h4>
                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">★ {order.rider.rating}</span>
                      <span>({order.rider.completedDeliveries} completed)</span>
                      <span>·</span>
                      <span className="font-mono text-amber-600 dark:text-amber-400 font-bold">{order.rider.companyBadge}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-left border border-slate-200 dark:border-slate-700 min-w-[130px]">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Vehicle Number Plate</span>
                    <span className="font-mono font-black text-slate-900 dark:text-white text-xs">
                      {order.rider.vehiclePlate}
                    </span>
                  </div>

                  <a
                    href={`tel:${order.rider.phone}`}
                    className="flex-1 sm:flex-none px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                  >
                    <Phone size={14} />
                    <span>Call Rider</span>
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: End-to-End Tracking Timeline */}
          {trackerTab === 'timeline' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm uppercase tracking-wide flex items-center gap-1.5">
                  <Clock size={15} className="text-amber-500" />
                  <span>Pan-Ghana Dispatch Milestone Timeline</span>
                </h3>

                {!isDelivered && (
                  <button
                    onClick={handleSimulateNextStep}
                    disabled={isAdvancing}
                    className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 hover:underline cursor-pointer flex items-center gap-1"
                    title="Simulate advance to next Ghana transit checkpoint"
                  >
                    <span>{isAdvancing ? 'Updating...' : 'Advance Next Milestone →'}</span>
                  </button>
                )}
              </div>

              <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
                {order.trackingEvents.map((evt, idx) => {
                  const isCurrent = evt.status === order.status;
                  const isPast = evt.isCompleted;

                  return (
                    <div key={evt.id || idx} className="relative flex items-start gap-3.5">
                      {/* Dot */}
                      <div
                        className={`absolute -left-6 top-1 w-5 h-5 rounded-full flex items-center justify-center z-10 transition-colors ${
                          isPast
                            ? 'bg-emerald-500 text-white'
                            : isCurrent
                            ? 'bg-amber-500 text-slate-950 ring-4 ring-amber-500/20'
                            : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
                        }`}
                      >
                        {isPast ? (
                          <Check size={12} strokeWidth={3} />
                        ) : (
                          <div className={`w-1.5 h-1.5 rounded-full ${isCurrent ? 'bg-slate-950' : 'bg-slate-400'}`} />
                        )}
                      </div>

                      <div className="space-y-0.5 min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <h4
                            className={`font-bold text-xs sm:text-sm ${
                              isCurrent
                                ? 'text-amber-600 dark:text-amber-400 font-extrabold'
                                : isPast
                                ? 'text-slate-900 dark:text-white'
                                : 'text-slate-400 dark:text-slate-500'
                            }`}
                          >
                            {evt.title}
                          </h4>
                          <span className="text-[11px] font-mono text-slate-400 shrink-0">
                            {evt.timestamp}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                          {evt.description}
                        </p>
                        <div className="flex items-center gap-1 text-[11px] text-slate-400 pt-0.5">
                          <MapPin size={11} className="text-slate-400" />
                          <span>{evt.location}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: Digital Shipping Waybill & Receipt */}
          {trackerTab === 'receipt' && (
            <div className="space-y-4">
              <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4 font-mono text-xs shadow-xs">
                <div className="flex items-start justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                  <div>
                    <span className="text-lg font-black text-slate-950 dark:text-white tracking-tight font-sans">
                      OGYA EXPRESS GHANA
                    </span>
                    <p className="text-[10px] text-slate-400 font-sans">Official Pan-Ghana Doorstep Dispatch Waybill</p>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-amber-600 dark:text-amber-400 text-sm">{order.waybillNumber}</span>
                    <span className="text-[10px] text-slate-400 block">{order.createdAt}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 uppercase font-sans font-bold">Sender / Origin:</span>
                    <div className="font-bold text-slate-900 dark:text-white">{order.sender.name}</div>
                    <div className="text-slate-500">{order.sender.phone}</div>
                    <div className="text-slate-500">{order.sender.cityOrArea}, {order.sender.region}</div>
                    {order.sender.ghanaPostGps && <div className="text-amber-600 dark:text-amber-400">GPS: {order.sender.ghanaPostGps}</div>}
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 uppercase font-sans font-bold">Recipient / Destination:</span>
                    <div className="font-bold text-slate-900 dark:text-white">{order.recipient.name}</div>
                    <div className="text-slate-500">{order.recipient.phone}</div>
                    <div className="text-slate-500">{order.recipient.cityOrArea}, {order.recipient.region}</div>
                    {order.recipient.ghanaPostGps && <div className="text-amber-600 dark:text-amber-400">GPS: {order.recipient.ghanaPostGps}</div>}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Package Description:</span>
                    <span className="font-bold text-slate-900 dark:text-white">{order.itemTitle}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Weight & Category:</span>
                    <span className="text-slate-900 dark:text-white">{order.packageWeightKg} kg ({order.packageType})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Declared Value for Insurance:</span>
                    <span className="text-slate-900 dark:text-white">GH₵ {order.declaredValueGh.toLocaleString('en-US')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Payment Status:</span>
                    <span className="text-emerald-500 font-bold uppercase">{order.paymentMethod.replace(/_/g, ' ')}</span>
                  </div>
                  <div className="flex justify-between text-sm font-black pt-2 border-t border-slate-200 dark:border-slate-800 text-slate-950 dark:text-white">
                    <span>Grand Total:</span>
                    <span className="text-amber-500">GH₵ {order.grandTotal.toFixed(2)}</span>
                  </div>
                </div>

                {/* Barcode Graphic Representation */}
                <div className="pt-2 flex flex-col items-center justify-center space-y-1 text-center">
                  <div className="h-8 w-64 bg-slate-900 dark:bg-slate-100 flex items-center justify-around px-2 rounded">
                    {[...Array(32)].map((_, i) => (
                      <div
                        key={i}
                        className={`h-full ${i % 3 === 0 ? 'w-1 bg-white dark:bg-slate-900' : i % 2 === 0 ? 'w-0.5 bg-white dark:bg-slate-900' : 'w-1.5 bg-transparent'}`}
                      />
                    ))}
                  </div>
                  <span className="text-[10px] tracking-widest text-slate-400">*{order.waybillNumber}*</span>
                </div>
              </div>
            </div>
          )}

          {/* Delivery & Escrow Financial Summary */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 text-xs space-y-2">
            <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
              <span>Delivery Fee (Door-to-door, all 16 regions):</span>
              <span className="font-bold text-slate-900 dark:text-white tabular-nums">
                GH₵ {order.totalDeliveryFee.toFixed(2)}
              </span>
            </div>
            {order.itemEscrowTotal > 0 && (
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                <span>Item Escrow Protection Balance:</span>
                <span className="font-bold text-slate-900 dark:text-white tabular-nums">
                  GH₵ {order.itemEscrowTotal.toLocaleString('en-US')}
                </span>
              </div>
            )}
            <div className="flex items-center justify-between text-slate-900 dark:text-white font-extrabold pt-2 border-t border-slate-200 dark:border-slate-700">
              <span>Grand Total:</span>
              <span className="text-amber-600 dark:text-amber-400 font-black text-sm tabular-nums">
                GH₵ {order.grandTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Strict Security Reminder in Tracking view */}
          <div className="p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-xl flex items-start gap-3 text-red-900 dark:text-red-200 text-xs">
            <ShieldAlert size={18} className="text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block text-red-800 dark:text-red-300 uppercase">
                Doorstep Handover Security Reminder
              </span>
              <p className="mt-0.5 leading-relaxed text-red-700 dark:text-red-300/90 font-medium">
                Verify rider's motorcycle plate <strong>({order.rider?.vehiclePlate})</strong> and OGYA ID Badge. Inspect the parcel contents before reading out the 4-digit OTP <strong>#{order.securityOtp}</strong>.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/80 flex items-center justify-between gap-3 shrink-0">
          <span className="text-xs text-slate-500 font-medium hidden sm:inline">
            Status: <strong className="text-slate-900 dark:text-white capitalize">{order.status.replace(/_/g, ' ')}</strong>
          </span>

          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 dark:hover:bg-slate-600 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer ml-auto"
          >
            Close Tracking
          </button>
        </div>
      </div>
    </div>
  );
};
