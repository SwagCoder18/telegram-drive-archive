
-- First, let's set up RLS policies for existing tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Allow users to view and update their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Add Telegram configuration columns to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bot_token TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS channel_id TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bot_username TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS telegram_setup_completed BOOLEAN DEFAULT FALSE;

-- Set up the files table with proper structure and RLS
ALTER TABLE public.files ENABLE ROW LEVEL SECURITY;

-- Update files table structure to match our needs
ALTER TABLE public.files DROP COLUMN IF EXISTS telegram_file_id;
ALTER TABLE public.files ADD COLUMN telegram_file_id TEXT;
ALTER TABLE public.files ADD COLUMN telegram_message_id BIGINT;
ALTER TABLE public.files ADD COLUMN folder_path TEXT DEFAULT '/';
ALTER TABLE public.files ADD COLUMN upload_status TEXT DEFAULT 'completed';

-- RLS policies for files table
CREATE POLICY "Users can view own files" ON public.files
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own files" ON public.files
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own files" ON public.files
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own files" ON public.files
    FOR DELETE USING (auth.uid() = user_id);

-- Create a function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name)
  VALUES (new.id, new.raw_user_meta_data->>'first_name', new.raw_user_meta_data->>'last_name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
