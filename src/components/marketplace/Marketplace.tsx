import { useState, useMemo, useEffect } from "react";
import { AutomationCard } from "./AutomationCard";
import { MarketplaceFilters } from "./MarketplaceFilters";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type Automation = {
  id: string;
  title: string;
  status: string;
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
  description: string;
  features: string[];
  requirements: string[];
  media: any;
  created_at: string;
  updated_at: string;
  assigned_user_id?: string | null;
};

export function Marketplace() {
  const { user } = useAuth();
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [showAvailableOnly, setShowAvailableOnly] = useState(false);
  const [userAutomations, setUserAutomations] = useState<string[]>([]);
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch automations from database
  useEffect(() => {
    fetchAutomations();
  }, []);

  // Fetch user's automations to check what's already in their list
  useEffect(() => {
    if (user) {
      fetchUserAutomations();
    }
  }, [user]);

  const fetchAutomations = async () => {
    try {
      const { data, error } = await supabase
        .from('automations')
        .select('*')
        .eq('status', 'Active')
        .is('assigned_user_id', null); // Only show non-exclusive automations

      if (error) throw error;
      setAutomations(data || []);
    } catch (error) {
      console.error('Error fetching automations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserAutomations = async () => {
    try {
      const { data, error } = await supabase
        .from('user_automations')
        .select('automation_id')
        .eq('user_id', user?.id);

      if (error) throw error;
      setUserAutomations(data?.map(item => item.automation_id) || []);
    } catch (error) {
      console.error('Error fetching user automations:', error);
    }
  };

  const handleAutomationAdded = (automationId: string) => {
    setUserAutomations(prev => [...prev, automationId]);
  };

  const handleAutomationRemoved = (automationId: string) => {
    setUserAutomations(prev => prev.filter(id => id !== automationId));
  };

  // Calculate real category counts
  const categoryStats = useMemo(() => {
    const stats: Record<string, number> = {
      "all": automations.length,
      "social-media-management": 0,
      "content-generation": 0,
      "lead-generation": 0,
      "email-marketing": 0,
      "customer-support": 0,
      "financial-management": 0
    };

    automations.forEach(automation => {
      automation.category.forEach(cat => {
        const categoryKey = cat.toLowerCase().replace(/\s+/g, "-");
        if (stats[categoryKey] !== undefined) {
          stats[categoryKey]++;
        }
      });
    });

    return stats;
  }, [automations]);

  const filteredAutomations = automations.filter((automation) => {
    const matchesCategory = activeCategory === "all" || 
      automation.category.some(cat => cat.toLowerCase().replace(/\s+/g, "-") === activeCategory);
    
    const matchesSearch = automation.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      automation.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      automation.platforms.some(platform => platform.toLowerCase().includes(searchQuery.toLowerCase())) ||
      automation.features.some(feature => feature.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesAvailable = !showAvailableOnly || automation.status === 'Active';
    
    return matchesCategory && matchesSearch && matchesAvailable;
  });

  const sortedAutomations = [...filteredAutomations].sort((a, b) => {
    switch (sortBy) {
      case "rating":
        return b.rating - a.rating;
      case "profit":
        return b.profit - a.profit;
      case "popular":
        return b.reviews_count - a.reviews_count;
      case "price-low":
        return a.suggested_price - b.suggested_price;
      case "price-high":
        return b.suggested_price - a.suggested_price;
      default:
        return 0;
    }
  });


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

      {loading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading automations...</p>
        </div>
      ) : (
        <>
          <div className="grid gap-6">
            {sortedAutomations.map((automation) => (
              <AutomationCard 
                key={automation.id} 
                {...automation} 
                isInUserList={userAutomations.includes(automation.id)}
                isExclusive={automation.assigned_user_id === user?.id}
                onAutomationAdded={handleAutomationAdded}
                onAutomationRemoved={handleAutomationRemoved}
              />
            ))}
          </div>

          {sortedAutomations.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No automations found matching your criteria.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}