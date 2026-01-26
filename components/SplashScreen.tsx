import React from 'react';
import { Patient } from '../types';
import { AppIcon } from './Icons';

interface SplashScreenProps {
  patient: Patient | null;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ patient }) => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-base-100 text-neutral animate-fade-in">
      <div className="w-32 h-32 mb-6">
        <AppIcon />
      </div>
      <h1 className="text-4xl font-bold mb-2">Parkinson Care</h1>
      {patient && (
        <div className="text-center mt-4">
          <p className="text-lg text-neutral/80">Bem-vindo(a) de volta,</p>
          <p className="text-2xl font-semibold text-primary">{patient.name}</p>
          <p className="text-md text-neutral/60">{patient.age} anos</p>
        </div>
      )}
    </div>
  );
};

export default SplashScreen;
