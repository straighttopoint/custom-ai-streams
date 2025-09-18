-- Update the order status to trigger wallet transactions
UPDATE orders 
SET status = 'order_completed' 
WHERE id = '0a11fdaa-7bf8-45e1-825a-449db4fa3416' AND admin_notes = 'paid';