import React, { useState, useMemo } from 'react';
import {
  X,
  Truck,
  ShieldCheck,
  Search,
  Package,
  MapPin,
  Clock,
  ArrowRight,
  Lock,
  Phone,
  AlertTriangle,
  CheckCircle2,
  Plus,
  Eye,
  FileText,
  BadgeAlert,
  Send,
  Calculator,
  Compass,
  Navigation,
  Radar,
  Sparkles,
  ShieldAlert,
  ArrowRightLeft,
  Info,
} from 'lucide-react';
import {
  CourierOrder,
  GhanaRegion,
  PackageType,
  DeliverySpeed,
} from '../types/courier';
import {
  getStoredCourierOrders,
  GHANA_REGIONS_DATA,
  getCourierOrderById,
  calculateEstimatedDistanceKm,
  calculateCourierQuote,
  PACKAGE_TYPE_OPTIONS,
  DELIVERY_SPEED_OPTIONS,
} from '../utils/courierStorage';
import { formatPrice } from '../utils/storage';
import ghanaCourierDeliveryImg from '../assets/images/ghana_courier_delivery_1792921463636.jpg';

interface CourierHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenNewOrder: () => void;
  onOpenTracking: (order: CourierOrder) => void;
  onOpenSafetyGuide: () => void;
}

