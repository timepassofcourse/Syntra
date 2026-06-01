-- CREATE TABLES FOR SYNTRA AI STUDENT OS

-- 1. PROFILES TABLE (one-to-one with auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT,
    email TEXT,
    college TEXT,
    semester TEXT,
    branch TEXT,
    avatar TEXT,
    target_roles TEXT[] DEFAULT '{}',
    skills TEXT[] DEFAULT '{}',
    placement_goals TEXT[] DEFAULT '{}',
    dream_companies TEXT[] DEFAULT '{}',
    focus_hours INTEGER DEFAULT 25,
    sleep_targets INTEGER DEFAULT 8,
    study_style TEXT,
    break_preferences TEXT,
    onboarded BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Allow users to read their own profile" 
    ON public.profiles FOR SELECT 
    USING (auth.uid() = id);

CREATE POLICY "Allow users to insert their own profile" 
    ON public.profiles FOR INSERT 
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Allow users to update their own profile" 
    ON public.profiles FOR UPDATE 
    USING (auth.uid() = id);


-- 2. ASSIGNMENTS TABLE (maps to tasks in app state)
CREATE TABLE IF NOT EXISTS public.assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    subject TEXT,
    due_date TEXT,
    priority TEXT DEFAULT 'medium',
    completed BOOLEAN DEFAULT FALSE,
    subtasks JSONB DEFAULT '[]'::jsonb,
    deadline_risk TEXT DEFAULT 'low',
    recovery_plan TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Enable RLS on assignments
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;

-- Create policies for assignments
CREATE POLICY "Allow users to read their own assignments" 
    ON public.assignments FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Allow users to insert their own assignments" 
    ON public.assignments FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow users to update their own assignments" 
    ON public.assignments FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Allow users to delete their own assignments" 
    ON public.assignments FOR DELETE 
    USING (auth.uid() = user_id);


-- 3. ATTENDANCE TABLE
CREATE TABLE IF NOT EXISTS public.attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    subject TEXT NOT NULL,
    attended INTEGER DEFAULT 0,
    total INTEGER DEFAULT 0,
    target INTEGER DEFAULT 75,
    logs JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Enable RLS on attendance
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;

-- Create policies for attendance
CREATE POLICY "Allow users to read their own attendance" 
    ON public.attendance FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Allow users to insert their own attendance" 
    ON public.attendance FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow users to update their own attendance" 
    ON public.attendance FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Allow users to delete their own attendance" 
    ON public.attendance FOR DELETE 
    USING (auth.uid() = user_id);


-- 4. NOTES TABLE
CREATE TABLE IF NOT EXISTS public.notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    subject TEXT,
    folder TEXT DEFAULT 'General',
    content TEXT DEFAULT '',
    summary TEXT,
    flashcards JSONB DEFAULT '[]'::jsonb,
    quiz JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Enable RLS on notes
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

-- Create policies for notes
CREATE POLICY "Allow users to read their own notes" 
    ON public.notes FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Allow users to insert their own notes" 
    ON public.notes FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow users to update their own notes" 
    ON public.notes FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Allow users to delete their own notes" 
    ON public.notes FOR DELETE 
    USING (auth.uid() = user_id);


-- Trigger to automatically create a profile record when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, name, email, onboarded)
    VALUES (
        new.id,
        COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
        new.email,
        FALSE
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
