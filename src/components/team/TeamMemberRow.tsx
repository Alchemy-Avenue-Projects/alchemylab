
import React from "react";
import { format } from "date-fns";
import {
  TableRow,
  TableCell,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  User,
  Shield,
  Edit,
  Eye,
  MoreHorizontal,
} from "lucide-react";
import { UserRole } from "@/types/roles";

interface TeamMemberRowProps {
  member: {
    id: string;
    email: string;
    role: string;
    created_at: string;
    full_name?: string;
    isCurrentUser?: boolean;
  };
  isAdmin: boolean;
  isUpdating: boolean;
  updateRole: (params: { userId: string; newRole: UserRole }) => void;
}

const TeamMemberRow: React.FC<TeamMemberRowProps> = ({
  member,
  isAdmin,
  isUpdating,
  updateRole,
}) => {
  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Shield className="h-4 w-4 text-red-500" />;
      case 'editor':
        return <Edit className="h-4 w-4 text-blue-500" />;
      default:
        return <Eye className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <TableRow key={member.id}>
      <TableCell className="font-medium">
        <div className="flex items-center space-x-2">
          <div className="bg-muted flex items-center justify-center h-8 w-8 rounded-full">
            <User className="h-4 w-4" />
          </div>
          <span>
            {member.full_name || 'Unnamed User'}
            {member.isCurrentUser && (
              <span className="ml-2 text-xs text-muted-foreground">(you)</span>
            )}
          </span>
        </div>
      </TableCell>
      <TableCell>{member.email}</TableCell>
      <TableCell>
        <div className="flex items-center space-x-2">
          {getRoleIcon(member.role)}
          <span className="capitalize">{member.role}</span>
        </div>
      </TableCell>
      <TableCell>
        {format(new Date(member.created_at), "MMM d, yyyy")}
      </TableCell>
      {isAdmin && (
        <TableCell className="text-right">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => updateRole({ userId: member.id, newRole: "admin" })}
                disabled={member.role === "admin" || isUpdating}
              >
                <Shield className="h-4 w-4 mr-2" />
                Make Admin
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => updateRole({ userId: member.id, newRole: "editor" })}
                disabled={member.role === "editor" || isUpdating}
              >
                <Edit className="h-4 w-4 mr-2" />
                Make Editor
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => updateRole({ userId: member.id, newRole: "viewer" })}
                disabled={member.role === "viewer" || isUpdating}
              >
                <Eye className="h-4 w-4 mr-2" />
                Make Viewer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      )}
    </TableRow>
  );
};

export default TeamMemberRow;
