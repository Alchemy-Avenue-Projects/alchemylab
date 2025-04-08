
import React from "react";
import { Link, CreditCard } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import IntegrationItem from "./IntegrationItem";

const IntegrationsTab: React.FC = () => {
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Ad Platform Integrations</CardTitle>
          <CardDescription>
            Connect your ad accounts from various platforms.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <IntegrationItem 
              name="Facebook Ads"
              status="connected"
              account="Marketing Agency"
              logo="/placeholder.svg"
            />
            <IntegrationItem 
              name="Google Ads"
              status="connected"
              account="marketing-agency@gmail.com"
              logo="/placeholder.svg"
            />
            <IntegrationItem 
              name="LinkedIn Ads"
              status="connected"
              account="Marketing Agency"
              logo="/placeholder.svg"
            />
            <IntegrationItem 
              name="TikTok Ads"
              status="not-connected"
              logo="/placeholder.svg"
            />
            <IntegrationItem 
              name="Pinterest Ads"
              status="not-connected"
              logo="/placeholder.svg"
            />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Analytics Integrations</CardTitle>
          <CardDescription>
            Connect your analytics platforms to import performance data.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <IntegrationItem 
              name="Google Analytics 4"
              status="connected"
              account="marketing-agency@gmail.com"
              logo="/placeholder.svg"
            />
            <IntegrationItem 
              name="Mixpanel"
              status="not-connected"
              logo="/placeholder.svg"
            />
            <IntegrationItem 
              name="Amplitude"
              status="not-connected"
              logo="/placeholder.svg"
            />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>AI Integrations</CardTitle>
          <CardDescription>
            Connect AI services for enhanced capabilities.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <IntegrationItem 
              name="OpenAI"
              status="connected"
              account="API Key: sk-...***"
              logo="/placeholder.svg"
            />
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default IntegrationsTab;
