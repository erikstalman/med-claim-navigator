
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Send, Bot, User, FileText, ExternalLink } from "lucide-react";

interface AIDocumentChatProps {
  caseId: string;
}

interface Message {
  id: string;
  type: "user" | "ai";
  content: string;
  timestamp: string;
  documentReferences?: {
    documentId: string;
    documentName: string;
    page: number;
  }[];
}

const AIDocumentChat = ({ caseId }: AIDocumentChatProps) => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      type: "ai",
      content: "Hello! I'm here to help you analyze the documents for this case. You can ask me questions about the patient's medical history, accident details, or any specific information you need to complete your evaluation.",
      timestamp: "10:30 AM"
    }
  ]);

  const handleSendMessage = () => {
    if (!message.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: message,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: "ai",
        content: getAIResponse(message),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        documentReferences: [
          {
            documentId: "DOC001",
            documentName: "Medical Records - Emergency Room",
            page: 3
          },
          {
            documentId: "DOC003",
            documentName: "Police Report",
            page: 1
          }
        ]
      };
      setMessages(prev => [...prev, aiResponse]);
    }, 1000);

    setMessage("");
  };

  const getAIResponse = (userMessage: string) => {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes("health") || lowerMessage.includes("condition") || lowerMessage.includes("before")) {
      return "Based on the medical records, the patient had no significant pre-existing conditions. The emergency room report (page 3) indicates the patient was in good health prior to the accident with no chronic medical conditions or previous injuries to the affected area.";
    }
    
    if (lowerMessage.includes("accident") || lowerMessage.includes("trauma") || lowerMessage.includes("violence")) {
      return "The police report (page 1) describes a high-impact motor vehicle collision. The patient's vehicle was struck by another vehicle traveling at approximately 45 mph. The degree of trauma was significant, with substantial vehicle damage documented in the incident photos.";
    }
    
    if (lowerMessage.includes("symptoms") || lowerMessage.includes("complaints") || lowerMessage.includes("initial")) {
      return "The emergency room records show the patient presented with immediate onset of neck pain, headache, and lower back discomfort within 2 hours of the accident. These symptoms were reported to emergency personnel at the scene and documented upon hospital arrival.";
    }
    
    return "I can help you find specific information in the case documents. Try asking about the patient's health condition before the accident, the degree of trauma, initial symptoms, or any other medical details you need for your evaluation.";
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="border-b">
        <CardTitle className="flex items-center space-x-2">
          <Bot className="h-5 w-5 text-blue-600" />
          <span>AI Document Assistant</span>
        </CardTitle>
        <CardDescription>
          Ask questions about the case documents
        </CardDescription>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] p-3 rounded-lg ${
                  msg.type === "user" 
                    ? "bg-blue-600 text-white" 
                    : "bg-gray-100 text-gray-900"
                }`}>
                  <div className="flex items-start space-x-2 mb-2">
                    {msg.type === "ai" ? (
                      <Bot className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    ) : (
                      <User className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      <p className="text-sm">{msg.content}</p>
                      {msg.documentReferences && (
                        <div className="mt-3 space-y-2">
                          <p className="text-xs font-medium">Referenced Documents:</p>
                          {msg.documentReferences.map((ref, index) => (
                            <div key={index} className="flex items-center justify-between">
                              <Badge variant="outline" className="text-xs">
                                <FileText className="h-3 w-3 mr-1" />
                                {ref.documentName} (p. {ref.page})
                              </Badge>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={() => window.open(`/document/${ref.documentId}`, '_blank')}
                              >
                                <ExternalLink className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="text-xs opacity-70 text-right">{msg.timestamp}</p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
        
        <div className="p-4 border-t">
          <div className="flex space-x-2">
            <Input
              placeholder="Ask about the documents..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1"
            />
            <Button 
              onClick={handleSendMessage}
              disabled={!message.trim()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AIDocumentChat;
