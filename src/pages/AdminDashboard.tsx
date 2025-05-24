
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, 
  Filter, 
  Eye, 
  Upload, 
  Clock, 
  FileText, 
  User,
  BarChart3,
  TrendingUp,
  AlertCircle
} from "lucide-react";
import DocumentUpload from "@/components/DocumentUpload";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCase, setSelectedCase] = useState<string | null>(null);

  // Mock data for cases
  const cases = [
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
      documentsCount: 6,
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
      documentsCount: 4,
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
      documentsCount: 8,
      evaluationStatus: "completed"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending-evaluation": return "bg-yellow-100 text-yellow-800";
      case "under-review": return "bg-blue-100 text-blue-800";
      case "completed": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-800";
      case "medium": return "bg-yellow-100 text-yellow-800";
      case "low": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const filteredCases = cases.filter(case_ =>
    case_.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    case_.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
                      <p className="text-2xl font-bold text-gray-900">24</p>
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
                      <p className="text-2xl font-bold text-yellow-600">8</p>
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
                      <p className="text-2xl font-bold text-green-600">12</p>
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
                      <p className="text-2xl font-bold text-red-600">4</p>
                    </div>
                    <AlertCircle className="h-8 w-8 text-red-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Search and Filter */}
            <Card>
              <CardHeader>
                <CardTitle>Case Management</CardTitle>
                <CardDescription>Manage healthcare claims and track evaluation progress</CardDescription>
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
                    <Card key={case_.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="text-lg font-semibold text-gray-900">
                                {case_.patientName}
                              </h3>
                              <Badge className={getStatusColor(case_.status)}>
                                {case_.status.replace("-", " ")}
                              </Badge>
                              <Badge className={getPriorityColor(case_.priority)}>
                                {case_.priority}
                              </Badge>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                              <div>
                                <span className="font-medium">Case ID:</span> {case_.id}
                              </div>
                              <div>
                                <span className="font-medium">Accident:</span> {case_.accidentDate}
                              </div>
                              <div>
                                <span className="font-medium">Submitted:</span> {case_.submissionDate}
                              </div>
                              <div>
                                <span className="font-medium">Claim:</span> {case_.claimAmount}
                              </div>
                              <div>
                                <span className="font-medium">Injury Type:</span> {case_.injuryType}
                              </div>
                              <div>
                                <span className="font-medium">Doctor:</span> {case_.doctorAssigned}
                              </div>
                              <div>
                                <span className="font-medium">Documents:</span> {case_.documentsCount}
                              </div>
                              <div>
                                <span className="font-medium">Evaluation:</span> {case_.evaluationStatus}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => navigate(`/case/${case_.id}`)}
                              className="flex items-center space-x-1"
                            >
                              <Eye className="h-4 w-4" />
                              <span>View Case</span>
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedCase(case_.id)}
                              className="flex items-center space-x-1"
                            >
                              <Upload className="h-4 w-4" />
                              <span>Upload Docs</span>
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
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
                                <p className="text-sm text-gray-600">Case {case_.id}</p>
                              </div>
                              <Badge className={getStatusColor(case_.status)}>
                                {case_.status.replace("-", " ")}
                              </Badge>
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
                    onDocumentUploaded={() => {
                      console.log("Document uploaded for case:", selectedCase);
                    }}
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
    </div>
  );
};

export default AdminDashboard;
