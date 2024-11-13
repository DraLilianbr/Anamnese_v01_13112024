import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs, query, orderBy, deleteDoc, doc, setDoc } from 'firebase/firestore';
import { Plus, Settings, Trash2, Edit, Building, Link as LinkIcon } from 'lucide-react';
import { db } from '../lib/firebase';
import { CreateQuestionnaireModal } from '../components/create-questionnaire-modal';
import { SystemSettingsModal } from '../components/system-settings-modal';
import { EditQuestionnaireModal } from '../components/edit-questionnaire-modal';
import { BrandingModal } from '../components/branding-modal';

export function Dashboard() {
  const [questionnaires, setQuestionnaires] = useState<any[]>([]);
  const [responses, setResponses] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showBrandingModal, setShowBrandingModal] = useState(false);
  const [editingQuestionnaire, setEditingQuestionnaire] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const questionnaireQuery = query(
        collection(db, 'questionnaires'),
        orderBy('createdAt', 'desc')
      );
      const questionnaireSnapshot = await getDocs(questionnaireQuery);
      const questionnaireData = questionnaireSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setQuestionnaires(questionnaireData);

      const responseQuery = query(
        collection(db, 'responses'),
        orderBy('startedAt', 'desc')
      );
      const responseSnapshot = await getDocs(responseQuery);
      const responseData = responseSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setResponses(responseData);

      const patientQuery = query(collection(db, 'patients'));
      const patientSnapshot = await getDocs(patientQuery);
      const patientData = patientSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPatients(patientData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateQuestionnaire = async (data: any) => {
    try {
      const newDocRef = doc(collection(db, 'questionnaires'));
      await setDoc(newDocRef, {
        ...data,
        createdAt: new Date()
      });
      setShowCreateModal(false);
      fetchData();
    } catch (error) {
      console.error('Error creating questionnaire:', error);
    }
  };

  const handleEditQuestionnaire = async (data: any) => {
    if (!editingQuestionnaire) return;
    
    try {
      await setDoc(doc(db, 'questionnaires', editingQuestionnaire.id), {
        ...editingQuestionnaire,
        ...data,
        updatedAt: new Date()
      }, { merge: true });
      setEditingQuestionnaire(null);
      fetchData();
    } catch (error) {
      console.error('Error updating questionnaire:', error);
    }
  };

  const handleDeleteQuestionnaire = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este questionário?')) return;
    
    try {
      await deleteDoc(doc(db, 'questionnaires', id));
      fetchData();
    } catch (error) {
      console.error('Error deleting questionnaire:', error);
    }
  };

  const handleDeleteResponse = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta resposta?')) return;
    
    try {
      await deleteDoc(doc(db, 'responses', id));
      fetchData();
    } catch (error) {
      console.error('Error deleting response:', error);
    }
  };

  const copyQuestionnaireLink = async (id: string) => {
    const link = `${window.location.origin}/?q=${id}`;
    try {
      await navigator.clipboard.writeText(link);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setShowBrandingModal(true)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <Building className="h-4 w-4 mr-2" />
            Marca
          </button>
          <button
            onClick={() => setShowSettingsModal(true)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <Settings className="h-4 w-4 mr-2" />
            Configurações
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo Questionário
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Questionários */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Questionários</h2>
          <div className="space-y-4">
            {questionnaires.map(questionnaire => (
              <div key={questionnaire.id} className="border-b pb-4 last:border-0">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">{questionnaire.title}</h3>
                    <p className="text-sm text-gray-600">{questionnaire.description}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Criado em: {new Date(questionnaire.createdAt.toDate()).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => copyQuestionnaireLink(questionnaire.id)}
                      className={`text-gray-600 hover:text-gray-900 ${copiedId === questionnaire.id ? 'text-green-600' : ''}`}
                      title="Copiar link do questionário"
                    >
                      <LinkIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setEditingQuestionnaire(questionnaire)}
                      className="text-gray-600 hover:text-gray-900"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteQuestionnaire(questionnaire.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                {copiedId === questionnaire.id && (
                  <p className="text-sm text-green-600 mt-2">Link copiado!</p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Respostas */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Respostas Recentes</h2>
          <div className="space-y-4">
            {responses.map(response => {
              const patient = patients.find(p => p.id === response.patientId);
              const questionnaire = questionnaires.find(q => q.id === response.questionnaireId);
              return (
                <div key={response.id} className="border-b pb-4 last:border-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{patient?.name || 'Paciente não encontrado'}</h3>
                      <p className="text-sm text-gray-600">
                        {questionnaire?.title || 'Questionário não encontrado'}
                      </p>
                      <p className="text-xs text-gray-500">
                        Iniciado em: {new Date(response.startedAt.toDate()).toLocaleDateString()}
                      </p>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        response.status === 'completed' 
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {response.status === 'completed' ? 'Concluído' : 'Em andamento'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {response.status === 'completed' && (
                        <Link
                          to={`/responses/${response.id}`}
                          className="text-indigo-600 hover:text-indigo-800"
                        >
                          Ver Respostas
                        </Link>
                      )}
                      <button
                        onClick={() => handleDeleteResponse(response.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <CreateQuestionnaireModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateQuestionnaire}
      />

      <SystemSettingsModal
        open={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
      />

      <BrandingModal
        open={showBrandingModal}
        onClose={() => setShowBrandingModal(false)}
      />

      {editingQuestionnaire && (
        <EditQuestionnaireModal
          open={true}
          questionnaire={editingQuestionnaire}
          onClose={() => setEditingQuestionnaire(null)}
          onSubmit={handleEditQuestionnaire}
        />
      )}
    </div>
  );
}