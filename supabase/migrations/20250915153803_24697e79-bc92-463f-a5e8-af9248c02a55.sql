-- Allow users to insert their own transactions for deposits and withdrawals
CREATE POLICY "Users can create their own transactions" ON public.transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Update the transactions table to ensure users can create transactions