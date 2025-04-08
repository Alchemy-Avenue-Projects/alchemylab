
import React from "react";
import { Bell, Save } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

const NotificationsTab: React.FC = () => {
  return (
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
  );
};

export default NotificationsTab;
