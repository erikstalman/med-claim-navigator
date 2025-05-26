
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Download, Upload, Database, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';
import { dataService } from '@/services/dataService';

const DataManagement = () => {
  const [stats, setStats] = useState(dataService.getDataStats());
  const [importData, setImportData] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const interval = setInterval(() => {
      setStats(dataService.getDataStats());
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleExport = () => {
    try {
      const data = dataService.exportData();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `claims-platform-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Data exported successfully",
        description: "Backup file has been downloaded",
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Failed to export data",
        variant: "destructive",
      });
    }
  };

  const handleImport = async () => {
    if (!importData.trim()) {
      toast({
        title: "No data provided",
        description: "Please paste the backup data to import",
        variant: "destructive",
      });
      return;
    }

    setIsImporting(true);
    try {
      const success = dataService.importData(importData);
      if (success) {
        setStats(dataService.getDataStats());
        setImportData('');
        toast({
          title: "Data imported successfully",
          description: "All data has been restored from backup",
        });
      } else {
        toast({
          title: "Import failed",
          description: "Invalid backup data format",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Import failed",
        description: "Failed to process backup data",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
  };

  const refreshStats = () => {
    setStats(dataService.getDataStats());
    toast({
      title: "Stats refreshed",
      description: "Data statistics have been updated",
    });
  };

  const getStorageUsage = () => {
    try {
      const data = dataService.exportData();
      const sizeInBytes = new Blob([data]).size;
      const sizeInKB = Math.round(sizeInBytes / 1024);
      return sizeInKB;
    } catch {
      return 0;
    }
  };

  const isRecentBackup = (lastBackup: string) => {
    const backupTime = new Date(lastBackup);
    const now = new Date();
    const diffMinutes = (now.getTime() - backupTime.getTime()) / (1000 * 60);
    return diffMinutes < 5; // Recent if within 5 minutes
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="h-5 w-5" />
            <span>Data Persistence Status</span>
          </CardTitle>
          <CardDescription>
            Monitor and manage platform data storage and backups
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.users}</div>
              <div className="text-sm text-gray-600">Users</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.cases}</div>
              <div className="text-sm text-gray-600">Cases</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.chatMessages}</div>
              <div className="text-sm text-gray-600">Chat Messages</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{stats.documents}</div>
              <div className="text-sm text-gray-600">Documents</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                {isRecentBackup(stats.lastBackup) ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                )}
                <span className="font-medium">Last Backup</span>
              </div>
              <div className="text-sm text-gray-600">
                {new Date(stats.lastBackup).toLocaleString()}
              </div>
              <Badge 
                variant={isRecentBackup(stats.lastBackup) ? "default" : "secondary"}
                className="mt-2"
              >
                {isRecentBackup(stats.lastBackup) ? "Recent" : "Outdated"}
              </Badge>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Database className="h-4 w-4 text-blue-500" />
                <span className="font-medium">Storage Usage</span>
              </div>
              <div className="text-sm text-gray-600">
                {getStorageUsage()} KB
              </div>
              <div className="text-sm text-gray-600">
                Activity Logs: {stats.activityLogs}
              </div>
            </div>
          </div>

          <div className="flex space-x-4">
            <Button onClick={refreshStats} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Stats
            </Button>
            <Button onClick={handleExport} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Backup
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Upload className="h-5 w-5" />
            <span>Data Recovery</span>
          </CardTitle>
          <CardDescription>
            Import backup data to restore system state
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Textarea
              placeholder="Paste backup JSON data here..."
              value={importData}
              onChange={(e) => setImportData(e.target.value)}
              rows={10}
              className="font-mono text-sm"
            />
            <Button 
              onClick={handleImport} 
              disabled={isImporting || !importData.trim()}
              className="w-full"
            >
              {isImporting ? "Importing..." : "Import Backup Data"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Data Persistence Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium">Automatic Features</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Auto-save every 30 seconds</li>
                <li>• Save on tab close/switch</li>
                <li>• Dual storage (primary + backup)</li>
                <li>• Data validation on load</li>
                <li>• Automatic cleanup of old logs</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Recovery Mechanisms</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Backup storage fallback</li>
                <li>• Data integrity validation</li>
                <li>• Export/import functionality</li>
                <li>• Default data initialization</li>
                <li>• Cross-session persistence</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DataManagement;
