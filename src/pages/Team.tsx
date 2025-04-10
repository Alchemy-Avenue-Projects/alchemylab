
import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useTeam } from "@/hooks/useTeam";
import { useAuth } from "@/contexts/AuthContext";
import TeamHeader from "@/components/team/TeamHeader";
import TeamMembersList from "@/components/team/TeamMembersList";
import InviteDialog from "@/components/team/InviteDialog";

const Team: React.FC = () => {
  const { teamMembers, isLoading, error, updateRole, isUpdating, inviteUser, isInviting } = useTeam();
  const { isAdmin } = useAuth();
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);

  return (
    <div className="space-y-6">
      <TeamHeader onOpenInviteDialog={() => setInviteDialogOpen(true)} />

      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
          <CardDescription>
            Manage your organization's team members and their roles.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TeamMembersList
            teamMembers={teamMembers}
            isLoading={isLoading}
            error={error}
            isAdmin={isAdmin}
            isUpdating={isUpdating}
            updateRole={updateRole}
          />
        </CardContent>
      </Card>

      <InviteDialog
        open={inviteDialogOpen}
        onOpenChange={setInviteDialogOpen}
        onInvite={inviteUser}
        isInviting={isInviting}
      />
    </div>
  );
};

export default Team;
