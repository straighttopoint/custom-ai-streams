-- Fix the order transaction status update logic
DROP TRIGGER IF EXISTS trigger_order_status_update ON orders;
DROP TRIGGER IF EXISTS update_transaction_status_on_order_update ON orders;

-- Update the function to handle the correct logic
CREATE OR REPLACE FUNCTION public.update_order_transaction_statuses(p_order_id uuid, p_order_status text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_user_id UUID;
  v_transaction RECORD;
BEGIN
  -- Get user_id for this order
  SELECT user_id INTO v_user_id FROM orders WHERE id = p_order_id;
  
  -- When meeting is successful, complete meeting fee
  IF p_order_status = 'meeting_successful' THEN
    UPDATE order_transactions 
    SET status = 'completed', completed_at = now()
    WHERE order_id = p_order_id AND transaction_type = 'meeting_fee' AND status = 'pending';
    
    -- Process meeting fee deduction
    FOR v_transaction IN 
      SELECT * FROM order_transactions 
      WHERE order_id = p_order_id 
      AND transaction_type = 'meeting_fee'
      AND status = 'completed'
    LOOP
      -- Only insert if this transaction hasn't been processed yet
      IF NOT EXISTS (
        SELECT 1 FROM transactions 
        WHERE order_id = p_order_id 
        AND description = v_transaction.description 
        AND amount = v_transaction.amount
      ) THEN
        INSERT INTO transactions (user_id, type, amount, description, status, order_id)
        VALUES (v_user_id, 'fee', v_transaction.amount, v_transaction.description, 'completed', p_order_id);
        
        UPDATE wallets 
        SET balance = balance + v_transaction.amount, updated_at = now()
        WHERE user_id = v_user_id;
      END IF;
    END LOOP;
    
  -- When setup is successful, complete setup fee  
  ELSIF p_order_status = 'setup_successful' THEN
    UPDATE order_transactions 
    SET status = 'completed', completed_at = now()
    WHERE order_id = p_order_id AND transaction_type = 'setup_fee' AND status = 'pending';
    
    -- Process setup fee deduction
    FOR v_transaction IN 
      SELECT * FROM order_transactions 
      WHERE order_id = p_order_id 
      AND transaction_type = 'setup_fee'
      AND status = 'completed'
    LOOP
      -- Only insert if this transaction hasn't been processed yet
      IF NOT EXISTS (
        SELECT 1 FROM transactions 
        WHERE order_id = p_order_id 
        AND description = v_transaction.description 
        AND amount = v_transaction.amount
      ) THEN
        INSERT INTO transactions (user_id, type, amount, description, status, order_id)
        VALUES (v_user_id, 'fee', v_transaction.amount, v_transaction.description, 'completed', p_order_id);
        
        UPDATE wallets 
        SET balance = balance + v_transaction.amount, updated_at = now()
        WHERE user_id = v_user_id;
      END IF;
    END LOOP;
    
  -- When client pays, complete all fees
  ELSIF p_order_status = 'client_paid' THEN
    UPDATE order_transactions 
    SET status = 'completed', completed_at = now()
    WHERE order_id = p_order_id 
    AND transaction_type IN ('meeting_fee', 'setup_fee', 'automation_cost', 'followup_fee', 'dropservicing_fee')
    AND status = 'pending';
    
    -- Set payment due date to 2 days from now
    UPDATE order_transactions 
    SET due_date = CURRENT_DATE + INTERVAL '2 days'
    WHERE order_id = p_order_id AND transaction_type = 'payment';
    
    -- Process all fee deductions
    FOR v_transaction IN 
      SELECT * FROM order_transactions 
      WHERE order_id = p_order_id 
      AND transaction_type IN ('meeting_fee', 'setup_fee', 'automation_cost', 'followup_fee', 'dropservicing_fee')
      AND status = 'completed'
    LOOP
      -- Only insert if this transaction hasn't been processed yet
      IF NOT EXISTS (
        SELECT 1 FROM transactions 
        WHERE order_id = p_order_id 
        AND description = v_transaction.description 
        AND amount = v_transaction.amount
      ) THEN
        INSERT INTO transactions (user_id, type, amount, description, status, order_id)
        VALUES (v_user_id, 'fee', v_transaction.amount, v_transaction.description, 'completed', p_order_id);
        
        UPDATE wallets 
        SET balance = balance + v_transaction.amount, updated_at = now()
        WHERE user_id = v_user_id;
      END IF;
    END LOOP;
    
  -- When order is completed, complete payment and deposit earnings
  ELSIF p_order_status = 'order_completed' THEN
    -- Complete all remaining transactions
    UPDATE order_transactions 
    SET status = 'completed', completed_at = now()
    WHERE order_id = p_order_id AND status = 'pending';
    
    -- Process payment (earnings) to wallet
    FOR v_transaction IN 
      SELECT * FROM order_transactions 
      WHERE order_id = p_order_id 
      AND transaction_type = 'payment'
      AND status = 'completed'
    LOOP
      -- Only insert if this transaction hasn't been processed yet
      IF NOT EXISTS (
        SELECT 1 FROM transactions 
        WHERE order_id = p_order_id 
        AND description = v_transaction.description 
        AND amount = v_transaction.amount
        AND type = 'deposit'
      ) THEN
        INSERT INTO transactions (user_id, type, amount, description, status, order_id)
        VALUES (v_user_id, 'deposit', v_transaction.amount, v_transaction.description, 'completed', p_order_id);
        
        UPDATE wallets 
        SET balance = balance + v_transaction.amount,
            available_for_withdrawal = available_for_withdrawal + v_transaction.amount,
            total_earned = total_earned + v_transaction.amount,
            updated_at = now()
        WHERE user_id = v_user_id;
      END IF;
    END LOOP;
    
    -- Process any remaining fees that weren't processed yet
    FOR v_transaction IN 
      SELECT * FROM order_transactions 
      WHERE order_id = p_order_id 
      AND transaction_type IN ('meeting_fee', 'setup_fee', 'automation_cost', 'followup_fee', 'dropservicing_fee')
      AND status = 'completed'
    LOOP
      -- Only insert if this transaction hasn't been processed yet
      IF NOT EXISTS (
        SELECT 1 FROM transactions 
        WHERE order_id = p_order_id 
        AND description = v_transaction.description 
        AND amount = v_transaction.amount
        AND type = 'fee'
      ) THEN
        INSERT INTO transactions (user_id, type, amount, description, status, order_id)
        VALUES (v_user_id, 'fee', v_transaction.amount, v_transaction.description, 'completed', p_order_id);
        
        UPDATE wallets 
        SET balance = balance + v_transaction.amount, updated_at = now()
        WHERE user_id = v_user_id;
      END IF;
    END LOOP;
  END IF;
  
  RETURN TRUE;
END;
$function$;

-- Recreate the trigger
CREATE TRIGGER trigger_order_status_update
  AFTER UPDATE ON orders
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION trigger_order_status_update();