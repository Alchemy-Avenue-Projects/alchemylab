
import React, { useState } from "react";
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
  Download,
  Eye
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
  CardFooter,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";

import { format } from "date-fns";
import { useCampaigns, CampaignWithAccount } from "@/hooks/useCampaigns";
import { useAdAccounts } from "@/hooks/useAdAccounts";
import { CampaignForm } from "@/components/campaigns/CampaignForm";
import { AdPreview } from "@/components/campaigns/AdPreview";
import { useToast } from "@/hooks/use-toast";
import { Ad } from "@/types/database";

const Campaigns: React.FC = () => {
  const { 
    campaigns, 
    isLoading,
    filters,
    setFilters,
    createCampaign,
    updateCampaign,
    deleteCampaign,
    fetchAdsForCampaign,
    isCreating,
    isUpdating,
    isDeleting
  } = useCampaigns();
  
  const { adAccounts, isLoading: isLoadingAdAccounts } = useAdAccounts();
  const { toast } = useToast();
  
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<CampaignWithAccount | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [campaignToDelete, setCampaignToDelete] = useState<string | null>(null);
  
  const [previewCampaign, setPreviewCampaign] = useState<CampaignWithAccount | null>(null);
  const [previewAds, setPreviewAds] = useState<Ad[]>([]);
  const [loadingAds, setLoadingAds] = useState(false);

  const handleCreateCampaign = (data: any) => {
    createCampaign(data, {
      onSuccess: () => {
        setCreateDialogOpen(false);
      }
    });
  };

  const handleUpdateCampaign = (data: any) => {
    if (!editingCampaign) return;
    
    updateCampaign({
      id: editingCampaign.id,
      ...data
    }, {
      onSuccess: () => {
        setEditingCampaign(null);
      }
    });
  };

  const handleDeleteCampaign = () => {
    if (!campaignToDelete) return;
    
    deleteCampaign(campaignToDelete, {
      onSuccess: () => {
        setShowDeleteDialog(false);
        setCampaignToDelete(null);
      }
    });
  };

  const handlePreviewAds = async (campaign: CampaignWithAccount) => {
    try {
      setPreviewCampaign(campaign);
      setLoadingAds(true);
      const ads = await fetchAdsForCampaign(campaign.id);
      setPreviewAds(ads);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load ads for this campaign",
        variant: "destructive"
      });
    } finally {
      setLoadingAds(false);
    }
  };

  const handleFilterChange = (type: 'platform' | 'status', value: string) => {
    setFilters(prev => ({
      ...prev,
      [type]: value
    }));
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(prev => ({
      ...prev,
      search: e.target.value
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-semibold">Campaigns</h1>
        <div className="flex items-center space-x-2">
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="alchemy-gradient">
                <Plus className="h-4 w-4 mr-2" />
                New Campaign
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[550px]">
              <DialogHeader>
                <DialogTitle>Create New Campaign</DialogTitle>
                <DialogDescription>
                  Fill out the form below to create a new advertising campaign.
                </DialogDescription>
              </DialogHeader>
              
              {isLoadingAdAccounts ? (
                <div className="py-8 flex items-center justify-center">
                  <div className="animate-spin h-6 w-6 border-2 border-alchemy-600 border-t-transparent rounded-full"></div>
                </div>
              ) : adAccounts.length === 0 ? (
                <div className="py-4 text-center">
                  <p className="text-muted-foreground mb-2">No ad accounts found.</p>
                  <p className="text-sm">You need to connect an ad account before creating campaigns.</p>
                </div>
              ) : (
                <CampaignForm 
                  onSubmit={handleCreateCampaign} 
                  adAccounts={adAccounts} 
                  isLoading={isCreating} 
                />
              )}
            </DialogContent>
          </Dialog>
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
                  value={filters.search}
                  onChange={handleSearchChange}
                />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex items-center space-x-2 w-full md:w-auto">
              <Select 
                value={filters.platform} 
                onValueChange={(value) => handleFilterChange('platform', value)}
              >
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
              
              <Select 
                value={filters.status} 
                onValueChange={(value) => handleFilterChange('status', value)}
              >
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-status">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                  <SelectItem value="ended">Ended</SelectItem>
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
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="flex justify-center">
                        <div className="animate-spin h-6 w-6 border-2 border-alchemy-600 border-t-transparent rounded-full"></div>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : campaigns.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <p className="text-muted-foreground">No campaigns found.</p>
                      <p className="text-sm mt-1">Create a new campaign to get started.</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  campaigns.map((campaign) => (
                    <TableRow key={campaign.id}>
                      <TableCell className="font-medium">
                        <div>
                          {campaign.name}
                          <div className="text-xs text-muted-foreground">
                            Created: {format(new Date(campaign.created_at), "MMM d, yyyy")}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{campaign.ad_accounts?.platform || "Unknown"}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={
                            campaign.status === "active" ? "outline" : 
                            campaign.status === "paused" ? "secondary" : "default"
                          } 
                          className={
                            campaign.status === "active" ? "text-green-500 border-green-200" : 
                            campaign.status === "ended" ? "text-blue-500 border-blue-200" : ""
                          }
                        >
                          {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>${campaign.budget ? campaign.budget.toFixed(2) : '0.00'}</TableCell>
                      <TableCell>{format(new Date(campaign.start_date), "MMM d, yyyy")}</TableCell>
                      <TableCell>
                        {campaign.end_date 
                          ? format(new Date(campaign.end_date), "MMM d, yyyy")
                          : "Not set"
                        }
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end">
                          <Sheet onOpenChange={(open) => {
                            if (open) handlePreviewAds(campaign);
                          }}>
                            <SheetTrigger asChild>
                              <Button variant="ghost" size="icon" title="Preview Ads">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </SheetTrigger>
                            <SheetContent side="right" className="sm:max-w-md md:max-w-lg">
                              <SheetHeader>
                                <SheetTitle>Ads for {previewCampaign?.name}</SheetTitle>
                                <SheetDescription>
                                  {campaign.ad_accounts?.platform} • {campaign.status}
                                </SheetDescription>
                              </SheetHeader>
                              <div className="mt-4">
                                <AdPreview ads={previewAds} isLoading={loadingAds} />
                              </div>
                              <SheetFooter className="mt-4">
                                <SheetClose asChild>
                                  <Button variant="outline">Close</Button>
                                </SheetClose>
                              </SheetFooter>
                            </SheetContent>
                          </Sheet>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem asChild>
                                <button className="flex items-center w-full" onClick={() => handlePreviewAds(campaign)}>
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Ads
                                </button>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <button className="flex items-center w-full" onClick={() => setEditingCampaign(campaign)}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit
                                </button>
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                {campaign.status === "active" ? (
                                  <button 
                                    className="flex items-center w-full"
                                    onClick={() => updateCampaign({ id: campaign.id, status: "paused" })}
                                  >
                                    <Pause className="h-4 w-4 mr-2" />
                                    Pause
                                  </button>
                                ) : campaign.status === "paused" ? (
                                  <button 
                                    className="flex items-center w-full"
                                    onClick={() => updateCampaign({ id: campaign.id, status: "active" })}
                                  >
                                    <Play className="h-4 w-4 mr-2" />
                                    Resume
                                  </button>
                                ) : null}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem asChild>
                                <button 
                                  className="flex items-center w-full text-red-600"
                                  onClick={() => {
                                    setCampaignToDelete(campaign.id);
                                    setShowDeleteDialog(true);
                                  }}
                                >
                                  <Trash className="h-4 w-4 mr-2" />
                                  Delete
                                </button>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Campaign Dialog */}
      <Dialog 
        open={!!editingCampaign} 
        onOpenChange={(open) => !open && setEditingCampaign(null)}
      >
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Edit Campaign</DialogTitle>
            <DialogDescription>
              Update the details of your campaign.
            </DialogDescription>
          </DialogHeader>
          
          {editingCampaign && (
            <CampaignForm 
              onSubmit={handleUpdateCampaign} 
              adAccounts={adAccounts} 
              initialData={editingCampaign} 
              isLoading={isUpdating} 
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this campaign? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex space-x-2 sm:space-x-0">
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteCampaign} disabled={isDeleting}>
              {isDeleting ? "Deleting..." : "Delete Campaign"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Campaigns;
