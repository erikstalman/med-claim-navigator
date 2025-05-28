
import { Card, CardContent } from "@/components/ui/card";
import { FileText, Clock, TrendingUp, AlertCircle } from "lucide-react";
import { PatientCase } from "@/types";

interface AdminStatsOverviewProps {
  cases: PatientCase[];
}

const AdminStatsOverview = ({ cases }: AdminStatsOverviewProps) => {
  const totalCases = cases.length;
  const pendingCases = cases.filter(c => c.status === "pending-evaluation" || c.status === "under-review").length;
  const completedCases = cases.filter(c => c.status === "completed").length;
  const highPriorityCases = cases.filter(c => c.priority === "high").length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Cases</p>
              <p className="text-2xl font-bold text-gray-900">{totalCases}</p>
            </div>
            <FileText className="h-8 w-8 text-blue-600" />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Review</p>
              <p className="text-2xl font-bold text-yellow-600">{pendingCases}</p>
            </div>
            <Clock className="h-8 w-8 text-yellow-600" />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-green-600">{completedCases}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-600" />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">High Priority</p>
              <p className="text-2xl font-bold text-red-600">{highPriorityCases}</p>
            </div>
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminStatsOverview;
