
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, FileText, Clock, CheckCircle, AlertCircle, LogOut, User } from "lucide-react";

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Mock data for cases
  const cases = [
    {
      id: "C001",
      patientName: "John Anderson",
      accidentDate: "2024-01-15",
      submissionDate: "2024-01-20",
      status: "pending",
      priority: "high",
      injuryType: "Motor Vehicle Accident",
      documentCount: 12
    },
    {
      id: "C002",
      patientName: "Sarah Johnson",
      accidentDate: "2024-01-10",
      submissionDate: "2024-01-18",
      status: "in-review",
      priority: "medium",
      injuryType: "Workplace Injury",
      documentCount: 8
    },
    {
      id: "C003",
      patientName: "Michael Brown",
      accidentDate: "2024-01-05",
      submissionDate: "2024-01-12",
      status: "completed",
      priority: "low",
      injuryType: "Slip and Fall",
      documentCount: 15
    },
    {
      id: "C004",
      patientName: "Emily Davis",
      accidentDate: "2024-01-22",
      submissionDate: "2024-01-25",
      status: "pending",
      priority: "high",
      injuryType: "Sports Injury",
      documentCount: 6
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending": return <Clock className="h-4 w-4 text-yellow-500" />;
      case "in-review": return <AlertCircle className="h-4 w-4 text-blue-500" />;
      case "completed": return <CheckCircle className="h-4 w-4 text-green-500" />;
      default: return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "in-review": return "bg-blue-100 text-blue-800";
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

  const filteredCases = cases.filter(caseItem => {
    const matchesSearch = caseItem.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         caseItem.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || caseItem.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <FileText className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">Claims Evaluation Platform</h1>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <User className="h-4 w-4" />
              <span>Dr. Sarah Wilson</span>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate("/")}
              className="flex items-center space-x-2"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="p-6">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Pending Cases</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">2</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">In Review</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">1</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">1</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Cases</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">4</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Case Management</CardTitle>
            <CardDescription>Review and evaluate insurance claims</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by patient name or case ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in-review">In Review</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Cases List */}
        <div className="space-y-4">
          {filteredCases.map((caseItem) => (
            <Card key={caseItem.id} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      {getStatusIcon(caseItem.status)}
                      <h3 className="font-semibold text-lg text-gray-900">
                        {caseItem.patientName}
                      </h3>
                      <Badge variant="outline" className="text-xs">
                        {caseItem.id}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Injury Type:</span>
                        <div>{caseItem.injuryType}</div>
                      </div>
                      <div>
                        <span className="font-medium">Accident Date:</span>
                        <div>{caseItem.accidentDate}</div>
                      </div>
                      <div>
                        <span className="font-medium">Submitted:</span>
                        <div>{caseItem.submissionDate}</div>
                      </div>
                      <div>
                        <span className="font-medium">Documents:</span>
                        <div>{caseItem.documentCount} files</div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge className={getStatusColor(caseItem.status)}>
                      {caseItem.status.replace("-", " ")}
                    </Badge>
                    <Badge className={getPriorityColor(caseItem.priority)}>
                      {caseItem.priority}
                    </Badge>
                    <Button 
                      onClick={() => navigate(`/case/${caseItem.id}`)}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Review Case
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredCases.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No cases found</h3>
              <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default DoctorDashboard;
