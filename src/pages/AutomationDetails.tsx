import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
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

type Automation = {
  id: string;
  title: string;
  description: string;
  category: string[];
  platforms: string[];
  setup_time: string;
  complexity: string;
  reviews_count: number;
  rating: number;
  cost: number;
  suggested_price: number;
  profit: number;
  margin: number;
  features: string[];
  requirements: string[];
  media: any;
  status: string;
  created_at: string;
  updated_at: string;
};

// Utility functions to convert Google Drive URLs
const convertGoogleDriveToDirectUrl = (url: string): string => {
  if (!url) return "/placeholder.svg";
  
  // Extract file ID from Google Drive URL
  const fileIdMatch = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
  if (fileIdMatch) {
    const fileId = fileIdMatch[1];
    // Use the thumbnail format which is more reliable for images
    return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`;
  }
  
  // If it's already a direct URL or not a Google Drive URL, return as is
  return url;
};

const convertGoogleDriveToEmbedUrl = (url: string): string => {
  if (!url) return "";
  
  // Extract file ID from Google Drive URL
  const fileIdMatch = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
  if (fileIdMatch) {
    const fileId = fileIdMatch[1];
    return `https://drive.google.com/file/d/${fileId}/preview`;
  }
  
  // If it's already an embed URL or not a Google Drive URL, return as is
  return url;
};

export default function AutomationDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [automation, setAutomation] = useState<Automation | null>(null);
  const [loading, setLoading] = useState(true);
  const [isInUserList, setIsInUserList] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchAutomation();
      if (user) {
        checkIfInUserList();
      }
    }
  }, [id, user]);

  const fetchAutomation = async () => {
    try {
      const { data, error } = await supabase
        .from('automations')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setAutomation(data);
    } catch (error) {
      console.error('Error fetching automation:', error);
      toast.error("Failed to load automation details");
    } finally {
      setLoading(false);
    }
  };

  const checkIfInUserList = async () => {
    try {
      const { data, error } = await supabase
        .from('user_automations')
        .select('id')
        .eq('user_id', user?.id)
        .eq('automation_id', id)
        .single();

      if (!error && data) {
        setIsInUserList(true);
      }
    } catch (error) {
      // User doesn't have this automation, which is fine
    }
  };

  const handleAddToList = async () => {
    if (!user || !automation) {
      toast.error("Please log in to add automations to your list");
      return;
    }

    setIsAdding(true);
    try {
      const { error } = await supabase
        .from('user_automations')
        .insert({
          user_id: user.id,
          automation_id: automation.id,
          is_active: automation.status === 'Active'
        });

      if (error) {
        if (error.code === '23505') {
          toast.error("This automation is already in your list");
        } else {
          throw error;
        }
      } else {
        setIsInUserList(true);
        toast.success(`${automation.title} added to your automation list!`);
      }
    } catch (error) {
      console.error('Error adding automation:', error);
      toast.error("Failed to add automation to your list");
    } finally {
      setIsAdding(false);
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Bot className="w-16 h-16 text-muted-foreground mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Loading automation details...</p>
        </div>
      </div>
    );
  }
  
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

  const profitMargin = ((automation.profit / automation.suggested_price) * 100).toFixed(1);

  return (
    <div className="max-h-screen bg-background overflow-auto">
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

      <div className="container mx-auto px-6 py-8 h-[calc(100vh-80px)]">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full">
          {/* Main Content - Scrollable */}
          <div className="lg:col-span-2 overflow-y-auto pr-4 space-y-8">
            {/* Header Section */}
            <div>
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h1 className="text-3xl font-bold mb-2">{automation.title}</h1>
                  <p className="text-lg text-muted-foreground">{automation.description}</p>
                </div>
                <Badge variant={automation.status === 'Active' ? "default" : "secondary"} className="bg-success text-success-foreground">
                  {automation.status}
                </Badge>
              </div>

              <div className="flex items-center gap-6 mb-6">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 fill-warning text-warning" />
                  <span className="font-medium">{automation.rating}</span>
                  <span className="text-muted-foreground">({automation.reviews_count} reviews)</span>
                </div>
                <Badge variant="outline">{automation.category[0]}</Badge>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  {automation.setup_time} setup
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {automation.platforms.map((platform, index) => (
                  <Badge key={index} variant="secondary" className="text-sm">
                    {platform}
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
                {automation.media?.video_demo && (
                  <div>
                    <h4 className="font-medium mb-3">Video Demonstration</h4>
                    <AspectRatio ratio={16 / 9} className="bg-muted rounded-lg overflow-hidden">
                      <iframe
                        src={convertGoogleDriveToEmbedUrl(automation.media.video_demo)}
                        className="w-full h-full"
                        allowFullScreen
                        title="Automation Demo Video"
                      />
                    </AspectRatio>
                  </div>
                )}

                {/* Screenshots */}
                <div>
                  <h4 className="font-medium mb-3">Screenshots</h4>
                  <div className="grid grid-cols-3 gap-3">
                    {automation.media?.screenshots ? automation.media.screenshots.map((image: string, index: number) => (
                      <AspectRatio 
                        key={index} 
                        ratio={4 / 3} 
                        className="bg-muted rounded-md overflow-hidden cursor-pointer hover:opacity-75 transition-opacity group"
                        onClick={() => setFullscreenImage(convertGoogleDriveToDirectUrl(image))}
                      >
                        <img 
                          src={convertGoogleDriveToDirectUrl(image)} 
                          alt={`Screenshot ${index + 1}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            console.error(`Failed to load image: ${image}`);
                            e.currentTarget.src = "/placeholder.svg";
                          }}
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center">
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <div className="bg-black/50 rounded-full p-2">
                              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                              </svg>
                            </div>
                          </div>
                        </div>
                      </AspectRatio>
                    )) : (
                      <div className="col-span-3 text-center py-8">
                        <p className="text-muted-foreground">No screenshots available</p>
                      </div>
                    )}
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
                      <p className="mb-4 text-muted-foreground leading-relaxed">
                        {automation.description}
                      </p>
                      <div className="mt-6">
                        <h4 className="font-medium mb-3">Platforms Supported:</h4>
                        <div className="flex flex-wrap gap-2">
                          {automation.platforms.map((platform, index) => (
                            <Badge key={index} variant="outline" className="text-sm">
                              {platform}
                            </Badge>
                          ))}
                        </div>
                      </div>
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

          {/* Sidebar - Fixed */}
          <div className="lg:h-full lg:sticky lg:top-6 space-y-6 overflow-y-auto">
            {/* Pricing Card */}
            <Card>
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
                    <p className="text-2xl font-bold">${automation.suggested_price}</p>
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

                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={handleAddToList}
                  disabled={isAdding || isInUserList}
                >
                  {isAdding ? (
                    <>
                      <Plus className="w-4 h-4 mr-2 animate-spin" />
                      Adding...
                    </>
                  ) : isInUserList ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Already in Your List
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Add to My List
                    </>
                  )}
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
                  <span className="text-sm font-medium">{automation.setup_time}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Reviews</span>
                  <span className="text-sm font-medium flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {automation.reviews_count}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Fullscreen Image Modal */}
      {fullscreenImage && (
        <div 
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setFullscreenImage(null)}
        >
          <div className="relative max-w-[90vw] max-h-[90vh] w-full h-full flex items-center justify-center">
            <button
              onClick={() => setFullscreenImage(null)}
              className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <img
              src={fullscreenImage}
              alt="Fullscreen view"
              className="max-w-full max-h-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
}