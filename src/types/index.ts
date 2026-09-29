export type UserRole = 'customer' | 'vendor' | 'delivery' | 'technician' | 'driver' | 'cabs' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  avatar?: string;
  address?: Address;
  kycStatus?: 'pending' | 'verified' | 'rejected';
  createdAt: string;
}

export interface Address {
  id: string;
  label: 'Home' | 'Work' | 'Other';
  street: string;
  area: string;
  city: string;
  pincode: string;
  landmark?: string;
  lat?: number;
  lng?: number;
}

export type MainCategory = 
  | 'grocery'
  | 'vegetables-fruits'
  | 'chips-namkeen'
  | 'cosmetics'
  | 'drinks-juice'
  | 'ice-cream'
  | 'fresh-foods'
  | 'fresh-fish-meats'
  | 'pharmacy'
  | 'cabs'
  | 'prints'
  | 'technicians'
  | 'liquor';

export interface CategoryInfo {
  id: MainCategory;
  name: string;
  nameBn?: string;
  tagline: string;
  taglineBn?: string;
  description?: string;
  descriptionBn?: string;
  iconName: string;
  color: string;
  badge?: string;
  badgeBn?: string;
  eta: string;
  etaBn?: string;
  subcategories: string[];
}

export interface Product {
  id: string;
  vendorId: string;
  vendorName: string;
  name: string;
  brand: string;
  category: MainCategory;
  subcategory: string;
  description: string;
  image: string;
  weight: string;
  unit: string;
  mrp: number;
  price: number;
  discount: number;
  stock: number;
  isAvailable: boolean;
  rating: number;
  ratingCount: number;
  tags?: string[];
  perUnitRate?: string;
  featureTag?: string;
  optionsCount?: number;
  // Category specific customizations
  freshnessDays?: number; // Vegetables & Fruits
  isVeg?: boolean; // Food & grocery
  prepTimeMinutes?: number; // Food
  sugarOptions?: ('Normal' | 'Less' | 'No Sugar')[]; // Juice
  iceOptions?: ('Normal' | 'Less' | 'No Ice')[]; // Juice
  sizeOptions?: { label: string; priceMultiplier: number }[]; // Juice & Drinks
  meatCutOptions?: ('Curry Cut' | 'Small Pieces' | 'Large Pieces' | 'Boneless')[]; // Meat
  cleaningOptions?: ('Cleaned' | 'Uncleaned')[]; // Meat
  requiresPrescription?: boolean; // Pharmacy
  bottleSize?: string; // Liquor
  alcoholByVolume?: string; // Liquor
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedSize?: string;
  selectedSugar?: string;
  selectedIce?: string;
  selectedCut?: string;
  selectedCleaning?: string;
  prescriptionUrl?: string;
}

export type OrderStatus =
  | 'PLACED'
  | 'VENDOR_NOTIFIED'
  | 'ACCEPTED'
  | 'PREPARING'
  | 'READY_FOR_PICKUP'
  | 'DELIVERY_PARTNER_SEARCHING'
  | 'DELIVERY_ASSIGNED'
  | 'PICKED_UP'
  | 'OUT_FOR_DELIVERY'
  | 'ARRIVING'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'REFUNDED';

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: Address;
  vendorId: string;
  vendorName: string;
  vendorAddress: string;
  category: MainCategory;
  items: CartItem[];
  itemTotal: number;
  deliveryFee: number;
  platformFee: number;
  tax: number;
  discount: number;
  totalAmount: number;
  paymentMethod: 'UPI' | 'Card' | 'NetBanking' | 'Wallet' | 'COD';
  paymentStatus: 'paid' | 'pending' | 'refunded';
  status: OrderStatus;
  deliveryPartnerId?: string;
  deliveryPartnerName?: string;
  deliveryPartnerPhone?: string;
  deliveryPartnerVehicle?: string;
  deliveryOtp: string;
  prepTimeEstimateMinutes: number;
  placedAt: string;
  updatedAt: string;
  deliveredAt?: string;
  customerRating?: number;
  customerReview?: string;
  deliveryNotes?: string;
}

export interface Vendor {
  id: string;
  name: string;
  businessName: string;
  email: string;
  phone: string;
  category: MainCategory;
  address: string;
  area?: string;
  city?: string;
  pincode?: string;
  serviceRadiusKm?: number;
  rating: number;
  reviewCount: number;
  isOpen: boolean;
  kycStatus: 'verified' | 'pending' | 'rejected';
  fssaiNumber?: string;
  drugLicense?: string;
  liquorLicense?: string;
  image: string;
  todaySales: number;
  totalSales: number;
  commissionRate: number; // percentage
}

