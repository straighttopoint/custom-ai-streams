-- Fix security issues by setting search_path for functions
CREATE OR REPLACE FUNCTION update_transaction_status_on_order_update()
RETURNS TRIGGER AS $$
BEGIN
  -- When order status changes to meeting_successful, complete the meeting fee
  IF NEW.status = 'meeting_successful' AND OLD.status != 'meeting_successful' THEN
    UPDATE order_transactions 
    SET status = 'completed', completed_at = now()
    WHERE order_id = NEW.id 
    AND transaction_type = 'meeting_fee' 
    AND status = 'pending';
  END IF;

  -- When order status changes to setup_successful, complete the setup fee
  IF NEW.status = 'setup_successful' AND OLD.status != 'setup_successful' THEN
    UPDATE order_transactions 
    SET status = 'completed', completed_at = now()
    WHERE order_id = NEW.id 
    AND transaction_type = 'setup_fee' 
    AND status = 'pending';
  END IF;

  -- When order status changes to order_completed, complete all remaining fees
  IF NEW.status = 'order_completed' AND OLD.status != 'order_completed' THEN
    UPDATE order_transactions 
    SET status = 'completed', completed_at = now()
    WHERE order_id = NEW.id 
    AND transaction_type IN ('automation_cost', 'followup_fee', 'dropservicing_fee', 'payment')
    AND status = 'pending';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';

-- Fix search_path for trigger function
CREATE OR REPLACE FUNCTION public.trigger_order_status_update()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Only trigger if status actually changed
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    PERFORM update_order_transaction_statuses(NEW.id, NEW.status);
  END IF;
  
  RETURN NEW;
END;
$function$;