
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Settings, FileText, Users, Activity, Plus, Edit, Trash2 } from "lucide-react";
import { authService } from "@/services/authService";
import { User, AIRule } from "@/types";
import { toast } from "sonner";

const SystemAdminDashboard = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [aiRules, setAiRules] = useState<AIRule[]>([
    {
      id: '1',
      title: 'Medical Evaluation Guidelines',
      content: 'When evaluating medical claims, always consider the severity of injury, pre-existing conditions, and correlation between accident and claimed symptoms.',
      category: 'medical',
      isActive: true,
      createdBy: 'system',
      updatedAt: new Date().toISOString()
    },
    {
      id: '2',
      title: 'Document Analysis Rules',
      content: 'Prioritize official medical records over patient statements. Cross-reference police reports with medical findings.',
      category: 'analysis',
      isActive: true,
      createdBy: 'system',
      updatedAt: new Date().toISOString()
    }
  ]);
  const [isCreatingRule, setIsCreatingRule] = useState(false);
  const [newRule, setNewRule] = useState({
    title: '',
    content: '',
    category: 'medical' as string
  });

  useEffect(() => {
    const user = authService.getCurrentUser();
    if (!user || user.role !== 'system-admin') {
      navigate('/');
      return;
    }
    setCurrentUser(user);
  }, [navigate]);

  const handleCreateRule = () => {
    if (!newRule.title || !newRule.content) {
      toast.error("Please fill in all required fields");
      return;
    }

    const rule: AIRule = {
      id: Date.now().toString(),
      title: newRule.title,
      content: newRule.content,
      category: newRule.category,
      isActive: true,
      createdBy: currentUser?.id || '',
      updatedAt: new Date().toISOString()
    };

    setAiRules(prev => [...prev, rule]);
    setNewRule({ title: '', content: '', category: 'medical' });
    setIsCreatingRule(false);
    toast.success("AI rule created successfully");
  };

  const handleDeleteRule = (ruleId: string) => {
    setAiRules(prev => prev.filter(rule => rule.id !== ruleId));
    toast.success("AI rule deleted successfully");
  };

  const handleToggleRule = (ruleId: string) => {
    setAiRules(prev => prev.map(rule => 
      rule.id === ruleId 
        ? { ...rule, isActive: !rule.isActive, updatedAt: new Date().toISOString() }
        : rule
    ));
    toast.success("AI rule updated successfully");
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/');
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'medical': return 'bg-blue-100 text-blue-800';
      case 'analysis': return 'bg-green-100 text-green-800';
      case 'compliance': return 'bg-purple-100 text-purple-800';
      case 'general': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const users = authService.getAllUsers();
  const activityLogs = authService.getActivityLogs();

  if (!currentUser) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">System Administration</h1>
            <p className="text-gray-600">AI Rules & System Configuration</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-600">
              Welcome, {currentUser.name}
            </div>
            <Button variant="outline" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="p-6">
        <Tabs defaultValue="ai-rules" className="space-y-6">
          <TabsList>
            <TabsTrigger value="ai-rules" className="flex items-center space-x-2">
              <Settings className="h-4 w-4" />
              <span>AI Rules</span>
            </TabsTrigger>
            <TabsTrigger value="system-overview" className="flex items-center space-x-2">
              <Activity className="h-4 w-4" />
              <span>System Overview</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>All Users</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="ai-rules" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>AI Training Rules</CardTitle>
                    <CardDescription>
                      Configure rules that guide AI decision-making and document analysis
                    </CardDescription>
                  </div>
                  <Button onClick={() => setIsCreatingRule(true)} className="flex items-center space-x-2">
                    <Plus className="h-4 w-4" />
                    <span>Add Rule</span>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {aiRules.map((rule) => (
                    <Card key={rule.id} className={!rule.isActive ? 'opacity-50' : ''}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h4 className="font-medium">{rule.title}</h4>
                              <Badge className={getCategoryColor(rule.category)}>
                                {rule.category}
                              </Badge>
                              <Badge variant={rule.isActive ? "default" : "outline"}>
                                {rule.isActive ? "Active" : "Inactive"}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{rule.content}</p>
                            <p className="text-xs text-gray-500">
                              Updated: {new Date(rule.updatedAt).toLocaleString()}
                            </p>
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleToggleRule(rule.id)}
                            >
                              {rule.isActive ? "Deactivate" : "Activate"}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteRule(rule.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {isCreatingRule && (
                  <Card className="mt-6">
                    <CardHeader>
                      <CardTitle>Create New AI Rule</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="rule-title">Rule Title *</Label>
                        <Input
                          id="rule-title"
                          value={newRule.title}
                          onChange={(e) => setNewRule(prev => ({ ...prev, title: e.target.value }))}
                          placeholder="Enter rule title"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="rule-category">Category *</Label>
                        <Select value={newRule.category} onValueChange={(value) => setNewRule(prev => ({ ...prev, category: value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="medical">Medical</SelectItem>
                            <SelectItem value="analysis">Analysis</SelectItem>
                            <SelectItem value="compliance">Compliance</SelectItem>
                            <SelectItem value="general">General</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="rule-content">Rule Content *</Label>
                        <Textarea
                          id="rule-content"
                          value={newRule.content}
                          onChange={(e) => setNewRule(prev => ({ ...prev, content: e.target.value }))}
                          placeholder="Enter detailed rule content and instructions for the AI..."
                          rows={4}
                        />
                      </div>
                      <div className="flex space-x-2">
                        <Button onClick={handleCreateRule}>
                          Create Rule
                        </Button>
                        <Button variant="outline" onClick={() => setIsCreatingRule(false)}>
                          Cancel
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="system-overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Users</p>
                      <p className="text-2xl font-bold text-gray-900">{users.length}</p>
                    </div>
                    <Users className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Active AI Rules</p>
                      <p className="text-2xl font-bold text-green-600">
                        {aiRules.filter(r => r.isActive).length}
                      </p>
                    </div>
                    <Settings className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">System Activity</p>
                      <p className="text-2xl font-bold text-purple-600">{activityLogs.length}</p>
                    </div>
                    <Activity className="h-8 w-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Recent System Activity</CardTitle>
                <CardDescription>Monitor all system activities across all users</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activityLogs.slice(0, 20).map((log) => (
                    <div key={log.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-1">
                          <Badge className="text-xs">
                            {log.userRole}
                          </Badge>
                          <span className="font-medium">{log.userName}</span>
                          <span className="text-sm text-gray-600">{log.action}</span>
                        </div>
                        <p className="text-sm text-gray-600">{log.details}</p>
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(log.timestamp).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>All System Users</CardTitle>
                <CardDescription>Overview of all registered users in the system</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {users.map((user) => (
                    <Card key={user.id} className={!user.isActive ? 'opacity-50' : ''}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h4 className="font-medium">{user.name}</h4>
                              <Badge className={
                                user.role === 'admin' ? 'bg-blue-100 text-blue-800' :
                                user.role === 'doctor' ? 'bg-green-100 text-green-800' :
                                'bg-purple-100 text-purple-800'
                              }>
                                {user.role.replace('-', ' ')}
                              </Badge>
                              {!user.isActive && (
                                <Badge variant="outline" className="text-red-600">
                                  Inactive
                                </Badge>
                              )}
                            </div>
                            <div className="text-sm text-gray-600 space-y-1">
                              <div>Email: {user.email}</div>
                              {user.specialization && <div>Specialization: {user.specialization}</div>}
                              <div>Created: {new Date(user.createdAt).toLocaleDateString()}</div>
                              {user.lastLogin && (
                                <div>Last Login: {new Date(user.lastLogin).toLocaleString()}</div>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SystemAdminDashboard;
