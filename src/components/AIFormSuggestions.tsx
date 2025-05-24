
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bot, ThumbsUp, ThumbsDown, Edit3, RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface AIFormSuggestionsProps {
  caseId: string;
  documents: Array<{ id: string; name: string; category: string; }>;
  currentFormData: Record<string, string>;
  onAcceptSuggestion: (field: string, value: string) => void;
  onRejectSuggestion: (field: string) => void;
}

interface Suggestion {
  field: string;
  fieldLabel: string;
  value: string;
  confidence: number;
  reasoning: string;
  documentReferences: Array<{ documentName: string; page?: number }>;
}

const AIFormSuggestions = ({ 
  caseId, 
  documents, 
  currentFormData, 
  onAcceptSuggestion, 
  onRejectSuggestion 
}: AIFormSuggestionsProps) => {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [rejectedFields, setRejectedFields] = useState<Set<string>>(new Set());

  const generateSuggestions = async () => {
    setLoading(true);
    
    try {
      // Simulate AI analysis of documents
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockSuggestions: Suggestion[] = [
        {
          field: "healthConditionBefore",
          fieldLabel: "Health condition before the accident",
          value: "Patient reported no significant pre-existing medical conditions. Medical history indicates good overall health with no chronic conditions or previous injuries to the affected area.",
          confidence: 0.85,
          reasoning: "Based on medical records showing no pre-existing conditions and patient intake forms",
          documentReferences: [
            { documentName: "Medical Records - Emergency Room", page: 2 },
            { documentName: "Patient Intake Form", page: 1 }
          ]
        },
        {
          field: "traumaDegree",
          fieldLabel: "Degree of violence or trauma during the accident",
          value: "High-impact motor vehicle collision at approximately 45 mph. Significant vehicle damage documented. Patient vehicle sustained major front-end damage consistent with severe trauma.",
          confidence: 0.92,
          reasoning: "Police report documents high-speed collision with substantial vehicle damage",
          documentReferences: [
            { documentName: "Police Report", page: 1 },
            { documentName: "Accident Scene Photos", page: 3 }
          ]
        },
        {
          field: "initialSymptoms",
          fieldLabel: "Initial symptoms/complaints in relation to the time of accident",
          value: "Immediate onset of neck pain, headache, and lower back discomfort within 2 hours of accident. Symptoms reported to emergency personnel at scene and documented upon hospital arrival.",
          confidence: 0.88,
          reasoning: "Emergency room records show symptoms documented within hours of accident",
          documentReferences: [
            { documentName: "Medical Records - Emergency Room", page: 3 },
            { documentName: "Ambulance Report", page: 1 }
          ]
        }
      ];
      
      // Filter out suggestions for fields that are already filled or rejected
      const filteredSuggestions = mockSuggestions.filter(s => 
        !currentFormData[s.field] && !rejectedFields.has(s.field)
      );
      
      setSuggestions(filteredSuggestions);
      
      if (filteredSuggestions.length > 0) {
        toast.success(`Generated ${filteredSuggestions.length} AI suggestions`);
      }
    } catch (error) {
      console.error("Error generating suggestions:", error);
      toast.error("Failed to generate AI suggestions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (documents.length > 0) {
      generateSuggestions();
    }
  }, [documents.length]);

  const handleAccept = (suggestion: Suggestion) => {
    onAcceptSuggestion(suggestion.field, suggestion.value);
    setSuggestions(prev => prev.filter(s => s.field !== suggestion.field));
    toast.success("Suggestion accepted and added to form");
  };

  const handleReject = (suggestion: Suggestion) => {
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
        {loading && (
          <div className="text-center py-6">
            <Bot className="h-8 w-8 mx-auto mb-2 text-blue-600 animate-pulse" />
            <p className="text-blue-700">Analyzing documents and generating suggestions...</p>
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
