import React from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAISuggestions } from "@/hooks/useAISuggestions";
import { format } from "date-fns";
import { CheckCircle, XCircle, MessageSquare, AlertCircle, Lightbulb } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { SuggestionType } from "@/types/database";

export const AISuggestionsList: React.FC = () => {
  const { 
    suggestions, 
    isLoading, 
    error, 
    acceptSuggestion, 
    rejectSuggestion,
    generateSuggestion,
    isGenerating
  } = useAISuggestions();

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array(3).fill(0).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2 mt-2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-16 w-full" />
            </CardContent>
            <CardFooter>
              <div className="flex space-x-2 w-full">
                <Skeleton className="h-9 w-full" />
                <Skeleton className="h-9 w-full" />
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertCircle className="h-5 w-5 mr-2 text-red-500" />
            Error Loading Suggestions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>Failed to load AI suggestions. Please try again later.</p>
        </CardContent>
        <CardFooter>
          <Button>Retry</Button>
        </CardFooter>
      </Card>
    );
  }

  // Filter for pending suggestions
  const pendingSuggestions = suggestions.filter(s => s.accepted === null);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0 mb-4">
        <h3 className="text-xl font-medium">AI Suggestions</h3>
        <Button 
          variant="outline"
          onClick={() => {
            if (suggestions.length > 0) {
              // Use the first ad as an example
              generateSuggestion(suggestions[0].ad_id, "copy_change" as SuggestionType);
            }
          }}
          disabled={isGenerating || suggestions.length === 0}
          className="w-full sm:w-auto"
        >
          {isGenerating ? (
            <>
              <div className="h-4 w-4 mr-2 rounded-full border-2 border-current border-t-transparent animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Lightbulb className="h-4 w-4 mr-2" />
              Generate Suggestion
            </>
          )}
        </Button>
      </div>
      
      {pendingSuggestions.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">No Pending Suggestions</CardTitle>
            <CardDescription>
              All suggestions have been reviewed or you haven't generated any yet.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Generate new suggestions to improve your ad performance.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {pendingSuggestions.map((suggestion) => (
            <Card key={suggestion.id}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">
                      {suggestion.suggestion_type === "copy_change" ? "Headline Suggestion" : "Ad Copy Suggestion"}
                    </CardTitle>
                    <CardDescription>
                      {format(new Date(suggestion.created_at), "MMM d, yyyy")}
                    </CardDescription>
                  </div>
                  <Badge>
                    {suggestion.ads?.headline || "Unknown Ad"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="font-medium text-sm">Suggestion:</p>
                  <div className="bg-muted p-3 rounded-md">
                    <p className="italic">{suggestion.suggested_text}</p>
                  </div>
                  {suggestion.reason && (
                    <div className="flex items-start space-x-2 mt-2 text-sm text-muted-foreground">
                      <MessageSquare className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <p>{suggestion.reason}</p>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <div className="flex space-x-2 w-full">
                  <Button 
                    variant="outline" 
                    className="w-full flex items-center justify-center"
                    onClick={() => rejectSuggestion(suggestion.id)}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                  <Button 
                    className="w-full flex items-center justify-center bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                    onClick={() => acceptSuggestion(suggestion)}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Apply
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AISuggestionsList;
