
import { Button } from "@/components/ui/button";
import { Save, Send } from "lucide-react";

interface FormActionsProps {
  onSave: () => void;
  onSubmit: () => void;
}

const FormActions = ({ onSave, onSubmit }: FormActionsProps) => {
  return (
    <div className="flex justify-between pt-6 border-t">
      <Button variant="outline" onClick={onSave} className="flex items-center space-x-2">
        <Save className="h-4 w-4" />
        <span>Save Draft</span>
      </Button>
      <Button onClick={onSubmit} className="bg-blue-600 hover:bg-blue-700 flex items-center space-x-2">
        <Send className="h-4 w-4" />
        <span>Submit Evaluation</span>
      </Button>
    </div>
  );
};

export default FormActions;
