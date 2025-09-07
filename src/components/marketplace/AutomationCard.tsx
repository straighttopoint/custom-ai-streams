import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Star, Bot, Plus, Eye, DollarSign, TrendingUp } from "lucide-react";

interface AutomationCardProps {
  id: string;
  title: string;
  description: string;
  category: string;
  rating: number;
  reviews: number;
  cost: number;
  suggestedPrice: number;
  profit: number;
  image?: string;
  tags: string[];
  isActive: boolean;
}

export function AutomationCard({
  id,
  title,
  description,
  category,
  rating,
  reviews,
  cost,
  suggestedPrice,
  profit,
  image,
  tags,
  isActive
}: AutomationCardProps) {
  const profitMargin = ((profit / suggestedPrice) * 100).toFixed(1);

  return (
    <Card className="group hover:shadow-lg transition-all duration-200 border-border">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
            {image ? (
              <img src={image} alt={title} className="w-12 h-12 object-cover rounded" />
            ) : (
              <Bot className="w-8 h-8 text-primary" />
            )}
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
                <Badge variant={isActive ? "default" : "secondary"} className="bg-success text-success-foreground">
                  {isActive ? "Active" : "Draft"}
                </Badge>
              </div>
            </div>

            <div className="flex items-center gap-4 mt-3">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-warning text-warning" />
                <span className="text-sm font-medium">{rating}</span>
                <span className="text-sm text-muted-foreground">({reviews})</span>
              </div>
              
              <Badge variant="outline" className="text-xs">
                {category}
              </Badge>
            </div>

            <div className="flex flex-wrap gap-1 mt-2">
              {tags.map((tag, index) => (
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
            <p className="font-semibold">${cost}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Suggested Price</p>
            <p className="font-semibold">${suggestedPrice}</p>
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
        <Button variant="outline" size="sm" className="flex-1">
          <Eye className="w-4 h-4 mr-2" />
          Preview
        </Button>
        <Button size="sm" className="flex-1 bg-primary hover:bg-primary/90">
          <Plus className="w-4 h-4 mr-2" />
          Add to List
        </Button>
      </CardFooter>
    </Card>
  );
}