
import { FileText, AlertCircle } from "lucide-react";
import { Document } from "@/types";

interface DocumentRendererProps {
  document: Document;
  zoom: number;
  rotation: number;
}

const DocumentRenderer = ({ document, zoom, rotation }: DocumentRendererProps) => {
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

  const renderPDFContent = () => {
    // If we have a preview image from processing, show it
    if (document.fileUrl) {
      return (
        <div className="flex items-center justify-center h-full">
          <img
            src={document.fileUrl}
            alt={`Preview of ${document.name}`}
            className="max-w-full max-h-full object-contain border"
            style={{
              transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
              transformOrigin: 'center center'
            }}
          />
        </div>
      );
    }
    
    // If we have extracted text content, show it in a document-like format
    if (document.content) {
      return (
        <div className="h-full overflow-auto bg-white">
          <div className="max-w-4xl mx-auto p-8">
            <div className="flex items-center mb-6 pb-4 border-b">
              <FileText className="h-6 w-6 text-red-600 mr-3" />
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{document.name}</h2>
                <p className="text-sm text-gray-600">{document.pages} pages • {document.size}</p>
              </div>
            </div>
            <div 
              className="prose prose-sm max-w-none text-gray-800 leading-relaxed whitespace-pre-wrap"
              style={{
                fontSize: `${Math.max(zoom / 100, 0.5)}em`,
                transform: `rotate(${rotation}deg)`,
                transformOrigin: 'top left'
              }}
            >
              {document.content}
            </div>
          </div>
        </div>
      );
    }

    // Fallback for PDFs without processed content
    return (
      <div className="flex items-center justify-center h-full text-center">
        <div>
          <FileText className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">PDF Document</h3>
          <p className="text-sm text-gray-600 mb-4">{document.name}</p>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-yellow-600 mr-2" />
              <p className="text-sm text-yellow-800">
                PDF content could not be processed. The document may need to be re-uploaded for full preview.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderImageContent = () => {
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
    return null;
  };

  const renderTextContent = () => {
    if (document.content) {
      return (
        <div className="h-full overflow-auto bg-white">
          <div className="max-w-4xl mx-auto p-8">
            <div className="flex items-center mb-6 pb-4 border-b">
              <FileText className="h-6 w-6 text-blue-600 mr-3" />
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{document.name}</h2>
                <p className="text-sm text-gray-600">{document.type} • {document.size}</p>
              </div>
            </div>
            <div 
              className="prose prose-sm max-w-none text-gray-800 leading-relaxed whitespace-pre-wrap"
              style={{
                fontSize: `${Math.max(zoom / 100, 0.5)}em`,
                transform: `rotate(${rotation}deg)`,
                transformOrigin: 'top left'
              }}
            >
              {document.content}
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const renderFallbackContent = () => {
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
              This document type is not yet supported for preview. Please re-upload the document for processing.
            </p>
          </div>
        </div>
      </div>
    );
  };

  // Determine which renderer to use
  if (isPDF(document)) {
    return renderPDFContent();
  }

  if (isImage(document)) {
    const imageContent = renderImageContent();
    if (imageContent) return imageContent;
  }

  if (isTextDocument(document)) {
    const textContent = renderTextContent();
    if (textContent) return textContent;
  }

  return renderFallbackContent();
};

export default DocumentRenderer;
