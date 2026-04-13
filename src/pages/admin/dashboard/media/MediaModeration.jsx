import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import AdminLayout from '../AdminLayout';
import {
  fetchAdminDoctorMediaModeration,
  reviewAdminDoctorMedia
} from '../../../../services/authApi';

const STATUS_FILTERS = ['pending', 'approved', 'rejected', 'all'];

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

  return parsedDate.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });
};

export default function MediaModeration() {
  const [activeStatus, setActiveStatus] = useState('pending');
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mediaItems, setMediaItems] = useState([]);
  const [summary, setSummary] = useState({ pending: 0, approved: 0, rejected: 0 });
  const [reviewingMediaId, setReviewingMediaId] = useState('');

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setSearchQuery(searchInput.trim());
    }, 350);

    return () => window.clearTimeout(timeoutId);
  }, [searchInput]);

  useEffect(() => {
    let isMounted = true;

    const loadMediaModeration = async () => {
      const adminToken = localStorage.getItem('adminToken');

      if (!adminToken) {
        if (isMounted) {
          setMediaItems([]);
          setSummary({ pending: 0, approved: 0, rejected: 0 });
          setIsLoading(false);
        }

        return;
      }

      try {
        if (isMounted) {
          setIsLoading(true);
        }

        const response = await fetchAdminDoctorMediaModeration(adminToken, {
          status: activeStatus,
          query: searchQuery
        });

        if (!isMounted) {
          return;
        }

        setMediaItems(Array.isArray(response?.media) ? response.media : []);
        setSummary(response?.summary || { pending: 0, approved: 0, rejected: 0 });
      } catch (error) {
        if (isMounted) {
          toast.error(error?.message || 'Could not load media moderation list');
          setMediaItems([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadMediaModeration();

    return () => {
      isMounted = false;
    };
  }, [activeStatus, searchQuery]);

  const totalReviewed = useMemo(() => {
    return Math.max(0, Number(summary.approved || 0)) + Math.max(0, Number(summary.rejected || 0));
  }, [summary.approved, summary.rejected]);

  const handleReviewAction = async (mediaItem, status) => {
    const adminToken = localStorage.getItem('adminToken');

    if (!adminToken) {
      toast.error('Please login as admin first');
      return;
    }

    let note = '';

    if (status === 'rejected') {
      const rejectionNote = window.prompt('Reason for rejection (optional):', 'Please upload a clearer file');

      if (rejectionNote === null) {
        return;
      }

      note = rejectionNote;
    }

    try {
      setReviewingMediaId(String(mediaItem?.id || ''));
      const response = await reviewAdminDoctorMedia(adminToken, mediaItem?.id, status, note);
      toast.success(response?.message || 'Media updated successfully');

      const refreshedResponse = await fetchAdminDoctorMediaModeration(adminToken, {
        status: activeStatus,
        query: searchQuery
      });

      setMediaItems(Array.isArray(refreshedResponse?.media) ? refreshedResponse.media : []);
      setSummary(refreshedResponse?.summary || { pending: 0, approved: 0, rejected: 0 });
    } catch (error) {
      toast.error(error?.message || 'Could not review media');
    } finally {
      setReviewingMediaId('');
    }
  };

  return (
    <AdminLayout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-[24px] font-bold text-gray-900">Media Moderation</h1>
            <p className="text-[14px] text-gray-500 font-medium mt-1">
              Review doctor media uploads and approve or reject them.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-[0_2px_10px_rgb(0,0,0,0.02)]">
            <p className="text-[13px] font-bold text-gray-500">Pending</p>
            <p className="mt-2 text-[28px] font-bold text-gray-900">{summary.pending || 0}</p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-[0_2px_10px_rgb(0,0,0,0.02)]">
            <p className="text-[13px] font-bold text-gray-500">Approved</p>
            <p className="mt-2 text-[28px] font-bold text-gray-900">{summary.approved || 0}</p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-[0_2px_10px_rgb(0,0,0,0.02)]">
            <p className="text-[13px] font-bold text-gray-500">Reviewed</p>
            <p className="mt-2 text-[28px] font-bold text-gray-900">{totalReviewed}</p>
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-4 sm:p-5 shadow-[0_2px_10px_rgb(0,0,0,0.02)] space-y-4">
          <div className="flex flex-wrap gap-2">
            {STATUS_FILTERS.map((statusFilter) => {
              const isActive = activeStatus === statusFilter;

              return (
                <button
                  key={statusFilter}
                  type="button"
                  onClick={() => setActiveStatus(statusFilter)}
                  className={`px-3.5 py-1.5 rounded-full text-[12px] font-bold transition-colors ${
                    isActive
                      ? 'bg-[#1EBDB8] text-white'
                      : 'bg-gray-100 text-[#4B5563] hover:bg-gray-200'
                  }`}
                >
                  {formatStatusLabel(statusFilter)}
                </button>
              );
            })}
          </div>

          <div className="relative">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input
              type="text"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Search by doctor name or email..."
              className="w-full bg-[#FAFAFA] text-[#4B5563] text-[14px] font-medium py-2.5 pl-10 pr-4 rounded-xl outline-none focus:ring-2 focus:ring-[#1EBDB8]/50 border border-gray-200 focus:border-[#1EBDB8] transition-all"
            />
          </div>
        </div>

        <div className="bg-white border border-gray-100 shadow-[0_2px_10px_rgb(0,0,0,0.02)] rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1140px] text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/70 border-b border-gray-100">
                  <th className="px-6 py-4 text-[12px] font-bold text-gray-500 uppercase tracking-wider">Media</th>
                  <th className="px-6 py-4 text-[12px] font-bold text-gray-500 uppercase tracking-wider">Doctor</th>
                  <th className="px-6 py-4 text-[12px] font-bold text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-4 text-[12px] font-bold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-[12px] font-bold text-gray-500 uppercase tracking-wider">Uploaded</th>
                  <th className="px-6 py-4 text-[12px] font-bold text-gray-500 uppercase tracking-wider">Review Note</th>
                  <th className="px-6 py-4 text-[12px] font-bold text-gray-500 uppercase tracking-wider text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {isLoading ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-10 text-center text-sm font-medium text-gray-500">
                      Loading media records...
                    </td>
                  </tr>
                ) : null}

                {!isLoading && mediaItems.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-10 text-center text-sm font-medium text-gray-500">
                      No media found for this filter.
                    </td>
                  </tr>
                ) : null}

                {!isLoading && mediaItems.map((mediaItem) => {
                  const normalizedStatus = String(mediaItem?.moderationStatus || '').trim().toLowerCase();
                  const reviewNoteLabel = normalizedStatus === 'approved'
                    ? '-'
                    : mediaItem.moderationNote || '-';

                  return (
                    <tr key={mediaItem.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="w-[110px] h-[72px] rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                          {mediaItem.mediaType === 'video' ? (
                            <video src={mediaItem.url} className="w-full h-full object-cover" controls />
                          ) : (
                            <img src={mediaItem.url} alt={mediaItem.originalName} className="w-full h-full object-cover" />
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-[14px] font-bold text-gray-900">{mediaItem.doctorName}</p>
                        <p className="text-[12px] font-medium text-gray-600 mt-0.5">{mediaItem.doctorEmail}</p>
                      </td>
                      <td className="px-6 py-4 text-[13px] font-semibold text-gray-700">{formatStatusLabel(mediaItem.mediaType)}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          normalizedStatus === 'approved'
                            ? 'bg-emerald-100 text-emerald-700'
                            : normalizedStatus === 'rejected'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-amber-100 text-amber-700'
                        }`}>
                          {formatStatusLabel(normalizedStatus)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-[13px] font-medium text-gray-600">{formatDateLabel(mediaItem.uploadedAt)}</td>
                      <td className="px-6 py-4 text-[12px] font-medium text-gray-600 max-w-[240px]">
                        <p className="line-clamp-3">{reviewNoteLabel}</p>
                      </td>
                      <td className="px-6 py-4">
                        {normalizedStatus === 'pending' ? (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => handleReviewAction(mediaItem, 'approved')}
                              disabled={reviewingMediaId === mediaItem.id}
                              className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-[12px] font-bold hover:bg-emerald-100 disabled:opacity-60"
                            >
                              Approve
                            </button>
                            <button
                              type="button"
                              onClick={() => handleReviewAction(mediaItem, 'rejected')}
                              disabled={reviewingMediaId === mediaItem.id}
                              className="px-3 py-1.5 rounded-lg bg-red-50 text-red-700 border border-red-200 text-[12px] font-bold hover:bg-red-100 disabled:opacity-60"
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <p className="text-right text-[12px] font-medium text-gray-500">
                            Reviewed {formatDateLabel(mediaItem.reviewedAt)}
                          </p>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
