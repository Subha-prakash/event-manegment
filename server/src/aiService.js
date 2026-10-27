import { GoogleGenAI } from '@google/genai';
import { z } from 'zod';

// Strict validation schemas for AI-generated outputs
export const planDataSchema = z.object({
  concept_and_theme: z.string().default("Theme and Concept"),
  decoration_ideas: z.array(z.string()).default([]),
  venue_requirements: z.array(z.string()).default([]),
  catering_menu: z.array(z.string()).default([]),
  entertainment_and_program: z.array(z.string()).default([]),
  guest_experience: z.array(z.string()).default([]),
  vendor_checklist: z.array(z.string()).default([]),
  budget_breakdown: z.array(z.object({
    category: z.string(),
    estimated_cost: z.number(),
    reason: z.string().optional()
  })).default([]),
  timeline: z.array(z.object({
    days_before_event: z.number(),
    task: z.string(),
    priority: z.enum(['High', 'Medium', 'Low']).catch('Medium'),
    description: z.string().optional()
  })).default([]),
  essential_reminders: z.array(z.string()).default([]),
  personalized_ideas: z.array(z.object({
    title: z.string(),
    category: z.string(),
    estimated_cost: z.number(),
    description: z.string()
  })).optional()
});

export const ideasSchema = z.array(z.object({
  category: z.string().default('Theme'),
  title: z.string(),
  description: z.string(),
  estimated_cost: z.number().default(0)
}));

// In-memory or env-based API key management
let currentApiKey = process.env.GEMINI_API_KEY || '';

export function getAiStatus() {
  return {
    hasKey: Boolean(currentApiKey && currentApiKey.trim().length > 0),
    model: 'gemini-3.8-flash',
    mode: currentApiKey && currentApiKey.trim().length > 0 ? 'Live Gemini AI' : 'Built-in Intelligent Planner'
  };
}

export function setApiKey(key) {
  currentApiKey = (key || '').trim();
  return getAiStatus();
}

/**
 * Normalizes numbers and currency strings
 */
function formatCurrency(amount, currency = 'INR') {
  if (currency === 'INR') {
    return `₹${amount.toLocaleString('en-IN')}`;
  }
  return `${currency} ${amount.toLocaleString()}`;
}

/**
 * Intelligent Fallback Generator for when Gemini API Key is not set or network fails
 */
