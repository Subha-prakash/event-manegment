import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link, useSearchParams } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { useApp } from '../context/AppContext';
import { getErrorMessage } from '../types';
import {
  Sparkles,
  Mail,
  User as UserIcon,
  Lock,
  ArrowRight,
  ShieldCheck,
  Eye,
  EyeOff,
  CheckCircle2,
  Calendar,
  Building2,
  PartyPopper,
  Zap,
  Star,
  ChevronLeft,
  ChevronRight,
  KeyRound,
  X,
  AlertCircle,
  HelpCircle,
  Clock,
  Send
} from 'lucide-react';

interface Persona {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarBg: string;
  badge: string;
  eventPreview: string;
}

const DEMO_PERSONAS: Persona[] = [
  {
    id: 'priya',
    name: 'Priya Sharma',
    email: 'priya@eventgenie.ai',
    role: 'Luxury Destination Wedding Planner',
    avatarBg: 'from-amber-500 to-rose-500',
    badge: 'Weddings',
    eventPreview: 'Royal Udaipur Palace Wedding • ₹25L Budget'
  },
  {
    id: 'arjun',
    name: 'Arjun Mehta',
    email: 'arjun@eventgenie.ai',
    role: 'Corporate Conference Director',
    avatarBg: 'from-blue-600 to-cyan-500',
    badge: 'Corporate',
    eventPreview: 'TechNova Global Summit 2026 • 600 Attendees'
  },
  {
    id: 'neha',
    name: 'Neha Kapoor',
    email: 'neha@eventgenie.ai',
    role: 'Boutique Social & Birthday Stylist',
    avatarBg: 'from-purple-500 to-pink-500',
    badge: 'Social',
    eventPreview: "Aarav's 1st Birthday Fiesta • 85 Guests"
  }
];

const SHOWCASE_SLIDES = [
  {
    tag: 'Wedding & Celebrations',
    tagColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    title: 'The Royal Palace Destination Wedding',
    location: 'The Leela Palace, Udaipur',
    stats: [
      { label: 'Guests', value: '280' },
      { label: 'Budget Saved', value: '₹3.4L' },
      { label: 'Vendors Booked', value: '14/14' }
    ],
    aiPrompt: 'GenAI Prompt: "Negotiate 3-tier catering with traditional Rajasthani live stations"',
    aiResponse: 'Generated customized timeline with 18 key rituals & negotiated 12% group rate.'
  },
  {
    tag: 'Corporate & Tech Galas',
    tagColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    title: 'TechNova AI Global Summit 2026',
    location: 'KTPO Convention Center, Bengaluru',
    stats: [
      { label: 'Attendees', value: '600+' },
      { label: 'Budget Managed', value: '₹45L' },
      { label: 'Speakers', value: '24 Verified' }
    ],
    aiPrompt: 'GenAI Prompt: "Generate 2-day dual-track agenda with keynote stage lighting checklist"',
    aiResponse: 'Synthesized 36-item run-of-show schedule and real-time AV equipment contingencies.'
  },
  {
    tag: 'Milestone Birthdays',
    tagColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    title: "Aarav's Enchanted Carnival Fiesta",
    location: 'JW Marriott Terrace Lawn, Mumbai',
    stats: [
      { label: 'Guests', value: '85' },
      { label: 'Budget', value: '₹3.8L' },
      { label: 'Activities', value: '8 Themed' }
    ],
    aiPrompt: 'GenAI Prompt: "Design eco-friendly return gift kits & interactive magic workshop"',
    aiResponse: 'Created personalized itinerary, interactive RSVP tracker, and dessert station menu.'
  }
];

