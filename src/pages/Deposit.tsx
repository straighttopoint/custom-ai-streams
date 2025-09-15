import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  CreditCard, 
  Wallet, 
  Shield,
  DollarSign,
  Clock,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface PaymentMethod {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  fees: string;
  processingTime: string;
  minAmount: number;
  maxAmount: number;
}

const paymentMethods: PaymentMethod[] = [
  {
    id: "credit_card",
    name: "Credit/Debit Card",
    description: "Visa, Mastercard, American Express",
    icon: CreditCard,
    fees: "2.9% + $0.30",
    processingTime: "Instant",
    minAmount: 5,
    maxAmount: 5000
  },
  {
    id: "paypal",
    name: "PayPal",
    description: "Pay with your PayPal account",
    icon: Wallet,
    fees: "3.49% + $0.49",
    processingTime: "Instant",
    minAmount: 5,
    maxAmount: 10000
  },
  {
    id: "bank_transfer",
    name: "Bank Transfer",
    description: "Direct bank transfer (ACH)",
    icon: DollarSign,
    fees: "$1.00 flat fee",
    processingTime: "1-3 business days",
    minAmount: 25,
    maxAmount: 25000
  }
];

export default function Deposit() {
  const [amount, setAmount] = useState("");
  const [selectedMethod, setSelectedMethod] = useState("credit_card");
  const [wallet, setWallet] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
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
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (!data) {
        // Create wallet if it doesn't exist
        const { data: newWallet, error: createError } = await supabase
          .from('wallets')
          .insert({ user_id: user?.id })
          .select()
          .single();
        
        if (!createError) {
          setWallet(newWallet);
        }
      } else {
        setWallet(data);
      }
    } catch (error) {
      console.error('Error fetching wallet:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectedPaymentMethod = paymentMethods.find(method => method.id === selectedMethod);

  const calculateFees = () => {
    if (!amount || !selectedPaymentMethod) return 0;
    
    const depositAmount = parseFloat(amount);
    
    switch (selectedMethod) {
      case "credit_card":
        return depositAmount * 0.029 + 0.30;
      case "paypal":
        return depositAmount * 0.0349 + 0.49;
      case "bank_transfer":
        return 1.00;
      default:
        return 0;
    }
  };

  const getTotalAmount = () => {
    if (!amount) return 0;
    return parseFloat(amount) + calculateFees();
  };

  const validateAmount = () => {
    if (!amount || !selectedPaymentMethod) return false;
    
    const depositAmount = parseFloat(amount);
    return depositAmount >= selectedPaymentMethod.minAmount && 
           depositAmount <= selectedPaymentMethod.maxAmount;
  };

  const handleDeposit = async () => {
    if (!validateAmount()) {
      toast.error(`Amount must be between $${selectedPaymentMethod?.minAmount} and $${selectedPaymentMethod?.maxAmount}`);
      return;
    }

    setProcessing(true);

    try {
      // Create deposit transaction
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
          user_id: user?.id,
          type: 'deposit',
          amount: parseFloat(amount),
          description: `Deposit via ${selectedPaymentMethod?.name} - $${amount}`,
          status: 'completed'
        });

      if (transactionError) throw transactionError;

      // Update wallet balance
      const { error: walletError } = await supabase
        .from('wallets')
        .update({ 
          balance: (wallet?.balance || 0) + parseFloat(amount),
          total_earned: (wallet?.total_earned || 0) + parseFloat(amount)
        })
        .eq('user_id', user?.id);

      if (walletError) throw walletError;

      toast.success(`Successfully deposited $${amount} to your account!`);
      setAmount("");
      fetchWallet();
    } catch (error) {
      console.error('Error processing deposit:', error);
      toast.error("Failed to process deposit. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" onClick={() => navigate('/dashboard')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Add Funds</h1>
          <p className="text-muted-foreground">Deposit money to your account</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Current Balance */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5" />
                Current Balance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-success mb-2">
                ${wallet?.balance?.toFixed(2) || '0.00'}
              </div>
              <p className="text-sm text-muted-foreground">Available for orders</p>
            </CardContent>
          </Card>

          {/* Security Notice */}
          <Card className="mt-4">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-success mt-0.5" />
                <div>
                  <h4 className="font-medium text-sm">Secure Payments</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    Your payment information is encrypted and secure. We never store your card details.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Deposit Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Deposit Funds</CardTitle>
              <CardDescription>
                Choose your payment method and enter the amount you'd like to deposit
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Payment Methods */}
              <div>
                <Label className="text-base font-medium">Payment Method</Label>
                <RadioGroup 
                  value={selectedMethod} 
                  onValueChange={setSelectedMethod}
                  className="mt-3"
                >
                  {paymentMethods.map((method) => {
                    const Icon = method.icon;
                    return (
                      <div key={method.id} className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-accent/50 cursor-pointer">
                        <RadioGroupItem value={method.id} id={method.id} className="mt-1" />
                        <div className="flex-1">
                          <Label htmlFor={method.id} className="cursor-pointer">
                            <div className="flex items-center gap-3 mb-2">
                              <Icon className="h-5 w-5" />
                              <span className="font-medium">{method.name}</span>
                              <Badge variant="secondary" className="text-xs">
                                <Clock className="h-3 w-3 mr-1" />
                                {method.processingTime}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-1">{method.description}</p>
                            <p className="text-xs text-muted-foreground">
                              Fee: {method.fees} • Min: ${method.minAmount} • Max: ${method.maxAmount.toLocaleString()}
                            </p>
                          </Label>
                        </div>
                      </div>
                    );
                  })}
                </RadioGroup>
              </div>

              <Separator />

              {/* Amount Input */}
              <div>
                <Label htmlFor="amount" className="text-base font-medium">
                  Deposit Amount
                </Label>
                <div className="mt-2 space-y-3">
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      min={selectedPaymentMethod?.minAmount || 5}
                      max={selectedPaymentMethod?.maxAmount || 5000}
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      className="pl-10 text-lg"
                    />
                  </div>

                  {/* Quick Amount Buttons */}
                  <div className="grid grid-cols-4 gap-2">
                    {[25, 50, 100, 250].map((preset) => (
                      <Button
                        key={preset}
                        variant="outline"
                        size="sm"
                        onClick={() => setAmount(preset.toString())}
                        disabled={preset < (selectedPaymentMethod?.minAmount || 5)}
                      >
                        ${preset}
                      </Button>
                    ))}
                  </div>

                  {/* Amount Validation */}
                  {amount && selectedPaymentMethod && (
                    <div className="flex items-center gap-2 text-sm">
                      {validateAmount() ? (
                        <div className="flex items-center gap-2 text-success">
                          <CheckCircle2 className="h-4 w-4" />
                          Valid amount
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-destructive">
                          <AlertCircle className="h-4 w-4" />
                          Amount must be between ${selectedPaymentMethod.minAmount} and ${selectedPaymentMethod.maxAmount.toLocaleString()}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Fee Breakdown */}
              {amount && validateAmount() && (
                <Card className="bg-muted/50">
                  <CardContent className="pt-4">
                    <h4 className="font-medium mb-3">Payment Summary</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Deposit amount:</span>
                        <span>${parseFloat(amount).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-muted-foreground">
                        <span>Processing fee:</span>
                        <span>${calculateFees().toFixed(2)}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between font-medium">
                        <span>Total charge:</span>
                        <span>${getTotalAmount().toFixed(2)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Deposit Button */}
              <Button 
                onClick={handleDeposit}
                className="w-full"
                disabled={!validateAmount() || processing}
                size="lg"
              >
                {processing ? (
                  "Processing..."
                ) : (
                  <>
                    <CreditCard className="h-4 w-4 mr-2" />
                    Deposit ${amount || '0.00'}
                  </>
                )}
              </Button>

              <div className="text-center">
                <p className="text-xs text-muted-foreground">
                  By clicking "Deposit", you agree to our terms of service and privacy policy.
                  <br />
                  <strong>Note:</strong> This is a demo interface. Payment integration coming soon.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}