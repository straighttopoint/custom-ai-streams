import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
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
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, UserIcon, BuildingIcon, HashIcon, ClockIcon, CreditCardIcon, ExternalLinkIcon, PhoneIcon } from "lucide-react";
import { cn } from "@/lib/utils";

// Country codes data
const countryCodes = [
  { code: "+1", country: "US", flag: "🇺🇸", minLength: 10, maxLength: 10 },
  { code: "+1", country: "CA", flag: "🇨🇦", minLength: 10, maxLength: 10 },
  { code: "+44", country: "GB", flag: "🇬🇧", minLength: 10, maxLength: 11 },
  { code: "+33", country: "FR", flag: "🇫🇷", minLength: 9, maxLength: 10 },
  { code: "+49", country: "DE", flag: "🇩🇪", minLength: 10, maxLength: 12 },
  { code: "+34", country: "ES", flag: "🇪🇸", minLength: 9, maxLength: 9 },
  { code: "+39", country: "IT", flag: "🇮🇹", minLength: 10, maxLength: 11 },
  { code: "+31", country: "NL", flag: "🇳🇱", minLength: 9, maxLength: 9 },
  { code: "+32", country: "BE", flag: "🇧🇪", minLength: 9, maxLength: 9 },
  { code: "+41", country: "CH", flag: "🇨🇭", minLength: 9, maxLength: 9 },
  { code: "+43", country: "AT", flag: "🇦🇹", minLength: 10, maxLength: 11 },
  { code: "+45", country: "DK", flag: "🇩🇰", minLength: 8, maxLength: 8 },
  { code: "+46", country: "SE", flag: "🇸🇪", minLength: 9, maxLength: 10 },
  { code: "+47", country: "NO", flag: "🇳🇴", minLength: 8, maxLength: 8 },
  { code: "+358", country: "FI", flag: "🇫🇮", minLength: 9, maxLength: 10 },
  { code: "+61", country: "AU", flag: "🇦🇺", minLength: 9, maxLength: 9 },
  { code: "+64", country: "NZ", flag: "🇳🇿", minLength: 8, maxLength: 9 },
  { code: "+81", country: "JP", flag: "🇯🇵", minLength: 10, maxLength: 11 },
  { code: "+82", country: "KR", flag: "🇰🇷", minLength: 10, maxLength: 11 },
  { code: "+86", country: "CN", flag: "🇨🇳", minLength: 11, maxLength: 11 },
  { code: "+91", country: "IN", flag: "🇮🇳", minLength: 10, maxLength: 10 },
  { code: "+55", country: "BR", flag: "🇧🇷", minLength: 10, maxLength: 11 },
  { code: "+52", country: "MX", flag: "🇲🇽", minLength: 10, maxLength: 10 },
  { code: "+27", country: "ZA", flag: "🇿🇦", minLength: 9, maxLength: 9 },
];

// Industries list
const industries = [
  "Technology & Software",
  "E-commerce & Retail",
  "Healthcare & Medical",
  "Financial Services",
  "Education & Training",
  "Real Estate",
  "Manufacturing",
  "Professional Services",
  "Marketing & Advertising",
  "Hospitality & Tourism",
  "Food & Beverage",
  "Automotive",
  "Construction",
  "Entertainment & Media",
  "Non-Profit",
  "Government",
  "Agriculture",
  "Energy & Utilities",
  "Transportation & Logistics",
  "Other"
];

