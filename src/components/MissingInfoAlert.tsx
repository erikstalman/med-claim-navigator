
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, FileX, Clock, CheckCircle } from "lucide-react";

interface MissingInfoAlertProps {
  caseId: string;
  documents: Array<{
    id: string;
    name: string;
    category: string;
  }>;
}

const MissingInfoAlert = ({ caseId, documents }: MissingInfoAlertProps) => {
  const [missingItems, setMissingItems] = useState<Array<{
    type: "document" | "information";
    item: string;
    importance: "critical" | "important" | "recommended";
    reason: string;
  }>>([]);

  useEffect(() => {
    // Analyze documents and detect missing information
    const analyzeMissingInfo = () => {
      const missing = [];
      const docCategories = documents.map(d => d.category);

      // Check for critical documents
      if (!docCategories.includes("medical")) {
        missing.push({
          type: "document" as const,
          item: "Medical Records",
          importance: "critical" as const,
          reason: "Required for causality assessment"
        });
      }

      if (!docCategories.includes("legal")) {
        missing.push({
          type: "document" as const,
          item: "Police Report or Incident Documentation",
          importance: "critical" as const,
          reason: "Needed to assess degree of trauma/violence"
        });
      }

      if (!docCategories.includes("imaging")) {
        missing.push({
          type: "document" as const,
          item: "Diagnostic Images (X-ray, MRI, CT)",
          importance: "important" as const,
          reason: "Important for medical disability assessment"
        });
      }

      // Check for typical missing information patterns
      missing.push({
        type: "information" as const,
        item: "Pre-accident health condition documentation",
        importance: "important" as const,
        reason: "Critical for establishing baseline health status"
      });

      if (documents.length < 3) {
        missing.push({
          type: "information" as const,
          item: "Additional supporting documentation",
          importance: "recommended" as const,
          reason: "Cases typically require 3-6 supporting documents"
        });
      }

      setMissingItems(missing);
    };

    analyzeMissingInfo();
  }, [documents]);

  const getImportanceColor = (importance: string) => {
    switch (importance) {
      case "critical": return "bg-red-100 text-red-800";
      case "important": return "bg-yellow-100 text-yellow-800";
      case "recommended": return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getImportanceIcon = (importance: string) => {
    switch (importance) {
      case "critical": return <AlertTriangle className="h-4 w-4" />;
      case "important": return <Clock className="h-4 w-4" />;
      case "recommended": return <FileX className="h-4 w-4" />;
      default: return <CheckCircle className="h-4 w-4" />;
    }
  };

  if (missingItems.length === 0) {
    return (
      <Alert className="border-green-200 bg-green-50">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-800">
          All essential documentation appears to be complete for this case.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center space-x-2 text-orange-800">
          <AlertTriangle className="h-5 w-5" />
          <span>Missing Information Analysis</span>
        </CardTitle>
        <CardDescription className="text-orange-700">
          AI has identified potentially missing information for case {caseId}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {missingItems.map((item, index) => (
          <div key={index} className="flex items-start space-x-3 p-3 bg-white rounded-lg border">
            <div className="flex-shrink-0 mt-0.5">
              {getImportanceIcon(item.importance)}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <h4 className="font-medium text-gray-900">{item.item}</h4>
                <Badge className={getImportanceColor(item.importance)}>
                  {item.importance}
                </Badge>
              </div>
              <p className="text-sm text-gray-600">{item.reason}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default MissingInfoAlert;
