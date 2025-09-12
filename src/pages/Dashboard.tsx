import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { Marketplace } from "@/components/marketplace/Marketplace";
import { AutomationList } from "@/components/automation/AutomationList";
import { Analytics } from "@/components/analytics/Analytics";
import { ActiveOrders } from "@/components/orders/ActiveOrders";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import NewOrder from "./NewOrder";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("marketplace");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleSetActiveTab = (event: CustomEvent) => {
      setActiveTab(event.detail);
    };
    
    window.addEventListener('setActiveTab', handleSetActiveTab as EventListener);
    
    return () => {
      window.removeEventListener('setActiveTab', handleSetActiveTab as EventListener);
    };
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const renderContent = () => {
    switch (activeTab) {
      case "marketplace":
        return <Marketplace />;
      case "automation-list":
        return <AutomationList />;
      case "custom-requests":
        return <div>Custom Requests - Coming Soon</div>;
      case "active-orders":
        return <ActiveOrders />;
      case "new-order":
        return <NewOrder />;
      case "analytics":
        return <Analytics />;
      case "support":
        return <div>Support - Coming Soon</div>;
      default:
        return <Marketplace />;
    }
  };

  return (
    <div className="flex max-h-screen overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />
      </div>

      {/* Mobile Sidebar Sheet */}
      <Sheet open={isMobileSidebarOpen} onOpenChange={setIsMobileSidebarOpen}>
        <SheetContent side="left" className="p-0 w-64 md:hidden">
          <SheetHeader>
            <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
          </SheetHeader>
          <Sidebar
            activeTab={activeTab}
            onTabChange={(tab) => {
              setActiveTab(tab);
              setIsMobileSidebarOpen(false);
            }}
            isCollapsed={false}
            onToggleCollapse={() => {}}
          />
        </SheetContent>
      </Sheet>
      
      <div className="flex-1 flex flex-col">
        <div className="flex items-center">
          {/* Mobile Hamburger Menu */}
          <div className="md:hidden">
            <Sheet open={isMobileSidebarOpen} onOpenChange={setIsMobileSidebarOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="m-2">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
            </Sheet>
          </div>
          <div className="flex-1">
            <Header />
          </div>
        </div>
        <main className="flex-1 p-2 max-h-[100%] overflow-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}