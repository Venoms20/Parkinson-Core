import React from 'react';
import { Medication, Appointment } from '../types';
import { PillIcon, CalendarIcon, BellIcon } from './Icons';
import { triggerHaptic } from '../utils/haptic';

interface AlarmOverlayProps {
  meds: Medication[];
  appointments: Appointment[];
  onDismiss: () => void;
}

const AlarmOverlay: React.FC<AlarmOverlayProps> = ({ meds, appointments, onDismiss }) => {
  const handleDismiss = () => {
    triggerHaptic();
    onDismiss();
  };

  return (
    <div className="fixed inset-0 z-[100] bg-primary flex items-center justify-center p-6 animate-fade-in">
      <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl p-8 text-center space-y-6 animate-slide-up">
        <div className="flex justify-center">
          <div className="bg-primary/10 p-5 rounded-full animate-bounce">
            <BellIcon />
          </div>
        </div>
        
        <div className="space-y-2">
          <h2 className="text-primary text-3xl font-black uppercase tracking-tight">Hora do Cuidado!</h2>
          <p className="text-neutral-500 font-medium italic">Não esqueça seus compromissos de saúde</p>
        </div>

        <div className="space-y-4 max-h-[40vh] overflow-y-auto py-2">
          {meds.map(med => (
            <div key={med.id} className="bg-primary/5 border border-primary/10 p-4 rounded-2xl flex items-center gap-4 text-left">
              <div className="text-primary"><PillIcon /></div>
              <div>
                <p className="font-bold text-primary-900 leading-tight">{med.name}</p>
                <p className="text-sm text-primary/70">{med.dosage}</p>
              </div>
            </div>
          ))}
          
          {appointments.map(appt => (
            <div key={appt.id} className="bg-blue-50 border border-blue-100 p-4 rounded-2xl flex items-center gap-4 text-left">
              <div className="text-blue-600"><CalendarIcon /></div>
              <div>
                <p className="font-bold text-blue-900 leading-tight">{appt.title}</p>
                <p className="text-sm text-blue-700/70">{appt.location}</p>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={handleDismiss}
          className="w-full bg-primary hover:bg-primary/90 text-white font-black text-xl py-5 rounded-2xl shadow-xl transition-all active:scale-95 uppercase tracking-widest"
        >
          Confirmar e Silenciar
        </button>
      </div>
    </div>
  );
};

export default AlarmOverlay;
