import React, { useEffect, useState } from 'react';

const getSafeRating = (rating) => {
  const normalizedRating = Math.trunc(Number(rating));
  if (!Number.isInteger(normalizedRating) || normalizedRating < 1 || normalizedRating > 5) {
    return 5;
  }
  return normalizedRating;
};

export default function StoreReviewPromptModal({
  isOpen = false,
  order = null,        // shape: { id, store: { name, avatarUrl } }
  isSubmitting = false,
  onSubmit,
  onSkip
}) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSkipWarningVisible, setIsSkipWarningVisible] = useState(false);

  useEffect(() => {
    if (!order?.id) return;
    setRating(5);
    setComment('');
    setIsSkipWarningVisible(false);
  }, [order?.id]);

  if (!isOpen || !order) return null;

  const handleSubmit = () => {
    if (isSubmitting) return;
    onSubmit?.({
      rating: getSafeRating(rating),
      comment: String(comment || '').trim()
    });
  };

  const handleSkipConfirm = () => {
    if (isSubmitting) return;
    onSkip?.();
  };

  return (
    <div className="fixed inset-0 z-[80] px-4 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/45" />

      <div className="relative w-full max-w-[520px] rounded-[28px] bg-white border border-gray-100 shadow-[0px_24px_60px_rgba(0,0,0,0.18)] p-6 sm:p-7">
        {/* Store avatar + name */}
        <div className="flex items-center gap-3 mb-4">
          {order.store?.avatarUrl ? (
            <img
              src={order.store.avatarUrl}
              alt={order.store.name}
              className="w-12 h-12 rounded-full object-cover border border-gray-100"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-[#ECFCFB] flex items-center justify-center">
              <svg className="w-6 h-6 text-[#1EBDB8]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
          )}
          <div>
            <p className="text-[12px] font-bold text-[#9CA3AF] uppercase tracking-wider">Order Delivered</p>
            <p className="text-[15px] font-bold text-[#1F2937]">{order.store?.name || 'Medical Store'}</p>
          </div>
        </div>

        <h3 className="text-[24px] font-extrabold text-[#111827] tracking-tight">Rate Your Order</h3>
        <p className="mt-2 text-[14px] text-[#4B5563] leading-relaxed">
          Your order from{' '}
          <span className="font-semibold text-[#1F2937]">{order.store?.name || 'the store'}</span>{' '}
          has been delivered. Please share your experience.
        </p>

        {/* Star rating */}
        <div className="mt-5">
          <p className="text-[13px] font-bold text-[#111827] uppercase tracking-wider mb-2">Rating</p>
          <div className="flex items-center gap-1.5">
            {[1, 2, 3, 4, 5].map((starNumber) => {
              const isActive = rating >= starNumber;
              return (
                <button
                  key={starNumber}
                  type="button"
                  onClick={() => setRating(starNumber)}
                  disabled={isSubmitting}
                  className="w-9 h-9 rounded-full flex items-center justify-center transition disabled:opacity-60 disabled:cursor-not-allowed"
                  aria-label={`Rate ${starNumber} star${starNumber > 1 ? 's' : ''}`}
                >
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill={isActive ? '#F59E0B' : 'none'}
                    stroke={isActive ? '#F59E0B' : '#D1D5DB'}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                </button>
              );
            })}
          </div>
        </div>

        {/* Comment */}
        <div className="mt-5">
          <label
            htmlFor="store-review-comment"
            className="text-[13px] font-bold text-[#111827] uppercase tracking-wider mb-2 block"
          >
            Review
          </label>
          <textarea
            id="store-review-comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            maxLength={1000}
            disabled={isSubmitting}
            placeholder="Share your experience with this store"
            className="w-full rounded-[16px] border border-gray-200 bg-[#FCFCFD] px-4 py-3 text-[14px] text-[#1F2937] font-medium placeholder:text-[#9CA3AF] outline-none focus:ring-2 focus:ring-[#1EBDB8]/25 focus:border-[#1EBDB8] disabled:opacity-60 disabled:cursor-not-allowed"
          />
        </div>

        {/* Actions */}
        {!isSkipWarningVisible ? (
          <div className="mt-7 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsSkipWarningVisible(true)}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-full border border-[#E11D48]/35 text-[#E11D48] font-semibold text-[13px] hover:bg-[#FFF1F2] transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              Skip
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-5 py-2 rounded-full bg-[#1EBDB8] hover:bg-[#1CAAAE] text-white font-semibold text-[13px] transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        ) : (
          <div className="mt-6 rounded-[18px] border border-[#FECACA] bg-[#FFF1F2] p-4">
            <p className="text-[13px] font-semibold text-[#9F1239] leading-relaxed">
              On skipping, you can&apos;t rate this order again. Are you sure?
            </p>
            <div className="mt-4 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsSkipWarningVisible(false)}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-full border border-gray-300 text-[#374151] font-semibold text-[13px] hover:bg-white transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                No
              </button>
              <button
                type="button"
                onClick={handleSkipConfirm}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-full bg-[#E11D48] hover:bg-[#BE123C] text-white font-semibold text-[13px] transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Please wait...' : 'Confirm'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
