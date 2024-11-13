import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { db } from '../lib/firebase';
import { doc, getDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { Questionnaire } from '../types';
import { Save, ArrowRight, Home } from 'lucide-react';

const YouTubeEmbed = ({ videoId }: { videoId: string }) => (
  <div className="relative w-full pb-[56.25%] h-0 rounded-lg overflow-hidden">
    <iframe
      src={`https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1&showinfo=0&controls=1`}
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
      className="absolute top-0 left-0 w-full h-full border-0"
    />
  </div>
);

export function QuestionnaireView() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const patientId = searchParams.get('patientId');
  const navigate = useNavigate();
  const [questionnaire, setQuestionnaire] = useState<Questionnaire | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [responseId, setResponseId] = useState<string | null>(null);
  const [showIntro, setShowIntro] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!id || !patientId) return;

      const questionnaireDoc = await getDoc(doc(db, 'questionnaires', id));
      if (questionnaireDoc.exists()) {
        setQuestionnaire({ id: questionnaireDoc.id, ...questionnaireDoc.data() } as Questionnaire);
      }

      const responseQuery = query(
        collection(db, 'responses'),
        where('questionnaireId', '==', id),
        where('patientId', '==', patientId)
      );
      const responseSnapshot = await getDocs(responseQuery);
      
      if (!responseSnapshot.empty) {
        const responseDoc = responseSnapshot.docs[0];
        setResponseId(responseDoc.id);
        if (responseDoc.data().answers) {
          setAnswers(responseDoc.data().answers);
        }
      }
    };

    fetchData();
  }, [id, patientId]);

  const handleAnswer = (questionId: string, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleNext = () => {
    if (!questionnaire) return;
    
    if (showIntro) {
      setShowIntro(false);
      return;
    }

    if (currentStep < questionnaire.questions.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleSave();
    }
  };

  const handleSave = async () => {
    if (!questionnaire || !id || !responseId || !patientId) return;
    setIsSaving(true);
    try {
      await updateDoc(doc(db, 'responses', responseId), {
        answers,
        completedAt: new Date(),
        status: 'completed'
      });

      await updateDoc(doc(db, 'patients', patientId), {
        status: 'completed'
      });

      navigate('/dashboard');
    } catch (error) {
      console.error('Erro ao salvar respostas:', error);
    }
    setIsSaving(false);
  };

  const getCurrentQuestion = () => {
    if (!questionnaire) return null;
    return questionnaire.questions[currentStep];
  };

  const canProceed = () => {
    const question = getCurrentQuestion();
    if (!question) return true;
    return !!answers[question.id]?.trim();
  };

  if (!questionnaire) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Carregando anamnese...</p>
        </div>
      </div>
    );
  }

  if (showIntro) {
    return (
      <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
        <div className="max-w-3xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
            <div className="text-center mb-8">
              <h2 className="text-xl sm:text-2xl font-bold mb-4">{questionnaire.title}</h2>
              <p className="text-gray-600 mb-8">{questionnaire.description}</p>
              <div className="mb-8">
                <YouTubeEmbed videoId={questionnaire.introVideo} />
              </div>
              <button
                onClick={handleNext}
                className="inline-flex items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Começar Anamnese <ArrowRight className="ml-2 h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const question = getCurrentQuestion();
  if (!question) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
          {/* Barra de Progresso */}
          <div className="mb-6">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${((currentStep + 1) / questionnaire.questions.length) * 100}%`
                }}
              />
            </div>
            <p className="text-center text-sm text-gray-600 mt-2">
              Questão {currentStep + 1} de {questionnaire.questions.length}
            </p>
          </div>

          {/* Conteúdo da Questão */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {question.title}
            </h3>
            <p className="text-gray-600 mb-4">
              {question.description}
            </p>
          </div>

          {/* Vídeo */}
          {question.type === 'youtube' && (
            <div className="mb-6">
              <YouTubeEmbed videoId={question.content} />
            </div>
          )}

          {/* Campo de Resposta */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {question.content}
            </label>
            <textarea
              className="w-full p-4 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent min-h-[120px]"
              placeholder="Digite sua resposta aqui..."
              value={answers[question.id] || ''}
              onChange={(e) => handleAnswer(question.id, e.target.value)}
            />
          </div>

          {/* Botões de Ação */}
          <div className="flex justify-between items-center">
            <button
              onClick={() => navigate('/dashboard')}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <Home className="mr-2 h-4 w-4" /> Voltar ao Início
            </button>

            <button
              onClick={handleNext}
              disabled={!canProceed()}
              className="inline-flex items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {currentStep === questionnaire.questions.length - 1 ? (
                <>
                  {isSaving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-5 w-5" /> Finalizar
                    </>
                  )}
                </>
              ) : (
                <>
                  Próxima Questão <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}