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
      
      // Decide se mostra o overlay (app aberto) ou envia pro SW (app fechado/fundo)
      const isAppVisible = document.visibilityState === 'visible';

      if (isAppVisible) {
        setActiveAlarms({ meds: medsToTake, appts: apptsNow });
        startAlarmLoop();
        requestWakeLock();
      }

      // Sempre tenta disparar a notificação de sistema para garantir visibilidade fora do app
      if (notificationPermission === 'granted' && 'serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then(registration => {
          registration.active?.postMessage({
            type: 'TRIGGER_ALARM',
            payload: { meds: medsToTake, appts: apptsNow }
          });
        });
      }
    }

    // Dica de Saúde
    const firstMedicationTime = medications.filter(m => m.enabled).map(m => m.time).sort()[0];
    if (firstMedicationTime === currentTime && lastTipDate !== today && !healthTip) {
        setIsTipLoading(true);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: 'Dê uma dica de saúde curta para Parkinson. Máximo 25 palavras.',
            });
            const tip = response.text;
            if (tip) {
              setHealthTip(tip);
              setLastTipDate(today);
            }
        } catch (error) {
            setHealthTip("Exercícios leves de alongamento podem ajudar na rigidez matinal.");
            setLastTipDate(today);
        } finally {
            setIsTipLoading(false);
        }
    }
  }, [notificationPermission, medications, appointments, lastTipDate, setLastTipDate, lastNotifiedMinute, healthTip]);

  useEffect(() => {
    // Checagem agressiva: a cada 5 segundos
    const interval = setInterval(checkAlarms, 5000);
    return () => clearInterval(interval);
  }, [checkAlarms]);

  // Listener para quando o app volta para o primeiro plano enquanto o alarme toca
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && !activeAlarms) {
        // Checa se deveria estar tocando algo agora
        const now = new Date();
        const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        const medsNow = medications.filter(med => med.enabled && med.time === currentTime);
        if (medsNow.length > 0) {
          setActiveAlarms({ meds: medsNow, appts: [] });
          startAlarmLoop();
        }
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [activeAlarms, medications]);

  const handleDismissAlarm = () => {
    stopAlarmLoop();
    releaseWakeLock();
    setActiveAlarms(null);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'APPOINTMENTS': return <AppointmentList appointments={appointments} setAppointments={setAppointments} />;
      case 'DIARY': return <Diary diaryEntries={diaryEntries} setDiaryEntries={setDiaryEntries} />;
      case 'PROFILE': return <PatientProfile patient={patient} setPatient={setPatient} />;
      case 'MESSAGE': return <MessagePage />;
      case 'MEDS':
      default: return <MedicationList medications={medications} setMedications={setMedications} />;
    }
  };
  
  if (showSplash) return <SplashScreen patient={patient} />;

  return (
    <div className="flex flex-col h-screen font-sans bg-base-100 overflow-hidden">
      <Header page={currentPage} patient={patient}/>
      <main className="flex-grow overflow-y-auto p-4 pb-24 relative">
        {notificationPermission !== 'granted' && currentPage === 'MEDS' && (
             <NotificationPermission onPermissionUpdate={setNotificationPermission} />
        )}
        {renderPage()}
      </main>
      <BottomNav currentPage={currentPage} setCurrentPage={setCurrentPage} />
      {healthTip && <HealthTipModal tip={healthTip} isLoading={isTipLoading} onClose={() => setHealthTip(null)} />}
      {activeAlarms && (
        <AlarmOverlay meds={activeAlarms.meds} appointments={activeAlarms.appts} onDismiss={handleDismissAlarm} />
      )}
    </div>
  );
};

export default App;