export interface DeliveryPartner {
  id: string;
  name: string;
  phone: string;
  email: string;
  avatar: string;
  vehicleType: 'Bike' | 'Scooter' | 'EV' | 'Cycle';
  vehicleNumber: string;
  isOnline: boolean;
  currentOrderCount: number;
  todayEarnings: number;
  totalDeliveries: number;
  rating: number;
  kycStatus: 'verified' | 'pending';
  operatingArea?: string;
  operatingCity?: string;
  operatingPincode?: string;
}

export type TechnicianCategory = 'Rajmistri' | 'Electrician' | 'Plumber' | 'Carpenter' | 'Painter' | 'Appliance Repair';

export interface Technician {
  id: string;
  name: string;
  phone: string;
  avatar: string;
  category: TechnicianCategory;
  experienceYears: number;
  visitingCharge: number;
  visitingCharges?: number;
  rating: number;
  jobsCompleted: number;
  completedJobs?: number;
  isAvailable: boolean;
}

export interface ServiceBooking {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  technicianCategory: TechnicianCategory;
  technicianId?: string;
  technicianName?: string;
  problemDescription: string;
  photoUrl?: string;
  address: Address;
  scheduledTime: 'immediate' | string;
  status:
    | 'REQUESTED'
    | 'TECHNICIAN_SEARCHING'
    | 'TECHNICIAN_ASSIGNED'
    | 'ACCEPTED'
    | 'ON_THE_WAY'
    | 'ARRIVED'
    | 'IN_PROGRESS'
    | 'JOB_STARTED'
    | 'JOB_COMPLETED'
    | 'COMPLETED'
    | 'PAYMENT_COMPLETED'
    | 'RATED'
    | 'CANCELLED';
  visitingCharge: number;
  finalAmount?: number;
  placedAt: string;
  customerRating?: number;
}

export interface CabBooking {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  pickupLocation: string;
  dropLocation: string;
  vehicleType: 'Bike' | 'Auto' | 'Mini' | 'Sedan' | 'XL';
  estimatedFare: number;
  distanceKm: number;
  durationMinutes: number;
  driverName?: string;
  driverPhone?: string;
  driverRating?: number;
  vehicleNumber?: string;
  otp: string;
  status: 
    | 'SEARCHING' 
    | 'ACCEPTED' 
    | 'ASSIGNED' 
    | 'DRIVER_ARRIVING' 
    | 'ARRIVED' 
    | 'IN_TRIP' 
    | 'TRIP_STARTED' 
    | 'COMPLETED' 
    | 'CANCELLED';
  bookingType: 'now' | 'scheduled';
  scheduledTime?: string;
  placedAt: string;
}

export interface PrintOrder {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone?: string;
  customerAddress?: Address;
  fileName: string;
  fileSize?: string;
  pages?: number;
  pageCount?: number;
  colorMode?: 'B&W' | 'Color';
  colorType?: 'B&W' | 'Color';
  printSide?: string;
  sidedness?: string;
  paperSize?: string;
  paperType?: string;
  copies: number;
  binding: string;
  deliveryType?: 'Delivery' | 'Pickup';
  fulfillment?: 'Delivery' | 'Store Pickup';
  totalPrice?: number;
  totalAmount: number;
  status: 
    | 'SUBMITTED' 
    | 'PRINTING' 
    | 'PRINT_READY' 
    | 'READY_FOR_PICKUP' 
    | 'DELIVERY_ASSIGNED' 
    | 'PICKED_UP' 
    | 'OUT_FOR_DELIVERY' 
    | 'DELIVERED';
  vendorId?: string;
  vendorName?: string;
  storeName?: string;
  storeAddress?: string;
  storeArea?: string;
  storeCity?: string;
  storePincode?: string;
  deliveryPartnerId?: string;
  deliveryPartnerName?: string;
  deliveryPartnerPhone?: string;
  deliveryPartnerVehicle?: string;
  deliveryOtp?: string;
  placedAt: string;
  deliveredAt?: string;
}

export interface Coupon {
  code: string;
  description: string;
  discountType: 'percentage' | 'flat';
  discountValue: number;
  minOrder: number;
  maxDiscount?: number;
}

export interface SupportTicket {
  id: string;
  customerId: string;
  customerName: string;
  orderId?: string;
  category: 'Missing Item' | 'Damaged Item' | 'Late Delivery' | 'Refund Request' | 'Quality Issue' | 'Other';
  subject: string;
  message: string;
  status: 'Open' | 'In Progress' | 'Resolved';
  resolutionNotes?: string;
  createdAt: string;
}
