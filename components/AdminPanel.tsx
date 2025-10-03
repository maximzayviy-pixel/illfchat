'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Phone, 
  Video, 
  Trash2, 
  Shield, 
  BarChart3, 
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';

interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  createdAt: string;
}

interface CallStats {
  totalCalls: number;
  videoCalls: number;
  audioCalls: number;
  totalDuration: number;
}

interface AdminPanelProps {
  currentUser: User;
  onBack: () => void;
}

export default function AdminPanel({ currentUser, onBack }: AdminPanelProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<CallStats>({
    totalCalls: 0,
    videoCalls: 0,
    audioCalls: 0,
    totalDuration: 0,
  });
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  useEffect(() => {
    fetchUsers();
    fetchStats();
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
        setUsers(data.users);
      } else {
        toast.error('Ошибка загрузки пользователей');
      }
    } catch (error) {
      toast.error('Ошибка соединения');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    // В реальном приложении здесь был бы запрос к API для получения статистики
    // Пока используем моковые данные
    setStats({
      totalCalls: 156,
      videoCalls: 89,
      audioCalls: 67,
      totalDuration: 12450, // в минутах
    });
  };

  const deleteUser = async (userId: string) => {
    if (!confirm('Вы уверены, что хотите удалить этого пользователя?')) {
      return;
    }

    try {
      // В реальном приложении здесь был бы запрос к API для удаления пользователя
      toast.success('Пользователь удален');
      fetchUsers();
    } catch (error) {
      toast.error('Ошибка удаления пользователя');
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}ч ${mins}м`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <motion.header
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white/80 backdrop-blur-md border-b border-white/20"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold gradient-text">Админ-панель</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Администратор: {currentUser.username}</span>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onBack}
                className="btn-secondary"
              >
                Назад
              </motion.button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Statistics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-1 space-y-6"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-4">Статистика</h2>
            
            <div className="space-y-4">
              <div className="card p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Всего звонков</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalCalls}</p>
                  </div>
                  <Phone className="w-8 h-8 text-primary-500" />
                </div>
              </div>

              <div className="card p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Видеозвонки</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.videoCalls}</p>
                  </div>
                  <Video className="w-8 h-8 text-green-500" />
                </div>
              </div>

              <div className="card p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Аудиозвонки</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.audioCalls}</p>
                  </div>
                  <Phone className="w-8 h-8 text-blue-500" />
                </div>
              </div>

              <div className="card p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Общее время</p>
                    <p className="text-2xl font-bold text-gray-900">{formatDuration(stats.totalDuration)}</p>
                  </div>
                  <Clock className="w-8 h-8 text-purple-500" />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Users List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Пользователи ({users.length})</h2>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={fetchUsers}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                title="Обновить"
              >
                <RefreshCw className="w-5 h-5" />
              </motion.button>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {users.map((user, index) => (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="card p-4 hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
                        <Users className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{user.username}</h3>
                        <p className="text-sm text-gray-500">{user.email}</p>
                        <p className="text-xs text-gray-400">
                          Регистрация: {new Date(user.createdAt).toLocaleDateString('ru-RU')}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center space-x-1">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-gray-600">Активен</span>
                      </div>
                      
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => deleteUser(user.id)}
                        className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                        title="Удалить пользователя"
                      >
                        <Trash2 className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
