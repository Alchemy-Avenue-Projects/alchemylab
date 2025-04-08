
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import LandingLayout from "@/components/layout/LandingLayout";
import { BarChart3, Sparkles, LayoutGrid, FileBarChart, Image, Users, Shield, CheckCircle2, Zap, TrendingUp, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function Homepage() {
  return (
    <LandingLayout>
      {/* Hero Section */}
      <section className="py-20 md:py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-primary/10 to-transparent pointer-events-none" />
        <div className="container relative">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary font-medium text-sm mb-4">
              AI-Powered Marketing Platform
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
              Transform Your Marketing ROI with AI Insights
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8">
              Boost conversion rates by up to 47% with AlchemyLab's intelligent campaign analytics and optimization.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild className="alchemy-gradient relative overflow-hidden group">
                <Link to="/pricing">
                  Start Free Trial
                  <span className="absolute right-4 group-hover:translate-x-1 transition-transform">
                    <ArrowRight className="h-5 w-5 ml-1" />
                  </span>
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/features">See How It Works</Link>
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              No credit card required • 7-day free trial • Cancel anytime
            </p>
          </div>
          
          <div className="relative mx-auto rounded-lg overflow-hidden border shadow-xl max-w-5xl bg-white">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-purple-500/30 mix-blend-overlay pointer-events-none" />
            <img 
              src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80" 
              alt="AlchemyLab Dashboard" 
              className="w-full h-auto" 
            />
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-12 bg-muted/20">
        <div className="container">
          <div className="text-center mb-8">
            <p className="text-muted-foreground">Trusted by marketing teams at companies like</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 items-center justify-items-center">
            <div className="h-12 flex items-center">
              <div className="font-bold text-2xl text-gray-400">ACME Inc</div>
            </div>
            <div className="h-12 flex items-center">
              <div className="font-bold text-2xl text-gray-400">GlobalTech</div>
            </div>
            <div className="h-12 flex items-center">
              <div className="font-bold text-2xl text-gray-400">Innovex</div>
            </div>
            <div className="h-12 flex items-center">
              <div className="font-bold text-2xl text-gray-400">FutureNow</div>
            </div>
            <div className="h-12 flex items-center">
              <div className="font-bold text-2xl text-gray-400">Visionary</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container">
          <div className="text-center mb-16">
            <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary font-medium text-sm mb-4">
              Why Choose AlchemyLab
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Marketing Alchemy at Your Fingertips</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Our AI-powered platform transforms raw data into marketing gold, helping you optimize campaigns for maximum impact.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Sparkles className="h-8 w-8 text-primary" />} 
              title="AI-Powered Insights" 
              description="Leverage artificial intelligence to uncover hidden patterns and optimize your campaigns automatically."
            />
            <FeatureCard 
              icon={<BarChart3 className="h-8 w-8 text-primary" />} 
              title="Real-time Analytics" 
              description="Monitor campaign performance in real-time with comprehensive dashboards and customizable reports."
            />
            <FeatureCard 
              icon={<TrendingUp className="h-8 w-8 text-primary" />} 
              title="Conversion Optimization" 
              description="Increase conversion rates by up to 47% with AI-driven recommendations and A/B testing."
            />
            <FeatureCard 
              icon={<LayoutGrid className="h-8 w-8 text-primary" />} 
              title="Campaign Management" 
              description="Manage all your marketing campaigns from a single, intuitive interface with powerful automation."
            />
            <FeatureCard 
              icon={<Users className="h-8 w-8 text-primary" />} 
              title="Audience Segmentation" 
              description="Target the right audience with precision using advanced segmentation and personalization tools."
            />
            <FeatureCard 
              icon={<Zap className="h-8 w-8 text-primary" />} 
              title="Performance Booster" 
              description="Supercharge your marketing efforts with actionable insights that drive measurable results."
            />
          </div>
          
          <div className="text-center mt-12">
            <Button size="lg" asChild variant="outline" className="group">
              <Link to="/features" className="flex items-center">
                Explore All Features 
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Results Section */}
      <section className="py-20 bg-muted/20">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary font-medium text-sm mb-4">
                Proven Results
              </span>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Transforming Marketing Performance</h2>
              <p className="text-lg text-muted-foreground mb-8">
                Our customers consistently see remarkable improvements in their marketing metrics after implementing AlchemyLab.
              </p>
              
              <div className="space-y-4">
                <ResultItem 
                  metric="47%" 
                  text="Average increase in conversion rates" 
                />
                <ResultItem 
                  metric="68%" 
                  text="Reduction in customer acquisition costs" 
                />
                <ResultItem 
                  metric="3.5x" 
                  text="Return on marketing investment" 
                />
                <ResultItem 
                  metric="85%" 
                  text="Time saved on campaign analysis" 
                />
              </div>
              
              <Button className="mt-8 alchemy-gradient" size="lg" asChild>
                <Link to="/pricing">Start Your Transformation</Link>
              </Button>
            </div>
            
            <div className="rounded-lg overflow-hidden shadow-xl relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-purple-500/20 mix-blend-overlay pointer-events-none" />
              <img 
                src="https://images.unsplash.com/photo-1553877522-43269d4ea984?auto=format&fit=crop&w=1200&q=80" 
                alt="Marketing Results" 
                className="w-full h-auto" 
              />
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <div className="container">
          <div className="text-center mb-16">
            <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary font-medium text-sm mb-4">
              Success Stories
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">What Our Customers Say</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Join thousands of marketing professionals who've transformed their campaigns with AlchemyLab.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <TestimonialCard 
              quote="AlchemyLab has completely transformed our marketing strategy. The AI insights helped us increase conversions by 52% in just three months."
              name="Sarah Johnson"
              title="Marketing Director, Innovex"
              image="https://randomuser.me/api/portraits/women/45.jpg"
            />
            <TestimonialCard 
              quote="The campaign optimization tools are incredible. We've reduced our ad spend by 40% while maintaining the same conversion volume."
              name="David Chen"
              title="CMO, GlobalTech"
              image="https://randomuser.me/api/portraits/men/32.jpg"
            />
            <TestimonialCard 
              quote="The audience segmentation capabilities have allowed us to create hyper-targeted campaigns that resonate with our customers on a personal level."
              name="Emma Rodriguez"
              title="Digital Marketing Lead, FutureNow"
              image="https://randomuser.me/api/portraits/women/33.jpg"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary/10 to-purple-500/10">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Transform Your Marketing?</h2>
            <p className="text-xl text-muted-foreground mb-8">
              Start your 7-day free trial today. No credit card required.
            </p>
            <Button size="lg" asChild className="alchemy-gradient">
              <Link to="/pricing">Start Free Trial</Link>
            </Button>
            <p className="mt-4 text-sm text-muted-foreground">
              Join over 10,000 marketing professionals already using AlchemyLab
            </p>
          </div>
        </div>
      </section>
    </LandingLayout>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <Card className="border shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="pt-6">
        <div className="mb-4">{icon}</div>
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

function TestimonialCard({ quote, name, title, image }: { quote: string; name: string; title: string; image: string }) {
  return (
    <Card className="border shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      <CardContent className="pt-6 pb-6 flex flex-col h-full">
        <div className="mb-4 text-primary">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9.5 8H5.5C4.67 8 4 8.67 4 9.5V11.5C4 12.33 4.67 13 5.5 13H7.5C8.33 13 9 13.67 9 14.5V16.5C9 17.33 8.33 18 7.5 18H5.5C4.67 18 4 17.33 4 16.5V15M19.5 8H15.5C14.67 8 14 8.67 14 9.5V11.5C14 12.33 14.67 13 15.5 13H17.5C18.33 13 19 13.67 19 14.5V16.5C19 17.33 18.33 18 17.5 18H15.5C14.67 18 14 17.33 14 16.5V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <p className="italic mb-6 flex-grow">{quote}</p>
        <div className="flex items-center mt-auto">
          <img src={image} alt={name} className="w-12 h-12 rounded-full mr-4" />
          <div>
            <p className="font-medium">{name}</p>
            <p className="text-sm text-muted-foreground">{title}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ResultItem({ metric, text }: { metric: string; text: string }) {
  return (
    <div className="flex">
      <div className="mr-4 text-primary">
        <CheckCircle2 className="h-6 w-6" />
      </div>
      <div>
        <span className="text-xl font-bold text-primary">{metric}</span>
        <span className="ml-2">{text}</span>
      </div>
    </div>
  );
}
