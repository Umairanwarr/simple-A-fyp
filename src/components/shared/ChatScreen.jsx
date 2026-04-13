import React, { useEffect, useMemo, useRef, useState } from 'react';
import { fetchConversations, fetchMessages, sendMessageRest } from '../../services/chatApi';
import { connectSocket, getSocket, disconnectSocket } from '../../services/socket';
import { getPatientSessionProfile, getDoctorSessionProfile } from '../../utils/authSession';

function buildAvatar(name, background = '1EBDB8') {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${background}&color=fff&bold=true`;
}

export default function ChatScreen({ role = 'patient', tokenKey = 'patientToken', userKey = 'patient' }) {
  const [conversations, setConversations] = useState([]);
  const [activePartner, setActivePartner] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);

  const token = typeof window !== 'undefined' ? localStorage.getItem(tokenKey) : null;
  const storedUser = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem(userKey) || 'null') : null;
  const initialPartnerId = typeof window !== 'undefined' ? (new URLSearchParams(window.location.search).get('partnerId') || null) : null;

  const sessionProfile = useMemo(() => {
    return role === 'patient' ? getPatientSessionProfile() : getDoctorSessionProfile();
  }, [role]);

  useEffect(() => {
    let mounted = true;

    const loadConversations = async () => {
      if (!token) return;

      try {
        const data = await fetchConversations(token);
        if (!mounted) return;
        const convs = Array.isArray(data?.conversations) ? data.conversations : [];
        setConversations(convs);

        // If initialPartnerId provided via URL, open that conversation (or seed partner id)
        if (initialPartnerId) {
          const existing = convs.find((c) => String(c.partnerId || '') === String(initialPartnerId));
          if (existing) {
            setActivePartner(existing);
          } else {
            setActivePartner({ partnerId: String(initialPartnerId), partnerName: '' });
          }
        }
      } catch (err) {
        setConversations([]);
      }
    };

    loadConversations();

    const socket = connectSocket(token);

    if (socket) {
      socket.on('chat:message', (msg) => {
        // If active partner matches, append, otherwise refresh conversations
        const partnerId = String(activePartner?.partnerId || '').trim();
        const other = String((String(msg.from || '') === String(storedUser?.id || '')) ? msg.to : msg.from);

        if (partnerId && (other === partnerId || String(msg.from) === partnerId)) {
          setMessages((prev) => [...prev, msg]);
        } else {
          // refresh conversations
          fetchConversations(token).then((d) => {
            setConversations(Array.isArray(d?.conversations) ? d.conversations : []);
          }).catch(() => {});
        }
      });
    }

    return () => {
      mounted = false;
      try {
        const s = getSocket();
        if (s) {
          s.off('chat:message');
        }
      } catch (err) {
        // ignore
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, role, activePartner]);

  useEffect(() => {
    if (!activePartner) return;

    let mounted = true;

    const load = async () => {
      if (!token) return;
      try {
        const data = await fetchMessages(token, activePartner.partnerId);
        if (!mounted) return;
        setMessages(Array.isArray(data?.messages) ? data.messages : []);
        // scroll to bottom
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
      } catch (err) {
        setMessages([]);
      }
    };

    load();

    return () => { mounted = false; };
  }, [activePartner, token]);

  const handleSelectConversation = (conv) => {
    setActivePartner(conv);
    setMessages([]);
  };

  const sendMessage = async () => {
    if (!text.trim() || !token || !activePartner) return;

    setIsSending(true);

    const payload = {
      to: activePartner.partnerId,
      content: String(text || '').trim()
    };

    try {
      const socket = getSocket();
      if (socket && socket.connected) {
        socket.emit('chat:send', payload, (ack) => {
          if (ack && ack.ok && ack.message) {
            setMessages((prev) => [...prev, ack.message]);
          }
        });
      } else {
        // fallback to REST
        const res = await sendMessageRest(token, payload);
        if (res?.message) {
          setMessages((prev) => [...prev, res.message]);
        }
      }

      setText('');
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    } catch (err) {
      // ignore send errors for now
    } finally {
      setIsSending(false);
    }
  };

  const renderMessage = (m) => {
    const fromMe = String(m.from || '') === String(storedUser?.id || '');

    return (
      <div key={m.id || m._id || Math.random()} className={`flex items-end gap-3 ${fromMe ? 'justify-end' : 'justify-start'}`}>
        {!fromMe && (
          <img src={buildAvatar(m.fromName || activePartner.partnerName || 'User')} alt="avatar" className="w-8 h-8 rounded-full object-cover" />
        )}

        <div className={`${fromMe ? 'bg-[#1EBDB8] text-white rounded-xl rounded-tr-none' : 'bg-[#E6F1FF] text-[#0F172A] rounded-xl rounded-tl-none'} px-4 py-2 max-w-[70%]`}> 
          <div className="text-[14px] break-words">{m.content}</div>
          <div className="text-[10px] text-white/70 mt-1 text-right">{new Date(m.createdAt).toLocaleString()}</div>
        </div>

        {fromMe && (
          <img src={buildAvatar(sessionProfile.name || 'Me')} alt="avatar" className="w-8 h-8 rounded-full object-cover" />
        )}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-[18px] border border-gray-100 p-4 flex h-[72vh]">
      <div className="w-[300px] border-r border-gray-100 pr-4 overflow-y-auto">
        <div className="mb-4">
          <h3 className="text-[18px] font-bold">Chats</h3>
          <p className="text-sm text-gray-500">Recent conversations</p>
        </div>

        {conversations.map((c) => (
          <button key={c.partnerId} type="button" onClick={() => handleSelectConversation(c)} className={`flex items-center gap-3 w-full text-left py-3 px-2 rounded-lg ${activePartner?.partnerId === c.partnerId ? 'bg-[#F3F9F9]' : 'hover:bg-gray-50'}`}>
            <img src={buildAvatar(c.partnerName || 'User')} alt="avatar" className="w-12 h-12 rounded-full object-cover" />
            <div className="flex-1">
              <div className="flex justify-between items-center">
                <div className="font-semibold text-[#0F172A]">{c.partnerName || c.partnerId}</div>
                <div className="text-xs text-gray-400">{c.lastMessage?.createdAt ? new Date(c.lastMessage.createdAt).toLocaleTimeString() : ''}</div>
              </div>
              <div className="text-sm text-gray-500 truncate">{c.lastMessage?.content || ''}</div>
            </div>
          </button>
        ))}
      </div>

      <div className="flex-1 flex flex-col px-6">
        {activePartner ? (
          <>
            <div className="flex items-center gap-4 border-b pb-3 mb-3">
              <img src={buildAvatar(activePartner.partnerName || 'User', '6B7280')} alt="avatar" className="w-12 h-12 rounded-full object-cover" />
              <div>
                <div className="font-bold">{activePartner.partnerName || activePartner.partnerId}</div>
                <div className="text-sm text-gray-500">Online</div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto pb-4 space-y-3">
              {messages.map((m) => renderMessage(m))}
              <div ref={messagesEndRef} />
            </div>

            <div className="mt-4">
              <div className="flex items-center gap-3">
                <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Write Something..." className="flex-1 px-4 py-3 rounded-xl border border-gray-200" />
                <button type="button" onClick={sendMessage} disabled={isSending || !text.trim()} className="px-4 py-3 rounded-full bg-[#1EBDB8] text-white">{isSending ? 'Sending...' : 'Send'}</button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">Select a conversation to start chatting</div>
        )}
      </div>
    </div>
  );
}
