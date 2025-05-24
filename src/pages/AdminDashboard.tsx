
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Shield, LogOut, User, Eye, Clock, DollarSign, FileText, Search, Filter } from "lucide-react";
import AIPayoutRecommendation from "@/components/AIPayoutRecommendation";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCase, setSelectedCase] = useState<string | null>(null);

  // Mock data for completed evaluations
  const evaluations = [
    {
      id: "C001",
      caseId: "C001",
      patientName: "John Anderson",
      doctor: "Dr. Sarah Wilson",
      evaluationDate: "2024-01-25",
      medicalConnection: "Yes",
      disability: "Yes",
      disabilityGrade: "26-50%",
      status: "completed",
      claimAmount: "$45,000",
      recommendedPayout: "$32,500"
    },
    {
      id: "C003",
      caseId: "C003",
      patientName: "Michael Brown",
      doctor: "Dr. Sarah Wilson",
      evaluationDate: "2024-01-20",
      medicalConnection: "No",
      disability: "No",
      disabilityGrade: "N/A",
      status: "completed",
      claimAmount: "$28,000",
      recommendedPayout: "$0"
    }
  ];

  // Mock data for doctor activity logs
  const activityLogs = [
    {
      id: "LOG001",
      doctor: "Dr. Sarah Wilson",
      action: "Opened case C001",
      timestamp: "2024-01-25 14:30:22",
      document: "Medical Records - Emergency Room",
      duration: "45 minutes"
    },
    {
      id: "LOG002",
      doctor: "Dr. Sarah Wilson",
      action: "Viewed document DOC001",
      timestamp: "2024-01-25 14:32:15",
      document: "Medical Records - Emergency Room",
      duration: "12 minutes"
    },
    {
      id: "LOG003",
      doctor: "Dr. Sarah Wilson",
      action: "Used AI chat for case C001",
      timestamp: "2024-01-25 14:45:33",
      document: "Multiple documents",
      duration: "8 minutes"
    },
    {
      id: "LOG004",
      doctor: "Dr. Sarah Wilson",
      action: "Submitted evaluation for C001",
      timestamp: "2024-01-25 15:20:45",
      document: "Evaluation Form",
      duration: "35 minutes"
    },
    {
      id: "LOG005",
      doctor: "Dr. Sarah Wilson",
      action: "Opened case C003",
      timestamp: "2024-01-20 10:15:12",
      document: "Police Report",
      duration: "25 minutes"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">Administrator Dashboard</h1>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <User className="h-4 w-4" />
              <span>Admin User</span>
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
              <CardTitle className="text-sm font-medium text-gray-600">Total Evaluations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">2</div>
              <p className="text-xs text-gray-500">Completed this month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Claims Approved</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">1</div>
              <p className="text-xs text-gray-500">50% approval rate</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Payout</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">$32,500</div>
              <p className="text-xs text-gray-500">This month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Avg. Review Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">2.3 hrs</div>
              <p className="text-xs text-gray-500">Per case</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="evaluations" className="space-y-4">
          <TabsList>
            <TabsTrigger value="evaluations">Doctor Evaluations</TabsTrigger>
            <TabsTrigger value="activity">Activity Logs</TabsTrigger>
            <TabsTrigger value="payout">AI Payout Analysis</TabsTrigger>
          </TabsList>

          <TabsContent value="evaluations" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Completed Evaluations</CardTitle>
                <CardDescription>
                  Review doctor evaluations and case recommendations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {evaluations.map((evaluation) => (
                    <Card key={evaluation.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="font-semibold text-lg">{evaluation.patientName}</h3>
                            <p className="text-sm text-gray-600">
                              Case {evaluation.caseId} • Evaluated by {evaluation.doctor}
                            </p>
                          </div>
                          <Badge className="bg-green-100 text-green-800">
                            {evaluation.status}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="font-medium text-gray-600">Medical Connection:</span>
                            <div className={`font-semibold ${
                              evaluation.medicalConnection === "Yes" ? "text-green-600" : "text-red-600"
                            }`}>
                              {evaluation.medicalConnection}
                            </div>
                          </div>
                          <div>
                            <span className="font-medium text-gray-600">Disability:</span>
                            <div className={`font-semibold ${
                              evaluation.disability === "Yes" ? "text-green-600" : "text-red-600"
                            }`}>
                              {evaluation.disability}
                            </div>
                          </div>
                          <div>
                            <span className="font-medium text-gray-600">Disability Grade:</span>
                            <div className="font-semibold">{evaluation.disabilityGrade}</div>
                          </div>
                          <div>
                            <span className="font-medium text-gray-600">Evaluation Date:</span>
                            <div>{evaluation.evaluationDate}</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between mt-4 pt-4 border-t">
                          <div className="flex space-x-4 text-sm">
                            <div>
                              <span className="text-gray-600">Claim Amount: </span>
                              <span className="font-semibold">{evaluation.claimAmount}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">AI Recommended: </span>
                              <span className="font-semibold text-blue-600">{evaluation.recommendedPayout}</span>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedCase(evaluation.caseId)}
                            className="flex items-center space-x-1"
                          >
                            <Eye className="h-4 w-4" />
                            <span>View Details</span>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Doctor Activity Logs</CardTitle>
                <CardDescription>
                  Track doctor interactions with cases and documents
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search activity logs..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <ScrollArea className="h-96">
                  <div className="space-y-3">
                    {activityLogs.map((log) => (
                      <div key={log.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <span className="font-medium">{log.doctor}</span>
                            <span className="text-gray-600">{log.action}</span>
                          </div>
                          <div className="text-sm text-gray-500 ml-5">
                            {log.document} • {log.duration}
                          </div>
                        </div>
                        <div className="text-sm text-gray-500">
                          {log.timestamp}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payout" className="space-y-4">
            {selectedCase ? (
              <AIPayoutRecommendation caseId={selectedCase} />
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Select a Case for Payout Analysis
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Choose a case from the Evaluations tab to see AI-powered payout recommendations
                  </p>
                  <Button 
                    variant="outline"
                    onClick={() => setSelectedCase("C001")}
                  >
                    View Sample Analysis
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
