
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface MedicalDisabilityAssessmentProps {
  formData: {
    injuryDiagnosis: string;
    icdCode: string;
    medicalDisability: string;
    disabilityGrade: string;
    symptomsConsidered: string;
    assessmentType: string;
    whyTooEarly: string;
    nextAssessmentTime: string;
    documentationNeeded: string;
    futureDisability: string;
  };
  onInputChange: (field: string, value: string) => void;
}

const MedicalDisabilityAssessment = ({ formData, onInputChange }: MedicalDisabilityAssessmentProps) => {
  return (
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
              onChange={(e) => onInputChange("injuryDiagnosis", e.target.value)}
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="icdCode">ICD Code:</Label>
            <Input
              id="icdCode"
              placeholder="Enter ICD code..."
              value={formData.icdCode}
              onChange={(e) => onInputChange("icdCode", e.target.value)}
              className="mt-2"
            />
          </div>
        </div>

        <div className="border border-green-200 bg-green-50 p-4 rounded-lg space-y-4">
          <Label className="text-base font-medium">2. Is there a medical disability? *</Label>
          <RadioGroup
            value={formData.medicalDisability}
            onValueChange={(value) => onInputChange("medicalDisability", value)}
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
              <Select value={formData.disabilityGrade} onValueChange={(value) => onInputChange("disabilityGrade", value)}>
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
                onChange={(e) => onInputChange("symptomsConsidered", e.target.value)}
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="assessmentType">5. Is the assessment definitive or lowest assured disability?</Label>
              <Select value={formData.assessmentType} onValueChange={(value) => onInputChange("assessmentType", value)}>
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
                    onChange={(e) => onInputChange("whyTooEarly", e.target.value)}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="nextAssessmentTime">Time for next assessment:</Label>
                  <Input
                    id="nextAssessmentTime"
                    placeholder="e.g., 6 months from now..."
                    value={formData.nextAssessmentTime}
                    onChange={(e) => onInputChange("nextAssessmentTime", e.target.value)}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="documentationNeeded">Documentation needed for next evaluation:</Label>
                  <Textarea
                    id="documentationNeeded"
                    placeholder="List required documentation..."
                    value={formData.documentationNeeded}
                    onChange={(e) => onInputChange("documentationNeeded", e.target.value)}
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
                  onChange={(e) => onInputChange("futureDisability", e.target.value)}
                  className="mt-2"
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MedicalDisabilityAssessment;
