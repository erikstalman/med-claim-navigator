
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Save, Send, AlertCircle } from "lucide-react";
import { toast } from "sonner";

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

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
          <div className="space-y-6">
            <div className="border-b pb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Causality Assessment</h3>
            </div>
            
            <div className="grid grid-cols-1 gap-6">
              <div>
                <Label htmlFor="healthConditionBefore">1. Health condition before the accident</Label>
                <Textarea
                  id="healthConditionBefore"
                  placeholder="Describe the patient's health condition prior to the accident..."
                  value={formData.healthConditionBefore}
                  onChange={(e) => handleInputChange("healthConditionBefore", e.target.value)}
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="traumaDegree">2. Degree of violence or trauma during the accident</Label>
                <Textarea
                  id="traumaDegree"
                  placeholder="Assess the degree of trauma or violence involved in the accident..."
                  value={formData.traumaDegree}
                  onChange={(e) => handleInputChange("traumaDegree", e.target.value)}
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="initialSymptoms">3. Initial symptoms/complaints in relation to the time of accident</Label>
                <Textarea
                  id="initialSymptoms"
                  placeholder="Document initial symptoms and their timing relative to the accident..."
                  value={formData.initialSymptoms}
                  onChange={(e) => handleInputChange("initialSymptoms", e.target.value)}
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="symptomContinuity">4. Symptom continuity</Label>
                <Textarea
                  id="symptomContinuity"
                  placeholder="Assess the continuity of symptoms from accident to present..."
                  value={formData.symptomContinuity}
                  onChange={(e) => handleInputChange("symptomContinuity", e.target.value)}
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="competingConditions">5. Competing conditions</Label>
                <Textarea
                  id="competingConditions"
                  placeholder="Identify any competing conditions that might explain the symptoms..."
                  value={formData.competingConditions}
                  onChange={(e) => handleInputChange("competingConditions", e.target.value)}
                  className="mt-2"
                />
              </div>

              <div className="border border-blue-200 bg-blue-50 p-4 rounded-lg space-y-4">
                <Label className="text-base font-medium">
                  Is it more likely that the reported symptoms have a medical connection with the current accident? *
                </Label>
                <RadioGroup
                  value={formData.medicalConnection}
                  onValueChange={(value) => handleInputChange("medicalConnection", value)}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="connection-yes" />
                    <Label htmlFor="connection-yes">Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="connection-no" />
                    <Label htmlFor="connection-no">No</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="connectionFor">What speaks for a connection:</Label>
                  <Textarea
                    id="connectionFor"
                    placeholder="List factors supporting the connection..."
                    value={formData.connectionFor}
                    onChange={(e) => handleInputChange("connectionFor", e.target.value)}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="connectionAgainst">What speaks against a connection:</Label>
                  <Textarea
                    id="connectionAgainst"
                    placeholder="List factors against the connection..."
                    value={formData.connectionAgainst}
                    onChange={(e) => handleInputChange("connectionAgainst", e.target.value)}
                    className="mt-2"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <Label className="text-base font-medium">If there is a connection, is it time-limited?</Label>
                <RadioGroup
                  value={formData.timeLimited}
                  onValueChange={(value) => handleInputChange("timeLimited", value)}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="time-yes" />
                    <Label htmlFor="time-yes">Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="time-no" />
                    <Label htmlFor="time-no">No</Label>
                  </div>
                </RadioGroup>
                
                {formData.timeLimited === "yes" && (
                  <div>
                    <Label htmlFor="timeLimit">If yes, for how long:</Label>
                    <Input
                      id="timeLimit"
                      placeholder="e.g., 6 months, 1 year..."
                      value={formData.timeLimit}
                      onChange={(e) => handleInputChange("timeLimit", e.target.value)}
                      className="mt-2"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Medical Disability Section */}
          <div className="space-y-6">
            <div className="border-b pb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Medical Disability After Accident</h3>
            </div>

            <div className="grid grid-cols-1 gap-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="injuryDiagnosis">1. What injury has caused the insured's complaints? Diagnosis name:</Label>
                  <Input
                    id="injuryDiagnosis"
                    placeholder="Enter diagnosis name..."
                    value={formData.injuryDiagnosis}
                    onChange={(e) => handleInputChange("injuryDiagnosis", e.target.value)}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="icdCode">ICD Code:</Label>
                  <Input
                    id="icdCode"
                    placeholder="Enter ICD code..."
                    value={formData.icdCode}
                    onChange={(e) => handleInputChange("icdCode", e.target.value)}
                    className="mt-2"
                  />
                </div>
              </div>

              <div className="border border-green-200 bg-green-50 p-4 rounded-lg space-y-4">
                <Label className="text-base font-medium">2. Is there a medical disability? *</Label>
                <RadioGroup
                  value={formData.medicalDisability}
                  onValueChange={(value) => handleInputChange("medicalDisability", value)}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="disability-yes" />
                    <Label htmlFor="disability-yes">Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="disability-no" />
                    <Label htmlFor="disability-no">No</Label>
                  </div>
                </RadioGroup>
              </div>

              {formData.medicalDisability === "yes" && (
                <>
                  <div>
                    <Label htmlFor="disabilityGrade">3. Grade the medical disability:</Label>
                    <Select value={formData.disabilityGrade} onValueChange={(value) => handleInputChange("disabilityGrade", value)}>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Select disability grade" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0-10">0-10% (Minimal)</SelectItem>
                        <SelectItem value="11-25">11-25% (Mild)</SelectItem>
                        <SelectItem value="26-50">26-50% (Moderate)</SelectItem>
                        <SelectItem value="51-75">51-75% (Severe)</SelectItem>
                        <SelectItem value="76-100">76-100% (Total)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="symptomsConsidered">4. What symptoms have been considered in the disability grade?</Label>
                    <Textarea
                      id="symptomsConsidered"
                      placeholder="List symptoms considered in the disability assessment..."
                      value={formData.symptomsConsidered}
                      onChange={(e) => handleInputChange("symptomsConsidered", e.target.value)}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="assessmentType">5. Is the assessment definitive or lowest assured disability?</Label>
                    <Select value={formData.assessmentType} onValueChange={(value) => handleInputChange("assessmentType", value)}>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Select assessment type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="definitive">Definitive</SelectItem>
                        <SelectItem value="lowest-assured">Lowest Assured Disability</SelectItem>
                        <SelectItem value="too-early">Too Early to Assess</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {formData.assessmentType === "too-early" && (
                    <div className="space-y-4 border border-yellow-200 bg-yellow-50 p-4 rounded-lg">
                      <div>
                        <Label htmlFor="whyTooEarly">6. If the assessment is not definitive: Why it's too early to assess:</Label>
                        <Textarea
                          id="whyTooEarly"
                          placeholder="Explain why assessment is premature..."
                          value={formData.whyTooEarly}
                          onChange={(e) => handleInputChange("whyTooEarly", e.target.value)}
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <Label htmlFor="nextAssessmentTime">Time for next assessment:</Label>
                        <Input
                          id="nextAssessmentTime"
                          placeholder="e.g., 6 months from now..."
                          value={formData.nextAssessmentTime}
                          onChange={(e) => handleInputChange("nextAssessmentTime", e.target.value)}
                          className="mt-2"
                        />
                      </div>
                      <div>
                        <Label htmlFor="documentationNeeded">Documentation needed for next evaluation:</Label>
                        <Textarea
                          id="documentationNeeded"
                          placeholder="List required documentation..."
                          value={formData.documentationNeeded}
                          onChange={(e) => handleInputChange("documentationNeeded", e.target.value)}
                          className="mt-2"
                        />
                      </div>
                    </div>
                  )}

                  {formData.assessmentType === "lowest-assured" && (
                    <div>
                      <Label htmlFor="futureDisability">For lowest assured medical disability, estimate the degree of future definitive medical disability:</Label>
                      <Textarea
                        id="futureDisability"
                        placeholder="Estimate future definitive disability degree..."
                        value={formData.futureDisability}
                        onChange={(e) => handleInputChange("futureDisability", e.target.value)}
                        className="mt-2"
                      />
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between pt-6 border-t">
            <Button variant="outline" onClick={handleSave} className="flex items-center space-x-2">
              <Save className="h-4 w-4" />
              <span>Save Draft</span>
            </Button>
            <Button onClick={handleSubmit} className="bg-blue-600 hover:bg-blue-700 flex items-center space-x-2">
              <Send className="h-4 w-4" />
              <span>Submit Evaluation</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EvaluationForm;
