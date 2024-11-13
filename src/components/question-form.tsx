/**
 * Componente de formulário de resposta
 * Gerencia estado da resposta e validações
 */

import { useState, useEffect } from 'react';
import { YouTubeEmbed } from './youtube-embed';

interface QuestionFormProps {
  question: {
    id: string;
    title: string;
    description: string;
    videoId: string;
  };
  currentAnswer?: string;
  onAnswer: (answer: string) => void;
  onComplete: () => void;
  isLocked?: boolean;
}

export function QuestionForm({ 
  question, 
  currentAnswer = '', 
  onAnswer, 
  onComplete,
  isLocked = false 
}: QuestionFormProps) {
  const [answer, setAnswer] = useState(currentAnswer);
  const [videoEnded, setVideoEnded] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const minWords = 20;

  useEffect(() => {
    setWordCount(answer.trim().split(/\s+/).filter(Boolean).length);
  }, [answer]);

  const handleAnswer = (value: string) => {
    setAnswer(value);
    onAnswer(value);
  };

  const canProceed = videoEnded && wordCount >= minWords;

  return (
    <div className="space-y-6">
      {/* Player de vídeo com playsinline para evitar reinicialização */}
      <div className="mb-6">
        <YouTubeEmbed 
          videoId={question.videoId} 
          onEnded={() => setVideoEnded(true)}
          autoplay={!isLocked}
          playsinline={true}
        />
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-[#1594a4] mb-2">
            Sua resposta:
          </label>
          <textarea
            className="w-full p-4 border rounded-lg min-h-[120px] focus:ring-2 focus:ring-[#1594a4] focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
            placeholder={isLocked ? "Você já respondeu esta questão" : "Digite sua resposta detalhada aqui..."}
            value={answer}
            onChange={(e) => handleAnswer(e.target.value)}
            disabled={isLocked}
            rows={6}
          />
          
          <div className="mt-2 flex justify-between text-sm">
            <span className={`${wordCount < minWords ? 'text-red-500' : 'text-green-500'}`}>
              {wordCount} palavras (mínimo {minWords})
            </span>
            {!isLocked && (
              <span className="text-gray-500">
                {videoEnded ? '✓ Vídeo assistido' : '⚠️ Assista o vídeo completo'}
              </span>
            )}
          </div>
        </div>

        {!isLocked && (
          <button
            onClick={onComplete}
            disabled={!canProceed}
            className="w-full btn-primary"
          >
            Próxima Questão
          </button>
        )}
      </div>
    </div>
  );
}