import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  BarChart3, 
  Sparkles, 
  LayoutGrid, 
  FileBarChart, 
  Image, 
  Users, 
  Settings, 
  MessageSquare, 
  Shield, 
  Globe, 
  Zap
} from "lucide-react";

export default function Features() {
  return (
    <>
      <section className="py-20 md:py-28">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              A Complete Marketing Platform
            </h1>
            <p className="text-xl text-muted-foreground">
              Discover all the powerful features that make AlchemyLab the ultimate tool for modern marketers.
            </p>
          </div>

          <div className="grid gap-16">
            <FeatureSection 
              title="AI-Powered Insights"
              description="Leverage the power of AI to uncover insights, optimize campaigns, and predict trends."
              image="https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?auto=format&fit=crop&w=1200&q=80"
              imageAlt="AI Insights Dashboard"
              icon={<Sparkles className="h-8 w-8" />}
              reverse={false}
              points={[
                "Predictive analytics for campaign performance",
                "Automated content recommendations",
                "Audience segmentation suggestions",
                "Competitive intelligence insights"
              ]}
            />

            <FeatureSection 
              title="Comprehensive Analytics"
              description="Get deep insights into your marketing performance with detailed analytics dashboards."
              image="https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=1200&q=80"
              imageAlt="Analytics Dashboard"
              icon={<BarChart3 className="h-8 w-8" />}
              reverse={true}
              points={[
                "Real-time performance tracking",
                "Custom reporting tools",
                "Multi-channel attribution modeling",
                "Conversion funnel analysis"
              ]}
            />

            <FeatureSection 
              title="Campaign Management"
              description="Create, manage, and optimize your marketing campaigns from a single unified interface."
              image="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1200&q=80"
              imageAlt="Campaign Management"
              icon={<LayoutGrid className="h-8 w-8" />}
              reverse={false}
              points={[
                "Multi-channel campaign creation",
                "Automated A/B testing",
                "Campaign scheduling and automation",
                "Budget management and optimization"
              ]}
            />

            <FeatureSection 
              title="Team Collaboration"
              description="Seamlessly work together with your team in real-time."
              image="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1200&q=80"
              imageAlt="Team Collaboration"
              icon={<Users className="h-8 w-8" />}
              reverse={true}
              points={[
                "Role-based access control",
                "Real-time collaboration tools",
                "Approval workflows",
                "Activity tracking and audit logs"
              ]}
            />
          </div>

          <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<FileBarChart className="h-6 w-6 text-primary" />} 
              title="Automated Reporting" 
              description="Generate comprehensive reports with just a few clicks, no technical skills required."
            />
            <FeatureCard 
              icon={<Image className="h-6 w-6 text-primary" />} 
              title="Media Library" 
              description="Organize and access all your creative assets in one centralized location."
            />
            <FeatureCard 
              icon={<MessageSquare className="h-6 w-6 text-primary" />} 
              title="Content Creation" 
              description="Create engaging content with AI-powered writing assistant and design tools."
            />
            <FeatureCard 
              icon={<Shield className="h-6 w-6 text-primary" />} 
              title="Security & Compliance" 
              description="Enterprise-grade security with advanced data protection and compliance features."
            />
            <FeatureCard 
              icon={<Globe className="h-6 w-6 text-primary" />} 
              title="Global Support" 
              description="24/7 dedicated support from our team of marketing and platform experts."
            />
            <FeatureCard 
              icon={<Zap className="h-6 w-6 text-primary" />} 
              title="Fast Implementation" 
              description="Quick setup and onboarding with pre-built templates and integrations."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary/5">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Experience AlchemyLab?</h2>
            <p className="text-xl text-muted-foreground mb-8">
              Start your 7-day free trial today. No credit card required.
            </p>
            <Button size="lg" asChild className="alchemy-gradient">
              <Link to="/pricing">View Pricing & Plans</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}

function FeatureSection({ 
  title, 
  description, 
  image, 
  imageAlt, 
  icon, 
  reverse, 
  points 
}: { 
  title: string; 
  description: string; 
  image: string; 
  imageAlt: string; 
  icon: React.ReactNode; 
  reverse: boolean; 
  points: string[]; 
}) {
  return (
    <div className={`grid md:grid-cols-2 gap-8 lg:gap-12 items-center ${reverse ? 'md:flex-row-reverse' : ''}`}>
      <div className={reverse ? "md:order-2" : ""}>
        <div className="inline-flex items-center justify-center p-2 bg-primary/10 rounded-lg mb-4">
          <div className="text-primary">{icon}</div>
        </div>
        <h2 className="text-3xl font-bold mb-4">{title}</h2>
        <p className="text-lg text-muted-foreground mb-6">{description}</p>
        <ul className="space-y-3">
          {points.map((point, index) => (
            <li key={index} className="flex items-start">
              <div className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center mr-3 mt-0.5">
                ✓
              </div>
              <span>{point}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className={reverse ? "md:order-1" : ""}>
        <div className="rounded-lg overflow-hidden border shadow-lg">
          <img src={image} alt={imageAlt} className="w-full h-auto" />
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="p-6 rounded-lg border bg-card hover:shadow-md transition-shadow">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}
