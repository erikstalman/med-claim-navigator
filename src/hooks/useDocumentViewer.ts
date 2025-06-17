
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { dataService } from "@/services/dataService";
import { Document } from "@/types";

export const useDocumentViewer = () => {
  const { documentId } = useParams();
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

  return { document, loading };
};
