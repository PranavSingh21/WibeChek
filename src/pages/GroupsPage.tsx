import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  collection, 
  addDoc, 
  updateDoc,
  deleteDoc,
  doc,
  getDoc,
  arrayUnion,
  arrayRemove,
  onSnapshot,
  query,
  where,
  getDocs
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { Users, Plus, Home, MoreVertical, Edit2, Trash2, Hash, ArrowRight, Copy, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface Group {
  id: string;
  name: string;
  icon?: string;
  code: string;
  createdBy: string;
  members: string[];
  createdAt: Date;
}

export default function GroupsPage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [groupName, setGroupName] = useState('');
  const [groupCode, setGroupCode] = useState('');
  const [userGroups, setUserGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingGroup, setEditingGroup] = useState<string | null>(null);
  const [editGroupName, setEditGroupName] = useState('');
  const [editGroupIcon, setEditGroupIcon] = useState('');
  const [openMenu, setOpenMenu] = useState<string | null>(null);

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

  useEffect(() => {
    const loadUserGroups = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (!userDoc.exists()) {
          setUserGroups([]);
          return;
        }
        
        const userData = userDoc.data();
        const userGroupIds = userData.groups || [];
        
        if (userGroupIds.length === 0) {
          setUserGroups([]);
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
        
        setUserGroups(groups);
      } catch (error) {
        console.error('Error loading user groups:', error);
      }
    };

    loadUserGroups();
  }, []);

  // Generate a unique 6-character group code
  const generateGroupCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      setError('Please enter a group name');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const groupCode = generateGroupCode();
      
      // Create group in Firestore
      const groupRef = await addDoc(collection(db, 'groups'), {
        name: groupName.trim(),
        icon: '👥', // Default icon
        code: groupCode,
        createdBy: currentUser.uid,
        members: [currentUser.uid],
        createdAt: new Date(),
      });

      // Add group ID to user's groups array
      await updateDoc(doc(db, 'users', currentUser.uid), {
        groups: arrayUnion(groupRef.id)
      });

      setSuccess('Group created successfully!');
      setGroupName('');
      
      // Navigate to home after short delay
      setTimeout(() => {
        navigate('/home');
      }, 1500);
      
    } catch (error) {
      console.error('Error creating group:', error);
      setError('Failed to create group. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinGroup = async () => {
    if (!groupCode.trim()) {
      setError('Please enter a group code');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      // Find group by code
      const groupsQuery = query(
        collection(db, 'groups'), 
        where('code', '==', groupCode.trim().toUpperCase())
      );
      
      const groupsSnapshot = await getDocs(groupsQuery);
      
      if (groupsSnapshot.empty) {
        setError('Group not found. Please check the code and try again.');
        return;
      }
      
      const groupDoc = groupsSnapshot.docs[0];
      const group = groupDoc.data() as Group;
      
      // Check if user is already a member
      if (group.members.includes(currentUser.uid)) {
        setError('You are already a member of this group.');
        return;
      }
      
      // Add user to group
      await updateDoc(doc(db, 'groups', groupDoc.id), {
        members: arrayUnion(currentUser.uid)
      });
      
      // Add group ID to user's groups array
      await updateDoc(doc(db, 'users', currentUser.uid), {
        groups: arrayUnion(groupDoc.id)
      });

      setSuccess(`Successfully joined "${group.name}"!`);
      setGroupCode('');
      
      // Navigate to home after short delay
      setTimeout(() => {
        navigate('/home');
      }, 1500);
      
    } catch (error) {
      console.error('Error joining group:', error);
      setError('Failed to join group. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditGroup = async (groupId: string) => {
    if (!editGroupName.trim() || !editGroupIcon.trim()) {
      setError('Please enter a group name and icon');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      await updateDoc(doc(db, 'groups', groupId), {
        name: editGroupName.trim(),
        icon: editGroupIcon.trim(),
      });

      setSuccess('Group updated successfully!');
      setEditingGroup(null);
      setEditGroupName('');
      setEditGroupIcon('');
      setOpenMenu(null);
      
      // Reload user groups to reflect changes immediately
      const updatedGroups = userGroups.map(group => 
        group.id === groupId 
          ? { ...group, name: editGroupName.trim(), icon: editGroupIcon.trim() }
          : group
      );
      setUserGroups(updatedGroups);
      
    } catch (error) {
      console.error('Error updating group:', error);
      setError('Failed to update group. Please try again.');
    } finally {
      setLoading(false);
    }
  };


  const startEditing = (group: Group) => {
    setEditingGroup(group.id);
    setEditGroupName(group.name);
    setEditGroupIcon(group.icon || '👥');
    setOpenMenu(null);
  };

  const copyGroupCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setSuccess('Group code copied to clipboard!');
    setTimeout(() => setSuccess(''), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="text-2xl">👥</div>
              <h1 className="text-xl font-bold text-gray-800">Groups</h1>
            </div>
            <button
              onClick={() => navigate('/home')}
              className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
            >
              <Home size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Status Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-300 text-red-700 rounded-xl">
            {error}
          </div>
        )}
        
        {success && (
          <div className="mb-6 p-4 bg-green-100 border border-green-300 text-green-700 rounded-xl">
            {success}
          </div>
        )}

        {/* Create Group Section */}
        <div className="bg-white rounded-2xl p-6 shadow-lg mb-6">
          <div className="flex items-center space-x-3 mb-4">
            <Plus className="w-6 h-6 text-purple-600" />
            <h2 className="text-xl font-bold text-gray-800">Create New Group</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Group Name
              </label>
              <input
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="My Awesome Group"
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                maxLength={50}
              />
            </div>
            
            <button
              onClick={handleCreateGroup}
              disabled={loading || !groupName.trim()}
              className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-medium hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <Plus size={18} />
                  <span>Create Group</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Join Group Section */}
        <div className="bg-white rounded-2xl p-6 shadow-lg mb-6">
          <div className="flex items-center space-x-3 mb-4">
            <Hash className="w-6 h-6 text-green-600" />
            <h2 className="text-xl font-bold text-gray-800">Join Existing Group</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Group Code
              </label>
              <input
                type="text"
                value={groupCode}
                onChange={(e) => setGroupCode(e.target.value.toUpperCase())}
                placeholder="ABC123"
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent font-mono text-center text-lg tracking-wider"
                maxLength={6}
              />
            </div>
            
            <button
              onClick={handleJoinGroup}
              disabled={loading || !groupCode.trim()}
              className="w-full py-3 px-4 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-xl font-medium hover:from-green-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <ArrowRight size={18} />
                  <span>Join Group</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* User's Groups */}
        {userGroups.length > 0 && (
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center space-x-3 mb-4">
              <Users className="w-6 h-6 text-green-600" />
              <h2 className="text-xl font-bold text-gray-800">Your Groups</h2>
            </div>
            
            <div className="space-y-3">
              {userGroups.map((group) => (
                <div
                  key={group.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center space-x-3 flex-1">
                    <div className="text-2xl">
                      {group.icon || '👥'}
                    </div>
                    <div>
                    {editingGroup === group.id ? (
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <input
                            type="text"
                            value={editGroupIcon}
                            onChange={(e) => setEditGroupIcon(e.target.value)}
                            placeholder="👥"
                            className="w-12 p-2 border border-gray-300 rounded text-center text-lg"
                            maxLength={2}
                          />
                          <input
                            type="text"
                            value={editGroupName}
                            onChange={(e) => setEditGroupName(e.target.value)}
                            className="font-semibold text-gray-800 bg-white border border-gray-300 rounded px-2 py-1 text-sm flex-1"
                            maxLength={50}
                            autoFocus
                          />
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEditGroup(group.id)}
                            disabled={loading}
                            className="text-green-600 hover:text-green-700 px-2 py-1 text-sm"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => {
                              setEditingGroup(null);
                              setEditGroupName('');
                              setEditGroupIcon('');
                            }}
                            className="text-red-600 hover:text-red-700 px-2 py-1 text-sm"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <h3 className="font-semibold text-gray-800">{group.name}</h3>
                        <p className="text-sm text-gray-500">
                          {group.members.length} {group.members.length === 1 ? 'member' : 'members'}
                        </p>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-gray-400">Code:</span>
                          <code className="text-xs font-mono bg-gray-200 px-2 py-1 rounded text-gray-700">
                            {group.code}
                          </code>
                          <button
                            onClick={() => copyGroupCode(group.code)}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                            title="Copy group code"
                          >
                            <Copy size={12} />
                          </button>
                        </div>
                      </>
                    )}
                    </div>
                  </div>
                  
                  {editingGroup !== group.id && (
                    <div className="relative ml-4">
                      <button
                        onClick={() => setOpenMenu(openMenu === group.id ? null : group.id)}
                        className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
                      >
                        <MoreVertical size={16} />
                      </button>
                      
                      {openMenu === group.id && (
                        <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[120px]">
                          <button
                            onClick={() => startEditing(group)}
                            className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                          >
                            <Edit2 size={14} />
                            <span>Edit</span>
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Sign Out Section */}
        <div className="bg-white rounded-2xl p-6 shadow-lg mt-6">
          <button
            onClick={signOut}
            className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-red-50 text-red-600 rounded-xl font-medium hover:bg-red-100 transition-colors"
          >
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
        
        {/* Click outside to close menu */}
        {openMenu && (
          <div 
            className="fixed inset-0 z-0" 
            onClick={() => setOpenMenu(null)}
          />
        )}
      </main>
    </div>
  );
}