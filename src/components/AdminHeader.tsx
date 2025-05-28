
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageSquare } from "lucide-react";
import { User } from "@/types";

interface AdminHeaderProps {
  currentUser: User;
  unreadChatCount: number;
  onChatOpen: () => void;
  onLogout: () => void;
}

const AdminHeader = ({ currentUser, unreadChatCount, onChatOpen, onLogout }: AdminHeaderProps) => {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Insurance Administration</h1>
          <p className="text-gray-600">Healthcare Claims Management Platform</p>
        </div>
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            onClick={onChatOpen}
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
          <Button variant="outline" onClick={onLogout}>
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
