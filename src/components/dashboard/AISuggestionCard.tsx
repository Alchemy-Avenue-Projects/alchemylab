
import React from "react";
import { 
  Lightbulb, 
  ThumbsUp, 
  ThumbsDown, 
  ArrowUpRight,
  RefreshCw
} from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AiSuggestion, Campaign } from "@/types/database";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { Separator } from "@/components/ui/separator";

interface AISuggestionCardProps {
  suggestion: AiSuggestion & {
    ads: {
      campaign_id: string;
      campaigns: Campaign;
    };
  };
  onSuggestionUpdate: () => void;
}

const AISuggestionCard: React.FC<AISuggestionCardProps> = ({ suggestion, onSuggestionUpdate }) => {
  const handleFeedback = async (accepted: boolean) => {
    try {
      const { error } = await supabase
        .from('ai_suggestions')
        .update({ accepted })
        .eq('id', suggestion.id);

      if (error) throw error;
      
      toast.success(`Feedback recorded ${accepted ? 'positively' : 'negatively'}`);
      onSuggestionUpdate();
    } catch (error) {
      console.error('Error updating suggestion:', error);
      toast.error('Failed to record feedback');
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'copy_change': 
        return 'Copy Improvement';
      case 'asset_swap': 
        return 'Asset Recommendation';
      case 'fatigue_alert': 
        return 'Ad Fatigue Alert';
      case 'localization': 
        return 'Localization Suggestion';
      default: 
        return 'Suggestion';
    }
  };

  return (
    <Card className="border-alchemy-200">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-base flex items-center">
            <Lightbulb className="h-4 w-4 mr-2 text-alchemy-600" />
            AI Suggestion of the Day
          </CardTitle>
          <Badge variant="outline" className="text-alchemy-600 border-alchemy-200">
            {getTypeLabel(suggestion.suggestion_type)}
          </Badge>
        </div>
        <CardDescription>
          For campaign "{suggestion.ads.campaigns.name}"
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div>
            <h4 className="text-sm font-medium mb-1">Suggested Improvement</h4>
            <p className="text-sm">{suggestion.suggested_text}</p>
          </div>
          
          {suggestion.reason && (
            <div>
              <h4 className="text-sm font-medium mb-1">Reason</h4>
              <p className="text-sm text-muted-foreground">{suggestion.reason}</p>
            </div>
          )}
        </div>
      </CardContent>
      <Separator />
      <CardFooter className="pt-3 flex flex-col sm:flex-row space-y-2 sm:space-y-0">
        <div className="flex space-x-2 sm:mr-auto">
          <Button 
            variant="outline" 
            size="sm"
            className="flex items-center text-green-600"
            onClick={() => handleFeedback(true)}
          >
            <ThumbsUp className="h-3.5 w-3.5 mr-1" />
            Helpful
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            className="flex items-center text-red-600"
            onClick={() => handleFeedback(false)}
          >
            <ThumbsDown className="h-3.5 w-3.5 mr-1" />
            Not Helpful
          </Button>
        </div>
        <div className="flex space-x-2 w-full sm:w-auto">
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex items-center sm:ml-auto"
            onClick={onSuggestionUpdate}
          >
            <RefreshCw className="h-3.5 w-3.5 mr-1" />
            Next Suggestion
          </Button>
          <Button 
            variant="default" 
            size="sm" 
            className="alchemy-gradient flex items-center"
            asChild
          >
            <Link to={`/campaigns`}>
              <span className="mr-1">View Campaign</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default AISuggestionCard;