export const AuthPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, register, loginDemo, showToast } = useApp();

  // Mode detection: sync with URL (/signup vs /login or ?mode=signup)
  const isInitialSignup = location.pathname === '/signup' || searchParams.get('mode') === 'signup';
  const [isRegister, setIsRegister] = useState(isInitialSignup);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState(() => localStorage.getItem('eg_saved_email') || '');
  const [password, setPassword] = useState('Password123!');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(() => localStorage.getItem('eg_remember_me') === 'true');
  const [roleFocus, setRoleFocus] = useState('Weddings & Celebrations');
  const [agreeTerms, setAgreeTerms] = useState(true);

  // Status & Validation
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [touchedEmail, setTouchedEmail] = useState(false);

  // Modals
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotStep, setForgotStep] = useState<'request' | 'verify' | 'success'>('request');
  const [forgotOtp, setForgotOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState('');

  const [securityModalOpen, setSecurityModalOpen] = useState(false);

  // Showcase slide state
  const [activeSlide, setActiveSlide] = useState(0);

  // Update mode when URL changes
  useEffect(() => {
    setIsRegister(location.pathname === '/signup' || searchParams.get('mode') === 'signup');
    setError('');
  }, [location.pathname, searchParams]);

  // Auto-cycle showcase slides
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide(prev => (prev + 1) % SHOWCASE_SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  // Mode switch helper
  const switchMode = (signupMode: boolean) => {
    setIsRegister(signupMode);
    setError('');
    const redirect = searchParams.get('redirect');
    const redirectParam = redirect ? `?redirect=${encodeURIComponent(redirect)}` : '';
    navigate(signupMode ? `/signup${redirectParam}` : `/login${redirectParam}`, { replace: true });
  };

  // Password strength calculation
  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return { score: 0, label: 'None', color: 'bg-slate-200' };
    let score = 0;
    if (pwd.length >= 8) score += 1;
    if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;

    switch (score) {
      case 1:
        return { score: 1, label: 'Weak', color: 'bg-rose-500' };
      case 2:
        return { score: 2, label: 'Fair', color: 'bg-amber-500' };
      case 3:
        return { score: 3, label: 'Good', color: 'bg-indigo-500' };
      case 4:
        return { score: 4, label: 'Strong', color: 'bg-emerald-500' };
      default:
        return { score: 1, label: 'Weak', color: 'bg-rose-500' };
    }
  };

  const passwordStrength = getPasswordStrength(password);
  const isValidEmail = (val: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);

  // Confetti trigger
  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 75,
        spread: 60,
        origin: { y: 0.6 }
      });
    } catch {
      // safe fallback
    }
  };

  // Handle Form Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Client-side validations
    if (!email.trim() || !isValidEmail(email)) {
      setError('Please provide a valid email address');
      return;
    }

    if (isRegister) {
      if (!name.trim()) {
        setError('Please enter your full name');
        return;
      }
      if (password.length < 6) {
        setError('Password should be at least 6 characters');
        return;
      }
      if (!agreeTerms) {
        setError('Please agree to the Terms of Service to continue');
        return;
      }
    } else {
      if (!password) {
        setError('Please enter your password');
        return;
      }
    }

    // Persist remember me preference
    if (rememberMe) {
      localStorage.setItem('eg_remember_me', 'true');
      localStorage.setItem('eg_saved_email', email);
    } else {
      localStorage.removeItem('eg_remember_me');
      localStorage.removeItem('eg_saved_email');
    }

    setLoading(true);

    try {
      if (isRegister) {
        await register(name.trim(), email.trim());
      } else {
        await login(email.trim(), name.trim() || undefined);
      }

      triggerConfetti();
      const redirect = searchParams.get('redirect') || '/dashboard';
      navigate(redirect);
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  // Fast Persona Quick-Fill
  const handleSelectPersona = async (persona: Persona, autoSubmit = false) => {
    setEmail(persona.email);
    setName(persona.name);
    setPassword('Password123!');
    setError('');

    if (autoSubmit) {
      setLoading(true);
      try {
        await login(persona.email, persona.name);
        triggerConfetti();
        const redirect = searchParams.get('redirect') || '/dashboard';
        navigate(redirect);
      } catch (err: unknown) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    } else {
      showToast(`Filled credentials for ${persona.name}`, 'info');
    }
  };

  // Fast 1-Click Test Drive Demo
  const handleDemoLogin = async () => {
    setLoading(true);
    setError('');
    try {
      await loginDemo();
      triggerConfetti();
      const redirect = searchParams.get('redirect') || '/dashboard';
      navigate(redirect);
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  // Simulated Google Sign-In
  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    try {
      // Simulate OAuth token exchange
      await new Promise(r => setTimeout(r, 650));
      const googleUserEmail = 'google.planner@eventgenie.ai';
      const googleUserName = 'Google Planner';
      await login(googleUserEmail, googleUserName);
      triggerConfetti();
      showToast('Successfully signed in via Google!', 'success');
      const redirect = searchParams.get('redirect') || '/dashboard';
      navigate(redirect);
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  // Forgot Password Handlers
  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError('');

    if (!forgotEmail || !isValidEmail(forgotEmail)) {
      setForgotError('Please enter a valid email address');
      return;
    }

    setForgotLoading(true);
    try {
      await new Promise(r => setTimeout(r, 700));
      setForgotStep('verify');
      showToast('Verification OTP code sent to your email!', 'info');
    } catch {
      setForgotError('Failed to send reset code');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleVerifyOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError('');

    if (!forgotOtp.trim()) {
      setForgotError('Please enter the 6-digit OTP code');
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setForgotError('New password must be at least 6 characters');
      return;
    }

    setForgotLoading(true);
    try {
      await new Promise(r => setTimeout(r, 800));
      setForgotStep('success');
      showToast('Password reset successfully! You can now sign in.', 'success');
      setEmail(forgotEmail);
      setPassword(newPassword);
      setTimeout(() => {
        setForgotModalOpen(false);
        setForgotStep('request');
        switchMode(false);
      }, 1400);
    } catch {
      setForgotError('Invalid code or session expired');
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-brand-500 selection:text-white relative overflow-hidden">
      
      {/* Ambient background glow layers */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-brand-600/20 rounded-full blur-[120px] pointer-events-none animate-pulse-glow" />
      <div className="absolute bottom-0 right-1/4 w-[450px] h-[450px] bg-indigo-600/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/2 right-10 w-[300px] h-[300px] bg-purple-600/15 rounded-full blur-[100px] pointer-events-none" />

      {/* Top Floating Navigation */}
      <header className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 via-indigo-600 to-purple-500 flex items-center justify-center text-white shadow-lg shadow-brand-500/25 group-hover:scale-105 transition-transform duration-200">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl tracking-tight text-white">
                EventGenie
              </span>
              <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-md bg-gradient-to-r from-brand-500 to-indigo-500 text-white tracking-wider uppercase">
                AI
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
              Intelligent Event Planning Suite
            </p>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="text-xs font-semibold text-slate-400 hover:text-white transition-colors flex items-center gap-1.5 py-1.5 px-3 rounded-lg hover:bg-white/5"
          >
            <span>Back to Home</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* Main Dual-Column Content */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 flex items-center justify-center">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Interactive Showcase & Testimonials (Hidden on small mobile, visible on lg) */}
          <div className="hidden lg:flex lg:col-span-6 flex-col justify-center space-y-6 pr-2">
            
            {/* Value Proposition Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md self-start text-xs font-semibold text-brand-300 shadow-sm">
              <Zap className="w-3.5 h-3.5 text-brand-400" />
              <span>Next-Generation Event Automation Platform</span>
            </div>

            <div>
              <h1 className="text-3xl sm:text-4xl xl:text-5xl font-extrabold text-white tracking-tight leading-tight">
                Plan extraordinary events <br />
                <span className="bg-gradient-to-r from-brand-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
                  with intelligent GenAI
                </span>
              </h1>
              <p className="mt-3 text-sm xl:text-base text-slate-300 leading-relaxed max-w-xl">
                From luxury destination weddings to corporate tech summits, orchestrate every vendor, budget, and minute-by-minute timeline with precision.
              </p>
            </div>

            {/* Interactive Showcase Card Carousel */}
            <div className="bg-slate-900/80 border border-white/10 rounded-3xl p-6 backdrop-blur-xl shadow-2xl relative overflow-hidden group">
              <div className="flex items-center justify-between mb-4">
                <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${SHOWCASE_SLIDES[activeSlide].tagColor}`}>
                  {SHOWCASE_SLIDES[activeSlide].tag}
                </span>
                <div className="flex items-center gap-1.5">
                  {SHOWCASE_SLIDES.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveSlide(idx)}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        idx === activeSlide ? 'w-6 bg-brand-500' : 'w-2 bg-white/20 hover:bg-white/40'
                      }`}
                      aria-label={`Slide ${idx + 1}`}
                    />
                  ))}
                </div>
              </div>

              <h2 className="text-lg font-bold text-white">
                {SHOWCASE_SLIDES[activeSlide].title}
              </h2>
              <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                <Calendar className="w-3.5 h-3.5 text-brand-400" />
                <span>{SHOWCASE_SLIDES[activeSlide].location}</span>
              </p>

              {/* Stat Chips */}
              <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-white/10">
                {SHOWCASE_SLIDES[activeSlide].stats.map((s, i) => (
                  <div key={i} className="bg-white/5 rounded-2xl p-2.5 text-center border border-white/5">
                    <p className="text-xs font-bold text-white">{s.value}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* GenAI Real-time Activity Preview */}
              <div className="mt-4 p-3.5 rounded-2xl bg-brand-950/40 border border-brand-500/20 text-xs">
                <div className="flex items-center gap-2 text-brand-300 font-semibold mb-1">
                  <Sparkles className="w-3.5 h-3.5 text-brand-400" />
                  <span>{SHOWCASE_SLIDES[activeSlide].aiPrompt}</span>
                </div>
                <p className="text-slate-300 text-[11px] pl-5 leading-relaxed">
                  ↳ {SHOWCASE_SLIDES[activeSlide].aiResponse}
                </p>
              </div>

              {/* Carousel Controls */}
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/5 text-xs text-slate-400">
                <span className="text-[11px]">Live Sample Planner Model</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setActiveSlide(prev => (prev === 0 ? SHOWCASE_SLIDES.length - 1 : prev - 1))}
                    className="p-1 rounded-lg bg-white/5 hover:bg-white/10 text-white transition-colors"
                    aria-label="Previous showcase"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setActiveSlide(prev => (prev + 1) % SHOWCASE_SLIDES.length)}
                    className="p-1 rounded-lg bg-white/5 hover:bg-white/10 text-white transition-colors"
                    aria-label="Next showcase"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Persona Selector Drawer */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-md">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-xs font-bold text-white">
                  <UserIcon className="w-3.5 h-3.5 text-brand-400" />
                  <span>Fast Track: Select a Preloaded Planner Persona</span>
                </div>
                <span className="text-[10px] text-slate-400">Click to autofill</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {DEMO_PERSONAS.map(p => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleSelectPersona(p, false)}
                    className="group flex flex-col p-2.5 rounded-xl bg-slate-900/60 hover:bg-brand-900/30 border border-white/5 hover:border-brand-500/40 text-left transition-all"
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-xs font-bold text-white group-hover:text-brand-300 truncate">
                        {p.name.split(' ')[0]}
                      </span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/10 text-slate-300 font-semibold">
                        {p.badge}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1 truncate">
                      {p.role}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Trust and Social Proof Footnote */}
            <div className="flex items-center gap-4 text-xs text-slate-400 pt-1">
              <div className="flex items-center gap-1 text-amber-400">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                <span className="text-slate-300 font-bold ml-1">4.9/5</span>
              </div>
              <span>•</span>
              <span>12,000+ Events Planned</span>
              <span>•</span>
              <span>₹48Cr+ Budgets Saved</span>
            </div>

          </div>

          {/* Right Column: Premium Auth Form Card */}
          <div className="lg:col-span-6 w-full max-w-md mx-auto">
            <div className="bg-slate-900/90 border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-2xl shadow-2xl relative overflow-hidden">
              
              {/* Top ambient highlight on card */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-500 via-indigo-500 to-purple-500" />

              {/* Form Title & Description */}
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-white tracking-tight">
                  {isRegister ? 'Create Your Planner Account' : 'Welcome Back'}
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  {isRegister
                    ? 'Start organizing dream events with AI precision'
                    : 'Sign in to access your intelligent event workspace'}
                </p>
              </div>

              {/* 1-Click Fast Track Demo Button */}
              <div className="mb-5">
                <button
                  type="button"
                  id="btn-fast-demo"
                  onClick={handleDemoLogin}
                  disabled={loading}
                  className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-brand-600 via-indigo-600 to-brand-600 hover:from-brand-500 hover:via-indigo-500 hover:to-brand-500 text-white font-bold text-sm shadow-lg shadow-brand-500/25 flex items-center justify-center gap-2.5 transition-all hover:scale-[1.01] active:scale-[0.99] group border border-brand-400/30"
                >
                  <Sparkles className="w-4 h-4 text-amber-300 group-hover:rotate-12 transition-transform" />
                  <span>1-Click Test Drive (Demo Planner)</span>
                  <ArrowRight className="w-4 h-4 ml-1 opacity-75 group-hover:translate-x-1 transition-transform" />
                </button>
                <p className="text-[10px] text-center text-slate-400 mt-1.5">
                  Instant access with sample weddings, budgets & guests pre-configured.
                </p>
              </div>

              {/* Google Social SSO Button */}
              <button
                type="button"
                id="btn-google-sso"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full mb-4 py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 text-xs font-semibold flex items-center justify-center gap-2.5 transition-all"
              >
                {/* Google Logo SVG */}
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continue with Google</span>
              </button>

              {/* Or Divider */}
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10" />
                </div>
                <div className="relative flex justify-center text-[11px] uppercase tracking-wider">
                  <span className="bg-slate-900 px-3 text-slate-500 font-semibold">
                    Or with email credentials
                  </span>
                </div>
              </div>

              {/* Mode Toggle Tabs */}
              <div className="flex rounded-2xl bg-black/40 p-1 mb-5 border border-white/5">
                <button
                  type="button"
                  id="tab-signin"
                  onClick={() => switchMode(false)}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all duration-200 ${
                    !isRegister
                      ? 'bg-gradient-to-r from-brand-600 to-indigo-600 text-white shadow-md shadow-brand-500/20'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  id="tab-signup"
                  onClick={() => switchMode(true)}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all duration-200 ${
                    isRegister
                      ? 'bg-gradient-to-r from-brand-600 to-indigo-600 text-white shadow-md shadow-brand-500/20'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Create Account
                </button>
              </div>

              {/* Error Alert Box */}
              {error && (
                <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5 animate-fade-in">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span className="flex-1">{error}</span>
                  <button
                    type="button"
                    onClick={() => setError('')}
                    className="text-rose-400 hover:text-rose-200"
                    aria-label="Dismiss error"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Main Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                
                {/* Full Name (Sign Up only) */}
                {isRegister && (
                  <div>
                    <label
                      htmlFor="input-name"
                      className="block text-xs font-semibold text-slate-300 mb-1"
                    >
                      Your Full Name
                    </label>
                    <div className="relative">
                      <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        id="input-name"
                        type="text"
                        required
                        autoComplete="name"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="e.g. Priya Sharma"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800/80 border border-white/10 text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all"
                      />
                    </div>
                  </div>
                )}

                {/* Event Category / Role Focus (Sign Up only) */}
                {isRegister && (
                  <div>
                    <label
                      htmlFor="select-role"
                      className="block text-xs font-semibold text-slate-300 mb-1"
                    >
                      Primary Planning Focus
                    </label>
                    <select
                      id="select-role"
                      value={roleFocus}
                      onChange={e => setRoleFocus(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all"
                    >
                      <option value="Weddings & Celebrations">Weddings & Celebrations</option>
                      <option value="Corporate Conferences & Galas">Corporate Conferences & Galas</option>
                      <option value="Birthdays & Social Parties">Birthdays & Social Parties</option>
                      <option value="College & Cultural Festivals">College & Cultural Festivals</option>
                      <option value="General Event Organizer">General Event Organizer</option>
                    </select>
                  </div>
                )}

                {/* Email Address */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label
                      htmlFor="input-email"
                      className="block text-xs font-semibold text-slate-300"
                    >
                      Email Address
                    </label>
                    {touchedEmail && !isValidEmail(email) && email && (
                      <span className="text-[10px] text-rose-400 font-medium">Invalid email format</span>
                    )}
                  </div>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      id="input-email"
                      type="email"
                      required
                      inputMode="email"
                      autoComplete="email"
                      value={email}
                      onBlur={() => setTouchedEmail(true)}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="e.g. priya@eventgenie.ai"
                      className={`w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800/80 border text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-all ${
                        touchedEmail && !isValidEmail(email) && email
                          ? 'border-rose-500 focus:border-rose-500'
                          : 'border-white/10 focus:border-brand-500'
                      }`}
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label
                      htmlFor="input-password"
                      className="block text-xs font-semibold text-slate-300"
                    >
                      Password
                    </label>
                    {!isRegister && (
                      <button
                        type="button"
                        onClick={() => {
                          setForgotEmail(email);
                          setForgotModalOpen(true);
                          setForgotStep('request');
                        }}
                        className="text-[11px] font-semibold text-brand-400 hover:text-brand-300 transition-colors"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      id="input-password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      autoComplete={isRegister ? 'new-password' : 'current-password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-800/80 border border-white/10 text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200 p-0.5 rounded transition-colors"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Password Strength Meter (Sign Up Only) */}
                  {isRegister && password && (
                    <div className="mt-2 space-y-1.5 animate-fade-in">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-slate-400">Password strength:</span>
                        <span className="font-bold text-slate-200">{passwordStrength.label}</span>
                      </div>
                      <div className="grid grid-cols-4 gap-1 h-1.5">
                        {[1, 2, 3, 4].map(step => (
                          <div
                            key={step}
                            className={`rounded-full transition-all duration-300 ${
                              step <= passwordStrength.score ? passwordStrength.color : 'bg-white/10'
                            }`}
                          />
                        ))}
                      </div>
                      <div className="flex items-center gap-3 text-[10px] text-slate-400 pt-0.5">
                        <span className={password.length >= 8 ? 'text-emerald-400 flex items-center gap-0.5' : ''}>
                          ✓ 8+ chars
                        </span>
                        <span className={/[0-9]/.test(password) ? 'text-emerald-400 flex items-center gap-0.5' : ''}>
                          ✓ Numbers
                        </span>
                        <span className={/[^A-Za-z0-9]/.test(password) ? 'text-emerald-400 flex items-center gap-0.5' : ''}>
                          ✓ Symbols
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Remember Me Checkbox (Sign In mode) */}
                {!isRegister && (
                  <div className="flex items-center justify-between pt-1">
                    <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300 select-none">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={e => setRememberMe(e.target.checked)}
                        className="rounded border-slate-700 bg-slate-800 text-brand-600 focus:ring-brand-500/50 w-3.5 h-3.5"
                      />
                      <span>Remember my email</span>
                    </label>
                  </div>
                )}

                {/* Terms agreement checkbox (Sign Up mode) */}
                {isRegister && (
                  <div className="pt-1">
                    <label className="flex items-start gap-2 cursor-pointer text-[11px] text-slate-300 select-none">
                      <input
                        type="checkbox"
                        checked={agreeTerms}
                        onChange={e => setAgreeTerms(e.target.checked)}
                        className="rounded border-slate-700 bg-slate-800 text-brand-600 focus:ring-brand-500/50 w-3.5 h-3.5 mt-0.5"
                      />
                      <span>
                        I agree to the{' '}
                        <button
                          type="button"
                          onClick={() => setSecurityModalOpen(true)}
                          className="text-brand-400 underline hover:text-brand-300"
                        >
                          Terms of Service
                        </button>{' '}
                        & Privacy Policy.
                      </span>
                    </label>
                  </div>
                )}

                {/* Submit Action Button */}
                <button
                  type="submit"
                  id="btn-auth-submit"
                  disabled={loading}
                  className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-brand-600 via-indigo-600 to-brand-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-brand-500/25 transition-all flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-70 disabled:pointer-events-none"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      <span>{isRegister ? 'Creating your account...' : 'Signing in...'}</span>
                    </div>
                  ) : (
                    <>
                      <span>{isRegister ? 'Register & Start Planning' : 'Sign In to Workspace'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Mobile Persona Quick Select (Visible only on mobile/tablet) */}
              <div className="mt-6 pt-5 border-t border-white/10 lg:hidden">
                <div className="text-center mb-2.5">
                  <span className="text-[11px] text-slate-400 font-medium">
                    Quick Autofill Persona:
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {DEMO_PERSONAS.map(p => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleSelectPersona(p, false)}
                      className="py-1.5 px-2 rounded-lg bg-white/5 hover:bg-white/10 text-center text-[10px] text-slate-300 font-semibold border border-white/5 truncate"
                    >
                      {p.name.split(' ')[0]} ({p.badge})
                    </button>
                  ))}
                </div>
              </div>

              {/* Security & Encryption Footnote */}
              <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400">
                <button
                  type="button"
                  onClick={() => setSecurityModalOpen(true)}
                  className="flex items-center gap-1.5 hover:text-slate-200 transition-colors"
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>256-Bit Bank-grade Security</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSecurityModalOpen(true)}
                  className="hover:text-slate-200 underline transition-colors"
                >
                  Privacy Details
                </button>
              </div>

            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
        <p>© 2026 EventGenie AI Inc. Built for world-class planners & hosts.</p>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setSecurityModalOpen(true)}
            className="hover:text-slate-400 transition-colors"
          >
            Security & Compliance
          </button>
          <span>•</span>
          <button
            type="button"
            onClick={() => setSecurityModalOpen(true)}
            className="hover:text-slate-400 transition-colors"
          >
            Privacy Policy
          </button>
          <span>•</span>
          <button
            type="button"
            onClick={() => handleDemoLogin()}
            className="text-brand-400 hover:text-brand-300 font-semibold transition-colors"
          >
            Demo VIP Pass
          </button>
        </div>
      </footer>

      {/* ========================================================= */}
      {/* Interactive Forgot Password Modal Dialog */}
      {/* ========================================================= */}
      {forgotModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in"
          role="dialog"
          aria-modal="true"
          aria-labelledby="forgot-modal-title"
        >
          <div className="bg-slate-900 border border-white/15 rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl relative text-slate-100">
            <button
              type="button"
              onClick={() => setForgotModalOpen(false)}
              className="absolute top-5 right-5 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-brand-500/20 text-brand-400 flex items-center justify-center">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 id="forgot-modal-title" className="text-lg font-bold text-white">
                  Reset Your Password
                </h3>
                <p className="text-xs text-slate-400">
                  {forgotStep === 'request'
                    ? "Enter your email to receive a recovery code"
                    : "Enter the code sent to your email"}
                </p>
              </div>
            </div>

            {forgotError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{forgotError}</span>
              </div>
            )}

            {forgotStep === 'request' && (
              <form onSubmit={handleForgotSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Registered Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="email"
                      required
                      value={forgotEmail}
                      onChange={e => setForgotEmail(e.target.value)}
                      placeholder="e.g. priya@eventgenie.ai"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setForgotModalOpen(false)}
                    className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="flex-1 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold transition-colors flex items-center justify-center gap-2"
                  >
                    {forgotLoading ? (
                      <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Send Code</span>
                        <Send className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {forgotStep === 'verify' && (
              <form onSubmit={handleVerifyOtpSubmit} className="space-y-4">
                <div className="p-3 rounded-xl bg-brand-950/50 border border-brand-500/30 text-xs text-brand-300">
                  A verification code has been dispatched to <strong>{forgotEmail}</strong>.
                  <span className="block text-[11px] text-slate-400 mt-1">
                    (For instant test drive, enter: <code className="text-white font-bold bg-white/10 px-1 py-0.5 rounded">849201</code>)
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    6-Digit Verification Code
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={forgotOtp}
                    onChange={e => setForgotOtp(e.target.value)}
                    placeholder="849201"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-white/10 text-white text-center font-mono tracking-widest text-base focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    New Secure Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setForgotStep('request')}
                    className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold transition-colors"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="flex-1 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold transition-colors flex items-center justify-center gap-2"
                  >
                    {forgotLoading ? (
                      <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    ) : (
                      <span>Update Password</span>
                    )}
                  </button>
                </div>
              </form>
            )}

            {forgotStep === 'success' && (
              <div className="text-center py-4 space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-white">Password Updated!</h4>
                <p className="text-xs text-slate-400">
                  Your credentials have been refreshed. Redirecting you to sign in...
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* Interactive Security & Privacy Modal Dialog */}
      {/* ========================================================= */}
      {securityModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in"
          role="dialog"
          aria-modal="true"
          aria-labelledby="security-modal-title"
        >
          <div className="bg-slate-900 border border-white/15 rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl relative text-slate-100 max-h-[85vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setSecurityModalOpen(false)}
              className="absolute top-5 right-5 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 id="security-modal-title" className="text-lg font-bold text-white">
                  EventGenie AI Security & Privacy
                </h3>
                <p className="text-xs text-slate-400">
                  Enterprise-grade data protection for your event operations
                </p>
              </div>
            </div>

            <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5">
                <h4 className="font-bold text-white mb-1 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Private Isolated Workspaces</span>
                </h4>
                <p>
                  Every planner account receives an isolated cryptographic tenant workspace. Your guest lists, financial budgets, and vendor negotiations are never shared or cross-referenced.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5">
                <h4 className="font-bold text-white mb-1 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-brand-400" />
                  <span>Zero Model-Training Guarantee</span>
                </h4>
                <p>
                  Prompts sent to Gemini 3.8 and intelligent planning models are processed via strictly secure API pipelines. Your proprietary ideas and client details are NEVER used for foundation model training.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5">
                <h4 className="font-bold text-white mb-1 flex items-center gap-1.5">
                  <Lock className="w-4 h-4 text-indigo-400" />
                  <span>256-Bit SSL & Token Security</span>
                </h4>
                <p>
                  Sessions utilize modern bearer token authorization with automated credential expiration and CSRF defenses.
                </p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/10 flex justify-end">
              <button
                type="button"
                onClick={() => setSecurityModalOpen(false)}
                className="py-2 px-5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold transition-colors"
              >
                Understood & Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AuthPage;
