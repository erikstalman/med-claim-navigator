
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Download, ZoomIn, ZoomOut, RotateCw, Search } from "lucide-react";
import AIDocumentChat from "@/components/AIDocumentChat";
import { dataService } from "@/services/dataService";
import { Document } from "@/types";

const DocumentViewer = () => {
  const { documentId } = useParams();
  const navigate = useNavigate();
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [document, setDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (documentId) {
      const documents = dataService.getDocuments();
      const foundDocument = documents.find(d => d.id === documentId);
      if (foundDocument) {
        setDocument(foundDocument);
      }
      setLoading(false);
    }
  }, [documentId]);

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 25, 200));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 25, 50));
  const handleRotate = () => setRotation(prev => (prev + 90) % 360);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div>Loading document...</div>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-2">Document not found</h2>
          <Button onClick={() => navigate(-1)}>Go Back</Button>
        </div>
      </div>
    );
  }

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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate(`/case/${document.caseId}`)}
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
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={handleZoomOut}>
                <ZoomOut className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium w-12 text-center">{zoom}%</span>
              <Button variant="outline" size="sm" onClick={handleZoomIn}>
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={handleRotate}>
                <RotateCw className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Document Viewer */}
        <div className="flex-1 p-6">
          <Card className="h-full">
            <CardContent className="h-full p-6">
              <div 
                className="w-full h-full bg-white border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center"
                style={{
                  transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                  transformOrigin: 'center center'
                }}
              >
                <div className="text-center text-gray-500">
                  <div className="w-24 h-32 bg-gray-200 rounded-lg mx-auto mb-4 flex items-center justify-center">
                    <Search className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">Document Preview</h3>
                  <p className="text-sm">
                    {document.name}
                  </p>
                  <p className="text-xs mt-2 text-gray-400">
                    Page 1 of {document.pages}
                  </p>
                  <p className="text-xs mt-1 text-gray-400">
                    File: {document.name}
                  </p>
                  <p className="text-xs mt-1 text-gray-400">
                    Uploaded: {document.uploadDate} by {document.uploadedBy}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* AI Chat Sidebar */}
        <div className="w-96 border-l border-gray-200 bg-white">
          <AIDocumentChat caseId={document.caseId} />
        </div>
      </div>
    </div>
  );
};

export default DocumentViewer;
