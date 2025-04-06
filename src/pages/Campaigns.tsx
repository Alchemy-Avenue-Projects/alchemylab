
import React from "react";
import { 
  Search, 
  Plus, 
  Filter, 
  ArrowUpDown, 
  MoreHorizontal, 
  ExternalLink, 
  Edit, 
  Trash, 
  Pause, 
  Play,
  Download
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Campaign {
  id: string;
  name: string;
  platform: string;
  status: "Active" | "Paused" | "Completed" | "Draft";
  budget: string;
  spent: string;
  impressions: string;
  clicks: string;
  ctr: string;
  conversions: string;
  cpa: string;
  dateCreated: string;
}

const campaigns: Campaign[] = [
  {
    id: "1",
    name: "Summer Sale Promotion",
    platform: "Facebook",
    status: "Active",
    budget: "$5,000",
    spent: "$2,134.50",
    impressions: "650K",
    clicks: "23.4K",
    ctr: "3.6%",
    conversions: "342",
    cpa: "$6.24",
    dateCreated: "2025-03-15"
  },
  {
    id: "2",
    name: "Product Launch",
    platform: "LinkedIn",
    status: "Active",
    budget: "$3,000",
    spent: "$1,876.25",
    impressions: "210K",
    clicks: "8.2K",
    ctr: "3.9%",
    conversions: "124",
    cpa: "$15.13",
    dateCreated: "2025-03-20"
  },
  {
    id: "3",
    name: "Brand Awareness",
    platform: "Instagram",
    status: "Paused",
    budget: "$2,500",
    spent: "$987.50",
    impressions: "420K",
    clicks: "18.7K",
    ctr: "4.5%",
    conversions: "92",
    cpa: "$10.73",
    dateCreated: "2025-03-10"
  },
  {
    id: "4",
    name: "Lead Generation",
    platform: "Google Ads",
    status: "Active",
    budget: "$4,500",
    spent: "$3,245.75",
    impressions: "980K",
    clicks: "42.6K",
    ctr: "4.3%",
    conversions: "531",
    cpa: "$6.11",
    dateCreated: "2025-03-05"
  },
  {
    id: "5",
    name: "Retargeting Campaign",
    platform: "Facebook",
    status: "Active",
    budget: "$2,000",
    spent: "$1,523.40",
    impressions: "325K",
    clicks: "18.9K",
    ctr: "5.8%",
    conversions: "276",
    cpa: "$5.52",
    dateCreated: "2025-03-12"
  },
  {
    id: "6",
    name: "End of Year Promotion",
    platform: "TikTok",
    status: "Draft",
    budget: "$3,500",
    spent: "$0",
    impressions: "0",
    clicks: "0",
    ctr: "0%",
    conversions: "0",
    cpa: "$0",
    dateCreated: "2025-03-25"
  },
  {
    id: "7",
    name: "Holiday Campaign",
    platform: "Pinterest",
    status: "Completed",
    budget: "$1,800",
    spent: "$1,800",
    impressions: "412K",
    clicks: "19.3K",
    ctr: "4.7%",
    conversions: "205",
    cpa: "$8.78",
    dateCreated: "2025-02-10"
  }
];

const Campaigns: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-semibold">Campaigns</h1>
        <div className="flex items-center space-x-2">
          <Button className="alchemy-gradient" onClick={() => {}}>
            <Plus className="h-4 w-4 mr-2" />
            New Campaign
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>All Campaigns</CardTitle>
          <CardDescription>
            Manage and monitor all your ad campaigns across different platforms.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row items-center justify-between mb-4 gap-4">
            <div className="flex w-full md:w-auto items-center space-x-2">
              <div className="relative w-full md:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search campaigns..."
                  className="pl-8 w-full md:w-64"
                />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex items-center space-x-2 w-full md:w-auto">
              <Select defaultValue="all-platforms">
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="All Platforms" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-platforms">All Platforms</SelectItem>
                  <SelectItem value="facebook">Facebook</SelectItem>
                  <SelectItem value="instagram">Instagram</SelectItem>
                  <SelectItem value="linkedin">LinkedIn</SelectItem>
                  <SelectItem value="google">Google Ads</SelectItem>
                  <SelectItem value="tiktok">TikTok</SelectItem>
                  <SelectItem value="pinterest">Pinterest</SelectItem>
                </SelectContent>
              </Select>
              
              <Select defaultValue="all-status">
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-status">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                </SelectContent>
              </Select>
              
              <Button variant="outline" size="icon">
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[250px]">
                    <div className="flex items-center space-x-1">
                      <span>Campaign</span>
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </TableHead>
                  <TableHead>Platform</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>
                    <div className="flex items-center space-x-1">
                      <span>Budget</span>
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </TableHead>
                  <TableHead>
                    <div className="flex items-center space-x-1">
                      <span>Conversions</span>
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </TableHead>
                  <TableHead>
                    <div className="flex items-center space-x-1">
                      <span>CPA</span>
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </TableHead>
                  <TableHead>
                    <div className="flex items-center space-x-1">
                      <span>CTR</span>
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {campaigns.map((campaign) => (
                  <TableRow key={campaign.id}>
                    <TableCell className="font-medium">
                      <div>
                        {campaign.name}
                        <div className="text-xs text-muted-foreground">
                          Created: {campaign.dateCreated}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{campaign.platform}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={
                          campaign.status === "Active" ? "outline" : 
                          campaign.status === "Paused" ? "secondary" :
                          campaign.status === "Draft" ? "default" : "outline"
                        } 
                        className={
                          campaign.status === "Active" ? "text-green-500 border-green-200" : 
                          campaign.status === "Completed" ? "text-blue-500 border-blue-200" : ""
                        }
                      >
                        {campaign.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div>{campaign.budget}</div>
                        <div className="text-xs text-muted-foreground">
                          Spent: {campaign.spent}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{campaign.conversions}</TableCell>
                    <TableCell>{campaign.cpa}</TableCell>
                    <TableCell>{campaign.ctr}</TableCell>
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
                            <ExternalLink className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            {campaign.status === "Active" ? (
                              <>
                                <Pause className="h-4 w-4 mr-2" />
                                Pause
                              </>
                            ) : campaign.status === "Paused" ? (
                              <>
                                <Play className="h-4 w-4 mr-2" />
                                Resume
                              </>
                            ) : null}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600">
                            <Trash className="h-4 w-4 mr-2" />
                            Delete
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
  );
};

export default Campaigns;
