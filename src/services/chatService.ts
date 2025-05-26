
import { ChatMessage } from '../types';

class ChatService {
  private messages: ChatMessage[] = [];

  sendMessage(caseId: string, senderId: string, senderName: string, senderRole: 'admin' | 'doctor' | 'system-admin', message: string, recipientRole?: 'admin' | 'doctor' | 'system-admin'): ChatMessage {
    const chatMessage: ChatMessage = {
      id: Date.now().toString(),
      caseId,
      senderId,
      senderName,
      senderRole,
      message,
      timestamp: new Date().toISOString(),
      isRead: false,
      recipientRole
    };
    this.messages.push(chatMessage);
    return chatMessage;
  }

  getMessagesForCase(caseId: string, userRole?: 'admin' | 'doctor' | 'system-admin'): ChatMessage[] {
    return this.messages
      .filter(msg => {
        if (msg.caseId !== caseId) return false;
        
        // If no user role specified, return all messages
        if (!userRole) return true;
        
        // Show message if user is sender or recipient
        if (msg.senderRole === userRole) return true;
        if (msg.recipientRole === userRole || !msg.recipientRole) return true;
        
        return false;
      })
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }

  markAsRead(messageId: string): void {
    const message = this.messages.find(msg => msg.id === messageId);
    if (message) {
      message.isRead = true;
    }
  }

  getUnreadCount(userId: string, userRole: 'admin' | 'doctor' | 'system-admin'): number {
    return this.messages.filter(msg => 
      !msg.isRead && 
      msg.senderId !== userId &&
      (msg.recipientRole === userRole || !msg.recipientRole)
    ).length;
  }

  getUnreadCountForCase(caseId: string, userId: string, userRole: 'admin' | 'doctor' | 'system-admin'): number {
    return this.messages.filter(msg => 
      msg.caseId === caseId &&
      !msg.isRead && 
      msg.senderId !== userId &&
      (msg.recipientRole === userRole || !msg.recipientRole)
    ).length;
  }
}

export const chatService = new ChatService();
