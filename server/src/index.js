import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { z } from 'zod';
import { db } from './db.js';
import {
  getAiStatus,
  setApiKey,
  generateFullEventPlan,
  regeneratePlanSection,
  generatePersonalizedIdeas,
  chatWithEventAssistant
} from './aiService.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ----------------------------------------------------
// Security Headers & CORS
// ----------------------------------------------------
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: https: blob:; connect-src 'self' https:;"
  );
  next();
});

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-user-id']
}));
app.options('*', cors());
app.use(express.json({ limit: '2mb' }));

// Normalize request url if accessed via serverless rewrite
app.use((req, res, next) => {
  if (req.url.startsWith('/api/index.js')) {
    req.url = req.url.replace(/^\/api\/index\.js/, '') || '/';
  }
  next();
});

// ----------------------------------------------------
// Rate Limiting Middleware (In-Memory Sliding Window)
// ----------------------------------------------------
const rateLimitStore = new Map();

export function createRateLimiter({ windowMs = 60000, max = 60, message = 'Too many requests, please slow down.' } = {}) {
  return (req, res, next) => {
    const ip = req.ip || req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '127.0.0.1';
    const key = `${ip}:${req.baseUrl || ''}${req.path || ''}`;
    const now = Date.now();
    let entry = rateLimitStore.get(key);

    if (!entry || now > entry.resetAt) {
      entry = { count: 1, resetAt: now + windowMs };
      rateLimitStore.set(key, entry);
    } else {
      entry.count += 1;
    }

    res.setHeader('RateLimit-Limit', max);
    res.setHeader('RateLimit-Remaining', Math.max(0, max - entry.count));
    res.setHeader('RateLimit-Reset', Math.ceil(entry.resetAt / 1000));

    if (entry.count > max) {
      res.setHeader('Retry-After', Math.ceil((entry.resetAt - now) / 1000));
      return res.status(429).json({ error: message });
    }
    next();
  };
}

const authRateLimiter = createRateLimiter({ windowMs: 60000, max: 40, message: 'Too many authentication attempts. Please wait.' });
const aiRateLimiter = createRateLimiter({ windowMs: 60000, max: 30, message: 'AI rate limit exceeded. Please wait a moment.' });

// Helper to extract or fallback user
export function getActiveUserId(req) {
  if (req.headers['x-user-id']) return req.headers['x-user-id'];
  const auth = req.headers['authorization'];
  if (auth && auth.startsWith('Bearer tok_')) {
    return auth.replace('Bearer tok_', '');
  }
  return 'usr_demo_01';
}

// ----------------------------------------------------
// Event Authorization & Ownership Middleware
// ----------------------------------------------------
export function authorizeEvent(req, res, next) {
  const eventId = req.params.id || req.params.eventId || req.body?.eventId;
  if (!eventId) {
    return res.status(400).json({ error: 'Event ID is required' });
  }

  const event = db.getEventById(eventId);
  if (!event) {
    return res.status(404).json({ error: 'Event not found' });
  }

  const userId = getActiveUserId(req);
  // Enforce resource ownership check
  if (event.user_id && event.user_id !== userId) {
    return res.status(403).json({ error: 'Forbidden: You do not have permission to access this event' });
  }

  req.event = event;
  next();
}

// ----------------------------------------------------
// Health & AI Status
// ----------------------------------------------------
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    ai: getAiStatus()
  });
});

app.get('/api/ai/status', (req, res) => {
  res.json(getAiStatus());
});

app.post('/api/ai/configure-key', (req, res) => {
  const { apiKey } = req.body;
  const status = setApiKey(apiKey);
  res.json({
    success: true,
    message: status.hasKey ? 'Gemini API key updated and active' : 'Switched to Built-in Intelligent Planner',
    ai: status
  });
});

// ----------------------------------------------------
// Auth Endpoints
// ----------------------------------------------------
app.post('/api/auth/login', authRateLimiter, (req, res) => {
  const { email, name } = req.body;
  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return res.status(400).json({ error: 'A valid email is required' });
  }

  let user = db.getUserByEmail(email.trim());
  if (!user) {
    user = db.createUser({
      name: (name || email.split('@')[0]).trim(),
      email: email.trim()
    });
  }

  res.json({ user, token: `tok_${user.id}` });
});

