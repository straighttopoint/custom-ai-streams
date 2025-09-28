import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Search, Filter, X } from "lucide-react";

interface MarketplaceFiltersProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  showAvailableOnly: boolean;
  onAvailableOnlyChange: (show: boolean) => void;
  categoryStats: Record<string, number>;
}

const categories = [
  { id: "all", label: "All Categories" },
  { id: "social-media-management", label: "Social Media Management" },
  { id: "content-generation", label: "Content Generation" },
  { id: "lead-generation", label: "Lead Generation" },
  { id: "email-marketing", label: "Email Marketing" },
  { id: "customer-support", label: "Customer Support" },
  { id: "financial-management", label: "Financial Management" },
];

const searchSuggestions = [
  "Social Media Automation",
  "Content Calendar",
  "Lead Generation",
  "Email Sequences", 
  "CRM Integration",
  "Instagram Posting",
  "LinkedIn Automation",
  "Blog Content",
  "SEO Optimization",
  "Customer Support",
  "Chatbot",
  "Financial Reporting",
  "KPI Tracking",
  "A/B Testing",
  "Segmentation"
];

export function MarketplaceFilters({
  activeCategory,
  onCategoryChange,
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  showAvailableOnly,
  onAvailableOnlyChange,
  categoryStats
}: MarketplaceFiltersProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);

  useEffect(() => {
    if (searchQuery.length > 1) {
      const filtered = searchSuggestions.filter(suggestion =>
        suggestion.toLowerCase().includes(searchQuery.toLowerCase()) &&
        suggestion.toLowerCase() !== searchQuery.toLowerCase()
      );
      setFilteredSuggestions(filtered);
      setIsSearchOpen(filtered.length > 0);
    } else {
      setFilteredSuggestions([]);
      setIsSearchOpen(false);
    }
  }, [searchQuery]);

  const handleSuggestionSelect = (suggestion: string) => {
    onSearchChange(suggestion);
    setIsSearchOpen(false);
  };
  return (
    <div className="space-y-6">
      {/* Search and Sort Row */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search automations..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 pr-8"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                onClick={() => {
                  onSearchChange("");
                  setIsSearchOpen(false);
                }}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
          
          {/* Dynamic Suggestions Dropdown */}
          {isSearchOpen && filteredSuggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-popover border border-border rounded-md shadow-md">
              <div className="max-h-48 overflow-y-auto p-1">
                {filteredSuggestions.slice(0, 6).map((suggestion, index) => (
                  <div
                    key={suggestion}
                    className="flex items-center px-3 py-2 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground rounded-sm transition-colors"
                    onClick={() => handleSuggestionSelect(suggestion)}
                  >
                    <Search className="mr-2 h-3 w-3 text-muted-foreground" />
                    <span>{suggestion}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <Select value={sortBy} onValueChange={onSortChange}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="rating">Highest Rated</SelectItem>
            <SelectItem value="profit">Highest Profit</SelectItem>
            <SelectItem value="popular">Most Popular</SelectItem>
            <SelectItem value="price-low">Price: Low to High</SelectItem>
            <SelectItem value="price-high">Price: High to Low</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex items-center space-x-2">
          <Switch
            id="available-only"
            checked={showAvailableOnly}
            onCheckedChange={onAvailableOnlyChange}
          />
          <Label htmlFor="available-only" className="text-sm whitespace-nowrap">
            Available only
          </Label>
        </div>
      </div>

      {/* Categories */}
      <div>
        <h3 className="text-sm font-medium mb-3">Categories</h3>
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={activeCategory === category.id ? "default" : "outline"}
              size="sm"
              onClick={() => onCategoryChange(category.id)}
              className={activeCategory === category.id ? "bg-primary text-primary-foreground" : ""}
            >
              {category.label}
              <Badge variant="secondary" className="ml-2 text-xs">
                {categoryStats[category.id] || 0}
              </Badge>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}