-- Fix the transaction logic to prevent duplicates and only create transactions on specific status changes
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
  
  -- Meeting successful: Only complete meeting fee and create its transaction
  IF p_order_status = 'meeting_successful' THEN
    -- Update meeting fee status in order_transactions
    UPDATE order_transactions 
    SET status = 'completed', completed_at = now()
    WHERE order_id = p_order_id AND transaction_type = 'meeting_fee' AND status = 'pending';
    
    -- Create transaction only if it doesn't exist
    IF NOT EXISTS (
      SELECT 1 FROM transactions 
      WHERE order_id = p_order_id AND transaction_type = 'meeting_fee'
    ) THEN
      SELECT * INTO v_transaction FROM order_transactions 
      WHERE order_id = p_order_id AND transaction_type = 'meeting_fee' AND status = 'completed'
      LIMIT 1;
      
      IF FOUND THEN
        INSERT INTO transactions (user_id, type, amount, description, status, order_id, transaction_type)
        VALUES (v_user_id, 'fee', v_transaction.amount, v_transaction.description, 'completed', p_order_id, 'meeting_fee');
        
        UPDATE wallets 
        SET balance = balance + v_transaction.amount, updated_at = now()
        WHERE user_id = v_user_id;
      END IF;
    END IF;
    
  -- Setup successful: Only complete setup fee and create its transaction
  ELSIF p_order_status = 'setup_successful' THEN
    -- Update setup fee status in order_transactions
    UPDATE order_transactions 
    SET status = 'completed', completed_at = now()
    WHERE order_id = p_order_id AND transaction_type = 'setup_fee' AND status = 'pending';
    
    -- Create transaction only if it doesn't exist
    IF NOT EXISTS (
      SELECT 1 FROM transactions 
      WHERE order_id = p_order_id AND transaction_type = 'setup_fee'
    ) THEN
      SELECT * INTO v_transaction FROM order_transactions 
      WHERE order_id = p_order_id AND transaction_type = 'setup_fee' AND status = 'completed'
      LIMIT 1;
      
      IF FOUND THEN
        INSERT INTO transactions (user_id, type, amount, description, status, order_id, transaction_type)
        VALUES (v_user_id, 'fee', v_transaction.amount, v_transaction.description, 'completed', p_order_id, 'setup_fee');
        
        UPDATE wallets 
        SET balance = balance + v_transaction.amount, updated_at = now()
        WHERE user_id = v_user_id;
      END IF;
    END IF;
    
  -- Client paid: Complete remaining fees and create their transactions
  ELSIF p_order_status = 'client_paid' THEN
    -- Update remaining fee statuses in order_transactions
    UPDATE order_transactions 
    SET status = 'completed', completed_at = now()
    WHERE order_id = p_order_id 
    AND transaction_type IN ('automation_cost', 'followup_fee', 'dropservicing_fee')
    AND status = 'pending';
    
    -- Set payment due date
    UPDATE order_transactions 
    SET due_date = CURRENT_DATE + INTERVAL '2 days'
    WHERE order_id = p_order_id AND transaction_type = 'payment';
    
    -- Create transactions for each remaining fee type (only if they don't exist)
    FOR v_transaction IN 
      SELECT * FROM order_transactions 
      WHERE order_id = p_order_id 
      AND transaction_type IN ('automation_cost', 'followup_fee', 'dropservicing_fee')
      AND status = 'completed'
      ORDER BY transaction_type
    LOOP
      IF NOT EXISTS (
        SELECT 1 FROM transactions 
        WHERE order_id = p_order_id AND transaction_type = v_transaction.transaction_type
      ) THEN
        INSERT INTO transactions (user_id, type, amount, description, status, order_id, transaction_type)
        VALUES (v_user_id, 'fee', v_transaction.amount, v_transaction.description, 'completed', p_order_id, v_transaction.transaction_type);
        
        UPDATE wallets 
        SET balance = balance + v_transaction.amount, updated_at = now()
        WHERE user_id = v_user_id;
      END IF;
    END LOOP;
    
  -- Order completed: Complete payment and deposit earnings
  ELSIF p_order_status = 'order_completed' THEN
    -- Complete payment transaction in order_transactions
    UPDATE order_transactions 
    SET status = 'completed', completed_at = now()
    WHERE order_id = p_order_id AND transaction_type = 'payment' AND status = 'pending';
    
    -- Create payment transaction (earnings) only if it doesn't exist
    IF NOT EXISTS (
      SELECT 1 FROM transactions 
      WHERE order_id = p_order_id AND transaction_type = 'payment'
    ) THEN
      SELECT * INTO v_transaction FROM order_transactions 
      WHERE order_id = p_order_id AND transaction_type = 'payment' AND status = 'completed'
      LIMIT 1;
      
      IF FOUND THEN
        INSERT INTO transactions (user_id, type, amount, description, status, order_id, transaction_type)
        VALUES (v_user_id, 'deposit', v_transaction.amount, v_transaction.description, 'completed', p_order_id, 'payment');
        
        UPDATE wallets 
        SET balance = balance + v_transaction.amount,
            available_for_withdrawal = available_for_withdrawal + v_transaction.amount,
            total_earned = total_earned + v_transaction.amount,
            updated_at = now()
        WHERE user_id = v_user_id;
      END IF;
    END IF;
  END IF;
  
  RETURN TRUE;
END;
$function$;