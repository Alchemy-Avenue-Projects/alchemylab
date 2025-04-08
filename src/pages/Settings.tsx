
import React from "react";
import { 
  User, 
  CreditCard, 
  Lock, 
  Key, 
  Bell, 
  Link, 
  DollarSign,
  Zap,
  ShieldCheck,
  Save
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

const Settings: React.FC = () => {
  const { user, profile } = useAuth();
  const [formState, setFormState] = useState({
    name: profile?.full_name || user?.user_metadata?.full_name || "",
    email: user?.email || "",
    company: profile?.company || "Marketing Agency",
    role: profile?.job_title || "Marketing Director",
    bio: profile?.bio || ""
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormState(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleSaveChanges = () => {
    toast({
      title: "Changes saved",
      description: "Your profile information has been updated."
    });
  };

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
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your account information and profile details.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input 
                    id="name" 
                    placeholder="Full Name" 
                    value={formState.name}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="Email Address" 
                    value={formState.email}
                    onChange={handleInputChange}
                    disabled
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">Company Name</Label>
                  <Input 
                    id="company" 
                    placeholder="Company Name" 
                    value={formState.company}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Job Title</Label>
                  <Input 
                    id="role" 
                    placeholder="Job Title" 
                    value={formState.role}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Input 
                  id="bio" 
                  placeholder="Tell us about yourself" 
                  value={formState.bio}
                  onChange={handleInputChange}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button className="alchemy-gradient" onClick={handleSaveChanges}>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="integrations" className="space-y-4 animate-fade-in">
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
        </TabsContent>
        
        <TabsContent value="billing" className="space-y-4 animate-fade-in">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>Current Plan</CardTitle>
                  <CardDescription>
                    Your current subscription plan and usage.
                  </CardDescription>
                </div>
                <Badge className="alchemy-gradient">Pro</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Plan:</span>
                  <span>Pro - $99/month</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">Renewal Date:</span>
                  <span>May 15, 2025</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">User Accounts:</span>
                  <span>3 of 5 used</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">Ad Accounts:</span>
                  <span>7 of 10 used</span>
                </div>
              </div>
              
              <div className="pt-4 space-y-2">
                <h4 className="font-medium">Plan Features:</h4>
                <ul className="space-y-2">
                  <li className="flex items-center text-sm">
                    <ShieldCheck className="h-4 w-4 mr-2 text-green-500" />
                    5 user accounts
                  </li>
                  <li className="flex items-center text-sm">
                    <ShieldCheck className="h-4 w-4 mr-2 text-green-500" />
                    10 ad account connections
                  </li>
                  <li className="flex items-center text-sm">
                    <ShieldCheck className="h-4 w-4 mr-2 text-green-500" />
                    Full AI features and suggestions
                  </li>
                  <li className="flex items-center text-sm">
                    <ShieldCheck className="h-4 w-4 mr-2 text-green-500" />
                    Advanced reporting
                  </li>
                  <li className="flex items-center text-sm">
                    <ShieldCheck className="h-4 w-4 mr-2 text-green-500" />
                    Email support
                  </li>
                </ul>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">Change Plan</Button>
              <Button className="alchemy-gradient">
                <Zap className="h-4 w-4 mr-2" />
                Upgrade to Enterprise
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Payment Method</CardTitle>
              <CardDescription>
                Manage your payment methods and billing history.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-md">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center mr-4">
                    <CreditCard className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="font-medium">Visa ending in 4242</div>
                    <div className="text-sm text-muted-foreground">Expires 09/2026</div>
                  </div>
                </div>
                <Badge>Default</Badge>
              </div>
              
              <Button variant="outline">
                <DollarSign className="h-4 w-4 mr-2" />
                Add Payment Method
              </Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Billing History</CardTitle>
              <CardDescription>
                View your recent invoices and payment history.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b">
                  <div>
                    <div className="font-medium">Pro Plan - Monthly</div>
                    <div className="text-sm text-muted-foreground">Apr 15, 2025</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">$99.00</div>
                    <Badge variant="outline" className="text-green-500 border-green-200">Paid</Badge>
                  </div>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <div>
                    <div className="font-medium">Pro Plan - Monthly</div>
                    <div className="text-sm text-muted-foreground">Mar 15, 2025</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">$99.00</div>
                    <Badge variant="outline" className="text-green-500 border-green-200">Paid</Badge>
                  </div>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <div>
                    <div className="font-medium">Pro Plan - Monthly</div>
                    <div className="text-sm text-muted-foreground">Feb 15, 2025</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">$99.00</div>
                    <Badge variant="outline" className="text-green-500 border-green-200">Paid</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">View All Invoices</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications" className="space-y-4 animate-fade-in">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Configure how and when you receive notifications.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <h3 className="font-medium">Email Notifications</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="email-campaign-alerts">Campaign alerts</Label>
                    <Switch id="email-campaign-alerts" defaultChecked />
                  </div>
                  <div className="flex justify-between items-center">
                    <Label htmlFor="email-performance">Performance reports</Label>
                    <Switch id="email-performance" defaultChecked />
                  </div>
                  <div className="flex justify-between items-center">
                    <Label htmlFor="email-ai-insights">AI insights</Label>
                    <Switch id="email-ai-insights" defaultChecked />
                  </div>
                  <div className="flex justify-between items-center">
                    <Label htmlFor="email-billing">Billing updates</Label>
                    <Switch id="email-billing" defaultChecked />
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <h3 className="font-medium">In-App Notifications</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="inapp-campaign-alerts">Campaign alerts</Label>
                    <Switch id="inapp-campaign-alerts" defaultChecked />
                  </div>
                  <div className="flex justify-between items-center">
                    <Label htmlFor="inapp-performance">Performance updates</Label>
                    <Switch id="inapp-performance" defaultChecked />
                  </div>
                  <div className="flex justify-between items-center">
                    <Label htmlFor="inapp-ai-insights">AI insights</Label>
                    <Switch id="inapp-ai-insights" defaultChecked />
                  </div>
                  <div className="flex justify-between items-center">
                    <Label htmlFor="inapp-team-activity">Team activity</Label>
                    <Switch id="inapp-team-activity" defaultChecked />
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <h3 className="font-medium">Alert Thresholds</h3>
                <div className="space-y-2">
                  <div className="space-y-1">
                    <Label htmlFor="threshold-budget">Budget Spent Threshold</Label>
                    <div className="flex items-center space-x-2">
                      <Input id="threshold-budget" type="number" defaultValue="80" className="w-20" />
                      <span>% of total budget</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="threshold-ctr">Low CTR Threshold</Label>
                    <div className="flex items-center space-x-2">
                      <Input id="threshold-ctr" type="number" defaultValue="1" step="0.1" className="w-20" />
                      <span>% CTR</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="threshold-conv">Conversion Rate Drop</Label>
                    <div className="flex items-center space-x-2">
                      <Input id="threshold-conv" type="number" defaultValue="15" className="w-20" />
                      <span>% drop</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="alchemy-gradient">
                <Save className="h-4 w-4 mr-2" />
                Save Preferences
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="security" className="space-y-4 animate-fade-in">
          <Card>
            <CardHeader>
              <CardTitle>Password</CardTitle>
              <CardDescription>
                Change your account password.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">Current Password</Label>
                <Input id="current-password" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input id="new-password" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <Input id="confirm-password" type="password" />
              </div>
            </CardContent>
            <CardFooter>
              <Button className="alchemy-gradient">
                <Save className="h-4 w-4 mr-2" />
                Update Password
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Two-Factor Authentication</CardTitle>
              <CardDescription>
                Add an extra layer of security to your account.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium">Enable 2FA</h3>
                  <p className="text-muted-foreground text-sm">Protect your account with two-factor authentication</p>
                </div>
                <Switch id="enable-2fa" />
              </div>
              
              <div className="pt-2">
                <h3 className="font-medium mb-2">2FA Method</h3>
                <RadioGroup defaultValue="authenticator">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="authenticator" id="authenticator" />
                    <Label htmlFor="authenticator">Authenticator App</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="sms" id="sms" />
                    <Label htmlFor="sms">SMS</Label>
                  </div>
                </RadioGroup>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline">
                <Key className="h-4 w-4 mr-2" />
                Setup 2FA
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>API Keys</CardTitle>
              <CardDescription>
                Manage API keys for programmatic access.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center p-4 border rounded-md">
                <div>
                  <div className="font-medium">Production API Key</div>
                  <div className="text-sm text-muted-foreground">Created: Mar 15, 2025</div>
                </div>
                <Badge variant="outline">Active</Badge>
              </div>
              
              <Button variant="outline">
                <Key className="h-4 w-4 mr-2" />
                Generate New API Key
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

interface IntegrationItemProps {
  name: string;
  status: "connected" | "not-connected";
  account?: string;
  logo: string;
}

const IntegrationItem: React.FC<IntegrationItemProps> = ({ name, status, account, logo }) => {
  return (
    <div className="flex justify-between items-center p-4 border rounded-md">
      <div className="flex items-center">
        <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center mr-4">
          <img src={logo} alt={name} className="h-6 w-6" />
        </div>
        <div>
          <div className="font-medium">{name}</div>
          {account && <div className="text-sm text-muted-foreground">{account}</div>}
        </div>
      </div>
      {status === "connected" ? (
        <div className="flex items-center">
          <Badge variant="outline" className="text-green-500 border-green-200 mr-2">Connected</Badge>
          <Button variant="outline" size="sm">Manage</Button>
        </div>
      ) : (
        <Button className="alchemy-gradient">Connect</Button>
      )}
    </div>
  );
};

export default Settings;
