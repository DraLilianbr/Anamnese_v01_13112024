import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface SystemSettingsModalProps {
  open: boolean;
  onClose: () => void;
}

interface VideoSetting {
  id: string;
  title: string;
  url: string;
}

interface SystemSettings {
  introVideo: string;
  thanksVideo: string;
  showIntroVideo: boolean;
  showThanksVideo: boolean;
  predefinedVideos: VideoSetting[];
}

const defaultVideos: VideoSetting[] = [
  { 
    id: 'video1', 
    title: 'Avaliação do Histórico Clínico', 
    url: 'https://www.youtube.com/watch?v=RawBNnZEV24' 
  },
  { 
    id: 'video2', 
    title: 'Avaliação de Medicamentos e Tratamentos', 
    url: 'https://www.youtube.com/watch?v=7reqzaKZSZA' 
  },
  { 
    id: 'video3', 
    title: 'Avaliação do Estilo de Vida e Rotina', 
    url: 'https://www.youtube.com/watch?v=oJNXFFU_-5s' 
  },
  { 
    id: 'video4', 
    title: 'Avaliação da Saúde Mental e Emocional', 
    url: 'https://www.youtube.com/watch?v=e08n98jolak' 
  },
  { 
    id: 'video5', 
    title: 'Avaliação do Padrão de Sono e Descanso', 
    url: 'https://www.youtube.com/watch?v=hMRtu11TnsM' 
  },
  { 
    id: 'video6', 
    title: 'Avaliação da Atividade Física e Exercícios', 
    url: 'https://www.youtube.com/watch?v=2FVCdAPrYgM' 
  },
  { 
    id: 'video7', 
    title: 'Avaliação Nutricional e Hábitos Alimentares', 
    url: 'https://www.youtube.com/watch?v=jp49zqFquqY' 
  },
  { 
    id: 'video8', 
    title: 'Avaliação de Dores e Sintomas Físicos', 
    url: 'https://www.youtube.com/watch?v=64rNE6EWPXk' 
  },
  { 
    id: 'video9', 
    title: 'Avaliação do Histórico Familiar de Saúde', 
    url: 'https://www.youtube.com/watch?v=eEpcix-c--0' 
  },
  { 
    id: 'video10', 
    title: 'Avaliação de Alergias e Reações Adversas', 
    url: 'https://www.youtube.com/watch?v=ECaXXDeu59U' 
  },
  { 
    id: 'video11', 
    title: 'Avaliação de Objetivos e Expectativas', 
    url: 'https://www.youtube.com/watch?v=a7AroMMZXw0' 
  },
];

const formatYouTubeUrl = (url: string) => {
  try {
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const videoId = url.split('v=')[1] || url.split('/').pop();
      return videoId?.split('&')[0] || '';
    }
    return url;
  } catch (error) {
    console.error('Error formatting YouTube URL:', error);
    return url;
  }
};

export function SystemSettingsModal({ open, onClose }: SystemSettingsModalProps) {
  const [settings, setSettings] = useState<SystemSettings>({
    introVideo: 'https://www.youtube.com/watch?v=d_C0C15GsDM',
    thanksVideo: 'https://www.youtube.com/watch?v=RdqEbRYsfXw',
    showIntroVideo: true,
    showThanksVideo: true,
    predefinedVideos: defaultVideos,
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const settingsDoc = await getDoc(doc(db, 'system_settings', 'videos'));
        if (settingsDoc.exists()) {
          setSettings({
            ...settingsDoc.data() as SystemSettings,
            predefinedVideos: settingsDoc.data().predefinedVideos || defaultVideos,
          });
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
      }
    };

    if (open) {
      fetchSettings();
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      const updatedSettings = {
        ...settings,
        introVideo: formatYouTubeUrl(settings.introVideo),
        thanksVideo: formatYouTubeUrl(settings.thanksVideo),
        predefinedVideos: settings.predefinedVideos.map(video => ({
          ...video,
          url: formatYouTubeUrl(video.url),
        })),
      };
      
      await setDoc(doc(db, 'system_settings', 'videos'), updatedSettings);
      onClose();
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const updateVideoUrl = (id: string, url: string) => {
    setSettings(prev => ({
      ...prev,
      predefinedVideos: prev.predefinedVideos.map(video =>
        video.id === id ? { ...video, url } : video
      ),
    }));
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-[#1594a4]">Configurações do Sistema</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Vídeos do Sistema */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-[#1594a4]">Vídeos do Sistema</h3>
              
              <div className="grid grid-cols-1 gap-4">
                <div className="form-control">
                  <label>Vídeo de Boas-vindas e Orientações Iniciais</label>
                  <div className="flex items-center space-x-4">
                    <input
                      type="text"
                      value={settings.introVideo}
                      onChange={(e) => setSettings(s => ({ ...s, introVideo: e.target.value }))}
                      placeholder="https://www.youtube.com/watch?v=..."
                      className="flex-1"
                    />
                    <div className="flex items-center space-x-2">
                      <label className="text-sm text-gray-600">Mostrar</label>
                      <button
                        type="button"
                        onClick={() => setSettings(s => ({ ...s, showIntroVideo: !s.showIntroVideo }))}
                        className={cn(
                          "relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#1594a4] focus:ring-offset-2",
                          settings.showIntroVideo ? "bg-[#1594a4]" : "bg-gray-200"
                        )}
                      >
                        <span
                          className={cn(
                            "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                            settings.showIntroVideo ? "translate-x-5" : "translate-x-0"
                          )}
                        />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="form-control">
                  <label>Vídeo de Conclusão e Próximos Passos</label>
                  <div className="flex items-center space-x-4">
                    <input
                      type="text"
                      value={settings.thanksVideo}
                      onChange={(e) => setSettings(s => ({ ...s, thanksVideo: e.target.value }))}
                      placeholder="https://www.youtube.com/watch?v=..."
                      className="flex-1"
                    />
                    <div className="flex items-center space-x-2">
                      <label className="text-sm text-gray-600">Mostrar</label>
                      <button
                        type="button"
                        onClick={() => setSettings(s => ({ ...s, showThanksVideo: !s.showThanksVideo }))}
                        className={cn(
                          "relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#1594a4] focus:ring-offset-2",
                          settings.showThanksVideo ? "bg-[#1594a4]" : "bg-gray-200"
                        )}
                      >
                        <span
                          className={cn(
                            "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                            settings.showThanksVideo ? "translate-x-5" : "translate-x-0"
                          )}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Vídeos das Perguntas */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-[#1594a4]">Vídeos do Questionário</h3>
              <div className="space-y-4">
                {settings.predefinedVideos.map((video, index) => (
                  <div key={video.id} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                    <div className="flex-shrink-0 w-8 h-8 bg-[#1594a4] rounded-full flex items-center justify-center text-white font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-grow space-y-2">
                      <label className="block text-sm font-medium text-[#1594a4]">
                        {video.title}
                      </label>
                      <input
                        type="text"
                        value={video.url}
                        onChange={(e) => updateVideoUrl(video.id, e.target.value)}
                        placeholder="https://www.youtube.com/watch?v=..."
                        className="w-full"
                      />
                    </div>
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
                disabled={isSaving}
                className="btn-primary"
              >
                {isSaving ? 'Salvando...' : 'Salvar Alterações'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}