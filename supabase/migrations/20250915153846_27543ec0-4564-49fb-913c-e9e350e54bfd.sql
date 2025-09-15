-- Create a function to handle deposits and update wallet properly
CREATE OR REPLACE FUNCTION public.handle_deposit(
  p_user_id UUID,
  p_amount NUMERIC,
  p_description TEXT DEFAULT 'Deposit'
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_wallet_id UUID;
BEGIN
  -- Get or create wallet
  SELECT id INTO v_wallet_id 
  FROM wallets 
  WHERE user_id = p_user_id;
  
  IF v_wallet_id IS NULL THEN
    INSERT INTO wallets (user_id) 
    VALUES (p_user_id)
    RETURNING id INTO v_wallet_id;
  END IF;
  
  -- Create transaction record
  INSERT INTO transactions (user_id, type, amount, description, status)
  VALUES (p_user_id, 'deposit', p_amount, p_description, 'completed');
  
  -- Update wallet balances
  UPDATE wallets 
  SET 
    balance = balance + p_amount,
    available_for_withdrawal = available_for_withdrawal + p_amount,
    total_earned = total_earned + p_amount,
    updated_at = NOW()
  WHERE user_id = p_user_id;
  
  RETURN TRUE;
END;
$$;

-- Create a function to handle withdrawals
CREATE OR REPLACE FUNCTION public.handle_withdrawal(
  p_user_id UUID,
  p_amount NUMERIC,
  p_description TEXT DEFAULT 'Withdrawal'
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_available NUMERIC;
BEGIN
  -- Check available balance
  SELECT available_for_withdrawal INTO v_available
  FROM wallets 
  WHERE user_id = p_user_id;
  
  IF v_available IS NULL OR v_available < p_amount THEN
    RAISE EXCEPTION 'Insufficient funds available for withdrawal';
  END IF;
  
  -- Create transaction record
  INSERT INTO transactions (user_id, type, amount, description, status)
  VALUES (p_user_id, 'withdrawal', -p_amount, p_description, 'pending');
  
  -- Update wallet balances
  UPDATE wallets 
  SET 
    available_for_withdrawal = available_for_withdrawal - p_amount,
    total_withdrawn = total_withdrawn + p_amount,
    updated_at = NOW()
  WHERE user_id = p_user_id;
  
  RETURN TRUE;
END;
$$;