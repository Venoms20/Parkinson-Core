import React, { useState, useEffect } from 'react';
import { Medication } from '../types';
import { triggerHaptic } from '../utils/haptic';
import { PlusIcon } from './Icons';
import Modal from './Modal';
import { useLocalStorage } from '../hooks/useLocalStorage';
import MedicationCard from './MedicationCard';

interface MedicationListProps {
  medications: Medication[];
  setMedications: React.Dispatch<React.SetStateAction<Medication[]>>;
}

const MedicationList: React.FC<MedicationListProps> = ({ medications, setMedications }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMed, setEditingMed] = useState<Medication | null>(null);
  const [formData, setFormData] = useState({ name: '', dosage: '', time: '' });

  const todayKey = new Date().toISOString().split('T')[0];
  const [takenMeds, setTakenMeds] = useLocalStorage<Record<string, boolean>>(todayKey, {});
  
  useEffect(() => {
    if (editingMed) {
      setFormData({ name: editingMed.name, dosage: editingMed.dosage, time: editingMed.time });
      setIsModalOpen(true);
    } else {
      setFormData({ name: '', dosage: '', time: '' });
    }
  }, [editingMed]);

  const handleOpenAddModal = () => {
    triggerHaptic();
    setEditingMed(null);
    setFormData({ name: '', dosage: '', time: '' });
    setIsModalOpen(true);
  };

  const handleSaveMed = (e: React.FormEvent) => {
    e.preventDefault();
    triggerHaptic();
    if (formData.name && formData.time) {
      if (editingMed) {
        // Update existing med
        setMedications(prev => prev.map(m => m.id === editingMed.id ? { ...m, ...formData } : m));
      } else {
        // Add new med
        setMedications(prev => [...prev, { ...formData, id: Date.now().toString(), enabled: true }]);
      }
      handleCloseModal();
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingMed(null);
  };

  const toggleTaken = (id: string) => {
    triggerHaptic();
    setTakenMeds(prev => ({ ...prev, [id]: !prev[id] }));
  };
  
  const handleToggleEnabled = (id: string) => {
    triggerHaptic();
    setMedications(prev => prev.map(m => m.id === id ? { ...m, enabled: !m.enabled } : m));
  };

  const handleDeleteMed = (id: string) => {
    if (window.confirm('Tem certeza de que deseja excluir este medicamento?')) {
      triggerHaptic();
      setMedications(prev => prev.filter(m => m.id !== id));
    }
  };

  const sortedMeds = [...medications].sort((a, b) => a.time.localeCompare(b.time));

  const morningMeds = sortedMeds.filter(m => m.time < '12:00');
  const afternoonMeds = sortedMeds.filter(m => m.time >= '12:00' && m.time < '18:00');
  const nightMeds = sortedMeds.filter(m => m.time >= '18:00');

  const renderMedGroup = (title: string, meds: Medication[]) => {
    if (meds.length === 0) return null;
    return (
      <div className="mb-8">
        <h2 className="text-xl font-bold text-neutral/80 mb-4">{title}</h2>
        <div className="space-y-4">
          {meds.map(med => (
            <MedicationCard
              key={med.id}
              medication={med}
              isTaken={!!takenMeds[med.id]}
              onToggleTaken={() => toggleTaken(med.id)}
              onDelete={() => handleDeleteMed(med.id)}
              onEdit={() => setEditingMed(med)}
              onToggleEnabled={() => handleToggleEnabled(med.id)}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div>
      {sortedMeds.length === 0 ? (
        <div className="text-center text-neutral/60 p-8 mt-16">
          <p className="text-lg">Nenhum medicamento adicionado.</p>
          <p>Clique no botão '+' para adicionar seu primeiro remédio.</p>
        </div>
      ) : (
        <>
          {renderMedGroup('Manhã', morningMeds)}
          {renderMedGroup('Tarde', afternoonMeds)}
          {renderMedGroup('Noite', nightMeds)}
        </>
      )}

      <button
        onClick={handleOpenAddModal}
        className="fixed bottom-24 right-4 bg-primary text-white w-16 h-16 rounded-full shadow-lg flex items-center justify-center transition-transform transform active:scale-90"
      >
        <PlusIcon />
      </button>

      {isModalOpen && (
        <Modal title={editingMed ? "Editar Medicamento" : "Adicionar Medicamento"} onClose={handleCloseModal}>
          <form onSubmit={handleSaveMed} className="space-y-4">
            <input
              type="text"
              placeholder="Nome do remédio"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className="w-full p-3 bg-base-200 border border-base-300 rounded-lg"
              required
            />
            <input
              type="text"
              placeholder="Dosagem (ex: 1 comprimido)"
              value={formData.dosage}
              onChange={e => setFormData({ ...formData, dosage: e.target.value })}
              className="w-full p-3 bg-base-200 border border-base-300 rounded-lg"
            />
            <input
              type="time"
              value={formData.time}
              onChange={e => setFormData({ ...formData, time: e.target.value })}
              className="w-full p-3 bg-base-200 border border-base-300 rounded-lg"
              required
            />
            <button type="submit" className="w-full bg-primary text-white font-bold py-3 rounded-lg transition-transform transform active:scale-95">
              Salvar
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default MedicationList;
