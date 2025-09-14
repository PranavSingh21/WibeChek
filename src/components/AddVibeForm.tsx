import React, { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Plus, Calendar, Clock, MapPin } from 'lucide-react';

// Mock user for development - replace with real auth later
const currentUser = {
  uid: "mockUser123",
  name: "Test User",
  email: "test@example.com",
  photoURL: "https://via.placeholder.com/150"
};

interface AddVibeFormProps {
  groupId: string;
  onVibeAdded?: () => void;
}

export default function AddVibeForm({ groupId, onVibeAdded }: AddVibeFormProps) {
  const [emoji, setEmoji] = useState('');
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [venue, setVenue] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emoji.trim() || !title.trim()) return;

    setLoading(true);
    try {
      const vibesRef = collection(db, 'groups', groupId, 'vibes');
      const vibeData: any = {
        emoji: emoji.trim(),
        title: title.trim(),
        createdBy: currentUser.uid, // Using mock user
        participants: [],
        createdAt: new Date(),
      };

      // Add optional fields only if they have values
      if (date.trim()) vibeData.date = date.trim();
      if (time.trim()) vibeData.time = time.trim();
      if (venue.trim()) vibeData.venue = venue.trim();

      await addDoc(vibesRef, vibeData);

      setEmoji('');
      setTitle('');
      setDate('');
      setTime('');
      setVenue('');
      setShowForm(false);
      onVibeAdded?.();
    } catch (error) {
      console.error('Error adding vibe:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!showForm) {
    return (
      <button
        onClick={() => setShowForm(true)}
        className="w-full p-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-purple-300 hover:text-purple-600 transition-colors flex items-center justify-center space-x-2"
      >
        <Plus size={20} />
        <span>Add Custom Vibe</span>
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-gray-50 p-4 rounded-xl space-y-4">
      {/* Emoji and Title Row */}
      <div className="flex space-x-2">
        <input
          type="text"
          value={emoji}
          onChange={(e) => setEmoji(e.target.value)}
          placeholder="🎮"
          className="w-14 p-2 border border-gray-300 rounded-lg text-center text-lg"
          maxLength={2}
          required
        />
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Gaming Session"
          className="flex-1 p-2 border border-gray-300 rounded-lg"
          maxLength={30}
          required
        />
      </div>
      
      {/* Date and Time Row */}
      <div className="grid grid-cols-2 gap-2">
        <div className="relative">
          <Calendar className="absolute left-2 top-2.5 w-4 h-4 text-gray-400" />
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full pl-8 pr-2 py-2 border border-gray-300 rounded-lg text-sm"
            placeholder="Date"
          />
        </div>
        <div className="relative">
          <Clock className="absolute left-2 top-2.5 w-4 h-4 text-gray-400" />
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="w-full pl-8 pr-2 py-2 border border-gray-300 rounded-lg text-sm"
            placeholder="Time"
          />
        </div>
      </div>

      {/* Venue Row */}
      <div className="relative">
        <MapPin className="absolute left-2 top-2.5 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={venue}
          onChange={(e) => setVenue(e.target.value)}
          placeholder="Venue (optional)"
          className="w-full pl-8 pr-2 py-2 border border-gray-300 rounded-lg text-sm"
          maxLength={50}
        />
      </div>
      
      <div className="flex space-x-2">
        <button
          type="button"
          onClick={() => setShowForm(false)}
          className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading || !emoji.trim() || !title.trim()}
          className="flex-1 py-2 px-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Adding...' : 'Add Vibe'}
        </button>
      </div>
    </form>
  );
}