import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { MainCategory, Product } from '../../types';
import { CATEGORIES } from '../../data/mockData';
import { 
  Plus, Minus, Star, ShieldCheck, Clock, 
  AlertTriangle, Check, SlidersHorizontal, ChevronRight
} from 'lucide-react';

interface CategoryBrowseViewProps {
  category: MainCategory;
  onSelectProduct: (product: Product) => void;
  onOpenLiquorWarning?: () => void;
  initialSubcategory?: string;
}

// Subcategory thumbnail photo mapping
const SUBCATEGORY_IMAGES: Record<string, string> = {
  // Grocery
  'Atta': 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=200&auto=format&fit=crop&q=80',
  'Atta, Rice & Dal': 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=200&auto=format&fit=crop&q=80',
  'Rice': 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=200&auto=format&fit=crop&q=80',
  'Dal': 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&auto=format&fit=crop&q=80',
  'Besan, Sooji & Maida': 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=200&auto=format&fit=crop&q=80',
  'Rajma, Chhole & Others': 'https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?w=200&auto=format&fit=crop&q=80',
  'Organic': 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=200&auto=format&fit=crop&q=80',
  'Poha': 'https://images.unsplash.com/photo-1612927601601-6638404737ce?w=200&auto=format&fit=crop&q=80',
  'Oil & Ghee': 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=200&auto=format&fit=crop&q=80',
  'Masala': 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=200&auto=format&fit=crop&q=80',
  'Dairy, Milk & Eggs': 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=200&auto=format&fit=crop&q=80',
  'Bakery & Biscuits': 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=200&auto=format&fit=crop&q=80',
  'Tea, Coffee & Chocolates': 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=200&auto=format&fit=crop&q=80',
  'Instant Food & Sauces': 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=200&auto=format&fit=crop&q=80',
  'Cleaners & Repellents': 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=200&auto=format&fit=crop&q=80',

  // Vegetables & Fruits
  'Vegetables': 'https://images.unsplash.com/photo-1597362077123-53d613959828?w=200&auto=format&fit=crop&q=80',
  'Fruits': 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=200&auto=format&fit=crop&q=80',
  'Seasonal & Exotic': 'https://images.unsplash.com/photo-1528825871115-3581a5387919?w=200&auto=format&fit=crop&q=80',

  // Chips & Namkeen
  'Chips': 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=200&auto=format&fit=crop&q=80',
  'Namkeens': 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=200&auto=format&fit=crop&q=80',

  // Drinks & Juice
  'Cold Drinks': 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=200&auto=format&fit=crop&q=80',
  'Fresh Juice': 'https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=200&auto=format&fit=crop&q=80',

  // Ice Cream
  'Ice Cream': 'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=200&auto=format&fit=crop&q=80',
  'Kulfi': 'https://images.unsplash.com/photo-1579954115545-a95591f28bfc?w=200&auto=format&fit=crop&q=80',
  'Cakes': 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=200&auto=format&fit=crop&q=80',

  // Liquor
  'Whiskey': 'https://images.unsplash.com/photo-1527281400683-1aae777175f8?w=200&auto=format&fit=crop&q=80',
  'Rum': 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=200&auto=format&fit=crop&q=80',
  'Vodka': 'https://images.unsplash.com/photo-1563227812-0ea4c22e6cc8?w=200&auto=format&fit=crop&q=80',
  'Gin': 'https://images.unsplash.com/photo-1608270104113-5a041f92e079?w=200&auto=format&fit=crop&q=80'
};

