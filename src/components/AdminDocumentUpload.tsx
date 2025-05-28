
import { Card, CardContent } from "@/components/ui/card";
import { Upload } from "lucide-react";
import DocumentUpload from "@/components/DocumentUpload";
import DocumentManager from "@/components/DocumentManager";
import { PatientCase, Document } from "@/types";

interface AdminDocumentUploadProps {
  cases: PatientCase[];
  selectedCase: string | null;
  documents: Document[];
  onCaseSelect: (caseId: string) => void;
  onDocumentUploaded: (document: Document) => void;
  onDocumentDeleted: (documentId: string) => void;
}

const AdminDocumentUpload = ({
  cases,
  selectedCase,
  documents,
  onCaseSelect,
  onDocumentUploaded,
  onDocumentDeleted
}: AdminDocumentUploadProps) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div>
        <h2 className="text-xl font-semibold mb-4">Select Case for Document Upload</h2>
        <Card>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {cases.map((case_) => (
                <div
                  key={case_.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedCase === case_.id 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => onCaseSelect(case_.id)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{case_.patientName}</p>
                      <p className="text-sm text-gray-600">Case {case_.id} • {case_.documentsCount} documents</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {selectedCase && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-4">Documents for Selected Case</h3>
            <DocumentManager
              caseId={selectedCase}
              documents={documents}
              onDocumentDeleted={onDocumentDeleted}
            />
          </div>
        )}
      </div>
      
      <div>
        {selectedCase ? (
          <DocumentUpload 
            caseId={selectedCase}
            onDocumentUploaded={onDocumentUploaded}
          />
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600">Select a case to begin uploading documents</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AdminDocumentUpload;
