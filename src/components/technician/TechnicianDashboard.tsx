import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ServiceBooking } from '../../types';
import { 
  Wrench, Zap, CheckCircle, Phone, MapPin, 
  Clock, ShieldCheck, DollarSign, Bell, Star 
} from 'lucide-react';

export const TechnicianDashboard: React.FC = () => {
  const { 
    serviceBookings, updateServiceBookingStatus, 
    technicians, activeTechnicianId, soundEnabled, playTestRing 
  } = useApp();

  const [isOnline, setIsOnline] = useState(true);

  const currentTech = technicians.find(t => t.id === activeTechnicianId) || technicians[0];

  const pendingBookings = serviceBookings.filter(b => 
    b.status === 'REQUESTED' && 
    (b.technicianCategory === currentTech.category || b.technicianId === currentTech.id)
  );

  const activeJob = serviceBookings.find(b => 
    (b.technicianId === currentTech.id || b.technicianCategory === currentTech.category) &&
    b.status !== 'COMPLETED' && 
    b.status !== 'CANCELLED' &&
    b.status !== 'REQUESTED'
  );

  const completedJobs = serviceBookings.filter(b => 
    (b.technicianId === currentTech.id || b.technicianCategory === currentTech.category) &&
    b.status === 'COMPLETED'
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-4 sm:py-6 space-y-6">
      {/* Header Profile */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-14 h-14 rounded-2xl bg-indigo-100 text-indigo-900 flex items-center justify-center font-black text-xl">
            {currentTech.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-black text-slate-900">{currentTech.name}</h1>
              <span className="text-[10px] font-bold bg-indigo-100 text-indigo-900 px-2 py-0.5 rounded-full uppercase">
                {currentTech.category} Pro
              </span>
            </div>
            <p className="text-xs text-slate-500">
              {currentTech.experienceYears} Years Experience • ⭐ {currentTech.rating} Rating ({(currentTech.jobsCompleted || currentTech.completedJobs || 0)} jobs)
            </p>
          </div>
        </div>

        {/* Online switch */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsOnline(!isOnline)}
            className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-2 cursor-pointer ${isOnline ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-200 text-slate-700'}`}
          >
            <span className={`w-2.5 h-2.5 rounded-full ${isOnline ? 'bg-white animate-ping' : 'bg-slate-400'}`}></span>
            <span>{isOnline ? 'DUTY ONLINE' : 'ON LEAVE'}</span>
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 text-center">
          <span className="text-[10px] uppercase font-bold text-slate-400">Visiting Fee</span>
          <div className="text-xl font-black text-slate-900 mt-0.5">₹{currentTech.visitingCharge || currentTech.visitingCharges || 199}</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 text-center">
          <span className="text-[10px] uppercase font-bold text-slate-400">Completed Jobs</span>
          <div className="text-xl font-black text-indigo-700 mt-0.5">{(currentTech.jobsCompleted || currentTech.completedJobs || 0) + completedJobs.length}</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 text-center">
          <span className="text-[10px] uppercase font-bold text-slate-400">Service Guarantee</span>
          <div className="text-xl font-black text-emerald-600 mt-0.5">30 Days</div>
        </div>
      </div>

      {/* INCOMING SERVICE RING */}
      {pendingBookings.length > 0 && !activeJob && (
        <div className="bg-linear-to-r from-indigo-700 to-blue-700 text-white p-5 rounded-3xl shadow-xl border-2 border-indigo-300 animate-pulse space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-white text-indigo-900 flex items-center justify-center font-black">
                <Bell size={20} className="animate-bounce" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase text-indigo-200">New Booking Alert</span>
                <h3 className="text-base font-black">Job #{pendingBookings[0].id}: {pendingBookings[0].issueDescription}</h3>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-indigo-200 uppercase font-bold block">Visiting Fee</span>
              <span className="text-lg font-black text-yellow-300">₹{pendingBookings[0].visitingCharges}</span>
            </div>
          </div>

          <div className="bg-black/20 backdrop-blur-xs p-3.5 rounded-2xl text-xs space-y-1">
            <p><strong>Customer:</strong> {pendingBookings[0].customerName} ({pendingBookings[0].customerPhone})</p>
            <p><strong>Address:</strong> {pendingBookings[0].address.street}, {pendingBookings[0].address.area}</p>
            <p><strong>Timing:</strong> {pendingBookings[0].isImmediate ? 'Immediate Doorstep (Within 45 mins)' : pendingBookings[0].scheduledTime}</p>
          </div>

          <button
            onClick={() => updateServiceBookingStatus(pendingBookings[0].id, 'ACCEPTED')}
            className="w-full py-3 bg-white hover:bg-indigo-50 text-indigo-950 font-extrabold text-xs rounded-xl shadow-md cursor-pointer flex items-center justify-center gap-1.5"
          >
            <CheckCircle size={16} className="text-indigo-600" />
            <span>ACCEPT SERVICE BOOKING</span>
          </button>
        </div>
      )}

      {/* ACTIVE JOB PROGRESS */}
      {activeJob ? (
        <div className="bg-white p-5 rounded-3xl border-2 border-indigo-500 shadow-md space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <span className="text-[10px] font-black uppercase text-indigo-800 bg-indigo-100 px-2 py-0.5 rounded">
                Active Job #{activeJob.id}
              </span>
              <h2 className="text-base font-black text-slate-900 mt-1">
                Status: {activeJob.status.replace(/_/g, ' ')}
              </h2>
            </div>
            <div className="text-right font-black text-indigo-700">
              Visiting Fee: ₹{activeJob.visitingCharges}
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1.5">
            <div className="font-bold text-slate-900">Job: {activeJob.issueDescription}</div>
            <div className="text-slate-600">Client: {activeJob.customerName} • {activeJob.address.street}, {activeJob.address.area}</div>
          </div>

          {/* Stepper buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
            <button
              onClick={() => updateServiceBookingStatus(activeJob.id, 'ON_THE_WAY')}
              className={`py-2 px-3 rounded-xl text-xs font-bold border transition cursor-pointer ${activeJob.status === 'ON_THE_WAY' ? 'bg-indigo-600 text-white' : 'bg-slate-50 text-slate-700'}`}
            >
              1. On the Way
            </button>
            <button
              onClick={() => updateServiceBookingStatus(activeJob.id, 'ARRIVED')}
              className={`py-2 px-3 rounded-xl text-xs font-bold border transition cursor-pointer ${activeJob.status === 'ARRIVED' ? 'bg-indigo-600 text-white' : 'bg-slate-50 text-slate-700'}`}
            >
              2. Arrived at Home
            </button>
            <button
              onClick={() => updateServiceBookingStatus(activeJob.id, 'IN_PROGRESS')}
              className={`py-2 px-3 rounded-xl text-xs font-bold border transition cursor-pointer ${activeJob.status === 'IN_PROGRESS' ? 'bg-indigo-600 text-white' : 'bg-slate-50 text-slate-700'}`}
            >
              3. Repair in Progress
            </button>
            <button
              onClick={() => updateServiceBookingStatus(activeJob.id, 'COMPLETED')}
              className="py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow-md cursor-pointer"
            >
              4. Complete & Collect Fee
            </button>
          </div>

          <div className="flex justify-end">
            <a
              href={`tel:${activeJob.customerPhone}`}
              className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold"
            >
              <Phone size={14} />
              <span>Call Client ({activeJob.customerPhone})</span>
            </a>
          </div>
        </div>
      ) : (
        <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center text-slate-400 space-y-2">
          <Wrench size={36} className="mx-auto text-slate-300" />
          <div className="text-sm font-bold text-slate-700">No active repair job right now</div>
          <p className="text-xs text-slate-500">
            Keep your status online. When customers book {currentTech.category} services in your area, booking rings will alert you!
          </p>
        </div>
      )}
    </div>
  );
};
