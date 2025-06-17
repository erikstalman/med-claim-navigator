
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Download, ZoomIn, ZoomOut, RotateCw, FileText, AlertCircle } from "lucide-react";
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

  const isPDF = (document: Document) => {
    return document.type?.toLowerCase().includes('pdf') || document.name?.toLowerCase().endsWith('.pdf');
  };

  const isImage = (document: Document) => {
    return document.type?.toLowerCase().includes('image') || 
           /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(document.name || '');
  };

  const isTextDocument = (document: Document) => {
    return document.type?.toLowerCase().includes('text') || 
           document.type?.toLowerCase().includes('word') ||
           document.type?.toLowerCase().includes('document') ||
           /\.(txt|doc|docx|rtf)$/i.test(document.name || '');
  };

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

  const renderDocumentContent = () => {
    if (isPDF(document)) {
      // For PDF files, show an embedded PDF viewer if file URL is available
      if (document.fileUrl) {
        return (
          <iframe
            src={`${document.fileUrl}#zoom=${zoom}`}
            className="w-full h-full border-0"
            style={{
              transform: `rotate(${rotation}deg)`,
              transformOrigin: 'center center'
            }}
            title={document.name}
          />
        );
      } else {
        // Fallback for PDF without file URL
        return (
          <div className="flex items-center justify-center h-full text-center">
            <div>
              <FileText className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">PDF Document</h3>
              <p className="text-sm text-gray-600 mb-4">{document.name}</p>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mr-2" />
                  <p className="text-sm text-yellow-800">
                    PDF preview not available. The original file needs to be uploaded to view the content.
                  </p>
                </div>
              </div>
              {document.content && (
                <div className="text-left bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Document Information:</h4>
                  <pre className="text-xs text-gray-700 whitespace-pre-wrap">{document.content}</pre>
                </div>
              )}
            </div>
          </div>
        );
      }
    }

    if (isImage(document)) {
      if (document.fileUrl) {
        return (
          <div className="flex items-center justify-center h-full">
            <img
              src={document.fileUrl}
              alt={document.name}
              className="max-w-full max-h-full object-contain"
              style={{
                transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                transformOrigin: 'center center'
              }}
            />
          </div>
        );
      }
    }

    if (isTextDocument(document) && document.content) {
      return (
        <div className="p-6 h-full overflow-auto">
          <div className="flex items-center mb-4 pb-2 border-b">
            <FileText className="h-5 w-5 text-blue-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">{document.name}</h2>
          </div>
          <div 
            className="whitespace-pre-wrap text-gray-800 leading-relaxed"
            style={{
              fontSize: `${zoom}%`,
              transform: `rotate(${rotation}deg)`,
              transformOrigin: 'top left'
            }}
          >
            {document.content}
          </div>
        </div>
      );
    }

    // Default fallback for unsupported file types
    return (
      <div className="flex items-center justify-center h-full text-center text-gray-500">
        <div>
          <div className="w-24 h-32 bg-gray-200 rounded-lg mx-auto mb-4 flex items-center justify-center">
            <FileText className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium mb-2">Document Preview</h3>
          <p className="text-sm mb-2">{document.name}</p>
          <p className="text-xs text-gray-400 mb-4">
            File type: {document.type}
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              Preview not available for this file type. Use the download button to view the original file.
            </p>
          </div>
          {document.content && (
            <div className="mt-4 text-left bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Document Information:</h4>
              <pre className="text-xs text-gray-700 whitespace-pre-wrap">{document.content}</pre>
            </div>
          )}
        </div>
      </div>
    );
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
            <CardContent className="h-full p-0">
              <div className="w-full h-full bg-white border rounded-lg overflow-hidden">
                {renderDocumentContent()}
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
