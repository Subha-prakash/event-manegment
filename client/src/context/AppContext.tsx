import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Event, AiStatus, getErrorMessage } from '../types';
import { api } from '../services/api';

export interface ToastItem {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface AppContextType {
  user: User | null;
  events: Event[];
  activeEvent: Event | null;
  activeEventId: string | null;
  aiStatus: AiStatus | null;
  isLoading: boolean;
  setActiveEventId: (id: string) => void;
  refreshEvents: () => Promise<void>;
  refreshActiveEvent: () => Promise<void>;
  refreshAiStatus: () => Promise<void>;
  loginDemo: () => Promise<void>;
  login: (email: string, name?: string) => Promise<User>;
  register: (name: string, email: string) => Promise<User>;
  logout: () => void;
  formatCurrency: (amount: number, currency?: string) => string;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  toasts: ToastItem[];
  removeToast: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [activeEventId, setActiveEventIdState] = useState<string | null>(() => {
    return localStorage.getItem('eg_active_event_id') || null;
  });
  const [aiStatus, setAiStatus] = useState<AiStatus | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const setActiveEventId = (id: string) => {
    setActiveEventIdState(id);
    localStorage.setItem('eg_active_event_id', id);
  };

  const refreshAiStatus = async () => {
    try {
      const status = await api.getAiStatus();
      setAiStatus(status);
    } catch (err) {
      console.warn("Could not fetch AI status:", err);
    }
  };

  const refreshEvents = async () => {
    try {
      const list = await api.getEvents();
      setEvents(list);
      if (list.length > 0) {
        if (!activeEventId || !list.some(e => e.id === activeEventId)) {
          setActiveEventId(list[0].id);
        }
      } else {
        setActiveEventIdState(null);
      }
    } catch (err) {
      console.error("Failed to load events:", err);
    }
  };

  const refreshActiveEvent = async () => {
    if (!activeEventId) return;
    try {
      const updated = await api.getEvent(activeEventId);
      setEvents(prev => prev.map(e => e.id === updated.id ? updated : e));
    } catch (err) {
      console.error("Failed to refresh active event:", err);
    }
  };

  const initAuthAndData = async () => {
    setIsLoading(true);
    try {
      // Check stored user or auto-login demo
      const me = await api.getMe().catch(() => null);
      if (me && me.user) {
        setUser(me.user);
      } else {
        // Auto-login demo for seamless first impression
        const demo = await api.loginDemo();
        setUser(demo.user);
      }

      await refreshEvents();
      await refreshAiStatus();
    } catch (err) {
      console.error("Initialization error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    initAuthAndData();
  }, []);

  const login = async (email: string, name?: string): Promise<User> => {
    const res = await api.login(email, name);
    setUser(res.user);
    await refreshEvents();
    showToast(`Welcome back, ${res.user.name}!`, 'success');
    return res.user;
  };

  const register = async (name: string, email: string): Promise<User> => {
    const res = await api.register(name, email);
    setUser(res.user);
    await refreshEvents();
    showToast(`Welcome to EventGenie, ${res.user.name}!`, 'success');
    return res.user;
  };

  const loginDemo = async () => {
    try {
      const res = await api.loginDemo();
      setUser(res.user);
      await refreshEvents();
      showToast(`Signed in as ${res.user.name}`, 'success');
    } catch (err: unknown) {
      showToast(getErrorMessage(err), 'error');
    }
  };

  const logout = () => {
    api.logout();
    setUser(null);
    showToast('Signed out successfully', 'info');
  };

  const activeEvent = events.find(e => e.id === activeEventId) || events[0] || null;

  const formatCurrency = (amount: number = 0, currencyOverride?: string) => {
    const cur = currencyOverride || activeEvent?.currency || 'INR';
    if (cur === 'INR') {
      return `₹${amount.toLocaleString('en-IN')}`;
    }
    if (cur === 'USD') return `$${amount.toLocaleString()}`;
    if (cur === 'EUR') return `€${amount.toLocaleString()}`;
    if (cur === 'GBP') return `£${amount.toLocaleString()}`;
    return `${cur} ${amount.toLocaleString()}`;
  };

  return (
    <AppContext.Provider
      value={{
        user,
        events,
        activeEvent,
        activeEventId,
        aiStatus,
        isLoading,
        setActiveEventId,
        refreshEvents,
        refreshActiveEvent,
        refreshAiStatus,
        login,
        register,
        loginDemo,
        logout,
        formatCurrency,
        showToast,
        toasts,
        removeToast
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
