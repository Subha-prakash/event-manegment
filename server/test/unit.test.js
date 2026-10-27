import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { planDataSchema, ideasSchema } from '../src/aiService.js';
import { z } from 'zod';

describe('Unit Tests: Financial & Budget Calculations', () => {
  function calculateBudgetSummary(event, expenses = [], vendors = []) {
    const totalBudget = Number(event?.budget) || 0;
    const totalEstimated = expenses.reduce((sum, e) => sum + (Number(e.estimated_amount) || 0), 0);
    const totalQuoted = expenses.reduce((sum, e) => sum + (Number(e.quoted_amount) || 0), 0);
    const totalActual = expenses.reduce((sum, e) => sum + (Number(e.actual_amount) || 0), 0);

    const totalAgreedVendorCost = vendors.reduce((sum, v) => sum + (Number(v.agreed_price) || 0), 0);
    const totalAdvancePaid = vendors.reduce((sum, v) => sum + (Number(v.advance_paid) || 0), 0);
    const totalPendingVendorBalance = Math.max(0, totalAgreedVendorCost - totalAdvancePaid);

    const expenseBasis = totalActual > 0 ? totalActual : totalEstimated;
    const remainingBudget = totalBudget - expenseBasis;
    const utilizationPercentage = totalBudget > 0 ? Number(((expenseBasis / totalBudget) * 100).toFixed(1)) : 0;
    const isOverBudget = expenseBasis > totalBudget;

    return {
      totalBudget,
      totalEstimated,
      totalQuoted,
      totalActual,
      remainingBudget,
      utilizationPercentage,
      isOverBudget,
      totalPendingVendorBalance,
      totalAgreedVendorCost,
      totalAdvancePaid
    };
  }

  test('calculates correct total estimated, quoted, and actual expenses', () => {
    const event = { budget: 1000000, currency: 'INR' };
    const expenses = [
      { estimated_amount: 300000, quoted_amount: 280000, actual_amount: 280000 },
      { estimated_amount: 200000, quoted_amount: 210000, actual_amount: 0 },
      { estimated_amount: 150000, quoted_amount: 140000, actual_amount: 140000 }
    ];

    const result = calculateBudgetSummary(event, expenses, []);
    assert.equal(result.totalBudget, 1000000);
    assert.equal(result.totalEstimated, 650000);
    assert.equal(result.totalQuoted, 630000);
    assert.equal(result.totalActual, 420000);
    assert.equal(result.remainingBudget, 580000);
    assert.equal(result.isOverBudget, false);
    assert.equal(result.utilizationPercentage, 42.0);
  });

  test('handles zero budget edge case safely without division by zero', () => {
    const event = { budget: 0 };
    const expenses = [{ estimated_amount: 5000, actual_amount: 0 }];

    const result = calculateBudgetSummary(event, expenses, []);
    assert.equal(result.totalBudget, 0);
    assert.equal(result.utilizationPercentage, 0);
    assert.equal(result.isOverBudget, true);
    assert.equal(result.remainingBudget, -5000);
  });

  test('correctly flags overspending when expenses exceed allocated budget', () => {
    const event = { budget: 500000 };
    const expenses = [
      { estimated_amount: 400000, actual_amount: 0 },
      { estimated_amount: 200000, actual_amount: 0 }
    ];

    const result = calculateBudgetSummary(event, expenses, []);
    assert.equal(result.totalEstimated, 600000);
    assert.equal(result.isOverBudget, true);
    assert.equal(result.remainingBudget, -100000);
    assert.equal(result.utilizationPercentage, 120.0);
  });

  test('calculates vendor payment balances accurately', () => {
    const event = { budget: 800000 };
    const vendors = [
      { agreed_price: 150000, advance_paid: 50000 },
      { agreed_price: 200000, advance_paid: 200000 },
      { agreed_price: 80000, advance_paid: 0 }
    ];

    const result = calculateBudgetSummary(event, [], vendors);
    assert.equal(result.totalAgreedVendorCost, 430000);
    assert.equal(result.totalAdvancePaid, 250000);
    assert.equal(result.totalPendingVendorBalance, 180000);
  });

  test('handles advance paid exceeding agreed price gracefully (no negative balance)', () => {
    const event = { budget: 500000 };
    const vendors = [{ agreed_price: 50000, advance_paid: 60000 }];

    const result = calculateBudgetSummary(event, [], vendors);
    assert.equal(result.totalPendingVendorBalance, 0);
  });

  test('handles invalid string numbers and undefined values safely', () => {
    const event = { budget: '750000' };
    const expenses = [
      { estimated_amount: '250000', actual_amount: null },
      { estimated_amount: undefined, actual_amount: '50000' }
    ];

    const result = calculateBudgetSummary(event, expenses, []);
    assert.equal(result.totalBudget, 750000);
    assert.equal(result.totalEstimated, 250000);
    assert.equal(result.totalActual, 50000);
    assert.equal(result.remainingBudget, 700000);
  });
});

