import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { PlanData } from '../types';
import {
  Sparkles,
  RefreshCw,
  Save,
  CheckCircle2,
  Calendar,
  Utensils,
  Palette,
  Home,
  Music,
  Users,
  Store,
  DollarSign,
  AlertCircle,
  Lightbulb,
  Edit3
} from 'lucide-react';

export const PlanPage: React.FC = () => {
  const { activeEvent, formatCurrency, refreshActiveEvent, showToast } = useApp();

  const [plan, setPlan] = useState<PlanData>(() => activeEvent?.plan_data || {});
  const [regeneratingSection, setRegeneratingSection] = useState<string | null>(null);
  const [modalSection, setModalSection] = useState<string | null>(null);
  const [sectionPrompt, setSectionPrompt] = useState<string>('');
  const [saving, setSaving] = useState(false);

  // Sync when activeEvent changes
  React.useEffect(() => {
    if (activeEvent?.plan_data) {
      setPlan(activeEvent.plan_data);
    }
  }, [activeEvent?.id]);

  if (!activeEvent) {
    return (
      <div className="text-center py-16 bg-white rounded-3xl border border-slate-200">
        <Sparkles className="w-10 h-10 text-brand-600 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-slate-800">No Active Event Selected</h2>
        <p className="text-xs text-slate-400 mt-1">Select or create an event to view its AI Master Plan.</p>
      </div>
    );
  }

  const handleSavePlan = async () => {
    setSaving(true);
    try {
      await api.updateEvent(activeEvent.id, { plan_data: plan });
      await refreshActiveEvent();
      showToast('Master Plan saved successfully!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to save plan', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleRegenerate = async (sectionKey: string, customInstruction?: string) => {
    setRegeneratingSection(sectionKey);
    try {
      const res = await api.regenerateSection(activeEvent.id, sectionKey, customInstruction);
      setPlan(res.fullPlan);
      showToast(`Regenerated section "${sectionKey.replace(/_/g, ' ')}" with AI`, 'success');
      setModalSection(null);
      setSectionPrompt('');
    } catch (err: any) {
      showToast(err.message || 'Regeneration failed', 'error');
    } finally {
      setRegeneratingSection(null);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-700 border border-brand-200">
              AI Master Plan
            </span>
            <span className="text-xs text-slate-500">• {activeEvent.name}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1.5">
            Personalized Event Blueprint
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Generated with Google Gemini AI. You can edit any field or regenerate individual sections on-demand.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSavePlan}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md shadow-brand-500/20 transition-all hover:scale-[1.02]"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </div>

      {/* Concept & Theme Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-brand-900 via-indigo-900 to-slate-900 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center justify-between gap-4 mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-brand-300" />
              <span className="text-xs font-bold uppercase tracking-wider text-brand-200">
                1. Concept & Theme Vision
              </span>
            </div>
            <button
              onClick={() => handleRegenerate('concept_and_theme')}
              disabled={regeneratingSection === 'concept_and_theme'}
              className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-brand-200 backdrop-blur-md transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${regeneratingSection === 'concept_and_theme' ? 'animate-spin' : ''}`} />
              <span>Regenerate Theme</span>
            </button>
          </div>

          <textarea
            rows={3}
            value={plan.concept_and_theme || ''}
            onChange={e => setPlan({ ...plan, concept_and_theme: e.target.value })}
            className="w-full bg-white/10 border border-white/15 rounded-2xl p-4 text-white text-sm sm:text-base leading-relaxed focus:outline-none focus:ring-2 focus:ring-brand-400 font-medium"
            placeholder="Event concept and theme description..."
          />
        </div>
      </div>

      {/* Grid of Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* SECTION 2: DECORATION IDEAS */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Palette className="w-5 h-5 text-purple-600" />
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">2. Decoration Ideas & Aesthetics</h3>
            </div>
            <button
              onClick={() => setModalSection('decoration_ideas')}
              className="text-xs font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Regenerate</span>
            </button>
          </div>

          <div className="space-y-2.5">
            {plan.decoration_ideas?.map((item, idx) => (
              <div key={idx} className="p-3.5 rounded-2xl bg-purple-50/50 border border-purple-100 flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-purple-200 text-purple-800 text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <input
                  type="text"
                  value={item}
                  onChange={e => {
                    const copy = [...(plan.decoration_ideas || [])];
                    copy[idx] = e.target.value;
                    setPlan({ ...plan, decoration_ideas: copy });
                  }}
                  className="flex-1 bg-transparent text-xs text-slate-800 font-medium focus:outline-none"
                />
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 3: VENUE REQUIREMENTS */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Home className="w-5 h-5 text-indigo-600" />
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">3. Venue & Logistics Requirements</h3>
            </div>
            <button
              onClick={() => handleRegenerate('venue_requirements')}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Regenerate</span>
            </button>
          </div>

          <div className="space-y-2.5">
            {plan.venue_requirements?.map((item, idx) => (
              <div key={idx} className="p-3.5 rounded-2xl bg-indigo-50/50 border border-indigo-100 flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <input
                  type="text"
                  value={item}
                  onChange={e => {
                    const copy = [...(plan.venue_requirements || [])];
                    copy[idx] = e.target.value;
                    setPlan({ ...plan, venue_requirements: copy });
                  }}
                  className="flex-1 bg-transparent text-xs text-slate-800 font-medium focus:outline-none"
                />
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 4: FOOD & CATERING */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Utensils className="w-5 h-5 text-amber-600" />
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">4. Food & Catering Suggestions</h3>
            </div>
            <button
              onClick={() => setModalSection('food_and_catering')}
              className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Regenerate</span>
            </button>
          </div>

          <div className="space-y-2.5">
            {plan.food_and_catering?.map((item, idx) => (
              <div key={idx} className="p-3.5 rounded-2xl bg-amber-50/50 border border-amber-100 flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-amber-200 text-amber-900 text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                  🍽️
                </span>
                <input
                  type="text"
                  value={item}
                  onChange={e => {
                    const copy = [...(plan.food_and_catering || [])];
                    copy[idx] = e.target.value;
                    setPlan({ ...plan, food_and_catering: copy });
                  }}
                  className="flex-1 bg-transparent text-xs text-slate-800 font-medium focus:outline-none"
                />
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 5: ENTERTAINMENT & MUSIC */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Music className="w-5 h-5 text-rose-600" />
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">5. Entertainment & Music Flow</h3>
            </div>
            <button
              onClick={() => handleRegenerate('entertainment_options')}
              className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Regenerate</span>
            </button>
          </div>

          <div className="space-y-2.5">
            {plan.entertainment_options?.map((item, idx) => (
              <div key={idx} className="p-3.5 rounded-2xl bg-rose-50/50 border border-rose-100 flex items-start gap-3">
                <span className="text-sm">🎵</span>
                <input
                  type="text"
                  value={item}
                  onChange={e => {
                    const copy = [...(plan.entertainment_options || [])];
                    copy[idx] = e.target.value;
                    setPlan({ ...plan, entertainment_options: copy });
                  }}
                  className="flex-1 bg-transparent text-xs text-slate-800 font-medium focus:outline-none"
                />
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 6: GUEST MANAGEMENT */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">6. Guest Management Recommendations</h3>
            </div>
            <button
              onClick={() => handleRegenerate('guest_management')}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Regenerate</span>
            </button>
          </div>

          <div className="space-y-2.5">
            {plan.guest_management?.map((item, idx) => (
              <div key={idx} className="p-3.5 rounded-2xl bg-blue-50/50 border border-blue-100 flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <input
                  type="text"
                  value={item}
                  onChange={e => {
                    const copy = [...(plan.guest_management || [])];
                    copy[idx] = e.target.value;
                    setPlan({ ...plan, guest_management: copy });
                  }}
                  className="flex-1 bg-transparent text-xs text-slate-800 font-medium focus:outline-none"
                />
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 7: VENDOR CHECKLIST */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Store className="w-5 h-5 text-emerald-600" />
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">7. Recommended Vendors & Services</h3>
            </div>
            <button
              onClick={() => handleRegenerate('vendor_checklist')}
              className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Regenerate</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {plan.vendor_checklist?.map((item, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-100 flex items-center gap-2 text-xs font-semibold text-emerald-900">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* SECTION 8: ESTIMATED EXPENSE BREAKDOWN */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-brand-600" />
              <h3 className="font-bold text-slate-900 text-base sm:text-lg">8. Estimated Expense Breakdown</h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">Calculated based on your total budget of {formatCurrency(activeEvent.budget)}</p>
          </div>
          <button
            onClick={() => handleRegenerate('budget_breakdown')}
            className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Recalculate Budget</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
          {plan.budget_breakdown?.map((b, idx) => (
            <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Category #{idx + 1}</span>
              <h4 className="font-bold text-slate-800 text-sm mt-0.5">{b.category}</h4>
              <p className="text-lg font-extrabold text-brand-700 mt-2">
                {formatCurrency(b.estimated_cost)}
              </p>
              <p className="text-xs text-slate-500 mt-1">{b.reason}</p>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 9 & 10: TIMELINE & REMINDERS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Timeline */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-600" />
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">9. Preparation Milestones</h3>
            </div>
            <button
              onClick={() => handleRegenerate('timeline')}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Regenerate</span>
            </button>
          </div>

          <div className="space-y-3">
            {plan.timeline?.map((t, idx) => (
              <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 text-xs flex items-start justify-between gap-3">
                <div>
                  <p className="font-bold text-slate-800">{t.task}</p>
                  <p className="text-slate-500 mt-0.5">{t.description}</p>
                </div>
                <span className="shrink-0 px-2.5 py-1 rounded-full font-bold bg-indigo-100 text-indigo-700 text-[10px]">
                  T-{t.days_before_event} Days
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Important Reminders */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-rose-600" />
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">10. Important Tasks & Reminders</h3>
            </div>
            <button
              onClick={() => handleRegenerate('important_reminders')}
              className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Regenerate</span>
            </button>
          </div>

          <div className="space-y-3">
            {plan.important_reminders?.map((rem, idx) => (
              <div key={idx} className="p-3.5 rounded-2xl bg-rose-50/50 border border-rose-100 text-xs text-rose-950 flex items-start gap-2.5">
                <span className="font-bold text-rose-600">⚠️</span>
                <p className="leading-relaxed font-medium">{rem}</p>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Custom Regeneration Modal */}
      {modalSection && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-100 animate-scale-up">
            <div className="flex items-center gap-2 text-brand-600 mb-2">
              <Sparkles className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-wider">AI Section Refinement</span>
            </div>
            <h3 className="text-xl font-bold text-slate-900">
              Regenerate {modalSection.replace(/_/g, ' ')}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Give our AI specific instructions (e.g. "Focus on vegan dishes and local fruits" or "Keep it budget-friendly").
            </p>

            <textarea
              rows={3}
              value={sectionPrompt}
              onChange={e => setSectionPrompt(e.target.value)}
              placeholder="e.g. Make it more intimate and emphasize warm lighting..."
              className="w-full mt-4 p-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setModalSection(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={() => handleRegenerate(modalSection, sectionPrompt)}
                disabled={Boolean(regeneratingSection)}
                className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-md"
              >
                {regeneratingSection ? 'Regenerating...' : 'Regenerate with AI'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
