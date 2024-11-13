import { collection, addDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

export async function createInitialQuestionnaire() {
  const questionnaire = {
    title: "Anamnese Digital",
    description: "Avaliação completa para entender sua saúde e bem-estar",
    introVideo: "d_C0C15GsDM", // ID direto do vídeo
    questions: [
      {
        id: "q1",
        type: "youtube",
        content: "RawBNnZEV24",
        title: "Histórico Médico",
        description: "Por favor, conte-nos sobre seu histórico médico",
        order: 0
      },
      // ... outros vídeos
    ],
    thanksVideo: "RdqEbRYsfXw",
    createdAt: new Date()
  };

  try {
    const docRef = await addDoc(collection(db, 'questionnaires'), questionnaire);
    console.log("Anamnese inicial criada com ID:", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("Erro ao criar anamnese inicial:", error);
    throw error;
  }
}