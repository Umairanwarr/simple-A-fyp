import React, { useEffect, useRef, useState, useCallback } from 'react';
import AgoraRTC from 'agora-rtc-sdk-ng';

export default function VideoRoom({ channelName, token, appId, onEndCall }) {
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [remoteUsers, setRemoteUsers] = useState({});
  const [joined, setJoined] = useState(false);

  const localPlayerRef = useRef(null);
  const clientRef = useRef(null);
  const audioTrackRef = useRef(null);
  const videoTrackRef = useRef(null);

  // ─── Init Agora ───
  useEffect(() => {
    AgoraRTC.setLogLevel(3);
    const client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
    clientRef.current = client;

    const handleUserPublished = async (user, mediaType) => {
      await client.subscribe(user, mediaType);

      if (mediaType === 'audio' && user.audioTrack) {
        user.audioTrack.play();
      }

      setRemoteUsers(prev => ({ ...prev, [user.uid]: user }));
    };

    const handleUserUnpublished = (user, mediaType) => {
      // Only update the user reference, don't remove them
      setRemoteUsers(prev => ({ ...prev, [user.uid]: user }));
    };

    const handleUserLeft = (user) => {
      setRemoteUsers(prev => {
        const next = { ...prev };
        delete next[user.uid];
        return next;
      });
    };

    client.on('user-published', handleUserPublished);
    client.on('user-unpublished', handleUserUnpublished);
    client.on('user-left', handleUserLeft);

    const init = async () => {
      try {
        await client.join(appId, channelName, token, null);

        const audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
        const videoTrack = await AgoraRTC.createCameraVideoTrack();

        audioTrackRef.current = audioTrack;
        videoTrackRef.current = videoTrack;

        await client.publish([audioTrack, videoTrack]);

        if (localPlayerRef.current) {
          videoTrack.play(localPlayerRef.current);
        }

        setJoined(true);
      } catch (err) {
        console.error('Agora init error:', err);
      }
    };

    init();

    return () => {
      client.off('user-published', handleUserPublished);
      client.off('user-unpublished', handleUserUnpublished);
      client.off('user-left', handleUserLeft);

      if (audioTrackRef.current) {
        audioTrackRef.current.stop();
        audioTrackRef.current.close();
        audioTrackRef.current = null;
      }
      if (videoTrackRef.current) {
        videoTrackRef.current.stop();
        videoTrackRef.current.close();
        videoTrackRef.current = null;
      }
      client.leave().catch(() => {});
    };
  }, [appId, channelName, token]);

  // ─── Toggle Mic ───
  const toggleAudio = useCallback(async () => {
    const track = audioTrackRef.current;
    if (!track) return;

    if (isAudioMuted) {
      await track.setEnabled(true);
      setIsAudioMuted(false);
    } else {
      await track.setEnabled(false);
      setIsAudioMuted(true);
    }
  }, [isAudioMuted]);

  // ─── Toggle Camera ───
  const toggleVideo = useCallback(async () => {
    const track = videoTrackRef.current;
    if (!track) return;

    if (isVideoOff) {
      await track.setEnabled(true);
      if (localPlayerRef.current) {
        track.play(localPlayerRef.current);
      }
      setIsVideoOff(false);
    } else {
      await track.setEnabled(false);
      setIsVideoOff(true);
    }
  }, [isVideoOff]);

  // ─── Force resume any blocked remote audio when user clicks ───
  const forceResumeAudio = useCallback(() => {
    Object.values(remoteUsers).forEach(u => {
      if (u.audioTrack) {
        try { u.audioTrack.play(); } catch(e) {}
      }
    });
  }, [remoteUsers]);

  const remoteUserList = Object.values(remoteUsers);

  return (
    <div
      style={{
        position: 'absolute', inset: 0, zIndex: 50,
        background: '#1F2432', display: 'flex', flexDirection: 'column',
        borderRadius: '24px', overflow: 'hidden',
      }}
      onClick={forceResumeAudio}
    >
      {/* ─── Video Area ─── */}
      <div style={{ flex: 1, position: 'relative', display: 'flex', gap: '16px', padding: '16px' }}>
        {/* Remote user fullscreen */}
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(0,0,0,0.9)',
        }}>
          {remoteUserList.length > 0 ? (
            remoteUserList.map(user => (
              <div key={user.uid} style={{ width: '100%', height: '100%' }}>
                <RemoteVideoPlayer user={user} />
              </div>
            ))
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '64px', height: '64px', borderRadius: '50%',
                border: '4px solid #1EBDB8', borderTopColor: 'transparent',
                animation: 'spin 1s linear infinite',
              }} />
              <span style={{ color: 'rgba(255,255,255,0.8)', fontWeight: 500, fontSize: '18px' }}>
                Waiting for other party to join...
              </span>
            </div>
          )}
        </div>

        {/* Local user PIP */}
        <div style={{
          position: 'relative', width: '25%', height: '25%',
          minWidth: '120px', minHeight: '160px', maxWidth: '200px', maxHeight: '260px',
          background: '#1f2937', borderRadius: '16px', overflow: 'hidden',
          border: '2px solid rgba(255,255,255,0.2)',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
          zIndex: 10, alignSelf: 'flex-end', marginTop: 'auto',
        }}>
          <div
            ref={localPlayerRef}
            style={{
              width: '100%', height: '100%',
              display: isVideoOff ? 'none' : 'block',
            }}
          />
          {isVideoOff && (
            <div style={{
              position: 'absolute', inset: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: '#111827', color: '#fff', fontSize: '32px',
            }}>
              📷
            </div>
          )}
          <div style={{
            position: 'absolute', bottom: '8px', left: '8px',
            background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)',
            padding: '4px 10px', borderRadius: '999px',
            display: 'flex', alignItems: 'center', gap: '6px',
          }}>
            {isAudioMuted && (
              <div style={{
                width: '8px', height: '8px', borderRadius: '50%',
                background: '#ef4444', animation: 'pulse 2s infinite',
              }} />
            )}
            <span style={{ color: '#fff', fontSize: '11px', fontWeight: 700 }}>
              You{isAudioMuted ? ' (Muted)' : ''}
            </span>
          </div>
        </div>
      </div>

      {/* ─── Controls Bar ─── */}
      <div style={{
        padding: '20px 24px', borderTop: '1px solid rgba(255,255,255,0.1)',
        background: '#1a1f2c', display: 'flex', justifyContent: 'center',
        alignItems: 'center', gap: '20px', position: 'relative', zIndex: 20,
      }}>
        {/* Mic Toggle */}
        <button
          onClick={(e) => { e.stopPropagation(); toggleAudio(); }}
          style={{
            width: '56px', height: '56px', borderRadius: '50%', border: 'none',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: isAudioMuted ? '#ef4444' : '#374151',
            transition: 'all 0.2s', boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
          }}
          title={isAudioMuted ? 'Unmute' : 'Mute'}
        >
          {isAudioMuted ? (
            <svg width="24" height="24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <line x1="1" y1="1" x2="23" y2="23" />
              <path d="M9 9v3a3 3 0 005.12 2.12M15 9.34V4a3 3 0 00-5.94-.6" />
              <path d="M17 16.95A7 7 0 015 12v-2m14 0v2c0 .76-.12 1.49-.34 2.18" />
              <line x1="12" y1="19" x2="12" y2="23" />
              <line x1="8" y1="23" x2="16" y2="23" />
            </svg>
          ) : (
            <svg width="24" height="24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" />
              <path d="M19 10v2a7 7 0 01-14 0v-2" />
              <line x1="12" y1="19" x2="12" y2="23" />
              <line x1="8" y1="23" x2="16" y2="23" />
            </svg>
          )}
        </button>

        {/* End Call */}
        <button
          onClick={(e) => { e.stopPropagation(); onEndCall(); }}
          style={{
            width: '64px', height: '64px', borderRadius: '20px', border: 'none',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: '#dc2626',
            transition: 'all 0.2s', boxShadow: '0 10px 20px rgba(239,68,68,0.4)',
          }}
          title="End Call"
        >
          <svg width="28" height="28" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" style={{ transform: 'rotate(135deg)' }}>
            <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
          </svg>
        </button>

        {/* Camera Toggle */}
        <button
          onClick={(e) => { e.stopPropagation(); toggleVideo(); }}
          style={{
            width: '56px', height: '56px', borderRadius: '50%', border: 'none',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: isVideoOff ? '#ef4444' : '#374151',
            transition: 'all 0.2s', boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
          }}
          title={isVideoOff ? 'Turn On Camera' : 'Turn Off Camera'}
        >
          {isVideoOff ? (
            <svg width="24" height="24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <path d="M16 16v1a2 2 0 01-2 2H3a2 2 0 01-2-2V7a2 2 0 012-2h2m5.66 0H14a2 2 0 012 2v3.34" />
              <line x1="23" y1="7" x2="17" y2="11" />
              <line x1="23" y1="17" x2="17" y2="13" />
              <line x1="1" y1="1" x2="23" y2="23" />
            </svg>
          ) : (
            <svg width="24" height="24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <polygon points="23 7 16 12 23 17 23 7" />
              <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
            </svg>
          )}
        </button>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
      `}</style>
    </div>
  );
}

/* ─── Remote Video Player ─── */
const RemoteVideoPlayer = ({ user }) => {
  const ref = useRef(null);

  useEffect(() => {
    if (user && user.videoTrack && ref.current) {
      user.videoTrack.play(ref.current);
    }
  }, [user, user?.videoTrack]);

  useEffect(() => {
    if (user && user.audioTrack) {
      user.audioTrack.play();
    }
  }, [user, user?.audioTrack]);

  return <div ref={ref} style={{ width: '100%', height: '100%' }} />;
};
