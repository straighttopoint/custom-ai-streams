-- Create orders table with all the required fields and status workflow
CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  
  -- Client Information
  client_name TEXT NOT NULL,
  client_email TEXT NOT NULL,
  client_phone TEXT NOT NULL,
  company_name TEXT NOT NULL,
  industry TEXT NOT NULL,
  website_url TEXT,
  
  -- Social Media Information
  instagram_handle TEXT,
  facebook_page TEXT,
  twitter_handle TEXT,
  linkedin_profile TEXT,
  
  -- Automation & Project Details
  automation_id TEXT NOT NULL,
  automation_title TEXT NOT NULL,
  automation_price TEXT NOT NULL,
  automation_category TEXT,
  project_description TEXT NOT NULL,
  special_requirements TEXT,
  
  -- Meeting & Payment Information
  meeting_date TEXT NOT NULL,
  payment_format TEXT NOT NULL CHECK (payment_format IN ('fixed', 'recurring')),
  agreed_price TEXT NOT NULL,
  
  -- Order Status and Workflow
  status TEXT NOT NULL DEFAULT 'order_created' CHECK (status IN (
    'order_created',
    'request_under_review',
    'request_rejected',
    'request_approved',
    'meeting_scheduled',
    'meeting_completed',
    'meeting_missed_client',
    'meeting_missed_our_team',
    'rescheduling_required',
    'configuration_in_progress',
    'configuration_blocked',
    'configuration_completed',
    'testing_in_progress',
    'testing_failed',
    'testing_completed',
    'pending_client_approval',
    'approved_by_client',
    'rejected_by_client',
    'invoice_sent',
    'payment_pending',
    'payment_completed',
    'payment_failed',
    'vendor_payment_pending',
    'vendor_payment_completed',
    'order_completed_successfully',
    'order_cancelled_client',
    'order_cancelled_internal',
    'order_on_hold'
  )),
  
  -- Additional Notes and Tracking
  admin_notes TEXT,
  estimated_completion_date DATE,
  actual_completion_date DATE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own orders" 
ON public.orders 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own orders" 
ON public.orders 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own orders" 
ON public.orders 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_orders_updated_at
BEFORE UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for better performance
CREATE INDEX idx_orders_user_id ON public.orders(user_id);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_orders_created_at ON public.orders(created_at DESC);