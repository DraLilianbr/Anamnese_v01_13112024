import { collection, doc, getDoc, getDocs, query, where, orderBy, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from './firebase';

// Questionnaire Functions
export async function getQuestionnaire(id: string) {
  const docRef = doc(db, 'questionnaires', id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() };
  }
  return null;
}

export async function getLatestQuestionnaire() {
  const q = query(
    collection(db, 'questionnaires'),
    orderBy('createdAt', 'desc'),
    limit(1)
  );
  const snapshot = await getDocs(q);
  if (!snapshot.empty) {
    return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
  }
  return null;
}

// Response Functions
export async function getResponse(questionnaireId: string, patientId: string) {
  const q = query(
    collection(db, 'responses'),
    where('questionnaireId', '==', questionnaireId),
    where('patientId', '==', patientId)
  );
  const snapshot = await getDocs(q);
  if (!snapshot.empty) {
    return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
  }
  return null;
}

export async function createResponse(data: any) {
  return await addDoc(collection(db, 'responses'), {
    ...data,
    startedAt: new Date(),
    status: 'in_progress'
  });
}

export async function updateResponse(id: string, data: any) {
  const docRef = doc(db, 'responses', id);
  await updateDoc(docRef, {
    ...data,
    lastUpdated: new Date()
  });
}

export async function completeResponse(id: string, data: any) {
  const docRef = doc(db, 'responses', id);
  await updateDoc(docRef, {
    ...data,
    completedAt: new Date(),
    status: 'completed'
  });
}

// Patient Functions
export async function createPatient(data: any) {
  return await addDoc(collection(db, 'patients'), {
    ...data,
    createdAt: new Date(),
    status: 'pending'
  });
}

export async function updatePatientStatus(id: string, status: string) {
  const docRef = doc(db, 'patients', id);
  await updateDoc(docRef, { status });
}