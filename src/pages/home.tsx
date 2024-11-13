import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { collection, addDoc, getDoc, getDocs, doc, query, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { ClipboardList } from 'lucide-react';

const schema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  phone: z.string().min(10, 'Telefone inválido'),
  birthDate: z.string().refine((date) => {
    const today = new Date();
    const birthDate = new Date(date);
    return birthDate < today;
  }, 'Data de nascimento inválida')
});

type FormData = z.infer<typeof schema>;

export function Home() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const questionnaireId = searchParams.get('q');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedQuestionnaire, setSelectedQuestionnaire] = useState<any>(null);
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    const fetchQuestionnaire = async () => {
      setIsLoading(true);
      try {
        if (questionnaireId) {
          // Fetch specific questionnaire
          const questionnaireDoc = await getDoc(doc(db, 'questionnaires', questionnaireId));
          if (questionnaireDoc.exists()) {
            setSelectedQuestionnaire({ id: questionnaireDoc.id, ...questionnaireDoc.data() });
          }
        } else {
          // Fetch latest questionnaire
          const questionnairesQuery = query(
            collection(db, 'questionnaires'),
            orderBy('createdAt', 'desc')
          );
          const snapshot = await getDocs(questionnairesQuery);
          if (!snapshot.empty) {
            const data = snapshot.docs[0].data();
            setSelectedQuestionnaire({ id: snapshot.docs[0].id, ...data });
          }
        }
      } catch (error) {
        console.error('Error fetching questionnaire:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuestionnaire();
  }, [questionnaireId]);

  const onSubmit = async (data: FormData) => {
    if (!selectedQuestionnaire) return;
    
    setIsLoading(true);
    try {
      // Create patient record
      const patientRef = await addDoc(collection(db, 'patients'), {
        ...data,
        createdAt: new Date(),
        status: 'pending'
      });

      // Create response record
      await addDoc(collection(db, 'responses'), {
        patientId: patientRef.id,
        questionnaireId: selectedQuestionnaire.id,
        answers: {},
        startedAt: new Date(),
        status: 'in_progress'
      });

      // Navigate to assessment
      navigate(`/assessment/${selectedQuestionnaire.id}?patientId=${patientRef.id}`);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1594a4] mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!selectedQuestionnaire) {
    return (
      <div className="max-w-md mx-auto text-center">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <ClipboardList className="h-12 w-12 text-[#1594a4] mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-[#1594a4] mb-2">Nenhuma Avaliação Disponível</h1>
          <p className="text-gray-600">
            No momento não há avaliações disponíveis. Por favor, tente novamente mais tarde.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-[#1594a4] mb-2">{selectedQuestionnaire.title}</h1>
          <p className="text-gray-600">
            {selectedQuestionnaire.description}
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="form-control">
            <label>Nome completo</label>
            <input
              type="text"
              {...register('name')}
              className="input-primary"
              placeholder="Digite seu nome completo"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div className="form-control">
            <label>Data de Nascimento</label>
            <input
              type="date"
              {...register('birthDate')}
              className="input-primary"
            />
            {errors.birthDate && (
              <p className="mt-1 text-sm text-red-600">{errors.birthDate.message}</p>
            )}
          </div>

          <div className="form-control">
            <label>Email</label>
            <input
              type="email"
              {...register('email')}
              className="input-primary"
              placeholder="Digite seu email"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          <div className="form-control">
            <label>Telefone</label>
            <input
              type="tel"
              {...register('phone')}
              className="input-primary"
              placeholder="Digite seu telefone"
            />
            {errors.phone && (
              <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary w-full"
          >
            {isLoading ? 'Iniciando...' : 'Iniciar Avaliação'}
          </button>
        </form>
      </div>
    </div>
  );
}