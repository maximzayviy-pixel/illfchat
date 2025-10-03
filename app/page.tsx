'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LogOut, User, Phone, Video, Settings, Shield } from 'lucide-react';
import AuthForm from '@/components/AuthForm';
import ContactsList from '@/components/ContactsList';
import VideoCall from '@/components/VideoCall';
import AudioCall from '@/components/AudioCall';
import AdminPanel from '@/components/AdminPanel';
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
    if (!token) return;

    try {
      const roomName = `call-${type}-${Math.random().toString(36).substring(2, 15)}`;
      
      const response = await fetch('/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          room: roomName,
          identity: user?.username || 'User',
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
      } else {
        toast.error('Ошибка создания звонка');
      }
    } catch (error) {
      toast.error('Ошибка соединения');
    }
  };

  const handleEndCall = () => {
    setIsInCall(false);
    setCallType(null);
    setCallData(null);
  };

  const isAdmin = user?.username === 'admin' || user?.email === 'admin@klubok.com';

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

  if (!user || !token) {
    return <AuthForm onSuccess={handleAuthSuccess} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-military-100 via-camo-tan to-military-200 relative overflow-hidden">
      {/* Military Pattern Background */}
      <div className="absolute inset-0 bg-military-pattern opacity-10"></div>
      <div className="absolute inset-0 bg-camo-pattern opacity-5"></div>
      
      {/* Header */}
      <motion.header
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative bg-military-50/90 backdrop-blur-md border-b-2 border-military-300 shadow-lg"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="relative w-12 h-12 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center shadow-lg">
                <Phone className="w-7 h-7 text-white" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white animate-pulse-military"></div>
              </div>
              <div>
                <h1 className="text-2xl font-bold font-military text-military-900">КЛУБОК</h1>
                <p className="text-xs text-military-600 font-military">COMMUNICATION SYSTEM</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="relative w-10 h-10 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center shadow-lg">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div className="text-right">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-military-900 font-military">{user.username.toUpperCase()}</span>
                    {isAdmin && (
                      <span className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-full font-military">
                        АДМИН
                      </span>
                    )}
                  </div>
                  {user.phoneNumber && (
                    <p className="text-xs text-military-600 font-military">{user.phoneNumber}</p>
                  )}
                </div>
              </div>
              
              {isAdmin && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowAdmin(true)}
                  className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                  title="Админ-панель"
                >
                  <Shield className="w-5 h-5" />
                </motion.button>
              )}
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLogout}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                title="Выйти"
              >
                <LogOut className="w-5 h-5" />
              </motion.button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-8"
        >
          {/* Welcome Section */}
          <div className="text-center relative">
            <div className="absolute inset-0 bg-military-pattern opacity-5 rounded-3xl"></div>
            <div className="relative bg-military-50/80 backdrop-blur-md border-2 border-military-300 rounded-3xl p-8 shadow-lg">
              <h2 className="text-4xl font-bold font-military text-military-900 mb-3">
                ДОБРО ПОЖАЛОВАТЬ, {user.username.toUpperCase()}!
              </h2>
              <p className="text-military-700 font-military text-lg mb-4">
                Выберите контакт для начала видеозвонка
              </p>
              {user.phoneNumber && (
                <div className="inline-flex items-center space-x-2 bg-primary-100 text-primary-700 px-4 py-2 rounded-xl font-military">
                  <Phone className="w-4 h-4" />
                  <span>Ваш номер: {user.phoneNumber}</span>
                </div>
              )}
            </div>
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