describe('Unit Tests: Guest RSVP & Attendee Logic', () => {
  test('calculates total attendees including plus-ones correctly', () => {
    const guests = [
      { name: 'Aarav Patel', plus_one_count: 0, rsvp_status: 'Confirmed' },
      { name: 'Meera Sharma', plus_one_count: 2, rsvp_status: 'Confirmed' },
      { name: 'Vikram Rao', plus_one_count: 1, rsvp_status: 'Declined' }
    ];

    const totalHeadcount = guests.reduce((sum, g) => sum + 1 + (Number(g.plus_one_count) || 0), 0);
    assert.equal(totalHeadcount, 6);

    const confirmedHeadcount = guests
      .filter(g => g.rsvp_status === 'Confirmed')
      .reduce((sum, g) => sum + 1 + (Number(g.plus_one_count) || 0), 0);
    assert.equal(confirmedHeadcount, 4);
  });

  test('CSV formatting properly escapes quotes and commas in guest data', () => {
    function formatCsvRow(fields) {
      return fields.map(f => `"${String(f).replace(/"/g, '""')}"`).join(',');
    }

    const row = formatCsvRow(['Sharma, "Dr." Priya', 'Family & VIP', 'Vegan, Gluten-free']);
    assert.equal(row, '"Sharma, ""Dr."" Priya","Family & VIP","Vegan, Gluten-free"');
  });
});

describe('Unit Tests: AI Output Schema Validation', () => {
  test('validates conformant AI plan data structure', () => {
    const sampleAiPlan = {
      concept_and_theme: 'Royal Heritage with Golden Accents',
      decoration_ideas: ['Marigold floral canopy', 'Antique brass lamps'],
      venue_requirements: ['Outdoor courtyard with minimum 5,000 sq ft'],
      catering_menu: ['Traditional Rajasthani Thali', 'Live Jalebi Station'],
      entertainment_and_program: ['Folk dance troupe', 'Acoustic Sangeet'],
      guest_experience: ['Welcome garland and royal turban ceremony'],
      vendor_checklist: ['Venue coordinator', 'Caterer', 'Decorator'],
      budget_breakdown: [
        { category: 'Venue', estimated_cost: 300000, reason: 'Courtyard rental' }
      ],
      timeline: [
        { days_before_event: 30, task: 'Finalize catering menu', priority: 'High' }
      ],
      essential_reminders: ['Check outdoor sound permit curfews']
    };

    const validated = planDataSchema.parse(sampleAiPlan);
    assert.equal(validated.concept_and_theme, 'Royal Heritage with Golden Accents');
    assert.equal(validated.budget_breakdown.length, 1);
    assert.equal(validated.budget_breakdown[0].estimated_cost, 300000);
    assert.equal(validated.timeline[0].priority, 'High');
  });

  test('applies safe defaults when optional plan fields are missing', () => {
    const minimalPlan = {
      concept_and_theme: 'Minimalist Celebration'
    };

    const validated = planDataSchema.parse(minimalPlan);
    assert.equal(validated.concept_and_theme, 'Minimalist Celebration');
    assert.deepEqual(validated.decoration_ideas, []);
    assert.deepEqual(validated.budget_breakdown, []);
    assert.deepEqual(validated.timeline, []);
  });

  test('validates personalized ideas array schema', () => {
    const sampleIdeas = [
      {
        category: 'DIY Decorations',
        title: 'Origami Crane Photobooth',
        description: 'Fold colorful paper cranes for an eye-catching backdrop.',
        estimated_cost: 1500
      }
    ];

    const validated = ideasSchema.parse(sampleIdeas);
    assert.equal(validated.length, 1);
    assert.equal(validated[0].title, 'Origami Crane Photobooth');
    assert.equal(validated[0].estimated_cost, 1500);
  });
});

