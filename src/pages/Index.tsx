import { Button } from "@/components/ui/button";
import { ArrowRight, Bot, Zap, Users, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="h-screen overflow-y-auto">
      {/* Navigation */}
      <nav className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Bot className="h-8 w-8 text-primary" />
              <span className="ml-2 text-xl font-bold">Letusdify</span>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="hidden md:flex items-center space-x-4">
                <Button variant="ghost" onClick={() => navigate('/features')}>Features</Button>
                <Button variant="ghost" onClick={() => navigate('/pricing')}>Pricing</Button>
              </div>
              <Button variant="outline" onClick={() => navigate('/auth')} size="sm" className="sm:size-default">
                Sign In
              </Button>
              <Button onClick={() => navigate('/dashboard')} size="sm" className="sm:size-default">
                <span className="hidden sm:inline">Get Started</span>
                <span className="sm:hidden">Start</span>
                <ArrowRight className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-6">
            Sell AI Automations
            <span className="text-primary block">Without the Technical Hassle</span>
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Access professional N8N automations, market them to your clients, and let us handle 
            the technical implementation while you focus on growing your AI agency.
          </p>
          <div className="flex justify-center">
            <Button size="lg" onClick={() => navigate('/dashboard')}>
              Start Selling Today
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">How Letusdify Works</h2>
            <p className="text-muted-foreground text-lg">Simple steps to start selling AI automations</p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Bot className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Choose Automations</h3>
              <p className="text-muted-foreground">
                Browse our marketplace of ready-to-sell AI automations. Each comes with 
                pricing guidance and marketing materials.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Find Clients</h3>
              <p className="text-muted-foreground">
                Market the automations to your clients using our provided materials. 
                Set your own prices and close deals.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Zap className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">We Handle Delivery</h3>
              <p className="text-muted-foreground">
                We join client meetings as your technical team, implement the automation, 
                and provide ongoing support while you keep the profit.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">Why Choose Letusdify?</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-success mt-0.5" />
                  <div>
                    <h3 className="font-semibold">No Technical Skills Required</h3>
                    <p className="text-muted-foreground">Focus on sales while we handle all implementation</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-success mt-0.5" />
                  <div>
                    <h3 className="font-semibold">Professional Client Interaction</h3>
                    <p className="text-muted-foreground">We join meetings as your technical team</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-success mt-0.5" />
                  <div>
                    <h3 className="font-semibold">Transparent Pricing</h3>
                    <p className="text-muted-foreground">Know your costs upfront, set your own margins</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-success mt-0.5" />
                  <div>
                    <h3 className="font-semibold">Full Support Included</h3>
                    <p className="text-muted-foreground">Ongoing maintenance and client support</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-primary/5 p-8 rounded-2xl">
              <h3 className="text-2xl font-bold mb-4">Ready to Get Started?</h3>
              <p className="text-muted-foreground mb-6">
                Join hundreds of AI agency owners who are already selling automations 
                without the technical complexity.
              </p>
              <Button size="lg" className="w-full" onClick={() => navigate('/dashboard')}>
                Access Marketplace
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center">
              <Bot className="h-6 w-6 text-primary" />
              <span className="ml-2 font-semibold">Letusdify</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2025 Letusdify. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
      </div>
    </div>
  );
};

export default Index;
