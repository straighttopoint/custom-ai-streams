-- Since the order status is order_completed, we need to trigger the transaction completion
-- First check if transactions have been properly created
SELECT 
  ot.transaction_type, 
  ot.status, 
  ot.amount, 
  ot.description,
  t.id as transaction_id,
  t.status as wallet_transaction_status
FROM order_transactions ot
LEFT JOIN transactions t ON t.order_id = ot.order_id AND t.description = ot.description
WHERE ot.order_id = '0a11fdaa-7bf8-45e1-825a-449db4fa3416'
ORDER BY ot.created_at;