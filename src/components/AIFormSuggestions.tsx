
import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bot, ThumbsUp, ThumbsDown, Edit3, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { aiService, FormSuggestion, DocumentSummary } from "@/services/aiService";

interface AIFormSuggestionsProps {
  caseId: string;
  documents: Array<{ id: string; name: string; category: string; }>;
  currentFormData: Record<string, string>;
  onAcceptSuggestion: (field: string, value: string) => void;
  onRejectSuggestion: (field: string) => void;
}

const AIFormSuggestions = ({
  caseId,
  documents,
  currentFormData,
  onAcceptSuggestion,
  onRejectSuggestion
}: AIFormSuggestionsProps) => {
  const [suggestions, setSuggestions] = useState<FormSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [rejectedFields, setRejectedFields] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  const generateSuggestions = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const preparedDocuments: DocumentSummary[] = documents.map(doc => ({
        id: doc.id,
        name: doc.name,
        category: doc.category,
      }));

      const generatedSuggestions = await aiService.generateFormSuggestions({
        caseId,
        documents: preparedDocuments,
        currentFormData,
      });

      const filteredSuggestions = generatedSuggestions.filter(
        suggestion => !currentFormData[suggestion.field] && !rejectedFields.has(suggestion.field)
      );

      setSuggestions(filteredSuggestions);

      if (filteredSuggestions.length > 0) {
        toast.success(`Generated ${filteredSuggestions.length} AI suggestions`);
      } else {
        toast.info("No new AI suggestions available right now");
      }
    } catch (error) {
      console.error("Error generating suggestions:", error);
      setError(error instanceof Error ? error.message : "Failed to generate AI suggestions");
      toast.error("Failed to generate AI suggestions");
    } finally {
      setLoading(false);
    }
  }, [caseId, documents, currentFormData, rejectedFields]);

  useEffect(() => {
    if (documents.length > 0) {
      generateSuggestions();
    }
  }, [documents.length, generateSuggestions]);

  const handleAccept = (suggestion: FormSuggestion) => {
    onAcceptSuggestion(suggestion.field, suggestion.value);
    setSuggestions(prev => prev.filter(s => s.field !== suggestion.field));
    toast.success("Suggestion accepted and added to form");
  };

  const handleReject = (suggestion: FormSuggestion) => {
    setRejectedFields(prev => new Set([...prev, suggestion.field]));
    setSuggestions(prev => prev.filter(s => s.field !== suggestion.field));
    onRejectSuggestion(suggestion.field);
    toast.info("Suggestion rejected");
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return "bg-green-100 text-green-800";
    if (confidence >= 0.7) return "bg-yellow-100 text-yellow-800";
    return "bg-orange-100 text-orange-800";
  };

  if (suggestions.length === 0 && !loading) {
    return null;
  }

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bot className="h-5 w-5 text-blue-600" />
            <span className="text-blue-800">AI Form Suggestions</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={generateSuggestions}
            disabled={loading}
            className="bg-white"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </CardTitle>
        <CardDescription className="text-blue-700">
          AI-generated suggestions based on document analysis
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {(loading || error) && (
          <div className="text-center py-6">
            <Bot className="h-8 w-8 mx-auto mb-2 text-blue-600 animate-pulse" />
            {loading && (
              <p className="text-blue-700">Analyzing documents and generating suggestions...</p>
            )}
            {error && !loading && (
              <p className="text-red-600">{error}</p>
            )}
          </div>
        )}

        {suggestions.map((suggestion, index) => (
          <div key={index} className="bg-white rounded-lg p-4 border">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h4 className="font-medium text-gray-900 mb-1">
                  {suggestion.fieldLabel}
                </h4>
                <div className="flex items-center space-x-2 mb-2">
                  <Badge className={getConfidenceColor(suggestion.confidence)}>
                    {Math.round(suggestion.confidence * 100)}% confidence
                  </Badge>
                </div>
              </div>
            </div>
            
            <p className="text-sm text-gray-700 mb-3 p-3 bg-gray-50 rounded">
              {suggestion.value}
            </p>
            
            <div className="text-xs text-gray-600 mb-3">
              <p className="font-medium mb-1">AI Reasoning:</p>
              <p>{suggestion.reasoning}</p>
              
              {suggestion.documentReferences.length > 0 && (
                <div className="mt-2">
                  <p className="font-medium mb-1">Referenced Documents:</p>
                  <div className="flex flex-wrap gap-1">
                    {suggestion.documentReferences.map((ref, i) => (
                      <Badge key={i} variant="outline" className="text-xs">
                        {ref.documentName}
                        {ref.page && ` (p. ${ref.page})`}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex space-x-2">
              <Button
                size="sm"
                onClick={() => handleAccept(suggestion)}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <ThumbsUp className="h-3 w-3 mr-1" />
                Accept
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleReject(suggestion)}
                className="border-gray-300"
              >
                <ThumbsDown className="h-3 w-3 mr-1" />
                Reject
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default AIFormSuggestions;
