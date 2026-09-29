import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  User, UserRole, Vendor, Product, CartItem, Order, OrderStatus, 
  ServiceBooking, CabBooking, PrintOrder, Address, Coupon, SupportTicket,
  DeliveryPartner, Technician, MainCategory
} from '../types';
import { 
  INITIAL_VENDORS, INITIAL_PRODUCTS, INITIAL_DELIVERY_PARTNERS, 
  INITIAL_TECHNICIANS, INITIAL_ADDRESSES, INITIAL_COUPONS 
} from '../data/mockData';
import { soundService } from '../lib/audio';
import { auth, googleProvider, signInWithPopup, fbSignOut, onAuthStateChanged, db, testFirebaseConnection, handleFirestoreError, OperationType } from '../lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { isSameLocation, findSameLocationVendor, findSameLocationDeliveryPartner } from '../utils/locationMatch';

interface AppContextType {
  // Auth & Role
  currentUser: User;
  activeRole: UserRole;
  setActiveRole: (role: UserRole) => void;
  loginWithGoogle: () => Promise<void>;
  loginAsDemoUser: (role: UserRole, customName?: string) => void;
  logout: () => void;

  // Sound & Alerts
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  isRinging: boolean;
  stopRing: () => void;
  playTestRing: () => void;

  // Selected entities for role views
  activeVendorId: string;
  setActiveVendorId: (id: string) => void;
  loggedVendorId: string | null;
  vendorLoginWithPhone: (phone: string, category: MainCategory) => { success: boolean; message: string; vendor?: Vendor };
  vendorSignUpWithPhone: (data: {
    phone: string;
    category: MainCategory;
    name: string;
    businessName?: string;
    area: string;
    city: string;
    pincode: string;
    address?: string;
    fssaiNumber?: string;
    drugLicense?: string;
    liquorLicense?: string;
  }) => { success: boolean; message: string; vendor: Vendor };
  vendorLogout: () => void;
  activeDeliveryPartnerId: string;
  setActiveDeliveryPartnerId: (id: string) => void;
  activeTechnicianId: string;
  setActiveTechnicianId: (id: string) => void;

  // Catalog & Inventory
  products: Product[];
  vendors: Vendor[];
  deliveryPartners: DeliveryPartner[];
  technicians: Technician[];
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  updateVendorKyc: (vendorId: string, status: 'verified' | 'rejected') => void;
  deleteVendor: (vendorId: string) => void;
  deleteDeliveryPartner: (partnerId: string) => void;
  deleteTechnician: (technicianId: string) => void;

  // Cart & Multi-vendor
  cart: CartItem[];
  addToCart: (product: Product, options?: Partial<CartItem>) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  cartTotalCount: number;
  appliedCoupon: Coupon | null;
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;

  // Addresses & Location
  addresses: Address[];
  selectedAddress: Address;
  setSelectedAddress: (addr: Address) => void;
  addAddress: (addr: Omit<Address, 'id'>) => void;

  // Orders & State Machine
  orders: Order[];
  placeOrder: (paymentMethod: 'UPI' | 'Card' | 'NetBanking' | 'Wallet' | 'COD', notes?: string) => Order[];
  updateOrderStatus: (orderId: string, newStatus: OrderStatus) => void;
  assignDeliveryPartner: (orderId: string, partnerId: string) => void;
  verifyDeliveryOtp: (orderId: string, otp: string) => { success: boolean; message: string };
  rateOrder: (orderId: string, rating: number, review?: string) => void;

  // Service Bookings (Technicians)
  serviceBookings: ServiceBooking[];
  bookTechnician: (data: Omit<ServiceBooking, 'id' | 'status' | 'placedAt'>) => ServiceBooking;
  updateServiceBookingStatus: (bookingId: string, status: ServiceBooking['status']) => void;

  // Cabs
  cabBookings: CabBooking[];
  bookCab: (data: Omit<CabBooking, 'id' | 'status' | 'otp' | 'placedAt'>) => CabBooking;
  updateCabStatus: (bookingId: string, status: CabBooking['status']) => void;

  // PRINTS
  printOrders: PrintOrder[];
  submitPrintOrder: (data: Omit<PrintOrder, 'id' | 'status' | 'placedAt'>) => PrintOrder;
  updatePrintStatus: (id: string, status: PrintOrder['status']) => void;
  assignPrintDeliveryPartner: (printOrderId: string, partnerId: string) => void;
  verifyPrintDeliveryOtp: (printOrderId: string, otp: string) => { success: boolean; message: string };

  // Support & Dispute
  supportTickets: SupportTicket[];
  createSupportTicket: (ticket: Omit<SupportTicket, 'id' | 'status' | 'createdAt'>) => void;
  resolveSupportTicket: (id: string, resolution: string) => void;

  // In-app Notifications
  notifications: { id: string; title: string; message: string; time: string; read: boolean; type?: string }[];
  markNotificationRead: (id: string) => void;
  clearAllNotifications: () => void;

  // Language (English / Bengali)
  language: 'en' | 'bn';
  setLanguage: (lang: 'en' | 'bn') => void;
  t: (en: string, bn: string) => string;
}

