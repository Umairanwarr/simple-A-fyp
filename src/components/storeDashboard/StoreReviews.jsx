import React, { useEffect, useMemo, useState } from 'react';
import { fetchStoreReviews } from '../../services/authApi';

const formatReviewDate = (dateValue) => {
  if (!dateValue) return 'N/A';
  const parsedDate = new Date(dateValue);
  if (Number.isNaN(parsedDate.getTime())) return 'N/A';
  return parsedDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

const renderStars = (rating) => {
  const normalizedRating = Math.max(1, Math.min(5, Math.trunc(Number(rating || 0)) || 0));
  return [1, 2, 3, 4, 5].map((star) => {
    const isActive = star <= normalizedRating;
    return (
      <svg
        key={`star-${star}`}
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill={isActive ? '#F59E0B' : 'none'}
        stroke={isActive ? '#F59E0B' : '#D1D5DB'}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
      </svg>
    );
  });
};

export default function StoreReviews() {
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadStoreReviews = async () => {
      const storeToken = localStorage.getItem('medicalStoreToken');

      if (!storeToken) {
        if (isMounted) {
          setReviews([]);
          setAverageRating(0);
          setTotalReviews(0);
          setIsLoading(false);
        }
        return;
      }

      try {
        setIsLoading(true);
        const data = await fetchStoreReviews(storeToken);

        if (!isMounted) return;

        setReviews(Array.isArray(data?.reviews) ? data.reviews : []);
        setAverageRating(Number(data?.averageRating || 0));
        setTotalReviews(Math.max(0, Math.trunc(Number(data?.totalReviews || 0))));
      } catch (error) {
        if (isMounted) {
          setReviews([]);
          setAverageRating(0);
          setTotalReviews(0);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadStoreReviews();
    return () => { isMounted = false; };
  }, []);

  const roundedAverageRating = useMemo(() => {
    return Number.isFinite(averageRating) ? Number(averageRating.toFixed(2)) : 0;
  }, [averageRating]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm">
          <p className="text-[12px] font-bold text-[#9ca3af] uppercase tracking-wider mb-2">Average Rating</p>
          <div className="flex items-center gap-3">
            <p className="text-[30px] leading-tight font-bold text-[#1F2432]">{roundedAverageRating.toFixed(2)}</p>
            <div className="flex items-center gap-1">{renderStars(Math.round(roundedAverageRating || 0))}</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm">
          <p className="text-[12px] font-bold text-[#9ca3af] uppercase tracking-wider mb-2">Total Reviews</p>
          <p className="text-[30px] leading-tight font-bold text-[#1F2432]">{totalReviews.toLocaleString()}</p>
        </div>
      </div>

      <div className="bg-white p-6 sm:p-7 rounded-[30px] border border-gray-100 shadow-sm">
        <div className="mb-5">
          <h3 className="text-[22px] font-bold text-[#1F2432]">Patient Reviews</h3>
          <p className="text-[14px] text-[#9ca3af] mt-1">See what patients said after receiving their orders.</p>
        </div>

        {isLoading && (
          <div className="rounded-2xl border border-gray-100 bg-[#F9FAFB] px-4 py-10 text-center">
            <div className="w-8 h-8 border-[3px] border-[#1EBDB8]/20 border-t-[#1EBDB8] rounded-full animate-spin mx-auto mb-3" />
            <p className="text-[14px] font-semibold text-[#6B7280]">Loading reviews...</p>
          </div>
        )}

        {!isLoading && reviews.length === 0 && (
          <div className="rounded-2xl border border-gray-100 bg-[#F9FAFB] px-4 py-10 text-center">
            <p className="text-[14px] font-semibold text-[#6B7280]">No reviews submitted yet.</p>
          </div>
        )}

        {!isLoading && reviews.length > 0 && (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="rounded-2xl border border-gray-100 bg-[#FCFCFD] px-4 py-4 hover:bg-white hover:shadow-sm transition-all">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <p className="text-[15px] font-bold text-[#1F2432]">{review.patientName}</p>
                    <div className="mt-1 flex items-center gap-1">
                      {renderStars(review.rating)}
                    </div>
                  </div>
                  <span className="text-[12px] font-semibold text-[#6B7280]">{formatReviewDate(review.createdAt)}</span>
                </div>

                <p className="mt-3 text-[14px] text-[#374151] leading-relaxed">
                  {review.comment || 'No additional comments were provided.'}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
