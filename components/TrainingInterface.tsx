import React, { useState, useEffect } from 'react';
import { memoryService } from '../services/memoryService';
import { MemoryEntry } from '../types';

interface TrainingInterfaceProps {
  onUpdate: () => void;
}

export const TrainingInterface: React.FC<TrainingInterfaceProps> = ({ onUpdate }) => {
  const [memories, setMemories] = useState<MemoryEntry[]>([]);
  const [newFact, setNewFact] = useState('');

  const refreshMemory = () => {
    setMemories(memoryService.loadMemory());
    onUpdate();
  };

  useEffect(() => {
    refreshMemory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAddFact = () => {
    if (!newFact.trim()) return;
    memoryService.addMemory(newFact);
    setNewFact('');
    refreshMemory();
  };

  const handleDelete = (id: string) => {
    memoryService.deleteMemory(id);
    refreshMemory();
  };

  const handleDownload = () => {
    memoryService.downloadMemory();
  };

  const handleWipe = () => {
    if (confirm('TEM CERTEZA? Isso apagará toda a memória da IA. Ela voltará a ser um bebê.')) {
        memoryService.wipeMemory();
        refreshMemory();
    }
  };

  return (
    <div className="flex flex-col h-full bg-cyber-black p-6 overflow-y-auto font-mono">
      <h2 className="text-xl text-neon-green mb-4 border-b border-neon-green/30 pb-2">
        INTERFACE DE TREINAMENTO NEURAL
      </h2>
      
      <p className="text-gray-400 text-sm mb-6">
        Insira fatos absolutos aqui. A IA usará esses dados como sua única fonte de verdade.
        Sem esses dados, ela não sabe nada sobre o mundo.
      </p>

      {/* Input Section */}
      <div className="mb-8">
        <label className="block text-gray-500 text-xs mb-1 uppercase tracking-widest">Inserir Novo Fato</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={newFact}
            onChange={(e) => setNewFact(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddFact()}
            placeholder="Ex: O céu é azul. Meu nome é João."
            className="flex-1 bg-black border border-white/20 p-3 rounded text-white focus:border-neon-green focus:outline-none"
          />
          <button
            onClick={handleAddFact}
            className="bg-neon-green/10 text-neon-green border border-neon-green/50 px-6 py-2 rounded hover:bg-neon-green/20 uppercase font-bold"
          >
            Gravar
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-4 mb-6">
        <button 
            onClick={handleDownload}
            className="text-xs flex items-center gap-2 text-cyan-400 hover:text-cyan-300 border border-cyan-900 bg-cyan-900/20 px-3 py-1 rounded"
        >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            BAIXAR .TXT
        </button>
        <button 
            onClick={handleWipe}
            className="text-xs flex items-center gap-2 text-red-500 hover:text-red-400 border border-red-900 bg-red-900/10 px-3 py-1 rounded ml-auto"
        >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
            </svg>
            RESETAR CÉREBRO
        </button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto pr-2">
        <h3 className="text-white text-sm mb-3 font-bold">DADOS ARMAZENADOS ({memories.length})</h3>
        <div className="space-y-2">
          {memories.map((mem) => (
            <div key={mem.id} className="group flex items-start gap-3 bg-white/5 p-3 rounded hover:bg-white/10 transition-colors border-l-2 border-neon-green">
              <div className="flex-1">
                <p className="text-gray-200 text-sm">{mem.content}</p>
                <p className="text-[10px] text-gray-600 mt-1 font-mono">
                    ID: {mem.id.slice(0, 8)} | {new Date(mem.timestamp).toLocaleString()}
                </p>
              </div>
              <button 
                onClick={() => handleDelete(mem.id)}
                className="text-gray-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                X
              </button>
            </div>
          ))}
          {memories.length === 0 && (
            <div className="text-gray-700 italic text-sm text-center mt-10">
              Nenhum dado encontrado. A IA é uma página em branco.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};