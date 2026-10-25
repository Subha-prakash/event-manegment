# EventGenie AI — GenAI-Powered Event Planning Assistant

![EventGenie AI Banner](https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1600&q=80)

EventGenie AI is an intelligent, full-stack event planning assistant designed to streamline the organization of **weddings, birthdays, anniversaries, college fests, community gatherings, and corporate summits**.

Powered by **Google Gemini AI** and a deterministic logistics engine, EventGenie creates personalized event concepts, accurate category budgets, 90-day preparation timelines, vendor directories with balance tracking, and RSVP guest rosters.

---

## 🌟 Key Features

### 1. 🪄 AI Event Creation Wizard
- **Multi-step Intuitive Questionnaire**: Input event type, date range, guest headcount, total budget, currency, theme, indoor/outdoor preferences, dietary requirements, and cultural traditions.
- **Master Plan Synthesis**: Generates 10 structured sections:
  1. Concept and theme vision
  2. Decoration ideas and aesthetics
  3. Venue & technical requirements
  4. Food & catering suggestions
  5. Entertainment options & musical flow
  6. Guest management recommendations
  7. Required vendor checklist
  8. Estimated expense breakdown
  9. Chronological preparation timeline
  10. Important reminders and statutory curfews

### 2. 🔄 On-Demand Section Regenerator
- Fine-tune individual sections without losing overall plan edits.
- Pass custom instructions to the AI (e.g., *"Make floral arrangements more minimalist using local marigolds"* or *"Incorporate vegan Jain food counters"*).

### 3. 📊 Deterministic Budget Planner & Analytics
- **Deterministic Math Engine**: All financial math (totals, remaining funds, utilization percentages, pending payments) is computed in application logic, not hallucinated by LLMs.
- **Three-Tier Expense Tracking**: Track **Estimated Plan**, **Quoted Bids**, and **Actual Paid** amounts separately.
- **Recharts Data Visualizations**: Donut charts for category cost allocation and comparative bar charts.
- **Multi-Currency**: Default INR (`₹` with Indian lakh formatting) along with USD (`$`), EUR (`€`), and GBP (`£`).
- **Overspending Warnings & AI Savings Advice**: Highlights categories exceeding budget with specific cost-saving recommendations.

### 4. 📅 Smart Preparation Timeline & Tasks
- **Milestone-Based Schedule**: Tasks dynamically mapped relative to your event date (T-90 days, T-60 days, T-30 days, T-14 days, T-7 days, T-1 day, Event Day).
- **Interactive Checklists**: Filter tasks by Priority (`High`, `Medium`, `Low`), Status (`Not Started`, `In Progress`, `Completed`), or Keyword.
- **Instant Status Toggling**: Mark tasks completed with real-time progress bar recalculations.

### 5. 🤝 Vendor Management System
- **9 Specialized Categories**: Venues, Caterers, Decorators, Photographers, DJs/Entertainers, Stylists, Transportation, Equipment, and Coordinators.
- **Financial Balances**: Track agreed prices, advances paid, and remaining balances due.
- **Vendor Checklist**: Automatically flags missing core services and unconfirmed bookings.

### 6. 👥 Guest List & RSVP Manager
- **Group Categorization**: Organize guests into `Family`, `Friends`, `VIP`, `Colleagues`, and `Other`.
- **Headcount Calculation**: Tracks primary guests and plus-one additions for exact catering plate counts.
- **Dietary & Allergy Tracking**: Record vegetarian, vegan, Jain, gluten-free, or medical dietary preferences.
- **1-Click CSV Export**: Instant browser download of formatted CSV rosters.

### 7. 💬 Context-Aware AI Planning Chat
- **Current Event Context**: The chat assistant has real-time awareness of the active event's budget, location, and guest count.
- **1-Click Prompt Shortcuts**: Quick buttons for *"Reduce decoration costs by 20%"*, *"Suggest a birthday party for 15 children under ₹5,000"*, *"Vegetarian menu for 100 guests"*, and more.
- **Action Proposals**: When the AI suggests a budget adjustment or task, it presents an interactive card for user approval before applying changes to the database.

