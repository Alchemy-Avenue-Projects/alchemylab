
import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Ad } from "@/types/database";
import { format } from "date-fns";
import { Image, FileVideo, FileText } from "lucide-react";

interface AdPreviewProps {
  ads: Ad[];
  isLoading: boolean;
}

export const AdPreview: React.FC<AdPreviewProps> = ({ ads, isLoading }) => {
  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="animate-spin h-6 w-6 border-2 border-alchemy-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (ads.length === 0) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">No ads found for this campaign.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
      {ads.map((ad) => (
        <Card key={ad.id} className="overflow-hidden">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-base">{ad.headline || "No Headline"}</CardTitle>
                <CardDescription>
                  {format(new Date(ad.created_at), "MMM d, yyyy")}
                </CardDescription>
              </div>
              <Badge variant="outline" className="capitalize">
                {ad.ad_type}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {ad.image_url && (
              <div className="relative aspect-video bg-muted rounded-md overflow-hidden">
                <img 
                  src={ad.image_url} 
                  alt={ad.headline || "Ad image"} 
                  className="object-cover w-full h-full" 
                />
              </div>
            )}
            
            {!ad.image_url && ad.ad_type === "image" && (
              <div className="flex items-center justify-center aspect-video bg-muted rounded-md">
                <Image className="h-12 w-12 text-muted-foreground/50" />
              </div>
            )}
            
            {ad.ad_type === "video" && !ad.video_url && (
              <div className="flex items-center justify-center aspect-video bg-muted rounded-md">
                <FileVideo className="h-12 w-12 text-muted-foreground/50" />
              </div>
            )}

            {ad.body_text && (
              <div className="mt-2">
                <p className="text-sm text-muted-foreground">{ad.body_text}</p>
              </div>
            )}

            {!ad.body_text && (
              <div className="mt-2 flex items-center">
                <FileText className="h-4 w-4 mr-2 text-muted-foreground/50" />
                <span className="text-sm text-muted-foreground">No ad copy available</span>
              </div>
            )}

            {ad.cta && (
              <div className="mt-2">
                <Badge variant="secondary" className="capitalize">{ad.cta}</Badge>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
