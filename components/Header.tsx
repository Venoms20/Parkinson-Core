import React from 'react';
import { Page, Patient } from '../types';
import { AppIcon } from './Icons';

interface HeaderProps {
  page: Page;
  patient: Patient | null;
}

const pageTitles: Record<Page, string> = {
  PROFILE: 'Perfil do Paciente',
  MEDS: 'Seu Plano de Hoje',
  APPOINTMENTS: 'Suas Consultas',
  DIARY: 'Seu Diário',
};

const Header: React.FC<HeaderProps> = ({ page, patient }) => {
  const today = new Date();
  const dateString = today.toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'long',
  });

  return (
    <header className="bg-base-100 p-4 sticky top-0 z-10">
      <div className="flex items-center justify-between">
         <div className="flex flex-col">
            <p className="text-sm text-neutral/60">
              Hoje, {dateString}
            </p>
             <h1 className="text-2xl font-bold text-neutral">
              Olá, {patient?.name.split(' ')[0] || 'Paciente'}
            </h1>
         </div>
         <div className="w-10 h-10">
            <AppIcon />
         </div>
      </div>
    </header>
  );
};

export default Header;
