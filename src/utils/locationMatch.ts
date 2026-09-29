import { Address, Vendor, DeliveryPartner } from '../types';

/**
 * Normalizes text for clean location matching (lowercase, trimmed, removes extra punctuation).
 */
export function normalizeLocationStr(str?: string | null): string {
  if (!str) return '';
  return str.toLowerCase().replace(/[^a-z0-9]/g, ' ').trim();
}

/**
 * Checks whether an order's address matches an entity's operational location (Vendor or Delivery Partner).
 * 
 * Rules:
 * 1. Pincode exact match takes top precedence (e.g., '560038' === '560038').
 * 2. Area name match or substring match (e.g., 'Indiranagar' matches 'Indiranagar' or '100ft Road, Indiranagar').
 * 3. Full address text substring match.
 */
export function isSameLocation(
  orderAddress?: Partial<Address> | null,
  operationalZone?: {
    area?: string;
    city?: string;
    pincode?: string;
    address?: string;
    operatingArea?: string;
    operatingCity?: string;
    operatingPincode?: string;
  } | null
): boolean {
  if (!orderAddress || !operationalZone) return true; // Safe fallback

  const orderPin = (orderAddress.pincode || '').trim();
  const opPin = (operationalZone.pincode || operationalZone.operatingPincode || '').trim();

  // 1. Pincode match
  if (orderPin && opPin && orderPin === opPin) {
    return true;
  }

  const orderArea = normalizeLocationStr(orderAddress.area);
  const opArea = normalizeLocationStr(operationalZone.area || operationalZone.operatingArea);

  // 2. Area match
  if (orderArea && opArea) {
    if (orderArea === opArea || orderArea.includes(opArea) || opArea.includes(orderArea)) {
      return true;
    }
  }

  // 3. Fallback: Search in full address string
  const opAddress = normalizeLocationStr(operationalZone.address);
  const orderStreet = normalizeLocationStr(orderAddress.street);

  if (orderArea && opAddress && opAddress.includes(orderArea)) {
    return true;
  }
  if (opArea && orderStreet && orderStreet.includes(opArea)) {
    return true;
  }

  // If both have specific areas but they differ and neither matches:
  if (orderArea && opArea && orderArea !== opArea) {
    return false;
  }

  return true;
}

/**
 * Resolves the best matching vendor for a category based on the customer's delivery location.
 */
export function findSameLocationVendor(
  vendors: Vendor[],
  category: string,
  customerAddress?: Partial<Address> | null
): Vendor {
  const categoryVendors = vendors.filter(v => v.category === category);
  if (categoryVendors.length === 0) {
    return vendors[0];
  }

  if (!customerAddress) {
    return categoryVendors[0];
  }

  // Look for exact location match first
  const exactMatch = categoryVendors.find(v => isSameLocation(customerAddress, {
    area: v.area,
    city: v.city,
    pincode: v.pincode,
    address: v.address
  }));

  return exactMatch || categoryVendors[0];
}

/**
 * Resolves the best matching delivery partner based on the customer's delivery location.
 */
export function findSameLocationDeliveryPartner(
  deliveryPartners: DeliveryPartner[],
  customerAddress?: Partial<Address> | null
): DeliveryPartner {
  if (!deliveryPartners || deliveryPartners.length === 0) {
    throw new Error('No delivery partners available');
  }

  if (!customerAddress) {
    return deliveryPartners[0];
  }

  // Look for online matching partner in the same operating area
  const matchedPartner = deliveryPartners.find(p => 
    p.isOnline && isSameLocation(customerAddress, {
      operatingArea: p.operatingArea,
      operatingCity: p.operatingCity,
      operatingPincode: p.operatingPincode
    })
  );

  if (matchedPartner) return matchedPartner;

  // Next look for any partner in the same operating area (even if toggled offline in demo)
  const areaPartner = deliveryPartners.find(p => 
    isSameLocation(customerAddress, {
      operatingArea: p.operatingArea,
      operatingCity: p.operatingCity,
      operatingPincode: p.operatingPincode
    })
  );

  return areaPartner || deliveryPartners[0];
}
