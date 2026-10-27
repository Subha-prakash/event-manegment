import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'http';
import app from '../src/index.js';

let server;
let baseUrl;

before(async () => {
  process.env.NODE_ENV = 'test';
  await new Promise(resolve => {
    server = http.createServer(app);
    // Listen on ephemeral port (0) to prevent port conflicts
    server.listen(0, '127.0.0.1', () => {
      const port = server.address().port;
      baseUrl = `http://127.0.0.1:${port}`;
      resolve();
    });
  });
});

after(async () => {
  await new Promise(resolve => server.close(resolve));
});

describe('Integration Tests: Health & AI Engine Status', () => {
  test('GET /api/health returns 200 with ok status and AI mode', async () => {
    const res = await fetch(`${baseUrl}/api/health`);
    assert.equal(res.status, 200);
    const json = await res.json();
    assert.equal(json.status, 'ok');
    assert.ok(json.ai);
    assert.ok(json.ai.model);
  });

  test('GET /api/ai/status returns AI configuration state', async () => {
    const res = await fetch(`${baseUrl}/api/ai/status`);
    assert.equal(res.status, 200);
    const json = await res.json();
    assert.equal(typeof json.hasKey, 'boolean');
    assert.equal(json.model, 'gemini-3.8-flash');
  });
});

describe('Integration Tests: Authentication & Security', () => {
  const testEmail = `test_${Date.now()}@eventgenie.ai`;

  test('POST /api/auth/register registers a new user', async () => {
    const res = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Integration Tester', email: testEmail })
    });

    assert.equal(res.status, 201);
    const json = await res.json();
    assert.ok(json.user);
    assert.equal(json.user.email, testEmail);
    assert.ok(json.token);
  });

  test('POST /api/auth/register rejects duplicate email registration', async () => {
    const res = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Duplicate User', email: testEmail })
    });

    assert.equal(res.status, 409);
    const json = await res.json();
    assert.ok(json.error);
  });

  test('POST /api/auth/login logs in existing user', async () => {
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail })
    });

    assert.equal(res.status, 200);
    const json = await res.json();
    assert.equal(json.user.email, testEmail);
    assert.ok(json.token);
  });

  test('POST /api/auth/demo provides instant demo user credentials', async () => {
    const res = await fetch(`${baseUrl}/api/auth/demo`, { method: 'POST' });
    assert.equal(res.status, 200);
    const json = await res.json();
    assert.equal(json.user.email, 'priya@eventgenie.ai');
    assert.ok(json.token);
  });
});

describe('Integration Tests: Multi-Tenant Authorization & User Isolation', () => {
  let userAEventId;
  const userAId = `usr_alice_${Date.now()}`;
  const userBId = `usr_bob_${Date.now()}`;

  before(async () => {
    // User A creates an event
    const res = await fetch(`${baseUrl}/api/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': userAId
      },
      body: JSON.stringify({
        name: "Alice's Private Gala",
        event_type: 'Corporate',
        event_date: '2026-12-31',
        location: 'Mumbai',
        guest_count: 100,
        budget: 500000,
        currency: 'INR'
      })
    });
    const created = await res.json();
    userAEventId = created.id;
  });

  test("User B receives 403 Forbidden when attempting to GET User A's private event", async () => {
    const res = await fetch(`${baseUrl}/api/events/${userAEventId}`, {
      headers: { 'x-user-id': userBId }
    });
    assert.equal(res.status, 403);
    const json = await res.json();
    assert.ok(json.error.includes('Forbidden'));
  });

  test("User B receives 403 Forbidden when attempting to PUT User A's private event", async () => {
    const res = await fetch(`${baseUrl}/api/events/${userAEventId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': userBId
      },
      body: JSON.stringify({ name: 'Tampered Name' })
    });
    assert.equal(res.status, 403);
  });

  test("User B receives 403 Forbidden when attempting to access User A's budget summary", async () => {
    const res = await fetch(`${baseUrl}/api/events/${userAEventId}/budget-summary`, {
      headers: { 'x-user-id': userBId }
    });
    assert.equal(res.status, 403);
  });

  test("User B receives 403 Forbidden when attempting to DELETE User A's private event", async () => {
    const res = await fetch(`${baseUrl}/api/events/${userAEventId}`, {
      method: 'DELETE',
      headers: { 'x-user-id': userBId }
    });
    assert.equal(res.status, 403);
  });

  test("User A can successfully retrieve their own private event", async () => {
    const res = await fetch(`${baseUrl}/api/events/${userAEventId}`, {
      headers: { 'x-user-id': userAId }
    });
    assert.equal(res.status, 200);
    const json = await res.json();
    assert.equal(json.id, userAEventId);
    assert.equal(json.user_id, userAId);
  });
});

