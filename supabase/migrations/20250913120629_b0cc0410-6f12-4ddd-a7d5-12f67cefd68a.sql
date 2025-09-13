-- Create user_automations table to track which automations each user has added to their list
CREATE TABLE public.user_automations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  automation_id TEXT NOT NULL,
  automation_title TEXT NOT NULL,
  automation_description TEXT,
  automation_category TEXT,
  automation_cost NUMERIC NOT NULL DEFAULT 0,
  automation_suggested_price NUMERIC NOT NULL DEFAULT 0,
  automation_profit NUMERIC NOT NULL DEFAULT 0,
  automation_rating NUMERIC DEFAULT 0,
  automation_reviews INTEGER DEFAULT 0,
  automation_tags TEXT[] DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  added_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on user_automations
ALTER TABLE public.user_automations ENABLE ROW LEVEL SECURITY;

-- Create policies for user_automations
CREATE POLICY "Users can view their own automations"
ON public.user_automations
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can add automations to their list"
ON public.user_automations
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own automations"
ON public.user_automations
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own automations"
ON public.user_automations
FOR DELETE
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_user_automations_updated_at
BEFORE UPDATE ON public.user_automations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create unique constraint to prevent duplicate automations per user
CREATE UNIQUE INDEX idx_user_automations_unique 
ON public.user_automations (user_id, automation_id);