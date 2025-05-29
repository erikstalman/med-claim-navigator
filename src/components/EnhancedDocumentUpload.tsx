
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Upload, X, FileText, CheckCircle, Brain, AlertCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabaseService } from "@/services/supabaseService";
import { toast } from "sonner";
import AIDocumentAnalyzer from "./AIDocumentAnalyzer";

interface EnhancedDocumentUploadProps {
  caseId: string;
  onDocumentUploaded?: (document: any) => void;
}

const EnhancedDocumentUpload = ({ caseId, onDocumentUploaded }: EnhancedDocumentUploadProps) => {
  const { profile } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [documentType, setDocumentType] = useState('');
  const [description, setDescription] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadedDocument, setUploadedDocument] = useState<any>(null);
  const [documentContent, setDocumentContent] = useState('');

  const documentTypes = [
    { value: 'medical', label: 'Medical Records' },
    { value: 'imaging', label: 'Imaging/X-rays' },
    { value: 'legal', label: 'Legal Documents' },
    { value: 'treatment', label: 'Treatment Plans' },
    { value: 'patient-claim', label: 'Patient Claims' },
    { value: 'administrative', label: 'Administrative' },
    { value: 'other', label: 'Other' }
  ];

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...selectedFiles]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (e.dataTransfer.files) {
      const droppedFiles = Array.from(e.dataTransfer.files);
      setFiles(prev => [...prev, ...droppedFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const uploadDocuments = async () => {
    if (!profile) {
      toast.error('Please log in to upload documents');
      return;
    }

    if (files.length === 0 || !documentType) {
      toast.error('Please select files and document type');
      return;
    }

    setUploading(true);
    
    try {
      // Process files one by one to avoid duplicates
      for (const file of files) {
        console.log(`Uploading file: ${file.name}`);
        
        // Read file content for AI analysis
        let content = '';
        if (file.type === 'text/plain') {
          content = await file.text();
        } else if (file.type === 'application/pdf') {
          // For PDF files, we'd need a PDF parser, for now just store metadata
          content = `PDF Document: ${file.name} (${file.size} bytes)`;
        }

        const document = await supabaseService.uploadDocument(
          file, 
          caseId, 
          documentType, 
          description
        );

        console.log(`Successfully uploaded: ${file.name}`);
        
        // Store the last uploaded document for AI analysis
        setUploadedDocument(document);
        setDocumentContent(content);
        
        // Log activity
        await supabaseService.logActivity({
          userId: profile.id,
          userName: profile.name,
          userRole: profile.role,
          action: 'UPLOAD_DOCUMENTS',
          caseId: caseId,
          caseName: `Case ${caseId}`,
          details: `Uploaded document: ${file.name} (${documentType})`,
          ipAddress: '127.0.0.1'
        });

        onDocumentUploaded?.(document);
      }

      toast.success(`Successfully uploaded ${files.length} document(s)`);
      
      // Reset form
      setFiles([]);
      setDocumentType('');
      setDescription('');
      
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(`Upload failed: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleUploadAreaClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Upload className="h-5 w-5" />
            <span>Enhanced Document Upload</span>
          </CardTitle>
          <CardDescription>
            Upload documents with AI-powered analysis for case {caseId}
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
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.tiff,.txt"
                onChange={handleFileSelect}
                className="hidden"
              />
              <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm text-gray-600">
                {isDragOver ? 'Drop files here' : 'Click to upload or drag and drop'}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                PDF, DOC, DOCX, JPG, PNG, TIFF, TXT up to 10MB each
              </p>
            </div>
          </div>

          {files.length > 0 && (
            <div className="space-y-2">
              <Label>Selected Files ({files.length})</Label>
              <div className="max-h-40 overflow-y-auto space-y-2">
                {files.map((file, index) => (
                  <div key={`${file.name}-${index}`} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
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

          {!profile && (
            <div className="flex items-center space-x-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <span className="text-sm text-yellow-800">Please log in to upload documents</span>
            </div>
          )}
        </CardContent>
      </Card>

      {uploadedDocument && documentContent && (
        <AIDocumentAnalyzer
          documentId={uploadedDocument.id}
          documentContent={documentContent}
          documentType={uploadedDocument.type}
          caseContext={`Medical claim case ${caseId}`}
          onAnalysisComplete={(analysis) => {
            console.log('AI Analysis completed:', analysis);
          }}
        />
      )}
    </div>
  );
};

export default EnhancedDocumentUpload;
