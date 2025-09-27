import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, Bot, Eye, TrendingUp, Trash2, MoreVertical, Plus, Crown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface UserAutomation {
  id: string;
  automation_id: string;
  user_id: string;
  is_active: boolean;
  added_at: string;
  updated_at: string;
}

type AutomationDetails = {
  id: string;
  title: string;
  description: string;
  category: string[];
  platforms: string[];
  rating: number;
  reviews_count: number;
  cost: number;
  suggested_price: number;
  profit: number;
  margin: number;
  features: string[];
  status: string;
  assigned_user_id?: string | null;
};

export function AutomationList() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [userAutomations, setUserAutomations] = useState<UserAutomation[]>([]);
  const [automationsDetails, setAutomationsDetails] = useState<AutomationDetails[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserAutomations();
    }
  }, [user]);

  const fetchUserAutomations = async () => {
    setLoading(true);
    try {
      // Get user automations
      const { data: userAutomationsData, error: userError } = await supabase
        .from('user_automations')
        .select('*')
        .eq('user_id', user?.id)
        .order('added_at', { ascending: false });

      if (userError) throw userError;
      setUserAutomations(userAutomationsData || []);

      const automationsList: AutomationDetails[] = [];

      // Get automation details for user automations
      if (userAutomationsData && userAutomationsData.length > 0) {
        const automationIds = userAutomationsData.map(ua => ua.automation_id);
        const { data: userAutomationsDetailsData, error: detailsError } = await supabase
          .from('automations')
          .select('*')
          .in('id', automationIds);

        if (detailsError) throw detailsError;
        if (userAutomationsDetailsData) {
          automationsList.push(...(userAutomationsDetailsData as AutomationDetails[]));
        }
      }

      // Get exclusive automations - using any to avoid TS inference issues
      const exclusiveResult: any = await supabase
        .from('automations')
        .select('*')
        .eq('assigned_user_id', user?.id);
      
      const exclusiveAutomations = exclusiveResult.data;
      const exclusiveError = exclusiveResult.error;

      if (exclusiveError) throw exclusiveError;

      // Add exclusive automations that aren't already included
      if (exclusiveAutomations) {
        exclusiveAutomations.forEach((exclusive) => {
          const exclusiveAutomation = exclusive as AutomationDetails;
          if (!automationsList.find(a => a.id === exclusiveAutomation.id)) {
            automationsList.push(exclusiveAutomation);
          }
        });
      }

      setAutomationsDetails(automationsList);
    } catch (error) {
      console.error('Error fetching user automations:', error);
      toast.error("Failed to load your automations");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveAutomation = async (automationId: string, isExclusive: boolean) => {
    try {
      if (!isExclusive) {
        // Only remove from user_automations if it's not exclusive
        const { error } = await supabase
          .from('user_automations')
          .delete()
          .eq('automation_id', automationId)
          .eq('user_id', user?.id);

        if (error) throw error;
      }

      // Update local state
      setUserAutomations(prev => prev.filter(ua => ua.automation_id !== automationId));
      setAutomationsDetails(prev => prev.filter(ad => ad.id !== automationId));
      
      toast.success("Automation removed from your list");
    } catch (error) {
      console.error('Error removing automation:', error);
      toast.error("Failed to remove automation");
    }
  };

  const handleToggleActive = async (automationId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('user_automations')
        .update({ is_active: !currentStatus })
        .eq('automation_id', automationId)
        .eq('user_id', user?.id);

      if (error) throw error;

      setUserAutomations(prev => prev.map(ua => 
        ua.automation_id === automationId 
          ? { ...ua, is_active: !currentStatus }
          : ua
      ));
      
      toast.success(`Automation ${!currentStatus ? 'activated' : 'deactivated'}`);
    } catch (error) {
      console.error('Error toggling automation status:', error);
      toast.error("Failed to update automation status");
    }
  };

  const generateRevenue = (costPerUse: number, monthlyUses: number = 10) => {
    return (costPerUse * monthlyUses * 0.7).toFixed(2); // 70% of gross revenue
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(price);
  };

  const formatCategory = (categories: string[]) => {
    return categories.join(', ');
  };

  const formatPlatforms = (platforms: string[]) => {
    return platforms.join(', ');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">My Automations</h2>
          <p className="text-muted-foreground">Manage your automation portfolio and track performance</p>
        </div>
        
        <Card className="p-4">
          <div className="flex items-center space-x-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{automationsDetails.length}</p>
              <p className="text-sm text-muted-foreground">Active</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-success">
                ${automationsDetails.reduce((sum, automation) => {
                  return sum + parseFloat(generateRevenue(automation.cost));
                }, 0).toFixed(2)}
              </p>
              <p className="text-sm text-muted-foreground">Monthly Revenue</p>
            </div>
          </div>
        </Card>
      </div>

      {automationsDetails.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Bot className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Automations Yet</h3>
            <p className="text-muted-foreground mb-4">
              Start building your automation portfolio by browsing our marketplace
            </p>
            <Button 
              onClick={() => {
                const event = new CustomEvent('changeTab', { detail: 'marketplace' });
                window.dispatchEvent(event);
              }}
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              Browse Marketplace
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {automationsDetails.map((automationDetails) => {
            const userAutomation = userAutomations.find(ua => ua.automation_id === automationDetails.id);
            const isExclusive = automationDetails.assigned_user_id === user?.id;
            
            return (
              <Card key={automationDetails.id} className="overflow-hidden">
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <CardTitle className="text-xl">{automationDetails.title}</CardTitle>
                        {isExclusive && (
                          <Badge variant="secondary" className="bg-amber-100 text-amber-800 gap-1">
                            <Crown className="w-3 h-3" />
                            Exclusive
                          </Badge>
                        )}
                        <Badge 
                          variant={userAutomation?.is_active ? "default" : "secondary"}
                          className={userAutomation?.is_active ? "bg-success text-success-foreground" : ""}
                        >
                          {userAutomation?.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {automationDetails.description}
                      </p>
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem 
                          onClick={() => navigate(`/automation/${automationDetails.id}`)}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        {userAutomation && (
                          <DropdownMenuItem 
                            onClick={() => handleToggleActive(automationDetails.id, userAutomation.is_active)}
                          >
                            {userAutomation.is_active ? "Deactivate" : "Activate"}
                          </DropdownMenuItem>
                        )}
                        {!isExclusive && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                <Trash2 className="w-4 h-4 mr-2 text-destructive" />
                                <span className="text-destructive">Remove</span>
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Remove Automation</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to remove "{automationDetails.title}" from your automation list? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => handleRemoveAutomation(automationDetails.id, isExclusive)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Remove
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">Category</p>
                        <p className="text-sm">{formatCategory(automationDetails.category)}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">Platforms</p>
                        <p className="text-sm">{formatPlatforms(automationDetails.platforms)}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">Rating</p>
                        <div className="flex items-center gap-1">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                className={`w-4 h-4 ${i < automationDetails.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                              />
                            ))}
                          </div>
                          <span className="text-sm text-muted-foreground ml-1">
                            ({automationDetails.reviews_count} reviews)
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">Cost per Use</p>
                        <p className="text-lg font-semibold">{formatPrice(automationDetails.cost)}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">Estimated Monthly Revenue</p>
                        <div className="flex items-center gap-2">
                          <p className="text-lg font-semibold text-success">${generateRevenue(automationDetails.cost)}</p>
                          <TrendingUp className="w-4 h-4 text-success" />
                        </div>
                        <p className="text-xs text-muted-foreground">Based on 10 uses/month</p>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">Status</p>
                        <Badge variant="outline" className="text-xs">
                          {automationDetails.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Key Features</p>
                    <div className="flex flex-wrap gap-2">
                      {automationDetails.features.map((feature, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
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