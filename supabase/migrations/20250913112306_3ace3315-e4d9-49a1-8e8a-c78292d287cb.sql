-- Create transactions table for user financial history
CREATE TABLE public.transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('meeting_fee', 'setup_fee', 'client_payment', 'automation_fee', 'deposit', 'withdrawal')),
  amount DECIMAL(10,2) NOT NULL,
  description TEXT,
  order_id UUID, -- References to orders when applicable
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create custom_requests table for user custom automation requests
CREATE TABLE public.custom_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  requirements TEXT,
  budget_range TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'in_progress', 'completed', 'rejected')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  estimated_cost DECIMAL(10,2),
  estimated_delivery DATE,
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create support_tickets table for user support requests
CREATE TABLE public.support_tickets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('technical', 'billing', 'general', 'bug_report', 'feature_request')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'waiting_response', 'resolved', 'closed')),
  admin_response TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for transactions
CREATE POLICY "Users can view their own transactions" 
ON public.transactions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Service role can insert transactions" 
ON public.transactions 
FOR INSERT 
WITH CHECK (true);

-- Create RLS policies for custom_requests
CREATE POLICY "Users can view their own custom requests" 
ON public.custom_requests 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own custom requests" 
ON public.custom_requests 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own custom requests" 
ON public.custom_requests 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create RLS policies for support_tickets
CREATE POLICY "Users can view their own support tickets" 
ON public.support_tickets 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own support tickets" 
ON public.support_tickets 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own support tickets" 
ON public.support_tickets 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_transactions_updated_at
BEFORE UPDATE ON public.transactions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_custom_requests_updated_at
BEFORE UPDATE ON public.custom_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_support_tickets_updated_at
BEFORE UPDATE ON public.support_tickets
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX idx_transactions_created_at ON public.transactions(created_at DESC);
CREATE INDEX idx_custom_requests_user_id ON public.custom_requests(user_id);
CREATE INDEX idx_custom_requests_status ON public.custom_requests(status);
CREATE INDEX idx_support_tickets_user_id ON public.support_tickets(user_id);
CREATE INDEX idx_support_tickets_status ON public.support_tickets(status);