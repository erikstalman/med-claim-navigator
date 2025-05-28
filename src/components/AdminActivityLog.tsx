
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity } from "lucide-react";
import { ActivityLog } from "@/types";

interface AdminActivityLogProps {
  activityLogs: ActivityLog[];
}

const AdminActivityLog = ({ activityLogs }: AdminActivityLogProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Activity className="h-5 w-5" />
          <span>Activity Log</span>
        </CardTitle>
        <CardDescription>Track all user activities for compliance</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activityLogs.slice(0, 50).map((log) => (
            <Card key={log.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-1">
                    <Badge className="text-xs">
                      {log.userRole}
                    </Badge>
                    <span className="font-medium">{log.userName}</span>
                    <span className="text-sm text-gray-600">{log.action}</span>
                  </div>
                  <p className="text-sm text-gray-600">{log.details}</p>
                  {log.caseId && (
                    <p className="text-xs text-gray-500">Case: {log.caseId} - {log.caseName}</p>
                  )}
                </div>
                <div className="text-xs text-gray-500">
                  {new Date(log.timestamp).toLocaleString()}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminActivityLog;
