import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Product, MainCategory } from '../../types';
import { CATEGORIES } from '../../data/mockData';
import { Search, X, Star, Plus, Check, ShoppingBag, Store, Wrench, ShieldCheck, Tag } from 'lucide-react';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProduct: (product: Product) => void;
  onSelectCategory: (category: MainCategory) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ 
  isOpen, onClose, onSelectProduct, onSelectCategory 
}) => {
  const { products, vendors, addToCart, cart } = useApp();
  const [query, setQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [vegOnly, setVegOnly] = useState(false);

  const recentSearches = ['Atta', 'Mango Juice', 'Biryani', 'Dolo-650', 'Electrician', 'Fresh Chicken'];

  const filteredProducts = useMemo(() => {
    if (!query.trim()) return [];

    const q = query.toLowerCase().trim();
    return products.filter(p => {
      const matchQuery = 
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.subcategory.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.vendorName.toLowerCase().includes(q);

      const matchCat = selectedCategoryFilter === 'all' || p.category === selectedCategoryFilter;
      const matchStock = !inStockOnly || p.stock > 0;
      const matchVeg = !vegOnly || p.isVeg === true;

      return matchQuery && matchCat && matchStock && matchVeg;
    });
  }, [products, query, selectedCategoryFilter, inStockOnly, vegOnly]);

  const filteredVendors = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase().trim();
    return vendors.filter(v => 
      v.name.toLowerCase().includes(q) || 
      v.category.toLowerCase().includes(q) ||
      v.businessName.toLowerCase().includes(q)
    );
  }, [vendors, query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-8 sm:pt-16 p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Search Input Header */}
        <div className="p-4 border-b border-slate-100 flex items-center gap-3">
          <Search size={20} className="text-teal-600 shrink-0" />
          <input
            id="global-search-input"
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for products, food, medicines, services, prints..."
            className="flex-1 text-sm bg-transparent outline-none text-slate-800 placeholder:text-slate-400 font-medium"
          />
          {query && (
            <button onClick={() => setQuery('')} className="p-1 text-slate-400 hover:text-slate-600">
              <X size={16} />
            </button>
          )}
          <button 
            onClick={onClose} 
            className="text-xs font-semibold px-2 py-1 text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer"
          >
            ESC
          </button>
        </div>

        {/* Filter Pills */}
        <div className="px-4 py-2 bg-slate-50 border-b border-slate-200 flex items-center gap-2 overflow-x-auto text-xs no-scrollbar">
          <span className="text-slate-400 font-semibold shrink-0">Filter:</span>
          <select
            value={selectedCategoryFilter}
            onChange={(e) => setSelectedCategoryFilter(e.target.value)}
            className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-700 outline-none"
          >
            <option value="all">All Categories</option>
            {CATEGORIES.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          <label className="flex items-center gap-1 bg-white border border-slate-200 px-2.5 py-1 rounded-lg text-slate-700 cursor-pointer shrink-0">
            <input 
              type="checkbox" 
              checked={inStockOnly} 
              onChange={(e) => setInStockOnly(e.target.checked)} 
              className="accent-emerald-600 rounded" 
            />
            <span>In Stock</span>
          </label>

          <label className="flex items-center gap-1 bg-white border border-slate-200 px-2.5 py-1 rounded-lg text-slate-700 cursor-pointer shrink-0">
            <input 
              type="checkbox" 
              checked={vegOnly} 
              onChange={(e) => setVegOnly(e.target.checked)} 
              className="accent-emerald-600 rounded" 
            />
            <span className="text-emerald-700 font-semibold">Veg Only</span>
          </label>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {!query.trim() ? (
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Popular Searches</div>
              <div className="flex flex-wrap gap-2 mb-6">
                {recentSearches.map(term => (
                  <button
                    key={term}
                    onClick={() => setQuery(term)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium cursor-pointer transition"
                  >
                    <Search size={12} className="text-slate-400" />
                    {term}
                  </button>
                ))}
              </div>

              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Explore 13 Categories</div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {CATEGORIES.slice(0, 9).map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      onSelectCategory(cat.id);
                      onClose();
                    }}
                    className="p-2.5 bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 rounded-xl text-left transition flex items-center gap-2 cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-xs shrink-0">
                      {cat.name.charAt(0)}
                    </div>
                    <div className="truncate">
                      <div className="text-xs font-bold text-slate-800 truncate">{cat.name}</div>
                      <div className="text-[10px] text-slate-400">{cat.eta}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Matching Stores / Vendors */}
              {filteredVendors.length > 0 && (
                <div>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Matching Stores & Vendors</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {filteredVendors.map(v => (
                      <div
                        key={v.id}
                        onClick={() => {
                          onSelectCategory(v.category);
                          onClose();
                        }}
                        className="p-2.5 bg-white border border-slate-200 rounded-xl hover:border-emerald-400 transition cursor-pointer flex items-center gap-3"
                      >
                        <img src={v.image} alt={v.name} className="w-10 h-10 rounded-lg object-cover" />
                        <div className="truncate flex-1">
                          <div className="text-xs font-bold text-slate-900 truncate">{v.name}</div>
                          <div className="text-[10px] text-slate-500 capitalize">{v.category.replace(/-/g, ' ')} • ⭐{v.rating}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Matching Products */}
              <div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Products ({filteredProducts.length})
                </div>

                {filteredProducts.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-xs">
                    No products found for "{query}". Try checking the spelling or selecting another category.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredProducts.map(product => {
                      const inCart = cart.find(ci => ci.product.id === product.id);
                      return (
                        <div
                          key={product.id}
                          className="p-3 bg-white hover:bg-slate-50/80 border border-slate-200 rounded-xl transition flex items-center justify-between gap-3"
                        >
                          <div 
                            onClick={() => {
                              onSelectProduct(product);
                              onClose();
                            }}
                            className="flex items-center gap-3 cursor-pointer flex-1 min-w-0"
                          >
                            <img src={product.image} alt={product.name} className="w-12 h-12 rounded-lg object-cover shrink-0 border border-slate-100" />
                            <div className="truncate">
                              <div className="text-xs font-bold text-slate-900 truncate">{product.name}</div>
                              <div className="text-[11px] text-slate-500">
                                {product.brand} • {product.weight}
                              </div>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-xs font-extrabold text-slate-900">₹{product.price}</span>
                                {product.mrp > product.price && (
                                  <span className="text-[10px] text-slate-400 line-through">₹{product.mrp}</span>
                                )}
                                <span className="text-[10px] text-emerald-700 bg-emerald-100 px-1 rounded font-semibold">
                                  {product.discount}% OFF
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="shrink-0">
                            {product.stock <= 0 ? (
                              <span className="text-[10px] text-red-500 font-bold bg-red-50 px-2 py-1 rounded">Out of Stock</span>
                            ) : inCart ? (
                              <div className="flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2 py-1 rounded-lg text-xs font-bold border border-emerald-300">
                                <Check size={13} /> {inCart.quantity} in cart
                              </div>
                            ) : (
                              <button
                                id={`search-add-to-cart-${product.id}`}
                                onClick={() => addToCart(product)}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-xs cursor-pointer"
                              >
                                <Plus size={14} /> ADD
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
