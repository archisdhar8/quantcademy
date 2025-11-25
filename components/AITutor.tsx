import React, { useState, useRef, useEffect } from 'react';
import { Message } from '../types';
import { chatWithTutor } from '../services/geminiService';
import { jsPDF } from 'jspdf';

interface QuickAction {
    label: string;
    prompt: string;
    icon?: string;
}

interface AITutorProps {
  context: string;
  initialMessage?: string;
  quickActions?: QuickAction[];
}

const AITutor: React.FC<AITutorProps> = ({ context, initialMessage, quickActions }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMsg, setInputMsg] = useState("");
  const [isChatting, setIsChatting] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isChatting]);

  const handleSendMessage = async (msgText: string = inputMsg) => {
    if (!msgText.trim()) return;
    
    // Check for special PDF generation command
    if (msgText.includes("Generate a research report PDF")) {
        generatePDF();
        return;
    }

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: msgText };
    setMessages(prev => [...prev, userMsg]);
    setInputMsg("");
    setIsChatting(true);

    const fullPrompt = `[Context: ${context}] User Question: ${msgText}`;
    const botResponseText = await chatWithTutor(messages, fullPrompt);
    
    const botMsg: Message = { id: (Date.now() + 1).toString(), role: 'model', content: botResponseText };
    setMessages(prev => [...prev, botMsg]);
    setIsChatting(false);
  };

  const generatePDF = () => {
      const doc = new jsPDF();
      doc.setFontSize(18);
      doc.text("QuantCademy Research Report", 10, 10);
      doc.setFontSize(12);
      doc.text(`Context: ${context}`, 10, 20);
      
      let y = 30;
      messages.forEach(m => {
          if (y > 280) { doc.addPage(); y = 10; }
          const role = m.role === 'user' ? "User: " : "AI: ";
          const lines = doc.splitTextToSize(role + m.content, 180);
          doc.text(lines, 10, y);
          y += (lines.length * 7) + 5;
      });

      doc.save("research_report.pdf");
      
      const botMsg: Message = { 
          id: Date.now().toString(), 
          role: 'model', 
          content: "✅ I've generated the PDF report for you. Check your downloads." 
      };
      setMessages(prev => [...prev, botMsg]);
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 border-l border-slate-800 w-80 shrink-0">
      <div className="p-3 border-b border-slate-800 bg-slate-900 shadow-sm z-10">
          <h3 className="font-semibold text-slate-200 text-sm flex items-center">
              <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
              Quant AI Tutor
          </h3>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
          {messages.length === 0 && (
              <div className="flex flex-col items-center text-center text-slate-500 mt-10 space-y-2">
                  <div className="bg-slate-800 p-3 rounded-full">
                      <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                  </div>
                  <p className="text-xs">{initialMessage || "Any questions about the charts or logic? I'm here to help."}</p>
              </div>
          )}
          
          {messages.map((m) => (
              <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[90%] rounded-2xl px-4 py-2 text-xs shadow-md whitespace-pre-wrap ${m.role === 'user' ? 'bg-emerald-600 text-white rounded-br-none' : 'bg-slate-800 text-slate-300 rounded-bl-none border border-slate-700'}`}>
                      {m.content}
                  </div>
              </div>
          ))}
          
          {isChatting && (
               <div className="flex justify-start">
                  <div className="bg-slate-800 text-slate-400 rounded-2xl rounded-bl-none px-4 py-2 text-xs border border-slate-700 flex items-center space-x-1">
                      <span>Thinking</span>
                      <span className="animate-bounce">.</span>
                      <span className="animate-bounce delay-100">.</span>
                      <span className="animate-bounce delay-200">.</span>
                  </div>
              </div>
          )}
          <div ref={chatEndRef} />
      </div>

      {/* Quick Actions Panel */}
      {quickActions && quickActions.length > 0 && (
          <div className="p-2 border-t border-slate-800 bg-slate-900/50 flex flex-wrap gap-2 justify-center">
              {quickActions.map((action, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(action.prompt)}
                    className="text-[10px] bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 px-2 py-1 rounded-full transition-colors flex items-center"
                  >
                     {action.icon && <span className="mr-1">{action.icon}</span>}
                     {action.label}
                  </button>
              ))}
          </div>
      )}

      <div className="p-3 border-t border-slate-800 bg-slate-900">
          <div className="flex space-x-2 relative">
              <input 
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-lg pl-3 pr-10 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all placeholder-slate-600"
                  placeholder="Ask a question..."
                  value={inputMsg}
                  onChange={(e) => setInputMsg(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              <button 
                  onClick={() => handleSendMessage()}
                  className="absolute right-1 top-1 bottom-1 px-2 text-emerald-500 hover:text-emerald-400 hover:bg-emerald-500/10 rounded transition-colors"
              >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
              </button>
          </div>
      </div>
    </div>
  );
};

export default AITutor;