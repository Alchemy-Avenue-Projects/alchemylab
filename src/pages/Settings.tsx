
import React from "react";
import { 
  User, 
  CreditCard, 
  Lock, 
  Bell, 
  Link,
  FileText
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProfileTab from "@/components/settings/ProfileTab";
import IntegrationsTab from "@/components/settings/IntegrationsTab";
import BillingTab from "@/components/settings/BillingTab";
import NotificationsTab from "@/components/settings/NotificationsTab";
import SecurityTab from "@/components/settings/SecurityTab";
import ProductBriefTab from "@/components/settings/ProductBriefTab";

const Settings: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-semibold">Account Settings</h1>
      </div>
      
      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList className="flex flex-wrap gap-2">
          <TabsTrigger value="profile">
            <User className="h-4 w-4 mr-2" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="integrations">
            <Link className="h-4 w-4 mr-2" />
            Integrations
          </TabsTrigger>
          <TabsTrigger value="product-brief">
            <FileText className="h-4 w-4 mr-2" />
            Product Brief
          </TabsTrigger>
          <TabsTrigger value="billing">
            <CreditCard className="h-4 w-4 mr-2" />
            Billing
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="h-4 w-4 mr-2" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="security">
            <Lock className="h-4 w-4 mr-2" />
            Security
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile" className="space-y-4 animate-fade-in">
          <ProfileTab />
        </TabsContent>
        
        <TabsContent value="integrations" className="space-y-4 animate-fade-in">
          <IntegrationsTab />
        </TabsContent>
        
        <TabsContent value="product-brief" className="space-y-4 animate-fade-in">
          <ProductBriefTab />
        </TabsContent>
        
        <TabsContent value="billing" className="space-y-4 animate-fade-in">
          <BillingTab />
        </TabsContent>
        
        <TabsContent value="notifications" className="space-y-4 animate-fade-in">
          <NotificationsTab />
        </TabsContent>
        
        <TabsContent value="security" className="space-y-4 animate-fade-in">
          <SecurityTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
