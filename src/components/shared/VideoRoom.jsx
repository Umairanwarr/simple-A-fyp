import React, { useEffect, useRef, useState } from 'react';
import AgoraRTC from 'agora-rtc-sdk-ng';

export default function VideoRoom({ channelName, token, appId, onEndCall }) {
  const [localAudioTrack, setLocalAudioTrack] = useState(null);
  const [localVideoTrack, setLocalVideoTrack] = useState(null);
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

  return (
    <div className="absolute inset-0 z-50 bg-[#1F2432] flex flex-col rounded-[32px] overflow-hidden">
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
          <div ref={localPlayerRef} className="w-full h-full object-cover"></div>
          <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full">
            <span className="text-white text-xs font-bold tracking-wide">You</span>
          </div>
        </div>
      </div>
      <div className="px-6 py-6 border-t border-white/10 bg-[#1a1f2c] flex justify-center items-center relative z-20">
        <button 
          onClick={onEndCall} 
          className="w-14 h-14 bg-red-500 rounded-[20px] flex justify-center items-center hover:bg-red-600 transition-all shadow-[0px_10px_20px_rgba(239,68,68,0.3)] hover:scale-105 active:scale-95 group"
        >
          <svg width="26" height="26" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" className="rotate-[135deg] group-hover:rotate-180 transition-transform duration-300">
            <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"></path>
          </svg>
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
