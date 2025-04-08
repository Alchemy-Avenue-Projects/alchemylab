
import React from "react";
import { Bell } from "lucide-react";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import {
  Button
} from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useNotifications } from "@/contexts/NotificationContext";
import { format, formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";
import NotificationItem from "./NotificationItem";

const NotificationDropdown: React.FC = () => {
  const { notifications, unreadCount, markAllAsRead, isLoading } = useNotifications();
  
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center rounded-full text-[10px]"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[380px] p-0">
        <div className="flex items-center justify-between p-4">
          <h3 className="font-medium">Notifications</h3>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs"
              onClick={markAllAsRead}
            >
              Mark all as read
            </Button>
          )}
        </div>
        <Separator />
        
        <ScrollArea className="h-[400px]">
          {isLoading ? (
            <div className="p-4 flex items-center justify-center">
              <div className="animate-spin h-5 w-5 border-2 border-alchemy-600 border-t-transparent rounded-full"></div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <p>No notifications</p>
            </div>
          ) : (
            <div>
              {notifications.map((notification) => (
                <NotificationItem 
                  key={notification.id} 
                  notification={notification} 
                />
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationDropdown;
