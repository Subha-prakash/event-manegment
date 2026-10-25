import {
  User,
  Event,
  Expense,
  Task,
  Vendor,
  Guest,
  SavedIdea,
  AiConversation,
  BudgetSummary,
  AiStatus,
  PlanData
} from '../types';

const BASE_URL = '/api';

function getHeaders(): HeadersInit {
  const token = localStorage.getItem('eg_token');
  const userId = localStorage.getItem('eg_user_id') || 'usr_demo_01';
  return {
    'Content-Type': 'application/json',
    'x-user-id': userId,
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      ...getHeaders(),
      ...(options.headers || {})
    }
  });

  if (!res.ok) {
    let errorMsg = `Request failed: ${res.statusText}`;
    try {
      const json = await res.json();
      if (json.error) errorMsg = json.error;
    } catch {
      // ignored
    }
    throw new Error(errorMsg);
  }

  return res.json();
}

export const api = {
  // Auth
  async login(email: string, name?: string): Promise<{ user: User; token: string }> {
    const data = await request<{ user: User; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, name })
    });
    localStorage.setItem('eg_token', data.token);
    localStorage.setItem('eg_user_id', data.user.id);
    return data;
  },

  async register(name: string, email: string): Promise<{ user: User; token: string }> {
    const data = await request<{ user: User; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email })
    });
    localStorage.setItem('eg_token', data.token);
    localStorage.setItem('eg_user_id', data.user.id);
    return data;
  },

  async getMe(): Promise<{ user: User }> {
    return request<{ user: User }>('/auth/me');
  },

  async loginDemo(): Promise<{ user: User; token: string }> {
    const data = await request<{ user: User; token: string }>('/auth/demo', {
      method: 'POST'
    });
    localStorage.setItem('eg_token', data.token);
    localStorage.setItem('eg_user_id', data.user.id);
    return data;
  },

  logout(): void {
    localStorage.removeItem('eg_token');
    localStorage.removeItem('eg_user_id');
  },

  // AI Configuration
  async getAiStatus(): Promise<AiStatus> {
    return request<AiStatus>('/ai/status');
  },

  async configureApiKey(apiKey: string): Promise<{ success: boolean; message: string; ai: AiStatus }> {
    return request('/ai/configure-key', {
      method: 'POST',
      body: JSON.stringify({ apiKey })
    });
  },

  // Events
  async getEvents(): Promise<Event[]> {
    return request<Event[]>('/events');
  },

  async getEvent(id: string): Promise<Event> {
    return request<Event>(`/events/${id}`);
  },

  async createEvent(eventData: Partial<Event>): Promise<Event> {
    return request<Event>('/events', {
      method: 'POST',
      body: JSON.stringify(eventData)
    });
  },

  async updateEvent(id: string, updates: Partial<Event>): Promise<Event> {
    return request<Event>(`/events/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  },

  async deleteEvent(id: string): Promise<{ success: boolean }> {
    return request<{ success: boolean }>(`/events/${id}`, {
      method: 'DELETE'
    });
  },

  // AI Generation
  async generatePlan(eventData: Partial<Event>): Promise<PlanData> {
    return request<PlanData>('/ai/generate-plan', {
      method: 'POST',
      body: JSON.stringify(eventData)
    });
  },

  async regenerateSection(eventId: string, sectionKey: string, instructions?: string): Promise<{ sectionKey: string; data: any; fullPlan: PlanData }> {
    return request('/ai/regenerate-section', {
      method: 'POST',
      body: JSON.stringify({ eventId, sectionKey, instructions })
    });
  },

  async generateIdeas(eventId: string, category: string): Promise<SavedIdea[]> {
    return request<SavedIdea[]>('/ai/generate-ideas', {
      method: 'POST',
      body: JSON.stringify({ eventId, category })
    });
  },

  // AI Chat
  async getAiConversations(eventId: string): Promise<AiConversation[]> {
    return request<AiConversation[]>(`/ai/conversations/${eventId}`);
  },

  async sendChatMessage(eventId: string, message: string): Promise<{ message: AiConversation; suggested_action?: any }> {
    return request('/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ eventId, message })
    });
  },

  // Expenses & Budget
  async getExpenses(eventId: string): Promise<Expense[]> {
    return request<Expense[]>(`/events/${eventId}/expenses`);
  },

  async addExpense(eventId: string, expense: Partial<Expense>): Promise<Expense> {
    return request<Expense>(`/events/${eventId}/expenses`, {
      method: 'POST',
      body: JSON.stringify(expense)
    });
  },

  async updateExpense(eventId: string, expenseId: string, updates: Partial<Expense>): Promise<Expense> {
    return request<Expense>(`/events/${eventId}/expenses/${expenseId}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  },

  async deleteExpense(eventId: string, expenseId: string): Promise<{ success: boolean }> {
    return request<{ success: boolean }>(`/events/${eventId}/expenses/${expenseId}`, {
      method: 'DELETE'
    });
  },

  async getBudgetSummary(eventId: string): Promise<BudgetSummary> {
    return request<BudgetSummary>(`/events/${eventId}/budget-summary`);
  },

  // Tasks
  async getTasks(eventId: string): Promise<Task[]> {
    return request<Task[]>(`/events/${eventId}/tasks`);
  },

  async addTask(eventId: string, task: Partial<Task>): Promise<Task> {
    return request<Task>(`/events/${eventId}/tasks`, {
      method: 'POST',
      body: JSON.stringify(task)
    });
  },

  async updateTask(eventId: string, taskId: string, updates: Partial<Task>): Promise<Task> {
    return request<Task>(`/events/${eventId}/tasks/${taskId}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  },

  async deleteTask(eventId: string, taskId: string): Promise<{ success: boolean }> {
    return request<{ success: boolean }>(`/events/${eventId}/tasks/${taskId}`, {
      method: 'DELETE'
    });
  },

  // Vendors
  async getVendors(eventId: string): Promise<Vendor[]> {
    return request<Vendor[]>(`/events/${eventId}/vendors`);
  },

  async addVendor(eventId: string, vendor: Partial<Vendor>): Promise<Vendor> {
    return request<Vendor>(`/events/${eventId}/vendors`, {
      method: 'POST',
      body: JSON.stringify(vendor)
    });
  },

  async updateVendor(eventId: string, vendorId: string, updates: Partial<Vendor>): Promise<Vendor> {
    return request<Vendor>(`/events/${eventId}/vendors/${vendorId}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  },

  async deleteVendor(eventId: string, vendorId: string): Promise<{ success: boolean }> {
    return request<{ success: boolean }>(`/events/${eventId}/vendors/${vendorId}`, {
      method: 'DELETE'
    });
  },

  // Guests
  async getGuests(eventId: string): Promise<Guest[]> {
    return request<Guest[]>(`/events/${eventId}/guests`);
  },

  async addGuest(eventId: string, guest: Partial<Guest>): Promise<Guest> {
    return request<Guest>(`/events/${eventId}/guests`, {
      method: 'POST',
      body: JSON.stringify(guest)
    });
  },

  async updateGuest(eventId: string, guestId: string, updates: Partial<Guest>): Promise<Guest> {
    return request<Guest>(`/events/${eventId}/guests/${guestId}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  },

  async deleteGuest(eventId: string, guestId: string): Promise<{ success: boolean }> {
    return request<{ success: boolean }>(`/events/${eventId}/guests/${guestId}`, {
      method: 'DELETE'
    });
  },

  getGuestsExportUrl(eventId: string): string {
    return `${BASE_URL}/events/${eventId}/guests/export`;
  },

  // Saved Ideas
  async getSavedIdeas(eventId: string): Promise<SavedIdea[]> {
    return request<SavedIdea[]>(`/events/${eventId}/ideas`);
  },

  async addSavedIdea(eventId: string, idea: Partial<SavedIdea>): Promise<SavedIdea> {
    return request<SavedIdea>(`/events/${eventId}/ideas`, {
      method: 'POST',
      body: JSON.stringify(idea)
    });
  },

  async deleteSavedIdea(eventId: string, ideaId: string): Promise<{ success: boolean }> {
    return request<{ success: boolean }>(`/events/${eventId}/ideas/${ideaId}`, {
      method: 'DELETE'
    });
  }
};
