import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminOrders } from "@/components/admin/AdminOrders";
import { AdminAutomations } from "@/components/admin/AdminAutomations";
import { AdminSupport } from "@/components/admin/AdminSupport";
import { AdminCustomRequests } from "@/components/admin/AdminCustomRequests";
import { Settings, ShoppingCart, Bot, MessageSquare, FileText } from "lucide-react";

const AdminDashboard = () => {
  const { user, loading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);

  useEffect(() => {
    if (user?.email) {
      // Check if user is admin
      const adminEmail = 'straighttopoint.business@gmail.com';
      setIsAdmin(user.email === adminEmail);
      setCheckingAdmin(false);
    } else if (!loading) {
      setCheckingAdmin(false);
    }
  }, [user, loading]);

  if (loading || checkingAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <div className="flex items-center space-x-2">
              <Settings className="h-5 w-5" />
              <span className="text-sm text-muted-foreground">{user.email}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <Tabs defaultValue="orders" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="orders" className="flex items-center space-x-2">
              <ShoppingCart className="h-4 w-4" />
              <span>Orders</span>
            </TabsTrigger>
            <TabsTrigger value="automations" className="flex items-center space-x-2">
              <Bot className="h-4 w-4" />
              <span>Automations</span>
            </TabsTrigger>
            <TabsTrigger value="support" className="flex items-center space-x-2">
              <MessageSquare className="h-4 w-4" />
              <span>Support</span>
            </TabsTrigger>
            <TabsTrigger value="requests" className="flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span>Custom Requests</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>Order Management</CardTitle>
              </CardHeader>
              <CardContent>
                <AdminOrders />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="automations">
            <Card>
              <CardHeader>
                <CardTitle>Automation Management</CardTitle>
              </CardHeader>
              <CardContent>
                <AdminAutomations />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="support">
            <Card>
              <CardHeader>
                <CardTitle>Support Management</CardTitle>
              </CardHeader>
              <CardContent>
                <AdminSupport />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="requests">
            <Card>
              <CardHeader>
                <CardTitle>Custom Request Management</CardTitle>
              </CardHeader>
              <CardContent>
                <AdminCustomRequests />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminDashboard;