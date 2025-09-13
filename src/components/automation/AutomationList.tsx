import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, Bot, Eye, TrendingUp, Trash2, MoreVertical, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface UserAutomation {
  id: string;
  automation_id: string;
  automation_title: string;
  automation_description: string;
  automation_category: string;
  automation_cost: number;
  automation_suggested_price: number;
  automation_profit: number;
  automation_rating: number;
  automation_reviews: number;
  automation_tags: string[];
  is_active: boolean;
  added_at: string;
}

export function AutomationList() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [automations, setAutomations] = useState<UserAutomation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserAutomations();
    }
  }, [user]);

  const fetchUserAutomations = async () => {
    try {
      const { data, error } = await supabase
        .from('user_automations')
        .select('*')
        .eq('user_id', user?.id)
        .order('added_at', { ascending: false });

      if (error) throw error;
      setAutomations(data || []);
    } catch (error) {
      console.error('Error fetching user automations:', error);
      toast.error("Failed to load your automations");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveAutomation = async (automationId: string) => {
    try {
      const { error } = await supabase
        .from('user_automations')
        .delete()
        .eq('id', automationId);

      if (error) throw error;

      setAutomations(prev => prev.filter(auto => auto.id !== automationId));
      toast.success("Automation removed from your list");
    } catch (error) {
      console.error('Error removing automation:', error);
      toast.error("Failed to remove automation");
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Your Automation Portfolio</h2>
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Loading your automations...</p>
        </div>
      </div>
    );
  }

  const totalProfit = automations.reduce((sum, automation) => sum + automation.automation_profit, 0);
  const totalCost = automations.reduce((sum, automation) => sum + automation.automation_cost, 0);
  const averageRating = automations.length > 0 
    ? (automations.reduce((sum, automation) => sum + automation.automation_rating, 0) / automations.length).toFixed(1)
    : "0.0";

  return (
    <div className="space-y-6 overflow-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Automations</h1>
          <p className="text-muted-foreground mt-2">
            Manage your automation portfolio. Configure, activate, and monitor your AI automations.
          </p>
        </div>
        {automations.length > 0 && (
          <div className="flex gap-2">
            <Button 
              onClick={() => {
                const event = new CustomEvent('setActiveTab', { detail: 'marketplace' });
                window.dispatchEvent(event);
              }} 
              variant="outline"
            >
              Browse Marketplace
            </Button>
            <Button 
              onClick={() => {
                const event = new CustomEvent('setActiveTab', { detail: 'custom-requests' });
                window.dispatchEvent(event);
              }}
              variant="outline"
            >
              <Plus className="h-4 w-4 mr-2" />
              Request Custom Automation
            </Button>
          </div>
        )}
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-primary">{automations.length}</div>
            <p className="text-sm text-muted-foreground">Total Automations</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-success">${totalProfit.toFixed(0)}</div>
            <p className="text-sm text-muted-foreground">Total Profit Potential</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-destructive">${totalCost.toFixed(0)}</div>
            <p className="text-sm text-muted-foreground">Total Cost</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold flex items-center gap-1">
              <Star className="w-5 h-5 fill-warning text-warning" />
              {averageRating}
            </div>
            <p className="text-sm text-muted-foreground">Average Rating</p>
          </CardContent>
        </Card>
      </div>

      {automations.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Bot className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Automations Yet</h3>
            <p className="text-muted-foreground mb-4">
              Start building your automation portfolio by adding automations from the marketplace.
            </p>
            <Button 
              onClick={() => {
                const event = new CustomEvent('setActiveTab', { detail: 'marketplace' });
                window.dispatchEvent(event);
              }}
            >
              Browse Marketplace
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {automations.map((automation) => {
            const profitMargin = ((automation.automation_profit / automation.automation_suggested_price) * 100).toFixed(1);
            
            return (
              <Card key={automation.id} className="group hover:shadow-lg transition-all duration-200">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Bot className="w-8 h-8 text-primary" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                            {automation.automation_title}
                          </h3>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {automation.automation_description}
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Badge variant={automation.is_active ? "default" : "secondary"} className="bg-success text-success-foreground">
                            {automation.is_active ? "Active" : "Draft"}
                          </Badge>
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => navigate(`/automation/${automation.automation_id}`)}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Remove
                                  </DropdownMenuItem>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Remove Automation</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to remove "{automation.automation_title}" from your portfolio? This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleRemoveAutomation(automation.id)}>
                                      Remove
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 mt-3">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-warning text-warning" />
                          <span className="text-sm font-medium">{automation.automation_rating}</span>
                          <span className="text-sm text-muted-foreground">({automation.automation_reviews})</span>
                        </div>
                        
                        <Badge variant="outline" className="text-xs">
                          {automation.automation_category}
                        </Badge>
                      </div>

                      <div className="flex flex-wrap gap-1 mt-2">
                        {automation.automation_tags.map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-4 mt-6 pt-4 border-t border-border">
                    <div>
                      <p className="text-xs text-muted-foreground">Your Cost</p>
                      <p className="font-semibold">${automation.automation_cost}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Suggested Price</p>
                      <p className="font-semibold">${automation.automation_suggested_price}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Profit</p>
                      <p className="font-semibold text-success flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        ${automation.automation_profit}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Margin</p>
                      <p className="font-semibold text-success">{profitMargin}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}