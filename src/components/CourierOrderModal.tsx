import React, { useState, useEffect } from 'react';
import {
  X,
  Truck,
  MapPin,
  ShieldCheck,
  Package,
  Calendar,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Lock,
  Phone,
  User,
  Smartphone,
  CreditCard,
  FileText,
  BadgeAlert,
  Info,
  Navigation,
} from 'lucide-react';
import {
  GhanaRegion,
  PackageType,
  DeliverySpeed,
  CourierPaymentMethod,
  CourierOrder,
  CourierOrderStatus,
  TrackingEvent,
} from '../types/courier';
import {
  GHANA_REGIONS_DATA,
  PACKAGE_TYPE_OPTIONS,
  DELIVERY_SPEED_OPTIONS,
  SAMPLE_RIDERS,
  calculateCourierQuote,
  generateWaybillNumber,
  generateSecurityOtp,
  saveCourierOrder,
} from '../utils/courierStorage';
import { Listing, UserProfile } from '../types/marketplace';
import { formatPrice } from '../utils/storage';
import { CourierSecurityWarningModal } from './CourierSecurityWarningModal';

interface CourierOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  listing?: Listing | null;
  currentUser?: UserProfile | null;
  onOrderSuccess: (order: CourierOrder) => void;
}

const ALL_GHANA_REGIONS: GhanaRegion[] = [
  'Greater Accra',
  'Ashanti',
  'Central',
  'Eastern',
  'Western',
  'Western North',
  'Volta',
  'Oti',
  'Northern',
  'Savannah',
  'North East',
  'Upper East',
  'Upper West',
  'Bono',
  'Bono East',
  'Ahafo',
];

