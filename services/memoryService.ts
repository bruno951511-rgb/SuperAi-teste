import { MemoryEntry } from '../types';

const STORAGE_KEY = 'tabularasa_brain_memory';

export const memoryService = {
  // Load full memory
  loadMemory: (): MemoryEntry[] => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.error("Failed to load memory", e);
      return [];
    }
  },

  // Add a new fact/training data
  addMemory: (content: string): MemoryEntry[] => {
    const currentMemory = memoryService.loadMemory();
    const newEntry: MemoryEntry = {
      id: crypto.randomUUID(),
      content: content.trim(),
      timestamp: Date.now()
    };
    const updatedMemory = [...currentMemory, newEntry];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedMemory));
    return updatedMemory;
  },

  // Clear specific memory
  deleteMemory: (id: string): MemoryEntry[] => {
    const currentMemory = memoryService.loadMemory();
    const updatedMemory = currentMemory.filter(m => m.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedMemory));
    return updatedMemory;
  },

  // Clear all memory (Rebirth)
  wipeMemory: (): void => {
    localStorage.removeItem(STORAGE_KEY);
  },

  // Export memory to .txt
  downloadMemory: () => {
    const memory = memoryService.loadMemory();
    const textContent = memory.map(m => `[${new Date(m.timestamp).toLocaleString()}] ${m.content}`).join('\n\n');
    const blob = new Blob([textContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cerebro_ia_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  // Construct the context string for the LLM
  getContextString: (): string => {
    const memory = memoryService.loadMemory();
    if (memory.length === 0) return "Nenhuma memória encontrada. A mente está vazia.";
    
    return memory.map(m => `- ${m.content}`).join('\n');
  }
};