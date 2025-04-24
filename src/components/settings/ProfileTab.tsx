import React, { useState } from "react";
import { User, Save } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const ProfileTab: React.FC = () => {
  const { user, profile } = useAuth();
  const [formState, setFormState] = useState({
    name: profile?.full_name || user?.user_metadata?.full_name || "",
    email: user?.email || "",
    company: profile?.company || "Marketing Agency",
    companyType: "marketing_agency", // Default value
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

  const handleSelectChange = (value: string) => {
    setFormState(prev => ({
      ...prev,
      companyType: value
    }));
  };

  const handleSaveChanges = async () => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formState.name,
          company: formState.company,
          job_title: formState.role,
          bio: formState.bio
        })
        .eq('id', user?.id);

      if (error) throw error;

      // Refresh the profile data in the AuthContext
      await supabase.auth.refreshSession();

      toast({
        title: "Changes saved",
        description: "Your profile information has been updated."
      });
    } catch (err) {
      console.error('Error saving profile:', err);
      toast({
        title: "Error",
        description: "Failed to save profile changes. Please try again.",
        variant: "destructive"
      });
    }
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
            <Label htmlFor="companyType">Company Type</Label>
            <Select 
              value={formState.companyType} 
              onValueChange={handleSelectChange}
            >
              <SelectTrigger id="companyType">
                <SelectValue placeholder="Select company type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="marketing_agency">Marketing Agency</SelectItem>
                <SelectItem value="product_company">Product Company</SelectItem>
              </SelectContent>
            </Select>
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
