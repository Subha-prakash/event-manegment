import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { getErrorMessage } from '../types';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  Calendar,
  DollarSign,
  MapPin,
  Users,
  Compass,
  Utensils,
  Music,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Loader2
} from 'lucide-react';

export const CreateEventPage: React.FC = () => {
  const { setActiveEventId, refreshEvents, showToast } = useApp();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStage, setGenerationStage] = useState('Initializing AI Planner...');

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    event_type: 'Wedding',
    event_date: new Date(Date.now() + 60 * 86400000).toISOString().split('T')[0],
    end_date: '',
    location: 'Jaipur, Rajasthan',
    guest_count: 200,
    budget: 800000,
    currency: 'INR',
    theme: 'Royal Rajputana & Warm Marigold Elegance',
    preferences: {
      venue_type: 'Outdoor Palace Lawn & Courtyard',
      food_preferences: 'North Indian Vegetarian & Live Street Chaat Counters',
      cultural_traditions: 'Traditional Hindu Ceremonies & Sangeet Night',
      formality: 'Regal / Formal Traditional',
      special_requests: 'Fairy lights canopy and eco-friendly floral rangolis'
    }
  });

  const updatePreference = (key: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [key]: value
      }
    }));
  };

  const handleNext = () => {
    if (currentStep === 1) {
      if (!formData.name.trim()) {
        showToast('Please enter an event name', 'error');
        return;
      }
      if (!formData.location.trim()) {
        showToast('Please enter a location or city', 'error');
        return;
      }
    }
    setCurrentStep(prev => Math.min(4, prev + 1));
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(1, prev - 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);

    try {
      setGenerationStage('Formulating personalized concept and theme...');
      setTimeout(() => setGenerationStage('Allocating category-wise budget with deterministic math...'), 800);
      setTimeout(() => setGenerationStage('Generating customized 90-day preparation timeline...'), 1600);
      setTimeout(() => setGenerationStage('Compiling vendor checklist and dietary recommendations...'), 2400);

      const newEvent = await api.createEvent({
        ...formData,
        guest_count: Number(formData.guest_count),
        budget: Number(formData.budget)
      });

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });

      showToast(`Master plan for "${newEvent.name}" generated successfully!`, 'success');
      await refreshEvents();
      setActiveEventId(newEvent.id);
      navigate('/plan');
    } catch (err: unknown) {
      showToast(getErrorMessage(err), 'error');
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-6 animate-fade-in pb-16">
      
      {/* Title & Wizard Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-bold uppercase tracking-wider mb-2">
          <Sparkles className="w-3.5 h-3.5 text-brand-600 animate-pulse" />
          AI Event Creation Wizard
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900">
          Tell Us About Your Vision
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Our Generative AI will build a complete, actionable event blueprint including budget, vendor tasks, and schedule.
        </p>

        {/* Progress Bar */}
        <div className="mt-8 max-w-lg mx-auto flex items-center justify-between relative">
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-200 -translate-y-1/2 -z-0" />
          <div
            className="absolute top-1/2 left-0 h-0.5 bg-brand-600 -translate-y-1/2 -z-0 transition-all duration-300"
            style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
          />

          {[
            { step: 1, label: 'Basics' },
            { step: 2, label: 'Scale & Budget' },
            { step: 3, label: 'Atmosphere' },
            { step: 4, label: 'Customization' },
          ].map(s => {
            const isCompleted = currentStep > s.step;
            const isCurrent = currentStep === s.step;
            return (
              <div key={s.step} className="flex flex-col items-center relative z-10">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all shadow-xs ${
                    isCompleted
                      ? 'bg-brand-600 text-white'
                      : isCurrent
                      ? 'bg-brand-600 text-white ring-4 ring-brand-100'
                      : 'bg-white border-2 border-slate-200 text-slate-400'
                  }`}
                >
                  {isCompleted ? <CheckCircle className="w-4 h-4" /> : s.step}
                </div>
                <span className={`text-[11px] font-semibold mt-1.5 ${isCurrent ? 'text-brand-700' : 'text-slate-400'}`}>
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Wizard Form Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xl p-6 sm:p-10 relative overflow-hidden">
        
        {/* Loading Overlay when AI is generating */}
        {isGenerating && (
          <div className="absolute inset-0 bg-white/95 backdrop-blur-md z-50 flex flex-col items-center justify-center p-6 text-center animate-fade-in">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-white shadow-xl shadow-brand-500/30 animate-pulse mb-6">
              <Sparkles className="w-8 h-8 animate-spin" />
            </div>
            <h3 className="text-2xl font-extrabold text-slate-900">EventGenie AI is Planning...</h3>
            <p className="text-sm font-semibold text-brand-600 mt-2 h-6 animate-fade-in">
              {generationStage}
            </p>
            <p className="text-xs text-slate-400 mt-4 max-w-sm">
              Applying deterministic budgeting, regional vendor checklists, and optimal timeline scheduling.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          
          {/* STEP 1: BASICS */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-brand-600" />
                <span>Step 1: Event Fundamentals</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Event Title / Celebration Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Aarav & Meera's Royal Wedding, Rohit's 30th Birthday Bash, TechNova Fest"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Event Type *
                  </label>
                  <select
                    value={formData.event_type}
                    onChange={e => setFormData({ ...formData, event_type: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all font-medium bg-white"
                  >
                    <option value="Wedding">Wedding & Pre-wedding Ceremonies</option>
                    <option value="Birthday">Birthday Party</option>
                    <option value="Anniversary">Anniversary Celebration</option>
                    <option value="College Fest">College Fest & Technical Hackathon</option>
                    <option value="Community Event">Community Gathering / Festival</option>
                    <option value="Corporate Event">Corporate Meeting & Gala</option>
                    <option value="Other">Private Party / Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Location or Host City *
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      required
                      value={formData.location}
                      onChange={e => setFormData({ ...formData, location: e.target.value })}
                      placeholder="e.g. Jaipur, Rajasthan or Bangalore, Karnataka"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Event Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.event_date}
                    onChange={e => setFormData({ ...formData, event_date: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all font-medium bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    End Date (For Multi-Day Events)
                  </label>
                  <input
                    type="date"
                    value={formData.end_date}
                    onChange={e => setFormData({ ...formData, end_date: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all font-medium bg-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: SCALE & BUDGET */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-brand-600" />
                <span>Step 2: Guest Count & Budget Scope</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Estimated Guest Headcount *
                  </label>
                  <div className="relative">
                    <Users className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="number"
                      min="5"
                      max="10000"
                      required
                      value={formData.guest_count}
                      onChange={e => setFormData({ ...formData, guest_count: Number(e.target.value) })}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all font-semibold"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Helps AI calibrate catering portions, seating, and venue square footage.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Currency *
                  </label>
                  <select
                    value={formData.currency}
                    onChange={e => setFormData({ ...formData, currency: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all font-semibold bg-white"
                  >
                    <option value="INR">INR (₹ - Indian Rupee)</option>
                    <option value="USD">USD ($ - US Dollar)</option>
                    <option value="EUR">EUR (€ - Euro)</option>
                    <option value="GBP">GBP (£ - British Pound)</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Total Available Budget ({formData.currency}) *
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="1000"
                      required
                      value={formData.budget}
                      onChange={e => setFormData({ ...formData, budget: Number(e.target.value) })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 text-base focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all font-extrabold text-brand-900"
                    />
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                    <span>
                      Quick presets:
                      <button type="button" onClick={() => setFormData({ ...formData, budget: 50000 })} className="ml-2 underline text-brand-600">50K</button>
                      <button type="button" onClick={() => setFormData({ ...formData, budget: 300000 })} className="ml-2 underline text-brand-600">3 Lakhs</button>
                      <button type="button" onClick={() => setFormData({ ...formData, budget: 800000 })} className="ml-2 underline text-brand-600">8 Lakhs</button>
                      <button type="button" onClick={() => setFormData({ ...formData, budget: 1500000 })} className="ml-2 underline text-brand-600">15 Lakhs</button>
                    </span>
                    <span className="font-semibold text-slate-700">
                      Approx {formData.currency} {Math.round(formData.budget / (formData.guest_count || 1)).toLocaleString()} / guest
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: ATMOSPHERE & VIBE */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Compass className="w-5 h-5 text-brand-600" />
                <span>Step 3: Theme, Venue & Food Preferences</span>
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Preferred Theme & Visual Style
                  </label>
                  <input
                    type="text"
                    value={formData.theme}
                    onChange={e => setFormData({ ...formData, theme: e.target.value })}
                    placeholder="e.g. Royal Rajputana Heritage, Cyberpunk Neon Glow, Minimalist Bohemian Garden"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all font-medium"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Venue Style (Indoor / Outdoor)
                    </label>
                    <input
                      type="text"
                      value={formData.preferences.venue_type}
                      onChange={e => updatePreference('venue_type', e.target.value)}
                      placeholder="e.g. Palace Courtyard, Banquet Hall, Beachfront Lawn, Auditorium"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Food & Catering Preferences
                    </label>
                    <input
                      type="text"
                      value={formData.preferences.food_preferences}
                      onChange={e => updatePreference('food_preferences', e.target.value)}
                      placeholder="e.g. North Indian Vegetarian, Jain Counter, Live Chaat, Vegan options"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all font-medium"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: CUSTOMIZATION & REVIEW */}
          {currentStep === 4 && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-brand-600" />
                <span>Step 4: Cultural Traditions & Fine Details</span>
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Cultural Traditions & Ceremonies
                  </label>
                  <input
                    type="text"
                    value={formData.preferences.cultural_traditions}
                    onChange={e => updatePreference('cultural_traditions', e.target.value)}
                    placeholder="e.g. Traditional Hindu ceremonies, Haldi & Sangeet, Modern Tech Keynote, Cake cutting"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all font-medium"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Level of Formality
                    </label>
                    <select
                      value={formData.preferences.formality}
                      onChange={e => updatePreference('formality', e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all font-medium bg-white"
                    >
                      <option value="Casual & Relaxed">Casual & Relaxed</option>
                      <option value="Semi-Formal">Semi-Formal</option>
                      <option value="Regal / Formal Traditional">Regal / Formal Traditional</option>
                      <option value="Black Tie / High Corporate">Black Tie / High Corporate</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Special Requests & Must-Haves
                    </label>
                    <input
                      type="text"
                      value={formData.preferences.special_requests}
                      onChange={e => updatePreference('special_requests', e.target.value)}
                      placeholder="e.g. Dedicated drone photography, wheelchair access, sleeping pods"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all font-medium"
                    />
                  </div>
                </div>

                {/* Review Summary Box */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600 space-y-1 mt-4">
                  <p className="font-bold text-slate-800 text-sm mb-1.5">Ready to Generate Plan</p>
                  <p>• <strong>Event:</strong> {formData.name || 'Untitled Event'} ({formData.event_type}) in {formData.location}</p>
                  <p>• <strong>Scale:</strong> {formData.guest_count} guests with budget of {formData.currency} {Number(formData.budget).toLocaleString()}</p>
                  <p>• <strong>Style:</strong> {formData.theme} • {formData.preferences.venue_type}</p>
                </div>
              </div>
            </div>
          )}

          {/* Wizard Action Buttons */}
          <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                disabled={isGenerating}
                className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold text-sm hover:bg-slate-50 transition-colors flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            ) : <div />}

            {currentStep < 4 ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-md shadow-brand-500/20 transition-all flex items-center gap-2"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={isGenerating}
                className="px-8 py-3 rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 text-white font-extrabold text-sm shadow-lg shadow-brand-500/25 transition-all flex items-center gap-2 hover:scale-[1.02]"
              >
                <Sparkles className="w-4 h-4 animate-spin text-brand-200" />
                <span>Generate Master Plan with AI</span>
              </button>
            )}
          </div>

        </form>

      </div>

    </div>
  );
};
