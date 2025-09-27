-- First drop the problematic constraint that was added earlier
ALTER TABLE public.custom_requests 
DROP CONSTRAINT IF EXISTS custom_requests_status_check;

-- Remove budget-related fields if they still exist
ALTER TABLE public.custom_requests 
DROP COLUMN IF EXISTS budget_range,
DROP COLUMN IF EXISTS estimated_cost,
DROP COLUMN IF EXISTS estimated_delivery;

-- Update any existing status values to the new system
UPDATE public.custom_requests 
SET status = CASE 
  WHEN status IN ('completed', 'approved') THEN 'done'
  WHEN status IN ('rejected', 'cancelled') THEN 'rejected'
  ELSE 'pending'
END;