
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { UserCheck, Users, FileText } from "lucide-react";
import { authService } from "@/services/authService";
import { PatientCase, User } from "@/types";
import { toast } from "sonner";

const CaseAssignment = () => {
  const [cases, setCases] = useState<PatientCase[]>([]);
  const [doctors, setDoctors] = useState<User[]>([]);
  const [selectedAssignments, setSelectedAssignments] = useState<{[caseId: string]: string}>({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    try {
      const allCases = authService.getAllCases();
      const activeDoctors = authService.getDoctors();
      setCases(allCases);
      setDoctors(activeDoctors);
      
      // Initialize selected assignments with current assignments
      const currentAssignments: {[caseId: string]: string} = {};
      allCases.forEach(case_ => {
        if (case_.doctorId) {
          currentAssignments[case_.id] = case_.doctorId;
        }
      });
      setSelectedAssignments(currentAssignments);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error("Failed to load cases and doctors");
    }
  };

  const handleAssignmentChange = (caseId: string, doctorId: string) => {
    setSelectedAssignments(prev => ({
      ...prev,
      [caseId]: doctorId
    }));
  };

  const handleAssignCase = (caseId: string) => {
    const doctorId = selectedAssignments[caseId];
    if (!doctorId) {
      toast.error("Please select a doctor first");
      return;
    }

    try {
      authService.assignCaseToDoctor(caseId, doctorId);
      loadData(); // Refresh data
      const doctor = doctors.find(d => d.id === doctorId);
      const case_ = cases.find(c => c.id === caseId);
      toast.success(`Case ${case_?.patientName} assigned to Dr. ${doctor?.name}`);
    } catch (error) {
      console.error('Error assigning case:', error);
      toast.error("Failed to assign case");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending-evaluation": return "bg-yellow-100 text-yellow-800";
      case "under-review": return "bg-blue-100 text-blue-800";
      case "completed": return "bg-green-100 text-green-800";
      case "rejected": return "bg-red-100 text-red-800";
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <UserCheck className="h-5 w-5" />
          <span>Case Assignment</span>
        </CardTitle>
        <CardDescription>Assign medical cases to doctors for evaluation</CardDescription>
      </CardHeader>
      <CardContent>
        {doctors.length === 0 ? (
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No doctors available</h3>
            <p className="text-gray-600">Create doctor accounts first to assign cases.</p>
          </div>
        ) : cases.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No cases available</h3>
            <p className="text-gray-600">Cases will appear here when they are created.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {cases.map((case_) => (
              <Card key={case_.id} className="border-l-4 border-l-blue-500">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="font-semibold text-lg">{case_.patientName}</h4>
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
                          <span className="font-medium">Injury Type:</span> {case_.injuryType}
                        </div>
                        <div>
                          <span className="font-medium">Claim Amount:</span> {case_.claimAmount}
                        </div>
                        <div>
                          <span className="font-medium">Current Doctor:</span> 
                          <span className={case_.doctorAssigned === 'Unassigned' ? 'text-red-600' : 'text-green-600'}>
                            {case_.doctorAssigned}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Select
                        value={selectedAssignments[case_.id] || ''}
                        onValueChange={(value) => handleAssignmentChange(case_.id, value)}
                      >
                        <SelectTrigger className="w-48">
                          <SelectValue placeholder="Select doctor" />
                        </SelectTrigger>
                        <SelectContent>
                          {doctors.map((doctor) => (
                            <SelectItem key={doctor.id} value={doctor.id}>
                              <div className="flex flex-col">
                                <span>{doctor.name}</span>
                                {doctor.specialization && (
                                  <span className="text-xs text-gray-500">{doctor.specialization}</span>
                                )}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        onClick={() => handleAssignCase(case_.id)}
                        disabled={!selectedAssignments[case_.id] || selectedAssignments[case_.id] === case_.doctorId}
                        size="sm"
                      >
                        {case_.doctorId && selectedAssignments[case_.id] === case_.doctorId ? 'Assigned' : 'Assign'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CaseAssignment;
