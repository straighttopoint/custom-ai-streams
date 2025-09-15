import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, DollarSign } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export default function Withdraw() {
  const [amount, setAmount] = useState("");
  const [wallet, setWallet] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchWallet();
    }
  }, [user]);

  const fetchWallet = async () => {
    try {
      const { data, error } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error) throw error;
      setWallet(data);
    } catch (error) {
      console.error('Error fetching wallet:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (parseFloat(amount) > wallet.available_for_withdrawal) {
      toast.error("Insufficient funds available for withdrawal");
      return;
    }

    if (parseFloat(amount) < 10) {
      toast.error("Minimum withdrawal amount is $10.00");
      return;
    }

    try {
      const withdrawAmount = parseFloat(amount);
      
      // Create withdrawal transaction
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
          user_id: user?.id,
          type: 'withdrawal',
          amount: -withdrawAmount,
          description: `Withdrawal request of $${amount}`,
          status: 'pending'
        });

      if (transactionError) throw transactionError;

      // Update wallet - move money from available_for_withdrawal to pending
      const { error: walletError } = await supabase
        .from('wallets')
        .update({
          available_for_withdrawal: wallet.available_for_withdrawal - withdrawAmount,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user?.id);

      if (walletError) throw walletError;

      toast.success("Withdrawal request submitted successfully");
      setAmount("");
      fetchWallet();
    } catch (error) {
      console.error('Error processing withdrawal:', error);
      toast.error("Failed to process withdrawal");
    }
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="mb-6">
        <h2 className="text-xl font-semibold">Withdraw Funds</h2>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Available Balance
            </CardTitle>
            <CardDescription>
              Funds available for withdrawal from completed orders
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-success">
              ${wallet?.available_for_withdrawal?.toFixed(2) || '0.00'}
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Total earned: ${wallet?.total_earned?.toFixed(2) || '0.00'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Withdrawal Request</CardTitle>
            <CardDescription>
              Enter the amount you want to withdraw
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount ($)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                max={wallet?.available_for_withdrawal || 0}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
              />
            </div>
            
            <div className="bg-muted p-4 rounded-lg">
              <h4 className="font-medium mb-2">Withdrawal Information</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Withdrawals are processed within 3-5 business days</li>
                <li>• Minimum withdrawal amount: $10.00</li>
                <li>• You can only withdraw profits from completed orders</li>
                <li>• A 2.5% processing fee applies to all withdrawals</li>
              </ul>
            </div>

            <Button 
              onClick={handleWithdraw} 
              className="w-full"
              disabled={!amount || parseFloat(amount) < 10}
            >
              Request Withdrawal
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}