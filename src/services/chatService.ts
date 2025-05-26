
import { ChatMessage } from '../types';
import { dataService } from './dataService';

class ChatService {
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
    dataService.addChatMessage(chatMessage);
    return chatMessage;
  }

  getMessagesForCase(caseId: string, userRole?: 'admin' | 'doctor' | 'system-admin'): ChatMessage[] {
    return dataService.getChatMessages()
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
    const messages = dataService.getChatMessages();
    const message = messages.find(msg => msg.id === messageId);
    if (message) {
      message.isRead = true;
      dataService.updateChatMessage(message);
    }
  }

  getUnreadCount(userId: string, userRole: 'admin' | 'doctor' | 'system-admin'): number {
    return dataService.getChatMessages().filter(msg => 
      !msg.isRead && 
      msg.senderId !== userId &&
      (msg.recipientRole === userRole || !msg.recipientRole)
    ).length;
  }

  getUnreadCountForCase(caseId: string, userId: string, userRole: 'admin' | 'doctor' | 'system-admin'): number {
    return dataService.getChatMessages().filter(msg => 
      msg.caseId === caseId &&
      !msg.isRead && 
      msg.senderId !== userId &&
      (msg.recipientRole === userRole || !msg.recipientRole)
    ).length;
  }
}

export const chatService = new ChatService();
