-- Create order_transactions table for tracking all order-related fees and payments
CREATE TABLE public.order_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL,
  user_id UUID NOT NULL,
  transaction_type TEXT NOT NULL, -- 'automation_cost', 'meeting_fee', 'setup_fee', 'followup_fee', 'dropservicing_fee', 'payment'
  amount NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'completed', 'cancelled'
  description TEXT,
  due_date DATE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.order_transactions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own order transactions" 
ON public.order_transactions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage order transactions" 
ON public.order_transactions 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Create trigger for updated_at
CREATE TRIGGER update_order_transactions_updated_at
BEFORE UPDATE ON public.order_transactions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to generate order transactions when status changes
CREATE OR REPLACE FUNCTION public.generate_order_transactions(
  p_order_id UUID,
  p_user_id UUID,
  p_selling_price NUMERIC,
  p_automation_cost NUMERIC,
  p_payment_format TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_dropservicing_fee NUMERIC;
  v_meeting_fee NUMERIC := 50; -- Fixed meeting fee
  v_setup_fee NUMERIC := 75; -- Fixed setup fee
  v_followup_fee NUMERIC := 25; -- Fixed follow-up fee
BEGIN
  -- Calculate drop servicing fee (5% of selling price minus automation cost)
  v_dropservicing_fee := (p_selling_price - p_automation_cost) * 0.05;
  
  -- Delete existing transactions for this order
  DELETE FROM order_transactions WHERE order_id = p_order_id;
  
  -- Insert automation cost
  INSERT INTO order_transactions (order_id, user_id, transaction_type, amount, description)
  VALUES (p_order_id, p_user_id, 'automation_cost', -p_automation_cost, 'Automation cost');
  
  -- Insert meeting fee
  INSERT INTO order_transactions (order_id, user_id, transaction_type, amount, description)
  VALUES (p_order_id, p_user_id, 'meeting_fee', -v_meeting_fee, 'Meeting coordination fee');
  
  -- Insert setup fee
  INSERT INTO order_transactions (order_id, user_id, transaction_type, amount, description)
  VALUES (p_order_id, p_user_id, 'setup_fee', -v_setup_fee, 'Setup and configuration fee');
  
  -- Insert follow-up fee
  INSERT INTO order_transactions (order_id, user_id, transaction_type, amount, description)
  VALUES (p_order_id, p_user_id, 'followup_fee', -v_followup_fee, 'Follow-up and support fee');
  
  -- Insert drop servicing fee
  INSERT INTO order_transactions (order_id, user_id, transaction_type, amount, description)
  VALUES (p_order_id, p_user_id, 'dropservicing_fee', -v_dropservicing_fee, 'LetUsDefy service fee (5%)');
  
  -- Insert expected payment (what user will receive)
  INSERT INTO order_transactions (order_id, user_id, transaction_type, amount, description, due_date)
  VALUES (p_order_id, p_user_id, 'payment', 
    p_selling_price - p_automation_cost - v_meeting_fee - v_setup_fee - v_followup_fee - v_dropservicing_fee,
    'Client payment (your earnings)', 
    CURRENT_DATE + INTERVAL '2 days'
  );
  
  RETURN TRUE;
END;
$$;

-- Create function to update transaction statuses based on order status
CREATE OR REPLACE FUNCTION public.update_order_transaction_statuses(
  p_order_id UUID,
  p_order_status TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- When meeting is successful, complete meeting fee
  IF p_order_status = 'meeting_completed' THEN
    UPDATE order_transactions 
    SET status = 'completed', completed_at = now()
    WHERE order_id = p_order_id AND transaction_type = 'meeting_fee';
    
    UPDATE order_transactions 
    SET status = 'completed', completed_at = now()
    WHERE order_id = p_order_id AND transaction_type = 'setup_fee';
  END IF;
  
  -- When order is completed, complete all fees and mark payment as ready
  IF p_order_status = 'order_completed_successfully' THEN
    UPDATE order_transactions 
    SET status = 'completed', completed_at = now()
    WHERE order_id = p_order_id AND transaction_type IN ('automation_cost', 'followup_fee', 'dropservicing_fee');
    
    -- Set payment due date to 2 days from now
    UPDATE order_transactions 
    SET due_date = CURRENT_DATE + INTERVAL '2 days'
    WHERE order_id = p_order_id AND transaction_type = 'payment';
  END IF;
  
  -- When payment is completed, complete the payment transaction
  IF p_order_status = 'payment_completed' THEN
    UPDATE order_transactions 
    SET status = 'completed', completed_at = now()
    WHERE order_id = p_order_id AND transaction_type = 'payment';
  END IF;
  
  RETURN TRUE;
END;
$$;