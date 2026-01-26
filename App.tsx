import React, { useState, useEffect, useCallback } from 'react';
import { GoogleGenAI } from '@google/genai';
import { useLocalStorage } from './hooks/useLocalStorage';
import { Page, Patient, Medication, Appointment, DiaryEntry } from './types';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import PatientProfile from './components/PatientProfile';
import MedicationList from './components/MedicationList';
import AppointmentList from './components/AppointmentList';
import Diary from './components/Diary';
import HealthTipModal from './components/HealthTipModal';
import NotificationPermission from './components/NotificationPermission';
import SplashScreen from './components/SplashScreen';
import { playAlarmSound } from './utils/sound';

const App: React.FC = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [currentPage, setCurrentPage] = useState<Page>('MEDS');
  const [patient, setPatient] = useLocalStorage<Patient | null>('patient', null);
  const [medications, setMedications] = useLocalStorage<Medication[]>('medications', []);
  const [appointments, setAppointments] = useLocalStorage<Appointment[]>('appointments', []);
  const [diaryEntries, setDiaryEntries] = useLocalStorage<DiaryEntry[]>('diaryEntries', []);
  
  const [healthTip, setHealthTip] = useState<string | null>(null);
  const [isTipLoading, setIsTipLoading] = useState(false);
  const [lastTipDate, setLastTipDate] = useLocalStorage<string | null>('lastTipDate', null);
  const [notificationPermission, setNotificationPermission] = useState(Notification.permission);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2500); // Exibe a splash screen por 2.5 segundos
    return () => clearTimeout(timer);
  }, []);

  const checkAlarms = useCallback(async () => {
    if (notificationPermission !== 'granted') return;

    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const today = now.toISOString().split('T')[0];

    medications.forEach(med => {
      if (med.enabled && med.time === currentTime) {
        new Notification('Lembrete de Medicamento', {
          body: `Hora de tomar seu remédio: ${med.name} (${med.dosage})`,
          icon: '/icon.svg',
        });
        playAlarmSound();
      }
    });

    appointments.forEach(appt => {
      if (appt.enabled && appt.date === today && appt.time === currentTime) {
        new Notification('Lembrete de Consulta', {
          body: `Você tem uma consulta agora: ${appt.title} em ${appt.location}`,
           icon: '/icon.svg',
        });
        playAlarmSound();
      }
    });
    
    const firstMedicationTime = medications
      .filter(m => m.enabled)
      .map(m => m.time)
      .sort()[0];

    if (firstMedicationTime === currentTime && lastTipDate !== today) {
        setIsTipLoading(true);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: 'Dê uma dica de saúde curta, simples e encorajadora para uma pessoa com doença de Parkinson. Concentre-se em um tópico como exercício, dieta, bem-estar mental ou gerenciamento de sintomas. Mantenha-a com menos de 50 palavras e em português.',
            });
            const tip = response.text;
            if (tip) {
              setHealthTip(tip);
              setLastTipDate(today);
            }
        } catch (error) {
            console.error("Erro ao buscar dica de saúde:", error);
            setHealthTip("Lembre-se de se manter hidratado e fazer alongamentos leves hoje. Pequenos passos fazem uma grande diferença!");
            setLastTipDate(today);
        } finally {
            setIsTipLoading(false);
        }
    }

  }, [notificationPermission, medications, appointments, lastTipDate, setLastTipDate]);

  useEffect(() => {
    // Sets up alarm checker
    const interval = setInterval(checkAlarms, 60000); // Check every minute
    
    return () => {
      clearInterval(interval);
    };
  }, [checkAlarms]);

  const renderPage = () => {
    switch (currentPage) {
      case 'APPOINTMENTS':
        return <AppointmentList appointments={appointments} setAppointments={setAppointments} />;
      case 'DIARY':
        return <Diary diaryEntries={diaryEntries} setDiaryEntries={setDiaryEntries} />;
      case 'PROFILE':
        return <PatientProfile patient={patient} setPatient={setPatient} />;
      case 'MEDS':
      default:
        return <MedicationList medications={medications} setMedications={setMedications} />;
    }
  };
  
  const handlePermissionUpdate = (permission: NotificationPermission) => {
    setNotificationPermission(permission);
  }

  if (showSplash) {
    return <SplashScreen patient={patient} />;
  }

  return (
    <div className="flex flex-col h-screen font-sans">
      <Header page={currentPage} patient={patient}/>
      <main className="flex-grow overflow-y-auto p-4 pb-24 bg-base-100">
        {notificationPermission !== 'granted' && (
             <NotificationPermission onPermissionUpdate={handlePermissionUpdate} />
        )}
        {renderPage()}
      </main>
      <BottomNav currentPage={currentPage} setCurrentPage={setCurrentPage} />
      {healthTip && (
        <HealthTipModal tip={healthTip} isLoading={isTipLoading} onClose={() => setHealthTip(null)} />
      )}
    </div>
  );
};

export default App;
