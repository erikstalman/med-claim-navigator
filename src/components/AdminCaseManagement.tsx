
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Plus, Search, Filter, FileText } from "lucide-react";
import CaseManager from "@/components/CaseManager";
import { PatientCase } from "@/types";

interface AdminCaseManagementProps {
  cases: PatientCase[];
  onUpdate: (updatedCase: PatientCase) => void;
  onDelete: (caseId: string) => void;
  onSelectForUpload: (caseId: string) => void;
  onOpenChat: (caseId: string) => void;
  onCreateCase: () => void;
}

const AdminCaseManagement = ({ 
  cases, 
  onUpdate, 
  onDelete, 
  onSelectForUpload, 
  onOpenChat, 
  onCreateCase 
}: AdminCaseManagementProps) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredCases = cases.filter(case_ =>
    case_.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    case_.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Case Management</CardTitle>
            <CardDescription>Manage healthcare claims and track evaluation progress</CardDescription>
          </div>
          <Button onClick={onCreateCase} className="flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>New Case</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search cases by patient name or case ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" className="flex items-center space-x-2">
            <Filter className="h-4 w-4" />
            <span>Filter</span>
          </Button>
        </div>

        <div className="space-y-4">
          {filteredCases.map((case_) => (
            <CaseManager
              key={case_.id}
              case_={case_}
              onUpdate={onUpdate}
              onDelete={onDelete}
              onSelectForUpload={onSelectForUpload}
              onOpenChat={onOpenChat}
            />
          ))}
        </div>

        {filteredCases.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No cases found. Create your first case to get started.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminCaseManagement;
