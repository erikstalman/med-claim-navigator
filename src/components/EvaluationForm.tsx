
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { toast } from "sonner";
import AIFormSuggestions from "./AIFormSuggestions";
import MissingInfoAlert from "./MissingInfoAlert";
import CausalityAssessment from "./CausalityAssessment";
import MedicalDisabilityAssessment from "./MedicalDisabilityAssessment";
import FormActions from "./FormActions";
import { dataService } from "@/services/dataService";
import { Document } from "@/types";

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

  const [documents, setDocuments] = useState<Document[]>([]);

  useEffect(() => {
    const allDocuments = dataService.getDocuments();
    const caseDocuments = allDocuments.filter(doc => doc.caseId === caseId);
    setDocuments(caseDocuments);
  }, [caseId]);

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
      <MissingInfoAlert caseId={caseId} documents={documents} />
      
      {/* AI Form Suggestions */}
      <AIFormSuggestions
        caseId={caseId}
        documents={documents}
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
            {documents.length > 0 && (
              <span className="block mt-1 text-sm text-green-600">
                Based on {documents.length} uploaded document{documents.length !== 1 ? 's' : ''}
              </span>
            )}
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
