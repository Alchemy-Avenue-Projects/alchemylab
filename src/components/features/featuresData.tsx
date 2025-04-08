
import React from "react";
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

export const mainFeatures = [
  {
    title: "AI-Powered Insights",
    description: "Leverage the power of AI to uncover insights, optimize campaigns, and predict trends.",
    image: "https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?auto=format&fit=crop&w=1200&q=80",
    imageAlt: "AI Insights Dashboard",
    icon: <Sparkles className="h-8 w-8" />,
    reverse: false,
    points: [
      "Predictive analytics for campaign performance",
      "Automated content recommendations",
      "Audience segmentation suggestions",
      "Competitive intelligence insights"
    ]
  },
  {
    title: "Comprehensive Analytics",
    description: "Get deep insights into your marketing performance with detailed analytics dashboards.",
    image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=1200&q=80",
    imageAlt: "Analytics Dashboard",
    icon: <BarChart3 className="h-8 w-8" />,
    reverse: true,
    points: [
      "Real-time performance tracking",
      "Custom reporting tools",
      "Multi-channel attribution modeling",
      "Conversion funnel analysis"
    ]
  },
  {
    title: "Campaign Management",
    description: "Create, manage, and optimize your marketing campaigns from a single unified interface.",
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1200&q=80",
    imageAlt: "Campaign Management",
    icon: <LayoutGrid className="h-8 w-8" />,
    reverse: false,
    points: [
      "Multi-channel campaign creation",
      "Automated A/B testing",
      "Campaign scheduling and automation",
      "Budget management and optimization"
    ]
  },
  {
    title: "Team Collaboration",
    description: "Seamlessly work together with your team in real-time.",
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1200&q=80",
    imageAlt: "Team Collaboration",
    icon: <Users className="h-8 w-8" />,
    reverse: true,
    points: [
      "Role-based access control",
      "Real-time collaboration tools",
      "Approval workflows",
      "Activity tracking and audit logs"
    ]
  }
];

export const additionalFeatures = [
  {
    icon: <FileBarChart className="h-6 w-6 text-primary" />,
    title: "Automated Reporting",
    description: "Generate comprehensive reports with just a few clicks, no technical skills required."
  },
  {
    icon: <Image className="h-6 w-6 text-primary" />,
    title: "Media Library",
    description: "Organize and access all your creative assets in one centralized location."
  },
  {
    icon: <MessageSquare className="h-6 w-6 text-primary" />,
    title: "Content Creation",
    description: "Create engaging content with AI-powered writing assistant and design tools."
  },
  {
    icon: <Shield className="h-6 w-6 text-primary" />,
    title: "Security & Compliance",
    description: "Enterprise-grade security with advanced data protection and compliance features."
  },
  {
    icon: <Globe className="h-6 w-6 text-primary" />,
    title: "Global Support",
    description: "24/7 dedicated support from our team of marketing and platform experts."
  },
  {
    icon: <Zap className="h-6 w-6 text-primary" />,
    title: "Fast Implementation",
    description: "Quick setup and onboarding with pre-built templates and integrations."
  }
];
