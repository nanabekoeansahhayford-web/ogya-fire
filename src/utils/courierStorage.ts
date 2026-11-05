import {
  GhanaRegion,
  PackageType,
  PackageTypeOption,
  DeliverySpeed,
  DeliverySpeedOption,
  CourierOrder,
  CourierOrderStatus,
  TrackingEvent,
  RiderInfo,
} from '../types/courier';

export const GHANA_REGIONS_DATA: Record<GhanaRegion, { mainCities: string[]; hubCenter: string; lat: number; lng: number }> = {
  'Greater Accra': {
    mainCities: ['Accra Central', 'Tema', 'East Legon', 'Madina', 'Spintex', 'Dansoman', 'Achimota', 'Adenta', 'Kasoa Corridor'],
    hubCenter: 'OGYA Central Hub - Kwame Nkrumah Circle, Accra',
    lat: 5.6037,
    lng: -0.1870,
  },
  'Ashanti': {
    mainCities: ['Kumasi (Adum/Bantama)', 'KNUST Campus', 'Obuasi', 'Ejisu', 'Tafo', 'Asokwa', 'Suame Magazine'],
    hubCenter: 'OGYA Ashanti Hub - Kejetia Interchange, Kumasi',
    lat: 6.6885,
    lng: -1.6244,
  },
  'Central': {
    mainCities: ['Cape Coast', 'Winneba', 'Kasoa', 'Mankessim', 'Elmina', 'Agona Swedru'],
    hubCenter: 'OGYA Central Hub - University Post, Cape Coast',
    lat: 5.1053,
    lng: -1.2466,
  },
  'Eastern': {
    mainCities: ['Koforidua', 'Nsawam', 'Nkawkaw', 'Akosombo', 'Aburi', 'Somanya'],
    hubCenter: 'OGYA Eastern Depot - Koforidua Central Market',
    lat: 6.0941,
    lng: -0.2591,
  },
  'Western': {
    mainCities: ['Sekondi-Takoradi', 'Tarkwa', 'Axim', 'Agona Nkwanta', 'Elubo Border'],
    hubCenter: 'OGYA Western Terminal - Market Circle, Takoradi',
    lat: 4.8874,
    lng: -1.7588,
  },
  'Western North': {
    mainCities: ['Sefwi Wiawso', 'Bibiani', 'Enchi', 'Juaboso'],
    hubCenter: 'OGYA Western North Hub - Sefwi Wiawso Main',
    lat: 6.2083,
    lng: -2.4833,
  },
  'Volta': {
    mainCities: ['Ho', 'Hohoe', 'Keta', 'Aflao Border', 'Sogakope', 'Kpando'],
    hubCenter: 'OGYA Volta Dispatch - Civic Centre, Ho',
    lat: 6.6111,
    lng: 0.4708,
  },
  'Oti': {
    mainCities: ['Dambai', 'Nkwanta', 'Jasikan', 'Kadjebi'],
    hubCenter: 'OGYA Oti Depot - Dambai Ferry Terminal',
    lat: 7.6667,
    lng: 0.1833,
  },
  'Northern': {
    mainCities: ['Tamale Central', 'Tamale Airport Corridor', 'Yendi', 'Savelugu', 'Bimbilla'],
    hubCenter: 'OGYA Northern Hub - Aboabo Market, Tamale',
    lat: 9.4008,
    lng: -0.8393,
  },
  'Savannah': {
    mainCities: ['Damongo', 'Bole', 'Salaga', 'Sawla'],
    hubCenter: 'OGYA Savannah Hub - Damongo Central',
    lat: 9.0833,
    lng: -1.8167,
  },
  'North East': {
    mainCities: ['Nalerigu', 'Walewale', 'Gambaga', 'Chereponi'],
    hubCenter: 'OGYA North East Hub - Nalerigu High St',
    lat: 10.5333,
    lng: -0.3667,
  },
  'Upper East': {
    mainCities: ['Bolgatanga', 'Navrongo', 'Bawku', 'Paga Border'],
    hubCenter: 'OGYA Upper East Hub - Commercial St, Bolgatanga',
    lat: 10.7856,
    lng: -0.8514,
  },
  'Upper West': {
    mainCities: ['Wa', 'Lawra', 'Tumu', 'Jirapa', 'Nandom'],
    hubCenter: 'OGYA Upper West Hub - Wa Central Bus Terminal',
    lat: 10.0600,
    lng: -2.5099,
  },
  'Bono': {
    mainCities: ['Sunyani', 'Berekum', 'Dormaa Ahenkro', 'Wenchi'],
    hubCenter: 'OGYA Bono Hub - Sunyani Post Office Square',
    lat: 7.3399,
    lng: -2.3268,
  },
  'Bono East': {
    mainCities: ['Techiman', 'Kintampo', 'Atebubu', 'Yeji'],
    hubCenter: 'OGYA Bono East Hub - Techiman Tech Market',
    lat: 7.5833,
    lng: -1.9333,
  },
  'Ahafo': {
    mainCities: ['Goaso', 'Mim', 'Kenyasi Mining Corridor', 'Bechem'],
    hubCenter: 'OGYA Ahafo Hub - Goaso Commercial Road',
    lat: 6.8000,
    lng: -2.5167,
  },
};

