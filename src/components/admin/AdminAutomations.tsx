import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Automation {
  id: string;
  automation_id: string;
  automation_title: string;
  automation_description: string;
  automation_category: string;
  automation_cost: number;
  automation_suggested_price: number;
  is_active: boolean;
  automation_tags: string[];
  user_id: string;
}

const categories = [
  'Social Media Marketing',
  'SEO Optimization', 
  'Email Marketing',
  'Content Creation',
  'Lead Generation',
  'E-commerce',
  'Analytics',
  'Customer Service'
];

export const AdminAutomations = () => {
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newAutomation, setNewAutomation] = useState({
    automation_title: '',
    automation_description: '',
    automation_category: '',
    automation_cost: 0,
    automation_suggested_price: 0,
    automation_tags: '',
    is_active: true
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchAutomations();
  }, []);

  const fetchAutomations = async () => {
    try {
      // Since we're admin, we want to see ALL automations, but we need to use the service role
      // For now, let's fetch what we can see with current permissions
      const { data, error } = await supabase
        .from('user_automations')
        .select('*')
        .order('added_at', { ascending: false });

      if (error) throw error;
      setAutomations(data || []);
    } catch (error) {
      console.error('Error fetching automations:', error);
      toast({
        title: "Error",
        description: "Failed to fetch automations",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createAutomation = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const automationData = {
        automation_id: `auto_${Date.now()}`,
        automation_title: newAutomation.automation_title,
        automation_description: newAutomation.automation_description,
        automation_category: newAutomation.automation_category,
        automation_cost: newAutomation.automation_cost,
        automation_suggested_price: newAutomation.automation_suggested_price,
        automation_tags: newAutomation.automation_tags.split(',').map(tag => tag.trim()),
        is_active: newAutomation.is_active,
        user_id: user.id
      };

      const { error } = await supabase
        .from('user_automations')
        .insert([automationData]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Automation created successfully"
      });

      setIsCreateDialogOpen(false);
      setNewAutomation({
        automation_title: '',
        automation_description: '',
        automation_category: '',
        automation_cost: 0,
        automation_suggested_price: 0,
        automation_tags: '',
        is_active: true
      });
      fetchAutomations();
    } catch (error) {
      console.error('Error creating automation:', error);
      toast({
        title: "Error",
        description: "Failed to create automation",
        variant: "destructive"
      });
    }
  };

  const toggleAutomationStatus = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('user_automations')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;

      setAutomations(automations.map(auto => 
        auto.id === id ? { ...auto, is_active: !currentStatus } : auto
      ));

      toast({
        title: "Success",
        description: "Automation status updated"
      });
    } catch (error) {
      console.error('Error updating automation status:', error);
      toast({
        title: "Error",
        description: "Failed to update automation status",
        variant: "destructive"
      });
    }
  };

  const deleteAutomation = async (id: string, isActive: boolean) => {
    if (isActive) {
      toast({
        title: "Error",
        description: "Cannot delete active automation. Deactivate it first.",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('user_automations')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setAutomations(automations.filter(auto => auto.id !== id));
      toast({
        title: "Success",
        description: "Automation deleted successfully"
      });
    } catch (error) {
      console.error('Error deleting automation:', error);
      toast({
        title: "Error",
        description: "Failed to delete automation",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return <div>Loading automations...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">All Automations</h3>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Automation
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Automation</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Title</Label>
                <Input
                  value={newAutomation.automation_title}
                  onChange={(e) => setNewAutomation({ ...newAutomation, automation_title: e.target.value })}
                  placeholder="Automation title"
                />
              </div>
              
              <div>
                <Label>Description</Label>
                <Textarea
                  value={newAutomation.automation_description}
                  onChange={(e) => setNewAutomation({ ...newAutomation, automation_description: e.target.value })}
                  placeholder="Automation description"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Category</Label>
                  <Select value={newAutomation.automation_category} onValueChange={(value) => setNewAutomation({ ...newAutomation, automation_category: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Tags (comma separated)</Label>
                  <Input
                    value={newAutomation.automation_tags}
                    onChange={(e) => setNewAutomation({ ...newAutomation, automation_tags: e.target.value })}
                    placeholder="marketing, automation, social"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Cost ($)</Label>
                  <Input
                    type="number"
                    value={newAutomation.automation_cost}
                    onChange={(e) => setNewAutomation({ ...newAutomation, automation_cost: parseFloat(e.target.value) || 0 })}
                    placeholder="0.00"
                  />
                </div>
                
                <div>
                  <Label>Suggested Price ($)</Label>
                  <Input
                    type="number"
                    value={newAutomation.automation_suggested_price}
                    onChange={(e) => setNewAutomation({ ...newAutomation, automation_suggested_price: parseFloat(e.target.value) || 0 })}
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={newAutomation.is_active}
                  onCheckedChange={(checked) => setNewAutomation({ ...newAutomation, is_active: checked })}
                />
                <Label>Active</Label>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={createAutomation}>
                  Create Automation
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Cost</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {automations.map((automation) => (
              <TableRow key={automation.id}>
                <TableCell>
                  <div>
                    <div className="font-medium">{automation.automation_title}</div>
                    <div className="text-sm text-muted-foreground truncate max-w-xs">
                      {automation.automation_description}
                    </div>
                  </div>
                </TableCell>
                <TableCell>{automation.automation_category}</TableCell>
                <TableCell>${automation.automation_cost}</TableCell>
                <TableCell>${automation.automation_suggested_price}</TableCell>
                <TableCell>
                  <Badge variant={automation.is_active ? "default" : "secondary"}>
                    {automation.is_active ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleAutomationStatus(automation.id, automation.is_active)}
                    >
                      {automation.is_active ? "Deactivate" : "Activate"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteAutomation(automation.id, automation.is_active)}
                      disabled={automation.is_active}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};