import { Button } from "@/components/ui/button";
import { ArrowRight, Bot, CheckCircle, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Pricing = () => {
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
                <Button variant="ghost" onClick={() => navigate('/features')}>Features</Button>
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
            Simple, Transparent
            <span className="text-primary block">Pricing Structure</span>
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            No hidden fees, no surprises. You only pay when you earn. Our transparent fee structure lets you calculate your profit margins upfront.
          </p>
        </div>
      </section>

      {/* Fee Structure */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">How Our Fees Work</h2>
            <p className="text-muted-foreground text-lg">Per-order fees that scale with your success</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <div className="bg-card p-6 rounded-lg border text-center">
              <div className="text-2xl font-bold text-primary mb-2">$50</div>
              <div className="font-semibold mb-2">Meeting Fee</div>
              <p className="text-sm text-muted-foreground">Per client meeting we attend on your behalf</p>
            </div>
            
            <div className="bg-card p-6 rounded-lg border text-center">
              <div className="text-2xl font-bold text-primary mb-2">$75</div>
              <div className="font-semibold mb-2">Setup Fee</div>
              <p className="text-sm text-muted-foreground">For automation implementation and configuration</p>
            </div>
            
            <div className="bg-card p-6 rounded-lg border text-center">
              <div className="text-2xl font-bold text-primary mb-2">$25</div>
              <div className="font-semibold mb-2">Follow-up Fee</div>
              <p className="text-sm text-muted-foreground">For ongoing support and maintenance</p>
            </div>
            
            <div className="bg-card p-6 rounded-lg border text-center">
              <div className="text-2xl font-bold text-primary mb-2">5%</div>
              <div className="font-semibold mb-2">Service Fee</div>
              <p className="text-sm text-muted-foreground">Of your profit margin (selling price - automation cost)</p>
            </div>
          </div>

          {/* Example Calculation */}
          <div className="bg-card p-8 rounded-xl border max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold mb-6 text-center">Example: $2,000 Automation Sale</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-border">
                <span>Client Payment (what you charge)</span>
                <span className="font-semibold text-success">+$2,000</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border">
                <span>Automation Cost (wholesale price)</span>
                <span className="font-semibold text-destructive">-$800</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border">
                <span>Meeting Fee</span>
                <span className="font-semibold text-destructive">-$50</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border">
                <span>Setup Fee</span>
                <span className="font-semibold text-destructive">-$75</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border">
                <span>Follow-up Fee</span>
                <span className="font-semibold text-destructive">-$25</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border">
                <span>Service Fee (5% of $1,200 profit)</span>
                <span className="font-semibold text-destructive">-$60</span>
              </div>
              <div className="flex justify-between items-center py-3 border-t-2 border-primary">
                <span className="text-lg font-bold">Your Net Profit</span>
                <span className="text-lg font-bold text-success">$990</span>
              </div>
            </div>
            <div className="text-center mt-6 p-4 bg-success/10 rounded-lg">
              <p className="text-success font-semibold">49.5% Profit Margin</p>
            </div>
          </div>
        </div>
      </section>

      {/* What's Included */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">What's Included</h2>
            <p className="text-muted-foreground text-lg">Everything you need to run a successful AI automation business</p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-12">
            <div>
              <h3 className="text-xl font-bold mb-6">✅ What's Included</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-semibold">Technical Implementation</span>
                    <p className="text-sm text-muted-foreground">Complete N8N automation setup and configuration</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-semibold">Client Meeting Attendance</span>
                    <p className="text-sm text-muted-foreground">We join as your technical team</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-semibold">Training & Documentation</span>
                    <p className="text-sm text-muted-foreground">Complete handover to client</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-semibold">30-Day Support</span>
                    <p className="text-sm text-muted-foreground">Bug fixes and minor adjustments</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-semibold">Quality Guarantee</span>
                    <p className="text-sm text-muted-foreground">We ensure delivery meets specifications</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-xl font-bold mb-6">💰 No Extra Charges For</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-semibold">No Platform Subscription</span>
                    <p className="text-sm text-muted-foreground">Pay only per order, not monthly fees</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-semibold">No Commission on Sales Price</span>
                    <p className="text-sm text-muted-foreground">We only take 5% of your profit margin, not total sale</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-semibold">No Hosting or Infrastructure Costs</span>
                    <p className="text-sm text-muted-foreground">All automation hosting included in our fees</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-semibold">No Technical Training Required</span>
                    <p className="text-sm text-muted-foreground">We handle all technical aspects for you</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Start Earning?</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Join successful AI agency owners who are scaling their revenue without the technical complexity.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button size="lg" onClick={() => navigate('/dashboard')}>
              Start Selling Today
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button variant="outline" size="lg" onClick={() => navigate('/features')}>
              View All Features
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            No credit card required • Start earning in 24 hours
          </p>
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

export default Pricing;