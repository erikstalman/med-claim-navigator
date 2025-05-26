
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Send, X } from "lucide-react";
import { chatService } from "@/services/chatService";
import { authService } from "@/services/authService";
import { ChatMessage } from "@/types";

interface ChatPanelProps {
  caseId: string;
  isOpen: boolean;
  onClose: () => void;
}

const ChatPanel = ({ caseId, isOpen, onClose }: ChatPanelProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const currentUser = authService.getCurrentUser();

  useEffect(() => {
    if (isOpen && caseId) {
      loadMessages();
    }
  }, [isOpen, caseId]);

  const loadMessages = () => {
    const caseMessages = chatService.getMessagesForCase(caseId);
    setMessages(caseMessages);
    
    // Mark messages as read
    caseMessages.forEach(msg => {
      if (!msg.isRead && msg.senderId !== currentUser?.id) {
        chatService.markAsRead(msg.id);
      }
    });
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !currentUser) return;

    const message = chatService.sendMessage(
      caseId,
      currentUser.id,
      currentUser.name,
      currentUser.role as 'admin' | 'doctor',
      newMessage
    );

    setMessages(prev => [...prev, message]);
    setNewMessage("");

    // Log activity
    authService.logActivity(
      currentUser.id,
      currentUser.name,
      currentUser.role,
      'SEND_MESSAGE',
      caseId,
      undefined,
      `Sent message in case chat`
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed top-4 right-4 w-96 h-96 z-50">
      <Card className="h-full flex flex-col shadow-lg">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <MessageSquare className="h-5 w-5" />
              <span>Case Chat</span>
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-sm text-gray-600">Case {caseId}</p>
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col p-4">
          <ScrollArea className="flex-1 mb-4">
            <div className="space-y-3">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.senderId === currentUser?.id ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[80%] p-2 rounded-lg ${
                      message.senderId === currentUser?.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-xs font-medium">{message.senderName}</span>
                      <Badge variant="outline" className="text-xs">
                        {message.senderRole}
                      </Badge>
                    </div>
                    <p className="text-sm">{message.message}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
          
          <div className="flex space-x-2">
            <Input
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSendMessage();
                }
              }}
            />
            <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChatPanel;
