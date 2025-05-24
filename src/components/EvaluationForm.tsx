
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { toast } from "sonner";
import AIFormSuggestions from "./AIFormSuggestions";
import MissingInfoAlert from "./MissingInfoAlert";
import CausalityAssessment from "./CausalityAssessment";
import MedicalDisabilityAssessment from "./MedicalDisabilityAssessment";
import FormActions from "./FormActions";

interface EvaluationFormProps {
  caseId: string;
}

const EvaluationForm = ({ caseId }: EvaluationFormProps) => {
  const [formData, setFormData] = useState({
    // Causality Assessment
    healthConditionBefore: "",
    traumaDegree: "",
    initialSymptoms: "",
    symptomContinuity: "",
    competingConditions: "",
    medicalConnection: "",
    connectionFor: "",
    connectionAgainst: "",
    timeLimited: "",
    timeLimit: "",
    
    // Medical Disability After Accident
    injuryDiagnosis: "",
    icdCode: "",
    medicalDisability: "",
    disabilityGrade: "",
    symptomsConsidered: "",
    assessmentType: "",
    whyTooEarly: "",
    nextAssessmentTime: "",
    documentationNeeded: "",
    futureDisability: ""
  });

  // Mock documents for the case
  const mockDocuments = [
    { id: "DOC001", name: "Medical Records - Emergency Room", category: "medical" },
    { id: "DOC003", name: "Police Report", category: "legal" },
    { id: "DOC002", name: "X-Ray Results", category: "imaging" }
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAcceptSuggestion = (field: string, value: string) => {
    handleInputChange(field, value);
  };

  const handleRejectSuggestion = (field: string) => {
    console.log("Rejected suggestion for field:", field);
  };

  const handleSave = () => {
    toast.success("Evaluation saved as draft");
  };

  const handleSubmit = () => {
    // Basic validation
    const requiredFields = ['medicalConnection', 'medicalDisability'];
    const missingFields = requiredFields.filter(field => !formData[field as keyof typeof formData]);
    
    if (missingFields.length > 0) {
      toast.error("Please complete all required fields");
      return;
    }
    
    toast.success("Evaluation submitted successfully");
  };

  return (
    <div className="space-y-6">
      {/* Missing Information Alert */}
      <MissingInfoAlert caseId={caseId} documents={mockDocuments} />
      
      {/* AI Form Suggestions */}
      <AIFormSuggestions
        caseId={caseId}
        documents={mockDocuments}
        currentFormData={formData}
        onAcceptSuggestion={handleAcceptSuggestion}
        onRejectSuggestion={handleRejectSuggestion}
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-blue-600" />
            <span>Medical Evaluation Form</span>
          </CardTitle>
          <CardDescription>
            Complete the causality assessment and medical disability evaluation for case {caseId}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Causality Assessment Section */}
          <CausalityAssessment formData={formData} onInputChange={handleInputChange} />

          {/* Medical Disability Section */}
          <MedicalDisabilityAssessment formData={formData} onInputChange={handleInputChange} />

          {/* Action Buttons */}
          <FormActions onSave={handleSave} onSubmit={handleSubmit} />
        </CardContent>
      </Card>
    </div>
  );
};

export default EvaluationForm;
