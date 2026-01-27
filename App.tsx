import React, { useState, useEffect, useCallback, useRef } from 'react';
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
import { startAlarmLoop, stopAlarmLoop } from './utils/sound';

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

  const [activeAlarms, setActiveAlarms] = useState<{meds: Medication[], appts: Appointment[]} | null>(null);
  const [lastNotifiedMinute, setLastNotifiedMinute] = useState<string | null>(null);
  
  const wakeLockRef = useRef<any>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  // Gerencia o bloqueio de descanso da tela
  const requestWakeLock = async () => {
    if ('wakeLock' in navigator) {
      try {
        wakeLockRef.current = await (navigator as any).wakeLock.request('screen');
      } catch (err) {
        console.error(`${err.name}, ${err.message}`);
      }
    }
  };

  const releaseWakeLock = () => {
    if (wakeLockRef.current) {
      wakeLockRef.current.release();
      wakeLockRef.current = null;
    }
  };

  const checkAlarms = useCallback(async () => {
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const today = now.toISOString().split('T')[0];

    if (currentTime === lastNotifiedMinute) return;

    const medsToTake = medications.filter(med => med.enabled && med.time === currentTime);
    const apptsNow = appointments.filter(appt => appt.enabled && appt.date === today && appt.time === currentTime);

    if (medsToTake.length > 0 || apptsNow.length > 0) {
      setLastNotifiedMinute(currentTime);
      setActiveAlarms({ meds: medsToTake, appts: apptsNow });
      
      // Inicia som e bloqueia tela
      startAlarmLoop();
      requestWakeLock();
      
      if (notificationPermission === 'granted') {
        new Notification('🚨 HORA DO REMÉDIO! 🚨', {
          body: 'Abra o aplicativo agora para confirmar sua dose.',
          icon: '/icon.svg',
          tag: 'critical-alarm',
          requireInteraction: true,
          silent: false, // Tenta forçar som do sistema
        });
      }
    }

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
                contents: 'Dê uma dica de saúde curta e encorajadora para Parkinson. Máximo 30 palavras.',
            });
            const tip = response.text;
            if (tip) {
              setHealthTip(tip);
              setLastTipDate(today);
            }
        } catch (error) {
            setHealthTip("Lembre-se de beber água regularmente.");
            setLastTipDate(today);
        } finally {
            setIsTipLoading(false);
        }
    }
  }, [notificationPermission, medications, appointments, lastTipDate, setLastTipDate, lastNotifiedMinute, healthTip]);

  useEffect(() => {
    const interval = setInterval(checkAlarms, 5000); // Checa mais frequentemente (5s)
    return () => clearInterval(interval);
  }, [checkAlarms]);

  const handleDismissAlarm = () => {
    stopAlarmLoop();
    releaseWakeLock();
    setActiveAlarms(null);
  };

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
      
      {healthTip && (
        <HealthTipModal tip={healthTip} isLoading={isTipLoading} onClose={() => setHealthTip(null)} />
      )}

      {activeAlarms && (
        <AlarmOverlay 
          meds={activeAlarms.meds} 
          appointments={activeAlarms.appts} 
          onDismiss={handleDismissAlarm} 
        />
      )}
    </div>
  );
};

export default App;
