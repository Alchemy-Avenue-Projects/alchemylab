import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle, Save, Trash2, Loader2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { usePlatforms } from "@/contexts/PlatformsContext";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

type ProductBrief = {
  id?: string;
  name: string;
  description: string;
  targetAudience: string;
  targetLocations: string;
  selectedAccounts: string[];
};

const ProductBriefTab: React.FC = () => {
  const { connections } = usePlatforms();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [products, setProducts] = useState<ProductBrief[]>([
    {
      name: '',
      description: '',
      targetAudience: '',
      targetLocations: '',
      selectedAccounts: []
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch product briefs when component mounts
  useEffect(() => {
    const fetchProductBriefs = async () => {
      if (!user) return;
      
      setIsLoading(true);
      try {
        const { data: productBriefs, error } = await supabase
          .from('product_briefs')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        
        if (productBriefs && productBriefs.length > 0) {
          // For each product brief, get its associated accounts
          const productsWithAccounts = await Promise.all(
            productBriefs.map(async (brief) => {
              const { data: accounts, error: accountsError } = await supabase
                .from('product_brief_accounts')
                .select('ad_account_id')
                .eq('product_brief_id', brief.id);
                
              if (accountsError) throw accountsError;
              
              return {
                id: brief.id,
                name: brief.name,
                description: brief.description || '',
                targetAudience: brief.target_audience || '',
                targetLocations: brief.target_locations || '',
                selectedAccounts: accounts ? accounts.map(a => a.ad_account_id) : []
              };
            })
          );
          
          setProducts(productsWithAccounts);
        } else if (productBriefs && productBriefs.length === 0) {
          // If no briefs found, keep default empty brief
          setProducts([{
            name: '',
            description: '',
            targetAudience: '',
            targetLocations: '',
            selectedAccounts: []
          }]);
        }
      } catch (error) {
        console.error('Error fetching product briefs:', error);
        toast({
          title: "Error",
          description: "Failed to load product briefs.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProductBriefs();
  }, [user, toast]);

  const handleAddProduct = () => {
    setProducts([
      ...products,
      {
        name: '',
        description: '',
        targetAudience: '',
        targetLocations: '',
        selectedAccounts: []
      }
    ]);
  };

  const handleRemoveProduct = (index: number) => {
    setProducts(products.filter((_, i) => i !== index));
  };

  const handleInputChange = (index: number, field: string, value: string) => {
    setProducts(products.map((product, i) => 
      i === index ? { ...product, [field]: value } : product
    ));
  };

  const handleAccountToggle = (productIndex: number, accountId: string) => {
    setProducts(products.map((product, index) => {
      if (index === productIndex) {
        const selectedAccounts = product.selectedAccounts.includes(accountId)
          ? product.selectedAccounts.filter(id => id !== accountId)
          : [...product.selectedAccounts, accountId];
        
        return { ...product, selectedAccounts };
      }
      return product;
    }));
  };

  const handleSelectAll = (productIndex: number, select: boolean) => {
    setProducts(products.map((product, index) => {
      if (index === productIndex) {
        return {
          ...product,
          selectedAccounts: select ? connections.map(conn => conn.id) : []
        };
      }
      return product;
    }));
  };

  const validateProducts = () => {
    for (const product of products) {
      if (!product.name || product.name.trim() === '') {
        toast({
          title: "Validation Error",
          description: "Product name is required.",
          variant: "destructive"
        });
        return false;
      }
    }
    return true;
  };

  const handleSave = async () => {
    if (!user) {
      toast({
        title: "Authentication Error",
        description: "You must be logged in to save product briefs.",
        variant: "destructive"
      });
      return;
    }
    
    if (!validateProducts()) return;
    
    setIsSaving(true);
    
    try {
      // For each product, insert or update in the database
      for (const product of products) {
        let productId = product.id;
        
        // If product has an id, update it; otherwise, insert a new one
        if (productId) {
          const { error } = await supabase
            .from('product_briefs')
            .update({
              name: product.name,
              description: product.description,
              target_audience: product.targetAudience,
              target_locations: product.targetLocations
            })
            .eq('id', productId);
            
          if (error) throw error;
        } else {
          // Insert new product
          const { data, error } = await supabase
            .from('product_briefs')
            .insert({
              user_id: user.id,
              name: product.name,
              description: product.description,
              target_audience: product.targetAudience,
              target_locations: product.targetLocations
            })
            .select();
            
          if (error) throw error;
          productId = data[0].id;
        }
        
        // Remove all existing account associations for this product
        if (productId) {
          const { error } = await supabase
            .from('product_brief_accounts')
            .delete()
            .eq('product_brief_id', productId);
            
          if (error) throw error;
          
          // Insert new account associations
          if (product.selectedAccounts.length > 0) {
            const accountMappings = product.selectedAccounts.map(accountId => ({
              product_brief_id: productId,
              ad_account_id: accountId
            }));
            
            const { error: insertError } = await supabase
              .from('product_brief_accounts')
              .insert(accountMappings);
              
            if (insertError) throw insertError;
          }
        }
      }
      
      toast({
        title: "Success",
        description: `Saved ${products.length} product ${products.length === 1 ? 'brief' : 'briefs'}.`
      });
      
      // Refresh the product briefs
      const { data: refreshedBriefs, error } = await supabase
        .from('product_briefs')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      if (refreshedBriefs && refreshedBriefs.length > 0) {
        const productsWithAccounts = await Promise.all(
          refreshedBriefs.map(async (brief) => {
            const { data: accounts, error: accountsError } = await supabase
              .from('product_brief_accounts')
              .select('ad_account_id')
              .eq('product_brief_id', brief.id);
              
            if (accountsError) throw accountsError;
            
            return {
              id: brief.id,
              name: brief.name,
              description: brief.description || '',
              targetAudience: brief.target_audience || '',
              targetLocations: brief.target_locations || '',
              selectedAccounts: accounts ? accounts.map(a => a.ad_account_id) : []
            };
          })
        );
        
        setProducts(productsWithAccounts);
      }
      
    } catch (error) {
      console.error('Error saving product briefs:', error);
      toast({
        title: "Error",
        description: "Failed to save product briefs.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-10">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
        <span className="ml-2 text-lg">Loading product briefs...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {products.map((product, index) => (
        <Card key={index} className="relative">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>
                <Input
                  className="font-bold text-lg h-8 px-0 border-none focus-visible:ring-0 focus-visible:ring-offset-0"
                  value={product.name}
                  onChange={(e) => handleInputChange(index, 'name', e.target.value)}
                  placeholder="Enter product name"
                />
              </CardTitle>
              {products.length > 1 && (
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => handleRemoveProduct(index)}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              )}
            </div>
            <CardDescription>
              Complete the brief for this product to inform your ad campaigns
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Product Description</Label>
                <Textarea
                  placeholder="Tell us about your product..."
                  className="min-h-[100px]"
                  value={product.description}
                  onChange={(e) => handleInputChange(index, 'description', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Target Audience</Label>
                <Textarea
                  placeholder="Describe your target audience..."
                  value={product.targetAudience}
                  onChange={(e) => handleInputChange(index, 'targetAudience', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Target Locations</Label>
                <Textarea
                  placeholder="List your target geographic locations..."
                  value={product.targetLocations}
                  onChange={(e) => handleInputChange(index, 'targetLocations', e.target.value)}
                />
              </div>
            </div>
            
            <Separator />
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base">Apply to Ad Accounts</Label>
                <div className="space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleSelectAll(index, true)}
                  >
                    Select All
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleSelectAll(index, false)}
                  >
                    Clear All
                  </Button>
                </div>
              </div>
              
              <div className="grid gap-3">
                {connections.length > 0 ? (
                  connections.map(connection => (
                    <div key={connection.id} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`${index}-${connection.id}`}
                        checked={product.selectedAccounts.includes(connection.id)}
                        onCheckedChange={() => handleAccountToggle(index, connection.id)}
                      />
                      <label 
                        htmlFor={`${index}-${connection.id}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {connection.account_name || connection.platform} {connection.platform && `(${connection.platform})`}
                      </label>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-muted-foreground">
                    No ad accounts connected. Connect accounts in the Integrations tab.
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      
      <Button 
        variant="outline" 
        className="w-full py-6 border-dashed flex items-center justify-center gap-2" 
        onClick={handleAddProduct}
      >
        <PlusCircle className="h-4 w-4" />
        Add Another Product
      </Button>
      
      <div className="flex justify-end">
        <Button 
          className="alchemy-gradient" 
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save All Briefs
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default ProductBriefTab;
