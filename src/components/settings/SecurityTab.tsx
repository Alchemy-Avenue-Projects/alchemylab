
import React from "react";
import { Lock, Key, Save } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";

const SecurityTab: React.FC = () => {
  return (
    <>
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
    </>
  );
};

export default SecurityTab;
