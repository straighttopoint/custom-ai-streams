import { Button } from "@/components/ui/button";
import { ArrowRight, Bot, Users, Zap, CheckCircle, Shield, Clock, TrendingUp, HeadphonesIcon, DollarSign, Globe } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Features = () => {
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
                <Button variant="ghost" onClick={() => navigate('/')}>Home</Button>
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
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-6">
            Complete Features for
            <span className="text-primary block">AI Automation Success</span>
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Everything you need to sell AI automations professionally, from marketplace browsing to client delivery and ongoing support.
          </p>
        </div>
      </section>

      {/* Core Features */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Core Platform Features</h2>
            <p className="text-muted-foreground text-lg">Built for AI agency owners who want to scale without technical complexity</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-card p-6 rounded-lg border">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Bot className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Automation Marketplace</h3>
              <p className="text-muted-foreground">
                Browse curated N8N automations with detailed descriptions, pricing guidance, and ready-to-use marketing materials.
              </p>
            </div>
            
            <div className="bg-card p-6 rounded-lg border">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Order Management</h3>
              <p className="text-muted-foreground">
                Track all client orders from initial request through implementation to completion with detailed status updates.
              </p>
            </div>
            
            <div className="bg-card p-6 rounded-lg border">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Financial Dashboard</h3>
              <p className="text-muted-foreground">
                Monitor earnings, track payments, manage withdrawals with transparent fee breakdown and real-time balance updates.
              </p>
            </div>
            
            <div className="bg-card p-6 rounded-lg border">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Analytics & Insights</h3>
              <p className="text-muted-foreground">
                Comprehensive analytics on order performance, revenue trends, and client behavior to optimize your business.
              </p>
            </div>
            
            <div className="bg-card p-6 rounded-lg border">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <HeadphonesIcon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Support System</h3>
              <p className="text-muted-foreground">
                Built-in ticketing system for client support with direct communication to our technical team.
              </p>
            </div>
            
            <div className="bg-card p-6 rounded-lg border">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Security & Compliance</h3>
              <p className="text-muted-foreground">
                Enterprise-grade security with encrypted data handling and compliance with industry standards.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Business Benefits */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Business Benefits</h2>
            <p className="text-muted-foreground text-lg">How our platform transforms your AI agency</p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Clock className="h-5 w-5 text-success" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Save 80% of Development Time</h3>
                  <p className="text-muted-foreground">Skip months of technical development and start selling immediately with our ready-made automations.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="h-5 w-5 text-success" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Scale Without Hiring</h3>
                  <p className="text-muted-foreground">Handle unlimited clients without expanding your technical team - we become your delivery arm.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Globe className="h-5 w-5 text-success" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Professional Client Experience</h3>
                  <p className="text-muted-foreground">We join client meetings as your technical team, maintaining your brand and relationship.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="h-5 w-5 text-success" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">Guaranteed Quality Delivery</h3>
                  <p className="text-muted-foreground">Every automation is tested and comes with ongoing support and maintenance included.</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-primary/5 to-primary/10 p-8 rounded-2xl">
              <h3 className="text-2xl font-bold mb-4">Ready to Transform Your Agency?</h3>
              <p className="text-muted-foreground mb-6">
                Join successful AI agency owners who are scaling their businesses without the technical complexity.
              </p>
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-success" />
                  <span className="text-sm">Start selling within 24 hours</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-success" />
                  <span className="text-sm">Full technical support included</span>
                </div>
              </div>
              <Button size="lg" className="w-full" onClick={() => navigate('/dashboard')}>
                Get Started
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

export default Features;