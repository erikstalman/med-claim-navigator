
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";

interface CausalityAssessmentProps {
  formData: {
    healthConditionBefore: string;
    traumaDegree: string;
    initialSymptoms: string;
    symptomContinuity: string;
    competingConditions: string;
    medicalConnection: string;
    connectionFor: string;
    connectionAgainst: string;
    timeLimited: string;
    timeLimit: string;
  };
  onInputChange: (field: string, value: string) => void;
}

const CausalityAssessment = ({ formData, onInputChange }: CausalityAssessmentProps) => {
  return (
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
            onChange={(e) => onInputChange("healthConditionBefore", e.target.value)}
            className="mt-2"
          />
        </div>

        <div>
          <Label htmlFor="traumaDegree">2. Degree of violence or trauma during the accident</Label>
          <Textarea
            id="traumaDegree"
            placeholder="Assess the degree of trauma or violence involved in the accident..."
            value={formData.traumaDegree}
            onChange={(e) => onInputChange("traumaDegree", e.target.value)}
            className="mt-2"
          />
        </div>

        <div>
          <Label htmlFor="initialSymptoms">3. Initial symptoms/complaints in relation to the time of accident</Label>
          <Textarea
            id="initialSymptoms"
            placeholder="Document initial symptoms and their timing relative to the accident..."
            value={formData.initialSymptoms}
            onChange={(e) => onInputChange("initialSymptoms", e.target.value)}
            className="mt-2"
          />
        </div>

        <div>
          <Label htmlFor="symptomContinuity">4. Symptom continuity</Label>
          <Textarea
            id="symptomContinuity"
            placeholder="Assess the continuity of symptoms from accident to present..."
            value={formData.symptomContinuity}
            onChange={(e) => onInputChange("symptomContinuity", e.target.value)}
            className="mt-2"
          />
        </div>

        <div>
          <Label htmlFor="competingConditions">5. Competing conditions</Label>
          <Textarea
            id="competingConditions"
            placeholder="Identify any competing conditions that might explain the symptoms..."
            value={formData.competingConditions}
            onChange={(e) => onInputChange("competingConditions", e.target.value)}
            className="mt-2"
          />
        </div>

        <div className="border border-blue-200 bg-blue-50 p-4 rounded-lg space-y-4">
          <Label className="text-base font-medium">
            Is it more likely that the reported symptoms have a medical connection with the current accident? *
          </Label>
          <RadioGroup
            value={formData.medicalConnection}
            onValueChange={(value) => onInputChange("medicalConnection", value)}
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
              onChange={(e) => onInputChange("connectionFor", e.target.value)}
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="connectionAgainst">What speaks against a connection:</Label>
            <Textarea
              id="connectionAgainst"
              placeholder="List factors against the connection..."
              value={formData.connectionAgainst}
              onChange={(e) => onInputChange("connectionAgainst", e.target.value)}
              className="mt-2"
            />
          </div>
        </div>

        <div className="space-y-4">
          <Label className="text-base font-medium">If there is a connection, is it time-limited?</Label>
          <RadioGroup
            value={formData.timeLimited}
            onValueChange={(value) => onInputChange("timeLimited", value)}
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
                onChange={(e) => onInputChange("timeLimit", e.target.value)}
                className="mt-2"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CausalityAssessment;
