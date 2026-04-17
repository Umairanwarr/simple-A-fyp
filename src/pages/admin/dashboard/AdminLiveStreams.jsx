import React, { useState, useEffect, useCallback } from 'react';
import AdminLayout from './AdminLayout';
import { fetchActiveStreams, joinLiveStream } from '../../../services/authApi';
import LiveStreamRoom from '../../../components/shared/LiveStreamRoom';
import { toast } from 'react-toastify';

export default function AdminLiveStreams() {
  const [streams, setStreams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeStream, setActiveStream] = useState(null); // { stream, token, channelName }

  const loadStreams = useCallback(async () => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) return;
      const data = await fetchActiveStreams(token);
      setStreams(data.streams || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStreams();
    const interval = setInterval(loadStreams, 10000); // Polling every 10s
    return () => clearInterval(interval);
  }, [loadStreams]);

  const handleJoinStream = async (stream) => {
    try {
      const token = localStorage.getItem('adminToken');
      const data = await joinLiveStream(token, stream._id);
      setActiveStream({
        stream,
        token: data.token,
        channelName: data.channelName
      });
      toast.success('Joined as Admin');
    } catch (err) {
      toast.error(err.message || 'Failed to join stream');
    }
  };

  const handleLeaveStream = () => {
    setActiveStream(null);
    loadStreams(); // Refresh to check statuses
  };

  if (activeStream) {
    return (
      <LiveStreamRoom
        streamId={activeStream.stream._id}
        channelName={activeStream.channelName}
        token={activeStream.token}
        appId={import.meta.env.VITE_AGORA_APP_ID}
        isHost={false}
        isAdmin={true}
        streamTitle={activeStream.stream.title || 'Live Stream'}
        hostName={activeStream.stream.doctorName || 'Doctor'}
        onLeave={handleLeaveStream}
      />
    );
  }

  return (
    <AdminLayout>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Active Live Streams</h2>
          <p className="text-gray-500">Monitor and manage all current live broadcast sessions.</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-10 h-10 border-4 border-[#1EBDB8] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : streams.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-100">
            <span className="text-4xl mb-4 block">📡</span>
            <h3 className="text-lg font-bold text-gray-900 mb-1">No Active Streams</h3>
            <p className="text-gray-500">There are no live broadcasts at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {streams.map(stream => (
              <div key={stream._id} className="relative bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-lg transition-all overflow-hidden flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="flex items-center gap-2 bg-red-50 text-red-500 text-xs font-bold px-3 py-1 rounded-full border border-red-100">
                      <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" /> LIVE
                    </span>
                    <span className="text-xs text-gray-400 font-medium">Host: {stream.doctorName}</span>
                  </div>
                  <h4 className="text-lg font-bold text-gray-900 mb-2 whitespace-nowrap overflow-hidden text-ellipsis px-1">{stream.title}</h4>
                  {stream.description && (
                    <p className="text-sm text-gray-500 mb-4 line-clamp-2 min-h-[40px]">
                      {stream.description}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => handleJoinStream(stream)}
                  className="w-full bg-[#1EBDB8] hover:bg-[#19a5a1] text-white font-bold py-3 rounded-xl transition-colors shadow-sm mt-4"
                >
                  Join Stream (Admin)
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
