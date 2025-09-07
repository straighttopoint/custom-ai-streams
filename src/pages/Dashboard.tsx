import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { Marketplace } from "@/components/marketplace/Marketplace";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("marketplace");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const renderContent = () => {
    switch (activeTab) {
      case "marketplace":
        return <Marketplace />;
      case "automation-list":
        return <div>My Automation List - Coming Soon</div>;
      case "custom-requests":
        return <div>Custom Requests - Coming Soon</div>;
      case "active-orders":
        return <div>Active Orders - Coming Soon</div>;
      case "new-order":
        return <div>New Order - Coming Soon</div>;
      case "analytics":
        return <div>Analytics - Coming Soon</div>;
      case "support":
        return <div>Support - Coming Soon</div>;
      default:
        return <Marketplace />;
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        
        <main className="flex-1 overflow-auto p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}