import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Product } from '../../types';
import { X, Star, ShieldCheck, Clock, Plus, Minus, Check, AlertTriangle, FileText, ShoppingBag } from 'lucide-react';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onSelectProduct: (p: Product) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ 
  product, onClose, onSelectProduct 
}) => {
  const { cart, addToCart, updateCartQuantity, products, language, t } = useApp();

  const [selectedSize, setSelectedSize] = useState<string>('250 ml');
  const [selectedSugar, setSelectedSugar] = useState<'Normal' | 'Less' | 'No Sugar'>('Normal');
  const [selectedIce, setSelectedIce] = useState<'Normal' | 'Less' | 'No Ice'>('Normal');
  const [selectedCut, setSelectedCut] = useState<'Curry Cut' | 'Small Pieces' | 'Large Pieces' | 'Boneless'>('Curry Cut');
  const [selectedCleaning, setSelectedCleaning] = useState<'Cleaned' | 'Uncleaned'>('Cleaned');
  const [prescriptionFile, setPrescriptionFile] = useState<string | null>(null);

  if (!product) return null;

  const inCart = cart.find(ci => ci.product.id === product.id);
  const cartQty = inCart ? inCart.quantity : 0;

  // Calculate dynamic price based on size if juice/drink options exist
  let displayPrice = product.price || 0;
  if (product.sizeOptions && product.sizeOptions.length > 0) {
    const matchedSize = product.sizeOptions.find(s => s.label === selectedSize);
    if (matchedSize) {
      displayPrice = Math.round((product.price || 0) * (Number(matchedSize.priceMultiplier) || 1));
    }
  }
  if (!Number.isFinite(displayPrice)) {
    displayPrice = product.price || 0;
  }

  const relatedProducts = products
    .filter(p => p.subcategory === product.subcategory && p.id !== product.id)
    .slice(0, 3);

  const handleAddToCart = () => {
    addToCart(product, {
      selectedSize: product.sizeOptions ? selectedSize : undefined,
      selectedSugar: product.sugarOptions ? selectedSugar : undefined,
      selectedIce: product.iceOptions ? selectedIce : undefined,
      selectedCut: product.meatCutOptions ? selectedCut : undefined,
      selectedCleaning: product.cleaningOptions ? selectedCleaning : undefined,
      prescriptionUrl: prescriptionFile || undefined
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            {product.category.replace(/-/g, ' ')} • {product.subcategory}
          </span>
          <button 
            id="close-product-detail-modal"
            onClick={onClose} 
            className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto p-5 space-y-5">
          {/* Main Visual & Badges */}
          <div className="relative rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 flex items-center justify-center p-4">
            <img 
              src={product.image} 
              alt={product.name} 
              className="max-h-64 object-contain rounded-xl hover:scale-105 transition-transform duration-300"
            />
            
            {/* Top Overlay Badges */}
            <div className="absolute top-3 left-3 flex flex-col gap-1.5">
              {product.isVeg !== undefined && (
                <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md border ${product.isVeg ? 'bg-emerald-50 text-emerald-800 border-emerald-300' : 'bg-red-50 text-red-800 border-red-300'}`}>
                  <span className={`w-2 h-2 rounded-full ${product.isVeg ? 'bg-emerald-600' : 'bg-red-600'}`}></span>
                  {product.isVeg ? '100% Veg' : 'Non-Veg'}
                </span>
              )}
              {product.freshnessDays && (
                <span className="bg-green-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                  Freshness: {product.freshnessDays} Days
                </span>
              )}
              {product.alcoholByVolume && (
                <span className="bg-purple-900 text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                  {product.alcoholByVolume} • 21+ Only
                </span>
              )}
            </div>

            <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-xs px-2 py-1 rounded-lg border border-slate-200 text-xs font-bold text-slate-700 flex items-center gap-1 shadow-xs">
              <Star size={13} className="text-amber-500 fill-amber-500" />
              <span>{product.rating}</span>
              <span className="text-slate-400 font-normal">({product.ratingCount})</span>
            </div>
          </div>

          {/* Title & Brand */}
          <div>
            <div className="text-xs font-semibold text-emerald-700 tracking-wide">{product.brand}</div>
            <h2 className="text-lg font-bold text-slate-900 mt-0.5">{product.name}</h2>
            <div className="text-xs text-slate-500 mt-0.5">
              Sold by: <strong className="text-slate-800">{product.vendorName}</strong> • {product.weight}
            </div>

            {/* Price & Discounts */}
            <div className="flex items-center gap-3 mt-3">
              <span className="text-2xl font-black text-slate-900">₹{displayPrice}</span>
              {product.mrp > displayPrice && (
                <span className="text-sm text-slate-400 line-through">MRP ₹{product.mrp}</span>
              )}
              <span className="text-xs font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md">
                {product.discount}% OFF
              </span>
              <span className="ml-auto text-xs text-slate-400">Inclusive of all taxes</span>
            </div>
          </div>

          {/* Description */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
            <h4 className="text-xs font-bold text-slate-700 mb-1">Product Description</h4>
            <p className="text-xs text-slate-600 leading-relaxed">{product.description}</p>
          </div>

          {/* CUSTOMIZATION SECTION: Fresh Juice / Drinks */}
          {product.sizeOptions && (
            <div className="space-y-3 p-4 bg-cyan-50/50 rounded-xl border border-cyan-200">
              <div className="text-xs font-bold text-cyan-900 flex items-center gap-1">
                <span>Select Juice Size & Preparation</span>
              </div>
              
              {/* Size */}
              <div>
                <span className="text-[11px] font-semibold text-slate-600 block mb-1.5">Size Option:</span>
                <div className="flex gap-2">
                  {product.sizeOptions.map(opt => (
                    <button
                      key={opt.label}
                      onClick={() => setSelectedSize(opt.label)}
                      className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold border transition ${selectedSize === opt.label ? 'bg-cyan-600 text-white border-cyan-600 shadow-xs' : 'bg-white text-slate-700 border-slate-200'}`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sugar Level */}
              {product.sugarOptions && (
                <div>
                  <span className="text-[11px] font-semibold text-slate-600 block mb-1.5">Sugar Level:</span>
                  <div className="flex gap-2">
                    {product.sugarOptions.map(s => (
                      <button
                        key={s}
                        onClick={() => setSelectedSugar(s)}
                        className={`flex-1 py-1 px-2 rounded-lg text-xs font-semibold border ${selectedSugar === s ? 'bg-cyan-700 text-white border-cyan-700' : 'bg-white text-slate-700 border-slate-200'}`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Ice Preference */}
              {product.iceOptions && (
                <div>
                  <span className="text-[11px] font-semibold text-slate-600 block mb-1.5">Ice Level:</span>
                  <div className="flex gap-2">
                    {product.iceOptions.map(ice => (
                      <button
                        key={ice}
                        onClick={() => setSelectedIce(ice)}
                        className={`flex-1 py-1 px-2 rounded-lg text-xs font-semibold border ${selectedIce === ice ? 'bg-cyan-700 text-white border-cyan-700' : 'bg-white text-slate-700 border-slate-200'}`}
                      >
                        {ice}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* CUSTOMIZATION SECTION: Fresh Fish & Meat Cuts */}
          {product.meatCutOptions && (
            <div className="space-y-3 p-4 bg-red-50/50 rounded-xl border border-red-200">
              <div className="text-xs font-bold text-red-900">Customize Cut & Cleaning</div>
              
              {/* Cutting Preference */}
              <div>
                <span className="text-[11px] font-semibold text-slate-600 block mb-1.5">Cutting Preference:</span>
                <div className="flex flex-wrap gap-2">
                  {product.meatCutOptions.map(cut => (
                    <button
                      key={cut}
                      onClick={() => setSelectedCut(cut as any)}
                      className={`py-1 px-3 rounded-lg text-xs font-bold border transition ${selectedCut === cut ? 'bg-red-600 text-white border-red-600' : 'bg-white text-slate-700 border-slate-200'}`}
                    >
                      {cut}
                    </button>
                  ))}
                </div>
              </div>

              {/* Cleaning Preference */}
              {product.cleaningOptions && (
                <div>
                  <span className="text-[11px] font-semibold text-slate-600 block mb-1.5">Cleaning Preference:</span>
                  <div className="flex gap-2">
                    {product.cleaningOptions.map(clean => (
                      <button
                        key={clean}
                        onClick={() => setSelectedCleaning(clean as any)}
                        className={`flex-1 py-1 px-3 rounded-lg text-xs font-bold border transition ${selectedCleaning === clean ? 'bg-red-700 text-white border-red-700' : 'bg-white text-slate-700 border-slate-200'}`}
                      >
                        {clean}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* PHARMACY PRESCRIPTION UPLOAD SAFEGUARD */}
          {product.requiresPrescription && (
            <div className="p-4 bg-amber-50 border border-amber-300 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                <AlertTriangle size={16} className="text-amber-600" />
                Schedule H Rx Medicine (Prescription Mandatory)
              </div>
              <p className="text-[11px] text-amber-800 leading-relaxed">
                As per Drugs & Cosmetics Act regulations, this medicine requires a valid doctor's prescription before our registered pharmacist can dispense it.
              </p>
              
              <div className="flex items-center gap-3 pt-1">
                <label className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg cursor-pointer">
                  <FileText size={14} />
                  <span>{prescriptionFile ? 'Prescription Uploaded ✓' : 'Upload Prescription (PDF/JPG)'}</span>
                  <input 
                    type="file" 
                    accept="image/*,.pdf" 
                    className="hidden" 
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        setPrescriptionFile(e.target.files[0].name);
                      }
                    }} 
                  />
                </label>
                {prescriptionFile && (
                  <span className="text-[11px] text-slate-600 font-semibold">{prescriptionFile}</span>
                )}
              </div>
            </div>
          )}

          {/* LIQUOR 21+ AGE SAFEGUARD NOTICE */}
          {product.category === 'liquor' && (
            <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl text-xs space-y-1">
              <div className="font-bold text-purple-950 flex items-center gap-1.5">
                <ShieldCheck size={16} className="text-purple-700" />
                <span>
                  {language === 'bn' 
                    ? '২১+ বিধিবদ্ধ মদ্যপান বয়স যাচাইকরণ (Legal Drinking Age)' 
                    : 'Legal Drinking Age Verified Purchase (21+)'}
                </span>
              </div>
              <p className="text-purple-800 text-[11px] leading-relaxed">
                {language === 'bn'
                  ? 'রাজ্য আবগারি আইন অনুযায়ী লিকার ও হার্ড ড্রিঙ্কস বিক্রি ও সরবরাহ করা হয়। ডেলিভারি পার্টনার দোরগোড়ায় আপনার সরকারি সচিত্র পরিচয়পত্র (Aadhaar / Voter ID / Passport) যাচাই করবেন।'
                  : 'Liquor & hard drinks are sold and delivered in compliance with State Excise laws. Our delivery partner will verify government photo ID (Aadhaar / Voter ID / Passport) at doorstep.'}
              </p>
            </div>
          )}

          {/* Related Products in same Subcategory */}
          {relatedProducts.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5">
                More in {product.subcategory}
              </h4>
              <div className="grid grid-cols-3 gap-2">
                {relatedProducts.map(rel => (
                  <div
                    key={rel.id}
                    onClick={() => onSelectProduct(rel)}
                    className="p-2 border border-slate-200 hover:border-emerald-400 rounded-xl transition cursor-pointer text-center group"
                  >
                    <img src={rel.image} alt={rel.name} className="w-full h-16 object-contain rounded-lg mb-1 group-hover:scale-105 transition-transform" />
                    <div className="text-[11px] font-bold text-slate-800 truncate">{rel.name}</div>
                    <div className="text-[11px] font-extrabold text-slate-900 mt-0.5">₹{rel.price}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-4">
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400">Total Price</div>
            <div className="text-xl font-black text-slate-900">₹{displayPrice * (cartQty || 1)}</div>
          </div>

          <div className="flex items-center gap-3">
            {cartQty > 0 ? (
              <div className="flex items-center bg-emerald-600 text-white rounded-xl shadow-md px-1 py-1">
                <button
                  id="product-detail-decrement-btn"
                  onClick={() => updateCartQuantity(product.id, cartQty - 1)}
                  className="p-2 hover:bg-emerald-700 rounded-lg cursor-pointer"
                >
                  <Minus size={15} />
                </button>
                <span className="px-3 font-bold text-sm">{cartQty}</span>
                <button
                  id="product-detail-increment-btn"
                  onClick={() => updateCartQuantity(product.id, cartQty + 1)}
                  className="p-2 hover:bg-emerald-700 rounded-lg cursor-pointer"
                >
                  <Plus size={15} />
                </button>
              </div>
            ) : (
              <button
                id="product-detail-add-to-cart-btn"
                onClick={handleAddToCart}
                disabled={product.stock <= 0}
                className={`px-6 py-2.5 rounded-xl font-bold text-sm shadow-md flex items-center gap-2 transition cursor-pointer ${product.stock <= 0 ? 'bg-slate-300 text-slate-500 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-700/20 active:scale-95'}`}
              >
                <ShoppingBag size={18} />
                <span>
                  {product.stock <= 0 
                    ? (language === 'bn' ? 'স্টক শেষ' : 'Out of Stock') 
                    : (language === 'bn' ? 'কার্টে যোগ করুন' : 'Add to Cart')}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
