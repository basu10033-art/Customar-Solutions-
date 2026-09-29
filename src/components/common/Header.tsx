import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import { 
  ShoppingBag, MapPin, Search, User as UserIcon, Bell, 
  Volume2, VolumeX, ShieldCheck, Store, Bike, Wrench, 
  Car, ChevronDown, Check, LogOut, Sparkles, X, Globe
} from 'lucide-react';

interface HeaderProps {
  onOpenSearch: () => void;
  onOpenCart: () => void;
  onOpenLocation: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenSearch, onOpenCart, onOpenLocation }) => {
  const { 
    currentUser, activeRole, setActiveRole, loginAsDemoUser, loginWithGoogle, logout,
    cartTotalCount, selectedAddress, soundEnabled, setSoundEnabled, playTestRing,
    notifications, markNotificationRead, clearAllNotifications, vendors, activeVendorId, setActiveVendorId,
    language, setLanguage, t
  } = useApp();

  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const roleLabels: { [key in UserRole]?: { label: string; icon: any; color: string; desc: string } } = {
    customer: { label: 'Customer App', icon: ShoppingBag, color: 'text-teal-600 bg-teal-50', desc: 'Shop 13+ categories & quick delivery' },
    vendor: { label: 'Vendor Partner', icon: Store, color: 'text-emerald-600 bg-emerald-50', desc: 'Order ring, catalog & inventory' },
    delivery: { label: 'Delivery Partner', icon: Bike, color: 'text-amber-600 bg-amber-50', desc: 'Accept requests & live navigation' },
    technician: { label: 'Service / Tech', icon: Wrench, color: 'text-indigo-600 bg-indigo-50', desc: 'Home repairs & service bookings' },
    driver: { label: 'Cab Captain', icon: Car, color: 'text-orange-600 bg-orange-50', desc: 'Ride dispatches & city trips' },
    cabs: { label: 'Cab Captain', icon: Car, color: 'text-orange-600 bg-orange-50', desc: 'Ride dispatches & city trips' },
    admin: { label: 'Central Admin', icon: ShieldCheck, color: 'text-purple-600 bg-purple-50', desc: 'KPIs, dispatch, KYC & commissions' }
  };

  const currentRoleMeta = roleLabels[activeRole] || (activeRole === 'cabs' ? roleLabels.driver : roleLabels.customer)!;
  const CurrentRoleIcon = currentRoleMeta?.icon || ShoppingBag;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      {/* Top Banner Alert Bar for Sound & Role Switching notification */}
      <div className="bg-slate-900 text-white text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 font-semibold text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Hyperlocal Quick Commerce
            </span>
            <span className="text-slate-400 hidden sm:inline">• 10-15 Min Delivery Guarantee</span>
            <span className="text-slate-400 hidden md:inline">• 13 Super Categories</span>
          </div>

          <div className="flex items-center gap-3">
            {/* Language Switcher (EN / বাংলা) */}
            <button
              id="header-language-toggle-btn"
              onClick={() => setLanguage(language === 'en' ? 'bn' : 'en')}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-0.5 rounded-full text-[11px] font-bold cursor-pointer transition border border-slate-700 active:scale-95"
              title="Change Language / ভাষা পরিবর্তন করুন"
            >
              <Globe size={12} className="text-emerald-400" />
              <span>{language === 'en' ? 'বাংলা' : 'English'}</span>
            </button>

            {/* Audio Toggle & Test Ring button */}
            <div className="flex items-center gap-1.5 bg-slate-800 px-2 py-0.5 rounded-md text-slate-300">
              <button 
                id="toggle-sound-btn"
                onClick={() => setSoundEnabled(!soundEnabled)}
                title={soundEnabled ? "Mute Order Ringing" : "Unmute Order Ringing"}
                className="hover:text-white flex items-center gap-1 text-[11px] cursor-pointer"
              >
                {soundEnabled ? <Volume2 size={13} className="text-emerald-400" /> : <VolumeX size={13} className="text-red-400" />}
                <span>{soundEnabled ? 'Ring: ON' : 'Ring: OFF'}</span>
              </button>
              {soundEnabled && (
                <button 
                  id="test-ring-btn"
                  onClick={playTestRing} 
                  className="text-[10px] bg-emerald-600 hover:bg-emerald-500 text-white px-1.5 py-0.2 rounded font-medium cursor-pointer"
                >
                  Test Ring
                </button>
              )}
            </div>

            {/* Quick Role Switcher Pill */}
            <div className="relative">
              <button 
                id="role-switcher-dropdown-btn"
                onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                className="flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-600 text-white text-xs px-2.5 py-0.5 rounded-full font-medium transition cursor-pointer"
              >
                <CurrentRoleIcon size={12} />
                <span>Role: <strong>{currentRoleMeta?.label || 'Customer App'}</strong></span>
                <ChevronDown size={12} className={roleDropdownOpen ? 'rotate-180 transition-transform' : 'transition-transform'} />
              </button>

              {roleDropdownOpen && (
                <div className="absolute right-0 mt-1.5 w-72 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 text-slate-800 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-3 py-2 border-b border-slate-100 bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    Switch Active Platform Role
                  </div>
                  {(['customer', 'vendor', 'delivery', 'technician', 'driver', 'admin'] as UserRole[]).map((role) => {
                    const info = roleLabels[role] || roleLabels.customer!;
                    const Icon = info.icon || ShoppingBag;
                    const isSelected = activeRole === role || (role === 'driver' && activeRole === 'cabs');
                    return (
                      <button
                        key={role}
                        id={`switch-role-${role}`}
                        onClick={() => {
                          loginAsDemoUser(role);
                          setRoleDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-slate-50 transition cursor-pointer ${isSelected ? 'bg-emerald-50/70 text-emerald-900 font-semibold' : ''}`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className={`p-1.5 rounded-lg ${info.color}`}>
                            <Icon size={15} />
                          </div>
                          <div>
                            <div className="text-xs font-semibold">{info.label}</div>
                            <div className="text-[10px] text-slate-500 font-normal">{info.desc}</div>
                          </div>
                        </div>
                        {isSelected && <Check size={14} className="text-emerald-600" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Header Bar */}
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between gap-3">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-3">
          <div 
            onClick={() => setActiveRole('customer')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            {/* Customar Solutions Original Geometric Falcon Mark */}
            <div className="w-10 h-10 rounded-xl bg-linear-to-tr from-teal-700 via-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-teal-700/20 group-hover:scale-105 transition-transform">
              <div className="relative">
                <span className="font-black text-xl tracking-tighter">CS</span>
                <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-400 border-2 border-teal-700"></div>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1">
                <span className="font-extrabold text-xl tracking-tight text-slate-900">Customar</span>
                <span className="font-bold text-xl tracking-tight text-teal-600">Solutions</span>
              </div>
              <p className="text-[10px] font-medium tracking-wide text-slate-500 uppercase -mt-0.5">
                Everything You Need, Delivered.
              </p>
            </div>
          </div>

          {/* Location Picker Pill */}
          <button
            id="header-location-selector"
            onClick={onOpenLocation}
            className="hidden lg:flex items-center gap-2 bg-slate-100/90 hover:bg-slate-200/80 px-3 py-1.5 rounded-lg text-left transition text-slate-800 cursor-pointer max-w-xs"
          >
            <MapPin size={16} className="text-emerald-600 shrink-0" />
            <div className="truncate">
              <div className="text-[10px] uppercase font-bold text-slate-500 leading-tight">Deliver to</div>
              <div className="text-xs font-semibold text-slate-900 truncate">
                {selectedAddress.area}, {selectedAddress.city}
              </div>
            </div>
            <ChevronDown size={13} className="text-slate-400 shrink-0" />
          </button>
        </div>

        {/* Global Search Bar (Only shown on desktop in customer mode) */}
        {activeRole === 'customer' && (
          <div 
            onClick={onOpenSearch}
            className="hidden md:flex flex-1 max-w-lg items-center gap-2.5 bg-slate-100 hover:bg-slate-200/70 border border-slate-200 px-4 py-2 rounded-xl text-slate-500 cursor-pointer transition shadow-2xs"
          >
            <Search size={17} className="text-slate-400" />
            <span className="text-xs text-slate-500">
              {language === 'bn' ? 'পণ্য, খাবার, ওষুধ ও সার্ভিস সার্চ করুন...' : 'Search for products, food, medicines, services...'}
            </span>
            <kbd className="ml-auto text-[10px] bg-white text-slate-400 px-1.5 py-0.5 rounded border border-slate-200 shadow-2xs">
              {language === 'bn' ? 'অনুসন্ধান' : 'Search'}
            </kbd>
          </div>
        )}

        {/* Action Controls (Notifications, Cart, Profile) */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Search Trigger for Mobile */}
          {activeRole === 'customer' && (
            <button
              id="mobile-search-trigger"
              onClick={onOpenSearch}
              className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
              title="Search"
            >
              <Search size={20} />
            </button>
          )}

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              id="notifications-bell-btn"
              onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
              className="relative p-2 rounded-lg text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              title="Notifications"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center animate-bounce">
                  {Number.isNaN(unreadCount) ? 0 : unreadCount}
                </span>
              )}
            </button>

            {notifDropdownOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 py-2 z-50 animate-in fade-in">
                <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                  <span className="font-bold text-sm text-slate-900">Activity & Alerts</span>
                  {notifications.length > 0 && (
                    <button 
                      onClick={clearAllNotifications}
                      className="text-xs text-slate-400 hover:text-slate-600"
                    >
                      Clear all
                    </button>
                  )}
                </div>
                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-400">
                      No notifications yet
                    </div>
                  ) : (
                    notifications.map(n => (
                      <div 
                        key={n.id}
                        onClick={() => markNotificationRead(n.id)}
                        className={`p-3 hover:bg-slate-50 transition cursor-pointer ${!n.read ? 'bg-teal-50/40' : ''}`}
                      >
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className="font-semibold text-xs text-slate-800">{n.title}</span>
                          <span className="text-[10px] text-slate-400">{n.time}</span>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">{n.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Cart Trigger (Primary Customer Action) */}
          {activeRole === 'customer' && (
            <button
              id="header-cart-button"
              onClick={onOpenCart}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white px-3.5 py-2 rounded-xl font-bold text-sm shadow-md shadow-emerald-700/20 transition cursor-pointer"
            >
              <ShoppingBag size={18} />
              <span className="hidden sm:inline">{language === 'bn' ? 'আমার কার্ট' : 'My Cart'}</span>
              <span className="bg-emerald-800 text-white text-xs font-black px-1.5 py-0.5 rounded-full">
                {Number.isNaN(cartTotalCount) ? 0 : cartTotalCount}
              </span>
            </button>
          )}

          {/* User Account / Profile Menu */}
          <div className="relative">
            <button
              id="user-profile-menu-btn"
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 transition cursor-pointer border border-slate-200"
            >
              {currentUser.avatar ? (
                <img src={currentUser.avatar} alt={currentUser.name} className="w-7 h-7 rounded-lg object-cover" />
              ) : (
                <div className="w-7 h-7 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-xs">
                  {currentUser.name.charAt(0)}
                </div>
              )}
              <span className="text-xs font-semibold text-slate-800 hidden md:inline truncate max-w-[100px]">
                {currentUser.name.split(' ')[0]}
              </span>
              <ChevronDown size={12} className="text-slate-400" />
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in">
                <div className="px-4 py-2.5 border-b border-slate-100">
                  <p className="text-xs font-bold text-slate-900">{currentUser.name}</p>
                  <p className="text-[11px] text-slate-500 truncate">{currentUser.email}</p>
                  <span className="inline-block mt-1 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 bg-teal-100 text-teal-800 rounded-md">
                    {currentUser.role}
                  </span>
                </div>

                <div className="py-1">
                  <button
                    id="google-signin-btn"
                    onClick={() => {
                      loginWithGoogle();
                      setUserMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                  >
                    <Sparkles size={14} className="text-amber-500" />
                    <span>Sign in with Google</span>
                  </button>

                  <button
                    id="switch-to-customer-view"
                    onClick={() => {
                      setActiveRole('customer');
                      setUserMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                  >
                    <ShoppingBag size={14} className="text-teal-600" />
                    <span>Customer Shopping App</span>
                  </button>

                  <button
                    id="switch-to-admin-view"
                    onClick={() => {
                      setActiveRole('admin');
                      setUserMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                  >
                    <ShieldCheck size={14} className="text-purple-600" />
                    <span>Admin Control Center</span>
                  </button>
                </div>

                <div className="border-t border-slate-100 pt-1">
                  <button
                    id="logout-btn"
                    onClick={() => {
                      logout();
                      setUserMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2"
                  >
                    <LogOut size={14} />
                    <span>Sign out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
