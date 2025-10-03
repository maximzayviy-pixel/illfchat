'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Phone, Video, User, Search, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  createdAt?: string;
}

interface ContactsListProps {
  currentUser: User;
  onStartCall: (userId: string, username: string, type: 'video' | 'audio') => void;
}

export default function ContactsList({ currentUser, onStartCall }: ContactsListProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        // Исключаем текущего пользователя из списка
        const otherUsers = data.users.filter((user: User) => user.id !== currentUser.id);
        setUsers(otherUsers);
      } else {
        toast.error('Ошибка загрузки контактов');
      }
    } catch (error) {
      toast.error('Ошибка соединения');
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCall = (user: User, type: 'video' | 'audio') => {
    onStartCall(user.id, user.username, type);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Поиск контактов..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input-field pl-10"
        />
      </div>

      {/* Users List */}
      <div className="space-y-3">
        {filteredUsers.length === 0 ? (
          <div className="text-center py-8">
            <User className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">
              {searchTerm ? 'Контакты не найдены' : 'Нет доступных контактов'}
            </p>
          </div>
        ) : (
          filteredUsers.map((user, index) => (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="card p-4 hover:shadow-lg transition-all duration-300"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{user.username}</h3>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleCall(user, 'video')}
                    className="p-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors"
                    title="Видеозвонок"
                  >
                    <Video className="w-5 h-5" />
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleCall(user, 'audio')}
                    className="p-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                    title="Аудиозвонок"
                  >
                    <Phone className="w-5 h-5" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
