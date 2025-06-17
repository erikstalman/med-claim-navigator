
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
