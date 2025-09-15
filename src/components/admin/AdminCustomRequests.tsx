import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CustomRequest {
  id: string;
  title: string;
  description: string;
  requirements: string;
  budget_range: string;
  status: string;
  priority: string;
  estimated_cost: number;
  estimated_delivery: string;
  admin_notes: string;
  created_at: string;
  user_id: string;
}

const requestStatuses = ['pending', 'reviewing', 'quoted', 'approved', 'in_progress', 'completed', 'rejected'];
const priorities = ['low', 'medium', 'high', 'urgent'];

const getStatusBadgeVariant = (status: string) => {
  switch (status) {
    case 'completed': return 'default';
    case 'approved': return 'secondary';
    case 'in_progress': return 'secondary';
    case 'rejected': return 'destructive';
    case 'pending': return 'outline';
    default: return 'secondary';
  }
};

const getPriorityBadgeVariant = (priority: string) => {
  switch (priority) {
    case 'urgent': return 'destructive';
    case 'high': return 'secondary';
    case 'medium': return 'outline';
    case 'low': return 'default';
    default: return 'outline';
  }
};

export const AdminCustomRequests = () => {
  const [requests, setRequests] = useState<CustomRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<CustomRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [adminNotes, setAdminNotes] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedPriority, setSelectedPriority] = useState("");
  const [estimatedCost, setEstimatedCost] = useState("");
  const [estimatedDelivery, setEstimatedDelivery] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('custom_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      console.error('Error fetching custom requests:', error);
      toast({
        title: "Error",
        description: "Failed to fetch custom requests",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const openRequestDetails = (request: CustomRequest) => {
    setSelectedRequest(request);
    setAdminNotes(request.admin_notes || "");
    setSelectedStatus(request.status);
    setSelectedPriority(request.priority || 'medium');
    setEstimatedCost(request.estimated_cost?.toString() || "");
    setEstimatedDelivery(request.estimated_delivery || "");
  };

  const updateRequest = async () => {
    if (!selectedRequest) return;

    try {
      const updateData: any = {
        status: selectedStatus,
        priority: selectedPriority,
        admin_notes: adminNotes
      };

      if (estimatedCost) {
        updateData.estimated_cost = parseFloat(estimatedCost);
      }
      if (estimatedDelivery) {
        updateData.estimated_delivery = estimatedDelivery;
      }

      const { error } = await supabase
        .from('custom_requests')
        .update(updateData)
        .eq('id', selectedRequest.id);

      if (error) throw error;

      setRequests(requests.map(request => 
        request.id === selectedRequest.id ? { ...request, ...updateData } : request
      ));

      toast({
        title: "Success",
        description: "Custom request updated successfully"
      });
      setSelectedRequest(null);
    } catch (error) {
      console.error('Error updating custom request:', error);
      toast({
        title: "Error",
        description: "Failed to update custom request",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return <div>Loading custom requests...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Budget Range</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.map((request) => (
              <TableRow key={request.id}>
                <TableCell>
                  <div>
                    <div className="font-medium">{request.title}</div>
                    <div className="text-sm text-muted-foreground truncate max-w-xs">
                      {request.description}
                    </div>
                  </div>
                </TableCell>
                <TableCell>{request.budget_range || 'Not specified'}</TableCell>
                <TableCell>
                  <Badge variant={getPriorityBadgeVariant(request.priority)}>
                    {request.priority || 'medium'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusBadgeVariant(request.status)}>
                    {request.status}
                  </Badge>
                </TableCell>
                <TableCell>{new Date(request.created_at).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => openRequestDetails(request)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Custom Request Details</DialogTitle>
                      </DialogHeader>
                      {selectedRequest && (
                        <div className="space-y-4">
                          <div>
                            <Label>Title</Label>
                            <p className="text-sm">{selectedRequest.title}</p>
                          </div>

                          <div>
                            <Label>Description</Label>
                            <p className="text-sm mt-1">{selectedRequest.description}</p>
                          </div>

                          {selectedRequest.requirements && (
                            <div>
                              <Label>Requirements</Label>
                              <p className="text-sm mt-1">{selectedRequest.requirements}</p>
                            </div>
                          )}

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>Budget Range</Label>
                              <p className="text-sm">{selectedRequest.budget_range || 'Not specified'}</p>
                            </div>
                            <div>
                              <Label>Created</Label>
                              <p className="text-sm">{new Date(selectedRequest.created_at).toLocaleDateString()}</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>Status</Label>
                              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {requestStatuses.map((status) => (
                                    <SelectItem key={status} value={status}>
                                      {status}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label>Priority</Label>
                              <Select value={selectedPriority} onValueChange={setSelectedPriority}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {priorities.map((priority) => (
                                    <SelectItem key={priority} value={priority}>
                                      {priority}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>Estimated Cost ($)</Label>
                              <Input
                                type="number"
                                value={estimatedCost}
                                onChange={(e) => setEstimatedCost(e.target.value)}
                                placeholder="0.00"
                              />
                            </div>
                            <div>
                              <Label>Estimated Delivery Date</Label>
                              <Input
                                type="date"
                                value={estimatedDelivery}
                                onChange={(e) => setEstimatedDelivery(e.target.value)}
                              />
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
                            <Button variant="outline" onClick={() => setSelectedRequest(null)}>
                              Cancel
                            </Button>
                            <Button onClick={updateRequest}>
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