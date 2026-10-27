import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// In serverless environments (Vercel, AWS Lambda) or automated test mode, write to temp directory
const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
const isTestMode = Boolean(
  process.env.NODE_ENV === 'test' ||
  process.execArgv.some(a => a.includes('test')) ||
  process.argv.some(a => a.includes('test'))
);
const DATA_DIR = isServerless || isTestMode ? path.join(os.tmpdir(), 'eventgenie-data') : path.join(__dirname, '..', 'data');
const DB_FILE = path.join(DATA_DIR, isTestMode ? `eventgenie-test-${process.pid}.json` : 'eventgenie.json');

// Ensure data directory exists safely
try {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
} catch (err) {
  console.warn("Could not create DATA_DIR, operating with in-memory state:", err.message);
}

const initialSeedData = {
  users: [
    {
      id: "usr_demo_01",
      name: "Priya Sharma",
      email: "priya@eventgenie.ai",
      created_at: new Date(Date.now() - 30 * 86400000).toISOString()
    }
  ],
  events: [
    {
      id: "evt_wedding_01",
      user_id: "usr_demo_01",
      name: "Aarav & Meera's Royal Palace Wedding",
      event_type: "Wedding",
      event_date: new Date(Date.now() + 75 * 86400000).toISOString().split('T')[0],
      end_date: new Date(Date.now() + 77 * 86400000).toISOString().split('T')[0],
      location: "Jaipur, Rajasthan",
      guest_count: 350,
      budget: 1500000,
      currency: "INR",
      theme: "Royal Rajputana Heritage & Marigold Bliss",
      preferences: {
        venue_type: "Outdoor & Palace Courtyard",
        food_preferences: "Authentic Rajasthani & North Indian Vegetarian & Live Chaat Counter",
        cultural_traditions: "Traditional Hindu ceremonies, Sangeet night, Haldi & Phoolon ki Holi",
        formality: "High / Regal Traditional",
        special_requests: "Heritage lighting, puppet show for guests, eco-friendly floral rangolis"
      },
      plan_data: {
        concept_and_theme: "An enchanting blend of Rajputana royal opulence with warm pastel hues, vibrant marigold arches, antique brass lanterns, and traditional folk instrumental melodies.",
        decoration_ideas: [
          "Grand floral entryway with 1,000 fragrant marigold strings and brass diyas.",
          "Mandap set against an illuminated palace facade with lotus pond reflections.",
          "Sangeet stage with royal velvet drapes, warm Edison bulb chandeliers, and mirror mosaic backdrops.",
          "Photo booth designed as a vintage royal jharokha with turbans and umbrellas for guests."
        ],
        venue_requirements: [
          "Heritage palace or boutique fort with sprawling lawns and minimum 400 capacity.",
          "Dedicated green rooms for bride and groom with full-length mirrors and AC.",
          "Ample valet parking space for 120+ vehicles.",
          "Power backup of at least 125 kVA for heavy stage lighting and sound."
        ],
        food_and_catering: [
          "Welcome drinks: Rose thandai, kokum sherbet, and fresh coconut water counters.",
          "Live street food station: Jaipuri pyaaz kachori, mini samosas, and banarasi chaat.",
          "Main course: Dal Baati Churma, Gatte ki Sabzi, Paneer Lababdar, and Awadhi Biryani.",
          "Dessert bar: Kesar Jalebi with rabri, hot Malpua, and artisanal Kulfi sticks."
        ],
        entertainment_options: [
          "Day 1 Sangeet: Live fusion band blending Bollywood retro with Punjabi beats.",
          "Day 2 Haldi: Traditional Dhol players and Phoolon ki Holi flower cannon.",
          "Wedding Baraat: Royal brass band with shehnai maestro at the entrance."
        ],
        guest_management: [
          "Digital RSVP portal with WhatsApp confirmation updates.",
          "Luggage tags and personalized welcome hampers placed in guest rooms.",
          "Golf carts for elderly guests to commute smoothly within the palace grounds."
        ],
        vendor_checklist: [
          "Heritage Palace Venue & Lawn",
          "Royal Heritage Decorator & Florist",
          "Gourmet Catering & Live Food Stalls",
          "Cinematic Photographer & Drone Videographer",
          "DJ & Folk Fusion Music Band",
          "Bridal Makeup Artist & Stylist",
          "Guest Logistics & Luxury Tempo Travelers",
          "Event Security & Hospitality Hostesses"
        ],
        important_reminders: [
          "Confirm sound permissions past 10:00 PM with local administration.",
          "Conduct food tasting session with caterer 45 days prior.",
          "Finalize room allocation chart for out-of-town guests 3 weeks before arrival."
        ]
      },
      created_at: new Date(Date.now() - 25 * 86400000).toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: "evt_fest_02",
      user_id: "usr_demo_01",
      name: "TechNova Collegiate Hackathon & Summit",
      event_type: "College Fest",
      event_date: new Date(Date.now() + 45 * 86400000).toISOString().split('T')[0],
      end_date: new Date(Date.now() + 46 * 86400000).toISOString().split('T')[0],
      location: "Bangalore, Karnataka",
      guest_count: 220,
      budget: 350000,
      currency: "INR",
      theme: "Cyberpunk Glow & AI Innovation",
      preferences: {
        venue_type: "Auditorium & Innovation Labs",
        food_preferences: "Midnight coffee & pizza, energy snacks, healthy wrap lunches",
        cultural_traditions: "Modern Tech Festival",
        formality: "Casual Tech Geek",
        special_requests: "High-speed 1Gbps dedicated fiber internet, sleeping pod zones"
      },
      plan_data: {
        concept_and_theme: "A 24-hour high-octane coding marathon infused with neon cyberpunk aesthetics, interactive tech demos, industry keynote speakers, and gamer lounge relaxation.",
        decoration_ideas: [
          "Neon wireframes and UV reactive signage across hacker zones.",
          "LED sponsor display wall with live GitHub commits visualization."
        ],
        venue_requirements: [
          "Main university auditorium for keynotes + 4 computer labs for hacking tracks.",
          "High-capacity power strips at every team workbench with surge protection."
        ],
        food_and_catering: [
          "Unlimited 24-hour espresso & cold brew bar.",
          "Healthy sandwich wraps, bananas, and protein bars during sprint hours.",
          "Midnight Margherita pizza boxes and warm energy drinks."
        ],
        entertainment_options: [
          "Stand-up tech comedy set during sponsor break.",
          "Midnight laser tag battle in the student quad."
        ],
        guest_management: [
          "NFC badge check-in for registered college student IDs.",
          "Discord server for live mentor pairing and schedule announcements."
        ],
        vendor_checklist: [
          "Auditorium Audio/Visual Setup",
          "High-speed leased line ISP",
          "Catering & Snack Supplier",
          "Merchandise T-Shirt & Swag Printer",
          "Memento & Trophy Fabricator"
        ],
        important_reminders: [
          "Test campus firewall whitelist for GitHub, Hugging Face, and Gemini API endpoints.",
          "Distribute emergency first aid kit and on-call nurse info to volunteer leads."
        ]
      },
      created_at: new Date(Date.now() - 15 * 86400000).toISOString(),
      updated_at: new Date().toISOString()
    }
  ],
  expenses: [
    {
      id: "exp_01",
      event_id: "evt_wedding_01",
      category: "Venue and accommodation",
      description: "Palace Courtyard & Heritage Lawn Rental (3 Days)",
      estimated_amount: 500000,
      quoted_amount: 480000,
      actual_amount: 480000,
      payment_status: "Partially Paid",
      due_date: new Date(Date.now() + 60 * 86400000).toISOString().split('T')[0],
      notes: "Advance 2.5L paid. Balance due on arrival."
    },
    {
      id: "exp_02",
      event_id: "evt_wedding_01",
      category: "Catering and beverages",
      description: "Gourmet Royal Catering & Live Counters (350 Guests)",
      estimated_amount: 420000,
      quoted_amount: 400000,
      actual_amount: 400000,
      payment_status: "Partially Paid",
      due_date: new Date(Date.now() + 70 * 86400000).toISOString().split('T')[0],
      notes: "Menu finalized. 50% advance confirmed."
    },
    {
      id: "exp_03",
      event_id: "evt_wedding_01",
      category: "Decoration and flowers",
      description: "Marigold Arches, Mandap Florals, Fairylights & Sangeet Stage",
      estimated_amount: 250000,
      quoted_amount: 230000,
      actual_amount: 0,
      payment_status: "Pending",
      due_date: new Date(Date.now() + 65 * 86400000).toISOString().split('T')[0],
      notes: "Negotiating inclusion of vintage jharokha photobooth."
    },
    {
      id: "exp_04",
      event_id: "evt_wedding_01",
      category: "Photography and videography",
      description: "Cinematic 4K Wedding Film, Teaser & Drone Coverage",
      estimated_amount: 150000,
      quoted_amount: 140000,
      actual_amount: 140000,
      payment_status: "Paid",
      due_date: new Date(Date.now() - 5 * 86400000).toISOString().split('T')[0],
      notes: "Full payment completed. Contract signed."
    },
    {
      id: "exp_05",
      event_id: "evt_wedding_01",
      category: "Entertainment and music",
      description: "Sangeet DJ, Fusion Band & Traditional Shehnai Players",
      estimated_amount: 80000,
      quoted_amount: 75000,
      actual_amount: 35000,
      payment_status: "Partially Paid",
      due_date: new Date(Date.now() + 72 * 86400000).toISOString().split('T')[0],
      notes: "Advance 35k transferred."
    },
    {
      id: "exp_06",
      event_id: "evt_wedding_01",
      category: "Emergency contingency fund",
      description: "Buffer fund for weather cover and last-minute requests",
      estimated_amount: 100000,
      quoted_amount: 0,
      actual_amount: 0,
      payment_status: "Pending",
      due_date: new Date(Date.now() + 75 * 86400000).toISOString().split('T')[0],
      notes: "Held in reserve bank account."
    }
  ],
  tasks: [
    {
      id: "tsk_01",
      event_id: "evt_wedding_01",
      title: "Confirm Palace Venue Booking & Sign Agreement",
      description: "Verify lawn usage hours, sound curfew policies, and security deposits.",
      start_date: new Date(Date.now() - 20 * 86400000).toISOString().split('T')[0],
      due_date: new Date(Date.now() - 10 * 86400000).toISOString().split('T')[0],
      priority: "High",
      status: "Completed",
      assigned_to: "Aarav (Groom)",
      notes: "Agreement executed and scanned copy saved."
    },
    {
      id: "tsk_02",
      event_id: "evt_wedding_01",
      title: "Finalize Royal Catering Menu & Tasting Session",
      description: "Sample Dal Baati Churma, live Chaat spices, and Kulfi varieties.",
      start_date: new Date(Date.now() - 5 * 86400000).toISOString().split('T')[0],
      due_date: new Date(Date.now() + 10 * 86400000).toISOString().split('T')[0],
      priority: "High",
      status: "In Progress",
      assigned_to: "Meera (Bride)",
      notes: "Tasting scheduled for this Saturday at 2:00 PM."
    },
    {
      id: "tsk_03",
      event_id: "evt_wedding_01",
      title: "Send Digital Save-the-Date Cards via WhatsApp",
      description: "Circulate digital itinerary and hotel room booking links to outstation guests.",
      start_date: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
      due_date: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
      priority: "Medium",
      status: "Not Started",
      assigned_to: "Priya Sharma",
      notes: "Card design ready. Awaiting phone number list."
    },
    {
      id: "tsk_04",
      event_id: "evt_wedding_01",
      title: "Stage & Mandap Decor Prototype Review",
      description: "Inspect 3D render of the flower arch and Rajasthani mirror work.",
      start_date: new Date(Date.now() + 12 * 86400000).toISOString().split('T')[0],
      due_date: new Date(Date.now() + 25 * 86400000).toISOString().split('T')[0],
      priority: "Medium",
      status: "Not Started",
      assigned_to: "Meera & Decorator",
      notes: "Check if lotus lights can be illuminated with warm LEDs."
    },
    {
      id: "tsk_05",
      event_id: "evt_wedding_01",
      title: "Coordinate Airport Shuttle Schedule for Relatives",
      description: "Group arriving flights at Jaipur International Airport into 4 shuttle runs.",
      start_date: new Date(Date.now() + 45 * 86400000).toISOString().split('T')[0],
      due_date: new Date(Date.now() + 60 * 86400000).toISOString().split('T')[0],
      priority: "Low",
      status: "Not Started",
      assigned_to: "Rohan (Cousin)",
      notes: "Contact tempo traveler vendor once RSVPs are locked."
    }
  ],
  vendors: [
    {
      id: "vnd_01",
      event_id: "evt_wedding_01",
      name: "Rajvilas Heritage Palace Grounds",
      category: "Venues and accommodation",
      contact_details: "+91 98290 11223 | events@rajvilaspalace.com",
      location: "Amer Road, Jaipur",
      quoted_price: 500000,
      agreed_price: 480000,
      advance_paid: 250000,
      booking_status: "Confirmed",
      rating: 5,
      notes: "Superb courtyard setting. Generator backup and 10 deluxe rooms included."
    },
    {
      id: "vnd_02",
      event_id: "evt_wedding_01",
      name: "Shahi Dawat Caterers & Hospitality",
      category: "Catering and beverages",
      contact_details: "+91 94140 44556 | info@shahidawat.in",
      location: "C-Scheme, Jaipur",
      quoted_price: 420000,
      agreed_price: 400000,
      advance_paid: 200000,
      booking_status: "Confirmed",
      rating: 5,
      notes: "Specializes in traditional Marwari and Nawabi cuisine with 12 live stalls."
    },
    {
      id: "vnd_03",
      event_id: "evt_wedding_01",
      name: "Gulmohar Floral & Event Stylists",
      category: "Decoration and flowers",
      contact_details: "+91 98281 77889 | contact@gulmohardecor.com",
      location: "Malviya Nagar, Jaipur",
      quoted_price: 260000,
      agreed_price: 230000,
      advance_paid: 50000,
      booking_status: "Booked",
      rating: 4,
      notes: "Includes fresh flowers direct from Pushkar mandi. Mandap sketch approved."
    },
    {
      id: "vnd_04",
      event_id: "evt_wedding_01",
      name: "Memories In Motion Films",
      category: "Photography and videography",
      contact_details: "+91 99280 99001 | hello@memoriesinmotion.in",
      location: "Vaishali Nagar, Jaipur",
      quoted_price: 150000,
      agreed_price: 140000,
      advance_paid: 140000,
      booking_status: "Confirmed",
      rating: 5,
      notes: "Package includes 2 traditional photographers, 2 cinematic film videographers, and 1 drone operator."
    },
    {
      id: "vnd_05",
      event_id: "evt_wedding_01",
      name: "DJ Rohit & Rajasthani Folk Troopers",
      category: "Entertainment and music",
      contact_details: "+91 97840 55667 | djrohitjaipur@gmail.com",
      location: "Tonk Road, Jaipur",
      quoted_price: 85000,
      agreed_price: 75000,
      advance_paid: 35000,
      booking_status: "Booked",
      rating: 4,
      notes: "Will play Bollywood Sangeet tracks followed by traditional Kalbelia and Ghoomar performance."
    }
  ],
  guests: [
    {
      id: "gst_01",
      event_id: "evt_wedding_01",
      name: "Rajesh & Sunita Singhania",
      contact_details: "+91 98111 22334 | rajesh@singhania.com",
      group_name: "Family",
      invitation_status: "Sent",
      rsvp_status: "Accepted",
      plus_one_count: 2,
      dietary_preferences: "Strict Vegetarian, Jain food for Sunita"
    },
    {
      id: "gst_02",
      event_id: "evt_wedding_01",
      name: "Vikramaditya Rathore",
      contact_details: "+91 99281 33445 | vikram.rathore@outlook.com",
      group_name: "VIP",
      invitation_status: "Sent",
      rsvp_status: "Accepted",
      plus_one_count: 1,
      dietary_preferences: "Regular North Indian"
    },
    {
      id: "gst_03",
      event_id: "evt_wedding_01",
      name: "Ananya Deshmukh",
      contact_details: "+91 98200 44556 | ananya.d@gmail.com",
      group_name: "Friends",
      invitation_status: "Sent",
      rsvp_status: "Accepted",
      plus_one_count: 0,
      dietary_preferences: "Vegan, nut allergy"
    },
    {
      id: "gst_04",
      event_id: "evt_wedding_01",
      name: "Karan Johar Verma & Family",
      contact_details: "+91 98450 66778 | kjverma@corp.in",
      group_name: "Colleagues",
      invitation_status: "Sent",
      rsvp_status: "Pending",
      plus_one_count: 1,
      dietary_preferences: "Vegetarian"
    },
    {
      id: "gst_05",
      event_id: "evt_wedding_01",
      name: "Dr. Alok Nath Mukherjee",
      contact_details: "+91 94330 11223 | mukherjee.alok@med.edu",
      group_name: "Family",
      invitation_status: "Draft",
      rsvp_status: "Pending",
      plus_one_count: 1,
      dietary_preferences: "Diabetic friendly desserts"
    },
    {
      id: "gst_06",
      event_id: "evt_wedding_01",
      name: "Siddharth Malhotra",
      contact_details: "+91 98190 77889 | sid.malhotra@tech.io",
      group_name: "Friends",
      invitation_status: "Sent",
      rsvp_status: "Declined",
      plus_one_count: 0,
      dietary_preferences: "None (Unable to travel due to work)"
    }
  ],
  saved_ideas: [
    {
      id: "ida_01",
      event_id: "evt_wedding_01",
      user_id: "usr_demo_01",
      category: "Return Gifts",
      title: "Artisanal Blue Pottery Jars filled with Kashmiri Saffron Honey",
      description: "Support local Jaipur craft artisans by gifting authentic blue pottery ceramic jars filled with organic mountain honey and wrapped in jute ribbon.",
      estimated_cost: 350,
      created_at: new Date(Date.now() - 10 * 86400000).toISOString()
    },
    {
      id: "ida_02",
      event_id: "evt_wedding_01",
      user_id: "usr_demo_01",
      category: "Eco-friendly Celebration",
      title: "Plantable Seed Paper Wedding Invitations",
      description: "Biodegradable invitation cards embedded with marigold and basil seeds that blossom into plants when buried in soil.",
      estimated_cost: 85,
      created_at: new Date(Date.now() - 8 * 86400000).toISOString()
    },
    {
      id: "ida_03",
      event_id: "evt_wedding_01",
      user_id: "usr_demo_01",
      category: "Games & Activities",
      title: "Interactive Sangeet Antakshari & Family Trivia",
      description: "A customized buzzer game pitting Bride's family vs Groom's family with hilarious childhood trivia and retro 90s songs.",
      estimated_cost: 5000,
      created_at: new Date(Date.now() - 5 * 86400000).toISOString()
    }
  ],
  ai_conversations: [
    {
      id: "msg_01",
      user_id: "usr_demo_01",
      event_id: "evt_wedding_01",
      role: "assistant",
      message: "Namaste Priya! I am your EventGenie AI assistant. I've analyzed your wedding in Jaipur with 350 guests and a ₹15,00,000 budget. Your venue and caterers are already confirmed, keeping you comfortably on track! How can I assist you today? We could optimize decoration costs, design invitation wording, or plan the Haldi timeline.",
      created_at: new Date(Date.now() - 2 * 86400000).toISOString()
    }
  ]
};