// Subcategory Bengali translations
const SUBCATEGORY_BN: Record<string, string> = {
  'Atta': 'আটা',
  'Atta, Rice & Dal': 'আটা, চাল ও ডাল',
  'Rice': 'চাল',
  'Dal': 'ডাল',
  'Besan, Sooji & Maida': 'বেসন, সুজি ও ময়দা',
  'Rajma, Chhole & Others': 'রাজমা ও ছোলা',
  'Organic': 'অর্গানিক',
  'Poha': 'পোড়া ও চিঁড়ে',
  'Oil & Ghee': 'তেল ও ঘি',
  'Masala': 'মশলাপাতি',
  'Dairy, Milk & Eggs': 'দুধ, ডিম ও মাখন',
  'Bakery & Biscuits': 'বেকারি ও বিস্কুট',
  'Tea, Coffee & Chocolates': 'চা, কফি ও চকলেট',
  'Instant Food & Sauces': 'ইনস্ট্যান্ট নুডলস ও সস',
  'Cleaners & Repellents': 'ঘর পরিষ্কারক সামগ্রী',
  'Vegetables': 'শাকসবজি',
  'Fruits': 'তাজা ফলমূল',
  'Seasonal & Exotic': 'মৌসুমি ফল',
  'Chips': 'চিপস ও ওয়েফার',
  'Namkeens': 'চানাচুর ও নোনতা',
  'Cold Drinks': 'কোল্ড ড্রিঙ্কস',
  'Fresh Juice': 'তাজা ফলের জুস',
  'Ice Cream': 'আইসক্রিম',
  'Kulfi': 'কুলফি',
  'Cakes': 'কেক ও পেস্ট্রি',
  'Whiskey': 'হুইস্কি',
  'Rum': 'রাম',
  'Vodka': 'ভদকা',
  'Gin': 'জিন ও বিয়ার',
  'First Aid': 'প্রাথমিক চিকিৎসা',
  'Pain Relief': 'ব্যথা উপশম'
};

