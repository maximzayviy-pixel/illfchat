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
  Minimize2
} from 'lucide-react';

interface VideoCallProps {
  roomName: string;
  userName: string;
  token: string;
  wsUrl: string;
}

export default function VideoCall({ roomName, userName, token, wsUrl }: VideoCallProps) {
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
    window.location.href = '/';
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
        <div className="text-center text-white">
          <h2 className="text-2xl font-bold mb-4">Ошибка подключения</h2>
          <p className="mb-4">{error}</p>
          <button onClick={() => window.location.href = '/'} className="btn-primary">
            Вернуться на главную
          </button>
        </div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center text-white">
          <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Подключение к комнате...</h2>
          <p className="text-gray-300">Комната: {roomName}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gray-900 text-white ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      {/* Header */}
      <div className="bg-gray-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-green-500 rounded-full" />
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
      </div>

      {/* Video Grid */}
      <div className="flex-1 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 h-full">
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
      <div className="bg-gray-800 px-4 py-4">
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={toggleMute}
            className={`p-3 rounded-full transition-colors ${
              isMuted ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-600 hover:bg-gray-700'
            }`}
          >
            {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
          </button>

          <button
            onClick={toggleVideo}
            className={`p-3 rounded-full transition-colors ${
              !isVideoEnabled ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-600 hover:bg-gray-700'
            }`}
          >
            {isVideoEnabled ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
          </button>

          <button
            onClick={leaveRoom}
            className="p-3 bg-red-600 hover:bg-red-700 rounded-full transition-colors"
          >
            <Phone className="w-6 h-6" />
          </button>
        </div>
      </div>
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

    // Check existing tracks
    participant.videoTracks.forEach((track) => {
      if (track.track) {
        setVideoTrack(track.track);
      }
    });

    participant.audioTracks.forEach((track) => {
      if (track.track) {
        setAudioTrack(track.track);
      }
    });

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
    <div className="relative bg-gray-700 rounded-lg overflow-hidden aspect-video">
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
        <div className="w-full h-full flex items-center justify-center bg-gray-600">
          <div className="text-center">
            <Users className="w-12 h-12 mx-auto mb-2 text-gray-400" />
            <p className="text-sm text-gray-400">{participant.identity}</p>
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

      <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 px-2 py-1 rounded text-sm">
        {participant.identity} {isLocal && '(Вы)'}
      </div>
    </div>
  );
}
