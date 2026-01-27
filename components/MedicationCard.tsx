import React from 'react';
import { Medication } from '../types';
import { PillIcon, TrashIcon, EditIcon } from './Icons';
import ToggleSwitch from './ToggleSwitch';

interface MedicationCardProps {
  medication: Medication;
  isTaken: boolean;
  onToggleTaken: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (medication: Medication) => void;
  onToggleEnabled: (id: string) => void;
}

const MedicationCard: React.FC<MedicationCardProps> = ({ medication, isTaken, onToggleTaken, onDelete, onEdit, onToggleEnabled }) => {
  const isEnabled = medication.enabled;

  return (
    <div
      className={`transition-all duration-300 ease-in-out p-4 rounded-xl flex items-center justify-between animate-slide-up ${isTaken ? 'bg-base-300 opacity-60' : 'bg-base-200'} ${!isEnabled && !isTaken ? 'opacity-50' : ''}`}
      style={{ animationFillMode: 'backwards' }}
    >
      <div className="flex items-center gap-4 flex-1">
        <div className={`transition-colors p-3 rounded-lg ${isTaken ? 'bg-green-500/30 text-green-400' : 'bg-primary/20 text-primary'}`}>
          <PillIcon />
        </div>
        <div onClick={() => !isEnabled ? null : onToggleTaken(medication.id)} className="cursor-pointer">
          <p className={`font-bold text-lg transition-colors ${isTaken ? 'line-through text-neutral/60' : 'text-neutral'}`}>
            {medication.name}
          </p>
          <p className={`text-sm transition-colors ${isTaken ? 'text-neutral/50' : 'text-neutral/70'}`}>{medication.dosage}</p>
          <p className="font-semibold text-primary text-md mt-1">{medication.time}</p>
        </div>
      </div>
      <div className="flex flex-col items-end gap-2">
        <ToggleSwitch
          checked={isEnabled}
          onChange={onToggleEnabled}
        />
        <div className="flex items-center gap-1">
            <button onClick={() => onEdit(medication)} className="p-2 rounded-full hover:bg-primary/20 text-primary/80 transition-colors">
                <EditIcon />
            </button>
            <button onClick={() => onDelete(medication.id)} className="p-2 rounded-full hover:bg-red-500/20 text-red-500 transition-colors">
                <TrashIcon />
            </button>
        </div>
      </div>
    </div>
  );
};

export default MedicationCard;