const defaultUser: User = {
  id: 'user_cust_1',
  name: 'Subhajit Jana',
  email: 'subhajitjana289@gmail.com',
  phone: '+91 98765 00112',
  role: 'customer',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
  createdAt: new Date().toISOString()
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Local persistence helpers
  const [currentUser, setCurrentUser] = useState<User>(() => {
    const saved = localStorage.getItem('cs_user');
    return saved ? JSON.parse(saved) : defaultUser;
  });

  const [activeRole, setActiveRole] = useState<UserRole>('customer');
  const [language, setLanguageState] = useState<'en' | 'bn'>(() => {
    const saved = localStorage.getItem('cs_lang');
    return (saved === 'bn' || saved === 'en') ? saved : 'en';
  });

  const setLanguage = (lang: 'en' | 'bn') => {
    setLanguageState(lang);
    localStorage.setItem('cs_lang', lang);
  };

  const t = (en: string, bn: string) => {
    return language === 'bn' ? (bn || en) : en;
  };
  const [loggedVendorId, setLoggedVendorId] = useState<string | null>(() => {
    return localStorage.getItem('cs_logged_vendor_id');
  });
  const [activeVendorId, setActiveVendorId] = useState<string>(() => {
    return localStorage.getItem('cs_logged_vendor_id') || 'v_grocery_1';
  });
  const [activeDeliveryPartnerId, setActiveDeliveryPartnerId] = useState<string>('dp_1');
  const [activeTechnicianId, setActiveTechnicianId] = useState<string>('tech_1');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isRinging, setIsRinging] = useState<boolean>(false);

  // Core collections
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('cs_products');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  const [vendors, setVendors] = useState<Vendor[]>(() => {
    const saved = localStorage.getItem('cs_vendors');
    return saved ? JSON.parse(saved) : INITIAL_VENDORS;
  });

  const [deliveryPartners, setDeliveryPartners] = useState<DeliveryPartner[]>(() => {
    const saved = localStorage.getItem('cs_delivery_partners');
    return saved ? JSON.parse(saved) : INITIAL_DELIVERY_PARTNERS;
  });

  const [technicians, setTechnicians] = useState<Technician[]>(() => {
    const saved = localStorage.getItem('cs_technicians');
    return saved ? JSON.parse(saved) : INITIAL_TECHNICIANS;
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('cs_cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [addresses, setAddresses] = useState<Address[]>(INITIAL_ADDRESSES);
  const [selectedAddress, setSelectedAddress] = useState<Address>(INITIAL_ADDRESSES[0]);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);

  // Orders state
  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('cs_orders');
    return saved ? JSON.parse(saved) : [];
  });

  const [serviceBookings, setServiceBookings] = useState<ServiceBooking[]>(() => {
    const saved = localStorage.getItem('cs_service_bookings');
    return saved ? JSON.parse(saved) : [];
  });

  const [cabBookings, setCabBookings] = useState<CabBooking[]>(() => {
    const saved = localStorage.getItem('cs_cab_bookings');
    return saved ? JSON.parse(saved) : [];
  });

  const [printOrders, setPrintOrders] = useState<PrintOrder[]>(() => {
    const saved = localStorage.getItem('cs_print_orders');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {
        // fallback
      }
    }
    return [
      {
        id: 'PRT-88210',
        customerId: 'user_cust_1',
        customerName: 'Subhajit Jana',
        customerPhone: '+91 98765 00112',
        customerAddress: {
          id: 'addr_sample',
          label: 'Home',
          street: '100ft Road, Near KFC Junction',
          area: 'Indiranagar',
          city: 'Bengaluru',
          pincode: '560038'
        },
        fileName: 'Engineering_Project_Documentation.pdf',
        pages: 24,
        copies: 2,
        colorMode: 'Color',
        paperType: 'Bond 100 GSM',
        binding: 'Spiral',
        deliveryType: 'Delivery',
        totalAmount: 260,
        status: 'PRINTING',
        vendorId: 'v_prints_1',
        vendorName: 'PrintFast Digital Works',
        storeName: 'PrintFast Digital Works',
        storeAddress: 'Opposite University Gate, MG Road',
        deliveryOtp: '4829',
        placedAt: new Date(Date.now() - 10 * 60000).toISOString()
      }
    ];
  });

  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>(() => {
    const saved = localStorage.getItem('cs_tickets');
    return saved ? JSON.parse(saved) : [
      {
        id: 'tick_101',
        customerId: 'user_cust_1',
        customerName: 'Subhajit Jana',
        category: 'Quality Issue',
        subject: 'Packaging for fresh juice was slightly leaking',
        message: 'The mango juice arrived quickly but the seal cap was loosely screwed. Kindly advise the vendor.',
        status: 'In Progress',
        createdAt: '2026-09-02T14:20:00Z'
      }
    ];
  });

  const [notifications, setNotifications] = useState<{ id: string; title: string; message: string; time: string; read: boolean; type?: string }[]>([
    {
      id: 'notif_welcome',
      title: 'Welcome to Customar Solutions',
      message: 'Everything you need, delivered! Enjoy flat ₹50 off with code CUSTOMAR50.',
      time: 'Just now',
      read: false,
      type: 'info'
    }
  ]);

  // Sync state to LocalStorage
  useEffect(() => {
    localStorage.setItem('cs_user', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('cs_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('cs_vendors', JSON.stringify(vendors));
  }, [vendors]);

  useEffect(() => {
    localStorage.setItem('cs_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('cs_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('cs_service_bookings', JSON.stringify(serviceBookings));
  }, [serviceBookings]);

  useEffect(() => {
    localStorage.setItem('cs_cab_bookings', JSON.stringify(cabBookings));
  }, [cabBookings]);

  useEffect(() => {
    localStorage.setItem('cs_print_orders', JSON.stringify(printOrders));
  }, [printOrders]);

  useEffect(() => {
    localStorage.setItem('cs_tickets', JSON.stringify(supportTickets));
  }, [supportTickets]);

  // Test Firebase connection on mount
  useEffect(() => {
    testFirebaseConnection();
  }, []);

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        const updatedUser: User = {
          id: fbUser.uid,
          name: fbUser.displayName || 'Google User',
          email: fbUser.email || '',
          phone: fbUser.phoneNumber || '+91 98765 43210',
          role: currentUser.role || 'customer',
          avatar: fbUser.photoURL || undefined,
          createdAt: new Date().toISOString()
        };
        setCurrentUser(updatedUser);
      }
    });
    return () => unsubscribe();
  }, []);

  const addNotification = (title: string, message: string, type: string = 'order') => {
    const newNotif = {
      id: 'notif_' + Date.now() + Math.random().toString(36).substr(2, 4),
      title,
      message,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: false,
      type
    };
    setNotifications(prev => [newNotif, ...prev.slice(0, 30)]);
  };

  const loginWithGoogle = async () => {
    try {
      const res = await signInWithPopup(auth, googleProvider);
      if (res.user) {
        soundService.playChime('success');
        addNotification('Signed In', `Welcome back, ${res.user.displayName || 'Customer'}!`, 'auth');
      }
    } catch (err: any) {
      console.warn('Google sign-in popup closed or restricted in iframe:', err);
      // Fallback seamlessly to guest/demo signin
      loginAsDemoUser('customer', 'Subhajit Jana');
    }
  };

  const loginAsDemoUser = (role: UserRole, customName?: string) => {
    const roleNames: Record<UserRole, string> = {
      customer: customName || 'Subhajit Jana',
      vendor: 'Ramesh (Store Partner)',
      delivery: 'Rajesh Kumar (EV Rider)',
      technician: 'Ramesh Mistri (Home Pro)',
      driver: 'Suresh Rao (Cab Captain)',
      cabs: 'Suresh Rao (Cab Captain)',
      admin: 'Central Operations Admin'
    };

    const newUser: User = {
      id: `usr_${role}_${Date.now()}`,
      name: roleNames[role],
      email: `${role}@customar.local`,
      phone: '+91 98765 00112',
      role,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
      createdAt: new Date().toISOString()
    };
    setCurrentUser(newUser);
    setActiveRole(role);
    soundService.playChime('click');
    addNotification('Switched Role', `Switched view to ${role.toUpperCase()}: ${newUser.name}`, 'info');
  };

  const logout = async () => {
    try {
      await fbSignOut(auth);
    } catch (e) {
      console.warn(e);
    }
    setCurrentUser(defaultUser);
    setActiveRole('customer');
    soundService.playChime('click');
  };

  const playTestRing = () => {
    if (!soundEnabled) return;
    setIsRinging(true);
    soundService.startOrderRing(10);
  };

  const stopRing = () => {
    soundService.stopOrderRing();
    setIsRinging(false);
  };

  // Cart operations
  const addToCart = (product: Product, options?: Partial<CartItem>) => {
    if (product.stock <= 0) return;

    soundService.playChime('click');
    setCart(prev => {
      const existingIndex = prev.findIndex(item => 
        item.product.id === product.id &&
        item.selectedSize === options?.selectedSize &&
        item.selectedCut === options?.selectedCut &&
        item.selectedSugar === options?.selectedSugar
      );

      if (existingIndex > -1) {
        const updated = [...prev];
        const currentQty = updated[existingIndex].quantity;
        if (currentQty < product.stock) {
          updated[existingIndex].quantity += 1;
        }
        return updated;
      } else {
        return [...prev, {
          product,
          quantity: 1,
          selectedSize: options?.selectedSize,
          selectedSugar: options?.selectedSugar,
          selectedIce: options?.selectedIce,
          selectedCut: options?.selectedCut,
          selectedCleaning: options?.selectedCleaning,
          prescriptionUrl: options?.prescriptionUrl
        }];
      }
    });
  };

  const removeFromCart = (productId: string) => {
    soundService.playChime('click');
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    soundService.playChime('click');
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prev => prev.map(item => {
      if (item.product.id === productId) {
        const boundedQty = Math.min(quantity, item.product.stock);
        return { ...item, quantity: boundedQty };
      }
      return item;
    }));
  };

  const clearCart = () => {
    setCart([]);
    setAppliedCoupon(null);
  };

  const cartTotalCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const applyCoupon = (code: string): { success: boolean; message: string } => {
    const cleanCode = code.trim().toUpperCase();
    const coupon = INITIAL_COUPONS.find(c => c.code === cleanCode);
    if (!coupon) {
      return { success: false, message: 'Invalid coupon code. Try CUSTOMAR50 or FREEDEL.' };
    }

    const currentSubtotal = cart.reduce((sum, i) => sum + (i.product.price * i.quantity), 0);
    if (currentSubtotal < coupon.minOrder) {
      return { success: false, message: `Minimum order of ₹${coupon.minOrder} required for ${coupon.code}.` };
    }

    setAppliedCoupon(coupon);
    soundService.playChime('success');
    return { success: true, message: `Coupon ${coupon.code} applied successfully!` };
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    soundService.playChime('click');
  };

  const addAddress = (addr: Omit<Address, 'id'>) => {
    const newAddr: Address = {
      ...addr,
      id: 'addr_' + Date.now()
    };
    setAddresses(prev => [newAddr, ...prev]);
    setSelectedAddress(newAddr);
    soundService.playChime('success');
  };

  // Place Order with Multi-vendor Cart Partitioning logic!
  const placeOrder = (paymentMethod: 'UPI' | 'Card' | 'NetBanking' | 'Wallet' | 'COD', notes?: string): Order[] => {
    if (cart.length === 0) return [];

    // Group items by vendorId for true multi-vendor separation
    const vendorMap: { [vendorId: string]: CartItem[] } = {};
    cart.forEach(item => {
      const vId = item.product.vendorId || 'v_grocery_1';
      if (!vendorMap[vId]) vendorMap[vId] = [];
      vendorMap[vId].push(item);
    });

    const createdOrders: Order[] = [];
    const now = new Date().toISOString();

    // Reduce inventory automatically!
    setProducts(prevProducts => {
      return prevProducts.map(prod => {
        const inCart = cart.find(ci => ci.product.id === prod.id);
        if (inCart) {
          const newStock = Math.max(0, prod.stock - inCart.quantity);
          return {
            ...prod,
            stock: newStock,
            isAvailable: newStock > 0
          };
        }
        return prod;
      });
    });

    Object.entries(vendorMap).forEach(([vId, items]) => {
      const initialVendor = vendors.find(v => v.id === vId) || vendors[0];
      // Resolve vendor of the exact same location matching customer's delivery location
      const vendor = findSameLocationVendor(vendors, initialVendor.category, selectedAddress);
      const itemTotal = items.reduce((sum, i) => sum + (i.product.price * i.quantity), 0);
      const deliveryFee = appliedCoupon?.code === 'FREEDEL' ? 0 : 25;
      const platformFee = 5;
      const tax = Math.round(itemTotal * 0.05);

      let discount = 0;
      if (appliedCoupon) {
        if (appliedCoupon.discountType === 'flat') {
          discount = appliedCoupon.discountValue;
        } else {
          discount = Math.min(Math.round((itemTotal * appliedCoupon.discountValue) / 100), appliedCoupon.maxDiscount || 100);
        }
      }

      const totalAmount = Math.max(0, itemTotal + deliveryFee + platformFee + tax - discount);
      // Generate 4-digit verification OTP
      const deliveryOtp = Math.floor(1000 + Math.random() * 9000).toString();

      const newOrder: Order = {
        id: 'CS-' + Math.floor(100000 + Math.random() * 900000),
        customerId: currentUser.id,
        customerName: currentUser.name,
        customerPhone: currentUser.phone,
        deliveryAddress: selectedAddress,
        vendorId: vendor.id,
        vendorName: vendor.name,
        vendorAddress: `${vendor.address} (${vendor.area || 'Local Hub'})`,
        category: vendor.category,
        items,
        itemTotal,
        deliveryFee,
        platformFee,
        tax,
        discount,
        totalAmount,
        paymentMethod,
        paymentStatus: 'paid',
        status: 'PLACED',
        deliveryOtp,
        prepTimeEstimateMinutes: items[0]?.product.prepTimeMinutes || 12,
        placedAt: now,
        updatedAt: now,
        deliveryNotes: notes
      };

      createdOrders.push(newOrder);

      // Save to Firestore if authenticated
      if (auth.currentUser) {
        try {
          setDoc(doc(db, 'orders', newOrder.id), {
            ...newOrder,
            items: newOrder.items.map(i => ({
              productId: i.product.id,
              name: i.product.name,
              quantity: i.quantity,
              price: i.product.price
            }))
          }).catch(err => {
            if (err?.code === 'permission-denied') {
              handleFirestoreError(err, OperationType.CREATE, `orders/${newOrder.id}`);
            }
          });
        } catch (e) {
          console.warn('Firebase order push notice:', e);
        }
      }
    });

    setOrders(prev => [...createdOrders, ...prev]);
    clearCart();

    // Trigger LOUD VENDOR ORDER RING!
    if (soundEnabled) {
      setIsRinging(true);
      soundService.startOrderRing(15);
    }

    addNotification(
      'Order Placed!',
      `Order #${createdOrders[0].id} placed with ${createdOrders[0].vendorName}. Vendor has been alerted with an incoming order ring!`,
      'order'
    );

    return createdOrders;
  };

  // State machine progression handler
  const updateOrderStatus = (orderId: string, newStatus: OrderStatus) => {
    soundService.playChime('alert');

    // If order is accepted or rejected, stop active ring
    if (newStatus === 'ACCEPTED' || newStatus === 'CANCELLED') {
      stopRing();
    }

    // If order marked READY_FOR_PICKUP: trigger Delivery Partner loud ring search!
    if (newStatus === 'READY_FOR_PICKUP') {
      if (soundEnabled) {
        setIsRinging(true);
        soundService.startOrderRing(15);
      }
      addNotification(
        'Order Ready for Pickup',
        `Order #${orderId} is packed! Searching and ringing nearby Delivery Partners.`,
        'delivery'
      );
    }

    setOrders(prev => prev.map(order => {
      if (order.id === orderId) {
        const updated: Order = {
          ...order,
          status: newStatus,
          updatedAt: new Date().toISOString()
        };

        if (newStatus === 'DELIVERED') {
          updated.deliveredAt = new Date().toISOString();
        }

        if (newStatus === 'CANCELLED') {
          updated.paymentStatus = 'refunded';
        }

        // Assign default nearby delivery partner of the exact same location automatically if entering delivery flow
        if (newStatus === 'DELIVERY_ASSIGNED' && !order.deliveryPartnerId) {
          const partner = findSameLocationDeliveryPartner(deliveryPartners, order.deliveryAddress);
          updated.deliveryPartnerId = partner.id;
          updated.deliveryPartnerName = partner.name;
          updated.deliveryPartnerPhone = partner.phone;
          updated.deliveryPartnerVehicle = `${partner.vehicleType} (${partner.vehicleNumber})`;
        }

        return updated;
      }
      return order;
    }));

    addNotification(
      `Order Status Update`,
      `Order #${orderId} is now ${newStatus.replace(/_/g, ' ')}.`,
      'status'
    );
  };

  const assignDeliveryPartner = (orderId: string, partnerId: string) => {
    const partner = deliveryPartners.find(p => p.id === partnerId) || deliveryPartners[0];
    stopRing();

    setOrders(prev => prev.map(order => {
      if (order.id === orderId) {
        return {
          ...order,
          status: 'DELIVERY_ASSIGNED',
          deliveryPartnerId: partner.id,
          deliveryPartnerName: partner.name,
          deliveryPartnerPhone: partner.phone,
          deliveryPartnerVehicle: `${partner.vehicleType} (${partner.vehicleNumber})`,
          updatedAt: new Date().toISOString()
        };
      }
      return order;
    }));

    soundService.playChime('success');
    addNotification(
      'Delivery Partner Assigned',
      `${partner.name} has accepted order #${orderId} and is heading to the store.`,
      'delivery'
    );
  };

  const verifyDeliveryOtp = (orderId: string, otp: string): { success: boolean; message: string } => {
    const targetOrder = orders.find(o => o.id === orderId);
    if (!targetOrder) {
      return { success: false, message: 'Order not found.' };
    }

    if (targetOrder.deliveryOtp !== otp.trim()) {
      soundService.playChime('alert');
      return { success: false, message: 'Incorrect OTP! Please verify with the customer.' };
    }

    updateOrderStatus(orderId, 'DELIVERED');
    soundService.playChime('success');

    // Update partner earnings & stats
    setDeliveryPartners(prev => prev.map(p => {
      if (p.id === targetOrder.deliveryPartnerId) {
        return {
          ...p,
          todayEarnings: p.todayEarnings + 65,
          totalDeliveries: p.totalDeliveries + 1
        };
      }
      return p;
    }));

    return { success: true, message: 'OTP verified successfully! Order delivered.' };
  };

  const rateOrder = (orderId: string, rating: number, review?: string) => {
    soundService.playChime('success');
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        return {
          ...o,
          customerRating: rating,
          customerReview: review
        };
      }
      return o;
    }));
    addNotification('Review Submitted', `Thank you for rating order #${orderId} ⭐${rating}`, 'review');
  };

  // Technician booking
  const bookTechnician = (data: Omit<ServiceBooking, 'id' | 'status' | 'placedAt'>): ServiceBooking => {
    const newBooking: ServiceBooking = {
      ...data,
      id: 'SB-' + Math.floor(1000 + Math.random() * 9000),
      status: 'REQUESTED',
      placedAt: new Date().toISOString()
    };
    setServiceBookings(prev => [newBooking, ...prev]);

    if (soundEnabled) {
      soundService.playChime('alert');
    }
    addNotification(
      'Service Booked',
      `Requested ${data.technicianCategory} service. Technician notification sent.`,
      'service'
    );
    return newBooking;
  };

  const updateServiceBookingStatus = (bookingId: string, status: ServiceBooking['status']) => {
    soundService.playChime('click');
    setServiceBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status } : b));
  };

  // Cab booking
  const bookCab = (data: Omit<CabBooking, 'id' | 'status' | 'otp' | 'placedAt'>): CabBooking => {
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const newBooking: CabBooking = {
      ...data,
      id: 'CAB-' + Math.floor(10000 + Math.random() * 90000),
      status: 'SEARCHING',
      otp,
      driverName: 'Suresh Rao',
      driverPhone: '+91 98440 22334',
      driverRating: 4.9,
      vehicleNumber: 'KA-04-E-8812',
      placedAt: new Date().toISOString()
    };
    setCabBookings(prev => [newBooking, ...prev]);

    if (soundEnabled) {
      soundService.playChime('alert');
    }
    addNotification('Cab Ride Requested', `Looking for nearest ${data.vehicleType}...`, 'cab');
    return newBooking;
  };

  const updateCabStatus = (bookingId: string, status: CabBooking['status']) => {
    soundService.playChime('click');
    setCabBookings(prev => prev.map(c => c.id === bookingId ? { ...c, status } : c));
  };

  // Print orders
  const submitPrintOrder = (data: Omit<PrintOrder, 'id' | 'status' | 'placedAt'>): PrintOrder => {
    const matchedVendor = findSameLocationVendor(vendors, 'prints', selectedAddress);
    const newOrder: PrintOrder = {
      ...data,
      id: 'PRT-' + Math.floor(10000 + Math.random() * 90000),
      status: 'SUBMITTED',
      customerPhone: currentUser.phone || '+91 98765 00112',
      customerAddress: selectedAddress,
      vendorId: matchedVendor.id,
      vendorName: matchedVendor.name,
      storeName: matchedVendor.name,
      storeAddress: matchedVendor.address,
      storeArea: matchedVendor.area || 'Indiranagar',
      storeCity: matchedVendor.city || 'Bengaluru',
      storePincode: matchedVendor.pincode || '560038',
      deliveryOtp: Math.floor(1000 + Math.random() * 9000).toString(),
      placedAt: new Date().toISOString()
    };
    setPrintOrders(prev => [newOrder, ...prev]);

    // Trigger LOUD PRINTS VENDOR ORDER RING!
    if (soundEnabled) {
      setIsRinging(true);
      soundService.startOrderRing(20);
    }

    const store = newOrder.storeName || 'Local Print Store';
    const isPickup = data.deliveryType === 'Pickup';
    addNotification(
      isPickup ? 'Print Order Placed (Self Store Pickup)! 🏬' : 'Print Order Placed (Doorstep Delivery)! 🔔',
      `Document "${data.fileName}" sent to ${store} (${newOrder.storeArea || 'Local Hub'}). Fulfillment: ${isPickup ? 'Self Store Pickup (Collect from counter)' : 'Doorstep Delivery'}.`,
      'print'
    );
    return newOrder;
  };

  const updatePrintStatus = (id: string, status: PrintOrder['status']) => {
    soundService.playChime('alert');
    
    // When Print Vendor marks READY ('READY_FOR_PICKUP' or 'PRINT_READY')
    if (status === 'READY_FOR_PICKUP' || status === 'PRINT_READY') {
      const targetPrint = printOrders.find(p => p.id === id);
      const isSelfPickup = targetPrint?.deliveryType === 'Pickup';

      if (!isSelfPickup) {
        // Trigger Delivery Boy ring ONLY if customer chose Doorstep Delivery!
        if (soundEnabled) {
          setIsRinging(true);
          soundService.startOrderRing(25);
        }
        try {
          if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
            navigator.vibrate([400, 200, 400, 200, 600]);
          }
        } catch {
          // ignore vibration error
        }

        addNotification(
          '🛵 Delivery Partner Ring! Print Ready',
          `Print order #${id} (${targetPrint?.fileName || 'Document'}) is printed and ready for pickup at ${targetPrint?.storeName || 'PrintFast'}. Delivery partner ring activated!`,
          'delivery'
        );
      } else {
        // Customer chose Self Store Pickup:
        // NO delivery partner noise! No rider ring!
        soundService.playChime('success');
        addNotification(
          '🏬 Print Ready for Store Pickup!',
          `Print order #${id} (${targetPrint?.fileName || 'Document'}) is ready! Waiting for customer ${targetPrint?.customerName || ''} at store counter.`,
          'print'
        );
      }
    } else if (status === 'PRINTING' || status === 'DELIVERED') {
      stopRing();
      if (status === 'DELIVERED') {
        soundService.playChime('success');
        const targetPrint = printOrders.find(p => p.id === id);
        const isSelfPickup = targetPrint?.deliveryType === 'Pickup';
        addNotification(
          isSelfPickup ? '✅ Store Pickup Completed!' : '✅ Print Delivered!',
          `Print order #${id} (${targetPrint?.fileName || 'Document'}) confirmed delivered and handed over to customer.`,
          'print'
        );
      }
    }

    setPrintOrders(prev => prev.map(p => {
      if (p.id === id) {
        const updated = { ...p, status };
        if (status === 'DELIVERED') {
          updated.deliveredAt = new Date().toISOString();
        }
        return updated;
      }
      return p;
    }));
  };

  const assignPrintDeliveryPartner = (printOrderId: string, partnerId: string) => {
    const partner = deliveryPartners.find(p => p.id === partnerId) || deliveryPartners[0];
    stopRing();

    setPrintOrders(prev => prev.map(p => {
      if (p.id === printOrderId) {
        return {
          ...p,
          status: 'DELIVERY_ASSIGNED',
          deliveryPartnerId: partner.id,
          deliveryPartnerName: partner.name,
          deliveryPartnerPhone: partner.phone,
          deliveryPartnerVehicle: `${partner.vehicleType} (${partner.vehicleNumber})`
        };
      }
      return p;
    }));

    soundService.playChime('success');
    addNotification(
      'Delivery Partner Assigned',
      `${partner.name} accepted Print #${printOrderId} delivery and is heading to the print store.`,
      'delivery'
    );
  };

  const verifyPrintDeliveryOtp = (printOrderId: string, otp: string): { success: boolean; message: string } => {
    const targetPrint = printOrders.find(p => p.id === printOrderId);
    if (!targetPrint) {
      return { success: false, message: 'Print order not found.' };
    }

    if (targetPrint.deliveryOtp && targetPrint.deliveryOtp !== otp.trim()) {
      soundService.playChime('alert');
      return { success: false, message: 'Incorrect OTP! Please check with the customer.' };
    }

    updatePrintStatus(printOrderId, 'DELIVERED');
    soundService.playChime('success');

    // Update partner earnings (+₹50 for print delivery trip)
    setDeliveryPartners(prev => prev.map(p => {
      if (p.id === (targetPrint.deliveryPartnerId || activeDeliveryPartnerId)) {
        return {
          ...p,
          todayEarnings: p.todayEarnings + 50,
          totalDeliveries: p.totalDeliveries + 1
        };
      }
      return p;
    }));

    return { success: true, message: 'OTP verified! Print document successfully delivered.' };
  };

  // Vendor product management
  const addProduct = (productData: Omit<Product, 'id'>) => {
    const newProd: Product = {
      ...productData,
      id: 'p_custom_' + Date.now()
    };
    setProducts(prev => [newProd, ...prev]);
    soundService.playChime('success');
    addNotification('Product Added', `${newProd.name} added to catalog.`, 'inventory');
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
    soundService.playChime('click');
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
    soundService.playChime('alert');
  };

  const updateVendorKyc = (vendorId: string, status: 'verified' | 'rejected') => {
    setVendors(prev => prev.map(v => v.id === vendorId ? { ...v, kycStatus: status } : v));
    soundService.playChime('success');
    addNotification('KYC Updated', `Vendor ${vendorId} KYC status changed to ${status}.`, 'admin');
  };

  const deleteVendor = (vendorId: string) => {
    const toDelete = vendors.find(v => v.id === vendorId);
    const storeName = toDelete?.name || vendorId;
    
    setVendors(prev => {
      const updated = prev.filter(v => v.id !== vendorId);
      localStorage.setItem('cs_vendors', JSON.stringify(updated));
      return updated;
    });

    // Also clean up products belonging to this vendor
    setProducts(prev => {
      const updated = prev.filter(p => p.vendorId !== vendorId);
      localStorage.setItem('cs_products', JSON.stringify(updated));
      return updated;
    });

    if (activeVendorId === vendorId) {
      const nextVendor = vendors.find(v => v.id !== vendorId);
      setActiveVendorId(nextVendor ? nextVendor.id : '');
    }

    if (loggedVendorId === vendorId) {
      setLoggedVendorId(null);
      localStorage.removeItem('cs_logged_vendor_id');
    }

    soundService.playChime('alert');
    addNotification('Store Deleted', `Store "${storeName}" has been permanently removed by Central Admin.`, 'admin');
  };

  const deleteDeliveryPartner = (partnerId: string) => {
    const toDelete = deliveryPartners.find(p => p.id !== partnerId);
    const partnerName = toDelete?.name || partnerId;

    setDeliveryPartners(prev => {
      const updated = prev.filter(p => p.id !== partnerId);
      localStorage.setItem('cs_delivery_partners', JSON.stringify(updated));
      return updated;
    });

    if (activeDeliveryPartnerId === partnerId) {
      const nextPartner = deliveryPartners.find(p => p.id !== partnerId);
      setActiveDeliveryPartnerId(nextPartner ? nextPartner.id : '');
    }

    soundService.playChime('alert');
    addNotification('Rider Deleted', `Delivery Partner "${partnerName}" has been removed by Central Admin.`, 'admin');
  };

  const deleteTechnician = (technicianId: string) => {
    const toDelete = technicians.find(t => t.id !== technicianId);
    const techName = toDelete?.name || technicianId;

    setTechnicians(prev => {
      const updated = prev.filter(t => t.id !== technicianId);
      localStorage.setItem('cs_technicians', JSON.stringify(updated));
      return updated;
    });

    if (activeTechnicianId === technicianId) {
      const nextTech = technicians.find(t => t.id !== technicianId);
      setActiveTechnicianId(nextTech ? nextTech.id : '');
    }

    soundService.playChime('alert');
    addNotification('Technician Deleted', `Technician "${techName}" has been removed by Central Admin.`, 'admin');
  };

  // Vendor Partner Mobile-Only Auth
  const vendorLoginWithPhone = (phone: string, category: MainCategory): { success: boolean; message: string; vendor?: Vendor } => {
    const cleanInputPhone = phone.replace(/\D/g, '').slice(-10);
    if (cleanInputPhone.length < 10) {
      return { success: false, message: 'Please enter a valid 10-digit mobile number' };
    }

    // 1. Look for existing vendor matching this phone AND category
    const matchingVendor = vendors.find(v => {
      const vCleanPhone = v.phone.replace(/\D/g, '').slice(-10);
      return vCleanPhone === cleanInputPhone && v.category === category;
    });

    if (matchingVendor) {
      setLoggedVendorId(matchingVendor.id);
      setActiveVendorId(matchingVendor.id);
      localStorage.setItem('cs_logged_vendor_id', matchingVendor.id);
      soundService.playChime('success');
      addNotification('Vendor Logged In', `Logged in to ${matchingVendor.name} (${category})`, 'auth');
      return { success: true, message: `Welcome back! Logged in as ${matchingVendor.name}`, vendor: matchingVendor };
    }

    // 2. Check if this phone is registered under another category
    const otherCategoryVendor = vendors.find(v => {
      const vCleanPhone = v.phone.replace(/\D/g, '').slice(-10);
      return vCleanPhone === cleanInputPhone;
    });

    if (otherCategoryVendor) {
      return {
        success: false,
        message: `This mobile number is already registered under "${otherCategoryVendor.category}" (${otherCategoryVendor.name}). Switch category to "${otherCategoryVendor.category}" or register a new store under "${category}".`
      };
    }

    return {
      success: false,
      message: 'No registered store found with this mobile number for this category. Please Sign Up to register your store.'
    };
  };

  const vendorSignUpWithPhone = (data: {
    phone: string;
    category: MainCategory;
    name: string;
    businessName?: string;
    area: string;
    city: string;
    pincode: string;
    address?: string;
    fssaiNumber?: string;
    drugLicense?: string;
    liquorLicense?: string;
  }): { success: boolean; message: string; vendor: Vendor } => {
    const cleanInputPhone = data.phone.replace(/\D/g, '').slice(-10);
    const formattedPhone = `+91 ${cleanInputPhone.slice(0, 5)} ${cleanInputPhone.slice(5)}`;

    const categoryImages: Record<string, string> = {
      grocery: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=500&auto=format&fit=crop&q=80',
      'vegetables-fruits': 'https://images.unsplash.com/photo-1610348725531-843dff563e2c?w=500&auto=format&fit=crop&q=80',
      'chips-namkeen': 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=500&auto=format&fit=crop&q=80',
      cosmetics: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=500&auto=format&fit=crop&q=80',
      'drinks-juice': 'https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=500&auto=format&fit=crop&q=80',
      'ice-cream': 'https://images.unsplash.com/photo-1501443762994-82bd5dace89a?w=500&auto=format&fit=crop&q=80',
      'fresh-foods': 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&auto=format&fit=crop&q=80',
      'fresh-fish-meats': 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=500&auto=format&fit=crop&q=80',
      pharmacy: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=500&auto=format&fit=crop&q=80',
      prints: 'https://images.unsplash.com/photo-1589330694653-dad6d3240a2a?w=500&auto=format&fit=crop&q=80',
      liquor: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=500&auto=format&fit=crop&q=80'
    };

    const newVendor: Vendor = {
      id: `v_${data.category}_${Date.now()}`,
      name: data.name,
      businessName: data.businessName || data.name,
      email: `${cleanInputPhone}@partner.customar.local`,
      phone: formattedPhone,
      category: data.category,
      address: data.address || `${data.name}, ${data.area || 'Indiranagar'}, ${data.city || 'Bengaluru'}`,
      area: data.area || 'Indiranagar',
      city: data.city || 'Bengaluru',
      pincode: data.pincode || '560038',
      rating: 5.0,
      reviewCount: 1,
      isOpen: true,
      kycStatus: 'verified',
      fssaiNumber: data.fssaiNumber || (['grocery', 'vegetables-fruits', 'drinks-juice', 'ice-cream', 'fresh-foods', 'fresh-fish-meats', 'chips-namkeen'].includes(data.category) ? '212241900' + Math.floor(10000 + Math.random() * 90000) : undefined),
      drugLicense: data.drugLicense || (data.category === 'pharmacy' ? 'DL-20B/21B-KA-' + Math.floor(10000 + Math.random() * 90000) : undefined),
      liquorLicense: data.liquorLicense || (data.category === 'liquor' ? 'EXC-KA-CL2-2024-' + Math.floor(100 + Math.random() * 900) : undefined),
      image: categoryImages[data.category] || categoryImages.grocery,
      todaySales: 0,
      totalSales: 0,
      commissionRate: 8
    };

    setVendors(prev => {
      const updated = [newVendor, ...prev];
      localStorage.setItem('cs_vendors', JSON.stringify(updated));
      return updated;
    });
    setLoggedVendorId(newVendor.id);
    setActiveVendorId(newVendor.id);
    localStorage.setItem('cs_logged_vendor_id', newVendor.id);
    soundService.playChime('success');
    addNotification('Store Registered!', `Welcome ${newVendor.name}! Your store partner account is active.`, 'auth');

    return { success: true, message: `Store ${newVendor.name} registered and activated successfully!`, vendor: newVendor };
  };

  const vendorLogout = () => {
    setLoggedVendorId(null);
    localStorage.removeItem('cs_logged_vendor_id');
    soundService.playChime('click');
    addNotification('Logged Out', 'Vendor partner session ended.', 'info');
  };

  // Support tickets
  const createSupportTicket = (ticket: Omit<SupportTicket, 'id' | 'status' | 'createdAt'>) => {
    const newTicket: SupportTicket = {
      ...ticket,
      id: 'TICK-' + Math.floor(1000 + Math.random() * 9000),
      status: 'Open',
      createdAt: new Date().toISOString()
    };
    setSupportTickets(prev => [newTicket, ...prev]);
    soundService.playChime('success');
    addNotification('Support Ticket Raised', `Ticket #${newTicket.id} created. Central team is reviewing.`, 'support');
  };

  const resolveSupportTicket = (id: string, resolution: string) => {
    setSupportTickets(prev => prev.map(t => t.id === id ? { ...t, status: 'Resolved', resolutionNotes: resolution } : t));
    soundService.playChime('success');
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  return (
    <AppContext.Provider value={{
      currentUser,
      activeRole,
      setActiveRole,
      loginWithGoogle,
      loginAsDemoUser,
      logout,
      soundEnabled,
      setSoundEnabled,
      isRinging,
      stopRing,
      playTestRing,
      activeVendorId,
      setActiveVendorId,
      loggedVendorId,
      vendorLoginWithPhone,
      vendorSignUpWithPhone,
      vendorLogout,
      activeDeliveryPartnerId,
      setActiveDeliveryPartnerId,
      activeTechnicianId,
      setActiveTechnicianId,
      products,
      vendors,
      deliveryPartners,
      technicians,
      addProduct,
      updateProduct,
      deleteProduct,
      updateVendorKyc,
      deleteVendor,
      deleteDeliveryPartner,
      deleteTechnician,
      cart,
      addToCart,
      removeFromCart,
      updateCartQuantity,
      clearCart,
      cartTotalCount,
      appliedCoupon,
      applyCoupon,
      removeCoupon,
      addresses,
      selectedAddress,
      setSelectedAddress,
      addAddress,
      orders,
      placeOrder,
      updateOrderStatus,
      assignDeliveryPartner,
      verifyDeliveryOtp,
      rateOrder,
      serviceBookings,
      bookTechnician,
      updateServiceBookingStatus,
      cabBookings,
      bookCab,
      updateCabStatus,
      printOrders,
      submitPrintOrder,
      updatePrintStatus,
      assignPrintDeliveryPartner,
      verifyPrintDeliveryOtp,
      supportTickets,
      createSupportTicket,
      resolveSupportTicket,
      notifications,
      markNotificationRead,
      clearAllNotifications,
      language,
      setLanguage,
      t
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
