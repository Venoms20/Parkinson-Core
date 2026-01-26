import React, { useState } from 'react';
import { DiaryEntry } from '../types';
import { triggerHaptic } from '../utils/haptic';
import { PlusIcon, TrashIcon } from './Icons';
import Modal from './Modal';

interface DiaryProps {
  diaryEntries: DiaryEntry[];
  setDiaryEntries: React.Dispatch<React.SetStateAction<DiaryEntry[]>>;
}

const Diary: React.FC<DiaryProps> = ({ diaryEntries, setDiaryEntries }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newEntryContent, setNewEntryContent] = useState('');

  const handleAddEntry = (e: React.FormEvent) => {
    e.preventDefault();
    triggerHaptic();
    if (newEntryContent.trim()) {
      const newEntry: DiaryEntry = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        content: newEntryContent,
      };
      setDiaryEntries(prev => [newEntry, ...prev]);
      setNewEntryContent('');
      setIsModalOpen(false);
    }
  };

  const handleRemoveEntry = (id: string) => {
    triggerHaptic();
    if (window.confirm('Tem certeza de que deseja excluir este registro do diário?')) {
      setDiaryEntries(prev => prev.filter(entry => entry.id !== id));
    }
  };
  
  const sortedEntries = [...diaryEntries].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div>
      {sortedEntries.length === 0 ? (
        <div className="text-center text-neutral/60 p-8 mt-16">
          <p className="text-lg">Nenhum registro no diário.</p>
          <p>Clique no botão '+' para escrever sobre o seu dia.</p>
        </div>
      ) : (
        <ul className="space-y-4">
          {sortedEntries.map(entry => (
            <li key={entry.id} className="bg-base-200 p-4 rounded-xl shadow">
              <div className="flex justify-between items-start">
                <div>
                    <p className="text-sm text-neutral/60 font-semibold">
                    {new Date(entry.date).toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </p>
                    <p className="mt-2 whitespace-pre-wrap text-neutral">{entry.content}</p>
                </div>
                <button onClick={() => handleRemoveEntry(entry.id)} className="p-2 rounded-full hover:bg-red-500/20 text-red-500 transition-colors flex-shrink-0">
                  <TrashIcon />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <button
        onClick={() => { triggerHaptic(); setIsModalOpen(true); }}
        className="fixed bottom-24 right-4 bg-primary text-white w-16 h-16 rounded-full shadow-lg flex items-center justify-center transition-transform transform active:scale-90"
      >
        <PlusIcon />
      </button>

      {isModalOpen && (
        <Modal title="Como você está se sentindo hoje?" onClose={() => setIsModalOpen(false)}>
          <form onSubmit={handleAddEntry} className="space-y-4">
            <textarea
              placeholder="Escreva sobre seu dia, seus sintomas, ou qualquer outra coisa que queira registrar..."
              value={newEntryContent}
              onChange={e => setNewEntryContent(e.target.value)}
              className="w-full h-40 p-3 bg-base-300 border border-base-300 rounded-lg"
              required
            />
            <button type="submit" className="w-full bg-primary text-white font-bold py-3 rounded-lg transition-transform transform active:scale-95">
              Salvar Registro
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default Diary;
