import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, CreditCard, DollarSign } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export default function Deposit() {
  const [amount, setAmount] = useState("");
  const [wallet, setWallet] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
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

  const handleDeposit = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (parseFloat(amount) < 5) {
      toast.error("Minimum deposit amount is $5.00");
      return;
    }

    try {
      // For now, this is static - in the future, integrate with payment processor
      toast.info("Payment integration coming soon! This is a demo.");
      
      // Create deposit transaction (demo)
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
          user_id: user?.id,
          type: 'deposit',
          amount: parseFloat(amount),
          description: `Deposit of $${amount}`,
          status: 'completed'
        });

      if (transactionError) throw transactionError;

      toast.success("Deposit completed successfully");
      setAmount("");
      fetchWallet();
    } catch (error) {
      console.error('Error processing deposit:', error);
      toast.error("Failed to process deposit");
    }
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" onClick={() => navigate('/dashboard')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">Add Funds</h1>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Current Balance
            </CardTitle>
            <CardDescription>
              Your account balance for placing orders
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-success">
              ${wallet?.balance?.toFixed(2) || '0.00'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Add Funds</CardTitle>
            <CardDescription>
              Add money to your account to place automation orders
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount ($)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="5"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
              />
            </div>

            <div className="grid grid-cols-4 gap-2">
              {[25, 50, 100, 250].map((preset) => (
                <Button
                  key={preset}
                  variant="outline"
                  size="sm"
                  onClick={() => setAmount(preset.toString())}
                >
                  ${preset}
                </Button>
              ))}
            </div>
            
            <div className="bg-muted p-4 rounded-lg">
              <h4 className="font-medium mb-2">Payment Information</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Secure payment processing with industry standard encryption</li>
                <li>• Minimum deposit amount: $5.00</li>
                <li>• Funds are available immediately after successful payment</li>
                <li>• We accept all major credit cards and PayPal</li>
              </ul>
            </div>

            <Button 
              onClick={handleDeposit} 
              className="w-full"
              disabled={!amount || parseFloat(amount) < 5}
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Add Funds - ${amount || '0.00'}
            </Button>

            <p className="text-xs text-muted-foreground text-center">
              This is a demo interface. Payment integration will be added later.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}