app.post('/api/auth/register', authRateLimiter, (req, res) => {
  const { name, email } = req.body;
  if (!email || !name || typeof email !== 'string' || !email.includes('@')) {
    return res.status(400).json({ error: 'Name and a valid email are required' });
  }

  const existing = db.getUserByEmail(email.trim());
  if (existing) {
    return res.status(409).json({ error: 'User already exists with this email' });
  }

  const user = db.createUser({ name: name.trim(), email: email.trim() });
  res.status(201).json({ user, token: `tok_${user.id}` });
});

app.get('/api/auth/me', (req, res) => {
  const userId = getActiveUserId(req);
  const user = db.getUserById(userId) || db.getUserById('usr_demo_01');
  res.json({ user });
});

app.post('/api/auth/demo', (req, res) => {
  const demoUser = db.getUserById('usr_demo_01') || {
    id: 'usr_demo_01',
    name: 'Priya Sharma',
    email: 'priya@eventgenie.ai'
  };
  res.json({ user: demoUser, token: 'tok_usr_demo_01' });
});

// ----------------------------------------------------
// Events Endpoints
// ----------------------------------------------------
const eventCreateSchema = z.object({
  name: z.string().min(1, "Event name is required"),
  event_type: z.string(),
  event_date: z.string(),
  end_date: z.string().optional(),
  location: z.string().min(1, "Location is required"),
  guest_count: z.number().positive(),
  budget: z.number().positive(),
  currency: z.string().default('INR'),
  theme: z.string().optional(),
  preferences: z.object({
    venue_type: z.string().optional(),
    food_preferences: z.string().optional(),
    cultural_traditions: z.string().optional(),
    formality: z.string().optional(),
    special_requests: z.string().optional()
  }).optional()
});

app.get('/api/events', (req, res) => {
  const userId = getActiveUserId(req);
  const events = db.getEventsByUser(userId);
  res.json(events);
});

