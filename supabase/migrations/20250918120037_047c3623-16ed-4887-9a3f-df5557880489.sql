-- Enhanced order transaction status management with refund logic and automatic progression

CREATE OR REPLACE FUNCTION public.update_order_transaction_statuses(
  p_order_id UUID,
  p_order_status TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_transaction RECORD;
  v_refund_amount NUMERIC := 0;
BEGIN
  -- Get user_id for this order
  SELECT user_id INTO v_user_id FROM orders WHERE id = p_order_id;
  
  -- Handle Meeting Failed scenario - only meeting fee charged, others refunded
  IF p_order_status = 'meeting_failed' OR p_order_status = 'cancelled_meeting_failed' THEN
    -- Complete only the meeting fee
    UPDATE order_transactions 
    SET status = 'completed', completed_at = now()
    WHERE order_id = p_order_id AND transaction_type = 'meeting_fee';
    
    -- Cancel other fees and mark them for refund
    UPDATE order_transactions 
    SET status = 'cancelled', completed_at = now()
    WHERE order_id = p_order_id AND transaction_type IN ('setup_fee', 'automation_cost', 'followup_fee', 'dropservicing_fee');
    
    -- Process meeting fee deduction
    FOR v_transaction IN 
      SELECT * FROM order_transactions 
      WHERE order_id = p_order_id 
      AND transaction_type = 'meeting_fee'
      AND status = 'completed'
    LOOP
      INSERT INTO transactions (user_id, type, amount, description, status, order_id)
      VALUES (v_user_id, 'fee_deduction', v_transaction.amount, v_transaction.description, 'completed', p_order_id);
      
      UPDATE wallets 
      SET balance = balance + v_transaction.amount, updated_at = now()
      WHERE user_id = v_user_id;
    END LOOP;
    
  -- Handle Setup Failed scenario - meeting fee and setup fee charged, others refunded  
  ELSIF p_order_status = 'setup_failed' OR p_order_status = 'cancelled_setup_failed' THEN
    -- Complete meeting and setup fees
    UPDATE order_transactions 
    SET status = 'completed', completed_at = now()
    WHERE order_id = p_order_id AND transaction_type IN ('meeting_fee', 'setup_fee');
    
    -- Cancel other fees
    UPDATE order_transactions 
    SET status = 'cancelled', completed_at = now()
    WHERE order_id = p_order_id AND transaction_type IN ('automation_cost', 'followup_fee', 'dropservicing_fee');
    
    -- Process fee deductions
    FOR v_transaction IN 
      SELECT * FROM order_transactions 
      WHERE order_id = p_order_id 
      AND transaction_type IN ('meeting_fee', 'setup_fee')
      AND status = 'completed'
    LOOP
      INSERT INTO transactions (user_id, type, amount, description, status, order_id)
      VALUES (v_user_id, 'fee_deduction', v_transaction.amount, v_transaction.description, 'completed', p_order_id);
      
      UPDATE wallets 
      SET balance = balance + v_transaction.amount, updated_at = now()
      WHERE user_id = v_user_id;
    END LOOP;
    
  -- When meeting is successful, complete meeting fee and setup fee
  ELSIF p_order_status = 'meeting_completed' THEN
    UPDATE order_transactions 
    SET status = 'completed', completed_at = now()
    WHERE order_id = p_order_id AND transaction_type IN ('meeting_fee', 'setup_fee');
    
    FOR v_transaction IN 
      SELECT * FROM order_transactions 
      WHERE order_id = p_order_id 
      AND transaction_type IN ('meeting_fee', 'setup_fee')
      AND status = 'completed'
    LOOP
      INSERT INTO transactions (user_id, type, amount, description, status, order_id)
      VALUES (v_user_id, 'fee_deduction', v_transaction.amount, v_transaction.description, 'completed', p_order_id);
      
      UPDATE wallets 
      SET balance = balance + v_transaction.amount, updated_at = now()
      WHERE user_id = v_user_id;
    END LOOP;
    
  -- When order is completed, complete all remaining fees
  ELSIF p_order_status = 'order_completed_successfully' THEN
    UPDATE order_transactions 
    SET status = 'completed', completed_at = now()
    WHERE order_id = p_order_id AND transaction_type IN ('automation_cost', 'followup_fee', 'dropservicing_fee');
    
    -- Set payment due date to 2 days from now
    UPDATE order_transactions 
    SET due_date = CURRENT_DATE + INTERVAL '2 days'
    WHERE order_id = p_order_id AND transaction_type = 'payment';
    
    FOR v_transaction IN 
      SELECT * FROM order_transactions 
      WHERE order_id = p_order_id 
      AND transaction_type IN ('automation_cost', 'followup_fee', 'dropservicing_fee')
      AND status = 'completed'
    LOOP
      INSERT INTO transactions (user_id, type, amount, description, status, order_id)
      VALUES (v_user_id, 'fee_deduction', v_transaction.amount, v_transaction.description, 'completed', p_order_id);
      
      UPDATE wallets 
      SET balance = balance + v_transaction.amount, updated_at = now()
      WHERE user_id = v_user_id;
    END LOOP;
    
  -- When client pays, set automatic completion for 2 days later
  ELSIF p_order_status = 'client_paid' THEN
    -- Update payment transaction to show it's received
    UPDATE order_transactions 
    SET due_date = CURRENT_DATE + INTERVAL '2 days'
    WHERE order_id = p_order_id AND transaction_type = 'payment';
    
    -- Update order to auto-complete in 2 days
    UPDATE orders 
    SET estimated_completion_date = CURRENT_DATE + INTERVAL '2 days'
    WHERE id = p_order_id;
    
  -- When payment is completed (after 2 days or manual), complete the payment transaction
  ELSIF p_order_status = 'order_completed' OR p_order_status = 'payment_completed' THEN
    UPDATE order_transactions 
    SET status = 'completed', completed_at = now()
    WHERE order_id = p_order_id AND transaction_type = 'payment';
    
    FOR v_transaction IN 
      SELECT * FROM order_transactions 
      WHERE order_id = p_order_id 
      AND transaction_type = 'payment'
      AND status = 'completed'
    LOOP
      INSERT INTO transactions (user_id, type, amount, description, status, order_id)
      VALUES (v_user_id, 'order_payment', v_transaction.amount, v_transaction.description, 'completed', p_order_id);
      
      UPDATE wallets 
      SET balance = balance + v_transaction.amount,
          available_for_withdrawal = available_for_withdrawal + v_transaction.amount,
          total_earned = total_earned + v_transaction.amount,
          updated_at = now()
      WHERE user_id = v_user_id;
    END LOOP;
  END IF;
  
  RETURN TRUE;
END;
$$;

-- Function to automatically progress orders from client_paid to order_completed after 2 days
CREATE OR REPLACE FUNCTION public.process_automatic_order_completion()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order RECORD;
  v_completed_count INTEGER := 0;
BEGIN
  -- Find orders that are client_paid and past their estimated completion date
  FOR v_order IN 
    SELECT id, user_id
    FROM orders 
    WHERE status = 'client_paid' 
    AND estimated_completion_date IS NOT NULL 
    AND estimated_completion_date <= CURRENT_DATE
  LOOP
    -- Update order status to completed
    UPDATE orders 
    SET status = 'order_completed', 
        actual_completion_date = CURRENT_DATE,
        updated_at = now()
    WHERE id = v_order.id;
    
    -- Process payment completion
    PERFORM update_order_transaction_statuses(v_order.id, 'order_completed');
    
    v_completed_count := v_completed_count + 1;
  END LOOP;
  
  RETURN v_completed_count;
END;
$$;

-- Create a trigger to automatically call the status update function when order status changes
CREATE OR REPLACE FUNCTION public.trigger_order_status_update()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Only trigger if status actually changed
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    PERFORM update_order_transaction_statuses(NEW.id, NEW.status);
  END IF;
  
  RETURN NEW;
END;
$$;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS order_status_change_trigger ON orders;

-- Create the trigger
CREATE TRIGGER order_status_change_trigger
  AFTER UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION trigger_order_status_update();