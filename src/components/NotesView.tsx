import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { Save } from 'lucide-react';

export function NotesView() {
  const { userId } = useParams();
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchNotes = async () => {
      if (!userId) return;
      const docRef = doc(db, 'patients', userId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists() && docSnap.data().notes) {
        setNotes(docSnap.data().notes);
      }
    };
    fetchNotes();
  }, [userId]);

  const handleSave = async () => {
    if (!userId) return;
    setIsSaving(true);
    try {
      await updateDoc(doc(db, 'patients', userId), {
        notes: notes,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error saving notes:', error);
    }
    setIsSaving(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Anotações do Paciente</h2>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
            >
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
          <textarea
            className="w-full p-4 border rounded-lg h-96 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Digite suas anotações aqui..."
          />
        </div>
      </div>
    </div>
  );
}