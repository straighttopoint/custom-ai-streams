import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Calendar, CreditCard, User, MessageSquare, Clock } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import OrderTransactions from "@/components/OrderTransactions";

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

export default function OrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchOrder = async () => {
    if (!user || !id) return;
    
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

      if (error) {
        throw error;
      }

      setOrder(data);
    } catch (error) {
      console.error('Error fetching order:', error);
      toast.error("Failed to load order details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [user, id]);

  if (loading) {
    return <div className="text-center py-8">Loading order details...</div>;
  }

  if (!order) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">Order Not Found</h1>
          <p className="text-muted-foreground">The order you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/dashboard')}>
            Return to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto p-6 space-y-6 max-h-screen overflow-y-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button 
            variant="outline" 
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Orders
          </Button>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-3xl font-bold">Order #{order.id.slice(-8)}</h1>
              {getStatusBadge(order.status)}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Client Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Client Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Name</p>
                      <p className="font-medium">{order.client_name}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Email</p>
                      <p className="font-medium">{order.client_email}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Phone</p>
                      <p className="font-medium">{order.client_phone}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Company</p>
                      <p className="font-medium">{order.company_name}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Industry</p>
                      <p className="font-medium">{order.industry}</p>
                    </div>
                    {order.website_url && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Website</p>
                        <p className="font-medium">{order.website_url}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Automation Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Automation Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Automation Type</p>
                    <p className="font-medium">{order.automation_title}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Category</p>
                    <p className="font-medium">{order.automation_category || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Agreed Price</p>
                    <p className="font-medium text-lg">{order.agreed_price}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Payment Format</p>
                    <p className="font-medium capitalize">{order.payment_format}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Project Description</p>
                    <p className="text-sm">{order.project_description}</p>
                  </div>
                  {order.special_requirements && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Special Requirements</p>
                      <p className="text-sm">{order.special_requirements}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Order Transactions */}
              <OrderTransactions
                orderId={order.id}
                userId={order.user_id}
                sellingPrice={order.agreed_price}
                automationCost={parseFloat(order.automation_price?.replace(/[^0-9.-]+/g, '') || '0')}
                paymentFormat={order.payment_format}
                orderStatus={order.status}
              />

              {/* Social Media Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    Social Media Accounts
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { platform: 'Instagram', handle: order.instagram_handle },
                    { platform: 'Facebook', handle: order.facebook_page },
                    { platform: 'Twitter', handle: order.twitter_handle },
                    { platform: 'LinkedIn', handle: order.linkedin_profile }
                  ].filter(item => item.handle).map((platform, index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-muted rounded">
                      <span className="font-medium">{platform.platform}</span>
                      <span className="text-sm text-muted-foreground">{platform.handle}</span>
                    </div>
                  ))}
                  {![order.instagram_handle, order.facebook_page, order.twitter_handle, order.linkedin_profile].some(Boolean) && (
                    <p className="text-sm text-muted-foreground">No social media accounts provided</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Order Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Order Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Order Value</p>
                      <p className="font-medium text-lg">{order.agreed_price}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Payment Format</p>
                      <Badge variant="outline" className="capitalize">{order.payment_format}</Badge>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Automation Type</p>
                    <p className="font-medium">{order.automation_title}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Current Status</p>
                    {getStatusBadge(order.status)}
                  </div>
                </CardContent>
              </Card>

              {/* Important Dates */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Important Dates
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Order Created</p>
                      <p className="font-medium">{new Date(order.created_at).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Last Updated</p>
                      <p className="font-medium">{new Date(order.updated_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Meeting Scheduled</p>
                    <p className="font-medium">{order.meeting_date}</p>
                  </div>
                  {order.estimated_completion_date && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Estimated Completion</p>
                      <p className="font-medium">{new Date(order.estimated_completion_date).toLocaleDateString()}</p>
                    </div>
                  )}
                  {order.actual_completion_date && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Actual Completion</p>
                      <p className="font-medium">{new Date(order.actual_completion_date).toLocaleDateString()}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Order Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Order Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      {getStatusBadge(order.status)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">Current Status</p>
                      <p className="text-xs text-muted-foreground">Last updated: {new Date(order.updated_at).toLocaleDateString()}</p>
                      {order.admin_notes && (
                        <p className="text-xs text-muted-foreground mt-1">
                          <strong>Admin Notes:</strong> {order.admin_notes}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}