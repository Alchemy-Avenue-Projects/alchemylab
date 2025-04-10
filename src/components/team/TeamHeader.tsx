
import React from "react";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface TeamHeaderProps {
  onOpenInviteDialog: () => void;
}

const TeamHeader: React.FC<TeamHeaderProps> = ({ onOpenInviteDialog }) => {
  const { isAdmin } = useAuth();

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <h1 className="text-3xl font-semibold">Team</h1>
      {isAdmin && (
        <Button className="alchemy-gradient" onClick={onOpenInviteDialog}>
          <UserPlus className="h-4 w-4 mr-2" />
          Invite Team Member
        </Button>
      )}
    </div>
  );
};

export default TeamHeader;
