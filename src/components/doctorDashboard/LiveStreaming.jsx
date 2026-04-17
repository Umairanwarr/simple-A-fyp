import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getDoctorSessionProfile } from '../../utils/authSession';
import {
  createLiveStream,
  fetchMyStreams,
  startLiveStream,
  endLiveStream,
  deleteLiveStream,
  getHostToken
} from '../../services/authApi';
import LiveStreamRoom from '../shared/LiveStreamRoom';

const normalizePlan = (v) => {
  const p = String(v || '').trim().toLowerCase();
  return ['platinum', 'gold', 'diamond'].includes(p) ? p : 'platinum';
};

const formatPlanLabel = (v) => {
  const p = normalizePlan(v);
  return p.charAt(0).toUpperCase() + p.slice(1);
};

const formatDate = (d) => {
  if (!d) return '';
  return new Date(d).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
};

export default function LiveStreaming() {
  const navigate = useNavigate();
  const profile = getDoctorSessionProfile();
  const { currentPlan } = profile;
  const normalizedPlan = normalizePlan(currentPlan);
  const isDiamondPlan = normalizedPlan === 'diamond';
  const token = localStorage.getItem('doctorToken');

  const [streams, setStreams] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({ title: '', description: '', scheduledAt: '', startNow: false });
  const [isCreating, setIsCreating] = useState(false);
  const [activeStream, setActiveStream] = useState(null); // { stream, token, channelName }
  const [actionLoading, setActionLoading] = useState('');

  const loadStreams = useCallback(async () => {
    if (!token) return;
    try {
      const data = await fetchMyStreams(token);
      setStreams(data.streams || []);
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => { loadStreams(); }, [loadStreams]);

  const handleCreate = async () => {
    if (!createForm.title.trim()) {
      toast.error('Stream title is required');
      return;
    }
    setIsCreating(true);
    try {
      const data = await createLiveStream(token, {
        title: createForm.title.trim(),
        description: createForm.description.trim(),
        scheduledAt: createForm.startNow ? null : createForm.scheduledAt,
        startNow: createForm.startNow
      });

      toast.success(createForm.startNow ? 'Stream started!' : 'Stream scheduled!');
      setShowCreateModal(false);
      setCreateForm({ title: '', description: '', scheduledAt: '', startNow: false });

      if (createForm.startNow && data.token) {
        setActiveStream({
          stream: data.stream,
          token: data.token,
          channelName: data.stream.channelName
        });
      }

      loadStreams();
    } catch (err) {
      toast.error(err.message || 'Failed to create stream');
    } finally {
      setIsCreating(false);
    }
  };

  const handleStart = async (stream) => {
    setActionLoading(stream._id);
    try {
      const data = await startLiveStream(token, stream._id);
      toast.success('Stream is now live!');
      setActiveStream({
        stream: data.stream,
        token: data.token,
        channelName: data.stream.channelName
      });
      loadStreams();
    } catch (err) {
      toast.error(err.message || 'Failed to start stream');
    } finally {
      setActionLoading('');
    }
  };

  const handleEnd = async (stream) => {
    setActionLoading(stream._id);
    try {
      await deleteLiveStream(token, stream._id);
      toast.success('Stream ended and completely deleted');
      loadStreams();
    } catch (err) {
      toast.error(err.message || 'Failed to end stream');
    } finally {
      setActionLoading('');
    }
  };

  const handleDelete = async (stream) => {
    if (!window.confirm('Are you sure you want to delete this stream?')) return;
    setActionLoading(stream._id);
    try {
      await deleteLiveStream(token, stream._id);
      toast.success('Stream deleted');
      loadStreams();
    } catch (err) {
      toast.error(err.message || 'Failed to delete stream');
    } finally {
      setActionLoading('');
    }
  };

  const handleRejoinHost = async (stream) => {
    setActionLoading(stream._id);
    try {
      const data = await getHostToken(token, stream._id);
      setActiveStream({
        stream,
        token: data.token,
        channelName: data.channelName
      });
    } catch (err) {
      toast.error(err.message || 'Failed to rejoin stream');
    } finally {
      setActionLoading('');
    }
  };

  const handleLeaveStream = () => {
    setActiveStream(null);
    loadStreams();
  };

  const handleEndStreamFromRoom = async () => {
    if (activeStream?.stream?._id) {
      try {
        await deleteLiveStream(token, activeStream.stream._id);
        toast.success('Live stream ended and deleted.');
      } catch (err) {
        toast.error(err.message || 'Failed to delete stream from server');
      }
    }
    setActiveStream(null);
    loadStreams();
  };

  // ─── Active Stream Room ───
  if (activeStream) {
    return (
      <LiveStreamRoom
        streamId={activeStream.stream?._id}
        channelName={activeStream.channelName}
        token={activeStream.token}
        appId={import.meta.env.VITE_AGORA_APP_ID}
        isHost={true}
        streamTitle={activeStream.stream?.title || 'Live Stream'}
        hostName={profile.fullName || 'Doctor'}
        onLeave={handleLeaveStream}
        onEndStream={handleEndStreamFromRoom}
      />
    );
  }

  // ─── Upgrade Gate ───
  if (!isDiamondPlan) {
    return (
      <div className="space-y-6">
        <div style={S.heroCard}>
          <div style={{ position: 'relative', zIndex: 1, maxWidth: '640px' }}>
            <span style={S.upgradeBadge}>Upgrade Required</span>
            <h2 style={S.heroTitle}>Live Streaming Is Locked</h2>
            <p style={S.heroDesc}>
              You are currently on the {formatPlanLabel(normalizedPlan)} plan. Upgrade to Diamond to enable advanced live streaming,
              multi-guest sessions, and full broadcast controls.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
              <button onClick={() => navigate('/doctor/dashboard/subscriptions')} style={S.primaryBtn}>
                Upgrade To Diamond
              </button>
              <button disabled style={S.disabledBtn}>Streaming Disabled</button>
            </div>
          </div>
          <div style={S.heroGradient} />
        </div>
      </div>
    );
  }

  // ─── Main Dashboard ───
  const liveStreams = streams.filter(s => s.status === 'live');
  const scheduledStreams = streams.filter(s => s.status === 'scheduled');
  const endedStreams = streams.filter(s => s.status === 'ended');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* ─── Hero ─── */}
      <div style={S.heroCard}>
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '520px' }}>
          <span style={S.diamondBadge}>Diamond Plan Feature</span>
          <h2 style={S.heroTitle}>Live Streaming Studio</h2>
          <p style={S.heroDesc}>
            Broadcast your medical insights live. Invite guests to co-host and engage with viewers in real-time.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
            <button onClick={() => { setCreateForm({ title: '', description: '', scheduledAt: '', startNow: true }); setShowCreateModal(true); }} style={S.primaryBtn}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#fff', animation: 'pulse 2s infinite' }} />
              Start Instant Stream
            </button>
            <button onClick={() => { setCreateForm({ title: '', description: '', scheduledAt: '', startNow: false }); setShowCreateModal(true); }} style={S.secondaryBtn}>
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              Schedule Stream
            </button>
          </div>
        </div>
        <div style={{ ...S.heroGradient, background: 'linear-gradient(to left, rgba(30,189,184,0.2), transparent)' }} />
      </div>

      {/* ─── Live Now ─── */}
      {liveStreams.length > 0 && (
        <Section title="🔴 Currently Live" count={liveStreams.length}>
          {liveStreams.map(s => (
            <StreamCard key={s._id} stream={s} onRejoin={handleRejoinHost} onEnd={handleEnd} loading={actionLoading === s._id} />
          ))}
        </Section>
      )}

      {/* ─── Scheduled ─── */}
      {scheduledStreams.length > 0 && (
        <Section title="📅 Scheduled" count={scheduledStreams.length}>
          {scheduledStreams.map(s => (
            <StreamCard key={s._id} stream={s} onStart={handleStart} onDelete={handleDelete} loading={actionLoading === s._id} />
          ))}
        </Section>
      )}

      {/* ─── Past Streams ─── */}
      {endedStreams.length > 0 && (
        <Section title="📁 Past Streams" count={endedStreams.length}>
          {endedStreams.map(s => (
            <StreamCard key={s._id} stream={s} onDelete={handleDelete} loading={actionLoading === s._id} />
          ))}
        </Section>
      )}

      {/* ─── Empty State ─── */}
      {!isLoading && streams.length === 0 && (
        <div style={S.emptyState}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>📡</div>
          <p style={{ fontSize: '16px', fontWeight: 600, color: '#475569' }}>No streams yet</p>
          <p style={{ fontSize: '14px', color: '#94a3b8' }}>Start your first live stream or schedule one for later.</p>
        </div>
      )}

      {isLoading && (
        <div style={S.emptyState}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '4px solid #1EBDB8', borderTopColor: 'transparent', animation: 'spin 1s linear infinite' }} />
        </div>
      )}

      {/* ─── Create Modal ─── */}
      {showCreateModal && (
        <div style={S.modalOverlay} onClick={() => !isCreating && setShowCreateModal(false)}>
          <div style={S.modal} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: '22px', fontWeight: 800, color: '#1F2432', marginBottom: '4px' }}>
              {createForm.startNow ? '🔴 Start Instant Stream' : '📅 Schedule Stream'}
            </h3>
            <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '24px' }}>
              {createForm.startNow ? 'Your stream will go live immediately.' : 'Set a date & time for your upcoming stream.'}
            </p>

            <label style={S.label}>Stream Title *</label>
            <input
              type="text"
              value={createForm.title}
              onChange={e => setCreateForm(f => ({ ...f, title: e.target.value }))}
              placeholder="e.g. Heart Health Q&A"
              style={S.input}
              maxLength={200}
            />

            <label style={S.label}>Description</label>
            <textarea
              value={createForm.description}
              onChange={e => setCreateForm(f => ({ ...f, description: e.target.value }))}
              placeholder="What will this stream be about?"
              style={{ ...S.input, height: '80px', resize: 'vertical' }}
              maxLength={1000}
            />

            {!createForm.startNow && (
              <>
                <label style={S.label}>Scheduled Date & Time *</label>
                <input
                  type="datetime-local"
                  value={createForm.scheduledAt}
                  onChange={e => setCreateForm(f => ({ ...f, scheduledAt: e.target.value }))}
                  style={S.input}
                />
              </>
            )}

            <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
              <button onClick={() => setShowCreateModal(false)} disabled={isCreating} style={S.cancelBtn}>Cancel</button>
              <button onClick={handleCreate} disabled={isCreating} style={S.submitBtn}>
                {isCreating ? 'Creating...' : createForm.startNow ? 'Go Live Now' : 'Schedule Stream'}
              </button>
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

