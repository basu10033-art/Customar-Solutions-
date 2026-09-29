import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { MainCategory } from '../../types';
import { 
  Phone, Store, ShoppingBag, Apple, Cookie, Sparkles, 
  CupSoda, IceCream2, UtensilsCrossed, Fish, HeartPulse, 
  Printer, Wine, CheckCircle2, ArrowRight, ShieldCheck, 
  AlertCircle, KeyRound, MapPin, RefreshCw, User, Check,
  BadgeCheck, Clock, FileText, ChevronRight
} from 'lucide-react';

interface VendorAuthPortalProps {
  onSuccess?: () => void;
}

interface CategoryOption {
  id: MainCategory;
  name: string;
  nameBn: string;
  tagline: string;
  taglineBn: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  color: string;
  accentBg: string;
  borderActive: string;
  badge?: string;
  badgeBn?: string;
}

const VENDOR_CATEGORIES: CategoryOption[] = [
  {
    id: 'grocery',
    name: 'Grocery',
    nameBn: 'মুদি ও কিচেন',
    tagline: 'Atta, rice, oil, dairy & kitchen staples',
    taglineBn: 'আটা, চাল, তেল, ডাল ও মশলাপাতি',
    icon: ShoppingBag,
    color: 'text-emerald-700',
    accentBg: 'bg-emerald-50 hover:bg-emerald-100/70',
    borderActive: 'border-emerald-600 bg-emerald-50/80 ring-2 ring-emerald-500/20'
  },
  {
    id: 'vegetables-fruits',
    name: 'Vegetables & Fruits',
    nameBn: 'শাকসবজি ও ফলমূল',
    tagline: 'Farm-fresh local vegetables & seasonal fruits',
    taglineBn: 'টাটকা শাকসবজি ও বাছাই করা তাজা ফল',
    icon: Apple,
    color: 'text-green-700',
    accentBg: 'bg-green-50 hover:bg-green-100/70',
    borderActive: 'border-green-600 bg-green-50/80 ring-2 ring-green-500/20',
    badge: 'Farm Fresh',
    badgeBn: 'তাজা ও টাটকা'
  },
  {
    id: 'chips-namkeen',
    name: 'Chips & Namkeen',
    nameBn: 'চিপস ও নোনতা স্ন্যাক্স',
    tagline: 'Wafers, chanachur, bhujia & snacks',
    taglineBn: 'মুচমুচে চিপস, চানাচুর ও কুড়মুড়ে স্ন্যাক্স',
    icon: Cookie,
    color: 'text-amber-700',
    accentBg: 'bg-amber-50 hover:bg-amber-100/70',
    borderActive: 'border-amber-600 bg-amber-50/80 ring-2 ring-amber-500/20'
  },
  {
    id: 'cosmetics',
    name: 'Cosmetics',
    nameBn: 'কসমেটিক্স ও বিউটি',
    tagline: 'Skincare, makeup, perfumes & grooming',
    taglineBn: 'স্কিনকেয়ার, মেকআপ ও পার্সোনাল কেয়ার',
    icon: Sparkles,
    color: 'text-rose-700',
    accentBg: 'bg-rose-50 hover:bg-rose-100/70',
    borderActive: 'border-rose-600 bg-rose-50/80 ring-2 ring-rose-500/20'
  },
  {
    id: 'drinks-juice',
    name: 'Drinks & Juice',
    nameBn: 'ড্রিঙ্কস ও জুস',
    tagline: 'Cold sodas, fresh pressed juices & coolers',
    taglineBn: 'ঠান্ডা পানীয় ও ফ্রেশ ফলের জুস',
    icon: CupSoda,
    color: 'text-cyan-700',
    accentBg: 'bg-cyan-50 hover:bg-cyan-100/70',
    borderActive: 'border-cyan-600 bg-cyan-50/80 ring-2 ring-cyan-500/20'
  },
  {
    id: 'ice-cream',
    name: 'Ice-Creams',
    nameBn: 'আইসক্রিম ও ডেজার্ট',
    tagline: 'Tubs, bars, cones & frozen desserts',
    taglineBn: 'আইসক্রিম, কুলফি ও ফ্রোজেন ডেজার্ট',
    icon: IceCream2,
    color: 'text-fuchsia-700',
    accentBg: 'bg-fuchsia-50 hover:bg-fuchsia-100/70',
    borderActive: 'border-fuchsia-600 bg-fuchsia-50/80 ring-2 ring-fuchsia-500/20'
  },
  {
    id: 'fresh-foods',
    name: 'Fresh Foods & Kitchen',
    nameBn: 'তাজা খাবার ও রেস্তোরাঁ',
    tagline: 'Cloud kitchen hot meals, biryani & snacks',
    taglineBn: 'গরম রান্না খাবার, বিরিয়ানি ও রোল-ফাস্টফুড',
    icon: UtensilsCrossed,
    color: 'text-orange-700',
    accentBg: 'bg-orange-50 hover:bg-orange-100/70',
    borderActive: 'border-orange-600 bg-orange-50/80 ring-2 ring-orange-500/20',
    badge: 'Kitchen Hot',
    badgeBn: 'গরম পরিবেশন'
  },
  {
    id: 'fresh-fish-meats',
    name: 'Fresh Fish & Meats',
    nameBn: 'তাজা মাছ ও মাংস',
    tagline: 'Cleaned, cut chicken, mutton & river fish',
    taglineBn: 'পরিষ্কার ও টাটকা চিকেন, মাটন ও মাছ',
    icon: Fish,
    color: 'text-red-700',
    accentBg: 'bg-red-50 hover:bg-red-100/70',
    borderActive: 'border-red-600 bg-red-50/80 ring-2 ring-red-500/20',
    badge: '100% Fresh',
    badgeBn: '১০০% টাটকা'
  },
  {
    id: 'pharmacy',
    name: 'Pharmacy',
    nameBn: 'ফার্মেসি ও ওষুধপত্র',
    tagline: 'Prescription drugs, wellness & first-aid',
    taglineBn: 'প্রেসক্রিপশন ওষুধ, ফার্স্ট এইড ও হেলথকেয়ার',
    icon: HeartPulse,
    color: 'text-blue-700',
    accentBg: 'bg-blue-50 hover:bg-blue-100/70',
    borderActive: 'border-blue-600 bg-blue-50/80 ring-2 ring-blue-500/20',
    badge: 'Rx Verified',
    badgeBn: 'লাইসেন্সপ্রাপ্ত'
  },
  {
    id: 'prints',
    name: 'Prints & Photography',
    nameBn: 'প্রিন্ট ও ফটোগ্রাফি',
    tagline: 'Documents, photo prints, Xerox & posters',
    taglineBn: 'অনলাইন ডকুমেন্ট প্রিন্ট, ফটো ও স্পাইরাল',
    icon: Printer,
    color: 'text-indigo-700',
    accentBg: 'bg-indigo-50 hover:bg-indigo-100/70',
    borderActive: 'border-indigo-600 bg-indigo-50/80 ring-2 ring-indigo-500/20',
    badge: 'Express Print',
    badgeBn: 'দ্রুত প্রিন্ট'
  },
  {
    id: 'liquor',
    name: 'License Liquers',
    nameBn: 'লাইসেন্সপ্রাপ্ত লিকার',
    tagline: 'Govt authorized spirits, wine, rum & beers',
    taglineBn: 'লাইসেন্সড হুইস্কি, বিয়ার, রাম ও স্পিরিটস (২১+)',
    icon: Wine,
    color: 'text-purple-900',
    accentBg: 'bg-purple-50 hover:bg-purple-100/70',
    borderActive: 'border-purple-700 bg-purple-50/80 ring-2 ring-purple-500/20',
    badge: '21+ Licensed Only',
    badgeBn: '২১+ বয়স আবশ্যক'
  }
];

