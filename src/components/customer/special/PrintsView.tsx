import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { PrintOrder } from '../../../types';
import { soundService } from '../../../lib/audio';
import { 
  Printer, Upload, FileText, CheckCircle2, 
  Clock, ShieldCheck, ArrowRight, ChevronRight,
  Bell, Volume2, VolumeX, Check, AlertCircle, Store, Phone, MapPin
} from 'lucide-react';
import { findSameLocationVendor } from '../../../utils/locationMatch';

export const PrintsView: React.FC = () => {
  const { 
    submitPrintOrder, printOrders, updatePrintStatus, assignPrintDeliveryPartner, selectedAddress, 
    language, t, isRinging, stopRing, playTestRing, soundEnabled, setSoundEnabled,
    vendors
  } = useApp();

  const printsVendor = findSameLocationVendor(vendors, 'prints', selectedAddress) || {
    id: 'v_prints_1',
    name: 'PrintFast Digital Works',
    address: 'Opposite University Gate, MG Road',
    area: 'Indiranagar',
    city: 'Bengaluru',
    pincode: '560038',
    rating: 4.8,
    phone: '+91 98202 23344'
  };

  const [fileName, setFileName] = useState('Project_Proposal_Final.pdf');
  const [fileSize, setFileSize] = useState('2.4 MB');
  const [pages, setPages] = useState<number>(12);
  const [copies, setCopies] = useState<number>(1);
  const [colorMode, setColorMode] = useState<'B&W' | 'Color'>('B&W');
  const [sidedness, setSidedness] = useState<'Single' | 'Double'>('Double');
  const [paperType, setPaperType] = useState<'Standard 75 GSM' | 'Bond 100 GSM' | 'Glossy 180 GSM'>('Standard 75 GSM');
  const [binding, setBinding] = useState<'None' | 'Spiral' | 'Hardcover'>('Spiral');
  const [deliveryType, setDeliveryType] = useState<'Delivery' | 'Pickup'>('Delivery');
  const [activePrintId, setActivePrintId] = useState<string | null>(() => {
    return printOrders.length > 0 ? printOrders[0].id : null;
  });

  const activePrint = printOrders.find(p => p.id === activePrintId) || printOrders[0] || null;

  // Pricing calculation
  const perPagePrice = colorMode === 'B&W' ? 2 : 8;
  const paperExtra = paperType === 'Bond 100 GSM' ? 2 : paperType === 'Glossy 180 GSM' ? 10 : 0;
  const bindingPrice = binding === 'Spiral' ? 35 : binding === 'Hardcover' ? 120 : 0;
  const deliveryFee = deliveryType === 'Delivery' ? 25 : 0;

  const validPages = Number.isFinite(pages) && pages > 0 ? pages : 1;
  const validCopies = Number.isFinite(copies) && copies > 0 ? copies : 1;
  const totalSheets = sidedness === 'Double' ? Math.ceil(validPages / 2) : validPages;
  const printingCost = totalSheets * (perPagePrice + paperExtra) * validCopies;
  const grandTotal = Math.max(0, (Number(printingCost) || 0) + ((Number(bindingPrice) || 0) * validCopies) + (Number(deliveryFee) || 0));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Explicit user click unlocks audio context directly and starts vendor ring immediately
    if (soundEnabled) {
      soundService.startOrderRing(20);
    }

    const order = submitPrintOrder({
      customerId: 'user_cust_1',
      customerName: 'Subhajit Jana',
      storeName: printsVendor.name,
      vendorName: printsVendor.name,
      vendorId: printsVendor.id,
      fileName,
      pages,
      copies,
      colorMode,
      paperType,
      binding,
      deliveryType,
      totalAmount: grandTotal
    });
    setActivePrintId(order.id);
  };

  const handleSimulateStatus = () => {
    if (!activePrint) return;
    const isPickup = activePrint.deliveryType === 'Pickup';
    const stages: PrintOrder['status'][] = isPickup 
      ? ['SUBMITTED', 'PRINTING', 'READY_FOR_PICKUP', 'DELIVERED']
      : [
          'SUBMITTED', 
          'PRINTING', 
          'READY_FOR_PICKUP', 
          'DELIVERY_ASSIGNED', 
          'PICKED_UP', 
          'OUT_FOR_DELIVERY', 
          'DELIVERED'
        ];
    const curr = stages.indexOf(activePrint.status);
    if (curr < stages.length - 1) {
      const next = stages[curr + 1];
      if (next === 'DELIVERY_ASSIGNED' && !activePrint.deliveryPartnerName) {
        assignPrintDeliveryPartner(activePrint.id, 'del_1');
      } else {
        updatePrintStatus(activePrint.id, next);
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Banner */}
      <div className="bg-linear-to-r from-teal-700 via-emerald-700 to-cyan-800 text-white p-6 rounded-3xl shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-lg">
          <span className="text-[10px] font-black uppercase tracking-widest bg-black/30 px-2.5 py-1 rounded-full text-emerald-300">
            {language === 'bn' ? 'কাস্টমার ইনস্ট্যান্ট প্রিন্ট ও জেরক্স' : 'Customar Instant Xerox & Document Delivery'}
          </span>
          <h1 className="text-2xl sm:text-3xl font-black mt-2 tracking-tight">
            {language === 'bn' ? '১৫ মিনিটে ডকুমেন্ট প্রিন্ট ও হোম ডেলিভারি' : 'Print Documents In 15 Mins. High GSM Laser Prints.'}
          </h1>
          <p className="text-xs text-teal-100 mt-1 leading-relaxed">
            {language === 'bn' 
              ? 'নোট, সিভি, জরুরি কাগজপত্র আপলোড করুন। রঙিন বা সাদা-কালো প্রিন্ট ও স্পাইরাল বাইন্ডিং সরাসরি আপনার ঘরে।' 
              : 'Upload notes, resumes, blueprints, spiral-bound dossiers or contracts. Delivered warm and crisp to your door.'}
          </p>
        </div>
        <div className="absolute right-4 bottom-2 opacity-20 text-8xl">🖨️</div>
      </div>

      {/* Real-time Prints Vendor Ring Announcement Banner when ringing */}
      {(isRinging || (activePrint && activePrint.status === 'SUBMITTED')) && (
        <div className="bg-linear-to-r from-teal-800 via-emerald-700 to-cyan-900 text-white p-4 sm:p-5 rounded-3xl shadow-xl border-2 border-emerald-400 animate-pulse flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white text-emerald-800 flex items-center justify-center font-black text-xl shadow-md">
              <Bell size={26} className="animate-bounce text-emerald-700" />
            </div>
            <div>
              <div className="text-[11px] font-black uppercase tracking-wider text-emerald-200 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                <span>{language === 'bn' ? '🔔 প্রিন্ট ভেন্ডরের দোকানে রিং বাজছে!' : '🔔 Prints Vendor Terminal Ringing!'}</span>
              </div>
              <h2 className="text-base sm:text-lg font-black tracking-tight mt-0.5">
                {printsVendor.name} • {language === 'bn' ? 'জরুরি প্রিন্ট অর্ডার অ্যালার্ট' : 'Incoming Print Order Spooling'}
              </h2>
              <p className="text-xs text-teal-100 mt-0.5">
                {activePrint 
                  ? `${activePrint.fileName} (${activePrint.pages} ${language === 'bn' ? 'পেজ' : 'pages'}, ${activePrint.copies} ${language === 'bn' ? 'কপি' : 'copies'}) • ₹${activePrint.totalAmount}`
                  : `${language === 'bn' ? 'ভেন্ডরের প্রিন্টার ও ফোন বাজছে...' : 'Vendor terminal & printer spooler are ringing...'}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {activePrint && activePrint.status === 'SUBMITTED' && (
              <button
                id="vendor-accept-print-ring-btn"
                onClick={() => {
                  updatePrintStatus(activePrint.id, 'PRINTING');
                  stopRing();
                }}
                className="px-4 py-2.5 bg-white hover:bg-emerald-50 text-emerald-800 font-extrabold text-xs rounded-xl shadow-md cursor-pointer transition flex items-center gap-1.5"
              >
                <Check size={16} />
                <span>{language === 'bn' ? 'ভেন্ডর গ্রহণ করেছে (Accept)' : 'Accept & Start Print'}</span>
              </button>
            )}

            <button
              id="stop-print-ring-btn"
              onClick={stopRing}
              className="px-3.5 py-2.5 bg-black/30 hover:bg-black/50 text-white font-bold text-xs rounded-xl border border-white/20 cursor-pointer transition flex items-center gap-1.5"
            >
              <VolumeX size={15} />
              <span>{language === 'bn' ? 'রিং মিউট করুন' : 'Stop Ring'}</span>
            </button>

            <button
              id="re-ring-print-vendor-btn"
              onClick={playTestRing}
              className="px-3 py-2.5 bg-emerald-600/60 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl border border-white/20 cursor-pointer transition flex items-center gap-1"
              title="Test Vendor Ring"
            >
              <Volume2 size={15} />
              <span>{language === 'bn' ? 'রিং টেস্ট' : 'Test Ring'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Print Shop Partner Info Pill */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 flex items-center justify-between text-xs text-slate-700 shadow-2xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center font-bold">
            <Store size={16} />
          </div>
          <div>
            <div className="font-extrabold text-slate-900 flex items-center gap-1.5 flex-wrap">
              <span>{printsVendor.name}</span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded">
                ★ {printsVendor.rating || 4.8}
              </span>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                📍 Same Location Match: {selectedAddress.area}
              </span>
            </div>
            <div className="text-[11px] text-slate-500">{printsVendor.address}</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={playTestRing}
            className="text-[11px] font-bold text-teal-700 hover:text-teal-900 bg-teal-50 hover:bg-teal-100 px-2.5 py-1.5 rounded-lg transition flex items-center gap-1 cursor-pointer"
          >
            <Bell size={13} />
            <span>{language === 'bn' ? 'ভেন্ডর রিং টেস্ট' : 'Test Vendor Ring'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Print Configuration Form */}
        <form onSubmit={handleSubmit} className="lg:col-span-7 bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-5">
          <h2 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <Printer size={18} className="text-teal-600" />
            <span>{language === 'bn' ? 'ডকুমেন্ট আপলোড ও সেটিংস' : 'Document Upload & Specs'}</span>
          </h2>

          {/* File Upload Box */}
          <div className="border-2 border-dashed border-slate-300 hover:border-teal-500 rounded-2xl p-5 text-center transition bg-slate-50">
            <input 
              type="file" 
              id="file-upload" 
              className="hidden" 
              accept=".pdf,.doc,.docx,.jpg,.png"
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  setFileName(e.target.files[0].name);
                  setFileSize(`${(e.target.files[0].size / (1024 * 1024)).toFixed(1)} MB`);
                }
              }}
            />
            <label htmlFor="file-upload" className="cursor-pointer block">
              <Upload size={28} className="mx-auto text-teal-600 mb-2" />
              <div className="text-xs font-bold text-slate-800">
                {language === 'bn' ? 'পিডিএফ, ওয়ার্ড ফাইল বা ছবি আপলোড করুন' : 'Click to upload PDF, Word Doc, or Images'}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Up to 50MB supported • Confidential & Auto-Deleted After Print
              </div>
            </label>
            {fileName && (
              <div className="mt-3 inline-flex items-center gap-2 bg-teal-100/70 text-teal-900 px-3 py-1 rounded-xl text-xs font-bold">
                <FileText size={14} />
                <span>{fileName} ({fileSize})</span>
              </div>
            )}
          </div>

          {/* Configuration Options */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            {/* Pages & Copies */}
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                {language === 'bn' ? 'মোট পেজ সংখ্যা' : 'Number of Pages'}
              </label>
              <input
                type="number"
                min="1"
                max="500"
                value={pages}
                onChange={(e) => setPages(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-800"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                {language === 'bn' ? 'কপির সংখ্যা' : 'Number of Copies'}
              </label>
              <input
                type="number"
                min="1"
                max="50"
                value={copies}
                onChange={(e) => setCopies(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-800"
              />
            </div>
          </div>

          {/* Color Mode */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">
              {language === 'bn' ? 'প্রিন্ট কালার মোড' : 'Print Color Mode'}
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'B&W', label: language === 'bn' ? 'সাদা-কালো (B&W)' : 'Black & White', price: '₹2 / page' },
                { id: 'Color', label: language === 'bn' ? 'রঙিন লেজার HD' : 'Full Color (Laser HD)', price: '₹8 / page' }
              ].map(opt => (
                <button
                  type="button"
                  key={opt.id}
                  onClick={() => setColorMode(opt.id as any)}
                  className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${colorMode === opt.id ? 'bg-teal-50 border-teal-600 text-teal-950 font-bold' : 'bg-white border-slate-200 text-slate-700'}`}
                >
                  <div className="text-xs">{opt.label}</div>
                  <div className="text-[10px] text-slate-500">{opt.price}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Sidedness */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">
              {language === 'bn' ? 'প্রিন্টিং সাইড' : 'Printing Sides'}
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'Double', label: language === 'bn' ? 'দুই পাশে (ডুপ্লেক্স)' : 'Back to Back (Duplex)', desc: 'Eco-friendly & saves paper' },
                { id: 'Single', label: language === 'bn' ? 'এক পাশে (সিঙ্গেল)' : 'Single Sided', desc: 'One side per sheet' }
              ].map(opt => (
                <button
                  type="button"
                  key={opt.id}
                  onClick={() => setSidedness(opt.id as any)}
                  className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${sidedness === opt.id ? 'bg-teal-50 border-teal-600 text-teal-950 font-bold' : 'bg-white border-slate-200 text-slate-700'}`}
                >
                  <div className="text-xs">{opt.label}</div>
                  <div className="text-[10px] text-slate-500">{opt.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Paper Type & Binding */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                {language === 'bn' ? 'কাগজের কোয়ালিটি' : 'Paper Material'}
              </label>
              <select
                value={paperType}
                onChange={(e) => setPaperType(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-800"
              >
                <option value="Standard 75 GSM">Standard 75 GSM (+₹0)</option>
                <option value="Bond 100 GSM">Executive 100 GSM (+₹2)</option>
                <option value="Glossy 180 GSM">Glossy Photo (+₹10)</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                {language === 'bn' ? 'বাইন্ডিং ফিনিশ' : 'Binding Finish'}
              </label>
              <select
                value={binding}
                onChange={(e) => setBinding(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-800"
              >
                <option value="None">None / Stapled (FREE)</option>
                <option value="Spiral">Spiral Binding (+₹35)</option>
                <option value="Hardcover">Hardcover Dossier (+₹120)</option>
              </select>
            </div>
          </div>

          {/* Delivery vs Store Pickup */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">
              {language === 'bn' ? 'ডেলিভারি মোড' : 'Fulfillment Mode'}
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setDeliveryType('Delivery')}
                className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${deliveryType === 'Delivery' ? 'bg-teal-50 border-teal-600 text-teal-950 font-bold' : 'bg-white border-slate-200 text-slate-700'}`}
              >
                <div className="text-xs font-bold">15-Min Doorstep Delivery</div>
                <div className="text-[10px] text-slate-500">Delivered sealed to {selectedAddress.area} (₹25)</div>
              </button>

              <button
                type="button"
                onClick={() => setDeliveryType('Pickup')}
                className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${deliveryType === 'Pickup' ? 'bg-teal-50 border-teal-600 text-teal-950 font-bold' : 'bg-white border-slate-200 text-slate-700'}`}
              >
                <div className="text-xs font-bold">Self Store Pickup</div>
                <div className="text-[10px] text-slate-500">Ready in 5 mins at {printsVendor.name} (₹0)</div>
              </button>
            </div>
          </div>

          {/* Submit Action with Vendor Ring Trigger */}
          <div className="space-y-2">
            <button
              id="submit-print-order-btn"
              type="submit"
              className="w-full py-3.5 bg-teal-600 hover:bg-teal-700 active:scale-98 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-teal-700/25 flex items-center justify-center gap-2 cursor-pointer transition"
            >
              <Bell size={18} className="animate-bounce" />
              <span>
                {language === 'bn' 
                  ? `অর্ডার প্রিন্ট ও ভেন্ডর রিং দিন • ₹${grandTotal}` 
                  : `Order Prints & Ring Vendor • ₹${grandTotal}`}
              </span>
              <ArrowRight size={18} />
            </button>
            <p className="text-[11px] text-center text-slate-500 flex items-center justify-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span>
                {language === 'bn' 
                  ? `ক্লিক করলেই ${printsVendor.name} এর দোকানে সাথে সাথে অ্যালার্ম রিং বেজে উঠবে` 
                  : `Instantly rings ${printsVendor.name} print terminal upon placing order`}
              </span>
            </p>
          </div>
        </form>

        {/* Right: Live Print Status & Queue */}
        <div className="lg:col-span-5 space-y-4">
          {activePrint ? (
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <span className="text-[10px] font-bold uppercase text-teal-700 bg-teal-100 px-2 py-0.5 rounded">
                    Print Order #{activePrint.id}
                  </span>
                  <div className="text-sm font-black text-slate-900 mt-1">
                    Status: {activePrint.status}
                  </div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold">
                  <Printer size={20} />
                </div>
              </div>

              {/* Vendor & Delivery status notice */}
              <div className="bg-teal-50/70 p-3.5 rounded-xl border border-teal-200 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-bold text-teal-950 flex items-center gap-1.5">
                      <span>{printsVendor.name}</span>
                      {activePrint.deliveryType === 'Pickup' ? (
                        <span className="text-[10px] font-black uppercase text-amber-900 bg-amber-100 border border-amber-300 px-1.5 py-0.5 rounded">
                          Self Store Pickup
                        </span>
                      ) : (
                        <span className="text-[10px] font-black uppercase text-sky-900 bg-sky-100 border border-sky-300 px-1.5 py-0.5 rounded">
                          Doorstep Delivery
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-teal-700 mt-0.5">
                      {activePrint.status === 'SUBMITTED' 
                        ? 'Store terminal ringing for order acceptance' 
                        : activePrint.status === 'PRINTING' 
                        ? 'High-speed laser printing in progress at store' 
                        : activePrint.status === 'READY_FOR_PICKUP'
                        ? activePrint.deliveryType === 'Pickup'
                          ? '✅ Print Ready! Please visit the store counter to collect your prints.'
                          : '🔔 Print Ready! Delivery partner ring activated for pickup'
                        : activePrint.status === 'DELIVERY_ASSIGNED'
                        ? `🛵 Rider assigned (${activePrint.deliveryPartnerName || 'Ramesh Kumar'}) heading to print store`
                        : activePrint.status === 'PICKED_UP'
                        ? `📦 Picked up from print shop by ${activePrint.deliveryPartnerName || 'Rider'}`
                        : activePrint.status === 'OUT_FOR_DELIVERY'
                        ? `🚀 On the way to your address with your print docs!`
                        : activePrint.deliveryType === 'Pickup'
                        ? '🎉 Handed over by store vendor! Completed successfully.'
                        : 'Printed & delivered successfully to your door!'}
                    </div>
                  </div>
                  {activePrint.status === 'SUBMITTED' && (
                    <span className="flex items-center gap-1 text-[11px] font-black text-emerald-700 bg-white px-2 py-1 rounded-lg shadow-2xs">
                      <Bell size={12} className="animate-bounce" />
                      <span>Vendor Ring</span>
                    </span>
                  )}
                  {activePrint.status === 'READY_FOR_PICKUP' && activePrint.deliveryType === 'Delivery' && (
                    <span className="flex items-center gap-1 text-[11px] font-black text-amber-800 bg-amber-100 px-2 py-1 rounded-lg shadow-2xs animate-pulse">
                      <Bell size={12} className="animate-bounce" />
                      <span>Rider Ring</span>
                    </span>
                  )}
                  {activePrint.status === 'READY_FOR_PICKUP' && activePrint.deliveryType === 'Pickup' && (
                    <span className="flex items-center gap-1 text-[11px] font-black text-emerald-800 bg-emerald-100 px-2 py-1 rounded-lg shadow-2xs">
                      <Store size={12} className="text-emerald-700" />
                      <span>Ready for Pickup</span>
                    </span>
                  )}
                </div>

                {/* Counter Pickup details & OTP for Self Pickup */}
                {activePrint.deliveryType === 'Pickup' && activePrint.status !== 'DELIVERED' && (
                  <div className="pt-2 border-t border-teal-200/60 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">Store Counter Location</span>
                      <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                        <Store size={12} className="text-teal-700" />
                        {activePrint.storeAddress || printsVendor.address}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">Show OTP to Vendor</span>
                      <span className="text-sm font-black text-teal-800 tracking-wider bg-white px-2 py-0.5 rounded border border-teal-300 font-mono">
                        {activePrint.deliveryOtp || '4829'}
                      </span>
                    </div>
                  </div>
                )}

                {/* Delivery partner info & OTP for Doorstep Delivery */}
                {activePrint.deliveryType === 'Delivery' && activePrint.status !== 'SUBMITTED' && activePrint.status !== 'PRINTING' && (
                  <div className="pt-2 border-t border-teal-200/60 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">Delivery Rider</span>
                      <span className="text-xs font-bold text-slate-800">
                        {activePrint.deliveryPartnerName || 'Searching nearby rider...'}
                      </span>
                    </div>

                    {activePrint.status !== 'DELIVERED' && (
                      <div className="text-right">
                        <span className="text-[10px] uppercase font-bold text-slate-500 block">Share OTP with Rider</span>
                        <span className="text-sm font-black text-teal-800 tracking-wider bg-white px-2 py-0.5 rounded border border-teal-300 font-mono">
                          {activePrint.deliveryOtp || '4829'}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-xs space-y-1.5">
                <div className="font-bold text-slate-800">{activePrint.fileName}</div>
                <div className="text-slate-600">
                  {activePrint.pages} Pages • {activePrint.copies} {activePrint.copies > 1 ? 'Copies' : 'Copy'} • {activePrint.colorMode}
                </div>
                <div className="text-slate-600">
                  Paper: {activePrint.paperType} • Binding: {activePrint.binding}
                </div>
                <div className="text-slate-900 font-extrabold pt-1">
                  Total Paid: ₹{activePrint.totalAmount} ({activePrint.deliveryType})
                </div>
              </div>

              {/* Progress Simulator */}
              <button
                id="advance-print-order-status-btn"
                onClick={handleSimulateStatus}
                disabled={activePrint.status === 'DELIVERED'}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer transition"
              >
                <span>Advance Print Workflow ({activePrint.status})</span>
                <ChevronRight size={14} />
              </button>

              {activePrint.status === 'DELIVERED' && (
                <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold rounded-xl text-center">
                  Order handed over successfully!
                </div>
              )}
            </div>
          ) : (
            <div className="bg-slate-50 border border-dashed border-slate-300 p-6 rounded-3xl text-center space-y-2">
              <Printer size={32} className="mx-auto text-slate-400" />
              <div className="text-xs font-bold text-slate-700">No active print orders</div>
              <p className="text-[11px] text-slate-500">
                Upload your document on the left, pick your paper and binding preferences, and hit order!
              </p>
            </div>
          )}

          {/* Privacy pledge */}
          <div className="p-4 bg-teal-50 border border-teal-200 rounded-2xl flex items-start gap-3">
            <ShieldCheck size={20} className="text-teal-700 shrink-0 mt-0.5" />
            <div className="text-xs text-teal-900">
              <span className="font-bold">Zero-Log Confidentiality: </span>
              All print files are encrypted in transit and permanently deleted from local print spoolers once printing finishes.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
