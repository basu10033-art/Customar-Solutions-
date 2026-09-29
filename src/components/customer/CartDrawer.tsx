import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CartItem } from '../../types';
import { 
  X, Trash2, Plus, Minus, Tag, ShieldCheck, 
  MapPin, CheckCircle2, ArrowRight, CreditCard, 
  Wallet, Banknote, Building2, Store, Clock, AlertCircle
} from 'lucide-react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderSuccess?: (orderId: string) => void;
  onTrackOrder?: (orderId: string) => void;
  onOpenLocation?: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ 
  isOpen, 
  onClose, 
  onOrderSuccess, 
  onTrackOrder, 
  onOpenLocation 
}) => {
  const { 
    cart, removeFromCart, updateCartQuantity, clearCart, 
    appliedCoupon, applyCoupon, removeCoupon, selectedAddress,
    placeOrder, vendors
  } = useApp();

  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'Card' | 'NetBanking' | 'Wallet' | 'COD'>('UPI');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  // Multi-vendor grouping logic
  const vendorGroups: { [vendorId: string]: { vendorName: string; items: CartItem[] } } = {};
  cart.forEach(item => {
    const vId = item.product.vendorId || 'v_grocery_1';
    if (!vendorGroups[vId]) {
      const v = vendors.find(vend => vend.id === vId);
      vendorGroups[vId] = {
        vendorName: v?.name || item.product.vendorName || 'Hyperlocal Vendor',
        items: []
      };
    }
    vendorGroups[vId].items.push(item);
  });

  const uniqueVendorCount = Object.keys(vendorGroups).length;

  // Bill calculations
  const itemTotal = cart.reduce((sum, item) => sum + ((Number(item?.product?.price) || 0) * (Number(item?.quantity) || 1)), 0);
  const deliveryFee = appliedCoupon?.code === 'FREEDEL' ? 0 : 25;
  const platformFee = 5;
  const taxes = Math.round(itemTotal * 0.05);

  let discount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discountType === 'flat') {
      discount = Number(appliedCoupon.discountValue) || 0;
    } else {
      discount = Math.min(Math.round((itemTotal * (Number(appliedCoupon.discountValue) || 0)) / 100), appliedCoupon.maxDiscount || 100);
    }
  }

  const finalTotal = Math.max(0, itemTotal + deliveryFee + platformFee + taxes - discount);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError('');
    if (!couponInput.trim()) return;

    const res = applyCoupon(couponInput);
    if (!res.success) {
      setCouponError(res.message);
    } else {
      setCouponInput('');
    }
  };

  const handleCheckout = () => {
    if (cart.length === 0) return;
    setIsSubmitting(true);

    setTimeout(() => {
      const createdOrders = placeOrder(paymentMethod, deliveryNotes);
      setIsSubmitting(false);
      onClose();
      if (createdOrders.length > 0) {
        const orderId = createdOrders[0].id;
        if (typeof onOrderSuccess === 'function') {
          onOrderSuccess(orderId);
        } else if (typeof onTrackOrder === 'function') {
          onTrackOrder(orderId);
        }
      }
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        onClick={onClose} 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in"
      />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
            <div className="flex items-center gap-2">
              <h2 className="font-extrabold text-base text-slate-900">Your Basket</h2>
              <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2 py-0.5 rounded-full">
                {cart.length} {cart.length === 1 ? 'item' : 'items'}
              </span>
            </div>
            <button 
              id="close-cart-drawer-btn"
              onClick={onClose} 
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>

          {/* Body */}
          {cart.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <div className="w-20 h-20 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mb-4">
                <Store size={36} />
              </div>
              <h3 className="text-base font-bold text-slate-800 mb-1">Your cart is empty</h3>
              <p className="text-xs text-slate-500 max-w-xs mb-6">
                Explore our 13 categories to get fresh groceries, snacks, foods, medicines and more delivered in 10-15 minutes.
              </p>
              <button
                id="empty-cart-start-shopping-btn"
                onClick={onClose}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer"
              >
                Start Shopping Now
              </button>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Delivery Address Banner */}
              <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-2xl flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 truncate">
                  <div className="p-2 bg-emerald-600 text-white rounded-xl shrink-0">
                    <MapPin size={16} />
                  </div>
                  <div className="truncate">
                    <div className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
                      Delivering to {selectedAddress.label}
                    </div>
                    <div className="text-xs font-semibold text-slate-900 truncate">
                      {selectedAddress.street}, {selectedAddress.area}
                    </div>
                  </div>
                </div>
                <button
                  id="change-address-cart-btn"
                  onClick={() => onOpenLocation?.()}
                  className="text-xs font-bold text-emerald-700 hover:text-emerald-900 underline shrink-0 cursor-pointer"
                >
                  Change
                </button>
              </div>

              {/* Multi-Vendor Notification Notice if multiple vendors exist */}
              {uniqueVendorCount > 1 && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2 text-xs text-amber-900">
                  <AlertCircle size={16} className="text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-bold">Multi-Vendor Cart Split: </strong>
                    Items are from {uniqueVendorCount} separate local stores. They will be prepared and delivered by dedicated nearby partners simultaneously.
                  </div>
                </div>
              )}

              {/* Grouped Vendor Items */}
              {Object.entries(vendorGroups).map(([vId, group]) => (
                <div key={vId} className="border border-slate-200 rounded-2xl p-3.5 bg-white shadow-2xs space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <div className="flex items-center gap-2">
                      <Store size={15} className="text-teal-600" />
                      <span className="font-bold text-xs text-slate-800">{group.vendorName}</span>
                    </div>
                    <span className="text-[10px] font-semibold text-slate-400">10-15 mins ETA</span>
                  </div>

                  <div className="space-y-3">
                    {group.items.map((item) => (
                      <div key={item.product.id} className="flex items-center justify-between gap-3">
                        <img 
                          src={item.product.image} 
                          alt={item.product.name} 
                          className="w-12 h-12 object-cover rounded-xl border border-slate-100 shrink-0" 
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-bold text-slate-900 truncate">{item.product.name}</h4>
                          <p className="text-[11px] text-slate-500">
                            {item.product.weight}
                            {item.selectedSize && ` • ${item.selectedSize}`}
                            {item.selectedCut && ` • ${item.selectedCut}`}
                          </p>
                          <div className="text-xs font-extrabold text-slate-900 mt-0.5">
                            ₹{item.product.price * item.quantity}
                          </div>
                        </div>

                        {/* Quantity controls */}
                        <div className="flex items-center bg-slate-100 rounded-xl p-0.5 shrink-0 border border-slate-200">
                          <button
                            id={`cart-decrement-${item.product.id}`}
                            onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                            className="p-1.5 hover:bg-white rounded-lg text-slate-600 cursor-pointer"
                          >
                            <Minus size={13} />
                          </button>
                          <span className="px-2 font-bold text-xs text-slate-800">{item.quantity}</span>
                          <button
                            id={`cart-increment-${item.product.id}`}
                            onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                            className="p-1.5 hover:bg-white rounded-lg text-slate-600 cursor-pointer"
                          >
                            <Plus size={13} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {/* Coupon Section */}
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 mb-2">
                  <Tag size={15} className="text-emerald-600" />
                  <span>Coupons & Offers</span>
                </div>

                {appliedCoupon ? (
                  <div className="flex items-center justify-between p-2.5 bg-emerald-100/70 border border-emerald-300 rounded-xl text-xs">
                    <div>
                      <span className="font-extrabold text-emerald-900">{appliedCoupon.code} Applied</span>
                      <p className="text-[11px] text-emerald-800">{appliedCoupon.description}</p>
                    </div>
                    <button
                      id="remove-coupon-btn"
                      onClick={removeCoupon}
                      className="text-xs font-bold text-red-600 hover:text-red-800 cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Try CUSTOMAR50 or FREEDEL"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      className="flex-1 px-3 py-1.5 text-xs uppercase bg-white border border-slate-300 rounded-xl focus:outline-emerald-600 font-semibold"
                    />
                    <button
                      id="apply-coupon-btn"
                      type="submit"
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer"
                    >
                      Apply
                    </button>
                  </form>
                )}

                {couponError && (
                  <p className="text-[11px] text-red-600 mt-1 font-medium">{couponError}</p>
                )}
              </div>

              {/* Delivery Instructions */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Delivery Instructions (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Leave with security, ring doorbell twice"
                  value={deliveryNotes}
                  onChange={(e) => setDeliveryNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-emerald-600"
                />
              </div>

              {/* Payment Methods */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700">Select Payment Method</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'UPI', label: 'UPI (GPay/PhonePe)', icon: Wallet },
                    { id: 'Card', label: 'Credit/Debit Card', icon: CreditCard },
                    { id: 'NetBanking', label: 'Net Banking', icon: Building2 },
                    { id: 'COD', label: 'Cash on Delivery', icon: Banknote }
                  ].map((p) => {
                    const Icon = p.icon;
                    const isSelected = paymentMethod === p.id;
                    return (
                      <button
                        type="button"
                        key={p.id}
                        id={`payment-method-${p.id}`}
                        onClick={() => setPaymentMethod(p.id as any)}
                        className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition cursor-pointer ${isSelected ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold' : 'border-slate-200 hover:border-slate-300 text-slate-700'}`}
                      >
                        <Icon size={16} className={isSelected ? 'text-emerald-700' : 'text-slate-400'} />
                        <span className="text-xs">{p.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Bill Details */}
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2 text-xs">
                <h4 className="font-bold text-slate-800">Bill Summary</h4>
                <div className="flex justify-between text-slate-600">
                  <span>Item Total</span>
                  <span>₹{itemTotal}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Delivery Fee</span>
                  <span>{deliveryFee === 0 ? <strong className="text-emerald-600">FREE</strong> : `₹${deliveryFee}`}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Platform Fee</span>
                  <span>₹{platformFee}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Govt Taxes (5%)</span>
                  <span>₹{taxes}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-bold">
                    <span>Coupon Discount</span>
                    <span>- ₹{discount}</span>
                  </div>
                )}
                <div className="border-t border-slate-200 pt-2 flex justify-between text-sm font-extrabold text-slate-900">
                  <span>To Pay</span>
                  <span>₹{finalTotal}</span>
                </div>
              </div>
            </div>
          )}

          {/* Footer Checkout Bar */}
          {cart.length > 0 && (
            <div className="p-4 border-t border-slate-200 bg-white space-y-2">
              <div className="flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-400">Total payable:</span>
                  <span className="text-lg font-black text-slate-900 ml-1.5">₹{finalTotal}</span>
                </div>
                <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md text-[11px]">
                  {paymentMethod}
                </span>
              </div>

              <button
                id="place-order-button"
                onClick={handleCheckout}
                disabled={isSubmitting}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-emerald-700/25 flex items-center justify-center gap-2 transition cursor-pointer"
              >
                {isSubmitting ? (
                  <span>Connecting to store & dispatching...</span>
                ) : (
                  <>
                    <span>Place Order & Alert Vendor</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-2 text-[10px] text-slate-400 font-medium pt-1">
                <ShieldCheck size={12} className="text-emerald-600" />
                <span>100% Secure Checkout & Live Order Ring Trigger</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
