import React, { useEffect } from 'react';
import { Medication, Appointment } from '../types';
import { PillIcon, BellIcon } from './Icons';
import { triggerHaptic } from '../utils/haptic';

interface AlarmOverlayProps {
  meds: Medication[];
  appointments: Appointment[];
  onDismiss: () => void;
}

const AlarmOverlay: React.FC<AlarmOverlayProps> = ({ meds, onDismiss }) => {
  
  useEffect(() => {
    // Vibração contínua enquanto o overlay estiver aberto
    const vibe = setInterval(() => {
      if ('vibrate' in navigator) {
        navigator.vibrate([400, 100, 400, 100, 700]);
      }
    }, 1500);
    return () => clearInterval(vibe);
  }, []);

  return (
    <div className="fixed inset-0 z-[9999] bg-red-600 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-8 text-center space-y-6 animate-bounce-in">
        <div className="flex justify-center">
          <div className="bg-red-100 p-6 rounded-full animate-pulse">
            <div className="text-red-600 scale-150">
              <BellIcon />
            </div>
          </div>
        </div>
        
        <div className="space-y-2">
          <h2 className="text-red-600 text-3xl font-black uppercase italic">
            Hora do Remédio!
          </h2>
          <p className="text-gray-600 font-medium">Não esqueça sua dose para manter o controle.</p>
        </div>

        <div className="space-y-3">
          {meds.map(med => (
            <div key={med.id} className="bg-gray-50 border-2 border-red-200 p-4 rounded-2xl flex items-center gap-4 text-left">
              <div className="text-red-500"><PillIcon /></div>
              <div>
                <p className="font-bold text-gray-900 text-xl">{med.name}</p>
                <p className="text-gray-500">{med.dosage}</p>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={() => { triggerHaptic(); onDismiss(); }}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-black text-xl py-6 rounded-2xl shadow-lg transition-transform active:scale-95 uppercase"
        >
          ✅ Tomei o Remédio
        </button>
      </div>
      
      <style>{`
        @keyframes bounce-in {
          0% { transform: scale(0.5); opacity: 0; }
          70% { transform: scale(1.1); }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-bounce-in { animation: bounce-in 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
      `}</style>
    </div>
  );
};

export default AlarmOverlay;
