import React, { useState, useEffect, useMemo, useRef } from 'react';
import ReactDOM from 'react-dom';
import { toast } from 'react-toastify';

const API = 'http://localhost:3002/api/store-media';

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
  const fileInputRef = useRef(null);
  const [mediaItems, setMediaItems] = useState([]);
  const [usage, setUsage] = useState({ imageCount: 0, videoCount: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
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
      const res = await fetch(API, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setMediaItems(Array.isArray(data.media) ? data.media : []);
      setUsage(data.usage || { imageCount: 0, videoCount: 0 });
    } catch {
      toast.error('Could not load media library.');
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
      const fd = new FormData();
      fd.append('media', file);
      const res = await fetch(API, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Upload failed');
      toast.success(data.message || 'Media uploaded — pending admin review');
      await loadLibrary(true);
    } catch (err) {
      toast.error(err.message || 'Could not upload media');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    try {
      setDeletingId(itemToDelete.id);
      const token = localStorage.getItem('medicalStoreToken');
      const res = await fetch(`${API}/${itemToDelete.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Delete failed');
      toast.success('Media removed');
      setMediaItems(prev => prev.filter(m => m.id !== itemToDelete.id));
      setItemToDelete(null);
    } catch (err) {
      toast.error(err.message || 'Could not delete media');
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = useMemo(() =>
    activeFilter === 'all' ? mediaItems : mediaItems.filter(m => m.moderationStatus === activeFilter),
    [mediaItems, activeFilter]
  );

  const imgCount  = mediaItems.filter(m => m.mediaType === 'image').length;
  const vidCount  = mediaItems.filter(m => m.mediaType === 'video').length;

  return (
    <div className="space-y-6">

      {/* ─── Header Stats ─── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
        {[
          { label: 'Total Media',  value: isLoading ? '--' : mediaItems.length, icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z', bg: 'bg-[#ECFCFB] text-[#1EBDB8]' },
          { label: 'Images',       value: isLoading ? '--' : imgCount,           icon: 'M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z', bg: 'bg-blue-50 text-blue-600' },
          { label: 'Videos',       value: isLoading ? '--' : vidCount,           icon: 'M15 10l4.553-2.069A1 1 0 0121 8.87v6.26a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z', bg: 'bg-purple-50 text-purple-600' },
          { label: 'Approved',     value: isLoading ? '--' : mediaItems.filter(m => m.moderationStatus === 'approved').length, icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', bg: 'bg-emerald-50 text-emerald-600' }
        ].map(s => (
          <div key={s.label} className="bg-white p-5 sm:p-6 rounded-[24px] shadow-sm border border-gray-100 hover:border-[#1EBDB8]/35 transition-colors group">
            <div className="flex items-start justify-between mb-3">
              <p className="text-[11px] sm:text-[12px] font-bold text-[#9CA3AF] uppercase tracking-wider">{s.label}</p>
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${s.bg} group-hover:scale-110 transition-transform`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d={s.icon}/></svg>
              </div>
            </div>
            <p className="text-[22px] sm:text-[26px] leading-tight font-bold text-[#1F2432]">{s.value}</p>
          </div>
        ))}
      </div>

      {/* ─── Main Panel ─── */}
      <div className="bg-white rounded-[30px] shadow-sm border border-gray-100 overflow-hidden">

        {/* Toolbar */}
        <div className="px-5 sm:px-8 pt-6 sm:pt-8 pb-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="text-[20px] sm:text-[22px] font-bold text-[#1F2432]">Media Library</h3>
            <p className="text-[13px] text-[#9CA3AF] mt-0.5">Uploads go to admin review before going live</p>
          </div>
          <button
            onClick={handleUploadClick}
            disabled={isUploading}
            className="flex items-center gap-2.5 bg-[#1EBDB8] hover:bg-[#1CAAAE] text-white px-5 py-3 rounded-2xl text-[14px] font-bold transition-all shadow-lg shadow-[#1EBDB8]/20 hover:shadow-[#1EBDB8]/30 active:scale-[0.97] disabled:opacity-60 disabled:cursor-not-allowed whitespace-nowrap"
          >
            {isUploading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/></svg>
            )}
            {isUploading ? 'Uploading...' : 'Upload Media'}
          </button>
        </div>

        {/* Info banner */}
        <div className="mx-5 sm:mx-8 mb-5 rounded-2xl bg-[#ECFCFB] border border-[#1EBDB8]/20 px-4 py-3 flex items-start gap-3">
          <svg className="w-5 h-5 text-[#1EBDB8] mt-0.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          <div>
            <p className="text-[13px] font-semibold text-[#0F766E]">Every upload requires admin approval before going public.</p>
            <p className="text-[12px] text-[#0F766E] mt-0.5">Supported formats: JPG, PNG, WEBP, MP4, MOV, WEBM · Max 50 MB per file.</p>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="px-5 sm:px-8 pb-5 flex gap-2">
          {['all', 'pending', 'approved', 'rejected'].map(f => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-4 py-2 rounded-xl text-[13px] font-bold capitalize whitespace-nowrap transition-all ${
                activeFilter === f
                  ? 'bg-[#1F2432] text-white shadow-sm'
                  : 'bg-[#F3F4F6] text-[#6B7280] hover:bg-[#E5E7EB]'
              }`}
            >
              {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,video/mp4,video/webm,video/quicktime"
          onChange={handleFileSelected}
          className="hidden"
        />

        {/* Content */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <div className="w-10 h-10 border-[3px] border-[#1EBDB8]/20 border-t-[#1EBDB8] rounded-full animate-spin" />
            <p className="text-[14px] font-semibold text-[#6B7280]">Loading media...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-6">
            <div className="w-20 h-20 bg-[#F3F4F6] rounded-[28px] flex items-center justify-center mb-5">
              <svg className="w-10 h-10 text-[#D1D5DB]" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
            </div>
            <h4 className="text-[18px] font-bold text-[#1F2432] mb-1">No media found</h4>
            <p className="text-[14px] text-[#9CA3AF] text-center max-w-sm mb-6">
              {activeFilter !== 'all' ? `No ${activeFilter} media yet.` : 'Upload your first image or video to showcase your store.'}
            </p>
            {activeFilter === 'all' && (
              <button
                onClick={handleUploadClick}
                className="inline-flex items-center gap-2 bg-[#1EBDB8] hover:bg-[#1CAAAE] text-white px-5 py-2.5 rounded-xl text-[14px] font-bold transition-all shadow-lg shadow-[#1EBDB8]/20 active:scale-[0.97]"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/></svg>
                Upload First Media
              </button>
            )}
          </div>
        ) : (
          <div className="px-5 sm:px-8 pb-8 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {filtered.map(item => {
              const statusCfg = STATUS_CFG[item.moderationStatus] || STATUS_CFG.pending;
              return (
                <div key={item.id} className="bg-[#F9FAFB] rounded-[20px] overflow-hidden border border-gray-100 hover:border-[#1EBDB8]/25 hover:shadow-md transition-all group">
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

                    {/* Play overlay for videos */}
                    {item.mediaType === 'video' && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                        <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center">
                          <svg className="w-6 h-6 text-[#1F2432] ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                        </div>
                      </div>
                    )}

                    {/* Status badge */}
                    <span className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-[11px] font-bold ${statusCfg.bg} ${statusCfg.text}`}>
                      {statusCfg.label}
                    </span>

                    {/* Type badge */}
                    <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#1F2432]/70 text-white capitalize">
                      {item.mediaType}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="p-4 space-y-3">
                    <div>
                      <p className="text-[14px] font-semibold text-[#1F2432] truncate">{item.originalName}</p>
                      <p className="text-[12px] text-[#9CA3AF] mt-0.5">
                        {fmtBytes(item.bytes)} · {fmtDate(item.uploadedAt)}
                      </p>
                    </div>

                    {item.moderationNote && (
                      <div className="bg-rose-50 border border-rose-100 rounded-xl px-3 py-2">
                        <p className="text-[12px] font-semibold text-rose-600">Admin note:</p>
                        <p className="text-[12px] text-rose-500 mt-0.5">{item.moderationNote}</p>
                      </div>
                    )}

                    <button
                      onClick={() => setItemToDelete(item)}
                      disabled={deletingId === item.id}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-bold text-rose-500 bg-rose-50 hover:bg-rose-100 border border-rose-100 transition-colors disabled:opacity-50 active:scale-[0.97]"
                    >
                      {deletingId === item.id ? (
                        <div className="w-4 h-4 border-2 border-rose-300 border-t-rose-500 rounded-full animate-spin" />
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                      )}
                      Remove
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
            <p className="text-[14px] text-[#6B7280] mb-7">
              <span className="font-semibold text-[#1F2432]">{itemToDelete.originalName}</span> will be permanently removed from your library and Cloudinary.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setItemToDelete(null)}
                disabled={!!deletingId}
                className="flex-1 py-3 text-[13px] font-bold text-[#6B7280] bg-[#F3F4F6] rounded-xl hover:bg-[#E5E7EB] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={!!deletingId}
                className="flex-1 flex justify-center items-center py-3 text-[13px] font-bold text-white bg-rose-600 rounded-xl hover:bg-rose-700 transition-colors shadow-lg shadow-rose-600/20 active:scale-[0.97]"
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
