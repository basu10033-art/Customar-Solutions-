import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CabBooking } from '../../types';
import { Car, Navigation, Phone, CheckCircle, ShieldCheck, DollarSign, Bell, KeyRound } from 'lucide-react';

export const CabDriverDashboard: React.FC = () => {
  const { cabBookings, updateCabStatus, soundEnabled, playTestRing } = useApp();
  const [driverOnline, setDriverOnline] = useState(true);
  const [enteredOtp, setEnteredOtp] = useState('');
  const [otpError, setOtpError] = useState('');

  const incomingRides = cabBookings.filter(b => b.status === 'SEARCHING' && driverOnline);
  const activeRide = cabBookings.find(b => b.status !== 'COMPLETED' && b.status !== 'SEARCHING');
  const completedRides = cabBookings.filter(b => b.status === 'COMPLETED');

  const todayEarnings = completedRides.reduce((sum, r) => sum + r.fare, 0);

  const handleStartRide = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeRide) return;
    if (enteredOtp.trim() !== activeRide.otp) {
      setOtpError('Invalid OTP! Ask passenger for their 4-digit cab start code.');
      return;
    }
    setOtpError('');
    updateCabStatus(activeRide.id, 'IN_TRIP');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-4 sm:py-6 space-y-6">
      {/* Header Profile */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-14 h-14 rounded-2xl bg-orange-100 text-orange-800 flex items-center justify-center font-black text-xl">
            S
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-black text-slate-900">Suresh Rao (Cab Captain)</h1>
              <span className="text-[10px] font-bold bg-orange-100 text-orange-900 px-2 py-0.5 rounded-full uppercase">
                Mini AC
              </span>
            </div>
            <p className="text-xs text-slate-500">
              KA-04-E-8812 • White Hyundai Grand i10 • ⭐ 4.9 Rating
            </p>
          </div>
        </div>

        <button
          onClick={() => setDriverOnline(!driverOnline)}
          className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-2 cursor-pointer ${driverOnline ? 'bg-orange-600 text-white shadow-md' : 'bg-slate-200 text-slate-700'}`}
        >
          <span className={`w-2.5 h-2.5 rounded-full ${driverOnline ? 'bg-white animate-ping' : 'bg-slate-400'}`}></span>
          <span>{driverOnline ? 'CAPTAIN ONLINE' : 'GO OFFLINE'}</span>
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 text-center">
          <span className="text-[10px] uppercase font-bold text-slate-400">Today's Net Fare</span>
          <div className="text-xl font-black text-slate-900 mt-0.5">₹{todayEarnings}</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 text-center">
          <span className="text-[10px] uppercase font-bold text-slate-400">Trips Done</span>
          <div className="text-xl font-black text-orange-600 mt-0.5">{completedRides.length}</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 text-center">
          <span className="text-[10px] uppercase font-bold text-slate-400">Commission</span>
          <div className="text-xl font-black text-slate-900 mt-0.5">12% Zero Surge</div>
        </div>
      </div>

      {/* INCOMING RIDE REQUEST */}
      {incomingRides.length > 0 && !activeRide && (
        <div className="bg-linear-to-r from-orange-600 to-amber-600 text-white p-5 rounded-3xl shadow-xl border-2 border-orange-300 animate-pulse space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-white text-orange-900 flex items-center justify-center font-black">
                <Bell size={20} className="animate-bounce" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase text-orange-200">Incoming Cab Ride</span>
                <h3 className="text-base font-black">Ride #{incomingRides[0].id} ({incomingRides[0].vehicleType})</h3>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-orange-100 uppercase font-bold block">Fare Estimate</span>
              <span className="text-lg font-black text-yellow-300">₹{incomingRides[0].fare}</span>
            </div>
          </div>

          <div className="bg-black/20 backdrop-blur-xs p-3.5 rounded-2xl text-xs space-y-1">
            <p><strong>Passenger:</strong> {incomingRides[0].customerName}</p>
            <p><strong>Pickup:</strong> {incomingRides[0].pickupLocation}</p>
            <p><strong>Drop:</strong> {incomingRides[0].dropLocation}</p>
          </div>

          <button
            onClick={() => updateCabStatus(incomingRides[0].id, 'ASSIGNED')}
            className="w-full py-3 bg-white hover:bg-orange-50 text-orange-950 font-extrabold text-xs rounded-xl shadow-md cursor-pointer flex items-center justify-center gap-1.5"
          >
            <CheckCircle size={16} className="text-orange-600" />
            <span>ACCEPT RIDE REQUEST</span>
          </button>
        </div>
      )}

      {/* ACTIVE TRIP */}
      {activeRide ? (
        <div className="bg-white p-5 rounded-3xl border-2 border-orange-500 shadow-md space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <span className="text-[10px] font-black uppercase text-orange-800 bg-orange-100 px-2 py-0.5 rounded">
                Active Trip #{activeRide.id}
              </span>
              <h2 className="text-base font-black text-slate-900 mt-1">
                Status: {activeRide.status}
              </h2>
            </div>
            <div className="text-right font-black text-slate-900">
              Trip Fare: ₹{activeRide.fare}
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1">
            <p><strong>Passenger:</strong> {activeRide.customerName} ({activeRide.customerPhone})</p>
            <p><strong>Pickup:</strong> {activeRide.pickupLocation}</p>
            <p><strong>Drop:</strong> {activeRide.dropLocation}</p>
          </div>

          {activeRide.status === 'ASSIGNED' && (
            <button
              onClick={() => updateCabStatus(activeRide.id, 'ARRIVED')}
              className="w-full py-2.5 bg-orange-600 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer"
            >
              1. Arrived at Pickup Location
            </button>
          )}

          {activeRide.status === 'ARRIVED' && (
            <form onSubmit={handleStartRide} className="p-4 bg-amber-50 rounded-2xl border border-amber-300 space-y-2 text-xs">
              <span className="font-bold text-amber-950 block">Enter Passenger's 4-Digit Ride Start OTP:</span>
              <div className="flex gap-2">
                <input
                  type="text"
                  maxLength={4}
                  placeholder="Enter 4-digit OTP"
                  value={enteredOtp}
                  onChange={(e) => setEnteredOtp(e.target.value)}
                  className="flex-1 px-3 py-2 text-center text-sm font-black bg-white border border-amber-400 rounded-xl"
                />
                <button
                  type="submit"
                  className="px-5 py-2 bg-orange-600 text-white font-bold rounded-xl shadow-xs"
                >
                  Start Trip
                </button>
              </div>
              {otpError && <p className="text-red-600 font-bold">{otpError}</p>}
            </form>
          )}

          {activeRide.status === 'IN_TRIP' && (
            <button
              onClick={() => updateCabStatus(activeRide.id, 'COMPLETED')}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow-md cursor-pointer"
            >
              Reached Destination • Complete Trip & Collect ₹{activeRide.fare}
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center text-slate-400 space-y-2">
          <Car size={36} className="mx-auto text-slate-300" />
          <div className="text-sm font-bold text-slate-700">No active ride trip</div>
          <p className="text-xs text-slate-500">
            Keep captain status online. When passengers book rides in your zone, alert chimes will pop up!
          </p>
        </div>
      )}
    </div>
  );
};
