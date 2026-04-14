import React, { useEffect, useRef, useState } from 'react';
import AgoraRTC from 'agora-rtc-sdk-ng';

export default function VideoRoom({ channelName, token, appId, onEndCall }) {
  const [localAudioTrack, setLocalAudioTrack] = useState(null);
  const [localVideoTrack, setLocalVideoTrack] = useState(null);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const [remoteUsers, setRemoteUsers] = useState([]);
  const localPlayerRef = useRef(null);
  const clientRef = useRef(null);

  useEffect(() => {
    let isMounted = true;
    // Set Log Level to reduce noise
    AgoraRTC.setLogLevel(3);
    const client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
    clientRef.current = client;

    const initAgora = async () => {
      try {
        client.on("user-published", async (user, mediaType) => {
          await client.subscribe(user, mediaType);
          
          if (mediaType === 'audio') {
            user.audioTrack.play();
          }

          if (isMounted) {
            setRemoteUsers(prev => {
              const users = prev.filter(u => u.uid !== user.uid);
              return [...users, user];
            });
          }
        });

        client.on("user-unpublished", (user) => {
          if (isMounted) {
            setRemoteUsers(prev => prev.filter(u => u.uid !== user.uid));
          }
        });

        client.on("user-left", (user) => {
          if (isMounted) {
            setRemoteUsers(prev => prev.filter(u => u.uid !== user.uid));
          }
        });

        const uid = await client.join(appId, channelName, token, null);
        const [audioTrack, videoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks();
        
        if (isMounted) {
          setLocalAudioTrack(audioTrack);
          setLocalVideoTrack(videoTrack);
          await client.publish([audioTrack, videoTrack]);
        }
      } catch (err) {
        console.error("Agora Error", err);
      }
    };

    initAgora();

    return () => {
      isMounted = false;
      client.removeAllListeners();
      if (localAudioTrack) {
        localAudioTrack.stop();
        localAudioTrack.close();
      }
      if (localVideoTrack) {
        localVideoTrack.stop();
        localVideoTrack.close();
      }
      if (clientRef.current) {
        clientRef.current.leave();
      }
    };
  }, [channelName, token, appId]);

  useEffect(() => {
    if (localVideoTrack && localPlayerRef.current) {
      localVideoTrack.play(localPlayerRef.current);
    }
  }, [localVideoTrack]);

  const toggleAudio = async () => {
    if (localAudioTrack) {
      await localAudioTrack.setMuted(!isAudioMuted);
      setIsAudioMuted(!isAudioMuted);
    }
  };

  const toggleVideo = async () => {
    if (localVideoTrack) {
      await localVideoTrack.setMuted(!isVideoMuted);
      setIsVideoMuted(!isVideoMuted);
    }
  };

  // Robust fallback: if they don't hear audio, they can click anywhere to forcefully resume AudioContext
  const forceResumeAudio = () => {
    remoteUsers.forEach(u => {
      if (u.audioTrack && !u.audioTrack.isPlaying) {
        u.audioTrack.play();
      }
    });
  };

  return (
    <div className="absolute inset-0 z-50 bg-[#1F2432] flex flex-col rounded-[32px] overflow-hidden" onClick={forceResumeAudio}>
      <div className="flex-1 relative flex gap-4 p-4">
        {/* Render Remote Fullscreen */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/90 pointer-events-none">
          {remoteUsers.map(user => (
            <div key={user.uid} className="w-full h-full">
              <RemoteVideoTrack user={user} />
            </div>
          ))}
          {remoteUsers.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-3">
              <div className="w-16 h-16 rounded-full border-4 border-[#1EBDB8] border-t-transparent animate-spin"></div>
              <span className="text-white/80 font-medium text-lg tracking-wide">Waiting for other party to join...</span>
            </div>
          )}
        </div>
         
        {/* Render local */}
        <div className="relative w-1/4 h-1/4 min-w-[120px] min-h-[160px] max-w-[200px] max-h-[260px] bg-gray-800 rounded-2xl overflow-hidden border-2 border-white/20 shadow-2xl z-10 self-end mt-auto pointer-events-auto">
          <div ref={localPlayerRef} className={`w-full h-full object-cover ${isVideoMuted ? 'hidden' : ''}`}></div>
          {isVideoMuted && <div className="absolute inset-0 flex items-center justify-center bg-gray-900 text-white"><svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 4h.01" /></svg></div>}
          <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full flex gap-2 items-center">
             {isAudioMuted && <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>}
            <span className="text-white text-xs font-bold tracking-wide">You {isAudioMuted ? '(Muted)' : ''}</span>
          </div>
        </div>
      </div>
      <div className="px-6 py-6 border-t border-white/10 bg-[#1a1f2c] flex justify-center items-center gap-6 relative z-20 pointer-events-auto">
        <button 
          onClick={toggleAudio}
          className={`w-14 h-14 rounded-full flex justify-center items-center transition-all shadow-lg hover:scale-105 active:scale-95 ${isAudioMuted ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-700 hover:bg-gray-600'}`}
        >
          {isAudioMuted ? (
            <svg width="24" height="24" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 14.14V11a7 7 0 00-14 0v3.14m14 0a1 1 0 01-1 1H6a1 1 0 01-1-1v-3.14m14 0v4.86a2 2 0 01-2 2H7a2 2 0 01-2-2v-4.86" /><line x1="3" y1="3" x2="21" y2="21" /></svg>
          ) : (
            <svg width="24" height="24" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 2a3 3 0 00-3 3v7a3 3 0 006 0V5a3 3 0 00-3-3z" /><path d="M19 10v2a7 7 0 01-14 0v-2M12 19v4M8 23h8" /></svg>
          )}
        </button>

        <button 
          onClick={onEndCall} 
          className="w-16 h-16 bg-red-600 rounded-[24px] flex justify-center items-center hover:bg-red-700 transition-all shadow-[0px_10px_20px_rgba(239,68,68,0.4)] hover:scale-105 active:scale-95 group"
        >
          <svg width="28" height="28" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" className="rotate-[135deg] group-hover:rotate-180 transition-transform duration-300">
            <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"></path>
          </svg>
        </button>

        <button 
          onClick={toggleVideo}
          className={`w-14 h-14 rounded-full flex justify-center items-center transition-all shadow-lg hover:scale-105 active:scale-95 ${isVideoMuted ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-700 hover:bg-gray-600'}`}
        >
          {isVideoMuted ? (
            <svg width="24" height="24" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 10l5-4v12l-5-4v-4z"/><rect x="4" y="6" width="11" height="12" rx="2" /><line x1="3" y1="3" x2="21" y2="21" /></svg>
          ) : (
            <svg width="24" height="24" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 10l5-4v12l-5-4v-4z"/><rect x="4" y="6" width="11" height="12" rx="2" /></svg>
          )}
        </button>
      </div>
    </div>
  );
}

const RemoteVideoTrack = ({ user }) => {
  const ref = useRef(null);
  
  useEffect(() => {
    if (user && user.videoTrack && ref.current) {
      user.videoTrack.play(ref.current);
    }
    return () => {
      if (user && user.videoTrack) {
        user.videoTrack.stop();
      }
    };
  }, [user]);

  return <div ref={ref} className="w-full h-full pointer-events-auto"></div>;
};
