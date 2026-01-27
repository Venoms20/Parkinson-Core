export type Page = 'PROFILE' | 'MEDS' | 'APPOINTMENTS' | 'DIARY' | 'MESSAGE';

export interface Patient {
  name: string;
  age: string;
  gender: string;
  phone: string;
  emergencyContact: {
    name: string;
    phone: string;
  };
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  time: string;
  enabled: boolean;
}

export interface Appointment {
  id: string;
  title: string;
  location: string;
  date: string;
  time: string;
  enabled: boolean;
}

export interface DiaryEntry {
  id: string;
  date: string;
  content: string;
}
