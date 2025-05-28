
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { FileText, Download, Eye, Search, Calendar, User, Upload } from "lucide-react";
import { dataService } from "@/services/dataService";
import { Document } from "@/types";
import DocumentUpload from "./DocumentUpload";

interface DocumentListProps {
  caseId: string;
}

const DocumentList = ({ caseId }: DocumentListProps) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [documents, setDocuments] = useState<Document[]>([]);
  const [showUpload, setShowUpload] = useState(false);

  useEffect(() => {
    loadDocuments();
  }, [caseId]);

  const loadDocuments = () => {
    const allDocuments = dataService.getDocuments();
    const caseDocuments = allDocuments.filter(doc => doc.caseId === caseId);
    setDocuments(caseDocuments);
  };

  const handleDocumentUploaded = (newDocument: Document) => {
    dataService.addDocument(newDocument);
    loadDocuments();
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "medical": return "bg-blue-100 text-blue-800";
      case "imaging": return "bg-purple-100 text-purple-800";
      case "legal": return "bg-red-100 text-red-800";
      case "treatment": return "bg-green-100 text-green-800";
      case "patient-claim": return "bg-orange-100 text-orange-800";
      case "administrative": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getCategoryIcon = (category: string) => {
    return <FileText className="h-4 w-4" />;
  };

  const filteredDocuments = documents.filter(doc =>
    doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Case Documents</CardTitle>
              <CardDescription>
                All documents related to case {caseId} ({filteredDocuments.length} documents)
              </CardDescription>
            </div>
            <Button onClick={() => setShowUpload(!showUpload)}>
              <Upload className="h-4 w-4 mr-2" />
              {showUpload ? 'Hide Upload' : 'Upload Documents'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {showUpload && (
            <div className="mb-6">
              <DocumentUpload caseId={caseId} onDocumentUploaded={handleDocumentUploaded} />
            </div>
          )}

          <div className="relative mb-4">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search documents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="space-y-4">
            {filteredDocuments.map((doc) => (
              <Card key={doc.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <div className="p-2 bg-blue-50 rounded-lg">
                        {getCategoryIcon(doc.category)}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 mb-1">
                          {doc.name}
                        </h4>
                        <div className="text-sm text-gray-600 space-y-1">
                          <div className="flex items-center space-x-4">
                            <span>{doc.type}</span>
                            <span>•</span>
                            <span>{doc.pages} pages</span>
                            <span>•</span>
                            <span>{doc.size}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-xs">
                            <Calendar className="h-3 w-3" />
                            <span>Uploaded {doc.uploadDate}</span>
                            <span>•</span>
                            <User className="h-3 w-3" />
                            <span>{doc.uploadedBy}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge className={getCategoryColor(doc.category)}>
                        {doc.category}
                      </Badge>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/document/${doc.id}`)}
                          className="flex items-center space-x-1"
                        >
                          <Eye className="h-4 w-4" />
                          <span>View</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex items-center space-x-1"
                        >
                          <Download className="h-4 w-4" />
                          <span>Download</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredDocuments.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No documents found for this case.</p>
              {!showUpload && (
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => setShowUpload(true)}
                >
                  Upload Documents
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DocumentList;
