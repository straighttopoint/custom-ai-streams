import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Clock, CheckCircle, XCircle, Send, MessageSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { format } from "date-fns";

interface SupportTicket {
  id: string;
  subject: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  created_at: string;
}

interface SupportMessage {
  id: string;
  ticket_id: string;
  user_id: string | null;
  message: string;
  is_admin: boolean;
  created_at: string;
}

export default function Support() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const { user } = useAuth();

  // Form state
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [priority, setPriority] = useState("medium");

  useEffect(() => {
    if (user) {
      fetchTickets();
    }
  }, [user]);

  const fetchTickets = async () => {
    try {
      const { data, error } = await supabase
        .from('support_tickets')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTickets(data || []);
    } catch (error) {
      console.error('Error fetching tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTicket = async () => {
    if (!subject || !description || !category) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      const { data: ticketData, error: ticketError } = await supabase
        .from('support_tickets')
        .insert({
          user_id: user?.id,
          subject,
          description,
          category,
          priority
        })
        .select()
        .single();

      if (ticketError) throw ticketError;

      // Create initial message with the description
      const { error: messageError } = await supabase
        .from('support_messages')
        .insert({
          ticket_id: ticketData.id,
          user_id: user?.id,
          message: description,
          is_admin: false
        });

      if (messageError) throw messageError;

      toast.success("Support ticket created successfully");
      setIsCreateDialogOpen(false);
      setSubject("");
      setDescription("");
      setCategory("");
      setPriority("medium");
      fetchTickets();
    } catch (error) {
      console.error('Error creating ticket:', error);
      toast.error("Failed to create ticket");
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
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedTicket) return;

    try {
      const { error } = await supabase
        .from('support_messages')
        .insert({
          ticket_id: selectedTicket.id,
          user_id: user?.id,
          message: newMessage.trim(),
          is_admin: false
        });

      if (error) throw error;

      setNewMessage("");
      fetchMessages(selectedTicket.id);
      toast.success("Message sent");
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error("Failed to send message");
    }
  };

  const openTicketChat = (ticket: SupportTicket) => {
    setSelectedTicket(ticket);
    fetchMessages(ticket.id);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'resolved':
        return <CheckCircle className="h-4 w-4 text-success-foreground" />;
      case 'open':
        return <Clock className="h-4 w-4 text-warning" />;
      case 'closed':
        return <XCircle className="h-4 w-4 text-muted-foreground" />;
      default:
        return <MessageSquare className="h-4 w-4 text-blue-500" />;
    }
  };

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'resolved':
        return 'default';
      case 'open':
        return 'secondary';
      case 'closed':
        return 'outline';
      case 'in_progress':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getPriorityVariant = (priority: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (priority) {
      case 'urgent':
        return 'destructive';
      case 'high':
        return 'secondary';
      case 'medium':
        return 'outline';
      case 'low':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'technical':
        return 'Technical';
      case 'billing':
        return 'Billing';
      case 'general':
        return 'General';
      case 'bug_report':
        return 'Bug Report';
      case 'feature_request':
        return 'Feature Request';
      default:
        return category;
    }
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Support Center</h2>
          <p className="text-muted-foreground">
            Get help with your account, orders, and technical issues
          </p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Ticket
            </Button>
          </DialogTrigger>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Support Ticket</DialogTitle>
            <DialogDescription>
              Describe your issue and we'll get back to you as soon as possible
            </DialogDescription>
          </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="subject">Subject *</Label>
                <Input
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Brief description of your issue"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="technical">Technical</SelectItem>
                      <SelectItem value="billing">Billing</SelectItem>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="bug_report">Bug Report</SelectItem>
                      <SelectItem value="feature_request">Feature Request</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={priority} onValueChange={setPriority}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detailed description of your issue, including steps to reproduce if applicable"
                  className="min-h-[120px]"
                />
              </div>
              
              <Button onClick={handleCreateTicket} className="w-full">
                Submit Ticket
              </Button>
          </div>
        </DialogContent>
      </Dialog>
      </div>

      {tickets.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">No support tickets yet</p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Ticket
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {tickets.map((ticket) => (
            <Card key={ticket.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <CardTitle className="text-xl">{ticket.subject}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant={getStatusVariant(ticket.status)}>
                        <span className="flex items-center gap-1">
                          {getStatusIcon(ticket.status)}
                          {ticket.status.replace('_', ' ')}
                        </span>
                      </Badge>
                      <Badge variant={getPriorityVariant(ticket.priority)}>
                        {ticket.priority} priority
                      </Badge>
                      <Badge variant="outline">
                        {getCategoryLabel(ticket.category)}
                      </Badge>
                    </div>
                  </div>
                   <Button 
                     variant="outline" 
                     size="sm"
                     onClick={() => openTicketChat(ticket)}
                   >
                     <MessageSquare className="h-4 w-4 mr-2" />
                     Open Chat
                   </Button>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="mb-3">
                  {ticket.description.length > 150 
                    ? `${ticket.description.substring(0, 150)}...` 
                    : ticket.description
                  }
                </CardDescription>
                <div className="flex justify-between items-center text-sm text-muted-foreground">
                  <span>Category: {getCategoryLabel(ticket.category)}</span>
                  <span>Created {format(new Date(ticket.created_at), 'MMM dd')}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Chat Dialog */}
      <Dialog open={!!selectedTicket} onOpenChange={() => setSelectedTicket(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              {selectedTicket?.subject}
            </DialogTitle>
            <div className="flex items-center gap-2">
              <Badge variant={getStatusVariant(selectedTicket?.status || '')}>
                <span className="flex items-center gap-1">
                  {getStatusIcon(selectedTicket?.status || '')}
                  {selectedTicket?.status.replace('_', ' ')}
                </span>
              </Badge>
              <Badge variant={getPriorityVariant(selectedTicket?.priority || '')}>
                {selectedTicket?.priority} priority
              </Badge>
              <Badge variant="outline">
                {getCategoryLabel(selectedTicket?.category || '')}
              </Badge>
            </div>
          </DialogHeader>
          
          <div className="flex flex-col h-[60vh]">
            <ScrollArea className="flex-1 p-4 border rounded-lg mb-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.is_admin ? 'justify-start' : 'justify-end'}`}
                  >
                    <div
                      className={`max-w-[70%] p-3 rounded-lg ${
                        message.is_admin
                          ? 'bg-muted text-foreground'
                          : 'bg-primary text-primary-foreground'
                      }`}
                    >
                      <p className="text-sm">{message.message}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs opacity-70">
                          {message.is_admin ? 'Admin' : 'You'}
                        </span>
                        <span className="text-xs opacity-50">
                          {format(new Date(message.created_at), 'MMM dd, HH:mm')}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
            
            <div className="flex gap-2">
              <Textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 min-h-[60px]"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />
              <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}