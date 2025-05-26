
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, FileText, Clock, CheckCircle, AlertCircle, LogOut, User, MessageSquare } from "lucide-react";
import ChatPanel from "@/components/ChatPanel";
import { authService } from "@/services/authService";
import { chatService } from "@/services/chatService";
import { PatientCase, User as UserType } from "@/types";

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [assignedCases, setAssignedCases] = useState<PatientCase[]>([]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeChatCase, setActiveChatCase] = useState<string | null>(null);
  const [unreadChatCount, setUnreadChatCount] = useState(0);

  useEffect(() => {
    const user = authService.getCurrentUser();
    if (!user || user.role !== 'doctor') {
      navigate('/');
      return;
    }
    setCurrentUser(user);
    loadAssignedCases(user);
    updateUnreadChatCount(user);
  }, [navigate]);

  const loadAssignedCases = (user: UserType) => {
    // In a real app, this would fetch from an API
    // For now, return empty array since we're starting fresh
    setAssignedCases([]);
    
    // Log activity
    authService.logActivity(
      user.id,
      user.name,
      user.role,
      'VIEW_DASHBOARD',
      undefined,
      undefined,
      'Accessed doctor dashboard'
    );
  };

  const updateUnreadChatCount = (user: UserType) => {
    setUnreadChatCount(chatService.getUnreadCount(user.id, 'doctor'));
  };

  const handleOpenCase = (caseId: string) => {
    if (currentUser) {
      const selectedCase = assignedCases.find(c => c.id === caseId);
      authService.logActivity(
        currentUser.id,
        currentUser.name,
        currentUser.role,
        'OPEN_CASE',
        caseId,
        selectedCase?.patientName,
        'Opened case for review'
      );
    }
    navigate(`/case/${caseId}`);
  };

  const handleOpenChat = (caseId: string) => {
    setActiveChatCase(caseId);
    setIsChatOpen(true);
    if (currentUser) {
      updateUnreadChatCount(currentUser);
    }
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending-evaluation": return <Clock className="h-4 w-4 text-yellow-500" />;
      case "under-review": return <AlertCircle className="h-4 w-4 text-blue-500" />;
      case "completed": return <CheckCircle className="h-4 w-4 text-green-500" />;
      default: return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending-evaluation": return "bg-yellow-100 text-yellow-800";
      case "under-review": return "bg-blue-100 text-blue-800";
      case "completed": return "bg-green-100 text-green-800";
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

  const filteredCases = assignedCases.filter(caseItem => {
    const matchesSearch = caseItem.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         caseItem.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || caseItem.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate stats from assigned cases only
  const pendingCases = assignedCases.filter(c => c.status === "pending-evaluation").length;
  const inReviewCases = assignedCases.filter(c => c.status === "under-review").length;
  const completedCases = assignedCases.filter(c => c.status === "completed").length;
  const totalCases = assignedCases.length;

  if (!currentUser) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <FileText className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">Claims Evaluation Platform</h1>
            </div>
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
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <User className="h-4 w-4" />
              <span>{currentUser.name}</span>
              {currentUser.specialization && (
                <Badge variant="outline" className="text-xs">
                  {currentUser.specialization}
                </Badge>
              )}
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleLogout}
              className="flex items-center space-x-2"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="p-6">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Pending Evaluation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{pendingCases}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Under Review</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{inReviewCases}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{completedCases}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Assigned</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{totalCases}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>My Assigned Cases</CardTitle>
            <CardDescription>Review and evaluate insurance claims assigned to you</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by patient name or case ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending-evaluation">Pending Evaluation</SelectItem>
                  <SelectItem value="under-review">Under Review</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Cases List */}
        <div className="space-y-4">
          {filteredCases.map((caseItem) => (
            <Card key={caseItem.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      {getStatusIcon(caseItem.status)}
                      <h3 className="font-semibold text-lg text-gray-900">
                        {caseItem.patientName}
                      </h3>
                      <Badge variant="outline" className="text-xs">
                        {caseItem.id}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Injury Type:</span>
                        <div>{caseItem.injuryType}</div>
                      </div>
                      <div>
                        <span className="font-medium">Accident Date:</span>
                        <div>{caseItem.accidentDate}</div>
                      </div>
                      <div>
                        <span className="font-medium">Submitted:</span>
                        <div>{caseItem.submissionDate}</div>
                      </div>
                      <div>
                        <span className="font-medium">Documents:</span>
                        <div>{caseItem.documentsCount} files</div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge className={getStatusColor(caseItem.status)}>
                      {caseItem.status.replace("-", " ")}
                    </Badge>
                    <Badge className={getPriorityColor(caseItem.priority)}>
                      {caseItem.priority}
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenChat(caseItem.id)}
                      className="flex items-center space-x-1"
                    >
                      <MessageSquare className="h-4 w-4" />
                      <span>Chat</span>
                    </Button>
                    <Button 
                      onClick={() => handleOpenCase(caseItem.id)}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Review Case
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {assignedCases.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No cases assigned</h3>
              <p className="text-gray-600">
                You don't have any cases assigned yet. Contact your administrator to get cases assigned to you.
              </p>
            </CardContent>
          </Card>
        )}

        {filteredCases.length === 0 && assignedCases.length > 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No cases found</h3>
              <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
            </CardContent>
          </Card>
        )}
      </div>

      {activeChatCase && (
        <ChatPanel
          caseId={activeChatCase}
          isOpen={isChatOpen}
          onClose={() => {
            setIsChatOpen(false);
            setActiveChatCase(null);
            if (currentUser) {
              updateUnreadChatCount(currentUser);
            }
          }}
        />
      )}
    </div>
  );
};

export default DoctorDashboard;