function generateBuiltInPlan(eventData) {
  const {
    name = "Special Event",
    event_type = "Event",
    location = "City Center",
    guest_count = 100,
    budget = 100000,
    currency = "INR",
    theme = "Elegant & Festive",
    preferences = {}
  } = eventData;

  const guests = Number(guest_count) || 100;
  const totalBudget = Number(budget) || 100000;
  const curr = currency || 'INR';
  const venueType = preferences.venue_type || "Indoor / Outdoor";
  const foodPref = preferences.food_preferences || "Multi-cuisine buffet & appetizers";
  const formality = preferences.formality || "Semi-Formal";

  // Category allocation ratios
  let breakdown = [];
  if (event_type === 'Wedding') {
    breakdown = [
      { category: "Venue and accommodation", percent: 0.32, reason: `Rental for main ceremony, lawn, and bridal dressing suites in ${location}` },
      { category: "Catering and beverages", percent: 0.28, reason: `Catering with ${foodPref} for ${guests} guests including live counters and welcome drinks` },
      { category: "Decoration and flowers", percent: 0.16, reason: `Theme-inspired (${theme}) floral arches, mandap/stage backdrops, ambient lights, and table centerpieces` },
      { category: "Photography and videography", percent: 0.10, reason: "Traditional and candid 4K photography, couple teaser shoot, and drone video" },
      { category: "Entertainment and music", percent: 0.05, reason: "DJ setup, sound system, and traditional or live folk/acoustic musicians" },
      { category: "Invitations and stationery", percent: 0.02, reason: "Digital animated e-invites and printed luxury souvenir cards" },
      { category: "Emergency contingency fund", percent: 0.07, reason: "Reserve buffer for weather fluctuations and sudden guest add-ons" }
    ];
  } else if (event_type === 'Birthday' || event_type === 'Anniversary') {
    breakdown = [
      { category: "Venue and accommodation", percent: 0.25, reason: `Party hall or banquet lounge rental in ${location}` },
      { category: "Catering and beverages", percent: 0.35, reason: `Special gourmet dinner, appetizers, mocktails, and designer celebration cake for ${guests} guests` },
      { category: "Decoration and flowers", percent: 0.18, reason: `Balloon arches, customized LED photo neon sign, photo backdrop based on ${theme}` },
      { category: "Photography and videography", percent: 0.08, reason: "Event candid photographer for 4 hours and edited highlight gallery" },
      { category: "Entertainment and music", percent: 0.08, reason: "Emcee / party host, interactive parlor games, and party playlist sound setup" },
      { category: "Gifts and miscellaneous expenses", percent: 0.06, reason: "Return favors and customized gift hampers for attendees" }
    ];
  } else if (event_type === 'College Fest' || event_type === 'Community Event') {
    breakdown = [
      { category: "Equipment and lighting", percent: 0.28, reason: "High-power line-array speakers, LED walls, stage trussing, and stage lighting" },
      { category: "Venue and accommodation", percent: 0.20, reason: "Campus auditorium, ground permissions, licensing, and security barricades" },
      { category: "Catering and beverages", percent: 0.22, reason: `Meals, beverages, and snack packs for ${guests} participants, judges, and volunteer teams` },
      { category: "Entertainment and music", percent: 0.15, reason: "Celebrity/indie band performance, DJ night, or professional battle of the bands setup" },
      { category: "Gifts and miscellaneous expenses", percent: 0.10, reason: "Trophies, certificates, winner prize pool, and branded attendee swag kits" },
      { category: "Emergency contingency fund", percent: 0.05, reason: "Campus medical standby, electrical backups, and rain protection" }
    ];
  } else {
    // Corporate or Other
    breakdown = [
      { category: "Venue and accommodation", percent: 0.35, reason: `Conference hall with AV setup, projector, and breakout rooms in ${location}` },
      { category: "Catering and beverages", percent: 0.30, reason: `Executive buffet lunch, hi-tea breaks, and networking mocktails for ${guests} delegates` },
      { category: "Equipment and lighting", percent: 0.15, reason: "Podium mics, synchronized audio-video recording, and live-streaming gear" },
      { category: "Invitations and stationery", percent: 0.08, reason: "Lanyards, RFID/QR registration badges, notebooks, and digital presentation handouts" },
      { category: "Emergency contingency fund", percent: 0.12, reason: "Unforeseen speaker travel accommodation and AV technician standby" }
    ];
  }

  // Calculate costs deterministic
  let allocatedSum = 0;
  const budgetBreakdown = breakdown.map((item, index) => {
    let cost = Math.round((totalBudget * item.percent) / 500) * 500;
    if (index === breakdown.length - 1) {
      cost = totalBudget - allocatedSum;
      if (cost < 0) cost = 0;
    } else {
      allocatedSum += cost;
    }
    return {
      category: item.category,
      estimated_cost: cost,
      reason: item.reason
    };
  });

  return {
    event_summary: {
      event_name: name,
      event_type,
      theme,
      guest_count: guests,
      total_budget: totalBudget,
      currency: curr,
      location,
      venue_type: venueType,
      formality
    },
    concept_and_theme: `The concept for "${name}" revolves around ${theme}, harmonizing thoughtful hospitality with aesthetic flair in ${location}. Designed for ${guests} guests with a ${formality} ambiance, every element—from the visual decor to culinary moments—is synchronized to create lasting memories while strictly adhering to your budget of ${formatCurrency(totalBudget, curr)}.`,
    decoration_ideas: [
      `Grand Entrance Feature: Statement welcome arch styled with ${theme} elements, fairy lights, and personalized signage.`,
      `Central Focal Area: Photo-worthy main stage / backdrop incorporating warm illumination and organic textures.`,
      `Table & Ambient Styling: Elegant runner cloths with botanical centerpieces, customized menu cards, and soft ambient up-lights.`,
      `Interactive Photo Corner: Dedicated selfie and family photo zone featuring props, vintage frames, and neon event title.`
    ],
    venue_requirements: [
      `Capacity for at least ${Math.round(guests * 1.15)} people to provide comfortable movement and dining flow.`,
      `Dedicated staging area with appropriate power supply for sound, projection, and illumination.`,
      `Adequate climate control (AC/heaters) and clean, well-maintained restroom facilities.`,
      `Convenient parking area or valet facility for approximately ${Math.round(guests / 3)} vehicles.`
    ],
    food_and_catering: [
      `Welcome Station: Signature refreshing drinks customized to preference (${foodPref}).`,
      `Appetizers: 4 curated finger foods (2 hot appetizers, 2 fresh bite-sized savories) served during initial mingling.`,
      `Main Course: Well-balanced buffet spread featuring staple delicacies, flavorful mains, freshly baked breads, and salads.`,
      `Dessert Corner: Duo of celebratory desserts including warm seasonal favorites and cold artisanal treats.`
    ],
    entertainment_options: [
      `Curated background acoustics during guest reception to set a pleasant, welcoming tone.`,
      `Engaging interactive segment: Emcee-moderated games, heartfelt toasts, or spotlight trivia.`,
      `High-energy transition to open dance floor or showcase performances powered by a quality sound system.`
    ],
    guest_management: [
      `Digital RSVP tracking to accurately record headcount and dietary restrictions 14 days in advance.`,
      `Welcome registration desk or greeting host to distribute event itineraries and seat guidance.`,
      `Dedicated assistance for senior citizens, young children, or guests with special accessibility needs.`
    ],
    vendor_checklist: [
      "Venue and Banquet Hall",
      "Catering & Beverage Team",
      "Decoration and Floral Stylist",
      "Photographer and Videographer",
      "Sound, Lighting and DJ / Entertainer",
      "Event Host / Emcee (Optional)",
      "Transportation / Shuttle Logistics"
    ],
    budget_breakdown: budgetBreakdown,
    timeline: [
      { task: "Lock venue and finalize booking deposit", days_before_event: 60, priority: "High", description: "Review contracts, venue timing, and sound policy.", assigned_to: "Lead Planner" },
      { task: "Confirm caterer and finalize menu tasting", days_before_event: 45, priority: "High", description: `Verify dietary preferences for ${foodPref} and live counter setup.`, assigned_to: "Catering Lead" },
      { task: "Engage decorator and approve 3D design sketches", days_before_event: 30, priority: "Medium", description: `Ensure color scheme mirrors the "${theme}" aesthetic.`, assigned_to: "Decor Coordinator" },
      { task: "Book photographer, videographer, and DJ", days_before_event: 30, priority: "Medium", description: "Share shot list, must-have family portraits, and music preference playlist.", assigned_to: "Lead Planner" },
      { task: "Dispatch invitations and open digital RSVP tracking", days_before_event: 25, priority: "High", description: `Track responses for ${guests} guests to finalize seating and meals.`, assigned_to: "Guest Manager" },
      { task: "Finalize guest count and share with caterer", days_before_event: 10, priority: "High", description: "Lock plate count and arrange buffer seating.", assigned_to: "Catering Lead" },
      { task: "Conduct final technical and logistical walkthrough", days_before_event: 3, priority: "Medium", description: "Test microphones, audio cables, lighting power backup, and display screens.", assigned_to: "Venue Coordinator" },
      { task: "Event Day Execution and coordination", days_before_event: 0, priority: "High", description: "Follow chronological run of show, greet guests, and coordinate vendor deliveries.", assigned_to: "Event Coordinator" }
    ],
    important_reminders: [
      "Keep digital and physical copies of all vendor contracts and payment receipts handy.",
      "Assign one trusted point of contact for vendor coordination on event day so hosts can enjoy.",
      "Check local noise curfew regulations (typically 10:00 PM for outdoor amplification)."
    ],
    personalized_ideas: [
      {
        title: `Signature Photo Backdrop for ${name}`,
        category: "Decoration",
        estimated_cost: Math.round(totalBudget * 0.04),
        description: `Create an Instagram-worthy photo zone with an organic arch, glowing neon slogan, and personalized hashtags.`
      },
      {
        title: "Eco-Friendly Welcome Favors",
        category: "Return Gifts",
        estimated_cost: Math.round(totalBudget * 0.03),
        description: "Small potted succulents or artisanal local sweets wrapped in recycled craft paper and twine."
      },
      {
        title: "Interactive Guest Memory Book",
        category: "Guest Experience",
        estimated_cost: Math.round(totalBudget * 0.015),
        description: "Polaroid instant camera station where guests snap a photo and write personal wishes in a hardbound keepsake album."
      }
    ],
    assumptions: [
      `All costs are estimated based on prevailing market rates in ${location} and assume ${guests} guests.`,
      "Quotations may vary depending on seasonal peak dates and vendor customization.",
      "Applicable statutory taxes (GST/VAT) may apply depending on individual vendor invoices."
    ]
  };
}

