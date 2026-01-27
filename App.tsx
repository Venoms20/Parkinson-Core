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
import MessagePage from './components/MessagePage';
import HealthTipModal from './components/HealthTipModal';
import NotificationPermission from './components/NotificationPermission';
import SplashScreen from './components/SplashScreen';
import AlarmOverlay from './components/AlarmOverlay';
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

  // Estados para o sistema de alarme ativo
  const [activeAlarms, setActiveAlarms] = useState<{meds: Medication[], appts: Appointment[]} | null>(null);
  const [lastNotifiedMinute, setLastNotifiedMinute] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  const checkAlarms = useCallback(async () => {
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const today = now.toISOString().split('T')[0];

    // Evita disparar o alarme múltiplas vezes no mesmo minuto
    if (currentTime === lastNotifiedMinute) return;

    // Filtra medicamentos habilitados para o horário atual
    const medsToTake = medications.filter(med => med.enabled && med.time === currentTime);
    
    // Filtra consultas habilitadas para hoje no horário atual
    const apptsNow = appointments.filter(appt => appt.enabled && appt.date === today && appt.time === currentTime);

    if (medsToTake.length > 0 || apptsNow.length > 0) {
      setLastNotifiedMinute(currentTime);
      setActiveAlarms({ meds: medsToTake, appts: apptsNow });
      
      // Toca som e tenta enviar notificação push
      playAlarmSound();
      
      if (notificationPermission === 'granted') {
        const medNames = medsToTake.map(m => m.name).join(', ');
        const apptNames = apptsNow.map(a => a.title).join(', ');
        const body = [
            medNames ? `Remédios: ${medNames}` : null,
            apptNames ? `Consultas: ${apptNames}` : null
        ].filter(Boolean).join(' | ');

        new Notification('Lembrete Parkinson Care', {
          body: body,
          icon: '/icon.svg',
          tag: 'alarm-' + currentTime, // Agrupa notificações do mesmo minuto
          requireInteraction: true
        });
      }
    }

    // Lógica da dica de saúde (dispara na primeira medicação do dia)
    const firstMedicationTime = medications
      .filter(m => m.enabled)
      .map(m => m.time)
      .sort()[0];

    if (firstMedicationTime === currentTime && lastTipDate !== today && !healthTip) {
        setIsTipLoading(true);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: 'Dê uma dica de saúde curta, simples e encorajadora para uma pessoa com doença de Parkinson. Concentre-se em exercício, dieta, bem-estar mental ou gerenciamento de sintomas. Máximo 40 palavras.',
            });
            const tip = response.text;
            if (tip) {
              setHealthTip(tip);
              setLastTipDate(today);
            }
        } catch (error) {
            setHealthTip("Lembre-se de se manter hidratado e fazer alongamentos leves hoje. Pequenos passos fazem uma grande diferença!");
            setLastTipDate(today);
        } finally {
            setIsTipLoading(false);
        }
    }

  }, [notificationPermission, medications, appointments, lastTipDate, setLastTipDate, lastNotifiedMinute, healthTip]);

  useEffect(() => {
    const interval = setInterval(checkAlarms, 10000); // Checa a cada 10 segundos para maior precisão
    return () => clearInterval(interval);
  }, [checkAlarms]);

  const renderPage = () => {
    switch (currentPage) {
      case 'APPOINTMENTS':
        return <AppointmentList appointments={appointments} setAppointments={setAppointments} />;
      case 'DIARY':
        return <Diary diaryEntries={diaryEntries} setDiaryEntries={setDiaryEntries} />;
      case 'PROFILE':
        return <PatientProfile patient={patient} setPatient={setPatient} />;
      case 'MESSAGE':
        return <MessagePage />;
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
    <div className="flex flex-col h-screen font-sans bg-base-100 overflow-hidden">
      <Header page={currentPage} patient={patient}/>
      <main className="flex-grow overflow-y-auto p-4 pb-24 relative">
        {notificationPermission !== 'granted' && currentPage === 'MEDS' && (
             <NotificationPermission onPermissionUpdate={handlePermissionUpdate} />
        )}
        {renderPage()}
      </main>
      <BottomNav currentPage={currentPage} setCurrentPage={setCurrentPage} />
      
      {/* Alerta de Saúde do Dia */}
      {healthTip && (
        <HealthTipModal tip={healthTip} isLoading={isTipLoading} onClose={() => setHealthTip(null)} />
      )}

      {/* Overlay de Alarme Ativo */}
      {activeAlarms && (
        <AlarmOverlay 
          meds={activeAlarms.meds} 
          appointments={activeAlarms.appts} 
          onDismiss={() => setActiveAlarms(null)} 
        />
      )}
    </div>
  );
};

export default App;
