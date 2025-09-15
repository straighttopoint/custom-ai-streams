import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Eye, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Order {
  id: string;
  client_name: string;
  client_email: string;
  automation_title: string;
  agreed_price: string;
  status: string;
  created_at: string;
  admin_notes: string;
  project_description: string;
  special_requirements: string;
  estimated_completion_date: string;
}

const orderStatuses = [
  'order_created',
  'payment_pending',
  'in_progress',
  'under_review',
  'completed',
  'cancelled'
];

const getStatusBadgeVariant = (status: string) => {
  switch (status) {
    case 'completed': return 'default';
    case 'in_progress': return 'secondary';
    case 'under_review': return 'outline';
    case 'cancelled': return 'destructive';
    default: return 'secondary';
  }
};

export const AdminOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: "Error",
        description: "Failed to fetch orders",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;

      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ));

      toast({
        title: "Success",
        description: "Order status updated successfully"
      });
    } catch (error) {
      console.error('Error updating order status:', error);
      toast({
        title: "Error",
        description: "Failed to update order status",
        variant: "destructive"
      });
    }
  };

  const updateAdminNotes = async (orderId: string, notes: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ admin_notes: notes })
        .eq('id', orderId);

      if (error) throw error;

      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, admin_notes: notes } : order
      ));

      toast({
        title: "Success",
        description: "Admin notes updated successfully"
      });
    } catch (error) {
      console.error('Error updating admin notes:', error);
      toast({
        title: "Error",
        description: "Failed to update admin notes",
        variant: "destructive"
      });
    }
  };

  const openOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    setAdminNotes(order.admin_notes || "");
    setSelectedStatus(order.status);
  };

  const handleSaveChanges = () => {
    if (selectedOrder) {
      if (selectedStatus !== selectedOrder.status) {
        updateOrderStatus(selectedOrder.id, selectedStatus);
      }
      if (adminNotes !== selectedOrder.admin_notes) {
        updateAdminNotes(selectedOrder.id, adminNotes);
      }
      setSelectedOrder(null);
    }
  };

  if (loading) {
    return <div>Loading orders...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Client</TableHead>
              <TableHead>Automation</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell>
                  <div>
                    <div className="font-medium">{order.client_name}</div>
                    <div className="text-sm text-muted-foreground">{order.client_email}</div>
                  </div>
                </TableCell>
                <TableCell>{order.automation_title}</TableCell>
                <TableCell>${order.agreed_price}</TableCell>
                <TableCell>
                  <Badge variant={getStatusBadgeVariant(order.status)}>
                    {order.status.replace('_', ' ')}
                  </Badge>
                </TableCell>
                <TableCell>{new Date(order.created_at).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => openOrderDetails(order)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Order Details</DialogTitle>
                      </DialogHeader>
                      {selectedOrder && (
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>Client Name</Label>
                              <p className="text-sm">{selectedOrder.client_name}</p>
                            </div>
                            <div>
                              <Label>Client Email</Label>
                              <p className="text-sm">{selectedOrder.client_email}</p>
                            </div>
                          </div>
                          
                          <div>
                            <Label>Project Description</Label>
                            <p className="text-sm mt-1">{selectedOrder.project_description}</p>
                          </div>

                          {selectedOrder.special_requirements && (
                            <div>
                              <Label>Special Requirements</Label>
                              <p className="text-sm mt-1">{selectedOrder.special_requirements}</p>
                            </div>
                          )}

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>Status</Label>
                              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {orderStatuses.map((status) => (
                                    <SelectItem key={status} value={status}>
                                      {status.replace('_', ' ')}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label>Agreed Price</Label>
                              <p className="text-sm">${selectedOrder.agreed_price}</p>
                            </div>
                          </div>

                          <div>
                            <Label>Admin Notes</Label>
                            <Textarea
                              value={adminNotes}
                              onChange={(e) => setAdminNotes(e.target.value)}
                              placeholder="Add admin notes..."
                              className="mt-1"
                            />
                          </div>

                          <div className="flex justify-end space-x-2">
                            <Button variant="outline" onClick={() => setSelectedOrder(null)}>
                              Cancel
                            </Button>
                            <Button onClick={handleSaveChanges}>
                              Save Changes
                            </Button>
                          </div>
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};