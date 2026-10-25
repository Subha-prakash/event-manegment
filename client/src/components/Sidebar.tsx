import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Sparkles,
  PieChart,
  CalendarCheck,
  Store,
  Users,
  MessageSquareCode,
  Bookmark,
  Settings,
  PlusCircle,
  Compass
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { activeEvent } = useApp();

  const navItems = [
    { to: '/dashboard', label: 'Event Dashboard', icon: LayoutDashboard },
    { to: '/plan', label: 'AI Event Plan', icon: Sparkles, badge: 'AI' },
    { to: '/budget', label: 'Budget Manager', icon: PieChart },
    { to: '/timeline', label: 'Timeline & Tasks', icon: CalendarCheck },
    { to: '/vendors', label: 'Vendor Directory', icon: Store },
    { to: '/guests', label: 'Guest List & RSVP', icon: Users },
    { to: '/chat', label: 'AI Chat Assistant', icon: MessageSquareCode, badge: 'Live' },
    { to: '/ideas', label: 'Saved & AI Ideas', icon: Bookmark },
    { to: '/settings', label: 'Event Settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 md:hidden animate-fade-in"
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={`fixed md:sticky top-16 left-0 z-40 h-[calc(100vh-4rem)] w-64 bg-white/90 backdrop-blur-md border-r border-slate-200/80 flex flex-col justify-between p-4 transition-transform duration-200 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="space-y-6">
          
          {/* Active Event Banner */}
          {activeEvent && (
            <div className="p-3.5 rounded-2xl bg-gradient-to-br from-brand-50 to-indigo-50/60 border border-brand-100/80 shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600 bg-brand-100/70 px-2 py-0.5 rounded-full">
                Active Planning Event
              </span>
              <h3 className="font-bold text-slate-800 text-sm mt-1.5 truncate" title={activeEvent.name}>
                {activeEvent.name}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5 flex items-center justify-between">
                <span>{activeEvent.location}</span>
                <span className="font-semibold text-slate-700">{activeEvent.guest_count} guests</span>
              </p>
            </div>
          )}

          {/* Navigation Links */}
          <nav className="space-y-1">
            <div className="px-3 pb-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Planning Center
            </div>

            {navItems.map(item => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-brand-600 text-white shadow-sm shadow-brand-500/25 font-semibold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <div className="flex items-center gap-3">
                        <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                            isActive
                              ? 'bg-white/20 text-white'
                              : 'bg-brand-100 text-brand-700'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="pt-4 border-t border-slate-100 space-y-2">
          <NavLink
            to="/create-event"
            onClick={onClose}
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium text-brand-600 bg-brand-50 hover:bg-brand-100 transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create New Event</span>
          </NavLink>

          <NavLink
            to="/"
            onClick={onClose}
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Product Showcase & Tour</span>
          </NavLink>
        </div>
      </aside>
    </>
  );
};