app.post('/api/events', async (req, res) => {
  try {
    const userId = getActiveUserId(req);
    const parsed = eventCreateSchema.parse(req.body);

    // 1. Generate full AI event plan
    const plan = await generateFullEventPlan(parsed);

    // 2. Create the event
    const newEvent = db.createEvent({
      ...parsed,
      user_id: userId,
      plan_data: plan
    });

    // 3. Seed initial expense breakdown based on AI plan
    if (plan.budget_breakdown && Array.isArray(plan.budget_breakdown)) {
      plan.budget_breakdown.forEach((item) => {
        db.addExpense({
          event_id: newEvent.id,
          category: item.category,
          description: item.reason || `${item.category} allocation`,
          estimated_amount: Number(item.estimated_cost) || 0,
          quoted_amount: 0,
          actual_amount: 0,
          payment_status: 'Pending',
          due_date: newEvent.event_date,
          notes: 'Generated by EventGenie AI'
        });
      });
    }

    // 4. Seed initial tasks based on AI plan timeline
    if (plan.timeline && Array.isArray(plan.timeline)) {
      const eventTimestamp = new Date(newEvent.event_date).getTime();
      plan.timeline.forEach((item) => {
        const days = Number(item.days_before_event) || 14;
        const dueDate = new Date(eventTimestamp - (days * 86400000)).toISOString().split('T')[0];
        db.addTask({
          event_id: newEvent.id,
          title: item.task,
          description: item.description || `Milestone for ${newEvent.name} (T-${days} days)`,
          due_date: dueDate,
          priority: item.priority || 'Medium',
          status: 'Not Started',
          assigned_to: 'Planner Team'
        });
      });
    }

    // 5. Seed initial personalized ideas
    if (plan.personalized_ideas && Array.isArray(plan.personalized_ideas)) {
      plan.personalized_ideas.forEach(idea => {
        db.addSavedIdea({
          event_id: newEvent.id,
          user_id: userId,
          category: idea.category || 'Theme',
          title: idea.title,
          description: idea.description,
          estimated_cost: idea.estimated_cost || 0
        });
      });
    }

    // 6. Add welcome conversation message
    db.addAiConversation({
      user_id: userId,
      event_id: newEvent.id,
      role: 'assistant',
      message: `Congratulations on creating "${newEvent.name}"! I've formulated a complete master plan with budget allocations, a milestone timeline, and vendor checklists. How can I help fine-tune your preparations today?`
    });

    res.status(201).json(newEvent);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation error', details: err.errors });
    }
    console.error("Error creating event:", err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

app.get('/api/events/:id', authorizeEvent, (req, res) => {
  res.json(req.event);
});

app.put('/api/events/:id', authorizeEvent, (req, res) => {
  const updated = db.updateEvent(req.params.id, req.body);
  if (!updated) {
    return res.status(404).json({ error: 'Event not found' });
  }
  res.json(updated);
});

app.delete('/api/events/:id', authorizeEvent, (req, res) => {
  const success = db.deleteEvent(req.params.id);
  if (!success) {
    return res.status(404).json({ error: 'Event not found' });
  }
  res.json({ success: true, message: 'Event and all associated data deleted successfully' });
});

// ----------------------------------------------------
// AI Plan & Section Regeneration
// ----------------------------------------------------
app.post('/api/ai/generate-plan', aiRateLimiter, async (req, res) => {
  try {
    const plan = await generateFullEventPlan(req.body);
    res.json(plan);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/ai/regenerate-section', aiRateLimiter, authorizeEvent, async (req, res) => {
  try {
    const { sectionKey, instructions } = req.body;
    const event = req.event;

    const updatedSection = await regeneratePlanSection(event, sectionKey, instructions);

    // Update in event plan_data
    const currentPlan = event.plan_data || {};
    const newPlan = { ...currentPlan, ...updatedSection };
    db.updateEvent(event.id, { plan_data: newPlan });

    res.json({
      sectionKey,
      data: updatedSection[sectionKey],
      fullPlan: newPlan
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/ai/generate-ideas', aiRateLimiter, async (req, res) => {
  try {
    const { eventId, category } = req.body;
    const event = eventId ? db.getEventById(eventId) : null;
    const ideas = await generatePersonalizedIdeas(event || req.body, category);
    res.json(ideas);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ----------------------------------------------------
// AI Contextual Chat
// ----------------------------------------------------
app.get('/api/ai/conversations/:eventId', (req, res, next) => {
  req.params.id = req.params.eventId;
  next();
}, authorizeEvent, (req, res) => {
  const history = db.getAiConversations(req.params.eventId);
  res.json(history);
});

app.post('/api/ai/chat', aiRateLimiter, (req, res, next) => {
  req.params.id = req.body?.eventId;
  next();
}, authorizeEvent, async (req, res) => {
  try {
    const { eventId, message } = req.body;
    const userId = getActiveUserId(req);
    const event = req.event;

    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message cannot be empty' });
    }

    // Save user message
    db.addAiConversation({
      user_id: userId,
      event_id: eventId,
      role: 'user',
      message: message.trim()
    });

    const conversationHistory = db.getAiConversations(eventId);

    // Call AI assistant
    const { reply, suggested_action } = await chatWithEventAssistant({
      event,
      message,
      conversationHistory: conversationHistory.slice(-6)
    });

    // Save assistant reply
    const assistantMsg = db.addAiConversation({
      user_id: userId,
      event_id: eventId,
      role: 'assistant',
      message: reply
    });

    res.json({
      message: assistantMsg,
      suggested_action
    });
  } catch (err) {
    console.error("Chat error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ----------------------------------------------------
// Expenses & Budget Management
// ----------------------------------------------------
app.get('/api/events/:id/expenses', authorizeEvent, (req, res) => {
  const expenses = db.getExpensesByEvent(req.params.id);
  res.json(expenses);
});

app.post('/api/events/:id/expenses', authorizeEvent, (req, res) => {
  const expense = db.addExpense({
    ...req.body,
    event_id: req.params.id
  });
  res.status(201).json(expense);
});

app.put('/api/events/:id/expenses/:expenseId', authorizeEvent, (req, res) => {
  const updated = db.updateExpense(req.params.expenseId, req.body);
  if (!updated) return res.status(404).json({ error: 'Expense not found' });
  res.json(updated);
});

app.delete('/api/events/:id/expenses/:expenseId', authorizeEvent, (req, res) => {
  const ok = db.deleteExpense(req.params.expenseId);
  if (!ok) return res.status(404).json({ error: 'Expense not found' });
  res.json({ success: true });
});

app.get('/api/events/:id/budget-summary', authorizeEvent, (req, res) => {
  const event = req.event;
  const expenses = db.getExpensesByEvent(req.params.id);
  const vendors = db.getVendorsByEvent(req.params.id);

  const totalBudget = Number(event.budget) || 0;
  const totalEstimated = expenses.reduce((sum, e) => sum + (Number(e.estimated_amount) || 0), 0);
  const totalQuoted = expenses.reduce((sum, e) => sum + (Number(e.quoted_amount) || 0), 0);
  const totalActual = expenses.reduce((sum, e) => sum + (Number(e.actual_amount) || 0), 0);

  // Vendor pending payment calculation
  const totalAgreedVendorCost = vendors.reduce((sum, v) => sum + (Number(v.agreed_price) || 0), 0);
  const totalAdvancePaid = vendors.reduce((sum, v) => sum + (Number(v.advance_paid) || 0), 0);
  const totalPendingVendorBalance = Math.max(0, totalAgreedVendorCost - totalAdvancePaid);

  // Remaining budget: Uses actual spending if recorded, otherwise falls back to estimated commitments
  const expenseBasis = totalActual > 0 ? totalActual : totalEstimated;
  const remainingBudget = totalBudget - expenseBasis;
  const utilizationPercentage = totalBudget > 0 ? Number(((expenseBasis / totalBudget) * 100).toFixed(1)) : 0;
  const isOverBudget = expenseBasis > totalBudget;

  // Category aggregations
  const categoryMap = {};
  expenses.forEach(e => {
    const cat = e.category || 'Other';
    if (!categoryMap[cat]) {
      categoryMap[cat] = { category: cat, estimated: 0, quoted: 0, actual: 0, count: 0 };
    }
    categoryMap[cat].estimated += Number(e.estimated_amount) || 0;
    categoryMap[cat].quoted += Number(e.quoted_amount) || 0;
    categoryMap[cat].actual += Number(e.actual_amount) || 0;
    categoryMap[cat].count += 1;
  });

  const categoryBreakdown = Object.values(categoryMap);

  // Recommendations
  const recommendations = [];
  if (totalEstimated > totalBudget) {
    const diff = totalEstimated - totalBudget;
    recommendations.push({
      type: 'warning',
      text: `Your estimated costs exceed the allocated budget by ${event.currency} ${diff.toLocaleString()}. Consider shifting to local seasonal decor or limiting menu courses.`
    });
  } else {
    recommendations.push({
      type: 'success',
      text: `Estimated spending is well within your budget limit of ${event.currency} ${totalBudget.toLocaleString()}. You have a safe buffer of ${event.currency} ${(totalBudget - totalEstimated).toLocaleString()}.`
    });
  }

  if (totalPendingVendorBalance > 0) {
    recommendations.push({
      type: 'info',
      text: `You have ${event.currency} ${totalPendingVendorBalance.toLocaleString()} in pending vendor balances due before the event date.`
    });
  }

  res.json({
    totalBudget,
    totalEstimated,
    totalQuoted,
    totalActual,
    remainingBudget,
    utilizationPercentage,
    isOverBudget,
    totalPendingVendorBalance,
    totalAgreedVendorCost,
    totalAdvancePaid,
    categoryBreakdown,
    recommendations
  });
});

// ----------------------------------------------------
// Tasks & Timeline Management
// ----------------------------------------------------
app.get('/api/events/:id/tasks', authorizeEvent, (req, res) => {
  const tasks = db.getTasksByEvent(req.params.id);
  res.json(tasks);
});

app.post('/api/events/:id/tasks', authorizeEvent, (req, res) => {
  const task = db.addTask({
    ...req.body,
    event_id: req.params.id
  });
  res.status(201).json(task);
});

app.put('/api/events/:id/tasks/:taskId', authorizeEvent, (req, res) => {
  const updated = db.updateTask(req.params.taskId, req.body);
  if (!updated) return res.status(404).json({ error: 'Task not found' });
  res.json(updated);
});

app.delete('/api/events/:id/tasks/:taskId', authorizeEvent, (req, res) => {
  const ok = db.deleteTask(req.params.taskId);
  if (!ok) return res.status(404).json({ error: 'Task not found' });
  res.json({ success: true });
});

// ----------------------------------------------------
// Vendors Management
// ----------------------------------------------------
app.get('/api/events/:id/vendors', authorizeEvent, (req, res) => {
  const vendors = db.getVendorsByEvent(req.params.id);
  res.json(vendors);
});

app.post('/api/events/:id/vendors', authorizeEvent, (req, res) => {
  const vendor = db.addVendor({
    ...req.body,
    event_id: req.params.id
  });
  res.status(201).json(vendor);
});

app.put('/api/events/:id/vendors/:vendorId', authorizeEvent, (req, res) => {
  const updated = db.updateVendor(req.params.vendorId, req.body);
  if (!updated) return res.status(404).json({ error: 'Vendor not found' });
  res.json(updated);
});

app.delete('/api/events/:id/vendors/:vendorId', authorizeEvent, (req, res) => {
  const ok = db.deleteVendor(req.params.vendorId);
  if (!ok) return res.status(404).json({ error: 'Vendor not found' });
  res.json({ success: true });
});

// ----------------------------------------------------
// Guests & RSVP Management
// ----------------------------------------------------
app.get('/api/events/:id/guests', authorizeEvent, (req, res) => {
  const guests = db.getGuestsByEvent(req.params.id);
  res.json(guests);
});

app.post('/api/events/:id/guests', authorizeEvent, (req, res) => {
  const guest = db.addGuest({
    ...req.body,
    event_id: req.params.id
  });
  res.status(201).json(guest);
});

app.put('/api/events/:id/guests/:guestId', authorizeEvent, (req, res) => {
  const updated = db.updateGuest(req.params.guestId, req.body);
  if (!updated) return res.status(404).json({ error: 'Guest not found' });
  res.json(updated);
});

app.delete('/api/events/:id/guests/:guestId', authorizeEvent, (req, res) => {
  const ok = db.deleteGuest(req.params.guestId);
  if (!ok) return res.status(404).json({ error: 'Guest not found' });
  res.json({ success: true });
});

app.get('/api/events/:id/guests/export', authorizeEvent, (req, res) => {
  const guests = db.getGuestsByEvent(req.params.id);
  const event = req.event;

  let csv = 'Name,Group,Invitation Status,RSVP Status,Plus Ones,Total Attendees,Dietary Preferences,Contact Details\n';
  guests.forEach(g => {
    const attendees = 1 + (Number(g.plus_one_count) || 0);
    const row = [
      `"${(g.name || '').replace(/"/g, '""')}"`,
      `"${(g.group_name || '').replace(/"/g, '""')}"`,
      `"${g.invitation_status || 'Draft'}"`,
      `"${g.rsvp_status || 'Pending'}"`,
      g.plus_one_count || 0,
      attendees,
      `"${(g.dietary_preferences || '').replace(/"/g, '""')}"`,
      `"${(g.contact_details || '').replace(/"/g, '""')}"`
    ];
    csv += row.join(',') + '\n';
  });

  const filename = `${(event?.name || 'event').replace(/\s+/g, '_')}_guests.csv`;
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.send(csv);
});

// ----------------------------------------------------
// Saved Ideas
// ----------------------------------------------------
app.get('/api/events/:id/ideas', authorizeEvent, (req, res) => {
  const ideas = db.getSavedIdeasByEvent(req.params.id);
  res.json(ideas);
});

app.post('/api/events/:id/ideas', authorizeEvent, (req, res) => {
  const userId = getActiveUserId(req);
  const idea = db.addSavedIdea({
    ...req.body,
    event_id: req.params.id,
    user_id: userId
  });
  res.status(201).json(idea);
});

app.delete('/api/events/:id/ideas/:ideaId', (req, res) => {
  const ok = db.deleteSavedIdea(req.params.ideaId);
  if (!ok) return res.status(404).json({ error: 'Idea not found' });
  res.json({ success: true });
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientDistPath = path.resolve(__dirname, '../../client/dist');

// Serve client dist if it exists (for full-stack single-port demo or production)
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  
  // SPA Catch-all fallback for client-side routing (ignoring /api routes)
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

// Start Server if run directly (not when imported in test suites or serverless)
const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
const isDirectRun = Boolean(process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]));

if (!isServerless && process.env.NODE_ENV !== 'test' && isDirectRun) {
  app.listen(PORT, () => {
    console.log(`🚀 EventGenie AI Server running on port ${PORT}`);
    console.log(`🤖 AI Status: ${getAiStatus().mode} (${getAiStatus().model})`);
    if (fs.existsSync(clientDistPath)) {
      console.log(`🌐 Serving static client UI from ${clientDistPath}`);
    }
  });
}

export default app;
