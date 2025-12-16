import React, { useState } from 'react';
import { AppTab } from './types';
import { ChatInterface } from './components/ChatInterface';
import { TrainingInterface } from './components/TrainingInterface';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.CHAT);
  
  // A mechanism to force re-renders if needed when memory changes,
  // though components fetch data internally on mount/update.
  const [memoryVersion, setMemoryVersion] = useState(0);

  const handleMemoryUpdate = () => {
    setMemoryVersion(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-black text-gray-200 font-sans flex flex-col md:flex-row h-screen overflow-hidden">
      
      {/* Sidebar / Navigation */}
      <aside className="w-full md:w-64 bg-cyber-dark border-r border-white/10 flex flex-col z-10">
        <div className="p-6 border-b border-white/10">
          <h1 className="text-2xl font-bold tracking-tighter text-white">
            TABULA<span className="text-neon-blue">RASA</span>
          </h1>
          <p className="text-xs text-gray-500 mt-1 font-mono">
            PROCESSADOR LOCAL: SIMULADO<br/>
            STATUS: ONLINE
          </p>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <button
            onClick={() => setActiveTab(AppTab.CHAT)}
            className={`w-full text-left px-4 py-3 rounded font-mono text-sm transition-all duration-200 flex items-center gap-3 ${
              activeTab === AppTab.CHAT 
                ? 'bg-neon-blue/10 text-neon-blue border border-neon-blue/40 shadow-[0_0_15px_rgba(0,243,255,0.1)]' 
                : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
            </svg>
            COMUNICAÇÃO
          </button>

          <button
            onClick={() => setActiveTab(AppTab.TRAINING)}
            className={`w-full text-left px-4 py-3 rounded font-mono text-sm transition-all duration-200 flex items-center gap-3 ${
              activeTab === AppTab.TRAINING 
                ? 'bg-neon-green/10 text-neon-green border border-neon-green/40 shadow-[0_0_15px_rgba(0,255,65,0.1)]' 
                : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 0 0-.491 6.347A48.627 48.627 0 0 1 12 20.904a48.627 48.627 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.57 50.57 0 0 0-2.658-.813A59.905 59.905 0 0 1 12 3.493a59.902 59.902 0 0 1 10.499 5.516 50.552 50.552 0 0 0-2.658.813m-15.482 0A50.697 50.697 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5" />
            </svg>
            TREINAMENTO
          </button>
        </nav>

        <div className="p-4 border-t border-white/10 text-[10px] text-gray-600 font-mono">
          <p>MEMÓRIA: LOCALHOST</p>
          <p>CÓRTEX: TABULA RASA</p>
          <p>VERSÃO: 0.1.2-BETA</p>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none"></div>
        
        {activeTab === AppTab.CHAT && (
          <ChatInterface onLearn={handleMemoryUpdate} />
        )}
        
        {activeTab === AppTab.TRAINING && (
          <TrainingInterface onUpdate={handleMemoryUpdate} />
        )}
      </main>
    </div>
  );
};

export default App;