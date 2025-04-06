
import React from "react";
import { 
  Lightbulb, 
  TrendingUp, 
  UserCheck, 
  Target, 
  Zap,
  AlertCircle,
  ChevronRight,
  ThumbsUp,
  ThumbsDown,
  Check,
  Copy
} from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface Insight {
  id: string;
  title: string;
  description: string;
  platform: string;
  category: "optimization" | "audience" | "creative" | "budget";
  impact: "high" | "medium" | "low";
  date: string;
  icon: React.ReactNode;
}

interface CreativeSuggestion {
  id: string;
  title: string;
  originalText: string;
  suggestedText: string;
  platform: string;
  impact: "high" | "medium" | "low";
  reason: string;
}

const insights: Insight[] = [
  {
    id: "1",
    title: "Budget reallocation opportunity",
    description: "Your Facebook campaign 'Summer Sale' is performing 32% better than others. Consider reallocating budget from underperforming campaigns.",
    platform: "Facebook",
    category: "budget",
    impact: "high",
    date: "2025-04-01",
    icon: <TrendingUp />
  },
  {
    id: "2",
    title: "Audience overlap detected",
    description: "We've detected a 45% audience overlap between your 'Product Launch' and 'Brand Awareness' campaigns, causing them to compete against each other.",
    platform: "LinkedIn",
    category: "audience",
    impact: "medium",
    date: "2025-03-30",
    icon: <UserCheck />
  },
  {
    id: "3",
    title: "Creative fatigue detected",
    description: "Your ad creative for 'Retargeting Campaign' has been running for 3 weeks and is showing signs of fatigue with declining CTR (-18%).",
    platform: "Instagram",
    category: "creative",
    impact: "high",
    date: "2025-03-28",
    icon: <AlertCircle />
  },
  {
    id: "4",
    title: "Bid optimization opportunity",
    description: "Increasing your bid by 15% could improve your ad position and potentially increase conversions based on historical performance data.",
    platform: "Google Ads",
    category: "optimization",
    impact: "medium",
    date: "2025-03-27",
    icon: <Target />
  },
  {
    id: "5",
    title: "New audience segment identified",
    description: "Based on your conversion data, we've identified a new potential audience segment: 'Small Business Owners in Tech' that could yield better results.",
    platform: "Facebook",
    category: "audience",
    impact: "high",
    date: "2025-03-25",
    icon: <UserCheck />
  }
];

const creativeSuggestions: CreativeSuggestion[] = [
  {
    id: "1",
    title: "Headline optimization for LinkedIn campaign",
    originalText: "Discover our new product features today",
    suggestedText: "Boost team productivity by 32% with our new AI-powered features",
    platform: "LinkedIn",
    impact: "high",
    reason: "Specific metrics and benefits outperform generic statements on LinkedIn business audience"
  },
  {
    id: "2",
    title: "Call-to-action improvement",
    originalText: "Click here to learn more",
    suggestedText: "Start your free 14-day trial today",
    platform: "Facebook",
    impact: "medium",
    reason: "Direct CTAs with clear value propositions typically increase conversion rates"
  },
  {
    id: "3",
    title: "Description enhancement for Google Ads",
    originalText: "We offer the best marketing software on the market",
    suggestedText: "Save 5+ hours/week with our award-winning marketing automation tools trusted by 10,000+ agencies",
    platform: "Google Ads",
    impact: "high",
    reason: "Social proof and specific time-saving benefits increase click-through rates"
  },
  {
    id: "4",
    title: "Instagram ad copy improvement",
    originalText: "Check out our summer collection",
    suggestedText: "Limited edition: Our summer collection drops today. Free shipping for the next 24 hours!",
    platform: "Instagram",
    impact: "medium",
    reason: "Urgency and exclusive offers drive higher engagement on Instagram"
  }
];

