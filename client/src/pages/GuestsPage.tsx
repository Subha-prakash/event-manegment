import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { Guest } from '../types';
import {
  Users,
  Plus,
  Trash2,
  Edit2,
  Download,
  Mail,
  UserCheck,
  UserX,
  Clock,
  Search,
  Filter,
  X
} from 'lucide-react';

const GROUPS: Array<'Family' | 'Friends' | 'VIP' | 'Colleagues' | 'Other'> = [
  'Family',
  'Friends',
  'VIP',
  'Colleagues',
  'Other'
];

export const GuestsPage: React.FC = () => {
  const { activeEvent, showToast } = useApp();

  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [groupFilter, setGroupFilter] = useState<string>('All');
  const [rsvpFilter, setRsvpFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    contact_details: '',
    group_name: 'Family' as 'Family' | 'Friends' | 'VIP' | 'Colleagues' | 'Other',
    invitation_status: 'Sent' as 'Draft' | 'Sent',
    rsvp_status: 'Pending' as 'Pending' | 'Accepted' | 'Declined',
    plus_one_count: 0,
    dietary_preferences: ''
  });

  const loadGuests = async () => {
    if (!activeEvent) return;
    setLoading(true);
    try {
      const data = await api.getGuests(activeEvent.id);
      setGuests(data);
    } catch (err) {
      console.error("Guests load error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGuests();
  }, [activeEvent?.id]);

  const handleOpenAdd = () => {
    setEditingGuest(null);
    setFormData({
      name: '',
      contact_details: '',
      group_name: 'Friends',
      invitation_status: 'Sent',
      rsvp_status: 'Pending',
      plus_one_count: 0,
      dietary_preferences: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (g: Guest) => {
    setEditingGuest(g);
    setFormData({
      name: g.name,
      contact_details: g.contact_details || '',
      group_name: g.group_name,
      invitation_status: g.invitation_status,
      rsvp_status: g.rsvp_status,
      plus_one_count: g.plus_one_count || 0,
      dietary_preferences: g.dietary_preferences || ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this guest?')) return;
    try {
      await api.deleteGuest(activeEvent!.id, id);
      setGuests(prev => prev.filter(g => g.id !== id));
      showToast('Guest removed', 'info');
    } catch (err: any) {
      showToast(err.message || 'Failed to delete guest', 'error');
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showToast('Guest name is required', 'error');
      return;
    }

    try {
      if (editingGuest) {
        const updated = await api.updateGuest(activeEvent!.id, editingGuest.id, formData);
        setGuests(prev => prev.map(g => g.id === editingGuest.id ? updated : g));
        showToast('Guest record updated', 'success');
      } else {
        const created = await api.addGuest(activeEvent!.id, formData);
        setGuests(prev => [created, ...prev]);
        showToast('Guest added to roster', 'success');
      }
      setIsModalOpen(false);
    } catch (err: any) {
      showToast(err.message || 'Failed to save guest', 'error');
    }
  };

  const handleExportCsv = () => {
    if (!activeEvent) return;
    const url = api.getGuestsExportUrl(activeEvent.id);
    window.open(url, '_blank');
    showToast('Exporting guest list to CSV...', 'info');
  };

  if (!activeEvent) {
    return <div className="text-center py-12 text-slate-500">Please select an event.</div>;
  }

  // Filtered guests
  const filteredGuests = guests.filter(g => {
    if (groupFilter !== 'All' && g.group_name !== groupFilter) return false;
    if (rsvpFilter !== 'All' && g.rsvp_status !== rsvpFilter) return false;
    if (searchQuery.trim() && !g.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  // Counters
  const acceptedGuestsCount = guests.filter(g => g.rsvp_status === 'Accepted').reduce((sum, g) => sum + 1 + (g.plus_one_count || 0), 0);
  const pendingCount = guests.filter(g => g.rsvp_status === 'Pending').length;
  const declinedCount = guests.filter(g => g.rsvp_status === 'Declined').length;
  const totalInvitations = guests.length;

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-700 border border-brand-200">
              Guest & RSVP Management
            </span>
            <span className="text-xs text-slate-500">• {activeEvent.name}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1.5">
            Guest List & Dietary Tracker
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Organize invitations, track RSVPs, plus-ones, and export complete rosters to CSV.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-xs transition-colors"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export to CSV</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md shadow-brand-500/20 transition-all hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4" />
            <span>Add Guest</span>
          </button>
        </div>
      </div>

      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Invitations</span>
          <p className="text-2xl font-black text-slate-900 mt-1">{totalInvitations}</p>
          <span className="text-[11px] text-slate-400">Target: {activeEvent.guest_count} guests</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">Confirmed Attendees</span>
          <p className="text-2xl font-black text-emerald-700 mt-1">{acceptedGuestsCount}</p>
          <span className="text-[11px] text-slate-400">Including Plus-Ones</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600">Pending RSVPs</span>
          <p className="text-2xl font-black text-amber-700 mt-1">{pendingCount}</p>
          <span className="text-[11px] text-slate-400">Awaiting Response</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600">Declined Invitations</span>
          <p className="text-2xl font-black text-rose-700 mt-1">{declinedCount}</p>
          <span className="text-[11px] text-slate-400">Unable to Attend</span>
        </div>

      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Group Filter */}
          <div className="flex rounded-xl bg-slate-100 p-1">
            <button
              onClick={() => setGroupFilter('All')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                groupFilter === 'All' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              All Groups
            </button>
            {GROUPS.map(grp => (
              <button
                key={grp}
                onClick={() => setGroupFilter(grp)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  groupFilter === grp ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {grp}
              </button>
            ))}
          </div>

          {/* RSVP Status Filter */}
          <select
            value={rsvpFilter}
            onChange={e => setRsvpFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:outline-none"
          >
            <option value="All">All RSVP Statuses</option>
            <option value="Accepted">Accepted Only</option>
            <option value="Pending">Pending Only</option>
            <option value="Declined">Declined Only</option>
          </select>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search guest by name..."
            className="w-full pl-9 pr-4 py-1.5 rounded-xl border border-slate-200 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
      </div>

      {/* Guest Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3.5 px-5">Guest Name</th>
                <th className="py-3.5 px-4">Group</th>
                <th className="py-3.5 px-4 text-center">RSVP Status</th>
                <th className="py-3.5 px-4 text-center">Attendees (+1s)</th>
                <th className="py-3.5 px-4">Dietary Notes</th>
                <th className="py-3.5 px-4">Contact</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredGuests.map(guest => {
                let rsvpBadge = 'bg-amber-100 text-amber-800';
                if (guest.rsvp_status === 'Accepted') rsvpBadge = 'bg-emerald-100 text-emerald-800';
                if (guest.rsvp_status === 'Declined') rsvpBadge = 'bg-rose-100 text-rose-800';

                return (
                  <tr key={guest.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-4 px-5">
                      <p className="font-bold text-slate-900 text-sm">{guest.name}</p>
                      <span className="text-[10px] text-slate-400">Invite: {guest.invitation_status}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-700">
                        {guest.group_name}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${rsvpBadge}`}>
                        {guest.rsvp_status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center font-bold text-slate-800">
                      {1 + (guest.plus_one_count || 0)}
                      {guest.plus_one_count > 0 && (
                        <span className="block text-[10px] text-slate-400 font-normal">
                          (+{guest.plus_one_count} guests)
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-slate-600 font-medium">
                      {guest.dietary_preferences || 'Standard Menu'}
                    </td>
                    <td className="py-4 px-4 text-slate-500 font-medium truncate max-w-[150px]">
                      {guest.contact_details || '—'}
                    </td>
                    <td className="py-4 px-5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenEdit(guest)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-brand-50 transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(guest.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredGuests.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    No guests match your filters. Click "Add Guest" to add invitees.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Guest Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-100 animate-scale-up">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">
                {editingGuest ? 'Edit Guest Information' : 'Add Guest to Roster'}
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
                <label className="block text-xs font-bold text-slate-700 mb-1">Guest Name(s) *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Vikramaditya & Sunita Rathore"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Group Affiliation</label>
                  <select
                    value={formData.group_name}
                    onChange={e => setFormData({ ...formData, group_name: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                  >
                    {GROUPS.map(grp => (
                      <option key={grp} value={grp}>{grp}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">RSVP Status</label>
                  <select
                    value={formData.rsvp_status}
                    onChange={e => setFormData({ ...formData, rsvp_status: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Accepted">Accepted (Attending)</option>
                    <option value="Declined">Declined</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Plus-One / Additional Attendees</label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={formData.plus_one_count}
                    onChange={e => setFormData({ ...formData, plus_one_count: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Invitation Status</label>
                  <select
                    value={formData.invitation_status}
                    onChange={e => setFormData({ ...formData, invitation_status: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                  >
                    <option value="Sent">Sent</option>
                    <option value="Draft">Draft (Not Sent)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Dietary Preferences & Allergies</label>
                <input
                  type="text"
                  value={formData.dietary_preferences}
                  onChange={e => setFormData({ ...formData, dietary_preferences: e.target.value })}
                  placeholder="e.g. Pure Vegetarian, Jain food, Nut allergy, Diabetic"
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Phone / Email Contact</label>
                <input
                  type="text"
                  value={formData.contact_details}
                  onChange={e => setFormData({ ...formData, contact_details: e.target.value })}
                  placeholder="+91 98111 22334 | vikram@rathore.com"
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
                  {editingGuest ? 'Save Changes' : 'Add Guest'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