export const CourierHubModal: React.FC<CourierHubModalProps> = ({
  isOpen,
  onClose,
  onOpenNewOrder,
  onOpenTracking,
  onOpenSafetyGuide,
}) => {
  const [activeTab, setActiveTab] = useState<'deliveries' | 'calculator' | 'regions' | 'security'>('deliveries');
  const [waybillSearch, setWaybillSearch] = useState('');
  const [searchError, setSearchError] = useState<string | null>(null);

  // Rate calculator state
  const [calcFromRegion, setCalcFromRegion] = useState<GhanaRegion>('Greater Accra');
  const [calcToRegion, setCalcToRegion] = useState<GhanaRegion>('Ashanti');
  const [calcPackageType, setCalcPackageType] = useState<PackageType>('small-parcel');
  const [calcWeightKg, setCalcWeightKg] = useState<number>(2.5);
  const [calcSpeed, setCalcSpeed] = useState<DeliverySpeed>('inter-regional');
  const [calcDeclaredValue, setCalcDeclaredValue] = useState<number>(1200);

  if (!isOpen) return null;

  const orders = getStoredCourierOrders();

  const handleSearchWaybill = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchError(null);
    if (!waybillSearch.trim()) return;

    const found = getCourierOrderById(waybillSearch);
    if (found) {
      onOpenTracking(found);
    } else {
      setSearchError(`No shipment found matching waybill "${waybillSearch}". Please check the code and try again.`);
    }
  };

  const activeDeliveries = orders.filter((o) => o.status !== 'delivered' && o.status !== 'cancelled');
  const pastDeliveries = orders.filter((o) => o.status === 'delivered');

  // Calculator quote computation
  const quote = calculateCourierQuote({
    fromRegion: calcFromRegion,
    toRegion: calcToRegion,
    packageType: calcPackageType,
    weightKg: calcWeightKg,
    declaredValueGh: calcDeclaredValue,
    speed: calcSpeed,
  });

  const estimatedRoadDistance = calculateEstimatedDistanceKm(calcFromRegion, calcToRegion);

  const swapRegions = () => {
    const temp = calcFromRegion;
    setCalcFromRegion(calcToRegion);
    setCalcToRegion(temp);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 md:p-6 animate-in fade-in duration-200">
      <div
        className="relative bg-white dark:bg-slate-900 rounded-2xl max-w-5xl w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto max-h-[92vh] flex flex-col text-slate-900 dark:text-slate-100 transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="px-6 py-4 bg-slate-950 text-white flex items-center justify-between shrink-0 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-orange-500 to-red-600 flex items-center justify-center text-white shadow-sm font-black text-lg shrink-0">
              🚚
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded">
                  All 16 Regions
                </span>
                <span className="text-xs text-slate-400 hidden sm:inline">
                  Door-to-Door Courier Dispatch & GPS Tracking
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black tracking-tight text-white mt-0.5">
                OGYA Express Courier & Door-to-Door Delivery Ghana
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Hero Showcase with Verified Ghanaian Courier Dispatch */}
        <div className="relative bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 text-white border-b border-slate-800 overflow-hidden shrink-0">
          <div className="grid grid-cols-1 md:grid-cols-12 items-stretch">
            <div className="md:col-span-7 p-6 sm:p-8 flex flex-col justify-center space-y-3.5 z-10">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-md self-start">
                <ShieldCheck size={14} className="text-emerald-400" />
                <span>Strict Security Warning Protected · Anti-Fraud Escrow</span>
              </div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-white leading-tight">
                Door-to-Door Courier Services Across Every Corner of Ghana
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl">
                Ship packages or buy marketplace items with guaranteed doorstep pickup and delivery across Greater Accra, Ashanti, Western, Northern, and all 16 regions with live GPS checkpoint tracking, tamper-evident seals, and secret 4-digit release OTPs.
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={onOpenNewOrder}
                  className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs sm:text-sm rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer active:scale-98"
                >
                  <Plus size={16} strokeWidth={3} />
                  <span>Book Door Delivery Now</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('calculator')}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer border border-slate-700"
                >
                  <Calculator size={14} className="text-amber-400" />
                  <span>Rate & Distance Tool</span>
                </button>

                <button
                  type="button"
                  onClick={onOpenSafetyGuide}
                  className="px-3.5 py-2.5 bg-slate-800/80 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer border border-slate-700"
                >
                  <Lock size={13} className="text-red-400" />
                  <span>Strict Security Rules</span>
                </button>
              </div>
            </div>

            <div className="md:col-span-5 relative min-h-[180px] md:min-h-full">
              <img
                src={ghanaCourierDeliveryImg}
                alt="OGYA Ghana Express Courier Rider"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover md:absolute inset-0"
              />
              <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-slate-950 via-transparent to-transparent opacity-80 md:opacity-90" />
              <div className="absolute bottom-3 right-3 bg-slate-950/80 backdrop-blur-xs px-2.5 py-1 rounded-lg border border-white/10 text-[11px] font-semibold text-slate-200">
                ⚡ Certified Ghana Dispatch Fleet
              </div>
            </div>
          </div>
        </div>

        {/* Search Waybill Strip */}
        <div className="p-4 bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800">
          <form onSubmit={handleSearchWaybill} className="max-w-xl mx-auto flex gap-2">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Enter Ghana Waybill (e.g. OGYA-GH-78421) to track on GPS..."
                value={waybillSearch}
                onChange={(e) => setWaybillSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl font-mono uppercase text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 shadow-2xs"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 dark:hover:bg-slate-600 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer shrink-0 flex items-center gap-1.5"
            >
              <Radar size={14} className="text-amber-400" />
              <span>Track Waybill</span>
            </button>
          </form>

          {searchError && (
            <p className="text-center text-xs text-red-600 dark:text-red-400 mt-2 font-medium">
              {searchError}
            </p>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="px-6 border-b border-slate-200 dark:border-slate-800 flex items-center gap-4 sm:gap-6 text-xs font-bold text-slate-500 dark:text-slate-400 shrink-0 overflow-x-auto">
          <button
            onClick={() => setActiveTab('deliveries')}
            className={`py-3.5 transition-colors cursor-pointer border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'deliveries'
                ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                : 'border-transparent hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Package size={14} />
            <span>Active Deliveries ({activeDeliveries.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('calculator')}
            className={`py-3.5 transition-colors cursor-pointer border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'calculator'
                ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                : 'border-transparent hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Calculator size={14} />
            <span>Rate & Road Distance Tool</span>
          </button>

          <button
            onClick={() => setActiveTab('regions')}
            className={`py-3.5 transition-colors cursor-pointer border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'regions'
                ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                : 'border-transparent hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <MapPin size={14} />
            <span>16 Regions Hub Network</span>
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`py-3.5 transition-colors cursor-pointer border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'security'
                ? 'border-red-500 text-red-600 dark:text-red-400'
                : 'border-transparent hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Lock size={14} className="text-red-500" />
            <span>Strict Security Directive</span>
          </button>
        </div>

        {/* Scrollable Tab Content Body */}
        <div className="overflow-y-auto p-5 sm:p-6 lg:p-8 flex-1 space-y-6">
          {activeTab === 'deliveries' && (
            <div className="space-y-6">
              {/* Active Shipments Section */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-xs sm:text-sm uppercase tracking-wide flex items-center gap-2">
                    <Truck size={16} className="text-amber-500" />
                    <span>In-Transit & Dispatched Across Ghana</span>
                  </h3>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {activeDeliveries.length} active shipments
                  </span>
                </div>

                {activeDeliveries.length === 0 ? (
                  <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
                    <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto text-xl">
                      📦
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">No active shipments right now</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
                        Need to dispatch goods or have a marketplace item delivered straight to your door in Ghana?
                      </p>
                    </div>
                    <button
                      onClick={onOpenNewOrder}
                      className="px-5 py-2.5 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl cursor-pointer hover:bg-amber-400 transition-colors inline-flex items-center gap-1.5"
                    >
                      <Plus size={14} />
                      <span>Book a Courier Delivery</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3.5">
                    {activeDeliveries.map((order) => (
                      <div
                        key={order.id}
                        className="p-4.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs hover:border-amber-500/50 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                      >
                        <div className="space-y-1.5 min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono font-bold text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-900/60">
                              {order.waybillNumber}
                            </span>
                            <span className="text-xs font-bold text-slate-900 dark:text-white capitalize px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800">
                              {order.status.replace(/_/g, ' ')}
                            </span>
                            <span className="text-[11px] text-slate-400">
                              {order.createdAt}
                            </span>
                          </div>

                          <h4 className="font-extrabold text-slate-900 dark:text-white text-sm sm:text-base truncate">
                            {order.itemTitle}
                          </h4>

                          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
                            <span className="font-medium text-slate-800 dark:text-slate-200">
                              From: {order.sender.cityOrArea} ({order.sender.region})
                            </span>
                            <span>→</span>
                            <span className="font-medium text-slate-800 dark:text-slate-200">
                              To: {order.recipient.cityOrArea} ({order.recipient.region})
                            </span>
                            {order.rider && (
                              <span className="text-[11px] text-amber-700 dark:text-amber-300 font-semibold ml-1">
                                · Rider: {order.rider.name} ({order.rider.vehiclePlate})
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Security OTP pill & Action Buttons */}
                        <div className="flex items-center gap-2.5 w-full md:w-auto justify-between md:justify-end shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800">
                          <div className="p-2 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/60 rounded-xl text-left">
                            <span className="text-[9px] uppercase font-bold text-red-700 dark:text-red-400 block">
                              Release OTP
                            </span>
                            <span className="font-mono font-black text-xs sm:text-sm text-red-900 dark:text-red-200">
                              {order.securityOtp}
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => onOpenTracking(order)}
                            className="px-3.5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs rounded-xl transition-all shadow-xs cursor-pointer flex items-center gap-1.5 shrink-0"
                          >
                            <Radar size={14} className="animate-spin text-slate-950" style={{ animationDuration: '4s' }} />
                            <span>Live GPS Radar</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => onOpenTracking(order)}
                            className="px-3 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl transition-colors cursor-pointer flex items-center gap-1 shrink-0"
                            title="View Waybill & Receipt"
                          >
                            <FileText size={14} />
                            <span className="hidden sm:inline">Waybill</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Past Delivered Shipments */}
              {pastDeliveries.length > 0 && (
                <div>
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-xs sm:text-sm uppercase tracking-wide mb-3 flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-emerald-500" />
                    <span>Completed & Delivered</span>
                  </h3>

                  <div className="space-y-2.5">
                    {pastDeliveries.map((order) => (
                      <div
                        key={order.id}
                        className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4 text-xs"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-slate-500 font-semibold">{order.waybillNumber}</span>
                            <span className="font-bold text-emerald-600 dark:text-emerald-400">Delivered</span>
                          </div>
                          <span className="font-bold text-slate-900 dark:text-white truncate block">
                            {order.itemTitle}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            {order.sender.cityOrArea} → {order.recipient.cityOrArea}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => onOpenTracking(order)}
                          className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-lg transition-colors cursor-pointer shrink-0"
                        >
                          View Receipt
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Calculator Tab */}
          {activeTab === 'calculator' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-extrabold text-slate-900 dark:text-white text-base uppercase tracking-wide flex items-center gap-2">
                  <Calculator size={18} className="text-amber-500" />
                  <span>Ghana Courier Rate & Road Distance Calculator</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Instant real-time price estimation across all 16 Ghana regions based on road distance (km), parcel weight, transit escrow insurance, and delivery speed.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Inputs Column */}
                <div className="lg:col-span-7 space-y-4 bg-slate-50 dark:bg-slate-800/40 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
                  {/* Origin & Destination */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center relative">
                    <div>
                      <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                        Pickup Region (From)
                      </label>
                      <select
                        value={calcFromRegion}
                        onChange={(e) => setCalcFromRegion(e.target.value as GhanaRegion)}
                        className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                      >
                        {Object.keys(GHANA_REGIONS_DATA).map((reg) => (
                          <option key={reg} value={reg}>
                            {reg} Region
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                        Dropoff Region (To)
                      </label>
                      <select
                        value={calcToRegion}
                        onChange={(e) => setCalcToRegion(e.target.value as GhanaRegion)}
                        className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                      >
                        {Object.keys(GHANA_REGIONS_DATA).map((reg) => (
                          <option key={reg} value={reg}>
                            {reg} Region
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Swap button */}
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={swapRegions}
                      className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <ArrowRightLeft size={13} />
                      <span>Swap Origin & Destination</span>
                    </button>
                  </div>

                  {/* Package Type */}
                  <div>
                    <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                      Package Category
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {PACKAGE_TYPE_OPTIONS.map((pkg) => (
                        <button
                          key={pkg.id}
                          type="button"
                          onClick={() => setCalcPackageType(pkg.id)}
                          className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                            calcPackageType === pkg.id
                              ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/60 ring-1 ring-amber-500'
                              : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-slate-300'
                          }`}
                        >
                          <span className="block text-xs font-bold text-slate-900 dark:text-white">
                            {pkg.label.split('/')[0].trim()}
                          </span>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">
                            {pkg.weightLimit}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Weight Slider / Input */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                          Package Weight (kg)
                        </label>
                        <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400">
                          {calcWeightKg.toFixed(1)} kg
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0.5"
                        max="45"
                        step="0.5"
                        value={calcWeightKg}
                        onChange={(e) => setCalcWeightKg(parseFloat(e.target.value))}
                        className="w-full accent-amber-500 cursor-pointer"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                        Declared Item Value (GH₵)
                      </label>
                      <input
                        type="number"
                        min="50"
                        step="50"
                        value={calcDeclaredValue}
                        onChange={(e) => setCalcDeclaredValue(Math.max(0, parseFloat(e.target.value) || 0))}
                        className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                        placeholder="e.g. 1500"
                      />
                      <span className="text-[10px] text-slate-400 mt-0.5 block">
                        Used to compute escrow protection & transit insurance
                      </span>
                    </div>
                  </div>

                  {/* Speed Choice */}
                  <div>
                    <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                      Delivery Priority
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {DELIVERY_SPEED_OPTIONS.map((spd) => (
                        <button
                          key={spd.id}
                          type="button"
                          onClick={() => setCalcSpeed(spd.id)}
                          className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                            calcSpeed === spd.id
                              ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/60 ring-1 ring-amber-500'
                              : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-slate-300'
                          }`}
                        >
                          <span className="block text-xs font-bold text-slate-900 dark:text-white">
                            {spd.label.split('(')[0].trim()}
                          </span>
                          <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold block mt-0.5">
                            {spd.estimatedTime}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Calculation Results Card */}
                <div className="lg:col-span-5 bg-gradient-to-b from-slate-900 to-slate-950 text-white p-6 rounded-2xl border border-slate-800 shadow-xl space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                      Road Route Telemetry
                    </span>
                    <span className="text-xs font-black text-amber-400 flex items-center gap-1">
                      <Compass size={13} />
                      <span>{estimatedRoadDistance} km highway</span>
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-start gap-2 text-xs">
                      <span className="text-amber-400 font-bold shrink-0">Origin Hub:</span>
                      <span className="text-slate-300 truncate">
                        {GHANA_REGIONS_DATA[calcFromRegion]?.hubCenter || calcFromRegion}
                      </span>
                    </div>
                    <div className="flex items-start gap-2 text-xs">
                      <span className="text-emerald-400 font-bold shrink-0">Target Hub:</span>
                      <span className="text-slate-300 truncate">
                        {GHANA_REGIONS_DATA[calcToRegion]?.hubCenter || calcToRegion}
                      </span>
                    </div>
                  </div>

                  {/* Line Item Breakdown */}
                  <div className="pt-2 border-t border-slate-800 space-y-1.5 text-xs">
                    <div className="flex justify-between text-slate-400">
                      <span>Base Dispatch & Highway Transit</span>
                      <span className="font-mono text-slate-200">{formatPrice(quote.baseDeliveryFee)}</span>
                    </div>

                    <div className="flex justify-between text-slate-400">
                      <span>Transit Insurance & Escrow Guarantee</span>
                      <span className="font-mono text-slate-200">+{formatPrice(quote.insuranceFee)}</span>
                    </div>

                    <div className="flex justify-between text-slate-400">
                      <span>Postal Regulatory & GPS Telemetry Levy</span>
                      <span className="font-mono text-slate-200">+{formatPrice(quote.serviceTaxFee)}</span>
                    </div>
                  </div>

                  {/* Total Fee Box */}
                  <div className="p-4 bg-slate-800/80 rounded-xl border border-slate-700 space-y-1">
                    <div className="flex justify-between items-baseline">
                      <span className="text-xs uppercase font-bold text-slate-300">Estimated Total Fee</span>
                      <span className="font-black text-xl sm:text-2xl text-amber-400">
                        {formatPrice(quote.totalDeliveryFee)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-semibold">
                      <CheckCircle2 size={13} />
                      <span>Doorstep Pickup & Doorstep Delivery Included</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={onOpenNewOrder}
                    className="w-full py-3 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs sm:text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                  >
                    <Plus size={16} strokeWidth={3} />
                    <span>Proceed to Book This Dispatch</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'regions' && (
            <div className="space-y-4">
              <div>
                <h3 className="font-extrabold text-slate-900 dark:text-white text-sm uppercase tracking-wide mb-1">
                  National Gateway & Regional Hubs Coverage
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Every parcel is logged with GhanaPost GPS coordinate check-ins and vetted regional hub security.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {Object.entries(GHANA_REGIONS_DATA).map(([regionName, info]) => (
                  <div
                    key={regionName}
                    className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-slate-900 dark:text-white text-xs">
                        {regionName} Region
                      </span>
                      <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/60 px-1.5 py-0.2 rounded">
                        Active Hub
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 font-medium">
                      {info.hubCenter}
                    </p>
                    <div className="pt-1 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-[10px] text-slate-400">
                      <span>Covering: {info.mainCities.slice(0, 3).join(', ')}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-5 text-xs sm:text-sm">
              <div className="p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 rounded-xl space-y-2 text-red-900 dark:text-red-200">
                <div className="flex items-center gap-2 font-black text-red-700 dark:text-red-400 text-sm uppercase">
                  <ShieldCheck size={18} />
                  <span>OGYA Strict Courier Security Mandate</span>
                </div>
                <p className="text-xs leading-relaxed text-red-800 dark:text-red-300 font-medium">
                  We maintain zero-tolerance against courier scams, impersonation, and stolen goods trafficking. Please memorize these 4 golden rules for every door delivery in Ghana.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1.5">
                  <h4 className="font-extrabold text-slate-900 dark:text-white text-xs sm:text-sm flex items-center gap-2">
                    <Lock size={15} className="text-red-500" />
                    <span>Rule 1: Never Share 4-Digit OTP in Advance</span>
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    Riders or sellers who ask for your OTP over phone call or WhatsApp before reaching your physical door are violating safety policy. Report them immediately. The OTP triggers payout only when entered at your doorstep.
                  </p>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1.5">
                  <h4 className="font-extrabold text-slate-900 dark:text-white text-xs sm:text-sm flex items-center gap-2">
                    <ShieldCheck size={15} className="text-amber-500" />
                    <span>Rule 2: Check Rider Badge & Motorcycle Number Plate</span>
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    Always confirm the rider's company badge number and motorcycle or van plate against the details recorded on your app receipt before opening the parcel.
                  </p>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1.5">
                  <h4 className="font-extrabold text-slate-900 dark:text-white text-xs sm:text-sm flex items-center gap-2">
                    <Eye size={15} className="text-emerald-500" />
                    <span>Rule 3: In-Person Parcel Inspection Rights</span>
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    You have the legal right under OGYA Secure Trade to unseal and inspect item condition, brand authenticity, and IMEI/serial numbers in front of the courier before releasing payment.
                  </p>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1.5">
                  <h4 className="font-extrabold text-slate-900 dark:text-white text-xs sm:text-sm flex items-center gap-2">
                    <AlertTriangle size={15} className="text-blue-500" />
                    <span>Rule 4: Escrow Protection / Anti-Fraud Guarantee</span>
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    Funds are kept safely locked until both sides confirm satisfaction. If an item is counterfeit or defective, escrow returns 100% of your funds to your MoMo wallet.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Bar */}
        <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/80 flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Close
          </button>

          <button
            type="button"
            onClick={onOpenNewOrder}
            className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs sm:text-sm rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer active:scale-98"
          >
            <Plus size={16} strokeWidth={3} />
            <span>Book Door-to-Door Courier Now</span>
          </button>
        </div>
      </div>
    </div>
  );
};
