import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Order, OrderStatus, PrintOrder } from '../../types';
import { 
  Bike, Navigation, Phone, CheckCircle, ShieldCheck, 
  MapPin, Clock, DollarSign, Bell, Volume2, VolumeX, 
  AlertCircle, ArrowRight, KeyRound, Store, Printer, FileText 
} from 'lucide-react';
import { isSameLocation } from '../../utils/locationMatch';

export const DeliveryPartnerApp: React.FC = () => {
  const { 
    orders, updateOrderStatus, assignDeliveryPartner, 
    verifyDeliveryOtp, deliveryPartners, activeDeliveryPartnerId, setActiveDeliveryPartnerId,
    soundEnabled, setSoundEnabled, playTestRing, isRinging, stopRing,
    printOrders, updatePrintStatus, assignPrintDeliveryPartner, verifyPrintDeliveryOtp,
    language, t
  } = useApp();

  const [partnerOnline, setPartnerOnline] = useState(true);
  const [enteredOtp, setEnteredOtp] = useState('');
  const [otpMessage, setOtpMessage] = useState<{ text: string; isError: boolean } | null>(null);

  const [printEnteredOtp, setPrintEnteredOtp] = useState('');
  const [printOtpMessage, setPrintOtpMessage] = useState<{ text: string; isError: boolean } | null>(null);

  const currentPartner = deliveryPartners.find(p => p.id === activeDeliveryPartnerId) || deliveryPartners[0];

  const isMatchPartnerLocation = (customerAddress?: any) => {
    return isSameLocation(customerAddress, {
      operatingArea: currentPartner.operatingArea,
      operatingCity: currentPartner.operatingCity,
      operatingPincode: currentPartner.operatingPincode
    });
  };

  // 1. Standard orders searching for a rider in this rider's operating location
  const incomingStoreRequests = orders.filter(o => 
    (o.status === 'READY_FOR_PICKUP' || o.status === 'DELIVERY_PARTNER_SEARCHING') &&
    partnerOnline &&
    isMatchPartnerLocation(o.deliveryAddress)
  );

  // 2. Print orders marked ready by Print Vendor waiting for delivery partner in same operating location
  const incomingPrintRequests = printOrders.filter(p =>
    (p.status === 'READY_FOR_PICKUP' || p.status === 'PRINT_READY') &&
    !p.deliveryPartnerId &&
    p.deliveryType !== 'Pickup' &&
    (p.deliveryType === 'Delivery' || !p.deliveryType) &&
    partnerOnline &&
    isMatchPartnerLocation(p.customerAddress)
  );

  // Orders in other operating zones (for informational notice)
  const otherZoneOrderCount = orders.filter(o =>
    (o.status === 'READY_FOR_PICKUP' || o.status === 'DELIVERY_PARTNER_SEARCHING') &&
    !isMatchPartnerLocation(o.deliveryAddress)
  ).length + printOrders.filter(p =>
    (p.status === 'READY_FOR_PICKUP' || p.status === 'PRINT_READY') &&
    !p.deliveryPartnerId &&
    p.deliveryType !== 'Pickup' &&
    !isMatchPartnerLocation(p.customerAddress)
  ).length;

  // Active trips
  const activeStoreTrip = orders.find(o => 
    o.deliveryPartnerId === currentPartner.id && 
    o.status !== 'DELIVERED' && 
    o.status !== 'CANCELLED'
  );

  const activePrintTrip = printOrders.find(p =>
    p.deliveryPartnerId === currentPartner.id &&
    p.status !== 'DELIVERED' &&
    p.status !== 'SUBMITTED'
  );

  const activeTrip = activeStoreTrip;

  // Completed trips
  const completedStoreTrips = orders.filter(o => 
    o.deliveryPartnerId === currentPartner.id && 
    o.status === 'DELIVERED'
  );

  const completedPrintTrips = printOrders.filter(p =>
    p.deliveryPartnerId === currentPartner.id &&
    p.status === 'DELIVERED'
  );

  const totalCompletedCount = completedStoreTrips.length + completedPrintTrips.length;

  const handleAcceptStoreRequest = (orderId: string) => {
    assignDeliveryPartner(orderId, currentPartner.id);
  };

  const handleAcceptPrintRequest = (printOrderId: string) => {
    assignPrintDeliveryPartner(printOrderId, currentPartner.id);
  };

  const handleVerifyStoreOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeStoreTrip || !enteredOtp) return;

    const res = verifyDeliveryOtp(activeStoreTrip.id, enteredOtp);
    if (res.success) {
      setOtpMessage({ text: res.message, isError: false });
      setEnteredOtp('');
    } else {
      setOtpMessage({ text: res.message, isError: true });
    }
  };

  const handleVerifyPrintOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePrintTrip || !printEnteredOtp) return;

    const res = verifyPrintDeliveryOtp(activePrintTrip.id, printEnteredOtp);
    if (res.success) {
      setPrintOtpMessage({ text: res.message, isError: false });
      setPrintEnteredOtp('');
    } else {
      setPrintOtpMessage({ text: res.message, isError: true });
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-4 sm:py-6 space-y-6">
      {/* Partner Status Header */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <img 
            src={currentPartner.avatar} 
            alt={currentPartner.name} 
            className="w-14 h-14 rounded-2xl object-cover border-2 border-amber-400 shadow-xs"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-black text-slate-900">{currentPartner.name}</h1>
              <span className="text-[10px] font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full uppercase">
                {currentPartner.vehicleType}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              {currentPartner.vehicleNumber} • ⭐ {currentPartner.rating} Rating
            </p>
            <div className="flex items-center gap-2 mt-1">
              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                <MapPin size={11} className="text-emerald-600" />
                Operating Zone: {currentPartner.operatingArea || 'Indiranagar'}, {currentPartner.operatingCity || 'Bengaluru'} ({currentPartner.operatingPincode || '560038'})
              </span>
            </div>
          </div>
        </div>

        {/* Rider Switcher, Online Toggle & Ring Volume */}
        <div className="flex items-center gap-3 flex-wrap">
          <select
            id="delivery-partner-switcher"
            value={activeDeliveryPartnerId}
            onChange={(e) => setActiveDeliveryPartnerId(e.target.value)}
            className="bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 outline-none cursor-pointer"
          >
            {deliveryPartners.map(p => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.operatingArea || 'Local Hub'} - {p.operatingPincode || 'PIN'})
              </option>
            ))}
          </select>

          <button
            id="partner-online-toggle"
            onClick={() => setPartnerOnline(!partnerOnline)}
            className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-2 cursor-pointer ${partnerOnline ? 'bg-emerald-600 text-white shadow-md' : 'bg-slate-200 text-slate-700'}`}
          >
            <span className={`w-2.5 h-2.5 rounded-full ${partnerOnline ? 'bg-white animate-ping' : 'bg-slate-400'}`}></span>
            <span>{partnerOnline ? 'RIDER ONLINE' : 'GO OFFLINE'}</span>
          </button>

          <button
            onClick={playTestRing}
            className="p-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-600 cursor-pointer"
            title="Test Order Ring"
          >
            <Volume2 size={18} className="text-amber-600" />
          </button>
        </div>
      </div>

      {/* OTHER ZONES INFO BANNER (Location matching confirmation) */}
      {otherZoneOrderCount > 0 && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-2xl flex items-center justify-between text-xs text-blue-900">
          <div className="flex items-center gap-2">
            <MapPin size={16} className="text-blue-600 shrink-0" />
            <span>
              <strong>Location-Based Routing Active:</strong> {otherZoneOrderCount} orders in different zones are routed exclusively to riders operating in those exact locations.
            </span>
          </div>
        </div>
      )}

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 text-center">
          <span className="text-[10px] uppercase font-bold text-slate-400">Today's Earnings</span>
          <div className="text-xl font-black text-slate-900 mt-0.5">₹{currentPartner.todayEarnings}</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 text-center">
          <span className="text-[10px] uppercase font-bold text-slate-400">Trips Completed</span>
          <div className="text-xl font-black text-emerald-700 mt-0.5">{totalCompletedCount}</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 text-center">
          <span className="text-[10px] uppercase font-bold text-slate-400">Active Payout</span>
          <div className="text-xl font-black text-slate-900 mt-0.5">Instant UPI</div>
        </div>
      </div>

      {/* INCOMING PRINT DELIVERY REQUEST RING (When Print Vendor Marks Ready!) */}
      {incomingPrintRequests.length > 0 && !activeStoreTrip && !activePrintTrip && (
        <div className="bg-linear-to-r from-teal-700 via-emerald-700 to-cyan-800 text-white p-5 rounded-3xl shadow-xl border-2 border-teal-300 animate-pulse space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-white text-teal-800 flex items-center justify-center font-black shadow-md">
                <Printer size={20} className="animate-bounce text-teal-700" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-teal-200 flex items-center gap-1">
                  <Bell size={11} className="text-amber-300 animate-bounce" />
                  <span>{language === 'bn' ? 'প্রিন্ট ভেন্ডর অর্ডার রেডি করেছেন • ডেলিভারি বয় রিং' : 'PRINT VENDOR MARKED READY • RIDER RING'}</span>
                </span>
                <h3 className="text-base font-black">Print Order #{incomingPrintRequests[0].id} Ready for Pickup</h3>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-teal-100 uppercase font-bold block">Trip Earning</span>
              <span className="text-lg font-black text-yellow-300">₹50.00</span>
            </div>
          </div>

          {/* Document & Route details */}
          <div className="bg-black/25 backdrop-blur-xs p-3.5 rounded-2xl space-y-2 text-xs">
            <div className="flex items-center gap-2">
              <FileText size={15} className="text-teal-300 shrink-0" />
              <span><strong>Document:</strong> {incomingPrintRequests[0].fileName} ({incomingPrintRequests[0].pages} Pages • {incomingPrintRequests[0].colorMode} • {incomingPrintRequests[0].binding})</span>
            </div>
            <div className="flex items-center gap-2">
              <Store size={15} className="text-amber-300 shrink-0" />
              <span><strong>Pickup Print Store:</strong> {incomingPrintRequests[0].storeName || 'PrintFast Digital Works'} ({incomingPrintRequests[0].storeAddress || 'Opposite University Gate, MG Road'})</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin size={15} className="text-emerald-300 shrink-0" />
              <span><strong>Deliver to:</strong> {incomingPrintRequests[0].customerName} ({incomingPrintRequests[0].customerAddress?.street || 'Indiranagar'}, {incomingPrintRequests[0].customerAddress?.area || 'Bengaluru'})</span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-teal-200 font-bold bg-black/25 px-2.5 py-1 rounded-lg mt-1">
              <MapPin size={13} className="text-teal-300" />
              <span>Same Location Match: Customer in {incomingPrintRequests[0].customerAddress?.area || 'Local Area'} (PIN: {incomingPrintRequests[0].customerAddress?.pincode || '560038'})</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="partner-accept-print-trip-btn"
              onClick={() => handleAcceptPrintRequest(incomingPrintRequests[0].id)}
              className="flex-1 py-3 bg-white hover:bg-teal-50 text-teal-950 font-extrabold text-xs rounded-xl shadow-lg flex items-center justify-center gap-1.5 cursor-pointer active:scale-98 transition"
            >
              <CheckCircle size={16} className="text-emerald-600" />
              <span>{language === 'bn' ? 'প্রিন্ট ডেলিভারি ট্রিপ গ্রহণ করুন (₹৫০)' : 'ACCEPT PRINT DELIVERY TRIP (₹50)'}</span>
            </button>
          </div>
        </div>
      )}

      {/* INCOMING STORE DELIVERY REQUEST RING (If any regular store order is searching) */}
      {incomingStoreRequests.length > 0 && !activeStoreTrip && !activePrintTrip && (
        <div className="bg-linear-to-r from-amber-600 to-orange-600 text-white p-5 rounded-3xl shadow-xl border-2 border-amber-300 animate-pulse space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-white text-amber-800 flex items-center justify-center font-black">
                <Bell size={20} className="animate-bounce" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-200">Store Delivery Ring</span>
                <h3 className="text-base font-black">Order #{incomingStoreRequests[0].id} Ready for Pickup</h3>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-amber-100 uppercase font-bold block">Your Earning</span>
              <span className="text-lg font-black text-yellow-300">₹65.00</span>
            </div>
          </div>

          {/* Pickup & Drop Points */}
          <div className="bg-black/20 backdrop-blur-xs p-3.5 rounded-2xl space-y-2 text-xs">
            <div className="flex items-center gap-2">
              <Store size={15} className="text-amber-300 shrink-0" />
              <span><strong>Pickup:</strong> {incomingStoreRequests[0].vendorName} ({incomingStoreRequests[0].vendorAddress})</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin size={15} className="text-emerald-300 shrink-0" />
              <span><strong>Deliver to:</strong> {incomingStoreRequests[0].customerName} ({incomingStoreRequests[0].deliveryAddress.area})</span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-emerald-200 font-bold bg-black/25 px-2.5 py-1 rounded-lg mt-1">
              <MapPin size={13} className="text-emerald-300" />
              <span>Same Location Match: {incomingStoreRequests[0].deliveryAddress.area} (PIN: {incomingStoreRequests[0].deliveryAddress.pincode})</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="partner-accept-store-trip-btn"
              onClick={() => handleAcceptStoreRequest(incomingStoreRequests[0].id)}
              className="flex-1 py-3 bg-white hover:bg-amber-50 text-amber-900 font-extrabold text-xs rounded-xl shadow-lg flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <CheckCircle size={16} className="text-emerald-600" />
              <span>ACCEPT DELIVERY TRIP (Same Location: {incomingStoreRequests[0].deliveryAddress.area})</span>
            </button>
          </div>
        </div>
      )}

      {/* ACTIVE PRINT TRIP IN PROGRESS */}
      {activePrintTrip && (
        <div className="bg-white p-5 rounded-3xl border-2 border-teal-500 shadow-md space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <span className="text-[10px] font-black uppercase text-teal-800 bg-teal-100 px-2 py-0.5 rounded flex items-center gap-1 inline-flex">
                <Printer size={11} />
                <span>Active Print Delivery • #{activePrintTrip.id}</span>
              </span>
              <h2 className="text-base font-black text-slate-900 mt-1">
                Current Status: {activePrintTrip.status.replace(/_/g, ' ')}
              </h2>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-slate-400 uppercase font-bold">Fare</span>
              <div className="text-base font-black text-teal-700">₹50 + Tip</div>
            </div>
          </div>

          {/* Document and Route details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 block uppercase">1. Pickup Print Store</span>
              <div className="font-bold text-slate-900 mt-0.5">{activePrintTrip.storeName || 'PrintFast Digital Works'}</div>
              <p className="text-slate-500 text-[11px]">{activePrintTrip.storeAddress || 'Opposite University Gate, MG Road'}</p>
              <div className="mt-2 text-[11px] text-teal-700 font-semibold bg-teal-50 p-2 rounded-xl border border-teal-200">
                📄 {activePrintTrip.fileName} ({activePrintTrip.pages} Pages, {activePrintTrip.binding})
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 block uppercase">2. Customer Drop</span>
              <div className="font-bold text-slate-900 mt-0.5">{activePrintTrip.customerName}</div>
              <p className="text-slate-500 text-[11px]">
                {activePrintTrip.customerAddress?.street || '100ft Road, Near KFC Junction'}, {activePrintTrip.customerAddress?.area || 'Indiranagar'}
              </p>
              {activePrintTrip.customerPhone && (
                <p className="text-slate-500 text-[11px] mt-1">Phone: {activePrintTrip.customerPhone}</p>
              )}
            </div>
          </div>

          {/* Print Delivery Progress Buttons */}
          <div className="space-y-3">
            <span className="text-xs font-bold text-slate-700 block">Update Print Delivery Progress</span>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                id="rider-print-picked-up-btn"
                onClick={() => updatePrintStatus(activePrintTrip.id, 'PICKED_UP')}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition cursor-pointer flex items-center justify-center gap-1.5 ${activePrintTrip.status === 'PICKED_UP' ? 'bg-teal-600 text-white border-teal-600 shadow-xs' : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'}`}
              >
                <CheckCircle size={14} />
                <span>1. Document Picked Up from Print Store</span>
              </button>

              <button
                id="rider-print-out-for-delivery-btn"
                onClick={() => updatePrintStatus(activePrintTrip.id, 'OUT_FOR_DELIVERY')}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition cursor-pointer flex items-center justify-center gap-1.5 ${activePrintTrip.status === 'OUT_FOR_DELIVERY' ? 'bg-teal-600 text-white border-teal-600 shadow-xs' : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'}`}
              >
                <Bike size={14} />
                <span>2. Out For Delivery (On The Way)</span>
              </button>
            </div>
          </div>

          {/* 4-DIGIT PRINT OTP VERIFICATION FORM */}
          <div className="p-4 bg-teal-50 border border-teal-200 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-teal-950 font-bold text-xs">
                <KeyRound size={16} className="text-teal-700" />
                <span>Customer Delivery Handover</span>
              </div>
              <span className="text-[10px] bg-teal-200 text-teal-900 px-2 py-0.5 rounded font-bold">
                Customer OTP: {activePrintTrip.deliveryOtp || '4829'}
              </span>
            </div>
            <p className="text-[11px] text-teal-800">
              Ask customer for their 4-digit Delivery OTP (visible on their print tracking screen) or click Handover:
            </p>

            <form onSubmit={handleVerifyPrintOtp} className="flex gap-2">
              <input
                id="partner-print-otp-input"
                type="text"
                maxLength={4}
                placeholder={activePrintTrip.deliveryOtp || '4829'}
                value={printEnteredOtp}
                onChange={(e) => setPrintEnteredOtp(e.target.value)}
                className="flex-1 px-4 py-2 text-center text-sm font-black tracking-widest bg-white border border-teal-300 rounded-xl focus:outline-teal-600"
              />
              <button
                id="verify-print-delivery-otp-btn"
                type="submit"
                className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs rounded-xl shadow-md cursor-pointer transition active:scale-95"
              >
                Verify & Handover
              </button>
            </form>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => verifyPrintDeliveryOtp(activePrintTrip.id, activePrintTrip.deliveryOtp || '4829')}
                className="text-xs text-teal-700 hover:text-teal-900 font-bold underline cursor-pointer"
              >
                Quick Complete Handover (Without OTP)
              </button>
            </div>

            {printOtpMessage && (
              <div className={`text-xs font-bold ${printOtpMessage.isError ? 'text-red-600' : 'text-emerald-700'}`}>
                {printOtpMessage.text}
              </div>
            )}
          </div>

          {/* Quick Call Customer */}
          <div className="flex justify-end">
            <a
              href={`tel:${activePrintTrip.customerPhone || '+91 98765 00112'}`}
              className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
            >
              <Phone size={14} />
              <span>Call Customer ({activePrintTrip.customerPhone || '+91 98765 00112'})</span>
            </a>
          </div>
        </div>
      )}

      {/* ACTIVE REGULAR STORE TRIP IN PROGRESS */}
      {activeStoreTrip && (
        <div className="bg-white p-5 rounded-3xl border-2 border-emerald-500 shadow-md space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <span className="text-[10px] font-black uppercase text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                Active Store Delivery • #{activeStoreTrip.id}
              </span>
              <h2 className="text-base font-black text-slate-900 mt-1">
                Current State: {activeStoreTrip.status.replace(/_/g, ' ')}
              </h2>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-slate-400 uppercase font-bold">Fare</span>
              <div className="text-base font-black text-emerald-700">₹65 + Tip</div>
            </div>
          </div>

          {/* Route details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 block uppercase">1. Pickup Merchant</span>
              <div className="font-bold text-slate-900 mt-0.5">{activeStoreTrip.vendorName}</div>
              <p className="text-slate-500 text-[11px]">{activeStoreTrip.vendorAddress}</p>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 block uppercase">2. Customer Drop</span>
              <div className="font-bold text-slate-900 mt-0.5">{activeStoreTrip.customerName}</div>
              <p className="text-slate-500 text-[11px]">{activeStoreTrip.deliveryAddress.street}, {activeStoreTrip.deliveryAddress.area}</p>
            </div>
          </div>

          {/* Trip Stepper Action Buttons */}
          <div className="space-y-3">
            <span className="text-xs font-bold text-slate-700 block">Update Your Delivery Progress</span>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                id="rider-picked-up-btn"
                onClick={() => updateOrderStatus(activeStoreTrip.id, 'PICKED_UP')}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition cursor-pointer ${activeStoreTrip.status === 'PICKED_UP' ? 'bg-teal-600 text-white border-teal-600' : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'}`}
              >
                1. Order Picked Up
              </button>

              <button
                id="rider-out-for-delivery-btn"
                onClick={() => updateOrderStatus(activeStoreTrip.id, 'OUT_FOR_DELIVERY')}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition cursor-pointer ${activeStoreTrip.status === 'OUT_FOR_DELIVERY' ? 'bg-teal-600 text-white border-teal-600' : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'}`}
              >
                2. On the Way
              </button>

              <button
                id="rider-arriving-btn"
                onClick={() => updateOrderStatus(activeStoreTrip.id, 'ARRIVING')}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition cursor-pointer ${activeStoreTrip.status === 'ARRIVING' ? 'bg-teal-600 text-white border-teal-600' : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'}`}
              >
                3. Arrived at Doorstep
              </button>
            </div>
          </div>

          {/* 4-DIGIT OTP VERIFICATION FORM */}
          <div className="p-4 bg-amber-50 border border-amber-300 rounded-2xl space-y-3">
            <div className="flex items-center gap-2 text-amber-950 font-bold text-xs">
              <KeyRound size={16} className="text-amber-700" />
              <span>Mandatory Customer OTP Verification</span>
            </div>
            <p className="text-[11px] text-amber-800">
              Ask customer for their 4-digit Delivery OTP (visible on their tracking screen) to complete delivery:
            </p>

            <form onSubmit={handleVerifyStoreOtp} className="flex gap-2">
              <input
                id="partner-otp-input"
                type="text"
                maxLength={4}
                placeholder="Enter 4-digit OTP"
                value={enteredOtp}
                onChange={(e) => setEnteredOtp(e.target.value)}
                className="flex-1 px-4 py-2 text-center text-sm font-black tracking-widest bg-white border border-amber-400 rounded-xl focus:outline-emerald-600"
              />
              <button
                id="verify-delivery-otp-btn"
                type="submit"
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md cursor-pointer"
              >
                Verify & Handover
              </button>
            </form>

            {otpMessage && (
              <div className={`text-xs font-bold ${otpMessage.isError ? 'text-red-600' : 'text-emerald-700'}`}>
                {otpMessage.text}
              </div>
            )}
          </div>

          {/* Quick Call Customer */}
          <div className="flex justify-end">
            <a
              href={`tel:${activeStoreTrip.customerPhone}`}
              className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
            >
              <Phone size={14} />
              <span>Call Customer ({activeStoreTrip.customerPhone})</span>
            </a>
          </div>
        </div>
      )}

      {/* If neither print nor store trip is active */}
      {!activeStoreTrip && !activePrintTrip && (
        <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center text-slate-400 space-y-2">
          <Bike size={36} className="mx-auto text-slate-300" />
          <div className="text-sm font-bold text-slate-700">No active delivery in progress</div>
          <p className="text-xs text-slate-500">
            Keep your status Online. When Print vendors mark orders ready or merchants pack orders, incoming delivery rings will appear here!
          </p>
        </div>
      )}

      {/* Completed Trips Feed */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-3">
        <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500">Recent Completed Trips</h3>
        {totalCompletedCount === 0 ? (
          <p className="text-xs text-slate-400">No completed orders yet today.</p>
        ) : (
          <div className="space-y-2">
            {completedPrintTrips.map(p => (
              <div key={p.id} className="p-3 bg-teal-50/60 rounded-xl flex items-center justify-between text-xs border border-teal-100">
                <div className="flex items-center gap-2">
                  <span className="p-1 bg-teal-600 text-white rounded-md"><Printer size={12} /></span>
                  <div>
                    <span className="font-bold text-slate-900">Print #{p.id}</span>
                    <span className="text-slate-500 ml-2">{p.storeName || 'PrintFast'} → {p.customerName}</span>
                  </div>
                </div>
                <span className="font-extrabold text-teal-700">+₹50.00</span>
              </div>
            ))}
            {completedStoreTrips.map(t => (
              <div key={t.id} className="p-3 bg-slate-50 rounded-xl flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="p-1 bg-amber-500 text-white rounded-md"><Store size={12} /></span>
                  <div>
                    <span className="font-bold text-slate-900">Order #{t.id}</span>
                    <span className="text-slate-500 ml-2">{t.vendorName} → {t.customerName}</span>
                  </div>
                </div>
                <span className="font-extrabold text-emerald-700">+₹65.00</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
