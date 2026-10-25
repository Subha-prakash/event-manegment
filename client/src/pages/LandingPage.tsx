import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  Sparkles,
  ArrowRight,
  Calendar,
  PieChart,
  CheckCircle2,
  Store,
  Users,
  MessageSquare,
  ShieldCheck,
  Zap,
  TrendingDown,
  Star,
  ChevronRight
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { loginDemo, events } = useApp();
  const navigate = useNavigate();

  // Interactive Mini Calculator Widget State
  const [calcType, setCalcType] = useState('Wedding');
  const [calcGuests, setCalcGuests] = useState(200);
  const [calcBudget, setCalcBudget] = useState(800000);

  const handleTestDrive = async () => {
    await loginDemo();
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 text-slate-900 selection:bg-brand-500 selection:text-white">
      {/* Top Header */}
      <header className="border-b border-slate-200/60 bg-white/70 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-slate-900 to-brand-800 bg-clip-text text-transparent">
              EventGenie AI
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-slate-900 transition-colors"
            >
              Sign In
            </Link>
            <button
              onClick={handleTestDrive}
              className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold shadow-sm shadow-brand-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              Explore Live Demo
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-50 border border-brand-200/70 text-brand-700 text-xs font-bold tracking-wide uppercase mb-6 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 animate-spin text-brand-600" />
            Next-Generation GenAI Event Planning Assistant
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 max-w-4xl mx-auto leading-tight sm:leading-none">
            Plan Unforgettable Events in Seconds with <span className="bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">Generative AI</span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            From royal Indian weddings and birthday bashes to collegiate hackathons and corporate galas.
            Generate realistic budgets, 90-day timelines, vendor checklists, and RSVP tracking automatically.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={handleTestDrive}
              className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-700 hover:to-indigo-700 text-white font-bold text-base shadow-lg shadow-brand-500/25 flex items-center justify-center gap-2.5 transition-all hover:scale-105"
            >
              <span>Instant Interactive Demo</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <Link
              to="/create-event"
              className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 text-slate-800 font-bold text-base shadow-xs hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
            >
              <span>Create Your Event</span>
            </Link>
          </div>

          {/* Social Proof Badges */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-xs font-semibold text-slate-500">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Deterministic Cost Math</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              <span>Powered by Google Gemini 3.8</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-indigo-500" />
              <span>Avoid Overspending by ~20%</span>
            </div>
          </div>
        </div>

        {/* Floating Background Glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-gradient-to-tr from-brand-300/30 to-indigo-200/30 blur-3xl rounded-full pointer-events-none -z-10" />
      </section>

      {/* Interactive Quick Estimator Widget */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xl p-6 sm:p-10 relative overflow-hidden">
          <div className="flex flex-col md:flex-row gap-8 items-center justify-between">
            <div className="max-w-md">
              <span className="text-xs font-bold text-brand-600 uppercase tracking-wider">
                Instant Interactive AI Estimator
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
                See What EventGenie AI Can Do For Your Budget
              </h2>
              <p className="text-sm text-slate-600 mt-2">
                Adjust the sliders below to test our real-time budget allocator and guest-cost ratio calculations.
              </p>

              <div className="mt-6 space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700">Event Type</label>
                  <div className="grid grid-cols-3 gap-2 mt-1.5">
                    {['Wedding', 'Birthday', 'College Fest'].map(t => (
                      <button
                        key={t}
                        onClick={() => setCalcType(t)}
                        className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                          calcType === t
                            ? 'bg-brand-50 border-brand-500 text-brand-700 font-bold'
                            : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-700">
                    <span>Guest Count: {calcGuests}</span>
                    <span className="text-slate-400">50 - 500</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="500"
                    step="10"
                    value={calcGuests}
                    onChange={e => setCalcGuests(Number(e.target.value))}
                    className="w-full mt-2 accent-brand-600 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-700">
                    <span>Budget: ₹{calcBudget.toLocaleString('en-IN')}</span>
                    <span className="text-slate-400">₹50K - ₹25L</span>
                  </div>
                  <input
                    type="range"
                    min="50000"
                    max="2500000"
                    step="50000"
                    value={calcBudget}
                    onChange={e => setCalcBudget(Number(e.target.value))}
                    className="w-full mt-2 accent-brand-600 cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Live Calculation Preview Card */}
            <div className="w-full md:w-80 bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-2xl p-6 shadow-2xl border border-slate-800">
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <span className="text-xs font-semibold text-slate-400">AI Plan Preview</span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-300">
                  {calcType}
                </span>
              </div>

              <div className="mt-4 space-y-3">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Catering Allocation:</span>
                  <span className="font-semibold text-white">
                    ₹{Math.round(calcBudget * (calcType === 'Wedding' ? 0.30 : 0.35)).toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Venue & Ambience:</span>
                  <span className="font-semibold text-white">
                    ₹{Math.round(calcBudget * (calcType === 'Wedding' ? 0.32 : 0.25)).toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Decor & Florals:</span>
                  <span className="font-semibold text-white">
                    ₹{Math.round(calcBudget * 0.16).toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Photo & Music:</span>
                  <span className="font-semibold text-white">
                    ₹{Math.round(calcBudget * 0.14).toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Safety Buffer:</span>
                  <span className="font-semibold text-emerald-400">
                    ₹{Math.round(calcBudget * 0.08).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-white/10">
                <p className="text-[11px] text-slate-400">Estimated Cost Per Guest:</p>
                <p className="text-xl font-extrabold text-brand-300 mt-0.5">
                  ₹{Math.round(calcBudget / calcGuests).toLocaleString('en-IN')}
                  <span className="text-xs font-normal text-slate-400"> / guest</span>
                </p>
              </div>

              <button
                onClick={handleTestDrive}
                className="w-full mt-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
              >
                <span>Launch Full Planner</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-16 bg-slate-100/60 border-y border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold text-brand-600 uppercase tracking-wider">
              Comprehensive Planning Suite
            </h2>
            <p className="text-3xl font-extrabold text-slate-900 mt-2">
              Everything You Need to Orchestrate Flawless Events
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            
            {/* Feature 1 */}
            <div className="p-7 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-brand-100 text-brand-600 flex items-center justify-center mb-5">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">AI Event Creation Wizard</h3>
              <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                Provide guest count, budget, cultural preferences, and theme. Our AI produces custom concepts, decoration blueprints, and run-down schedules.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-7 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-5">
                <PieChart className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Deterministic Budget Manager</h3>
              <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                Track Estimated vs Quoted vs Actual spending. Automatic category breakdown, overspending warnings, and INR lakhs currency formatting.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-7 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center mb-5">
                <Calendar className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Smart 90-Day Timeline</h3>
              <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                Milestones dynamically pegged to your event date: from 90 days out to 1 day before. Filter tasks by priority, date, and responsible person.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-7 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-5">
                <Store className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Vendor Management Hub</h3>
              <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                Organize caterers, venues, decorators, and DJs. Track booking contracts, quotations, advance payments, and remaining balances at a glance.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-7 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-5">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Guest List & CSV Export</h3>
              <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                Categorize guests into Family, VIP, or Colleagues. Track RSVPs, dietary preferences, and export complete guest rosters into CSV with one click.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-7 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center mb-5">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Contextual AI Planning Chat</h3>
              <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                Ask questions like "Reduce my decoration costs by 20%" or "Suggest vegetarian menu for 100 guests" and receive tailored, actionable advice.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-14">
          <h2 className="text-xs font-bold text-brand-600 uppercase tracking-wider">Loved By Event Planners</h2>
          <p className="text-3xl font-extrabold text-slate-900 mt-2">Designed for Real-World Celebrations</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <div className="flex gap-1 text-amber-400 mb-3">
              {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-amber-400" />)}
            </div>
            <p className="text-sm text-slate-700 italic">
              "EventGenie AI helped us budget our Jaipur wedding for 350 guests down to the last rupee. The 90-day timeline ensured we never missed a caterer tasting deadline!"
            </p>
            <div className="mt-4 pt-4 border-t border-slate-100">
              <p className="text-xs font-bold text-slate-900">Aarav & Meera</p>
              <p className="text-[11px] text-slate-400">Jaipur Wedding Hosts</p>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <div className="flex gap-1 text-amber-400 mb-3">
              {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-amber-400" />)}
            </div>
            <p className="text-sm text-slate-700 italic">
              "We organized our college annual fest with 200+ attendees. The AI budget breakdown and sponsor checklist saved our committee endless hours of spreadsheet chaos."
            </p>
            <div className="mt-4 pt-4 border-t border-slate-100">
              <p className="text-xs font-bold text-slate-900">Kavya Iyer</p>
              <p className="text-[11px] text-slate-400">College Fest Convener</p>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <div className="flex gap-1 text-amber-400 mb-3">
              {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-amber-400" />)}
            </div>
            <p className="text-sm text-slate-700 italic">
              "The AI chat assistant gave us incredible DIY decoration ideas and reduced our overall floral expense by 22% without sacrificing the royal vibe."
            </p>
            <div className="mt-4 pt-4 border-t border-slate-100">
              <p className="text-xs font-bold text-slate-900">Rohan Singhania</p>
              <p className="text-[11px] text-slate-400">Private Celebration Planner</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Footer Banner */}
      <section className="bg-gradient-to-r from-brand-900 via-indigo-900 to-purple-900 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-extrabold tracking-tight">Ready to Plan Your Next Event with AI?</h2>
          <p className="text-brand-200 mt-3 text-base">
            No credit card required. Start organizing your budget, schedule, and vendors right now.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <button
              onClick={handleTestDrive}
              className="px-7 py-3 rounded-xl bg-white text-brand-900 font-bold text-sm shadow-lg hover:bg-brand-50 transition-colors"
            >
              Open Interactive Demo
            </button>
            <Link
              to="/create-event"
              className="px-7 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm transition-colors border border-brand-500"
            >
              Create New Event
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-8 text-center text-xs text-slate-400">
        <p>© 2026 EventGenie AI. Intelligent Event Planning & Budget Assistant. Powered by Google Gemini.</p>
      </footer>
    </div>
  );
};
