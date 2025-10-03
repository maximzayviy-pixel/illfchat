'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import VideoCall from '@/components/VideoCall';
import AudioCall from '@/components/AudioCall';
import toast from 'react-hot-toast';

interface TokenData {
  token: string;
  wsUrl: string;
}

export default function RoomPage() {
  const params = useParams();
  const router = useRouter();
  const roomName = params.roomName as string;
  const [tokenData, setTokenData] = useState<TokenData | null>(null);
  const [loading, setLoading] = useState(true);
  const [callType, setCallType] = useState<'video' | 'audio'>('video');

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/');
          return;
        }

        const response = await fetch('/api/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            room: roomName,
            identity: 'User',
          }),
        });

        if (response.ok) {
          const data = await response.json();
          setTokenData(data);
          
          // Определяем тип звонка по названию комнаты
          if (roomName.includes('audio')) {
            setCallType('audio');
          } else {
            setCallType('video');
          }
        } else {
          toast.error('Ошибка получения токена');
          router.push('/');
        }
      } catch (error) {
        toast.error('Ошибка соединения');
        router.push('/');
      } finally {
        setLoading(false);
      }
    };

    fetchToken();
  }, [roomName, router]);

  const handleEndCall = () => {
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center text-white">
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Подключение к комнате...</h2>
          <p className="text-gray-300">Комната: {roomName}</p>
        </div>
      </div>
    );
  }

  if (!tokenData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center text-white">
          <h2 className="text-2xl font-bold mb-4">Ошибка подключения</h2>
          <p className="mb-4">Не удалось получить доступ к комнате</p>
          <button 
            onClick={() => router.push('/')} 
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            Вернуться на главную
          </button>
        </div>
      </div>
    );
  }

  if (callType === 'video') {
    return (
      <VideoCall
        roomName={roomName}
        userName="User"
        token={tokenData.token}
        wsUrl={tokenData.wsUrl}
        onEndCall={handleEndCall}
      />
    );
  } else {
    return (
      <AudioCall
        roomName={roomName}
        userName="User"
        token={tokenData.token}
        wsUrl={tokenData.wsUrl}
        onEndCall={handleEndCall}
      />
    );
  }
}