export const VendorAuthPortal: React.FC<VendorAuthPortalProps> = ({ onSuccess }) => {
  const { 
    vendors, vendorLoginWithPhone, vendorSignUpWithPhone, 
    language, t 
  } = useApp();

  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [selectedCategory, setSelectedCategory] = useState<MainCategory>('grocery');
  const [mobileNumber, setMobileNumber] = useState<string>('');
  
  // Sign up fields
  const [storeName, setStoreName] = useState<string>('');
  const [ownerName, setOwnerName] = useState<string>('');
  const [operatingArea, setOperatingArea] = useState<string>('Indiranagar');
  const [operatingCity, setOperatingCity] = useState<string>('Bengaluru');
  const [operatingPincode, setOperatingPincode] = useState<string>('560038');
  const [storeAddress, setStoreAddress] = useState<string>('');
  const [licenseNumber, setLicenseNumber] = useState<string>('');

  // OTP State
  const [isOtpSent, setIsOtpSent] = useState<boolean>(false);
  const [simulatedOtp, setSimulatedOtp] = useState<string>('');
  const [enteredOtp, setEnteredOtp] = useState<string>('');
  const [otpError, setOtpError] = useState<string | null>(null);
  const [resendTimer, setResendTimer] = useState<number>(30);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Timer countdown
  useEffect(() => {
    let interval: any;
    if (isOtpSent && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isOtpSent, resendTimer]);

  const cleanPhone = mobileNumber.replace(/\D/g, '').slice(-10);

  // Handle Send OTP
  const handleSendOtp = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setOtpError(null);

    if (cleanPhone.length < 10) {
      setOtpError(language === 'bn' ? 'সঠিক ১০-সংখ্যার মোবাইল নম্বর দিন' : 'Please enter a valid 10-digit mobile phone number');
      return;
    }

    if (authMode === 'signup' && !storeName.trim()) {
      setOtpError(language === 'bn' ? 'দোকানের নাম লিখুন' : 'Please enter your Store / Business Name');
      return;
    }

    // In login mode, verify if there's any vendor or if not found
    if (authMode === 'login') {
      const existingVendor = vendors.find(v => {
        const vPhone = v.phone.replace(/\D/g, '').slice(-10);
        return vPhone === cleanPhone && v.category === selectedCategory;
      });

      if (!existingVendor) {
        // Check if under different category
        const otherCatVendor = vendors.find(v => {
          const vPhone = v.phone.replace(/\D/g, '').slice(-10);
          return vPhone === cleanPhone;
        });

        if (otherCatVendor) {
          setOtpError(
            language === 'bn'
              ? `এই মোবাইল নম্বরটি ইতিমধ্যে "${otherCatVendor.category}" ক্যাটাগরিতে নিবন্ধিত আছে (${otherCatVendor.name})। সেই ক্যাটাগরি বেছে নিন অথবা নতুন দোকান সাইন আপ করুন।`
              : `This phone is registered under "${otherCatVendor.category}" (${otherCatVendor.name}). Switch category or Sign Up a new store.`
          );
          return;
        } else {
          setOtpError(
            language === 'bn'
              ? 'এই মোবাইল নম্বর ও ক্যাটাগরিতে কোনো দোকান পাওয়া যায়নি। অনুগ্রহ করে "নতুন বিক্রেতা সাইন আপ" করুন।'
              : 'No store found with this mobile number in this category. Please switch to Sign Up to register.'
          );
          return;
        }
      }
    }

    setIsLoading(true);
    setTimeout(() => {
      // Generate realistic 4-digit code
      const generatedCode = String(Math.floor(1000 + Math.random() * 9000));
      setSimulatedOtp(generatedCode);
      setIsOtpSent(true);
      setResendTimer(30);
      setIsLoading(false);
    }, 400);
  };

  // Handle Verify and Complete Auth
  const handleVerifyOtp = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setOtpError(null);

    if (enteredOtp.trim() !== simulatedOtp && enteredOtp.trim() !== '1234') {
      setOtpError(language === 'bn' ? 'ভুল ওটিপি কোড। অনুগ্রহ করে পুনরায় চেষ্টা করুন।' : 'Invalid OTP code. Please check the simulated SMS or use Auto-fill.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      if (authMode === 'login') {
        const res = vendorLoginWithPhone(cleanPhone, selectedCategory);
        setIsLoading(false);
        if (res.success) {
          if (onSuccess) onSuccess();
        } else {
          setOtpError(res.message);
        }
      } else {
        // Sign Up
        const res = vendorSignUpWithPhone({
          phone: cleanPhone,
          category: selectedCategory,
          name: storeName.trim(),
          businessName: ownerName.trim() || storeName.trim(),
          area: operatingArea,
          city: operatingCity,
          pincode: operatingPincode,
          address: storeAddress.trim() || `${storeName}, ${operatingArea}, ${operatingCity} - ${operatingPincode}`,
          fssaiNumber: licenseNumber,
          drugLicense: licenseNumber,
          liquorLicense: licenseNumber
        });
        setIsLoading(false);
        if (res.success) {
          if (onSuccess) onSuccess();
        } else {
          setOtpError(res.message);
        }
      }
    }, 400);
  };

  // Quick Demo Account click helper
  const handleQuickDemoSelect = (v: typeof vendors[0]) => {
    const rawClean = v.phone.replace(/\D/g, '').slice(-10);
    setMobileNumber(rawClean);
    setSelectedCategory(v.category);
    setAuthMode('login');
    setIsOtpSent(false);
    setOtpError(null);
  };

  const selectedCategoryMeta = VENDOR_CATEGORIES.find(c => c.id === selectedCategory) || VENDOR_CATEGORIES[0];
  const CategoryIcon = selectedCategoryMeta.icon;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 sm:py-10 space-y-8">
      {/* Top Banner & Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200 shadow-2xs">
          <Store size={15} />
          <span>{t('Customar Merchant & Store Partner Portal', 'কাস্টমার মার্চেন্ট ও বিক্রেতা পার্টনার পোর্টাল')}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          {authMode === 'login' 
            ? t('Vendor Partner Login (Mobile Only)', 'বিক্রেতা পার্টনার লগইন (শুধুমাত্র মোবাইল নম্বর)')
            : t('Register New Store Partner', 'নতুন দোকান ও বিক্রেতা পার্টনার রেজিস্ট্রেশন')}
        </h1>
        <p className="text-sm text-slate-600 max-w-xl mx-auto font-medium">
          {t(
            'Secure, passwordless entry using only your mobile phone number. Choose your store category and verify with instant OTP to access your orders, inventory & settlement terminal.',
            'কোনো পাসওয়ার্ডের প্রয়োজন নেই—শুধুমাত্র আপনার মোবাইল নম্বর ও স্টোর ক্যাটাগরি নির্বাচন করে ইনস্ট্যান্ট ওটিপি দিয়ে সরাসরি লগইন বা সাইন আপ করুন।'
          )}
        </p>
      </div>

      {/* Main Authentication Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
        {/* Tab Toggle: Login vs Sign Up */}
        <div className="grid grid-cols-2 border-b border-slate-200 bg-slate-50/80 p-1.5 gap-1.5">
          <button
            id="vendor-auth-tab-login"
            onClick={() => {
              setAuthMode('login');
              setIsOtpSent(false);
              setOtpError(null);
            }}
            className={`py-3 px-4 rounded-2xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
              authMode === 'login' 
                ? 'bg-white text-emerald-800 shadow-sm border border-slate-200 font-extrabold' 
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <KeyRound size={16} />
            <span>{t('Store Partner Login', 'বিক্রেতা লগইন')}</span>
          </button>
          
          <button
            id="vendor-auth-tab-signup"
            onClick={() => {
              setAuthMode('signup');
              setIsOtpSent(false);
              setOtpError(null);
            }}
            className={`py-3 px-4 rounded-2xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
              authMode === 'signup' 
                ? 'bg-white text-emerald-800 shadow-sm border border-slate-200 font-extrabold' 
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Store size={16} />
            <span>{t('Register New Store (Sign Up)', 'নতুন পার্টনার সাইন আপ')}</span>
          </button>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          {/* STEP 1: Category Selection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px]">1</span>
                <span>{t('Select Store Category', 'দোকানের ক্যাটাগরি বেছে নিন')}</span>
                <span className="text-emerald-700 font-bold ml-1">({selectedCategoryMeta.name})</span>
              </label>
              <span className="text-[11px] text-slate-400 font-semibold hidden sm:inline">
                {VENDOR_CATEGORIES.length} Categories available
              </span>
            </div>

            {/* Category Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 max-h-72 overflow-y-auto p-1 border border-slate-100 rounded-2xl bg-slate-50/50">
              {VENDOR_CATEGORIES.map(cat => {
                const Icon = cat.icon;
                const isSelected = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    id={`vendor-cat-select-${cat.id}`}
                    type="button"
                    onClick={() => {
                      setSelectedCategory(cat.id);
                      setIsOtpSent(false);
                      setOtpError(null);
                    }}
                    className={`text-left p-3 rounded-xl border transition cursor-pointer flex flex-col justify-between relative ${
                      isSelected 
                        ? cat.borderActive + ' shadow-sm' 
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    {isSelected && (
                      <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                        <Check size={10} strokeWidth={3} />
                      </span>
                    )}
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className={`p-1.5 rounded-lg ${cat.accentBg} ${cat.color}`}>
                        <Icon size={16} />
                      </div>
                      {cat.badge && (
                        <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-slate-900 text-white tracking-wider">
                          {cat.badge}
                        </span>
                      )}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 leading-snug">
                        {language === 'bn' ? cat.nameBn : cat.name}
                      </div>
                      <div className="text-[10px] text-slate-500 line-clamp-1">
                        {language === 'bn' ? cat.taglineBn : cat.tagline}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* STEP 2: Mobile Number & Store Details */}
          {!isOtpSent ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px]">2</span>
                  <span>{t('Enter Mobile Number (Only Mobile Required)', 'মোবাইল নম্বর লিখুন (পাসওয়ার্ড লাগবে না)')}</span>
                </label>
                <span className="text-[11px] text-emerald-700 font-bold flex items-center gap-1">
                  <ShieldCheck size={13} /> {t('No Password Needed', 'পাসওয়ার্ডহীন নিরাপদ লগইন')}
                </span>
              </div>

              {/* Mobile Phone Input */}
              <div className="flex rounded-2xl border-2 border-slate-200 focus-within:border-emerald-600 bg-white overflow-hidden transition shadow-2xs">
                <div className="bg-slate-100 px-4 py-3 border-r border-slate-200 flex items-center gap-2 select-none text-slate-800 font-bold text-sm">
                  <span className="text-base">🇮🇳</span>
                  <span>+91</span>
                </div>
                <input
                  id="vendor-mobile-input"
                  type="tel"
                  maxLength={14}
                  placeholder={t('Enter 10-digit mobile number (e.g. 98765 43210)', '১০ সংখ্যার মোবাইল নম্বর দিন (যেমন: 98765 43210)')}
                  value={mobileNumber}
                  onChange={(e) => {
                    setMobileNumber(e.target.value);
                    setOtpError(null);
                  }}
                  className="flex-1 px-4 py-3 text-slate-900 text-base font-bold outline-none placeholder:text-slate-400 placeholder:font-normal"
                />
              </div>

              {/* Additional Fields for SIGN UP Mode */}
              {authMode === 'signup' && (
                <div className="space-y-4 pt-2 border-t border-slate-100">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        {t('Store / Business Name *', 'দোকানের নাম *')}
                      </label>
                      <input
                        id="vendor-signup-store-name"
                        type="text"
                        placeholder="e.g. Kolkata Fresh Mart"
                        value={storeName}
                        onChange={(e) => setStoreName(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-bold text-xs text-slate-900 outline-none focus:border-emerald-600"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        {t('Owner / Partner Name', 'মালিক / পার্টনারের নাম')}
                      </label>
                      <input
                        id="vendor-signup-owner-name"
                        type="text"
                        placeholder="e.g. Subhajit Jana"
                        value={ownerName}
                        onChange={(e) => setOwnerName(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-bold text-xs text-slate-900 outline-none focus:border-emerald-600"
                      />
                    </div>
                  </div>

                  {/* Operational Location */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        {t('Operating Area *', 'অঞ্চল / এরিয়া *')}
                      </label>
                      <input
                        id="vendor-signup-area"
                        type="text"
                        value={operatingArea}
                        onChange={(e) => setOperatingArea(e.target.value)}
                        placeholder="e.g. Indiranagar"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold text-xs text-slate-900 outline-none focus:border-emerald-600"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        {t('City *', 'শহর *')}
                      </label>
                      <input
                        id="vendor-signup-city"
                        type="text"
                        value={operatingCity}
                        onChange={(e) => setOperatingCity(e.target.value)}
                        placeholder="e.g. Bengaluru"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold text-xs text-slate-900 outline-none focus:border-emerald-600"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        {t('Pincode *', 'পিনকোড *')}
                      </label>
                      <input
                        id="vendor-signup-pincode"
                        type="text"
                        value={operatingPincode}
                        onChange={(e) => setOperatingPincode(e.target.value)}
                        placeholder="e.g. 560038"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold text-xs text-slate-900 outline-none focus:border-emerald-600"
                        required
                      />
                    </div>
                  </div>

                  {/* License Info based on Category */}
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      {selectedCategory === 'pharmacy' 
                        ? t('Drug License Number (DL)', 'ড্রাগ লাইসেন্স নম্বর')
                        : selectedCategory === 'liquor'
                        ? t('State Excise CL-2 License Number', 'আবগারি লিকার লাইসেন্স নম্বর')
                        : t('FSSAI / Trade License Number (Optional)', 'FSSAI বা ট্রেড লাইসেন্স নম্বর (ঐচ্ছিক)')}
                    </label>
                    <input
                      id="vendor-signup-license"
                      type="text"
                      placeholder={
                        selectedCategory === 'pharmacy' 
                          ? 'DL-20B/21B-KA-45892' 
                          : selectedCategory === 'liquor'
                          ? 'EXC-KA-CL2-2024-889'
                          : '10019011000234'
                      }
                      value={licenseNumber}
                      onChange={(e) => setLicenseNumber(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-bold text-xs text-slate-900 outline-none focus:border-emerald-600"
                    />
                  </div>
                </div>
              )}

              {/* Error Box */}
              {otpError && (
                <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-start gap-2">
                  <AlertCircle size={16} className="shrink-0 mt-0.5" />
                  <div>{otpError}</div>
                </div>
              )}

              {/* Submit Button */}
              <button
                id="vendor-send-otp-btn"
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-extrabold text-sm transition shadow-md shadow-emerald-700/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <RefreshCw size={18} className="animate-spin" />
                ) : (
                  <>
                    <span>
                      {authMode === 'login' 
                        ? t('Send Verification Code (OTP)', 'ওটিপি কোড পাঠান') 
                        : t('Continue to Verify Mobile (OTP)', 'মোবাইল ওটিপি যাচাই করুন')}
                    </span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>
          ) : (
            /* STEP 3: OTP Verification Screen */
            <form onSubmit={handleVerifyOtp} className="space-y-5">
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                    <Phone size={18} />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-emerald-900">
                      {t('OTP Sent to', 'ওটিপি পাঠানো হয়েছে')}: +91 {cleanPhone}
                    </div>
                    <div className="text-[11px] text-emerald-700">
                      {t('Category', 'ক্যাটাগরি')}: <strong>{selectedCategoryMeta.name}</strong>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsOtpSent(false)}
                  className="text-xs font-bold text-emerald-800 hover:underline cursor-pointer"
                >
                  {t('Change Number', 'পরিবর্তন')}
                </button>
              </div>

              {/* Simulated SMS Alert Banner */}
              <div className="p-3.5 rounded-2xl bg-slate-900 text-white flex items-center justify-between gap-3 shadow-inner">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                  <div className="text-xs">
                    <span className="text-slate-400">{t('Simulated SMS Code', 'সিমুলেটেড এসএমএস কোড')}:</span>{' '}
                    <strong className="text-emerald-400 text-sm tracking-widest font-mono font-black">{simulatedOtp}</strong>
                  </div>
                </div>
                <button
                  id="vendor-autofill-otp-btn"
                  type="button"
                  onClick={() => {
                    setEnteredOtp(simulatedOtp);
                    setOtpError(null);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold cursor-pointer transition flex items-center gap-1"
                >
                  <Check size={12} />
                  <span>{t('Auto-Fill OTP', 'অটো-ফিল কোড')}</span>
                </button>
              </div>

              {/* OTP Input Field */}
              <div>
                <label className="text-xs font-black uppercase tracking-wider text-slate-700 block mb-1.5">
                  {t('Enter 4-Digit Verification Code', '৪-সংখ্যার ওটিপি কোড লিখুন')}
                </label>
                <input
                  id="vendor-otp-input"
                  type="text"
                  maxLength={4}
                  autoFocus
                  placeholder="• • • •"
                  value={enteredOtp}
                  onChange={(e) => {
                    setEnteredOtp(e.target.value.replace(/\D/g, ''));
                    setOtpError(null);
                  }}
                  className="w-full py-3.5 px-4 rounded-2xl border-2 border-slate-200 focus:border-emerald-600 text-center font-mono font-black text-2xl tracking-widest text-slate-900 outline-none transition"
                />
              </div>

              {/* Error Box */}
              {otpError && (
                <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-start gap-2">
                  <AlertCircle size={16} className="shrink-0 mt-0.5" />
                  <div>{otpError}</div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-2.5">
                <button
                  id="vendor-verify-otp-btn"
                  type="submit"
                  disabled={isLoading || enteredOtp.length < 4}
                  className="w-full py-3.5 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-extrabold text-sm transition shadow-md shadow-emerald-700/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? (
                    <RefreshCw size={18} className="animate-spin" />
                  ) : (
                    <>
                      <CheckCircle2 size={18} />
                      <span>
                        {authMode === 'login' 
                          ? t('Verify & Login to Store Terminal', 'ওটিপি যাচাই করে স্টোরে প্রবেশ করুন') 
                          : t('Verify & Activate Store Account', 'ওটিপি যাচাই করে অ্যাকাউন্ট সক্রিয় করুন')}
                      </span>
                    </>
                  )}
                </button>

                <div className="flex items-center justify-between text-xs text-slate-500 px-1">
                  <span>{t("Didn't receive SMS?", 'এসএমএস পাননি?')}</span>
                  {resendTimer > 0 ? (
                    <span className="font-semibold text-slate-400">
                      {t('Resend in', 'পুনরায় পাঠান')} {resendTimer}s
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleSendOtp()}
                      className="font-bold text-emerald-700 hover:underline cursor-pointer"
                    >
                      {t('Resend Code', 'পুনরায় কোড পাঠান')}
                    </button>
                  )}
                </div>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* QUICK DEMO ACCOUNTS FOR ALL 11 CATEGORIES */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-800 flex items-center gap-2">
              <BadgeCheck size={16} className="text-emerald-600" />
              <span>{t('Instant Demo Stores by Category (1-Tap Test)', '১-ক্লিকে টেস্ট: প্রতিটি ক্যাটাগরির ডেমো স্টোর')}</span>
            </h3>
            <p className="text-xs text-slate-500">
              {t('Click any pre-registered vendor to auto-fill mobile number and category for quick testing', 'যেকোনো ক্যাটাগরির ডেমো স্টোরে ক্লিক করে তাৎক্ষণিক লগইন টেস্ট করুন')}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {vendors.slice(0, 11).map(v => {
            const catMeta = VENDOR_CATEGORIES.find(c => c.id === v.category) || VENDOR_CATEGORIES[0];
            const Icon = catMeta.icon;
            return (
              <button
                key={v.id}
                id={`quick-demo-login-${v.id}`}
                type="button"
                onClick={() => handleQuickDemoSelect(v)}
                className="text-left p-3.5 rounded-2xl border border-slate-200 bg-white hover:border-emerald-500 hover:shadow-md transition cursor-pointer flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl ${catMeta.accentBg} ${catMeta.color} flex items-center justify-center shrink-0`}>
                    <Icon size={18} />
                  </div>
                  <div>
                    <div className="text-xs font-black text-slate-900 group-hover:text-emerald-700 transition line-clamp-1">
                      {v.name}
                    </div>
                    <div className="text-[11px] font-bold text-slate-500">
                      {v.phone} • <span className="capitalize text-emerald-800">{v.category}</span>
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {v.area || 'Indiranagar'}, {v.pincode || '560038'}
                    </div>
                  </div>
                </div>
                <ChevronRight size={16} className="text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition" />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
