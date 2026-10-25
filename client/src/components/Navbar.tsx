import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  Sparkles,
  Plus,
  ChevronDown,
  Calendar,
  Settings,
  LogOut,
  Cpu,
  Home,
  CheckCircle,
  Menu,
  X
} from 'lucide-react';

export const Navbar: React.FC<{ onMobileMenuToggle?: () => void }> = ({ onMobileMenuToggle }) => {
  const { user, events, activeEvent, setActiveEventId, aiStatus, logout } = useApp();
  const [isEventMenuOpen, setIsEventMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Left: Brand & Mobile Toggle */}
        <div className="flex items-center gap-3">
          {onMobileMenuToggle && (
            <button
              onClick={onMobileMenuToggle}
              className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
              aria-label="Toggle Navigation"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform duration-200">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-slate-900 via-brand-900 to-indigo-800 bg-clip-text text-transparent">
                EventGenie
              </span>
              <span className="text-xs font-bold px-1.5 py-0.5 ml-1.5 rounded-full bg-brand-100 text-brand-700 uppercase tracking-wider">
                AI
              </span>
            </div>
          </Link>
        </div>

        {/* Center: Event Switcher (if events exist) */}
        {events.length > 0 && (
          <div className="relative hidden sm:block">
            <button
              onClick={() => {
                setIsEventMenuOpen(!isEventMenuOpen);
                setIsUserMenuOpen(false);
              }}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-100/80 text-sm font-medium text-slate-700 transition-colors"
            >
              <Calendar className="w-4 h-4 text-brand-600" />
              <span className="max-w-[200px] truncate">
                {activeEvent?.name || 'Select Event'}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-500">
                {activeEvent?.event_type || 'Event'}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {isEventMenuOpen && (
              <div
                className="absolute top-full mt-2 left-0 w-72 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                onClick={() => setIsEventMenuOpen(false)}
              >
                <div className="px-2.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Switch Active Event
                </div>
                <div className="max-h-60 overflow-y-auto space-y-1">
                  {events.map(ev => {
                    const isSelected = ev.id === activeEvent?.id;
                    return (
                      <button
                        key={ev.id}
                        onClick={() => setActiveEventId(ev.id)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-sm transition-colors ${
                          isSelected
                            ? 'bg-brand-50 text-brand-900 font-medium'
                            : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <div className="truncate mr-2">
                          <p className="truncate font-medium">{ev.name}</p>
                          <p className="text-xs text-slate-400">{ev.location} • {ev.guest_count} guests</p>
                        </div>
                        {isSelected && <CheckCircle className="w-4 h-4 text-brand-600 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
                <div className="pt-2 mt-1 border-t border-slate-100">
                  <Link
                    to="/create-event"
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold text-brand-600 hover:bg-brand-50 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create New Event</span>
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Right: AI Status Pill + Create Button + User Profile */}
        <div className="flex items-center gap-3">
          
          {/* AI Status Badge */}
          <Link
            to="/settings"
            title="Click to view AI Configuration & Model Settings"
            className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors shadow-2xs hover:shadow-sm"
            style={{
              backgroundColor: aiStatus?.hasKey ? '#f0fdf4' : '#f5f3ff',
              borderColor: aiStatus?.hasKey ? '#bbf7d0' : '#ddd6fe',
              color: aiStatus?.hasKey ? '#15803d' : '#6d28d9',
            }}
          >
            <Cpu className="w-3.5 h-3.5 shrink-0" />
            <span className="font-semibold">
              {aiStatus?.hasKey ? 'Gemini 3.8 Live' : 'AI Engine: Active'}
            </span>
          </Link>

          {/* Quick Create Event */}
          <Link
            to="/create-event"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold shadow-sm shadow-brand-500/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">New Event</span>
          </Link>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => {
                setIsUserMenuOpen(!isUserMenuOpen);
                setIsEventMenuOpen(false);
              }}
              className="flex items-center gap-2 p-1 pl-2 rounded-full border border-slate-200 hover:border-slate-300 bg-white transition-colors"
            >
              <span className="text-xs font-medium text-slate-700 hidden md:inline">
                {user?.name || 'Guest'}
              </span>
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                {(user?.name || 'U').charAt(0).toUpperCase()}
              </div>
            </button>

            {isUserMenuOpen && (
              <div
                className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                onClick={() => setIsUserMenuOpen(false)}
              >
                <div className="px-3 py-2 border-b border-slate-100 mb-1">
                  <p className="text-sm font-bold text-slate-900 truncate">{user?.name}</p>
                  <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                </div>

                <Link
                  to="/"
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <Home className="w-4 h-4 text-slate-400" />
                  <span>Landing Page</span>
                </Link>

                <Link
                  to="/settings"
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <Settings className="w-4 h-4 text-slate-400" />
                  <span>Event & AI Settings</span>
                </Link>

                <div className="pt-1 mt-1 border-t border-slate-100">
                  <button
                    onClick={logout}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-rose-600 hover:bg-rose-50 transition-colors text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>

      </div>
    </header>
  );
};
