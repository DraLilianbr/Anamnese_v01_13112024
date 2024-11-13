import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { Save, ArrowLeft } from 'lucide-react';
import { db } from '../lib/firebase';

interface EvolutionNote {
  content: string;
  timestamp: Date;
  author?: string;
  id: string;
}

export function ResponsesView() {
  const { responseId } = useParams();
  const navigate = useNavigate();
  const [response, setResponse] = useState<any>(null);
  const [questionnaire, setQuestionnaire] = useState<any>(null);
  const [patient, setPatient] = useState<any>(null);
  const [evolutionNotes, setEvolutionNotes] = useState<EvolutionNote[]>([]);
  const [newNote, setNewNote] = useState('');
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [editedContent, setEditedContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!responseId) return;

      try {
        const responseDoc = await getDoc(doc(db, 'responses', responseId));
        if (responseDoc.exists()) {
          const responseData = responseDoc.data();
          setResponse(responseData);
          setEvolutionNotes(responseData.evolutionNotes || []);

          // Fetch questionnaire
          const questionnaireDoc = await getDoc(doc(db, 'questionnaires', responseData.questionnaireId));
          if (questionnaireDoc.exists()) {
            setQuestionnaire(questionnaireDoc.data());
          }

          // Fetch patient
          const patientDoc = await getDoc(doc(db, 'patients', responseData.patientId));
          if (patientDoc.exists()) {
            setPatient(patientDoc.data());
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [responseId]);

  const handleSaveEvolution = async () => {
    if (!responseId || !newNote.trim()) return;
    setIsSaving(true);
    try {
      const newEvolutionNote: EvolutionNote = {
        id: Date.now().toString(),
        content: newNote.trim(),
        timestamp: new Date(),
      };

      const updatedNotes = [...evolutionNotes, newEvolutionNote];
      
      await updateDoc(doc(db, 'responses', responseId), {
        evolutionNotes: updatedNotes,
        lastEvolutionUpdate: new Date()
      });

      setEvolutionNotes(updatedNotes);
      setNewNote('');
    } catch (error) {
      console.error('Error saving evolution notes:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditNote = async (noteId: string) => {
    if (!responseId) return;
    setIsSaving(true);
    try {
      const updatedNotes = evolutionNotes.map(note => 
        note.id === noteId 
          ? { ...note, content: editedContent, lastEdited: new Date() }
          : note
      );

      await updateDoc(doc(db, 'responses', responseId), {
        evolutionNotes: updatedNotes,
        lastEvolutionUpdate: new Date()
      });

      setEvolutionNotes(updatedNotes);
      setEditingNote(null);
      setEditedContent('');
    } catch (error) {
      console.error('Error updating note:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const startEditing = (note: EvolutionNote) => {
    setEditingNote(note.id);
    setEditedContent(note.content);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1594a4] mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando respostas...</p>
        </div>
      </div>
    );
  }

  if (!response || !questionnaire || !patient) {
    return (
      <div className="text-center">
        <p className="text-gray-600">Respostas não encontradas.</p>
      </div>
    );
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR');
  };

  const formatDateTime = (date: Date) => {
    return new Date(date).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-[#1594a4]">Respostas do Paciente</h1>
          <button
            onClick={() => navigate('/dashboard')}
            className="btn-secondary inline-flex items-center"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar ao Dashboard
          </button>
        </div>
        
        <div className="mb-6 p-4 bg-[#f8fafc] rounded-lg border border-[#a2d4d8]/30">
          <h2 className="text-lg font-semibold text-[#1594a4] mb-2">Informações do Paciente</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Nome</p>
              <p className="font-medium">{patient.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Data de Nascimento</p>
              <p className="font-medium">{formatDate(patient.birthDate)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="font-medium">{patient.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Telefone</p>
              <p className="font-medium">{patient.phone}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Data de Início</p>
              <p className="font-medium">
                {new Date(response.startedAt.toDate()).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {questionnaire.questions.map((question: any, index: number) => (
            <div key={question.id} className="p-4 bg-[#f8fafc] rounded-lg border border-[#a2d4d8]/30">
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex-shrink-0 w-8 h-8 bg-[#1594a4] rounded-full flex items-center justify-center text-white font-bold">
                  {index + 1}
                </div>
                <div>
                  <h3 className="font-medium text-[#1594a4]">{question.title}</h3>
                  <p className="text-sm text-gray-600">{question.description}</p>
                </div>
              </div>
              <div className="ml-12">
                <p className="text-sm text-gray-600 mb-2">Resposta:</p>
                <p className="whitespace-pre-wrap bg-white p-3 rounded-lg border border-[#a2d4d8]/30">
                  {response.answers[question.id] || 'Sem resposta'}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Evolution Notes Section */}
        <div className="mt-8 border-t border-[#a2d4d8]/30 pt-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-[#1594a4] mb-4">Evolução do Paciente</h2>
            
            {/* New Evolution Note Input */}
            <div className="mb-6">
              <textarea
                className="textarea-primary mb-2"
                placeholder="Digite suas observações sobre a evolução do paciente..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
              />
              <button
                onClick={handleSaveEvolution}
                disabled={isSaving || !newNote.trim()}
                className="btn-primary w-full"
              >
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? 'Salvando...' : 'Adicionar Evolução'}
              </button>
            </div>

            {/* Evolution Notes History */}
            <div className="space-y-4">
              {evolutionNotes.length > 0 ? (
                [...evolutionNotes].reverse().map((note) => (
                  <div
                    key={note.id}
                    className="p-4 bg-[#f8fafc] rounded-lg border border-[#a2d4d8]/30"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-sm text-[#1594a4] font-medium">
                        Evolução #{evolutionNotes.length - evolutionNotes.indexOf(note)}
                      </span>
                      <span className="text-sm text-gray-500">
                        {formatDateTime(note.timestamp.toDate())}
                      </span>
                    </div>
                    
                    {editingNote === note.id ? (
                      <div className="space-y-2">
                        <textarea
                          className="textarea-primary w-full"
                          value={editedContent}
                          onChange={(e) => setEditedContent(e.target.value)}
                        />
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => setEditingNote(null)}
                            className="btn-secondary"
                          >
                            Cancelar
                          </button>
                          <button
                            onClick={() => handleEditNote(note.id)}
                            disabled={isSaving}
                            className="btn-primary"
                          >
                            {isSaving ? 'Salvando...' : 'Salvar'}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <p className="whitespace-pre-wrap text-gray-700">{note.content}</p>
                        <button
                          onClick={() => startEditing(note)}
                          className="text-[#1594a4] hover:text-[#30a0ac] text-sm mt-2"
                        >
                          Editar
                        </button>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 py-4">
                  Nenhuma evolução registrada ainda.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}