import React, { useState } from 'react';
import { Appointment } from '../types';
import { triggerHaptic } from '../utils/haptic';
import { PlusIcon, TrashIcon, CalendarIcon } from './Icons';
import Modal from './Modal';

interface AppointmentListProps {
  appointments: Appointment[];
  setAppointments: React.Dispatch<React.SetStateAction<Appointment[]>>;
}

const AppointmentList: React.FC<AppointmentListProps> = ({ appointments, setAppointments }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newAppt, setNewAppt] = useState({ title: '', location: '', date: '', time: '' });

  const handleAddAppt = (e: React.FormEvent) => {
    e.preventDefault();
    triggerHaptic();
    if (newAppt.title && newAppt.date && newAppt.time) {
      setAppointments(prev => [...prev, { ...newAppt, id: Date.now().toString(), enabled: true }]);
      setNewAppt({ title: '', location: '', date: '', time: '' });
      setIsModalOpen(false);
    }
  };

  const handleRemoveAppt = (id: string) => {
    triggerHaptic();
    if (window.confirm('Tem certeza de que deseja excluir esta consulta?')) {
      setAppointments(prev => prev.filter(appt => appt.id !== id));
    }
  };

  const sortedAppts = [...appointments].sort((a, b) => new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime());

  return (
    <div>
      {sortedAppts.length === 0 ? (
        <div className="text-center text-neutral/60 p-8 mt-16">
          <p className="text-lg">Nenhuma consulta marcada.</p>
          <p>Clique no botão '+' para adicionar sua primeira consulta.</p>
        </div>
      ) : (
        <ul className="space-y-4">
          {sortedAppts.map(appt => (
            <li key={appt.id} className="bg-base-200 p-4 rounded-xl shadow flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="bg-blue-500/20 text-blue-400 p-3 rounded-lg">
                    <CalendarIcon />
                </div>
                <div>
                  <p className="font-bold text-lg text-neutral">{appt.title}</p>
                  <p className="text-neutral/60">{appt.location}</p>
                  <p className="text-primary font-semibold text-md mt-1">{new Date(appt.date + 'T00:00:00').toLocaleDateString('pt-BR')} às {appt.time}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button onClick={() => handleRemoveAppt(appt.id)} className="p-2 rounded-full hover:bg-red-500/20 text-red-500 transition-colors">
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
        <Modal title="Agendar Consulta" onClose={() => setIsModalOpen(false)}>
          <form onSubmit={handleAddAppt} className="space-y-4">
            <input
              type="text"
              placeholder="Título da consulta (ex: Neurologista)"
              value={newAppt.title}
              onChange={e => setNewAppt({ ...newAppt, title: e.target.value })}
              className="w-full p-3 bg-base-300 border border-base-300 rounded-lg"
              required
            />
            <input
              type="text"
              placeholder="Local (ex: Hospital Central)"
              value={newAppt.location}
              onChange={e => setNewAppt({ ...newAppt, location: e.target.value })}
              className="w-full p-3 bg-base-300 border border-base-300 rounded-lg"
            />
            <input
              type="date"
              value={newAppt.date}
              onChange={e => setNewAppt({ ...newAppt, date: e.target.value })}
              className="w-full p-3 bg-base-300 border border-base-300 rounded-lg"
              required
            />
            <input
              type="time"
              value={newAppt.time}
              onChange={e => setNewAppt({ ...newAppt, time: e.target.value })}
              className="w-full p-3 bg-base-300 border border-base-300 rounded-lg"
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

export default AppointmentList;
