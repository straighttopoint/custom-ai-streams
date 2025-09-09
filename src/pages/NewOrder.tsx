import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, UserIcon, BuildingIcon, HashIcon, ClockIcon } from "lucide-react";

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
  calendlyLink: z.string().url("Please enter a valid Calendly link"),
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
      calendlyLink: "",
      specialRequirements: "",
    },
  });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log("New order submitted:", data);
    
    // Here you would typically send the data to your backend
    // and possibly redirect to a success page or show a success message
    
    setIsSubmitting(false);
  };

  const selectedAutomation = mockAutomations.find(
    automation => automation.id === form.watch("automationId")
  );

  return (
    <div className="max-w-4xl mx-auto space-y-8">
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

          {/* Scheduling */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClockIcon className="w-5 h-5" />
                Scheduling & Additional Info
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="calendlyLink"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Calendly Meeting Link</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://calendly.com/your-link/meeting"
                        {...field}
                      />
                    </FormControl>
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
                        placeholder="Any special requirements, deadlines, or additional notes..."
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
          <div className="flex justify-end">
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