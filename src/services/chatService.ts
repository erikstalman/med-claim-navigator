
import { ChatMessage } from '../types';

class ChatService {
  private messages: ChatMessage[] = [];

  sendMessage(caseId: string, senderId: string, senderName: string, senderRole: 'admin' | 'doctor', message: string): ChatMessage {
    const chatMessage: ChatMessage = {
      id: Date.now().toString(),
      caseId,
      senderId,
      senderName,
      senderRole,
      message,
      timestamp: new Date().toISOString(),
      isRead: false
    };
    this.messages.push(chatMessage);
    return chatMessage;
  }

  getMessagesForCase(caseId: string): ChatMessage[] {
    return this.messages
      .filter(msg => msg.caseId === caseId)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }

  markAsRead(messageId: string): void {
    const message = this.messages.find(msg => msg.id === messageId);
    if (message) {
      message.isRead = true;
    }
  }

  getUnreadCount(userId: string, userRole: 'admin' | 'doctor'): number {
    return this.messages.filter(msg => 
      !msg.isRead && 
      msg.senderRole !== userRole && 
      msg.senderId !== userId
    ).length;
  }
}

export const chatService = new ChatService();
