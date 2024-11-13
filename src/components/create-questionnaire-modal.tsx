import { useState, useEffect } from 'react';
import { X, Plus, Trash2, Edit2 } from 'lucide-react';
import { getYouTubeVideoInfo } from '../lib/youtube';

interface CreateQuestionnaireModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  initialData?: any;
}

interface Question {
  id: string;
  title: string;
  description: string;
  videoId: string;
  customTitle?: string;
  customDescription?: string;
  order: number;
}

interface VideoInfo {
  id: string;
  title: string;
  description: string;
  thumbnail?: string;
}

// IDs dos vídeos apenas para as perguntas
const predefinedVideoIds = [
  'RawBNnZEV24', // Avaliação do Histórico Clínico
  '7reqzaKZSZA', // Avaliação de Medicamentos e Tratamentos
  'oJNXFFU_-5s', // Avaliação do Estilo de Vida e Rotina
  'e08n98jolak', // Avaliação da Saúde Mental e Emocional
  'hMRtu11TnsM', // Avaliação do Padrão de Sono e Descanso
  '2FVCdAPrYgM', // Avaliação da Atividade Física e Exercícios
  'jp49zqFquqY', // Avaliação Nutricional e Hábitos Alimentares
  '64rNE6EWPXk', // Avaliação de Dores e Sintomas Físicos
  'eEpcix-c--0', // Avaliação do Histórico Familiar de Saúde
  'ECaXXDeu59U', // Avaliação de Alergias e Reações Adversas
  'a7AroMMZXw0'  // Avaliação de Objetivos e Expectativas
];

export function CreateQuestionnaireModal({ open, onClose, onSubmit, initialData }: CreateQuestionnaireModalProps) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [questions, setQuestions] = useState<Question[]>(initialData?.questions || []);
  const [availableVideos, setAvailableVideos] = useState<VideoInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingQuestion, setEditingQuestion] = useState<number | null>(null);

  useEffect(() => {
    const fetchVideoInfo = async () => {
      if (!open) return;
      
      setIsLoading(true);
      try {
        const videoInfoPromises = predefinedVideoIds.map(async (id) => {
          const info = await getYouTubeVideoInfo(id);
          return {
            id,
            title: info.title,
            description: info.description,
            thumbnail: info.thumbnail
          };
        });

        const videos = await Promise.all(videoInfoPromises);
        setAvailableVideos(videos);
      } catch (error) {
        console.error('Error fetching video info:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVideoInfo();
  }, [open]);

  const addQuestion = () => {
    const newQuestion: Question = {
      id: `q${questions.length + 1}`,
      title: '',
      description: '',
      videoId: '',
      customTitle: '',
      customDescription: '',
      order: questions.length
    };
    setQuestions([...questions, newQuestion]);
    setEditingQuestion(questions.length);
  };

  const updateQuestion = (index: number, field: keyof Question, value: string) => {
    const updatedQuestions = [...questions];
    
    if (field === 'videoId') {
      const videoInfo = availableVideos.find(v => v.id === value);
      if (videoInfo) {
        updatedQuestions[index] = {
          ...updatedQuestions[index],
          videoId: value,
          title: videoInfo.title,
          description: videoInfo.description,
          customTitle: videoInfo.title,
          customDescription: videoInfo.description
        };
      }
    } else {
      updatedQuestions[index] = {
        ...updatedQuestions[index],
        [field]: value
      };
    }
    
    setQuestions(updatedQuestions);
  };

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
    setEditingQuestion(null);
  };

  const moveQuestion = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) || 
      (direction === 'down' && index === questions.length - 1)
    ) return;

    const newQuestions = [...questions];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    [newQuestions[index], newQuestions[newIndex]] = [newQuestions[newIndex], newQuestions[index]];
    
    setQuestions(newQuestions.map((q, i) => ({ ...q, order: i })));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      title,
      description,
      questions: questions.map((q, index) => ({ 
        ...q,
        order: index,
        title: q.customTitle || q.title,
        description: q.customDescription || q.description
      })),
      createdAt: initialData?.createdAt || new Date()
    });
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-[#1594a4]">
              {initialData ? 'Editar Questionário' : 'Criar Novo Questionário'}
            </h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X className="h-5 w-5" />
            </button>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1594a4]"></div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-sm font-medium text-[#1594a4]">Título do Questionário</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ex: Avaliação Completa"
                    className="mt-1 block w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#1594a4]">Descrição</label>
                  <textarea
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Descreva o objetivo deste questionário"
                    rows={3}
                    className="mt-1 block w-full"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-4">
                    <label className="block text-sm font-medium text-[#1594a4]">Perguntas</label>
                    <button
                      type="button"
                      onClick={addQuestion}
                      className="btn-secondary inline-flex items-center"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar Pergunta
                    </button>
                  </div>

                  <div className="space-y-4">
                    {questions.map((question, index) => (
                      <div key={question.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-sm font-medium text-[#1594a4]">Pergunta {index + 1}</h3>
                          <div className="flex items-center space-x-2">
                            {index > 0 && (
                              <button
                                type="button"
                                onClick={() => moveQuestion(index, 'up')}
                                className="text-gray-600 hover:text-gray-900"
                              >
                                ↑
                              </button>
                            )}
                            {index < questions.length - 1 && (
                              <button
                                type="button"
                                onClick={() => moveQuestion(index, 'down')}
                                className="text-gray-600 hover:text-gray-900"
                              >
                                ↓
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => setEditingQuestion(editingQuestion === index ? null : index)}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => removeQuestion(index)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Selecione o Vídeo</label>
                            <select
                              required
                              value={question.videoId}
                              onChange={(e) => updateQuestion(index, 'videoId', e.target.value)}
                              className="mt-1 block w-full"
                            >
                              <option value="">Selecione um vídeo</option>
                              {availableVideos
                                .filter(video => 
                                  !questions.some((q, i) => i !== index && q.videoId === video.id)
                                )
                                .map((video) => (
                                  <option key={video.id} value={video.id}>
                                    {video.title}
                                  </option>
                                ))
                              }
                            </select>
                          </div>

                          {editingQuestion === index && question.videoId && (
                            <>
                              <div>
                                <label className="block text-sm font-medium text-gray-700">
                                  Título Personalizado
                                </label>
                                <input
                                  type="text"
                                  value={question.customTitle || question.title}
                                  onChange={(e) => updateQuestion(index, 'customTitle', e.target.value)}
                                  className="mt-1 block w-full"
                                  placeholder="Título personalizado da pergunta"
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700">
                                  Descrição Personalizada
                                </label>
                                <textarea
                                  value={question.customDescription || question.description}
                                  onChange={(e) => updateQuestion(index, 'customDescription', e.target.value)}
                                  className="mt-1 block w-full"
                                  rows={3}
                                  placeholder="Descrição personalizada da pergunta"
                                />
                              </div>
                            </>
                          )}

                          {question.videoId && !editingQuestion && (
                            <div className="text-sm text-gray-600">
                              <p className="font-medium">
                                {question.customTitle || question.title}
                              </p>
                              <p className="mt-1">
                                {question.customDescription || question.description}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="btn-secondary"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={questions.length === 0}
                >
                  {initialData ? 'Salvar Alterações' : 'Criar Questionário'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}