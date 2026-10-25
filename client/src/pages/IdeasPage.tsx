import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { SavedIdea } from '../types';
import {
  Sparkles,
  Bookmark,
  Plus,
  Trash2,
  DollarSign,
  Tag,
  RefreshCw,
  Lightbulb,
  Heart,
  X
} from 'lucide-react';

const IDEA_CATEGORIES = [
  "All",
  "Themes",
  "DIY Decorations",
  "Return Gifts",
  "Games & Activities",
  "Invitation Wording",
  "Eco-friendly Celebration",
  "Unique Guest Experiences"
];

export const IdeasPage: React.FC = () => {
  const { activeEvent, formatCurrency, showToast } = useApp();

  const [ideas, setIdeas] = useState<SavedIdea[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [isGenerating, setIsGenerating] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [customIdea, setCustomIdea] = useState({
    category: 'DIY Decorations',
    title: '',
    description: '',
    estimated_cost: 500
  });

  const loadIdeas = async () => {
    if (!activeEvent) return;
    setLoading(true);
    try {
      const data = await api.getSavedIdeas(activeEvent.id);
      setIdeas(data);
    } catch (err) {
      console.error("Ideas load error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIdeas();
  }, [activeEvent?.id]);

  const handleGenerateAiIdeas = async () => {
    if (!activeEvent || isGenerating) return;
    setIsGenerating(true);
    try {
      const generated = await api.generateIdeas(activeEvent.id, activeCategory);
      // Save them to event
      for (const item of generated) {
        await api.addSavedIdea(activeEvent.id, item);
      }
      showToast(`Generated ${generated.length} fresh ideas with AI!`, 'success');
      await loadIdeas();
    } catch (err: any) {
      showToast(err.message || 'Failed to generate ideas', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDeleteIdea = async (id: string) => {
    try {
      await api.deleteSavedIdea(activeEvent!.id, id);
      setIdeas(prev => prev.filter(i => i.id !== id));
      showToast('Idea removed from collection', 'info');
    } catch (err: any) {
      showToast(err.message || 'Failed to delete idea', 'error');
    }
  };

  const handleAddCustomIdea = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customIdea.title.trim()) {
      showToast('Title is required', 'error');
      return;
    }

    try {
      const created = await api.addSavedIdea(activeEvent!.id, customIdea);
      setIdeas(prev => [created, ...prev]);
      showToast('Idea saved to collection', 'success');
      setIsModalOpen(false);
      setCustomIdea({ category: 'DIY Decorations', title: '', description: '', estimated_cost: 500 });
    } catch (err: any) {
      showToast(err.message || 'Failed to save idea', 'error');
    }
  };

  if (!activeEvent) {
    return <div className="text-center py-12 text-slate-500">Please select an event.</div>;
  }

  const filteredIdeas = activeCategory === 'All'
    ? ideas
    : ideas.filter(i => i.category.toLowerCase().includes(activeCategory.toLowerCase()));

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-700 border border-brand-200">
              Personalized AI Ideas Generator
            </span>
            <span className="text-xs text-slate-500">• {activeEvent.name}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1.5">
            Event Themes & Inspiration Library
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Curated DIY decor, party games, invitation copy, and return favors with cost estimates.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4 text-slate-500" />
            <span>Add Custom Idea</span>
          </button>

          <button
            onClick={handleGenerateAiIdeas}
            disabled={isGenerating}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 text-white font-bold text-xs shadow-md shadow-brand-500/20 transition-all hover:scale-[1.02]"
          >
            <Sparkles className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
            <span>{isGenerating ? 'Synthesizing Ideas...' : 'Generate with AI'}</span>
          </button>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {IDEA_CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeCategory === cat
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Ideas Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredIdeas.map(item => (
          <div
            key={item.id}
            className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="px-2.5 py-1 rounded-full bg-brand-50 border border-brand-100 text-brand-700 text-[10px] font-bold">
                  {item.category}
                </span>
                <span className="font-extrabold text-xs text-brand-900">
                  {item.estimated_cost > 0 ? `Est: ${formatCurrency(item.estimated_cost)}` : 'Free / DIY'}
                </span>
              </div>

              <h3 className="font-bold text-slate-900 text-base leading-snug">
                {item.title}
              </h3>

              <p className="text-xs text-slate-600 mt-2.5 leading-relaxed">
                {item.description}
              </p>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                {item.created_at ? new Date(item.created_at).toLocaleDateString() : 'Curated'}
              </span>
              <button
                onClick={() => handleDeleteIdea(item.id)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                title="Remove from collection"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}

        {filteredIdeas.length === 0 && (
          <div className="col-span-full text-center py-14 bg-white rounded-3xl border border-slate-200/80 text-slate-400 text-xs">
            No saved ideas in this category yet. Click "Generate with AI" to synthesize fresh suggestions!
          </div>
        )}
      </div>

      {/* Add Custom Idea Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-100 animate-scale-up">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Save Custom Idea</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddCustomIdea} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Idea Title *</label>
                <input
                  type="text"
                  required
                  value={customIdea.title}
                  onChange={e => setCustomIdea({ ...customIdea, title: e.target.value })}
                  placeholder="e.g. Polaroid Selfie Tree with Fairy Lights"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={customIdea.category}
                    onChange={e => setCustomIdea({ ...customIdea, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                  >
                    {IDEA_CATEGORIES.filter(c => c !== 'All').map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Estimated Cost ({activeEvent.currency})</label>
                  <input
                    type="number"
                    min="0"
                    value={customIdea.estimated_cost}
                    onChange={e => setCustomIdea({ ...customIdea, estimated_cost: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description & Details</label>
                <textarea
                  rows={3}
                  value={customIdea.description}
                  onChange={e => setCustomIdea({ ...customIdea, description: e.target.value })}
                  placeholder="How to implement this idea, required materials, or special notes..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
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
                  Save to Collection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
