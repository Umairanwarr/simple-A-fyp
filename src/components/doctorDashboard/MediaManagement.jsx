import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  deleteDoctorMedia,
  fetchDoctorMediaLibrary,
  uploadDoctorMedia
} from '../../services/authApi';

const STATUS_TABS = ['all', 'pending', 'approved', 'rejected'];

const formatStatusLabel = (statusValue) => {
  const normalized = String(statusValue || '').trim().toLowerCase();

  if (!normalized) {
    return 'Pending';
  }

  return `${normalized.charAt(0).toUpperCase()}${normalized.slice(1)}`;
};

const formatDateLabel = (dateValue) => {
  if (!dateValue) {
    return 'N/A';
  }

  const parsedDate = new Date(dateValue);

  if (Number.isNaN(parsedDate.getTime())) {
    return 'N/A';
  }

  return parsedDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

const formatLimitLabel = (limitValue) => {
  if (limitValue === null || limitValue === undefined) {
    return 'Unlimited';
  }

  const numericLimit = Number(limitValue);

  if (!Number.isFinite(numericLimit)) {
    return '0';
  }

  return `${Math.max(0, Math.trunc(numericLimit))}`;
};

export default function MediaManagement() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [deletingMediaId, setDeletingMediaId] = useState('');
  const [activeStatusFilter, setActiveStatusFilter] = useState('all');
  const [mediaItems, setMediaItems] = useState([]);
  const [policy, setPolicy] = useState({
    currentPlan: 'platinum',
    limits: {
      maxImages: 2,
      maxVideos: 0
    },
    usage: {
      imageCount: 0,
      videoCount: 0
    }
  });

  const loadMediaLibrary = async ({ silent = false } = {}) => {
    const doctorToken = localStorage.getItem('doctorToken');

    if (!doctorToken) {
      setMediaItems([]);
      setIsLoading(false);
      return;
    }

    try {
      if (!silent) {
        setIsLoading(true);
      }

      const response = await fetchDoctorMediaLibrary(doctorToken);
      setMediaItems(Array.isArray(response?.media) ? response.media : []);
      setPolicy(response?.policy || {
        currentPlan: 'platinum',
        limits: {
          maxImages: 2,
          maxVideos: 0
        },
        usage: {
          imageCount: 0,
          videoCount: 0
        }
      });
    } catch (error) {
      toast.error(error?.message || 'Could not load media library');
      setMediaItems([]);
    } finally {
      if (!silent) {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    loadMediaLibrary();
  }, []);

  const filteredMediaItems = useMemo(() => {
    if (activeStatusFilter === 'all') {
      return mediaItems;
    }

    return mediaItems.filter((mediaItem) => {
      return String(mediaItem?.moderationStatus || '').trim().toLowerCase() === activeStatusFilter;
    });
  }, [activeStatusFilter, mediaItems]);

  const currentPlanLabel = useMemo(() => {
    const normalizedPlan = String(policy?.currentPlan || '').trim().toLowerCase() || 'platinum';
    return `${normalizedPlan.charAt(0).toUpperCase()}${normalizedPlan.slice(1)}`;
  }, [policy?.currentPlan]);

  const handleUploadClick = () => {
    if (isUploading) {
      return;
    }

    fileInputRef.current?.click();
  };

  const handleFileSelected = async (event) => {
    const doctorToken = localStorage.getItem('doctorToken');
    const selectedFile = event?.target?.files?.[0];

    if (!doctorToken || !selectedFile) {
      return;
    }

    try {
      setIsUploading(true);
      const response = await uploadDoctorMedia(doctorToken, selectedFile);
      toast.success(response?.message || 'Media uploaded successfully');
      await loadMediaLibrary({ silent: true });
    } catch (error) {
      toast.error(error?.message || 'Could not upload media');

      if (error?.status === 403) {
        navigate('/doctor/dashboard/subscriptions');
      }
    } finally {
      setIsUploading(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDeleteMedia = async (mediaItem) => {
    const doctorToken = localStorage.getItem('doctorToken');

    if (!doctorToken) {
      toast.error('Please login again to continue');
      return;
    }

    const shouldDelete = window.confirm(`Delete ${mediaItem?.originalName || 'this media'}?`);

    if (!shouldDelete) {
      return;
    }

    try {
      setDeletingMediaId(String(mediaItem?.id || ''));
      const response = await deleteDoctorMedia(doctorToken, mediaItem?.id);
      toast.success(response?.message || 'Media deleted successfully');
      await loadMediaLibrary({ silent: true });
    } catch (error) {
      toast.error(error?.message || 'Could not delete media');
    } finally {
      setDeletingMediaId('');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div>
            <h3 className="text-[20px] font-bold text-[#1F2432]">Media Manager</h3>
            <p className="text-[13px] text-[#6B7280] mt-1">
              Current Plan: <span className="font-bold text-[#1F2432]">{currentPlanLabel}</span>
            </p>
            <p className="text-[12px] text-[#6B7280] mt-1">
              Images: {policy?.usage?.imageCount || 0}/{formatLimitLabel(policy?.limits?.maxImages)} • Videos: {policy?.usage?.videoCount || 0}/{formatLimitLabel(policy?.limits?.maxVideos)}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleUploadClick}
              disabled={isUploading}
              className="px-5 py-2.5 bg-[#1EBDB8] text-white font-bold rounded-xl hover:bg-[#1CAAAE] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isUploading ? 'Uploading...' : '+ Upload New'}
            </button>

            {String(policy?.currentPlan || '').trim().toLowerCase() !== 'diamond' ? (
              <button
                type="button"
                onClick={() => navigate('/doctor/dashboard/subscriptions')}
                className="px-5 py-2.5 bg-[#1EBDB8]/10 text-[#1EBDB8] font-bold rounded-xl hover:bg-[#1EBDB8]/20"
              >
                Upgrade Plan
              </button>
            ) : null}
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,video/mp4,video/webm,video/quicktime"
          onChange={handleFileSelected}
          className="hidden"
        />

        <div className="mb-6 rounded-2xl border border-[#1EBDB8]/20 bg-[#1EBDB8]/5 px-4 py-3">
          <p className="text-[13px] font-semibold text-[#0F766E]">
            Platinum: 2 images. Gold: 5 images + 1 video. Diamond: unlimited media.
          </p>
          <p className="text-[12px] text-[#0F766E] mt-1">
            Every upload goes to admin moderation. You will get a notification when it is approved or rejected.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 mb-5">
          {STATUS_TABS.map((statusTab) => {
            const isActive = activeStatusFilter === statusTab;

            return (
              <button
                key={statusTab}
                type="button"
                onClick={() => setActiveStatusFilter(statusTab)}
                className={`px-3.5 py-1.5 rounded-full text-[12px] font-bold transition-colors ${
                  isActive
                    ? 'bg-[#1EBDB8] text-white'
                    : 'bg-gray-100 text-[#4B5563] hover:bg-gray-200'
                }`}
              >
                {formatStatusLabel(statusTab)}
              </button>
            );
          })}
        </div>

        {isLoading ? (
          <div className="rounded-2xl border border-gray-100 bg-gray-50 px-4 py-10 text-center">
            <p className="text-[14px] font-medium text-[#6B7280]">Loading media...</p>
          </div>
        ) : null}

        {!isLoading && filteredMediaItems.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-[#FAFAFA] px-4 py-10 text-center">
            <p className="text-[14px] font-medium text-[#6B7280]">No media found in this status.</p>
          </div>
        ) : null}

        {!isLoading && filteredMediaItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {filteredMediaItems.map((mediaItem) => {
              const normalizedStatus = String(mediaItem?.moderationStatus || '').trim().toLowerCase();

              return (
                <div key={mediaItem.id} className="bg-[#FAFAFA] rounded-2xl overflow-hidden border border-gray-100">
                  <div className="h-52 bg-black/5 relative">
                    {mediaItem.mediaType === 'video' ? (
                      <video src={mediaItem.url} className="w-full h-full object-cover" controls />
                    ) : (
                      <img src={mediaItem.url} alt={mediaItem.originalName} className="w-full h-full object-cover" />
                    )}

                    <span className={`absolute top-3 right-3 px-3 py-1 rounded-full text-[10px] font-bold ${
                      normalizedStatus === 'approved'
                        ? 'bg-emerald-500 text-white'
                        : normalizedStatus === 'rejected'
                          ? 'bg-red-500 text-white'
                          : 'bg-amber-500 text-white'
                    }`}>
                      {formatStatusLabel(normalizedStatus)}
                    </span>
                  </div>

                  <div className="p-4 space-y-2">
                    <p className="text-[14px] font-bold text-[#1F2432] truncate">{mediaItem.originalName}</p>
                    <p className="text-[12px] text-[#6B7280] font-medium">
                      {mediaItem.mediaType === 'video' ? 'Video' : 'Image'} • Uploaded {formatDateLabel(mediaItem.uploadedAt)}
                    </p>

                    {mediaItem.moderationNote ? (
                      <p className="text-[12px] text-[#6B7280] bg-white rounded-lg border border-gray-100 px-2.5 py-2">
                        Note: {mediaItem.moderationNote}
                      </p>
                    ) : null}

                    <button
                      type="button"
                      onClick={() => handleDeleteMedia(mediaItem)}
                      disabled={deletingMediaId === mediaItem.id}
                      className="mt-1 inline-flex items-center justify-center px-3 py-2 rounded-lg border border-red-200 text-red-700 bg-red-50 text-[12px] font-bold hover:bg-red-100 disabled:opacity-60"
                    >
                      {deletingMediaId === mediaItem.id ? 'Deleting...' : 'Delete Media'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : null}
      </div>
    </div>
  );
}
