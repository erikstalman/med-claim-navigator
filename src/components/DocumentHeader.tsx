
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";
import { Document } from "@/types";
import DocumentControls from "./DocumentControls";

interface DocumentHeaderProps {
  document: Document;
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onRotate: () => void;
  onGoBack: () => void;
}

const DocumentHeader = ({ document, zoom, onZoomIn, onZoomOut, onRotate, onGoBack }: DocumentHeaderProps) => {
  const getCategoryColor = (category: string) => {
    switch (category) {
      case "medical": return "bg-blue-100 text-blue-800";
      case "imaging": return "bg-purple-100 text-purple-800";
      case "legal": return "bg-red-100 text-red-800";
      case "treatment": return "bg-green-100 text-green-800";
      case "patient-claim": return "bg-orange-100 text-orange-800";
      case "administrative": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onGoBack}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Case</span>
          </Button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">{document.name}</h1>
            <p className="text-sm text-gray-600">
              {document.type} • {document.pages} pages • {document.size}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Badge className={getCategoryColor(document.category)}>
            {document.category}
          </Badge>
          <DocumentControls
            zoom={zoom}
            onZoomIn={onZoomIn}
            onZoomOut={onZoomOut}
            onRotate={onRotate}
          />
        </div>
      </div>
    </header>
  );
};

export default DocumentHeader;