/**
 * Main AI Generation function using Google Gemini API or intelligent engine
 */
export async function generateFullEventPlan(eventData) {
  if (currentApiKey && currentApiKey.trim().length > 0) {
    try {
      const client = new GoogleGenAI({ apiKey: currentApiKey });
      const prompt = `You are EventGenie AI, an elite event planner and financial logistics consultant.
Generate a comprehensive, actionable, and mathematically sound event plan for the following specifications:
Event Name: ${eventData.name}
Event Type: ${eventData.event_type}
Date: ${eventData.event_date} (Duration: ${eventData.end_date || 'Single day'})
Location: ${eventData.location}
Guest Count: ${eventData.guest_count}
Total Budget: ${eventData.budget} ${eventData.currency || 'INR'}
Theme / Style: ${eventData.theme || 'Elegant celebration'}
Venue Type: ${eventData.preferences?.venue_type || 'Flexible'}
Food / Dietary: ${eventData.preferences?.food_preferences || 'Balanced'}
Cultural / Special Traditions: ${eventData.preferences?.cultural_traditions || 'None'}
Formality: ${eventData.preferences?.formality || 'Semi-formal'}
Special Requests: ${eventData.preferences?.special_requests || 'None'}

Return ONLY a valid JSON object with the following exact keys and structure:
{
  "event_summary": {
    "event_name": string,
    "event_type": string,
    "theme": string,
    "guest_count": number,
    "total_budget": number,
    "currency": string,
    "location": string
  },
  "concept_and_theme": string,
  "decoration_ideas": [string, string, string, string],
  "venue_requirements": [string, string, string, string],
  "food_and_catering": [string, string, string, string],
  "entertainment_options": [string, string, string],
  "guest_management": [string, string, string],
  "vendor_checklist": [string, string, string, string, string],
  "budget_breakdown": [
    { "category": string, "estimated_cost": number, "reason": string }
  ],
  "timeline": [
    { "task": string, "days_before_event": number, "priority": "High" | "Medium" | "Low", "description": string, "assigned_to": string }
  ],
  "important_reminders": [string, string, string],
  "personalized_ideas": [
    { "title": string, "category": string, "estimated_cost": number, "description": string }
  ],
  "assumptions": [string, string]
}
Ensure the sum of all estimated_cost in budget_breakdown is as close to total_budget (${eventData.budget}) as possible. Use realistic local market rates. Do not include markdown code block backticks if possible, return pure JSON.`;

      const response = await client.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json'
        }
      });

      const text = response.text?.trim();
      if (text) {
        // Clean possible markdown wrapper if any
        const cleaned = text.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
        const parsed = JSON.parse(cleaned);
        const validated = planDataSchema.parse(parsed);
        return validated;
      }
    } catch (err) {
      console.warn("Gemini API call failed, falling back to intelligent planner:", err.message);
    }
  }

  // Fallback to built-in intelligent engine
  return generateBuiltInPlan(eventData);
}

