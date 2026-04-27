import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import AdminLayout from '../AdminLayout';
import {
  deleteAdminDoctorReview,
  fetchAdminDoctorReviews,
  fetchAdminStoreReviews,
  deleteAdminStoreReview
} from '../../../../services/authApi';

const formatReviewDate = (dateValue) => {
  if (!dateValue) {
    return 'N/A';
  }

  const parsed = new Date(dateValue);

  if (Number.isNaN(parsed.getTime())) {
    return 'N/A';
  }

  return parsed.toLocaleString();
};

const renderStars = (rating) => {
  const filledStars = Math.max(0, Math.min(5, Math.round(Number(rating) || 0)));

  return Array.from({ length: 5 }, (_, index) => {
    const isFilled = index < filledStars;

    return (
      <svg
        key={`star-${index}`}
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill={isFilled ? '#f59e0b' : 'none'}
        stroke={isFilled ? '#f59e0b' : '#d1d5db'}
        strokeWidth="1.8"
      >
        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
      </svg>
    );
  });
};

export default function DoctorReviews() {
  const [adminToken] = useState(() => localStorage.getItem('adminToken') || '');
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [deletingReviewId, setDeletingReviewId] = useState('');

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setSearchQuery(searchInput.trim());
    }, 350);

    return () => window.clearTimeout(timeoutId);
  }, [searchInput]);

  useEffect(() => {
    let isMounted = true;

    const loadReviews = async () => {
      if (!adminToken) {
        if (isMounted) {
          setReviews([]);
          setIsLoading(false);
        }

        return;
      }

      try {
        if (isMounted) {
          setIsLoading(true);
        }

        const [doctorResponse, storeResponse] = await Promise.all([
          fetchAdminDoctorReviews(adminToken, searchQuery).catch(() => ({ reviews: [] })),
          fetchAdminStoreReviews(adminToken, searchQuery).catch(() => ({ reviews: [] }))
        ]);

        if (!isMounted) return;

        const doctorReviews = Array.isArray(doctorResponse?.reviews)
          ? doctorResponse.reviews.map((review) => ({
            id: review?.id || review?._id,
            type: 'doctor',
            targetName: review?.doctorName || 'Unknown doctor',
            targetDetails: review?.doctorSpecialization || 'General',
            patientName: review?.patientName || 'Anonymous',
            rating: Number(review?.rating) || 0,
            comment: review?.comment || '',
            createdAt: review?.createdAt || null
          }))
          : [];

        const storeReviews = Array.isArray(storeResponse?.reviews)
          ? storeResponse.reviews.map((review) => ({
            id: review?.id || review?._id,
            type: 'store',
            targetName: review?.storeName || 'Unknown Store',
            targetDetails: 'Medical Store',
            patientName: review?.patientName || 'Anonymous',
            rating: Number(review?.rating) || 0,
            comment: review?.comment || '',
            createdAt: review?.createdAt || null
          }))
          : [];

        const nextReviews = [...doctorReviews, ...storeReviews].sort((a, b) => {
          const firstTimestamp = a?.createdAt ? new Date(a.createdAt).getTime() : 0;
          const secondTimestamp = b?.createdAt ? new Date(b.createdAt).getTime() : 0;
          return secondTimestamp - firstTimestamp;
        });

        setReviews(nextReviews);
      } catch (error) {
        if (isMounted) {
          toast.error(error?.message || 'Could not load doctor reviews');
          setReviews([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadReviews();

    return () => {
      isMounted = false;
    };
  }, [adminToken, searchQuery]);

  const reviewCount = useMemo(() => reviews.length, [reviews]);

  const handleDeleteReview = async (review) => {
    if (!adminToken) {
      toast.error('Please login as admin first');
      return;
    }

    const shouldDelete = window.confirm(`Delete this review for ${review.targetName}?`);

    if (!shouldDelete) {
      return;
    }

    try {
      setDeletingReviewId(String(review.id));
      if (review.type === 'doctor') {
        await deleteAdminDoctorReview(adminToken, review.id);
      } else {
        await deleteAdminStoreReview(adminToken, review.id);
      }
      setReviews((previousReviews) => previousReviews.filter((item) => String(item.id) !== String(review.id)));
      toast.success('Review deleted successfully');
    } catch (error) {
      toast.error(error?.message || 'Could not delete review');
    } finally {
      setDeletingReviewId('');
    }
  };

  return (
    <AdminLayout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-[24px] font-bold text-gray-900">Reviews Management</h1>
            <p className="text-[14px] text-gray-500 font-medium mt-1">
              Search doctor & store reviews and remove inappropriate feedback.
            </p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-[0_2px_10px_rgb(0,0,0,0.02)] flex flex-col sm:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input
              type="text"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Search by doctor or store name..."
              className="w-full bg-[#FAFAFA] text-[#4B5563] text-[14px] font-medium py-2.5 pl-10 pr-4 rounded-xl outline-none focus:ring-2 focus:ring-[#1EBDB8]/50 border border-gray-200 focus:border-[#1EBDB8] transition-all"
            />
          </div>

          <span className="text-[13px] font-bold text-gray-600">{reviewCount} review{reviewCount !== 1 ? 's' : ''}</span>
        </div>

        <div className="bg-white border border-gray-100 shadow-[0_2px_10px_rgb(0,0,0,0.02)] rounded-2xl overflow-hidden">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full min-w-[980px] text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="px-6 py-4 text-[12px] font-bold text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-4 text-[12px] font-bold text-gray-500 uppercase tracking-wider">Target</th>
                  <th className="px-6 py-4 text-[12px] font-bold text-gray-500 uppercase tracking-wider">Patient</th>
                  <th className="px-6 py-4 text-[12px] font-bold text-gray-500 uppercase tracking-wider">Rating</th>
                  <th className="px-6 py-4 text-[12px] font-bold text-gray-500 uppercase tracking-wider">Comment</th>
                  <th className="px-6 py-4 text-[12px] font-bold text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-[12px] font-bold text-gray-500 uppercase tracking-wider text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {isLoading ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-10 text-center text-sm font-medium text-gray-500">
                      Loading reviews...
                    </td>
                  </tr>
                ) : null}

                {!isLoading && reviews.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-10 text-center text-sm font-medium text-gray-500">
                      No doctor reviews found.
                    </td>
                  </tr>
                ) : null}

                {!isLoading && reviews.map((review) => (
                  <tr key={review.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 rounded-md text-[11px] font-bold uppercase tracking-wide ${
                        review.type === 'doctor' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'
                      }`}>
                        {review.type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-[14px] text-gray-900">{review.targetName}</p>
                      <p className="text-[12px] text-gray-500 mt-0.5">{review.targetDetails}</p>
                    </td>
                    <td className="px-6 py-4 font-medium text-[14px] text-gray-700">{review.patientName}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[13px] font-bold text-gray-800">{review.rating.toFixed(1)}</span>
                        <div className="flex items-center gap-0.5">{renderStars(review.rating)}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[13px] font-medium text-gray-600 max-w-[340px]">
                      <p className="line-clamp-2">{review.comment || 'No comment provided.'}</p>
                    </td>
                    <td className="px-6 py-4 text-[13px] font-medium text-gray-600">{formatReviewDate(review.createdAt)}</td>
                    <td className="px-6 py-4 text-right">
                      <button
                        type="button"
                        disabled={deletingReviewId === String(review.id)}
                        onClick={() => handleDeleteReview(review)}
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-[12px] font-bold text-red-700 border border-red-200 bg-red-50 hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {deletingReviewId === String(review.id) ? 'Deleting...' : 'Delete'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
