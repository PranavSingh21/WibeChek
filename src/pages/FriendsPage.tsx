import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase/config';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { ArrowLeft, User } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Friend {
  uid: string;
  name: string;
  photoURL: string;
  isAvailable: boolean;
}

export default function FriendsPage() {
  const { user } = useAuth();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // For now, show all users as potential friends
    // In a real app, you'd have a friends collection or relationship
    const unsubscribe = onSnapshot(
      query(collection(db, 'users'), where('uid', '!=', user?.uid || '')),
      (snapshot) => {
        const friendsData = snapshot.docs.map(doc => doc.data() as Friend);
        setFriends(friendsData);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user?.uid]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <Link
              to="/home"
              className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
            >
              <ArrowLeft size={20} />
            </Link>
            <div className="flex items-center space-x-3">
              <div className="text-2xl">👥</div>
              <h1 className="text-xl font-bold text-gray-800">Friends</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Your Community</h2>
          <p className="text-gray-600">See who's available and what they're up to</p>
        </div>

        {friends.length === 0 ? (
          <div className="text-center py-12">
            <User size={48} className="mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No friends yet</h3>
            <p className="text-gray-500">Invite friends to join VibeCheck!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {friends.map((friend) => (
              <div
                key={friend.uid}
                className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <img
                      src={friend.photoURL}
                      alt={friend.name}
                      className="w-12 h-12 rounded-full border-2 border-gray-200"
                    />
                    <div
                      className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                        friend.isAvailable ? 'bg-green-500' : 'bg-gray-400'
                      }`}
                    />
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800">{friend.name}</h3>
                    <p className={`text-sm ${friend.isAvailable ? 'text-green-600' : 'text-gray-500'}`}>
                      {friend.isAvailable ? 'Available' : 'Busy'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}