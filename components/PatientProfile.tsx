import React, { useState, useEffect } from 'react';
import { Patient } from '../types';
import { triggerHaptic } from '../utils/haptic';
import { PhoneIcon, MessageIcon, SaveIcon, EditIcon } from './Icons';

interface PatientProfileProps {
  patient: Patient | null;
  setPatient: React.Dispatch<React.SetStateAction<Patient | null>>;
}

const PatientProfile: React.FC<PatientProfileProps> = ({ patient, setPatient }) => {
  const [isEditing, setIsEditing] = useState(!patient);
  const [formData, setFormData] = useState<Patient>(
    patient || {
      name: '',
      age: '',
      gender: '',
      phone: '',
      emergencyContact: { name: '', phone: '' },
    }
  );

  useEffect(() => {
    if (patient) {
      setFormData(patient);
      setIsEditing(false);
    } else {
      setIsEditing(true);
    }
  }, [patient]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleEmergencyContactChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      emergencyContact: { ...prev.emergencyContact, [name]: value },
    }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    triggerHaptic();
    setPatient(formData);
    setIsEditing(false);
  };
  
  const handleEdit = () => {
      triggerHaptic();
      setIsEditing(true);
  }

  const renderField = (label: string, value: string) => (
    <div className="mb-4">
      <p className="text-sm text-neutral/60">{label}</p>
      <p className="text-lg text-neutral">{value || 'Não informado'}</p>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="bg-base-200 p-6 rounded-xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Informações Pessoais</h2>
           {!isEditing && patient && (
            <button onClick={handleEdit} className="p-2 rounded-full hover:bg-base-300 transition-colors">
              <EditIcon />
            </button>
          )}
        </div>

        {!isEditing && patient ? (
          <div>
            {renderField('Nome', patient.name)}
            {renderField('Idade', patient.age)}
            {renderField('Gênero', patient.gender)}
            {renderField('Telefone', patient.phone)}
          </div>
        ) : (
          <form onSubmit={handleSave}>
             <div className="space-y-4">
                <input type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder="Nome completo" required className="w-full p-3 bg-base-300 border border-base-300 rounded-lg"/>
                <input type="number" name="age" value={formData.age} onChange={handleInputChange} placeholder="Idade" required className="w-full p-3 bg-base-300 border border-base-300 rounded-lg"/>
                <select name="gender" value={formData.gender} onChange={handleInputChange} required className="w-full p-3 bg-base-300 border border-base-300 rounded-lg">
                    <option value="">Selecione o Gênero</option>
                    <option value="Masculino">Masculino</option>
                    <option value="Feminino">Feminino</option>
                    <option value="Outro">Outro</option>
                </select>
                <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="Seu Telefone" className="w-full p-3 bg-base-300 border border-base-300 rounded-lg"/>
             </div>
          </form>
        )}
      </div>

      <div className="bg-base-200 p-6 rounded-xl">
        <h2 className="text-xl font-semibold mb-4">Contato de Emergência</h2>
        {!isEditing && patient ? (
            <div>
                 {renderField('Nome', patient.emergencyContact.name)}
                 {renderField('Telefone', patient.emergencyContact.phone)}
                 {patient.emergencyContact.phone && (
                     <div className="flex space-x-4 mt-4">
                         <a href={`tel:${patient.emergencyContact.phone}`} onClick={triggerHaptic} className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white font-bold py-3 px-4 rounded-lg transition-transform transform active:scale-95">
                            <PhoneIcon /> Ligar
                         </a>
                         <a href={`sms:${patient.emergencyContact.phone}`} onClick={triggerHaptic} className="flex-1 flex items-center justify-center gap-2 bg-sky-600 text-white font-bold py-3 px-4 rounded-lg transition-transform transform active:scale-95">
                            <MessageIcon /> Mensagem
                         </a>
                     </div>
                 )}
            </div>
        ) : (
           <form onSubmit={handleSave} className="space-y-4">
                <input type="text" name="name" value={formData.emergencyContact.name} onChange={handleEmergencyContactChange} placeholder="Nome do contato" required className="w-full p-3 bg-base-300 border border-base-300 rounded-lg"/>
                <input type="tel" name="phone" value={formData.emergencyContact.phone} onChange={handleEmergencyContactChange} placeholder="Telefone do contato" required className="w-full p-3 bg-base-300 border border-base-300 rounded-lg"/>
           </form>
        )}
      </div>
      
      {isEditing && (
         <button onClick={handleSave} className="w-full flex items-center justify-center gap-2 bg-primary text-white font-bold py-4 px-4 rounded-lg transition-transform transform active:scale-95 shadow-lg">
             <SaveIcon /> Salvar Perfil
         </button>
      )}
    </div>
  );
};

export default PatientProfile;
