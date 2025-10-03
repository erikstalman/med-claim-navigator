
import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, FileText, Download, Eye, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getDataService } from "@/services/dataService";
import { authService } from "@/services/authService";
import { Document, User } from "@/types";

interface DocumentListProps {
  caseId: string;
}

const DocumentList = ({ caseId }: DocumentListProps) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const navigate = useNavigate();

  const loadDocuments = useCallback(() => {
    try {
      const dataService = getDataService();
      if (!dataService) {
        setDocuments([]);
        return;
      }

      const caseDocuments = dataService.getDocuments().filter(doc => doc.caseId === caseId);
      console.log(`Loading documents for case: ${caseId} Found: ${caseDocuments.length}`);
      setDocuments(caseDocuments);
    } catch (error) {
      console.error('Error loading documents:', error);
      setDocuments([]);
    }
  }, [caseId]);

  useEffect(() => {
    const user = authService.getCurrentUser();
    setCurrentUser(user);
    loadDocuments();
  }, [caseId, loadDocuments]);

  const handleViewDocument = (documentId: string) => {
    navigate(`/document/${documentId}`);
  };

  const handleDeleteDocument = (documentId: string) => {
    if (currentUser?.role === 'admin') {
      try {
        const dataService = getDataService();
        if (!dataService) {
          console.warn('DataService is not available in the current environment.');
          return;
        }

        dataService.deleteDocument(documentId);
        loadDocuments(); // Refresh the list
        
        // Log the activity
        authService.logActivity(
          currentUser.id,
          currentUser.name,
          currentUser.role,
          'DELETE_DOCUMENT',
          caseId,
          undefined,
          `Deleted document: ${documentId}`
        );
      } catch (error) {
        console.error('Error deleting document:', error);
      }
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "medical": return "bg-blue-100 text-blue-800";
      case "imaging": return "bg-purple-100 text-purple-800";
      case "legal": return "bg-red-100 text-red-800";
      case "treatment": return "bg-green-100 text-green-800";
      case "patient-claim": return "bg-yellow-100 text-yellow-800";
      case "administrative": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  // Safe filtering with proper null/undefined handling
  const filteredDocuments = documents.filter(doc => {
    if (!searchTerm.trim()) return true;
    
    // Ensure document name is a valid string before calling toLowerCase
    const docName = doc.name;
    const safeName = (typeof docName === 'string' ? docName : String(docName || 'unknown')).toLowerCase();
    const safeSearchTerm = searchTerm.toLowerCase();
    
    return safeName.includes(safeSearchTerm) || 
           doc.category.toLowerCase().includes(safeSearchTerm) ||
           doc.type.toLowerCase().includes(safeSearchTerm);
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <FileText className="h-5 w-5" />
          <span>Case Documents</span>
          <Badge variant="outline">{documents.length} files</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search documents by name, category, or type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="space-y-4">
          {filteredDocuments.map((document) => (
            <Card key={document.id} className="hover:shadow-sm transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <FileText className="h-4 w-4 text-gray-500" />
                      <h3 className="font-medium text-gray-900">
                        {typeof document.name === 'string' ? document.name : String(document.name || 'Unknown Document')}
                      </h3>
                      <Badge className={getCategoryColor(document.category)}>
                        {document.category}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Type:</span>
                        <div>{document.type}</div>
                      </div>
                      <div>
                        <span className="font-medium">Size:</span>
                        <div>{document.size}</div>
                      </div>
                      <div>
                        <span className="font-medium">Pages:</span>
                        <div>{document.pages || 1}</div>
                      </div>
                      <div>
                        <span className="font-medium">Uploaded:</span>
                        <div>{document.uploadDate}</div>
                      </div>
                    </div>
                    {document.uploadedBy && (
                      <div className="text-sm text-gray-500 mt-2">
                        Uploaded by: {document.uploadedBy}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDocument(document.id)}
                      className="flex items-center space-x-1"
                    >
                      <Eye className="h-4 w-4" />
                      <span>View</span>
                    </Button>
                    {document.fileUrl && (
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                        className="flex items-center space-x-1"
                      >
                        <a href={document.fileUrl} download target="_blank" rel="noopener noreferrer">
                          <Download className="h-4 w-4" />
                          <span>Download</span>
                        </a>
                      </Button>
                    )}
                    {currentUser?.role === 'admin' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteDocument(document.id)}
                        className="flex items-center space-x-1 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span>Delete</span>
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredDocuments.length === 0 && documents.length > 0 && (
          <div className="text-center py-8 text-gray-500">
            <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No documents match your search criteria.</p>
          </div>
        )}

        {documents.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No documents have been uploaded for this case yet.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DocumentList;
