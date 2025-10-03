
import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { toast } from "sonner";
import AIFormSuggestions from "./AIFormSuggestions";
import MissingInfoAlert from "./MissingInfoAlert";
import CausalityAssessment from "./CausalityAssessment";
import MedicalDisabilityAssessment from "./MedicalDisabilityAssessment";
import FormActions from "./FormActions";
import { authService } from "@/services/authService";
import { Document } from "@/types";
import { supabase } from "@/integrations/supabase/client";

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
  const [loadingDocuments, setLoadingDocuments] = useState(false);

  const loadDocuments = useCallback(async () => {
    setLoadingDocuments(true);
    try {
      const { data, error } = await supabase
        .from("documents")
        .select(
          "id, name, type, upload_date, uploaded_by, uploaded_by_name, size_mb, pages, category, case_id, file_path, file_url, content"
        )
        .eq("case_id", caseId)
        .order("upload_date", { ascending: false });

      if (error) {
        throw error;
      }

      const mappedDocuments: Document[] = (data ?? []).map(doc => ({
        id: doc.id,
        name: doc.name,
        type: doc.type,
        uploadDate: doc.upload_date,
        uploadedBy: doc.uploaded_by_name || doc.uploaded_by || "Unknown",
        uploadedById: doc.uploaded_by || "",
        size: doc.size_mb ? `${doc.size_mb.toFixed(2)} MB` : "",
        pages: doc.pages ?? 0,
        category: doc.category,
        caseId: doc.case_id,
        filePath: doc.file_path || "",
        fileUrl: doc.file_url || undefined,
        previewImageUrl: undefined,
        content: doc.content || undefined,
      }));

      setDocuments(mappedDocuments);
    } catch (error) {
      console.error("Failed to load documents from Supabase", error);
      toast.error("Unable to load documents from Supabase");
      setDocuments([]);
    } finally {
      setLoadingDocuments(false);
    }
  }, [caseId]);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAcceptSuggestion = (field: string, value: string) => {
    handleInputChange(field, value);
    toast.success("AI suggestion applied to form");
  };

  const handleRejectSuggestion = (field: string) => {
    console.log("Rejected suggestion for field:", field);
    toast.info("AI suggestion rejected");
  };

  const handleSave = () => {
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      authService.logActivity(
        currentUser.id,
        currentUser.name,
        currentUser.role,
        'SAVE_EVALUATION',
        caseId,
        undefined,
        'Saved evaluation form as draft'
      );
    }
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
    
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      authService.logActivity(
        currentUser.id,
        currentUser.name,
        currentUser.role,
        'SUBMIT_EVALUATION',
        caseId,
        undefined,
        'Submitted medical evaluation form'
      );
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
            {loadingDocuments ? (
              <span className="block mt-1 text-sm text-blue-600">Loading case documents from Supabase...</span>
            ) : (
              documents.length > 0 && (
                <span className="block mt-1 text-sm text-green-600">
                  Based on {documents.length} uploaded document{documents.length !== 1 ? 's' : ''}
                  {documents.map(doc => ` • ${doc.name}`).join('')}
                </span>
              )
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
