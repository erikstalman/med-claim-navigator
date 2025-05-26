import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, 
  Filter, 
  Upload, 
  Clock, 
  FileText, 
  BarChart3,
  TrendingUp,
  AlertCircle,
  Plus
} from "lucide-react";
import DocumentUpload from "@/components/DocumentUpload";
import PatientInfoEditor from "@/components/PatientInfoEditor";
import CaseManager from "@/components/CaseManager";
import DocumentManager from "@/components/DocumentManager";

interface PatientCase {
  id: string;
  patientName: string;
  accidentDate: string;
  submissionDate: string;
  status: string;
  priority: string;
  injuryType: string;
  doctorAssigned: string;
  claimAmount: string;
  documentsCount: number;
  evaluationStatus: string;
}

interface Document {
  id: string;
  name: string;
  type: string;
  uploadDate: string;
  uploadedBy: string;
  size: string;
  pages: number;
  category: string;
  caseId: string;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCase, setSelectedCase] = useState<string | null>(null);
  const [isCreatingCase, setIsCreatingCase] = useState(false);

  // Real state management for cases
  const [cases, setCases] = useState<PatientCase[]>([
    {
      id: "C001",
      patientName: "John Anderson",
      accidentDate: "2024-01-15",
      submissionDate: "2024-01-20",
      status: "pending-evaluation",
      priority: "high",
      injuryType: "Motor Vehicle Accident",
      doctorAssigned: "Dr. Michael Smith",
      claimAmount: "$45,000",
      documentsCount: 3,
      evaluationStatus: "not-started"
    },
    {
      id: "C002",
      patientName: "Sarah Johnson",
      accidentDate: "2024-01-18",
      submissionDate: "2024-01-22",
      status: "under-review",
      priority: "medium",
      injuryType: "Workplace Injury",
      doctorAssigned: "Dr. Emily Davis",
      claimAmount: "$28,000",
      documentsCount: 2,
      evaluationStatus: "in-progress"
    },
    {
      id: "C003",
      patientName: "Robert Wilson",
      accidentDate: "2024-01-10",
      submissionDate: "2024-01-25",
      status: "completed",
      priority: "low",
      injuryType: "Slip and Fall",
      doctorAssigned: "Dr. Michael Smith",
      claimAmount: "$15,000",
      documentsCount: 4,
      evaluationStatus: "completed"
    }
  ]);

  // Real state management for documents
  const [documents, setDocuments] = useState<Document[]>([
    {
      id: "DOC001",
      name: "Medical Records - Emergency Room",
      type: "Medical Report",
      uploadDate: "2024-01-20",
      uploadedBy: "Dr. Michael Smith",
      size: "2.3 MB",
      pages: 15,
      category: "medical",
      caseId: "C001"
    },
    {
      id: "DOC002",
      name: "X-Ray Results",
      type: "Diagnostic Image",
      uploadDate: "2024-01-20",
      uploadedBy: "Radiology Dept",
      size: "12.1 MB",
      pages: 8,
      category: "imaging",
      caseId: "C001"
    },
    {
      id: "DOC003",
      name: "Police Report",
      type: "Legal Document",
      uploadDate: "2024-01-18",
      uploadedBy: "SFPD Officer Johnson",
      size: "1.8 MB",
      pages: 6,
      category: "legal",
      caseId: "C001"
    },
    {
      id: "DOC004",
      name: "MRI Scan Results",
      type: "Diagnostic Image",
      uploadDate: "2024-01-22",
      uploadedBy: "Imaging Center",
      size: "45.2 MB",
      pages: 12,
      category: "imaging",
      caseId: "C002"
    },
    {
      id: "DOC005",
      name: "Physical Therapy Assessment",
      type: "Treatment Report",
      uploadDate: "2024-01-25",
      uploadedBy: "PT Clinic",
      size: "3.1 MB",
      pages: 10,
      category: "treatment",
      caseId: "C002"
    }
  ]);

  const handleCaseUpdate = (updatedCase: PatientCase) => {
    setCases(prev => 
      prev.map(case_ => 
        case_.id === updatedCase.id ? {
          ...updatedCase,
          documentsCount: documents.filter(doc => doc.caseId === updatedCase.id).length
        } : case_
      )
    );
  };

  const handleCaseDelete = (caseId: string) => {
    setCases(prev => prev.filter(case_ => case_.id !== caseId));
    setDocuments(prev => prev.filter(doc => doc.caseId !== caseId));
  };

  const handleCreateCase = (newCase: PatientCase) => {
    setCases(prev => [...prev, newCase]);
  };

  const handleDocumentUploaded = (newDocument: Document) => {
    setDocuments(prev => [...prev, newDocument]);
    // Update case document count
    setCases(prev => 
      prev.map(case_ => 
        case_.id === newDocument.caseId 
          ? { ...case_, documentsCount: case_.documentsCount + 1 }
          : case_
      )
    );
  };

  const handleDocumentDeleted = (documentId: string) => {
    const doc = documents.find(d => d.id === documentId);
    if (doc) {
      setDocuments(prev => prev.filter(d => d.id !== documentId));
      // Update case document count
      setCases(prev => 
        prev.map(case_ => 
          case_.id === doc.caseId 
            ? { ...case_, documentsCount: Math.max(0, case_.documentsCount - 1) }
            : case_
        )
      );
    }
  };

  const filteredCases = cases.filter(case_ =>
    case_.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    case_.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate real stats
  const totalCases = cases.length;
  const pendingCases = cases.filter(c => c.status === "pending-evaluation" || c.status === "under-review").length;
  const completedCases = cases.filter(c => c.status === "completed").length;
  const highPriorityCases = cases.filter(c => c.priority === "high").length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Insurance Administration</h1>
            <p className="text-gray-600">Healthcare Claims Management Platform</p>
          </div>
          <div className="flex items-center space-x-4">
            <Button 
              variant="outline"
              onClick={() => navigate("/")}
            >
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="p-6">
        <Tabs defaultValue="cases" className="space-y-6">
          <TabsList>
            <TabsTrigger value="cases" className="flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span>Case Management</span>
            </TabsTrigger>
            <TabsTrigger value="upload" className="flex items-center space-x-2">
              <Upload className="h-4 w-4" />
              <span>Document Upload</span>
            </TabsTrigger>
            <TabsTrigger value="documents" className="flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span>Document Management</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>Analytics</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="cases" className="space-y-6">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Cases</p>
                      <p className="text-2xl font-bold text-gray-900">{totalCases}</p>
                    </div>
                    <FileText className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Pending Review</p>
                      <p className="text-2xl font-bold text-yellow-600">{pendingCases}</p>
                    </div>
                    <Clock className="h-8 w-8 text-yellow-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Completed</p>
                      <p className="text-2xl font-bold text-green-600">{completedCases}</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">High Priority</p>
                      <p className="text-2xl font-bold text-red-600">{highPriorityCases}</p>
                    </div>
                    <AlertCircle className="h-8 w-8 text-red-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Search and Actions */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Case Management</CardTitle>
                    <CardDescription>Manage healthcare claims and track evaluation progress</CardDescription>
                  </div>
                  <Button onClick={() => setIsCreatingCase(true)} className="flex items-center space-x-2">
                    <Plus className="h-4 w-4" />
                    <span>New Case</span>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search cases by patient name or case ID..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Button variant="outline" className="flex items-center space-x-2">
                    <Filter className="h-4 w-4" />
                    <span>Filter</span>
                  </Button>
                </div>

                {/* Cases List */}
                <div className="space-y-4">
                  {filteredCases.map((case_) => (
                    <CaseManager
                      key={case_.id}
                      case_={case_}
                      onUpdate={handleCaseUpdate}
                      onDelete={handleCaseDelete}
                      onSelectForUpload={setSelectedCase}
                    />
                  ))}
                </div>

                {filteredCases.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No cases found matching your search.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="upload" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h2 className="text-xl font-semibold mb-4">Upload Documents</h2>
                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Select Case</CardTitle>
                      <CardDescription>Choose a case to upload documents for</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {cases.map((case_) => (
                          <div
                            key={case_.id}
                            className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                              selectedCase === case_.id 
                                ? 'border-blue-500 bg-blue-50' 
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                            onClick={() => setSelectedCase(case_.id)}
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
                </div>
              </div>
              
              <div>
                {selectedCase ? (
                  <DocumentUpload 
                    caseId={selectedCase}
                    onDocumentUploaded={handleDocumentUploaded}
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
          </TabsContent>

          <TabsContent value="documents" className="space-y-6">
            <div className="grid gap-6">
              {cases.map((case_) => (
                <DocumentManager
                  key={case_.id}
                  caseId={case_.id}
                  documents={documents}
                  onDocumentDeleted={handleDocumentDeleted}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>Analytics Dashboard</CardTitle>
                <CardDescription>Track case progress and doctor performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600">Analytics dashboard coming soon</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <PatientInfoEditor
        isOpen={isCreatingCase}
        onClose={() => setIsCreatingCase(false)}
        case_={null}
        onSave={handleCreateCase}
        isNew={true}
      />
    </div>
  );
};

export default AdminDashboard;
