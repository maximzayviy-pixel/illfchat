'use client';

import { useEffect, useState } from 'react';
import { Room, RoomEvent, RemoteParticipant, LocalParticipant, Track } from 'livekit-client';
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  Phone, 
  Users, 
  Settings,
  Maximize2,
  Minimize2,
  User
} from 'lucide-react';
import { motion } from 'framer-motion';

interface VideoCallProps {
  roomName: string;
  userName: string;
  token: string;
  wsUrl: string;
  onEndCall: () => void;
}

export default function VideoCall({ roomName, userName, token, wsUrl, onEndCall }: VideoCallProps) {
  const [room, setRoom] = useState<Room | null>(null);
  const [participants, setParticipants] = useState<(RemoteParticipant | LocalParticipant)[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const connectToRoom = async () => {
      try {
        const newRoom = new Room();
        
        newRoom.on(RoomEvent.Connected, () => {
          console.log('Connected to room');
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
        setError('Не удалось подключиться к комнате');
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

  const toggleVideo = async () => {
    if (room?.localParticipant) {
      await room.localParticipant.setCameraEnabled(isVideoEnabled);
      setIsVideoEnabled(!isVideoEnabled);
    }
  };

  const leaveRoom = () => {
    if (room) {
      room.disconnect();
    }
    onEndCall();
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
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
          <h2 className="text-2xl font-bold mb-2">Подключение к звонку...</h2>
          <p className="text-gray-300">Комната: {roomName}</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gray-900 text-white ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      {/* Header */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-gray-800/80 backdrop-blur-md px-4 py-3 flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
          <h1 className="text-lg font-semibold">{roomName}</h1>
          <span className="text-sm text-gray-400">
            {participants.length} участник{participants.length !== 1 ? 'ов' : ''}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleFullscreen}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
          </button>
        </div>
      </motion.div>

      {/* Video Grid */}
      <div className="flex-1 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full max-w-6xl mx-auto">
          {participants.map((participant, index) => (
            <ParticipantVideo
              key={participant.identity}
              participant={participant}
              isLocal={participant instanceof LocalParticipant}
            />
          ))}
        </div>
      </div>

      {/* Controls */}
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-gray-800/80 backdrop-blur-md px-4 py-4"
      >
        <div className="flex items-center justify-center gap-4 max-w-md mx-auto">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleMute}
            className={`p-4 rounded-full transition-all duration-300 ${
              isMuted ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-600 hover:bg-gray-700'
            }`}
          >
            {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleVideo}
            className={`p-4 rounded-full transition-all duration-300 ${
              !isVideoEnabled ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-600 hover:bg-gray-700'
            }`}
          >
            {isVideoEnabled ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={leaveRoom}
            className="p-4 bg-red-600 hover:bg-red-700 rounded-full transition-all duration-300"
          >
            <Phone className="w-6 h-6" />
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}

interface ParticipantVideoProps {
  participant: RemoteParticipant | LocalParticipant;
  isLocal: boolean;
}

function ParticipantVideo({ participant, isLocal }: ParticipantVideoProps) {
  const [videoTrack, setVideoTrack] = useState<MediaStreamTrack | null>(null);
  const [audioTrack, setAudioTrack] = useState<MediaStreamTrack | null>(null);

  useEffect(() => {
    const handleTrackSubscribed = (track: Track) => {
      if (track.kind === 'video') {
        setVideoTrack(track.mediaStreamTrack);
      } else if (track.kind === 'audio') {
        setAudioTrack(track.mediaStreamTrack);
      }
    };

    const handleTrackUnsubscribed = (track: Track) => {
      if (track.kind === 'video') {
        setVideoTrack(null);
      } else if (track.kind === 'audio') {
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
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative bg-gray-700 rounded-2xl overflow-hidden aspect-video"
    >
      {videoTrack ? (
        <video
          ref={(video) => {
            if (video && videoTrack) {
              video.srcObject = new MediaStream([videoTrack]);
              video.play();
            }
          }}
          className="w-full h-full object-cover"
          muted={isLocal}
          playsInline
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-600 to-gray-700">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <User className="w-8 h-8 text-white" />
            </div>
            <p className="text-sm text-gray-300 font-medium">{participant.identity}</p>
          </div>
        </div>
      )}
      
      {audioTrack && (
        <audio
          id={`audio-${participant.identity}`}
          autoPlay
          playsInline
          muted={isLocal}
        />
      )}

      <div className="absolute bottom-3 left-3 bg-black/50 backdrop-blur-sm px-3 py-1 rounded-full text-sm">
        {participant.identity} {isLocal && '(Вы)'}
      </div>
    </motion.div>
  );
}
