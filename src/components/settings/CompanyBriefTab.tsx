
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle, Save, Trash2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { usePlatforms } from "@/contexts/PlatformsContext";
import { useToast } from "@/hooks/use-toast";

const CompanyBriefTab: React.FC = () => {
  const { connections } = usePlatforms();
  const { toast } = useToast();
  
  const [companies, setCompanies] = useState([
    {
      id: '1',
      name: 'Default Company',
      description: '',
      targetAudience: '',
      targetLocations: '',
      selectedAccounts: [] as string[]
    }
  ]);

  const handleAddCompany = () => {
    setCompanies([
      ...companies,
      {
        id: `company-${Date.now()}`,
        name: `Company ${companies.length + 1}`,
        description: '',
        targetAudience: '',
        targetLocations: '',
        selectedAccounts: []
      }
    ]);
  };

  const handleRemoveCompany = (id: string) => {
    setCompanies(companies.filter(company => company.id !== id));
  };

  const handleInputChange = (id: string, field: string, value: string) => {
    setCompanies(companies.map(company => 
      company.id === id ? { ...company, [field]: value } : company
    ));
  };

  const handleAccountToggle = (companyId: string, accountId: string) => {
    setCompanies(companies.map(company => {
      if (company.id === companyId) {
        const selectedAccounts = company.selectedAccounts.includes(accountId)
          ? company.selectedAccounts.filter(id => id !== accountId)
          : [...company.selectedAccounts, accountId];
        
        return { ...company, selectedAccounts };
      }
      return company;
    }));
  };

  const handleSelectAll = (companyId: string, select: boolean) => {
    setCompanies(companies.map(company => {
      if (company.id === companyId) {
        return {
          ...company,
          selectedAccounts: select ? connections.map(conn => conn.id) : []
        };
      }
      return company;
    }));
  };

  const handleSave = () => {
    toast({
      title: "Company briefs saved",
      description: `Saved ${companies.length} company ${companies.length === 1 ? 'brief' : 'briefs'}.`
    });
  };

  return (
    <div className="space-y-6">
      {companies.map((company, index) => (
        <Card key={company.id} className="relative">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>
                <Input
                  className="font-bold text-lg h-8 px-0 border-none focus-visible:ring-0 focus-visible:ring-offset-0"
                  value={company.name}
                  onChange={(e) => handleInputChange(company.id, 'name', e.target.value)}
                />
              </CardTitle>
              {companies.length > 1 && (
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => handleRemoveCompany(company.id)}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              )}
            </div>
            <CardDescription>
              Complete the brief for {company.name} to inform your ad campaigns
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Company & Product Description</Label>
                <Textarea
                  placeholder="Tell us about your company and your product..."
                  className="min-h-[100px]"
                  value={company.description}
                  onChange={(e) => handleInputChange(company.id, 'description', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Target Audience</Label>
                <Textarea
                  placeholder="Describe your target audience..."
                  value={company.targetAudience}
                  onChange={(e) => handleInputChange(company.id, 'targetAudience', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Target Locations</Label>
                <Textarea
                  placeholder="List your target geographic locations..."
                  value={company.targetLocations}
                  onChange={(e) => handleInputChange(company.id, 'targetLocations', e.target.value)}
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
                    onClick={() => handleSelectAll(company.id, true)}
                  >
                    Select All
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleSelectAll(company.id, false)}
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
                        id={`${company.id}-${connection.id}`}
                        checked={company.selectedAccounts.includes(connection.id)}
                        onCheckedChange={() => handleAccountToggle(company.id, connection.id)}
                      />
                      <label 
                        htmlFor={`${company.id}-${connection.id}`}
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
        onClick={handleAddCompany}
      >
        <PlusCircle className="h-4 w-4" />
        Add Another Company
      </Button>
      
      <div className="flex justify-end">
        <Button className="alchemy-gradient" onClick={handleSave}>
          <Save className="h-4 w-4 mr-2" />
          Save All Briefs
        </Button>
      </div>
    </div>
  );
};

export default CompanyBriefTab;
