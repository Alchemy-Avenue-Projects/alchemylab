
import React from "react";
import { 
  Folder, 
  Image as ImageIcon, 
  Upload, 
  Plus, 
  Grid2X2, 
  List,
  Filter,
  Search
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Media: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-semibold">Media Library</h1>
        <div className="flex items-center space-x-2">
          <Button variant="outline" className="gap-1">
            <Upload className="h-4 w-4 mr-1" />
            Upload
          </Button>
          <Button className="alchemy-gradient">
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
          />
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
          <TabsList>
            <TabsTrigger value="grid">
              <Grid2X2 className="h-4 w-4" />
            </TabsTrigger>
            <TabsTrigger value="list" defaultChecked>
              <List className="h-4 w-4" />
            </TabsTrigger>
          </TabsList>
        </div>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-2">
            <div className="aspect-square rounded bg-muted flex items-center justify-center">
              <Folder className="h-12 w-12 text-muted-foreground" />
            </div>
          </CardContent>
          <CardFooter className="p-2 pt-0">
            <p className="text-sm font-medium truncate w-full">Images</p>
          </CardFooter>
        </Card>
        
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-2">
            <div className="aspect-square rounded bg-muted flex items-center justify-center">
              <Folder className="h-12 w-12 text-muted-foreground" />
            </div>
          </CardContent>
          <CardFooter className="p-2 pt-0">
            <p className="text-sm font-medium truncate w-full">Videos</p>
          </CardFooter>
        </Card>
        
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i} className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-2">
              <div className="aspect-square rounded bg-muted flex items-center justify-center overflow-hidden">
                <ImageIcon className="h-12 w-12 text-muted-foreground" />
              </div>
            </CardContent>
            <CardFooter className="p-2 pt-0">
              <p className="text-sm font-medium truncate w-full">Asset-{i + 1}.jpg</p>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Media;
