import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  CreditCard, 
  Wallet,
  DollarSign,
  Building2,
  ShieldCheck,
  Clock
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useWallet } from "@/hooks/useWallet";
import { toast } from "sonner";

interface PaymentMethod {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  fee: number;
  feeType: "percentage" | "fixed";
  processingTime: string;
  minAmount: number;
  maxAmount: number;
}

const paymentMethods: PaymentMethod[] = [
  {
    id: "credit_card",
    name: "Credit/Debit Card",
    description: "Instant deposit via Visa, Mastercard, or American Express",
    icon: CreditCard,
    fee: 2.9,
    feeType: "percentage",
    processingTime: "Instant",
    minAmount: 1,
    maxAmount: 50000,
  },
  {
    id: "paypal",
    name: "PayPal",
    description: "Secure payment through your PayPal account",
    icon: Wallet,
    fee: 3.49,
    feeType: "percentage", 
    processingTime: "Instant",
    minAmount: 1,
    maxAmount: 10000,
  },
  {
    id: "bank_transfer",
    name: "Bank Transfer",
    description: "Direct transfer from your bank account",
    icon: Building2,
    fee: 1.00,
    feeType: "fixed",
    processingTime: "1-3 business days",
    minAmount: 10,
    maxAmount: 100000,
  },
];

export default function Deposit() {
  const [amount, setAmount] = useState("");
  const [selectedMethod, setSelectedMethod] = useState("credit_card");
  const [processing, setProcessing] = useState(false);
  const { user } = useAuth();
  const { wallet, loading, refreshWallet } = useWallet();

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
      const depositAmount = parseFloat(amount);
      const fees = calculateFees();
      
      // Call the deposit function
      const { data, error } = await supabase.rpc('handle_deposit', {
        p_user_id: user?.id,
        p_amount: depositAmount,
        p_description: `Deposit via ${selectedPaymentMethod?.name} - Fee: $${fees.toFixed(2)}`
      });

      if (error) throw error;

      toast.success(`Successfully deposited $${depositAmount.toFixed(2)}`);
      setAmount("");
      await refreshWallet(); // Refresh wallet data
      
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
    <div className="w-full max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Add Funds</h2>
        <p className="text-muted-foreground">Deposit money to your account</p>
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
              <div className="text-3xl font-bold text-success">
                ${wallet?.balance?.toFixed(2) || '0.00'}
              </div>
              <div className="flex items-center gap-1 mt-2 text-sm text-muted-foreground">
                <ShieldCheck className="h-4 w-4" />
                <span>FDIC Insured</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Deposit Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Deposit Methods</CardTitle>
              <CardDescription>
                Choose your preferred payment method
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Payment Method Selection */}
              <div>
                <Label className="text-base font-medium">Payment Method</Label>
                <RadioGroup 
                  value={selectedMethod} 
                  onValueChange={setSelectedMethod}
                  className="mt-3"
                >
                  {paymentMethods.map((method) => (
                    <div key={method.id} className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <RadioGroupItem value={method.id} id={method.id} />
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <method.icon className="h-5 w-5" />
                          <div>
                            <label htmlFor={method.id} className="font-medium cursor-pointer">
                              {method.name}
                            </label>
                            <p className="text-sm text-muted-foreground">
                              {method.description}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 mt-2">
                          <Badge variant="secondary">
                            {method.feeType === "percentage" ? `${method.fee}%` : `$${method.fee}`} fee
                          </Badge>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {method.processingTime}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              {/* Amount Input */}
              <div>
                <Label htmlFor="amount">Amount ($)</Label>
                <div className="relative mt-2">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min={selectedPaymentMethod?.minAmount}
                    max={selectedPaymentMethod?.maxAmount}
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="pl-10"
                  />
                </div>
                {selectedPaymentMethod && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Min: ${selectedPaymentMethod.minAmount} • Max: ${selectedPaymentMethod.maxAmount.toLocaleString()}
                  </p>
                )}
              </div>

              {/* Quick Amount Buttons */}
              <div>
                <Label className="text-sm">Quick amounts</Label>
                <div className="flex gap-2 mt-2">
                  {[25, 50, 100, 250, 500, 1000].map((quickAmount) => (
                    <Button
                      key={quickAmount}
                      variant="outline"
                      size="sm"
                      onClick={() => setAmount(quickAmount.toString())}
                      className="text-xs"
                    >
                      ${quickAmount}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Payment Summary */}
              {amount && parseFloat(amount) > 0 && (
                <Card className="bg-muted/30">
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
                size="lg"
                disabled={!validateAmount() || processing}
              >
                {processing ? "Processing..." : `Deposit $${amount || '0'}`}
              </Button>

              {/* Disclaimer */}
              <div className="bg-muted/30 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <strong>Demo Mode:</strong> This is a demonstration of payment processing. 
                  In a live environment, this would integrate with real payment processors 
                  like Stripe, PayPal, or bank APIs for secure transactions.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}