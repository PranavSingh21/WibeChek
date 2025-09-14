import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  collection, 
  onSnapshot, 
  doc, 
  updateDoc, 
  arrayUnion, 
  arrayRemove,
  addDoc,
  query,
  where
} from 'firebase/firestore';
import { db } from '../firebase/config';
import VibeCard from '../components/VibeCard';
import AvailabilityToggle from '../components/AvailabilityToggle';
import { Plus, Users, Settings } from 'lucide-react';

// Mock user for development
const currentUser = {
  uid: "mockUser123",
  name: "Test User", 
  email: "test@example.com",
  photoURL: "https://via.placeholder.com/150"
};

interface Vibe {
  id: string;
  emoji: string;
  title: string;
  participants: string[];
  createdBy: string;
  createdAt: Date;
}

interface Group {
  id: string;
  name: string;
  members: string[];
}

export default function HomePageWithGroups() {
  const navigate = useNavigate();
  const [vibes, setVibes] = useState<Vibe[]>([]);
  const [userGroups, setUserGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [userVibes, setUserVibes] = useState<Set<string>>(new Set());
  const [isAvailable, setIsAvailable] = useState(true);
  const [showAddVibe, setShowAddVibe] = useState(false);
  const [newVibeEmoji, setNewVibeEmoji] = useState('');
  const [newVibeTitle, setNewVibeTitle] = useState('');
  const [loading, setLoading] = useState(false);

  // Load user's groups
  useEffect(() => {
    const unsubscribe = onSnapshot(
      query(collection(db, 'groups'), where('members', 'array-contains', currentUser.uid)),
      (snapshot) => {
        const groups = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Group[];
        setUserGroups(groups);
        
        // Auto-select first group if none selected
        if (groups.length > 0 && !selectedGroup) {
          setSelectedGroup(groups[0]);
        }
      }
    );

    return () => unsubscribe();
  }, [selectedGroup]);

  // Load vibes for selected group
  useEffect(() => {
    if (!selectedGroup) return;

    const vibesRef = collection(db, 'groups', selectedGroup.id, 'vibes');
    const unsubscribe = onSnapshot(vibesRef, (snapshot) => {
      const vibesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Vibe[];
      setVibes(vibesData);

      // Update user's current vibes
      const currentUserVibes = new Set<string>();
      vibesData.forEach(vibe => {
        if (vibe.participants.includes(currentUser.uid)) {
          currentUserVibes.add(vibe.id);
        }
      });
      setUserVibes(currentUserVibes);
    });

    return () => unsubscribe();
  }, [selectedGroup]);

  const handleVibeToggle = async (vibeId: string) => {
    if (!selectedGroup) return;

    const vibeRef = doc(db, 'groups', selectedGroup.id, 'vibes', vibeId);
    const isCurrentlyJoined = userVibes.has(vibeId);

    try {
      if (isCurrentlyJoined) {
        await updateDoc(vibeRef, {
          participants: arrayRemove(currentUser.uid)
        });
      } else {
        await updateDoc(vibeRef, {
          participants: arrayUnion(currentUser.uid)
        });
      }
    } catch (error) {
      console.error('Error toggling vibe:', error);
    }
  };

  const handleAddVibe = async () => {
    if (!selectedGroup || !newVibeEmoji.trim() || !newVibeTitle.trim()) return;

    setLoading(true);
    try {
      const vibesRef = collection(db, 'groups', selectedGroup.id, 'vibes');
      await addDoc(vibesRef, {
        emoji: newVibeEmoji.trim(),
        title: newVibeTitle.trim(),
        participants: [],
        createdBy: currentUser.uid,
        createdAt: new Date(),
      });

      setNewVibeEmoji('');
      setNewVibeTitle('');
      setShowAddVibe(false);
    } catch (error) {
      console.error('Error adding vibe:', error);
    } finally {
      setLoading(false);
    }
  };

  // Redirect to groups page if no groups
  if (userGroups.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-6xl mb-4">👥</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">No Groups Yet</h2>
          <p className="text-gray-600 mb-6">Create or join a group to start vibing with friends!</p>
          <button
            onClick={() => navigate('/groups')}
            className="py-3 px-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-medium hover:from-purple-700 hover:to-pink-700 transition-all"
          >
            Go to Groups
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="text-2xl">✨</div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">VibeCheck</h1>
                {selectedGroup && (
                  <p className="text-sm text-gray-600">{selectedGroup.name}</p>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <AvailabilityToggle 
                isAvailable={isAvailable} 
                onToggle={setIsAvailable} 
              />
              
              <div className="flex items-center space-x-2">
                <img 
                  src={currentUser.photoURL} 
                  alt="Profile" 
                  className="w-8 h-8 rounded-full border-2 border-purple-200"
                />
                <span className="text-sm font-medium text-gray-700 hidden sm:block">
                  {currentUser.name}
                </span>
              </div>

              <button
                onClick={() => navigate('/groups')}
                className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
              >
                <Settings size={18} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Group Selector */}
      {userGroups.length > 1 && (
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex space-x-2 overflow-x-auto pb-2">
            {userGroups.map((group) => (
              <button
                key={group.id}
                onClick={() => setSelectedGroup(group)}
                className={`
                  flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all
                  ${selectedGroup?.id === group.id
                    ? 'bg-purple-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                  }
                `}
              >
                {group.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">What's your vibe?</h2>
          <p className="text-gray-600">Join your friends and let them know what you're up to</p>
          <div className="mt-4 inline-flex items-center space-x-4 text-sm text-gray-500">
            <span className="flex items-center">
              <Users size={16} className="mr-1" />
              {userVibes.size} active {userVibes.size === 1 ? 'vibe' : 'vibes'}
            </span>
          </div>
        </div>

        {/* Vibes Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
          {vibes.map((vibe) => (
            <VibeCard
              key={vibe.id}
              emoji={vibe.emoji}
              title={vibe.title}
              count={vibe.participants.length}
              joined={userVibes.has(vibe.id)}
              onClick={() => handleVibeToggle(vibe.id)}
            />
          ))}

          {/* Add Vibe Card */}
          <div
            onClick={() => setShowAddVibe(true)}
            className="p-6 rounded-2xl cursor-pointer transition-all duration-300 transform hover:scale-105 active:scale-95 bg-gradient-to-br from-gray-100 to-gray-200 hover:from-purple-100 hover:to-pink-100 border-2 border-dashed border-gray-300 hover:border-purple-300"
          >
            <div className="text-center">
              <Plus className="w-8 h-8 mx-auto mb-3 text-gray-400" />
              <h3 className="font-semibold text-gray-600">Add Custom Vibe</h3>
            </div>
          </div>
        </div>

        {/* Add Vibe Modal */}
        {showAddVibe && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Create New Vibe</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Emoji
                  </label>
                  <input
                    type="text"
                    value={newVibeEmoji}
                    onChange={(e) => setNewVibeEmoji(e.target.value)}
                    placeholder="🎮"
                    className="w-full p-3 border border-gray-300 rounded-xl text-2xl text-center"
                    maxLength={2}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    value={newVibeTitle}
                    onChange={(e) => setNewVibeTitle(e.target.value)}
                    placeholder="Gaming Session"
                    className="w-full p-3 border border-gray-300 rounded-xl"
                    maxLength={30}
                  />
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setShowAddVibe(false)}
                  className="flex-1 py-3 px-4 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddVibe}
                  disabled={loading || !newVibeEmoji.trim() || !newVibeTitle.trim()}
                  className="flex-1 py-3 px-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-medium hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Creating...' : 'Create Vibe'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}