### 8. 💡 Personalized Ideas & Inspiration Library
- Browse and synthesize ideas across DIY decorations, return favors, party games, invitation wording, and eco-friendly celebrations with cost estimates.

### 9. ⚙️ Event Settings & Dual AI Engine
- **Live Google Gemini 3.8 Flash**: Plug in your Gemini API key from [Google AI Studio](https://aistudio.google.com) for real-time model inference.
- **Built-in Intelligent Planner**: Operates out-of-the-box even without an external API key using regional planning heuristics.
- **JSON Blueprint Export**: Download a full JSON backup of the entire event state.

---

## 🛠️ Technology Stack

- **Frontend**:
  - **React 18** + **TypeScript** + **Vite**
  - **Tailwind CSS** (curated palette with sleek indigo/purple accents & glassmorphism)
  - **Lucide Icons**
  - **Recharts** (data visualization for budgets and expenses)
  - **React Router DOM v6** (declarative client routing)
  - **Canvas Confetti** (interactive celebratory feedback)

- **Backend**:
  - **Node.js** + **Express.js** (REST API architecture)
  - **@google/genai** (Official Google Gemini SDK for `gemini-3.8-flash`)
  - **Zod** (strict schema and input validation)
  - **File-Backed JSON Database Engine** (`server/src/db.js` with atomic writes, cascading deletes, and seed events)
  - **PostgreSQL / Supabase Schema** (`supabase_schema.sql` with Row Level Security and indexes)

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm (v9 or higher)

### 1. Installation
Clone the repository and install all dependencies:
```bash
# Install root, server, and client dependencies
npm run install:all
```

Alternatively:
```bash
npm install
npm install --prefix server
npm install --prefix client
```

### 2. Environment Variables (Optional)
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

If you wish to use live Google Gemini API models, add your key:
```env
PORT=5000
GEMINI_API_KEY=AIzaSy...your_gemini_api_key_here
```
*(Note: If left empty, EventGenie will automatically run using its Built-in Intelligent Planner engine. You can also paste and test your key directly in the web app under **Event Settings**!)*

### 3. Running Locally
Start both the backend server and frontend development server simultaneously:
```bash
npm run dev
```

- **Frontend UI**: [http://localhost:5173/](http://localhost:5173/)
- **Backend API**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## 🧪 Testing and Verification

Run the integration test suite to verify all backend REST endpoints and AI workflows:
```bash
node server/integration_test.js
```

Build the client production bundle:
```bash
npm run build
```

---

## 📦 Database & Supabase Deployment

EventGenie AI is designed for immediate local usage and zero-friction cloud deployment.

### Supabase Migration
To deploy EventGenie AI with PostgreSQL and Supabase Authentication:
1. Create a project on [Supabase](https://supabase.com).
2. Open the **SQL Editor** in your Supabase dashboard.
3. Paste and run the contents of [`supabase_schema.sql`](./supabase_schema.sql).
4. The schema includes:
   - Tables: `users`, `events`, `expenses`, `tasks`, `vendors`, `guests`, `saved_ideas`, `ai_conversations`.
   - Automatic cascade deletes on foreign keys.
   - Row Level Security (RLS) policies enforcing ownership (`auth.uid() = user_id`).
   - Query performance indexes.

---

## 👥 Sample Demonstration Data

EventGenie AI comes pre-seeded with realistic, high-fidelity sample events:
1. **Aarav & Meera's Royal Palace Wedding**:
   - Location: Jaipur, Rajasthan
   - Guest Count: 350
   - Budget: ₹15,00,000 (INR)
   - Populated with categorized expenses, 90-day timeline tasks, confirmed palace vendors, guest RSVPs, and AI concept plan.
2. **TechNova Collegiate Hackathon & Summit**:
   - Location: Bangalore, Karnataka
   - Guest Count: 220
   - Budget: ₹3,50,000 (INR)
   - Populated with technical equipment checklists, catering, and sponsor tasks.

---

## 📄 License
MIT License. Built for modern event creators and celebration planners.
