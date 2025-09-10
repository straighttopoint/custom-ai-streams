import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

// Mock data for user's automation list
const userAutomations = [
  {
    id: "1",
    title: "Social Media Content Calendar",
    category: "Social Media Management",
    cost: 150,
    image: null,
    dateAdded: "2024-01-15",
  },
  {
    id: "2", 
    title: "Lead Qualification System",
    category: "Lead Generation",
    cost: 200,
    image: null,
    dateAdded: "2024-01-10",
  },
  {
    id: "3",
    title: "Email Marketing Automation", 
    category: "Email Marketing",
    cost: 120,
    image: null,
    dateAdded: "2024-01-08",
  },
];

export function AutomationList() {
  const navigate = useNavigate();
  return (
    <div className="space-y-6 overflow-auto">
      <div>
        <h1 className="text-3xl font-bold">My Automations</h1>
        <p className="text-muted-foreground mt-2">
          Manage your automation portfolio. Configure, activate, and monitor your AI automations.
        </p>
      </div>

      <div className="grid gap-4">
        {userAutomations.map((automation) => (
          <Card 
            key={automation.id} 
            className="hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => navigate(`/automation/${automation.id}`)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    {automation.image ? (
                      <img 
                        src={automation.image} 
                        alt={automation.title} 
                        className="w-14 h-14 object-cover rounded" 
                      />
                    ) : (
                      <Bot className="w-8 h-8 text-primary" />
                    )}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{automation.title}</CardTitle>
                    <p className="text-sm text-muted-foreground">{automation.category}</p>
                  </div>
                </div>
                
                <Badge variant="default" className="bg-success text-success-foreground">
                  Active
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div>
                    <p className="text-sm text-muted-foreground">Automation Cost</p>
                    <p className="font-semibold">${automation.cost}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Date Added</p>
                    <p className="font-semibold">{new Date(automation.dateAdded).toLocaleDateString()}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Handle remove logic here
                    }}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Remove
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {userAutomations.length === 0 && (
        <div className="text-center py-12">
          <Bot className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Automations Added</h3>
          <p className="text-muted-foreground mb-4">
            Start building your automation portfolio by adding automations from the marketplace.
          </p>
          <Button>Browse Marketplace</Button>
        </div>
      )}
    </div>
  );
}