import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Eye, MoreHorizontal, DollarSign, CheckCircle, Calendar } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const getStatusBadge = (status: string) => {
  const statusConfig = {
    'order_created': { variant: 'default' as const, label: 'Order Created' },
    'request_under_review': { variant: 'secondary' as const, label: 'Under Review' },
    'request_rejected': { variant: 'destructive' as const, label: 'Request Rejected' },
    'request_approved': { variant: 'default' as const, label: 'Request Approved' },
    'meeting_scheduled': { variant: 'secondary' as const, label: 'Meeting Scheduled' },
    'meeting_completed': { variant: 'default' as const, label: 'Meeting Completed' },
    'meeting_missed_client': { variant: 'destructive' as const, label: 'Meeting Missed (Client)' },
    'meeting_missed_our_team': { variant: 'destructive' as const, label: 'Meeting Missed (Our Team)' },
    'rescheduling_required': { variant: 'secondary' as const, label: 'Rescheduling Required' },
    'configuration_in_progress': { variant: 'secondary' as const, label: 'Configuration In Progress' },
    'configuration_blocked': { variant: 'destructive' as const, label: 'Configuration Blocked' },
    'configuration_completed': { variant: 'default' as const, label: 'Configuration Completed' },
    'testing_in_progress': { variant: 'secondary' as const, label: 'Testing In Progress' },
    'testing_failed': { variant: 'destructive' as const, label: 'Testing Failed' },
    'testing_completed': { variant: 'default' as const, label: 'Testing Completed' },
    'pending_client_approval': { variant: 'secondary' as const, label: 'Pending Client Approval' },
    'approved_by_client': { variant: 'default' as const, label: 'Approved by Client' },
    'rejected_by_client': { variant: 'destructive' as const, label: 'Rejected by Client' },
    'invoice_sent': { variant: 'secondary' as const, label: 'Invoice Sent' },
    'payment_pending': { variant: 'secondary' as const, label: 'Payment Pending' },
    'payment_completed': { variant: 'default' as const, label: 'Payment Completed' },
    'payment_failed': { variant: 'destructive' as const, label: 'Payment Failed' },
    'vendor_payment_pending': { variant: 'secondary' as const, label: 'Vendor Payment Pending' },
    'vendor_payment_completed': { variant: 'default' as const, label: 'Vendor Payment Completed' },
    'order_completed_successfully': { variant: 'default' as const, label: 'Order Completed Successfully' },
    'order_cancelled_client': { variant: 'destructive' as const, label: 'Order Cancelled (Client)' },
    'order_cancelled_internal': { variant: 'destructive' as const, label: 'Order Cancelled (Internal)' },
    'order_on_hold': { variant: 'secondary' as const, label: 'Order On Hold' },
  };

  const config = statusConfig[status as keyof typeof statusConfig] || { variant: 'secondary' as const, label: status };
  
  return (
    <Badge variant={config.variant}>
      {config.label}
    </Badge>
  );
};

export function ActiveOrders() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const handleViewOrder = (orderId: string) => {
    navigate(`/order/${orderId}`);
  };

  const fetchOrders = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [user]);

  if (loading) {
    return <div className="text-center py-8">Loading orders...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-foreground">Active Orders</h1>
      </div>


      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-foreground">Orders Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-muted-foreground">Order ID</TableHead>
                <TableHead className="text-muted-foreground">Client</TableHead>
                <TableHead className="text-muted-foreground">Automation Type</TableHead>
                <TableHead className="text-muted-foreground">Price</TableHead>
                <TableHead className="text-muted-foreground">Status</TableHead>
                <TableHead className="text-muted-foreground">Date Created</TableHead>
                <TableHead className="text-muted-foreground">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No orders found. Create your first order to get started.
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((order) => (
                  <TableRow 
                    key={order.id} 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleViewOrder(order.id)}
                  >
                    <TableCell className="font-medium">#{order.id.slice(-8)}</TableCell>
                    <TableCell>{order.client_name}</TableCell>
                    <TableCell>{order.automation_title}</TableCell>
                    <TableCell>{order.agreed_price}</TableCell>
                    <TableCell>{getStatusBadge(order.status)}</TableCell>
                    <TableCell>{new Date(order.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation();
                            handleViewOrder(order.id);
                          }}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}