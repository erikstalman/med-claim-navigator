import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Upload, FileText, X, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Document } from "@/types";
import { dataService } from "@/services/dataService";
import { DocumentProcessor } from "@/utils/documentProcessor";
import { authService } from "@/services/authService";

interface DocumentUploadProps {
  caseId: string;
  onDocumentUploaded: (document: Document) => void;
}

interface UploadFile extends File {
  id: string;
  category: string;
  progress: number;
  status: 'pending' | 'processing' | 'completed' | 'error';
  error?: string;
}

const DocumentUpload = ({ caseId, onDocumentUploaded }: DocumentUploadProps) => {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    console.log('Files dropped:', acceptedFiles.map(f => ({
      name: f.name,
      type: f.type,
      size: f.size,
      lastModified: f.lastModified
    })));
    
    const newFiles: UploadFile[] = acceptedFiles.map(file => {
      // Preserve the original File prototype so we retain browser File APIs
      const fileWithMeta = Object.assign(file, {
        id: Math.random().toString(36).substr(2, 9),
        category: 'medical',
        progress: 0,
        status: 'pending' as UploadFile['status']
      });

      return fileWithMeta as UploadFile;
    });
    
    setFiles(prev => [...prev, ...newFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp', '.tiff', '.svg'],
      'text/plain': ['.txt'],
      'application/rtf': ['.rtf'],
      'text/csv': ['.csv'],
      'application/json': ['.json'],
      'application/xml': ['.xml'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-powerpoint': ['.ppt'],
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
      'application/zip': ['.zip'],
      'application/x-rar-compressed': ['.rar'],
      'application/x-7z-compressed': ['.7z']
    },
    maxSize: 50 * 1024 * 1024, // 50MB
    onDropRejected: (rejectedFiles) => {
      rejectedFiles.forEach(({ file, errors }) => {
        errors.forEach(error => {
          if (error.code === 'file-too-large') {
            toast.error(`File "${file.name}" is too large. Maximum size is 50MB.`);
          } else {
            toast.error(`File "${file.name}" was rejected: ${error.message}`);
          }
        });
      });
    }
  });

  const updateFileStatus = (fileId: string, updates: Partial<UploadFile>) => {
    setFiles(prev => prev.map(file => 
      file.id === fileId ? { ...file, ...updates } : file
    ));
  };

  const removeFile = (fileId: string) => {
    setFiles(prev => prev.filter(file => file.id !== fileId));
  };

  const updateFileCategory = (fileId: string, category: string) => {
    setFiles(prev => prev.map(file => 
      file.id === fileId ? { ...file, category } : file
    ));
  };

  const processAndUploadFile = async (file: UploadFile) => {
    try {
      // Validate file first - make sure we have valid file properties
      if (!file || !file.name || file.size === 0) {
        throw new Error('Invalid file: missing name or empty file');
      }

      const fileName = file.name;
      const fileSize = file.size;
      const fileType = file.type || 'application/octet-stream';
      
      console.log('Starting to process file:', {
        name: fileName,
        size: fileSize,
        type: fileType,
        lastModified: file.lastModified
      });
      
      updateFileStatus(file.id, { status: 'processing', progress: 25 });
      
      // Process the document to extract content - pass the actual File object
      const processedDoc = await DocumentProcessor.processDocument(file);
      console.log('Document processed successfully:', {
        name: fileName,
        contentLength: processedDoc.content?.length,
        hasImage: !!processedDoc.imageDataUrl,
        pageCount: processedDoc.pageCount,
        detectedType: processedDoc.detectedType
      });
      
      updateFileStatus(file.id, { progress: 75 });

      // Get current user info
      const currentUser = authService.getCurrentUser();
      
      // Create document record with proper type and size calculation
      const sizeInKB = fileSize > 0 ? (fileSize / 1024).toFixed(2) : '0.00';
      
      const document: Document = {
        id: `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: fileName, // Use the actual file name
        type: processedDoc.detectedType || fileType,
        uploadDate: new Date().toLocaleDateString(),
        uploadedBy: currentUser?.name || 'Current User',
        uploadedById: currentUser?.id || '1',
        size: `${sizeInKB} KB`,
        pages: processedDoc.pageCount || 1,
        category: file.category,
        caseId: caseId,
        filePath: `documents/${caseId}/${fileName}`,
        content: processedDoc.content,
        fileUrl: processedDoc.fileDataUrl,
        previewImageUrl: processedDoc.previewImageUrl || processedDoc.imageDataUrl
      };

      console.log('Saving document to dataService:', {
        id: document.id,
        name: document.name,
        type: document.type,
        size: document.size
      });
      
      // Save to data service
      dataService.addDocument(document);
      
      updateFileStatus(file.id, { status: 'completed', progress: 100 });
      onDocumentUploaded(document);
      
      toast.success(`Document "${fileName}" uploaded and processed successfully`);
    } catch (error) {
      console.error('Error processing document:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to process document';
      updateFileStatus(file.id, { 
        status: 'error', 
        error: errorMessage
      });
      toast.error(`Failed to upload "${file.name || 'document'}": ${errorMessage}`);
    }
  };

  const handleUploadAll = async () => {
    const pendingFiles = files.filter(file => file.status === 'pending');
    if (pendingFiles.length === 0) {
      toast.info('No files to upload');
      return;
    }

    setIsUploading(true);
    
    try {
      // Process files sequentially to avoid overwhelming the browser
      for (const file of pendingFiles) {
        await processAndUploadFile(file);
        // Small delay between files to prevent browser blocking
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    } catch (error) {
      console.error('Error during batch upload:', error);
      toast.error('Some files failed to upload');
    } finally {
      setIsUploading(false);
    }
  };

  const getStatusIcon = (status: UploadFile['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      case 'processing':
        return <div className="h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />;
      default:
        return <FileText className="h-4 w-4 text-gray-400" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Documents</CardTitle>
        <CardDescription>
          Upload any file type including PDFs, images, Word documents, text files, spreadsheets, and more. All files support preview and content extraction where possible.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Dropzone */}
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
            isDragActive 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <input {...getInputProps()} />
          <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
          {isDragActive ? (
            <p className="text-blue-600">Drop the files here...</p>
          ) : (
            <div>
              <p className="text-gray-600 mb-1">
                Drag & drop files here, or click to select
              </p>
              <p className="text-sm text-gray-500">
                Supports all file types including PDFs, documents, images, text files, and more (max 50MB each)
              </p>
            </div>
          )}
        </div>

        {/* File List */}
        {files.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium">Selected Files ({files.length})</h4>
            <div className="max-h-64 overflow-y-auto space-y-2">
              {files.map((file) => (
                <div key={file.id} className="flex items-center space-x-3 p-3 border rounded-lg bg-white">
                  {getStatusIcon(file.status)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-sm truncate">{file.name}</span>
                      <span className="text-xs text-gray-500 flex-shrink-0">
                        ({formatFileSize(file.size)})
                      </span>
                    </div>
                    {file.type && (
                      <p className="text-xs text-gray-400 truncate">{file.type}</p>
                    )}
                    {file.status === 'processing' && (
                      <Progress value={file.progress} className="mt-1" />
                    )}
                    {file.status === 'error' && file.error && (
                      <p className="text-xs text-red-600 mt-1">{file.error}</p>
                    )}
                  </div>
                  <div className="flex items-center space-x-2 flex-shrink-0">
                    <Select
                      value={file.category}
                      onValueChange={(value) => updateFileCategory(file.id, value)}
                      disabled={file.status !== 'pending'}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="medical">Medical</SelectItem>
                        <SelectItem value="imaging">Imaging</SelectItem>
                        <SelectItem value="legal">Legal</SelectItem>
                        <SelectItem value="treatment">Treatment</SelectItem>
                        <SelectItem value="patient-claim">Patient Claim</SelectItem>
                        <SelectItem value="administrative">Administrative</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(file.id)}
                      disabled={file.status === 'processing'}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upload Button */}
        {files.some(file => file.status === 'pending') && (
          <Button 
            onClick={handleUploadAll} 
            disabled={isUploading}
            className="w-full"
          >
            {isUploading ? 'Processing Documents...' : `Upload ${files.filter(f => f.status === 'pending').length} Document(s)`}
          </Button>
        )}

        {/* Summary */}
        {files.length > 0 && (
          <div className="text-xs text-gray-500 pt-2 border-t">
            Total: {files.length} files • 
            Completed: {files.filter(f => f.status === 'completed').length} • 
            Pending: {files.filter(f => f.status === 'pending').length} • 
            Errors: {files.filter(f => f.status === 'error').length}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DocumentUpload;
