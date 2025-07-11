import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Upload, 
  FileText, 
  BarChart3,
  Users,
  Activity,
  UserPlus
} from "lucide-react";
import AdminHeader from "@/components/AdminHeader";
import AdminStatsOverview from "@/components/AdminStatsOverview";
import AdminCaseManagement from "@/components/AdminCaseManagement";
import AdminDocumentUpload from "@/components/AdminDocumentUpload";
import AdminActivityLog from "@/components/AdminActivityLog";
import PatientInfoEditor from "@/components/PatientInfoEditor";
import UserManagement from "@/components/UserManagement";
import ChatPanel from "@/components/ChatPanel";
import CaseAssignment from "@/components/CaseAssignment";
import { authService } from "@/services/authService";
import { chatService } from "@/services/chatService";
import { dataService } from "@/services/dataService";
import { PatientCase, Document, User, ActivityLog } from "@/types";
import { toast } from "sonner";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [selectedCase, setSelectedCase] = useState<string | null>(null);
  const [isCreatingCase, setIsCreatingCase] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeChatCase, setActiveChatCase] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [unreadChatCount, setUnreadChatCount] = useState(0);
  const [activeTab, setActiveTab] = useState("cases");

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
    setCases(dataService.getCases());
    setDocuments(dataService.getDocuments());
    setActivityLogs(dataService.getActivityLogs());
  };

  const updateUnreadChatCount = () => {
    const user = authService.getCurrentUser();
    if (user) {
      setUnreadChatCount(chatService.getUnreadCount(user.id, 'admin'));
    }
  };

  const handleCaseUpdate = (updatedCase: PatientCase) => {
    dataService.updateCase(updatedCase);
    setCases(dataService.getCases());

    if (currentUser) {
      const log = {
        id: Date.now().toString(),
        userId: currentUser.id,
        userName: currentUser.name,
        userRole: currentUser.role,
        action: 'UPDATE_CASE',
        caseId: updatedCase.id,
        caseName: updatedCase.patientName,
        timestamp: new Date().toISOString(),
        details: 'Case updated',
        ipAddress: '127.0.0.1'
      };
      dataService.addActivityLog(log);
      setActivityLogs(dataService.getActivityLogs());
    }

    toast.success("Case updated successfully");
  };

  const handleCaseDelete = (caseId: string) => {
    const caseToDelete = cases.find(c => c.id === caseId);
    dataService.deleteCase(caseId);
    setCases(dataService.getCases());
    setDocuments(dataService.getDocuments().filter(doc => doc.caseId !== caseId));

    if (currentUser && caseToDelete) {
      const log = {
        id: Date.now().toString(),
        userId: currentUser.id,
        userName: currentUser.name,
        userRole: currentUser.role,
        action: 'DELETE_CASE',
        caseId: caseId,
        caseName: caseToDelete.patientName,
        timestamp: new Date().toISOString(),
        details: 'Case deleted with all associated documents',
        ipAddress: '127.0.0.1'
      };
      dataService.addActivityLog(log);
      setActivityLogs(dataService.getActivityLogs());
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
    
    dataService.addCase(caseWithMetadata);
    setCases(dataService.getCases());

    if (currentUser) {
      const log = {
        id: Date.now().toString(),
        userId: currentUser.id,
        userName: currentUser.name,
        userRole: currentUser.role,
        action: 'CREATE_CASE',
        caseId: newCase.id,
        caseName: newCase.patientName,
        timestamp: new Date().toISOString(),
        details: 'New case created',
        ipAddress: '127.0.0.1'
      };
      dataService.addActivityLog(log);
      setActivityLogs(dataService.getActivityLogs());
    }

    toast.success("New case created successfully");
  };

  const handleSelectForUpload = (caseId: string) => {
    setSelectedCase(caseId);
    setActiveTab("upload");
  };

  const handleDocumentUploaded = (newDocument: Document) => {
    const documentWithMetadata: Document = {
      ...newDocument,
      uploadedById: currentUser?.id || '',
      uploadedBy: currentUser?.name || ''
    };
    
    dataService.addDocument(documentWithMetadata);
    setDocuments(dataService.getDocuments());
    
    const updatedCases = cases.map(case_ => 
      case_.id === newDocument.caseId 
        ? { 
            ...case_, 
            documentsCount: case_.documentsCount + 1,
            lastUpdated: new Date().toISOString()
          }
        : case_
    );
    setCases(updatedCases);
    
    const updatedCase = updatedCases.find(c => c.id === newDocument.caseId);
    if (updatedCase) {
      dataService.updateCase(updatedCase);
    }

    if (currentUser) {
      const relatedCase = cases.find(c => c.id === newDocument.caseId);
      const log = {
        id: Date.now().toString(),
        userId: currentUser.id,
        userName: currentUser.name,
        userRole: currentUser.role,
        action: 'UPLOAD_DOCUMENT',
        caseId: newDocument.caseId,
        caseName: relatedCase?.patientName,
        timestamp: new Date().toISOString(),
        details: `Uploaded document: ${newDocument.name}`,
        ipAddress: '127.0.0.1'
      };
      dataService.addActivityLog(log);
      setActivityLogs(dataService.getActivityLogs());
    }

    toast.success("Document uploaded successfully");
  };

  const handleDocumentDeleted = (documentId: string) => {
    const doc = documents.find(d => d.id === documentId);
    if (doc) {
      dataService.deleteDocument(documentId);
      setDocuments(dataService.getDocuments());
      
      const updatedCases = cases.map(case_ => 
        case_.id === doc.caseId 
          ? { 
              ...case_, 
              documentsCount: Math.max(0, case_.documentsCount - 1),
              lastUpdated: new Date().toISOString()
            }
          : case_
      );
      setCases(updatedCases);
      
      const updatedCase = updatedCases.find(c => c.id === doc.caseId);
      if (updatedCase) {
        dataService.updateCase(updatedCase);
      }

      if (currentUser) {
        const relatedCase = cases.find(c => c.id === doc.caseId);
        const log = {
          id: Date.now().toString(),
          userId: currentUser.id,
          userName: currentUser.name,
          userRole: currentUser.role,
          action: 'DELETE_DOCUMENT',
          caseId: doc.caseId,
          caseName: relatedCase?.patientName,
          timestamp: new Date().toISOString(),
          details: `Deleted document: ${doc.name}`,
          ipAddress: '127.0.0.1'
        };
        dataService.addActivityLog(log);
        setActivityLogs(dataService.getActivityLogs());
      }

      toast.success("Document deleted successfully");
    }
  };

  const handleOpenChat = (caseId: string) => {
    setActiveChatCase(caseId);
    setIsChatOpen(true);
    updateUnreadChatCount();
  };

  const handleHeaderChatOpen = () => {
    // If there are cases, open chat for the first case, otherwise show a general notification
    if (cases.length > 0) {
      setActiveChatCase(cases[0].id);
      setIsChatOpen(true);
    } else {
      toast.info("No cases available for chat. Create a case first.");
    }
    updateUnreadChatCount();
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/');
  };

  if (!currentUser) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader
        currentUser={currentUser}
        unreadChatCount={unreadChatCount}
        onChatOpen={handleHeaderChatOpen}
        onLogout={handleLogout}
      />

      <div className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList>
            <TabsTrigger value="cases" className="flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span>Case Management</span>
            </TabsTrigger>
            <TabsTrigger value="upload" className="flex items-center space-x-2">
              <Upload className="h-4 w-4" />
              <span>Document Upload</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>User Management</span>
            </TabsTrigger>
            <TabsTrigger value="assignments" className="flex items-center space-x-2">
              <UserPlus className="h-4 w-4" />
              <span>Case Assignments</span>
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
            <AdminStatsOverview cases={cases} />
            <AdminCaseManagement
              cases={cases}
              onUpdate={handleCaseUpdate}
              onDelete={handleCaseDelete}
              onSelectForUpload={handleSelectForUpload}
              onOpenChat={handleOpenChat}
              onCreateCase={() => setIsCreatingCase(true)}
            />
          </TabsContent>

          <TabsContent value="assignments" className="space-y-6">
            <CaseAssignment />
          </TabsContent>

          <TabsContent value="upload" className="space-y-6">
            <AdminDocumentUpload
              cases={cases}
              selectedCase={selectedCase}
              documents={documents}
              onCaseSelect={setSelectedCase}
              onDocumentUploaded={handleDocumentUploaded}
              onDocumentDeleted={handleDocumentDeleted}
            />
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <UserManagement />
          </TabsContent>

          <TabsContent value="activity" className="space-y-6">
            <AdminActivityLog activityLogs={activityLogs} />
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
