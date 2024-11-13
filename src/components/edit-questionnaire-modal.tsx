import { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { getYouTubeVideoInfo } from '../lib/youtube';

interface EditQuestionnaireModalProps {
  open: boolean;
  questionnaire: any;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

interface VideoInfo {
  id: string;
  title: string;
  description: string;
}

const predefinedVideoIds = [
  'RawBNnZEV24',
  '7reqzaKZSZA',
  'oJNXFFU_-5s',
  'e08n98jolak',
  'hMRtu11TnsM',
  '2FVCdAPrYgM',
  'jp49zqFquqY',
  '64rNE6EWPXk',
  'eEpcix-c--0',
  'ECaXXDeu59U',
  'a7AroMMZXw0'
];

export function EditQuestionnaireModal({ open, questionnaire, onClose, onSubmit }: EditQuestionnaireModalProps) {
  const [title, setTitle] = useState(questionnaire.title);
  const [description, setDescription] = useState(questionnaire.description);
  const [questions, setQuestions] = useState(questionnaire.questions);
  const [availableVideos, setAvailableVideos] = useState<VideoInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchVideoInfo = async () => {
      if (!open) return;
      
      setIsLoading(true);
      const videoInfoPromises = predefinedVideoIds.map(async (id) => {
        const info = await getYouTubeVideoInfo(id);
        return {
          id,
          title: info.title,
          description: info.description
        };
      });

      const videos = await Promise.all(videoInfoPromises);
      setAvailableVideos(videos);
      setIsLoading(false);
    };

    fetchVideoInfo();
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      title,
      description,
      questions: questions.map((q: any, index: number) => ({
        ...q,
        order: index
      }))
    });
  };

  const addQuestion = () => {
    setQuestions([...questions, { 
      id: `q${questions.length + 1}`,
      type: 'youtube',
      content: '',
      title: '',
      description: '',
      order: questions.length
    }]);
  };

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_: any, i: number) => i !== index));
  };

  const updateQuestion = async (index: number, videoId: string) => {
    const videoInfo = availableVideos.find(v => v.id === videoId);
    if (videoInfo) {
      const newQuestions = [...questions];
      newQuestions[index] = {
        ...newQuestions[index],
        content: videoId,
        title: videoInfo.title,
        description: videoInfo.description
      };
      setQuestions(newQuestions);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-[#1594a4]">Editar Questionário</h2>
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
              <div>
                <label className="block text-sm font-medium text-[#1594a4]">Título</label>
                <input
                  type="text"
                  required
                  className="mt-1 block w-full"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1594a4]">Descrição</label>
                <textarea
                  required
                  className="mt-1 block w-full"
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-4">
                  <label className="block text-sm font-medium text-[#1594a4]">Perguntas</label>
                  <button
                    type="button"
                    onClick={addQuestion}
                    className="btn-secondary"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Pergunta
                  </button>
                </div>

                <div className="space-y-4">
                  {questions.map((question: any, index: number) => (
                    <div key={index} className="flex items-start space-x-4 p-4 border rounded-lg bg-gray-50">
                      <div className="flex-shrink-0 w-8 h-8 bg-[#1594a4] rounded-full flex items-center justify-center text-white font-bold">
                        {index + 1}
                      </div>
                      <div className="flex-grow">
                        <select
                          required
                          className="block w-full mb-4"
                          value={question.content}
                          onChange={(e) => updateQuestion(index, e.target.value)}
                        >
                          <option value="">Selecione um vídeo</option>
                          {availableVideos
                            .filter(video => 
                              !questions.some((q: any, i: number) => 
                                i !== index && q.content === video.id
                              )
                            )
                            .map(video => (
                              <option key={video.id} value={video.id}>
                                {video.title}
                              </option>
                            ))
                          }
                        </select>
                        {question.content && (
                          <div className="text-sm text-gray-600">
                            <p className="font-medium">{
                              availableVideos.find(v => v.id === question.content)?.title
                            }</p>
                            <p className="mt-1">{
                              availableVideos.find(v => v.id === question.content)?.description
                            }</p>
                          </div>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeQuestion(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  ))}
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
                >
                  Salvar Alterações
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}