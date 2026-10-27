import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { getErrorMessage } from '../types';
import {
  Settings,
  Sparkles,
  Key,
  ShieldAlert,
  Download,
  Trash2,
  CheckCircle2,
  Cpu,
  ExternalLink,
  Save,
  AlertTriangle,
  X
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const {
    activeEvent,
    refreshEvents,
    refreshActiveEvent,
    aiStatus,
    refreshAiStatus,
    showToast,
    formatCurrency
  } = useApp();

  const navigate = useNavigate();

  // Event Edit State
  const [formData, setFormData] = useState({
    name: activeEvent?.name || '',
    event_type: activeEvent?.event_type || 'Wedding',
    event_date: activeEvent?.event_date || '',
    location: activeEvent?.location || '',
    guest_count: activeEvent?.guest_count || 100,
    budget: activeEvent?.budget || 100000,
    currency: activeEvent?.currency || 'INR',
    theme: activeEvent?.theme || ''
  });

  // API Key State
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [isConfiguringKey, setIsConfiguringKey] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  // Sync when activeEvent changes
  React.useEffect(() => {
    if (activeEvent) {
      setFormData({
        name: activeEvent.name,
        event_type: activeEvent.event_type,
        event_date: activeEvent.event_date,
        location: activeEvent.location,
        guest_count: activeEvent.guest_count,
        budget: activeEvent.budget,
        currency: activeEvent.currency,
        theme: activeEvent.theme || ''
      });
    }
  }, [activeEvent?.id]);

  if (!activeEvent) {
    return <div className="text-center py-12 text-slate-500">Please select an event.</div>;
  }

  const handleSaveEventSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.updateEvent(activeEvent.id, {
        ...formData,
        guest_count: Number(formData.guest_count),
        budget: Number(formData.budget)
      });
      await refreshActiveEvent();
      await refreshEvents();
      showToast('Event settings saved successfully!', 'success');
    } catch (err: unknown) {
      showToast(getErrorMessage(err), 'error');
    }
  };

  const handleConfigureApiKey = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setIsConfiguringKey(true);
    try {
      const res = await api.configureApiKey(apiKeyInput);
      await refreshAiStatus();
      showToast(res.message, res.ai.hasKey ? 'success' : 'info');
      setApiKeyInput('');
    } catch (err: unknown) {
      showToast(getErrorMessage(err), 'error');
    } finally {
      setIsConfiguringKey(false);
    }
  };

  const handleExportFullJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(activeEvent, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${activeEvent.name.replace(/\s+/g, '_')}_master_plan.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Event blueprint exported to JSON', 'success');
  };

  const handleDeleteEvent = async () => {
    setIsDeleting(true);
    try {
      await api.deleteEvent(activeEvent.id);
      showToast(`Event "${activeEvent.name}" and all associated data deleted`, 'info');
      await refreshEvents();
      setDeleteConfirmOpen(false);
      navigate('/dashboard');
    } catch (err: unknown) {
      showToast(getErrorMessage(err), 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-20">
      
      {/* Header */}
      <div className="pb-6 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-700 border border-brand-200">
            Control Center
          </span>
          <span className="text-xs text-slate-500">• {activeEvent.name}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1.5">
          Event Settings & AI Engine
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Configure event details, toggle live Google Gemini AI keys, export backups, or manage lifecycle.
        </p>
      </div>

      {/* SECTION 1: AI ENGINE STATUS & GEMINI KEY CONFIGURATION */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-brand-500/20">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Google Gemini AI Engine</h2>
              <p className="text-xs text-slate-400">Manage LLM connectivity and runtime intelligence</p>
            </div>
          </div>

          <span className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${
            aiStatus?.hasKey
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-purple-50 text-purple-800 border-purple-200'
          }`}>
            <span className={`w-2 h-2 rounded-full ${aiStatus?.hasKey ? 'bg-emerald-500' : 'bg-purple-500 animate-pulse'}`} />
            <span>{aiStatus?.mode || 'Built-in Intelligent Planner'}</span>
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600 space-y-2">
          <p className="leading-relaxed">
            <strong>Active Mode:</strong> {aiStatus?.hasKey ? 'Live Google Gemini 3.8 Flash model via @google/genai SDK.' : 'Built-in Domain Planning Engine.'}
          </p>
          <p className="text-slate-500 leading-relaxed">
            If you have a Google Gemini API key, paste it below to enable live multimodal generation. If no key is provided, EventGenie AI seamlessly operates using its built-in rule-based intelligence engine.
          </p>
        </div>

        <form onSubmit={handleConfigureApiKey} className="space-y-3">
          <label className="block text-xs font-bold text-slate-700">
            Google Gemini API Key
          </label>
          <div className="flex flex-col sm:flex-row gap-2.5">
            <div className="relative flex-1">
              <Key className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="password"
                value={apiKeyInput}
                onChange={e => setApiKeyInput(e.target.value)}
                placeholder={aiStatus?.hasKey ? '••••••••••••••••••••••••••••••••' : 'AIzaSy... (Paste Gemini API Key)'}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono"
              />
            </div>
            <button
              type="submit"
              disabled={isConfiguringKey}
              className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-xs transition-colors shrink-0"
            >
              {isConfiguringKey ? 'Testing...' : 'Test & Save Key'}
            </button>
            {aiStatus?.hasKey && (
              <button
                type="button"
                onClick={() => handleConfigureApiKey()}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-semibold shrink-0"
              >
                Clear Key
              </button>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 pt-1">
            <span>Get your free Gemini API key at</span>
            <a
              href="https://aistudio.google.com"
              target="_blank"
              rel="noreferrer"
              className="text-brand-600 hover:underline flex items-center gap-0.5 font-semibold"
            >
              <span>Google AI Studio</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </form>
      </div>

      {/* SECTION 2: EVENT DETAILS & PREFERENCES */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Event Parameters</h2>
              <p className="text-xs text-slate-400">Modify baseline budget, date, and headcount</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSaveEventSettings} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">Event Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Event Type</label>
              <select
                value={formData.event_type}
                onChange={e => setFormData({ ...formData, event_type: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
              >
                <option value="Wedding">Wedding</option>
                <option value="Birthday">Birthday</option>
                <option value="Anniversary">Anniversary</option>
                <option value="College Fest">College Fest</option>
                <option value="Community Event">Community Event</option>
                <option value="Corporate Event">Corporate Event</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Event Date</label>
              <input
                type="date"
                required
                value={formData.event_date}
                onChange={e => setFormData({ ...formData, event_date: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Location / City</label>
              <input
                type="text"
                required
                value={formData.location}
                onChange={e => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Target Guest Count</label>
              <input
                type="number"
                min="1"
                required
                value={formData.guest_count}
                onChange={e => setFormData({ ...formData, guest_count: Number(e.target.value) })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Overall Budget</label>
              <input
                type="number"
                min="0"
                required
                value={formData.budget}
                onChange={e => setFormData({ ...formData, budget: Number(e.target.value) })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Currency</label>
              <select
                value={formData.currency}
                onChange={e => setFormData({ ...formData, currency: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white font-semibold"
              >
                <option value="INR">INR (₹ - Indian Rupee)</option>
                <option value="USD">USD ($ - US Dollar)</option>
                <option value="EUR">EUR (€ - Euro)</option>
                <option value="GBP">GBP (£ - British Pound)</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">Theme & Concept</label>
              <input
                type="text"
                value={formData.theme}
                onChange={e => setFormData({ ...formData, theme: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md transition-all hover:scale-[1.02]"
            >
              <Save className="w-4 h-4" />
              <span>Save Event Preferences</span>
            </button>
          </div>
        </form>
      </div>

      {/* SECTION 3: DATA EXPORT */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">Backup & Export Event Blueprint</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Download full structured JSON representation of your event, budget, timeline, and vendors.
          </p>
        </div>
        <button
          onClick={handleExportFullJson}
          className="px-5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-xs transition-colors flex items-center gap-2 shrink-0"
        >
          <Download className="w-4 h-4 text-slate-500" />
          <span>Export JSON Blueprint</span>
        </button>
      </div>

      {/* SECTION 4: DANGER ZONE */}
      <div className="p-6 sm:p-8 rounded-3xl bg-rose-50/50 border border-rose-200 shadow-xs space-y-4">
        <div className="flex items-center gap-2 text-rose-800">
          <ShieldAlert className="w-5 h-5" />
          <h2 className="text-base font-bold">Danger Zone</h2>
        </div>
        <p className="text-xs text-rose-700 leading-relaxed">
          Deleting this event will permanently purge all associated expenses, vendor records, preparation tasks, guest lists, and AI conversations. This action cannot be reversed.
        </p>

        <button
          type="button"
          onClick={() => setDeleteConfirmOpen(true)}
          className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-2"
        >
          <Trash2 className="w-4 h-4" />
          <span>Delete This Event Permanently</span>
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-100 animate-scale-up">
            <div className="flex items-center gap-2.5 text-rose-600 mb-3">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-lg font-bold text-slate-900">Confirm Event Deletion</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Are you completely certain you want to delete <strong>"{activeEvent.name}"</strong>?
              All records will be erased immediately.
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteConfirmOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteEvent}
                disabled={isDeleting}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md"
              >
                {isDeleting ? 'Deleting...' : 'Yes, Delete Event'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
