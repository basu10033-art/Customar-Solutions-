import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Product } from './types';

// Common Components
import { Header } from './components/common/Header';
import { LocationModal } from './components/common/LocationModal';
import { SearchModal } from './components/common/SearchModal';

// Customer Components
import { CustomerApp } from './components/customer/CustomerApp';
import { ProductDetailModal } from './components/customer/ProductDetailModal';
import { CartDrawer } from './components/customer/CartDrawer';
import { LiveTrackingModal } from './components/customer/LiveTrackingModal';
import { SupportModal } from './components/customer/SupportModal';

// Role Dashboards
import { VendorDashboard } from './components/vendor/VendorDashboard';
import { DeliveryPartnerApp } from './components/delivery/DeliveryPartnerApp';
import { TechnicianDashboard } from './components/technician/TechnicianDashboard';
import { CabDriverDashboard } from './components/cabs/CabDriverDashboard';
import { AdminDashboard } from './components/admin/AdminDashboard';

const MainAppContent: React.FC = () => {
  const { activeRole, setActiveRole } = useApp();

  // Modal States
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [trackingOrderId, setTrackingOrderId] = useState<string | null>(null);
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [supportOrderId, setSupportOrderId] = useState<string | undefined>(undefined);

  const handleOpenSupport = (orderId?: string) => {
    setSupportOrderId(orderId);
    setIsSupportOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-800 antialiased selection:bg-emerald-500 selection:text-white">
      {/* Universal Navigation Header */}
      <Header
        onOpenLocation={() => setIsLocationOpen(true)}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenCart={() => setIsCartOpen(true)}
      />

      {/* Main Role-Based Screen Router */}
      <main className="flex-1 pb-16">
        {activeRole === 'customer' && (
          <CustomerApp
            onSelectProduct={(p) => setSelectedProduct(p)}
            onTrackOrder={(orderId) => setTrackingOrderId(orderId)}
            onOpenSupportModal={handleOpenSupport}
            onOpenCart={() => setIsCartOpen(true)}
            onOpenSearch={() => setIsSearchOpen(true)}
            onOpenLocation={() => setIsLocationOpen(true)}
          />
        )}

        {activeRole === 'vendor' && (
          <VendorDashboard />
        )}

        {activeRole === 'delivery' && (
          <DeliveryPartnerApp />
        )}

        {activeRole === 'technician' && (
          <TechnicianDashboard />
        )}

        {(activeRole === 'cabs' || activeRole === 'driver') && (
          <CabDriverDashboard />
        )}

        {activeRole === 'admin' && (
          <AdminDashboard />
        )}
      </main>

      {/* Global Modals */}
      <LocationModal
        isOpen={isLocationOpen}
        onClose={() => setIsLocationOpen(false)}
      />

      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectProduct={(p) => setSelectedProduct(p)}
      />

      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onOrderSuccess={(orderId) => {
          setIsCartOpen(false);
          setTrackingOrderId(orderId);
        }}
        onTrackOrder={(orderId) => {
          setIsCartOpen(false);
          setTrackingOrderId(orderId);
        }}
        onOpenLocation={() => setIsLocationOpen(true)}
      />

      {trackingOrderId && (
        <LiveTrackingModal
          orderId={trackingOrderId}
          onClose={() => setTrackingOrderId(null)}
          onOpenSupport={handleOpenSupport}
        />
      )}

      <SupportModal
        isOpen={isSupportOpen}
        onClose={() => {
          setIsSupportOpen(false);
          setSupportOrderId(undefined);
        }}
        defaultOrderId={supportOrderId}
      />

      {/* Fast Role Switcher Fixed Footer Bar (for effortless testing of multi-role flows) */}
      <footer className="fixed bottom-0 inset-x-0 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 py-2 px-4 z-40 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="font-bold text-white hidden sm:inline">Customar Solutions Hyperlocal Simulation Mode:</span>
          <span className="text-[11px] text-slate-400">Switch Persona →</span>
        </div>

        <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto no-scrollbar">
          {[
            { id: 'customer', label: '🛍️ Customer' },
            { id: 'vendor', label: '🏪 Store Partner' },
            { id: 'delivery', label: '🛵 Delivery Partner' },
            { id: 'technician', label: '🔧 Technician' },
            { id: 'cabs', label: '🚕 Cab Captain' },
            { id: 'admin', label: '⚡ Super Admin' }
          ].map(role => (
            <button
              key={role.id}
              id={`quick-footer-role-${role.id}`}
              onClick={() => setActiveRole(role.id as any)}
              className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition whitespace-nowrap cursor-pointer ${(activeRole === role.id || (role.id === 'cabs' && activeRole === 'driver') || (role.id === 'driver' && activeRole === 'cabs')) ? 'bg-emerald-500 text-slate-950 font-black shadow-xs' : 'text-slate-300 hover:bg-slate-800'}`}
            >
              {role.label}
            </button>
          ))}
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}