const formSchema = z.object({
  clientName: z.string().min(2, "Client name must be at least 2 characters"),
  clientEmail: z.string().email("Please enter a valid email address"),
  countryCode: z.string().min(1, "Please select a country code"),
  clientPhone: z.string().min(1, "Phone number is required"),
  companyName: z.string().min(1, "Company name is required"),
  industry: z.string().min(1, "Please select an industry"),
  websiteUrl: z.string().url("Please enter a valid website URL").optional().or(z.literal("")),
  instagramHandle: z.string().optional(),
  facebookPage: z.string().optional(),
  twitterHandle: z.string().optional(),
  linkedinProfile: z.string().optional(),
  automationId: z.string().min(1, "Please select an automation"),
  projectDescription: z.string().min(10, "Please provide a detailed project description"),
  meetingDate: z.date({
    required_error: "Please select a meeting date",
  }),
  paymentFormat: z.enum(["recurring", "fixed"], {
    required_error: "Please select a payment format",
  }),
  customPrice: z.string().min(1, "Please enter the agreed price"),
  specialRequirements: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

export default function NewOrder() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userAutomations, setUserAutomations] = useState<any[]>([]);
  const [loadingAutomations, setLoadingAutomations] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      clientName: "",
      clientEmail: "",
      countryCode: "+1",
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
      paymentFormat: "fixed" as const,
      customPrice: "",
      specialRequirements: "",
    },
  });

  // Fetch user's automation list
  const fetchUserAutomations = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('user_automations')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true);

      if (error) {
        throw error;
      }

      setUserAutomations(data || []);
    } catch (error) {
      console.error('Error fetching user automations:', error);
      toast.error("Failed to load your automations");
    } finally {
      setLoadingAutomations(false);
    }
  };

  useEffect(() => {
    fetchUserAutomations();
  }, [user]);

  // Format price based on payment type
  const formatPrice = (price: string, paymentFormat: "fixed" | "recurring") => {
    const cleanPrice = price.replace(/[^0-9.]/g, '');
    const formattedPrice = `$${cleanPrice}`;
    return paymentFormat === "recurring" ? `${formattedPrice}/month` : formattedPrice;
  };

  // Validate phone number based on selected country
  const validatePhoneNumber = (phone: string, countryCode: string) => {
    const selectedCountry = countryCodes.find(c => c.code === countryCode);
    if (!selectedCountry) return false;
    
    const numbersOnly = phone.replace(/[^0-9]/g, '');
    return numbersOnly.length >= selectedCountry.minLength && numbersOnly.length <= selectedCountry.maxLength;
  };

  const onSubmit = async (data: FormData) => {
    if (!user) {
      toast.error("You must be logged in to create an order");
      return;
    }

    // Validate phone number
    if (!validatePhoneNumber(data.clientPhone, data.countryCode)) {
      const selectedCountry = countryCodes.find(c => c.code === data.countryCode);
      toast.error(`Phone number must be ${selectedCountry?.minLength}-${selectedCountry?.maxLength} digits for ${selectedCountry?.country}`);
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Get automation details
      const selectedAutomation = userAutomations.find(auto => auto.automation_id === data.automationId);
      
      // Format the full phone number
      const fullPhoneNumber = `${data.countryCode} ${data.clientPhone}`;
      
      // Format the agreed price
      const formattedPrice = formatPrice(data.customPrice, data.paymentFormat);
      
      // Create order in database
      const { error } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          client_name: data.clientName,
          client_email: data.clientEmail,
          client_phone: fullPhoneNumber,
          company_name: data.companyName,
          industry: data.industry,
          website_url: data.websiteUrl || null,
          instagram_handle: data.instagramHandle || null,
          facebook_page: data.facebookPage || null,
          twitter_handle: data.twitterHandle || null,
          linkedin_profile: data.linkedinProfile || null,
          automation_id: data.automationId,
          automation_title: selectedAutomation?.automation_title || 'Unknown Automation',
          automation_price: `$${selectedAutomation?.automation_suggested_price || 0}`,
          automation_category: selectedAutomation?.automation_category || null,
          project_description: data.projectDescription,
          special_requirements: data.specialRequirements || null,
          meeting_date: format(data.meetingDate, 'PPP p'),
          payment_format: data.paymentFormat,
          agreed_price: formattedPrice,
          status: 'order_created'
        });

      if (error) {
        throw error;
      }

      toast.success("Order created successfully!");
      
      // Navigate back to dashboard with orders tab active
      navigate('/dashboard');
      window.dispatchEvent(new CustomEvent('setActiveTab', { detail: 'active-orders' }));
      
    } catch (error) {
      console.error('Error creating order:', error);
      toast.error("Failed to create order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedAutomation = userAutomations.find(
    automation => automation.automation_id === form.watch("automationId")
  );

  const selectedCountry = countryCodes.find(c => c.code === form.watch("countryCode"));

  if (loadingAutomations) {
    return <div className="text-center py-8">Loading your automations...</div>;
  }

  if (userAutomations.length === 0) {
    return (
      <div className="max-w-4xl mx-auto space-y-8 py-8">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold">No Automations Available</h1>
          <p className="text-muted-foreground">
            You need to add automations to your list before creating orders.
          </p>
          <Button onClick={() => {
            navigate('/dashboard');
            window.dispatchEvent(new CustomEvent('setActiveTab', { detail: 'marketplace' }));
          }}>
            Browse Marketplace
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-8 px-4">
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

              {/* Phone Number with Country Code */}
              <FormItem className="md:col-span-2">
                <FormLabel>Phone Number</FormLabel>
                <div className="flex gap-2">
                  <FormField
                    control={form.control}
                    name="countryCode"
                    render={({ field }) => (
                      <FormItem className="w-32">
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="max-h-60">
                            {countryCodes.map((country) => (
                              <SelectItem key={`${country.code}-${country.country}`} value={country.code}>
                                <div className="flex items-center gap-2">
                                  <span>{country.flag}</span>
                                  <span>{country.code}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="clientPhone"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <Input 
                            placeholder={selectedCountry ? `${selectedCountry.minLength}-${selectedCountry.maxLength} digits` : "Phone number"} 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </FormItem>

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
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select an industry" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="max-h-60">
                        {industries.map((industry) => (
                          <SelectItem key={industry} value={industry}>
                            {industry}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="websiteUrl"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
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
                        {userAutomations.map((automation) => (
                          <SelectItem key={automation.automation_id} value={automation.automation_id}>
                            <div className="flex items-center justify-between w-full">
                              <span>{automation.automation_title}</span>
                              <div className="flex items-center gap-2 ml-4">
                                <Badge variant="secondary">{automation.automation_category}</Badge>
                                <span className="font-semibold text-primary">${automation.automation_suggested_price}</span>
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
                      <p className="font-medium">{selectedAutomation.automation_title}</p>
                      <Badge variant="secondary">{selectedAutomation.automation_category}</Badge>
                    </div>
                    <span className="text-lg font-bold text-primary">${selectedAutomation.automation_suggested_price}</span>
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
                Meeting Schedule & Payment
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
                    <FormItem className="flex flex-col">
                      <FormLabel>Confirmed Meeting Date & Time</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP p")
                              ) : (
                                <span>Pick a date and time</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date < new Date() || date < new Date("1900-01-01")
                            }
                            initialFocus
                            className={cn("p-3 pointer-events-auto")}
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Payment Format */}
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
                          <label htmlFor="fixed" className="font-medium cursor-pointer">
                            Fixed Payment - One-time payment
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="recurring" id="recurring" />
                          <label htmlFor="recurring" className="font-medium cursor-pointer">
                            Recurring Payment - Monthly subscription
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
                      <div className="relative">
                        <Input 
                          placeholder="299" 
                          {...field}
                          onChange={(e) => {
                            // Only allow numbers and decimal points
                            const value = e.target.value.replace(/[^0-9.]/g, '');
                            field.onChange(value);
                          }}
                        />
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-muted-foreground">$</span>
                        </div>
                      </div>
                    </FormControl>
                    {form.watch("customPrice") && form.watch("paymentFormat") && (
                      <p className="text-sm text-muted-foreground">
                        Preview: {formatPrice(form.watch("customPrice"), form.watch("paymentFormat"))}
                      </p>
                    )}
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
                        placeholder="Any special requirements, timeline considerations, or additional notes..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Creating Order..." : "Submit Order Request"}
          </Button>
        </form>
      </Form>
    </div>
  );
}