// Popular brands metadata
const POPULAR_BRANDS: Record<MainCategory, { name: string; logoText: string; color: string }[]> = {
  grocery: [
    { name: 'Aashirvaad', logoText: 'Aashirvaad', color: 'bg-red-50 text-red-700 border-red-200' },
    { name: 'Ganesh', logoText: 'Ganesh', color: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
    { name: 'Whole Farm', logoText: 'Whole Farm', color: 'bg-amber-50 text-amber-900 border-amber-200' },
    { name: 'Fortune', logoText: 'Fortune', color: 'bg-orange-50 text-orange-700 border-orange-200' },
    { name: 'Tata Sampann', logoText: 'Tata', color: 'bg-blue-50 text-blue-800 border-blue-200' },
    { name: 'Amul', logoText: 'Amul', color: 'bg-rose-50 text-rose-700 border-rose-200' },
    { name: 'Everest', logoText: 'Everest', color: 'bg-red-50 text-red-800 border-red-200' },
    { name: 'Rajdhani', logoText: 'Rajdhani', color: 'bg-yellow-50 text-yellow-800 border-yellow-200' }
  ],
  'chips-namkeen': [
    { name: "Lay's", logoText: "Lay's", color: 'bg-blue-50 text-blue-700 border-blue-200' },
    { name: 'Haldiram', logoText: 'Haldirams', color: 'bg-amber-50 text-amber-800 border-amber-200' },
    { name: 'Kurkure', logoText: 'Kurkure', color: 'bg-orange-50 text-orange-700 border-orange-200' },
    { name: 'Doritos', logoText: 'Doritos', color: 'bg-red-50 text-red-700 border-red-200' }
  ],
  'drinks-juice': [
    { name: 'Coca-Cola', logoText: 'Coca-Cola', color: 'bg-red-50 text-red-700 border-red-200' },
    { name: 'Real', logoText: 'Real', color: 'bg-green-50 text-green-700 border-green-200' },
    { name: 'Frooti', logoText: 'Frooti', color: 'bg-yellow-50 text-yellow-800 border-yellow-200' },
    { name: 'Thums Up', logoText: 'Thums Up', color: 'bg-blue-50 text-blue-900 border-blue-200' }
  ],
  'ice-cream': [
    { name: 'Amul', logoText: 'Amul', color: 'bg-rose-50 text-rose-700 border-rose-200' },
    { name: 'Kwality Walls', logoText: "Kwality", color: 'bg-red-50 text-red-700 border-red-200' },
    { name: 'Vadilal', logoText: 'Vadilal', color: 'bg-amber-50 text-amber-800 border-amber-200' },
    { name: 'Havmor', logoText: 'Havmor', color: 'bg-orange-50 text-orange-700 border-orange-200' }
  ],
  liquor: [
    { name: 'Royal Challenge', logoText: 'RC', color: 'bg-purple-50 text-purple-900 border-purple-200' },
    { name: 'McDowells', logoText: 'McD', color: 'bg-red-50 text-red-900 border-red-200' },
    { name: 'Kingfisher', logoText: 'Kingfisher', color: 'bg-blue-50 text-blue-900 border-blue-200' },
    { name: 'Old Monk', logoText: 'Old Monk', color: 'bg-amber-50 text-amber-950 border-amber-200' }
  ],
  'vegetables-fruits': [
    { name: 'Farm Fresh', logoText: 'Farm Fresh', color: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
    { name: 'Organic India', logoText: 'Organic', color: 'bg-green-50 text-green-800 border-green-200' }
  ],
  cosmetics: [
    { name: 'Nivea', logoText: 'Nivea', color: 'bg-blue-50 text-blue-800 border-blue-200' },
    { name: 'Himalaya', logoText: 'Himalaya', color: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
    { name: 'Dove', logoText: 'Dove', color: 'bg-indigo-50 text-indigo-800 border-indigo-200' }
  ],
  pharmacy: [
    { name: 'Dabur', logoText: 'Dabur', color: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
    { name: 'Cipla', logoText: 'Cipla', color: 'bg-blue-50 text-blue-800 border-blue-200' },
    { name: 'Dettol', logoText: 'Dettol', color: 'bg-green-50 text-green-800 border-green-200' }
  ],
  'fresh-foods': [],
  'fresh-fish-meats': [
    { name: 'FreshCatch', logoText: 'FreshCatch', color: 'bg-blue-50 text-blue-800 border-blue-200' },
    { name: 'Licious', logoText: 'Licious', color: 'bg-red-50 text-red-700 border-red-200' }
  ],
  cabs: [],
  prints: [],
  technicians: []
};

export const CategoryBrowseView: React.FC<CategoryBrowseViewProps> = ({ 
  category, onSelectProduct, initialSubcategory 
}) => {
  const { products, cart, addToCart, updateCartQuantity, language, t } = useApp();

  const categoryMeta = CATEGORIES.find(c => c.id === category) || CATEGORIES[0];
  
  // Build full subcategory list for this category
  const subcategoryList = useMemo(() => {
    if (category === 'grocery') {
      return [
        'Atta, Rice & Dal',
        'Oil & Ghee',
        'Masala',
        'Dairy, Milk & Eggs',
        'Bakery & Biscuits',
        'Tea, Coffee & Chocolates',
        'Instant Food & Sauces',
        'Cleaners & Repellents'
      ];
    }
    return categoryMeta.subcategories || ['All'];
  }, [category, categoryMeta]);

  const [selectedSubcategory, setSelectedSubcategory] = useState<string>(initialSubcategory || subcategoryList[0] || 'All');
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'popular' | 'price_asc' | 'price_desc' | 'discount'>('popular');
  const [vegOnly, setVegOnly] = useState<boolean>(false);

  // Sync if initialSubcategory changes
  useEffect(() => {
    if (initialSubcategory) {
      setSelectedSubcategory(initialSubcategory);
    } else if (subcategoryList.length > 0 && selectedSubcategory === 'All') {
      setSelectedSubcategory(subcategoryList[0]);
    }
  }, [initialSubcategory, subcategoryList, selectedSubcategory]);

  // Filter products belonging to this category and active subcategory
  const filteredProducts = useMemo(() => {
    let list = products.filter(p => p.category === category);

    if (selectedSubcategory && selectedSubcategory !== 'All') {
      list = list.filter(p => {
        if (p.subcategory === selectedSubcategory) return true;
        // Handle variations like Atta / Rice / Dal matching Atta, Rice & Dal
        if (selectedSubcategory === 'Atta, Rice & Dal' && (p.subcategory.includes('Atta') || p.subcategory.includes('Rice') || p.subcategory.includes('Dal'))) {
          return true;
        }
        return false;
      });
    }

    if (selectedBrand) {
      list = list.filter(p => p.brand.toLowerCase() === selectedBrand.toLowerCase());
    }

    if (vegOnly) {
      list = list.filter(p => p.isVeg === true);
    }

    // Sorting
    return list.sort((a, b) => {
      if (sortBy === 'price_asc') return a.price - b.price;
      if (sortBy === 'price_desc') return b.price - a.price;
      if (sortBy === 'discount') return b.discount - a.discount;
      return b.rating - a.rating;
    });
  }, [products, category, selectedSubcategory, selectedBrand, vegOnly, sortBy]);

  const brands = POPULAR_BRANDS[category] || [];

  // Title formatting matching screenshot
  const displayTitle = useMemo(() => {
    if (selectedSubcategory && selectedSubcategory !== 'All') {
      if (category === 'grocery' && selectedSubcategory === 'Atta, Rice & Dal') {
        return language === 'bn' ? 'Atta, Rice, Dal & More (আটা, চাল, ডাল ও অন্যান্য)' : 'Atta, Rice, Dal & More';
      }
      const bn = SUBCATEGORY_BN[selectedSubcategory];
      return language === 'bn' && bn ? `${selectedSubcategory} (${bn})` : selectedSubcategory;
    }
    return language === 'bn' ? (categoryMeta.nameBn || categoryMeta.name) : categoryMeta.name;
  }, [selectedSubcategory, category, categoryMeta, language]);

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
      {/* 1. Header Bar matching Blinkit style */}
      <div className="px-4 sm:px-6 py-3.5 border-b border-slate-100 flex items-center justify-between gap-3 bg-white sticky top-0 z-20">
        <div>
          <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>{displayTitle}</span>
          </h1>
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium mt-0.5">
            <span className="flex items-center gap-1 text-emerald-700 font-bold">
              <Clock size={12} className="text-emerald-600" />
              <span>{language === 'bn' ? '৯-১০ মিনিটে ডেলিভারি' : '9-10 Mins Delivery'}</span>
            </span>
            <span>•</span>
            <span>{filteredProducts.length} {language === 'bn' ? 'টি আইটেম' : 'items'}</span>
            {selectedBrand && (
              <button 
                onClick={() => setSelectedBrand(null)}
                className="text-xs text-red-600 hover:underline font-bold ml-1"
              >
                (Clear {selectedBrand})
              </button>
            )}
          </div>
        </div>

        {/* Filter & Veg toggle controls */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <label className="flex items-center gap-1.5 cursor-pointer bg-slate-50 hover:bg-slate-100 px-2.5 py-1 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 select-none transition">
            <input 
              type="checkbox" 
              checked={vegOnly} 
              onChange={(e) => setVegOnly(e.target.checked)} 
              className="accent-emerald-600 rounded cursor-pointer"
            />
            <div className="w-3 h-3 rounded-xs border border-emerald-600 flex items-center justify-center bg-white">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-600"></div>
            </div>
            <span className="hidden sm:inline text-emerald-800">Veg Only</span>
          </label>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-2 py-1 text-xs text-slate-800 font-bold outline-none cursor-pointer hover:bg-slate-100 transition"
          >
            <option value="popular">{language === 'bn' ? 'শীর্ষ রেটেড' : 'Top Rated'}</option>
            <option value="price_asc">{language === 'bn' ? 'দাম: কম থেকে বেশি' : 'Price: Low to High'}</option>
            <option value="price_desc">{language === 'bn' ? 'দাম: বেশি থেকে কম' : 'Price: High to Low'}</option>
            <option value="discount">{language === 'bn' ? 'সর্বোচ্চ ছাড়' : 'Highest Discount'}</option>
          </select>
        </div>
      </div>

      {/* Compliance / Safety Alerts */}
      {category === 'pharmacy' && (
        <div className="mx-4 my-3 p-3 bg-amber-50 border border-amber-300 rounded-2xl flex items-start gap-2.5 text-xs text-amber-900">
          <AlertTriangle size={18} className="text-amber-600 shrink-0 mt-0.5" />
          <div>
            <strong className="font-bold">
              {language === 'bn' ? 'লাইসেন্সপ্রাপ্ত রেজিস্টার্ড ফার্মেসি: ' : 'Registered Pharmacy Network: '}
            </strong>
            {language === 'bn' 
              ? 'সকল ওষুধ রেজিস্টার্ড ফার্মাসিস্ট দ্বারা ডিসপেন্স করা হয়।' 
              : 'All medicines are dispensed by licensed pharmacists.'}
          </div>
        </div>
      )}

      {category === 'liquor' && (
        <div className="mx-4 my-3 p-3 bg-purple-50 border border-purple-200 rounded-2xl flex items-start gap-2.5 text-xs text-purple-900">
          <ShieldCheck size={18} className="text-purple-700 shrink-0 mt-0.5" />
          <div>
            <strong className="font-bold">
              {language === 'bn' ? 'বিধিবদ্ধ মদ্যপান বয়স সতর্কবার্তা (২১+): ' : 'Statutory Legal Drinking Age Warning (21+): '}
            </strong>
            {language === 'bn'
              ? 'শুধুমাত্র ২১ বছর বা তার বেশি বয়সীদের জন্য প্রযোজ্য। সরকারি সচিত্র পরিচয়পত্র (Photo ID) আবশ্যক।'
              : 'Sales restricted to adults aged 21 years and above. Government photo ID required at delivery.'}
          </div>
        </div>
      )}

      {/* 2. Main Two-Column Layout (Left Subcategory Rail + Right Product Grid) */}
      <div className="flex min-h-[650px] bg-white">
        {/* LEFT VERTICAL SUBCATEGORY RAIL (Exact match to screenshot) */}
        <aside className="w-20 sm:w-24 shrink-0 bg-[#f8fafc] border-r border-slate-200/80 py-2 flex flex-col gap-1 overflow-y-auto max-h-[85vh] no-scrollbar select-none">
          {subcategoryList.map((subName) => {
            const isSelected = selectedSubcategory === subName;
            const subImage = SUBCATEGORY_IMAGES[subName] || SUBCATEGORY_IMAGES['Atta'];
            const subBn = SUBCATEGORY_BN[subName];

            // Shorter display label for left rail
            let shortLabel = subName;
            if (subName === 'Atta, Rice & Dal') shortLabel = 'Atta';
            else if (subName === 'Dairy, Milk & Eggs') shortLabel = 'Dairy';
            else if (subName === 'Bakery & Biscuits') shortLabel = 'Bakery';
            else if (subName === 'Tea, Coffee & Chocolates') shortLabel = 'Tea & Coffee';
            else if (subName === 'Instant Food & Sauces') shortLabel = 'Instant';
            else if (subName === 'Cleaners & Repellents') shortLabel = 'Cleaners';

            return (
              <button
                key={subName}
                onClick={() => {
                  setSelectedSubcategory(subName);
                  setSelectedBrand(null);
                }}
                className={`py-2 px-1 flex flex-col items-center justify-center transition-all cursor-pointer relative group ${isSelected ? 'bg-white font-black text-slate-900' : 'hover:bg-slate-100/80 text-slate-600'}`}
              >
                {/* Active indicator bar on right edge matching screenshot */}
                {isSelected && (
                  <div className="absolute right-0 inset-y-1 w-1 bg-emerald-600 rounded-l-md"></div>
                )}

                {/* Circular image thumbnail */}
                <div className={`w-13 h-13 sm:w-15 sm:h-15 rounded-full p-0.5 flex items-center justify-center overflow-hidden transition-all duration-200 ${isSelected ? 'ring-2 ring-emerald-600 ring-offset-1 shadow-xs scale-105 bg-white' : 'bg-white border border-slate-200/90 group-hover:scale-105'}`}>
                  <img
                    src={subImage}
                    alt={subName}
                    className="w-full h-full object-cover rounded-full"
                    loading="lazy"
                  />
                </div>

                {/* Subcategory Label underneath */}
                <span className={`text-[10px] sm:text-[11px] text-center leading-tight mt-1 line-clamp-2 px-0.5 ${isSelected ? 'font-black text-slate-900' : 'font-semibold text-slate-600'}`}>
                  {language === 'bn' && subBn ? subBn : shortLabel}
                </span>
              </button>
            );
          })}
        </aside>

        {/* RIGHT MAIN AREA (Product Grid + Shop By Brands) */}
        <main className="flex-1 p-3 sm:p-5 overflow-y-auto max-h-[85vh]">
          {filteredProducts.length === 0 ? (
            <div className="p-12 text-center bg-slate-50 rounded-2xl border border-slate-200 text-slate-400 text-xs">
              {language === 'bn' ? 'কোনো পণ্য পাওয়া যায়নি।' : 'No items match your filter criteria in this category.'}
            </div>
          ) : (
            /* 2-Column Product Cards Grid (Matching screenshot) */
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3.5">
              {filteredProducts.map((product) => {
                const inCart = cart.find(ci => ci.product.id === product.id);
                const cartQty = inCart ? inCart.quantity : 0;

                return (
                  <div
                    key={product.id}
                    id={`product-card-${product.id}`}
                    className="bg-white rounded-2xl border border-slate-200/90 hover:border-slate-300 p-2.5 sm:p-3 flex flex-col justify-between hover:shadow-md transition-all duration-200 relative group"
                  >
                    {/* Top: Product Image Area */}
                    <div>
                      <div 
                        onClick={() => onSelectProduct(product)}
                        className="aspect-square bg-[#fbfcfe] rounded-xl p-2 flex items-center justify-center relative overflow-hidden mb-2 cursor-pointer"
                      >
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-200"
                          loading="lazy"
                        />

                        {/* Veg / Non-Veg Icon in bottom-right matching screenshot */}
                        {product.isVeg !== undefined && (
                          <div className="absolute bottom-1.5 right-1.5">
                            <div className={`w-3.5 h-3.5 rounded-xs border flex items-center justify-center bg-white shadow-2xs ${product.isVeg ? 'border-emerald-600' : 'border-red-600'}`}>
                              <div className={`w-1.5 h-1.5 rounded-full ${product.isVeg ? 'bg-emerald-600' : 'bg-red-600'}`}></div>
                            </div>
                          </div>
                        )}

                        {/* Carousel dots indicator at bottom-left */}
                        <div className="absolute bottom-1.5 left-2 flex items-center gap-0.5 opacity-60">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-800"></span>
                          <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                          <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                        </div>
                      </div>

                      {/* Weight Pill & ADD Button row (matching screenshot) */}
                      <div className="flex items-center justify-between gap-1.5 mb-2">
                        {/* Weight pill */}
                        <div className="bg-slate-100 text-slate-700 font-bold text-[11px] sm:text-xs px-2 sm:px-2.5 py-1 rounded-lg border border-slate-200/60 shrink-0">
                          {product.weight}
                        </div>

                        {/* ADD Button or Counter */}
                        {product.stock <= 0 ? (
                          <span className="text-[10px] text-red-500 font-bold bg-red-50 px-2 py-1 rounded-lg">
                            {language === 'bn' ? 'স্টক শেষ' : 'Sold Out'}
                          </span>
                        ) : cartQty > 0 ? (
                          <div className="flex items-center bg-emerald-600 text-white rounded-xl shadow-xs py-0.5 px-1">
                            <button
                              id={`grid-dec-${product.id}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                updateCartQuantity(product.id, cartQty - 1);
                              }}
                              className="p-1 hover:bg-emerald-700 rounded cursor-pointer"
                            >
                              <Minus size={12} />
                            </button>
                            <span className="px-1.5 font-black text-xs">{cartQty}</span>
                            <button
                              id={`grid-inc-${product.id}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                updateCartQuantity(product.id, cartQty + 1);
                              }}
                              className="p-1 hover:bg-emerald-700 rounded cursor-pointer"
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                        ) : (
                          <button
                            id={`add-product-grid-btn-${product.id}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              addToCart(product);
                            }}
                            className="border-2 border-emerald-600 text-emerald-700 font-black text-xs px-3 sm:px-4 py-1 rounded-xl bg-white hover:bg-emerald-50 active:scale-95 shadow-2xs transition flex flex-col items-center justify-center min-w-[58px] cursor-pointer"
                          >
                            <span>{language === 'bn' ? 'যোগ' : 'ADD'}</span>
                            {product.optionsCount && product.optionsCount > 1 ? (
                              <span className="text-[8.5px] text-slate-500 font-medium leading-none mt-0.5">
                                {product.optionsCount} options
                              </span>
                            ) : null}
                          </button>
                        )}
                      </div>

                      {/* Per Unit Rate (e.g. ₹39.4/kg) */}
                      {product.perUnitRate && (
                        <div className="text-[10.5px] text-slate-500 font-medium leading-tight">
                          {product.perUnitRate}
                        </div>
                      )}

                      {/* Price & Discount Info */}
                      <div className="flex items-baseline gap-1.5 mt-0.5 flex-wrap">
                        <span className="text-base sm:text-lg font-black text-slate-900">
                          ₹{product.price}
                        </span>
                        {product.mrp > product.price && (
                          <span className="text-xs text-slate-400 font-medium line-through">
                            ₹{product.mrp}
                          </span>
                        )}
                      </div>

                      {/* Discount Tag in electric blue (matching screenshot) */}
                      {product.discount > 0 && (
                        <div className="text-[11px] font-extrabold text-blue-600 tracking-tight leading-tight mt-0.5">
                          {product.discount}% OFF on MRP
                        </div>
                      )}

                      {/* Product Title */}
                      <h3 
                        onClick={() => onSelectProduct(product)}
                        className="text-xs sm:text-[13px] font-bold text-slate-900 line-clamp-2 leading-snug mt-1 cursor-pointer hover:text-emerald-700 transition-colors"
                      >
                        {product.name}
                      </h3>

                      {/* Feature Tag (e.g. No Maida, 100% Whole Wheat) */}
                      {product.featureTag && (
                        <div className="bg-amber-50 text-amber-800 border border-amber-200/90 text-[10px] font-bold px-1.5 py-0.5 rounded-md w-fit mt-1.5">
                          {product.featureTag}
                        </div>
                      )}
                    </div>

                    {/* Bottom: Ratings & Delivery ETA */}
                    <div className="mt-2 pt-2 border-t border-slate-100">
                      {/* Star Rating with Review count */}
                      <div className="flex items-center gap-1 text-[10px] sm:text-[11px] text-amber-500 font-bold">
                        <div className="flex items-center">
                          <Star size={10} className="fill-amber-400 text-amber-400" />
                          <Star size={10} className="fill-amber-400 text-amber-400" />
                          <Star size={10} className="fill-amber-400 text-amber-400" />
                          <Star size={10} className="fill-amber-400 text-amber-400" />
                          <Star size={10} className="fill-amber-400 text-amber-400" />
                        </div>
                        <span className="text-slate-500 font-medium">
                          {product.ratingCount > 1000 
                            ? `${(product.ratingCount / 100000).toFixed(1)} lac` 
                            : product.ratingCount.toLocaleString()}
                        </span>
                      </div>

                      {/* ETA Delivery badge */}
                      <div className="flex items-center gap-1 text-[10px] text-slate-500 font-medium mt-0.5">
                        <Clock size={10} className="text-slate-400" />
                        <span>{language === 'bn' ? '৯ মিনিটে ডেলিভারি' : '9 mins'}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* 3. "Shop by brands" Section (matching screenshot bottom section) */}
          {brands.length > 0 && (
            <div className="mt-8 pt-6 border-t border-slate-100 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                  {language === 'bn' ? 'শীর্ষ ব্র্যান্ডসমূহ (Shop by brands)' : 'Shop by brands'}
                </h2>
                {selectedBrand && (
                  <button
                    onClick={() => setSelectedBrand(null)}
                    className="text-xs font-bold text-emerald-700 hover:underline cursor-pointer"
                  >
                    {language === 'bn' ? 'সব ব্র্যান্ড দেখুন' : 'Show All Brands'}
                  </button>
                )}
              </div>

              <div className="flex items-center gap-3 overflow-x-auto pb-2 no-scrollbar">
                {brands.map((brand) => {
                  const isBrandActive = selectedBrand?.toLowerCase() === brand.name.toLowerCase();
                  return (
                    <button
                      key={brand.name}
                      onClick={() => {
                        setSelectedBrand(isBrandActive ? null : brand.name);
                      }}
                      className={`w-20 h-20 sm:w-22 sm:h-22 rounded-2xl border p-2 flex flex-col items-center justify-center shrink-0 shadow-2xs hover:shadow-md transition-all duration-200 cursor-pointer ${isBrandActive ? 'border-emerald-600 ring-2 ring-emerald-600 bg-emerald-50/50' : 'border-slate-200 bg-white hover:scale-105'}`}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-[11px] font-black tracking-tight border ${brand.color} shadow-2xs`}>
                        {brand.logoText.slice(0, 7)}
                      </div>
                      <span className="text-[10px] font-bold text-slate-700 truncate w-full text-center mt-1">
                        {brand.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
