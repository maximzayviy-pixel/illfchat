'use client';

import { useEffect, useState } from 'react';
import { Room, RoomEvent, RemoteParticipant, LocalParticipant, Track } from 'livekit-client';
import { 
  Mic, 
  MicOff, 
  Phone, 
  Volume2,
  VolumeX,
  User,
  Clock
} from 'lucide-react';
import { motion } from 'framer-motion';

interface AudioCallProps {
  roomName: string;
  userName: string;
  token: string;
  wsUrl: string;
  onEndCall: () => void;
}

export default function AudioCall({ roomName, userName, token, wsUrl, onEndCall }: AudioCallProps) {
  const [room, setRoom] = useState<Room | null>(null);
  const [participants, setParticipants] = useState<(RemoteParticipant | LocalParticipant)[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [callDuration, setCallDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Таймер звонка
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isConnected) {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isConnected]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    const connectToRoom = async () => {
      try {
        const newRoom = new Room();
        
        newRoom.on(RoomEvent.Connected, () => {
          console.log('Connected to audio room');
          setIsConnected(true);
          const allParticipants = [
            ...Array.from(newRoom.remoteParticipants.values()),
            newRoom.localParticipant
          ];
          setParticipants(allParticipants);
        });

        newRoom.on(RoomEvent.ParticipantConnected, (participant) => {
          console.log('Participant connected:', participant.identity);
          const allParticipants = [
            ...Array.from(newRoom.remoteParticipants.values()),
            newRoom.localParticipant
          ];
          setParticipants(allParticipants);
        });

        newRoom.on(RoomEvent.ParticipantDisconnected, (participant) => {
          console.log('Participant disconnected:', participant.identity);
          const allParticipants = [
            ...Array.from(newRoom.remoteParticipants.values()),
            newRoom.localParticipant
          ];
          setParticipants(allParticipants);
        });

        newRoom.on(RoomEvent.Disconnected, () => {
          console.log('Disconnected from room');
          setIsConnected(false);
        });

        await newRoom.connect(wsUrl, token);
        setRoom(newRoom);
      } catch (err) {
        console.error('Failed to connect to room:', err);
        setError('Не удалось подключиться к аудиозвонку');
      }
    };

    connectToRoom();

    return () => {
      if (room) {
        room.disconnect();
      }
    };
  }, [token, wsUrl]);

  const toggleMute = async () => {
    if (room?.localParticipant) {
      await room.localParticipant.setMicrophoneEnabled(isMuted);
      setIsMuted(!isMuted);
    }
  };

  const toggleSpeaker = () => {
    setIsSpeakerOn(!isSpeakerOn);
    // В реальном приложении здесь была бы логика управления громкостью
  };

  const leaveRoom = () => {
    if (room) {
      room.disconnect();
    }
    onEndCall();
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center text-white"
        >
          <h2 className="text-2xl font-bold mb-4">Ошибка подключения</h2>
          <p className="mb-4">{error}</p>
          <button onClick={onEndCall} className="btn-primary">
            Вернуться на главную
          </button>
        </motion.div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center text-white"
        >
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Подключение к аудиозвонку...</h2>
          <p className="text-gray-300">Комната: {roomName}</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white">
      {/* Header */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-black/20 backdrop-blur-md px-4 py-3 flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
          <h1 className="text-lg font-semibold">Аудиозвонок</h1>
          <span className="text-sm text-gray-400">
            {participants.length} участник{participants.length !== 1 ? 'ов' : ''}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-gray-400" />
          <span className="text-sm font-mono">{formatTime(callDuration)}</span>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center space-y-8">
          {/* Avatar */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="relative"
          >
            <div className="w-48 h-48 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center mx-auto shadow-2xl">
              <User className="w-24 h-24 text-white" />
            </div>
            <div className="absolute -bottom-2 -right-2 w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
              <Volume2 className="w-8 h-8 text-white" />
            </div>
          </motion.div>

          {/* User Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-2"
          >
            <h2 className="text-3xl font-bold">{userName}</h2>
            <p className="text-gray-400">Аудиозвонок активен</p>
          </motion.div>

          {/* Participants List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="space-y-2"
          >
            {participants.map((participant, index) => (
              <div key={participant.identity} className="flex items-center justify-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-sm text-gray-300">
                  {participant.identity} {participant instanceof LocalParticipant && '(Вы)'}
                </span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Controls */}
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-black/20 backdrop-blur-md px-4 py-6"
      >
        <div className="flex items-center justify-center gap-6 max-w-md mx-auto">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleSpeaker}
            className={`p-4 rounded-full transition-all duration-300 ${
              isSpeakerOn ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-600 hover:bg-gray-700'
            }`}
            title={isSpeakerOn ? 'Выключить звук' : 'Включить звук'}
          >
            {isSpeakerOn ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleMute}
            className={`p-4 rounded-full transition-all duration-300 ${
              isMuted ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-600 hover:bg-gray-700'
            }`}
            title={isMuted ? 'Включить микрофон' : 'Выключить микрофон'}
          >
            {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={leaveRoom}
            className="p-4 bg-red-600 hover:bg-red-700 rounded-full transition-all duration-300"
            title="Завершить звонок"
          >
            <Phone className="w-6 h-6" />
          </motion.button>
        </div>
      </motion.div>

      {/* Audio Elements */}
      {participants.map((participant) => (
        <AudioElement
          key={participant.identity}
          participant={participant}
          isLocal={participant instanceof LocalParticipant}
        />
      ))}
    </div>
  );
}

interface AudioElementProps {
  participant: RemoteParticipant | LocalParticipant;
  isLocal: boolean;
}

function AudioElement({ participant, isLocal }: AudioElementProps) {
  const [audioTrack, setAudioTrack] = useState<MediaStreamTrack | null>(null);

  useEffect(() => {
    const handleTrackSubscribed = (track: Track) => {
      if (track.kind === 'audio') {
        setAudioTrack(track.mediaStreamTrack);
      }
    };

    const handleTrackUnsubscribed = (track: Track) => {
      if (track.kind === 'audio') {
        setAudioTrack(null);
      }
    };

    participant.on('trackSubscribed', handleTrackSubscribed);
    participant.on('trackUnsubscribed', handleTrackUnsubscribed);

    return () => {
      participant.off('trackSubscribed', handleTrackSubscribed);
      participant.off('trackUnsubscribed', handleTrackUnsubscribed);
    };
  }, [participant]);

  useEffect(() => {
    if (audioTrack) {
      const audioElement = document.getElementById(`audio-${participant.identity}`) as HTMLAudioElement;
      if (audioElement) {
        const stream = new MediaStream([audioTrack]);
        audioElement.srcObject = stream;
      }
    }
  }, [audioTrack, participant.identity]);

  return (
    <audio
      id={`audio-${participant.identity}`}
      autoPlay
      playsInline
      muted={isLocal}
    />
  );
}
