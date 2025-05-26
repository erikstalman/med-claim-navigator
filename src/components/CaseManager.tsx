
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Edit, Trash2, Eye, Upload } from "lucide-react";
import { toast } from "sonner";
import PatientInfoEditor from "./PatientInfoEditor";
import { useNavigate } from "react-router-dom";

interface PatientCase {
  id: string;
  patientName: string;
  accidentDate: string;
  submissionDate: string;
  status: string;
  priority: string;
  injuryType: string;
  doctorAssigned: string;
  claimAmount: string;
  documentsCount: number;
  evaluationStatus: string;
}

interface CaseManagerProps {
  case_: PatientCase;
  onUpdate: (updatedCase: PatientCase) => void;
  onDelete: (caseId: string) => void;
  onSelectForUpload: (caseId: string) => void;
}

const CaseManager = ({ case_, onUpdate, onDelete, onSelectForUpload }: CaseManagerProps) => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);

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

  const handleDelete = () => {
    onDelete(case_.id);
    toast.success("Case deleted successfully");
  };

  return (
    <>
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h3 className="text-lg font-semibold text-gray-900">
                  {case_.patientName}
                </h3>
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
                  <span className="font-medium">Accident:</span> {case_.accidentDate}
                </div>
                <div>
                  <span className="font-medium">Submitted:</span> {case_.submissionDate}
                </div>
                <div>
                  <span className="font-medium">Claim:</span> {case_.claimAmount}
                </div>
                <div>
                  <span className="font-medium">Injury Type:</span> {case_.injuryType}
                </div>
                <div>
                  <span className="font-medium">Doctor:</span> {case_.doctorAssigned}
                </div>
                <div>
                  <span className="font-medium">Documents:</span> {case_.documentsCount}
                </div>
                <div>
                  <span className="font-medium">Evaluation:</span> {case_.evaluationStatus}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/case/${case_.id}`)}
                className="flex items-center space-x-1"
              >
                <Eye className="h-4 w-4" />
                <span>View</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
                className="flex items-center space-x-1"
              >
                <Edit className="h-4 w-4" />
                <span>Edit</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onSelectForUpload(case_.id)}
                className="flex items-center space-x-1"
              >
                <Upload className="h-4 w-4" />
                <span>Upload</span>
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center space-x-1 text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>Delete</span>
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Case</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete case {case_.id} for {case_.patientName}? 
                      This action cannot be undone and will permanently remove all case data and documents.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                      Delete Case
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </CardContent>
      </Card>

      <PatientInfoEditor
        isOpen={isEditing}
        onClose={() => setIsEditing(false)}
        case_={case_}
        onSave={onUpdate}
      />
    </>
  );
};

export default CaseManager;
