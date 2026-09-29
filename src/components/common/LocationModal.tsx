import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Address } from '../../types';
import { MapPin, Plus, Check, X, Navigation } from 'lucide-react';

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LocationModal: React.FC<LocationModalProps> = ({ isOpen, onClose }) => {
  const { addresses, selectedAddress, setSelectedAddress, addAddress } = useApp();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newLabel, setNewLabel] = useState<'Home' | 'Work' | 'Other'>('Home');
  const [newStreet, setNewStreet] = useState('');
  const [newArea, setNewArea] = useState('');
  const [newCity, setNewCity] = useState('Bengaluru');
  const [newPincode, setNewPincode] = useState('');
  const [newLandmark, setNewLandmark] = useState('');

  if (!isOpen) return null;

  const handleCreateAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStreet || !newArea || !newPincode) return;

    addAddress({
      label: newLabel,
      street: newStreet,
      area: newArea,
      city: newCity,
      pincode: newPincode,
      landmark: newLandmark
    });

    setShowAddForm(false);
    setNewStreet('');
    setNewArea('');
    setNewPincode('');
    setNewLandmark('');
    onClose();
  };

  const handleUseCurrentGPS = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const gpsAddr: Omit<Address, 'id'> = {
            label: 'Other',
            street: `GPS Geolocation (${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)})`,
            area: 'Near Indiranagar Metro',
            city: 'Bengaluru',
            pincode: '560038',
            lat: pos.coords.latitude,
            lng: pos.coords.longitude
          };
          addAddress(gpsAddr);
          onClose();
        },
        () => {
          // Fallback location
          addAddress({
            label: 'Home',
            street: '100ft Road, Near KFC Junction',
            area: 'Indiranagar',
            city: 'Bengaluru',
            pincode: '560038'
          });
          onClose();
        }
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-slate-200 overflow-hidden">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="text-emerald-600" size={20} />
            <h3 className="font-bold text-base text-slate-900">Choose Delivery Location</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600">
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* GPS Button */}
          <button
            id="use-current-gps-location-btn"
            onClick={handleUseCurrentGPS}
            className="w-full flex items-center gap-3 p-3 bg-teal-50 hover:bg-teal-100/70 border border-teal-200 rounded-xl text-teal-800 font-semibold text-xs transition cursor-pointer"
          >
            <div className="p-2 bg-teal-600 text-white rounded-lg">
              <Navigation size={16} />
            </div>
            <div className="text-left">
              <div>Use Current GPS Location</div>
              <div className="text-[11px] text-teal-600 font-normal">Detect instantly for fastest doorstep delivery</div>
            </div>
          </button>

          {/* Saved Addresses List */}
          <div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Saved Addresses</div>
            <div className="space-y-2">
              {addresses.map((addr) => {
                const isSelected = selectedAddress.id === addr.id;
                return (
                  <div
                    key={addr.id}
                    id={`select-address-${addr.id}`}
                    onClick={() => {
                      setSelectedAddress(addr);
                      onClose();
                    }}
                    className={`p-3 rounded-xl border transition cursor-pointer flex items-start justify-between gap-3 ${isSelected ? 'border-emerald-500 bg-emerald-50/50' : 'border-slate-200 hover:border-slate-300'}`}
                  >
                    <div>
                      <span className="inline-block px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-bold rounded-md uppercase mb-1">
                        {addr.label}
                      </span>
                      <p className="text-xs font-semibold text-slate-900">{addr.street}</p>
                      <p className="text-[11px] text-slate-500">{addr.area}, {addr.city} - {addr.pincode}</p>
                      {addr.landmark && <p className="text-[10px] text-slate-400">Landmark: {addr.landmark}</p>}
                    </div>
                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                        <Check size={12} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Add New Address Toggle / Form */}
          {!showAddForm ? (
            <button
              id="add-new-address-toggle-btn"
              onClick={() => setShowAddForm(true)}
              className="w-full py-2.5 px-4 border border-dashed border-slate-300 hover:border-slate-400 text-slate-600 rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
            >
              <Plus size={16} />
              Add New Address
            </button>
          ) : (
            <form onSubmit={handleCreateAddress} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <div className="text-xs font-bold text-slate-800">Add Address Details</div>
              
              <div className="flex gap-2">
                {(['Home', 'Work', 'Other'] as const).map((lbl) => (
                  <button
                    type="button"
                    key={lbl}
                    onClick={() => setNewLabel(lbl)}
                    className={`flex-1 py-1 text-xs font-semibold rounded-lg border ${newLabel === lbl ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-slate-700 border-slate-300'}`}
                  >
                    {lbl}
                  </button>
                ))}
              </div>

              <input
                type="text"
                placeholder="Flat / House / Building / Street"
                value={newStreet}
                onChange={(e) => setNewStreet(e.target.value)}
                required
                className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-emerald-600"
              />

              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Area / Locality"
                  value={newArea}
                  onChange={(e) => setNewArea(e.target.value)}
                  required
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-emerald-600"
                />
                <input
                  type="text"
                  placeholder="City"
                  value={newCity}
                  onChange={(e) => setNewCity(e.target.value)}
                  required
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Pincode"
                  value={newPincode}
                  onChange={(e) => setNewPincode(e.target.value)}
                  required
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-emerald-600"
                />
                <input
                  type="text"
                  placeholder="Landmark (optional)"
                  value={newLandmark}
                  onChange={(e) => setNewLandmark(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-emerald-600"
                />
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-300 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg"
                >
                  Save & Deliver Here
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
