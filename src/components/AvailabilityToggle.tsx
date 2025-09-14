import React from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';

interface AvailabilityToggleProps {
  isAvailable: boolean;
  onToggle: (available: boolean) => void;
}

export default function AvailabilityToggle({ isAvailable, onToggle }: AvailabilityToggleProps) {
  const { user } = useAuth();

  const handleToggle = async () => {
    if (!user) return;
    
    const newAvailability = !isAvailable;
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        isAvailable: newAvailability,
        lastSeen: new Date(),
      });
      onToggle(newAvailability);
    } catch (error) {
      console.error('Error updating availability:', error);
    }
  };

  return (
    <div className="flex items-center space-x-3">
      <span className={`text-sm font-medium ${isAvailable ? 'text-green-600' : 'text-gray-500'}`}>
        {isAvailable ? 'Available' : 'Busy'}
      </span>
      <button
        onClick={handleToggle}
        className={`
          relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200
          ${isAvailable ? 'bg-green-500' : 'bg-gray-300'}
        `}
      >
        <span
          className={`
            inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200
            ${isAvailable ? 'translate-x-6' : 'translate-x-1'}
          `}
        />
      </button>
    </div>
  );
}