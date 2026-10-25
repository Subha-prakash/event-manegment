import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { Vendor } from '../types';
import {
  Store,
  Plus,
  Trash2,
  Edit2,
  Star,
  Phone,
  MapPin,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  Clock,
  X
} from 'lucide-react';

const VENDOR_CATEGORIES = [
  "Venues and accommodation",
  "Catering and beverages",
  "Decoration and flowers",
  "Photography and videography",
  "Entertainment and music",
  "Makeup artists and stylists",
  "Transportation",
  "Equipment and lighting",
  "Event coordinators"
];

export const VendorsPage: React.FC = () => {
  const { activeEvent, formatCurrency, showToast } = useApp();

  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState<string>('All');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    category: VENDOR_CATEGORIES[0],
    contact_details: '',
    location: '',
    quoted_price: 0,
    agreed_price: 0,
    advance_paid: 0,
    booking_status: 'Confirmed' as 'Confirmed' | 'Booked' | 'In Negotiation' | 'Pending Quotation',
    rating: 5,
    notes: ''
  });

  const loadVendors = async () => {
    if (!activeEvent) return;
    setLoading(true);
    try {
      const data = await api.getVendors(activeEvent.id);
      setVendors(data);
    } catch (err) {
      console.error("Vendors load error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVendors();
  }, [activeEvent?.id]);

  const handleOpenAdd = () => {
    setEditingVendor(null);
    setFormData({
      name: '',
      category: VENDOR_CATEGORIES[0],
      contact_details: '',
      location: activeEvent?.location || '',
      quoted_price: 0,
      agreed_price: 0,
      advance_paid: 0,
      booking_status: 'Pending Quotation',
      rating: 5,
      notes: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (v: Vendor) => {
    setEditingVendor(v);
    setFormData({
      name: v.name,
      category: v.category,
      contact_details: v.contact_details || '',
      location: v.location || '',
      quoted_price: v.quoted_price || 0,
      agreed_price: v.agreed_price || 0,
      advance_paid: v.advance_paid || 0,
      booking_status: v.booking_status,
      rating: v.rating || 5,
      notes: v.notes || ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this vendor record?')) return;
    try {
      await api.deleteVendor(activeEvent!.id, id);
      setVendors(prev => prev.filter(v => v.id !== id));
      showToast('Vendor record removed', 'info');
    } catch (err: any) {
      showToast(err.message || 'Failed to delete vendor', 'error');
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showToast('Please enter a vendor name', 'error');
      return;
    }

    try {
      if (editingVendor) {
        const updated = await api.updateVendor(activeEvent!.id, editingVendor.id, formData);
        setVendors(prev => prev.map(v => v.id === editingVendor.id ? updated : v));
        showToast('Vendor updated', 'success');
      } else {
        const created = await api.addVendor(activeEvent!.id, formData);
        setVendors(prev => [created, ...prev]);
        showToast('Vendor added', 'success');
      }
      setIsModalOpen(false);
    } catch (err: any) {
      showToast(err.message || 'Failed to save vendor', 'error');
    }
  };

  if (!activeEvent) {
    return <div className="text-center py-12 text-slate-500">Please select an event.</div>;
  }

  const filteredVendors = categoryFilter === 'All'
    ? vendors
    : vendors.filter(v => v.category === categoryFilter);

  // Missing categories check
  const bookedCategoryNames = vendors
    .filter(v => v.booking_status === 'Confirmed' || v.booking_status === 'Booked')
    .map(v => v.category);

  const missingCoreCategories = VENDOR_CATEGORIES.slice(0, 5).filter(c => !bookedCategoryNames.includes(c));

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-700 border border-brand-200">
              Vendor Directory & Bookings
            </span>
            <span className="text-xs text-slate-500">• {activeEvent.name}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1.5">
            Vendor Logistics & Payments
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage quotations, agreed prices, contracts, and advance payment balances.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md shadow-brand-500/20 transition-all hover:scale-[1.02]"
        >
          <Plus className="w-4 h-4" />
          <span>Add Vendor</span>
        </button>
      </div>

      {/* Vendor Checklist & Missing Services Banner */}
      {missingCoreCategories.length > 0 ? (
        <div className="p-5 rounded-3xl bg-amber-50/80 border border-amber-200/80 shadow-2xs flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-xs font-bold text-amber-900 uppercase tracking-wider">
              Missing Essential Services Checklist
            </h3>
            <p className="text-xs text-amber-800 mt-1">
              You haven't confirmed bookings for: <strong>{missingCoreCategories.join(', ')}</strong>.
              Finalize these quotations to secure your preferred dates!
            </p>
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center gap-3 text-xs text-emerald-900">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>All primary core services (Venue, Catering, Decor, Photography, Entertainment) are booked!</span>
        </div>
      )}

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setCategoryFilter('All')}
          className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            categoryFilter === 'All'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          All Categories ({vendors.length})
        </button>
        {VENDOR_CATEGORIES.map(cat => {
          const count = vendors.filter(v => v.category === cat).length;
          return (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                categoryFilter === cat
                  ? 'bg-brand-600 text-white font-bold shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {cat} ({count})
            </button>
          );
        })}
      </div>

      {/* Vendors Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVendors.map(vendor => {
          const remainingBalance = Math.max(0, (vendor.agreed_price || 0) - (vendor.advance_paid || 0));

          let statusStyle = 'bg-slate-100 text-slate-700';
          if (vendor.booking_status === 'Confirmed') statusStyle = 'bg-emerald-100 text-emerald-800 border-emerald-200';
          if (vendor.booking_status === 'Booked') statusStyle = 'bg-blue-100 text-blue-800 border-blue-200';
          if (vendor.booking_status === 'In Negotiation') statusStyle = 'bg-amber-100 text-amber-800 border-amber-200';
          if (vendor.booking_status === 'Pending Quotation') statusStyle = 'bg-purple-100 text-purple-800 border-purple-200';

          return (
            <div
              key={vendor.id}
              className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${statusStyle}`}>
                    {vendor.booking_status}
                  </span>
                  <div className="flex items-center gap-0.5 text-amber-400">
                    {[...Array(vendor.rating || 5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                    ))}
                  </div>
                </div>

                <h3 className="font-bold text-slate-900 text-base">{vendor.name}</h3>
                <span className="text-[11px] font-semibold text-brand-600 block mt-0.5">
                  {vendor.category}
                </span>

                {/* Details */}
                <div className="mt-4 space-y-1.5 text-xs text-slate-500">
                  {vendor.location && (
                    <p className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{vendor.location}</span>
                    </p>
                  )}
                  {vendor.contact_details && (
                    <p className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{vendor.contact_details}</span>
                    </p>
                  )}
                </div>

                {/* Financial Summary */}
                <div className="mt-4 p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-xs space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Quoted Price:</span>
                    <span className="font-semibold text-slate-600">{formatCurrency(vendor.quoted_price)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 font-medium">Agreed Price:</span>
                    <span className="font-bold text-slate-900">{formatCurrency(vendor.agreed_price)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Advance Paid:</span>
                    <span className="font-semibold text-emerald-600">{formatCurrency(vendor.advance_paid)}</span>
                  </div>
                  <div className="pt-1.5 border-t border-slate-200/60 flex justify-between">
                    <span className="font-bold text-slate-700">Balance Due:</span>
                    <span className={`font-black ${remainingBalance > 0 ? 'text-rose-600' : 'text-slate-500'}`}>
                      {formatCurrency(remainingBalance)}
                    </span>
                  </div>
                </div>

                {vendor.notes && (
                  <p className="text-[11px] text-slate-500 italic mt-3 line-clamp-2">
                    "{vendor.notes}"
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  onClick={() => handleOpenEdit(vendor)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 flex items-center gap-1"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => handleDelete(vendor.id)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}

        {filteredVendors.length === 0 && (
          <div className="col-span-full text-center py-14 bg-white rounded-3xl border border-slate-200/80 text-slate-400 text-xs">
            No vendors registered in this category. Click "Add Vendor" to record bids and contacts.
          </div>
        )}
      </div>

      {/* Add / Edit Vendor Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-100 animate-scale-up">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">
                {editingVendor ? 'Edit Vendor Record' : 'Add New Vendor'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Vendor / Business Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Shahi Dawat Caterers"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Service Category *</label>
                <select
                  value={formData.category}
                  onChange={e => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                >
                  {VENDOR_CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Phone / Email Contact</label>
                  <input
                    type="text"
                    value={formData.contact_details}
                    onChange={e => setFormData({ ...formData, contact_details: e.target.value })}
                    placeholder="+91 98290 12345"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Location / City</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={e => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Jaipur, Rajasthan"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Quoted Price ({activeEvent.currency})</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.quoted_price}
                    onChange={e => setFormData({ ...formData, quoted_price: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Agreed Price ({activeEvent.currency})</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.agreed_price}
                    onChange={e => setFormData({ ...formData, agreed_price: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Advance Paid ({activeEvent.currency})</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.advance_paid}
                    onChange={e => setFormData({ ...formData, advance_paid: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Booking Status</label>
                  <select
                    value={formData.booking_status}
                    onChange={e => setFormData({ ...formData, booking_status: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                  >
                    <option value="Confirmed">Confirmed</option>
                    <option value="Booked">Booked</option>
                    <option value="In Negotiation">In Negotiation</option>
                    <option value="Pending Quotation">Pending Quotation</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">User Rating (1 to 5 Stars)</label>
                  <select
                    value={formData.rating}
                    onChange={e => setFormData({ ...formData, rating: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                  >
                    <option value="5">⭐⭐⭐⭐⭐ (5 Stars)</option>
                    <option value="4">⭐⭐⭐⭐ (4 Stars)</option>
                    <option value="3">⭐⭐⭐ (3 Stars)</option>
                    <option value="2">⭐⭐ (2 Stars)</option>
                    <option value="1">⭐ (1 Star)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Notes & Contract Terms</label>
                <input
                  type="text"
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="e.g. Includes stage lighting, generator backup, and sound permissions"
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md"
                >
                  {editingVendor ? 'Save Changes' : 'Add Vendor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
