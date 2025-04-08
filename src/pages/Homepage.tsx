
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import LandingLayout from "@/components/layout/LandingLayout";
import { BarChart3, Sparkles, LayoutGrid, FileBarChart, Image, Users, Settings, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function Homepage() {
  return (
    <LandingLayout>
      {/* Hero Section */}
      <section className="py-20 md:py-28 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-muted/50 via-muted/20 to-transparent pointer-events-none" />
        <div className="container relative">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              Transform Your Marketing with AI-Powered Insights
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8">
              AlchemyLab combines analytics, AI, and campaign management in one powerful platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild className="alchemy-gradient">
                <Link to="/pricing">Get Started</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/features">Learn More</Link>
              </Button>
            </div>
          </div>
          <div className="relative mx-auto rounded-lg overflow-hidden border shadow-xl max-w-5xl">
            <img 
              src="https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&w=1200&q=80" 
              alt="AlchemyLab Dashboard" 
              className="w-full h-auto" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent pointer-events-none" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Powerful Features</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need to optimize your marketing campaigns and drive results.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<BarChart3 className="h-8 w-8 text-primary" />} 
              title="Advanced Analytics" 
              description="Get deep insights into your campaign performance with comprehensive analytics dashboards."
            />
            <FeatureCard 
              icon={<Sparkles className="h-8 w-8 text-primary" />} 
              title="AI Insights" 
              description="Leverage AI to uncover trends, predict outcomes, and optimize your marketing strategies."
            />
            <FeatureCard 
              icon={<LayoutGrid className="h-8 w-8 text-primary" />} 
              title="Campaign Management" 
              description="Create, manage, and track multiple campaigns from a single unified interface."
            />
            <FeatureCard 
              icon={<FileBarChart className="h-8 w-8 text-primary" />} 
              title="Automated Reporting" 
              description="Generate comprehensive reports with just a few clicks, no technical skills required."
            />
            <FeatureCard 
              icon={<Image className="h-8 w-8 text-primary" />} 
              title="Media Library" 
              description="Organize and access all your creative assets in one centralized location."
            />
            <FeatureCard 
              icon={<Users className="h-8 w-8 text-primary" />} 
              title="Team Collaboration" 
              description="Seamlessly collaborate with your team members in real-time."
            />
          </div>
          
          <div className="text-center mt-12">
            <Button size="lg" asChild>
              <Link to="/features">View All Features</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-20">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Trusted by Marketers Worldwide</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Join thousands of marketing teams who trust AlchemyLab for their campaign management and analytics.
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center justify-items-center opacity-70">
            <div className="h-12 flex items-center">
              <div className="font-bold text-2xl">Company A</div>
            </div>
            <div className="h-12 flex items-center">
              <div className="font-bold text-2xl">Company B</div>
            </div>
            <div className="h-12 flex items-center">
              <div className="font-bold text-2xl">Company C</div>
            </div>
            <div className="h-12 flex items-center">
              <div className="font-bold text-2xl">Company D</div>
            </div>
          </div>
          
          <div className="mt-16 bg-muted/30 rounded-lg p-8">
            <blockquote className="text-xl md:text-2xl italic text-center max-w-3xl mx-auto">
              "AlchemyLab has completely transformed how we approach our marketing campaigns. The AI insights have helped us increase our conversion rates by 45%."
            </blockquote>
            <div className="mt-6 text-center">
              <p className="font-medium">Jane Doe</p>
              <p className="text-sm text-muted-foreground">Marketing Director, Company A</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary/5">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Transform Your Marketing?</h2>
            <p className="text-xl text-muted-foreground mb-8">
              Start your 7-day free trial today. No credit card required.
            </p>
            <Button size="lg" asChild className="alchemy-gradient">
              <Link to="/pricing">Get Started Free</Link>
            </Button>
          </div>
        </div>
      </section>
    </LandingLayout>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="pt-6">
        <div className="mb-4">{icon}</div>
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}
