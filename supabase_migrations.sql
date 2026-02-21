-- Supabase Migration: Health Companion Pivot Schema
-- Enables tracking of Patient Health Profiles and Visit/Medical Records

-- 1. Create Health Profiles Table
CREATE TABLE public.health_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    chronic_conditions TEXT[] DEFAULT '{}'::TEXT[],
    allergies TEXT[] DEFAULT '{}'::TEXT[],
    current_medications TEXT[] DEFAULT '{}'::TEXT[],
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id)
);

-- Protect Health Profiles with Row Level Security (RLS)
ALTER TABLE public.health_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert their own health profile"
    ON public.health_profiles FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own health profile"
    ON public.health_profiles FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own health profile"
    ON public.health_profiles FOR UPDATE
    USING (auth.uid() = user_id);

-- 2. Create Medical Records Table
CREATE TABLE public.medical_records (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('Visit', 'Lab', 'Prescription')),
    summary TEXT NOT NULL,
    raw_text_ocr TEXT,
    image_url TEXT,
    follow_up_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Protect Medical Records with Row Level Security (RLS)
ALTER TABLE public.medical_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert their own medical records"
    ON public.medical_records FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own medical records"
    ON public.medical_records FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own medical records"
    ON public.medical_records FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own medical records"
    ON public.medical_records FOR DELETE
    USING (auth.uid() = user_id);

-- 3. Create Function to auto-update 'updated_at' on health_profiles
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_health_profiles_modtime
    BEFORE UPDATE ON public.health_profiles
    FOR EACH ROW
    EXECUTE PROCEDURE update_modified_column();