const AIInsights: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold">AI Insights</h1>
          <p className="text-muted-foreground">Powered by AdAlchemy's machine learning algorithms</p>
        </div>
        <Button className="alchemy-gradient">
          <Zap className="h-4 w-4 mr-2" />
          Generate New Insights
        </Button>
      </div>
      
      <Tabs defaultValue="recommendations">
        <TabsList className="mb-4">
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          <TabsTrigger value="creative">Creative Suggestions</TabsTrigger>
          <TabsTrigger value="learnings">AI Learnings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="recommendations" className="mt-0 animate-fade-in">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {insights.map((insight) => (
              <Card key={insight.id}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-2">
                      <div className="h-8 w-8 rounded-full bg-alchemy-100 text-alchemy-600 flex items-center justify-center">
                        {insight.icon}
                      </div>
                      <CardTitle className="text-base">{insight.title}</CardTitle>
                    </div>
                    <Badge 
                      variant="outline" 
                      className={
                        insight.impact === "high" 
                          ? "text-red-500 border-red-200" 
                          : insight.impact === "medium" 
                            ? "text-amber-500 border-amber-200" 
                            : "text-green-500 border-green-200"
                      }
                    >
                      {insight.impact.charAt(0).toUpperCase() + insight.impact.slice(1)} Impact
                    </Badge>
                  </div>
                  <CardDescription className="mt-2">{insight.platform} • {insight.date}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{insight.description}</p>
                </CardContent>
                <CardFooter className="pt-0 flex gap-2">
                  <Button variant="ghost" className="flex-1 text-sm">Dismiss</Button>
                  <Button className="flex-1 text-sm alchemy-gradient">Apply</Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="creative" className="mt-0 animate-fade-in">
          <div className="grid grid-cols-1 gap-4">
            {creativeSuggestions.map((suggestion) => (
              <Card key={suggestion.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-2">
                      <Lightbulb className="h-5 w-5 text-alchemy-600" />
                      <CardTitle className="text-base">{suggestion.title}</CardTitle>
                    </div>
                    <Badge 
                      variant="outline" 
                      className={
                        suggestion.impact === "high" 
                          ? "text-red-500 border-red-200" 
                          : suggestion.impact === "medium" 
                            ? "text-amber-500 border-amber-200" 
                            : "text-green-500 border-green-200"
                      }
                    >
                      {suggestion.impact.charAt(0).toUpperCase() + suggestion.impact.slice(1)} Impact
                    </Badge>
                  </div>
                  <CardDescription>{suggestion.platform}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="text-sm font-medium mb-1">Original Text:</div>
                      <div className="p-3 bg-muted rounded-md text-sm">
                        {suggestion.originalText}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-medium mb-1">Suggested Text:</div>
                      <div className="p-3 bg-alchemy-50 text-alchemy-900 dark:bg-alchemy-900 dark:text-alchemy-50 rounded-md text-sm relative group">
                        {suggestion.suggestedText}
                        <Button variant="ghost" size="icon" className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-medium mb-1">Reasoning:</div>
                      <div className="text-sm text-muted-foreground">
                        {suggestion.reason}
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pt-0 flex justify-between">
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <ThumbsDown className="h-4 w-4 mr-1" />
                      Not useful
                    </Button>
                    <Button variant="outline" size="sm">
                      <ThumbsUp className="h-4 w-4 mr-1" />
                      Useful
                    </Button>
                  </div>
                  <Button size="sm" className="alchemy-gradient">
                    <Check className="h-4 w-4 mr-1" />
                    Use This
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="learnings" className="mt-0 animate-fade-in">
          <Card>
            <CardHeader>
              <CardTitle>AI Learnings & Patterns</CardTitle>
              <CardDescription>
                Insights and patterns our AI has discovered from your campaign data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger>
                    <div className="flex items-center">
                      <Badge className="mr-2 alchemy-gradient">High Impact</Badge>
                      Time of day significantly impacts conversion rates
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4 text-sm">
                      <p>
                        Our AI has detected that your campaigns consistently perform better during specific time periods. 
                        For B2B campaigns, Tuesday and Wednesday between 10am-2pm show 45% higher conversion rates.
                        For consumer products, evenings (7pm-10pm) and weekends show 32% better performance.
                      </p>
                      <div className="bg-muted p-3 rounded-md">
                        <h4 className="font-medium mb-1">Suggested Action:</h4>
                        <p>Consider implementing time-based bid adjustments to increase bids during high-performance windows and reduce spend during low-performance periods.</p>
                      </div>
                      <div className="flex justify-end">
                        <Button size="sm" className="alchemy-gradient">
                          Create Schedule-based Rule
                          <ChevronRight className="ml-1 h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-2">
                  <AccordionTrigger>
                    <div className="flex items-center">
                      <Badge className="mr-2 alchemy-gradient">High Impact</Badge>
                      Ad creative with customer testimonials outperforms other formats
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4 text-sm">
                      <p>
                        Based on analysis across all your campaigns, ads featuring customer testimonials and social proof have a 37% higher click-through rate and 24% better conversion rate compared to feature-focused creatives.
                      </p>
                      <div className="bg-muted p-3 rounded-md">
                        <h4 className="font-medium mb-1">Suggested Action:</h4>
                        <p>Develop more ad creative showcasing customer testimonials, case studies, and review highlights. A/B test different testimonial formats.</p>
                      </div>
                      <div className="flex justify-end">
                        <Button size="sm" className="alchemy-gradient">
                          Create Ad with Testimonial Template
                          <ChevronRight className="ml-1 h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-3">
                  <AccordionTrigger>
                    <div className="flex items-center">
                      <Badge className="mr-2" variant="outline">Medium Impact</Badge>
                      Geographic performance variations detected
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4 text-sm">
                      <p>
                        We've identified significant performance variations by location. Campaigns in urban areas have 28% higher conversion rates than suburban regions, while Western regions outperform Eastern regions by 15%.
                      </p>
                      <div className="bg-muted p-3 rounded-md">
                        <h4 className="font-medium mb-1">Suggested Action:</h4>
                        <p>Implement geographic bid adjustments based on performance data. Consider creating location-specific ad variants.</p>
                      </div>
                      <div className="flex justify-end">
                        <Button size="sm" variant="outline">
                          View Geographic Report
                          <ChevronRight className="ml-1 h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-4">
                  <AccordionTrigger>
                    <div className="flex items-center">
                      <Badge className="mr-2" variant="outline">Medium Impact</Badge>
                      Audience segment discovery
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4 text-sm">
                      <p>
                        Our algorithm has identified high-performing audience segments that weren't specifically targeted. Users with interests in "productivity tools" and "business automation" have 40% higher engagement with your ads.
                      </p>
                      <div className="bg-muted p-3 rounded-md">
                        <h4 className="font-medium mb-1">Suggested Action:</h4>
                        <p>Create dedicated campaigns targeting these discovered interests. Test different messaging approaches for these segments.</p>
                      </div>
                      <div className="flex justify-end">
                        <Button size="sm" variant="outline">
                          Create Audience Segment
                          <ChevronRight className="ml-1 h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AIInsights;
