import React, { useState, useRef } from 'react';
import { Bot, Send, User, RefreshCw, Key } from 'lucide-react';
import { ChatMessage } from '../../types';
import { sendBharatAIChat, getCustomGeminiKey } from '../../lib/api';
import { ApiKeyModal } from '../ApiKeyModal';

export const BharatAITab: React.FC = () => {
  const [input, setInput] = useState('');
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem('bharat_ai_tab_chat_history');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return [
      {
        id: 'msg-welcome',
        sender: 'assistant',
        text: 'Namaste! 🧪🔬 I am Bharat AI, your veteran scientist and research mentor on Curious Bharat. I am here to help you understand the deep physical logic, first principles, and experimental reasoning behind Science, Math, and natural phenomena. What curiosity or question are we exploring today? 🌌⚡',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ];
  });
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const saveChatHistory = (newMessages: ChatMessage[]) => {
    setMessages(newMessages);
    try {
      localStorage.setItem('bharat_ai_tab_chat_history', JSON.stringify(newMessages.slice(-20)));
    } catch {
      // ignore
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || input.trim();
    if (!query || isTyping) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const updated = [...messages, userMsg];
    saveChatHistory(updated);
    if (!textToSend) setInput('');
    setIsTyping(true);
    scrollToBottom();

    try {
      const res = await sendBharatAIChat(query, messages);
      const aiMsg: ChatMessage = {
        id: `msg-ai-${Date.now()}`,
        sender: 'assistant',
        text: res.text || 'I am here to help you solve your doubts step by step!',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      saveChatHistory([...updated, aiMsg]);
    } catch (err) {
      saveChatHistory([
        ...updated,
        {
          id: `msg-err-${Date.now()}`,
          sender: 'assistant',
          text: 'Sorry, I had trouble connecting to Bharat AI server. Please try asking again!',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsTyping(false);
      scrollToBottom();
    }
  };

  const handleClearChat = () => {
    const welcomeMsg: ChatMessage[] = [
      {
        id: `msg-welcome-${Date.now()}`,
        sender: 'assistant',
        text: 'Chat history cleared. How can Bharat AI assist your study session today?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ];
    saveChatHistory(welcomeMsg);
  };

  const promptSuggestions = [
    'Explain Newton\'s 3rd Law with real-world examples',
    'How does DNA replication work in cells?',
    'What is the difference between ionic and covalent bonds?',
    'Derive the quadratic formula step by step',
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-115px)] w-full">
      
      {/* Main Fullscreen Chat Window */}
      <div className="bg-white border border-[#E6DCCF] rounded-2xl flex flex-col shadow-xs overflow-hidden flex-1 h-full">
        
        {/* Clean Chat Header */}
        <div className="p-3 bg-[#FAF6F0] border-b border-[#E6DCCF] flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-[#B85B14] text-white flex items-center justify-center font-bold shadow-xs">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <span className="text-sm font-black text-[#382820]">Bharat AI</span>
              <p className="text-[10px] text-[#4D6B40] font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#6A7B58] animate-pulse"></span>
                Active & Ready to Solve
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-1.5">
            <button
              onClick={() => setIsApiKeyModalOpen(true)}
              title="Gemini AI Key Settings"
              className={`px-2.5 py-1 rounded-lg border text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                getCustomGeminiKey()
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                  : 'bg-white border-[#E6DCCF] text-[#7A6B63] hover:text-[#382820]'
              }`}
            >
              <Key className="w-3 h-3 text-[#B85B14]" />
              <span>{getCustomGeminiKey() ? 'Key Active' : 'AI Key'}</span>
            </button>

            <button
              onClick={handleClearChat}
              title="Clear Chat History"
              className="px-2.5 py-1 rounded-lg bg-white border border-[#E6DCCF] text-[#7A6B63] hover:text-[#382820] text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              Clear
            </button>
          </div>
        </div>

        {/* Chat History View */}
        <div className="flex-1 p-3.5 overflow-y-auto space-y-3 text-xs bg-[#FAF6F0]">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-2 ${
                msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] shrink-0 font-bold ${
                  msg.sender === 'user'
                    ? 'bg-[#B85B14] text-white'
                    : 'bg-[#C86D27] text-white'
                }`}
              >
                {msg.sender === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
              </div>

              <div
                className={`max-w-[82%] p-3 rounded-2xl whitespace-pre-wrap leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-[#B85B14] text-white rounded-tr-none shadow-xs font-medium'
                    : 'bg-white border border-[#E6DCCF] text-[#382820] rounded-tl-none shadow-xs font-medium'
                }`}
              >
                <p className="font-medium text-xs">{msg.text}</p>
                <span className="text-[9px] opacity-70 mt-1 block text-right font-normal">{msg.timestamp}</span>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center space-x-2 text-[#7A6B63] text-xs py-1">
              <div className="w-6 h-6 rounded-lg bg-[#F3E8DB] flex items-center justify-center">
                <Bot className="w-3.5 h-3.5 text-[#B85B14] animate-bounce" />
              </div>
              <div className="flex space-x-1 items-center bg-white border border-[#E6DCCF] px-3 py-2 rounded-xl shadow-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-[#B85B14] animate-pulse"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#B85B14] animate-pulse delay-100"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#B85B14] animate-pulse delay-200"></span>
                <span className="text-[10px] text-[#7A6B63] ml-1 font-medium">Bharat AI is analyzing...</span>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        {messages.length < 4 && (
          <div className="px-3 py-2 bg-white border-t border-[#E6DCCF] flex gap-1.5 overflow-x-auto scrollbar-none shrink-0">
            {promptSuggestions.map((promptText, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(promptText)}
                className="shrink-0 text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#FAF6F0] hover:bg-[#F3E8DB] border border-[#E6DCCF] text-[#382820] transition-colors"
              >
                💡 {promptText}
              </button>
            ))}
          </div>
        )}

        {/* Input Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="p-3 bg-white border-t border-[#E6DCCF] flex items-center gap-2 shrink-0"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your question or concept doubt..."
            className="flex-1 bg-[#FAF6F0] border border-[#E6DCCF] rounded-xl px-3.5 py-2.5 text-xs text-[#382820] placeholder-[#7A6B63]/60 focus:outline-none focus:border-[#B85B14] font-medium"
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="p-2.5 rounded-xl bg-[#B85B14] hover:bg-[#A04812] disabled:opacity-50 text-white font-bold transition-all shadow-xs shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

        {/* ApiKeyModal for BharatAITab */}
        <ApiKeyModal
          isOpen={isApiKeyModalOpen}
          onClose={() => setIsApiKeyModalOpen(false)}
        />

      </div>
    </div>
  );
};