/**
 * Regenerates an individual section of the plan
 */
export async function regeneratePlanSection(eventData, sectionKey, instructions = "") {
  if (currentApiKey && currentApiKey.trim().length > 0) {
    try {
      const client = new GoogleGenAI({ apiKey: currentApiKey });
      const prompt = `You are EventGenie AI.
Given the event: "${eventData.name}" (${eventData.event_type}, Location: ${eventData.location}, Budget: ${eventData.budget} ${eventData.currency}, Guests: ${eventData.guest_count}, Theme: ${eventData.theme}).
User wants to regenerate the section: "${sectionKey}".
Additional custom instructions from user: "${instructions || 'Make it fresh, creative, and budget-conscious.'}"

Return ONLY a JSON object with a single key "${sectionKey}" containing the updated content matching the expected data type for this section (e.g. array of strings, or array of objects for budget_breakdown/timeline/personalized_ideas).`;

      const response = await client.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json'
        }
      });

      const text = response.text?.trim();
      if (text) {
        const cleaned = text.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
        const parsed = JSON.parse(cleaned);
        if (parsed[sectionKey]) {
          return { [sectionKey]: parsed[sectionKey] };
        }
      }
    } catch (err) {
      console.warn("Gemini API section regeneration failed, using built-in generator:", err.message);
    }
  }

  // Built-in intelligent section regeneration
  const fresh = generateBuiltInPlan({
    ...eventData,
    theme: instructions ? `${eventData.theme} (${instructions})` : `${eventData.theme} - Refined Edition`
  });

  return {
    [sectionKey]: fresh[sectionKey] || ["Refreshed option 1", "Refreshed option 2", "Refreshed option 3"]
  };
}

