import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Eye, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Order {
  id: string;
  clientName: string;
  clientEmail: string;
  automationType: string;
  monthlyPrice: number;
  status: "setup" | "not-setup" | "pending" | "technical-setup";
  dateCreated: string;
  nextBilling: string;
}

const mockOrders: Order[] = [
  {
    id: "ORD-001",
    clientName: "John Smith",
    clientEmail: "john@company.com",
    automationType: "Lead Generation Bot",
    monthlyPrice: 299,
    status: "setup",
    dateCreated: "2024-01-15",
    nextBilling: "2024-02-15",
  },
  {
    id: "ORD-002",
    clientName: "Sarah Johnson",
    clientEmail: "sarah@business.com",
    automationType: "Social Media Scheduler",
    monthlyPrice: 199,
    status: "technical-setup",
    dateCreated: "2024-01-12",
    nextBilling: "2024-02-12",
  },
  {
    id: "ORD-003",
    clientName: "Mike Wilson",
    clientEmail: "mike@startup.io",
    automationType: "Customer Support Bot",
    monthlyPrice: 399,
    status: "pending",
    dateCreated: "2024-01-10",
    nextBilling: "2024-02-10",
  },
  {
    id: "ORD-004",
    clientName: "Emily Brown",
    clientEmail: "emily@retail.com",
    automationType: "Email Marketing Automation",
    monthlyPrice: 249,
    status: "not-setup",
    dateCreated: "2024-01-08",
    nextBilling: "2024-02-08",
  },
];

const getStatusBadge = (status: Order["status"]) => {
  const statusConfig = {
    setup: { label: "Setup Complete", variant: "default" as const, className: "bg-success text-success-foreground" },
    "not-setup": { label: "Not Setup", variant: "secondary" as const, className: "bg-muted text-muted-foreground" },
    pending: { label: "Pending", variant: "outline" as const, className: "bg-warning/10 text-warning border-warning" },
    "technical-setup": { label: "Technical Setup", variant: "outline" as const, className: "bg-primary/10 text-primary border-primary" },
  };

  const config = statusConfig[status];
  return (
    <Badge variant={config.variant} className={config.className}>
      {config.label}
    </Badge>
  );
};

export function ActiveOrders() {
  const navigate = useNavigate();

  const handleViewOrder = (orderId: string) => {
    navigate(`/order/${orderId}`);
  };

  const totalRevenue = mockOrders.reduce((sum, order) => sum + order.monthlyPrice, 0);
  const completedSetups = mockOrders.filter(order => order.status === "setup").length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-foreground">Active Orders</h1>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{mockOrders.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Monthly Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">${totalRevenue.toLocaleString()}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Completed Setups</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{completedSetups}/{mockOrders.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-foreground">Orders Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-muted-foreground">Order ID</TableHead>
                <TableHead className="text-muted-foreground">Client</TableHead>
                <TableHead className="text-muted-foreground">Automation Type</TableHead>
                <TableHead className="text-muted-foreground">Monthly Price</TableHead>
                <TableHead className="text-muted-foreground">Status</TableHead>
                <TableHead className="text-muted-foreground">Date Created</TableHead>
                <TableHead className="text-muted-foreground">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockOrders.map((order) => (
                <TableRow 
                  key={order.id} 
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => handleViewOrder(order.id)}
                >
                  <TableCell className="font-medium text-foreground">{order.id}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium text-foreground">{order.clientName}</div>
                      <div className="text-sm text-muted-foreground">{order.clientEmail}</div>
                    </div>
                  </TableCell>
                  <TableCell className="text-foreground">{order.automationType}</TableCell>
                  <TableCell className="font-medium text-foreground">${order.monthlyPrice}</TableCell>
                  <TableCell>{getStatusBadge(order.status)}</TableCell>
                  <TableCell className="text-muted-foreground">{order.dateCreated}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger 
                        asChild
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewOrder(order.id)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}