import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { MainCategory, Product } from '../../types';
import { CATEGORIES } from '../../data/mockData';
import { CategoryBrowseView } from './CategoryBrowseView';
import { CabsView } from './special/CabsView';
import { PrintsView } from './special/PrintsView';
import { TechniciansView } from './special/TechniciansView';
import { CustomerOrdersView } from './CustomerOrdersView';
import { BlinkitHomeGrid } from './BlinkitHomeGrid';
import { 
  Sparkles, Clock, ShieldCheck, Star, 
  ArrowRight, Store, Tag, Plus, Check, ChevronRight 
} from 'lucide-react';

interface CustomerAppProps {
  onSelectProduct: (product: Product) => void;
  onTrackOrder: (orderId: string) => void;
  onOpenSupportModal: (orderId?: string) => void;
  onOpenCart: () => void;
  onOpenSearch?: () => void;
  onOpenLocation?: () => void;
}

export const CustomerApp: React.FC<CustomerAppProps> = ({
  onSelectProduct, onTrackOrder, onOpenSupportModal, onOpenCart, onOpenSearch, onOpenLocation
}) => {
  const { products, vendors, addToCart, cart, language, t } = useApp();

  const [activeCategory, setActiveCategory] = useState<MainCategory | 'HOME' | 'ORDERS'>('HOME');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | undefined>(undefined);

  const handleSelectCategory = (cat: MainCategory, sub?: string) => {
    setActiveCategory(cat);
    setSelectedSubcategory(sub);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-4 sm:py-6 space-y-8">
      {/* Category Scroller Navigation Ribbon */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs">
          <button
            id="cat-tab-home"
            onClick={() => setActiveCategory('HOME')}
            className={`px-3 py-1.5 rounded-xl font-extrabold transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${activeCategory === 'HOME' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}
          >
            <span>{language === 'bn' ? 'সব ক্যাটাগরি' : 'All Categories'}</span>
          </button>

          <button
            id="cat-tab-orders"
            onClick={() => setActiveCategory('ORDERS')}
            className={`px-3 py-1.5 rounded-xl font-extrabold transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${activeCategory === 'ORDERS' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}
          >
            <span>{language === 'bn' ? 'আমার অর্ডার' : 'My Orders'}</span>
          </button>

          <div className="h-4 w-px bg-slate-300 mx-1 shrink-0"></div>

          {CATEGORIES.map(cat => {
            const isSelected = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                id={`cat-nav-btn-${cat.id}`}
                onClick={() => handleSelectCategory(cat.id, undefined)}
                className={`px-3 py-1.5 rounded-xl font-bold transition whitespace-nowrap cursor-pointer flex items-center gap-2 ${isSelected ? 'bg-emerald-600 text-white shadow-xs' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}
              >
                <div className="flex flex-col items-start text-left leading-tight">
                  <span className="text-xs font-black">
                    {language === 'bn' ? (cat.nameBn || cat.name) : cat.name}
                  </span>
                  {cat.nameBn && (
                    <span className={`text-[10px] font-medium ${isSelected ? 'text-emerald-100' : 'text-slate-500'}`}>
                      {language === 'bn' ? cat.name : cat.nameBn}
                    </span>
                  )}
                </div>
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-normal shrink-0 ${isSelected ? 'bg-emerald-800 text-emerald-100' : 'bg-slate-200 text-slate-600'}`}>
                  {language === 'bn' ? (cat.etaBn || cat.eta) : cat.eta}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main View Router */}
      {activeCategory === 'ORDERS' ? (
        <CustomerOrdersView 
          onTrackOrder={onTrackOrder} 
          onOpenSupportModal={onOpenSupportModal} 
        />
      ) : activeCategory === 'cabs' ? (
        <CabsView />
      ) : activeCategory === 'prints' ? (
        <PrintsView />
      ) : activeCategory === 'technicians' ? (
        <TechniciansView />
      ) : activeCategory !== 'HOME' ? (
        <CategoryBrowseView 
          category={activeCategory} 
          onSelectProduct={onSelectProduct} 
          initialSubcategory={selectedSubcategory}
        />
      ) : (
        /* HOME DASHBOARD VIEW - EXACT BLINKIT STYLE FROM USER SCREENSHOT */
        <BlinkitHomeGrid
          onSelectCategory={handleSelectCategory}
          onSelectProduct={onSelectProduct}
          onOpenSearch={onOpenSearch}
          onOpenLocation={onOpenLocation}
        />
      )}
    </div>
  );
};
