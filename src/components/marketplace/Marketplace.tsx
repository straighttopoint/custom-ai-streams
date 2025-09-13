import { useState, useMemo } from "react";
import { AutomationCard } from "./AutomationCard";
import { MarketplaceFilters } from "./MarketplaceFilters";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, DollarSign, TrendingUp, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";

// Mock data for automations
const mockAutomations = [
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
    title: "Email Marketing Automation",
    description: "Complete email marketing automation including segmentation, personalization, and performance optimization.",
    category: "Email Marketing",
    rating: 4.6,
    reviews: 78,
    cost: 120,
    suggestedPrice: 450,
    profit: 330,
    tags: ["Email Sequences", "Segmentation", "A/B Testing"],
    isActive: true,
  },
  {
    id: "5",
    title: "Customer Support Chatbot",
    description: "AI-powered customer support automation with ticket routing, knowledge base integration, and escalation protocols.",
    category: "Customer Support",
    rating: 4.5,
    reviews: 92,
    cost: 250,
    suggestedPrice: 900,
    profit: 650,
    tags: ["Chatbot", "Ticket Routing", "Knowledge Base"],
    isActive: true,
  },
  {
    id: "6",
    title: "Financial Reporting Dashboard",
    description: "Automated financial reporting with real-time KPI tracking, expense categorization, and profit analysis.",
    category: "Financial Management",
    rating: 4.8,
    reviews: 67,
    cost: 300,
    suggestedPrice: 1200,
    profit: 900,
    tags: ["KPI Tracking", "Expense Management", "Profit Analysis"],
    isActive: true,
  },
];

export function Marketplace() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [showAvailableOnly, setShowAvailableOnly] = useState(false);

  // Calculate real category counts
  const categoryStats = useMemo(() => {
    const stats: Record<string, number> = {
      "all": mockAutomations.length,
      "social-media-management": 0,
      "content-generation": 0,
      "lead-generation": 0,
      "email-marketing": 0,
      "customer-support": 0,
      "financial-management": 0
    };

    mockAutomations.forEach(automation => {
      const categoryKey = automation.category.toLowerCase().replace(/\s+/g, "-");
      if (stats[categoryKey] !== undefined) {
        stats[categoryKey]++;
      }
    });

    return stats;
  }, []);

  const filteredAutomations = mockAutomations.filter((automation) => {
    const matchesCategory = activeCategory === "all" || 
      automation.category.toLowerCase().replace(/\s+/g, "-") === activeCategory;
    
    const matchesSearch = automation.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      automation.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      automation.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesAvailable = !showAvailableOnly || automation.isActive;
    
    return matchesCategory && matchesSearch && matchesAvailable;
  });

  const sortedAutomations = [...filteredAutomations].sort((a, b) => {
    switch (sortBy) {
      case "rating":
        return b.rating - a.rating;
      case "profit":
        return b.profit - a.profit;
      case "popular":
        return b.reviews - a.reviews;
      case "price-low":
        return a.suggestedPrice - b.suggestedPrice;
      case "price-high":
        return b.suggestedPrice - a.suggestedPrice;
      default:
        return 0;
    }
  });

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <Badge variant="default" className="bg-success text-success-foreground">Available</Badge>
    ) : (
      <Badge variant="secondary">Unavailable</Badge>
    );
  };

  return (
    <div className="space-y-6 overflow-auto">
      <div>
        <h1 className="text-3xl font-bold">Automation Marketplace</h1>
        <p className="text-muted-foreground mt-2">
          Discover and add AI automations to your service portfolio. Each automation comes with 
          full documentation, implementation support, and client delivery assistance.
        </p>
      </div>

      <MarketplaceFilters
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        sortBy={sortBy}
        onSortChange={setSortBy}
        showAvailableOnly={showAvailableOnly}
        onAvailableOnlyChange={setShowAvailableOnly}
        categoryStats={categoryStats}
      />

      <div className="bg-card border border-border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[300px]">Automation</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Cost</TableHead>
              <TableHead>Suggested Price</TableHead>
              <TableHead>Profit</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedAutomations.map((automation) => (
              <TableRow key={automation.id}>
                <TableCell>
                  <div className="space-y-1">
                    <div className="font-medium">{automation.title}</div>
                    <div className="text-sm text-muted-foreground line-clamp-2">
                      {automation.description}
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {automation.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {automation.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{automation.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">{automation.category}</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{automation.rating}</span>
                    <span className="text-sm text-muted-foreground">({automation.reviews})</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-destructive">
                    <DollarSign className="h-4 w-4" />
                    <span>${automation.cost}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4" />
                    <span>${automation.suggestedPrice}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-success font-medium">
                    <TrendingUp className="h-4 w-4" />
                    <span>${automation.profit}</span>
                  </div>
                </TableCell>
                <TableCell>
                  {getStatusBadge(automation.isActive)}
                </TableCell>
                <TableCell className="text-right">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigate(`/automation/${automation.id}`)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {sortedAutomations.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No automations found matching your criteria.</p>
        </div>
      )}
    </div>
  );
}