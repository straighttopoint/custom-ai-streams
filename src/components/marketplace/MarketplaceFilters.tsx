import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Search, Filter, SlidersHorizontal } from "lucide-react";

interface MarketplaceFiltersProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  showAvailableOnly: boolean;
  onAvailableOnlyChange: (show: boolean) => void;
}

const categories = [
  { id: "all", label: "All Categories", count: 48 },
  { id: "social-media", label: "Social Media Management", count: 12 },
  { id: "content-generation", label: "Content Generation", count: 15 },
  { id: "lead-generation", label: "Lead Generation", count: 8 },
  { id: "email-marketing", label: "Email Marketing", count: 6 },
  { id: "crm-automation", label: "CRM Automation", count: 7 },
];

export function MarketplaceFilters({
  activeCategory,
  onCategoryChange,
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  showAvailableOnly,
  onAvailableOnlyChange
}: MarketplaceFiltersProps) {
  return (
    <div className="space-y-6">
      {/* Search and Sort Row */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search automations..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
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

        <Button variant="outline">
          <SlidersHorizontal className="w-4 h-4 mr-2" />
          Filters
        </Button>
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
                {category.count}
              </Badge>
            </Button>
          ))}
        </div>
      </div>

      {/* Quick Filters */}
      <div className="flex items-center gap-6">
        <div className="flex items-center space-x-2">
          <Switch
            id="available-only"
            checked={showAvailableOnly}
            onCheckedChange={onAvailableOnlyChange}
          />
          <Label htmlFor="available-only" className="text-sm">
            Show only available automations
          </Label>
        </div>
      </div>
    </div>
  );
}