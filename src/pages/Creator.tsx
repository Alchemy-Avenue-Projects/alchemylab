import React, { useState, useEffect } from "react";
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
  FileText,
  Check,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { SearchableSelect, SearchableSelectItem } from "@/components/ui/searchable-select";
import { MultiSelect, MultiSelectItem } from "@/components/ui/multi-select";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useProductBriefs } from "@/hooks/useProductBriefs";
import { useAdGenerator } from "@/hooks/useAdGenerator";
import { Platform, Angle, AdResult } from "@/types/creator";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";

const Creator: React.FC = () => {
  // States for form
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [selectedAngle, setSelectedAngle] = useState<string>("");
  const [selectedLanguage, setSelectedLanguage] = useState<string>("english");
  const [includeCta, setIncludeCta] = useState<boolean>(true);
  
  // States for results
  const [adResults, setAdResults] = useState<AdResult[]>([]);
  
  // Hooks
  const { productBriefs, isLoading: isLoadingProducts, error: productsError, getProductBriefById } = useProductBriefs();
  const { generateAds, isGenerating } = useAdGenerator();
  
  // Platform options
  const platformOptions: MultiSelectItem[] = [
    { value: "Meta", label: "Meta" },
    { value: "Google", label: "Google" },
    { value: "TikTok", label: "TikTok" },
    { value: "LinkedIn", label: "LinkedIn" },
    { value: "Pinterest", label: "Pinterest" },
    { value: "Snapchat", label: "Snapchat" }
  ];
  
  // Angle options
  const angleOptions = [
    { value: "urgency", label: "Urgency" },
    { value: "curiosity", label: "Curiosity" },
    { value: "social_proof", label: "Social Proof" },
    { value: "exclusivity", label: "Exclusivity" },
    { value: "affordability", label: "Affordability" },
    { value: "emotional", label: "Emotional" },
    { value: "relief", label: "Relief" }
  ];
  
  // Language options
  const languageOptions: SearchableSelectItem[] = [
    { value: "english", label: "English" },
    { value: "spanish", label: "Spanish" },
    { value: "french", label: "French" },
    { value: "german", label: "German" },
    { value: "italian", label: "Italian" },
    { value: "portuguese", label: "Portuguese" },
    { value: "dutch", label: "Dutch" },
    { value: "russian", label: "Russian" },
    { value: "chinese", label: "Chinese" },
    { value: "japanese", label: "Japanese" },
    { value: "korean", label: "Korean" }
  ];
  
  const isFormValid = selectedProductId && selectedPlatforms.length > 0;
  
  const handleGenerate = async () => {
    if (!isFormValid) {
      toast.error("Please select a product and at least one platform");
      return;
    }
    
    try {
      const productBrief = await getProductBriefById(selectedProductId);
      
      if (!productBrief) {
        toast.error("Failed to load product brief details");
        return;
      }
      
      const payload = {
        platform: selectedPlatforms as Platform[],
        product: productBrief.description || "",
        audience: productBrief.target_audience || "",
        location: productBrief.target_locations || "",
        language: selectedLanguage,
        angle: selectedAngle as Angle | undefined,
        cta: includeCta,
        dos: productBrief.dos || [],
        donts: productBrief.donts || []
      };
      
      const results = await generateAds(payload);
      setAdResults(results);
    } catch (error) {
      console.error("Error generating ads:", error);
      toast.error("Failed to generate ads");
    }
  };
  
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
          {adResults.length > 0 ? (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Generated Ads</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {adResults.map((result, index) => (
                    <div key={index} className="p-4 bg-muted rounded-md space-y-3">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-bold">{result.platform}</h3>
                        <Button variant="ghost" size="sm" className="h-8 gap-1">
                          <Copy className="h-3.5 w-3.5" />
                          Copy
                        </Button>
                      </div>
                      
                      {result.platform === 'Meta' ? (
                        <div className="space-y-2">
                          <div>
                            <Label className="text-xs text-muted-foreground">Primary Text</Label>
                            <p className="text-sm">{result.primary_text}</p>
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">Headline</Label>
                            <p className="text-sm font-medium">{result.headline}</p>
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">Description</Label>
                            <p className="text-sm">{result.description}</p>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div>
                            <Label className="text-xs text-muted-foreground">Headline</Label>
                            <p className="text-sm font-medium">{result.headline}</p>
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">Body</Label>
                            <p className="text-sm">{result.body}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            </>
          ) : (
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
          )}
          
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
                  {productsError ? (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Failed to load products. Please try again later.
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="product">Product</Label>
                        {isLoadingProducts ? (
                          <Skeleton className="h-10 w-full" />
                        ) : (
                          <Select
                            value={selectedProductId}
                            onValueChange={setSelectedProductId}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select a product" />
                            </SelectTrigger>
                            <SelectContent>
                              {productBriefs.map((product) => (
                                <SelectItem key={product.id} value={product.id}>
                                  {product.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="platform">Platform</Label>
                        <MultiSelect
                          items={platformOptions}
                          selected={selectedPlatforms}
                          onChange={setSelectedPlatforms}
                          placeholder="Select platforms"
                          disabled={isLoadingProducts}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="angle">Angle</Label>
                        <Textarea
                          id="angle"
                          value={selectedAngle}
                          onChange={(e) => setSelectedAngle(e.target.value)}
                          placeholder="Enter marketing angle (optional)"
                          className="resize-y min-h-[80px]"
                          disabled={isLoadingProducts}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="language">Language</Label>
                        <SearchableSelect
                          items={languageOptions}
                          value={selectedLanguage}
                          onChange={setSelectedLanguage}
                          placeholder="Search language"
                          disabled={isLoadingProducts}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between space-x-2">
                        <Label htmlFor="cta" className="cursor-pointer">Include CTA</Label>
                        <Switch
                          id="cta"
                          checked={includeCta}
                          onCheckedChange={setIncludeCta}
                          disabled={isLoadingProducts || !selectedProductId}
                        />
                      </div>
                    </div>
                  )}
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
              <Button 
                className="w-full alchemy-gradient" 
                onClick={handleGenerate}
                disabled={!isFormValid || isGenerating}
              >
                {isGenerating ? (
                  <>
                    <div className="h-4 w-4 mr-2 rounded-full border-2 border-current border-t-transparent animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Creator;
