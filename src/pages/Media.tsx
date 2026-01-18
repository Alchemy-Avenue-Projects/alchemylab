
import React, { useState, useEffect } from "react";
import { 
  Folder, 
  Image as ImageIcon, 
  Upload, 
  Plus, 
  Grid2X2, 
  List,
  Filter,
  Search,
  Trash,
  MoreVertical
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

// Define types to match the Supabase schema
interface Client {
  id: string;
  name: string;
  organization_id: string;
  industry?: string;
  time_zone?: string;
  created_at: string;
}

interface Asset {
  id: string;
  file_name: string;
  url: string;
  asset_type: 'image' | 'video' | 'text';
  uploaded_at: string;
  client_id: string;
  uploaded_by: string;
  usage_count?: number;
}

const Media: React.FC = () => {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [currentClientId, setCurrentClientId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Fetch clients
  const { data: clients } = useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clients')
        .select('*');
      
      if (error) throw error;
      return data as Client[] || [];
    }
  });

  // Set first client as current if none selected
  useEffect(() => {
    if (clients && clients.length > 0 && !currentClientId) {
      setCurrentClientId(clients[0].id);
    }
  }, [clients, currentClientId]);

  // Fetch assets for current client
  const { data: assets, isLoading } = useQuery({
    queryKey: ['assets', currentClientId],
    queryFn: async () => {
      if (!currentClientId) return [];

      const { data, error } = await supabase
        .from('assets')
        .select('*')
        .eq('client_id', currentClientId)
        .order('uploaded_at', { ascending: false });
      
      if (error) throw error;
      return data as Asset[] || [];
    },
    enabled: !!currentClientId
  });

  // Create folder (actually a client in this data model)
  const createFolderMutation = useMutation({
    mutationFn: async (folderName: string) => {
      // Get the user's organization ID
      const { data: orgData, error: orgError } = await supabase.rpc('get_user_org_id');
      
      if (orgError) throw orgError;
      const organizationId = orgData;
      
      const { data, error } = await supabase
        .from('clients')
        .insert([{ 
          name: folderName,
          organization_id: organizationId
        }])
        .select();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      setIsCreateFolderOpen(false);
      setNewFolderName("");
      toast.success("Folder Created", {
        description: "New folder has been created successfully",
      });
    },
    onError: (error) => {
      console.error("Error creating folder:", error);
      toast.error("Error", {
        description: "Could not create folder",
      });
    }
  });

  // Handle file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !currentClientId) return;

    setIsUploading(true);
    
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
        const filePath = `${currentClientId}/${fileName}`;
        
        // Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from('assets')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('assets')
          .getPublicUrl(filePath);

        // Get current user ID
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) throw new Error("User not authenticated");

        // Save to assets table
        const { error: dbError } = await supabase
          .from('assets')
          .insert([{
            client_id: currentClientId,
            file_name: file.name,
            url: publicUrl,
            asset_type: file.type.startsWith('image/') ? 'image' : 
                      file.type.startsWith('video/') ? 'video' : 'text',
            uploaded_by: user.id
          }]);

        if (dbError) throw dbError;
      }

      queryClient.invalidateQueries({ queryKey: ['assets', currentClientId] });
      toast.success("Files Uploaded", {
        description: `${files.length} file(s) uploaded successfully`,
      });
    } catch (error) {
      console.error("Error uploading files:", error);
      toast.error("Upload Failed", {
        description: "There was an error uploading your files",
      });
    } finally {
      setIsUploading(false);
      // Reset the input
      e.target.value = '';
    }
  };

  // Delete asset
  const deleteAssetMutation = useMutation({
    mutationFn: async (assetId: string) => {
      const assetToDelete = assets?.find(asset => asset.id === assetId);
      if (!assetToDelete) throw new Error("Asset not found");

      // Extract the file path from the URL
      const filePathMatch = assetToDelete.url.match(/assets\/([^?]+)/);
      const filePath = filePathMatch ? filePathMatch[1] : null;

      // Delete from storage if path found
      if (filePath) {
        const { error: storageError } = await supabase.storage
          .from('assets')
          .remove([filePath]);
          
        if (storageError) throw storageError;
      }

      // Delete the database record
      const { error: dbError } = await supabase
        .from('assets')
        .delete()
        .eq('id', assetId);
        
      if (dbError) throw dbError;
      
      return assetId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets', currentClientId] });
      toast.success("Asset Deleted", {
        description: "The asset has been removed",
      });
    },
    onError: (error) => {
      console.error("Error deleting asset:", error);
      toast.error("Delete Failed", {
        description: "Could not delete the asset",
      });
    }
  });

  // Filter assets based on search term
  const filteredAssets = assets?.filter(asset => 
    asset.file_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-semibold">Media Library</h1>
        <div className="flex items-center space-x-2">
          <label htmlFor="file-upload" className="cursor-pointer">
            <Input 
              id="file-upload" 
              type="file" 
              multiple
              className="hidden" 
              onChange={handleFileUpload}
              disabled={isUploading || !currentClientId}
            />
            <Button variant="outline" className="gap-1" asChild>
              <span>
                <Upload className="h-4 w-4 mr-1" />
                Upload
              </span>
            </Button>
          </label>
          <Button 
            className="alchemy-gradient"
            onClick={() => setIsCreateFolderOpen(true)}
          >
            <Plus className="h-4 w-4 mr-1" />
            New Folder
          </Button>
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row justify-between space-y-4 md:space-y-0 md:space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search media..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
          <Tabs defaultValue={viewMode} onValueChange={(value) => setViewMode(value as "grid" | "list")}>
            <TabsList>
              <TabsTrigger value="grid">
                <Grid2X2 className="h-4 w-4" />
              </TabsTrigger>
              <TabsTrigger value="list">
                <List className="h-4 w-4" />
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>
      
      {/* Folders (Clients) Section */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {clients?.map((client) => (
          <Card 
            key={client.id} 
            className={`cursor-pointer hover:shadow-md transition-shadow ${currentClientId === client.id ? 'border-alchemy-500 ring-1 ring-alchemy-500' : ''}`}
            onClick={() => setCurrentClientId(client.id)}
          >
            <CardContent className="p-2">
              <div className="aspect-square rounded bg-muted flex items-center justify-center">
                <Folder className="h-12 w-12 text-muted-foreground" />
              </div>
            </CardContent>
            <CardFooter className="p-2 pt-0">
              <p className="text-sm font-medium truncate w-full">{client.name}</p>
            </CardFooter>
          </Card>
        ))}
      </div>
      
      {/* Media Files Section */}
      {isLoading ? (
        <div className="flex justify-center py-8">
          <p>Loading...</p>
        </div>
      ) : (
        <>
          {currentClientId && (
            <div className={viewMode === "grid" ? "grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4" : "space-y-2"}>
              {filteredAssets && filteredAssets.length > 0 ? (
                filteredAssets.map((asset) => (
                  viewMode === "grid" ? (
                    <Card key={asset.id} className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardContent className="p-2 relative group">
                        <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-black/50 text-white">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => window.open(asset.url, '_blank')}>
                                View
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="text-destructive"
                                onClick={() => deleteAssetMutation.mutate(asset.id)}
                              >
                                <Trash className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        <div className="aspect-square rounded bg-muted flex items-center justify-center overflow-hidden">
                          {asset.asset_type === 'image' ? (
                            <img src={asset.url} alt={asset.file_name} className="w-full h-full object-cover" />
                          ) : (
                            <ImageIcon className="h-12 w-12 text-muted-foreground" />
                          )}
                        </div>
                      </CardContent>
                      <CardFooter className="p-2 pt-0">
                        <p className="text-sm font-medium truncate w-full">{asset.file_name}</p>
                      </CardFooter>
                    </Card>
                  ) : (
                    <div key={asset.id} className="flex items-center justify-between p-3 rounded border hover:bg-muted/50">
                      <div className="flex items-center space-x-3">
                        {asset.asset_type === 'image' ? (
                          <div className="h-10 w-10 rounded overflow-hidden">
                            <img src={asset.url} alt={asset.file_name} className="w-full h-full object-cover" />
                          </div>
                        ) : (
                          <ImageIcon className="h-10 w-10 text-muted-foreground" />
                        )}
                        <div>
                          <p className="font-medium">{asset.file_name}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(asset.uploaded_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="text-destructive" 
                          onClick={() => deleteAssetMutation.mutate(asset.id)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )
                ))
              ) : (
                <div className="col-span-full flex justify-center py-8">
                  <p className="text-muted-foreground">No media files found</p>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Create Folder Dialog */}
      <Dialog open={isCreateFolderOpen} onOpenChange={setIsCreateFolderOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Folder</DialogTitle>
            <DialogDescription>
              Enter a name for your new folder.
            </DialogDescription>
          </DialogHeader>
          <Input
            placeholder="Folder name"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateFolderOpen(false)}>
              Cancel
            </Button>
            <Button 
              className="alchemy-gradient"
              onClick={() => createFolderMutation.mutate(newFolderName)}
              disabled={!newFolderName.trim() || createFolderMutation.isPending}
            >
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Media;
