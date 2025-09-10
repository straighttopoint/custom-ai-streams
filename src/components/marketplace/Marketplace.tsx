import { useState } from "react";
import { AutomationCard } from "./AutomationCard";
import { MarketplaceFilters } from "./MarketplaceFilters";

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
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [showAvailableOnly, setShowAvailableOnly] = useState(false);

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

  return (
    <div className="space-y-6 max-h-screen overflow-auto">
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
      />

      <div className="grid gap-6">
        {sortedAutomations.map((automation) => (
          <AutomationCard key={automation.id} {...automation} />
        ))}
      </div>

      {sortedAutomations.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No automations found matching your criteria.</p>
        </div>
      )}
    </div>
  );
}