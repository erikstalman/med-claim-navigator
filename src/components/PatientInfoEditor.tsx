
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { authService } from "@/services/authService";
import { PatientCase } from "@/types";

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
      doctorId: "",
      adminAssigned: "",
      adminId: "",
      claimAmount: "",
      documentsCount: 0,
      evaluationStatus: "not-started",
      lastUpdated: new Date().toISOString(),
      createdBy: ""
    }
  );

  const [doctors, setDoctors] = useState(authService.getDoctors());
  const [admins, setAdmins] = useState(authService.getAdmins());

  useEffect(() => {
    // Refresh doctors and admins list when dialog opens
    if (isOpen) {
      setDoctors(authService.getDoctors());
      setAdmins(authService.getAdmins());
    }
  }, [isOpen]);

  const handleInputChange = (field: keyof PatientCase, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleDoctorChange = (doctorId: string) => {
    const doctor = doctors.find(d => d.id === doctorId);
    if (doctor) {
      setFormData(prev => ({
        ...prev,
        doctorId: doctor.id,
        doctorAssigned: doctor.name
      }));
    }
  };

  const handleSave = () => {
    if (!formData.patientName || !formData.injuryType || !formData.accidentDate) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Set admin info from current user if creating new case
    const currentUser = authService.getCurrentUser();
    if (isNew && currentUser && currentUser.role === 'admin') {
      formData.adminId = currentUser.id;
      formData.adminAssigned = currentUser.name;
      formData.createdBy = currentUser.id;
    }

    onSave(formData);
    onClose();
    toast.success(isNew ? "New case created successfully" : "Case updated successfully");
  };

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
            <Select value={formData.doctorId} onValueChange={handleDoctorChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select doctor" />
              </SelectTrigger>
              <SelectContent>
                {doctors.map((doctor) => (
                  <SelectItem key={doctor.id} value={doctor.id}>
                    {doctor.name} {doctor.specialization ? `(${doctor.specialization})` : ''}
                  </SelectItem>
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
