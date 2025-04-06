
import React from "react";
import { 
  Sparkles, 
  Save, 
  Undo, 
  Redo, 
  Copy, 
  Share, 
  HelpCircle,
  RefreshCw,
  Layers,
  FileImage,
  FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";

const Creator: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold">AI Ad Creator</h1>
          <p className="text-muted-foreground">Generate optimized ad copy and creative content</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon">
            <HelpCircle className="h-4 w-4" />
          </Button>
          <Button className="alchemy-gradient">
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Ad Preview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="w-full aspect-[4/3] bg-muted rounded-md flex items-center justify-center">
                <FileImage className="h-12 w-12 text-muted-foreground" />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-lg font-bold">Boost Your Marketing Performance with AI</h3>
                <p className="text-sm">Discover how AI-powered optimization can increase conversions by 35% while reducing your ad spend. Try AdAlchemy today!</p>
                <Button className="alchemy-gradient w-full sm:w-auto">Learn More</Button>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Variations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="border rounded-md p-3 hover:border-alchemy-500 cursor-pointer transition-colors">
                    <h4 className="font-medium text-sm mb-2">Variation {i + 1}</h4>
                    <p className="text-xs text-muted-foreground">
                      {i === 0 && "Transform your marketing with AI-powered insights and optimization."}
                      {i === 1 && "Reduce ad costs by 30% while boosting performance with AdAlchemy."}
                      {i === 2 && "AI-powered marketing that delivers real results, not just promises."}
                      {i === 3 && "Smart marketers choose smart tools. Discover AdAlchemy today."}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                <RefreshCw className="h-4 w-4 mr-2" />
                Generate More Variations
              </Button>
            </CardFooter>
          </Card>
        </div>
        
        <div>
          <Card className="sticky top-20">
            <CardHeader>
              <CardTitle>Generator Controls</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <Tabs defaultValue="text">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="text">
                    <FileText className="h-4 w-4 mr-2" />
                    Text
                  </TabsTrigger>
                  <TabsTrigger value="image">
                    <Layers className="h-4 w-4 mr-2" />
                    Image
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="text" className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="prompt">Prompt</Label>
                    <Textarea
                      id="prompt"
                      placeholder="Create an ad promoting a marketing platform with AI features..."
                      className="min-h-32"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="target">Target Audience</Label>
                    <Input id="target" placeholder="Marketing professionals, digital agencies" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="platform">Platform</Label>
                    <Input id="platform" placeholder="Facebook Ads" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Tone</Label>
                    <div className="grid grid-cols-3 gap-2">
                      <Button variant="outline" size="sm" className="border-alchemy-500 bg-alchemy-50 dark:bg-alchemy-900/20">Professional</Button>
                      <Button variant="outline" size="sm">Casual</Button>
                      <Button variant="outline" size="sm">Persuasive</Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Additional Settings</Label>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <div className="space-y-0.5">
                          <Label htmlFor="cta">Include CTA</Label>
                          <p className="text-xs text-muted-foreground">Add a call to action</p>
                        </div>
                        <Switch id="cta" defaultChecked />
                      </div>
                      
                      <div>
                        <div className="flex justify-between mb-2">
                          <Label htmlFor="creativity">Creativity</Label>
                          <span className="text-xs">70%</span>
                        </div>
                        <Slider defaultValue={[70]} max={100} step={1} />
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="image" className="space-y-4 pt-4">
                  <div className="flex justify-center items-center bg-muted rounded-md p-6">
                    <p className="text-center text-muted-foreground">
                      Image generation coming soon!
                    </p>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
            <CardFooter>
              <Button className="w-full alchemy-gradient">
                <Sparkles className="h-4 w-4 mr-2" />
                Generate
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Creator;
