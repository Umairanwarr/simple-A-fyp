import React, { useState, useEffect, useMemo, useRef } from 'react';
import ReactDOM from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { 
  fetchStoreMediaLibrary, 
  uploadStoreMedia, 
  deleteStoreMedia 
} from '../../services/authApi';

const STATUS_CFG = {
  pending:  { label: 'Pending',  bg: 'bg-amber-500',   text: 'text-white' },
  approved: { label: 'Approved', bg: 'bg-emerald-500', text: 'text-white' },
  rejected: { label: 'Rejected', bg: 'bg-rose-500',    text: 'text-white' }
};

const fmtDate = (d) => {
  if (!d) return 'N/A';
  const p = new Date(d);
  if (isNaN(p)) return 'N/A';
  return p.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const fmtBytes = (b) => {
  if (!b) return '';
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / (1024 * 1024)).toFixed(1)} MB`;
};

export default function StoreMedia() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [mediaItems, setMediaItems] = useState([]);
  const [usage, setUsage] = useState({ imageCount: 0, videoCount: 0 });
  const [limits, setLimits] = useState({ maxImages: 2, maxVideos: 0 });
  const [currentPlan, setCurrentPlan] = useState('platinum');
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [deletingId, setDeletingId] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  // Lightbox
  const [lightbox, setLightbox] = useState(null); // { url, type }

  // Delete confirm
  const [itemToDelete, setItemToDelete] = useState(null);

  useEffect(() => { loadLibrary(); }, []);

  const loadLibrary = async (silent = false) => {
    try {
      if (!silent) setIsLoading(true);
      const token = localStorage.getItem('medicalStoreToken');
      const data = await fetchStoreMediaLibrary(token);
      setMediaItems(Array.isArray(data.media) ? data.media : []);
      setUsage(data.usage || { imageCount: 0, videoCount: 0 });
      setLimits(data.limits || { maxImages: 2, maxVideos: 0 });
      setCurrentPlan(data.currentPlan || 'platinum');
    } catch (err) {
      toast.error(err.message || 'Could not load media library');
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  const handleUploadClick = () => {
    if (isUploading) return;
    fileInputRef.current?.click();
  };

  const handleFileSelected = async (e) => {
    const file = e.target?.files?.[0];
    if (!file) return;
    try {
      setIsUploading(true);
      const token = localStorage.getItem('medicalStoreToken');
      const data = await uploadStoreMedia(token, file);
      toast.success(data.message || 'Media uploaded successfully');
      await loadLibrary(true);
    } catch (err) {
      const errMsg = String(err.message || '');
      if (errMsg.toLowerCase().includes('limit reached')) {
        toast.info(`${errMsg} Please update your plan to upload more media.`);
        setTimeout(() => navigate('/store/dashboard/subscriptions'), 2000);
      } else {
        toast.error(errMsg || 'Could not upload media');
      }
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    try {
      setDeletingId(String(itemToDelete.id));
      const token = localStorage.getItem('medicalStoreToken');
      await deleteStoreMedia(token, itemToDelete.id);
      toast.success('Media removed successfully');
      setMediaItems(prev => prev.filter(m => m.id !== itemToDelete.id));
      setItemToDelete(null);
    } catch (err) {
      toast.error(err.message || 'Could not delete media');
    } finally {
      setDeletingId('');
    }
  };

  const filtered = useMemo(() =>
    activeFilter === 'all' ? mediaItems : mediaItems.filter(m => String(m.moderationStatus || '').toLowerCase() === activeFilter),
    [mediaItems, activeFilter]
  );

  const planLabel = currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1);
  const imgLimit = limits.maxImages > 100 ? 'Unlimited' : limits.maxImages;
  const vidLimit = limits.maxVideos > 100 ? 'Unlimited' : limits.maxVideos;

  return (
    <div className="space-y-6">
      <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
          <div>
            <h3 className="text-[28px] font-extrabold text-[#1F2432] tracking-tight">Media Manager</h3>
            <p className="text-[14px] font-medium text-[#6B7280] mt-1 space-x-1">
              <span>Current Plan: </span>
              <span className="font-bold text-[#1F2432]">{planLabel}</span>
            </p>
            <p className="text-[13px] text-[#9CA3AF] mt-1.5 flex items-center gap-2">
              <span className="flex items-center gap-1.5">
                Images: <span className="font-bold text-[#4B5563]">{usage.imageCount}/{imgLimit}</span>
              </span>
              <span className="w-1 h-1 bg-gray-300 rounded-full" />
              <span className="flex items-center gap-1.5">
                Videos: <span className="font-bold text-[#4B5563]">{usage.videoCount}/{vidLimit}</span>
              </span>
            </p>
          </div>

          <button
            onClick={handleUploadClick}
            disabled={isUploading}
            className="flex items-center gap-2.5 bg-[#1EBDB8] hover:bg-[#1CAAAE] text-white px-6 py-3 rounded-2xl text-[15px] font-bold transition-all shadow-xl shadow-[#1EBDB8]/20 disabled:opacity-60 disabled:cursor-not-allowed whitespace-nowrap active:scale-[0.98] self-start lg:self-center"
          >
            {isUploading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15"/></svg>
            )}
            {isUploading ? 'Uploading...' : 'Upload Media'}
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,video/mp4,video/webm,video/quicktime"
          onChange={handleFileSelected}
          className="hidden"
        />

        {/* Info banner - Match Doctor Design */}
        <div className="mb-8 rounded-3xl border border-[#1EBDB8]/10 bg-[#F0FDFA] p-6 flex items-start gap-4">
          <div className="w-10 h-10 rounded-2xl bg-[#1EBDB8]/10 flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 text-[#1EBDB8]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          </div>
          <div>
            <p className="text-[14px] font-bold text-[#0F766E] leading-relaxed">
              Platinum: 2 images. Gold: 5 images + 1 video. Diamond: unlimited media.
            </p>
            <p className="text-[13px] font-medium text-[#14B8A6] mt-1 opacity-80">
              Every upload goes to admin moderation. You will get a notification when it is approved or rejected.
            </p>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex flex-wrap gap-2 mb-5">
          {['all', 'pending', 'approved', 'rejected'].map(f => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-4 py-1.5 rounded-full text-[12px] font-bold capitalize transition-all ${
                activeFilter === f
                  ? 'bg-[#1EBDB8] text-white'
                  : 'bg-gray-100 text-[#4B5563] hover:bg-gray-200'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="rounded-2xl border border-gray-100 bg-gray-50 px-4 py-12 text-center">
            <div className="w-8 h-8 border-[3px] border-[#1EBDB8]/20 border-t-[#1EBDB8] rounded-full animate-spin mx-auto mb-3" />
            <p className="text-[14px] font-medium text-[#6B7280]">Loading media library...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-[#FAFAFA] px-4 py-16 text-center">
             <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
            </div>
            <p className="text-[14px] font-medium text-[#6B7280]">No media found in this status.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {filtered.map(item => {
              const statusCfg = STATUS_CFG[item.moderationStatus] || STATUS_CFG.pending;
              return (
                <div key={item.id} className="bg-[#FAFAFA] rounded-2xl overflow-hidden border border-gray-100 group transition-all hover:shadow-md">
                  {/* Preview */}
                  <div
                    className="relative h-52 bg-[#1F2432]/5 cursor-pointer overflow-hidden"
                    onClick={() => setLightbox({ url: item.url, type: item.mediaType })}
                  >
                    {item.mediaType === 'video' ? (
                      <video src={item.url} className="w-full h-full object-cover" />
                    ) : (
                      <img src={item.url} alt={item.originalName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    )}

                    {item.mediaType === 'video' && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                        <div className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center">
                          <svg className="w-5 h-5 text-[#1F2432] ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                        </div>
                      </div>
                    )}

                    <span className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-bold ${statusCfg.bg} ${statusCfg.text}`}>
                      {statusCfg.label}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="p-4 space-y-3">
                    <div>
                      <p className="text-[14px] font-bold text-[#1F2432] truncate">{item.originalName}</p>
                      <p className="text-[12px] text-[#6B7280] font-medium mt-0.5">
                        {fmtBytes(item.bytes)} • {fmtDate(item.uploadedAt)}
                      </p>
                    </div>

                    {item.moderationNote && (
                      <p className="text-[11px] text-[#6B7280] bg-white rounded-lg border border-gray-100 px-2.5 py-2">
                        Note: {item.moderationNote}
                      </p>
                    )}

                    <button
                      onClick={() => setItemToDelete(item)}
                      disabled={deletingId === item.id}
                      className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-[12px] font-bold text-rose-500 bg-rose-50 hover:bg-rose-100 border border-rose-100 transition-colors disabled:opacity-50"
                    >
                      {deletingId === item.id ? (
                        <div className="w-4 h-4 border-2 border-rose-300 border-t-rose-500 rounded-full animate-spin" />
                      ) : (
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                      )}
                      Delete Media
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ─── Lightbox ─── */}
      {lightbox && ReactDOM.createPortal(
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/85 p-4 cursor-zoom-out"
          onClick={() => setLightbox(null)}
        >
          <button onClick={() => setLightbox(null)} className="absolute top-5 right-5 p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
          {lightbox.type === 'video' ? (
            <video
              src={lightbox.url}
              controls
              autoPlay
              className="max-w-full max-h-[90vh] rounded-2xl shadow-2xl"
              onClick={e => e.stopPropagation()}
            />
          ) : (
            <img
              src={lightbox.url}
              alt="Media preview"
              className="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-2xl"
              onClick={e => e.stopPropagation()}
            />
          )}
        </div>,
        document.body
      )}

      {/* ─── Delete Confirm Modal ─── */}
      {itemToDelete && ReactDOM.createPortal(
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-[#1F2432]/50 backdrop-blur-sm">
          <div className="bg-white rounded-[28px] w-full max-w-sm shadow-2xl p-7 text-center">
            <div className="w-16 h-16 bg-rose-50 rounded-[22px] flex items-center justify-center mx-auto mb-5">
              <svg className="w-8 h-8 text-rose-500" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
            </div>
            <h3 className="text-[20px] font-bold text-[#1F2432] mb-2">Remove Media?</h3>
            <p className="text-[14px] text-[#6B7280] mb-7 px-2">
              <span className="font-semibold text-[#1F2432]">{itemToDelete.originalName}</span> will be permanently removed.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setItemToDelete(null)}
                disabled={!!deletingId}
                className="flex-1 py-2.5 text-[13px] font-bold text-[#6B7280] bg-[#F3F4F6] rounded-xl hover:bg-[#E5E7EB] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={!!deletingId}
                className="flex-1 flex justify-center items-center py-2.5 text-[13px] font-bold text-white bg-rose-600 rounded-xl hover:bg-rose-700 transition-colors shadow-lg shadow-rose-600/20 active:scale-[0.97]"
              >
                {deletingId ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Remove'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
