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
