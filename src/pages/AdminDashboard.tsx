import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Filter, 
  Upload, 
  Clock, 
  FileText, 
  BarChart3,
  TrendingUp,
  AlertCircle,
  Plus,
  MessageSquare,
  Users,
  Activity
} from "lucide-react";
import DocumentUpload from "@/components/DocumentUpload";
import PatientInfoEditor from "@/components/PatientInfoEditor";
import CaseManager from "@/components/CaseManager";
import DocumentManager from "@/components/DocumentManager";
import UserManagement from "@/components/UserManagement";
import ChatPanel from "@/components/ChatPanel";
import { authService } from "@/services/authService";
import { chatService } from "@/services/chatService";
import { PatientCase, Document, User, ActivityLog } from "@/types";
import { toast } from "sonner";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCase, setSelectedCase] = useState<string | null>(null);
  const [isCreatingCase, setIsCreatingCase] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeChatCase, setActiveChatCase] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [unreadChatCount, setUnreadChatCount] = useState(0);

  // Real state management with proper data structure
  const [cases, setCases] = useState<PatientCase[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);

  useEffect(() => {
    const user = authService.getCurrentUser();
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }
    setCurrentUser(user);
    loadInitialData();
    updateUnreadChatCount();
  }, [navigate]);

  const loadInitialData = () => {
    // Load activity logs
    setActivityLogs(authService.getActivityLogs());
  };

  const updateUnreadChatCount = () => {
    const user = authService.getCurrentUser();
    if (user) {
      setUnreadChatCount(chatService.getUnreadCount(user.id, 'admin'));
    }
  };

  const handleCaseUpdate = (updatedCase: PatientCase) => {
    setCases(prev => 
      prev.map(case_ => 
        case_.id === updatedCase.id ? {
          ...updatedCase,
          documentsCount: documents.filter(doc => doc.caseId === updatedCase.id).length,
          lastUpdated: new Date().toISOString()
        } : case_
      )
    );

    // Log activity
    if (currentUser) {
      authService.logActivity(
        currentUser.id,
        currentUser.name,
        currentUser.role,
        'UPDATE_CASE',
        updatedCase.id,
        updatedCase.patientName,
        'Case updated'
      );
      setActivityLogs(authService.getActivityLogs());
    }

    toast.success("Case updated successfully");
  };

  const handleCaseDelete = (caseId: string) => {
    const caseToDelete = cases.find(c => c.id === caseId);
    setCases(prev => prev.filter(case_ => case_.id !== caseId));
    setDocuments(prev => prev.filter(doc => doc.caseId !== caseId));

    // Log activity
    if (currentUser && caseToDelete) {
      authService.logActivity(
        currentUser.id,
        currentUser.name,
        currentUser.role,
        'DELETE_CASE',
        caseId,
        caseToDelete.patientName,
        'Case deleted with all associated documents'
      );
      setActivityLogs(authService.getActivityLogs());
    }

    toast.success("Case and all associated documents deleted successfully");
  };

  const handleCreateCase = (newCase: PatientCase) => {
    const caseWithMetadata: PatientCase = {
      ...newCase,
      documentsCount: 0,
      lastUpdated: new Date().toISOString(),
      createdBy: currentUser?.id || '',
      adminId: currentUser?.id || '',
      adminAssigned: currentUser?.name || ''
    };
    
    setCases(prev => [...prev, caseWithMetadata]);

    // Log activity
    if (currentUser) {
      authService.logActivity(
        currentUser.id,
        currentUser.name,
        currentUser.role,
        'CREATE_CASE',
        newCase.id,
        newCase.patientName,
        'New case created'
      );
      setActivityLogs(authService.getActivityLogs());
    }

    toast.success("New case created successfully");
  };

  const handleDocumentUploaded = (newDocument: Document) => {
    const documentWithMetadata: Document = {
      ...newDocument,
      uploadedById: currentUser?.id || '',
      uploadedBy: currentUser?.name || ''
    };
    
    setDocuments(prev => [...prev, documentWithMetadata]);
    
    // Update case document count
    setCases(prev => 
      prev.map(case_ => 
        case_.id === newDocument.caseId 
          ? { 
              ...case_, 
              documentsCount: case_.documentsCount + 1,
              lastUpdated: new Date().toISOString()
            }
          : case_
      )
    );

    // Log activity
    if (currentUser) {
      const relatedCase = cases.find(c => c.id === newDocument.caseId);
      authService.logActivity(
        currentUser.id,
        currentUser.name,
        currentUser.role,
        'UPLOAD_DOCUMENT',
        newDocument.caseId,
        relatedCase?.patientName,
        `Uploaded document: ${newDocument.name}`
      );
      setActivityLogs(authService.getActivityLogs());
    }

    toast.success("Document uploaded successfully");
  };

  const handleDocumentDeleted = (documentId: string) => {
    const doc = documents.find(d => d.id === documentId);
    if (doc) {
      setDocuments(prev => prev.filter(d => d.id !== documentId));
      
      // Update case document count
      setCases(prev => 
        prev.map(case_ => 
          case_.id === doc.caseId 
            ? { 
                ...case_, 
                documentsCount: Math.max(0, case_.documentsCount - 1),
                lastUpdated: new Date().toISOString()
              }
            : case_
        )
      );

      // Log activity
      if (currentUser) {
        const relatedCase = cases.find(c => c.id === doc.caseId);
        authService.logActivity(
          currentUser.id,
          currentUser.name,
          currentUser.role,
          'DELETE_DOCUMENT',
          doc.caseId,
          relatedCase?.patientName,
          `Deleted document: ${doc.name}`
        );
        setActivityLogs(authService.getActivityLogs());
      }

      toast.success("Document deleted successfully");
    }
  };

  const handleOpenChat = (caseId: string) => {
    setActiveChatCase(caseId);
    setIsChatOpen(true);
    updateUnreadChatCount();
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/');
  };

  const filteredCases = cases.filter(case_ =>
    case_.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    case_.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate real stats
  const totalCases = cases.length;
  const pendingCases = cases.filter(c => c.status === "pending-evaluation" || c.status === "under-review").length;
  const completedCases = cases.filter(c => c.status === "completed").length;
  const highPriorityCases = cases.filter(c => c.priority === "high").length;

  if (!currentUser) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Insurance Administration</h1>
            <p className="text-gray-600">Healthcare Claims Management Platform</p>
          </div>
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              onClick={() => setIsChatOpen(true)}
              className="relative"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Chat
              {unreadChatCount > 0 && (
                <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full min-w-[20px] h-5">
                  {unreadChatCount}
                </Badge>
              )}
            </Button>
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
        <Tabs defaultValue="cases" className="space-y-6">
          <TabsList>
            <TabsTrigger value="cases" className="flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span>Case Management</span>
            </TabsTrigger>
            <TabsTrigger value="upload" className="flex items-center space-x-2">
              <Upload className="h-4 w-4" />
              <span>Document Upload</span>
            </TabsTrigger>
            <TabsTrigger value="documents" className="flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span>Document Management</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>User Management</span>
            </TabsTrigger>
            <TabsTrigger value="activity" className="flex items-center space-x-2">
              <Activity className="h-4 w-4" />
              <span>Activity Log</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>Analytics</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="cases" className="space-y-6">
            {/* Stats Overview */}
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

            {/* Search and Actions */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Case Management</CardTitle>
                    <CardDescription>Manage healthcare claims and track evaluation progress</CardDescription>
                  </div>
                  <Button onClick={() => setIsCreatingCase(true)} className="flex items-center space-x-2">
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

                {/* Cases List */}
                <div className="space-y-4">
                  {filteredCases.map((case_) => (
                    <div key={case_.id} className="relative">
                      <CaseManager
                        case_={case_}
                        onUpdate={handleCaseUpdate}
                        onDelete={handleCaseDelete}
                        onSelectForUpload={setSelectedCase}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenChat(case_.id)}
                        className="absolute top-4 right-4 flex items-center space-x-1"
                      >
                        <MessageSquare className="h-4 w-4" />
                        <span>Chat</span>
                      </Button>
                    </div>
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
          </TabsContent>

          <TabsContent value="upload" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h2 className="text-xl font-semibold mb-4">Upload Documents</h2>
                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Select Case</CardTitle>
                      <CardDescription>Choose a case to upload documents for</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {cases.map((case_) => (
                          <div
                            key={case_.id}
                            className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                              selectedCase === case_.id 
                                ? 'border-blue-500 bg-blue-50' 
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                            onClick={() => setSelectedCase(case_.id)}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium">{case_.patientName}</p>
                                <p className="text-sm text-gray-600">Case {case_.id} • {case_.documentsCount} documents</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
              
              <div>
                {selectedCase ? (
                  <DocumentUpload 
                    caseId={selectedCase}
                    onDocumentUploaded={handleDocumentUploaded}
                  />
                ) : (
                  <Card>
                    <CardContent className="p-12 text-center">
                      <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                      <p className="text-gray-600">Select a case to begin uploading documents</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="documents" className="space-y-6">
            <div className="grid gap-6">
              {cases.map((case_) => (
                <DocumentManager
                  key={case_.id}
                  caseId={case_.id}
                  documents={documents}
                  onDocumentDeleted={handleDocumentDeleted}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <UserManagement />
          </TabsContent>

          <TabsContent value="activity" className="space-y-6">
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
          </TabsContent>

          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>Analytics Dashboard</CardTitle>
                <CardDescription>Track case progress and doctor performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600">Analytics dashboard coming soon</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <PatientInfoEditor
        isOpen={isCreatingCase}
        onClose={() => setIsCreatingCase(false)}
        case_={null}
        onSave={handleCreateCase}
        isNew={true}
      />

      {activeChatCase && (
        <ChatPanel
          caseId={activeChatCase}
          isOpen={isChatOpen}
          onClose={() => {
            setIsChatOpen(false);
            setActiveChatCase(null);
            updateUnreadChatCount();
          }}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
