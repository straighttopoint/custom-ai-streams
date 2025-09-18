-- Manually update the setup fee that got stuck as pending
UPDATE order_transactions 
SET status = 'completed', completed_at = now()
WHERE order_id = 'b37ea5b5-2e23-46d5-b13e-591a01a4409d' 
AND transaction_type = 'setup_fee' 
AND status = 'pending';

-- Also ensure the function properly handles all status transitions by calling it
SELECT update_order_transaction_statuses('b37ea5b5-2e23-46d5-b13e-591a01a4409d', 'order_completed');