export const PACKAGE_TYPE_OPTIONS: PackageTypeOption[] = [
  {
    id: 'document',
    label: 'Document / Envelope',
    weightLimit: 'Up to 0.5 kg',
    maxWeightKg: 0.5,
    description: 'Letters, contracts, certificates, passports, receipts, bank drafts in tamper-evident sealed pouches.',
    iconName: 'FileText',
    basePriceGh: 35,
  },
  {
    id: 'small-parcel',
    label: 'Small Parcel / Gadget',
    weightLimit: 'Up to 3.0 kg',
    maxWeightKg: 3.0,
    description: 'Mobile phones, tablets, cosmetics, jewellery, shoes, clothing, car keys & smart devices.',
    iconName: 'Smartphone',
    basePriceGh: 55,
  },
  {
    id: 'medium-box',
    label: 'Medium Parcel / Carton',
    weightLimit: '3.0 kg – 12.0 kg',
    maxWeightKg: 12.0,
    description: 'Laptops, kitchen appliances, multiple apparel items, sound systems, desktop computers.',
    iconName: 'Package',
    basePriceGh: 95,
  },
  {
    id: 'heavy-cargo',
    label: 'Heavy Cargo / Bulky Goods',
    weightLimit: '12.0 kg – 45.0 kg',
    maxWeightKg: 45.0,
    description: 'Generators, solar batteries, furniture pieces, auto parts, commercial equipment via van dispatch.',
    iconName: 'Truck',
    basePriceGh: 185,
  },
];

export const DELIVERY_SPEED_OPTIONS: DeliverySpeedOption[] = [
  {
    id: 'same-day',
    label: 'Same-Day Express Dispatch',
    estimatedTime: '3 – 6 Hours',
    description: 'Dedicated door-to-door rider dispatched immediately for intra-city urgent deliveries.',
    multiplier: 1.45,
  },
  {
    id: 'express-next-day',
    label: 'Next-Day Guaranteed (24h)',
    estimatedTime: 'By 12:00 PM Next Day',
    description: 'Scheduled door delivery across Greater Accra, Kumasi, Central & Eastern regions.',
    multiplier: 1.15,
  },
  {
    id: 'inter-regional',
    label: 'Inter-Regional Secured Transit',
    estimatedTime: '24 – 48 Hours',
    description: 'Direct door-to-door express transit connecting all 16 regions across Ghana with GPS checkpoints.',
    multiplier: 1.0,
  },
];

export const SAMPLE_RIDERS: RiderInfo[] = [
  {
    name: 'Kofi Mensah Boateng',
    phone: '+233 24 412 8890',
    vehicleType: 'Motorcycle',
    vehiclePlate: 'GH-M-2024-4158',
    companyBadge: 'OGYA-VERIFIED-RIDER-042',
    rating: 4.95,
    completedDeliveries: 1240,
    verificationBadge: 'Verified Police Checked Rider',
  },
  {
    name: 'Emmanuel Kwesi Appiah',
    phone: '+233 55 981 7721',
    vehicleType: 'Motorcycle',
    vehiclePlate: 'GH-M-2023-7821',
    companyBadge: 'OGYA-VERIFIED-RIDER-118',
    rating: 4.9,
    completedDeliveries: 890,
    verificationBadge: 'Verified Police Checked Rider',
  },
  {
    name: 'Abdulai Mohammed',
    phone: '+233 20 892 3341',
    vehicleType: 'Cargo Van',
    vehiclePlate: 'GH-V-2024-6590',
    companyBadge: 'OGYA-CARGO-DISPATCH-08',
    rating: 4.88,
    completedDeliveries: 615,
    verificationBadge: 'Inter-Regional Heavy Cargo Certified',
  },
];

