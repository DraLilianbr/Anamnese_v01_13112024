import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { db } from '../lib/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { PlusCircle, Users, ClipboardList, FileText } from 'lucide-react';
import { Questionnaire } from '../types';
import { createInitialQuestionnaire } from '../data/initialQuestionnaire';

export function Dashboard() {
  const navigate = useNavigate();
  const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const questionnaireQuery = query(collection(db, 'questionnaires'), orderBy('createdAt', 'desc'));
      const questionnaireSnapshot = await getDocs(questionnaireQuery);
      const questionnaireData = questionnaireSnapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      })) as Questionnaire[];
      setQuestionnaires(questionnaireData);

      const patientQuery = query(collection(db, 'patients'), orderBy('name'));
      const patientSnapshot = await getDocs(patientQuery);
      const patientData = patientSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPatients(patientData);

      if (questionnaireData.length === 0) {
        setIsLoading(true);
        try {
          await createInitialQuestionnaire();
          const newQuestionnaireSnapshot = await getDocs(questionnaireQuery);
          const newQuestionnaireData = newQuestionnaireSnapshot.docs.map(doc => ({ 
            id: doc.id, 
            ...doc.data() 
          })) as Questionnaire[];
          setQuestionnaires(newQuestionnaireData);
        } catch (error) {
          console.error("Erro ao criar anamnese inicial:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-gray-600">Criando anamnese inicial...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <ClipboardList className="h-8 w-8 text-indigo-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">Sistema de Anamnese</span>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Painel de Controle</h1>
            <Link
              to="/create-questionnaire"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <PlusCircle className="h-5 w-5 mr-2" />
              Nova Anamnese
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <FileText className="h-6 w-6 text-gray-400" />
                    <span className="ml-2 text-lg font-medium text-gray-900">
                      Anamneses
                    </span>
                  </div>
                </div>
                <div className="divide-y divide-gray-200">
                  {questionnaires.length > 0 ? (
                    questionnaires.map((questionnaire) => (
                      <div key={questionnaire.id} className="py-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="text-sm font-medium">{questionnaire.title}</h3>
                            <p className="text-sm text-gray-500">{questionnaire.description}</p>
                          </div>
                          <Link
                            to={`/questionnaire/${questionnaire.id}`}
                            className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                          >
                            Ver detalhes
                          </Link>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-gray-500 py-4">
                      Nenhuma anamnese criada ainda.
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <Users className="h-6 w-6 text-gray-400" />
                    <span className="ml-2 text-lg font-medium text-gray-900">
                      Pacientes Recentes
                    </span>
                  </div>
                </div>
                <div className="divide-y divide-gray-200">
                  {patients.length > 0 ? (
                    patients.map((patient) => (
                      <div key={patient.id} className="py-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="text-sm font-medium">{patient.name} {patient.surname}</h3>
                            <p className="text-sm text-gray-500">{patient.email}</p>
                          </div>
                          <Link
                            to={`/notes/${patient.id}`}
                            className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                          >
                            Ver prontuário
                          </Link>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-gray-500 py-4">
                      Nenhum paciente registrado ainda.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}