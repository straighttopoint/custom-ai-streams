import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Menu, 
  Bot, 
  ShoppingCart, 
  Package, 
  List, 
  AlertCircle, 
  BarChart3, 
  MessageSquare, 
  Settings,
  ChevronDown,
  ChevronRight,
  Shield,
  Users,
  FileText
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isAdmin?: boolean;
}

export function Sidebar({ activeTab, onTabChange, isCollapsed, onToggleCollapse, isAdmin = false }: SidebarProps) {
  const [isAutomationsExpanded, setIsAutomationsExpanded] = useState(true);
  const [isOrdersExpanded, setIsOrdersExpanded] = useState(true);
  const [isAdminExpanded, setIsAdminExpanded] = useState(true);

  const navigationItems = [
    {
      id: "marketplace",
      label: "Marketplace",
      icon: Bot,
      count: null,
    },
    {
      id: "automations",
      label: "My Automations",
      icon: Package,
      expandable: true,
      isExpanded: isAutomationsExpanded,
      onToggle: () => setIsAutomationsExpanded(!isAutomationsExpanded),
      children: [
        { id: "automation-list", label: "Automation List", icon: List },
        { id: "custom-requests", label: "Custom Requests", icon: AlertCircle },
      ]
    },
    {
      id: "orders",
      label: "Orders",
      icon: ShoppingCart,
      expandable: true,
      isExpanded: isOrdersExpanded,
      onToggle: () => setIsOrdersExpanded(!isOrdersExpanded),
      children: [
        { id: "active-orders", label: "Active Orders", icon: ShoppingCart },
        { id: "new-order", label: "New Order", icon: ShoppingCart },
      ]
    },
    {
      id: "analytics",
      label: "Analytics",
      icon: BarChart3,
    },
    {
      id: "support",
      label: "Support",
      icon: MessageSquare,
    },
    ...(isAdmin ? [{
      id: "admin",
      label: "Admin Panel",
      icon: Shield,
      expandable: true,
      isExpanded: isAdminExpanded,
      onToggle: () => setIsAdminExpanded(!isAdminExpanded),
      children: [
        { id: "admin-orders", label: "Manage Orders", icon: ShoppingCart },
        { id: "admin-automations", label: "Manage Automations", icon: Bot },
        { id: "admin-support", label: "Support Tickets", icon: MessageSquare },
        { id: "admin-requests", label: "Custom Requests", icon: FileText },
      ]
    }] : []),
  ];

  return (
    <div className={cn("bg-card border-r max-h-screen border-border transition-all duration-300", isCollapsed ? "w-16" : "w-48 sm:w-64")}>
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div>
              <h1 className="text-xl font-bold text-primary">Let Us Defy</h1>
              <p className="text-sm text-muted-foreground">
                {isAdmin ? "Admin Dashboard" : "AI Automation Platform"}
              </p>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleCollapse}
            className="h-8 w-8 p-0"
          >
            <Menu className="h-4 w-4" />
          </Button>
        </div>
      </div>


      <nav className="p-2">
        {navigationItems.map((item) => (
          <div key={item.id}>
            <Button
              variant={activeTab === item.id ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start mb-1",
                isCollapsed ? "px-2" : "px-3",
                activeTab === item.id && "bg-primary/10 text-primary border-primary/20"
              )}
              onClick={() => {
                if (item.expandable && item.onToggle) {
                  item.onToggle();
                } else {
                  onTabChange(item.id);
                }
              }}
            >
              <item.icon className={cn("h-4 w-4", !isCollapsed && "mr-3")} />
              {!isCollapsed && (
                <>
                  <span className="flex-1 text-left">{item.label}</span>
                  {item.expandable && (
                    item.isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />
                  )}
                  {item.count && (
                    <Badge variant="secondary" className="ml-2 text-xs">
                      {item.count}
                    </Badge>
                  )}
                </>
              )}
            </Button>

            {!isCollapsed && item.expandable && item.isExpanded && item.children && (
              <div className="ml-4 space-y-1">
                {item.children.map((child) => (
                  <Button
                    key={child.id}
                    variant={activeTab === child.id ? "secondary" : "ghost"}
                    className={cn(
                      "w-full justify-start text-sm",
                      activeTab === child.id && "bg-primary/10 text-primary"
                    )}
                    onClick={() => onTabChange(child.id)}
                  >
                    <child.icon className="h-3 w-3 mr-3" />
                    {child.label}
                  </Button>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>
    </div>
  );
}