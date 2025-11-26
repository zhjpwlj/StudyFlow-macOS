import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, BrainCircuit, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { ChatMessage } from '../types';
import { createChatSession, sendMessageStream } from '../services/geminiService';
import { Chat, GenerateContentResponse } from "@google/genai";

interface ChatBotProps {
  isWindowed?: boolean;
}

const ChatBot: React.FC<ChatBotProps> = ({ isWindowed = false }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: "Hi! I'm your FocusFlow assistant. How can I help you today?"
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatSessionRef = useRef<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chatSessionRef.current) {
      chatSessionRef.current = createChatSession();
    }
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async () => {
    if (!input.trim() || !chatSessionRef.current) return;

    const userMessage: ChatMessage = { id: Date.now().toString(), role: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const responseId = (Date.now() + 1).toString();
      setMessages(prev => [...prev, { id: responseId, role: 'model', text: '', isThinking: true }]);
      const stream = await sendMessageStream(chatSessionRef.current, userMessage.text);
      let fullText = '';
      for await (const chunk of stream) {
        const chunkText = (chunk as GenerateContentResponse).text;
        if (chunkText) {
          fullText += chunkText;
          setMessages(prev => prev.map(msg => msg.id === responseId ? { ...msg, text: fullText, isThinking: false } : msg));
        }
      }
    } catch (error) {
      console.error("Failed to send message", error);
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: "I'm sorry, I encountered an error. Please try again later." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-transparent">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl p-3 shadow-sm text-sm leading-relaxed ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-bl-none border border-gray-100 dark:border-slate-600'}`}>
              {msg.isThinking && !msg.text ? (
                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                  <BrainCircuit size={16} className="animate-pulse text-indigo-500" />
                  <span className="text-xs font-medium italic">Thinking...</span>
                </div>
              ) : (
                <div className="prose prose-sm dark:prose-invert max-w-none prose-p:my-1 prose-pre:bg-slate-100 dark:prose-pre:bg-slate-800 prose-pre:p-2 prose-pre:rounded-lg">
                  <ReactMarkdown>{msg.text}</ReactMarkdown>
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      {/* Input */}
      <div className="p-4 border-t border-white/20 dark:border-black/20">
        <div className="relative">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
            }}
            placeholder="Ask anything..."
            className="w-full pl-4 pr-12 py-3 bg-white/50 dark:bg-slate-700/50 border-0 rounded-xl focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white resize-none text-sm"
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg transition-colors"
          >
            {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatBot;
