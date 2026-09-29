import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import { Address } from '../../types';
import { 
  MapPin, Navigation, LocateFixed, ChevronDown, Check, 
  Zap, Clock, Radio, RefreshCw, AlertCircle, Sparkles, 
  Building2, Home, Compass, ShieldCheck, ChevronUp
} from 'lucide-react';

interface HomeLiveLocationCardProps {
  onOpenLocationModal?: () => void;
}

export const HomeLiveLocationCard: React.FC<HomeLiveLocationCardProps> = ({
  onOpenLocationModal
}) => {
  const { 
    selectedAddress, setSelectedAddress, addresses, addAddress, language 
  } = useApp();

  const [isDetecting, setIsDetecting] = useState(false);
  const [gpsStatus, setGpsStatus] = useState<'idle' | 'detecting' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [liveCoords, setLiveCoords] = useState<{ lat: number; lng: number; accuracy?: number } | null>(
    selectedAddress.lat && selectedAddress.lng ? { lat: selectedAddress.lat, lng: selectedAddress.lng } : null
  );
  const [isRadarExpanded, setIsRadarExpanded] = useState(false);

  // Synchronize liveCoords if selectedAddress changes
  useEffect(() => {
    if (selectedAddress.lat && selectedAddress.lng) {
      setLiveCoords({ lat: selectedAddress.lat, lng: selectedAddress.lng });
    }
  }, [selectedAddress]);

  // Reverse Geocoding Helper
  const reverseGeocode = async (lat: number, lng: number): Promise<{ area: string; city: string; street: string; pincode: string }> => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2500);

      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        {
          signal: controller.signal,
          headers: { 'Accept-Language': 'en' }
        }
      );
      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        const addr = data.address || {};
        const suburb = addr.suburb || addr.neighbourhood || addr.residential || addr.village || addr.town || 'Nearby Locality';
        const city = addr.city || addr.state_district || addr.county || 'Metro Region';
        const road = addr.road || addr.pedestrian || `GPS Near ${suburb}`;
        const postcode = addr.postcode || '700001';

        return {
          area: suburb,
          city: city,
          street: road,
          pincode: postcode
        };
      }
    } catch {
      // Ignore network errors or timeouts; fallback below
    }

    return {
      area: 'GPS Live Location',
      city: 'Current City',
      street: `Latitude: ${lat.toFixed(4)}°, Longitude: ${lng.toFixed(4)}°`,
      pincode: '700001'
    };
  };

  const handleDetectLiveLocation = useCallback(() => {
    if (!('geolocation' in navigator)) {
      setGpsStatus('error');
      setStatusMessage(
        language === 'bn' 
          ? 'আপনার ব্রাউজারে জিপিএস সুবিধা পাওয়া যায়নি।' 
          : 'Geolocation is not supported by your browser.'
      );
      return;
    }

    setIsDetecting(true);
    setGpsStatus('detecting');
    setStatusMessage(
      language === 'bn'
        ? 'স্যাটেলাইট জিপিএস সিগন্যাল সংযোগ হচ্ছে...'
        : 'Connecting to live GPS satellites...'
    );

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        setLiveCoords({ lat: latitude, lng: longitude, accuracy });

        setStatusMessage(
          language === 'bn'
            ? 'লোকেশন পাওয়া গেছে! ঠিকানা প্রস্তুত করা হচ্ছে...'
            : 'Coordinates found! Resolving doorstep address...'
        );

        const geo = await reverseGeocode(latitude, longitude);

        const newGpsAddress: Omit<Address, 'id'> = {
          label: 'Other',
          street: geo.street,
          area: geo.area,
          city: geo.city,
          pincode: geo.pincode,
          landmark: `Live GPS (Accuracy: ±${Math.round(accuracy)}m)`,
          lat: latitude,
          lng: longitude
        };

        addAddress(newGpsAddress);
        setIsDetecting(false);
        setGpsStatus('success');
        setStatusMessage(
          language === 'bn'
            ? `✓ লাইভ লোকেশন আপডেট সম্পন্ন (নির্ভুলতা: ±${Math.round(accuracy)} মি.)`
            : `✓ Live GPS Synced! (Accuracy: ±${Math.round(accuracy)}m)`
        );

        setTimeout(() => {
          setStatusMessage(null);
        }, 5000);
      },
      (error) => {
        setIsDetecting(false);
        setGpsStatus('error');
        let errorMsg = language === 'bn'
          ? 'লোকেশন পারমিশন মেলেনি। ড্রপডাউন থেকে ঠিকানা নির্বাচন করুন।'
          : 'GPS permission denied or timed out. Please select from saved addresses.';
        
        if (error.code === error.PERMISSION_DENIED) {
          errorMsg = language === 'bn'
            ? 'ব্রাউজারে লোকেশন পারমিশন অফ করা আছে। অনুগ্রহ করে পারমিশন দিন।'
            : 'Location permission blocked. Please allow browser location access.';
        }
        setStatusMessage(errorMsg);

        setTimeout(() => {
          setStatusMessage(null);
        }, 6000);
      },
      {
        enableHighAccuracy: true,
        timeout: 9000,
        maximumAge: 0
      }
    );
  }, [addAddress, language]);

  return (
    <div className="bg-linear-to-r from-emerald-950 via-slate-900 to-teal-950 text-white rounded-3xl p-4 sm:p-5 border border-emerald-800/40 shadow-xl overflow-hidden relative">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
      <div className="absolute bottom-0 left-1/3 w-56 h-56 bg-teal-500/10 rounded-full blur-2xl pointer-events-none"></div>

      <div className="relative z-10 space-y-4">
        {/* Row 1: Speed Guarantee & Live GPS Trigger */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* 10-15 Min Delivery Guarantee Badge */}
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500 text-slate-950 font-black text-xs uppercase tracking-wider rounded-full shadow-sm">
              <Zap size={14} className="fill-current text-slate-950" />
              <span>{language === 'bn' ? '১০-১৫ মিনিটে ডেলিভারি' : '10-15 MINS DELIVERY'}</span>
            </span>

            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold text-emerald-300/90 bg-emerald-900/50 px-2.5 py-0.5 rounded-full border border-emerald-700/40">
              <Radio size={12} className="text-emerald-400 animate-pulse" />
              <span>{language === 'bn' ? 'ডার্ক স্টোর #০৪ অ্যাক্টিভ' : 'Dark Store #04 Online'}</span>
            </span>
          </div>

          {/* Detect Live GPS Action Button */}
          <button
            id="home-detect-live-gps-btn"
            onClick={handleDetectLiveLocation}
            disabled={isDetecting}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-bold text-xs transition cursor-pointer active:scale-95 shadow-md ${
              isDetecting
                ? 'bg-amber-500 text-slate-950 animate-pulse'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-400/30'
            }`}
          >
            {isDetecting ? (
              <RefreshCw size={14} className="animate-spin" />
            ) : (
              <LocateFixed size={14} className="text-emerald-200" />
            )}
            <span>
              {isDetecting 
                ? (language === 'bn' ? 'জিপিএস খোঁজা হচ্ছে...' : 'Acquiring GPS...')
                : (language === 'bn' ? 'বর্তমান লাইভ লোকেশন' : 'Detect Live Location')}
            </span>
          </button>
        </div>

        {/* Row 2: Selected Address Display Card */}
        <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-emerald-400/50 transition">
          <div 
            onClick={onOpenLocationModal}
            className="flex items-start gap-3 cursor-pointer group flex-1"
            title="Click to switch or edit delivery location"
          >
            <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 group-hover:scale-105 group-hover:bg-emerald-500 group-hover:text-slate-950 transition-all shrink-0 mt-0.5">
              <MapPin size={20} />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 bg-emerald-500/25 text-emerald-300 rounded border border-emerald-500/30">
                  {selectedAddress.label === 'Home' ? (language === 'bn' ? 'বাড়ি' : 'Home') :
                   selectedAddress.label === 'Work' ? (language === 'bn' ? 'অফিস' : 'Work') : 
                   (language === 'bn' ? 'লাইভ জিপিএস' : 'Live Location')}
                </span>
                <span className="text-xs text-slate-300 font-medium">
                  {language === 'bn' ? 'ডেলিভারি ঠিকানা' : 'Deliver to:'}
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
              </div>

              <div className="text-sm sm:text-base font-black text-white truncate group-hover:text-emerald-300 transition-colors flex items-center gap-1.5 mt-0.5">
                <span>{selectedAddress.area}, {selectedAddress.city}</span>
                <ChevronDown size={15} className="text-slate-400 group-hover:text-emerald-300 transition-transform shrink-0" />
              </div>

              <p className="text-xs text-slate-300/80 truncate mt-0.5">
                {selectedAddress.street}
                {selectedAddress.pincode && ` • ${selectedAddress.pincode}`}
                {selectedAddress.landmark && ` (${selectedAddress.landmark})`}
              </p>
            </div>
          </div>

          {/* Quick Action Buttons on Right */}
          <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/10">
            {/* Toggle Mini Radar / Coordinates Map */}
            <button
              id="home-toggle-gps-radar-btn"
              onClick={() => setIsRadarExpanded(!isRadarExpanded)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-200 transition cursor-pointer"
            >
              <Compass size={13} className="text-emerald-400" />
              <span>{isRadarExpanded ? (language === 'bn' ? 'রাডার বন্ধ' : 'Hide Radar') : (language === 'bn' ? 'লাইভ রাডার' : 'Live Radar')}</span>
              {isRadarExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            </button>

            {/* Change Location Modal Trigger */}
            <button
              id="home-change-location-btn"
              onClick={onOpenLocationModal}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white hover:bg-slate-100 text-slate-900 transition cursor-pointer"
            >
              {language === 'bn' ? 'পরিবর্তন' : 'Change'}
            </button>
          </div>
        </div>

        {/* Live Feedback / Notification Banner */}
        {statusMessage && (
          <div className={`p-2.5 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in slide-in-from-top-1 ${
            gpsStatus === 'error'
              ? 'bg-rose-500/20 text-rose-200 border border-rose-500/40'
              : gpsStatus === 'detecting'
              ? 'bg-amber-500/20 text-amber-200 border border-amber-500/40'
              : 'bg-emerald-500/20 text-emerald-200 border border-emerald-500/40'
          }`}>
            {gpsStatus === 'error' ? (
              <AlertCircle size={14} className="shrink-0 text-rose-400" />
            ) : gpsStatus === 'detecting' ? (
              <RefreshCw size={14} className="shrink-0 text-amber-400 animate-spin" />
            ) : (
              <Check size={14} className="shrink-0 text-emerald-400" />
            )}
            <span className="flex-1">{statusMessage}</span>
          </div>
        )}

        {/* Row 3: Quick Address Switcher Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
            {language === 'bn' ? 'সংরক্ষিত:' : 'Saved:'}
          </span>

          {addresses.map((addr) => {
            const isSelected = selectedAddress.id === addr.id;
            const Icon = addr.label === 'Home' ? Home : addr.label === 'Work' ? Building2 : MapPin;
            return (
              <button
                key={addr.id}
                onClick={() => setSelectedAddress(addr)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-xl font-bold whitespace-nowrap transition cursor-pointer shrink-0 border ${
                  isSelected
                    ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-xs scale-102'
                    : 'bg-white/10 hover:bg-white/20 text-slate-200 border-white/10'
                }`}
              >
                <Icon size={12} className={isSelected ? 'text-slate-950' : 'text-emerald-400'} />
                <span>{addr.label}: {addr.area}</span>
                {isSelected && <Check size={11} className="stroke-3 text-slate-950" />}
              </button>
            );
          })}

          <button
            onClick={onOpenLocationModal}
            className="flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-semibold text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 whitespace-nowrap shrink-0 transition cursor-pointer"
          >
            <span>+ {language === 'bn' ? 'নতুন ঠিকানা' : 'Add New'}</span>
          </button>
        </div>

        {/* Collapsible Section: Interactive Live GPS Radar & Dark Store Visualizer */}
        {isRadarExpanded && (
          <div className="bg-slate-950/80 border border-emerald-800/40 rounded-2xl p-4 space-y-3 animate-in fade-in zoom-in-98 duration-200">
            <div className="flex items-center justify-between text-xs border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
                <span className="font-bold text-slate-200">
                  {language === 'bn' ? 'রিয়েল-টাইম জিপিএস রাডার ও ডিসপ্যাচ হাব' : 'Real-Time GPS Radar & Dispatch Dark Store'}
                </span>
              </div>
              <div className="text-[11px] text-slate-400">
                {liveCoords 
                  ? `Lat: ${liveCoords.lat.toFixed(4)}°, Lng: ${liveCoords.lng.toFixed(4)}°`
                  : 'Coordinates pending'}
              </div>
            </div>

            {/* Radar Canvas Simulation */}
            <div className="relative h-44 bg-linear-to-b from-slate-900 to-slate-950 rounded-xl border border-emerald-900/40 overflow-hidden flex items-center justify-center">
              {/* Radar concentric circles */}
              <div className="absolute w-72 h-72 rounded-full border border-emerald-500/10 animate-pulse"></div>
              <div className="absolute w-52 h-52 rounded-full border border-emerald-500/15"></div>
              <div className="absolute w-32 h-32 rounded-full border border-emerald-500/20"></div>
              <div className="absolute w-12 h-12 rounded-full border border-emerald-500/30"></div>

              {/* Grid cross lines */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-full h-px bg-emerald-500/10"></div>
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-full w-px bg-emerald-500/10"></div>
              </div>

              {/* Center User Location Ping */}
              <div className="relative z-10 flex flex-col items-center">
                <div className="w-6 h-6 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center shadow-lg shadow-emerald-500/50 animate-bounce">
                  <MapPin size={14} className="fill-current" />
                </div>
                <div className="mt-1 px-2 py-0.5 rounded-md bg-emerald-950/90 border border-emerald-500/40 text-[10px] font-black text-emerald-300">
                  {language === 'bn' ? 'আপনার লাইভ অবস্থান' : 'Your Live Location'}
                </div>
              </div>

              {/* Dark Store Node */}
              <div className="absolute top-8 left-12 flex flex-col items-center">
                <div className="w-5 h-5 rounded-full bg-teal-600 text-white flex items-center justify-center shadow-md">
                  <Building2 size={11} />
                </div>
                <span className="text-[9px] font-bold text-teal-300 mt-0.5 bg-slate-900/80 px-1 rounded">
                  Dark Store #04 (0.8 km)
                </span>
              </div>

              {/* Active Delivery Partner Node */}
              <div className="absolute bottom-7 right-14 flex flex-col items-center">
                <div className="w-4 h-4 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center animate-ping">
                  <Zap size={9} />
                </div>
                <span className="text-[9px] font-bold text-amber-300 mt-0.5 bg-slate-900/80 px-1 rounded">
                  Rider Nearby (3 mins)
                </span>
              </div>
            </div>

            {/* Hub Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
              <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 block uppercase font-bold">
                  {language === 'bn' ? 'দূরত্ব' : 'Distance'}
                </span>
                <span className="text-xs font-black text-emerald-400">0.8 km</span>
              </div>

              <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 block uppercase font-bold">
                  {language === 'bn' ? 'প্যাকিং সময়' : 'Packing Time'}
                </span>
                <span className="text-xs font-black text-teal-400">~2 Mins</span>
              </div>

              <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 block uppercase font-bold">
                  {language === 'bn' ? 'রাইডার অ্যাক্টিভ' : 'Active Riders'}
                </span>
                <span className="text-xs font-black text-amber-400">14 Partners</span>
              </div>

              <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 block uppercase font-bold">
                  {language === 'bn' ? 'ডেলিভারি প্রতিশ্রুতি' : 'Delivery ETA'}
                </span>
                <span className="text-xs font-black text-emerald-400">10-15 Mins</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
