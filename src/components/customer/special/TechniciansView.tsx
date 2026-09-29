import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { ServiceBooking, TechnicianCategory } from '../../../types';
import { 
  Wrench, Zap, Droplet, Hammer, Paintbrush, 
  Tv, Star, ShieldCheck, Clock, MapPin, Calendar, 
  Camera, CheckCircle, ArrowRight, ChevronRight, Phone 
} from 'lucide-react';

export const TechniciansView: React.FC = () => {
  const { technicians, bookTechnician, serviceBookings, updateServiceBookingStatus, selectedAddress, language, t } = useApp();

  const [selectedCategory, setSelectedCategory] = useState<TechnicianCategory>('Electrician');
  const [problemDescription, setProblemDescription] = useState('');
  const [selectedCommonIssue, setSelectedCommonIssue] = useState<string>('');
  const [scheduleType, setScheduleType] = useState<'immediate' | 'scheduled'>('immediate');
  const [scheduledTime, setScheduledTime] = useState('Tomorrow at 10:00 AM');
  const [photoUploaded, setPhotoUploaded] = useState<string | null>(null);
  const [activeBooking, setActiveBooking] = useState<ServiceBooking | null>(null);

  const categories: { type: TechnicianCategory; name: string; icon: any; visitingFee: number; desc: string }[] = [
    { type: 'Electrician', name: 'Electrician', icon: Zap, visitingFee: 199, desc: 'Wiring, MCB tripping, fan, lights & switches' },
    { type: 'Plumber', name: 'Plumber', icon: Droplet, visitingFee: 199, desc: 'Leakages, tap fitting, motor, washbasin & clogs' },
    { type: 'Rajmistri', name: 'Rajmistri (Mason)', icon: Hammer, visitingFee: 499, desc: 'Brickwork, tile fixing, plaster, cement cracks' },
    { type: 'Carpenter', name: 'Carpenter', icon: Wrench, visitingFee: 249, desc: 'Door lock, modular kitchen, hinge & furniture' },
    { type: 'Painter', name: 'Painter', icon: Paintbrush, visitingFee: 349, desc: 'Wall patch, damp proofing, touch-up & full paint' },
    { type: 'Appliance Repair', name: 'Appliance Repair', icon: Tv, visitingFee: 299, desc: 'AC service, refrigerator, washing machine & RO' }
  ];

  const commonIssues: { [key in TechnicianCategory]?: string[] } = {
    Electrician: ['MCB frequently tripping', 'Switch spark / burnt smell', 'Ceiling fan making noise', 'Inverter battery setup'],
    Plumber: ['Tap leaking continuously', 'Water motor not pumping', 'Bathroom drain blocked', 'Toilet flush tank issue'],
    Rajmistri: ['Bathroom tile cracked / loose', 'Wall plaster flaking & seep', 'Kitchen slab repair', 'Floor leveling work'],
    Carpenter: ['Main door lock jammed', 'Cupboard hinge broken', 'Bed frame creaking', 'Curtain rod installation'],
    Painter: ['Water seepage patches on ceiling', 'Exterior waterproofing', '1 Room quick repaint', 'Door wood polish'],
    'Appliance Repair': ['AC not cooling properly', 'Refrigerator making humming sound', 'RO filter water slow', 'Washing machine spin issue']
  };

  const currentCategoryMeta = categories.find(c => c.type === selectedCategory) || categories[0];
  const filteredTechnicians = technicians.filter(t => t.category === selectedCategory);
  const chosenTechnician = filteredTechnicians[0] || technicians[0] || { id: 'tech_1', name: 'Ramesh Mistri', phone: '+91 98200 44551' };

  const handleBook = (e: React.FormEvent) => {
    e.preventDefault();
    const finalDesc = selectedCommonIssue ? `${selectedCommonIssue}. ${problemDescription}` : (problemDescription || 'Inspection requested');
    const booking = bookTechnician({
      customerId: 'user_cust_1',
      customerName: 'Subhajit Jana',
      customerPhone: '+91 98765 00112',
      address: selectedAddress,
      technicianCategory: selectedCategory,
      technicianId: chosenTechnician.id,
      technicianName: chosenTechnician.name,
      technicianPhone: chosenTechnician.phone,
      issueDescription: finalDesc,
      visitingCharges: currentCategoryMeta.visitingFee,
      isImmediate: scheduleType === 'immediate',
      scheduledTime: scheduleType === 'scheduled' ? scheduledTime : undefined,
      photoUrl: photoUploaded || undefined
    });
    setActiveBooking(booking);
  };

  const handleSimulateStatus = () => {
    if (!activeBooking) return;
    const stages: ServiceBooking['status'][] = ['REQUESTED', 'ACCEPTED', 'ON_THE_WAY', 'ARRIVED', 'IN_PROGRESS', 'COMPLETED'];
    const currIdx = stages.indexOf(activeBooking.status);
    if (currIdx < stages.length - 1) {
      const next = stages[currIdx + 1];
      updateServiceBookingStatus(activeBooking.id, next);
      setActiveBooking(prev => prev ? { ...prev, status: next } : null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Banner */}
      <div className="bg-linear-to-r from-indigo-700 via-blue-700 to-teal-800 text-white p-6 rounded-3xl shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-lg">
          <span className="text-[10px] font-black uppercase tracking-widest bg-black/30 px-2.5 py-1 rounded-full text-indigo-200">
            {language === 'bn' ? 'কাস্টমার হোম সার্ভিস ও প্রফেশনাল টেকনিশিয়ান' : 'Customar Home Services & Pro Technicians'}
          </span>
          <h1 className="text-2xl sm:text-3xl font-black mt-2 tracking-tight">
            {language === 'bn' ? '৪৫ মিনিটে অভিজ্ঞ মিস্ত্রি আপনার দোরগোড়ায়' : 'Verified Pros at Your Doorstep in 45 Minutes.'}
          </h1>
          <p className="text-xs text-indigo-100 mt-1 leading-relaxed">
            {language === 'bn'
              ? 'রাজমিস্ত্রি, ইলেকট্রিশিয়ান, প্লাম্বার, পেইন্টার ও এসি এক্সপার্ট — নির্দিষ্ট ভিজিটিং ফি ও ৩০ দিনের সার্ভিস ওয়ারেন্টি।'
              : 'Rajmistri, Electricians, Plumbers, Carpenters & Appliance experts with transparent visiting rates and 30-day service warranty.'}
          </p>
        </div>
        <div className="absolute right-4 bottom-2 opacity-20 text-8xl">🛠️</div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Booking Form */}
        <form onSubmit={handleBook} className="lg:col-span-7 bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-5">
          <h2 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <Wrench size={18} className="text-indigo-600" />
            <span>Select Service & Explain Problem</span>
          </h2>

          {/* Category Selector Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {categories.map((c) => {
              const Icon = c.icon;
              const isSelected = selectedCategory === c.type;
              return (
                <button
                  type="button"
                  key={c.type}
                  id={`select-service-category-${c.type.replace(/\s+/g, '-')}`}
                  onClick={() => {
                    setSelectedCategory(c.type);
                    setSelectedCommonIssue('');
                  }}
                  className={`p-3 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between gap-1.5 ${isSelected ? 'bg-indigo-50 border-indigo-600 text-indigo-950 shadow-2xs' : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'}`}
                >
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700'}`}>
                    <Icon size={16} />
                  </div>
                  <div>
                    <div className="text-xs font-bold truncate">{c.name}</div>
                    <div className="text-[10px] text-slate-500 font-semibold">Visit: ₹{c.visitingFee}</div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Common Issues Pills */}
          {commonIssues[selectedCategory] && (
            <div>
              <span className="text-xs font-bold text-slate-700 block mb-1.5">Common Quick Selections:</span>
              <div className="flex flex-wrap gap-1.5">
                {commonIssues[selectedCategory]!.map((issue) => (
                  <button
                    type="button"
                    key={issue}
                    onClick={() => setSelectedCommonIssue(issue)}
                    className={`px-2.5 py-1 text-xs rounded-lg border transition ${selectedCommonIssue === issue ? 'bg-indigo-600 text-white border-indigo-600 font-semibold' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'}`}
                  >
                    {issue}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Specific Problem Description */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Describe the Issue or Job (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Master bedroom switch is loose and sparking whenever AC is switched on..."
              value={problemDescription}
              onChange={(e) => setProblemDescription(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-indigo-600"
            />
          </div>

          {/* Photo upload */}
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 px-3 py-2 border border-slate-300 hover:border-indigo-500 bg-slate-50 rounded-xl text-xs font-semibold text-slate-700 cursor-pointer">
              <Camera size={16} className="text-indigo-600" />
              <span>{photoUploaded ? 'Photo Attached ✓' : 'Upload Problem Photo (Optional)'}</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    setPhotoUploaded(e.target.files[0].name);
                  }
                }}
              />
            </label>
            {photoUploaded && (
              <span className="text-[11px] text-slate-500 truncate">{photoUploaded}</span>
            )}
          </div>

          {/* Immediate vs Scheduled Slot */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 block">Select Booking Time</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setScheduleType('immediate')}
                className={`p-3 rounded-2xl border text-left transition cursor-pointer ${scheduleType === 'immediate' ? 'bg-indigo-50 border-indigo-600 text-indigo-950 font-bold' : 'bg-white border-slate-200 text-slate-700'}`}
              >
                <div className="flex items-center gap-1.5 text-xs">
                  <Clock size={14} className="text-indigo-600" />
                  <span>Immediate (Within 45 Mins)</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">Fastest nearby technician dispatched</div>
              </button>

              <button
                type="button"
                onClick={() => setScheduleType('scheduled')}
                className={`p-3 rounded-2xl border text-left transition cursor-pointer ${scheduleType === 'scheduled' ? 'bg-indigo-50 border-indigo-600 text-indigo-950 font-bold' : 'bg-white border-slate-200 text-slate-700'}`}
              >
                <div className="flex items-center gap-1.5 text-xs">
                  <Calendar size={14} className="text-indigo-600" />
                  <span>Schedule For Later</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">Choose preferred date and time</div>
              </button>
            </div>

            {scheduleType === 'scheduled' && (
              <input
                type="text"
                placeholder="e.g. Tomorrow at 10:00 AM or Saturday 4 PM"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl mt-2"
              />
            )}
          </div>

          {/* Action button */}
          <button
            id="book-technician-confirm-btn"
            type="submit"
            className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 cursor-pointer transition"
          >
            <span>Book {selectedCategory} • Visiting Fee ₹{currentCategoryMeta?.visitingFee || 199}</span>
            <ArrowRight size={18} />
          </button>
        </form>

        {/* Right: Assigned Pro Details & Live State Simulator */}
        <div className="lg:col-span-5 space-y-4">
          {activeBooking ? (
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <span className="text-[10px] font-bold uppercase text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded">
                    Service Job #{activeBooking.id}
                  </span>
                  <div className="text-sm font-black text-slate-900 mt-1">
                    Status: {activeBooking.status.replace(/_/g, ' ')}
                  </div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
                  <Wrench size={20} />
                </div>
              </div>

              {/* Technician Pro Card */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-900 flex items-center justify-center font-black text-lg">
                    {activeBooking.technicianName?.charAt(0)}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">{activeBooking.technicianName}</div>
                    <div className="text-[11px] text-slate-500">
                      Certified {activeBooking.technicianCategory} Pro
                    </div>
                    <div className="text-[10px] text-amber-600 font-bold">
                      ⭐ 4.9 Rating • Police Verified
                    </div>
                  </div>
                </div>
                <a
                  href={`tel:${activeBooking.technicianPhone}`}
                  className="p-2 bg-emerald-600 text-white rounded-xl shadow-xs"
                >
                  <Phone size={16} />
                </a>
              </div>

              {/* Job Details */}
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-xs space-y-1.5">
                <div className="font-bold text-slate-800">Job: {activeBooking.issueDescription}</div>
                <div className="text-slate-600">
                  Address: {activeBooking.address.street}, {activeBooking.address.area}
                </div>
                <div className="text-slate-900 font-extrabold pt-1">
                  Visiting Charge: ₹{activeBooking.visitingCharges} (Pay pro post inspection)
                </div>
              </div>

              {/* Simulation button */}
              <button
                id="advance-service-booking-btn"
                onClick={handleSimulateStatus}
                disabled={activeBooking.status === 'COMPLETED'}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Advance Job Lifecycle ({activeBooking.status})</span>
                <ChevronRight size={14} />
              </button>

              {activeBooking.status === 'COMPLETED' && (
                <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold rounded-xl text-center">
                  Service finished! 30-day Customar warranty activated.
                </div>
              )}
            </div>
          ) : (
            <div className="bg-slate-50 border border-dashed border-slate-300 p-6 rounded-3xl text-center space-y-2">
              <Wrench size={32} className="mx-auto text-slate-400" />
              <div className="text-xs font-bold text-slate-700">No active technician requests</div>
              <p className="text-[11px] text-slate-500">
                Choose an expert above, describe your problem, and our closest verified technician will be dispatched to your home.
              </p>
            </div>
          )}

          {/* Warranty Promise */}
          <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-2xl flex items-start gap-3">
            <ShieldCheck size={20} className="text-indigo-700 shrink-0 mt-0.5" />
            <div className="text-xs text-indigo-900">
              <span className="font-bold">30-Day Customar Service Guarantee: </span>
              If the problem recurs within 30 days of repair, our technician will re-inspect and fix it at zero visiting cost.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
