import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  collection, 
  onSnapshot, 
  doc, 
  updateDoc, 
  arrayUnion, 
  arrayRemove,
  setDoc,
  getDoc,
  query,
  where,
  getDocs
} from 'firebase/firestore';
import { db } from '../firebase/config';
import VibeCard from '../components/VibeCard';
import AddVibeForm from '../components/AddVibeForm';
import { useAuth } from '../contexts/AuthContext';
import { ChevronDown, ChevronRight, Users, Settings } from 'lucide-react';

// Mock user for development - replace with real Firebase Auth later

interface Vibe {
  id: string;
  emoji: string;
  title: string;
  date?: string;
  time?: string;
  venue?: string;
  participants: string[];
  createdBy: string;
  createdAt: Date;
}

interface VibeWithParticipantNames extends Vibe {
  participantNames: string[];
}
interface Group {
  id: string;
  name: string;
  icon?: string;
  members: string[];
  createdBy: string;
}

interface GroupWithVibes extends Group {
  vibes: VibeWithParticipantNames[];
}

export default function HomePage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [groupsWithVibes, setGroupsWithVibes] = useState<GroupWithVibes[]>([]);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [isAvailable, setIsAvailable] = useState(true);
  const [loading, setLoading] = useState(true);
  const [editingName, setEditingName] = useState(false);
  const [editingImage, setEditingImage] = useState(false);
  const [newName, setNewName] = useState('');
  const [newImageURL, setNewImageURL] = useState('');
  const [userProfile, setUserProfile] = useState({
    uid: '',
    name: '',
    email: '',
    photoURL: '',
    groups: []
  });

  // Get current user from authentication
  const currentUser = user ? {
    uid: user.uid,
    name: user.displayName || 'User',
    email: user.email || '',
    photoURL: user.photoURL || 'https://via.placeholder.com/150'
  } : null;

  // If no authenticated user, this should not happen due to ProtectedRoute
  if (!currentUser) {
    return null;
  }

  // Load user profile from database on component mount
  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUserProfile({
            uid: currentUser.uid,
            name: userData.name || currentUser.name,
            email: userData.email || currentUser.email,
            photoURL: userData.photoURL || currentUser.photoURL,
            groups: userData.groups || []
          });
          // Update the newImageURL state to match the loaded profile
          setNewImageURL(userData.photoURL || currentUser.photoURL);
          setNewName(userData.name || currentUser.name);
        } else {
          // If no user document exists, create one with current user data
          const newProfile = {
            uid: currentUser.uid,
            name: currentUser.name,
            email: currentUser.email,
            photoURL: currentUser.photoURL,
            groups: []
          };
          setUserProfile(newProfile);
          setNewImageURL(currentUser.photoURL);
          setNewName(currentUser.name);
          
          // Save to database
          await setDoc(doc(db, 'users', currentUser.uid), {
            ...newProfile,
            isAvailable: true,
            createdAt: new Date(),
            lastSeen: new Date(),
          });
        }
      } catch (error) {
        console.error('Error loading user profile:', error);
      }
    };

    loadUserProfile();
  }, [currentUser.uid, currentUser.name, currentUser.email, currentUser.photoURL]);

  // Load user's groups and their vibes
  useEffect(() => {
    // Get user's groups from their profile
    const loadUserGroups = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (!userDoc.exists()) {
          setGroupsWithVibes([]);
          setLoading(false);
          return;
        }
        
        const userData = userDoc.data();
        const userGroupIds = userData.groups || [];
        
        if (userGroupIds.length === 0) {
          setGroupsWithVibes([]);
          setLoading(false);
          return;
        }
        
        // Get all user's groups
        const groupPromises = userGroupIds.map((groupId: string) => 
          getDoc(doc(db, 'groups', groupId))
        );
        
        const groupDocs = await Promise.all(groupPromises);
        const groups = groupDocs
          .filter(doc => doc.exists())
          .map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as Group[];

        if (groups.length === 0) {
          setGroupsWithVibes([]);
          setLoading(false);
          return;
        }

        // For each group, listen to its vibes
        const groupVibeUnsubscribes: (() => void)[] = [];
        const groupsWithVibesMap = new Map<string, GroupWithVibes>();

        groups.forEach(group => {
          // Initialize group with empty vibes
          groupsWithVibesMap.set(group.id, { ...group, vibes: [] });

          // Listen to vibes for this group
          const vibesRef = collection(db, 'groups', group.id, 'vibes');
          const vibeUnsubscribe = onSnapshot(vibesRef, async (vibesSnapshot) => {
            const vibesData = vibesSnapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            })) as Vibe[];

            // Get participant names for each vibe
            const vibesWithNames = await Promise.all(
              vibesData.map(async (vibe) => {
                const participantNames = await getParticipantNames(vibe.participants);
                return {
                  ...vibe,
                  participantNames
                };
              })
            );

            // Update the group's vibes
            const updatedGroup = groupsWithVibesMap.get(group.id);
            if (updatedGroup) {
              updatedGroup.vibes = vibesWithNames;
              setGroupsWithVibes(Array.from(groupsWithVibesMap.values()));
            }
          });

          groupVibeUnsubscribes.push(vibeUnsubscribe);
        });

        setLoading(false);

        // Cleanup function for vibe listeners
        return () => {
          groupVibeUnsubscribes.forEach(unsub => unsub());
        };
      } catch (error) {
        console.error('Error loading user groups:', error);
        setLoading(false);
      }
    };

    loadUserGroups();
  }, []);

  // Helper function to get participant names from user IDs
  const getParticipantNames = async (participantIds: string[]): Promise<string[]> => {
    if (participantIds.length === 0) return [];
    
    try {
      const userPromises = participantIds.map(async (userId) => {
        // Handle current user
        if (userId === currentUser.uid) {
          return userProfile.name;
        }
        
        const userDoc = await getDoc(doc(db, 'users', userId));
        if (userDoc.exists()) {
          return userDoc.data().name || 'Unknown User';
        }
        return 'Unknown User';
      });
      
      return await Promise.all(userPromises);
    } catch (error) {
      console.error('Error fetching participant names:', error);
      return participantIds.map(() => 'Unknown User');
    }
  };
  
  const toggleGroupExpansion = (groupId: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupId)) {
      newExpanded.delete(groupId);
    } else {
      newExpanded.add(groupId);
    }
    setExpandedGroups(newExpanded);
  };

  const handleVibeToggle = async (groupId: string, vibeId: string, isCurrentlyJoined: boolean) => {
    try {
      const vibeRef = doc(db, 'groups', groupId, 'vibes', vibeId);
      
      // Ensure user profile exists in database before joining
      await setDoc(doc(db, 'users', currentUser.uid), {
        uid: currentUser.uid,
        name: userProfile.name,
        email: userProfile.email,
        photoURL: userProfile.photoURL,
        groups: userProfile.groups || [],
        isAvailable: isAvailable,
        lastSeen: new Date(),
        createdAt: new Date(),
      }, { merge: true });

      if (isCurrentlyJoined) {
        await updateDoc(vibeRef, {
          participants: arrayRemove(currentUser.uid) // Using mock user
        });
      } else {
        await updateDoc(vibeRef, {
          participants: arrayUnion(currentUser.uid) // Using mock user
        });
      }
      
      console.log(`User ${currentUser.name} ${isCurrentlyJoined ? 'left' : 'joined'} vibe: ${vibeId}`);
    } catch (error) {
      console.error('Error toggling vibe:', error);
    }
  };

  const handleNameEdit = () => {
    setEditingName(true);
    setNewName(userProfile.name);
  };

  const handleImageEdit = () => {
    setEditingImage(true);
    setNewImageURL(userProfile.photoURL);
  };

  const saveNameEdit = () => {
    if (newName.trim()) {
      const updatedProfile = { ...userProfile, name: newName.trim() };
      setUserProfile(updatedProfile);
      saveUserProfileToDatabase(updatedProfile);
      setEditingName(false);
    }
  };

  const saveImageEdit = () => {
    if (newImageURL.trim()) {
      const updatedProfile = { ...userProfile, photoURL: newImageURL.trim() };
      setUserProfile(updatedProfile);
      saveUserProfileToDatabase(updatedProfile);
      setEditingImage(false);
    }
  };

  const cancelNameEdit = () => {
    setEditingName(false);
    setNewName(userProfile.name);
  };

  const cancelImageEdit = () => {
    setEditingImage(false);
    setNewImageURL(userProfile.photoURL);
  };

  const saveUserProfileToDatabase = async (profile: typeof userProfile) => {
    try {
      await setDoc(doc(db, 'users', currentUser.uid), {
        uid: profile.uid,
        name: profile.name,
        email: profile.email,
        photoURL: profile.photoURL,
        groups: profile.groups || [],
        isAvailable: isAvailable,
        lastSeen: new Date(),
        updatedAt: new Date(),
      }, { merge: true });
      console.log('User profile saved to database:', profile);
    } catch (error) {
      console.error('Error saving user profile:', error);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }
      
      // Create object URL for preview
      const imageUrl = URL.createObjectURL(file);
      setNewImageURL(imageUrl);
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">✨</div>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  // Redirect to groups page if no groups
  if (groupsWithVibes.length === 0) {
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
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="text-2xl">✨</div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">WibeChek</h1>
                <p className="text-sm text-gray-600">Your Vibes</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <img 
                    src={userProfile.photoURL} 
                    alt="Profile" 
                    className="w-8 h-8 rounded-full border-2 border-purple-200 cursor-pointer hover:border-purple-400 transition-colors"
                    onClick={handleImageEdit}
                    title="Click to edit profile image"
                  />
                </div>
                <span 
                  className="text-sm font-medium text-gray-700 hidden sm:block cursor-pointer hover:text-purple-600 transition-colors"
                  onClick={handleNameEdit}
                  title="Click to edit name"
                >
                  {userProfile.name}
                </span>
              </div>

              <button
                onClick={() => navigate('/groups')}
                className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                title="Manage Groups"
              >
                <Settings size={18} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-6 space-y-4">
        {groupsWithVibes.map((group) => {
          const isExpanded = expandedGroups.has(group.id);
          const userVibes = new Set(
            group.vibes
              .filter(vibe => vibe.participants.includes(currentUser.uid)) // Using mock user
              .map(vibe => vibe.id)
          );

          return (
            <div key={group.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {/* Group Header */}
              <button
                onClick={() => toggleGroupExpansion(group.id)}
                className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">{group.icon || '👥'}</div>
                  <div className="text-left">
                    <h2 className="text-lg font-semibold text-gray-800">{group.name}</h2>
                    <p className="text-sm text-gray-500">
                      {group.vibes.length} {group.vibes.length === 1 ? 'vibe' : 'vibes'} • {userVibes.size} active
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1 text-sm text-gray-500">
                    <Users size={16} />
                    <span>{group.members.length}</span>
                  </div>
                  {isExpanded ? (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              </button>

              {/* Group Content */}
              {isExpanded && (
                <div className="px-4 pb-4 space-y-4">
                  {/* Vibes Grid */}
                  {group.vibes.length > 0 && (
                    <div className="grid grid-cols-2 gap-3">
                      {group.vibes.map((vibe) => (
                        <VibeCard
                          key={vibe.id}
                          emoji={vibe.emoji}
                          title={vibe.title}
                          date={vibe.date}
                          time={vibe.time}
                          venue={vibe.venue}
                          count={vibe.participants.length}
                          participantNames={vibe.participantNames}
                          joined={vibe.participants.includes(currentUser.uid)} // Using mock user
                          onClick={() => handleVibeToggle(
                            group.id, 
                            vibe.id, 
                            vibe.participants.includes(currentUser.uid) // Using mock user
                          )}
                        />
                      ))}
                    </div>
                  )}

                  {/* No Vibes Message */}
                  {group.vibes.length === 0 && (
                    <div className="text-center py-6 text-gray-500">
                      <div className="text-3xl mb-2">🎭</div>
                      <p>No vibes yet in this group</p>
                      <p className="text-sm">Add the first one below!</p>
                    </div>
                  )}

                  {/* Add Vibe Form */}
                  <AddVibeForm groupId={group.id} />
                </div>
              )}
            </div>
          );
        })}
      </main>

      {/* Edit Name Modal */}
      {editingName && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Edit Name</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Display Name
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  maxLength={50}
                  autoFocus
                />
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={cancelNameEdit}
                className="flex-1 py-3 px-4 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveNameEdit}
                disabled={!newName.trim()}
                className="flex-1 py-3 px-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-medium hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Image Modal */}
      {editingImage && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Edit Profile Image</h3>
            
            <div className="space-y-4">
              <div className="text-center">
                <img
                  src={newImageURL}
                  alt="Preview"
                  className="w-20 h-20 rounded-full mx-auto mb-4 border-2 border-gray-200"
                  onError={(e) => {
                    e.currentTarget.src = "https://via.placeholder.com/150";
                  }}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Image
                </label>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                    autoFocus
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Select an image file (max 5MB)
                </p>
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={cancelImageEdit}
                className="flex-1 py-3 px-4 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveImageEdit}
                disabled={!newImageURL.trim()}
                className="flex-1 py-3 px-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-medium hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}