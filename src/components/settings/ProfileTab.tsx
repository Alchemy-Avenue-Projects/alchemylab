
import React, { useState } from "react";
import { User, Save } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";

const ProfileTab: React.FC = () => {
  const { user, profile } = useAuth();
  const [formState, setFormState] = useState({
    name: profile?.full_name || user?.user_metadata?.full_name || "",
    email: user?.email || "",
    company: profile?.company || "Marketing Agency",
    role: profile?.job_title || "Marketing Director",
    bio: profile?.bio || ""
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormState(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleSaveChanges = () => {
    toast({
      title: "Changes saved",
      description: "Your profile information has been updated."
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Information</CardTitle>
        <CardDescription>
          Update your account information and profile details.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input 
              id="name" 
              placeholder="Full Name" 
              value={formState.name}
              onChange={handleInputChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input 
              id="email" 
              type="email" 
              placeholder="Email Address" 
              value={formState.email}
              onChange={handleInputChange}
              disabled
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="company">Company Name</Label>
            <Input 
              id="company" 
              placeholder="Company Name" 
              value={formState.company}
              onChange={handleInputChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="role">Job Title</Label>
            <Input 
              id="role" 
              placeholder="Job Title" 
              value={formState.role}
              onChange={handleInputChange}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="bio">Bio</Label>
          <Input 
            id="bio" 
            placeholder="Tell us about yourself" 
            value={formState.bio}
            onChange={handleInputChange}
          />
        </div>
      </CardContent>
      <CardFooter>
        <Button className="alchemy-gradient" onClick={handleSaveChanges}>
          <Save className="h-4 w-4 mr-2" />
          Save Changes
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProfileTab;
