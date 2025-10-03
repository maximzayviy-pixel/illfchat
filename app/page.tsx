'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LogOut, User, Phone, Video, Settings, Shield } from 'lucide-react';
import AuthForm from '@/components/AuthForm';
import ContactsList from '@/components/ContactsList';
import VideoCall from '@/components/VideoCall';
import AudioCall from '@/components/AudioCall';
import AdminPanel from '@/components/AdminPanel';
import ProfileEdit from '@/components/ProfileEdit';
import toast from 'react-hot-toast';

interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  phoneNumber?: string;
  createdAt: string;
}

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isInCall, setIsInCall] = useState(false);
  const [callType, setCallType] = useState<'video' | 'audio' | null>(null);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [callData, setCallData] = useState<{
    roomName: string;
    userName: string;
    token: string;
    wsUrl: string;
  } | null>(null);

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleAuthSuccess = (userData: User, authToken: string) => {
    setUser(userData);
    setToken(authToken);
    localStorage.setItem('token', authToken);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    toast.success('Вы вышли из аккаунта');
  };

  const handleStartCall = async (userId: string, username: string, type: 'video' | 'audio') => {
    try {
      const roomName = `call-${type}-${Math.random().toString(36).substring(2, 15)}`;
      
      const response = await fetch('/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Временно убираем авторизацию для тестирования
          // 'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          room: roomName,
          identity: user?.username || 'User',
          name: user?.username || 'User',
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setCallData({
          roomName,
          userName: username,
          token: data.token,
          wsUrl: data.wsUrl,
        });
        setCallType(type);
        setIsInCall(true);
        toast.success(`${type === 'video' ? 'Видеозвонок' : 'Аудиозвонок'} начат`);
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Ошибка создания звонка');
      }
    } catch (error) {
      console.error('Call error:', error);
      toast.error('Ошибка соединения');
    }
  };

  const handleEndCall = () => {
    setIsInCall(false);
    setCallType(null);
    setCallData(null);
  };

  const isAdmin = user?.username === 'admin' || user?.email === 'admin@klubok.com';

  const handleProfileUpdate = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setShowProfileEdit(false);
  };

  if (isInCall && callData) {
    if (callType === 'video') {
      return (
        <VideoCall
          roomName={callData.roomName}
          userName={callData.userName}
          token={callData.token}
          wsUrl={callData.wsUrl}
          onEndCall={handleEndCall}
        />
      );
    } else if (callType === 'audio') {
      return (
        <AudioCall
          roomName={callData.roomName}
          userName={callData.userName}
          token={callData.token}
          wsUrl={callData.wsUrl}
          onEndCall={handleEndCall}
        />
      );
    }
  }

  if (showAdmin && isAdmin) {
    return (
      <AdminPanel
        currentUser={user!}
        onBack={() => setShowAdmin(false)}
      />
    );
  }

  if (showProfileEdit && user) {
    return (
      <ProfileEdit
        user={user}
        onSave={handleProfileUpdate}
        onCancel={() => setShowProfileEdit(false)}
      />
    );
  }

  if (!user || !token) {
    return <AuthForm onSuccess={handleAuthSuccess} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Modern Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-transparent to-purple-50/30"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-indigo-400/10 to-cyan-400/10 rounded-full blur-3xl"></div>
      
      {/* Header */}
      <motion.header
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative bg-white/80 backdrop-blur-xl border-b border-white/20 shadow-soft"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="relative group">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center shadow-medium group-hover:shadow-glow transition-all duration-300">
                  <Phone className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-success-500 rounded-full border-2 border-white animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 font-display">Клубок</h1>
                <p className="text-sm text-slate-600 font-medium">Система связи</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowProfileEdit(true)}
                  className="relative w-10 h-10 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center shadow-soft hover:shadow-medium transition-all duration-300 cursor-pointer group"
                  title="Редактировать профиль"
                >
                  <User className="w-5 h-5 text-slate-600 group-hover:text-slate-800 transition-colors" />
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-success-500 rounded-full border-2 border-white"></div>
                </motion.button>
                <div className="text-right">
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-slate-900">{user.username}</span>
                    {isAdmin && (
                      <span className="px-2 py-1 bg-error-500 text-white text-xs font-medium rounded-full">
                        АДМИН
                      </span>
                    )}
                  </div>
                  {user.phoneNumber && (
                    <p className="text-xs text-slate-600">{user.phoneNumber}</p>
                  )}
                </div>
              </div>
              
              {isAdmin && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowAdmin(true)}
                  className="p-2 text-error-500 hover:text-error-700 hover:bg-error-50 rounded-xl transition-all duration-200"
                  title="Админ-панель"
                >
                  <Shield className="w-5 h-5" />
                </motion.button>
              )}
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLogout}
                className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all duration-200"
                title="Выйти"
              >
                <LogOut className="w-5 h-5" />
              </motion.button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-8"
        >
          {/* Welcome Section */}
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="relative bg-white/70 backdrop-blur-xl rounded-3xl p-8 shadow-large border border-white/20"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-accent-500/5 rounded-3xl"></div>
              <div className="relative">
                <h2 className="text-4xl font-bold text-slate-900 mb-4 font-display">
                  Добро пожаловать, {user.username}!
                </h2>
                <p className="text-slate-600 text-lg mb-6 max-w-2xl mx-auto">
                  Выберите контакт для начала видеозвонка или аудиозвонка
                </p>
                {user.phoneNumber && (
                  <div className="inline-flex items-center space-x-2 bg-primary-50 text-primary-700 px-4 py-2 rounded-2xl border border-primary-200">
                    <Phone className="w-4 h-4" />
                    <span className="font-medium">Ваш номер: {user.phoneNumber}</span>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Contacts */}
          <div className="max-w-4xl mx-auto">
            <ContactsList
              currentUser={user}
              onStartCall={handleStartCall}
            />
          </div>
        </motion.div>
      </main>
    </div>
  );
}