/**
 * Generates specific personalized ideas (e.g. DIY decorations, Games, Invitation wording)
 */
export async function generatePersonalizedIdeas(eventData, category = "All", count = 6) {
  if (currentApiKey && currentApiKey.trim().length > 0) {
    try {
      const client = new GoogleGenAI({ apiKey: currentApiKey });
      const prompt = `You are EventGenie AI. Generate ${count} inspiring, practical, and personalized event ideas for:
Event: ${eventData.name} (${eventData.event_type}, Location: ${eventData.location}, Budget: ${eventData.budget} ${eventData.currency}, Guests: ${eventData.guest_count})
Idea Category: ${category} (can include Themes, DIY Decorations, Return Gifts, Games & Activities, Invitation Wording, Eco-friendly touches, or Unique Guest Experiences)

Return ONLY a JSON array of objects:
[
  {
    "category": string,
    "title": string,
    "description": string,
    "estimated_cost": number
  }
]`;

      const response = await client.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json'
        }
      });

      const text = response.text?.trim();
      if (text) {
        const cleaned = text.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
        const parsed = JSON.parse(cleaned);
        const validated = ideasSchema.parse(parsed);
        return validated;
      }
    } catch (err) {
      console.warn("Gemini API idea generation failed, using built-in generator:", err.message);
    }
  }

  // Built-in ideas catalogue
  const curr = eventData.currency || 'INR';
  const mult = curr === 'USD' ? 0.012 : curr === 'EUR' ? 0.011 : 1;

  const library = [
    {
      category: "DIY Decorations",
      title: "Upcycled Fairy Jar Table Lanterns",
      description: "Recycled glass jars wrapped in burlap lace, filled with battery-operated warm micro-fairy lights and sprigs of fresh baby's breath.",
      estimated_cost: Math.round(800 * mult)
    },
    {
      category: "DIY Decorations",
      title: "Origami Bird & Marigold Hanging Garland Canopy",
      description: "Handcrafted golden and blush paper origami cranes interspersed with fresh marigold strings hanging gracefully over the guest entrance.",
      estimated_cost: Math.round(1500 * mult)
    },
    {
      category: "Return Gifts",
      title: "Organic Herb & Seedling Terracotta Pots",
      description: "Miniature handcrafted terracotta planters with live basil or mint seedlings and personalized thank-you tags printed on seed paper.",
      estimated_cost: Math.round(120 * mult)
    },
    {
      category: "Return Gifts",
      title: "Artisanal Spice or Scented Candle Tin Hampers",
      description: "Hand-poured soy wax candles infused with cardamom, sandalwood, and rose oils in reusable brass/copper tins.",
      estimated_cost: Math.round(250 * mult)
    },
    {
      category: "Games & Activities",
      title: "Live Smartphone Trivia & Couple Quiz",
      description: "A fast-paced interactive quiz using QR codes on tables where guests answer trivia questions on their phones with real-time leaderboard reveals.",
      estimated_cost: Math.round(500 * mult)
    },
    {
      category: "Games & Activities",
      title: "Polaroid Photo Memory Tree",
      description: "Guests snap polaroid selfies at the photo booth, write heartfelt advice on the back, and clip them to an illuminated faux tree.",
      estimated_cost: Math.round(2200 * mult)
    },
    {
      category: "Invitation Wording",
      title: "Warm Traditional & Contemporary Blended Invite Text",
      description: "Poetic and elegant wording honoring family traditions while warmly inviting modern friends to celebrate love, laughter, and new beginnings.",
      estimated_cost: 0
    },
    {
      category: "Eco-friendly Celebration",
      title: "100% Zero-Waste Edible & Compostable Tableware",
      description: "Areca palm leaf plates, sugarcane bagasse bowls, and wooden cutlery that look sophisticated while ensuring zero landfill plastic.",
      estimated_cost: Math.round(1800 * mult)
    }
  ];

  if (category && category !== "All") {
    const filtered = library.filter(item => item.category.toLowerCase().includes(category.toLowerCase()));
    if (filtered.length > 0) return filtered;
  }
  return library.slice(0, count);
}

