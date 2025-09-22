-- Add foreign key constraints to properly link user_id columns to auth.users

-- Add foreign key constraint for orders table
ALTER TABLE public.orders 
ADD CONSTRAINT fk_orders_user_id 
FOREIGN KEY (user_id) 
REFERENCES auth.users(id) 
ON DELETE CASCADE;

-- Add foreign key constraint for profiles table (if not already exists)
ALTER TABLE public.profiles 
ADD CONSTRAINT fk_profiles_user_id 
FOREIGN KEY (user_id) 
REFERENCES auth.users(id) 
ON DELETE CASCADE;

-- Add foreign key constraint for support_tickets table
ALTER TABLE public.support_tickets 
ADD CONSTRAINT fk_support_tickets_user_id 
FOREIGN KEY (user_id) 
REFERENCES auth.users(id) 
ON DELETE CASCADE;

-- Add foreign key constraint for custom_requests table
ALTER TABLE public.custom_requests 
ADD CONSTRAINT fk_custom_requests_user_id 
FOREIGN KEY (user_id) 
REFERENCES auth.users(id) 
ON DELETE CASCADE;

-- Add foreign key constraint for transactions table
ALTER TABLE public.transactions 
ADD CONSTRAINT fk_transactions_user_id 
FOREIGN KEY (user_id) 
REFERENCES auth.users(id) 
ON DELETE CASCADE;

-- Add foreign key constraint for wallets table
ALTER TABLE public.wallets 
ADD CONSTRAINT fk_wallets_user_id 
FOREIGN KEY (user_id) 
REFERENCES auth.users(id) 
ON DELETE CASCADE;

-- Add foreign key constraint for user_automations table
ALTER TABLE public.user_automations 
ADD CONSTRAINT fk_user_automations_user_id 
FOREIGN KEY (user_id) 
REFERENCES auth.users(id) 
ON DELETE CASCADE;

-- Add foreign key constraint for order_transactions table
ALTER TABLE public.order_transactions 
ADD CONSTRAINT fk_order_transactions_user_id 
FOREIGN KEY (user_id) 
REFERENCES auth.users(id) 
ON DELETE CASCADE;

-- Add foreign key constraint for support_messages table (user_id can be null for admin messages)
ALTER TABLE public.support_messages 
ADD CONSTRAINT fk_support_messages_user_id 
FOREIGN KEY (user_id) 
REFERENCES auth.users(id) 
ON DELETE CASCADE;