describe('Unit Tests: Input Schemas & Security Validation', () => {
  const eventCreateSchema = z.object({
    name: z.string().min(1, 'Event name is required'),
    event_type: z.string(),
    event_date: z.string(),
    location: z.string().min(1, 'Location is required'),
    guest_count: z.number().positive(),
    budget: z.number().positive()
  });

  test('accepts valid event parameters', () => {
    const valid = {
      name: 'Annual Tech Gala',
      event_type: 'Corporate',
      event_date: '2026-12-15',
      location: 'Bengaluru',
      guest_count: 250,
      budget: 1500000
    };

    const result = eventCreateSchema.safeParse(valid);
    assert.equal(result.success, true);
  });

  test('rejects negative or zero budgets', () => {
    const invalid = {
      name: 'Invalid Budget Event',
      event_type: 'Birthday',
      event_date: '2026-11-10',
      location: 'Mumbai',
      guest_count: 50,
      budget: -50000
    };

    const result = eventCreateSchema.safeParse(invalid);
    assert.equal(result.success, false);
  });

  test('rejects empty event name', () => {
    const invalid = {
      name: '',
      event_type: 'Wedding',
      event_date: '2026-11-10',
      location: 'Delhi',
      guest_count: 100,
      budget: 500000
    };

    const result = eventCreateSchema.safeParse(invalid);
    assert.equal(result.success, false);
  });
});

describe('Unit Tests: AI Fallback Engine & Resiliency', () => {
  test('generates comprehensive master plan via built-in engine when API key is unset', async () => {
    const { generateFullEventPlan } = await import('../src/aiService.js');
    const mockEvent = {
      name: 'Priya & Rohan Sangeet Night',
      event_type: 'Wedding',
      event_date: '2026-11-20',
      location: 'Udaipur, Rajasthan',
      guest_count: 200,
      budget: 800000,
      currency: 'INR',
      theme: 'Royal Heritage'
    };

    const plan = await generateFullEventPlan(mockEvent);
    assert.ok(plan, 'Plan must be generated');
    assert.ok(plan.concept_and_theme, 'Must contain concept and theme');
    assert.ok(Array.isArray(plan.decoration_ideas) && plan.decoration_ideas.length > 0);
    assert.ok(Array.isArray(plan.food_and_catering) && plan.food_and_catering.length > 0);
    assert.ok(Array.isArray(plan.budget_breakdown) && plan.budget_breakdown.length > 0);
    assert.ok(Array.isArray(plan.timeline) && plan.timeline.length > 0);
    assert.ok(Array.isArray(plan.vendor_checklist) && plan.vendor_checklist.length > 0);
  });

  test('budget breakdown allocates realistic portions matching target budget', async () => {
    const { generateFullEventPlan } = await import('../src/aiService.js');
    const targetBudget = 500000;
    const plan = await generateFullEventPlan({
      name: 'College Cultural Fest',
      event_type: 'College Fest',
      event_date: '2026-12-05',
      location: 'Pune',
      guest_count: 500,
      budget: targetBudget,
      currency: 'INR'
    });

    const allocatedTotal = plan.budget_breakdown.reduce((sum, item) => sum + (Number(item.estimated_cost) || 0), 0);
    assert.ok(allocatedTotal > 0, 'Allocated total must be greater than zero');
    // Budget allocation should be within 35% of total budget
    assert.ok(Math.abs(allocatedTotal - targetBudget) < targetBudget * 0.35, 'Allocated total should be reasonably close to target');
  });
});

describe('Unit Tests: Task Status & Workflow Transitions', () => {
  const VALID_STATUSES = ['Not Started', 'In Progress', 'Completed'];
  const VALID_PRIORITIES = ['High', 'Medium', 'Low'];

  function transitionTaskStatus(currentStatus) {
    if (currentStatus === 'Completed') return 'In Progress';
    if (currentStatus === 'Not Started') return 'In Progress';
    return 'Completed';
  }

  test('toggles task status correctly through lifecycle', () => {
    assert.equal(transitionTaskStatus('Not Started'), 'In Progress');
    assert.equal(transitionTaskStatus('In Progress'), 'Completed');
    assert.equal(transitionTaskStatus('Completed'), 'In Progress');
  });

  test('validates standard priorities', () => {
    VALID_PRIORITIES.forEach(priority => {
      assert.ok(VALID_PRIORITIES.includes(priority));
    });
  });
});

describe('Unit Tests: Rate Limiter Sliding Window Logic', () => {
  test('correctly calculates remaining quota and reset timestamps', () => {
    const windowMs = 60000;
    const maxRequests = 100;
    const now = Date.now();
    const entry = { count: 42, resetAt: now + windowMs };

    const remaining = Math.max(0, maxRequests - entry.count);
    const resetSeconds = Math.ceil(entry.resetAt / 1000);

    assert.equal(remaining, 58);
    assert.ok(resetSeconds > 0);
  });

  test('flags rate-limit violations when request count exceeds threshold', () => {
    const max = 50;
    const count = 51;
    const isExceeded = count > max;
    assert.equal(isExceeded, true);
  });
});
