import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { OrderStatus } from '../../types';
import { 
  X, CheckCircle, Clock, Phone, Star, 
  Sparkles, ChevronRight, AlertTriangle, XCircle, 
  RotateCcw, Headphones, ShieldAlert 
} from 'lucide-react';

interface LiveTrackingModalProps {
  orderId: string | null;
  onClose: () => void;
  onOpenSupport?: (orderId?: string) => void;
}

export const LiveTrackingModal: React.FC<LiveTrackingModalProps> = ({ 
  orderId, 
  onClose,
  onOpenSupport 
}) => {
  const { orders, updateOrderStatus, rateOrder, deliveryPartners } = useApp();

  const [ratingStars, setRatingStars] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [hasRated, setHasRated] = useState(false);
  const [mapProgress, setMapProgress] = useState(30);

  // Cancellation (Cut Order) states
  const [showCancelPrompt, setShowCancelPrompt] = useState(false);
  const [cancelReason, setCancelReason] = useState('Placed order by mistake');
  const [cancelSuccessMsg, setCancelSuccessMsg] = useState('');

  // Close with Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // If no orderId is provided, DO NOT render modal
  if (!orderId) return null;

  const order = orders.find(o => o.id === orderId);
  // If order is not found, do not arbitrarily display another order
  if (!order) return null;

  const partner = deliveryPartners.find(p => p.id === order.deliveryPartnerId) || deliveryPartners[0];

  useEffect(() => {
    // Map progress coordinate simulation based on status
    const statusProgressMap: { [key in OrderStatus]?: number } = {
      PLACED: 10,
      VENDOR_NOTIFIED: 20,
      ACCEPTED: 30,
      PREPARING: 45,
      READY_FOR_PICKUP: 55,
      DELIVERY_PARTNER_SEARCHING: 60,
      DELIVERY_ASSIGNED: 70,
      PICKED_UP: 80,
      OUT_FOR_DELIVERY: 90,
      ARRIVING: 95,
      DELIVERED: 100,
      CANCELLED: 0
    };
    setMapProgress(statusProgressMap[order.status] ?? 30);
  }, [order.status]);

  const steps: { key: OrderStatus; label: string; desc: string }[] = [
    { key: 'PLACED', label: 'Order Placed', desc: 'Order transmitted to merchant' },
    { key: 'ACCEPTED', label: 'Store Confirmed', desc: `${order.vendorName} accepted order` },
    { key: 'PREPARING', label: 'Preparing Items', desc: 'Packed fresh & sealed' },
    { key: 'READY_FOR_PICKUP', label: 'Ready for Pickup', desc: 'Awaiting delivery partner' },
    { key: 'DELIVERY_ASSIGNED', label: 'Rider Assigned', desc: `${partner.name} on the way to store` },
    { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', desc: 'Rider heading to your doorstep' },
    { key: 'DELIVERED', label: 'Delivered', desc: 'Handed over with OTP verification' }
  ];

  const getStepStatus = (stepKey: OrderStatus) => {
    if (order.status === 'CANCELLED') return 'upcoming';
    const orderLevels: OrderStatus[] = [
      'PLACED', 'VENDOR_NOTIFIED', 'ACCEPTED', 'PREPARING', 
      'READY_FOR_PICKUP', 'DELIVERY_PARTNER_SEARCHING', 
      'DELIVERY_ASSIGNED', 'PICKED_UP', 'OUT_FOR_DELIVERY', 'ARRIVING', 'DELIVERED'
    ];
    const currentIndex = orderLevels.indexOf(order.status);
    const stepIndex = orderLevels.indexOf(stepKey);

    if (currentIndex > stepIndex) return 'completed';
    if (currentIndex === stepIndex) return 'current';
    return 'upcoming';
  };

  const handleSimulateNextStep = () => {
    if (order.status === 'CANCELLED' || order.status === 'DELIVERED') return;
    const sequence: OrderStatus[] = [
      'PLACED', 'ACCEPTED', 'PREPARING', 'READY_FOR_PICKUP', 
      'DELIVERY_ASSIGNED', 'OUT_FOR_DELIVERY', 'DELIVERED'
    ];
    const currIdx = sequence.indexOf(order.status as any);
    if (currIdx < sequence.length - 1) {
      updateOrderStatus(order.id, sequence[currIdx + 1]);
    }
  };

  const handleSubmitRating = (e: React.FormEvent) => {
    e.preventDefault();
    rateOrder(order.id, ratingStars, reviewText);
    setHasRated(true);
  };

  const handleConfirmCancelOrder = () => {
    updateOrderStatus(order.id, 'CANCELLED');
    setShowCancelPrompt(false);
    setCancelSuccessMsg(`Order #${order.id} has been cancelled. 100% refund of ₹${order.totalAmount} will reflect in your ${order.paymentMethod} account.`);
  };

  const isCancellable = order.status !== 'DELIVERED' && order.status !== 'CANCELLED';

  return (
    <div 
      id="live-tracking-modal-backdrop"
      onClick={onClose} 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in"
    >
      <div 
        id="live-tracking-modal-card"
        onClick={(e) => e.stopPropagation()} 
        className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Top Header with Cut / Close Button */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md ${order.status === 'CANCELLED' ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-700'}`}>
                {order.status === 'CANCELLED' ? 'Order Cancelled' : 'Live Order Tracking'}
              </span>
              <span className="text-[11px] text-slate-500 font-semibold">
                OTP: <strong className="text-slate-900">{order.deliveryOtp}</strong>
              </span>
            </div>
            <div className="text-sm font-bold text-slate-900 mt-1">
              Order #{order.id} • {order.vendorName}
            </div>
          </div>

          {/* Prominent Cut / Close Button (X) */}
          <button 
            id="close-live-tracking-modal"
            onClick={onClose} 
            title="Cut / Close Window (Esc)"
            aria-label="Cut / Close Live Tracking"
            className="p-2 rounded-xl bg-slate-200/80 hover:bg-slate-300 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer flex items-center gap-1 text-xs font-bold"
          >
            <span className="hidden sm:inline">Close</span>
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto p-4 sm:p-5 space-y-5">
          {/* Cancelled Alert Banner (if order was cancelled) */}
          {order.status === 'CANCELLED' && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3">
              <XCircle size={22} className="text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1 text-xs">
                <h4 className="font-bold text-rose-900 text-sm">This order has been cancelled</h4>
                <p className="text-rose-700 mt-0.5">
                  100% payment refund of <strong>₹{order.totalAmount}</strong> has been initiated back to your {order.paymentMethod} account. Refund Reference ID: <span className="font-mono font-bold">TXN-REF-{order.id.slice(-6)}</span>.
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <button
                    id="cancelled-order-cut-close-btn"
                    onClick={onClose}
                    className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl cursor-pointer shadow-xs"
                  >
                    Close Window (Cut)
                  </button>
                  {onOpenSupport && (
                    <button
                      onClick={() => onOpenSupport(order.id)}
                      className="px-3 py-1.5 bg-white border border-rose-200 hover:bg-rose-100 text-rose-900 font-bold rounded-xl cursor-pointer"
                    >
                      Need Help?
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Cancellation Success Feedback Notice */}
          {cancelSuccessMsg && order.status !== 'CANCELLED' && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 font-semibold flex items-center gap-2">
              <AlertTriangle size={16} className="text-amber-600" />
              <span>{cancelSuccessMsg}</span>
            </div>
          )}

          {/* Interactive Simulated Map (disabled styling if cancelled) */}
          <div className={`relative h-48 sm:h-56 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shadow-inner ${order.status === 'CANCELLED' ? 'grayscale opacity-75' : ''}`}>
            {/* SVG Roads & Canvas styling */}
            <svg className="w-full h-full" viewBox="0 0 600 240" fill="none">
              {/* Background grid */}
              <rect width="600" height="240" fill="#f1f5f9" />
              {/* Greenery Parks */}
              <rect x="50" y="20" width="120" height="70" rx="16" fill="#e2e8f0" />
              <rect x="420" y="140" width="140" height="80" rx="16" fill="#e2e8f0" />
              
              {/* Streets */}
              <path d="M 0 120 L 600 120" stroke="#ffffff" strokeWidth="24" />
              <path d="M 180 0 L 180 240" stroke="#ffffff" strokeWidth="20" />
              <path d="M 400 0 L 400 240" stroke="#ffffff" strokeWidth="20" />
              
              {/* Active Route Path from Store to Customer */}
              {order.status !== 'CANCELLED' && (
                <path 
                  d="M 100 120 Q 250 80 500 120" 
                  stroke="#0d9488" 
                  strokeWidth="6" 
                  strokeDasharray="8 6" 
                  className="animate-pulse"
                />
              )}

              {/* Vendor Store Marker */}
              <g transform="translate(100, 120)">
                <circle r="16" fill="#0f766e" />
                <circle r="22" fill="#0f766e" fillOpacity="0.2" className="animate-ping" />
                <text x="0" y="4" fill="white" fontSize="10" textAnchor="middle" fontWeight="bold">S</text>
              </g>

              {/* Customer Delivery Marker */}
              <g transform="translate(500, 120)">
                <circle r="16" fill={order.status === 'CANCELLED' ? '#94a3b8' : '#dc2626'} />
                <circle r="22" fill={order.status === 'CANCELLED' ? '#cbd5e1' : '#dc2626'} fillOpacity="0.2" />
                <text x="0" y="4" fill="white" fontSize="10" textAnchor="middle" fontWeight="bold">H</text>
              </g>

              {/* Delivery Rider Marker Animated */}
              {order.status !== 'CANCELLED' && (
                <g transform={`translate(${100 + (mapProgress / 100) * 400}, ${120 + Math.sin((mapProgress / 100) * Math.PI) * -30})`}>
                  <circle r="18" fill="#f59e0b" stroke="#ffffff" strokeWidth="3" />
                  <text x="0" y="4" fill="#78350f" fontSize="10" textAnchor="middle" fontWeight="bold">🛵</text>
                </g>
              )}
            </svg>

            {/* Status Overlay Pill */}
            <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-xs px-3 py-1.5 rounded-xl border border-slate-200 shadow-md flex items-center gap-2">
              <div className={`w-2.5 h-2.5 rounded-full ${order.status === 'CANCELLED' ? 'bg-rose-500' : 'bg-emerald-500 animate-pulse'}`}></div>
              <div>
                <div className="text-[10px] uppercase font-bold text-slate-400">Status</div>
                <div className="text-xs font-bold text-slate-900">{order.status.replace(/_/g, ' ')}</div>
              </div>
            </div>

            {/* ETA Countdown Badge */}
            <div className="absolute top-3 right-3 bg-slate-900/90 text-white px-3 py-1.5 rounded-xl shadow-md flex items-center gap-2 text-xs">
              <Clock size={14} className={order.status === 'CANCELLED' ? 'text-rose-400' : 'text-amber-400'} />
              <div>
                <span className="text-[10px] text-slate-300 block leading-tight">
                  {order.status === 'CANCELLED' ? 'Order Outcome' : 'Estimated Arrival'}
                </span>
                <span className="font-extrabold text-white">
                  {order.status === 'CANCELLED' 
                    ? 'Cancelled & Refunded' 
                    : order.status === 'DELIVERED' 
                      ? 'Delivered!' 
                      : '8 - 12 Mins'}
                </span>
              </div>
            </div>

            {/* Delivery OTP Security Box */}
            {order.status !== 'CANCELLED' && (
              <div className="absolute bottom-3 left-3 bg-slate-900 text-white px-3.5 py-1.5 rounded-xl border border-amber-400/40 shadow-lg flex items-center gap-2.5">
                <div className="text-[10px] text-amber-300 font-bold uppercase tracking-wider">
                  Delivery OTP:
                </div>
                <div className="text-sm font-black tracking-widest text-white bg-slate-800 px-2 py-0.5 rounded-md border border-slate-700">
                  {order.deliveryOtp}
                </div>
              </div>
            )}
          </div>

          {/* Demo Simulator & Order Cancellation Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-slate-100 rounded-2xl border border-slate-200 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-600 font-medium hidden sm:inline">Demo Simulator:</span>
              <button
                id="simulate-next-order-step-btn"
                onClick={handleSimulateNextStep}
                disabled={order.status === 'DELIVERED' || order.status === 'CANCELLED'}
                className={`px-3 py-1.5 font-bold rounded-xl transition flex items-center gap-1 cursor-pointer ${order.status === 'DELIVERED' || order.status === 'CANCELLED' ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-teal-700 hover:bg-teal-800 text-white shadow-xs'}`}
              >
                <span>Next Stage</span>
                <ChevronRight size={14} />
              </button>
            </div>

            {/* Cancel / Cut Order Action Button */}
            {isCancellable && (
              <button
                id="open-cancel-order-cut-dialog-btn"
                onClick={() => setShowCancelPrompt(true)}
                className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 hover:border-rose-300 font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer"
              >
                <XCircle size={14} className="text-rose-600" />
                <span>Cancel / Cut Order</span>
              </button>
            )}
          </div>

          {/* Inline Cancel / Cut Order Confirmation Box */}
          {showCancelPrompt && isCancellable && (
            <div className="p-4 bg-rose-50/80 border-2 border-rose-300 rounded-2xl space-y-3 animate-in fade-in">
              <div className="flex items-center gap-2 text-rose-900 font-bold text-sm">
                <AlertTriangle size={18} className="text-rose-600" />
                <span>Confirm Order Cancellation (অর্ডার বাতিল / কাট করুন)</span>
              </div>
              <p className="text-xs text-rose-800">
                Are you sure you want to cancel Order #{order.id}? Any payment of ₹{order.totalAmount} will be immediately refunded to your original payment method.
              </p>

              <div>
                <label className="text-[11px] font-bold text-rose-900 block mb-1.5">Reason for cancellation:</label>
                <select
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full text-xs p-2 rounded-xl bg-white border border-rose-300 text-slate-800 font-medium focus:outline-rose-500"
                >
                  <option value="Placed order by mistake">Placed order by mistake</option>
                  <option value="Delivery taking longer than expected">Delivery taking longer than expected</option>
                  <option value="Need to change delivery address">Need to change delivery address</option>
                  <option value="Need to add/remove items">Need to add/remove items</option>
                  <option value="Found alternative / not needed anymore">Found alternative / not needed anymore</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  id="confirm-cancel-order-cut-btn"
                  onClick={handleConfirmCancelOrder}
                  className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer flex items-center justify-center gap-1"
                >
                  <XCircle size={14} />
                  <span>Yes, Cancel & Refund (Cut Order)</span>
                </button>
                <button
                  id="cancel-prompt-keep-order-btn"
                  onClick={() => setShowCancelPrompt(false)}
                  className="py-2 px-4 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Keep Order
                </button>
              </div>
            </div>
          )}

          {/* Delivery Partner Contact Card */}
          {order.status !== 'CANCELLED' && (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <img 
                  src={partner.avatar} 
                  alt={partner.name} 
                  className="w-12 h-12 rounded-xl object-cover border-2 border-white shadow-xs"
                />
                <div>
                  <div className="text-xs font-bold text-slate-900">{partner.name}</div>
                  <div className="text-[11px] text-slate-500">
                    Customar Express Rider • {partner.vehicleType} ({partner.vehicleNumber})
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-amber-600 font-bold mt-0.5">
                    <Star size={12} className="fill-amber-500" />
                    <span>{partner.rating} Rating • 1,420+ Deliveries</span>
                  </div>
                </div>
              </div>

              <a
                href={`tel:${partner.phone}`}
                className="p-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md flex items-center gap-1.5 text-xs font-bold transition"
              >
                <Phone size={15} />
                <span className="hidden sm:inline">Call Rider</span>
              </a>
            </div>
          )}

          {/* Vertical Timeline Stepper */}
          {order.status !== 'CANCELLED' && (
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Live Order Timeline</h4>
              <div className="space-y-3 relative pl-6 border-l-2 border-slate-200">
                {steps.map((s) => {
                  const status = getStepStatus(s.key);
                  return (
                    <div key={s.key} className="relative">
                      {/* Bullet marker */}
                      <div className={`absolute -left-[31px] top-0.5 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center ${status === 'completed' ? 'bg-emerald-600 text-white' : status === 'current' ? 'bg-amber-500 text-white animate-ping' : 'bg-slate-300'}`}>
                        {status === 'completed' && <CheckCircle size={10} />}
                      </div>
                      <div className="text-xs font-bold text-slate-800">{s.label}</div>
                      <p className="text-[11px] text-slate-500">{s.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Order Summary Recap */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
            <h4 className="text-xs font-bold text-slate-800">Items in this Delivery</h4>
            <div className="space-y-1 divide-y divide-slate-100">
              {order.items.map((item, i) => (
                <div key={i} className="pt-1 flex items-center justify-between text-xs">
                  <span className="text-slate-700">
                    {item.quantity}x {item.product.name} ({item.product.weight})
                  </span>
                  <span className="font-bold text-slate-900">₹{item.product.price * item.quantity}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-slate-200 pt-2 flex justify-between text-xs font-bold">
              <span>Total Paid ({order.paymentMethod})</span>
              <span className={order.status === 'CANCELLED' ? 'line-through text-slate-400' : 'text-slate-900'}>
                ₹{order.totalAmount}
              </span>
            </div>
            {order.status === 'CANCELLED' && (
              <div className="flex justify-between text-xs font-extrabold text-emerald-700 bg-emerald-50 p-2 rounded-xl">
                <span>Refunded Amount</span>
                <span>₹{order.totalAmount} (100%)</span>
              </div>
            )}
          </div>

          {/* Post-Delivery Rating Modal */}
          {order.status === 'DELIVERED' && (
            <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-3">
              <div className="flex items-center gap-2 text-emerald-950 font-bold text-sm">
                <Sparkles size={18} className="text-amber-500" />
                <span>Order Delivered Successfully! How was your experience?</span>
              </div>

              {hasRated || order.customerRating ? (
                <div className="p-3 bg-white rounded-xl border border-emerald-200 text-xs text-emerald-900 font-semibold flex items-center gap-2">
                  <CheckCircle size={16} className="text-emerald-600" />
                  <span>Thank you for rating this order {order.customerRating || ratingStars} stars!</span>
                </div>
              ) : (
                <form onSubmit={handleSubmitRating} className="space-y-3">
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        type="button"
                        key={star}
                        id={`rate-star-${star}`}
                        onClick={() => setRatingStars(star)}
                        className="p-1 cursor-pointer transition hover:scale-110"
                      >
                        <Star 
                          size={24} 
                          className={star <= ratingStars ? 'text-amber-500 fill-amber-500' : 'text-slate-300'} 
                        />
                      </button>
                    ))}
                    <span className="text-xs font-bold text-slate-700 ml-2">{ratingStars} Stars</span>
                  </div>

                  <input
                    type="text"
                    placeholder="Write a review for store and rider (optional)..."
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:outline-emerald-600"
                  />

                  <button
                    id="submit-order-review-btn"
                    type="submit"
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer"
                  >
                    Submit Feedback
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Action Footer with Close / Cut button & Support */}
          <div className="pt-2 flex flex-col sm:flex-row items-center gap-2.5">
            <button
              id="bottom-cut-close-tracking-modal-btn"
              onClick={onClose}
              className="w-full sm:flex-1 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-2xl transition cursor-pointer shadow-md flex items-center justify-center gap-1.5"
            >
              <X size={16} />
              <span>Close / Cut Tracking Window</span>
            </button>

            {onOpenSupport && (
              <button
                id="live-tracking-open-support-btn"
                onClick={() => onOpenSupport(order.id)}
                className="w-full sm:w-auto px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-2xl transition cursor-pointer flex items-center justify-center gap-1.5 border border-slate-200"
              >
                <Headphones size={15} />
                <span>24x7 Help</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
