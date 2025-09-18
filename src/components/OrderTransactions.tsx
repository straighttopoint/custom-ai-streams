import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { DollarSign, TrendingUp, TrendingDown, Clock, CheckCircle, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useWallet } from "@/hooks/useWallet";

interface OrderTransaction {
  id: string;
  transaction_type: string;
  amount: number;
  status: string;
  description: string;
  due_date: string | null;
  completed_at: string | null;
  created_at: string;
}

interface OrderTransactionsProps {
  orderId: string;
  userId: string;
  sellingPrice: string;
  automationCost: number;
  paymentFormat: string;
  orderStatus: string;
}

export default function OrderTransactions({ 
  orderId, 
  userId, 
  sellingPrice, 
  automationCost, 
  paymentFormat, 
  orderStatus 
}: OrderTransactionsProps) {
  const [transactions, setTransactions] = useState<OrderTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const { refreshWallet } = useWallet();

  useEffect(() => {
    fetchTransactions();
  }, [orderId, orderStatus]);

  // Set up real-time listener for order transactions
  useEffect(() => {
    const channel = supabase
      .channel('order-transactions-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'order_transactions',
          filter: `order_id=eq.${orderId}`
        },
        () => {
          fetchTransactions();
          refreshWallet(); // Refresh wallet when transactions change
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [orderId, refreshWallet]);

  const fetchTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from('order_transactions')
        .select('*')
        .eq('order_id', orderId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // If no transactions exist and order status allows, generate them
      if (!data || data.length === 0) {
        if (orderStatus !== 'order_created' && orderStatus !== 'request_under_review') {
          await generateTransactions();
          return;
        }
      }

      setTransactions(data || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateTransactions = async () => {
    try {
      const sellingPriceNum = parseFloat(sellingPrice.replace(/[^0-9.-]+/g, ''));
      
      const { error } = await supabase.rpc('generate_order_transactions', {
        p_order_id: orderId,
        p_user_id: userId,
        p_selling_price: sellingPriceNum,
        p_automation_cost: automationCost,
        p_payment_format: paymentFormat
      });

      if (error) throw error;
      
      // Refetch transactions after generation
      await fetchTransactions();
    } catch (error) {
      console.error('Error generating transactions:', error);
    }
  };

  const getTransactionIcon = (type: string, amount: number) => {
    if (type === 'payment') return <TrendingUp className="w-4 h-4 text-green-600" />;
    return <TrendingDown className="w-4 h-4 text-red-600" />;
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: 'secondary' as const, icon: <Clock className="w-3 h-3" /> },
      completed: { variant: 'default' as const, icon: <CheckCircle className="w-3 h-3" /> },
      cancelled: { variant: 'destructive' as const, icon: <XCircle className="w-3 h-3" /> }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        {config.icon}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const formatAmount = (amount: number) => {
    const isNegative = amount < 0;
    const absAmount = Math.abs(amount);
    return `${isNegative ? '-' : '+'}$${absAmount.toFixed(2)}`;
  };

  const getTotalPayout = () => {
    const paymentTransaction = transactions.find(t => t.transaction_type === 'payment');
    return paymentTransaction ? paymentTransaction.amount : 0;
  };

  // Don't show transactions if order is still in initial stages
  if (orderStatus === 'order_created' || orderStatus === 'request_under_review') {
    return null;
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Order Transactions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Loading transactions...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="w-5 h-5" />
          Order Transactions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Selling Price */}
        <div className="p-4 bg-muted/50 rounded-lg">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-medium">Selling Price ({paymentFormat})</p>
              <p className="text-sm text-muted-foreground">Agreed price with client</p>
            </div>
            <p className="text-lg font-bold text-green-600">{sellingPrice}</p>
          </div>
        </div>

        <Separator />

        {/* Transaction List */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm">Costs & Fees</h4>
          {transactions
            .filter(t => t.transaction_type !== 'payment')
            .map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-3 bg-muted/30 rounded">
                <div className="flex items-center gap-3">
                  {getTransactionIcon(transaction.transaction_type, transaction.amount)}
                  <div>
                    <p className="font-medium text-sm">{transaction.description}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {getStatusBadge(transaction.status)}
                      {transaction.completed_at && (
                        <span className="text-xs text-muted-foreground">
                          Completed {new Date(transaction.completed_at).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <p className="font-medium text-red-600">{formatAmount(transaction.amount)}</p>
              </div>
            ))}
        </div>

        <Separator />

        {/* Expected Payment */}
        {transactions.some(t => t.transaction_type === 'payment') && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-5 h-5 text-green-600" />
                <div>
                  <p className="font-medium text-green-800">Your Earnings</p>
                  <p className="text-sm text-green-600">
                    {transactions.find(t => t.transaction_type === 'payment')?.status === 'pending' 
                      ? 'Payment pending' 
                      : 'Payment completed'}
                  </p>
                  {transactions.find(t => t.transaction_type === 'payment')?.due_date && (
                    <p className="text-xs text-green-600">
                      Expected: {new Date(transactions.find(t => t.transaction_type === 'payment')!.due_date!).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-green-700">
                  +${getTotalPayout().toFixed(2)}
                </p>
                {getStatusBadge(transactions.find(t => t.transaction_type === 'payment')?.status || 'pending')}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}