import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageSquare, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SupportTicket {
  id: string;
  subject: string;
  description: string;
  status: string;
  priority: string;
  category: string;
  created_at: string;
  user_id: string;
}

interface SupportMessage {
  id: string;
  message: string;
  is_admin: boolean;
  created_at: string;
  user_id: string;
}

const ticketStatuses = ['open', 'in_progress', 'resolved', 'closed'];
const priorities = ['low', 'medium', 'high', 'urgent'];

const getStatusBadgeVariant = (status: string) => {
  switch (status) {
    case 'open': return 'destructive';
    case 'in_progress': return 'secondary';
    case 'resolved': return 'default';
    case 'closed': return 'outline';
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

export const AdminSupport = () => {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [newStatus, setNewStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const { data, error } = await supabase
        .from('support_tickets')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTickets(data || []);
    } catch (error) {
      console.error('Error fetching tickets:', error);
      toast({
        title: "Error",
        description: "Failed to fetch support tickets",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (ticketId: string) => {
    try {
      const { data, error } = await supabase
        .from('support_messages')
        .select('*')
        .eq('ticket_id', ticketId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: "Error",
        description: "Failed to fetch messages",
        variant: "destructive"
      });
    }
  };

  const openTicket = (ticket: SupportTicket) => {
    setSelectedTicket(ticket);
    setNewStatus(ticket.status);
    fetchMessages(ticket.id);
  };

  const sendMessage = async () => {
    if (!selectedTicket || !newMessage.trim()) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('support_messages')
        .insert([{
          ticket_id: selectedTicket.id,
          message: newMessage,
          is_admin: true,
          user_id: user.id
        }]);

      if (error) throw error;

      setNewMessage("");
      fetchMessages(selectedTicket.id);
      toast({
        title: "Success",
        description: "Message sent successfully"
      });
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive"
      });
    }
  };

  const updateTicketStatus = async () => {
    if (!selectedTicket || newStatus === selectedTicket.status) return;

    try {
      const { error } = await supabase
        .from('support_tickets')
        .update({ status: newStatus })
        .eq('id', selectedTicket.id);

      if (error) throw error;

      setTickets(tickets.map(ticket => 
        ticket.id === selectedTicket.id ? { ...ticket, status: newStatus } : ticket
      ));
      setSelectedTicket({ ...selectedTicket, status: newStatus });

      toast({
        title: "Success",
        description: "Ticket status updated successfully"
      });
    } catch (error) {
      console.error('Error updating ticket status:', error);
      toast({
        title: "Error",
        description: "Failed to update ticket status",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return <div>Loading support tickets...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Subject</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tickets.map((ticket) => (
              <TableRow key={ticket.id}>
                <TableCell>
                  <div>
                    <div className="font-medium">{ticket.subject}</div>
                    <div className="text-sm text-muted-foreground truncate max-w-xs">
                      {ticket.description}
                    </div>
                  </div>
                </TableCell>
                <TableCell>{ticket.category}</TableCell>
                <TableCell>
                  <Badge variant={getPriorityBadgeVariant(ticket.priority)}>
                    {ticket.priority}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusBadgeVariant(ticket.status)}>
                    {ticket.status}
                  </Badge>
                </TableCell>
                <TableCell>{new Date(ticket.created_at).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => openTicket(ticket)}
                      >
                        <MessageSquare className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Support Ticket: {selectedTicket?.subject}</DialogTitle>
                      </DialogHeader>
                      {selectedTicket && (
                        <div className="space-y-4">
                          <div className="grid grid-cols-3 gap-4">
                            <div>
                              <Label>Status</Label>
                              <Select value={newStatus} onValueChange={setNewStatus}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {ticketStatuses.map((status) => (
                                    <SelectItem key={status} value={status}>
                                      {status}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label>Priority</Label>
                              <p className="text-sm">{selectedTicket.priority}</p>
                            </div>
                            <div>
                              <Label>Category</Label>
                              <p className="text-sm">{selectedTicket.category}</p>
                            </div>
                          </div>

                          <div>
                            <Label>Description</Label>
                            <p className="text-sm mt-1">{selectedTicket.description}</p>
                          </div>

                          <div className="space-y-2">
                            <Label>Messages</Label>
                            <div className="max-h-60 overflow-y-auto space-y-2 border rounded p-2">
                              {messages.map((message) => (
                                <div key={message.id} className={`p-2 rounded ${message.is_admin ? 'bg-blue-50 ml-4' : 'bg-gray-50 mr-4'}`}>
                                  <div className="flex justify-between items-center mb-1">
                                    <span className="text-sm font-medium">
                                      {message.is_admin ? 'Admin' : 'User'}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                      {new Date(message.created_at).toLocaleString()}
                                    </span>
                                  </div>
                                  <p className="text-sm">{message.message}</p>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label>Send Reply</Label>
                            <Textarea
                              value={newMessage}
                              onChange={(e) => setNewMessage(e.target.value)}
                              placeholder="Type your response..."
                              rows={3}
                            />
                          </div>

                          <div className="flex justify-between">
                            <Button onClick={updateTicketStatus} variant="outline">
                              Update Status
                            </Button>
                            <div className="space-x-2">
                              <Button variant="outline" onClick={() => setSelectedTicket(null)}>
                                Close
                              </Button>
                              <Button onClick={sendMessage}>
                                <Send className="h-4 w-4 mr-2" />
                                Send Reply
                              </Button>
                            </div>
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