import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight, ArrowDownLeft, Clock, CheckCircle, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";

interface Transaction {
  id: string;
  type: string;
  amount: number;
  description: string;
  status: string;
  created_at: string;
}

export default function TransactionHistory() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchTransactions();
    }
  }, [user]);

  // Set up real-time listener for user transactions
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('user-transactions-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'transactions',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          fetchTransactions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const fetchTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'deposit':
        return <ArrowDownLeft className="h-4 w-4 text-success" />;
      case 'payment':
        return <ArrowDownLeft className="h-4 w-4 text-success" />;
      case 'withdrawal':
        return <ArrowUpRight className="h-4 w-4 text-destructive" />;
      case 'fee':
        return <ArrowUpRight className="h-4 w-4 text-destructive" />;
      case 'refund':
        return <ArrowDownLeft className="h-4 w-4 text-success" />;
      case 'commission':
        return <ArrowDownLeft className="h-4 w-4 text-success" />;
      default:
        return <ArrowUpRight className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-warning" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-destructive" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'failed':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'deposit':
        return 'Deposit';
      case 'withdrawal':
        return 'Withdrawal';
      case 'fee':
        return 'Service Fee';
      case 'payment':
        return 'Order Payment';
      case 'refund':
        return 'Refund';
      case 'commission':
        return 'Commission';
      default:
        return type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-xl font-semibold">Transaction History</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No transactions found</p>
              <p className="mt-4 text-sm">
                Use the Deposit tab to make your first transaction
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    {getTransactionIcon(transaction.type)}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {getTypeLabel(transaction.type)}
                        </span>
                        <Badge variant={getStatusVariant(transaction.status)}>
                          <span className="flex items-center gap-1">
                            {getStatusIcon(transaction.status)}
                            {transaction.status}
                          </span>
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {transaction.description}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(transaction.created_at), 'MMM dd, yyyy HH:mm')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className={`text-lg font-medium ${
                      transaction.amount >= 0 ? 'text-success' : 'text-destructive'
                    }`}>
                      {transaction.amount >= 0 ? '+' : ''}${Math.abs(transaction.amount).toFixed(2)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}