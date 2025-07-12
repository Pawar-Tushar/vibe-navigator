import { useState, useEffect, useRef } from "react";
import { X, Send, Bot, User, ThumbsUp, ThumbsDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

import { chatWithAgent, ChatTurn, AgentApiResponse } from "@/api/app.api";

interface UIMessage {
  id: string;
  role: "user" | "model" | "system"; 
  content: string;
  sources?: AgentApiResponse['sources']; 
}

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChatModal = ({ isOpen, onClose }: ChatModalProps) => {
  const [messages, setMessages] = useState<UIMessage[]>([
    {
      id: "system-init",
      role: "system",
      content:
        "Hi! I'm your Vibe AI Assistant. Ask me to find a cozy cafe, plan a day out, or discover spots that match your mood!",
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const SUPPORTED_CITIES = [
  "pune",
  "mumbai",
  "bangalore",
  "noida",
  "delhi",
  "goa",
  "ahmednagar",
];
function extractFirstCity(text: string): string | null {
  const lowerText = text.toLowerCase();
  return SUPPORTED_CITIES.find(city => lowerText.includes(city)) || null;
}



  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage: UIMessage = {
      id: Date.now().toString(),
      role: "user",
      content: inputValue,
    };

    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      const apiChatHistory: ChatTurn[] = messages
        .filter(msg => msg.role === 'user' || msg.role === 'model')
        .map((msg) => ({
          role: msg.role,
          parts: msg.content,
        }));

      const city = extractFirstCity(inputValue)|| "mumbai";

      if (!city) {
        const systemMessage: UIMessage = {
          id: Date.now().toString(),
          role: "system",
          content: "Please mention one of the supported cities: Pune, Mumbai, Bangalore, Noida, Delhi, Goa, or Ahmednagar.",
        };
        setMessages(prev => [...prev, systemMessage]);
        setIsLoading(false);
        return;
      }

      const data = await chatWithAgent(inputValue, city, apiChatHistory);
      
      const aiMessage: UIMessage = {
        id: (Date.now() + 1).toString(),
        role: "model",
        content: data.reply,
        sources: data.sources,
      };

      setMessages((prevMessages) => [...prevMessages, aiMessage]);

    } catch (error) {
      console.error("Failed to get response from AI agent:", error);
      const errorMessage: UIMessage = {
        id: (Date.now() + 1).toString(),
        role: "model",
        content: "Oops! Something went wrong. I'm having a bit of trouble connecting right now. Please try again in a moment.",
      };
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end md:items-center justify-center p-4">
      <div className="bg-white rounded-t-2xl md:rounded-2xl w-full max-w-xl h-[90vh] md:h-[600px] flex flex-col shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-slate-50 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <Bot className="w-6 h-6 text-cyan-500" />
            <h3 className="font-semibold text-slate-800">Vibe AI Agent</h3>
          </div>
          <Button onClick={onClose} variant="ghost" size="icon" className="text-slate-500 hover:bg-slate-200" disabled={isLoading}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4" ref={scrollAreaRef as any}>
          <div className="space-y-6">
            {messages.map((message) => (
              <div key={message.id} className={`flex items-start gap-3 ${message.role === 'user' ? "flex-row-reverse" : ""}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${message.role === 'user' ? "bg-cyan-500 text-white" : "bg-slate-200 text-slate-600"}`}>
                  {message.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>
                <div className={`max-w-[85%] ${message.role === 'user' ? "text-right" : ""}`}>
                  <div className={`p-3 rounded-2xl ${message.role === 'user' ? "bg-cyan-500 text-white rounded-br-none" : "bg-slate-100 text-slate-800 rounded-bl-none"}`}>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                  </div>
                  {message.sources && message.sources.length > 0 && (
                    <div className="mt-2 text-left space-y-2">
                      <h4 className="text-xs font-semibold text-slate-500">Based on these vibes:</h4>
                      {message.sources.map((source, index) => (
                        <blockquote key={index} className="border-l-2 border-amber-400 pl-2 bg-amber-50/50 p-2 rounded-r-md">
                          <p className="text-xs text-slate-600 italic">"{source.review_text}"</p>
                          <footer className="text-xs text-slate-400 mt-1">- Review for {source.location_name}</footer>
                        </blockquote>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-slate-200 text-slate-600">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="p-3 rounded-2xl bg-slate-100 text-slate-800 rounded-bl-none">
                  <div className="flex items-center gap-1">
                    <span className="h-2 w-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="h-2 w-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="h-2 w-2 bg-slate-400 rounded-full animate-bounce"></span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input */}
        <form onSubmit={handleSend} className="p-4 border-t bg-slate-50 rounded-b-2xl">
          <div className="flex gap-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask for a cozy cafe or plan your day..."
              className="flex-1 rounded-full"
              disabled={isLoading}
            />
            <Button type="submit" size="icon" className="bg-cyan-500 hover:bg-cyan-600 rounded-full flex-shrink-0" disabled={isLoading}>
              <Send className="w-4 h-4 text-white" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
