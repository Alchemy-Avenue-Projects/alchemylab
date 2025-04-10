
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Mail } from "lucide-react";
import { UserRole } from "@/types/roles";

interface InviteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInvite: (params: { email: string; role: string }) => void;
  isInviting: boolean;
}

const InviteDialog: React.FC<InviteDialogProps> = ({
  open,
  onOpenChange,
  onInvite,
  isInviting
}) => {
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('viewer');

  const handleInviteUser = async () => {
    await onInvite({ email: newEmail, role: newRole });
    setNewEmail('');
    setNewRole('viewer');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite Team Member</DialogTitle>
          <DialogDescription>
            Invite a new member to join your organization.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="email" className="text-right">
              Email
            </label>
            <Input
              id="email"
              type="email"
              placeholder="colleague@example.com"
              className="col-span-3"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="role" className="text-right">
              Role
            </label>
            <Select 
              value={newRole} 
              onValueChange={(value) => setNewRole(value as UserRole)}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="editor">Editor</SelectItem>
                <SelectItem value="viewer">Viewer</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button 
            onClick={handleInviteUser} 
            disabled={!newEmail || isInviting}
            className="alchemy-gradient"
          >
            {isInviting ? (
              <>
                <div className="h-4 w-4 mr-2 rounded-full border-2 border-current border-t-transparent animate-spin" />
                Inviting...
              </>
            ) : (
              <>
                <Mail className="h-4 w-4 mr-2" />
                Send Invite
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default InviteDialog;
