import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User } from 'lucide-react';
import { getGeminiModel, getModelName } from '../services/gemini';
import { ChatMessage } from '../types';

const ChatSupport: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', role: 'model', text: "Hi there! I'm your wellness companion. How are you feeling today?" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const chatSessionRef = useRef<any>(null);

  useEffect(() => {
    const ai = getGeminiModel();
    try {
        chatSessionRef.current = ai.chats.create({
        model: getModelName(),
        config: {
            systemInstruction: "You are a warm, supportive wellness coach. Keep answers short, encouraging, and helpful. Do not give medical diagnosis.",
        }
        });
    } catch (e) {
        console.error("Chat init error", e);
    }
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    
    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      if (!chatSessionRef.current) {
         const ai = getGeminiModel();
         chatSessionRef.current = ai.chats.create({
            model: getModelName(),
            config: { systemInstruction: "You are a warm, supportive wellness coach." }
         });
      }

      const result = await chatSessionRef.current.sendMessage({ message: userMsg.text });
      const text = result.text;
      
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text
      }]);
    } catch (err: any) {
      console.error(err);
      let errorMessage = "I'm having trouble connecting right now. Please try again.";
      
      if (err.message?.includes('429') || err.message?.includes('quota') || err.message?.includes('exceeded')) {
        errorMessage = "I'm receiving too many messages right now. Please wait a moment.";
      }

      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: errorMessage
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] max-w-4xl mx-auto bg-white rounded-3xl shadow-xl border border-teal-100 overflow-hidden animate-fade-in">
      <div className="bg-teal-600 p-4 text-white flex items-center gap-3 shadow-md">
        <div className="bg-white/20 p-2 rounded-full">
          <Bot className="w-6 h-6" />
        </div>
        <div>
          <h2 className="font-bold text-lg">Caresphere Support</h2>
          <p className="text-teal-100 text-xs">Always here to listen</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex max-w-[85%] gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-indigo-500' : 'bg-teal-500'} text-white shadow-sm`}>
                {msg.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
              </div>
              <div className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${
                msg.role === 'user' 
                  ? 'bg-indigo-600 text-white rounded-tr-none' 
                  : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
              }`}>
                {msg.text}
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
             <div className="bg-white border border-gray-100 p-4 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-2">
                <span className="w-2 h-2 bg-teal-400 rounded-full animate-bounce"></span>
                <span className="w-2 h-2 bg-teal-400 rounded-full animate-bounce delay-75"></span>
                <span className="w-2 h-2 bg-teal-400 rounded-full animate-bounce delay-150"></span>
             </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="p-4 bg-white border-t border-gray-100">
        <div className="flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2 focus-within:ring-2 focus-within:ring-teal-500 transition-all shadow-inner">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type your message..."
            className="flex-1 bg-transparent outline-none text-gray-700 placeholder-gray-400"
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="p-2 bg-teal-600 text-white rounded-full hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatSupport;
