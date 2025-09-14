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

// Mock automation data - in real app this would come from user's saved automations
const mockAutomations = [
  { id: "1", title: "Instagram Growth Bot", price: "$199", category: "Social Media" },
  { id: "2", title: "Lead Generation System", price: "$299", category: "Sales" },
  { id: "3", title: "Customer Support Bot", price: "$149", category: "Support" },
  { id: "4", title: "Email Marketing Automation", price: "$179", category: "Marketing" },
  { id: "5", title: "Content Scheduler Pro", price: "$129", category: "Content" },
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
      const selectedAutomation = mockAutomations.find(auto => auto.id === data.automationId);
      
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
          automation_price: selectedAutomation?.price || data.customPrice,
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

  const selectedAutomation = mockAutomations.find(
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
                        {mockAutomations.map((automation) => (
                          <SelectItem key={automation.id} value={automation.id}>
                            <div className="flex items-center justify-between w-full">
                              <span>{automation.title}</span>
                              <div className="flex items-center gap-2 ml-4">
                                <Badge variant="secondary">{automation.category}</Badge>
                                <span className="font-semibold text-primary">{automation.price}</span>
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
                    <span className="text-lg font-bold text-primary">{selectedAutomation.price}</span>
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