export interface Patient {
  id?: string;
  name: string;
  surname: string;
  birthDate: string;
  phone: string;
  address: string;
  email: string;
}

export interface Question {
  id: string;
  type: 'youtube' | 'text';
  content: string;
  order: number;
}

export interface Questionnaire {
  id?: string;
  title: string;
  description: string;
  introVideo: string;
  questions: Question[];
  thanksVideo: string;
  createdAt: Date;
}