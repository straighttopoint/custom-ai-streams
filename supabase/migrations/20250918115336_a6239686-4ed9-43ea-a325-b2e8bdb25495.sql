-- Update the generate_order_transactions function to also create wallet transactions
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

-- Update function to handle wallet transactions when order transactions are completed
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
BEGIN
  -- Get user_id for this order
  SELECT user_id INTO v_user_id FROM orders WHERE id = p_order_id;
  
  -- When meeting is successful, complete meeting fee and setup fee
  IF p_order_status = 'meeting_completed' THEN
    -- Update order transaction status
    UPDATE order_transactions 
    SET status = 'completed', completed_at = now()
    WHERE order_id = p_order_id AND transaction_type IN ('meeting_fee', 'setup_fee');
    
    -- Create wallet transactions and update balances
    FOR v_transaction IN 
      SELECT * FROM order_transactions 
      WHERE order_id = p_order_id 
      AND transaction_type IN ('meeting_fee', 'setup_fee')
      AND status = 'completed'
    LOOP
      -- Insert into main transactions table
      INSERT INTO transactions (user_id, type, amount, description, status, order_id)
      VALUES (v_user_id, 'fee_deduction', v_transaction.amount, v_transaction.description, 'completed', p_order_id);
      
      -- Update wallet balance (fees are negative amounts)
      UPDATE wallets 
      SET balance = balance + v_transaction.amount,
          updated_at = now()
      WHERE user_id = v_user_id;
    END LOOP;
  END IF;
  
  -- When order is completed, complete all remaining fees
  IF p_order_status = 'order_completed_successfully' THEN
    -- Update order transaction status
    UPDATE order_transactions 
    SET status = 'completed', completed_at = now()
    WHERE order_id = p_order_id AND transaction_type IN ('automation_cost', 'followup_fee', 'dropservicing_fee');
    
    -- Set payment due date to 2 days from now
    UPDATE order_transactions 
    SET due_date = CURRENT_DATE + INTERVAL '2 days'
    WHERE order_id = p_order_id AND transaction_type = 'payment';
    
    -- Create wallet transactions for completed fees
    FOR v_transaction IN 
      SELECT * FROM order_transactions 
      WHERE order_id = p_order_id 
      AND transaction_type IN ('automation_cost', 'followup_fee', 'dropservicing_fee')
      AND status = 'completed'
    LOOP
      -- Insert into main transactions table
      INSERT INTO transactions (user_id, type, amount, description, status, order_id)
      VALUES (v_user_id, 'fee_deduction', v_transaction.amount, v_transaction.description, 'completed', p_order_id);
      
      -- Update wallet balance (fees are negative amounts)
      UPDATE wallets 
      SET balance = balance + v_transaction.amount,
          updated_at = now()
      WHERE user_id = v_user_id;
    END LOOP;
  END IF;
  
  -- When payment is completed, complete the payment transaction
  IF p_order_status = 'payment_completed' THEN
    -- Update order transaction status
    UPDATE order_transactions 
    SET status = 'completed', completed_at = now()
    WHERE order_id = p_order_id AND transaction_type = 'payment';
    
    -- Create wallet transaction for payment
    FOR v_transaction IN 
      SELECT * FROM order_transactions 
      WHERE order_id = p_order_id 
      AND transaction_type = 'payment'
      AND status = 'completed'
    LOOP
      -- Insert into main transactions table
      INSERT INTO transactions (user_id, type, amount, description, status, order_id)
      VALUES (v_user_id, 'order_payment', v_transaction.amount, v_transaction.description, 'completed', p_order_id);
      
      -- Update wallet balance (payment is positive amount)
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