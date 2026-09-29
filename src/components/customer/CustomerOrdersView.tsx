import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Order } from '../../types';
import { 
  Package, Clock, CheckCircle, ArrowRight, 
  RotateCcw, HelpCircle, Star, ShieldCheck, MapPin 
} from 'lucide-react';

interface CustomerOrdersViewProps {
  onTrackOrder: (orderId: string) => void;
  onOpenSupportModal: (orderId?: string) => void;
}

export const CustomerOrdersView: React.FC<CustomerOrdersViewProps> = ({ 
  onTrackOrder, onOpenSupportModal 
}) => {
  const { orders, addToCart } = useApp();

  const activeOrders = orders.filter(o => o.status !== 'DELIVERED' && o.status !== 'CANCELLED');
  const pastOrders = orders.filter(o => o.status === 'DELIVERED' || o.status === 'CANCELLED');

  const handleReorder = (order: Order) => {
    order.items.forEach(item => {
      addToCart(item.product, {
        selectedSize: item.selectedSize,
        selectedCut: item.selectedCut
      });
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">Your Orders & History</h1>
          <p className="text-xs text-slate-500">Track current deliveries, re-order favorites, and download receipts</p>
        </div>
        <button
          onClick={() => onOpenSupportModal()}
          className="flex items-center gap-1.5 text-xs font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 px-3 py-1.5 rounded-xl border border-teal-200 transition cursor-pointer"
        >
          <HelpCircle size={14} />
          <span>Need Help?</span>
        </button>
      </div>

      {/* Active Deliveries Section */}
      {activeOrders.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Active Deliveries ({activeOrders.length})
            </h2>
          </div>

          <div className="space-y-3">
            {activeOrders.map((order) => (
              <div 
                key={order.id}
                className="bg-white border-2 border-emerald-500/50 rounded-2xl p-4 shadow-sm space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                      {order.status.replace(/_/g, ' ')}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 mt-1">
                      {order.vendorName} • Order #{order.id}
                    </h3>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block uppercase font-bold">Delivery OTP</span>
                      <span className="text-sm font-black text-amber-600 tracking-widest">{order.deliveryOtp}</span>
                    </div>

                    <button
                      id={`track-active-order-${order.id}`}
                      onClick={() => onTrackOrder(order.id)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>Track Live</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>

                {/* Items preview */}
                <div className="text-xs text-slate-600 flex flex-wrap gap-2">
                  {order.items.map((it, idx) => (
                    <span key={idx} className="bg-slate-100 px-2 py-1 rounded-lg">
                      {it.quantity}x {it.product.name}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                  <span>Placed at {new Date(order.placedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  <span className="font-extrabold text-slate-900">Total: ₹{order.totalAmount}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Past Orders History */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">Past Orders</h2>

        {pastOrders.length === 0 && activeOrders.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 text-center border border-slate-200 text-slate-400 space-y-2">
            <Package size={36} className="mx-auto text-slate-300" />
            <div className="text-sm font-bold text-slate-700">No orders placed yet</div>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Explore our fresh groceries, food, medicines, and services to place your very first quick order!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {pastOrders.map((order) => (
              <div 
                key={order.id}
                className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-3 hover:border-slate-300 transition"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      {order.status}
                    </span>
                    <h3 className="text-xs font-bold text-slate-900 mt-1">
                      {order.vendorName} • #{order.id}
                    </h3>
                  </div>

                  <div className="text-right">
                    <div className="text-xs font-black text-slate-900">₹{order.totalAmount}</div>
                    <span className="text-[10px] text-slate-400">{new Date(order.placedAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="text-xs text-slate-600 flex flex-wrap gap-1.5">
                  {order.items.map((it, idx) => (
                    <span key={idx} className="bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                      {it.quantity}x {it.product.name}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-1 text-xs">
                  {order.customerRating ? (
                    <div className="flex items-center gap-1 text-amber-500 font-bold">
                      <Star size={12} className="fill-amber-500" />
                      <span>Rated {order.customerRating}/5</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => onTrackOrder(order.id)}
                      className="text-emerald-700 font-bold hover:underline"
                    >
                      Rate this Order
                    </button>
                  )}

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onOpenSupportModal(order.id)}
                      className="text-slate-500 hover:text-slate-800 font-medium text-xs px-2.5 py-1 rounded-lg hover:bg-slate-100 cursor-pointer"
                    >
                      Report Issue
                    </button>

                    <button
                      onClick={() => handleReorder(order)}
                      className="flex items-center gap-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold px-3 py-1 rounded-lg border border-emerald-200 cursor-pointer"
                    >
                      <RotateCcw size={12} />
                      <span>Re-order</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
