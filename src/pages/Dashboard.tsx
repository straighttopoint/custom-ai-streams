import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { Marketplace } from "@/components/marketplace/Marketplace";
import { AutomationList } from "@/components/automation/AutomationList";
import { Analytics } from "@/components/analytics/Analytics";
import NewOrder from "./NewOrder";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("marketplace");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const renderContent = () => {
    switch (activeTab) {
      case "marketplace":
        return <Marketplace />;
      case "automation-list":
        return <AutomationList />;
      case "custom-requests":
        return <div>Custom Requests - Coming Soon</div>;
      case "active-orders":
        return <div>Active Orders - Coming Soon</div>;
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
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />
      
      <div className="flex-1 flex flex-col">
          <Header />
        <main className="flex-1 p-2 max-h-[100%] overflow-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}