import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  fetchStoreConversations,
  fetchStoreMessages,
  fetchStorePartnerInfo,
  sendStoreChatMessageRest,
  searchStoresForChat,
  uploadChatMedia
} from '../../services/storeChatApi';
import { connectSocket, getSocket } from '../../services/socket';
import { getMedicalStoreSessionProfile, getPatientSessionProfile } from '../../utils/authSession';

function buildAvatar(name, avatarUrl = '') {
  if (avatarUrl && String(avatarUrl).trim()) return String(avatarUrl).trim();
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'U')}&background=1EBDB8&color=fff&bold=true&size=128`;
}

function formatTime(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const now = new Date();
  if (d.toDateString() === now.toDateString())
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const y = new Date(now); y.setDate(y.getDate() - 1);
  if (d.toDateString() === y.toDateString()) return 'Yesterday';
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

function groupMessages(msgs) {
  const groups = [];
  let cur = '';
  for (const msg of msgs) {
    const d = new Date(msg.createdAt).toDateString();
    if (d !== cur) {
      cur = d;
      const now = new Date();
      const y = new Date(now); y.setDate(y.getDate() - 1);
      const label = d === now.toDateString() ? 'Today' : d === y.toDateString() ? 'Yesterday'
        : new Date(msg.createdAt).toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });
      groups.push({ type: 'date', label, key: `date-${d}` });
    }
    groups.push({ type: 'message', data: msg, key: msg._id || msg.id || Math.random() });
  }
  return groups;
}

export default function StoreChatScreen({
  role = 'medical-store',
  tokenKey = 'medicalStoreToken',
  userKey = 'medicalStore'
}) {
  const [conversations, setConversations] = useState([]);
  const [activePartner, setActivePartner] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isLoadingConvs, setIsLoadingConvs] = useState(true);
  const [isLoadingMsgs, setIsLoadingMsgs] = useState(false);
  const [showMobileChat, setShowMobileChat] = useState(false);
  const [mediaPreview, setMediaPreview] = useState(null); // { file, localUrl, type }
  const [isUploading, setIsUploading] = useState(false);

  // Single search field
  const [searchQuery, setSearchQuery] = useState('');
  const [storeResults, setStoreResults] = useState([]);
  const [isSearchingStores, setIsSearchingStores] = useState(false);

  const messagesEndRef = useRef(null);
  const searchTimerRef = useRef(null);
  const fileInputRef = useRef(null);

  const token = localStorage.getItem(tokenKey);
  const storedUser = JSON.parse(localStorage.getItem(userKey) || 'null');
  const myId = String(storedUser?.id || '').trim();
  const isPatient = role === 'patient';

  const loadConvs = useCallback(async () => {
    if (!token) return [];
    try {
      const data = await fetchStoreConversations(token);
      const convs = Array.isArray(data?.conversations) ? data.conversations : [];
      setConversations(convs);
      return convs;
    } catch { setConversations([]); return []; }
  }, [token]);

  // Initial load + handle ?partnerId deep-link
  useEffect(() => {
    let mounted = true;
    const init = async () => {
      setIsLoadingConvs(true);
      const convs = await loadConvs();
      if (!mounted) return;
      setIsLoadingConvs(false);
      const initId = new URLSearchParams(window.location.search).get('partnerId');
      if (initId) {
        const existing = convs.find(c => String(c.partnerId) === initId);
        if (existing) {
          setActivePartner(existing);
        } else {
          setActivePartner({ partnerId: initId, partnerName: '', partnerAvatar: '' });
          fetchStorePartnerInfo(token, initId).then(info => {
            if (!mounted) return;
            setActivePartner({ partnerId: initId, partnerName: info.partnerName || '', partnerAvatar: info.partnerAvatar || '' });
          }).catch(() => {});
        }
        setShowMobileChat(true);
      }
    };
    init();
    return () => { mounted = false; };
  }, [loadConvs]);

  // Socket: listen for incoming store-chat messages
  useEffect(() => {
    if (!token) return;
    const socket = connectSocket(token);
    if (!socket) return;
    const handleMsg = (msg) => {
      const partnerId = String(activePartner?.partnerId || '');
      const other = String(msg.from) === myId ? String(msg.to) : String(msg.from);
      if (partnerId && other === partnerId) {
        setMessages(prev => {
          const exists = prev.some(m => (m._id || m.id) === (msg._id || msg.id));
          return exists ? prev : [...prev, msg];
        });
        fetchStoreMessages(token, partnerId).catch(() => {});
      }
      loadConvs();
    };
    socket.on('store-chat:message', handleMsg);
    return () => { try { getSocket()?.off('store-chat:message', handleMsg); } catch {} };
  }, [token, activePartner, myId, loadConvs]);

  // Load messages when active partner changes
  useEffect(() => {
    if (!activePartner || !token) return;
    let mounted = true;
    setIsLoadingMsgs(true);
    fetchStoreMessages(token, activePartner.partnerId)
      .then(data => {
        if (!mounted) return;
        setMessages(Array.isArray(data?.messages) ? data.messages : []);
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 80);
      })
      .catch(() => setMessages([]))
      .finally(() => { if (mounted) setIsLoadingMsgs(false); });
    return () => { mounted = false; };
  }, [activePartner, token]);

  // Auto scroll
  useEffect(() => {
    if (messages.length > 0)
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 80);
  }, [messages.length]);

  // Search: for patients → search stores; for stores → filter convs
  const handleSearch = (q) => {
    setSearchQuery(q);
    if (!isPatient) return; // stores just filter locally
    clearTimeout(searchTimerRef.current);
    if (!q.trim()) { setStoreResults([]); return; }
    searchTimerRef.current = setTimeout(async () => {
      setIsSearchingStores(true);
      try {
        const data = await searchStoresForChat(token, q);
        setStoreResults(Array.isArray(data?.stores) ? data.stores : []);
      } catch { setStoreResults([]); }
      finally { setIsSearchingStores(false); }
    }, 350);
  };

  const selectStore = (store) => {
    setActivePartner({ partnerId: store.id, partnerName: store.name, partnerAvatar: store.avatarUrl });
    setMessages([]);
    setSearchQuery('');
    setStoreResults([]);
    setShowMobileChat(true);
  };

  const selectConv = (conv) => {
    setActivePartner(conv);
    setConversations(prev => prev.map(c => c.partnerId === conv.partnerId ? { ...c, unreadCount: 0 } : c));
    setMessages([]);
    setSearchQuery('');
    setStoreResults([]);
    setShowMobileChat(true);
  };

  // Pick media file
  const handleFilePick = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const localUrl = URL.createObjectURL(file);
    const type = file.type.startsWith('video/') ? 'video' : 'image';
    setMediaPreview({ file, localUrl, type });
    e.target.value = '';
  };

  const clearMedia = () => {
    if (mediaPreview?.localUrl) URL.revokeObjectURL(mediaPreview.localUrl);
    setMediaPreview(null);
  };

  // Send message (text or media)
  const sendMessage = async () => {
    if (!text.trim() && !mediaPreview) return;
    if (!token || !activePartner) return;
    setIsSending(true);
    try {
      let attachment = null;
      if (mediaPreview) {
        setIsUploading(true);
        const uploaded = await uploadChatMedia(token, mediaPreview.file);
        attachment = { url: uploaded.url, type: uploaded.type };
        setIsUploading(false);
        clearMedia();
      }
      const payload = { to: activePartner.partnerId, content: text.trim(), attachment };
      const socket = getSocket();
      if (socket?.connected) {
        socket.emit('store-chat:send', payload, (ack) => {
          if (ack?.ok && ack.message) {
            setMessages(prev => {
              const exists = prev.some(m => (m._id || m.id) === (ack.message._id || ack.message.id));
              return exists ? prev : [...prev, ack.message];
            });
          }
        });
      } else {
        const res = await sendStoreChatMessageRest(token, payload);
        if (res?.message) setMessages(prev => [...prev, res.message]);
      }
      setText('');
      loadConvs();
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 80);
    } catch (err) {
      setIsUploading(false);
    } finally { setIsSending(false); }
  };

  // Filter conversations (for stores browsing existing convs)
  const filteredConvs = useMemo(() => {
    if (!searchQuery.trim() || isPatient) return conversations;
    const q = searchQuery.toLowerCase();
    return conversations.filter(c => (c.partnerName || '').toLowerCase().includes(q));
  }, [conversations, searchQuery, isPatient]);

  // What to show in the sidebar list:
  // - If patient is searching → show store results
  // - Otherwise → show existing conversations
  const showingStoreSearch = isPatient && searchQuery.trim().length > 0;

  const groups = useMemo(() => groupMessages(messages), [messages]);

  return (
    <div style={{
      fontFamily: "'Inter', sans-serif",
      display: 'flex',
      height: '78vh',
      background: '#fff',
      borderRadius: 24,
      overflow: 'hidden',
      boxShadow: '0 4px 40px rgba(0,0,0,0.06)',
      border: '1px solid #f0f0f2'
    }}>
      {/* ── Sidebar ── */}
      <div style={{
        width: 340,
        minWidth: 340,
        borderRight: '1px solid #f0f0f2',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        background: '#fff'
      }}>
        <div style={{ padding: '24px 20px 12px' }}>
          <p style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', margin: '0 0 4px' }}>Messages</p>
          <p style={{ fontSize: 13, color: '#94a3b8', margin: '0 0 14px' }}>
            {isPatient ? 'Search a medical store to start chatting' : 'Your conversations with patients'}
          </p>

          {/* Single search field */}
          <div style={{ position: 'relative' }}>
            <svg style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }}
              width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              value={searchQuery}
              onChange={e => handleSearch(e.target.value)}
              placeholder={isPatient ? 'Search medical stores...' : 'Search conversations...'}
              style={{
                width: '100%',
                padding: '11px 14px 11px 38px',
                background: '#f8fafc',
                border: '1.5px solid #e2e8f0',
                borderRadius: 14,
                fontSize: 13.5,
                color: '#334155',
                outline: 'none',
                boxSizing: 'border-box',
                fontFamily: 'inherit'
              }}
              onFocus={e => { e.target.style.borderColor = '#1EBDB8'; e.target.style.boxShadow = '0 0 0 3px rgba(30,189,184,0.08)'; }}
              onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }}
            />
            {isSearchingStores && (
              <div style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)' }}>
                <div style={{ width: 14, height: 14, border: '2px solid #1EBDB8', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
              </div>
            )}
          </div>

          {/* Store search results dropdown */}
          {isPatient && storeResults.length > 0 && (
            <div style={{
              background: '#fff',
              border: '1px solid #e2e8f0',
              borderRadius: 14,
              boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
              marginTop: 6,
              maxHeight: 220,
              overflowY: 'auto'
            }}>
              {storeResults.map(store => (
                <button key={store.id} onClick={() => selectStore(store)}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '10px 14px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
                  onMouseOver={e => e.currentTarget.style.background = '#f8fafc'}
                  onMouseOut={e => e.currentTarget.style.background = 'none'}>
                  <img src={buildAvatar(store.name, store.avatarUrl)} alt={store.name}
                    style={{ width: 36, height: 36, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }} />
                  <div>
                    <p style={{ margin: 0, fontSize: 13.5, fontWeight: 600, color: '#0f172a' }}>{store.name}</p>
                    {store.address && <p style={{ margin: 0, fontSize: 11, color: '#94a3b8' }}>{store.address}</p>}
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* No results hint */}
          {isPatient && searchQuery.trim() && !isSearchingStores && storeResults.length === 0 && (
            <p style={{ fontSize: 12, color: '#94a3b8', margin: '8px 0 0', textAlign: 'center' }}>No stores found for "{searchQuery}"</p>
          )}
        </div>

        {/* Conversation list */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '4px 10px 10px' }}>
          {isLoadingConvs ? (
            <div style={{ textAlign: 'center', padding: 40, color: '#94a3b8', fontSize: 13 }}>Loading...</div>
          ) : filteredConvs.length === 0 && !showingStoreSearch ? (
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.2" style={{ margin: '0 auto 10px', display: 'block' }}>
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
              <p style={{ fontSize: 14, fontWeight: 600, color: '#64748b', margin: '0 0 4px' }}>No conversations yet</p>
              <p style={{ fontSize: 12, color: '#94a3b8', margin: 0 }}>
                {isPatient ? 'Search a store above to start chatting' : 'Wait for patients to message you'}
              </p>
            </div>
          ) : filteredConvs.map(conv => {
            const isActive = activePartner?.partnerId === conv.partnerId;
            return (
              <button key={conv.partnerId} onClick={() => selectConv(conv)} style={{
                display: 'flex', alignItems: 'center', gap: 12, width: '100%', padding: '12px 12px',
                borderRadius: 16, cursor: 'pointer', textAlign: 'left', marginBottom: 2,
                border: isActive ? '1px solid rgba(30,189,184,0.2)' : '1px solid transparent',
                background: isActive ? 'linear-gradient(135deg,#f0fdfc,#e6faf9)' : 'transparent'
              }}
                onMouseOver={e => { if (!isActive) e.currentTarget.style.background = '#f8fafc'; }}
                onMouseOut={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}>
                <img src={buildAvatar(conv.partnerName, conv.partnerAvatar)} alt={conv.partnerName}
                  style={{ width: 48, height: 48, borderRadius: 14, objectFit: 'cover', flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{conv.partnerName || 'Unknown'}</span>
                    <span style={{ fontSize: 11, color: '#94a3b8', whiteSpace: 'nowrap', flexShrink: 0, marginLeft: 6 }}>{formatTime(conv.lastMessage?.createdAt)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 12, color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{conv.lastMessage?.content || ''}</span>
                    {conv.unreadCount > 0 && <span style={{ background: '#1EBDB8', color: '#fff', borderRadius: 999, fontSize: 10, fontWeight: 700, padding: '2px 7px', flexShrink: 0, marginLeft: 6 }}>{conv.unreadCount}</span>}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Chat Panel ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#fafbfc', minWidth: 0 }}>
        {!activePartner ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14 }}>
            <div style={{ width: 80, height: 80, borderRadius: 24, background: '#f0fdfc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#1EBDB8" strokeWidth="1.5">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
            </div>
            <p style={{ fontSize: 18, fontWeight: 700, color: '#334155', margin: 0 }}>Welcome to Messages</p>
            <p style={{ fontSize: 14, color: '#94a3b8', margin: 0, textAlign: 'center', maxWidth: 260, lineHeight: 1.5 }}>
              {isPatient ? 'Search a medical store in the left panel to start chatting' : 'Select a conversation from the left to start chatting, or wait for a new message to arrive.'}
            </p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 24px', background: '#fff', borderBottom: '1px solid #f0f0f2', flexShrink: 0 }}>
              <button onClick={() => { setShowMobileChat(false); setActivePartner(null); }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: '#64748b', display: 'none' }} className="chat-back-btn">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
              </button>
              <img src={buildAvatar(activePartner.partnerName, activePartner.partnerAvatar)} alt={activePartner.partnerName}
                style={{ width: 44, height: 44, borderRadius: 14, objectFit: 'cover' }} />
              <div>
                <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#0f172a' }}>{activePartner.partnerName || 'Loading...'}</p>
                <p style={{ margin: 0, fontSize: 12, color: '#22c55e', fontWeight: 500 }}>● Active</p>
              </div>
            </div>

            {/* Messages area */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 4 }}>
              {isLoadingMsgs ? (
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: 13 }}>Loading messages...</div>
              ) : groups.length === 0 ? (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.2" style={{ marginBottom: 12 }}>
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                  </svg>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#64748b' }}>No messages yet</p>
                  <p style={{ margin: '4px 0 0', fontSize: 12, color: '#94a3b8' }}>
                    {isPatient ? 'Send a message to start the conversation!' : 'Waiting for the patient to send the first message'}
                  </p>
                </div>
              ) : groups.map(item => {
                if (item.type === 'date') return (
                  <div key={item.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px 0 8px' }}>
                    <span style={{ background: '#e2e8f0', color: '#475569', fontSize: 11, fontWeight: 600, padding: '4px 14px', borderRadius: 10 }}>{item.label}</span>
                  </div>
                );
                const msg = item.data;
                const isMine = String(msg.from) === myId;
                const att = msg.attachment;
                return (
                  <div key={item.key} style={{ display: 'flex', justifyContent: isMine ? 'flex-end' : 'flex-start', marginBottom: 6 }}>
                    {!isMine && (
                      <img src={buildAvatar(activePartner.partnerName, activePartner.partnerAvatar)} alt=""
                        style={{ width: 28, height: 28, borderRadius: 9, objectFit: 'cover', marginRight: 8, alignSelf: 'flex-end', flexShrink: 0 }} />
                    )}
                    <div style={{
                      maxWidth: '65%', padding: att?.url ? '6px' : '11px 15px', borderRadius: 18, overflow: 'hidden',
                      ...(isMine
                        ? { background: 'linear-gradient(135deg,#1EBDB8,#17a5a1)', color: '#fff', borderBottomRightRadius: 6 }
                        : { background: '#fff', color: '#1e293b', border: '1px solid #f0f0f2', borderBottomLeftRadius: 6, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' })
                    }}>
                      {att?.url && att.type === 'image' && (
                        <a href={att.url} target="_blank" rel="noreferrer">
                          <img src={att.url} alt="media" style={{ maxWidth: 260, maxHeight: 260, borderRadius: 12, display: 'block', objectFit: 'cover' }} />
                        </a>
                      )}
                      {att?.url && att.type === 'video' && (
                        <video src={att.url} controls style={{ maxWidth: 260, borderRadius: 12, display: 'block' }} />
                      )}
                      {msg.content ? <p style={{ margin: att?.url ? '6px 8px 4px' : '0', fontSize: 14, wordWrap: 'break-word', whiteSpace: 'pre-wrap' }}>{msg.content}</p> : null}
                      <p style={{ margin: att?.url ? '0 8px 6px' : '4px 0 0', fontSize: 10, textAlign: 'right', opacity: 0.65 }}>
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Composer */}
            {!isPatient && messages.length === 0 ? (
              <div style={{ padding: '14px 24px', background: '#fff', borderTop: '1px solid #f0f0f2', textAlign: 'center' }}>
                <p style={{ margin: 0, fontSize: 13, color: '#94a3b8' }}>Wait for the patient to send the first message before you can reply.</p>
              </div>
            ) : (
              <div style={{ background: '#fff', borderTop: '1px solid #f0f0f2', flexShrink: 0 }}>
                {/* Media preview */}
                {mediaPreview && (
                  <div style={{ padding: '10px 24px 0', display: 'flex', alignItems: 'center', gap: 10 }}>
                    {mediaPreview.type === 'image'
                      ? <img src={mediaPreview.localUrl} alt="preview" style={{ height: 70, borderRadius: 10, objectFit: 'cover' }} />
                      : <video src={mediaPreview.localUrl} style={{ height: 70, borderRadius: 10 }} />}
                    <button onClick={clearMedia} style={{ background: '#fee2e2', border: 'none', borderRadius: 8, padding: '4px 8px', cursor: 'pointer', color: '#ef4444', fontSize: 12, fontWeight: 600 }}>Remove</button>
                    {isUploading && <span style={{ fontSize: 12, color: '#1EBDB8' }}>Uploading...</span>}
                  </div>
                )}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 8, margin: '10px 16px 12px',
                  background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: 18, padding: '6px 8px 6px 14px'
                }}>
                  {/* Attach button */}
                  <input ref={fileInputRef} type="file" accept="image/*,video/*" style={{ display: 'none' }} onChange={handleFilePick} />
                  <button onClick={() => fileInputRef.current?.click()}
                    title="Attach image or video"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: '4px', display: 'flex', alignItems: 'center', flexShrink: 0 }}
                    onMouseOver={e => e.currentTarget.style.color = '#1EBDB8'}
                    onMouseOut={e => e.currentTarget.style.color = '#94a3b8'}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
                  </button>
                  <textarea
                    value={text}
                    onChange={e => setText(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                    placeholder="Type a message..."
                    rows={1}
                    style={{ flex: 1, border: 'none', outline: 'none', fontSize: 14, color: '#1e293b', background: 'transparent', fontFamily: 'inherit', padding: '6px 0', resize: 'none' }}
                  />
                  <button onClick={sendMessage} disabled={(!text.trim() && !mediaPreview) || isSending}
                    style={{
                      width: 42, height: 42, borderRadius: 14, border: 'none',
                      background: 'linear-gradient(135deg,#1EBDB8,#17a5a1)', color: '#fff',
                      cursor: (!text.trim() && !mediaPreview) ? 'not-allowed' : 'pointer',
                      opacity: (!text.trim() && !mediaPreview) ? 0.5 : 1,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                      boxShadow: '0 2px 8px rgba(30,189,184,0.25)'
                    }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: translateY(-50%) rotate(360deg); } }
        @media (max-width: 768px) {
          .chat-back-btn { display: flex !important; }
        }
      `}</style>
    </div>
  );
}
