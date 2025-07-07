
import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Upload, FileText, X, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Document } from "@/types";
import { dataService } from "@/services/dataService";
import { DocumentProcessor } from "@/utils/documentProcessor";

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
    const newFiles: UploadFile[] = acceptedFiles.map(file => ({
      ...file,
      id: Math.random().toString(36).substr(2, 9),
      category: 'medical',
      progress: 0,
      status: 'pending'
    }));
    
    setFiles(prev => [...prev, ...newFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp'],
      'text/plain': ['.txt']
    },
    maxSize: 10 * 1024 * 1024 // 10MB
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
      updateFileStatus(file.id, { status: 'processing', progress: 25 });
      
      // Process the document to extract content
      const processedDoc = await DocumentProcessor.processDocument(file);
      updateFileStatus(file.id, { progress: 75 });
      
      // Create document record
      const document: Document = {
        id: `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: file.name,
        type: file.type || 'application/octet-stream',
        uploadDate: new Date().toLocaleDateString(),
        uploadedBy: 'Current User', // This should come from auth context
        uploadedById: '1', // This should come from auth context
        size: `${(file.size / 1024).toFixed(2)} KB`,
        pages: processedDoc.pageCount,
        category: file.category as any,
        caseId: caseId,
        filePath: `documents/${caseId}/${file.name}`,
        content: processedDoc.content,
        fileUrl: processedDoc.imageDataUrl // For PDF preview images
      };

      // Save to data service
      dataService.addDocument(document);
      
      updateFileStatus(file.id, { status: 'completed', progress: 100 });
      onDocumentUploaded(document);
      
      toast.success(`Document "${file.name}" uploaded successfully`);
    } catch (error) {
      console.error('Error processing document:', error);
      updateFileStatus(file.id, { 
        status: 'error', 
        error: error instanceof Error ? error.message : 'Failed to process document'
      });
      toast.error(`Failed to upload "${file.name}"`);
    }
  };

  const handleUploadAll = async () => {
    const pendingFiles = files.filter(file => file.status === 'pending');
    if (pendingFiles.length === 0) return;

    setIsUploading(true);
    
    // Process files sequentially to avoid overwhelming the browser
    for (const file of pendingFiles) {
      await processAndUploadFile(file);
    }
    
    setIsUploading(false);
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Documents</CardTitle>
        <CardDescription>
          Upload medical records, images, and other case-related documents
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
                Supports PDF, DOCX, DOC, images, and text files (max 10MB each)
              </p>
            </div>
          )}
        </div>

        {/* File List */}
        {files.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium">Selected Files</h4>
            {files.map((file) => (
              <div key={file.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                {getStatusIcon(file.status)}
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-sm">{file.name}</span>
                    <span className="text-xs text-gray-500">
                      ({(file.size / 1024).toFixed(2)} KB)
                    </span>
                  </div>
                  {file.status === 'processing' && (
                    <Progress value={file.progress} className="mt-1" />
                  )}
                  {file.status === 'error' && file.error && (
                    <p className="text-xs text-red-600 mt-1">{file.error}</p>
                  )}
                </div>
                <div className="flex items-center space-x-2">
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
        )}

        {/* Upload Button */}
        {files.some(file => file.status === 'pending') && (
          <Button 
            onClick={handleUploadAll} 
            disabled={isUploading}
            className="w-full"
          >
            {isUploading ? 'Processing Documents...' : 'Upload All Documents'}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default DocumentUpload;
