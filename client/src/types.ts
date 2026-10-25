export interface User {
  id: string;
  name: string;
  email: string;
  created_at?: string;
}

export interface EventPreferences {
  venue_type?: string;
  food_preferences?: string;
  cultural_traditions?: string;
  formality?: string;
  special_requests?: string;
}

export interface BudgetBreakdownItem {
  category: string;
  estimated_cost: number;
  reason?: string;
}

export interface TimelineItem {
  task: string;
  days_before_event: number;
  priority: 'High' | 'Medium' | 'Low';
  description?: string;
  assigned_to?: string;
}

export interface PersonalizedIdea {
  title: string;
  category: string;
  estimated_cost: number;
  description: string;
}

export interface PlanData {
  event_summary?: {
    event_name: string;
    event_type: string;
    theme: string;
    guest_count: number;
    total_budget: number;
    currency: string;
    location: string;
  };
  concept_and_theme?: string;
  decoration_ideas?: string[];
  venue_requirements?: string[];
  food_and_catering?: string[];
  entertainment_options?: string[];
  guest_management?: string[];
  vendor_checklist?: string[];
  budget_breakdown?: BudgetBreakdownItem[];
  timeline?: TimelineItem[];
  important_reminders?: string[];
  personalized_ideas?: PersonalizedIdea[];
  assumptions?: string[];
}

export interface Event {
  id: string;
  user_id: string;
  name: string;
  event_type: string;
  event_date: string;
  end_date?: string;
  location: string;
  guest_count: number;
  budget: number;
  currency: string;
  theme?: string;
  preferences?: EventPreferences;
  plan_data?: PlanData;
  created_at?: string;
  updated_at?: string;
}

export interface Expense {
  id: string;
  event_id: string;
  category: string;
  description: string;
  estimated_amount: number;
  quoted_amount: number;
  actual_amount: number;
  payment_status: 'Paid' | 'Partially Paid' | 'Pending';
  due_date?: string;
  notes?: string;
}

export interface Task {
  id: string;
  event_id: string;
  title: string;
  description?: string;
  start_date?: string;
  due_date: string;
  priority: 'High' | 'Medium' | 'Low';
  status: 'Not Started' | 'In Progress' | 'Completed';
  assigned_to?: string;
  notes?: string;
}

export interface Vendor {
  id: string;
  event_id: string;
  name: string;
  category: string;
  contact_details?: string;
  location?: string;
  quoted_price: number;
  agreed_price: number;
  advance_paid: number;
  booking_status: 'Confirmed' | 'Booked' | 'In Negotiation' | 'Pending Quotation';
  notes?: string;
  rating?: number;
}

export interface Guest {
  id: string;
  event_id: string;
  name: string;
  contact_details?: string;
  group_name: 'Family' | 'Friends' | 'VIP' | 'Colleagues' | 'Other';
  invitation_status: 'Draft' | 'Sent';
  rsvp_status: 'Pending' | 'Accepted' | 'Declined';
  plus_one_count: number;
  dietary_preferences?: string;
}

export interface SavedIdea {
  id: string;
  event_id: string;
  user_id?: string;
  category: string;
  title: string;
  description: string;
  estimated_cost: number;
  created_at?: string;
}

export interface AiConversation {
  id: string;
  user_id: string;
  event_id: string;
  role: 'user' | 'assistant';
  message: string;
  created_at?: string;
}

export interface CategorySummary {
  category: string;
  estimated: number;
  quoted: number;
  actual: number;
  count: number;
}

export interface BudgetSummary {
  totalBudget: number;
  totalEstimated: number;
  totalQuoted: number;
  totalActual: number;
  remainingBudget: number;
  utilizationPercentage: number;
  isOverBudget: boolean;
  totalPendingVendorBalance: number;
  totalAgreedVendorCost: number;
  totalAdvancePaid: number;
  categoryBreakdown: CategorySummary[];
  recommendations: Array<{ type: 'warning' | 'info' | 'success'; text: string }>;
}

export interface AiStatus {
  hasKey: boolean;
  model: string;
  mode: string;
}
