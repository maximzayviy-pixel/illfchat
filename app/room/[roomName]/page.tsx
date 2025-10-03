'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import VideoCall from '@/components/VideoCall';

interface TokenResponse {
  token: string;
  wsUrl: string;
}

export default function RoomPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const [tokenData, setTokenData] = useState<TokenResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const roomName = params.roomName as string;
  const userName = searchParams.get('name') || 'Anonymous';

  useEffect(() => {
    const getToken = async () => {
      try {
        const response = await fetch('/api/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            room: roomName,
            identity: userName,
            name: userName,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to get token');
        }

        const data = await response.json();
        setTokenData(data);
      } catch (err) {
        console.error('Error getting token:', err);
        setError('Не удалось получить токен для подключения');
      } finally {
        setLoading(false);
      }
    };

    if (roomName) {
      getToken();
    }
  }, [roomName, userName]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center text-white">
          <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Подготовка к звонку...</h2>
          <p className="text-gray-300">Комната: {roomName}</p>
        </div>
      </div>
    );
  }

  if (error || !tokenData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center text-white">
          <h2 className="text-2xl font-bold mb-4">Ошибка</h2>
          <p className="mb-4">{error || 'Не удалось загрузить данные комнаты'}</p>
          <button 
            onClick={() => window.location.href = '/'} 
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Вернуться на главную
          </button>
        </div>
      </div>
    );
  }

  return (
    <VideoCall
      roomName={roomName}
      userName={userName}
      token={tokenData.token}
      wsUrl={tokenData.wsUrl}
    />
  );
}
