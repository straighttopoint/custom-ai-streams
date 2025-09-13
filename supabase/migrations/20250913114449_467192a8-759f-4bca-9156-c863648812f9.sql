-- Create support_messages table for chat-like support system
CREATE TABLE public.support_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id UUID NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  message TEXT NOT NULL,
  is_admin BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on support_messages
ALTER TABLE public.support_messages ENABLE ROW LEVEL SECURITY;

-- Create policies for support_messages
CREATE POLICY "Users can view messages from their tickets"
ON public.support_messages
FOR SELECT
USING (
  ticket_id IN (
    SELECT id FROM public.support_tickets 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can create messages in their tickets"
ON public.support_messages
FOR INSERT
WITH CHECK (
  ticket_id IN (
    SELECT id FROM public.support_tickets 
    WHERE user_id = auth.uid()
  ) AND user_id = auth.uid() AND is_admin = false
);

-- Create trigger for automatic timestamp updates on support_messages
CREATE TRIGGER update_support_messages_updated_at
BEFORE UPDATE ON public.support_messages
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Remove admin_response column from support_tickets as messages will handle this
ALTER TABLE public.support_tickets DROP COLUMN IF EXISTS admin_response;