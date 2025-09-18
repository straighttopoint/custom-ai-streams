-- Create function to update transaction statuses based on order status
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
$$ LANGUAGE plpgsql;

-- Create trigger on orders table
DROP TRIGGER IF EXISTS trigger_update_transaction_status ON orders;
CREATE TRIGGER trigger_update_transaction_status
  AFTER UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_transaction_status_on_order_update();