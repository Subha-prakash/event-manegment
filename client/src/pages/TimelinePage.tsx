import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { Task } from '../types';
import {
  CalendarCheck,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  Clock,
  Filter,
  User,
  AlertCircle,
  X
} from 'lucide-react';

export const TimelinePage: React.FC = () => {
  const { activeEvent, showToast } = useApp();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [priorityFilter, setPriorityFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    start_date: new Date().toISOString().split('T')[0],
    due_date: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
    priority: 'Medium' as 'High' | 'Medium' | 'Low',
    status: 'Not Started' as 'Not Started' | 'In Progress' | 'Completed',
    assigned_to: '',
    notes: ''
  });

  const loadTasks = async () => {
    if (!activeEvent) return;
    setLoading(true);
    try {
      const data = await api.getTasks(activeEvent.id);
      setTasks(data);
    } catch (err) {
      console.error("Tasks load error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, [activeEvent?.id]);

  const handleToggleStatus = async (task: Task) => {
    const nextStatus = task.status === 'Completed' ? 'In Progress' : 'Completed';
    try {
      await api.updateTask(activeEvent!.id, task.id, { status: nextStatus });
      setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: nextStatus } : t));
      showToast(nextStatus === 'Completed' ? 'Task completed! 🎉' : 'Task reopened', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to update task', 'error');
    }
  };

  const handleOpenAdd = () => {
    setEditingTask(null);
    setFormData({
      title: '',
      description: '',
      start_date: new Date().toISOString().split('T')[0],
      due_date: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      priority: 'Medium',
      status: 'Not Started',
      assigned_to: '',
      notes: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (task: Task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description || '',
      start_date: task.start_date || new Date().toISOString().split('T')[0],
      due_date: task.due_date,
      priority: task.priority,
      status: task.status,
      assigned_to: task.assigned_to || '',
      notes: task.notes || ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    try {
      await api.deleteTask(activeEvent!.id, id);
      setTasks(prev => prev.filter(t => t.id !== id));
      showToast('Task removed', 'info');
    } catch (err: any) {
      showToast(err.message || 'Failed to delete task', 'error');
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      showToast('Please enter a task title', 'error');
      return;
    }

    try {
      if (editingTask) {
        const updated = await api.updateTask(activeEvent!.id, editingTask.id, formData);
        setTasks(prev => prev.map(t => t.id === editingTask.id ? updated : t));
        showToast('Task updated', 'success');
      } else {
        const created = await api.addTask(activeEvent!.id, formData);
        setTasks(prev => [created, ...prev]);
        showToast('Task added', 'success');
      }
      setIsModalOpen(false);
    } catch (err: any) {
      showToast(err.message || 'Failed to save task', 'error');
    }
  };

  if (!activeEvent) {
    return <div className="text-center py-12 text-slate-500">Please select an event.</div>;
  }

  // Filter tasks
  const filteredTasks = tasks.filter(t => {
    if (statusFilter !== 'All' && t.status !== statusFilter) return false;
    if (priorityFilter !== 'All' && t.priority !== priorityFilter) return false;
    if (searchQuery.trim() && !t.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const completedCount = tasks.filter(t => t.status === 'Completed').length;
  const progressPercent = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-700 border border-brand-200">
              Smart Timeline & Tasks
            </span>
            <span className="text-xs text-slate-500">• {activeEvent.name}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1.5">
            Event Preparation Schedule
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track deadlines, priority actions, and assigned responsibilities leading up to event day.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md shadow-brand-500/20 transition-all hover:scale-[1.02]"
        >
          <Plus className="w-4 h-4" />
          <span>Add Custom Task</span>
        </button>
      </div>

      {/* Progress & Milestone Bar */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-3">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Overall Preparation Progress</h3>
            <p className="text-xs text-slate-500">
              {completedCount} of {tasks.length} milestones completed
            </p>
          </div>
          <span className="text-xl font-extrabold text-brand-600">
            {progressPercent}% Complete
          </span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
          <div
            className="bg-gradient-to-r from-brand-600 to-indigo-600 h-full rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Status Filter */}
          <div className="flex rounded-xl bg-slate-100 p-1">
            {['All', 'Not Started', 'In Progress', 'Completed'].map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  statusFilter === s ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={e => setPriorityFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:outline-none"
          >
            <option value="All">All Priorities</option>
            <option value="High">High Priority</option>
            <option value="Medium">Medium Priority</option>
            <option value="Low">Low Priority</option>
          </select>
        </div>

        {/* Search */}
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Search task title..."
          className="px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 w-full sm:w-56"
        />
      </div>

      {/* Task List */}
      <div className="space-y-3">
        {filteredTasks.map(task => {
          const isDone = task.status === 'Completed';
          return (
            <div
              key={task.id}
              className={`p-4 sm:p-5 rounded-2xl border transition-all flex items-start justify-between gap-4 ${
                isDone
                  ? 'bg-slate-50/70 border-slate-200/60 opacity-80'
                  : 'bg-white border-slate-200/90 shadow-xs hover:border-brand-200'
              }`}
            >
              <div className="flex items-start gap-3.5 min-w-0 flex-1">
                <input
                  type="checkbox"
                  checked={isDone}
                  onChange={() => handleToggleStatus(task)}
                  className="mt-1 w-5 h-5 rounded-md text-brand-600 accent-brand-600 cursor-pointer"
                />

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className={`text-sm font-bold truncate ${isDone ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                      {task.title}
                    </h3>
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                      task.priority === 'High'
                        ? 'bg-rose-100 text-rose-700'
                        : task.priority === 'Medium'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      {task.priority} Priority
                    </span>
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold ${
                      task.status === 'Completed'
                        ? 'bg-emerald-100 text-emerald-700'
                        : task.status === 'In Progress'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-slate-100 text-slate-500'
                    }`}>
                      {task.status}
                    </span>
                  </div>

                  {task.description && (
                    <p className={`text-xs mt-1 leading-relaxed ${isDone ? 'text-slate-400' : 'text-slate-600'}`}>
                      {task.description}
                    </p>
                  )}

                  <div className="flex items-center gap-4 mt-2 text-[11px] text-slate-400 font-medium">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      Due: <strong className="text-slate-600">{task.due_date}</strong>
                    </span>
                    {task.assigned_to && (
                      <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5" />
                        Assigned: <strong className="text-slate-600">{task.assigned_to}</strong>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => handleOpenEdit(task)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-brand-50 transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(task.id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}

        {filteredTasks.length === 0 && (
          <div className="text-center py-14 bg-white rounded-3xl border border-slate-200/80 text-slate-400 text-xs">
            No tasks match your current filter criteria.
          </div>
        )}
      </div>

      {/* Add / Edit Task Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-100 animate-scale-up">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">
                {editingTask ? 'Edit Task' : 'Add Preparation Task'}
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
                <label className="block text-xs font-bold text-slate-700 mb-1">Task Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Confirm floral mandap design and lighting"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Additional logistical instructions or requirements..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={e => setFormData({ ...formData, priority: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                  >
                    <option value="Not Started">Not Started</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={formData.start_date}
                    onChange={e => setFormData({ ...formData, start_date: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Due Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.due_date}
                    onChange={e => setFormData({ ...formData, due_date: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Responsible Person / Assigned To</label>
                <input
                  type="text"
                  value={formData.assigned_to}
                  onChange={e => setFormData({ ...formData, assigned_to: e.target.value })}
                  placeholder="e.g. Lead Planner, Meera (Bride), Rohan"
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
                  {editingTask ? 'Save Changes' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
