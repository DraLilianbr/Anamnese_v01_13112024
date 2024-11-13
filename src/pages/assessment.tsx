import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowRight, Save } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { YouTubeEmbed } from '../components/youtube-embed';
import { getQuestionnaire, getResponse, updateResponse, completeResponse } from '../lib/db';
import { getYouTubeVideoInfo } from '../lib/youtube';

export function Assessment() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const patientId = searchParams.get('patientId');
  const navigate = useNavigate();
  
  const [questionnaire, setQuestionnaire] = useState<any>(null);
  const [currentStep, setCurrentStep] = useState(-1);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [responseId, setResponseId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [videoEnded, setVideoEnded] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [systemSettings, setSystemSettings] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!id || !patientId) {
        navigate('/');
        return;
      }

      try {
        // Fetch system settings
        const settingsDoc = await getDoc(doc(db, 'system_settings', 'videos'));
        if (settingsDoc.exists()) {
          setSystemSettings(settingsDoc.data());
        }

        // Fetch questionnaire
        const questionnaireData = await getQuestionnaire(id);
        if (questionnaireData) {
          // Fetch video info for each question
          const questionsWithInfo = await Promise.all(
            questionnaireData.questions.map(async (question: any) => {
              const videoInfo = await getYouTubeVideoInfo(question.videoId);
              return {
                ...question,
                title: videoInfo.title,
                description: videoInfo.description
              };
            })
          );

          setQuestionnaire({
            ...questionnaireData,
            questions: questionsWithInfo
          });
        } else {
          navigate('/');
          return;
        }

        // Fetch response
        const responseData = await getResponse(id, patientId);
        if (responseData) {
          setResponseId(responseData.id);
          setAnswers(responseData.answers || {});
          setCurrentStep(responseData.currentStep || -1);
        } else {
          navigate('/');
          return;
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        navigate('/');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id, patientId, navigate]);

  const handleAnswer = (questionId: string, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleNext = async () => {
    if (!questionnaire || !responseId) return;
    
    try {
      await updateResponse(responseId, {
        answers,
        currentStep: currentStep + 1
      });
      
      setCurrentStep(prev => prev + 1);
      setVideoEnded(false); // Reset video state for next question
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  };

  const handleComplete = async () => {
    if (!responseId) return;
    setIsSaving(true);
    
    try {
      await completeResponse(responseId, {
        answers,
        feedback,
        currentStep: questionnaire.questions.length
      });

      navigate('/');
    } catch (error) {
      console.error('Error completing assessment:', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || !questionnaire || !systemSettings) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1594a4]"></div>
          <p className="mt-4 text-gray-600">Carregando avaliação...</p>
        </div>
      </div>
    );
  }

  // Show intro video
  if (currentStep === -1) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">{questionnaire.title}</h1>
            <p className="text-gray-600 mb-8">{questionnaire.description}</p>
            
            {systemSettings.showIntroVideo && (
              <div className="mb-8">
                <YouTubeEmbed 
                  videoId={systemSettings.introVideo} 
                  onEnded={() => setVideoEnded(true)}
                />
              </div>
            )}

            <button
              onClick={handleNext}
              disabled={systemSettings.showIntroVideo && !videoEnded}
              className="btn-primary inline-flex items-center"
            >
              Começar Avaliação <ArrowRight className="ml-2 h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show thanks video and feedback form
  if (currentStep >= questionnaire.questions.length) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Obrigado por completar a avaliação!</h1>
            
            {systemSettings.showThanksVideo && (
              <div className="mb-8">
                <YouTubeEmbed videoId={systemSettings.thanksVideo} />
              </div>
            )}

            <div className="mb-8 text-left">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Como foi sua experiência com este questionário?
              </label>
              <textarea
                className="w-full p-4 border rounded-lg min-h-[120px] focus:ring-2 focus:ring-[#1594a4] focus:border-transparent"
                placeholder="Compartilhe sua opinião..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
              />
            </div>

            <button
              onClick={handleComplete}
              disabled={isSaving}
              className="btn-primary inline-flex items-center"
            >
              {isSaving ? 'Enviando...' : 'Enviar Avaliação'} <Save className="ml-2 h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = questionnaire.questions[currentStep];
  if (!currentQuestion) return null;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="mb-6">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-[#1594a4] h-2 rounded-full transition-all duration-300"
              style={{
                width: `${((currentStep + 1) / questionnaire.questions.length) * 100}%`
              }}
            />
          </div>
          <p className="text-center text-sm text-gray-600 mt-2">
            Questão {currentStep + 1} de {questionnaire.questions.length}
          </p>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-bold mb-2">{currentQuestion.title}</h2>
          <p className="text-gray-600 mb-6">{currentQuestion.description}</p>
          
          <div className="mb-6">
            <YouTubeEmbed 
              videoId={currentQuestion.videoId} 
              onEnded={() => setVideoEnded(true)}
            />
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">
              Sua resposta:
            </label>
            <textarea
              className="w-full p-4 border rounded-lg min-h-[120px] focus:ring-2 focus:ring-[#1594a4] focus:border-transparent"
              placeholder="Digite sua resposta aqui..."
              value={answers[currentQuestion.id] || ''}
              onChange={(e) => handleAnswer(currentQuestion.id, e.target.value)}
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleNext}
            disabled={!videoEnded || !answers[currentQuestion.id]?.trim()}
            className="btn-primary inline-flex items-center"
          >
            Próxima Questão <ArrowRight className="ml-2 h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}