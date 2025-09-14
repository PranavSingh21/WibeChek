import { useState, useEffect } from 'react';
import { collection, onSnapshot, addDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import type { Vibe } from '../types';

// Default vibes to populate the database
const DEFAULT_VIBES = [
  { emoji: '🎬', title: 'Movie Night', users: [], createdBy: 'system', createdAt: new Date() },
  { emoji: '🎮', title: 'Gaming', users: [], createdBy: 'system', createdAt: new Date() },
  { emoji: '🍕', title: 'Food Run', users: [], createdBy: 'system', createdAt: new Date() },
  { emoji: '☕', title: 'Coffee Chat', users: [], createdBy: 'system', createdAt: new Date() },
  { emoji: '🏃', title: 'Workout', users: [], createdBy: 'system', createdAt: new Date() },
  { emoji: '📚', title: 'Study Session', users: [], createdBy: 'system', createdAt: new Date() },
  { emoji: '🎵', title: 'Music Jam', users: [], createdBy: 'system', createdAt: new Date() },
  { emoji: '🌟', title: 'Chill Vibes', users: [], createdBy: 'system', createdAt: new Date() },
];

export function useFirestoreVibes() {
  const [vibes, setVibes] = useState<Vibe[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'vibes'), async (snapshot) => {
      const vibesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Vibe[];

      // If no vibes exist, add default vibes
      if (vibesData.length === 0) {
        console.log('No vibes found, adding defaults...');
        try {
          await Promise.all(
            DEFAULT_VIBES.map(vibe => addDoc(collection(db, 'vibes'), vibe))
          );
        } catch (error) {
          console.error('Error adding default vibes:', error);
        }
      } else {
        setVibes(vibesData);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  return { vibes, loading };
}