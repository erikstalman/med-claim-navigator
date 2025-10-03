
import { ChatMessage } from '../types';
import { getDataService } from './dataService';

class ChatService {
  private getService() {
    const service = getDataService();
    if (!service) {
      console.warn('DataService is not available in the current environment.');
    }
    return service;
  }

  sendMessage(caseId: string, senderId: string, senderName: string, senderRole: 'admin' | 'doctor' | 'system-admin', message: string, recipientRole?: 'admin' | 'doctor' | 'system-admin'): ChatMessage {
    const dataService = this.getService();
    if (!dataService) {
      throw new Error('Unable to send message: DataService is unavailable.');
    }

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
    const dataService = this.getService();
    if (!dataService) {
      return [];
    }

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
    const dataService = this.getService();
    if (!dataService) {
      return;
    }

    const messages = dataService.getChatMessages();
    const message = messages.find(msg => msg.id === messageId);
    if (message) {
      message.isRead = true;
      dataService.updateChatMessage(message);
    }
  }

  getUnreadCount(userId: string, userRole: 'admin' | 'doctor' | 'system-admin'): number {
    const dataService = this.getService();
    if (!dataService) {
      return 0;
    }

    return dataService.getChatMessages().filter(msg =>
      !msg.isRead &&
      msg.senderId !== userId &&
      (msg.recipientRole === userRole || !msg.recipientRole)
    ).length;
  }

  getUnreadCountForCase(caseId: string, userId: string, userRole: 'admin' | 'doctor' | 'system-admin'): number {
    const dataService = this.getService();
    if (!dataService) {
      return 0;
    }

    return dataService.getChatMessages().filter(msg =>
      msg.caseId === caseId &&
      !msg.isRead &&
      msg.senderId !== userId &&
      (msg.recipientRole === userRole || !msg.recipientRole)
    ).length;
  }
}

export const chatService = new ChatService();
