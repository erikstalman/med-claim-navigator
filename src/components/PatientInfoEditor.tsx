
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";

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
  patientAge?: number;
  patientGender?: string;
  contactNumber?: string;
  email?: string;
  address?: string;
  description?: string;
}

interface PatientInfoEditorProps {
  isOpen: boolean;
  onClose: () => void;
  case_: PatientCase | null;
  onSave: (updatedCase: PatientCase) => void;
  isNew?: boolean;
}

const PatientInfoEditor = ({ isOpen, onClose, case_, onSave, isNew = false }: PatientInfoEditorProps) => {
  const [formData, setFormData] = useState<PatientCase>(
    case_ || {
      id: `C${String(Date.now()).slice(-3)}`,
      patientName: "",
      accidentDate: "",
      submissionDate: new Date().toISOString().split('T')[0],
      status: "pending-evaluation",
      priority: "medium",
      injuryType: "",
      doctorAssigned: "",
      claimAmount: "",
      documentsCount: 0,
      evaluationStatus: "not-started"
    }
  );

  const handleInputChange = (field: keyof PatientCase, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    if (!formData.patientName || !formData.injuryType || !formData.accidentDate) {
      toast.error("Please fill in all required fields");
      return;
    }

    onSave(formData);
    onClose();
    toast.success(isNew ? "New case created successfully" : "Case updated successfully");
  };

  const doctors = [
    "Dr. Michael Smith",
    "Dr. Emily Davis", 
    "Dr. Sarah Johnson",
    "Dr. Robert Wilson"
  ];

  const injuryTypes = [
    "Motor Vehicle Accident",
    "Workplace Injury",
    "Slip and Fall",
    "Sports Injury",
    "Medical Malpractice",
    "Other"
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isNew ? "Create New Case" : "Edit Patient Information"}</DialogTitle>
          <DialogDescription>
            {isNew ? "Enter details for the new patient case" : "Update patient information and case details"}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="patientName">Patient Name *</Label>
            <Input
              id="patientName"
              value={formData.patientName}
              onChange={(e) => handleInputChange("patientName", e.target.value)}
              placeholder="Enter patient name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="caseId">Case ID</Label>
            <Input
              id="caseId"
              value={formData.id}
              onChange={(e) => handleInputChange("id", e.target.value)}
              placeholder="Case ID"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="accidentDate">Accident Date *</Label>
            <Input
              id="accidentDate"
              type="date"
              value={formData.accidentDate}
              onChange={(e) => handleInputChange("accidentDate", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="submissionDate">Submission Date</Label>
            <Input
              id="submissionDate"
              type="date"
              value={formData.submissionDate}
              onChange={(e) => handleInputChange("submissionDate", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="injuryType">Injury Type *</Label>
            <Select value={formData.injuryType} onValueChange={(value) => handleInputChange("injuryType", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select injury type" />
              </SelectTrigger>
              <SelectContent>
                {injuryTypes.map((type) => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="doctorAssigned">Assigned Doctor</Label>
            <Select value={formData.doctorAssigned} onValueChange={(value) => handleInputChange("doctorAssigned", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select doctor" />
              </SelectTrigger>
              <SelectContent>
                {doctors.map((doctor) => (
                  <SelectItem key={doctor} value={doctor}>{doctor}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="claimAmount">Claim Amount</Label>
            <Input
              id="claimAmount"
              value={formData.claimAmount}
              onChange={(e) => handleInputChange("claimAmount", e.target.value)}
              placeholder="$0"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="priority">Priority</Label>
            <Select value={formData.priority} onValueChange={(value) => handleInputChange("priority", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Case Status</Label>
            <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending-evaluation">Pending Evaluation</SelectItem>
                <SelectItem value="under-review">Under Review</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="evaluationStatus">Evaluation Status</Label>
            <Select value={formData.evaluationStatus} onValueChange={(value) => handleInputChange("evaluationStatus", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select evaluation status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="not-started">Not Started</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="contactNumber">Contact Number</Label>
            <Input
              id="contactNumber"
              value={formData.contactNumber || ""}
              onChange={(e) => handleInputChange("contactNumber", e.target.value)}
              placeholder="Phone number"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email || ""}
              onChange={(e) => handleInputChange("email", e.target.value)}
              placeholder="patient@email.com"
            />
          </div>

          <div className="col-span-2 space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={formData.address || ""}
              onChange={(e) => handleInputChange("address", e.target.value)}
              placeholder="Patient address"
            />
          </div>

          <div className="col-span-2 space-y-2">
            <Label htmlFor="description">Case Description</Label>
            <Textarea
              id="description"
              value={formData.description || ""}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Additional details about the case..."
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            {isNew ? "Create Case" : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PatientInfoEditor;
