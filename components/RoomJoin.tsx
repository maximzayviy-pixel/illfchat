'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Video, Users, Settings } from 'lucide-react';

export default function RoomJoin() {
  const [roomName, setRoomName] = useState('');
  const [userName, setUserName] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const router = useRouter();

  const handleJoinRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!roomName.trim() || !userName.trim()) {
      alert('Пожалуйста, заполните все поля');
      return;
    }

    setIsJoining(true);
    
    try {
      // Переходим в комнату с параметрами
      router.push(`/room/${encodeURIComponent(roomName)}?name=${encodeURIComponent(userName)}`);
    } catch (error) {
      console.error('Ошибка при присоединении к комнате:', error);
      alert('Ошибка при присоединении к комнате');
    } finally {
      setIsJoining(false);
    }
  };

  const handleCreateRoom = () => {
    const randomRoom = Math.random().toString(36).substring(2, 8);
    setRoomName(randomRoom);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center mb-4">
              <Video className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              LiveKit Calls
            </h1>
            <p className="text-gray-600">
              Присоединяйтесь к видеозвонкам или создайте новую комнату
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleJoinRoom} className="space-y-6">
            <div>
              <label htmlFor="roomName" className="block text-sm font-medium text-gray-700 mb-2">
                Название комнаты
              </label>
              <div className="flex gap-2">
                <input
                  id="roomName"
                  type="text"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  placeholder="Введите название комнаты"
                  className="input-field flex-1"
                  required
                />
                <button
                  type="button"
                  onClick={handleCreateRoom}
                  className="btn-secondary whitespace-nowrap"
                >
                  Создать
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="userName" className="block text-sm font-medium text-gray-700 mb-2">
                Ваше имя
              </label>
              <input
                id="userName"
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Введите ваше имя"
                className="input-field"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isJoining}
              className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isJoining ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Присоединение...
                </>
              ) : (
                <>
                  <Users className="w-4 h-4" />
                  Присоединиться к комнате
                </>
              )}
            </button>
          </form>

          {/* Features */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="flex flex-col items-center">
                <Video className="w-6 h-6 text-primary-600 mb-2" />
                <span className="text-xs text-gray-600">Видео</span>
              </div>
              <div className="flex flex-col items-center">
                <Users className="w-6 h-6 text-primary-600 mb-2" />
                <span className="text-xs text-gray-600">До 50 участников</span>
              </div>
              <div className="flex flex-col items-center">
                <Settings className="w-6 h-6 text-primary-600 mb-2" />
                <span className="text-xs text-gray-600">Настройки</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