describe('Integration Tests: Event Lifecycle & Planning Features', () => {
  let eventId;
  const testUserId = `usr_planner_${Date.now()}`;

  test('POST /api/events creates an event with an auto-generated AI master plan', async () => {
    const res = await fetch(`${baseUrl}/api/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': testUserId
      },
      body: JSON.stringify({
        name: 'Rohan & Sanya Destination Wedding',
        event_type: 'Wedding',
        event_date: '2026-11-28',
        location: 'Udaipur, Rajasthan',
        guest_count: 150,
        budget: 1200000,
        currency: 'INR',
        theme: 'Royal Rajputana Heritage',
        preferences: {
          venue_type: 'Heritage Palace Courtyard',
          food_preferences: 'North Indian & Rajasthani Delicacies',
          formality: 'High Traditional'
        }
      })
    });

    assert.equal(res.status, 201);
    const event = await res.json();
    assert.ok(event.id);
    eventId = event.id;
    assert.ok(event.plan_data);
    assert.ok(event.plan_data.concept_and_theme);
    assert.ok(Array.isArray(event.plan_data.budget_breakdown));
    assert.ok(Array.isArray(event.plan_data.timeline));
  });

  test('GET /api/events/:id/budget-summary calculates budget summary correctly', async () => {
    const res = await fetch(`${baseUrl}/api/events/${eventId}/budget-summary`, {
      headers: { 'x-user-id': testUserId }
    });

    assert.equal(res.status, 200);
    const summary = await res.json();
    assert.equal(summary.totalBudget, 1200000);
    assert.equal(typeof summary.totalEstimated, 'number');
    assert.equal(typeof summary.remainingBudget, 'number');
    assert.ok(Array.isArray(summary.categoryBreakdown));
    assert.ok(Array.isArray(summary.recommendations));
  });

  test('POST /api/ai/regenerate-section updates specific section without erasing plan', async () => {
    const res = await fetch(`${baseUrl}/api/ai/regenerate-section`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': testUserId
      },
      body: JSON.stringify({
        eventId,
        sectionKey: 'decoration_ideas',
        instructions: 'Use eco-friendly marigolds and brass diya lamps'
      })
    });

    assert.equal(res.status, 200);
    const json = await res.json();
    assert.equal(json.sectionKey, 'decoration_ideas');
    assert.ok(json.data);
    assert.ok(json.fullPlan.concept_and_theme, 'Preserved unrelated plan sections');
  });

  test('Expenses CRUD lifecycle', async () => {
    // 1. Add Expense
    const addRes = await fetch(`${baseUrl}/api/events/${eventId}/expenses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': testUserId
      },
      body: JSON.stringify({
        category: 'Photography and videography',
        description: 'Drone & Candid Shoot',
        estimated_amount: 80000,
        quoted_amount: 75000,
        actual_amount: 75000,
        payment_status: 'Paid'
      })
    });
    assert.equal(addRes.status, 201);
    const expense = await addRes.json();
    assert.ok(expense.id);

    // 2. Update Expense
    const updateRes = await fetch(`${baseUrl}/api/events/${eventId}/expenses/${expense.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': testUserId
      },
      body: JSON.stringify({ actual_amount: 70000 })
    });
    assert.equal(updateRes.status, 200);
    const updated = await updateRes.json();
    assert.equal(updated.actual_amount, 70000);

    // 3. Delete Expense
    const delRes = await fetch(`${baseUrl}/api/events/${eventId}/expenses/${expense.id}`, {
      method: 'DELETE',
      headers: { 'x-user-id': testUserId }
    });
    assert.equal(delRes.status, 200);
  });

  test('Guests & CSV Export lifecycle', async () => {
    // 1. Add Guest
    const addRes = await fetch(`${baseUrl}/api/events/${eventId}/guests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': testUserId
      },
      body: JSON.stringify({
        name: 'Kabir Verma',
        group_name: 'VIP',
        invitation_status: 'Sent',
        rsvp_status: 'Confirmed',
        plus_one_count: 1,
        dietary_preferences: 'Vegetarian'
      })
    });
    assert.equal(addRes.status, 201);
    const guest = await addRes.json();

    // 2. Export CSV
    const csvRes = await fetch(`${baseUrl}/api/events/${eventId}/guests/export`, {
      headers: { 'x-user-id': testUserId }
    });
    assert.equal(csvRes.status, 200);
    assert.equal(csvRes.headers.get('content-type'), 'text/csv; charset=utf-8');
    const text = await csvRes.text();
    assert.ok(text.includes('Kabir Verma'));
    assert.ok(text.includes('Vegetarian'));

    // 3. Delete Guest
    await fetch(`${baseUrl}/api/events/${eventId}/guests/${guest.id}`, {
      method: 'DELETE',
      headers: { 'x-user-id': testUserId }
    });
  });

  test('DELETE /api/events/:id cascades and deletes all associated records', async () => {
    const delRes = await fetch(`${baseUrl}/api/events/${eventId}`, {
      method: 'DELETE',
      headers: { 'x-user-id': testUserId }
    });
    assert.equal(delRes.status, 200);

    // Confirm 404 on subsequent get
    const getRes = await fetch(`${baseUrl}/api/events/${eventId}`, {
      headers: { 'x-user-id': testUserId }
    });
    assert.equal(getRes.status, 404);
  });
});
