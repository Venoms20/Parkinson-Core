import React, { useEffect } from 'react';
import { Medication, Appointment } from '../types';
import { PillIcon, CalendarIcon, BellIcon } from './Icons';
import { triggerHaptic } from '../utils/haptic';

interface AlarmOverlayProps {
  meds: Medication[];
  appointments: Appointment[];
  onDismiss: () => void;
}

const AlarmOverlay: React.FC<AlarmOverlayProps> = ({ meds, appointments, onDismiss }) => {
  
  useEffect(() => {
    // Vibrate in an aggressive pattern while the alarm is active
    const vibrationInterval = setInterval(() => {
      if ('vibrate' in navigator) {
        navigator.vibrate([500, 200, 500, 200, 800]);
      }
    }, 2000);

    return () => clearInterval(vibrationInterval);
  }, []);

  const handleDismiss = () => {
    triggerHaptic();
    onDismiss();
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-red-600 flex items-center justify-center p-4 animate-pulse-fast">
      <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-[0_0_100px_rgba(255,255,255,0.3)] p-8 text-center space-y-8 animate-bounce-in">
        
        <div className="flex justify-center">
          <div className="bg-red-100 p-6 rounded-full animate-ping-slow">
            <div className="text-red-600 scale-150">
                <BellIcon />
            </div>
          </div>
        </div>
        
        <div className="space-y-2">
          <h2 className="text-red-600 text-4xl font-[900] uppercase tracking-tighter leading-none">
            ATENÇÃO AGORA!
          </h2>
          <p className="text-neutral-600 font-bold text-lg">
            Hora de tomar sua medicação
          </p>
        </div>

        <div className="space-y-4 max-h-[45vh] overflow-y-auto py-2 px-2">
          {meds.map(med => (
            <div key={med.id} className="bg-red-50 border-4 border-red-200 p-6 rounded-3xl flex items-center gap-5 text-left transform transition-transform hover:scale-[1.02]">
              <div className="text-red-600 scale-125"><PillIcon /></div>
              <div className="flex-1">
                <p className="font-[900] text-red-900 text-2xl uppercase leading-tight">{med.name}</p>
                <p className="text-xl font-black text-red-700 mt-1">{med.dosage}</p>
              </div>
            </div>
          ))}
          
          {appointments.map(appt => (
            <div key={appt.id} className="bg-blue-50 border-4 border-blue-200 p-6 rounded-3xl flex items-center gap-5 text-left">
              <div className="text-blue-600 scale-125"><CalendarIcon /></div>
              <div className="flex-1">
                <p className="font-[900] text-blue-900 text-2xl uppercase leading-tight">{appt.title}</p>
                <p className="text-xl font-black text-blue-700 mt-1">{appt.time} - {appt.location}</p>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={handleDismiss}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-[900] text-2xl py-7 rounded-3xl shadow-2xl transition-all active:scale-95 uppercase tracking-widest border-b-8 border-red-800"
        >
          CONFIRMAR DOSE
        </button>
      </div>
      
      <style>{`
        @keyframes pulse-fast {
          0%, 100% { background-color: #dc2626; }
          50% { background-color: #991b1b; }
        }
        @keyframes ping-slow {
          0% { transform: scale(1); opacity: 1; }
          75%, 100% { transform: scale(1.4); opacity: 0; }
        }
        @keyframes bounce-in {
          0% { transform: scale(0.3); opacity: 0; }
          50% { transform: scale(1.05); }
          70% { transform: scale(0.9); }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-pulse-fast { animation: pulse-fast 1s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
        .animate-ping-slow { animation: ping-slow 2s cubic-bezier(0, 0, 0.2, 1) infinite; }
        .animate-bounce-in { animation: bounce-in 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
      `}</style>
    </div>
  );
};

export default AlarmOverlay;
