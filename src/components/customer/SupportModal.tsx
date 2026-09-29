import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, HelpCircle, Send, CheckCircle2, MessageSquare } from 'lucide-react';

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultOrderId?: string;
}

export const SupportModal: React.FC<SupportModalProps> = ({ isOpen, onClose, defaultOrderId }) => {
  const { createSupportTicket, currentUser, orders, supportTickets } = useApp();

  const [category, setCategory] = useState<string>('Item Quality');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [orderId, setOrderId] = useState(defaultOrderId || '');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !message) return;

    createSupportTicket({
      customerId: currentUser.id,
      customerName: currentUser.name,
      orderId: orderId || undefined,
      category,
      subject,
      message
    });

    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <HelpCircle size={18} className="text-teal-600" />
            <h3 className="font-bold text-sm text-slate-900">Customar Support & Assistance</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-200 text-slate-400">
            <X size={18} />
          </button>
        </div>

        {submitted ? (
          <div className="p-8 text-center space-y-2">
            <CheckCircle2 size={40} className="text-emerald-500 mx-auto" />
            <h4 className="font-bold text-base text-slate-800">Support Ticket Created</h4>
            <p className="text-xs text-slate-500">
              Our central customer resolution desk has received your ticket. We aim to respond within 15 minutes.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Issue Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold"
              >
                <option value="Item Quality">Item Quality / Freshness Issue</option>
                <option value="Missing Item">Item Missing from Sealed Bag</option>
                <option value="Late Delivery">Delivery Delay / Rider Inquiry</option>
                <option value="Packaging Leakage">Liquid / Juice Packaging Leakage</option>
                <option value="Payment & Refund">Payment Debited / Refund Status</option>
                <option value="General Inquiry">Other Service Query</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Related Order ID (Optional)</label>
              <input
                type="text"
                placeholder="e.g. CS-123456"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Brief Subject</label>
              <input
                type="text"
                required
                placeholder="e.g. Milk packet was leaking inside bag"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Detailed Description</label>
              <textarea
                required
                rows={3}
                placeholder="Please describe what happened in detail..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl flex items-center gap-1.5 shadow-md cursor-pointer"
              >
                <Send size={14} />
                <span>Submit Ticket</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
