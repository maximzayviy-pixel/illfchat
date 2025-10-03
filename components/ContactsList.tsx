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
      {/* Military Search */}
      <div className="relative">
        <div className="absolute inset-0 bg-military-pattern opacity-5 rounded-2xl"></div>
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-military-600" />
        <input
          type="text"
          placeholder="Поиск по имени, email или номеру..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="relative w-full pl-12 pr-4 py-4 bg-military-50/90 backdrop-blur-md border-2 border-military-300 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all text-military-900 placeholder-military-500 font-military"
        />
        <div className="absolute inset-0 rounded-2xl border-2 border-transparent bg-gradient-to-r from-primary-500/20 to-secondary-500/20 opacity-0 hover:opacity-100 transition-opacity pointer-events-none"></div>
      </div>

      {/* Users List */}
      <div className="space-y-3">
        {filteredUsers.length === 0 ? (
          <div className="text-center py-12">
            <div className="relative">
              <div className="w-16 h-16 bg-military-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-military-600" />
              </div>
              <div className="absolute inset-0 bg-military-pattern opacity-10 rounded-full"></div>
            </div>
            <p className="text-military-600 font-military">
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
              className="relative bg-military-50/80 backdrop-blur-md border-2 border-military-200 rounded-2xl p-4 hover:shadow-lg hover:border-primary-500 transition-all duration-300 group"
            >
              <div className="absolute inset-0 bg-military-pattern opacity-5 rounded-2xl"></div>
              <div className="relative flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <div className="w-14 h-14 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center shadow-lg">
                      <User className="w-7 h-7 text-white" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse-military"></div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-military-900 text-lg">{user.username}</h3>
                    <p className="text-sm text-military-600 mb-1">{user.email}</p>
                    {user.phoneNumber && (
                      <p className="text-sm font-military text-primary-600 bg-primary-100 px-2 py-1 rounded-lg inline-block">
                        📞 {user.phoneNumber}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleCall(user, 'video')}
                    className="p-3 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
                    title="Видеозвонок"
                  >
                    <Video className="w-6 h-6" />
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleCall(user, 'audio')}
                    className="p-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
                    title="Аудиозвонок"
                  >
                    <Phone className="w-6 h-6" />
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
