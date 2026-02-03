import React, { useState, useEffect, useRef } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import { Page, Patient, Medication, Appointment, DiaryEntry } from './types';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import PatientProfile from './components/PatientProfile';
import MedicationList from './components/MedicationList';
import AppointmentList from './components/AppointmentList';
import Diary from './components/Diary';
import MessagePage from './components/MessagePage';
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
  const [notificationPermission, setNotificationPermission] = useState(Notification.permission);
  const [activeAlarms, setActiveAlarms] = useState<{meds: Medication[], appts: Appointment[]} | null>(null);
  const [lastCheckMinute, setLastCheckMinute] = useState<string>('');

  const wakeLockRef = useRef<any>(null);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  // 1. Sincroniza remédios com o Despertador do Sistema (Service Worker)
  useEffect(() => {
    if ('serviceWorker' in navigator && Notification.permission === 'granted') {
      navigator.serviceWorker.ready.then(reg => {
        reg.active?.postMessage({
          type: 'SCHEDULE_ALARMS',
          payload: { medications }
        });
      });
    }
  }, [medications, notificationPermission]);

  // 2. Monitor de tempo real para quando o APP está aberto
  useEffect(() => {
    const checkTime = () => {
      const now = new Date();
      const currentMinute = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      
      if (currentMinute === lastCheckMinute) return;

      const medsToTake = medications.filter(m => m.enabled && m.time === currentMinute);
      
      if (medsToTake.length > 0) {
        setLastCheckMinute(currentMinute);
        setActiveAlarms({ meds: medsToTake, appts: [] });
        startAlarmLoop();
        
        // Mantém a tela ligada se possível
        if ('wakeLock' in navigator) {
          (navigator as any).wakeLock.request('screen').then((lock: any) => {
            wakeLockRef.current = lock;
          }).catch(() => {});
        }
      }
    };

    const timer = setInterval(checkTime, 1000);
    return () => clearInterval(timer);
  }, [medications, lastCheckMinute]);

  const handleDismissAlarm = () => {
    stopAlarmLoop();
    setActiveAlarms(null);
    if (wakeLockRef.current) {
      wakeLockRef.current.release();
      wakeLockRef.current = null;
    }
  };

  if (showSplash) return <SplashScreen patient={patient} />;

  return (
    <div className="flex flex-col h-screen font-sans bg-base-100 overflow-hidden text-neutral">
      <Header page={currentPage} patient={patient}/>
      <main className="flex-grow overflow-y-auto p-4 pb-24 relative">
        {notificationPermission !== 'granted' && (
          <NotificationPermission onPermissionUpdate={setNotificationPermission} />
        )}
        
        {currentPage === 'MEDS' && <MedicationList medications={medications} setMedications={setMedications} />}
        {currentPage === 'APPOINTMENTS' && <AppointmentList appointments={appointments} setAppointments={setAppointments} />}
        {currentPage === 'DIARY' && <Diary diaryEntries={diaryEntries} setDiaryEntries={setDiaryEntries} />}
        {currentPage === 'PROFILE' && <PatientProfile patient={patient} setPatient={setPatient} />}
        {currentPage === 'MESSAGE' && <MessagePage />}
      </main>
      
      <BottomNav currentPage={currentPage} setCurrentPage={setCurrentPage} />
      
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
