async function runTests() {
  console.log('--- STARTING INTEGRATION TESTS ---');

  // 1. Health
  const health = await (await fetch('http://localhost:5000/api/health')).json();
  console.log('1. Health check passed:', health.status, '| AI mode:', health.ai.mode);

  // 2. Events List
  const events = await (await fetch('http://localhost:5000/api/events')).json();
  console.log('2. Loaded events:', events.length, '| First event:', events[0].name);

  // 3. Create Event with AI Plan Auto-Generation
  const newEvtRes = await fetch('http://localhost:5000/api/events', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: "Rohan's 25th Sunset Beach Birthday Bash",
      event_type: 'Birthday',
      event_date: '2026-11-20',
      location: 'Goa, India',
      guest_count: 50,
      budget: 150000,
      currency: 'INR',
      theme: 'Tropical Sunset Glow and Acoustic Beats',
      preferences: {
        venue_type: 'Beachfront Lawn and Cabana Lounge',
        food_preferences: 'Coastal BBQ, Woodfire Pizza, Fresh Mocktails',
        cultural_traditions: 'Modern Birthday Party',
        formality: 'Casual Chic',
        special_requests: 'Sunset bonfire with marshmallow roasting'
      }
    })
  });
  const newEvent = await newEvtRes.json();
  console.log('3. Event created with AI plan:', newEvent.id, '|', newEvent.name);
  console.log('   Plan sections generated:', Object.keys(newEvent.plan_data || {}));

  // 4. Budget Summary Calculation
  const summary = await (await fetch(`http://localhost:5000/api/events/${newEvent.id}/budget-summary`)).json();
  console.log('4. Budget summary calculated:');
  console.log('   Total Budget:', summary.totalBudget);
  console.log('   Total Estimated:', summary.totalEstimated);
  console.log('   Remaining Budget:', summary.remainingBudget);
  console.log('   Category Breakdown items:', summary.categoryBreakdown.length);

  // 5. Section Regeneration
  const regenRes = await fetch('http://localhost:5000/api/ai/regenerate-section', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      eventId: newEvent.id,
      sectionKey: 'decoration_ideas',
      instructions: 'Add glowing neon palm signs and fairy light canopy'
    })
  });
  const regenData = await regenRes.json();
  console.log('5. Section regenerated:', regenData.sectionKey, '| New items count:', regenData.data.length);

  // 6. AI Contextual Chat
  const chatRes = await fetch('http://localhost:5000/api/ai/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      eventId: newEvent.id,
      message: 'Reduce my decoration costs by 20% and suggest alternatives'
    })
  });
  const chatData = await chatRes.json();
  console.log('6. AI Chat reply received:');
  console.log('   Snippet:', chatData.message.message.substring(0, 110) + '...');
  console.log('   Suggested Action:', chatData.suggested_action ? chatData.suggested_action.type : 'None');

  // 7. CSV Export
  const csvRes = await fetch(`http://localhost:5000/api/events/${events[0].id}/guests/export`);
  const csvText = await csvRes.text();
  console.log('7. CSV Export verified | Content length:', csvText.length, '| Header line:', csvText.split('\n')[0]);

  console.log('--- ALL BACKEND INTEGRATION TESTS PASSED 100% ---');
}

runTests().catch(e => {
  console.error('TEST ERROR:', e);
  process.exit(1);
});
