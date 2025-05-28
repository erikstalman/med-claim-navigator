import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Upload, X, FileText, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { Document } from "@/types";

interface DocumentUploadProps {
  caseId: string;
  onDocumentUploaded?: (newDocument: Document) => void;
}

const DocumentUpload = ({ caseId, onDocumentUploaded }: DocumentUploadProps) => {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [documentType, setDocumentType] = useState("");
  const [description, setDescription] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const validateFiles = (fileList: File[]) => {
    const validTypes = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png', '.tiff'];
    const validFiles = fileList.filter(file => {
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
      const isValidType = validTypes.includes(fileExtension);
      const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB limit
      
      if (!isValidType) {
        toast.error(`${file.name}: Invalid file type. Allowed: PDF, DOC, DOCX, JPG, PNG, TIFF`);
        return false;
      }
      
      if (!isValidSize) {
        toast.error(`${file.name}: File too large. Maximum size: 10MB`);
        return false;
      }
      
      return true;
    });

    return validFiles;
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

    setUploading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      files.forEach((file, index) => {
        const newDocument: Document = {
          id: `DOC${Date.now() + index}`,
          name: file.name.replace(/\.[^/.]+$/, ""),
          type: documentTypes.find(t => t.value === documentType)?.label || "Document",
          uploadDate: new Date().toISOString().split('T')[0],
          uploadedBy: "Admin User",
          uploadedById: "current-user-id",
          size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
          pages: Math.floor(Math.random() * 20) + 1,
          category: documentType,
          caseId: caseId,
          filePath: `/uploads/${caseId}/${file.name}`,
          content: `Content of ${file.name} - extracted text would go here`
        };

        console.log("Document uploaded:", newDocument);
        onDocumentUploaded?.(newDocument);
      });
      
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

  const handleUploadAreaClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Upload className="h-5 w-5" />
          <span>Upload Documents</span>
        </CardTitle>
        <CardDescription>
          Upload documents for case {caseId}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label htmlFor="file-upload">Select Files</Label>
          <div 
            className={`mt-2 border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${
              isDragOver 
                ? 'border-blue-400 bg-blue-50' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleUploadAreaClick}
          >
            <input
              ref={fileInputRef}
              id="file-upload"
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.tiff"
              onChange={handleFileSelect}
              className="hidden"
            />
            <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
            <p className="text-sm text-gray-600">
              {isDragOver ? 'Drop files here' : 'Click to upload or drag and drop'}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              PDF, DOC, DOCX, JPG, PNG, TIFF up to 10MB each
            </p>
          </div>
        </div>

        {files.length > 0 && (
          <div className="space-y-2">
            <Label>Selected Files ({files.length})</Label>
            <div className="max-h-40 overflow-y-auto space-y-2">
              {files.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-4 w-4 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium">{file.name}</p>
                      <p className="text-xs text-gray-500">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <Label htmlFor="document-type">Document Type *</Label>
          <Select value={documentType} onValueChange={setDocumentType}>
            <SelectTrigger className="mt-2">
              <SelectValue placeholder="Select document type" />
            </SelectTrigger>
            <SelectContent>
              {documentTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="description">Description (Optional)</Label>
          <Textarea
            id="description"
            placeholder="Add any additional notes about these documents..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-2"
          />
        </div>

        <Button
          onClick={uploadDocuments}
          disabled={uploading || files.length === 0 || !documentType}
          className="w-full"
        >
          {uploading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Uploading to Case {caseId}...
            </>
          ) : (
            <>
              <CheckCircle className="h-4 w-4 mr-2" />
              Upload {files.length} Document{files.length !== 1 ? 's' : ''} to Case {caseId}
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default DocumentUpload;
