
import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import TeamMemberRow from "./TeamMemberRow";
import { UserRole } from "@/types/roles";

interface TeamMembersListProps {
  teamMembers: any[];
  isLoading: boolean;
  error: any;
  isAdmin: boolean;
  isUpdating: boolean;
  updateRole: (params: { userId: string; newRole: UserRole }) => void;
}

const TeamMembersList: React.FC<TeamMembersListProps> = ({
  teamMembers,
  isLoading,
  error,
  isAdmin,
  isUpdating,
  updateRole
}) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array(3).fill(0).map((_, i) => (
          <div key={i} className="flex items-center space-x-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-4">
        <p className="text-red-500">Error loading team members</p>
        <Button className="mt-2">Retry</Button>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Joined</TableHead>
          {isAdmin && <TableHead className="text-right">Actions</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {teamMembers.map((member) => (
          <TeamMemberRow
            key={member.id}
            member={member}
            isAdmin={isAdmin}
            isUpdating={isUpdating}
            updateRole={updateRole}
          />
        ))}
      </TableBody>
    </Table>
  );
};

export default TeamMembersList;
