import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { MainCategory, Product } from '../../types';
import { HomeLiveLocationCard } from './HomeLiveLocationCard';
import { 
  Search, Mic, ShoppingBag, Sparkles, Headphones, Gift, 
  Wine, Car, Printer, Wrench, HeartPulse, Plus, Minus, 
  Clock, Tag, Star, ChevronRight, Zap
} from 'lucide-react';

interface BlinkitHomeGridProps {
  onSelectCategory: (categoryId: MainCategory, subcategory?: string) => void;
  onSelectProduct: (product: Product) => void;
  onOpenSearch?: () => void;
  onOpenLocation?: () => void;
}

export const BlinkitHomeGrid: React.FC<BlinkitHomeGridProps> = ({
  onSelectCategory,
  onSelectProduct,
  onOpenSearch,
  onOpenLocation
}) => {
  const { products, cart, addToCart, updateCartQuantity, language } = useApp();

  // Animated Search placeholder cycling
  const searchSuggestionsEn = [
    'Search for atta, dal, coke and more',
    'Search for "milk, bread & eggs"',
    'Search for "chips, namkeen & juice"',
    'Search for "whiskey, rum & beer"',
    'Search for "cab, xerox & plumber"'
  ];

  const searchSuggestionsBn = [
    'আটা, চাল, ডাল, কোল্ড ড্রিঙ্কস খুঁজুন...',
    'দুধ, ডিম, পাউরুটি খুঁজুন...',
    'চিপস, চানাচুর ও ফলের জুস খুঁজুন...',
    'হুইস্কি, রাম ও বিয়ার খুঁজুন (২১+)...',
    'ক্যাব, জেরক্স ও ইলেকট্রিশিয়ান খুঁজুন...'
  ];

  const [currentPlaceholderIdx, setCurrentPlaceholderIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentPlaceholderIdx(prev => (prev + 1) % searchSuggestionsEn.length);
    }, 3200);
    return () => clearInterval(timer);
  }, [searchSuggestionsEn.length]);

  const activePlaceholder = language === 'bn' 
    ? searchSuggestionsBn[currentPlaceholderIdx] 
    : searchSuggestionsEn[currentPlaceholderIdx];

  // Quick navigation tabs below search
  const quickTabs = [
    { id: 'all', label: 'All', labelBn: 'সব', icon: ShoppingBag, active: true },
    { id: 'festive', label: 'Festive Deals', labelBn: 'অফার', icon: Sparkles, isNew: true, category: 'grocery' as MainCategory },
    { id: 'electronics', label: 'Electronics', labelBn: 'ইলেকট্রনিক্স', icon: Headphones, category: 'grocery' as MainCategory },
    { id: 'beauty', label: 'Beauty', labelBn: 'বিউটি', icon: Sparkles, category: 'cosmetics' as MainCategory },
    { id: 'gifting', label: 'Gifting', labelBn: 'উপহার', icon: Gift, category: 'ice-cream' as MainCategory },
    { id: 'liquor', label: 'Liquers (21+)', labelBn: 'লিকার', icon: Wine, category: 'liquor' as MainCategory },
    { id: 'cabs', label: 'Cabs', labelBn: 'ক্যাব', icon: Car, category: 'cabs' as MainCategory },
    { id: 'prints', label: 'Prints', labelBn: 'জেরক্স', icon: Printer, category: 'prints' as MainCategory },
    { id: 'tech', label: 'Technicians', labelBn: 'মিস্ত্রি', icon: Wrench, category: 'technicians' as MainCategory }
  ];

  // Section 1: Grocery & Kitchen (8 tiles matching screenshot)
  const groceryTiles = [
    {
      id: 'veg-fruits',
      name: 'Vegetables & Fruits',
      nameBn: 'শাকসবজি ও ফলমূল',
      image: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=350&auto=format&fit=crop&q=80',
      category: 'vegetables-fruits' as MainCategory,
      subcategory: 'All'
    },
    {
      id: 'atta-rice-dal',
      name: 'Atta, Rice & Dal',
      nameBn: 'আটা, চাল ও ডাল',
      image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=350&auto=format&fit=crop&q=80',
      category: 'grocery' as MainCategory,
      subcategory: 'Atta, Rice & Dal'
    },
    {
      id: 'oil-ghee-masala',
      name: 'Oil, Ghee & Masala',
      nameBn: 'তেল, ঘি ও মশলা',
      image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=350&auto=format&fit=crop&q=80',
      category: 'grocery' as MainCategory,
      subcategory: 'Oil & Ghee'
    },
    {
      id: 'dairy-bread-eggs',
      name: 'Dairy, Bread & Eggs',
      nameBn: 'দুধ, ডিম ও পাউরুটি',
      image: 'https://images.unsplash.com/photo-1588964895597-cfccd6e2dbf9?w=350&auto=format&fit=crop&q=80',
      category: 'grocery' as MainCategory,
      subcategory: 'Dairy, Milk & Eggs'
    },
    {
      id: 'bakery-biscuits',
      name: 'Bakery & Biscuits',
      nameBn: 'বেকারি ও বিস্কুট',
      image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=350&auto=format&fit=crop&q=80',
      category: 'grocery' as MainCategory,
      subcategory: 'Bakery & Biscuits'
    },
    {
      id: 'dryfruits-cereals',
      name: 'Dry Fruits & Cereals',
      nameBn: 'ড্রাই ফ্রুটস ও সিরিয়াল',
      image: 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=350&auto=format&fit=crop&q=80',
      category: 'grocery' as MainCategory,
      subcategory: 'Tea, Coffee & Chocolates'
    },
    {
      id: 'chicken-meat-fish',
      name: 'Chicken, Meat & Fish',
      nameBn: 'চিকেন, মাংস ও মাছ',
      image: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=350&auto=format&fit=crop&q=80',
      category: 'fresh-fish-meats' as MainCategory,
      subcategory: 'All'
    },
    {
      id: 'kitchenware-appliances',
      name: 'Kitchenware & Appliances',
      nameBn: 'কিচেন সামগ্রী',
      image: 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=350&auto=format&fit=crop&q=80',
      category: 'grocery' as MainCategory,
      subcategory: 'Cleaners & Repellents'
    }
  ];

  // Section 2: Snacks & Drinks (8 tiles matching screenshot)
  const snacksTiles = [
    {
      id: 'chips-namkeen',
      name: 'Chips & Namkeen',
      nameBn: 'চিপস ও নোনতা',
      image: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=350&auto=format&fit=crop&q=80',
      category: 'chips-namkeen' as MainCategory,
      subcategory: 'Chips'
    },
    {
      id: 'sweets-chocolates',
      name: 'Sweets & Chocolates',
      nameBn: 'মিষ্টি ও চকলেট',
      image: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=350&auto=format&fit=crop&q=80',
      category: 'ice-cream' as MainCategory,
      subcategory: 'Cakes'
    },
    {
      id: 'drinks-juices',
      name: 'Drinks & Juices',
      nameBn: 'কোল্ড ড্রিংকস ও জুস',
      image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=350&auto=format&fit=crop&q=80',
      category: 'drinks-juice' as MainCategory,
      subcategory: 'All'
    },
    {
      id: 'tea-coffee',
      name: 'Tea, Coffee & Milk Drinks',
      nameBn: 'চা, কফি ও ড্রিংকস',
      image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=350&auto=format&fit=crop&q=80',
      category: 'grocery' as MainCategory,
      subcategory: 'Tea, Coffee & Chocolates'
    },
    {
      id: 'instant-food',
      name: 'Instant Food',
      nameBn: 'ইনস্ট্যান্ট নুডলস',
      image: 'https://images.unsplash.com/photo-1612927601601-6638404737ce?w=350&auto=format&fit=crop&q=80',
      category: 'grocery' as MainCategory,
      subcategory: 'Instant Food & Sauces'
    },
    {
      id: 'sauces-spreads',
      name: 'Sauces & Spreads',
      nameBn: 'সস ও স্প্রেড',
      image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=350&auto=format&fit=crop&q=80',
      category: 'grocery' as MainCategory,
      subcategory: 'Instant Food & Sauces'
    },
    {
      id: 'paan-corner',
      name: 'Paan Corner',
      nameBn: 'পান কর্নার ও মিন্ট',
      image: 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=350&auto=format&fit=crop&q=80',
      category: 'chips-namkeen' as MainCategory,
      subcategory: 'Namkeens'
    },
    {
      id: 'icecreams',
      name: 'Ice Creams & More',
      nameBn: 'আইসক্রিম ও কুলফি',
      image: 'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=350&auto=format&fit=crop&q=80',
      category: 'ice-cream' as MainCategory,
      subcategory: 'Ice Cream'
    }
  ];

  // Section 3: Liquers & Hard drinks (21+)
  const liquorTiles = [
    {
      id: 'whiskey-scotch',
      name: 'Whiskey & Scotch',
      nameBn: 'হুইস্কি ও স্কচ',
      image: 'https://images.unsplash.com/photo-1527281400683-1aae777175f8?w=350&auto=format&fit=crop&q=80',
      category: 'liquor' as MainCategory,
      subcategory: 'Whiskey'
    },
    {
      id: 'rum-dark-spirits',
      name: 'Rum & Dark Spirits',
      nameBn: 'রাম ও ডার্ক স্পিরিটস',
      image: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=350&auto=format&fit=crop&q=80',
      category: 'liquor' as MainCategory,
      subcategory: 'Rum'
    },
    {
      id: 'vodka-gin',
      name: 'Vodka, Gin & Tequila',
      nameBn: 'ভদকা ও জিন',
      image: 'https://images.unsplash.com/photo-1563227812-0ea4c22e6cc8?w=350&auto=format&fit=crop&q=80',
      category: 'liquor' as MainCategory,
      subcategory: 'Vodka'
    },
    {
      id: 'beer-coolers',
      name: 'Beer & Coolers',
      nameBn: 'বিয়ার ও কুলার্স',
      image: 'https://images.unsplash.com/photo-1608270104113-5a041f92e079?w=350&auto=format&fit=crop&q=80',
      category: 'liquor' as MainCategory,
      subcategory: 'Gin'
    }
  ];

  // Section 4: Quick City Services
  const serviceTiles = [
    {
      id: 'cabs-ride',
      name: 'Customar Cabs',
      nameBn: 'কাস্টমার ক্যাব ও রাইড',
      subtitle: '3 Mins Pickup',
      subtitleBn: '৩ মিনিটে রাইড',
      image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=350&auto=format&fit=crop&q=80',
      category: 'cabs' as MainCategory
    },
    {
      id: 'prints-xerox',
      name: 'Customar PRINTS',
      nameBn: 'জেরক্স ও কালার প্রিন্ট',
      subtitle: '15 Mins Delivery',
      subtitleBn: '১৫ মিনিটে ডেলিভারি',
      image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=350&auto=format&fit=crop&q=80',
      category: 'prints' as MainCategory
    },
    {
      id: 'home-tech',
      name: 'Home Technicians',
      nameBn: 'মিস্ত্রি ও টেকনিশিয়ান',
      subtitle: 'Rajmistri, Electrician',
      subtitleBn: 'রাজমিস্ত্রি, ইলেকট্রিশিয়ান',
      image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=350&auto=format&fit=crop&q=80',
      category: 'technicians' as MainCategory
    },
    {
      id: 'pharmacy-meds',
      name: 'Pharmacy & Wellness',
      nameBn: 'ফার্মেসি ও জরুরি ওষুধ',
      subtitle: 'Rx & 10 Min First-Aid',
      subtitleBn: '১০ মিনিটে ফার্স্ট এইড',
      image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=350&auto=format&fit=crop&q=80',
      category: 'pharmacy' as MainCategory
    }
  ];

  // Featured Top Deals products
  const dealsProducts = products.filter(p => p.discount >= 10).slice(0, 8);

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      {/* 0. Real-Time Live Location & Quick Commerce Hub Card */}
      <HomeLiveLocationCard onOpenLocationModal={onOpenLocation} />

      {/* 1. Blinkit-Style Top Search Bar */}
      <div 
        id="blinkit-home-search-bar"
        onClick={onOpenSearch}
        className="bg-white border border-slate-200/90 hover:border-emerald-500 rounded-2xl shadow-xs px-4 py-3 sm:py-3.5 flex items-center justify-between gap-3 cursor-pointer transition-all duration-200 group hover:shadow-md"
      >
        <div className="flex items-center gap-3 flex-1 overflow-hidden">
          <Search size={20} className="text-slate-700 shrink-0 group-hover:text-emerald-600 transition-colors" />
          <div className="text-sm font-medium text-slate-500 truncate transition-all">
            {activePlaceholder}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-px h-5 bg-slate-200"></div>
          <button 
            type="button" 
            className="p-1 text-slate-700 hover:text-emerald-600 transition cursor-pointer"
            title="Voice Search"
          >
            <Mic size={20} />
          </button>
        </div>
      </div>

      {/* 2. Top Navigation Icons Ribbon */}
      <div className="flex items-center gap-4 sm:gap-6 overflow-x-auto pb-1 no-scrollbar border-b border-slate-100 px-1">
        {quickTabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => {
                if (tab.category) {
                  onSelectCategory(tab.category);
                }
              }}
              className="flex flex-col items-center gap-1 shrink-0 pb-2 relative group cursor-pointer"
            >
              <div className="relative">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${tab.active ? 'bg-slate-900 text-white shadow-xs' : 'bg-slate-100 text-slate-700 group-hover:bg-slate-200'}`}>
                  <Icon size={18} />
                </div>
                {tab.isNew && (
                  <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[9px] font-black px-1.5 py-0.2 rounded-full ring-2 ring-white">
                    New
                  </span>
                )}
              </div>
              <span className={`text-xs whitespace-nowrap transition-colors ${tab.active ? 'font-black text-slate-900' : 'font-semibold text-slate-600 group-hover:text-slate-900'}`}>
                {language === 'bn' ? tab.labelBn : tab.label}
              </span>
              {tab.active && (
                <div className="absolute bottom-0 inset-x-2 h-0.5 bg-slate-900 rounded-full"></div>
              )}
            </button>
          );
        })}
      </div>

      {/* 3. Section 1: Grocery & Kitchen */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
            {language === 'bn' ? 'Grocery & Kitchen (মুদি ও রান্নাঘর)' : 'Grocery & Kitchen'}
          </h2>
          <button
            onClick={() => onSelectCategory('grocery')}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-0.5 cursor-pointer"
          >
            <span>{language === 'bn' ? 'সব দেখুন' : 'See All'}</span>
            <ChevronRight size={14} />
          </button>
        </div>

        {/* 4-column Grid exactly matching the user's screenshot */}
        <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2.5 sm:gap-3.5">
          {groceryTiles.map((tile) => (
            <div
              key={tile.id}
              onClick={() => onSelectCategory(tile.category, tile.subcategory)}
              className="group cursor-pointer flex flex-col items-center"
            >
              {/* Soft Ice-Blue Rounded Card Container */}
              <div className="w-full aspect-square bg-[#eef5fb] hover:bg-[#e4eff9] border border-slate-100/90 rounded-2xl p-2 sm:p-2.5 flex items-center justify-center overflow-hidden shadow-2xs hover:shadow-md transition-all duration-200 group-hover:scale-105">
                <img
                  src={tile.image}
                  alt={tile.name}
                  className="w-full h-full object-cover rounded-xl group-hover:scale-105 transition-transform duration-200"
                  loading="lazy"
                />
              </div>

              {/* Title Underneath */}
              <h3 className="text-center font-bold text-[11px] sm:text-xs text-slate-800 group-hover:text-emerald-800 line-clamp-2 mt-1.5 leading-tight px-0.5">
                {language === 'bn' ? tile.nameBn : tile.name}
              </h3>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Section 2: Snacks & Drinks */}
      <section className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
            {language === 'bn' ? 'Snacks & Drinks (স্ন্যাক্স ও পানীয়)' : 'Snacks & Drinks'}
          </h2>
          <button
            onClick={() => onSelectCategory('chips-namkeen')}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-0.5 cursor-pointer"
          >
            <span>{language === 'bn' ? 'সব দেখুন' : 'See All'}</span>
            <ChevronRight size={14} />
          </button>
        </div>

        {/* 4-column Grid matching the user's screenshot */}
        <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2.5 sm:gap-3.5">
          {snacksTiles.map((tile) => (
            <div
              key={tile.id}
              onClick={() => onSelectCategory(tile.category, tile.subcategory)}
              className="group cursor-pointer flex flex-col items-center"
            >
              {/* Soft Ice-Blue Rounded Card Container */}
              <div className="w-full aspect-square bg-[#eef5fb] hover:bg-[#e4eff9] border border-slate-100/90 rounded-2xl p-2 sm:p-2.5 flex items-center justify-center overflow-hidden shadow-2xs hover:shadow-md transition-all duration-200 group-hover:scale-105">
                <img
                  src={tile.image}
                  alt={tile.name}
                  className="w-full h-full object-cover rounded-xl group-hover:scale-105 transition-transform duration-200"
                  loading="lazy"
                />
              </div>

              {/* Title Underneath */}
              <h3 className="text-center font-bold text-[11px] sm:text-xs text-slate-800 group-hover:text-emerald-800 line-clamp-2 mt-1.5 leading-tight px-0.5">
                {language === 'bn' ? tile.nameBn : tile.name}
              </h3>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Section 3: Liquers & Hard drinks (21+) */}
      <section className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
              {language === 'bn' ? 'Liquers & Hard drinks (লিকার ও হার্ড ড্রিঙ্কস)' : 'Liquers & Hard drinks'}
            </h2>
            <span className="bg-purple-100 text-purple-900 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
              21+ Only
            </span>
          </div>
          <button
            onClick={() => onSelectCategory('liquor')}
            className="text-xs font-bold text-purple-800 hover:text-purple-900 flex items-center gap-0.5 cursor-pointer"
          >
            <span>{language === 'bn' ? 'সব দেখুন' : 'See All'}</span>
            <ChevronRight size={14} />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3.5">
          {liquorTiles.map((tile) => (
            <div
              key={tile.id}
              onClick={() => onSelectCategory(tile.category, tile.subcategory)}
              className="group cursor-pointer flex flex-col items-center"
            >
              <div className="w-full aspect-square bg-[#fbf6ff] hover:bg-[#f5ecfd] border border-purple-100 rounded-2xl p-2 sm:p-2.5 flex items-center justify-center overflow-hidden shadow-2xs hover:shadow-md transition-all duration-200 group-hover:scale-105">
                <img
                  src={tile.image}
                  alt={tile.name}
                  className="w-full h-full object-cover rounded-xl group-hover:scale-105 transition-transform duration-200"
                  loading="lazy"
                />
              </div>

              <h3 className="text-center font-bold text-[11px] sm:text-xs text-slate-800 group-hover:text-purple-900 line-clamp-2 mt-1.5 leading-tight px-0.5">
                {language === 'bn' ? tile.nameBn : tile.name}
              </h3>
            </div>
          ))}
        </div>
      </section>

      {/* 6. Section 4: Quick City Services & Technicians */}
      <section className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
              {language === 'bn' ? 'Customar Super Services (কাস্টমার সার্ভিসেস)' : 'Customar Super Services'}
            </h2>
            <span className="bg-emerald-100 text-emerald-900 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
              10-15 Mins
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3.5">
          {serviceTiles.map((tile) => (
            <div
              key={tile.id}
              onClick={() => onSelectCategory(tile.category)}
              className="group cursor-pointer bg-white border border-slate-200 hover:border-emerald-500 rounded-2xl p-3 shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col justify-between"
            >
              <div className="aspect-video w-full rounded-xl overflow-hidden bg-slate-100 mb-2">
                <img
                  src={tile.image}
                  alt={tile.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  loading="lazy"
                />
              </div>
              <div>
                <h3 className="font-black text-xs text-slate-900 group-hover:text-emerald-700 truncate">
                  {language === 'bn' ? tile.nameBn : tile.name}
                </h3>
                <p className="text-[10px] text-emerald-600 font-bold mt-0.5">
                  {language === 'bn' ? tile.subtitleBn : tile.subtitle}
                </p>
              </div>
              <div className="mt-2 pt-1.5 border-t border-slate-100 flex items-center justify-between text-[10px] font-bold text-slate-500 group-hover:text-emerald-700">
                <span>{language === 'bn' ? 'বুক করুন' : 'Book Now'}</span>
                <ChevronRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 7. Section 5: Bestseller Flash Deals (Blinkit style product cards with instant ADD) */}
      <section className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-amber-500 text-white rounded-lg">
              <Tag size={16} />
            </span>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                {language === 'bn' ? 'সেরা অফার ও ছাড় (Top Deals)' : 'Bestseller Daily Essentials'}
              </h2>
              <p className="text-xs text-slate-500">
                {language === 'bn' ? '১০-১৫ মিনিটে সরাসরি আপনার ঘরে পৌঁছে যাবে' : 'Handpicked daily needs delivered in 10-15 minutes'}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-3">
          {dealsProducts.map((product) => {
            const inCart = cart.find(ci => ci.product.id === product.id);
            const cartQty = inCart ? inCart.quantity : 0;

            return (
              <div
                key={product.id}
                className="bg-white border border-slate-200/90 hover:border-emerald-400 rounded-2xl p-3 flex flex-col justify-between transition-all duration-200 shadow-2xs hover:shadow-md group"
              >
                {/* Image & Badges */}
                <div 
                  onClick={() => onSelectProduct(product)}
                  className="cursor-pointer relative"
                >
                  <div className="aspect-square bg-slate-50 rounded-xl p-2 flex items-center justify-center overflow-hidden mb-2">
                    <img 
                      src={product.image} 
                      alt={product.name} 
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-200" 
                      loading="lazy"
                    />
                  </div>

                  {product.discount > 0 && (
                    <span className="absolute top-1 right-1 bg-emerald-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded-md shadow-xs">
                      {product.discount}% OFF
                    </span>
                  )}

                  {/* Delivery ETA badge */}
                  <div className="flex items-center gap-1 text-[10px] font-bold text-slate-600 bg-slate-100 w-fit px-1.5 py-0.5 rounded-md mb-1">
                    <Clock size={10} className="text-amber-500" />
                    <span>10-15 MINS</span>
                  </div>

                  <h4 className="text-xs font-bold text-slate-900 line-clamp-2 leading-tight">
                    {product.name}
                  </h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">{product.weight}</p>
                </div>

                {/* Price and Add button */}
                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-black text-slate-900">₹{product.price}</div>
                    {product.mrp > product.price && (
                      <div className="text-[10px] text-slate-400 line-through">₹{product.mrp}</div>
                    )}
                  </div>

                  {cartQty > 0 ? (
                    <div className="flex items-center bg-emerald-600 text-white rounded-lg p-0.5 shadow-xs">
                      <button
                        onClick={() => updateCartQuantity(product.id, cartQty - 1)}
                        className="p-1 hover:bg-emerald-700 rounded cursor-pointer"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="px-2 font-bold text-xs">{cartQty}</span>
                      <button
                        onClick={() => updateCartQuantity(product.id, cartQty + 1)}
                        className="p-1 hover:bg-emerald-700 rounded cursor-pointer"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => addToCart(product)}
                      className="px-3 py-1 bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white border border-emerald-300 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Plus size={13} />
                      <span>{language === 'bn' ? 'যোগ' : 'ADD'}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