export const CourierOrderModal: React.FC<CourierOrderModalProps> = ({
  isOpen,
  onClose,
  listing,
  currentUser,
  onOrderSuccess,
}) => {
  // Sender Details
  const [senderName, setSenderName] = useState('');
  const [senderPhone, setSenderPhone] = useState('');
  const [senderRegion, setSenderRegion] = useState<GhanaRegion>('Greater Accra');
  const [senderCity, setSenderCity] = useState('');
  const [senderGps, setSenderGps] = useState('');
  const [senderLandmark, setSenderLandmark] = useState('');

  // Recipient Details
  const [recipientName, setRecipientName] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [recipientRegion, setRecipientRegion] = useState<GhanaRegion>('Greater Accra');
  const [recipientCity, setRecipientCity] = useState('');
  const [recipientGps, setRecipientGps] = useState('');
  const [recipientLandmark, setRecipientLandmark] = useState('');

  // Package Details
  const [itemTitle, setItemTitle] = useState('');
  const [packageType, setPackageType] = useState<PackageType>('small-parcel');
  const [weightKg, setWeightKg] = useState<number>(1.5);
  const [declaredValue, setDeclaredValue] = useState<number>(0);
  const [specialInstructions, setSpecialInstructions] = useState('');

  // Delivery Speed & Payment
  const [deliverySpeed, setDeliverySpeed] = useState<DeliverySpeed>('same-day');
  const [paymentMethod, setPaymentMethod] = useState<CourierPaymentMethod>('momo_escrow');

  // Strict Security Warning Gate state
  const [isSecurityWarningOpen, setIsSecurityWarningOpen] = useState(false);
  const [securityAgreed, setSecurityAgreed] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Sync state when listing or user changes
  useEffect(() => {
    if (listing) {
      setItemTitle(listing.title);
      setDeclaredValue(listing.price);
      // Sender is the listing seller
      setSenderName(listing.seller.name);
      setSenderPhone(listing.seller.phone);
      // Try to match seller region to GhanaRegion
      const matchedRegion = ALL_GHANA_REGIONS.find((r) =>
        listing.region.toLowerCase().includes(r.toLowerCase())
      ) || 'Greater Accra';
      setSenderRegion(matchedRegion);
      setSenderCity(listing.location || 'Central Area');

      // Best default package type based on category
      if (listing.categoryId === 'phones-tablets' || listing.categoryId === 'electronics' || listing.categoryId === 'beauty-care') {
        setPackageType('small-parcel');
        setWeightKg(1.2);
      } else if (listing.categoryId === 'commercial-equipment' || listing.categoryId === 'home-furniture') {
        setPackageType('heavy-cargo');
        setWeightKg(20);
      } else {
        setPackageType('medium-box');
        setWeightKg(4.5);
      }

      // Recipient defaults to current logged in user if available
      if (currentUser) {
        setRecipientName(currentUser.name);
        setRecipientPhone(currentUser.phone);
        const userMatchedRegion = ALL_GHANA_REGIONS.find((r) =>
          currentUser.region?.toLowerCase().includes(r.toLowerCase())
        ) || 'Greater Accra';
        setRecipientRegion(userMatchedRegion);
        setRecipientCity(currentUser.city || '');
      }
    } else {
      // General standalone shipment
      setItemTitle('');
      setDeclaredValue(150);
      if (currentUser) {
        setSenderName(currentUser.name);
        setSenderPhone(currentUser.phone);
        const userRegion = ALL_GHANA_REGIONS.find((r) =>
          currentUser.region?.toLowerCase().includes(r.toLowerCase())
        ) || 'Greater Accra';
        setSenderRegion(userRegion);
        setSenderCity(currentUser.city || '');
      }
    }
  }, [listing, currentUser, isOpen]);

  // Adjust default speed when regions change
  useEffect(() => {
    if (senderRegion !== recipientRegion) {
      setDeliverySpeed('inter-regional');
    } else {
      setDeliverySpeed('same-day');
    }
  }, [senderRegion, recipientRegion]);

  if (!isOpen) return null;

  // Calculate live quotes
  const quote = calculateCourierQuote({
    fromRegion: senderRegion,
    toRegion: recipientRegion,
    packageType,
    weightKg: Number(weightKg) || 1,
    declaredValueGh: Number(declaredValue) || 0,
    speed: deliverySpeed,
  });

  const itemPriceNum = listing ? listing.price : 0;
  const grandTotal = quote.totalDeliveryFee + itemPriceNum;

  const handleOpenSecurityCheck = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    // Validate fields
    if (!itemTitle.trim()) {
      setValidationError('Please enter a description or title for the item to be couriered.');
      return;
    }
    if (!senderName.trim() || !senderPhone.trim() || !senderCity.trim()) {
      setValidationError('Please complete all sender pickup details (Name, Phone, City).');
      return;
    }
    if (!recipientName.trim() || !recipientPhone.trim() || !recipientCity.trim()) {
      setValidationError('Please complete all recipient delivery details (Name, Phone, City).');
      return;
    }

    // Trigger Strict Security Warning Modal BEFORE ordering!
    setIsSecurityWarningOpen(true);
  };

  const handleSecurityConfirmed = () => {
    setIsSecurityWarningOpen(false);
    setSecurityAgreed(true);

    // Pick a rider from the dispatch pool
    const assignedRider = SAMPLE_RIDERS[Math.floor(Math.random() * SAMPLE_RIDERS.length)];
    const waybill = generateWaybillNumber();
    const otp = generateSecurityOtp();

    const newOrder: CourierOrder = {
      id: waybill,
      waybillNumber: waybill,
      listingId: listing?.id,
      itemTitle,
      itemCategory: listing?.categoryId,
      itemPrice: listing?.price,
      packageType,
      packageWeightKg: Number(weightKg) || 1,
      declaredValueGh: Number(declaredValue) || 0,
      packageDescription: specialInstructions || `${itemTitle} door-to-door delivery across Ghana`,
      sender: {
        name: senderName,
        phone: senderPhone,
        region: senderRegion,
        cityOrArea: senderCity,
        ghanaPostGps: senderGps || undefined,
        landmark: senderLandmark || undefined,
      },
      recipient: {
        name: recipientName,
        phone: recipientPhone,
        region: recipientRegion,
        cityOrArea: recipientCity,
        ghanaPostGps: recipientGps || undefined,
        landmark: recipientLandmark || undefined,
      },
      deliverySpeed,
      distanceKmEstimated: quote.distanceKm,
      baseDeliveryFee: quote.baseDeliveryFee,
      insuranceFee: quote.insuranceFee,
      serviceTaxFee: quote.serviceTaxFee,
      totalDeliveryFee: quote.totalDeliveryFee,
      itemEscrowTotal: itemPriceNum,
      grandTotal,
      paymentMethod,
      status: 'order_confirmed',
      securityOtp: otp,
      rider: assignedRider,
      createdAt: 'Just now',
      estimatedDeliveryTime: deliverySpeed === 'same-day' ? 'Today, within 4 hours' : 'Tomorrow by 12:00 PM',
      securityWarningAgreed: true,
      securityAgreedTimestamp: new Date().toISOString(),
      specialInstructions,
      trackingEvents: [
        {
          id: `evt-${Date.now()}-1`,
          timestamp: 'Just now',
          status: 'order_confirmed',
          title: 'Courier Booking Created & Escrow Secured',
          description: `Delivery ordered from ${senderCity} (${senderRegion}) to ${recipientCity} (${recipientRegion}). Strict security mandate accepted.`,
          location: `${senderRegion} Central Gateway`,
          isCompleted: true,
        },
        {
          id: `evt-${Date.now()}-2`,
          timestamp: 'Scheduled',
          status: 'rider_assigned',
          title: `Rider ${assignedRider.name} Assigned`,
          description: `Rider Badge #${assignedRider.companyBadge} (Plate: ${assignedRider.vehiclePlate}) on route to pickup address.`,
          location: senderCity,
          isCompleted: false,
        },
        {
          id: `evt-${Date.now()}-3`,
          timestamp: 'Pending',
          status: 'parcel_collected',
          title: 'Doorstep Pickup & Tamper Barcode Sealing',
          description: 'Package will be inspected and logged with security seal.',
          location: senderCity,
          isCompleted: false,
        },
        {
          id: `evt-${Date.now()}-4`,
          timestamp: 'In Transit',
          status: 'in_transit',
          title: 'Direct Highway Transit Across Ghana',
          description: `Shipment transiting between ${senderRegion} and ${recipientRegion}.`,
          location: 'Ghana National Transit Corridor',
          isCompleted: false,
        },
        {
          id: `evt-${Date.now()}-5`,
          timestamp: 'Final Mile',
          status: 'out_for_delivery',
          title: 'Out for Doorstep Delivery',
          description: `Rider will arrive at ${recipientCity}. Recipient must provide OTP #${otp} ONLY after checking package condition.`,
          location: recipientCity,
          isCompleted: false,
        },
        {
          id: `evt-${Date.now()}-6`,
          timestamp: 'Completed',
          status: 'delivered',
          title: 'Delivered & Payment Disbursed',
          description: 'Security OTP confirmed, parcel handed over, delivery receipt issued.',
          location: recipientCity,
          isCompleted: false,
        },
      ],
    };

    saveCourierOrder(newOrder);
    onOrderSuccess(newOrder);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 md:p-6 animate-in fade-in duration-200">
        <div
          className="relative bg-white dark:bg-slate-900 rounded-2xl max-w-4xl w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto max-h-[92vh] flex flex-col text-slate-900 dark:text-slate-100 transition-colors"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top Bar */}
          <div className="px-6 py-4 bg-slate-950 text-white flex items-center justify-between shrink-0 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-sm shrink-0">
                <Truck size={22} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded">
                    Pan-Ghana Door-to-Door
                  </span>
                  <span className="text-xs text-slate-400 hidden sm:inline">
                    16 Regions Express Dispatch
                  </span>
                </div>
                <h2 className="text-base sm:text-lg font-black tracking-tight text-white mt-0.5">
                  Book End-to-End Courier Delivery
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

          {/* Strict Security Prominence Ribbon */}
          <div className="bg-gradient-to-r from-red-600/10 via-amber-500/10 to-orange-500/10 border-b border-amber-500/30 dark:border-amber-500/20 px-6 py-2.5 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-red-700 dark:text-red-400 font-bold">
              <ShieldCheck size={16} className="text-red-600 dark:text-red-400 shrink-0" />
              <span>Strict Security & Anti-Fraud Protocol enforced on all Ghana deliveries.</span>
            </div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 hidden md:inline">
              4-Digit Release OTP · Escrow Protected · Doorstep Inspection
            </span>
          </div>

          {/* Scrollable Form Body */}
          <form onSubmit={handleOpenSecurityCheck} className="overflow-y-auto p-5 sm:p-6 lg:p-8 space-y-6 flex-1 text-xs sm:text-sm">
            {validationError && (
              <div className="p-3.5 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/60 rounded-xl text-red-800 dark:text-red-300 flex items-center gap-2.5 font-semibold text-xs">
                <AlertTriangle size={16} className="shrink-0 text-red-600 dark:text-red-400" />
                <span>{validationError}</span>
              </div>
            )}

            {/* Shipment Summary if linked to listing */}
            {listing && (
              <div className="p-4 bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-xl flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-900 shrink-0 border border-amber-200 dark:border-amber-900">
                    {listing.images && listing.images[0] ? (
                      <img src={listing.images[0]} alt={listing.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white">📦</div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold text-amber-800 dark:text-amber-400 uppercase tracking-wide block">
                      Marketplace Item Delivery
                    </span>
                    <h4 className="font-extrabold text-slate-900 dark:text-white truncate text-xs sm:text-sm">
                      {listing.title}
                    </h4>
                    <span className="text-xs text-slate-600 dark:text-slate-300 font-semibold">
                      Seller: {listing.seller.name} ({listing.location})
                    </span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[10px] text-slate-500 uppercase block">Item Value</span>
                  <span className="text-base font-black text-slate-900 dark:text-white tabular-nums">
                    {formatPrice(listing.price, listing.currency)}
                  </span>
                </div>
              </div>
            )}

            {/* Two Column Grid: Sender vs Recipient */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Sender Details */}
              <div className="p-4.5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3.5">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700/60">
                  <h3 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm flex items-center gap-1.5 uppercase tracking-wide">
                    <MapPin size={15} className="text-amber-500" />
                    <span>Pickup Address (Sender / Seller)</span>
                  </h3>
                  <span className="text-[11px] text-slate-400 font-medium">Origin</span>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
                    Ghana Region *
                  </label>
                  <select
                    value={senderRegion}
                    onChange={(e) => {
                      const reg = e.target.value as GhanaRegion;
                      setSenderRegion(reg);
                      if (GHANA_REGIONS_DATA[reg]?.mainCities[0]) {
                        setSenderCity(GHANA_REGIONS_DATA[reg].mainCities[0]);
                      }
                    }}
                    className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                  >
                    {ALL_GHANA_REGIONS.map((r) => (
                      <option key={r} value={r}>
                        {r} Region
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
                      City / Suburb / Town *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Adum, East Legon, Tema"
                      value={senderCity}
                      onChange={(e) => setSenderCity(e.target.value)}
                      required
                      className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase mb-1 flex items-center justify-between">
                      <span>GhanaPost GPS</span>
                      <span className="text-[10px] text-slate-400 font-normal">Optional</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. GA-183-9023"
                      value={senderGps}
                      onChange={(e) => setSenderGps(e.target.value.toUpperCase())}
                      className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg font-mono text-slate-900 dark:text-white uppercase focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
                      Sender Contact Name *
                    </label>
                    <input
                      type="text"
                      placeholder="Full Name"
                      value={senderName}
                      onChange={(e) => setSenderName(e.target.value)}
                      required
                      className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
                      Sender Phone / WhatsApp *
                    </label>
                    <input
                      type="tel"
                      placeholder="+233 24 000 0000"
                      value={senderPhone}
                      onChange={(e) => setSenderPhone(e.target.value)}
                      required
                      className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
                    Pickup Landmark / Street Description
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Near Shell filling station, blue gate"
                    value={senderLandmark}
                    onChange={(e) => setSenderLandmark(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Recipient Details */}
              <div className="p-4.5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3.5">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700/60">
                  <h3 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm flex items-center gap-1.5 uppercase tracking-wide">
                    <Navigation size={15} className="text-red-500" />
                    <span>Drop-off Address (Recipient / Buyer)</span>
                  </h3>
                  <span className="text-[11px] text-slate-400 font-medium">Destination</span>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
                    Ghana Region *
                  </label>
                  <select
                    value={recipientRegion}
                    onChange={(e) => {
                      const reg = e.target.value as GhanaRegion;
                      setRecipientRegion(reg);
                      if (GHANA_REGIONS_DATA[reg]?.mainCities[0]) {
                        setRecipientCity(GHANA_REGIONS_DATA[reg].mainCities[0]);
                      }
                    }}
                    className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                  >
                    {ALL_GHANA_REGIONS.map((r) => (
                      <option key={r} value={r}>
                        {r} Region
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
                      City / Suburb / Town *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Spintex, Bantama, Takoradi"
                      value={recipientCity}
                      onChange={(e) => setRecipientCity(e.target.value)}
                      required
                      className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase mb-1 flex items-center justify-between">
                      <span>GhanaPost GPS</span>
                      <span className="text-[10px] text-slate-400 font-normal">Recommended</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. AK-039-4412"
                      value={recipientGps}
                      onChange={(e) => setRecipientGps(e.target.value.toUpperCase())}
                      className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg font-mono text-slate-900 dark:text-white uppercase focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
                      Recipient Full Name *
                    </label>
                    <input
                      type="text"
                      placeholder="Recipient Full Name"
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                      required
                      className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
                      Recipient Phone (For Delivery OTP) *
                    </label>
                    <input
                      type="tel"
                      placeholder="+233 50 000 0000"
                      value={recipientPhone}
                      onChange={(e) => setRecipientPhone(e.target.value)}
                      required
                      className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
                    Delivery Landmark / House Number
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. House No. 14, opposite Melcom, near pharmacy"
                    value={recipientLandmark}
                    onChange={(e) => setRecipientLandmark(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            </div>

            {/* Package Specifications & Weight */}
            <div className="p-4.5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3.5">
              <h3 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm flex items-center gap-1.5 uppercase tracking-wide pb-2 border-b border-slate-200 dark:border-slate-700/60">
                <Package size={15} className="text-amber-500" />
                <span>Package Type & Dimensions</span>
              </h3>

              {!listing && (
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
                    Item Description / Title *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. HP Omen Gaming Laptop + Charger, Official Document Pouch, etc."
                    value={itemTitle}
                    onChange={(e) => setItemTitle(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              )}

              {/* Package Type Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                {PACKAGE_TYPE_OPTIONS.map((opt) => {
                  const isSelected = packageType === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => {
                        setPackageType(opt.id);
                        setWeightKg(opt.maxWeightKg <= 1 ? 0.5 : Math.round(opt.maxWeightKg * 0.6 * 10) / 10);
                      }}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'border-amber-500 bg-amber-500/10 dark:bg-amber-500/15 shadow-2xs'
                          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-slate-300'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-bold text-xs text-slate-900 dark:text-white">
                            {opt.label}
                          </span>
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                            {opt.weightLimit}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                          {opt.description}
                        </p>
                      </div>
                      <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400 mt-2">
                        From GH₵ {opt.basePriceGh}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
                    Approximate Weight (kg)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    max="100"
                    value={weightKg}
                    onChange={(e) => setWeightKg(parseFloat(e.target.value) || 0.5)}
                    className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
                    Declared Item Value (GH₵) - For Escrow & Transit Insurance
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={declaredValue}
                    onChange={(e) => setDeclaredValue(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 tabular-nums"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
                  Special Handling / Rider Instructions
                </label>
                <input
                  type="text"
                  placeholder="e.g. Handle with care, fragile glass, recipient will test laptop bootup before giving OTP"
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* Delivery Speed Options */}
            <div className="p-4.5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
              <h3 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm flex items-center gap-1.5 uppercase tracking-wide pb-2 border-b border-slate-200 dark:border-slate-700/60">
                <Calendar size={15} className="text-amber-500" />
                <span>Delivery Speed & Dispatch Level</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {DELIVERY_SPEED_OPTIONS.map((spd) => {
                  const isSelected = deliverySpeed === spd.id;
                  return (
                    <button
                      key={spd.id}
                      type="button"
                      onClick={() => setDeliverySpeed(spd.id)}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'border-amber-500 bg-amber-500/10 dark:bg-amber-500/15 shadow-2xs'
                          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-slate-300'
                      }`}
                    >
                      <div>
                        <div className="font-bold text-xs text-slate-900 dark:text-white mb-0.5">
                          {spd.label}
                        </div>
                        <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400 block mb-1">
                          Est: {spd.estimatedTime}
                        </span>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                          {spd.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Payment & Escrow Method */}
            <div className="p-4.5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
              <h3 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm flex items-center gap-1.5 uppercase tracking-wide pb-2 border-b border-slate-200 dark:border-slate-700/60">
                <Lock size={15} className="text-emerald-500" />
                <span>Protected Escrow & Payment Option</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                {[
                  {
                    id: 'momo_escrow',
                    label: 'MTN MoMo Escrow',
                    sub: 'Held securely until door delivery',
                  },
                  {
                    id: 'telecel_escrow',
                    label: 'Telecel Cash Escrow',
                    sub: 'Disbursed upon OTP release',
                  },
                  {
                    id: 'card',
                    label: 'Bank Card (Visa / MC)',
                    sub: 'Protected online checkout',
                  },
                  {
                    id: 'cod_inspection',
                    label: 'Cash on Inspection',
                    sub: 'Inspect item at door before payment',
                  },
                ].map((pm) => {
                  const isSelected = paymentMethod === pm.id;
                  return (
                    <button
                      key={pm.id}
                      type="button"
                      onClick={() => setPaymentMethod(pm.id as CourierPaymentMethod)}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-500/10 dark:bg-emerald-500/15 shadow-2xs'
                          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-slate-300'
                      }`}
                    >
                      <span className="font-bold text-xs text-slate-900 dark:text-white block">
                        {pm.label}
                      </span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight block mt-0.5">
                        {pm.sub}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Live Pricing Breakdown Card */}
            <div className="p-5 bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-2xl border border-slate-800 shadow-md space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Ghana Delivery & Escrow Quote Summary
                </span>
                <span className="text-xs text-amber-400 font-mono">
                  ~{quote.distanceKm} km route ({senderRegion} → {recipientRegion})
                </span>
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between text-slate-300">
                  <span>Base Door-to-Door Courier Fee:</span>
                  <span className="font-bold text-white tabular-nums">GH₵ {quote.baseDeliveryFee.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span>In-Transit Goods Insurance & Escrow Guarantee:</span>
                  <span className="font-bold text-emerald-400 tabular-nums">GH₵ {quote.insuranceFee.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span>Ghana Postal Regulatory & Digital Addressing Levy:</span>
                  <span className="font-bold text-white tabular-nums">GH₵ {quote.serviceTaxFee.toFixed(2)}</span>
                </div>

                {listing && (
                  <div className="flex items-center justify-between text-amber-300 pt-1 border-t border-slate-800">
                    <span>Marketplace Item Price (Held in Escrow):</span>
                    <span className="font-bold tabular-nums">GH₵ {listing.price.toLocaleString('en-US')}</span>
                  </div>
                )}
              </div>

              <div className="pt-2.5 border-t border-slate-800 flex items-baseline justify-between">
                <div>
                  <span className="text-xs text-slate-400 uppercase block font-medium">Grand Total Payable</span>
                  <span className="text-[10px] text-emerald-400">Escrow released ONLY after your OTP confirmation</span>
                </div>
                <span className="text-2xl font-black text-amber-400 tabular-nums">
                  GH₵ {grandTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {/* Mandatory Security Gate Indicator */}
            <div className="p-4 bg-red-50 dark:bg-red-950/40 border-2 border-red-500/60 rounded-xl flex items-start gap-3">
              <ShieldCheck size={20} className="text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
              <div className="space-y-1 text-xs">
                <h4 className="font-extrabold text-red-900 dark:text-red-300 uppercase tracking-wide">
                  Strict Security Verification Required Before Dispatch
                </h4>
                <p className="text-red-800 dark:text-red-300/90 leading-relaxed font-medium">
                  When you click the button below, you will be prompted to acknowledge our <strong>Strict Security Directives</strong> (Rider ID verification, never sharing your 4-digit OTP code before physical delivery, and inspecting package contents at your door).
                </p>
              </div>
            </div>

            {/* Action Bar */}
            <div className="pt-2 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="px-6 py-3 bg-gradient-to-r from-red-600 via-amber-600 to-orange-500 hover:opacity-95 active:scale-98 text-white font-black text-xs sm:text-sm rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer"
              >
                <ShieldCheck size={18} />
                <span>Review Strict Security Warning & Book Courier</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Strict Security Warning Modal triggered right before order confirmation */}
      <CourierSecurityWarningModal
        isOpen={isSecurityWarningOpen}
        onClose={() => setIsSecurityWarningOpen(false)}
        onConfirmSecurity={handleSecurityConfirmed}
        itemTitle={itemTitle}
      />
    </>
  );
};
