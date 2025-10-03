
import { useEffect, useState } from "react";
import { FileText, AlertCircle, RefreshCw, Image, FileIcon, File } from "lucide-react";
import { Document } from "@/types";
import { Button } from "@/components/ui/button";

interface DocumentRendererProps {
  document: Document;
  zoom: number;
  rotation: number;
}

const DocumentRenderer = ({ document, zoom, rotation }: DocumentRendererProps) => {
  // Ensure document name is always a string and not empty
  const documentName = (document.name && typeof document.name === 'string' && document.name.trim()) 
    ? document.name 
    : 'Unknown Document';
  
  console.log('Rendering document:', {
    name: documentName,
    type: document.type,
    hasContent: !!document.content,
    hasFileUrl: !!document.fileUrl,
    hasPreviewImage: !!document.previewImageUrl,
    size: document.size
  });

  const [pdfPreviewFailed, setPdfPreviewFailed] = useState(false);
  const [imagePreviewFailed, setImagePreviewFailed] = useState(false);
  const [fileViewerUrl, setFileViewerUrl] = useState<string | null>(null);
  const [previewViewerUrl, setPreviewViewerUrl] = useState<string | null>(null);

  useEffect(() => {
    setPdfPreviewFailed(false);
    setImagePreviewFailed(false);
  }, [document.id]);

  useEffect(() => {
    let isActive = true;
    const objectUrls: string[] = [];

    const convertToObjectUrl = async (source?: string | null) => {
      if (!source) return null;
      if (!source.startsWith("data:")) {
        return source;
      }

      try {
        const response = await fetch(source);
        const blob = await response.blob();
        const objectUrl = URL.createObjectURL(blob);
        objectUrls.push(objectUrl);
        return objectUrl;
      } catch (error) {
        console.error("Failed to convert data URL to object URL", error);
        return null;
      }
    };

    setFileViewerUrl(null);
    setPreviewViewerUrl(null);

    (async () => {
      const [nextFileUrl, nextPreviewUrl] = await Promise.all([
        convertToObjectUrl(document.fileUrl ?? null),
        convertToObjectUrl(document.previewImageUrl ?? null),
      ]);

      if (isActive) {
        setFileViewerUrl(nextFileUrl);
        setPreviewViewerUrl(nextPreviewUrl);
      }
    })();

    return () => {
      isActive = false;
      objectUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [document.fileUrl, document.previewImageUrl]);

  const effectiveFileUrl = fileViewerUrl ?? document.fileUrl ?? undefined;
  const effectivePreviewUrl = previewViewerUrl ?? document.previewImageUrl ?? undefined;

  const isPDF = (document: Document) => {
    const type = (document.type || '').toLowerCase();
    return type.includes('pdf') || type === 'application/pdf';
  };

  const isImage = (doc: Document) => {
    const type = (doc.type || '').toLowerCase();
    return type.startsWith('image/');
  };

  const isTextDocument = (doc: Document) => {
    const type = (doc.type || '').toLowerCase();
    return type.startsWith('text/') ||
           type.includes('word') ||
           type.includes('document') ||
           type === 'application/json' ||
           type === 'application/xml' ||
           type === 'application/rtf';
  };

  const isPlainTextSource = (doc: Document) => {
    const type = (doc.type || '').toLowerCase();
    return type.startsWith('text/') ||
           type === 'application/json' ||
           type === 'application/xml' ||
           type === 'application/rtf';
  };

  const shouldCaptureTextContent = isPlainTextSource(document) && (!document.content || !document.content.trim());

  useEffect(() => {
    setPdfPreviewFailed(false);
    setImagePreviewFailed(false);
  }, [document.id]);

  useEffect(() => {
    let isActive = true;
    const objectUrls: string[] = [];

    const convertToObjectUrl = async (
      source?: string | null,
      { captureTextContent = false }: { captureTextContent?: boolean } = {}
    ): Promise<{ url: string; textContent?: string } | null> => {
      if (!source) return null;

      if (!source.startsWith("data:")) {
        if (captureTextContent) {
          try {
            const response = await fetch(source);
            const text = await response.text();
            return { url: source, textContent: text };
          } catch (error) {
            console.error("Failed to fetch text content from URL", error);
          }
        }
        return { url: source };
      }

      const commaIndex = source.indexOf(",");
      if (commaIndex === -1) {
        return null;
      }

      const metadata = source.substring(0, commaIndex);
      const dataPortion = source.substring(commaIndex + 1);
      const isBase64 = metadata.includes(";base64");
      const mimeMatch = metadata.match(/^data:([^;]+)/);
      const mimeType = mimeMatch?.[1] || "application/octet-stream";

      try {
        let blob: Blob;
        let textContent: string | undefined;

        if (isBase64) {
          const binaryString = atob(dataPortion.replace(/\s/g, ""));
          const len = binaryString.length;
          const bytes = new Uint8Array(len);
          for (let i = 0; i < len; i += 1) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          blob = new Blob([bytes], { type: mimeType });

          if (captureTextContent) {
            try {
              const arrayBuffer = await blob.arrayBuffer();
              const decoder = new TextDecoder();
              textContent = decoder.decode(arrayBuffer);
            } catch (error) {
              console.error("Failed to decode text content from base64 data", error);
            }
          }
        } else {
          const decoded = decodeURIComponent(dataPortion);
          blob = new Blob([decoded], { type: mimeType });
          if (captureTextContent) {
            textContent = decoded;
          }
        }

        const objectUrl = URL.createObjectURL(blob);
        objectUrls.push(objectUrl);

        return textContent !== undefined
          ? { url: objectUrl, textContent }
          : { url: objectUrl };
      } catch (error) {
        console.error("Failed to convert data URL to object URL", error);
        return null;
      }
    };

    setFileViewerUrl(null);
    setPreviewViewerUrl(null);
    setDerivedTextContent(null);

    (async () => {
      const [fileResult, previewResult] = await Promise.all([
        convertToObjectUrl(document.fileUrl ?? null, {
          captureTextContent: shouldCaptureTextContent,
        }),
        convertToObjectUrl(document.previewImageUrl ?? null),
      ]);

      if (isActive) {
        setFileViewerUrl(fileResult?.url ?? null);
        setPreviewViewerUrl(previewResult?.url ?? null);
        if (fileResult?.textContent) {
          setDerivedTextContent(fileResult.textContent);
        }
      }
    })();

    return () => {
      isActive = false;
      objectUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [
    document.fileUrl,
    document.previewImageUrl,
    document.content,
    document.type,
    document.id,
    shouldCaptureTextContent,
  ]);

  const effectiveFileUrl = fileViewerUrl ?? document.fileUrl ?? undefined;
  const effectivePreviewUrl = previewViewerUrl ?? document.previewImageUrl ?? undefined;

  const renderPDFContent = () => {
    const previewUrl = pdfPreviewFailed ? undefined : effectivePreviewUrl;
    const fileUrl = effectiveFileUrl;

    // If we have a preview image from processing, show it
    if (previewUrl) {
      return (
        <div className="flex items-center justify-center h-full bg-gray-100">
          <img
            src={previewUrl}
            alt={`Preview of ${documentName}`}
            className="max-w-full max-h-full object-contain border shadow-lg rounded"
            style={{
              transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
              transformOrigin: 'center center'
            }}
            onError={(e) => {
              console.error('PDF preview image failed to load');
              e.currentTarget.style.display = 'none';
              setPdfPreviewFailed(true);
            }}
          />
        </div>
      );
    }

    if (fileUrl && !pdfPreviewFailed) {
      return (
        <div className="h-full bg-gray-100 flex flex-col">
          <div className="bg-white border-b px-4 py-2 text-sm text-gray-600 flex justify-between items-center">
            <span>Viewing PDF: {documentName}</span>
            <span>{document.pages} pages • {document.size}</span>
          </div>
          <iframe
            src={fileUrl}
            title={documentName}
            className="flex-1 w-full"
            style={{ border: 'none' }}
          />
        </div>
      );
    }

    // If we have extracted text content, show it in a document-like format
    if (document.content && document.content.trim() && !document.content.includes('could not be processed')) {
      return (
        <div className="h-full overflow-auto bg-white">
          <div className="max-w-4xl mx-auto p-8">
            <div className="flex items-center mb-6 pb-4 border-b">
              <FileText className="h-6 w-6 text-red-600 mr-3" />
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{documentName}</h2>
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
      <div className="flex items-center justify-center h-full text-center bg-gray-50">
        <div className="max-w-md">
          <FileText className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">PDF Document</h3>
          <p className="text-sm text-gray-600 mb-4">{documentName}</p>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center justify-center mb-3">
              <AlertCircle className="h-5 w-5 text-yellow-600 mr-2" />
              <p className="text-sm text-yellow-800 font-medium">
                PDF Preview Not Available
              </p>
            </div>
            <p className="text-xs text-yellow-700 mb-3">
              The PDF content could not be processed for preview. This may happen with:
            </p>
            <ul className="text-xs text-yellow-700 text-left list-disc list-inside space-y-1 mb-4">
              <li>Scanned documents or image-based PDFs</li>
              <li>Password-protected files</li>
              <li>Corrupted or unusual PDF formats</li>
            </ul>
            {fileUrl && (
              <Button
                asChild
                size="sm"
                className="mb-3"
              >
                <a href={fileUrl} target="_blank" rel="noopener noreferrer">
                  Open Original PDF
                </a>
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.reload()}
              className="text-yellow-800 border-yellow-300 hover:bg-yellow-100"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  };

  const renderImageContent = () => {
    const previewSource = imagePreviewFailed
      ? undefined
      : (effectivePreviewUrl || effectiveFileUrl);

    if (previewSource) {
      return (
        <div className="flex items-center justify-center h-full bg-gray-100">
          <img
            src={previewSource}
            alt={documentName}
            className="max-w-full max-h-full object-contain border shadow-lg rounded"
            style={{
              transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
              transformOrigin: 'center center'
            }}
            onError={(e) => {
              console.error('Image failed to load');
              e.currentTarget.style.display = 'none';
              setImagePreviewFailed(true);
            }}
          />
        </div>
      );
    }
    
    // Show image info if no URL available but we have content
    const textContent = document.content?.trim()
      ? document.content
      : derivedTextContent ?? undefined;

    if (textContent) {
      return (
        <div className="h-full overflow-auto bg-white">
          <div className="max-w-4xl mx-auto p-8">
            <div className="flex items-center mb-6 pb-4 border-b">
              <Image className="h-6 w-6 text-blue-600 mr-3" />
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{documentName}</h2>
                <p className="text-sm text-gray-600">{document.type} • {document.size}</p>
              </div>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <pre className="text-sm text-blue-800 whitespace-pre-wrap">{textContent}</pre>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="flex items-center justify-center h-full text-center bg-gray-50">
        <div className="max-w-md">
          <Image className="h-16 w-16 text-blue-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Image Document</h3>
          <p className="text-sm text-gray-600 mb-4">{documentName}</p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800 mb-3">
              This image document has been uploaded successfully.
            </p>
            <p className="text-xs text-blue-700">
              Size: {document.size} • Type: {document.type}
            </p>
          </div>
        </div>
      </div>
    );
  };

  const renderTextContent = () => {
    const textContent = document.content?.trim()
      ? document.content
      : derivedTextContent ?? undefined;

    if (textContent) {
      return (
        <div className="h-full overflow-auto bg-white">
          <div className="max-w-4xl mx-auto p-8">
            <div className="flex items-center mb-6 pb-4 border-b">
              <FileText className="h-6 w-6 text-green-600 mr-3" />
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{documentName}</h2>
                <p className="text-sm text-gray-600">{document.type} • {document.size}</p>
              </div>
            </div>
            <div 
              className="bg-gray-50 border rounded-lg p-4 overflow-auto max-h-96"
              style={{
                fontSize: `${Math.max(zoom / 100, 0.5)}em`,
                transform: `rotate(${rotation}deg)`,
                transformOrigin: 'top left'
              }}
            >
              <pre className="text-gray-800 leading-relaxed whitespace-pre-wrap font-mono text-sm">
                {textContent}
              </pre>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const renderGenericContent = () => {
    return (
      <div className="h-full overflow-auto bg-white">
        <div className="max-w-4xl mx-auto p-8">
          <div className="flex items-center mb-6 pb-4 border-b">
            <File className="h-6 w-6 text-gray-600 mr-3" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{documentName}</h2>
              <p className="text-sm text-gray-600">{document.type} • {document.size}</p>
            </div>
          </div>
          
          {(document.content && document.content.trim()) || derivedTextContent ? (
            <div
              className="bg-gray-50 border rounded-lg p-4"
              style={{
                fontSize: `${Math.max(zoom / 100, 0.5)}em`,
                transform: `rotate(${rotation}deg)`,
                transformOrigin: 'top left'
              }}
            >
              <pre className="text-gray-800 leading-relaxed whitespace-pre-wrap text-sm">
                {(document.content && document.content.trim()) || derivedTextContent}
              </pre>
            </div>
          ) : (
            <div className="text-center text-gray-500 bg-gray-50 rounded-lg p-8">
              <div className="w-24 h-32 bg-gray-200 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <FileIcon className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium mb-2">Document Available</h3>
              <p className="text-sm mb-4">
                This document has been uploaded successfully and is ready for download.
              </p>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 inline-block">
                <p className="text-sm text-green-800 mb-2">
                  File Information:
                </p>
                <p className="text-xs text-green-700">
                  Type: {document.type}<br/>
                  Size: {document.size}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Determine which renderer to use based on document type
  if (isPDF(document)) {
    return renderPDFContent();
  }

  if (isImage(document)) {
    return renderImageContent();
  }

  if (isTextDocument(document)) {
    const textContent = renderTextContent();
    if (textContent) return textContent;
  }

  // Default to generic content renderer for all other types
  return renderGenericContent();
};

export default DocumentRenderer;