/* ─── Section Component ─── */
function Section({ title, count, children }) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1F2432' }}>{title}</h3>
        <span style={{ background: '#f0fdf4', color: '#16a34a', fontSize: '12px', fontWeight: 700, padding: '2px 10px', borderRadius: '999px' }}>{count}</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '16px' }}>
        {children}
      </div>
    </div>
  );
}

/* ─── Stream Card ─── */
function StreamCard({ stream, onStart, onEnd, onRejoin, onDelete, loading }) {
  const isLive = stream.status === 'live';
  const isScheduled = stream.status === 'scheduled';
  const isEnded = stream.status === 'ended';

  return (
    <div style={{
      background: '#fff', borderRadius: '20px', padding: '24px',
      border: isLive ? '2px solid #ef4444' : '1px solid #f0f0f2',
      boxShadow: isLive ? '0 0 24px rgba(239,68,68,0.1)' : '0 2px 12px rgba(0,0,0,0.04)',
      transition: 'all 0.2s',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
        {isLive && (
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#fef2f2', color: '#ef4444', fontSize: '11px', fontWeight: 800, padding: '3px 10px', borderRadius: '999px', letterSpacing: '0.5px' }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#ef4444', animation: 'pulse 2s infinite' }} /> LIVE
          </span>
        )}
        {isScheduled && (
          <span style={{ background: '#f0fdf4', color: '#16a34a', fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '999px' }}>SCHEDULED</span>
        )}
        {isEnded && (
          <span style={{ background: '#f8fafc', color: '#64748b', fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '999px' }}>ENDED</span>
        )}
        {stream.viewerCount > 0 && Math.max(0, stream.viewerCount - 1) > 0 && (
          <span style={{ marginLeft: 'auto', fontSize: '12px', color: '#6B7280', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            {Math.max(0, stream.viewerCount - 1)}
          </span>
        )}
      </div>

      <h4 style={{ fontSize: '17px', fontWeight: 700, color: '#1F2432', marginBottom: '4px' }}>{stream.title}</h4>
      {stream.description && (
        <p style={{ fontSize: '13px', color: '#6B7280', marginBottom: '12px', lineHeight: 1.5 }}>
          {stream.description.length > 120 ? stream.description.substring(0, 117) + '...' : stream.description}
        </p>
      )}

      <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '16px' }}>
        {isScheduled && stream.scheduledAt && <>📅 {formatDate(stream.scheduledAt)}</>}
        {isLive && stream.startedAt && <>🕐 Started {formatDate(stream.startedAt)}</>}
        {isEnded && stream.endedAt && <>Ended {formatDate(stream.endedAt)} · {stream.maxViewers || 0} peak viewers</>}
      </div>

      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {isScheduled && onStart && (
          <button onClick={() => onStart(stream)} disabled={loading} style={{ ...S.cardBtn, background: '#1EBDB8', color: '#fff' }}>
            {loading ? 'Starting...' : '▶ Go Live'}
          </button>
        )}
        {isLive && onRejoin && (
          <button onClick={() => onRejoin(stream)} disabled={loading} style={{ ...S.cardBtn, background: '#1EBDB8', color: '#fff' }}>
            {loading ? 'Joining...' : '📡 Rejoin Stream'}
          </button>
        )}
        {isLive && onEnd && (
          <button onClick={() => onEnd(stream)} disabled={loading} style={{ ...S.cardBtn, background: '#fef2f2', color: '#ef4444', border: '1px solid #fecaca' }}>
            End Stream
          </button>
        )}
        {(isScheduled || isEnded) && onDelete && (
          <button onClick={() => onDelete(stream)} disabled={loading} style={{ ...S.cardBtn, background: '#f8fafc', color: '#64748b', border: '1px solid #e2e8f0' }}>
            🗑 Delete
          </button>
        )}
      </div>
    </div>
  );
}

/* ─── Styles ─── */
const S = {
  heroCard: {
    background: '#1F2432', padding: '40px', borderRadius: '32px', color: '#fff',
    overflow: 'hidden', position: 'relative', minHeight: '280px',
    display: 'flex', flexDirection: 'column', justifyContent: 'center',
  },
  heroTitle: { fontSize: '32px', fontWeight: 800, lineHeight: 1.2, marginBottom: '12px' },
  heroDesc: { color: 'rgba(255,255,255,0.7)', fontSize: '15px', marginBottom: '24px', lineHeight: 1.6 },
  heroGradient: {
    position: 'absolute', top: 0, right: 0, width: '50%', height: '100%',
    background: 'linear-gradient(to left, rgba(245,158,11,0.2), transparent)',
    pointerEvents: 'none',
  },
  upgradeBadge: {
    display: 'inline-block', padding: '4px 16px', background: '#f59e0b',
    fontSize: '12px', fontWeight: 800, borderRadius: '999px', color: '#fff',
    textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '16px',
  },
  diamondBadge: {
    display: 'inline-block', padding: '4px 16px', background: '#1EBDB8',
    fontSize: '12px', fontWeight: 800, borderRadius: '999px', color: '#fff',
    textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '16px',
  },
  primaryBtn: {
    padding: '12px 28px', background: '#1EBDB8', color: '#fff', border: 'none',
    borderRadius: '16px', fontWeight: 700, fontSize: '15px', cursor: 'pointer',
    display: 'flex', alignItems: 'center', gap: '10px', transition: 'all 0.2s',
  },
  secondaryBtn: {
    padding: '12px 28px', background: 'rgba(255,255,255,0.1)', color: '#fff',
    border: '1px solid rgba(255,255,255,0.2)', borderRadius: '16px',
    fontWeight: 700, fontSize: '15px', cursor: 'pointer',
    display: 'flex', alignItems: 'center', gap: '10px', transition: 'all 0.2s',
  },
  disabledBtn: {
    padding: '12px 28px', background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.45)',
    border: '1px solid rgba(255,255,255,0.2)', borderRadius: '16px',
    fontWeight: 700, fontSize: '15px', cursor: 'not-allowed',
  },
  emptyState: {
    background: '#fff', borderRadius: '24px', padding: '60px 20px',
    textAlign: 'center', border: '1px solid #f0f0f2',
    display: 'flex', flexDirection: 'column', alignItems: 'center',
  },
  cardBtn: {
    padding: '8px 18px', borderRadius: '12px', border: 'none',
    fontWeight: 700, fontSize: '13px', cursor: 'pointer', transition: 'all 0.2s',
  },
  modalOverlay: {
    position: 'fixed', inset: 0, zIndex: 9999,
    background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '16px',
  },
  modal: {
    background: '#fff', borderRadius: '24px', padding: '32px',
    maxWidth: '480px', width: '100%', boxShadow: '0 24px 48px rgba(0,0,0,0.15)',
  },
  label: {
    display: 'block', fontSize: '13px', fontWeight: 700, color: '#374151',
    marginBottom: '6px', marginTop: '16px',
  },
  input: {
    width: '100%', padding: '12px 14px', borderRadius: '12px',
    border: '1.5px solid #e5e7eb', fontSize: '14px', color: '#111827',
    outline: 'none', transition: 'border 0.2s', boxSizing: 'border-box',
  },
  cancelBtn: {
    flex: 1, padding: '12px', borderRadius: '14px', border: '1.5px solid #e5e7eb',
    background: '#fff', color: '#374151', fontWeight: 700, fontSize: '14px', cursor: 'pointer',
  },
  submitBtn: {
    flex: 1, padding: '12px', borderRadius: '14px', border: 'none',
    background: '#1EBDB8', color: '#fff', fontWeight: 700, fontSize: '14px', cursor: 'pointer',
  },
};
