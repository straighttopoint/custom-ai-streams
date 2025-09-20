import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
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
    queryKey: ["orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*");
      if (error) throw error;
      return data;
    },
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

  const { data: automations } = useQuery({
    queryKey: ["automations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("automations")
        .select("*");
      if (error) throw error;
      return data;
    },
  });

  const { data: userCount } = useQuery({
    queryKey: ["user-count"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });
      if (error) throw error;
      return count || 0;
    },
  });

  useEffect(() => {
    if (orders && automations) {
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
        totalUsers: userCount || 0,
        topAutomations
      });
    }
  }, [orders, automations, userCount]);

  return (
    <div className="space-y-6 overflow-auto">
      <div>
        <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
        <p className="text-muted-foreground">Overview of your automation marketplace performance</p>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Automations Sold</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.totalOrders}</div>
            <p className="text-xs text-muted-foreground">Total orders placed</p>
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
            <CardTitle className="text-sm font-medium">Platform Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.totalUsers}</div>
            <p className="text-xs text-muted-foreground">Total registered users</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Over Time */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                automations: {
                  label: "Automations Sold",
                  color: "hsl(var(--primary))",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
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

        {/* Revenue Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                revenue: {
                  label: "Revenue ($)",
                  color: "hsl(var(--secondary))",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analyticsData.monthlyOrders} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
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
                    tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                  />
                  <ChartTooltip 
                    content={<ChartTooltipContent />}
                    formatter={(value) => [`$${value}`, "Revenue"]}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={3}
                    dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 6 }}
                    activeDot={{ r: 8, stroke: "hsl(var(--primary))", strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Category Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Sales by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                category: {
                  label: "Category",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analyticsData.categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    stroke="hsl(var(--background))"
                    strokeWidth={2}
                  >
                    {analyticsData.categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <ChartTooltip 
                    content={<ChartTooltipContent />}
                    formatter={(value) => [`${value}%`, "Percentage"]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Top Performing Automations */}
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Automations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analyticsData.topAutomations.length > 0 ? (
                analyticsData.topAutomations.map((automation, index) => (
                  <div key={automation.name} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{automation.name}</p>
                      <p className="text-sm text-muted-foreground">{automation.sales} sales</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">${automation.revenue.toLocaleString()}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  <p>No order data available yet.</p>
                  <p className="text-sm">Start selling automations to see analytics!</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}