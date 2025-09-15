import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { DollarSign, ShoppingCart, TrendingUp, Users } from "lucide-react";

// Mock analytics data
const salesData = [
  { month: "Jan", automations: 45, revenue: 6750 },
  { month: "Feb", automations: 52, revenue: 7800 },
  { month: "Mar", automations: 48, revenue: 7200 },
  { month: "Apr", automations: 61, revenue: 9150 },
  { month: "May", automations: 55, revenue: 8250 },
  { month: "Jun", automations: 67, revenue: 10050 },
];

const categoryData = [
  { name: "Social Media", value: 35, color: "hsl(var(--primary))" },
  { name: "Email Marketing", value: 25, color: "hsl(var(--secondary))" },
  { name: "Lead Generation", value: 20, color: "hsl(var(--accent))" },
  { name: "E-commerce", value: 12, color: "hsl(var(--muted))" },
  { name: "Analytics", value: 8, color: "hsl(var(--destructive))" },
];

const revenueData = [
  { month: "Jan", revenue: 6750 },
  { month: "Feb", revenue: 7800 },
  { month: "Mar", revenue: 7200 },
  { month: "Apr", revenue: 9150 },
  { month: "May", revenue: 8250 },
  { month: "Jun", revenue: 10050 },
];

export function Analytics() {
  const totalAutomationsSold = salesData.reduce((sum, item) => sum + item.automations, 0);
  const totalRevenue = salesData.reduce((sum, item) => sum + item.revenue, 0);
  const avgOrderValue = totalRevenue / totalAutomationsSold;
  const growthRate = ((salesData[5].revenue - salesData[0].revenue) / salesData[0].revenue * 100);

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
            <div className="text-2xl font-bold">{totalAutomationsSold}</div>
            <p className="text-xs text-muted-foreground">+12% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+{growthRate.toFixed(1)}% from first month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Order Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${avgOrderValue.toFixed(0)}</div>
            <p className="text-xs text-muted-foreground">+3% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,284</div>
            <p className="text-xs text-muted-foreground">+8% from last month</p>
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
                <BarChart data={salesData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
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
                  <Bar dataKey="automations" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
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
                <LineChart data={revenueData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
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
                    data={categoryData}
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
                    {categoryData.map((entry, index) => (
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
              {[
                { name: "Social Media Content Calendar", sales: 67, revenue: 10050 },
                { name: "Email Marketing Automation", sales: 45, revenue: 5400 },
                { name: "Lead Qualification System", sales: 38, revenue: 7600 },
                { name: "E-commerce Order Processing", sales: 32, revenue: 4800 },
              ].map((automation, index) => (
                <div key={automation.name} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{automation.name}</p>
                    <p className="text-sm text-muted-foreground">{automation.sales} sales</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">${automation.revenue.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}