
import React, { useState } from "react";
import { 
  Bell, 
  Check, 
  CheckCheck, 
  Clock, 
  Filter,
  Flag,
  Search
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNotifications } from "@/contexts/NotificationContext";
import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

const Notifications: React.FC = () => {
  const { notifications, markAsRead, markAllAsRead, isLoading } = useNotifications();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterReadStatus, setFilterReadStatus] = useState("all");

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'ai_suggestion_ready':
        return <Flag className="h-5 w-5 text-alchemy-500" />;
      case 'campaign_warning':
        return <Flag className="h-5 w-5 text-amber-500" />;
      case 'account_disconnected':
        return <Flag className="h-5 w-5 text-red-500" />;
      case 'report_ready':
        return <Flag className="h-5 w-5 text-green-500" />;
      default:
        return <Bell className="h-5 w-5" />;
    }
  };

  const getNotificationTypeName = (type: string) => {
    switch (type) {
      case 'ai_suggestion_ready':
        return "AI Suggestion";
      case 'campaign_warning':
        return "Campaign Warning";
      case 'account_disconnected':
        return "Account Disconnected";
      case 'report_ready':
        return "Report Ready";
      default:
        return "Notification";
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    // Text search
    const matchesSearch = 
      searchTerm === "" || 
      notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (notification.body && notification.body.toLowerCase().includes(searchTerm.toLowerCase()));

    // Type filter
    const matchesType = 
      filterType === "all" || 
      notification.type === filterType;

    // Read status filter
    const matchesReadStatus = 
      filterReadStatus === "all" || 
      (filterReadStatus === "read" && notification.read) || 
      (filterReadStatus === "unread" && !notification.read);

    return matchesSearch && matchesType && matchesReadStatus;
  });

  const unreadCount = notifications.filter(n => !n.read).length;
  const hasUnread = unreadCount > 0;
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-semibold">Notifications</h1>
        <div className="flex items-center space-x-2">
          {hasUnread && (
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={() => markAllAsRead()}
            >
              <CheckCheck className="h-4 w-4" />
              Mark All as Read
            </Button>
          )}
        </div>
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>All Notifications</CardTitle>
          <CardDescription>
            Stay updated with important events, alerts, and suggestions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search notifications..."
                className="pl-8 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex items-center space-x-2 w-full md:w-auto">
              <Select 
                defaultValue="all" 
                value={filterType}
                onValueChange={setFilterType}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="ai_suggestion_ready">AI Suggestions</SelectItem>
                  <SelectItem value="campaign_warning">Campaign Warnings</SelectItem>
                  <SelectItem value="account_disconnected">Account Disconnected</SelectItem>
                  <SelectItem value="report_ready">Report Ready</SelectItem>
                </SelectContent>
              </Select>
              
              <Select 
                defaultValue="all" 
                value={filterReadStatus}
                onValueChange={setFilterReadStatus}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="read">Read</SelectItem>
                  <SelectItem value="unread">Unread</SelectItem>
                </SelectContent>
              </Select>
              
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin h-8 w-8 border-4 border-alchemy-600 border-t-transparent rounded-full"></div>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Bell className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
              <h3 className="text-lg font-medium">No notifications found</h3>
              <p className="mt-1">Change your filters or check back later</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredNotifications.map((notification) => (
                <div 
                  key={notification.id} 
                  className={`p-4 rounded-lg border ${!notification.read ? 'bg-muted/50' : ''}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start">
                        <div>
                          <h4 className="font-medium text-base">{notification.title}</h4>
                          <p className="text-sm text-muted-foreground mt-1">{notification.body}</p>
                        </div>
                        
                        <div className="flex items-center gap-3 mt-2 sm:mt-0">
                          <Badge variant="outline" className="h-6">
                            {getNotificationTypeName(notification.type)}
                          </Badge>
                          <span className="text-xs text-muted-foreground whitespace-nowrap flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {format(new Date(notification.created_at), "MMM d, yyyy 'at' h:mm a")}
                          </span>
                        </div>
                      </div>
                      
                      {!notification.read && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="mt-2"
                          onClick={() => markAsRead(notification.id)}
                        >
                          <Check className="h-3 w-3 mr-1" />
                          Mark as read
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Notifications;
