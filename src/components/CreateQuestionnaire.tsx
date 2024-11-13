import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { Plus, Trash2, Video, Type } from 'lucide-react';
import { Question } from '../types';

export function CreateQuestionnaire() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [introVideo, setIntroVideo] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [thanksVideo, setThanksVideo] = useState('');

  const addQuestion = (type: 'youtube' | 'text') => {
    const newQuestion: Question = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      content: '',
      order: questions.length
    };
    setQuestions([...questions, newQuestion]);
  };

  const removeQuestion = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  const updateQuestion = (id: string, content: string) => {
    setQuestions(questions.map(q => 
      q.id === id ? { ...q, content } : q
    ));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const docRef = await addDoc(collection(db, 'questionnaires'), {
        title,
        description,
        introVideo,
        questions,
        thanksVideo,
        createdAt: new Date()
      });
      navigate('/dashboard');
    } catch (error) {
      console.error('Error creating questionnaire:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Criar Novo Questionário</h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Título</label>
              <input
                type="text"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Descrição</label>
              <textarea
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">ID do Vídeo de Introdução (YouTube)</label>
              <input
                type="text"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                value={introVideo}
                onChange={(e) => setIntroVideo(e.target.value)}
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-4">
                <label className="block text-sm font-medium text-gray-700">Perguntas</label>
                <div className="space-x-2">
                  <button
                    type="button"
                    onClick={() => addQuestion('youtube')}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <Video className="h-4 w-4 mr-2" />
                    Adicionar Vídeo
                  </button>
                  <button
                    type="button"
                    onClick={() => addQuestion('text')}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <Type className="h-4 w-4 mr-2" />
                    Adicionar Texto
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {questions.map((question, index) => (
                  <div key={question.id} className="flex items-start space-x-4">
                    <div className="flex-grow">
                      <input
                        type="text"
                        placeholder={question.type === 'youtube' ? 'ID do vídeo do YouTube' : 'Pergunta em texto'}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        value={question.content}
                        onChange={(e) => updateQuestion(question.id, e.target.value)}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeQuestion(question.id)}
                      className="inline-flex items-center p-2 border border-transparent rounded-full text-red-600 hover:bg-red-100"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">ID do Vídeo de Agradecimento (YouTube)</label>
              <input
                type="text"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                value={thanksVideo}
                onChange={(e) => setThanksVideo(e.target.value)}
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Criar Questionário
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}