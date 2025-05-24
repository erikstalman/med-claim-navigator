
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, FileText, MessageSquare, Save, Send } from "lucide-react";
import AIDocumentChat from "@/components/AIDocumentChat";
import DocumentList from "@/components/DocumentList";
import EvaluationForm from "@/components/EvaluationForm";

const CaseDetails = () => {
  const { caseId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");

  // Mock case data
  const caseData = {
    id: caseId,
    patientName: "John Anderson",
    accidentDate: "2024-01-15",
    submissionDate: "2024-01-20",
    status: "pending",
    priority: "high",
    injuryType: "Motor Vehicle Accident",
    patientAge: 42,
    accidentLocation: "Highway 101, San Francisco, CA",
    reportingDoctor: "Dr. Michael Smith",
    insurancePolicy: "Policy #12345678",
    claimAmount: "$45,000"
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate("/doctor")}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Dashboard</span>
            </Button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                Case {caseData.id} - {caseData.patientName}
              </h1>
              <p className="text-sm text-gray-600">
                {caseData.injuryType} • {caseData.accidentDate}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Badge className="bg-yellow-100 text-yellow-800">
              {caseData.status.replace("-", " ")}
            </Badge>
            <Badge className="bg-red-100 text-red-800">
              {caseData.priority}
            </Badge>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Main Content */}
        <div className="flex-1 p-6 overflow-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Case Overview</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
              <TabsTrigger value="evaluation">Medical Evaluation</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Patient Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-600">Name:</span>
                        <div>{caseData.patientName}</div>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Age:</span>
                        <div>{caseData.patientAge} years</div>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Policy:</span>
                        <div>{caseData.insurancePolicy}</div>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Claim Amount:</span>
                        <div className="font-semibold text-green-600">{caseData.claimAmount}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Accident Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-sm space-y-2">
                      <div>
                        <span className="font-medium text-gray-600">Date:</span>
                        <div>{caseData.accidentDate}</div>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Location:</span>
                        <div>{caseData.accidentLocation}</div>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Type:</span>
                        <div>{caseData.injuryType}</div>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Reporting Doctor:</span>
                        <div>{caseData.reportingDoctor}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Case Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div className="flex-1">
                        <div className="font-medium">Case Submitted</div>
                        <div className="text-sm text-gray-600">{caseData.submissionDate}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <div className="flex-1">
                        <div className="font-medium">Assigned for Review</div>
                        <div className="text-sm text-gray-600">Pending evaluation</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="documents" className="mt-6">
              <DocumentList caseId={caseData.id} />
            </TabsContent>

            <TabsContent value="evaluation" className="mt-6">
              <EvaluationForm caseId={caseData.id} />
            </TabsContent>
          </Tabs>
        </div>

        {/* AI Chat Sidebar */}
        <div className="w-96 border-l border-gray-200 bg-white">
          <AIDocumentChat caseId={caseData.id} />
        </div>
      </div>
    </div>
  );
};

export default CaseDetails;
