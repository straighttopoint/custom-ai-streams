import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Calendar, DollarSign, User, Settings, Mail, Phone } from "lucide-react";

// Mock data - in real app this would come from API
const mockOrderDetails = {
  "ORD-001": {
    id: "ORD-001",
    clientName: "John Smith",
    clientEmail: "john@company.com",
    clientPhone: "+1 (555) 123-4567",
    company: "Smith Enterprises",
    automationType: "Lead Generation Bot",
    automationDescription: "Advanced AI-powered lead generation system that identifies and qualifies potential customers through multiple channels including social media, email campaigns, and web scraping.",
    monthlyPrice: 299,
    setupFee: 199,
    status: "setup",
    dateCreated: "2024-01-15",
    nextBilling: "2024-02-15",
    paymentMethod: "Credit Card (**** 1234)",
    socialMediaAccounts: {
      facebook: "@smithenterprises",
      instagram: "@smith_biz",
      linkedin: "company/smith-enterprises",
      twitter: "@smithent"
    },
    projectRequirements: "Focus on B2B lead generation in the technology sector. Target companies with 50-500 employees. Priority on decision makers and C-level executives.",
    technicalNotes: "Integration with HubSpot CRM required. API keys configured. Webhook endpoints established.",
    timeline: [
      { date: "2024-01-15", event: "Order Created", status: "completed" },
      { date: "2024-01-16", event: "Initial Setup", status: "completed" },
      { date: "2024-01-18", event: "Technical Configuration", status: "completed" },
      { date: "2024-01-20", event: "Testing Phase", status: "completed" },
      { date: "2024-01-22", event: "Go Live", status: "completed" }
    ]
  },
  "ORD-002": {
    id: "ORD-002",
    clientName: "Sarah Johnson",
    clientEmail: "sarah@business.com",
    clientPhone: "+1 (555) 987-6543",
    company: "Johnson Marketing",
    automationType: "Social Media Scheduler",
    automationDescription: "Comprehensive social media management automation that schedules posts, monitors engagement, and provides analytics across all major platforms.",
    monthlyPrice: 199,
    setupFee: 99,
    status: "technical-setup",
    dateCreated: "2024-01-12",
    nextBilling: "2024-02-12",
    paymentMethod: "Bank Transfer",
    socialMediaAccounts: {
      facebook: "@johnsonmarketing",
      instagram: "@johnson_marketing",
      linkedin: "company/johnson-marketing",
      twitter: "@johnsonmkt"
    },
    projectRequirements: "Multi-platform posting with content calendar. Focus on engagement optimization and brand consistency.",
    technicalNotes: "API integrations in progress for Instagram and LinkedIn. Facebook and Twitter completed.",
    timeline: [
      { date: "2024-01-12", event: "Order Created", status: "completed" },
      { date: "2024-01-13", event: "Initial Setup", status: "completed" },
      { date: "2024-01-15", event: "Technical Configuration", status: "in-progress" },
      { date: "2024-01-17", event: "Testing Phase", status: "pending" },
      { date: "2024-01-19", event: "Go Live", status: "pending" }
    ]
  }
};

const getStatusBadge = (status: string) => {
  const statusConfig = {
    setup: { label: "Setup Complete", className: "bg-success text-success-foreground" },
    "not-setup": { label: "Not Setup", className: "bg-muted text-muted-foreground" },
    pending: { label: "Pending", className: "bg-warning/10 text-warning border-warning" },
    "technical-setup": { label: "Technical Setup", className: "bg-primary/10 text-primary border-primary" },
  };

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
  return (
    <Badge className={config.className}>
      {config.label}
    </Badge>
  );
};

const getTimelineStatusBadge = (status: string) => {
  const statusConfig = {
    completed: { label: "Completed", className: "bg-success text-success-foreground" },
    "in-progress": { label: "In Progress", className: "bg-primary text-primary-foreground" },
    pending: { label: "Pending", className: "bg-muted text-muted-foreground" },
  };

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  );
};

export default function OrderDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const order = id ? mockOrderDetails[id as keyof typeof mockOrderDetails] : null;

  if (!order) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-foreground mb-2">Order Not Found</h2>
          <p className="text-muted-foreground mb-4">The order you're looking for doesn't exist.</p>
          <Button onClick={() => navigate("/dashboard")}>Back to Dashboard</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-4">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => navigate("/dashboard")}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Orders
        </Button>
        <h1 className="text-3xl font-bold text-foreground">Order Details - {order.id}</h1>
        {getStatusBadge(order.status)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Client Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <User className="h-5 w-5" />
                Client Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Name</label>
                  <p className="text-foreground">{order.clientName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Company</label>
                  <p className="text-foreground">{order.company}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Email</label>
                  <p className="text-foreground">{order.clientEmail}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Phone</label>
                  <p className="text-foreground">{order.clientPhone}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Automation Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Settings className="h-5 w-5" />
                Automation Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Automation Type</label>
                <p className="text-lg font-semibold text-foreground">{order.automationType}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Description</label>
                <p className="text-foreground">{order.automationDescription}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Project Requirements</label>
                <p className="text-foreground">{order.projectRequirements}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Technical Notes</label>
                <p className="text-foreground">{order.technicalNotes}</p>
              </div>
            </CardContent>
          </Card>

          {/* Social Media Accounts */}
          <Card>
            <CardHeader>
              <CardTitle className="text-foreground">Social Media Accounts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(order.socialMediaAccounts).map(([platform, handle]) => (
                  <div key={platform}>
                    <label className="text-sm font-medium text-muted-foreground capitalize">{platform}</label>
                    <p className="text-foreground">{handle}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <DollarSign className="h-5 w-5" />
                Order Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Setup Fee</span>
                <span className="font-medium text-foreground">${order.setupFee}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Monthly Price</span>
                <span className="font-medium text-foreground">${order.monthlyPrice}</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Payment Method</span>
                <span className="text-sm text-foreground">{order.paymentMethod}</span>
              </div>
            </CardContent>
          </Card>

          {/* Important Dates */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Calendar className="h-5 w-5" />
                Important Dates
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Order Date</label>
                <p className="text-foreground">{order.dateCreated}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Next Billing</label>
                <p className="text-foreground">{order.nextBilling}</p>
              </div>
            </CardContent>
          </Card>

          {/* Project Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="text-foreground">Project Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.timeline.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground">{item.event}</p>
                      <p className="text-sm text-muted-foreground">{item.date}</p>
                    </div>
                    {getTimelineStatusBadge(item.status)}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}