import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import { sendMessageToGemini } from '../services/geminiService';

interface ChatInterfaceProps {
  onLearn: () => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ onLearn }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<{ data: string; mimeType: string } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        const base64Data = base64String.split(',')[1];
        const mimeType = file.type;
        setSelectedImage({ data: base64Data, mimeType });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSend = async () => {
    if ((!input.trim() && !selectedImage) || isLoading) return;

    const userMsg: ChatMessage = {
      role: 'user',
      text: input,
      image: selectedImage ? `data:${selectedImage.mimeType};base64,${selectedImage.data}` : undefined,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    const imageToSend = selectedImage ? { inlineData: { data: selectedImage.data, mimeType: selectedImage.mimeType } } : undefined;
    setSelectedImage(null);
    setIsLoading(true);

    try {
      // Expecting an object { text, thinking } now
      const result = await sendMessageToGemini({
        message: userMsg.text,
        history: messages,
        imagePart: imageToSend
      });
      
      const botMsg: ChatMessage = {
        role: 'model',
        text: result.text,
        thinking: result.thinking,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, botMsg]);

    } catch (error) {
      const errorMsg: ChatMessage = {
        role: 'model',
        text: "ERRO CRÍTICO: Falha na conexão com o núcleo neural.",
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full bg-cyber-black text-white relative overflow-hidden">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 opacity-50">
            <div className="w-20 h-20 border-2 border-dashed border-neon-blue rounded-full animate-spin-slow mb-4 flex items-center justify-center">
                <div className="w-2 h-2 bg-neon-green rounded-full"></div>
            </div>
            <p className="font-mono text-sm tracking-widest">NÚCLEO TABULA RASA: ATIVO</p>
          </div>
        )}
        
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
            
            {/* Thinking Block (Only for Model) */}
            {msg.role === 'model' && msg.thinking && (
                <div className="max-w-[90%] mb-2 animate-fade-in-up">
                    <details className="group">
                        <summary className="cursor-pointer list-none text-[10px] text-neon-blue/70 hover:text-neon-blue font-mono uppercase tracking-widest flex items-center gap-2 mb-1 select-none">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3 h-3 group-open:rotate-90 transition-transform">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                            </svg>
                            Processamento Lógico
                        </summary>
                        <div className="bg-black/40 border-l-2 border-neon-blue/30 p-3 text-xs text-gray-400 font-mono italic whitespace-pre-wrap ml-1 rounded-r">
                            {msg.thinking}
                        </div>
                    </details>
                </div>
            )}

            {/* Message Bubble */}
            <div className={`max-w-[85%] rounded-lg p-4 relative ${
              msg.role === 'user' 
                ? 'bg-blue-900/20 border border-blue-500/30 text-blue-50' 
                : 'bg-zinc-900 border border-zinc-700 text-gray-200'
            }`}>
              {msg.image && (
                <img src={msg.image} alt="Upload" className="max-w-full h-auto rounded mb-3 border border-white/10" />
              )}
              <div className="whitespace-pre-wrap font-sans leading-relaxed text-sm">{msg.text}</div>
              
              {/* Footer Timestamp */}
              <div className="text-[9px] opacity-30 mt-2 text-right font-mono uppercase tracking-wider">
                 {msg.role === 'model' ? 'AI :: ' : 'USER :: '}
                 {new Date(msg.timestamp).toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex flex-col items-start gap-2">
             <div className="text-[10px] text-neon-blue font-mono animate-pulse flex items-center gap-2">
                <div className="w-2 h-2 bg-neon-blue rounded-full"></div>
                PROCESSANDO DADOS...
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-cyber-dark border-t border-white/10">
        {selectedImage && (
            <div className="mb-2 flex items-center gap-2 bg-neon-blue/10 p-2 rounded border border-neon-blue/20 w-fit">
                <span className="text-xs text-neon-blue font-mono">DADOS VISUAIS ANEXADOS</span>
                <button onClick={() => setSelectedImage(null)} className="text-xs text-red-500 hover:text-red-400 ml-2">x</button>
            </div>
        )}
        <div className="flex gap-2">
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="p-3 text-gray-500 hover:text-neon-blue hover:bg-neon-blue/5 border border-transparent hover:border-neon-blue/20 rounded transition-all"
            title="Upload Image"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
            </svg>
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*"
            onChange={handleImageSelect}
          />
          
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Insira dados para processamento..."
            className="flex-1 bg-black border border-white/10 rounded-sm p-3 text-white placeholder-gray-700 focus:outline-none focus:border-neon-green/50 font-mono text-sm resize-none h-12 transition-colors"
          />
          
          <button
            onClick={handleSend}
            disabled={isLoading}
            className="px-6 py-2 bg-white/5 border border-white/10 text-white hover:text-neon-green hover:border-neon-green/50 rounded-sm transition-all font-mono text-xs uppercase tracking-widest disabled:opacity-30"
          >
            EXEC
          </button>
        </div>
      </div>
    </div>
  );
};