/**
 * Context-aware AI Chat Assistant
 */
export async function chatWithEventAssistant({ event, message, conversationHistory = [] }) {
  const eventDetails = event ? `
Active Event: "${event.name}"
Type: ${event.event_type}
Date: ${event.event_date}
Location: ${event.location}
Guest Count: ${event.guest_count}
Total Budget: ${event.budget} ${event.currency}
Theme: ${event.theme}
` : "No specific event is currently active.";

  if (currentApiKey && currentApiKey.trim().length > 0) {
    try {
      const client = new GoogleGenAI({ apiKey: currentApiKey });
      const prompt = `You are EventGenie AI, an expert event planner, financial advisor, and logistics coordinator.
You speak in a warm, polite, encouraging, and highly professional tone.

CURRENT EVENT CONTEXT:
${eventDetails}

CONVERSATION HISTORY:
${conversationHistory.map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.message}`).join('\n')}

USER MESSAGE:
"${message}"

INSTRUCTIONS:
1. Always address the user's specific query using their event's budget, location, and guest count.
2. If the user asks for budget advice or reductions (e.g. "Reduce decoration costs by 20%"), provide exact mathematical figures and explain trade-offs clearly.
3. Suggest practical alternatives when something is over budget.
4. If appropriate, propose actionable updates the user can apply.
5. If you suggest a concrete action (like adding a task or updating a budget), provide an "action_proposal" object at the end of your response, for example:
{
  "reply": "Your explanation...",
  "suggested_action": {
    "type": "add_task" | "adjust_budget" | "add_vendor_checklist",
    "data": { ... }
  }
}
Return valid JSON with "reply" and optional "suggested_action". If plain text is returned, ensure it is helpful and structured.`;

      const response = await client.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json'
        }
      });

      const text = response.text?.trim();
      if (text) {
        const cleaned = text.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
        const parsed = JSON.parse(cleaned);
        return {
          reply: parsed.reply || text,
          suggested_action: parsed.suggested_action || null
        };
      }
    } catch (err) {
      console.warn("Gemini chat failed, using intelligent assistant fallback:", err.message);
    }
  }

  // Intelligent conversational responses
  const q = (message || "").toLowerCase();
  let reply = "";
  let action = null;

  if (q.includes("reduce") && (q.includes("decor") || q.includes("cost") || q.includes("budget"))) {
    const curBudget = event ? event.budget : 100000;
    const curr = event ? event.currency : 'INR';
    const reductionAmount = Math.round(curBudget * 0.20);
    reply = `To reduce your decoration expenses by ~20% without diminishing visual charm:
1. **Focus on Focal Points**: Concentrate floral styling on the entrance arch and main stage backdrop, replacing tabletop florals with brass/glass lanterns and fairy lights (saves ~25-30% on floral procurement).
2. **Seasonal & Local Blooms**: Replace exotic imported flowers with vibrant local marigolds, tube-roses (rajnigandha), and jasmine which cost a fraction of orchids.
3. **Warm Ambient Lighting**: Warm Edison bulbs and LED uplighters create a royal, opulent mood across large areas at much lower cost than physical installations.

Estimated potential savings: **${formatCurrency(reductionAmount, curr)}**. Would you like me to update your budget category estimates accordingly?`;
    action = {
      type: "adjust_budget",
      data: {
        category: "Decoration and flowers",
        discount_percent: 20,
        estimated_saving: reductionAmount
      }
    };
  } else if (q.includes("birthday") && (q.includes("5000") || q.includes("15") || q.includes("children") || q.includes("kids"))) {
    reply = `Here is an exciting and delightful plan for 15 children under ₹5,000:
- **Theme**: Superhero Carnival or Enchanted Jungle Safari.
- **Cake & Snacks (₹2,200)**: Customized 1.5kg theme cake (₹1,000), mini sliders/sandwiches, fruit skewers, potato smiles, and fresh mango juice cartons (₹1,200).
- **DIY Decor (₹1,000)**: Colorful balloon cloud garland, printable superhero masks, and a DIY chalk art welcome board.
- **Fun & Games (₹800)**: Musical statues, Pass the Parcel with mystery riddles, balloon pop relay, and Lemon-and-Spoon race.
- **Return Favors (₹1,000)**: Fun activity sketchbooks with non-toxic crayons and personalized sticker packs for 15 kids.
**Total**: ₹5,000. It is budget-friendly, high energy, and guarantees memorable fun!`;
  } else if (q.includes("vegetarian") || q.includes("menu")) {
    reply = `Here is a crowd-pleasing gourmet vegetarian menu designed for 100 guests:
- **Welcome Drinks**: Aam Panna cooler, Spiced Buttermilk (Chaas), and Virgin Mojito.
- **Live Chaat & Starters**: Paneer Tikka Angara, Crispy Corn Baskets, Dahi Puri, and cocktail Hara Bhara Kababs.
- **Main Course**:
  - Paneer Butter Masala (Rich Cashew Gravy)
  - Dal Makhani (Slow-cooked overnight)
  - Subz Diwani Handi (Seasonal vegetables in aromatic spices)
  - Kashmiri Dum Aloo
  - Steamed Basmati Rice & Awadhi Vegetable Dum Biryani with Burani Raita
  - Assorted Breads (Butter Naan, Laccha Paratha, Tandoori Roti)
- **Desserts**: Hot Gulab Jamun served with Angoori Rabri and artisanal Malai Kulfi.`;
  } else if (q.includes("task") || q.includes("week") || q.includes("checklist")) {
    reply = `Here are the key priority tasks to tackle this week for "${event?.name || 'your upcoming event'}":
1. **Vendor Milestone Check**: Reach out to your confirmed caterer and decorator to verify raw material delivery schedules.
2. **RSVP Follow-up**: Send a gentle reminder message to guests with "Pending" RSVP status so you can lock plate counts.
3. **Sound & Logistics**: Verify venue power backup, stage clearance, and transportation timings.
4. **Emergency Kit**: Prepare an event-day survival bag (tape, safety pins, phone chargers, pain relief, extra printed copies of schedules).`;
  } else {
    reply = `I have reviewed "${event?.name || 'your event'}" (${event?.event_type || 'Event'}, ${event?.location || 'Location'}). With a budget of ${formatCurrency(event?.budget || 100000, event?.currency || 'INR')} and ${event?.guest_count || 50} guests, you are in a great position!
I can help you:
- Optimize or reallocate expenses across categories
- Draft creative invitation copy and taglines
- Build a customized 90-day preparation schedule
- Rebalance menu options or suggest DIY decor ideas

What aspect would you like to explore next?`;
  }

  return { reply, suggested_action: action };
}
