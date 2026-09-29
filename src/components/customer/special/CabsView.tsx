import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { CabBooking } from '../../../types';
import { 
  Car, Bike, Navigation, MapPin, Clock, ShieldCheck, 
  ChevronRight, Phone, CheckCircle, ArrowRight 
} from 'lucide-react';

export const CabsView: React.FC = () => {
  const { bookCab, cabBookings, updateCabStatus, selectedAddress, language, t } = useApp();

  const [pickupLocation, setPickupLocation] = useState(`${selectedAddress.street}, ${selectedAddress.area}`);
  const [dropLocation, setDropLocation] = useState('Kempegowda Int. Airport (BLR) / MG Road');
  const [selectedVehicle, setSelectedVehicle] = useState<'Bike' | 'Auto' | 'Mini' | 'Sedan' | 'XL'>('Mini');
  const [activeBooking, setActiveBooking] = useState<CabBooking | null>(null);

  const vehicleOptions = [
    { type: 'Bike', name: 'Customar Moto', desc: 'Fastest for single rider in traffic', time: '2 mins away', fare: 59, icon: Bike },
    { type: 'Auto', name: 'Customar Auto', desc: 'Meter-based verified city autos', time: '3 mins away', fare: 89, icon: Navigation },
    { type: 'Mini', name: 'Customar Mini', desc: 'Affordable compact AC hatchbacks', time: '4 mins away', fare: 169, icon: Car },
    { type: 'Sedan', name: 'Customar Prime Sedan', desc: 'Spacious top-rated drivers & sedans', time: '5 mins away', fare: 249, icon: Car },
    { type: 'XL', name: 'Customar XL / SUV', desc: '6-seater for family & large luggage', time: '7 mins away', fare: 349, icon: Car }
  ];

  const handleRequestRide = () => {
    const matched = vehicleOptions.find(v => v.type === selectedVehicle);
    const booking = bookCab({
      customerId: 'user_cust_1',
      customerName: 'Subhajit Jana',
      customerPhone: '+91 98765 00112',
      pickupLocation,
      dropLocation,
      vehicleType: selectedVehicle,
      fare: matched ? matched.fare : 169,
      distanceKm: 6.8
    });
    setActiveBooking(booking);
  };

  const handleSimulateTrip = () => {
    if (!activeBooking) return;
    const stages: CabBooking['status'][] = ['SEARCHING', 'ASSIGNED', 'ARRIVED', 'IN_TRIP', 'COMPLETED'];
    const currIdx = stages.indexOf(activeBooking.status);
    if (currIdx < stages.length - 1) {
      const nextStatus = stages[currIdx + 1];
      updateCabStatus(activeBooking.id, nextStatus);
      setActiveBooking(prev => prev ? { ...prev, status: nextStatus } : null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Banner */}
      <div className="bg-linear-to-r from-orange-600 via-amber-600 to-yellow-600 text-white p-6 rounded-3xl shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-lg">
          <span className="text-[10px] font-black uppercase tracking-widest bg-black/30 px-2.5 py-1 rounded-full text-yellow-300">
            {language === 'bn' ? 'কাস্টমার ক্যাব ও শহর পরিবহন' : 'Customar Cabs & City Transit'}
          </span>
          <h1 className="text-2xl sm:text-3xl font-black mt-2 tracking-tight">
            {language === 'bn' ? '৩ মিনিটে রাইড বুকিং। কোনো অতিরিক্ত ভাড়া নেই।' : 'City Rides in 3 Minutes. Zero Surge Tricks.'}
          </h1>
          <p className="text-xs text-orange-100 mt-1 leading-relaxed">
            {language === 'bn' 
              ? 'বিশ্বস্ত বাইক ট্যাক্সি, অটো ও এসি ক্যাব বুকিং সম্পূর্ণ ভেরিফাইড চালকদের সাথে।' 
              : 'Reliable bike taxis, autos, and AC cabs with upfront fares and background-verified drivers.'}
          </p>
        </div>
        <div className="absolute right-4 bottom-2 opacity-20 text-8xl">🚖</div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Ride Selector Form */}
        <div className="lg:col-span-7 bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-5">
          <h2 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <MapPin className="text-orange-600" size={18} />
            <span>Select Route & Cab Class</span>
          </h2>

          {/* Location inputs */}
          <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div className="flex items-center gap-2.5">
              <div className="w-3 h-3 rounded-full bg-emerald-500 shrink-0"></div>
              <div className="flex-1">
                <label className="text-[10px] font-bold text-slate-400 block uppercase">Pickup Point</label>
                <input
                  type="text"
                  value={pickupLocation}
                  onChange={(e) => setPickupLocation(e.target.value)}
                  className="w-full text-xs font-semibold bg-transparent outline-none text-slate-800"
                />
              </div>
            </div>

            <div className="border-t border-slate-200 pl-4 ml-1.5 h-3 border-dashed"></div>

            <div className="flex items-center gap-2.5">
              <div className="w-3 h-3 rounded-full bg-red-500 shrink-0"></div>
              <div className="flex-1">
                <label className="text-[10px] font-bold text-slate-400 block uppercase">Drop Destination</label>
                <input
                  type="text"
                  value={dropLocation}
                  onChange={(e) => setDropLocation(e.target.value)}
                  className="w-full text-xs font-semibold bg-transparent outline-none text-slate-800"
                />
              </div>
            </div>
          </div>

          {/* Vehicle category list */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Available Rides</span>
            <div className="space-y-2">
              {vehicleOptions.map((v) => {
                const Icon = v.icon;
                const isSelected = selectedVehicle === v.type;
                return (
                  <div
                    key={v.type}
                    id={`select-cab-${v.type}`}
                    onClick={() => setSelectedVehicle(v.type as any)}
                    className={`p-3 rounded-2xl border transition cursor-pointer flex items-center justify-between gap-3 ${isSelected ? 'border-orange-500 bg-orange-50/70 shadow-2xs' : 'border-slate-200 hover:border-slate-300 bg-white'}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-xl ${isSelected ? 'bg-orange-600 text-white' : 'bg-slate-100 text-slate-700'}`}>
                        <Icon size={20} />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900">{v.name}</div>
                        <div className="text-[11px] text-slate-500">{v.desc}</div>
                        <div className="text-[10px] text-emerald-700 font-semibold mt-0.5">{v.time}</div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-sm font-black text-slate-900">₹{v.fare}</div>
                      <span className="text-[10px] text-slate-400">Fixed Fare</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Book button */}
          <button
            id="book-cab-now-btn"
            onClick={handleRequestRide}
            className="w-full py-3.5 bg-orange-600 hover:bg-orange-700 active:scale-98 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-orange-600/25 flex items-center justify-center gap-2 cursor-pointer transition"
          >
            <span>Confirm & Request {selectedVehicle}</span>
            <ArrowRight size={18} />
          </button>
        </div>

        {/* Right: Active Cab Tracking & Simulated Ride */}
        <div className="lg:col-span-5 space-y-4">
          {activeBooking ? (
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <span className="text-[10px] font-bold uppercase text-orange-600 bg-orange-100 px-2 py-0.5 rounded">
                    Active Ride {activeBooking.id}
                  </span>
                  <div className="text-sm font-black text-slate-900 mt-1">
                    Status: {activeBooking.status}
                  </div>
                </div>
                <div className="bg-slate-900 text-white px-3 py-1 rounded-xl text-center">
                  <div className="text-[9px] uppercase text-amber-300 font-bold">Start OTP</div>
                  <div className="text-base font-black tracking-widest">{activeBooking.otp}</div>
                </div>
              </div>

              {/* Driver Details */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-orange-100 text-orange-800 flex items-center justify-center font-black text-lg">
                    {activeBooking.driverName?.charAt(0)}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">{activeBooking.driverName}</div>
                    <div className="text-[11px] text-slate-500">
                      {activeBooking.vehicleType} • {activeBooking.vehicleNumber}
                    </div>
                    <div className="text-[10px] text-amber-600 font-bold">
                      ⭐ {activeBooking.driverRating} Captain
                    </div>
                  </div>
                </div>
                <a
                  href={`tel:${activeBooking.driverPhone}`}
                  className="p-2 bg-emerald-600 text-white rounded-xl shadow-xs"
                >
                  <Phone size={16} />
                </a>
              </div>

              {/* Ride Route Recap */}
              <div className="text-xs space-y-1 bg-slate-50 p-3 rounded-xl">
                <div className="text-slate-600 truncate"><strong>Pickup:</strong> {activeBooking.pickupLocation}</div>
                <div className="text-slate-600 truncate"><strong>Drop:</strong> {activeBooking.dropLocation}</div>
                <div className="font-extrabold text-slate-900 pt-1">Fare: ₹{activeBooking.fare} (Cash / UPI on arrival)</div>
              </div>

              {/* Step Simulation */}
              <button
                id="advance-cab-ride-btn"
                onClick={handleSimulateTrip}
                disabled={activeBooking.status === 'COMPLETED'}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Simulate Next Stage ({activeBooking.status})</span>
                <ChevronRight size={14} />
              </button>

              {activeBooking.status === 'COMPLETED' && (
                <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold rounded-xl text-center">
                  Ride completed safely! Digital receipt sent to SMS.
                </div>
              )}
            </div>
          ) : (
            <div className="bg-slate-50 border border-dashed border-slate-300 p-6 rounded-3xl text-center space-y-2">
              <Car size={32} className="mx-auto text-slate-400" />
              <div className="text-xs font-bold text-slate-700">No active cab ride</div>
              <p className="text-[11px] text-slate-500">
                Choose your pickup point, drop destination, and ride type on the left to get instant driver match.
              </p>
            </div>
          )}

          {/* Safety guarantee */}
          <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl flex items-start gap-3">
            <ShieldCheck size={20} className="text-amber-700 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-900">
              <span className="font-bold">Customar SafeRide Promise: </span>
              SOS emergency assistance, real-time trip GPS telemetry, verified driver IDs, and zero hidden night cancellation charges.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
