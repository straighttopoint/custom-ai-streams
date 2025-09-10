import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot, Settings, Play, Pause, Trash2 } from "lucide-react";

// Mock data for user's automation list
const userAutomations = [
  {
    id: "1",
    title: "Social Media Content Calendar",
    category: "Social Media Management",
    cost: 150,
    isActive: true,
    dateAdded: "2024-01-15",
  },
  {
    id: "2", 
    title: "Lead Qualification System",
    category: "Lead Generation",
    cost: 200,
    isActive: true,
    dateAdded: "2024-01-10",
  },
  {
    id: "3",
    title: "Email Marketing Automation", 
    category: "Email Marketing",
    cost: 120,
    isActive: false,
    dateAdded: "2024-01-08",
  },
];

export function AutomationList() {
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
          <Card key={automation.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Bot className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{automation.title}</CardTitle>
                    <p className="text-sm text-muted-foreground">{automation.category}</p>
                  </div>
                </div>
                
                <Badge variant={automation.isActive ? "default" : "secondary"}>
                  {automation.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div>
                    <p className="text-sm text-muted-foreground">Monthly Cost</p>
                    <p className="font-semibold">${automation.cost}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Date Added</p>
                    <p className="font-semibold">{new Date(automation.dateAdded).toLocaleDateString()}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Settings className="w-4 h-4 mr-2" />
                    Configure
                  </Button>
                  
                  <Button 
                    variant={automation.isActive ? "secondary" : "default"} 
                    size="sm"
                  >
                    {automation.isActive ? (
                      <>
                        <Pause className="w-4 h-4 mr-2" />
                        Pause
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-2" />
                        Activate
                      </>
                    )}
                  </Button>
                  
                  <Button variant="outline" size="sm" className="text-destructive hover:bg-destructive hover:text-destructive-foreground">
                    <Trash2 className="w-4 h-4" />
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