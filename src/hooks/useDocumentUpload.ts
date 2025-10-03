
import { useState } from "react";
import { toast } from "sonner";
import { Document } from "@/types";
import { getDataService } from "@/services/dataService";
import { authService } from "@/services/authService";
import { validateFiles } from "@/utils/fileValidation";
import { readFileContent } from "@/utils/documentContent";

export const useDocumentUpload = (caseId: string, onDocumentUploaded?: (newDocument: Document) => void) => {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [documentType, setDocumentType] = useState("");
  const [description, setDescription] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);

  const documentTypes = [
    { value: "medical", label: "Medical Report" },
    { value: "imaging", label: "Diagnostic Image" },
    { value: "legal", label: "Legal Document" },
    { value: "treatment", label: "Treatment Report" },
    { value: "patient-claim", label: "Patient Claim" },
    { value: "administrative", label: "Administrative" },
    { value: "other", label: "Other" }
  ];

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    const validFiles = validateFiles(selectedFiles);
    setFiles(prev => [...prev, ...validFiles]);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    const validFiles = validateFiles(droppedFiles);
    
    if (validFiles.length > 0) {
      setFiles(prev => [...prev, ...validFiles]);
      toast.success(`${validFiles.length} file(s) added successfully`);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const uploadDocuments = async () => {
    if (files.length === 0 || !documentType) {
      toast.error("Please select files and document type");
      return;
    }

    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      toast.error("User not authenticated");
      return;
    }

    setUploading(true);

    try {
      const dataService = getDataService();
      if (!dataService) {
        toast.error("Document storage is unavailable in the current environment.");
        return;
      }

      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const uploadedDocuments: Document[] = [];
      
      for (let index = 0; index < files.length; index++) {
        const file = files[index];
        
        // Simulate reading file content
        const fileContent = await readFileContent(file);
        
        const newDocument: Document = {
          id: `DOC${Date.now()}_${index}`,
          name: file.name.replace(/\.[^/.]+$/, ""),
          type: documentTypes.find(t => t.value === documentType)?.label || "Document",
          uploadDate: new Date().toISOString().split('T')[0],
          uploadedBy: currentUser.name,
          uploadedById: currentUser.id,
          size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
          pages: Math.floor(Math.random() * 20) + 1,
          category: documentType,
          caseId: caseId,
          filePath: `/uploads/${caseId}/${file.name}`,
          content: fileContent
        };

        // Save to data service
        dataService.addDocument(newDocument);
        uploadedDocuments.push(newDocument);
        
        console.log("Document saved to dataService:", newDocument);
        
        // Call the callback for each document
        onDocumentUploaded?.(newDocument);
      }
      
      // Log activity
      authService.logActivity(
        currentUser.id,
        currentUser.name,
        currentUser.role,
        'UPLOAD_DOCUMENTS',
        caseId,
        undefined,
        `Uploaded ${files.length} document(s) to case ${caseId}`
      );
      
      toast.success(`${files.length} document(s) uploaded successfully to case ${caseId}`);
      setFiles([]);
      setDocumentType("");
      setDescription("");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload documents");
    } finally {
      setUploading(false);
    }
  };

  return {
    files,
    uploading,
    documentType,
    setDocumentType,
    description,
    setDescription,
    isDragOver,
    documentTypes,
    handleFileSelect,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    removeFile,
    uploadDocuments
  };
};
