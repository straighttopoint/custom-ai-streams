import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Star, Bot, Plus, Eye, TrendingUp, Check, Trash2, Crown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface AutomationCardProps {
  id: string;
  title: string;
  description: string;
  category: string[];
  platforms: string[];
  setup_time: string;
  complexity: string;
  rating: number;
  reviews_count: number;
  cost: number;
  suggested_price: number;
  profit: number;
  margin: number;
  features: string[];
  requirements: string[];
  media: any;
  status: string;
  isInUserList?: boolean;
  isExclusive?: boolean;
  onAutomationAdded?: (automationId: string) => void;
  onAutomationRemoved?: (automationId: string) => void;
}

export function AutomationCard({
  id,
  title,
  description,
  category,
  platforms,
  rating,
  reviews_count,
  cost,
  suggested_price,
  profit,
  features,
  status,
  isInUserList = false,
  isExclusive = false,
  onAutomationAdded,
  onAutomationRemoved
}: AutomationCardProps) {
  const { user } = useAuth();
  const [isAdding, setIsAdding] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const profitMargin = ((profit / suggested_price) * 100).toFixed(1);

  const navigate = useNavigate();

  const handleAddToList = async () => {
    if (!user) {
      toast.error("Please log in to add automations to your list");
      return;
    }

    setIsAdding(true);
    try {
      const { error } = await supabase
        .from('user_automations')
        .insert({
          user_id: user.id,
          automation_id: id,
          is_active: status === 'Active'
        });

      if (error) {
        if (error.code === '23505') {
          toast.error("This automation is already in your list");
        } else {
          throw error;
        }
      } else {
        // Optimistically update the UI immediately
        onAutomationAdded?.(id);
        toast.success(`${title} added to your automation list!`);
      }
    } catch (error) {
      console.error('Error adding automation:', error);
      toast.error("Failed to add automation to your list");
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemoveFromList = async () => {
    if (!user) return;

    setIsRemoving(true);
    try {
      const { error } = await supabase
        .from('user_automations')
        .delete()
        .eq('user_id', user.id)
        .eq('automation_id', id);

      if (error) throw error;

      // Optimistically update the UI immediately
      onAutomationRemoved?.(id);
      toast.success(`${title} removed from your automation list`);
    } catch (error) {
      console.error('Error removing automation:', error);
      toast.error("Failed to remove automation from your list");
    } finally {
      setIsRemoving(false);
    }
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-200 border-border">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
            <Bot className="w-8 h-8 text-primary" />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                  {title}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {description}
                </p>
              </div>
              
              <div className="flex items-center gap-1">
                {isExclusive && (
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                    <Crown className="w-3 h-3 mr-1" />
                    Exclusive
                  </Badge>
                )}
                <Badge variant={status === 'Active' ? "default" : "secondary"} className="bg-success text-success-foreground">
                  {status}
                </Badge>
              </div>
            </div>

            <div className="flex items-center gap-4 mt-3">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-warning text-warning" />
                <span className="text-sm font-medium">{rating}</span>
                <span className="text-sm text-muted-foreground">({reviews_count})</span>
              </div>
              
              <Badge variant="outline" className="text-xs">
                {category[0]}
              </Badge>
            </div>

            <div className="flex flex-wrap gap-1 mt-2">
              {platforms.slice(0, 3).map((platform, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {platform}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4 mt-6 pt-4 border-t border-border">
          <div>
            <p className="text-xs text-muted-foreground">Your Cost</p>
            <p className="font-semibold">${cost}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Suggested Price</p>
            <p className="font-semibold">${suggested_price}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Profit</p>
            <p className="font-semibold text-success flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              ${profit}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Margin</p>
            <p className="font-semibold text-success">{profitMargin}%</p>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-6 pt-0 flex gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="flex-1"
          onClick={() => navigate(`/automation/${id}`)}
        >
          <Eye className="w-4 h-4 mr-2" />
          Preview
        </Button>
        <Button 
          size="sm" 
          className={`flex-1 transition-all duration-200 ${
            isInUserList 
              ? isHovered 
                ? "bg-destructive hover:bg-destructive text-destructive-foreground" 
                : "bg-success hover:bg-success text-success-foreground"
              : "bg-primary hover:bg-primary/90"
          }`}
          onClick={isInUserList ? handleRemoveFromList : handleAddToList}
          disabled={isAdding || isRemoving}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {isAdding ? (
            <>
              <Plus className="w-4 h-4 mr-2 animate-spin" />
              Adding...
            </>
          ) : isRemoving ? (
            <>
              <Trash2 className="w-4 h-4 mr-2 animate-spin" />
              Removing...
            </>
          ) : isInUserList ? (
            isHovered ? (
              <>
                <Trash2 className="w-4 h-4 mr-2" />
                Remove from Your List
              </>
            ) : (
              <>
                <Check className="w-4 h-4 mr-2" />
                In Your List
              </>
            )
          ) : (
            <>
              <Plus className="w-4 h-4 mr-2" />
              Add to List
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}