class Database {
  constructor() {
    this.data = initialSeedData;
    this.load();
  }

  load() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = JSON.parse(raw);
      } else {
        this.save();
      }
    } catch (err) {
      console.error("Error loading database file, initializing with seed data:", err);
      this.data = initialSeedData;
      this.save();
    }
  }

  save() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error("Error saving database file:", err);
    }
  }

  // Users
  getUserByEmail(email) {
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  getUserById(id) {
    return this.data.users.find(u => u.id === id);
  }

  createUser(userData) {
    const newUser = {
      id: userData.id || `usr_${Date.now()}`,
      name: userData.name,
      email: userData.email,
      created_at: new Date().toISOString()
    };
    this.data.users.push(newUser);
    this.save();
    return newUser;
  }

  // Events
  getEventsByUser(userId) {
    return this.data.events.filter(e => e.user_id === userId);
  }

  getEventById(id) {
    return this.data.events.find(e => e.id === id);
  }

  createEvent(eventData) {
    const newEvent = {
      id: eventData.id || `evt_${Date.now()}`,
      user_id: eventData.user_id,
      name: eventData.name,
      event_type: eventData.event_type || 'Other',
      event_date: eventData.event_date,
      end_date: eventData.end_date || eventData.event_date,
      location: eventData.location || 'Local',
      guest_count: Number(eventData.guest_count) || 50,
      budget: Number(eventData.budget) || 50000,
      currency: eventData.currency || 'INR',
      theme: eventData.theme || 'Celebration',
      preferences: eventData.preferences || {},
      plan_data: eventData.plan_data || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this.data.events.push(newEvent);
    this.save();
    return newEvent;
  }

  updateEvent(id, updates) {
    const idx = this.data.events.findIndex(e => e.id === id);
    if (idx === -1) return null;
    this.data.events[idx] = {
      ...this.data.events[idx],
      ...updates,
      updated_at: new Date().toISOString()
    };
    this.save();
    return this.data.events[idx];
  }

  deleteEvent(id) {
    const initialLen = this.data.events.length;
    this.data.events = this.data.events.filter(e => e.id !== id);
    if (this.data.events.length === initialLen) return false;

    // Cascade delete associated items
    this.data.expenses = this.data.expenses.filter(item => item.event_id !== id);
    this.data.tasks = this.data.tasks.filter(item => item.event_id !== id);
    this.data.vendors = this.data.vendors.filter(item => item.event_id !== id);
    this.data.guests = this.data.guests.filter(item => item.event_id !== id);
    this.data.saved_ideas = this.data.saved_ideas.filter(item => item.event_id !== id);
    this.data.ai_conversations = this.data.ai_conversations.filter(item => item.event_id !== id);

    this.save();
    return true;
  }

  // Expenses
  getExpensesByEvent(eventId) {
    return this.data.expenses.filter(e => e.event_id === eventId);
  }

  addExpense(expenseData) {
    const item = {
      id: expenseData.id || `exp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      event_id: expenseData.event_id,
      category: expenseData.category || 'Gifts and miscellaneous expenses',
      description: expenseData.description || 'General Expense',
      estimated_amount: Number(expenseData.estimated_amount) || 0,
      quoted_amount: Number(expenseData.quoted_amount) || 0,
      actual_amount: Number(expenseData.actual_amount) || 0,
      payment_status: expenseData.payment_status || 'Pending',
      due_date: expenseData.due_date || new Date().toISOString().split('T')[0],
      notes: expenseData.notes || ''
    };
    this.data.expenses.push(item);
    this.save();
    return item;
  }

  updateExpense(id, updates) {
    const idx = this.data.expenses.findIndex(e => e.id === id);
    if (idx === -1) return null;
    this.data.expenses[idx] = {
      ...this.data.expenses[idx],
      ...updates,
      estimated_amount: updates.estimated_amount !== undefined ? Number(updates.estimated_amount) : this.data.expenses[idx].estimated_amount,
      quoted_amount: updates.quoted_amount !== undefined ? Number(updates.quoted_amount) : this.data.expenses[idx].quoted_amount,
      actual_amount: updates.actual_amount !== undefined ? Number(updates.actual_amount) : this.data.expenses[idx].actual_amount
    };
    this.save();
    return this.data.expenses[idx];
  }

  deleteExpense(id) {
    const prev = this.data.expenses.length;
    this.data.expenses = this.data.expenses.filter(e => e.id !== id);
    this.save();
    return this.data.expenses.length < prev;
  }

  // Tasks
  getTasksByEvent(eventId) {
    return this.data.tasks.filter(t => t.event_id === eventId);
  }

  addTask(taskData) {
    const item = {
      id: taskData.id || `tsk_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      event_id: taskData.event_id,
      title: taskData.title,
      description: taskData.description || '',
      start_date: taskData.start_date || new Date().toISOString().split('T')[0],
      due_date: taskData.due_date || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      priority: taskData.priority || 'Medium',
      status: taskData.status || 'Not Started',
      assigned_to: taskData.assigned_to || '',
      notes: taskData.notes || ''
    };
    this.data.tasks.push(item);
    this.save();
    return item;
  }

  updateTask(id, updates) {
    const idx = this.data.tasks.findIndex(t => t.id === id);
    if (idx === -1) return null;
    this.data.tasks[idx] = { ...this.data.tasks[idx], ...updates };
    this.save();
    return this.data.tasks[idx];
  }

  deleteTask(id) {
    const prev = this.data.tasks.length;
    this.data.tasks = this.data.tasks.filter(t => t.id !== id);
    this.save();
    return this.data.tasks.length < prev;
  }

  // Vendors
  getVendorsByEvent(eventId) {
    return this.data.vendors.filter(v => v.event_id === eventId);
  }

  addVendor(vendorData) {
    const item = {
      id: vendorData.id || `vnd_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      event_id: vendorData.event_id,
      name: vendorData.name,
      category: vendorData.category || 'Other',
      contact_details: vendorData.contact_details || '',
      location: vendorData.location || '',
      quoted_price: Number(vendorData.quoted_price) || 0,
      agreed_price: Number(vendorData.agreed_price) || 0,
      advance_paid: Number(vendorData.advance_paid) || 0,
      booking_status: vendorData.booking_status || 'Pending Quotation',
      notes: vendorData.notes || '',
      rating: Number(vendorData.rating) || 5
    };
    this.data.vendors.push(item);
    this.save();
    return item;
  }

  updateVendor(id, updates) {
    const idx = this.data.vendors.findIndex(v => v.id === id);
    if (idx === -1) return null;
    this.data.vendors[idx] = {
      ...this.data.vendors[idx],
      ...updates,
      quoted_price: updates.quoted_price !== undefined ? Number(updates.quoted_price) : this.data.vendors[idx].quoted_price,
      agreed_price: updates.agreed_price !== undefined ? Number(updates.agreed_price) : this.data.vendors[idx].agreed_price,
      advance_paid: updates.advance_paid !== undefined ? Number(updates.advance_paid) : this.data.vendors[idx].advance_paid
    };
    this.save();
    return this.data.vendors[idx];
  }

  deleteVendor(id) {
    const prev = this.data.vendors.length;
    this.data.vendors = this.data.vendors.filter(v => v.id !== id);
    this.save();
    return this.data.vendors.length < prev;
  }

  // Guests
  getGuestsByEvent(eventId) {
    return this.data.guests.filter(g => g.event_id === eventId);
  }

  addGuest(guestData) {
    const item = {
      id: guestData.id || `gst_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      event_id: guestData.event_id,
      name: guestData.name,
      contact_details: guestData.contact_details || '',
      group_name: guestData.group_name || 'Friends',
      invitation_status: guestData.invitation_status || 'Draft',
      rsvp_status: guestData.rsvp_status || 'Pending',
      plus_one_count: Number(guestData.plus_one_count) || 0,
      dietary_preferences: guestData.dietary_preferences || ''
    };
    this.data.guests.push(item);
    this.save();
    return item;
  }

  updateGuest(id, updates) {
    const idx = this.data.guests.findIndex(g => g.id === id);
    if (idx === -1) return null;
    this.data.guests[idx] = {
      ...this.data.guests[idx],
      ...updates,
      plus_one_count: updates.plus_one_count !== undefined ? Number(updates.plus_one_count) : this.data.guests[idx].plus_one_count
    };
    this.save();
    return this.data.guests[idx];
  }

  deleteGuest(id) {
    const prev = this.data.guests.length;
    this.data.guests = this.data.guests.filter(g => g.id !== id);
    this.save();
    return this.data.guests.length < prev;
  }

  // Saved Ideas
  getSavedIdeasByEvent(eventId) {
    return this.data.saved_ideas.filter(i => i.event_id === eventId);
  }

  addSavedIdea(ideaData) {
    const item = {
      id: ideaData.id || `ida_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      event_id: ideaData.event_id,
      user_id: ideaData.user_id,
      category: ideaData.category || 'Theme',
      title: ideaData.title,
      description: ideaData.description || '',
      estimated_cost: Number(ideaData.estimated_cost) || 0,
      created_at: new Date().toISOString()
    };
    this.data.saved_ideas.push(item);
    this.save();
    return item;
  }

  deleteSavedIdea(id) {
    const prev = this.data.saved_ideas.length;
    this.data.saved_ideas = this.data.saved_ideas.filter(i => i.id !== id);
    this.save();
    return this.data.saved_ideas.length < prev;
  }

  // AI Conversations
  getAiConversations(eventId) {
    return this.data.ai_conversations
      .filter(m => m.event_id === eventId)
      .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
  }

  addAiConversation(convData) {
    const item = {
      id: convData.id || `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      user_id: convData.user_id,
      event_id: convData.event_id,
      role: convData.role,
      message: convData.message,
      created_at: new Date().toISOString()
    };
    this.data.ai_conversations.push(item);
    this.save();
    return item;
  }
}

export const db = new Database();