export const calculateEstimatedDistanceKm = (fromRegion: GhanaRegion, toRegion: GhanaRegion): number => {
  if (fromRegion === toRegion) {
    return 18; // Average intra-city / intra-region trip
  }
  // Approximate inter-region road distances in Ghana
  const p1 = GHANA_REGIONS_DATA[fromRegion];
  const p2 = GHANA_REGIONS_DATA[toRegion];
  if (!p1 || !p2) return 120;

  const degToRad = (deg: number) => deg * (Math.PI / 180);
  const R = 6371; // Earth radius in km
  const dLat = degToRad(p2.lat - p1.lat);
  const dLng = degToRad(p2.lng - p1.lng);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(degToRad(p1.lat)) * Math.cos(degToRad(p2.lat)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const crowDistance = R * c;
  // Road winding multiplier for Ghana highways: ~1.42
  return Math.max(25, Math.round(crowDistance * 1.42));
};

export const calculateCourierQuote = ({
  fromRegion,
  toRegion,
  packageType,
  weightKg,
  declaredValueGh,
  speed,
}: {
  fromRegion: GhanaRegion;
  toRegion: GhanaRegion;
  packageType: PackageType;
  weightKg: number;
  declaredValueGh: number;
  speed: DeliverySpeed;
}) => {
  const packageDef = PACKAGE_TYPE_OPTIONS.find((p) => p.id === packageType) || PACKAGE_TYPE_OPTIONS[1];
  const speedDef = DELIVERY_SPEED_OPTIONS.find((s) => s.id === speed) || DELIVERY_SPEED_OPTIONS[1];
  const distanceKm = calculateEstimatedDistanceKm(fromRegion, toRegion);

  let baseRate = packageDef.basePriceGh;

  // Inter-region distance surcharge
  if (fromRegion !== toRegion) {
    // 0.35 GH₵ per km beyond first 50km
    const extraDistanceKm = Math.max(0, distanceKm - 50);
    const distanceSurcharge = Math.round(extraDistanceKm * 0.38);
    baseRate += distanceSurcharge;
  }

  // Weight surcharge if exceeding nominal
  const actualWeight = Math.max(0.5, weightKg || 1);
  if (actualWeight > packageDef.maxWeightKg) {
    const excessKg = actualWeight - packageDef.maxWeightKg;
    baseRate += Math.round(excessKg * 12);
  }

  // Speed multiplier
  const subtotalWithSpeed = Math.round(baseRate * speedDef.multiplier);

  // Escrow / Transit Insurance (1.2% of declared item value, minimum 8 GH₵, max 250 GH₵)
  const insuranceFee = declaredValueGh > 0
    ? Math.min(250, Math.max(8, Math.round(declaredValueGh * 0.012)))
    : 8;

  // Ghana postal regulatory & GPS routing levy (flat 5 GH₵)
  const serviceTaxFee = 5;

  const totalDeliveryFee = subtotalWithSpeed + insuranceFee + serviceTaxFee;

  return {
    distanceKm,
    baseDeliveryFee: subtotalWithSpeed,
    insuranceFee,
    serviceTaxFee,
    totalDeliveryFee,
  };
};

export const generateWaybillNumber = (): string => {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let rand = '';
  for (let i = 0; i < 5; i++) {
    rand += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `OGYA-GH-${rand}`;
};

export const generateSecurityOtp = (): string => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};

const STORAGE_KEY_COURIER_ORDERS = 'ogya_courier_orders';

const SEED_COURIER_ORDERS: CourierOrder[] = [
  {
    id: 'OGYA-GH-78421',
    waybillNumber: 'OGYA-GH-78421',
    itemTitle: 'Apple iPhone 15 Pro Max 256GB Natural Titanium',
    itemCategory: 'phones-tablets',
    itemPrice: 12800,
    packageType: 'small-parcel',
    packageWeightKg: 1.2,
    declaredValueGh: 12800,
    packageDescription: 'Sealed phone with warranty receipt in tamper-evident safety sleeve',
    sender: {
      name: 'Prince Appiah Gadgets',
      phone: '+233 24 555 9812',
      region: 'Ashanti',
      cityOrArea: 'Kumasi - Adum Market Square',
      ghanaPostGps: 'AK-039-4412',
      landmark: 'Near SG-SSB Bank Adum branch',
    },
    recipient: {
      name: 'Dr. Kwame Addo',
      phone: '+233 50 123 4567',
      region: 'Greater Accra',
      cityOrArea: 'East Legon, Accra',
      ghanaPostGps: 'GA-492-8819',
      landmark: 'Opposite Mensvic Grand Hotel',
    },
    deliverySpeed: 'same-day',
    distanceKmEstimated: 254,
    baseDeliveryFee: 145,
    insuranceFee: 45,
    serviceTaxFee: 5,
    totalDeliveryFee: 195,
    itemEscrowTotal: 12800,
    grandTotal: 12995,
    paymentMethod: 'momo_escrow',
    status: 'in_transit',
    securityOtp: '7482',
    rider: SAMPLE_RIDERS[0],
    createdAt: 'Today, 08:30 AM',
    estimatedDeliveryTime: 'Today, by 4:00 PM',
    securityWarningAgreed: true,
    securityAgreedTimestamp: '2026-10-25T08:31:00Z',
    specialInstructions: 'Verify package seal integrity before handing over OTP code.',
    trackingEvents: [
      {
        id: 'evt-1',
        timestamp: '08:30 AM',
        status: 'order_confirmed',
        title: 'Courier Booking Created & Escrow Secured',
        description: 'Payment of GH₵ 12,995 placed in OGYA Safe Trade Escrow. Strict security checks passed.',
        location: 'OGYA Kumasi Central Gateway',
        isCompleted: true,
      },
      {
        id: 'evt-2',
        timestamp: '09:15 AM',
        status: 'rider_assigned',
        title: 'Dispatch Rider Assigned & Badge Verified',
        description: 'Rider Kofi Mensah Boateng (Badge #042, Plate: GH-M-2024-4158) dispatched to pickup.',
        location: 'Adum, Kumasi',
        isCompleted: true,
      },
      {
        id: 'evt-3',
        timestamp: '10:00 AM',
        status: 'parcel_collected',
        title: 'Parcel Inspected & Barcoded at Seller Doorstep',
        description: 'Sender ID verified. High-value tamper-evident pouch sealed with barcode #OGYA-78421.',
        location: 'Adum Market Square, Kumasi',
        isCompleted: true,
      },
      {
        id: 'evt-4',
        timestamp: '11:45 AM',
        status: 'in_transit',
        title: 'In Transit on Accra-Kumasi Inter-Regional Highway',
        description: 'GPS active. Shipment passed Nkawkaw checkpoint heading through Suhum corridor to Accra.',
        location: 'Eastern Region Transit Checkpoint',
        isCompleted: true,
      },
      {
        id: 'evt-5',
        timestamp: 'Est. 03:30 PM',
        status: 'out_for_delivery',
        title: 'Out for Door-to-Door Delivery',
        description: 'Rider approaching recipient address at East Legon. Recipient must verify Rider ID and provide OTP upon package inspection.',
        location: 'East Legon, Greater Accra',
        isCompleted: false,
      },
      {
        id: 'evt-6',
        timestamp: 'Est. 04:00 PM',
        status: 'delivered',
        title: 'Delivered & Escrow Released',
        description: 'Package verified by recipient, 4-digit OTP provided, digital receipt generated.',
        location: 'Doorstep, East Legon',
        isCompleted: false,
      },
    ],
  },
  {
    id: 'OGYA-GH-65109',
    waybillNumber: 'OGYA-GH-65109',
    itemTitle: 'Toyota RAV4 2020 Original Front Headlight Assembly (Pair)',
    itemCategory: 'vehicles',
    itemPrice: 3200,
    packageType: 'medium-box',
    packageWeightKg: 8.5,
    declaredValueGh: 3200,
    packageDescription: 'Foam-padded boxed auto parts with fragile handling labels',
    sender: {
      name: 'Alhaji Abass Auto Parts',
      phone: '+233 24 331 4452',
      region: 'Greater Accra',
      cityOrArea: 'Abossey Okai, Accra',
      ghanaPostGps: 'GA-112-9901',
      landmark: 'Near Total Fuel Station Abossey Okai',
    },
    recipient: {
      name: 'Dennis K. Kpordze',
      phone: '+233 27 889 2210',
      region: 'Central',
      cityOrArea: 'Cape Coast - Pedu Junction',
      ghanaPostGps: 'CC-041-3329',
      landmark: 'Opposite Pedu Shell Station',
    },
    deliverySpeed: 'express-next-day',
    distanceKmEstimated: 142,
    baseDeliveryFee: 135,
    insuranceFee: 32,
    serviceTaxFee: 5,
    totalDeliveryFee: 172,
    itemEscrowTotal: 3200,
    grandTotal: 3372,
    paymentMethod: 'telecel_escrow',
    status: 'delivered',
    securityOtp: '4190',
    rider: SAMPLE_RIDERS[1],
    createdAt: 'Yesterday, 10:15 AM',
    estimatedDeliveryTime: 'Yesterday, 04:45 PM',
    securityWarningAgreed: true,
    securityAgreedTimestamp: '2026-10-24T10:16:00Z',
    trackingEvents: [
      {
        id: 'e1',
        timestamp: '10:15 AM',
        status: 'order_confirmed',
        title: 'Order Created & Anti-Fraud Security Verified',
        description: 'Security protocol accepted. Escrow verified.',
        location: 'Abossey Okai Hub',
        isCompleted: true,
      },
      {
        id: 'e2',
        timestamp: '11:00 AM',
        status: 'parcel_collected',
        title: 'Collected from Abossey Okai Seller',
        description: 'Auto parts inspected and verified intact.',
        location: 'Abossey Okai',
        isCompleted: true,
      },
      {
        id: 'e3',
        timestamp: '02:30 PM',
        status: 'in_transit',
        title: 'Transited Coastal Highway',
        description: 'Passed Winneba junction without delays.',
        location: 'Winneba Highway',
        isCompleted: true,
      },
      {
        id: 'e4',
        timestamp: '04:35 PM',
        status: 'delivered',
        title: 'Doorstep Handover Confirmed with Secure OTP',
        description: 'Recipient verified parts condition. OTP #4190 entered. Escrow released to seller.',
        location: 'Cape Coast - Pedu Junction',
        isCompleted: true,
      },
    ],
  },
];

export const getStoredCourierOrders = (): CourierOrder[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_COURIER_ORDERS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_COURIER_ORDERS, JSON.stringify(SEED_COURIER_ORDERS));
      return SEED_COURIER_ORDERS;
    }
    const parsed: CourierOrder[] = JSON.parse(raw);
    return parsed;
  } catch (err) {
    console.error('Failed reading courier orders from localStorage', err);
    return SEED_COURIER_ORDERS;
  }
};

