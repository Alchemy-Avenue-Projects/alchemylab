
import React from "react";
import { 
  Plus, 
  Mail, 
  MoreHorizontal, 
  Pencil, 
  Trash, 
  UserCog,
  ShieldCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: "Admin" | "Editor" | "Viewer";
  status: "Active" | "Invited" | "Inactive";
  avatarUrl?: string;
  lastActive: string;
}

const teamMembers: TeamMember[] = [
  {
    id: "1",
    name: "Jane Doe",
    email: "jane.doe@example.com",
    role: "Admin",
    status: "Active",
    lastActive: "Now"
  },
  {
    id: "2",
    name: "John Smith",
    email: "john.smith@example.com",
    role: "Editor",
    status: "Active",
    lastActive: "2 hours ago"
  },
  {
    id: "3",
    name: "Emily Johnson",
    email: "emily.johnson@example.com",
    role: "Viewer",
    status: "Active",
    lastActive: "Yesterday"
  },
  {
    id: "4",
    name: "Michael Brown",
    email: "michael.brown@example.com",
    role: "Editor",
    status: "Invited",
    lastActive: "Never"
  },
  {
    id: "5",
    name: "Sarah Wilson",
    email: "sarah.wilson@example.com",
    role: "Viewer",
    status: "Inactive",
    lastActive: "2 weeks ago"
  }
];

const Team: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-semibold">Team Management</h1>
        <div className="flex items-center space-x-2">
          <Button className="alchemy-gradient">
            <Plus className="h-4 w-4 mr-2" />
            Invite Team Member
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Team Overview</CardTitle>
            <CardDescription>
              Your team and user role assignments.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Total team members:</span>
                <span className="font-medium">5</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Active members:</span>
                <span className="font-medium">3</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Pending invitations:</span>
                <span className="font-medium">1</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Inactive members:</span>
                <span className="font-medium">1</span>
              </div>
              <div className="pt-2">
                <div className="text-sm font-medium mb-2">Team roles:</div>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <div className="h-2 w-2 rounded-full bg-alchemy-600 mr-2"></div>
                    <span className="text-sm">Admin: 1</span>
                  </div>
                  <div className="flex items-center">
                    <div className="h-2 w-2 rounded-full bg-blue-500 mr-2"></div>
                    <span className="text-sm">Editor: 2</span>
                  </div>
                  <div className="flex items-center">
                    <div className="h-2 w-2 rounded-full bg-gray-400 mr-2"></div>
                    <span className="text-sm">Viewer: 2</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="md:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle>All Team Members</CardTitle>
            <CardDescription>
              Manage your team members and their roles.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center mb-4">
              <div className="relative flex-1">
                <Input
                  placeholder="Search team members..."
                  className="pl-8"
                />
                <div className="absolute left-2.5 top-2.5">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground">
                    <circle cx="11" cy="11" r="8"></circle>
                    <path d="m21 21-4.3-4.3"></path>
                  </svg>
                </div>
              </div>
            </div>
            
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Active</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teamMembers.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={member.avatarUrl} />
                            <AvatarFallback className={
                              member.role === "Admin" 
                                ? "bg-alchemy-600 text-white" 
                                : member.role === "Editor" 
                                  ? "bg-blue-500 text-white" 
                                  : "bg-gray-400 text-white"
                            }>
                              {member.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{member.name}</div>
                            <div className="text-sm text-muted-foreground">{member.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className={
                            member.role === "Admin" 
                              ? "text-alchemy-600 border-alchemy-200 bg-alchemy-50 dark:bg-alchemy-900/20"
                              : member.role === "Editor" 
                                ? "text-blue-600 border-blue-200 bg-blue-50 dark:bg-blue-900/20"
                                : ""
                          }
                        >
                          {member.role === "Admin" && <ShieldCheck className="h-3 w-3 mr-1" />}
                          {member.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={member.status === "Active" ? "outline" : "secondary"}
                          className={member.status === "Active" ? "text-green-500 border-green-200" : ""}
                        >
                          {member.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{member.lastActive}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem>
                              <Mail className="h-4 w-4 mr-2" />
                              Send Email
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Pencil className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <UserCog className="h-4 w-4 mr-2" />
                              Change Role
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600">
                              <Trash className="h-4 w-4 mr-2" />
                              Remove
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Team;
