
import { useNavigate } from "react-router-dom";
import AIDocumentChat from "@/components/AIDocumentChat";
import DocumentHeader from "@/components/DocumentHeader";
import DocumentRenderer from "@/components/DocumentRenderer";
import DocumentViewerLayout from "@/components/DocumentViewerLayout";
import DocumentNotFound from "@/components/DocumentNotFound";
import DocumentLoadingState from "@/components/DocumentLoadingState";
import { useDocumentViewer } from "@/hooks/useDocumentViewer";
import { useDocumentControls } from "@/hooks/useDocumentControls";

const DocumentViewer = () => {
  const navigate = useNavigate();
  const { document, loading } = useDocumentViewer();
  const { zoom, rotation, handleZoomIn, handleZoomOut, handleRotate } = useDocumentControls();

  const handleGoBack = () => navigate(`/case/${document?.caseId}`);

  if (loading) {
    return <DocumentLoadingState />;
  }

  if (!document) {
    return <DocumentNotFound onGoBack={() => navigate(-1)} />;
  }

  return (
    <DocumentViewerLayout
      header={
        <DocumentHeader
          document={document}
          zoom={zoom}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onRotate={handleRotate}
          onGoBack={handleGoBack}
        />
      }
      documentViewer={
        <DocumentRenderer
          document={document}
          zoom={zoom}
          rotation={rotation}
        />
      }
      sidebar={<AIDocumentChat caseId={document.caseId} />}
    />
  );
};

export default DocumentViewer;
