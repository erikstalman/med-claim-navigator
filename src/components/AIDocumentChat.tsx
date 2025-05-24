
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Send, Bot, User, FileText, ExternalLink, MapPin } from "lucide-react";

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
    highlightText?: string;
    highlightPosition?: { x: number; y: number; width: number; height: number };
  }[];
}

const AIDocumentChat = ({ caseId }: AIDocumentChatProps) => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      type: "ai",
      content: "Hello! I'm here to help you analyze the documents for this case. You can ask me questions about the patient's medical history, accident details, or any specific information you need to complete your evaluation. I can also highlight specific sections in documents and suggest answers for your evaluation form.",
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
        documentReferences: getDocumentReferences(message)
      };
      setMessages(prev => [...prev, aiResponse]);
    }, 1000);

    setMessage("");
  };

  const getAIResponse = (userMessage: string) => {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes("health") || lowerMessage.includes("condition") || lowerMessage.includes("before")) {
      return "Based on the medical records, the patient had no significant pre-existing conditions. The emergency room report shows the patient was in good health prior to the accident with no chronic medical conditions or previous injuries to the affected area. I've highlighted the relevant sections in the documents for you to review.";
    }
    
    if (lowerMessage.includes("accident") || lowerMessage.includes("trauma") || lowerMessage.includes("violence")) {
      return "The police report describes a high-impact motor vehicle collision. The patient's vehicle was struck by another vehicle traveling at approximately 45 mph. The degree of trauma was significant, with substantial vehicle damage documented. I've highlighted the specific trauma details in the police report for your review.";
    }
    
    if (lowerMessage.includes("symptoms") || lowerMessage.includes("complaints") || lowerMessage.includes("initial")) {
      return "The emergency room records show the patient presented with immediate onset of neck pain, headache, and lower back discomfort within 2 hours of the accident. These symptoms were reported to emergency personnel at the scene and documented upon hospital arrival. I can highlight these specific symptom descriptions in the medical records.";
    }
    
    if (lowerMessage.includes("suggest") || lowerMessage.includes("help") || lowerMessage.includes("form")) {
      return "I can help you complete the evaluation form by suggesting answers based on the document analysis. For example, I can provide draft text for the 'health condition before accident' section based on the medical history, or help assess the degree of trauma based on the police report. Would you like me to generate suggestions for specific form sections?";
    }
    
    return "I can help you find specific information in the case documents and highlight relevant sections. Try asking about the patient's health condition before the accident, the degree of trauma, initial symptoms, or ask me to suggest answers for specific evaluation form sections.";
  };

  const getDocumentReferences = (userMessage: string) => {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes("health") || lowerMessage.includes("condition") || lowerMessage.includes("before")) {
      return [
        {
          documentId: "DOC001",
          documentName: "Medical Records - Emergency Room",
          page: 2,
          highlightText: "Patient reports no significant medical history. No chronic conditions or previous injuries noted.",
          highlightPosition: { x: 50, y: 150, width: 400, height: 60 }
        }
      ];
    }
    
    if (lowerMessage.includes("accident") || lowerMessage.includes("trauma") || lowerMessage.includes("violence")) {
      return [
        {
          documentId: "DOC003",
          documentName: "Police Report",
          page: 1,
          highlightText: "High-speed collision at approximately 45 mph. Significant vehicle damage observed.",
          highlightPosition: { x: 75, y: 200, width: 350, height: 80 }
        }
      ];
    }
    
    if (lowerMessage.includes("symptoms") || lowerMessage.includes("complaints") || lowerMessage.includes("initial")) {
      return [
        {
          documentId: "DOC001",
          documentName: "Medical Records - Emergency Room",
          page: 3,
          highlightText: "Chief complaint: neck pain, headache, lower back pain. Onset: 2 hours post-accident.",
          highlightPosition: { x: 60, y: 120, width: 380, height: 70 }
        }
      ];
    }
    
    return [
      {
        documentId: "DOC001",
        documentName: "Medical Records - Emergency Room",
        page: 3,
        highlightText: "Relevant medical information highlighted",
        highlightPosition: { x: 100, y: 180, width: 300, height: 50 }
      }
    ];
  };

  const handleDocumentClick = (ref: Message['documentReferences'][0]) => {
    // Open document with highlighting
    const documentUrl = `/document/${ref.documentId}?page=${ref.page}&highlight=${encodeURIComponent(JSON.stringify(ref.highlightPosition))}`;
    window.open(documentUrl, '_blank');
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
          Ask questions about the case documents with intelligent highlighting
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
                          <p className="text-xs font-medium">Referenced Documents with Highlights:</p>
                          {msg.documentReferences.map((ref, index) => (
                            <div key={index} className="bg-white bg-opacity-90 rounded p-2 border">
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <Badge variant="outline" className="text-xs mb-1">
                                    <FileText className="h-3 w-3 mr-1" />
                                    {ref.documentName} (p. {ref.page})
                                  </Badge>
                                  {ref.highlightText && (
                                    <p className="text-xs text-gray-600 italic mt-1">
                                      "{ref.highlightText}"
                                    </p>
                                  )}
                                </div>
                                <div className="flex space-x-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0"
                                    onClick={() => handleDocumentClick(ref)}
                                    title="View highlighted section"
                                  >
                                    <MapPin className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0"
                                    onClick={() => window.open(`/document/${ref.documentId}`, '_blank')}
                                    title="Open document"
                                  >
                                    <ExternalLink className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
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
          <div className="mb-2">
            <div className="flex flex-wrap gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setMessage("What was the patient's health condition before the accident?")}
                className="text-xs h-7"
              >
                Pre-accident health
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setMessage("Assess the degree of trauma during the accident")}
                className="text-xs h-7"
              >
                Trauma degree
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setMessage("What were the initial symptoms?")}
                className="text-xs h-7"
              >
                Initial symptoms
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setMessage("Suggest answers for the evaluation form")}
                className="text-xs h-7"
              >
                Form suggestions
              </Button>
            </div>
          </div>
          <div className="flex space-x-2">
            <Input
              placeholder="Ask about the documents or request form suggestions..."
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
