export type GhanaRegion =
  | 'Greater Accra'
  | 'Ashanti'
  | 'Central'
  | 'Eastern'
  | 'Western'
  | 'Western North'
  | 'Volta'
  | 'Oti'
  | 'Northern'
  | 'Savannah'
  | 'North East'
  | 'Upper East'
  | 'Upper West'
  | 'Bono'
  | 'Bono East'
  | 'Ahafo';

export interface RegionHubInfo {
  region: GhanaRegion;
  mainCities: string[];
  hubCenter: string;
  dispatchTimeHours: number;
}

export type PackageType = 'document' | 'small-parcel' | 'medium-box' | 'heavy-cargo';

export interface PackageTypeOption {
  id: PackageType;
  label: string;
  weightLimit: string;
  maxWeightKg: number;
  description: string;
  iconName: string;
  basePriceGh: number;
}

export type DeliverySpeed = 'same-day' | 'express-next-day' | 'inter-regional';

export interface DeliverySpeedOption {
  id: DeliverySpeed;
  label: string;
  estimatedTime: string;
  description: string;
  multiplier: number;
}

export type CourierPaymentMethod =
  | 'momo_escrow'
  | 'telecel_escrow'
  | 'card'
  | 'cod_inspection';

export type CourierOrderStatus =
  | 'pending_security'
  | 'order_confirmed'
  | 'rider_assigned'
  | 'parcel_collected'
  | 'in_transit'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled';

export interface TrackingEvent {
  id: string;
  timestamp: string;
  status: CourierOrderStatus;
  title: string;
  description: string;
  location: string;
  isCompleted: boolean;
}

export interface RiderInfo {
  name: string;
  phone: string;
  vehicleType: 'Motorcycle' | 'Cargo Van' | 'Truck';
  vehiclePlate: string;
  companyBadge: string;
  rating: number;
  completedDeliveries: number;
  photoUrl?: string;
  verificationBadge: string;
}

export interface CourierOrder {
  id: string; // e.g. "OGYA-GH-78421"
  waybillNumber: string;
  listingId?: string;
  itemTitle: string;
  itemCategory?: string;
  itemPrice?: number;
  packageType: PackageType;
  packageWeightKg: number;
  declaredValueGh: number;
  packageDescription: string;
  sender: {
    name: string;
    phone: string;
    region: GhanaRegion;
    cityOrArea: string;
    ghanaPostGps?: string;
    landmark?: string;
  };
  recipient: {
    name: string;
    phone: string;
    region: GhanaRegion;
    cityOrArea: string;
    ghanaPostGps?: string;
    landmark?: string;
  };
  deliverySpeed: DeliverySpeed;
  distanceKmEstimated: number;
  baseDeliveryFee: number;
  insuranceFee: number;
  serviceTaxFee: number;
  totalDeliveryFee: number;
  itemEscrowTotal: number;
  grandTotal: number;
  paymentMethod: CourierPaymentMethod;
  status: CourierOrderStatus;
  securityOtp: string; // 4-digit code required to complete delivery
  rider?: RiderInfo;
  trackingEvents: TrackingEvent[];
  createdAt: string;
  estimatedDeliveryTime: string;
  securityWarningAgreed: boolean;
  securityAgreedTimestamp?: string;
  specialInstructions?: string;
}
