import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { Layout } from './components/Layout';
import { LandingPage } from './pages/LandingPage';
import { AuthPage } from './pages/AuthPage';
import { DashboardPage } from './pages/DashboardPage';
import { CreateEventPage } from './pages/CreateEventPage';
import { PlanPage } from './pages/PlanPage';
import { BudgetPage } from './pages/BudgetPage';
import { TimelinePage } from './pages/TimelinePage';
import { VendorsPage } from './pages/VendorsPage';
import { GuestsPage } from './pages/GuestsPage';
import { ChatPage } from './pages/ChatPage';
import { IdeasPage } from './pages/IdeasPage';
import { SettingsPage } from './pages/SettingsPage';

export const App: React.FC = () => {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<AuthPage />} />
          <Route path="/signup" element={<AuthPage />} />

          {/* App Views inside Core Layout */}
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/create-event" element={<CreateEventPage />} />
            <Route path="/plan" element={<PlanPage />} />
            <Route path="/budget" element={<BudgetPage />} />
            <Route path="/timeline" element={<TimelinePage />} />
            <Route path="/vendors" element={<VendorsPage />} />
            <Route path="/guests" element={<GuestsPage />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/ideas" element={<IdeasPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
};

export default App;
