import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { Task, Vendor, Guest, BudgetSummary } from '../types';
import {
  Sparkles,
  Calendar,
  Clock,
  PieChart as PieIcon,
  CheckCircle2,
  AlertTriangle,
  Store,
  Users,
  ArrowUpRight,
  Plus,
  MessageSquare,
  ShieldAlert,
  ChevronRight,
  TrendingUp,
  MapPin
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
  YAxis
} from 'recharts';

export const DashboardPage: React.FC = () => {
  const { activeEvent, formatCurrency, showToast } = useApp();

  const [budgetSummary, setBudgetSummary] = useState<BudgetSummary | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);

  // Real-time Countdown timer state
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  const loadDashboardData = async () => {
    if (!activeEvent) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [summaryData, tasksData, vendorsData, guestsData] = await Promise.all([
        api.getBudgetSummary(activeEvent.id),
        api.getTasks(activeEvent.id),
        api.getVendors(activeEvent.id),
        api.getGuests(activeEvent.id)
      ]);
      setBudgetSummary(summaryData);
      setTasks(tasksData);
      setVendors(vendorsData);
      setGuests(guestsData);
    } catch (err) {
      console.error("Dashboard data load error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [activeEvent?.id]);

  // Real-time countdown
  useEffect(() => {
    if (!activeEvent?.event_date) return;

    const targetDate = new Date(`${activeEvent.event_date}T09:00:00`).getTime();

    const updateCountdown = () => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [activeEvent?.event_date]);

  const toggleTaskStatus = async (task: Task) => {
    const newStatus = task.status === 'Completed' ? 'In Progress' : 'Completed';
    try {
      await api.updateTask(task.event_id, task.id, { status: newStatus });
      setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: newStatus } : t));
      showToast(newStatus === 'Completed' ? 'Task marked complete!' : 'Task status updated', 'success');
    } catch (err) {
      showToast('Failed to update task', 'error');
    }
  };

  if (!activeEvent) {
    return (
      <div className="text-center py-20 bg-white rounded-3xl border border-slate-200/80 p-8 shadow-xs">
        <Sparkles className="w-12 h-12 text-brand-600 mx-auto animate-bounce mb-4" />
        <h2 className="text-2xl font-bold text-slate-800">No Active Event Selected</h2>
        <p className="text-slate-500 text-sm mt-2 max-w-md mx-auto">
          Create your first event with our AI assistant or select a demo event to start exploring!
        </p>
        <Link
          to="/create-event"
          className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-600 text-white font-bold text-sm shadow-md hover:bg-brand-700 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Event</span>
        </Link>
      </div>
    );
  }

  // Derived statistics
  const completedTasks = tasks.filter(t => t.status === 'Completed').length;
  const taskProgress = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;
  const confirmedVendorsCount = vendors.filter(v => v.booking_status === 'Confirmed' || v.booking_status === 'Booked').length;

  const acceptedGuests = guests.filter(g => g.rsvp_status === 'Accepted').reduce((acc, g) => acc + 1 + (g.plus_one_count || 0), 0);
  const pendingGuests = guests.filter(g => g.rsvp_status === 'Pending').reduce((acc, g) => acc + 1 + (g.plus_one_count || 0), 0);
  const declinedGuests = guests.filter(g => g.rsvp_status === 'Declined').reduce((acc, g) => acc + 1 + (g.plus_one_count || 0), 0);
  const totalHeadcount = acceptedGuests + pendingGuests;

  const COLORS = ['#7c3aed', '#6366f1', '#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      
      {/* Event Header Banner with Countdown */}
      <div className="bg-gradient-to-r from-slate-900 via-brand-950 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-brand-500/25 border border-brand-400/30 text-brand-300">
                {activeEvent.event_type}
              </span>
              <span className="flex items-center gap-1 text-xs text-slate-300">
                <MapPin className="w-3.5 h-3.5 text-brand-400" />
                {activeEvent.location}
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight mt-3 text-white">
              {activeEvent.name}
            </h1>

            <p className="text-sm text-slate-300 mt-2 max-w-xl">
              Theme: <span className="font-semibold text-brand-200">{activeEvent.theme || 'Custom Celebration'}</span>
            </p>
          </div>

          {/* Real-Time Countdown Cards */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 flex items-center gap-3 sm:gap-4 shrink-0 shadow-lg">
            <div className="text-center">
              <span className="text-2xl sm:text-3xl font-black text-white">{timeLeft.days}</span>
              <span className="block text-[10px] uppercase font-bold text-slate-300">Days</span>
            </div>
            <span className="text-xl font-bold text-white/40">:</span>
            <div className="text-center">
              <span className="text-2xl sm:text-3xl font-black text-white">{String(timeLeft.hours).padStart(2, '0')}</span>
              <span className="block text-[10px] uppercase font-bold text-slate-300">Hours</span>
            </div>
            <span className="text-xl font-bold text-white/40">:</span>
            <div className="text-center">
              <span className="text-2xl sm:text-3xl font-black text-white">{String(timeLeft.minutes).padStart(2, '0')}</span>
              <span className="block text-[10px] uppercase font-bold text-slate-300">Mins</span>
            </div>
            <span className="text-xl font-bold text-white/40">:</span>
            <div className="text-center">
              <span className="text-2xl sm:text-3xl font-black text-brand-300">{String(timeLeft.seconds).padStart(2, '0')}</span>
              <span className="block text-[10px] uppercase font-bold text-brand-300">Secs</span>
            </div>
          </div>
        </div>

        {/* Ambient background decoration */}
        <div className="absolute right-0 bottom-0 w-96 h-96 bg-brand-600/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Urgent Alerts (if any over budget or pending payments) */}
      {budgetSummary && (budgetSummary.isOverBudget || budgetSummary.totalPendingVendorBalance > 0) && (
        <div className="p-4 rounded-2xl bg-amber-50/90 border border-amber-200/80 shadow-2xs flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-900 space-y-1">
            {budgetSummary.isOverBudget && (
              <p className="font-semibold">
                ⚠️ Budget Alert: Total estimated expenditures exceed the planned budget limit by {formatCurrency(budgetSummary.totalEstimated - budgetSummary.totalBudget)}.
              </p>
            )}
            {budgetSummary.totalPendingVendorBalance > 0 && (
              <p>
                💳 Vendor Balances: {formatCurrency(budgetSummary.totalPendingVendorBalance)} pending final payment before the event date.
              </p>
            )}
          </div>
        </div>
      )}

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Card 1: Budget */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Remaining Budget</span>
            <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center">
              <PieIcon className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900">
            {formatCurrency(budgetSummary?.remainingBudget || 0)}
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
            <span>Spent: {formatCurrency(budgetSummary?.totalActual || 0)}</span>
            <span className="font-semibold text-brand-600">{budgetSummary?.utilizationPercentage || 0}% used</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
            <div
              className={`h-full rounded-full ${
                (budgetSummary?.utilizationPercentage || 0) > 100 ? 'bg-rose-500' : 'bg-brand-600'
              }`}
              style={{ width: `${Math.min(100, budgetSummary?.utilizationPercentage || 0)}%` }}
            />
          </div>
        </div>

        {/* Card 2: Tasks */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Task Progress</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900">
            {completedTasks} / {tasks.length}
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
            <span>{tasks.length - completedTasks} remaining</span>
            <span className="font-semibold text-indigo-600">{taskProgress}% done</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
            <div
              className="bg-indigo-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${taskProgress}%` }}
            />
          </div>
        </div>

        {/* Card 3: Vendors */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Vendors</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Store className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900">
            {confirmedVendorsCount} <span className="text-sm font-semibold text-slate-400">Confirmed</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
            <span>Total records: {vendors.length}</span>
            <Link to="/vendors" className="text-emerald-600 font-semibold hover:underline">
              Manage
            </Link>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full"
              style={{ width: `${vendors.length > 0 ? (confirmedVendorsCount / vendors.length) * 100 : 0}%` }}
            />
          </div>
        </div>

        {/* Card 4: Guests & RSVP */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Confirmed Guests</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900">
            {acceptedGuests} <span className="text-sm font-semibold text-slate-400">Attending</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
            <span>{pendingGuests} Pending • {declinedGuests} Declined</span>
            <Link to="/guests" className="text-blue-600 font-semibold hover:underline">
              Guest List
            </Link>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
            <div
              className="bg-blue-500 h-full rounded-full"
              style={{ width: `${totalHeadcount > 0 ? (acceptedGuests / totalHeadcount) * 100 : 0}%` }}
            />
          </div>
        </div>

      </div>

      {/* Main Grid: Spending Analytics + Urgent Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Cols: Spending Breakdown & AI Suggestions */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Spending Visualization */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-base font-bold text-slate-900">Budget Breakdown by Category</h3>
                <p className="text-xs text-slate-500 mt-0.5">Real-time expenditure allocation vs planned limits</p>
              </div>
              <Link
                to="/budget"
                className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
              >
                <span>Full Budget Manager</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {budgetSummary?.categoryBreakdown && budgetSummary.categoryBreakdown.length > 0 ? (
              <div className="h-64 w-full" role="img" aria-label="Budget summary bar chart comparing estimated and actual costs">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={budgetSummary.categoryBreakdown.map(c => ({
                      name: c.category.length > 15 ? c.category.substring(0, 14) + '...' : c.category,
                      Estimated: c.estimated,
                      Actual: c.actual
                    }))}
                    margin={{ top: 10, right: 10, left: 10, bottom: 25 }}
                  >
                    <XAxis dataKey="name" angle={-15} textAnchor="end" interval={0} tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip
                      formatter={(val: unknown) => formatCurrency(Number(val) || 0)}
                      contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                    />
                    <Bar dataKey="Estimated" fill="#c4b5fd" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Actual" fill="#7c3aed" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
                {/* Screen reader table summary */}
                <table className="sr-only">
                  <caption>Budget category summary</caption>
                  <thead>
                    <tr>
                      <th scope="col">Category</th>
                      <th scope="col">Estimated</th>
                      <th scope="col">Actual</th>
                    </tr>
                  </thead>
                  <tbody>
                    {budgetSummary.categoryBreakdown.map((cat, i) => (
                      <tr key={i}>
                        <td>{cat.category}</td>
                        <td>{formatCurrency(cat.estimated)}</td>
                        <td>{formatCurrency(cat.actual)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-10 text-slate-400 text-xs">No expenses entered yet.</div>
            )}
          </div>

          {/* Quick AI Plan Highlights */}
          {activeEvent.plan_data && (
            <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-brand-600" />
                  <h3 className="text-base font-bold text-slate-900">AI Master Plan Highlights</h3>
                </div>
                <Link
                  to="/plan"
                  className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
                >
                  <span>View & Edit Master Plan</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed bg-brand-50/50 p-4 rounded-2xl border border-brand-100/60">
                {activeEvent.plan_data.concept_and_theme || "Your tailored AI master plan is ready for review."}
              </p>

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {activeEvent.plan_data.decoration_ideas && activeEvent.plan_data.decoration_ideas.slice(0, 2).map((decor, i) => (
                  <div key={i} className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 text-xs text-slate-700">
                    <span className="font-bold text-brand-600 block mb-0.5">Decor Concept #{i + 1}</span>
                    {decor}
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Right 1 Col: Urgent Tasks & Quick Actions */}
        <div className="space-y-6">
          
          {/* Urgent Tasks */}
          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900">Upcoming Tasks</h3>
              <Link to="/timeline" className="text-xs font-semibold text-brand-600 hover:underline">
                All Tasks
              </Link>
            </div>

            <div className="space-y-2.5">
              {tasks.slice(0, 5).map(task => {
                const isDone = task.status === 'Completed';
                return (
                  <div
                    key={task.id}
                    onClick={() => toggleTaskStatus(task)}
                    className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                      isDone
                        ? 'bg-slate-50 border-slate-200 text-slate-400'
                        : 'bg-white hover:bg-brand-50/30 border-slate-200/80 text-slate-800'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isDone}
                      onChange={() => {}}
                      className="mt-0.5 w-4 h-4 rounded text-brand-600 accent-brand-600 cursor-pointer"
                    />
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-semibold truncate ${isDone ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                        {task.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                        <span className={`font-bold ${
                          task.priority === 'High' ? 'text-rose-600' : task.priority === 'Medium' ? 'text-amber-600' : 'text-slate-500'
                        }`}>
                          {task.priority} Priority
                        </span>
                        <span>•</span>
                        <span>Due: {task.due_date}</span>
                      </div>
                    </div>
                  </div>
                );
              })}

              {tasks.length === 0 && (
                <div className="text-center py-6 text-xs text-slate-400">No tasks created yet.</div>
              )}
            </div>
          </div>

          {/* Quick AI Co-pilot Launcher */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-brand-600 to-indigo-700 text-white shadow-lg relative overflow-hidden">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center mb-4">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-bold">Ask EventGenie AI</h3>
            <p className="text-xs text-brand-100 mt-1 leading-relaxed">
              "Reduce decoration costs by 20%", "Generate vegetarian menu for 100 guests", or "Check venue requirements".
            </p>
            <Link
              to="/chat"
              className="mt-5 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-brand-900 font-bold text-xs shadow-md hover:bg-brand-50 transition-all"
            >
              <span>Chat with Assistant</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

        </div>

      </div>

    </div>
  );
};
