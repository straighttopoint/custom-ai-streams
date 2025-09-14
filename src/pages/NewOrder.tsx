import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CalendarIcon, UserIcon, BuildingIcon, HashIcon, ClockIcon, CreditCardIcon, ExternalLinkIcon } from "lucide-react";

const formSchema = z.object({
  clientName: z.string().min(2, "Client name must be at least 2 characters"),
  clientEmail: z.string().email("Please enter a valid email address"),
  clientPhone: z.string().min(10, "Phone number must be at least 10 digits"),
  companyName: z.string().min(1, "Company name is required"),
  industry: z.string().min(1, "Industry is required"),
  websiteUrl: z.string().url("Please enter a valid website URL").optional().or(z.literal("")),
  instagramHandle: z.string().optional(),
  facebookPage: z.string().optional(),
  twitterHandle: z.string().optional(),
  linkedinProfile: z.string().optional(),
  automationId: z.string().min(1, "Please select an automation"),
  projectDescription: z.string().min(10, "Please provide a detailed project description"),
  meetingDate: z.string().min(1, "Please select a meeting date and time"),
  paymentFormat: z.enum(["recurring", "fixed"], {
    required_error: "Please select a payment format",
  }),
  customPrice: z.string().min(1, "Please enter the agreed price"),
  specialRequirements: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

// All available automations from marketplace
const allAutomations = [
  {
    id: "1",
    title: "Social Media Content Calendar",
    description: "Automatically generate and schedule social media posts across multiple platforms with AI-generated content and optimal timing.",
    category: "Social Media Management",
    rating: 4.8,
    reviews: 124,
    cost: 150,
    suggestedPrice: 500,
    profit: 350,
    tags: ["Instagram", "LinkedIn", "Twitter", "AI Content"],
    isActive: true,
  },
  {
    id: "2",
    title: "Lead Qualification System",
    description: "Intelligent lead scoring and qualification automation that routes qualified prospects directly to your CRM with enriched data.",
    category: "Lead Generation",
    rating: 4.9,
    reviews: 89,
    cost: 200,
    suggestedPrice: 800,
    profit: 600,
    tags: ["CRM", "Lead Scoring", "Email Automation"],
    isActive: true,
  },
  {
    id: "3",
    title: "Content Generation Pipeline",
    description: "End-to-end content creation workflow from research to publication, including blog posts, social media, and newsletters.",
    category: "Content Generation",
    rating: 4.7,
    reviews: 156,
    cost: 180,
    suggestedPrice: 650,
    profit: 470,
    tags: ["Blog Posts", "SEO", "Newsletter", "Research"],
    isActive: true,
  },
  {
    id: "4",
    title: "Customer Support Bot",
    description: "24/7 intelligent customer support automation with natural language processing and escalation workflows.",
    category: "Customer Support",
    rating: 4.6,
    reviews: 203,
    cost: 120,
    suggestedPrice: 450,
    profit: 330,
    tags: ["Chatbot", "NLP", "Support Tickets"],
    isActive: true,
  },
  {
    id: "5",
    title: "Email Marketing Automation",
    description: "Sophisticated email campaigns with behavioral triggers, A/B testing, and performance optimization.",
    category: "Email Marketing",
    rating: 4.8,
    reviews: 167,
    cost: 100,
    suggestedPrice: 400,
    profit: 300,
    tags: ["Email Campaigns", "A/B Testing", "Analytics"],
    isActive: true,
  },
  {
    id: "6",
    title: "E-commerce Order Processing",
    description: "Complete order fulfillment automation from payment processing to inventory management and shipping notifications.",
    category: "E-commerce",
    rating: 4.9,
    reviews: 134,
    cost: 250,
    suggestedPrice: 900,
    profit: 650,
    tags: ["Payment Processing", "Inventory", "Shipping"],
    isActive: true,
  },
  {
    id: "7",
    title: "Data Analytics Dashboard",
    description: "Automated data collection, processing, and visualization with real-time reporting and insights generation.",
    category: "Analytics",
    rating: 4.7,
    reviews: 98,
    cost: 200,
    suggestedPrice: 750,
    profit: 550,
    tags: ["Data Visualization", "Real-time", "Reporting"],
    isActive: true,
  },
  {
    id: "8",
    title: "Appointment Scheduling System",
    description: "Smart booking automation with calendar integration, reminder notifications, and rescheduling capabilities.",
    category: "Scheduling",
    rating: 4.5,
    reviews: 145,
    cost: 80,
    suggestedPrice: 350,
    profit: 270,
    tags: ["Calendar", "Booking", "Notifications"],
    isActive: true,
  },
  {
    id: "9",
    title: "Inventory Management System",
    description: "Automated stock tracking, reorder alerts, and supplier communication with demand forecasting.",
    category: "Inventory",
    rating: 4.6,
    reviews: 112,
    cost: 180,
    suggestedPrice: 600,
    profit: 420,
    tags: ["Stock Tracking", "Forecasting", "Suppliers"],
    isActive: true,
  },
  {
    id: "10",
    title: "Financial Reporting Automation",
    description: "Comprehensive financial analysis and reporting with automated data collection from multiple sources.",
    category: "Finance",
    rating: 4.8,
    reviews: 87,
    cost: 220,
    suggestedPrice: 850,
    profit: 630,
    tags: ["Financial Analysis", "Reporting", "Multi-source"],
    isActive: true,
  },
];

export default function NewOrder() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      clientName: "",
      clientEmail: "",
      clientPhone: "",
      companyName: "",
      industry: "",
      websiteUrl: "",
      instagramHandle: "",
      facebookPage: "",
      twitterHandle: "",
      linkedinProfile: "",
      automationId: "",
      projectDescription: "",
      meetingDate: "",
      paymentFormat: "fixed" as const,
      customPrice: "",
      specialRequirements: "",
    },
  });

  const onSubmit = async (data: FormData) => {
    if (!user) {
      toast.error("You must be logged in to create an order");
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Get automation details
      const selectedAutomation = allAutomations.find(auto => auto.id === data.automationId);
      
      // Create order in database
      const { error } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          client_name: data.clientName,
          client_email: data.clientEmail,
          client_phone: data.clientPhone,
          company_name: data.companyName,
          industry: data.industry,
          website_url: data.websiteUrl || null,
          instagram_handle: data.instagramHandle || null,
          facebook_page: data.facebookPage || null,
          twitter_handle: data.twitterHandle || null,
          linkedin_profile: data.linkedinProfile || null,
          automation_id: data.automationId,
          automation_title: selectedAutomation?.title || 'Unknown Automation',
          automation_price: `$${selectedAutomation?.suggestedPrice || 0}`,
          automation_category: selectedAutomation?.category || null,
          project_description: data.projectDescription,
          special_requirements: data.specialRequirements || null,
          meeting_date: data.meetingDate,
          payment_format: data.paymentFormat,
          agreed_price: data.customPrice,
          status: 'order_created'
        });

      if (error) {
        throw error;
      }

      toast.success("Order created successfully!");
      
      // Navigate back to dashboard with orders tab active
      navigate('/dashboard');
      window.dispatchEvent(new CustomEvent('setActiveTab', { detail: 'orders' }));
      
    } catch (error) {
      console.error('Error creating order:', error);
      toast.error("Failed to create order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedAutomation = allAutomations.find(
    automation => automation.id === form.watch("automationId")
  );

  return (

      <div className="max-w-4xl mx-auto space-y-8 py-8">
        <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">New Order Request</h1>
        <p className="text-muted-foreground">
          Fill out this form to submit a new automation order for your client
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Client Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserIcon className="w-5 h-5" />
                Client Information
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="clientName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Client Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="clientEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="john@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="clientPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder="+1 (555) 123-4567" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="companyName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Acme Corporation" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="industry"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Industry</FormLabel>
                    <FormControl>
                      <Input placeholder="E-commerce, SaaS, etc." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="websiteUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Website URL (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Social Media Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HashIcon className="w-5 h-5" />
                Social Media Presence
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="instagramHandle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Instagram Handle (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="@username" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="facebookPage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Facebook Page (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="facebook.com/page" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="twitterHandle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Twitter Handle (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="@username" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

          

              <FormField
                control={form.control}
                name="linkedinProfile"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>LinkedIn Profile (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="linkedin.com/in/username" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Automation Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BuildingIcon className="w-5 h-5" />
                Automation Selection
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="automationId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Select Automation</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose from your automation list" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {allAutomations.map((automation) => (
                          <SelectItem key={automation.id} value={automation.id}>
                            <div className="flex items-center justify-between w-full">
                              <span>{automation.title}</span>
                              <div className="flex items-center gap-2 ml-4">
                                <Badge variant="secondary">{automation.category}</Badge>
                                <span className="font-semibold text-primary">${automation.suggestedPrice}</span>
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {selectedAutomation && (
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-semibold mb-2">Selected Automation:</h4>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{selectedAutomation.title}</p>
                      <Badge variant="secondary">{selectedAutomation.category}</Badge>
                    </div>
                    <span className="text-lg font-bold text-primary">${selectedAutomation.suggestedPrice}</span>
                  </div>
                </div>
              )}

              <FormField
                control={form.control}
                name="projectDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe the specific requirements, goals, and expectations for this automation project..."
                        className="min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Scheduling & Payment */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClockIcon className="w-5 h-5" />
                Meeting Schedule
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4" />
                    Book Meeting with Our Team
                  </h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Schedule a consultation meeting using our unified booking system
                  </p>
                  <div className="flex items-center gap-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => window.open("https://calendly.com/your-company/consultation", "_blank")}
                      className="flex items-center gap-2"
                    >
                      <ExternalLinkIcon className="w-4 h-4" />
                      Open Calendly Booking
                    </Button>
                    <span className="text-xs text-muted-foreground">Opens in new tab</span>
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="meetingDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirmed Meeting Date & Time</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., January 15, 2024 at 2:00 PM EST"
                          {...field}
                        />
                      </FormControl>
                      <p className="text-xs text-muted-foreground">
                        After booking through Calendly, enter the confirmed date and time here
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Payment Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCardIcon className="w-5 h-5" />
                Payment Terms
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="paymentFormat"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Payment Format</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="fixed" id="fixed" />
                          <label htmlFor="fixed" className="cursor-pointer">
                            <div>
                              <p className="font-medium">Fixed Payment</p>
                              <p className="text-sm text-muted-foreground">One-time payment for the entire project</p>
                            </div>
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="recurring" id="recurring" />
                          <label htmlFor="recurring" className="cursor-pointer">
                            <div>
                              <p className="font-medium">Recurring Payment</p>
                              <p className="text-sm text-muted-foreground">Monthly subscription for ongoing automation service</p>
                            </div>
                          </label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="customPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Agreed Price</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="$299 or $99/month"
                        {...field}
                      />
                    </FormControl>
                    <p className="text-xs text-muted-foreground">
                      Enter the price you've agreed with your client (e.g., $299 for fixed or $99/month for recurring)
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="specialRequirements"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Special Requirements (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Any special requirements, deadlines, custom terms, or additional notes..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end pb-8">
            <Button
              type="submit"
              size="lg"
              disabled={isSubmitting}
              className="min-w-[200px]"
            >
              {isSubmitting ? "Submitting Order..." : "Submit Order Request"}
            </Button>
          </div>
        </form>
      </Form>
      </div>

  );
}