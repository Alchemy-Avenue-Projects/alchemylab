
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
import { Mail, AlertCircle, Loader } from "lucide-react";
import { UserRole } from "@/types/roles";
import { Alert, AlertDescription } from "@/components/ui/alert";

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
  const [validationError, setValidationError] = useState<string | null>(null);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleInviteUser = async () => {
    if (!validateEmail(newEmail)) {
      setValidationError("Please enter a valid email address");
      return;
    }
    
    setValidationError(null);
    await onInvite({ email: newEmail, role: newRole });
    
    // Only clear the form if the dialog remains open after invitation
    if (open) {
      setNewEmail('');
      setNewRole('viewer');
    }
  };

  // Reset form state when dialog closes
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setNewEmail('');
      setNewRole('viewer');
      setValidationError(null);
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite Team Member</DialogTitle>
          <DialogDescription>
            Invite a new member to join your organization.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {validationError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{validationError}</AlertDescription>
            </Alert>
          )}
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
              onChange={(e) => {
                setNewEmail(e.target.value);
                if (validationError) setValidationError(null);
              }}
              disabled={isInviting}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="role" className="text-right">
              Role
            </label>
            <Select 
              value={newRole} 
              onValueChange={(value) => setNewRole(value as UserRole)}
              disabled={isInviting}
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
        <DialogFooter className="flex-col gap-2 sm:flex-row">
          <DialogClose asChild>
            <Button variant="outline" disabled={isInviting}>Cancel</Button>
          </DialogClose>
          <Button 
            onClick={handleInviteUser} 
            disabled={!newEmail || isInviting}
            className="alchemy-gradient relative"
          >
            {isInviting ? (
              <>
                <Loader className="mr-2 h-4 w-4 animate-spin" />
                Sending Invitation...
              </>
            ) : (
              <>
                <Mail className="mr-2 h-4 w-4" />
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
