
import React from "react";
import { Notification } from "@/types/database";
import { useNotifications } from "@/contexts/NotificationContext";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { 
  Bell, 
  AlertCircle, 
  CheckCircle2, 
  Info, 
  BarChart2, 
  AlertTriangle 
} from "lucide-react";

interface NotificationItemProps {
  notification: Notification;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ notification }) => {
  const { markAsRead } = useNotifications();
  
  const handleClick = () => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
  };
  
  const getIcon = () => {
    switch (notification.type) {
      case "alert":
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case "success":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case "info":
        return <Info className="h-5 w-5 text-blue-500" />;
      case "analytics":
        return <BarChart2 className="h-5 w-5 text-purple-500" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };
  
  return (
    <div
      onClick={handleClick}
      className={cn(
        "p-4 border-b border-border hover:bg-muted/50 cursor-pointer transition-colors",
        !notification.read ? "bg-alchemy-50" : ""
      )}
    >
      <div className="flex gap-3">
        <div className="flex-shrink-0 mt-1">
          {getIcon()}
        </div>
        <div className="flex-grow">
          <div className="flex justify-between items-start">
            <h4 className={cn("text-sm", !notification.read ? "font-medium" : "")}>
              {notification.title}
            </h4>
            <span className="text-xs text-muted-foreground ml-2">
              {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
            </span>
          </div>
          {notification.body && (
            <p className="text-sm text-muted-foreground mt-1">
              {notification.body}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationItem;
