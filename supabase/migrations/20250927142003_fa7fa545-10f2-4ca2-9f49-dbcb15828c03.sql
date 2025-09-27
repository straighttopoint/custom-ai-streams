-- Add under_development to the allowed status values for custom_requests
ALTER TABLE custom_requests 
DROP CONSTRAINT IF EXISTS custom_requests_status_check;

ALTER TABLE custom_requests 
ADD CONSTRAINT custom_requests_status_check 
CHECK (status IN ('pending', 'under_development', 'done', 'rejected'));