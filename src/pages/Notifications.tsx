
import React from "react";
import {
  Bell,
  Info,
  AlertTriangle,
  CheckCircle,
  Trash,
  RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

interface Notification {
  id: string;
  title: string;
  description: string;
  time: string;
  type: "alert" | "info" | "success";
  read: boolean;
}

const notifications: Notification[] = [
  {
    id: "1",
    title: "Budget alert",
    description: "Your 'Summer Sale' campaign has reached 80% of its budget.",
    time: "10 minutes ago",
    type: "alert",
    read: false
  },
  {
    id: "2",
    title: "Performance update",
    description: "Your LinkedIn campaign is performing 15% better than last week.",
    time: "2 hours ago",
    type: "success",
    read: false
  },
  {
    id: "3",
    title: "New AI recommendation",
    description: "We've generated new ad copy suggestions for your Facebook campaign.",
    time: "Yesterday",
    type: "info",
    read: false
  },
  {
    id: "4",
    title: "Low CTR warning",
    description: "Your Google Ads campaign 'Product Launch' is showing below-average CTR.",
    time: "2 days ago",
    type: "alert",
    read: true
  },
  {
    id: "5",
    title: "Account integration",
    description: "Your Facebook Ads account was successfully connected.",
    time: "3 days ago",
    type: "success",
    read: true
  },
  {
    id: "6",
    title: "Weekly report available",
    description: "Your weekly performance report is now available for download.",
    time: "1 week ago",
    type: "info",
    read: true
  }
];

const Notifications: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center">
          <h1 className="text-3xl font-semibold">Notifications</h1>
          <Badge className="ml-2 alchemy-gradient">3</Badge>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="destructive" size="icon">
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="all">
        <TabsList className="grid w-full grid-cols-4 md:w-auto md:inline-flex">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="unread">Unread</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
          <TabsTrigger value="updates">Updates</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>All Notifications</CardTitle>
              <CardDescription>View all your recent notifications.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {notifications.map((notification) => (
                  <div key={notification.id} className={`p-4 hover:bg-muted/50 ${!notification.read ? 'bg-muted/20' : ''}`}>
                    <div className="flex items-start">
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center mr-3 ${
                        notification.type === 'alert' 
                          ? 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400' 
                          : notification.type === 'success'
                            ? 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400'
                            : 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                      }`}>
                        {notification.type === 'alert' && <AlertTriangle className="h-4 w-4" />}
                        {notification.type === 'success' && <CheckCircle className="h-4 w-4" />}
                        {notification.type === 'info' && <Info className="h-4 w-4" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <h4 className="font-medium">{notification.title}</h4>
                          <span className="text-xs text-muted-foreground">{notification.time}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{notification.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="border-t p-4 flex justify-between">
              <Button variant="outline">Mark All as Read</Button>
              <Button variant="ghost">View Settings</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="unread" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Unread Notifications</CardTitle>
              <CardDescription>Notifications you haven't read yet.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {notifications.filter(n => !n.read).map((notification) => (
                  <div key={notification.id} className="p-4 hover:bg-muted/50 bg-muted/20">
                    <div className="flex items-start">
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center mr-3 ${
                        notification.type === 'alert' 
                          ? 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400' 
                          : notification.type === 'success'
                            ? 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400'
                            : 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                      }`}>
                        {notification.type === 'alert' && <AlertTriangle className="h-4 w-4" />}
                        {notification.type === 'success' && <CheckCircle className="h-4 w-4" />}
                        {notification.type === 'info' && <Info className="h-4 w-4" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <h4 className="font-medium">{notification.title}</h4>
                          <span className="text-xs text-muted-foreground">{notification.time}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{notification.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="border-t p-4">
              <Button variant="outline" className="w-full">Mark All as Read</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="alerts" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Alerts</CardTitle>
              <CardDescription>Important alerts that need your attention.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {notifications.filter(n => n.type === 'alert').map((notification) => (
                  <div key={notification.id} className={`p-4 hover:bg-muted/50 ${!notification.read ? 'bg-muted/20' : ''}`}>
                    <div className="flex items-start">
                      <div className="h-8 w-8 rounded-full bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400 flex items-center justify-center mr-3">
                        <AlertTriangle className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <h4 className="font-medium">{notification.title}</h4>
                          <span className="text-xs text-muted-foreground">{notification.time}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{notification.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="updates" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Updates</CardTitle>
              <CardDescription>General updates and information.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {notifications.filter(n => n.type === 'info' || n.type === 'success').map((notification) => (
                  <div key={notification.id} className={`p-4 hover:bg-muted/50 ${!notification.read ? 'bg-muted/20' : ''}`}>
                    <div className="flex items-start">
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center mr-3 ${
                        notification.type === 'success'
                          ? 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400'
                          : 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                      }`}>
                        {notification.type === 'success' && <CheckCircle className="h-4 w-4" />}
                        {notification.type === 'info' && <Info className="h-4 w-4" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <h4 className="font-medium">{notification.title}</h4>
                          <span className="text-xs text-muted-foreground">{notification.time}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{notification.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Notifications;
