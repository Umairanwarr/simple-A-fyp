import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { fetchConversations, fetchMessages, sendMessageRest } from '../../services/chatApi';
import { connectSocket, getSocket } from '../../services/socket';
import { getPatientSessionProfile, getDoctorSessionProfile } from '../../utils/authSession';
import { apiRequest } from '../../services/apiClient';
import IncomingCallModal from './IncomingCallModal';
import VideoRoom from './VideoRoom';

function buildAvatar(name, background = '1EBDB8', avatarUrl = '') {
  if (avatarUrl && typeof avatarUrl === 'string' && avatarUrl.trim()) {
    return avatarUrl.trim();
  }
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'U')}&background=${background}&color=fff&bold=true&size=128`;
}

function formatTime(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday = d.toDateString() === yesterday.toDateString();

  if (isToday) {
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  if (isYesterday) {
    return 'Yesterday';
  }
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

function formatMessageTime(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function groupMessagesByDate(messages) {
  const groups = [];
  let currentDate = '';

  for (const msg of messages) {
    const msgDate = new Date(msg.createdAt).toDateString();
    if (msgDate !== currentDate) {
      currentDate = msgDate;
      const now = new Date();
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);

      let label;
      if (msgDate === now.toDateString()) {
        label = 'Today';
      } else if (msgDate === yesterday.toDateString()) {
        label = 'Yesterday';
      } else {
        label = new Date(msg.createdAt).toLocaleDateString([], {
          weekday: 'long',
          month: 'long',
          day: 'numeric',
          year: 'numeric'
        });
      }
      groups.push({ type: 'date', label, key: `date-${msgDate}` });
    }
    groups.push({ type: 'message', data: msg, key: msg.id || msg._id || Math.random().toString() });
  }
  return groups;
}

/* ─── SVG Icons ─── */
const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const SendIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);

const BackArrowIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

const EmptyChatIcon = () => (
  <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.25 }}>
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const PhoneIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);

const VideoIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
  </svg>
);

const MoreIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /><circle cx="5" cy="12" r="1" />
  </svg>
);

const EmojiIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><path d="M8 14s1.5 2 4 2 4-2 4-2" /><line x1="9" y1="9" x2="9.01" y2="9" /><line x1="15" y1="9" x2="15.01" y2="9" />
  </svg>
);

const AttachIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
  </svg>
);

/* ─── Component ─── */
export default function ChatScreen({ role = 'patient', tokenKey = 'patientToken', userKey = 'patient' }) {
  const [conversations, setConversations] = useState([]);
  const [activePartner, setActivePartner] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [showMobileChat, setShowMobileChat] = useState(false);
  const [activeCall, setActiveCall] = useState({ state: 'idle' });
  const activeCallRef = useRef(activeCall);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const token = typeof window !== 'undefined' ? localStorage.getItem(tokenKey) : null;
  const storedUser = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem(userKey) || 'null') : null;
  const initialPartnerIdRef = useRef(
    typeof window !== 'undefined' ? (new URLSearchParams(window.location.search).get('partnerId') || null) : null
  );

  const sessionProfile = useMemo(() => {
    return role === 'patient' ? getPatientSessionProfile() : getDoctorSessionProfile();
  }, [role]);

  useEffect(() => {
    activeCallRef.current = activeCall;
  }, [activeCall]);

  /* Determine if call buttons should show:
     - For doctor: show if doctor's own plan is gold or diamond
     - For patient: show if the partner doctor's plan is gold or diamond */
  const showCallButtons = useMemo(() => {
    if (role === 'doctor') {
      const plan = String(sessionProfile?.currentPlan || '').toLowerCase();
      return plan === 'gold' || plan === 'diamond';
    }
    return false;
  }, [role, sessionProfile]);

  const myId = String(storedUser?.id || '').trim();

  /* ─── Load conversations ─── */
  const loadConversations = useCallback(async () => {
    if (!token) return;
    try {
      const data = await fetchConversations(token);
      const convs = Array.isArray(data?.conversations) ? data.conversations : [];
      setConversations(convs);
      return convs;
    } catch {
      setConversations([]);
      return [];
    }
  }, [token]);

  /* ─── Initial load ─── */
  useEffect(() => {
    let mounted = true;

    const init = async () => {
      setIsLoadingConversations(true);
      const convs = await loadConversations();
      if (!mounted) return;
      setIsLoadingConversations(false);

      const initId = initialPartnerIdRef.current;
      if (initId && convs) {
        const existing = convs.find((c) => String(c.partnerId || '') === String(initId));
        if (existing) {
          setActivePartner(existing);
        } else {
          setActivePartner({ partnerId: String(initId), partnerName: '' });
        }
        setShowMobileChat(true);
        initialPartnerIdRef.current = null;
      }
    };

    init();
    return () => { mounted = false; };
  }, [loadConversations]);

  /* ─── Socket connection & messages ─── */
  useEffect(() => {
    if (!token) return;

    const socket = connectSocket(token);
    if (!socket) return;

    const handleMessage = (msg) => {
      const partnerId = String(activePartner?.partnerId || '').trim();
      const msgFrom = String(msg.from || '');
      const msgTo = String(msg.to || '');
      const other = msgFrom === myId ? msgTo : msgFrom;

      if (partnerId && (other === partnerId)) {
        setMessages((prev) => {
          const exists = prev.some((m) => (m.id || m._id) === (msg.id || msg._id));
          if (exists) return prev;
          return [...prev, msg];
        });
        
        fetchMessages(token, partnerId).catch(() => {});
      }

      // Always refresh conversations for updated last message
      loadConversations();
    };

    const handleCallIncoming = (payload) => {
      setActiveCall({
        state: 'incoming',
        channelName: payload.channelName,
        callPartnerId: payload.callerId,
        callPartnerName: payload.callerName,
        callPartnerAvatar: payload.callerAvatar
      });
    };

    const handleCallAccepted = async () => {
      if (activeCallRef.current?.state === 'calling') {
        try {
          const cName = activeCallRef.current.channelName;
          const data = await apiRequest(`/agora/token?channelName=${encodeURIComponent(cName)}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setActiveCall({ ...activeCallRef.current, state: 'ongoing', token: data.token });
        } catch {
          setActiveCall({ state: 'idle' });
        }
      }
    };

    const handleCallRejected = () => {
      if (activeCallRef.current?.state === 'calling') {
        setActiveCall({ state: 'idle' });
      }
    };

    const handleCallEnded = () => {
      if (activeCallRef.current?.state !== 'idle') {
        setActiveCall({ state: 'idle' });
      }
    };

    socket.on('chat:message', handleMessage);
    socket.on('call:incoming', handleCallIncoming);
    socket.on('call:accepted', handleCallAccepted);
    socket.on('call:rejected', handleCallRejected);
    socket.on('call:ended', handleCallEnded);

    return () => {
      try {
        const s = getSocket();
        if (s) {
          s.off('chat:message', handleMessage);
          s.off('call:incoming', handleCallIncoming);
          s.off('call:accepted', handleCallAccepted);
          s.off('call:rejected', handleCallRejected);
          s.off('call:ended', handleCallEnded);
        }
      } catch {
        // ignore
      }
    };
  }, [token, activePartner, myId, loadConversations]);

  /* ─── Load messages when partner changes ─── */
  useEffect(() => {
    if (!activePartner || !token) return;
    let mounted = true;

    const load = async () => {
      setIsLoadingMessages(true);
      try {
        const data = await fetchMessages(token, activePartner.partnerId);
        if (!mounted) return;
        setMessages(Array.isArray(data?.messages) ? data.messages : []);
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 80);
      } catch {
        setMessages([]);
      } finally {
        if (mounted) setIsLoadingMessages(false);
      }
    };

    load();
    return () => { mounted = false; };
  }, [activePartner, token]);

  /* ─── Auto scroll on new message ─── */
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 80);
    }
  }, [messages.length]);

  /* ─── Select conversation ─── */
  const handleSelectConversation = (conv) => {
    setActivePartner(conv);
    setConversations(prev => prev.map(c => c.partnerId === conv.partnerId ? { ...c, unreadCount: 0 } : c));
    setMessages([]);
    setShowMobileChat(true);
  };

  /* ─── Send message ─── */
  const sendMessage = async () => {
    if (!text.trim() || !token || !activePartner) return;
    setIsSending(true);

    const payload = { to: activePartner.partnerId, content: String(text || '').trim() };

    try {
      const socket = getSocket();
      if (socket && socket.connected) {
        socket.emit('chat:send', payload, (ack) => {
          if (ack?.ok && ack.message) {
            setMessages((prev) => {
              const exists = prev.some((m) => (m.id || m._id) === (ack.message.id || ack.message._id));
              if (exists) return prev;
              return [...prev, ack.message];
            });
          }
        });
      } else {
        const res = await sendMessageRest(token, payload);
        if (res?.message) {
          setMessages((prev) => [...prev, res.message]);
        }
      }
      setText('');
      loadConversations();
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 80);
    } catch {
      // ignore
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  /* ─── Call Handlers ─── */
  const handleInitiateCall = () => {
    if (!activePartner?.partnerId) return;
    const channelName = `call_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const callerName = sessionProfile?.name || 'Doctor';
    const callerAvatar = sessionProfile?.avatarUrl || '';
    
    getSocket()?.emit('call:initiate', {
      to: activePartner.partnerId,
      channelName,
      callerName,
      callerAvatar
    });
    
    setActiveCall({ state: 'calling', channelName, callPartnerId: activePartner.partnerId });
  };

  const handleAcceptCall = async () => {
    try {
      const cName = activeCall.channelName;
      const data = await apiRequest(`/agora/token?channelName=${encodeURIComponent(cName)}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      getSocket()?.emit('call:accept', { to: activeCall.callPartnerId });
      setActiveCall((prev) => ({ ...prev, state: 'ongoing', token: data.token }));
    } catch {
      setActiveCall({ state: 'idle' });
    }
  };

  const handleRejectCall = () => {
    getSocket()?.emit('call:reject', { to: activeCall.callPartnerId });
    setActiveCall({ state: 'idle' });
  };

  const handleEndCall = () => {
    getSocket()?.emit('call:end', { to: activeCall.callPartnerId });
    setActiveCall({ state: 'idle' });
  };

  /* ─── Filtered conversations ─── */
  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return conversations;
    const q = searchQuery.toLowerCase();
    return conversations.filter((c) =>
      (c.partnerName || '').toLowerCase().includes(q) ||
      (c.lastMessage?.content || '').toLowerCase().includes(q)
    );
  }, [conversations, searchQuery]);

  /* ─── Message groups ─── */
  const messageGroups = useMemo(() => groupMessagesByDate(messages), [messages]);

  /* ─── CSS Styles ─── */
  const styles = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

    .chat-container {
      font-family: 'Inter', sans-serif;
      display: flex;
      height: 78vh;
      background: #ffffff;
      border-radius: 24px;
      overflow: hidden;
      box-shadow: 0 4px 40px rgba(0, 0, 0, 0.06), 0 1px 3px rgba(0, 0, 0, 0.04);
      border: 1px solid #f0f0f2;
    }

    /* ─── Sidebar / Conversation List ─── */
    .chat-sidebar {
      width: 380px;
      min-width: 380px;
      background: #ffffff;
      border-right: 1px solid #f0f0f2;
      display: flex;
      flex-direction: column;
      flex-shrink: 0;
    }

    .chat-sidebar-header {
      padding: 24px 24px 0;
    }

    .chat-sidebar-title {
      font-size: 24px;
      font-weight: 800;
      color: #0f172a;
      margin: 0 0 4px;
      letter-spacing: -0.3px;
    }

    .chat-sidebar-subtitle {
      font-size: 13px;
      color: #94a3b8;
      margin: 0 0 18px;
      font-weight: 400;
    }

    .chat-search-wrapper {
      position: relative;
      margin: 0 24px 12px;
    }

    .chat-search-icon {
      position: absolute;
      left: 14px;
      top: 50%;
      transform: translateY(-50%);
      color: #94a3b8;
      pointer-events: none;
    }

    .chat-search-input {
      width: 100%;
      padding: 11px 16px 11px 42px;
      background: #f8fafc;
      border: 1.5px solid #e2e8f0;
      border-radius: 14px;
      font-size: 13.5px;
      color: #334155;
      outline: none;
      transition: all 0.2s;
      font-family: 'Inter', sans-serif;
    }

    .chat-search-input:focus {
      border-color: #1EBDB8;
      background: #fff;
      box-shadow: 0 0 0 3px rgba(30, 189, 184, 0.08);
    }

    .chat-search-input::placeholder {
      color: #94a3b8;
    }

    .chat-conversation-list {
      flex: 1;
      overflow-y: auto;
      padding: 6px 12px;
    }

    .chat-conversation-list::-webkit-scrollbar {
      width: 4px;
    }

    .chat-conversation-list::-webkit-scrollbar-track {
      background: transparent;
    }

    .chat-conversation-list::-webkit-scrollbar-thumb {
      background: #e2e8f0;
      border-radius: 10px;
    }

    .chat-conv-item {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 14px 14px;
      border-radius: 16px;
      cursor: pointer;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      border: none;
      background: transparent;
      width: 100%;
      text-align: left;
      margin-bottom: 2px;
    }

    .chat-conv-item:hover {
      background: #f1f5f9;
    }

    .chat-conv-item.active {
      background: linear-gradient(135deg, #f0fdfc, #e6faf9);
      border: 1px solid rgba(30, 189, 184, 0.15);
    }

    .chat-conv-avatar-wrap {
      position: relative;
      flex-shrink: 0;
    }

    .chat-conv-avatar {
      width: 52px;
      height: 52px;
      border-radius: 16px;
      object-fit: cover;
      background: #f1f5f9;
    }

    .chat-conv-online-dot {
      position: absolute;
      bottom: 1px;
      right: 1px;
      width: 12px;
      height: 12px;
      background: #22c55e;
      border-radius: 50%;
      border: 2.5px solid #fff;
    }

    .chat-conv-info {
      flex: 1;
      min-width: 0;
    }

    .chat-conv-top-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      margin-bottom: 4px;
    }

    .chat-conv-name {
      font-size: 14.5px;
      font-weight: 600;
      color: #0f172a;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .chat-conv-time {
      font-size: 11.5px;
      color: #94a3b8;
      white-space: nowrap;
      font-weight: 500;
    }

    .chat-conv-preview {
      font-size: 13px;
      color: #64748b;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      line-height: 1.4;
    }

    /* ─── Chat Room ─── */
    .chat-room {
      flex: 1;
      display: flex;
      flex-direction: column;
      background: #fafbfc;
      min-width: 0;
    }

    .chat-room-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 24px;
      background: #ffffff;
      border-bottom: 1px solid #f0f0f2;
      flex-shrink: 0;
    }

    .chat-room-header-left {
      display: flex;
      align-items: center;
      gap: 14px;
    }

    .chat-room-back-btn {
      display: none;
      background: none;
      border: none;
      color: #64748b;
      cursor: pointer;
      padding: 4px;
      border-radius: 8px;
      transition: all 0.15s;
    }

    .chat-room-back-btn:hover {
      background: #f1f5f9;
      color: #0f172a;
    }

    .chat-room-avatar {
      width: 44px;
      height: 44px;
      border-radius: 14px;
      object-fit: cover;
      background: #f1f5f9;
    }

    .chat-room-partner-name {
      font-size: 15.5px;
      font-weight: 700;
      color: #0f172a;
      margin: 0;
    }

    .chat-room-partner-status {
      font-size: 12px;
      color: #22c55e;
      font-weight: 500;
      display: flex;
      align-items: center;
      gap: 5px;
    }

    .chat-room-partner-status::before {
      content: '';
      width: 7px;
      height: 7px;
      background: #22c55e;
      border-radius: 50%;
      display: inline-block;
    }

    .chat-room-header-actions {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .chat-room-action-btn {
      width: 38px;
      height: 38px;
      border-radius: 12px;
      border: none;
      background: #f8fafc;
      color: #64748b;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.15s;
    }

    .chat-room-action-btn:hover {
      background: #f0fdfc;
      color: #1EBDB8;
    }

    /* ─── Messages Area ─── */
    .chat-messages-area {
      flex: 1;
      overflow-y: auto;
      padding: 20px 24px;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .chat-messages-area::-webkit-scrollbar {
      width: 4px;
    }

    .chat-messages-area::-webkit-scrollbar-track {
      background: transparent;
    }

    .chat-messages-area::-webkit-scrollbar-thumb {
      background: #e2e8f0;
      border-radius: 10px;
    }

    .chat-date-separator {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 16px 0 12px;
    }

    .chat-date-badge {
      background: #e2e8f0;
      color: #475569;
      font-size: 11.5px;
      font-weight: 600;
      padding: 5px 14px;
      border-radius: 10px;
      letter-spacing: 0.2px;
    }

    .chat-message-row {
      display: flex;
      align-items: flex-end;
      gap: 10px;
      margin-bottom: 6px;
      animation: chatMsgIn 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .chat-message-row.sent {
      justify-content: flex-end;
    }

    .chat-message-row.received {
      justify-content: flex-start;
    }

    .chat-msg-avatar {
      width: 30px;
      height: 30px;
      border-radius: 10px;
      object-fit: cover;
      flex-shrink: 0;
      margin-bottom: 2px;
    }

    .chat-msg-bubble {
      max-width: 65%;
      padding: 12px 16px;
      border-radius: 18px;
      position: relative;
      line-height: 1.5;
    }

    .chat-msg-bubble.sent {
      background: linear-gradient(135deg, #1EBDB8, #17a5a1);
      color: #fff;
      border-bottom-right-radius: 6px;
    }

    .chat-msg-bubble.received {
      background: #fff;
      color: #1e293b;
      border: 1px solid #f0f0f2;
      border-bottom-left-radius: 6px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
    }

    .chat-msg-text {
      font-size: 14px;
      word-wrap: break-word;
      white-space: pre-wrap;
    }

    .chat-msg-time {
      font-size: 10.5px;
      margin-top: 5px;
      text-align: right;
      font-weight: 500;
    }

    .chat-msg-bubble.sent .chat-msg-time {
      color: rgba(255, 255, 255, 0.7);
    }

    .chat-msg-bubble.received .chat-msg-time {
      color: #94a3b8;
    }

    /* ─── Composer ─── */
    .chat-composer {
      padding: 16px 24px;
      background: #ffffff;
      border-top: 1px solid #f0f0f2;
      flex-shrink: 0;
    }

    .chat-composer-inner {
      display: flex;
      align-items: center;
      gap: 10px;
      background: #f8fafc;
      border: 1.5px solid #e2e8f0;
      border-radius: 18px;
      padding: 6px 8px 6px 6px;
      transition: all 0.2s;
    }

    .chat-composer-inner:focus-within {
      border-color: #1EBDB8;
      box-shadow: 0 0 0 3px rgba(30, 189, 184, 0.08);
      background: #fff;
    }

    .chat-composer-icon-btn {
      width: 36px;
      height: 36px;
      border-radius: 12px;
      border: none;
      background: transparent;
      color: #94a3b8;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      flex-shrink: 0;
      transition: all 0.15s;
    }

    .chat-composer-icon-btn:hover {
      color: #64748b;
      background: #f1f5f9;
    }

    .chat-composer-input {
      flex: 1;
      border: none;
      outline: none;
      font-size: 14px;
      color: #1e293b;
      background: transparent;
      font-family: 'Inter', sans-serif;
      padding: 8px 4px;
      resize: none;
    }

    .chat-composer-input::placeholder {
      color: #94a3b8;
    }

    .chat-composer-send-btn {
      width: 42px;
      height: 42px;
      border-radius: 14px;
      border: none;
      background: linear-gradient(135deg, #1EBDB8, #17a5a1);
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      flex-shrink: 0;
      transition: all 0.2s;
      box-shadow: 0 2px 8px rgba(30, 189, 184, 0.25);
    }

    .chat-composer-send-btn:hover:not(:disabled) {
      transform: scale(1.05);
      box-shadow: 0 4px 16px rgba(30, 189, 184, 0.35);
    }

    .chat-composer-send-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      transform: none;
    }

    /* ─── Empty State ─── */
    .chat-empty-state {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 16px;
      color: #94a3b8;
    }

    .chat-empty-title {
      font-size: 18px;
      font-weight: 700;
      color: #334155;
      margin: 0;
    }

    .chat-empty-text {
      font-size: 14px;
      color: #94a3b8;
      margin: 0;
      text-align: center;
      max-width: 280px;
      line-height: 1.5;
    }

    .chat-no-conversations {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px 24px;
      color: #94a3b8;
      text-align: center;
      gap: 8px;
    }

    .chat-loading {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 40px;
      color: #94a3b8;
    }

    .chat-loading-dots {
      display: flex;
      gap: 4px;
    }

    .chat-loading-dots span {
      width: 8px;
      height: 8px;
      background: #1EBDB8;
      border-radius: 50%;
      animation: chatDotBounce 1.4s infinite ease-in-out both;
    }

    .chat-loading-dots span:nth-child(1) { animation-delay: -0.32s; }
    .chat-loading-dots span:nth-child(2) { animation-delay: -0.16s; }

    @keyframes chatDotBounce {
      0%, 80%, 100% { transform: scale(0); }
      40% { transform: scale(1); }
    }

    @keyframes chatMsgIn {
      from {
        opacity: 0;
        transform: translateY(8px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    /* ─── Responsive ─── */
    @media (max-width: 768px) {
      .chat-container {
        height: calc(100vh - 120px);
        border-radius: 16px;
      }

      .chat-sidebar {
        width: 100%;
        min-width: 100%;
      }

      .chat-sidebar.mobile-hidden {
        display: none;
      }

      .chat-room.mobile-hidden {
        display: none;
      }

      .chat-room {
        width: 100%;
      }

      .chat-room-back-btn {
        display: flex;
      }

      .chat-msg-bubble {
        max-width: 82%;
      }
    }

    @media (min-width: 769px) {
      .chat-sidebar.mobile-hidden {
        display: flex;
      }

      .chat-room.mobile-hidden {
        display: flex;
      }
    }
  `;

  /* ─── Render ─── */
  return (
    <div className="relative w-full h-full pb-8">
      <style>{styles}</style>
      
      {activeCall.state === 'incoming' && (
        <IncomingCallModal 
          callerName={activeCall.callPartnerName}
          callerAvatar={activeCall.callPartnerAvatar}
          onAccept={handleAcceptCall}
          onReject={handleRejectCall}
        />
      )}
      
      {activeCall.state === 'ongoing' && activeCall.token && (
        <VideoRoom 
          channelName={activeCall.channelName}
          token={activeCall.token}
          appId={import.meta.env.VITE_AGORA_APP_ID}
          onEndCall={handleEndCall}
        />
      )}
      
      {activeCall.state === 'calling' && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#1F2432] text-white rounded-[24px]">
           <div className="w-16 h-16 rounded-full border-4 border-[#1EBDB8] border-t-transparent animate-spin mb-6"></div>
           <h3 className="text-2xl font-bold mb-2">Calling {activePartner?.partnerName}...</h3>
           <p className="text-white/60 mb-8">Waiting for them to answer</p>
           <button onClick={handleEndCall} className="px-6 py-3 bg-red-500 rounded-full font-bold shadow-lg hover:bg-red-600 transition">Cancel Call</button>
        </div>
      )}

      <div className="chat-container" id="chat-container">

        {/* ─── Conversation List ─── */}
        <div className={`chat-sidebar ${showMobileChat ? 'mobile-hidden' : ''}`}>
          <div className="chat-sidebar-header">
            <h2 className="chat-sidebar-title">Messages</h2>
            <p className="chat-sidebar-subtitle">
              {conversations.length > 0
                ? `${conversations.length} conversation${conversations.length !== 1 ? 's' : ''}`
                : 'Your conversations will appear here'}
            </p>
          </div>

          <div className="chat-search-wrapper">
            <span className="chat-search-icon"><SearchIcon /></span>
            <input
              id="chat-search-input"
              type="text"
              className="chat-search-input"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="chat-conversation-list">
            {isLoadingConversations ? (
              <div className="chat-loading">
                <div className="chat-loading-dots">
                  <span /><span /><span />
                </div>
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="chat-no-conversations">
                <EmptyChatIcon />
                <p style={{ fontSize: '14px', fontWeight: 600, color: '#475569', margin: 0 }}>
                  {searchQuery ? 'No matching conversations' : 'No conversations yet'}
                </p>
                <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0 }}>
                  {searchQuery ? 'Try a different search term' : 'Start chatting with your patients'}
                </p>
              </div>
            ) : (
              filteredConversations.map((c) => (
                <button
                  key={c.partnerId}
                  id={`chat-conv-${c.partnerId}`}
                  type="button"
                  className={`chat-conv-item ${activePartner?.partnerId === c.partnerId ? 'active' : ''}`}
                  onClick={() => handleSelectConversation(c)}
                >
                  <div className="chat-conv-avatar-wrap">
                    <img
                      src={buildAvatar(c.partnerName || 'User', '1EBDB8', c.partnerAvatar)}
                      alt={c.partnerName || 'User'}
                      className="chat-conv-avatar"
                    />
                    <div className="chat-conv-online-dot" />
                  </div>
                  <div className="chat-conv-info">
                    <div className="chat-conv-top-row">
                      <span className="chat-conv-name">{c.partnerName || c.partnerId}</span>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                        <span className="chat-conv-time" style={{ margin: 0 }}>
                          {formatTime(c.lastMessage?.createdAt)}
                        </span>
                        {c.unreadCount > 0 && activePartner?.partnerId !== c.partnerId && (
                          <span style={{ backgroundColor: '#1EBDB8', color: '#fff', fontSize: '10px', fontWeight: 'bold', padding: '2px 6px', borderRadius: '10px', minWidth: '18px', textAlign: 'center', lineHeight: 1 }}>
                            {c.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="chat-conv-preview">
                      {c.lastMessage?.content || 'No messages yet'}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* ─── Chat Room ─── */}
        <div className={`chat-room ${!showMobileChat && !activePartner ? '' : ''} ${!showMobileChat ? 'mobile-hidden' : ''}`}>
          {activePartner ? (
            <>
              {/* Header */}
              <div className="chat-room-header">
                <div className="chat-room-header-left">
                  <button
                    type="button"
                    className="chat-room-back-btn"
                    id="chat-back-btn"
                    onClick={() => setShowMobileChat(false)}
                  >
                    <BackArrowIcon />
                  </button>
                  <img
                    src={buildAvatar(activePartner.partnerName || 'User', '6B7280', activePartner.partnerAvatar)}
                    alt={activePartner.partnerName || 'User'}
                    className="chat-room-avatar"
                  />
                  <div>
                    <p className="chat-room-partner-name">
                      {activePartner.partnerName || activePartner.partnerId}
                    </p>
                    <div className="chat-room-partner-status">Online</div>
                  </div>
                </div>
                <div className="chat-room-header-actions">
                  {role === 'doctor' && showCallButtons && (
                    <button type="button" onClick={handleInitiateCall} className="chat-room-action-btn" title="Video Call">
                      <VideoIcon />
                    </button>
                  )}
                </div>
              </div>

              {/* Messages */}
              <div className="chat-messages-area" id="chat-messages-area">
                {isLoadingMessages ? (
                  <div className="chat-loading" style={{ flex: 1 }}>
                    <div className="chat-loading-dots">
                      <span /><span /><span />
                    </div>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="chat-empty-state">
                    <EmptyChatIcon />
                    <p className="chat-empty-title">Start the conversation</p>
                    <p className="chat-empty-text">
                      Send a message to begin chatting with {activePartner.partnerName || 'this user'}
                    </p>
                  </div>
                ) : (
                  messageGroups.map((item) => {
                    if (item.type === 'date') {
                      return (
                        <div key={item.key} className="chat-date-separator">
                          <span className="chat-date-badge">{item.label}</span>
                        </div>
                      );
                    }

                    const m = item.data;
                    const fromMe = String(m.from || '') === myId;

                    return (
                      <div key={item.key} className={`chat-message-row ${fromMe ? 'sent' : 'received'}`}>
                        {!fromMe && (
                          <img
                            src={buildAvatar(activePartner.partnerName || 'User', '1EBDB8', activePartner.partnerAvatar)}
                            alt="avatar"
                            className="chat-msg-avatar"
                          />
                        )}
                        <div className={`chat-msg-bubble ${fromMe ? 'sent' : 'received'}`}>
                          <div className="chat-msg-text">{m.content}</div>
                          <div className="chat-msg-time">{formatMessageTime(m.createdAt)}</div>
                        </div>
                        {fromMe && (
                          <img
                            src={buildAvatar(sessionProfile.name || 'Me', '1EBDB8', sessionProfile.avatarUrl)}
                            alt="avatar"
                            className="chat-msg-avatar"
                          />
                        )}
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Composer */}
              <div className="chat-composer">
                <div className="chat-composer-inner">
                  <input
                    ref={inputRef}
                    id="chat-message-input"
                    type="text"
                    className="chat-composer-input"
                    placeholder="Type a message..."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={handleKeyDown}
                  />
                  <button
                    type="button"
                    id="chat-send-btn"
                    className="chat-composer-send-btn"
                    onClick={sendMessage}
                    disabled={isSending || !text.trim()}
                    title="Send"
                  >
                    <SendIcon />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="chat-empty-state">
              <div style={{
                width: 100,
                height: 100,
                borderRadius: 28,
                background: 'linear-gradient(135deg, #f0fdfc, #e6faf9)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 8
              }}>
                <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#1EBDB8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <p className="chat-empty-title">Welcome to Messages</p>
              <p className="chat-empty-text">
                Select a conversation from the left to start chatting, or wait for a new message to arrive.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
