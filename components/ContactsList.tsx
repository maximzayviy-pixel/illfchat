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
  phoneNumber?: string;
  createdAt: string;
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
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.phoneNumber && user.phoneNumber.includes(searchTerm))
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
      {/* Modern Search */}
      <div className="relative group">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
        <input
          type="text"
          placeholder="Поиск по имени, email или номеру..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-4 bg-white/80 backdrop-blur-xl border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-300 text-slate-900 placeholder-slate-500 shadow-soft hover:shadow-medium"
        />
      </div>

      {/* Users List */}
      <div className="space-y-3">
        {filteredUsers.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <User className="w-10 h-10 text-slate-400" />
            </div>
            <p className="text-slate-600 text-lg">
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
              className="bg-white/70 backdrop-blur-xl border border-white/20 rounded-2xl p-6 hover:shadow-large hover:bg-white/80 transition-all duration-300 group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center shadow-medium group-hover:shadow-glow transition-all duration-300">
                      <User className="w-8 h-8 text-white" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-success-500 rounded-full border-2 border-white"></div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900 text-lg mb-1">{user.username}</h3>
                    <p className="text-slate-600 mb-2">{user.email}</p>
                    {user.phoneNumber && (
                      <div className="inline-flex items-center space-x-1 bg-primary-50 text-primary-700 px-3 py-1 rounded-xl text-sm font-medium">
                        <Phone className="w-3 h-3" />
                        <span>{user.phoneNumber}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleCall(user, 'video')}
                    className="p-3 bg-gradient-to-br from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white rounded-xl transition-all duration-300 shadow-medium hover:shadow-large"
                    title="Видеозвонок"
                  >
                    <Video className="w-5 h-5" />
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleCall(user, 'audio')}
                    className="p-3 bg-gradient-to-br from-success-500 to-success-600 hover:from-success-600 hover:to-success-700 text-white rounded-xl transition-all duration-300 shadow-medium hover:shadow-large"
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
