import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { fetchActiveStreams, joinLiveStream } from '../../services/authApi';
import LiveStreamRoom from '../shared/LiveStreamRoom';

const formatDate = (d) => {
  if (!d) return '';
  return new Date(d).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
};

export default function PatientLiveStreams() {
  const token = localStorage.getItem('patientToken');
  const [streams, setStreams] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeStream, setActiveStream] = useState(null);
  const [joiningId, setJoiningId] = useState('');

  const loadStreams = useCallback(async () => {
    if (!token) return;
    try {
      const data = await fetchActiveStreams(token);
      setStreams(data.streams || []);
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => { loadStreams(); }, [loadStreams]);

  // Auto-refresh every 15 seconds
  useEffect(() => {
    const interval = setInterval(loadStreams, 15000);
    return () => clearInterval(interval);
  }, [loadStreams]);

  const handleJoin = async (stream) => {
    setJoiningId(stream._id);
    try {
      const data = await joinLiveStream(token, stream._id);
      setActiveStream({
        stream: data.stream,
        token: data.token,
        channelName: data.channelName
      });
    } catch (err) {
      toast.error(err.message || 'Could not join stream');
    } finally {
      setJoiningId('');
    }
  };

  const handleLeave = () => {
    setActiveStream(null);
    loadStreams();
  };

  if (activeStream) {
    return (
      <LiveStreamRoom
        streamId={activeStream.stream?._id}
        channelName={activeStream.channelName}
        token={activeStream.token}
        appId={import.meta.env.VITE_AGORA_APP_ID}
        isHost={false}
        streamTitle={activeStream.stream?.title || 'Live Stream'}
        hostName={activeStream.stream?.doctorName || 'Doctor'}
        onLeave={handleLeave}
      />
    );
  }

  const liveNow = streams.filter(s => s.status === 'live');
  const upcoming = streams.filter(s => s.status === 'scheduled');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={S.header}>
        <div>
          <h2 style={{ fontSize: '28px', fontWeight: 800, color: '#1F2432', margin: 0 }}>Live Streams</h2>
          <p style={{ fontSize: '14px', color: '#6B7280', marginTop: '4px' }}>Watch live broadcasts from doctors</p>
        </div>
        <button onClick={loadStreams} style={S.refreshBtn}>
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/></svg>
          Refresh
        </button>
      </div>

      {/* Live Now */}
      {liveNow.length > 0 && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1F2432', margin: 0 }}>🔴 Live Now</h3>
            <span style={S.countBadge}>{liveNow.length}</span>
          </div>
          <div style={S.grid}>
            {liveNow.map(s => (
              <div key={s._id} style={S.liveCard}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <span style={S.liveBadge}>
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#ef4444', animation: 'pulse 2s infinite' }} />
                    LIVE
                  </span>
                  {s.viewerCount > 0 && Math.max(0, s.viewerCount - 1) > 0 && (
                    <span style={S.viewerBadge}>
                      <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                      {Math.max(0, s.viewerCount - 1)}
                    </span>
                  )}
                </div>

                <div style={S.hostInfo}>
                  <div style={S.hostAvatar}>
                    {s.doctorAvatar ? (
                      <img src={s.doctorAvatar} alt={s.doctorName} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                    ) : (
                      <span style={{ fontSize: '16px' }}>👨‍⚕️</span>
                    )}
                  </div>
                  <div>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#1F2432' }}>{s.doctorName}</span>
                    <p style={{ fontSize: '11px', color: '#94a3b8', margin: 0 }}>Host</p>
                  </div>
                </div>

                <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#1F2432', margin: '12px 0 4px' }}>{s.title}</h4>
                {s.description && (
                  <p style={{ fontSize: '13px', color: '#6B7280', marginBottom: '16px', lineHeight: 1.5 }}>
                    {s.description.length > 100 ? s.description.substring(0, 97) + '...' : s.description}
                  </p>
                )}

                <button
                  onClick={() => handleJoin(s)}
                  disabled={joiningId === s._id}
                  style={S.joinBtn}
                >
                  {joiningId === s._id ? 'Joining...' : '▶ Watch Live'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upcoming */}
      {upcoming.length > 0 && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1F2432', margin: 0 }}>📅 Upcoming</h3>
            <span style={S.countBadge}>{upcoming.length}</span>
          </div>
          <div style={S.grid}>
            {upcoming.map(s => (
              <div key={s._id} style={S.scheduledCard}>
                <span style={{ background: '#f0fdf4', color: '#16a34a', fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '999px', display: 'inline-block', marginBottom: '12px' }}>UPCOMING</span>

                <div style={S.hostInfo}>
                  <div style={S.hostAvatar}>
                    {s.doctorAvatar ? (
                      <img src={s.doctorAvatar} alt={s.doctorName} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                    ) : (
                      <span style={{ fontSize: '16px' }}>👨‍⚕️</span>
                    )}
                  </div>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#1F2432' }}>{s.doctorName}</span>
                </div>

                <h4 style={{ fontSize: '16px', fontWeight: 700, color: '#1F2432', margin: '12px 0 4px' }}>{s.title}</h4>
                {s.description && (
                  <p style={{ fontSize: '13px', color: '#6B7280', marginBottom: '8px', lineHeight: 1.5 }}>
                    {s.description.length > 100 ? s.description.substring(0, 97) + '...' : s.description}
                  </p>
                )}

                {s.scheduledAt && (
                  <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0 }}>📅 {formatDate(s.scheduledAt)}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty */}
      {!isLoading && streams.length === 0 && (
        <div style={S.empty}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>📡</div>
          <p style={{ fontSize: '16px', fontWeight: 600, color: '#475569' }}>No live streams right now</p>
          <p style={{ fontSize: '14px', color: '#94a3b8' }}>Check back later for upcoming broadcasts from doctors.</p>
        </div>
      )}

      {isLoading && (
        <div style={S.empty}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '4px solid #1EBDB8', borderTopColor: 'transparent', animation: 'spin 1s linear infinite' }} />
        </div>
      )}

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5} }
        @keyframes spin { to{transform:rotate(360deg)} }
      `}</style>
    </div>
  );
}

const S = {
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px',
  },
  refreshBtn: {
    display: 'flex', alignItems: 'center', gap: '6px',
    padding: '8px 16px', borderRadius: '12px', border: '1.5px solid #e5e7eb',
    background: '#fff', color: '#374151', fontWeight: 600, fontSize: '13px', cursor: 'pointer',
  },
  countBadge: {
    background: '#f0fdf4', color: '#16a34a', fontSize: '12px', fontWeight: 700,
    padding: '2px 10px', borderRadius: '999px',
  },
  grid: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px',
  },
  liveCard: {
    background: '#fff', borderRadius: '20px', padding: '24px',
    border: '2px solid #fecaca',
    boxShadow: '0 0 20px rgba(239,68,68,0.08)',
  },
  scheduledCard: {
    background: '#fff', borderRadius: '20px', padding: '24px',
    border: '1px solid #f0f0f2',
    boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
  },
  liveBadge: {
    display: 'flex', alignItems: 'center', gap: '4px',
    background: '#fef2f2', color: '#ef4444', fontSize: '11px', fontWeight: 800,
    padding: '3px 10px', borderRadius: '999px', letterSpacing: '0.5px',
  },
  viewerBadge: {
    display: 'flex', alignItems: 'center', gap: '4px',
    fontSize: '12px', color: '#6B7280',
  },
  hostInfo: {
    display: 'flex', alignItems: 'center', gap: '10px',
  },
  hostAvatar: {
    width: '36px', height: '36px', borderRadius: '50%',
    background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center',
    overflow: 'hidden', border: '2px solid #e5e7eb',
  },
  joinBtn: {
    width: '100%', padding: '12px', borderRadius: '14px', border: 'none',
    background: '#1EBDB8', color: '#fff', fontWeight: 700, fontSize: '14px',
    cursor: 'pointer', transition: 'all 0.2s',
  },
  empty: {
    background: '#fff', borderRadius: '24px', padding: '60px 20px',
    textAlign: 'center', border: '1px solid #f0f0f2',
    display: 'flex', flexDirection: 'column', alignItems: 'center',
  },
};
