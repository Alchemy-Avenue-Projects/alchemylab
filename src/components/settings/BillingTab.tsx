
import React from "react";
import { CreditCard, DollarSign, Zap, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const BillingTab: React.FC = () => {
  return (
    <>
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
    </>
  );
};

export default BillingTab;
