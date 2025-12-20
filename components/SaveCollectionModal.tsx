
import React, { useState } from 'react';
import { UserList, User } from '../types';
import { USERS } from '../mockData';
import { X, Plus, Search, Check, Lock, Globe, Users } from 'lucide-react';

interface SaveCollectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingLists: UserList[];
  onSaveToExisting: (listId: string) => void;
  onCreateNewList: (name: string, isPrivate: boolean, collaborators: User[]) => void;
}

export const SaveCollectionModal: React.FC<SaveCollectionModalProps> = ({ 
  isOpen, onClose, existingLists, onSaveToExisting, onCreateNewList 
}) => {
  const [view, setView] = useState<'select' | 'create'>('select');
  
  // Create List Form State
  const [listName, setListName] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFriends, setSelectedFriends] = useState<User[]>([]);

  if (!isOpen) return null;

  const handleCreate = () => {
    if (listName.trim()) {
      onCreateNewList(listName, isPrivate, selectedFriends);
      setListName('');
      setIsPrivate(false);
      setSelectedFriends([]);
      setView('select');
      onClose();
    }
  };

  const toggleFriend = (user: User) => {
    if (selectedFriends.find(f => f.id === user.id)) {
      setSelectedFriends(selectedFriends.filter(f => f.id !== user.id));
    } else {
      setSelectedFriends([...selectedFriends, user]);
    }
  };

  // Filter users for friend search (exclude self 'u1' for demo)
  const searchResults = Object.values(USERS).filter(u => 
    u.id !== 'u1' && 
    (u.username.toLowerCase().includes(searchQuery.toLowerCase()) || 
     u.displayName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      {/* Modal Content */}
      <div className="relative bg-white w-full max-w-md rounded-t-3xl p-6 pb-10 transform transition-transform animate-[slideUp_0.3s_ease-out]">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-black text-gray-900">
            {view === 'select' ? 'Save to List' : 'Create New List'}
          </h3>
          <button onClick={onClose} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {view === 'select' ? (
          // === VIEW 1: SELECT EXISTING LIST ===
          <div className="space-y-3 max-h-[60vh] overflow-y-auto no-scrollbar">
            {/* Create New Option */}
            <button 
              onClick={() => setView('create')}
              className="w-full flex items-center space-x-4 p-4 rounded-xl border-2 border-dashed border-gray-300 hover:border-orange-500 hover:bg-orange-50 transition-colors group"
            >
              <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center group-hover:bg-orange-200">
                <Plus className="w-6 h-6 text-orange-600" />
              </div>
              <span className="font-bold text-gray-700 group-hover:text-orange-700">Create New List</span>
            </button>

            {/* Existing Lists */}
            {existingLists.map(list => (
              <button 
                key={list.id}
                onClick={() => { onSaveToExisting(list.id); onClose(); }}
                className="w-full flex items-center space-x-4 p-2 rounded-xl hover:bg-gray-50 transition-colors text-left"
              >
                <img src={list.coverUrl} className="w-12 h-12 rounded-lg object-cover bg-gray-200" alt={list.title} />
                <div className="flex-1">
                  <h4 className="font-bold text-gray-900">{list.title}</h4>
                  <div className="flex items-center text-xs text-gray-500 space-x-2">
                    <span>{list.itemCount} items</span>
                    {list.isPrivate && <Lock className="w-3 h-3" />}
                    {list.collaborators && list.collaborators.length > 0 && (
                        <div className="flex items-center space-x-1">
                             <span>•</span>
                             <Users className="w-3 h-3" />
                             <span>{list.collaborators.length} friends</span>
                        </div>
                    )}
                  </div>
                </div>
                <div className="p-2">
                  <Plus className="w-5 h-5 text-gray-400" />
                </div>
              </button>
            ))}
          </div>
        ) : (
          // === VIEW 2: CREATE NEW LIST ===
          <div className="space-y-6">
            
            {/* List Name Input */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">List Name</label>
              <input 
                type="text" 
                placeholder="e.g., Saturday Brunch Spots 🥞" 
                className="w-full p-4 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-orange-500 outline-none text-gray-900 font-medium"
                value={listName}
                onChange={(e) => setListName(e.target.value)}
                autoFocus
              />
            </div>

            {/* Privacy Toggle */}
            <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-gray-700">List Privacy</label>
                <div className="flex bg-gray-100 p-1 rounded-lg">
                    <button 
                        onClick={() => setIsPrivate(false)}
                        className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${!isPrivate ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}
                    >
                        Public
                    </button>
                    <button 
                        onClick={() => setIsPrivate(true)}
                        className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${isPrivate ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}
                    >
                        Private
                    </button>
                </div>
            </div>

            {/* Add Friends Section */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Add Friends</label>
              
              {/* Selected Friends Chips */}
              {selectedFriends.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                    {selectedFriends.map(friend => (
                        <div key={friend.id} className="flex items-center bg-blue-50 text-blue-700 px-2 py-1 rounded-full text-xs font-bold border border-blue-100">
                            <img src={friend.avatarUrl} className="w-4 h-4 rounded-full mr-1" alt="" />
                            {friend.username}
                            <button onClick={() => toggleFriend(friend)} className="ml-1 hover:text-blue-900"><X className="w-3 h-3" /></button>
                        </div>
                    ))}
                </div>
              )}

              {/* Search Box */}
              <div className="relative mb-2">
                <Search className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Search by username..."
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Search Results */}
              {searchQuery && (
                  <div className="max-h-32 overflow-y-auto border border-gray-100 rounded-xl divide-y divide-gray-50">
                      {searchResults.map(user => {
                          const isSelected = selectedFriends.some(f => f.id === user.id);
                          return (
                            <button 
                                key={user.id} 
                                onClick={() => toggleFriend(user)}
                                className="w-full flex items-center justify-between p-3 hover:bg-gray-50 text-left"
                            >
                                <div className="flex items-center space-x-2">
                                    <img src={user.avatarUrl} className="w-8 h-8 rounded-full bg-gray-200" alt="" />
                                    <div>
                                        <p className="text-xs font-bold text-gray-900">{user.displayName}</p>
                                        <p className="text-[10px] text-gray-500">@{user.username}</p>
                                    </div>
                                </div>
                                {isSelected ? (
                                    <div className="bg-blue-500 rounded-full p-1"><Check className="w-3 h-3 text-white" /></div>
                                ) : (
                                    <div className="w-5 h-5 rounded-full border border-gray-300" />
                                )}
                            </button>
                          );
                      })}
                      {searchResults.length === 0 && (
                          <div className="p-3 text-center text-xs text-gray-400">No users found</div>
                      )}
                  </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-4">
                <button 
                    onClick={() => setView('select')}
                    className="flex-1 py-3 text-gray-600 font-bold bg-gray-100 rounded-xl hover:bg-gray-200"
                >
                    Back
                </button>
                <button 
                    onClick={handleCreate}
                    disabled={!listName.trim()}
                    className="flex-[2] py-3 text-white font-bold bg-orange-600 rounded-xl shadow-lg shadow-orange-500/20 hover:bg-orange-700 disabled:opacity-50 disabled:shadow-none transition-all"
                >
                    Create List
                </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
