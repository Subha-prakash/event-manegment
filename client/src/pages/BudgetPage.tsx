import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { Expense, BudgetSummary } from '../types';
import {
  PieChart as PieIcon,
  Plus,
  Trash2,
  Edit2,
  AlertTriangle,
  CheckCircle2,
  Info,
  DollarSign,
  TrendingDown,
  Sparkles,
  ArrowUpDown,
  Filter,
  X
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Legend
} from 'recharts';

const CATEGORIES = [
  "Venue and accommodation",
  "Decoration and flowers",
  "Catering and beverages",
  "Photography and videography",
  "Entertainment and music",
  "Invitations and stationery",
  "Clothing and makeup",
  "Transportation",
  "Equipment and lighting",
  "Gifts and miscellaneous expenses",
  "Emergency contingency fund"
];

export const BudgetPage: React.FC = () => {
  const { activeEvent, formatCurrency, refreshActiveEvent, showToast } = useApp();

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [summary, setSummary] = useState<BudgetSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [formData, setFormData] = useState({
    category: CATEGORIES[0],
    description: '',
    estimated_amount: 0,
    quoted_amount: 0,
    actual_amount: 0,
    payment_status: 'Pending' as 'Paid' | 'Partially Paid' | 'Pending',
    due_date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  const loadData = async () => {
    if (!activeEvent) return;
    setLoading(true);
    try {
      const [expList, summaryData] = await Promise.all([
        api.getExpenses(activeEvent.id),
        api.getBudgetSummary(activeEvent.id)
      ]);
      setExpenses(expList);
      setSummary(summaryData);
    } catch (err) {
      console.error("Budget load error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeEvent?.id]);

  const handleOpenAdd = () => {
    setEditingExpense(null);
    setFormData({
      category: CATEGORIES[0],
      description: '',
      estimated_amount: 0,
      quoted_amount: 0,
      actual_amount: 0,
      payment_status: 'Pending',
      due_date: new Date().toISOString().split('T')[0],
      notes: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: Expense) => {
    setEditingExpense(item);
    setFormData({
      category: item.category,
      description: item.description,
      estimated_amount: item.estimated_amount,
      quoted_amount: item.quoted_amount,
      actual_amount: item.actual_amount,
      payment_status: item.payment_status,
      due_date: item.due_date || new Date().toISOString().split('T')[0],
      notes: item.notes || ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this expense item?')) return;
    try {
      await api.deleteExpense(activeEvent!.id, id);
      showToast('Expense item removed', 'info');
      await loadData();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete expense', 'error');
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.description.trim()) {
      showToast('Please enter an expense description', 'error');
      return;
    }

    try {
      if (editingExpense) {
        await api.updateExpense(activeEvent!.id, editingExpense.id, formData);
        showToast('Expense updated', 'success');
      } else {
        await api.addExpense(activeEvent!.id, formData);
        showToast('Expense item added', 'success');
      }
      setIsModalOpen(false);
      await loadData();
    } catch (err: any) {
      showToast(err.message || 'Failed to save expense', 'error');
    }
  };

  if (!activeEvent) {
    return <div className="text-center py-12 text-slate-500">Please select an event.</div>;
  }

  const filteredExpenses = selectedCategory === 'All'
    ? expenses
    : expenses.filter(e => e.category === selectedCategory);

  const COLORS = ['#7c3aed', '#6366f1', '#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#14b8a6', '#f43f5e', '#64748b'];

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-700 border border-brand-200">
              Deterministic Budget Planner
            </span>
            <span className="text-xs text-slate-500">• {activeEvent.name}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1.5">
            Event Budget & Cost Control
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track Estimated, Quoted, and Actual expenses with automatic calculations and savings suggestions.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md shadow-brand-500/20 transition-all hover:scale-[1.02]"
        >
          <Plus className="w-4 h-4" />
          <span>Add Expense Item</span>
        </button>
      </div>

      {/* 5 Key Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Budget Limit</span>
          <p className="text-xl font-black text-slate-900 mt-1">
            {formatCurrency(summary?.totalBudget || activeEvent.budget)}
          </p>
          <span className="text-[11px] text-slate-400">Allocated Ceiling</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600">Total Estimated</span>
          <p className="text-xl font-black text-purple-700 mt-1">
            {formatCurrency(summary?.totalEstimated || 0)}
          </p>
          <span className="text-[11px] text-slate-400">Preliminary Plan</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">Total Quoted</span>
          <p className="text-xl font-black text-indigo-700 mt-1">
            {formatCurrency(summary?.totalQuoted || 0)}
          </p>
          <span className="text-[11px] text-slate-400">Vendor Bids</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600">Total Actual Paid</span>
          <p className="text-xl font-black text-brand-900 mt-1">
            {formatCurrency(summary?.totalActual || 0)}
          </p>
          <span className="text-[11px] font-bold text-brand-600">{summary?.utilizationPercentage || 0}% Utilized</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs col-span-2 lg:col-span-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">Remaining Budget</span>
          <p className={`text-xl font-black mt-1 ${
            (summary?.remainingBudget || 0) < 0 ? 'text-rose-600' : 'text-emerald-700'
          }`}>
            {formatCurrency(summary?.remainingBudget || 0)}
          </p>
          <span className="text-[11px] text-slate-400">Available Balance</span>
        </div>

      </div>

      {/* AI Budget Recommendations Banner */}
      {summary?.recommendations && summary.recommendations.length > 0 && (
        <div className="space-y-2">
          {summary.recommendations.map((rec, i) => (
            <div
              key={i}
              className={`p-4 rounded-2xl border flex items-start gap-3 text-xs leading-relaxed ${
                rec.type === 'warning'
                  ? 'bg-rose-50 border-rose-200 text-rose-900'
                  : rec.type === 'info'
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-900'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-900'
              }`}
            >
              {rec.type === 'warning' ? (
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              ) : rec.type === 'info' ? (
                <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              )}
              <span>{rec.text}</span>
            </div>
          ))}
        </div>
      )}

      {/* Visual Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Donut Chart: Category Share */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
          <div className="mb-4">
            <h3 className="font-bold text-slate-900 text-sm sm:text-base">Category Distribution</h3>
            <p className="text-xs text-slate-400">Share of estimated costs across major event categories</p>
          </div>

          {summary?.categoryBreakdown && summary.categoryBreakdown.length > 0 ? (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={summary.categoryBreakdown}
                    dataKey="estimated"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                  >
                    {summary.categoryBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: any) => formatCurrency(Number(val))}
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="text-center py-12 text-xs text-slate-400">No category breakdown data available.</div>
          )}
        </div>

        {/* Bar Chart: Estimated vs Quoted vs Actual */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
          <div className="mb-4">
            <h3 className="font-bold text-slate-900 text-sm sm:text-base">Cost Comparison</h3>
            <p className="text-xs text-slate-400">Estimated Plan vs Quoted Bids vs Actual Paid amounts</p>
          </div>

          {summary?.categoryBreakdown && summary.categoryBreakdown.length > 0 ? (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={summary.categoryBreakdown.slice(0, 5).map(c => ({
                    name: c.category.length > 12 ? c.category.substring(0, 10) + '..' : c.category,
                    Estimated: c.estimated,
                    Quoted: c.quoted,
                    Actual: c.actual
                  }))}
                  margin={{ top: 10, right: 10, left: 10, bottom: 20 }}
                >
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip
                    formatter={(val: any) => formatCurrency(Number(val))}
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }}
                  />
                  <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
                  <Bar dataKey="Estimated" fill="#c4b5fd" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Quoted" fill="#818cf8" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Actual" fill="#7c3aed" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="text-center py-12 text-xs text-slate-400">No chart data available.</div>
          )}
        </div>

      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setSelectedCategory('All')}
          className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            selectedCategory === 'All'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          All Categories ({expenses.length})
        </button>
        {CATEGORIES.map(cat => {
          const count = expenses.filter(e => e.category === cat).length;
          if (count === 0 && selectedCategory !== cat) return null;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-brand-600 text-white font-bold shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {cat} ({count})
            </button>
          );
        })}
      </div>

      {/* Expenses Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3.5 px-5">Expense & Category</th>
                <th className="py-3.5 px-4 text-right">Estimated</th>
                <th className="py-3.5 px-4 text-right">Quoted</th>
                <th className="py-3.5 px-4 text-right">Actual Paid</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4">Due Date</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredExpenses.map(item => {
                let badge = 'bg-slate-100 text-slate-600';
                if (item.payment_status === 'Paid') badge = 'bg-emerald-100 text-emerald-800';
                if (item.payment_status === 'Partially Paid') badge = 'bg-amber-100 text-amber-800';
                if (item.payment_status === 'Pending') badge = 'bg-rose-100 text-rose-800';

                return (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-4 px-5">
                      <p className="font-bold text-slate-900 text-sm">{item.description}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">{item.category}</p>
                      {item.notes && <p className="text-[11px] text-slate-500 italic mt-0.5">{item.notes}</p>}
                    </td>
                    <td className="py-4 px-4 text-right font-medium text-purple-700">
                      {formatCurrency(item.estimated_amount)}
                    </td>
                    <td className="py-4 px-4 text-right font-medium text-indigo-700">
                      {formatCurrency(item.quoted_amount)}
                    </td>
                    <td className="py-4 px-4 text-right font-bold text-slate-900">
                      {formatCurrency(item.actual_amount)}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${badge}`}>
                        {item.payment_status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-slate-500 font-medium">
                      {item.due_date || '—'}
                    </td>
                    <td className="py-4 px-5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-brand-50 transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredExpenses.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    No expense records found for this category. Click "Add Expense Item" to create one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Expense Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-100 animate-scale-up">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">
                {editingExpense ? 'Edit Expense Item' : 'Add New Expense Item'}
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
                <label className="block text-xs font-bold text-slate-700 mb-1">Expense Description *</label>
                <input
                  type="text"
                  required
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  placeholder="e.g. Traditional Mandap Decor & Fresh Marigolds"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Category *</label>
                <select
                  value={formData.category}
                  onChange={e => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Estimated ({activeEvent.currency})</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.estimated_amount}
                    onChange={e => setFormData({ ...formData, estimated_amount: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Quoted ({activeEvent.currency})</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.quoted_amount}
                    onChange={e => setFormData({ ...formData, quoted_amount: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Actual Paid ({activeEvent.currency})</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.actual_amount}
                    onChange={e => setFormData({ ...formData, actual_amount: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Payment Status</label>
                  <select
                    value={formData.payment_status}
                    onChange={e => setFormData({ ...formData, payment_status: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Partially Paid">Partially Paid</option>
                    <option value="Paid">Paid</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Payment Due Date</label>
                  <input
                    type="date"
                    value={formData.due_date}
                    onChange={e => setFormData({ ...formData, due_date: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Notes & Invoicing Info</label>
                <input
                  type="text"
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="e.g. 50% advance invoice paid via NEFT"
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
                  {editingExpense ? 'Save Changes' : 'Add Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
