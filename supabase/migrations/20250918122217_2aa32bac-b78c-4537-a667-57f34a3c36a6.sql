-- Fix the transaction creation with correct types
-- Step 1: Complete all the fees since the order is completed
UPDATE order_transactions 
SET status = 'completed', completed_at = now()
WHERE order_id = '0a11fdaa-7bf8-45e1-825a-449db4fa3416' 
AND transaction_type IN ('meeting_fee', 'setup_fee', 'automation_cost', 'followup_fee', 'dropservicing_fee');

-- Step 2: Complete the payment transaction since the order is completed
UPDATE order_transactions 
SET status = 'completed', completed_at = now()
WHERE order_id = '0a11fdaa-7bf8-45e1-825a-449db4fa3416' 
AND transaction_type = 'payment';

-- Step 3: Create wallet transactions for all completed fees (using 'fee' type)
INSERT INTO transactions (user_id, type, amount, description, status, order_id)
SELECT 
  ot.user_id, 
  'fee', 
  ot.amount, 
  ot.description, 
  'completed', 
  ot.order_id
FROM order_transactions ot
WHERE ot.order_id = '0a11fdaa-7bf8-45e1-825a-449db4fa3416'
AND ot.transaction_type IN ('meeting_fee', 'setup_fee', 'automation_cost', 'followup_fee', 'dropservicing_fee')
AND ot.status = 'completed'
AND NOT EXISTS (
  SELECT 1 FROM transactions t 
  WHERE t.order_id = ot.order_id 
  AND t.description = ot.description
);

-- Step 4: Create wallet transaction for the payment (using 'payment' type)
INSERT INTO transactions (user_id, type, amount, description, status, order_id)
SELECT 
  ot.user_id, 
  'payment', 
  ot.amount, 
  ot.description, 
  'completed', 
  ot.order_id
FROM order_transactions ot
WHERE ot.order_id = '0a11fdaa-7bf8-45e1-825a-449db4fa3416'
AND ot.transaction_type = 'payment'
AND ot.status = 'completed'
AND NOT EXISTS (
  SELECT 1 FROM transactions t 
  WHERE t.order_id = ot.order_id 
  AND t.description = ot.description
);

-- Step 5: Update wallet balances
UPDATE wallets 
SET 
  balance = balance + (
    SELECT COALESCE(SUM(amount), 0) 
    FROM order_transactions 
    WHERE order_id = '0a11fdaa-7bf8-45e1-825a-449db4fa3416'
    AND status = 'completed'
  ),
  available_for_withdrawal = available_for_withdrawal + (
    SELECT COALESCE(SUM(amount), 0) 
    FROM order_transactions 
    WHERE order_id = '0a11fdaa-7bf8-45e1-825a-449db4fa3416'
    AND transaction_type = 'payment'
    AND status = 'completed'
  ),
  total_earned = total_earned + (
    SELECT COALESCE(SUM(amount), 0) 
    FROM order_transactions 
    WHERE order_id = '0a11fdaa-7bf8-45e1-825a-449db4fa3416'
    AND transaction_type = 'payment'
    AND status = 'completed'
  ),
  updated_at = now()
WHERE user_id = (
  SELECT user_id FROM orders WHERE id = '0a11fdaa-7bf8-45e1-825a-449db4fa3416'
);