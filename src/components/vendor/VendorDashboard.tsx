import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Order, OrderStatus, Product } from '../../types';
import { 
  Store, Bell, Volume2, VolumeX, CheckCircle, 
  Clock, Package, Plus, Trash2, Edit3, ShieldCheck, 
  TrendingUp, AlertCircle, X, Check, ArrowRight, DollarSign,
  Printer, FileText, Bike, MapPin, Phone, LogOut
} from 'lucide-react';
import { isSameLocation } from '../../utils/locationMatch';
import { VendorAuthPortal } from './VendorAuthPortal';

export const VendorDashboard: React.FC = () => {
  const { 
    vendors, activeVendorId, setActiveVendorId,
    loggedVendorId, vendorLogout, products, 
    orders, updateOrderStatus, addProduct, updateProduct, deleteProduct,
    soundEnabled, setSoundEnabled, isRinging, stopRing, playTestRing,
    printOrders, updatePrintStatus, language, t
  } = useApp();

  // If vendor partner is not logged in, show Mobile Login/Signup Portal
  if (!loggedVendorId) {
    return <VendorAuthPortal />;
  }

  const [activeTab, setActiveTab] = useState<'orders' | 'inventory' | 'sales' | 'profile'>('orders');
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [storeOnline, setStoreOnline] = useState(true);

  // New product form state
  const [newName, setNewName] = useState('');
  const [newBrand, setNewBrand] = useState('');
  const [newCategory, setNewCategory] = useState('grocery');
  const [newSubcategory, setNewSubcategory] = useState('Staples');
  const [newPrice, setNewPrice] = useState<number>(99);
  const [newMrp, setNewMrp] = useState<number>(120);
  const [newStock, setNewStock] = useState<number>(50);
  const [newWeight, setNewWeight] = useState('1 kg');
  const [newIsVeg, setNewIsVeg] = useState(true);
  const [newImage, setNewImage] = useState('https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=80');

  const currentVendor = vendors.find(v => v.id === loggedVendorId) || vendors.find(v => v.id === activeVendorId) || vendors[0];
  const isPrintVendor = currentVendor.category === 'prints' || currentVendor.id === 'v_prints_1' || currentVendor.id === 'v_prints_2';

  // Check if an order matches the vendor's operating location
  const isMatchVendorLocation = (deliveryAddr?: any) => {
    return isSameLocation(deliveryAddr, {
      area: currentVendor.area,
      city: currentVendor.city,
      pincode: currentVendor.pincode,
      address: currentVendor.address
    });
  };

  // Vendor's standard orders (must be matched to this vendor AND customer must be in same location)
  const vendorOrders = orders.filter(o => 
    (o.vendorId === currentVendor.id || o.vendorName === currentVendor.name) &&
    isMatchVendorLocation(o.deliveryAddress)
  );
  const newIncomingOrders = vendorOrders.filter(o => o.status === 'PLACED' || o.status === 'VENDOR_NOTIFIED');
  const preparingOrders = vendorOrders.filter(o => o.status === 'ACCEPTED' || o.status === 'PREPARING');
  const readyOrders = vendorOrders.filter(o => o.status === 'READY_FOR_PICKUP' || o.status === 'DELIVERY_PARTNER_SEARCHING');
  const completedOrders = vendorOrders.filter(o => o.status === 'DELIVERED');

  // Vendor's print orders (must match vendor ID/store and customer in same location)
  const vendorPrintOrders = isPrintVendor 
    ? printOrders.filter(p => 
        (p.vendorId === currentVendor.id || !p.vendorId || p.storeName === currentVendor.name) &&
        isMatchVendorLocation(p.customerAddress)
      ) 
    : [];
  const incomingPrintOrders = vendorPrintOrders.filter(p => p.status === 'SUBMITTED');
  const printingPrintOrders = vendorPrintOrders.filter(p => p.status === 'PRINTING');
  const readyPrintOrders = vendorPrintOrders.filter(p => 
    p.status === 'READY_FOR_PICKUP' || 
    p.status === 'PRINT_READY' || 
    p.status === 'DELIVERY_ASSIGNED' || 
    p.status === 'PICKED_UP' || 
    p.status === 'OUT_FOR_DELIVERY'
  );
  const completedPrintOrders = vendorPrintOrders.filter(p => p.status === 'DELIVERED');

  // Vendor's products
  const vendorProducts = products.filter(p => p.vendorId === currentVendor.id || p.vendorName === currentVendor.name);

  // Financial statistics
  const todayRevenue = completedOrders.reduce((sum, o) => sum + o.itemTotal, 0);

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newPrice) return;

    const discount = newMrp > newPrice ? Math.round(((newMrp - newPrice) / newMrp) * 100) : 0;

    addProduct({
      name: newName,
      brand: newBrand || currentVendor.name,
      category: currentVendor.category,
      subcategory: newSubcategory,
      price: Number(newPrice),
      mrp: Number(newMrp),
      discount,
      stock: Number(newStock),
      weight: newWeight,
      isVeg: newIsVeg,
      rating: 4.8,
      ratingCount: 1,
      image: newImage,
      description: `Fresh quality product supplied directly by ${currentVendor.name}.`,
      vendorId: currentVendor.id,
      vendorName: currentVendor.name,
      prepTimeMinutes: currentVendor.prepTimeMinutes,
      isAvailable: Number(newStock) > 0
    });

    setShowAddProductModal(false);
    setNewName('');
    setNewPrice(99);
    setNewStock(50);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-4 sm:py-6 space-y-6">
      {/* Real-time Order Ring Announcement Overlay if a new order is ringing */}
      {(newIncomingOrders.length > 0 || incomingPrintOrders.length > 0) && (
        <div className="bg-emerald-600 text-white p-4 sm:p-5 rounded-3xl shadow-xl border-2 border-emerald-400 animate-pulse flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white text-emerald-800 flex items-center justify-center font-black text-xl shadow-md">
              <Bell size={24} className="animate-bounce" />
            </div>
            <div>
              <div className="text-[11px] font-black uppercase tracking-wider text-emerald-200">
                {incomingPrintOrders.length > 0 
                  ? `🔔 Prints Vendor Terminal Ringing • ${incomingPrintOrders.length} New Print Order(s) Spooling` 
                  : `Loud Order Alert • ${newIncomingOrders.length} New Order(s) Awaiting Acceptance`}
              </div>
              <h2 className="text-lg font-black tracking-tight">
                {incomingPrintOrders.length > 0
                  ? `Print Order #${incomingPrintOrders[0].id}: ${incomingPrintOrders[0].fileName} (${incomingPrintOrders[0].pages} pages) • ₹${incomingPrintOrders[0].totalAmount}`
                  : `Order #${newIncomingOrders[0].id} from ${newIncomingOrders[0].customerName} (₹${newIncomingOrders[0].totalAmount})`}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {incomingPrintOrders.length > 0 ? (
              <>
                <button
                  id="vendor-accept-print-ring-btn"
                  onClick={() => {
                    updatePrintStatus(incomingPrintOrders[0].id, 'PRINTING');
                    stopRing();
                  }}
                  className="px-5 py-2.5 bg-white hover:bg-emerald-50 text-emerald-800 font-black text-xs rounded-xl shadow-lg cursor-pointer transition flex items-center gap-1.5"
                >
                  <Check size={16} />
                  <span>Accept & Start Printing</span>
                </button>
                <button
                  onClick={stopRing}
                  className="px-4 py-2.5 bg-black/30 hover:bg-black/50 text-white font-bold text-xs rounded-xl cursor-pointer transition flex items-center gap-1"
                >
                  <VolumeX size={14} />
                  <span>Silence Ring</span>
                </button>
              </>
            ) : (
              <>
                <button
                  id="vendor-accept-order-ring-btn"
                  onClick={() => updateOrderStatus(newIncomingOrders[0].id, 'ACCEPTED')}
                  className="px-5 py-2.5 bg-white hover:bg-emerald-50 text-emerald-800 font-black text-xs rounded-xl shadow-lg cursor-pointer transition flex items-center gap-1.5"
                >
                  <Check size={16} />
                  <span>Accept Order</span>
                </button>
                <button
                  id="vendor-reject-order-ring-btn"
                  onClick={() => updateOrderStatus(newIncomingOrders[0].id, 'CANCELLED')}
                  className="px-4 py-2.5 bg-red-600/80 hover:bg-red-700 text-white font-bold text-xs rounded-xl cursor-pointer transition"
                >
                  Reject
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Top Header & Store Selector */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black text-lg">
            <Store size={24} />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-lg font-black text-slate-900">{currentVendor.name}</h1>
              <span className="text-[11px] font-black px-2.5 py-0.5 rounded-full uppercase bg-emerald-100 text-emerald-900 border border-emerald-300 tracking-wide">
                {currentVendor.category}
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                <Phone size={11} className="text-emerald-600" />
                <span>{currentVendor.phone}</span>
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${currentVendor.kycStatus === 'verified' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                KYC: {currentVendor.kycStatus}
              </span>
            </div>
            <p className="text-xs text-slate-500">{currentVendor.address} • FSSAI #{currentVendor.fssaiNumber || '21224190000123'}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                <MapPin size={12} className="text-emerald-600" />
                Operating Zone: {currentVendor.area || 'Indiranagar'}, {currentVendor.city || 'Bengaluru'} ({currentVendor.pincode || '560038'})
              </span>
              <span className="text-[10px] text-slate-500 hidden sm:inline font-medium">
                • Same-location orders auto-routed
              </span>
            </div>
          </div>
        </div>

        {/* Controls: Logout / Switch button, Self Store Name Only, Store Online Toggle, Sound Ring Toggle */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Logout / Switch Account Button */}
          <button
            id="vendor-logout-btn"
            onClick={vendorLogout}
            className="px-3 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-red-700 border border-slate-200 transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
            title={t('Logout / Switch to another store account', 'লগআউট / অন্য স্টোরে সুইচ করুন')}
          >
            <LogOut size={14} />
            <span>{t('Logout / Switch', 'লগআউট / সুইচ')}</span>
          </button>

          {/* Self Store Name (Only own store visible, no other vendors) */}
          <div
            id="vendor-self-store-badge"
            className="bg-emerald-50 text-emerald-900 border border-emerald-300 rounded-xl px-3 py-2 text-xs font-black flex items-center gap-1.5 shadow-2xs select-none"
            title={t('Currently Logged In Self Store', 'বর্তমানে সক্রিয় নিজস্ব স্টোর')}
          >
            <Store size={14} className="text-emerald-700 shrink-0" />
            <span className="font-black text-slate-900">{currentVendor.name}</span>
            <span className="text-[10px] font-bold uppercase bg-emerald-200/90 text-emerald-900 px-1.5 py-0.5 rounded ml-0.5">
              {currentVendor.category}
            </span>
          </div>

          {/* Online Toggle */}
          <button
            id="vendor-toggle-online"
            onClick={() => setStoreOnline(!storeOnline)}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${storeOnline ? 'bg-emerald-600 text-white shadow-xs' : 'bg-red-100 text-red-700'}`}
          >
            <span className={`w-2 h-2 rounded-full ${storeOnline ? 'bg-white animate-ping' : 'bg-red-600'}`}></span>
            <span>{storeOnline ? 'Store OPEN' : 'Store CLOSED'}</span>
          </button>

          {/* Sound Alert Toggle & Test */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 cursor-pointer"
              title={soundEnabled ? 'Disable Ring' : 'Enable Ring'}
            >
              {soundEnabled ? <Volume2 size={16} className="text-emerald-600" /> : <VolumeX size={16} className="text-red-500" />}
            </button>
            <button
              onClick={playTestRing}
              className="text-[10px] font-bold px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg cursor-pointer"
            >
              Test Ring
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto text-xs font-bold">
        {[
          { id: 'orders', label: `Orders Queue (${vendorOrders.length})`, icon: Package },
          { id: 'inventory', label: `Inventory & Catalog (${vendorProducts.length})`, icon: Store },
          { id: 'sales', label: `Sales & Payouts`, icon: DollarSign },
          { id: 'profile', label: `Store Compliance & KYC`, icon: ShieldCheck }
        ].map(tab => {
          const Icon = tab.icon;
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`vendor-tab-${tab.id}`}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-xl transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${isSelected ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              <Icon size={15} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: ORDERS KANBAN */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          {isPrintVendor ? (
            /* PRINT VENDOR KANBAN */
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Column 1: New Print Orders & Printing */}
              <div className="bg-slate-50 p-4 rounded-3xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between font-bold text-xs text-slate-700">
                  <span className="uppercase tracking-wider">New & Printing ({incomingPrintOrders.length + printingPrintOrders.length})</span>
                  <span className="w-2 h-2 rounded-full bg-teal-500 animate-ping"></span>
                </div>

                {incomingPrintOrders.length === 0 && printingPrintOrders.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-400 bg-white rounded-2xl border border-slate-200">
                    No active print jobs
                  </div>
                ) : (
                  [...incomingPrintOrders, ...printingPrintOrders].map(p => {
                    const isPickup = p.deliveryType === 'Pickup';
                    return (
                      <div key={p.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                            <Printer size={13} className="text-teal-600" />
                            <span>Print #{p.id}</span>
                          </span>
                          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${p.status === 'SUBMITTED' ? 'bg-amber-100 text-amber-900 animate-pulse' : 'bg-teal-100 text-teal-900'}`}>
                            {p.status}
                          </span>
                        </div>

                        {/* Fulfillment Mode Badge */}
                        <div>
                          {isPickup ? (
                            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-300 inline-flex items-center gap-1">
                              <Store size={11} className="text-amber-700" />
                              <span>Self Store Pickup (Counter)</span>
                            </span>
                          ) : (
                            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-sky-100 text-sky-900 border border-sky-300 inline-flex items-center gap-1">
                              <Bike size={11} className="text-sky-700" />
                              <span>Doorstep Delivery</span>
                            </span>
                          )}
                        </div>

                        <div className="text-xs text-slate-600 space-y-1">
                          <div className="font-bold text-slate-800 flex items-center gap-1">
                            <FileText size={13} className="text-teal-600 shrink-0" />
                            <span className="truncate">{p.fileName}</span>
                          </div>
                          <div className="text-[11px] text-slate-500">
                            {p.pages} Pages • {p.copies} {p.copies > 1 ? 'Copies' : 'Copy'} • {p.colorMode}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            {p.paperType} • {p.binding}
                          </div>
                          <div className="text-[11px] text-slate-600 font-semibold">
                            Customer: {p.customerName} {p.customerPhone && `(${p.customerPhone})`}
                          </div>
                        </div>

                        <div className="border-t border-slate-100 pt-2 flex items-center justify-between">
                          <span className="text-xs font-black text-slate-900">Total: ₹{p.totalAmount}</span>

                          {p.status === 'SUBMITTED' ? (
                            <button
                              id={`vendor-accept-print-${p.id}`}
                              onClick={() => {
                                updatePrintStatus(p.id, 'PRINTING');
                                stopRing();
                              }}
                              className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 active:scale-95 text-white text-xs font-bold rounded-lg cursor-pointer flex items-center gap-1 shadow-xs transition"
                            >
                              <Check size={12} />
                              <span>Accept & Print</span>
                            </button>
                          ) : isPickup ? (
                            <button
                              id={`vendor-mark-ready-pickup-${p.id}`}
                              onClick={() => updatePrintStatus(p.id, 'READY_FOR_PICKUP')}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold rounded-lg cursor-pointer flex items-center gap-1.5 shadow-xs transition"
                              title="Mark print ready for customer self pickup (No delivery partner noise)"
                            >
                              <CheckCircle size={13} className="text-white" />
                              <span>Mark Ready for Pickup</span>
                            </button>
                          ) : (
                            <button
                              id={`vendor-mark-ready-delivery-${p.id}`}
                              onClick={() => updatePrintStatus(p.id, 'READY_FOR_PICKUP')}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold rounded-lg cursor-pointer flex items-center gap-1.5 shadow-xs transition"
                              title="Mark print ready and trigger loud Delivery Boy ring"
                            >
                              <Bell size={13} className="text-amber-300 animate-bounce" />
                              <span>Mark Ready & Ring Delivery Boy</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Column 2: Ready for Pickup / Out for Delivery */}
              <div className="bg-slate-50 p-4 rounded-3xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between font-bold text-xs text-slate-700">
                  <span className="uppercase tracking-wider">Ready / Delivery ({readyPrintOrders.length})</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                </div>

                {readyPrintOrders.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-400 bg-white rounded-2xl border border-slate-200">
                    No prints waiting for pickup or delivery
                  </div>
                ) : (
                  readyPrintOrders.map(p => {
                    const isPickup = p.deliveryType === 'Pickup';
                    return (
                      <div key={p.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-slate-900 flex items-center gap-1">
                            <Printer size={12} className="text-teal-600" />
                            <span>Print #{p.id}</span>
                          </span>

                          {isPickup ? (
                            <span className="text-[10px] font-black uppercase bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded-md flex items-center gap-1">
                              <Store size={10} className="text-amber-700" />
                              <span>Self Store Pickup</span>
                            </span>
                          ) : p.status === 'READY_FOR_PICKUP' ? (
                            <span className="text-[10px] font-bold uppercase bg-amber-100 text-amber-900 px-2 py-0.5 rounded flex items-center gap-1 animate-pulse">
                              <Bell size={10} className="text-amber-700" />
                              <span>Ringing Delivery Boy</span>
                            </span>
                          ) : p.status === 'DELIVERY_ASSIGNED' ? (
                            <span className="text-[10px] font-bold uppercase bg-sky-100 text-sky-900 px-2 py-0.5 rounded">
                              Rider: {p.deliveryPartnerName || 'Assigned'}
                            </span>
                          ) : p.status === 'PICKED_UP' ? (
                            <span className="text-[10px] font-bold uppercase bg-purple-100 text-purple-900 px-2 py-0.5 rounded">
                              Picked Up by Rider
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold uppercase bg-indigo-100 text-indigo-900 px-2 py-0.5 rounded">
                              On The Way
                            </span>
                          )}
                        </div>

                        <div className="text-xs text-slate-600 space-y-1.5">
                          <div className="font-bold text-slate-800 truncate">{p.fileName}</div>
                          
                          {/* Self store pickup details box */}
                          {isPickup ? (
                            <div className="p-2.5 rounded-xl bg-amber-50/90 border border-amber-200 text-xs space-y-1">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-amber-950 flex items-center gap-1">
                                  <Store size={12} className="text-amber-700" />
                                  <span>Customer Counter Pickup</span>
                                </span>
                                <span className="text-[9px] font-bold uppercase text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded">
                                  Direct Handover
                                </span>
                              </div>
                              <div className="text-slate-700 text-[11px]">
                                Customer: <strong>{p.customerName}</strong> {p.customerPhone && <span>({p.customerPhone})</span>}
                              </div>
                              {p.deliveryOtp && (
                                <div className="text-amber-950 text-[11px] font-bold flex items-center gap-1 pt-0.5">
                                  <span>Customer Pickup OTP:</span>
                                  <span className="tracking-widest bg-white px-2 py-0.5 rounded border border-amber-300 font-mono text-amber-900 font-black">
                                    {p.deliveryOtp}
                                  </span>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="p-2.5 rounded-xl bg-sky-50/80 border border-sky-200 text-xs space-y-1">
                              <div className="text-[11px] text-slate-600">
                                Drop to: <strong>{p.customerName}</strong> ({p.customerAddress?.area || 'Delivery'})
                              </div>
                              {p.deliveryPartnerName ? (
                                <div className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                                  <Bike size={12} />
                                  <span>Rider: {p.deliveryPartnerName}</span>
                                  {p.deliveryPartnerPhone && <span className="text-slate-500">({p.deliveryPartnerPhone})</span>}
                                </div>
                              ) : (
                                <div className="text-[11px] text-amber-700 font-medium flex items-center gap-1">
                                  <Bell size={11} className="animate-bounce" />
                                  <span>Delivery Boy ring active • Waiting for rider accept</span>
                                </div>
                              )}
                              {p.deliveryOtp && (
                                <div className="text-[11px] text-slate-700 font-bold">
                                  Customer OTP: <span className="tracking-wider font-mono">{p.deliveryOtp}</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Action buttons: Vendor confirms delivery / handover */}
                        <div className="border-t border-slate-100 pt-2 flex items-center justify-between">
                          <span className="text-xs font-black text-slate-900">₹{p.totalAmount}</span>
                          <button
                            id={`vendor-confirm-delivery-${p.id}`}
                            onClick={() => updatePrintStatus(p.id, 'DELIVERED')}
                            className={`px-3.5 py-1.5 text-white text-xs font-black rounded-xl cursor-pointer flex items-center gap-1.5 shadow-xs transition active:scale-95 ${isPickup ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-slate-800 hover:bg-slate-900'}`}
                            title={isPickup ? "Confirm document handed over to customer" : "Confirm print delivery completed"}
                          >
                            <CheckCircle size={13} className="text-white" />
                            <span>{isPickup ? 'Confirm Customer Handover' : 'Confirm Delivery'}</span>
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Column 3: Delivered Today */}
              <div className="bg-slate-50 p-4 rounded-3xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between font-bold text-xs text-slate-700">
                  <span className="uppercase tracking-wider">Completed Today ({completedPrintOrders.length})</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                </div>

                {completedPrintOrders.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-400 bg-white rounded-2xl border border-slate-200">
                    No completed print orders yet today
                  </div>
                ) : (
                  completedPrintOrders.map(p => {
                    const isPickup = p.deliveryType === 'Pickup';
                    return (
                      <div key={p.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-slate-900">Print #{p.id}</span>
                          <span className="text-xs font-black text-emerald-700">₹{p.totalAmount}</span>
                        </div>
                        <p className="text-xs text-slate-600 font-medium truncate">{p.fileName} • {p.customerName}</p>
                        <div className="text-[10px] flex items-center justify-between">
                          <span className={`font-bold px-2 py-0.5 rounded ${isPickup ? 'bg-amber-100 text-amber-900' : 'bg-sky-100 text-sky-900'}`}>
                            {isPickup ? '🏬 Self Store Pickup' : '🛵 Doorstep Delivery'}
                          </span>
                          <span className="text-emerald-600 font-bold flex items-center gap-1">
                            <CheckCircle size={11} /> Delivered
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          ) : (
            /* STANDARD VENDOR KANBAN */
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Column 1: New / Accepted */}
              <div className="bg-slate-50 p-4 rounded-3xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between font-bold text-xs text-slate-700">
                  <span className="uppercase tracking-wider">New & Preparing ({newIncomingOrders.length + preparingOrders.length})</span>
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
                </div>

                {newIncomingOrders.length === 0 && preparingOrders.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-400 bg-white rounded-2xl border border-slate-200">
                    No orders in preparation
                  </div>
                ) : (
                  [...newIncomingOrders, ...preparingOrders].map(order => (
                    <div key={order.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-slate-900">#{order.id}</span>
                        <span className="text-[10px] font-bold uppercase bg-amber-100 text-amber-900 px-2 py-0.5 rounded">
                          {order.status}
                        </span>
                      </div>

                      <div className="text-xs text-slate-600 space-y-1">
                        <div><strong>Customer:</strong> {order.customerName} ({order.customerPhone})</div>
                        <div className="flex items-center gap-1.5 text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200">
                          <MapPin size={11} className="text-emerald-600 shrink-0" />
                          <span>Same Location Match: {order.deliveryAddress?.area || 'Local Area'} (PIN: {order.deliveryAddress?.pincode || '560038'})</span>
                        </div>
                        <div className="space-y-0.5 pt-1">
                          {order.items.map((it, i) => (
                            <div key={i} className="text-[11px] flex justify-between">
                              <span>{it.quantity}x {it.product.name} {it.selectedCut && `(${it.selectedCut})`}</span>
                              <span className="font-semibold">₹{it.product.price * it.quantity}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="border-t border-slate-100 pt-2 flex items-center justify-between">
                        <span className="text-xs font-black text-slate-900">Total: ₹{order.totalAmount}</span>
                        
                        {order.status === 'PLACED' ? (
                          <button
                            onClick={() => updateOrderStatus(order.id, 'ACCEPTED')}
                            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg cursor-pointer"
                          >
                            Accept Order
                          </button>
                        ) : (
                          <button
                            id={`mark-ready-${order.id}`}
                            onClick={() => updateOrderStatus(order.id, 'READY_FOR_PICKUP')}
                            className="px-3 py-1 bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold rounded-lg cursor-pointer flex items-center gap-1 shadow-xs"
                          >
                            <CheckCircle size={12} />
                            <span>Mark Ready & Ring Rider</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Column 2: Ready for Pickup / Searching Delivery */}
              <div className="bg-slate-50 p-4 rounded-3xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between font-bold text-xs text-slate-700">
                  <span className="uppercase tracking-wider">Ready for Pickup ({readyOrders.length})</span>
                  <span className="w-2 h-2 rounded-full bg-teal-500"></span>
                </div>

                {readyOrders.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-400 bg-white rounded-2xl border border-slate-200">
                    No orders packed and waiting
                  </div>
                ) : (
                  readyOrders.map(order => (
                    <div key={order.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-slate-900">#{order.id}</span>
                        <span className="text-[10px] font-bold uppercase bg-teal-100 text-teal-900 px-2 py-0.5 rounded">
                          Packed & Sealed
                        </span>
                      </div>

                      <div className="text-xs text-slate-600">
                        <p><strong>Customer:</strong> {order.customerName}</p>
                        <p className="text-[11px] text-slate-500 mt-1">{order.items.length} items packed</p>
                      </div>

                      <div className="p-2 bg-teal-50 border border-teal-200 rounded-xl text-[11px] text-teal-900 font-semibold flex items-center gap-1.5">
                        <Clock size={13} className="text-teal-600" />
                        <span>Rider notification dispatched. Hand over bag.</span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Column 3: Completed Today */}
              <div className="bg-slate-50 p-4 rounded-3xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between font-bold text-xs text-slate-700">
                  <span className="uppercase tracking-wider">Delivered Today ({completedOrders.length})</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                </div>

                {completedOrders.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-400 bg-white rounded-2xl border border-slate-200">
                    No completed deliveries yet today
                  </div>
                ) : (
                  completedOrders.map(order => (
                    <div key={order.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-slate-900">#{order.id}</span>
                        <span className="text-xs font-black text-emerald-700">₹{order.itemTotal}</span>
                      </div>
                      <p className="text-xs text-slate-500">Delivered to {order.customerName}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: INVENTORY & CATALOG MANAGEMENT */}
      {activeTab === 'inventory' && (
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-black text-slate-900">Store Catalog & Live Stock</h2>
              <p className="text-xs text-slate-500">Add products, update selling prices, and control real-time inventory</p>
            </div>

            <button
              id="open-add-product-modal-btn"
              onClick={() => setShowAddProductModal(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              <Plus size={16} />
              <span>Add New Product</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider font-bold">
                  <th className="py-3 px-2">Item</th>
                  <th className="py-3 px-2">Category</th>
                  <th className="py-3 px-2">Selling Price</th>
                  <th className="py-3 px-2">MRP</th>
                  <th className="py-3 px-2">Stock Level</th>
                  <th className="py-3 px-2">Status</th>
                  <th className="py-3 px-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {vendorProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-2 flex items-center gap-2">
                      <img src={p.image} alt={p.name} className="w-9 h-9 rounded-lg object-cover border border-slate-200" />
                      <div>
                        <div className="font-bold text-slate-900">{p.name}</div>
                        <div className="text-[10px] text-slate-400">{p.brand} • {p.weight}</div>
                      </div>
                    </td>
                    <td className="py-3 px-2 text-slate-600">{p.subcategory}</td>
                    <td className="py-3 px-2 font-bold text-slate-900">
                      <input
                        type="number"
                        defaultValue={p.price}
                        onBlur={(e) => updateProduct(p.id, { price: Number(e.target.value) })}
                        className="w-16 px-1.5 py-0.5 bg-slate-50 border border-slate-300 rounded font-bold"
                      />
                    </td>
                    <td className="py-3 px-2 text-slate-400 line-through">₹{p.mrp}</td>
                    <td className="py-3 px-2">
                      <input
                        type="number"
                        defaultValue={p.stock}
                        onBlur={(e) => updateProduct(p.id, { stock: Number(e.target.value), isAvailable: Number(e.target.value) > 0 })}
                        className="w-16 px-1.5 py-0.5 bg-slate-50 border border-slate-300 rounded font-bold"
                      />
                    </td>
                    <td className="py-3 px-2">
                      <button
                        onClick={() => updateProduct(p.id, { isAvailable: !p.isAvailable, stock: p.isAvailable ? 0 : 20 })}
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold cursor-pointer ${p.isAvailable && p.stock > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}
                      >
                        {p.isAvailable && p.stock > 0 ? 'In Stock' : 'Out of Stock'}
                      </button>
                    </td>
                    <td className="py-3 px-2 text-right">
                      <button
                        onClick={() => deleteProduct(p.id)}
                        className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded cursor-pointer"
                        title="Delete Product"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: SALES & FINANCIAL ANALYTICS */}
      {activeTab === 'sales' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Today's Store Sales</span>
              <div className="text-2xl font-black text-slate-900">₹{todayRevenue}</div>
              <p className="text-[11px] text-emerald-600 font-semibold">T+1 Daily Bank Transfer</p>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Completed Deliveries</span>
              <div className="text-2xl font-black text-slate-900">{completedOrders.length}</div>
              <p className="text-[11px] text-slate-500">100% On-time fulfillment</p>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Avg Packaging Time</span>
              <div className="text-2xl font-black text-teal-700">{currentVendor.prepTimeMinutes} Mins</div>
              <p className="text-[11px] text-teal-600 font-semibold">Fast merchant badge active</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: STORE PROFILE & COMPLIANCE */}
      {activeTab === 'profile' && (
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-5 max-w-2xl">
          <h2 className="text-base font-black text-slate-900">Regulatory Verification & Licenses</h2>

          <div className="space-y-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="font-bold text-slate-700 block">Registered Business Name:</span>
              <span className="text-slate-900 font-semibold">{currentVendor.businessName}</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="font-bold text-slate-700 block">FSSAI / Food License Number:</span>
              <span className="text-slate-900 font-mono font-semibold">{currentVendor.fssaiNumber || '21224190000123'} (Active & Verified)</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="font-bold text-slate-700 block">GSTIN:</span>
              <span className="text-slate-900 font-mono font-semibold">{currentVendor.gstNumber || '29AABCS1429B1Z2'}</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="font-bold text-slate-700 block">Pickup Store Address:</span>
              <span className="text-slate-900">{currentVendor.address}</span>
            </div>
          </div>
        </div>
      )}

      {/* ADD PRODUCT MODAL */}
      {showAddProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900">Add Item to {currentVendor.name}</h3>
              <button onClick={() => setShowAddProductModal(false)} className="p-1 rounded-lg text-slate-400">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="p-5 space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Product Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Farm Fresh Alphonso Mango"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Brand Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Organic Pure"
                    value={newBrand}
                    onChange={(e) => setNewBrand(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Subcategory</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Fruits, Rice, Dairy"
                    value={newSubcategory}
                    onChange={(e) => setNewSubcategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Selling Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={newPrice}
                    onChange={(e) => setNewPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">MRP (₹)</label>
                  <input
                    type="number"
                    required
                    value={newMrp}
                    onChange={(e) => setNewMrp(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Stock Units</label>
                  <input
                    type="number"
                    required
                    value={newStock}
                    onChange={(e) => setNewStock(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Weight / Unit</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 500g, 1L, 1 pack"
                    value={newWeight}
                    onChange={(e) => setNewWeight(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Veg / Non-Veg</label>
                  <select
                    value={newIsVeg ? 'veg' : 'non-veg'}
                    onChange={(e) => setNewIsVeg(e.target.value === 'veg')}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-semibold"
                  >
                    <option value="veg">100% Vegetarian</option>
                    <option value="non-veg">Non-Vegetarian</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddProductModal(false)}
                  className="px-4 py-2 bg-slate-100 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md cursor-pointer"
                >
                  Save Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
