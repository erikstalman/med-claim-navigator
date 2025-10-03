import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Send, Bot, User, FileText, ExternalLink, MapPin, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { aiService, DocumentChatMessage } from "@/services/aiService";

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
    page?: number;
    highlightText?: string;
    highlightPosition?: { x: number; y: number; width: number; height: number };
    viewerUrl?: string;
  }[];
}

const systemPrompt =
  "You are a medical claims analyst assistant. Provide concise, clinically accurate responses, cite document titles and page numbers when relevant, and highlight key excerpts.";

const AIDocumentChat = ({ caseId }: AIDocumentChatProps) => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  const conversationHistory = useMemo<DocumentChatMessage[]>(() => {
    const history: DocumentChatMessage[] = messages.map(msg => ({
      role: msg.type === "ai" ? "assistant" : "user",
      content: msg.content,
    }));

    return [
      {
        role: "system",
        content: systemPrompt,
      },
      ...history,
    ];
  }, [messages]);

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: message,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages(prev => [...prev, userMessage]);
    setLoading(true);

    const outgoingMessage = message;
    setMessage("");

    try {
      const response = await aiService.sendDocumentChatMessage({
        caseId,
        history: [...conversationHistory, { role: "user", content: outgoingMessage }],
      });

      if (!response.reply) {
        throw new Error("AI assistant returned an empty response");
      }

      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: "ai",
        content: response.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        documentReferences:
          response.references?.map(ref => ({
            documentId: ref.documentId,
            documentName: ref.documentName,
            page: ref.page,
            highlightText: ref.highlightText || ref.snippet,
            highlightPosition: ref.highlightPosition,
            viewerUrl: ref.viewerUrl,
          })) ?? [],
      };

      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error("Error sending AI message", error);
      toast.error(error instanceof Error ? error.message : "Failed to contact AI assistant");
      setMessages(prev => prev.filter(msg => msg.id !== userMessage.id));
    } finally {
      setLoading(false);
    }
  };

  const handleDocumentClick = (ref: Message["documentReferences"][0]) => {
    const highlightParam = ref.highlightPosition
      ? encodeURIComponent(JSON.stringify(ref.highlightPosition))
      : undefined;

    const baseUrl = ref.viewerUrl || `/document/${ref.documentId}`;
    const url = highlightParam
      ? `${baseUrl}?page=${ref.page ?? ""}&highlight=${highlightParam}`
      : `${baseUrl}${ref.page ? `?page=${ref.page}` : ""}`;

    window.open(url, "_blank");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickPrompts: Array<{ label: string; prompt: string }> = [
    {
      label: "Pre-accident health",
      prompt: "What was the patient's health condition before the accident?",
    },
    {
      label: "Trauma assessment",
      prompt: "Assess the degree of trauma during the accident",
    },
    {
      label: "Initial symptoms",
      prompt: "What were the initial symptoms?",
    },
    {
      label: "Form suggestions",
      prompt: "Suggest answers for the evaluation form",
    },
  ];

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
            {messages.length === 0 && (
              <div className="text-sm text-muted-foreground bg-muted rounded-lg p-4">
                Ask about symptoms, pre-accident history, or request form suggestions. The AI will
                reference uploaded documents and highlight supporting evidence.
              </div>
            )}
            {messages.map(msg => (
              <div key={msg.id} className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] p-3 rounded-lg ${
                    msg.type === "user"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-900"
                  }`}
                >
                  <div className="flex items-start space-x-2 mb-2">
                    {msg.type === "ai" ? (
                      <Bot className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    ) : (
                      <User className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      <p className="text-sm whitespace-pre-line">{msg.content}</p>
                      {msg.documentReferences && msg.documentReferences.length > 0 && (
                        <div className="mt-3 space-y-2">
                          <p className="text-xs font-medium">Referenced documents</p>
                          {msg.documentReferences.map((ref, index) => (
                            <div key={index} className="bg-white bg-opacity-90 rounded p-2 border">
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex-1">
                                  <Badge variant="outline" className="text-xs mb-1">
                                    <FileText className="h-3 w-3 mr-1" />
                                    {ref.documentName}
                                    {ref.page && ` (p. ${ref.page})`}
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
                                    onClick={() => window.open(ref.viewerUrl || `/document/${ref.documentId}`, "_blank")}
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

        <div className="p-4 border-t bg-gray-50">
          <div className="mb-3 flex flex-wrap gap-2">
            {quickPrompts.map(({ label, prompt }) => (
              <Button
                key={label}
                variant="outline"
                size="sm"
                onClick={() => setMessage(prompt)}
                className="text-xs"
                disabled={loading}
              >
                {label}
              </Button>
            ))}
          </div>
          <div className="flex space-x-2">
            <Input
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="Ask about the documents or request form suggestions..."
              onKeyDown={handleKeyPress}
              disabled={loading}
            />
            <Button onClick={handleSendMessage} disabled={!message.trim() || loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AIDocumentChat;