export const saveCourierOrder = (order: CourierOrder): CourierOrder[] => {
  try {
    const current = getStoredCourierOrders();
    const updated = [order, ...current.filter((o) => o.id !== order.id)];
    localStorage.setItem(STORAGE_KEY_COURIER_ORDERS, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error('Failed saving courier order', err);
    return [order];
  }
};

export const getCourierOrderById = (orderIdOrWaybill: string): CourierOrder | undefined => {
  const orders = getStoredCourierOrders();
  const clean = orderIdOrWaybill.trim().toUpperCase();
  return orders.find(
    (o) => o.id.toUpperCase() === clean || o.waybillNumber.toUpperCase() === clean
  );
};

export const advanceCourierOrderStatus = (orderId: string): CourierOrder | null => {
  try {
    const orders = getStoredCourierOrders();
    const orderIndex = orders.findIndex((o) => o.id === orderId);
    if (orderIndex === -1) return null;

    const order = orders[orderIndex];
    let nextStatus: CourierOrderStatus = order.status;

    if (order.status === 'in_transit') {
      nextStatus = 'out_for_delivery';
    } else if (order.status === 'out_for_delivery') {
      nextStatus = 'delivered';
    } else if (order.status === 'rider_assigned') {
      nextStatus = 'parcel_collected';
    } else if (order.status === 'parcel_collected') {
      nextStatus = 'in_transit';
    }

    const updatedEvents = order.trackingEvents.map((evt) => {
      if (evt.status === nextStatus) {
        return { ...evt, isCompleted: true, timestamp: 'Just now' };
      }
      return evt;
    });

    const updatedOrder: CourierOrder = {
      ...order,
      status: nextStatus,
      trackingEvents: updatedEvents,
    };

    orders[orderIndex] = updatedOrder;
    localStorage.setItem(STORAGE_KEY_COURIER_ORDERS, JSON.stringify(orders));
    return updatedOrder;
  } catch (err) {
    console.error('Failed advancing courier order status', err);
    return null;
  }
};
