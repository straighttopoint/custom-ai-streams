import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { DollarSign, ShoppingCart, TrendingUp, Users } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";

interface AnalyticsData {
  monthlyOrders: { month: string; orders: number; revenue: number }[];
  categoryData: { name: string; value: number; color: string }[];
  totalOrders: number;
  totalRevenue: number;
  avgOrderValue: number;
  totalUsers: number;
  topAutomations: { name: string; sales: number; revenue: number }[];
}

export function Analytics() {
  const { user } = useAuth();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    monthlyOrders: [],
    categoryData: [],
    totalOrders: 0,
    totalRevenue: 0,
    avgOrderValue: 0,
    totalUsers: 0,
    topAutomations: []
  });

  const { data: orders } = useQuery({
    queryKey: ["user-orders", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", user.id);
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const { data: walletData } = useQuery({
    queryKey: ["wallet", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from("wallets")
        .select("*")
        .eq("user_id", user.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const { data: userAutomations } = useQuery({
    queryKey: ["user-automations", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("user_automations")
        .select("automation_id, automations(*)")
        .eq("user_id", user.id)
        .eq("is_active", true);
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const { data: completedOrdersCount } = useQuery({
    queryKey: ["completed-orders-count", user?.id],
    queryFn: async () => {
      if (!user?.id) return 0;
      const { count, error } = await supabase
        .from("orders")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("status", "order_completed");
      if (error) throw error;
      return count || 0;
    },
    enabled: !!user?.id,
  });

  useEffect(() => {
    if (orders) {
      // Process monthly orders data
      const monthlyOrdersMap = new Map();
      const categoryMap = new Map();
      const automationSalesMap = new Map();

      orders.forEach(order => {
        const date = new Date(order.created_at);
        const monthKey = date.toLocaleDateString('en-US', { month: 'short' });
        
        // Monthly data
        if (!monthlyOrdersMap.has(monthKey)) {
          monthlyOrdersMap.set(monthKey, { month: monthKey, orders: 0, revenue: 0 });
        }
        const monthData = monthlyOrdersMap.get(monthKey);
        monthData.orders += 1;
        
        // Parse agreed_price (e.g., "$1,000/month" -> 1000)
        const priceMatch = order.agreed_price?.match(/[\d,]+/);
        const revenue = priceMatch ? parseInt(priceMatch[0].replace(/,/g, '')) : 0;
        monthData.revenue += revenue;

        // Category data
        if (order.automation_category) {
          categoryMap.set(order.automation_category, (categoryMap.get(order.automation_category) || 0) + 1);
        }

        // Automation sales
        if (order.automation_title) {
          if (!automationSalesMap.has(order.automation_title)) {
            automationSalesMap.set(order.automation_title, { name: order.automation_title, sales: 0, revenue: 0 });
          }
          const automationData = automationSalesMap.get(order.automation_title);
          automationData.sales += 1;
          automationData.revenue += revenue;
        }
      });

      // Convert to arrays
      const monthlyOrders = Array.from(monthlyOrdersMap.values());
      
      // Category data with colors
      const categoryColors = [
        "hsl(var(--primary))",
        "hsl(var(--secondary))",
        "hsl(var(--accent))",
        "hsl(var(--muted))",
        "hsl(var(--destructive))"
      ];
      
      const categoryData = Array.from(categoryMap.entries()).map(([name, value], index) => ({
        name,
        value,
        color: categoryColors[index % categoryColors.length]
      }));

      // Top automations
      const topAutomations = Array.from(automationSalesMap.values())
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 4);

      // Calculate totals
      const totalOrders = orders.length;
      const totalRevenue = monthlyOrders.reduce((sum, item) => sum + item.revenue, 0);
      const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

      setAnalyticsData({
        monthlyOrders,
        categoryData,
        totalOrders,
        totalRevenue,
        avgOrderValue,
        totalUsers: completedOrdersCount || 0,
        topAutomations
      });
    }
  }, [orders, completedOrdersCount]);

  return (
    <div className="space-y-6 overflow-auto p-4 md:p-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Your Analytics</h1>
        <p className="text-muted-foreground">Overview of your automation sales performance</p>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Your Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.totalOrders}</div>
            <p className="text-xs text-muted-foreground">Total orders you've made</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Your Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${walletData?.total_earned?.toLocaleString() || '0'}</div>
            <p className="text-xs text-muted-foreground">Total earned from sales</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Balance</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${walletData?.available_for_withdrawal?.toLocaleString() || '0'}</div>
            <p className="text-xs text-muted-foreground">Ready for withdrawal</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Orders</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.totalUsers}</div>
            <p className="text-xs text-muted-foreground">Successfully completed</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6">
        {/* Sales Over Time */}
        <Card>
          <CardHeader>
            <CardTitle>Your Monthly Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                automations: {
                  label: "Orders Placed",
                  color: "hsl(var(--primary))",
                },
              }}
              className="h-[250px] md:h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%" minHeight={200}>
                <BarChart data={analyticsData.monthlyOrders} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <XAxis 
                    dataKey="month" 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${value}`}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="orders" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Your Most Ordered Automations */}
        <Card>
          <CardHeader>
            <CardTitle>Your Most Ordered Automations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analyticsData.topAutomations.length > 0 ? (
                analyticsData.topAutomations.map((automation, index) => (
                  <div key={automation.name} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{automation.name}</p>
                      <p className="text-sm text-muted-foreground">{automation.sales} orders</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">${automation.revenue.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">total spent</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  <p>No order data available yet.</p>
                  <p className="text-sm">Start ordering automations to see analytics!</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}