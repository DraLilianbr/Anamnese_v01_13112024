import { collection, addDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

export async function createInitialQuestionnaire() {
  const questionnaire = {
    title: "Avaliação Clínica Completa",
    description: "Avaliação abrangente para compreender seu histórico de saúde e necessidades atuais",
    introVideo: "d_C0C15GsDM",
    questions: [
      {
        id: "q1",
        type: "youtube",
        content: "RawBNnZEV24",
        title: "Avaliação do Histórico Clínico",
        description: "Vamos conhecer seu histórico médico e condições de saúde preexistentes",
        order: 0
      },
      {
        id: "q2",
        type: "youtube",
        content: "7reqzaKZSZA",
        title: "Avaliação de Medicamentos e Tratamentos",
        description: "Informações sobre medicamentos em uso e tratamentos realizados",
        order: 1
      },
      {
        id: "q3",
        type: "youtube",
        content: "oJNXFFU_-5s",
        title: "Avaliação do Estilo de Vida e Rotina",
        description: "Compreensão dos seus hábitos diários e rotina",
        order: 2
      },
      {
        id: "q4",
        type: "youtube",
        content: "e08n98jolak",
        title: "Avaliação da Saúde Mental e Emocional",
        description: "Avaliação do seu bem-estar emocional e psicológico",
        order: 3
      },
      {
        id: "q5",
        type: "youtube",
        content: "hMRtu11TnsM",
        title: "Avaliação do Padrão de Sono e Descanso",
        description: "Análise da qualidade do seu sono e períodos de descanso",
        order: 4
      },
      {
        id: "q6",
        type: "youtube",
        content: "2FVCdAPrYgM",
        title: "Avaliação da Atividade Física e Exercícios",
        description: "Informações sobre sua prática de exercícios e nível de atividade física",
        order: 5
      },
      {
        id: "q7",
        type: "youtube",
        content: "jp49zqFquqY",
        title: "Avaliação Nutricional e Hábitos Alimentares",
        description: "Análise dos seus hábitos alimentares e preferências nutricionais",
        order: 6
      },
      {
        id: "q8",
        type: "youtube",
        content: "64rNE6EWPXk",
        title: "Avaliação de Dores e Sintomas Físicos",
        description: "Identificação de dores, desconfortos e sintomas físicos",
        order: 7
      },
      {
        id: "q9",
        type: "youtube",
        content: "eEpcix-c--0",
        title: "Avaliação do Histórico Familiar de Saúde",
        description: "Informações sobre histórico de saúde na família",
        order: 8
      },
      {
        id: "q10",
        type: "youtube",
        content: "ECaXXDeu59U",
        title: "Avaliação de Alergias e Reações Adversas",
        description: "Identificação de alergias, intolerâncias e reações adversas",
        order: 9
      },
      {
        id: "q11",
        type: "youtube",
        content: "a7AroMMZXw0",
        title: "Avaliação de Objetivos e Expectativas",
        description: "Compreensão dos seus objetivos e expectativas com o tratamento",
        order: 10
      }
    ],
    thanksVideo: "RdqEbRYsfXw",
    createdAt: new Date()
  };

  try {
    const docRef = await addDoc(collection(db, 'questionnaires'), questionnaire);
    console.log("Questionário inicial criado com ID:", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("Erro ao criar questionário inicial:", error);
    throw error;
  }
}