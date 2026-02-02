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
  
  const wakeLockRef = useRef<any>(null);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  // Sincroniza o Service Worker sempre que a lista de remédios mudar
  useEffect(() => {
    if ('serviceWorker' in navigator && Notification.permission === 'granted') {
      navigator.serviceWorker.ready.then(reg => {
        reg.active?.postMessage({
          type: 'SCHEDULE_ALARMS',
          payload: { medications }
        });
      });
    }
  }, [medications]);

  const requestWakeLock = async () => {
    if ('wakeLock' in navigator) {
      try { wakeLockRef.current = await (navigator as any).wakeLock.request('screen'); } catch {}
    }
  };

  const releaseWakeLock = () => {
    if (wakeLockRef.current) { wakeLockRef.current.release(); wakeLockRef.current = null; }
  };

  // Overlay visual (quando app está aberto)
  useEffect(() => {
    const checkMinute = () => {
      if (document.visibilityState !== 'visible' || activeAlarms) return;
      
      const now = new Date();
      const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      const medsNow = medications.filter(m => m.enabled && m.time === timeStr);
      
      if (medsNow.length > 0) {
        setActiveAlarms({ meds: medsNow, appts: [] });
        startAlarmLoop();
        requestWakeLock();
      }
    };

    const interval = setInterval(checkMinute, 10000); // Checa a cada 10s
    return () => clearInterval(interval);
  }, [medications, activeAlarms]);

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
        {notificationPermission !== 'granted' && <NotificationPermission onPermissionUpdate={setNotificationPermission} />}
        {renderPage()}
      </main>
      <BottomNav currentPage={currentPage} setCurrentPage={setCurrentPage} />
      {healthTip && <HealthTipModal tip={healthTip} isLoading={isTipLoading} onClose={() => setHealthTip(null)} />}
      {activeAlarms && <AlarmOverlay meds={activeAlarms.meds} appointments={activeAlarms.appts} onDismiss={handleDismissAlarm} />}
    </div>
  );
};

export default App;
