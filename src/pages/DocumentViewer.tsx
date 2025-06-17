
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import AIDocumentChat from "@/components/AIDocumentChat";
import DocumentHeader from "@/components/DocumentHeader";
import DocumentRenderer from "@/components/DocumentRenderer";
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
      console.log("Looking for document:", documentId, "Found:", foundDocument);
      if (foundDocument) {
        setDocument(foundDocument);
      }
      setLoading(false);
    }
  }, [documentId]);

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 25, 200));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 25, 50));
  const handleRotate = () => setRotation(prev => (prev + 90) % 360);
  const handleGoBack = () => navigate(`/case/${document?.caseId}`);

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

  return (
    <div className="min-h-screen bg-gray-50">
      <DocumentHeader
        document={document}
        zoom={zoom}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onRotate={handleRotate}
        onGoBack={handleGoBack}
      />

      <div className="flex h-[calc(100vh-80px)]">
        {/* Document Viewer */}
        <div className="flex-1 p-6">
          <Card className="h-full">
            <CardContent className="h-full p-0">
              <div className="w-full h-full bg-white border rounded-lg overflow-hidden">
                <DocumentRenderer
                  document={document}
                  zoom={zoom}
                  rotation={rotation}
                />
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
