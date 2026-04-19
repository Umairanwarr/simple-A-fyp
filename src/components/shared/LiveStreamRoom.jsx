import React, { useEffect, useRef, useState, useCallback } from 'react';
import AgoraRTC from 'agora-rtc-sdk-ng';
import { connectSocket, getSocket } from '../../services/socket';

export default function LiveStreamRoom({ streamId, channelName, token, appId, isHost, isAdmin, streamTitle, hostName, onLeave, onEndStream }) {
  const [remoteUsers, setRemoteUsers] = useState({});
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [viewerCount, setViewerCount] = useState(0);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [isLive, setIsLive] = useState(true);
  const [adminTerminatedReason, setAdminTerminatedReason] = useState(null);
  const [showAdminEndModal, setShowAdminEndModal] = useState(false);
  const [adminEndReason, setAdminEndReason] = useState('');

  // Co-Host Management
  const [streamRole, setStreamRole] = useState(isHost ? 'host' : 'viewer');
  const [coHostRequests, setCoHostRequests] = useState([]);
  const [activeCoHostId, setActiveCoHostId] = useState(null);
  const [requestStatus, setRequestStatus] = useState(null);

  const profile = JSON.parse(
    localStorage.getItem('doctor') ||
    localStorage.getItem('patient') ||
    localStorage.getItem('admin') ||
    '{}'
  );
  const myId = profile._id || profile.id;
  const myName = profile.fullName || profile.firstName || profile.name || 'Admin';

  const localPlayerRef = useRef(null);
  const clientRef = useRef(null);
  const audioTrackRef = useRef(null);
  const videoTrackRef = useRef(null);
  const chatEndRef = useRef(null);

  useEffect(() => {
    AgoraRTC.setLogLevel(3);
    const client = AgoraRTC.createClient({
      mode: 'live',
      codec: 'vp8'
    });
    clientRef.current = client;

    client.setClientRole(isHost ? 'host' : 'audience');

    const handleUserPublished = async (user, mediaType) => {
      await client.subscribe(user, mediaType);
      if (mediaType === 'audio' && user.audioTrack) {
        user.audioTrack.play();
      }
      setRemoteUsers(prev => ({ ...prev, [user.uid]: user }));
    };

    const handleUserUnpublished = (user, mediaType) => {
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

        if (isHost) {
          const audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
          const videoTrack = await AgoraRTC.createCameraVideoTrack();
          audioTrackRef.current = audioTrack;
          videoTrackRef.current = videoTrack;
          await client.publish([audioTrack, videoTrack]);
          if (localPlayerRef.current) {
            videoTrack.play(localPlayerRef.current);
          }
        }
      } catch (err) {
        console.error('LiveStream Agora error:', err);
      }
    };

    init();

    // Socket: join stream room for viewer count + chat
    let socket = getSocket();
    if (!socket) {
      const tkn = localStorage.getItem('adminToken') || localStorage.getItem('doctorToken') || localStorage.getItem('patientToken');
      if (tkn) socket = connectSocket(tkn);
    }
    
    if (socket) {
      socket.emit('livestream:join', { channelName });

      socket.on('livestream:viewer-count', (data) => {
        if (data.channelName === channelName) setViewerCount(data.viewerCount);
      });

      socket.on('livestream:chat-message', (msg) => {
        setChatMessages(prev => [...prev, msg]);
      });

      socket.on('livestream:ended', (data) => {
        if (data.channelName === channelName) {
          setIsLive(false);
        }
      });

      socket.on('livestream:admin-terminated', (data) => {
        if (data.channelName === channelName) {
          setAdminTerminatedReason(data.reason);
          setIsLive(false);
          // If this is the host, trigger onEndStream so the stream is cleaned up
          if (isHost && onEndStream) {
            onEndStream();
          }
        }
      });

      // Co-Host events
      socket.on('livestream:cohost-request', (data) => {
        if (isHost && data.streamId === streamId) {
          setCoHostRequests(prev => {
            if (prev.some(r => r.viewerId === data.viewerId)) return prev;
            return [...prev, data];
          });
        }
      });

      socket.on('livestream:cohost-accepted', async (data) => {
        if (isHost) {
          setActiveCoHostId(data.viewerId);
        } else if (data.viewerId === myId) {
          setRequestStatus('accepted');
          try {
            const { joinAsGuest } = await import('../../services/authApi');
            const tkn = localStorage.getItem('doctorToken') || localStorage.getItem('patientToken');
            const guestData = await joinAsGuest(tkn, streamId);
            
            await client.leave();
            await client.setClientRole('host');
            await client.join(appId, channelName, guestData.token, null);
            
            const audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
            const videoTrack = await AgoraRTC.createCameraVideoTrack();
            audioTrackRef.current = audioTrack;
            videoTrackRef.current = videoTrack;
            await client.publish([audioTrack, videoTrack]);
            
            setStreamRole('cohost');
            setIsAudioMuted(false);
            setIsVideoOff(false);
            
            if (localPlayerRef.current) videoTrack.play(localPlayerRef.current);
          } catch (err) {
            setRequestStatus(null);
          }
        } else {
          setActiveCoHostId(data.viewerId);
        }
      });

      socket.on('livestream:cohost-rejected', (data) => {
        if (!isHost && data.viewerId === myId) setRequestStatus(null);
      });

      socket.on('livestream:cohost-removed', async (data) => {
        if (isHost && data.viewerId === activeCoHostId) {
          setActiveCoHostId(null);
        } else if (!isHost && data.viewerId === myId) {
          try {
            if (audioTrackRef.current) {
              await client.unpublish([audioTrackRef.current, videoTrackRef.current].filter(Boolean));
              audioTrackRef.current.stop();
              audioTrackRef.current.close();
            }
            if (videoTrackRef.current) {
              videoTrackRef.current.stop();
              videoTrackRef.current.close();
            }
            await client.leave();
            await client.setClientRole('audience');
            await client.join(appId, channelName, token, null);
            
            setStreamRole('viewer');
            setRequestStatus(null);
          } catch (err) {
            console.error(err);
          }
        } else {
          setActiveCoHostId(null);
        }
      });
    }

    return () => {
      if (socket) {
        socket.emit('livestream:leave', { channelName });
        socket.off('livestream:viewer-count');
        socket.off('livestream:chat-message');
        socket.off('livestream:ended');
        socket.off('livestream:admin-terminated');
        socket.off('livestream:cohost-request');
        socket.off('livestream:cohost-accepted');
        socket.off('livestream:cohost-rejected');
        socket.off('livestream:cohost-removed');
      }

      client.off('user-published', handleUserPublished);
      client.off('user-unpublished', handleUserUnpublished);
      client.off('user-left', handleUserLeft);

      if (audioTrackRef.current) {
        audioTrackRef.current.stop();
        audioTrackRef.current.close();
      }
      if (videoTrackRef.current) {
        videoTrackRef.current.stop();
        videoTrackRef.current.close();
      }
      client.leave().catch(() => {});
    };
  }, [appId, channelName, token, isHost]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages.length]);

  const toggleAudio = useCallback(async () => {
    const t = audioTrackRef.current;
    if (!t) return;
    await t.setEnabled(isAudioMuted);
    setIsAudioMuted(!isAudioMuted);
  }, [isAudioMuted]);

  const toggleVideo = useCallback(async () => {
    const t = videoTrackRef.current;
    if (!t || !clientRef.current) return;
    if (isVideoOff) {
      await t.setEnabled(true);
      await clientRef.current.publish([t]);
      if (localPlayerRef.current) t.play(localPlayerRef.current);
    } else {
      await clientRef.current.unpublish([t]);
      await t.setEnabled(false);
    }
    setIsVideoOff(!isVideoOff);
  }, [isVideoOff]);

  const sendChat = () => {
    const msg = chatInput.trim();
    if (!msg) return;

    let socket = getSocket();
    if (!socket) {
      const tkn = localStorage.getItem('adminToken') || localStorage.getItem('doctorToken') || localStorage.getItem('patientToken');
      if (tkn) socket = connectSocket(tkn);
    }

    if (socket) {
      const senderProfile = JSON.parse(
        localStorage.getItem('doctor') ||
        localStorage.getItem('patient') ||
        localStorage.getItem('admin') ||
        '{}'
      );
      const senderName = isAdmin
        ? 'Admin'
        : senderProfile.fullName || senderProfile.firstName || 'User';
      socket.emit('livestream:chat', {
        channelName,
        senderName: senderName,
        message: msg
      });
    }
    setChatInput('');
  };

  const handleEndStream = () => {
    const socket = getSocket();
    if (socket && isHost) {
      socket.emit('livestream:end', { channelName });
      if (onEndStream) onEndStream();
    } else {
      onLeave();
    }
  };

  const handleAdminEndStream = async () => {
    if (!adminEndReason.trim()) return;
    try {
      const { adminTerminateLiveStream } = await import('../../services/authApi');
      const adminTkn = localStorage.getItem('adminToken');
      await adminTerminateLiveStream(adminTkn, streamId, adminEndReason);
      
      const socket = getSocket();
      if (socket) {
        socket.emit('livestream:admin-terminate', { channelName, reason: adminEndReason });
      }
      
      setShowAdminEndModal(false);
      onLeave();
    } catch (err) {
      console.error('Failed to terminate stream as admin:', err);
    }
  };

  const requestCoHost = () => {
    let socket = getSocket();
    if (!socket) {
      const tkn = localStorage.getItem('doctorToken') || localStorage.getItem('patientToken');
      if (tkn) socket = connectSocket(tkn);
    }
    if (socket) {
      setRequestStatus('pending');
      socket.emit('livestream:request-cohost', {
        channelName,
        streamId,
        viewerName: myName
      });
    }
  };

  const acceptCoHost = (req) => {
    if (activeCoHostId) return;
    const socket = getSocket();
    if (socket) {
      socket.emit('livestream:accept-cohost', {
        channelName,
        viewerId: req.viewerId,
        viewerName: req.viewerName
      });
      setCoHostRequests(prev => prev.filter(r => r.viewerId !== req.viewerId));
    }
  };

  const rejectCoHost = (req) => {
    const socket = getSocket();
    if (socket) {
      socket.emit('livestream:reject-cohost', {
        channelName,
        viewerId: req.viewerId
      });
      setCoHostRequests(prev => prev.filter(r => r.viewerId !== req.viewerId));
    }
  };

  const removeCoHost = () => {
    const socket = getSocket();
    if (socket) {
      socket.emit('livestream:remove-cohost', {
        channelName,
        viewerId: activeCoHostId
      });
    }
  };

  const leaveCoHost = () => {
    const socket = getSocket();
    if (socket) {
      socket.emit('livestream:remove-cohost', {
        channelName,
        viewerId: myId
      });
    }
  };

  const isPublishing = streamRole === 'host' || streamRole === 'cohost';
  const remoteUserList = Object.values(remoteUsers);
  const hasRemotes = remoteUserList.length > 0;

  if (!isLive && !isHost) {
    return (
      <div style={S.overlay}>
        <div style={{ textAlign: 'center', color: '#fff', padding: '0 20px' }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>📡</div>
          <h2 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '8px' }}>
            {adminTerminatedReason ? 'Stream Terminated' : 'Stream Has Ended'}
          </h2>
          <p style={{ color: adminTerminatedReason ? '#fca5a5' : 'rgba(255,255,255,0.6)', marginBottom: '24px', fontSize: '16px', maxWidth: '400px', margin: '0 auto 24px auto' }}>
            {adminTerminatedReason 
              ? `This stream was terminated by an Admin. Reason: ${adminTerminatedReason}` 
              : 'The host has ended this live stream.'}
          </p>
          <button onClick={onLeave} style={S.primaryBtn}>Return</button>
        </div>
      </div>
    );
  }

  // Host view when terminated by Admin
  if (!isLive && isHost && adminTerminatedReason) {
    return (
      <div style={S.overlay}>
        <div style={{ textAlign: 'center', color: '#fff', padding: '0 20px', maxWidth: '500px', background: '#1f2937', padding: '40px', borderRadius: '16px', border: '1px solid #ef4444' }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>⚠️</div>
          <h2 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '8px', color: '#ef4444' }}>
            Stream Terminated by Admin
          </h2>
          <p style={{ color: '#fca5a5', marginBottom: '24px', fontSize: '15px' }}>
            Your stream was forcefully ended by an administrator for the following reason:
          </p>
          <div style={{ background: '#374151', padding: '16px', borderRadius: '8px', marginBottom: '24px', fontStyle: 'italic' }}>
            "{adminTerminatedReason}"
          </div>
          <button onClick={onLeave} style={S.primaryBtn}>Return to Dashboard</button>
        </div>
      </div>
    );
  }

  return (
    <div style={S.overlay}>
      <div style={S.container}>
        {/* Host Notifications */}
        {isHost && coHostRequests.length > 0 && (
          <div style={{ position: 'absolute', top: '80px', right: '350px', background: '#1f2937', padding: '16px', borderRadius: '12px', zIndex: 100, border: '1px solid #374151' }}>
            <h4 style={{ color: '#fff', fontSize: '14px', marginBottom: '8px' }}>Co-Host Requests</h4>
            {coHostRequests.map(req => (
              <div key={req.viewerId} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span style={{ color: '#d1d5db', fontSize: '13px' }}>{req.viewerName}</span>
                {activeCoHostId ? (
                  <span style={{ fontSize: '10px', color: '#ef4444' }}>Co-Host slot full</span>
                ) : (
                  <button onClick={() => acceptCoHost(req)} style={{ background: '#10b981', color: '#fff', border: 'none', borderRadius: '6px', padding: '4px 8px', fontSize: '12px', cursor: 'pointer' }}>Accept</button>
                )}
                <button onClick={() => rejectCoHost(req)} style={{ background: '#ef4444', color: '#fff', border: 'none', borderRadius: '6px', padding: '4px 8px', fontSize: '12px', cursor: 'pointer' }}>Reject</button>
              </div>
            ))}
          </div>
        )}
        
        {/* Active Co-Host Management */}
        {isHost && activeCoHostId && (
          <div style={{ position: 'absolute', top: '20px', left: '50%', transform: 'translateX(-50%)', background: 'rgba(0,0,0,0.6)', padding: '8px 16px', borderRadius: '24px', zIndex: 100, display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ color: '#fff', fontSize: '13px' }}>Active Co-Host is present</span>
            <button onClick={removeCoHost} style={{ background: '#ef4444', color: '#fff', border: 'none', borderRadius: '12px', padding: '4px 12px', fontSize: '12px', cursor: 'pointer' }}>Remove</button>
          </div>
        )}

        {/* ─── Video Area ─── */}
        <div style={S.videoArea}>
          {/* Live badge + viewer count */}
          <div style={S.topBar}>
            <div style={S.liveBadge}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444', animation: 'pulse 2s infinite' }} />
              <span>LIVE</span>
            </div>
            <div style={S.viewerBadge}>
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              {Math.max(0, viewerCount - 1)}
            </div>
            <div style={{ flex: 1 }} />
            <div style={{ color: '#fff', fontSize: '14px', fontWeight: 600 }}>{streamTitle}</div>
          </div>

          {/* Remote streams (host stream for viewers, or co-hosts for host) */}
          <div style={S.remoteArea}>
            {/* Publisher (Host or Co-Host) - persistently rendered to prevent video initialization bug */}
            <div style={{ flex: isPublishing ? 1 : 0, minWidth: isPublishing ? '300px' : '0px', height: '100%', position: 'relative', borderRight: (isPublishing && hasRemotes) ? '1px solid #333' : 'none', display: isPublishing ? 'block' : 'none', overflow: 'hidden' }}>
              <div ref={localPlayerRef} style={{ width: '100%', height: '100%', display: isVideoOff ? 'none' : 'block', background: '#222' }} />
              {isVideoOff && <div style={S.camOffBig}>📷 Camera Off</div>}
              <div style={S.localLabel}>
                {isAudioMuted && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444' }} />}
                <span style={{ fontSize: '14px', fontWeight: 700, color: '#fff' }}>You ({streamRole === 'host' ? 'Host' : 'Co-Host'})</span>
              </div>
            </div>

            {/* Remote Streams */}
            {hasRemotes ? (
              remoteUserList.map(user => (
                <div key={user.uid} style={{ flex: 1, minWidth: '300px', height: '100%', position: 'relative', borderRight: '1px solid #333' }}>
                  <RemoteVideoPlayer user={user} />
                </div>
              ))
            ) : !isPublishing ? (
              <div style={S.waitingMsg}>
                <div style={S.spinner} />
                <span>Waiting for host to broadcast video...</span>
              </div>
            ) : null}
          </div>

          {/* Controls bar */}
          <div style={S.controlsBar}>
            {isPublishing && (
              <>
                <button onClick={toggleAudio} style={{ ...S.ctrlBtn, background: isAudioMuted ? '#ef4444' : '#374151' }}>
                  {isAudioMuted ? (
                    <svg width="20" height="20" fill="none" stroke="#fff" strokeWidth="2" viewBox="0 0 24 24"><line x1="1" y1="1" x2="23" y2="23"/><path d="M9 9v3a3 3 0 005.12 2.12M15 9.34V4a3 3 0 00-5.94-.6"/><path d="M17 16.95A7 7 0 015 12v-2m14 0v2c0 .76-.12 1.49-.34 2.18"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
                  ) : (
                    <svg width="20" height="20" fill="none" stroke="#fff" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/><path d="M19 10v2a7 7 0 01-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
                  )}
                </button>
                <button onClick={toggleVideo} style={{ ...S.ctrlBtn, background: isVideoOff ? '#ef4444' : '#374151' }}>
                  {isVideoOff ? (
                    <svg width="20" height="20" fill="none" stroke="#fff" strokeWidth="2" viewBox="0 0 24 24"><path d="M16 16v1a2 2 0 01-2 2H3a2 2 0 01-2-2V7a2 2 0 012-2h2m5.66 0H14a2 2 0 012 2v3.34"/><line x1="23" y1="7" x2="17" y2="11"/><line x1="23" y1="17" x2="17" y2="13"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  ) : (
                    <svg width="20" height="20" fill="none" stroke="#fff" strokeWidth="2" viewBox="0 0 24 24"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
                  )}
                </button>
              </>
            )}
            
            {!isPublishing && (
              <button 
                onClick={requestCoHost} 
                disabled={requestStatus === 'pending'}
                style={{ ...S.endBtn, background: requestStatus === 'pending' ? '#6B7280' : '#8b5cf6' }}
              >
                {requestStatus === 'pending' ? 'Request Sent...' : '✋ Request Co-Host'}
              </button>
            )}

            {streamRole === 'cohost' && (
              <button onClick={leaveCoHost} style={{ ...S.endBtn, background: '#f59e0b', color: '#fff' }}>Stop Co-Hosting</button>
            )}

            {isHost ? (
              <button onClick={handleEndStream} style={S.endBtn}>End Stream</button>
            ) : (
              <button onClick={onLeave} style={S.endBtn}>Leave Stream</button>
            )}

            {isAdmin && (
              <button onClick={() => setShowAdminEndModal(true)} style={{ ...S.endBtn, background: '#ef4444', marginLeft: '12px', border: '2px solid #b91c1c' }}>
                End as Admin
              </button>
            )}
          </div>
        </div>

        {/* ─── Chat Sidebar ─── */}
        <div style={S.chatSidebar}>
          <div style={S.chatHeader}>
            <span style={{ fontWeight: 700, fontSize: '14px' }}>Live Chat</span>
            <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>{chatMessages.length} messages</span>
          </div>
          <div style={S.chatMessages}>
            {chatMessages.length === 0 && (
              <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)', padding: '40px 16px', fontSize: '13px' }}>
                No messages yet. Say hi! 👋
              </div>
            )}
            {chatMessages.map((m, i) => (
              <div key={i} style={S.chatMsg}>
                <span style={{ color: '#1EBDB8', fontWeight: 700, fontSize: '12px' }}>{m.senderName}</span>
                <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: '13px' }}>{m.message}</span>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
          <div style={S.chatInputWrap}>
            <input
              type="text"
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') sendChat(); }}
              placeholder="Send a message..."
              style={S.chatInputField}
            />
            <button onClick={sendChat} style={S.chatSendBtn}>
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
            </button>
          </div>
        </div>
      </div>

      {/* Admin End Modal */}
      {showAdminEndModal && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#1e293b', width: '400px', padding: '24px', borderRadius: '16px', border: '1px solid #334155' }}>
            <h3 style={{ color: '#fff', fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>Terminate Live Stream</h3>
            <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '16px' }}>Provide a reason for terminating this stream. This will be shown to all viewers and the host.</p>
            <input 
               type="text" 
               placeholder="e.g. Violation of community guidelines"
               value={adminEndReason}
               onChange={e => setAdminEndReason(e.target.value)}
               style={{ width: '100%', boxSizing: 'border-box', background: '#0f172a', border: '1px solid #334155', color: '#fff', padding: '12px', borderRadius: '8px', marginBottom: '24px' }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button onClick={() => setShowAdminEndModal(false)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '8px 16px' }}>Cancel</button>
              <button onClick={handleAdminEndStream} style={{ background: '#ef4444', border: 'none', color: '#fff', borderRadius: '8px', padding: '8px 24px', cursor: 'pointer', fontWeight: 600 }}>Terminate</button>
            </div>
          </div>
        </div>
      )}


      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5} }
        @keyframes spin { to{transform:rotate(360deg)} }
      `}</style>
    </div>
  );
}

const RemoteVideoPlayer = ({ user }) => {
  const ref = useRef(null);
  useEffect(() => {
    if (user?.videoTrack && ref.current) user.videoTrack.play(ref.current);
  }, [user, user?.videoTrack]);
  useEffect(() => {
    if (user?.audioTrack) user.audioTrack.play();
  }, [user, user?.audioTrack]);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <div ref={ref} style={{ width: '100%', height: '100%' }} />
      {!user?.videoTrack && (
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', 
          alignItems: 'center', justifyContent: 'center', background: '#111827', 
          color: '#6b7280', fontSize: '24px', fontWeight: 600, zIndex: 5
        }}>
          📷 Camera Off
        </div>
      )}
    </div>
  );
};

/* ─── Inline Styles ─── */
const S = {
  overlay: {
    position: 'fixed', inset: 0, zIndex: 9999,
    background: '#0f1219', display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  container: {
    width: '100%', height: '100%', display: 'flex',
    background: '#0f1219',
  },
  videoArea: {
    flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', minWidth: 0,
  },
  topBar: {
    position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10,
    padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '12px',
    background: 'linear-gradient(180deg, rgba(0,0,0,0.7) 0%, transparent 100%)',
  },
  liveBadge: {
    display: 'flex', alignItems: 'center', gap: '6px',
    background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.4)',
    padding: '4px 12px', borderRadius: '999px',
    color: '#ef4444', fontSize: '11px', fontWeight: 800, letterSpacing: '1px',
  },
  viewerBadge: {
    display: 'flex', alignItems: 'center', gap: '6px',
    background: 'rgba(255,255,255,0.1)', padding: '4px 12px', borderRadius: '999px',
    color: '#fff', fontSize: '12px', fontWeight: 600,
  },
  remoteArea: {
    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: '#000', overflow: 'hidden',
  },
  waitingMsg: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px',
    color: 'rgba(255,255,255,0.6)', fontSize: '16px',
  },
  spinner: {
    width: '48px', height: '48px', borderRadius: '50%',
    border: '4px solid #1EBDB8', borderTopColor: 'transparent',
    animation: 'spin 1s linear infinite',
  },
  localVideo: {
    position: 'absolute', bottom: '80px', right: '20px', zIndex: 10,
    width: '180px', height: '135px', borderRadius: '12px', overflow: 'hidden',
    border: '2px solid rgba(255,255,255,0.2)', background: '#1f2937',
    boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
  },
  camOff: {
    position: 'absolute', inset: 0,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: '#111827', fontSize: '28px', color: '#6b7280'
  },
  camOffBig: {
    position: 'absolute', inset: 0,
    display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center', justifyContent: 'center',
    background: '#111827', fontSize: '48px', color: '#6b7280', fontWeight: 700
  },
  localLabel: {
    position: 'absolute', bottom: '6px', left: '6px',
    display: 'flex', alignItems: 'center', gap: '4px',
    background: 'rgba(0,0,0,0.6)', padding: '2px 8px', borderRadius: '999px',
  },
  controlsBar: {
    display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px',
    padding: '16px', background: '#1a1f2c', borderTop: '1px solid rgba(255,255,255,0.08)',
  },
  ctrlBtn: {
    width: '48px', height: '48px', borderRadius: '50%', border: 'none',
    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'all 0.2s', boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
  },
  endBtn: {
    padding: '10px 28px', background: '#dc2626', color: '#fff',
    border: 'none', borderRadius: '999px', fontWeight: 700, fontSize: '14px',
    cursor: 'pointer', transition: 'all 0.2s',
    boxShadow: '0 4px 16px rgba(220,38,38,0.4)',
  },
  primaryBtn: {
    padding: '12px 32px', background: '#1EBDB8', color: '#fff',
    border: 'none', borderRadius: '16px', fontWeight: 700, fontSize: '15px',
    cursor: 'pointer',
  },
  chatSidebar: {
    width: '320px', display: 'flex', flexDirection: 'column',
    background: '#1a1f2c', borderLeft: '1px solid rgba(255,255,255,0.08)',
  },
  chatHeader: {
    padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    color: '#fff',
  },
  chatMessages: {
    flex: 1, overflowY: 'auto', padding: '12px 16px',
    display: 'flex', flexDirection: 'column', gap: '8px',
  },
  chatMsg: {
    display: 'flex', flexDirection: 'column', gap: '2px',
    background: 'rgba(255,255,255,0.05)', padding: '8px 12px', borderRadius: '10px',
  },
  chatInputWrap: {
    padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.08)',
    display: 'flex', gap: '8px',
  },
  chatInputField: {
    flex: 1, padding: '10px 14px', borderRadius: '12px', border: 'none',
    background: 'rgba(255,255,255,0.08)', color: '#fff', fontSize: '13px',
    outline: 'none',
  },
  chatSendBtn: {
    width: '40px', height: '40px', borderRadius: '12px', border: 'none',
    background: '#1EBDB8', color: '#fff', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
};
