import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { 
  ArrowLeft, 
  Star, 
  Bot, 
  Plus, 
  DollarSign, 
  TrendingUp, 
  Play,
  CheckCircle,
  Clock,
  Users,
  Zap
} from "lucide-react";

// Extended mock data for automation details
const automationDetails = {
  "1": {
    id: "1",
    title: "Social Media Content Calendar",
    description: "Automatically generate and schedule social media posts across multiple platforms with AI-generated content and optimal timing.",
    fullDescription: `This comprehensive social media automation system revolutionizes how businesses manage their online presence. Built with advanced AI capabilities, it creates, schedules, and optimizes content across multiple platforms including Instagram, LinkedIn, Twitter, and Facebook.

The system analyzes your brand voice, target audience, and industry trends to generate engaging content that resonates with your followers. It automatically determines the best posting times based on audience activity patterns and platform algorithms.

Key features include:
• AI-powered content generation with brand voice consistency
• Multi-platform scheduling and cross-posting
• Hashtag optimization and trend analysis
• Performance tracking and analytics
• Automated engagement responses
• Content calendar management
• Brand safety and compliance checks`,
    category: "Social Media Management",
    rating: 4.8,
    reviews: 124,
    cost: 150,
    suggestedPrice: 500,
    profit: 350,
    tags: ["Instagram", "LinkedIn", "Twitter", "AI Content"],
    isActive: true,
    setupTime: "2-3 hours",
    complexity: "Medium",
    features: [
      "AI Content Generation",
      "Multi-Platform Scheduling",
      "Performance Analytics",
      "Hashtag Optimization",
      "Automated Engagement",
      "Brand Voice Training"
    ],
    videoDemo: "https://player.vimeo.com/video/example",
    images: [
      "/placeholder.svg",
      "/placeholder.svg",
      "/placeholder.svg"
    ],
    requirements: [
      "Social media platform API access",
      "Content approval workflow setup",
      "Brand guidelines documentation",
      "Target audience personas"
    ]
  }
  // Add more automation details as needed
};

export default function AutomationDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  
  const automation = automationDetails[id as keyof typeof automationDetails];
  
  if (!automation) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Automation Not Found</h1>
          <Button onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const profitMargin = ((automation.profit / automation.suggestedPrice) * 100).toFixed(1);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate("/dashboard")}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Marketplace
            </Button>
            <div className="h-6 w-px bg-border" />
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-primary" />
              <span className="font-medium">Automation Details</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Header Section */}
            <div>
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h1 className="text-3xl font-bold mb-2">{automation.title}</h1>
                  <p className="text-lg text-muted-foreground">{automation.description}</p>
                </div>
                <Badge variant={automation.isActive ? "default" : "secondary"} className="bg-success text-success-foreground">
                  {automation.isActive ? "Active" : "Draft"}
                </Badge>
              </div>

              <div className="flex items-center gap-6 mb-6">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 fill-warning text-warning" />
                  <span className="font-medium">{automation.rating}</span>
                  <span className="text-muted-foreground">({automation.reviews} reviews)</span>
                </div>
                <Badge variant="outline">{automation.category}</Badge>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  {automation.setupTime} setup
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {automation.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="text-sm">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Media Section */}
            <Card>
              <CardHeader>
                <CardTitle>Demo & Screenshots</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Video Demo */}
                <div>
                  <h4 className="font-medium mb-3">Video Demonstration</h4>
                  <AspectRatio ratio={16 / 9} className="bg-muted rounded-lg overflow-hidden">
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                      <div className="text-center">
                        <Play className="w-16 h-16 text-muted-foreground mx-auto mb-2" />
                        <p className="text-muted-foreground">Video Demo Preview</p>
                        <p className="text-sm text-muted-foreground">Click to play automation demo</p>
                      </div>
                    </div>
                  </AspectRatio>
                </div>

                {/* Screenshots */}
                <div>
                  <h4 className="font-medium mb-3">Screenshots</h4>
                  <div className="grid grid-cols-3 gap-3">
                    {automation.images.map((image, index) => (
                      <AspectRatio 
                        key={index} 
                        ratio={4 / 3} 
                        className="bg-muted rounded-md overflow-hidden cursor-pointer hover:opacity-75 transition-opacity"
                        onClick={() => setActiveImageIndex(index)}
                      >
                        <img 
                          src={image} 
                          alt={`Screenshot ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </AspectRatio>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Detailed Information */}
            <Tabs defaultValue="description" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="description">Description</TabsTrigger>
                <TabsTrigger value="features">Features</TabsTrigger>
                <TabsTrigger value="requirements">Requirements</TabsTrigger>
              </TabsList>
              
              <TabsContent value="description" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Detailed Description</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-sm max-w-none">
                      {automation.fullDescription.split('\n\n').map((paragraph, index) => (
                        <p key={index} className="mb-4 text-muted-foreground leading-relaxed">
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="features" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Key Features</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-3">
                      {automation.features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <CheckCircle className="w-5 h-5 text-success flex-shrink-0" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="requirements" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Setup Requirements</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-3">
                      {automation.requirements.map((requirement, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <Zap className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
                          <span>{requirement}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Pricing Card */}
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-primary" />
                  Pricing Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Your Cost</p>
                    <p className="text-2xl font-bold">${automation.cost}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Suggested Price</p>
                    <p className="text-2xl font-bold">${automation.suggestedPrice}</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Profit</span>
                    <span className="font-bold text-success flex items-center gap-1">
                      <TrendingUp className="w-4 h-4" />
                      ${automation.profit}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Margin</span>
                    <span className="font-bold text-success">{profitMargin}%</span>
                  </div>
                </div>

                <Button className="w-full" size="lg">
                  <Plus className="w-4 h-4 mr-2" />
                  Add to My List
                </Button>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Complexity</span>
                  <Badge variant="outline">{automation.complexity}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Setup Time</span>
                  <span className="text-sm font-medium">{automation.setupTime}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Reviews</span>
                  <span className="text-sm font-medium flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {automation.reviews}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}