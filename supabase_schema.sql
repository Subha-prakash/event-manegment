-- ==============================================================================
-- EventGenie AI — Complete Supabase PostgreSQL Schema & Security Policies
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. USERS TABLE
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. EVENTS TABLE
CREATE TABLE IF NOT EXISTS public.events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    event_type TEXT NOT NULL,
    event_date DATE NOT NULL,
    end_date DATE,
    location TEXT NOT NULL,
    guest_count INTEGER NOT NULL DEFAULT 50,
    budget NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    currency VARCHAR(10) NOT NULL DEFAULT 'INR',
    theme TEXT,
    preferences JSONB DEFAULT '{}'::jsonb,
    plan_data JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. EXPENSES TABLE
CREATE TABLE IF NOT EXISTS public.expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    category TEXT NOT NULL,
    description TEXT NOT NULL,
    estimated_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    quoted_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    actual_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    payment_status VARCHAR(50) NOT NULL DEFAULT 'Pending',
    due_date DATE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TASKS TABLE
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    start_date DATE,
    due_date DATE NOT NULL,
    priority VARCHAR(20) NOT NULL DEFAULT 'Medium',
    status VARCHAR(30) NOT NULL DEFAULT 'Not Started',
    assigned_to TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. VENDORS TABLE
CREATE TABLE IF NOT EXISTS public.vendors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    contact_details TEXT,
    location TEXT,
    quoted_price NUMERIC(12, 2) DEFAULT 0.00,
    agreed_price NUMERIC(12, 2) DEFAULT 0.00,
    advance_paid NUMERIC(12, 2) DEFAULT 0.00,
    booking_status VARCHAR(50) NOT NULL DEFAULT 'Pending Quotation',
    notes TEXT,
    rating INTEGER DEFAULT 5,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. GUESTS TABLE
CREATE TABLE IF NOT EXISTS public.guests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    contact_details TEXT,
    group_name VARCHAR(50) DEFAULT 'Friends',
    invitation_status VARCHAR(30) DEFAULT 'Draft',
    rsvp_status VARCHAR(30) DEFAULT 'Pending',
    plus_one_count INTEGER DEFAULT 0,
    dietary_preferences TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. SAVED IDEAS TABLE
CREATE TABLE IF NOT EXISTS public.saved_ideas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    category VARCHAR(80) NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    estimated_cost NUMERIC(12, 2) DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. AI CONVERSATIONS TABLE
CREATE TABLE IF NOT EXISTS public.ai_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- PERFORMANCE INDEXES
-- ------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_events_user_id ON public.events(user_id);
CREATE INDEX IF NOT EXISTS idx_expenses_event_id ON public.expenses(event_id);
CREATE INDEX IF NOT EXISTS idx_tasks_event_id ON public.tasks(event_id);
CREATE INDEX IF NOT EXISTS idx_vendors_event_id ON public.vendors(event_id);
CREATE INDEX IF NOT EXISTS idx_guests_event_id ON public.guests(event_id);
CREATE INDEX IF NOT EXISTS idx_saved_ideas_event_id ON public.saved_ideas(event_id);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_event_id ON public.ai_conversations(event_id);

-- ------------------------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------------------------------------------
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_conversations ENABLE ROW LEVEL SECURITY;

-- Users Policy
CREATE POLICY "Users can manage their own profile"
    ON public.users
    FOR ALL
    USING (auth.uid() = id);

-- Events Policy
CREATE POLICY "Users can manage their own events"
    ON public.events
    FOR ALL
    USING (auth.uid() = user_id);

-- Expenses Policy (Access restricted through event ownership)
CREATE POLICY "Users can manage expenses for their events"
    ON public.expenses
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.events
            WHERE events.id = expenses.event_id AND events.user_id = auth.uid()
        )
    );

-- Tasks Policy
CREATE POLICY "Users can manage tasks for their events"
    ON public.tasks
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.events
            WHERE events.id = tasks.event_id AND events.user_id = auth.uid()
        )
    );

-- Vendors Policy
CREATE POLICY "Users can manage vendors for their events"
    ON public.vendors
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.events
            WHERE events.id = vendors.event_id AND events.user_id = auth.uid()
        )
    );

-- Guests Policy
CREATE POLICY "Users can manage guests for their events"
    ON public.guests
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.events
            WHERE events.id = guests.event_id AND events.user_id = auth.uid()
        )
    );

-- Saved Ideas Policy
CREATE POLICY "Users can manage saved ideas for their events"
    ON public.saved_ideas
    FOR ALL
    USING (auth.uid() = user_id);

-- AI Conversations Policy
CREATE POLICY "Users can manage conversations for their events"
    ON public.ai_conversations
    FOR ALL
    USING (auth.uid() = user_id);
