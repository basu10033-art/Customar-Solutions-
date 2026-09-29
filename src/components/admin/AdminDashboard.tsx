import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Vendor, Order, OrderStatus } from '../../types';
import { 
  ShieldCheck, Users, Store, Bike, Wrench, 
  TrendingUp, AlertTriangle, CheckCircle, XCircle, 
  HelpCircle, Search, DollarSign, ArrowRight, RefreshCw,
  Trash2, AlertCircle, X
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { 
    orders, vendors, updateVendorKyc, deleteVendor,
    deliveryPartners, deleteDeliveryPartner,
    technicians, deleteTechnician,
    updateOrderStatus, supportTickets, resolveSupportTicket,
    language, t
  } = useApp();

  const [adminTab, setAdminTab] = useState<'overview' | 'dispatch' | 'vendors' | 'fleet' | 'support'>('overview');
  const [vendorSearch, setVendorSearch] = useState('');
  const [fleetSearch, setFleetSearch] = useState('');
  const [resolutionText, setResolutionText] = useState<{ [ticketId: string]: string }>({});
  const [confirmDelete, setConfirmDelete] = useState<{
    type: 'store' | 'partner' | 'technician';
    id: string;
    name: string;
    details?: string;
  } | null>(null);

  // Calculations
  const totalOrdersCount = orders.length;
  const totalGmv = orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const platformCommission = Math.round(totalGmv * 0.10); // ~10% avg commission
  const activeVendorsCount = vendors.filter(v => v.isActive).length;
  const activeRidersCount = deliveryPartners.filter(d => d.isOnline).length;
  const verifiedTechsCount = technicians.length;
  const pendingKycVendors = vendors.filter(v => v.kycStatus === 'pending');

  const filteredVendors = vendors.filter(v => 
    v.name.toLowerCase().includes(vendorSearch.toLowerCase()) || 
    v.category.toLowerCase().includes(vendorSearch.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-4 sm:py-6 space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-purple-600 text-white flex items-center justify-center font-black text-xl shadow-md">
            <ShieldCheck size={26} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black tracking-tight">Customar Solutions Central Operations</h1>
              <span className="text-[10px] font-bold bg-purple-800 text-purple-200 px-2 py-0.5 rounded-full uppercase">
                Super Admin
              </span>
            </div>
            <p className="text-xs text-slate-400">Real-time Hyperlocal Dispatch, KYC Compliance & Commissions Engine</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="font-semibold text-emerald-400">All Microservices Healthy</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto text-xs font-bold">
        {[
          { id: 'overview', label: 'Platform KPIs & Stats' },
          { id: 'dispatch', label: `Live Fleet Dispatch (${orders.length})` },
          { id: 'vendors', label: `Merchant KYC & Approvals (${vendors.length})` },
          { id: 'fleet', label: `Delivery Riders & Pros (${deliveryPartners.length + technicians.length})` },
          { id: 'support', label: `Disputes & Tickets (${supportTickets.length})` }
        ].map(tab => (
          <button
            key={tab.id}
            id={`admin-tab-${tab.id}`}
            onClick={() => setAdminTab(tab.id as any)}
            className={`px-4 py-2 rounded-xl transition whitespace-nowrap cursor-pointer ${adminTab === tab.id ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: PLATFORM OVERVIEW */}
      {adminTab === 'overview' && (
        <div className="space-y-6">
          {/* Top KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total GMV</span>
              <div className="text-xl font-black text-slate-900 mt-1">₹{totalGmv}</div>
              <span className="text-[10px] text-emerald-600 font-bold">↑ 18.4% this week</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Commission</span>
              <div className="text-xl font-black text-purple-700 mt-1">₹{platformCommission}</div>
              <span className="text-[10px] text-slate-500 font-semibold">Avg 10% take-rate</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Orders</span>
              <div className="text-xl font-black text-slate-900 mt-1">{totalOrdersCount}</div>
              <span className="text-[10px] text-teal-600 font-bold">100% fulfill rate</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Active Stores</span>
              <div className="text-xl font-black text-slate-900 mt-1">{activeVendorsCount}</div>
              <span className="text-[10px] text-slate-500">{pendingKycVendors.length} pending KYC</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Active Riders</span>
              <div className="text-xl font-black text-slate-900 mt-1">{activeRidersCount}</div>
              <span className="text-[10px] text-emerald-600 font-bold">100% EV Fleet</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Home Techs</span>
              <div className="text-xl font-black text-slate-900 mt-1">{verifiedTechsCount}</div>
              <span className="text-[10px] text-slate-500 font-bold">Police verified</span>
            </div>
          </div>

          {/* Commission Rates by Category Matrix */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-500">
              Platform Category Commission Structure
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 text-xs">
              {[
                { cat: 'Grocery & Kitchen', rate: '6%' },
                { cat: 'Vegetables & Fruits', rate: '7%' },
                { cat: 'Meat & Seafood', rate: '8%' },
                { cat: 'Prepared Food', rate: '15%' },
                { cat: 'Pharmacy', rate: '7%' },
                { cat: 'Cabs & Transit', rate: '12%' },
                { cat: 'Technicians', rate: '15%' }
              ].map(c => (
                <div key={c.cat} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
                  <span className="text-[10px] text-slate-500 font-semibold block">{c.cat}</span>
                  <span className="text-base font-black text-purple-700">{c.rate}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: LIVE DISPATCH & ORDERS MONITOR */}
      {adminTab === 'dispatch' && (
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-black text-slate-900">Real-Time Central Dispatch</h2>
              <p className="text-xs text-slate-500">Monitor live orders state machine and intervene or reassign if needed</p>
            </div>
          </div>

          {orders.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              No orders placed in system yet. Place an order from Customer App to watch real-time dispatch!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider font-bold">
                    <th className="py-3 px-2">Order ID</th>
                    <th className="py-3 px-2">Merchant</th>
                    <th className="py-3 px-2">Customer</th>
                    <th className="py-3 px-2">Total</th>
                    <th className="py-3 px-2">Rider</th>
                    <th className="py-3 px-2">Status</th>
                    <th className="py-3 px-2">OTP</th>
                    <th className="py-3 px-2 text-right">Admin Override</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {orders.map((o) => (
                    <tr key={o.id} className="hover:bg-slate-50/70">
                      <td className="py-3 px-2 font-mono font-bold text-slate-900">#{o.id}</td>
                      <td className="py-3 px-2 font-bold text-slate-800">{o.vendorName}</td>
                      <td className="py-3 px-2 text-slate-600">{o.customerName}</td>
                      <td className="py-3 px-2 font-bold text-slate-900">₹{o.totalAmount}</td>
                      <td className="py-3 px-2 text-slate-600">{o.deliveryPartnerName || 'Unassigned'}</td>
                      <td className="py-3 px-2">
                        <span className="text-[10px] font-bold uppercase bg-teal-100 text-teal-800 px-2 py-0.5 rounded-md">
                          {o.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-2 font-mono font-bold text-amber-600">{o.deliveryOtp}</td>
                      <td className="py-3 px-2 text-right">
                        <select
                          value={o.status}
                          onChange={(e) => updateOrderStatus(o.id, e.target.value as OrderStatus)}
                          className="bg-slate-100 border border-slate-200 rounded-lg px-2 py-1 text-xs font-semibold text-slate-800 outline-none"
                        >
                          <option value="PLACED">PLACED</option>
                          <option value="ACCEPTED">ACCEPTED</option>
                          <option value="PREPARING">PREPARING</option>
                          <option value="READY_FOR_PICKUP">READY_FOR_PICKUP</option>
                          <option value="DELIVERY_ASSIGNED">DELIVERY_ASSIGNED</option>
                          <option value="OUT_FOR_DELIVERY">OUT_FOR_DELIVERY</option>
                          <option value="DELIVERED">DELIVERED</option>
                          <option value="CANCELLED">CANCELLED</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: VENDOR KYC & COMPLIANCE */}
      {adminTab === 'vendors' && (
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <h2 className="text-base font-black text-slate-900">Store Partners & Regulatory KYC</h2>
              <p className="text-xs text-slate-500">Audit FSSAI licenses, Drug licenses and approve stores</p>
            </div>
            <input
              type="text"
              placeholder="Search vendor name or category..."
              value={vendorSearch}
              onChange={(e) => setVendorSearch(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider font-bold">
                  <th className="py-3 px-2">Store Name</th>
                  <th className="py-3 px-2">Category</th>
                  <th className="py-3 px-2">License (FSSAI/Drug)</th>
                  <th className="py-3 px-2">GSTIN</th>
                  <th className="py-3 px-2">KYC Status</th>
                  <th className="py-3 px-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredVendors.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-2 flex items-center gap-2">
                      <img src={v.image} alt={v.name} className="w-8 h-8 rounded-lg object-cover" />
                      <div>
                        <div className="font-bold text-slate-900">{v.name}</div>
                        <div className="text-[10px] text-slate-400">{v.businessName}</div>
                      </div>
                    </td>
                    <td className="py-3 px-2 capitalize">{v.category}</td>
                    <td className="py-3 px-2 font-mono">{v.fssaiNumber || v.drugLicenseNumber || '21224190000123'}</td>
                    <td className="py-3 px-2 font-mono text-slate-500">{v.gstNumber || '29AABCS1429B1Z2'}</td>
                    <td className="py-3 px-2">
                      <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] uppercase ${v.kycStatus === 'verified' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                        {v.kycStatus}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-right space-x-1.5 whitespace-nowrap">
                      <button
                        onClick={() => updateVendorKyc(v.id, 'verified')}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[10px] cursor-pointer shadow-2xs"
                      >
                        Approve KYC
                      </button>
                      <button
                        onClick={() => updateVendorKyc(v.id, 'rejected')}
                        className="px-2.5 py-1 bg-amber-100 hover:bg-amber-200 text-amber-800 rounded-lg font-bold text-[10px] cursor-pointer"
                      >
                        Reject
                      </button>
                      <button
                        id={`admin-delete-vendor-${v.id}`}
                        onClick={() => setConfirmDelete({ 
                          type: 'store', 
                          id: v.id, 
                          name: v.name, 
                          details: `${v.category} • ${v.area || 'Indiranagar'}, ${v.city || 'Bengaluru'}` 
                        })}
                        className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg font-bold text-[10px] cursor-pointer transition inline-flex items-center gap-1 shadow-2xs"
                        title={t('Delete Store', 'স্টোর মুছুন')}
                      >
                        <Trash2 size={11} />
                        <span>{t('Delete Store', 'স্টোর মুছুন')}</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: FLEET MANAGERS */}
      {adminTab === 'fleet' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Delivery Riders */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900">Delivery Fleet Partners ({deliveryPartners.length})</h3>
              <span className="text-[11px] text-slate-400 font-semibold">{deliveryPartners.filter(d => d.isOnline).length} online</span>
            </div>
            <div className="space-y-2">
              {deliveryPartners.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-2xl">
                  {t('No delivery fleet partners registered.', 'কোনো ডেলিভারি পার্টনার নেই।')}
                </div>
              ) : (
                deliveryPartners.map(p => (
                  <div key={p.id} className="p-3 bg-slate-50 rounded-2xl flex items-center justify-between text-xs hover:bg-slate-100/70 transition">
                    <div className="flex items-center gap-3">
                      <img src={p.avatar} alt={p.name} className="w-10 h-10 rounded-xl object-cover" />
                      <div>
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          <span>{p.name}</span>
                          <span className={`w-2 h-2 rounded-full ${p.isOnline ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
                        </div>
                        <div className="text-slate-500 text-[11px]">{p.vehicleType} ({p.vehicleNumber}) • {p.phone}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="font-bold text-emerald-700">₹{p.todayEarnings} Earned</span>
                        <span className="text-[10px] text-slate-400 block">{p.totalDeliveries} Deliveries</span>
                      </div>
                      <button
                        id={`admin-delete-rider-${p.id}`}
                        onClick={() => setConfirmDelete({ 
                          type: 'partner', 
                          id: p.id, 
                          name: p.name, 
                          details: `${p.vehicleType} (${p.vehicleNumber}) • ${p.phone}` 
                        })}
                        className="p-1.5 rounded-xl bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200 hover:border-rose-200 transition cursor-pointer shadow-2xs"
                        title={t('Delete Delivery Partner', 'ডেলিভারি পার্টনার মুছুন')}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Technicians */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900">Verified Home Technicians ({technicians.length})</h3>
              <span className="text-[11px] text-slate-400 font-semibold">{technicians.filter(tech => tech.isAvailable).length} available</span>
            </div>
            <div className="space-y-2">
              {technicians.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-2xl">
                  {t('No home technicians registered.', 'কোনো টেকনিশিয়ান নেই।')}
                </div>
              ) : (
                technicians.map(tech => (
                  <div key={tech.id} className="p-3 bg-slate-50 rounded-2xl flex items-center justify-between text-xs hover:bg-slate-100/70 transition">
                    <div>
                      <div className="font-bold text-slate-900 flex items-center gap-1.5">
                        <span>{tech.name}</span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-100 text-purple-800 uppercase">
                          {tech.category}
                        </span>
                      </div>
                      <div className="text-slate-500 text-[11px]">{tech.experienceYears} yrs experience • ⭐ {tech.rating}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="font-bold text-indigo-700">Visit: ₹{tech.visitingCharge || tech.visitingCharges || 199}</span>
                        <span className="text-[10px] text-emerald-600 block">Verified Pro</span>
                      </div>
                      <button
                        id={`admin-delete-tech-${tech.id}`}
                        onClick={() => setConfirmDelete({ 
                          type: 'technician', 
                          id: tech.id, 
                          name: tech.name, 
                          details: `${tech.category} • ${tech.experienceYears} yrs experience` 
                        })}
                        className="p-1.5 rounded-xl bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200 hover:border-rose-200 transition cursor-pointer shadow-2xs"
                        title={t('Delete Technician', 'টেকনিশিয়ান মুছুন')}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: SUPPORT DISPUTES & RESOLUTION */}
      {adminTab === 'support' && (
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
          <h2 className="text-base font-black text-slate-900">Customer Disputes & Support Tickets</h2>

          {supportTickets.length === 0 ? (
            <p className="text-xs text-slate-400">No support tickets currently raised.</p>
          ) : (
            <div className="space-y-3">
              {supportTickets.map(ticket => (
                <div key={ticket.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-black text-slate-900">#{ticket.id} • {ticket.category}</span>
                      <span className="text-slate-500 ml-2">from {ticket.customerName}</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${ticket.status === 'Resolved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                      {ticket.status}
                    </span>
                  </div>

                  <p className="font-bold text-slate-800">{ticket.subject}</p>
                  <p className="text-slate-600">{ticket.message}</p>

                  {ticket.status !== 'Resolved' ? (
                    <div className="flex gap-2 pt-2">
                      <input
                        type="text"
                        placeholder="Resolution notes (e.g. Refund of ₹80 processed to customer wallet)..."
                        value={resolutionText[ticket.id] || ''}
                        onChange={(e) => setResolutionText({ ...resolutionText, [ticket.id]: e.target.value })}
                        className="flex-1 px-3 py-1.5 bg-white border border-slate-300 rounded-xl"
                      />
                      <button
                        onClick={() => resolveSupportTicket(ticket.id, resolutionText[ticket.id] || 'Resolved by Central Ops')}
                        className="px-4 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl cursor-pointer"
                      >
                        Resolve
                      </button>
                    </div>
                  ) : (
                    <div className="p-2 bg-emerald-50 rounded-xl text-emerald-900 font-semibold text-[11px]">
                      Resolution: {ticket.resolutionNotes || 'Processed successfully'}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* CONFIRMATION MODAL FOR PERMANENT DELETIONS */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-11 h-11 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center shadow-inner">
                <Trash2 size={22} />
              </div>
              <button
                onClick={() => setConfirmDelete(null)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div>
              <h3 className="text-base font-black text-slate-900">
                {confirmDelete.type === 'store' && t('Delete Store Partner?', 'স্টোর পার্টনার মুছে ফেলতে চান?')}
                {confirmDelete.type === 'partner' && t('Delete Delivery Partner?', 'ডেলিভারি পার্টনার মুছে ফেলতে চান?')}
                {confirmDelete.type === 'technician' && t('Delete Technician?', 'টেকনিশিয়ান মুছে ফেলতে চান?')}
              </h3>
              
              <div className="mt-2 p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1">
                <div className="font-bold text-slate-800">{confirmDelete.name}</div>
                {confirmDelete.details && (
                  <div className="text-[11px] text-slate-500 font-mono">{confirmDelete.details}</div>
                )}
              </div>

              <p className="text-xs text-slate-600 mt-2.5 font-medium leading-relaxed">
                {confirmDelete.type === 'store' && (
                  <>
                    {t('Are you sure you want to permanently delete this store? All associated catalog products and active inventory entries will also be permanently removed from customer view.', 'আপনি কি নিশ্চিত যে আপনি এই স্টোরটি স্থায়ীভাবে মুছে ফেলতে চান? সমস্ত সংশ্লিষ্ট পণ্য এবং ইনভেন্টরি ক্যাটালগ থেকেও মুছে যাবে।')}
                  </>
                )}
                {confirmDelete.type === 'partner' && (
                  <>
                    {t('Are you sure you want to permanently remove this delivery partner from the fleet network? Any ongoing route assignments will be unassigned.', 'আপনি কি নিশ্চিত যে আপনি এই ডেলিভারি পার্টনারকে ফ্লিট থেকে সরিয়ে ফেলতে চান?')}
                  </>
                )}
                {confirmDelete.type === 'technician' && (
                  <>
                    {t('Are you sure you want to permanently remove this verified service technician? Their profile and service offerings will no longer be bookable.', 'আপনি কি নিশ্চিত যে আপনি এই ভেরিফাইড টেকনিশিয়ানকে প্ল্যাটফর্ম থেকে সরিয়ে দিতে চান?')}
                  </>
                )}
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
              <button
                id="admin-cancel-delete-modal-btn"
                type="button"
                onClick={() => setConfirmDelete(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              >
                {t('Cancel', 'বাতিল')}
              </button>
              <button
                id="admin-confirm-delete-modal-btn"
                type="button"
                onClick={() => {
                  if (confirmDelete.type === 'store') {
                    deleteVendor(confirmDelete.id);
                  } else if (confirmDelete.type === 'partner') {
                    deleteDeliveryPartner(confirmDelete.id);
                  } else if (confirmDelete.type === 'technician') {
                    deleteTechnician(confirmDelete.id);
                  }
                  setConfirmDelete(null);
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-sm transition cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 size={14} />
                <span>{t('Yes, Delete Permanently', 'হ্যাঁ, স্থায়ীভাবে মুছুন')}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
