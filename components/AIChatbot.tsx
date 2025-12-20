
import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Sparkles, Loader2 } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

interface Message {
  role: 'user' | 'model';
  text: string;
}

interface AIChatbotProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AIChatbot: React.FC<AIChatbotProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: "Hi! I'm CraveAI. I'm in thinking mode, which means I can handle your most complex food cravings and culinary questions. What can I solve for you today?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: Message = { role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      const response = await ai.models.generateContent({
        model: "gemini-3-pro-preview",
        contents: [...messages, userMsg].map(m => ({
          role: m.role,
          parts: [{ text: m.text }]
        })),
        config: {
          systemInstruction: "You are CraveAI, a world-class food expert with deep reasoning capabilities. Provide detailed, analytical, and helpful responses to culinary queries.",
          thinkingConfig: { thinkingBudget: 32768 }
        },
      });

      const modelMsg: Message = { role: 'model', text: response.text || "I processed that but couldn't generate a text response." };
      setMessages(prev => [...prev, modelMsg]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'model', text: "I encountered an error during deep thought. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md animate-fade-in" onClick={onClose} />
      <div className="relative bg-white w-full max-w-md h-[80vh] rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden animate-scale-in">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-indigo-600 text-white">
          <div className="flex items-center space-x-3">
            <Sparkles className="w-6 h-6" />
            <h3 className="font-black text-sm uppercase tracking-widest">CraveAI Thinking</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-all">
            <X className="w-6 h-6" />
          </button>
        </div>
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/50 no-scrollbar">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] p-4 rounded-[1.75rem] text-sm font-medium shadow-sm ${
                m.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white text-gray-800 rounded-tl-none border border-gray-100'
              }`}>
                {m.text}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white border border-indigo-100 p-5 rounded-[1.75rem] rounded-tl-none shadow-xl flex items-center space-x-3">
                <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 animate-pulse">Deeply Thinking...</span>
              </div>
            </div>
          )}
        </div>
        <div className="p-6 bg-white border-t border-gray-100 pb-10">
          <div className="flex items-center space-x-3">
            <input 
              type="text" 
              placeholder="Ask anything complex..." 
              className="flex-1 bg-gray-100 rounded-full px-6 py-4 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500/20"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />
            <button 
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="p-4 bg-indigo-600 text-white rounded-full shadow-xl active:scale-90 transition-all disabled:opacity-50"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
