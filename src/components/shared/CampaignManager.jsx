import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import { toast } from 'react-toastify';

const formatCurrency = (value) => {
  const amount = Math.max(0, Math.trunc(Number(value || 0)));
  return amount.toLocaleString('en-PK');
};

const formatDate = (value) => {
  if (!value) return 'N/A';
  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) return 'N/A';
  return parsedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

export default function CampaignManager({
  tokenKey,
  title,
  description,
  buttonLabel = 'Launch Campaign',
  fetchPricing,
  fetchStatus,
  createCheckoutSession,
  confirmCheckoutSession,
  buttonClassName = 'relative z-10 whitespace-nowrap px-10 py-4.5 bg-white text-[#1F2432] font-bold rounded-full hover:bg-gray-100 transition-all duration-300 shadow-xl hover:shadow-white/10 hover:-translate-y-1 active:scale-[0.98]'
}) {
  const [isPlansOpen, setIsPlansOpen] = useState(false);
  const [plans, setPlans] = useState([]);
  const [promotion, setPromotion] = useState(null);
  const [isCampaignLocked, setIsCampaignLocked] = useState(false);
  const [requiredPlans, setRequiredPlans] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [processingPlanId, setProcessingPlanId] = useState('');
  const [isConfirming, setIsConfirming] = useState(false);
  const handledCheckoutRef = useRef(false);

  const activePlans = useMemo(() => {
    return (Array.isArray(plans) ? plans : []).filter((plan) => plan?.isActive !== false);
  }, [plans]);

  const loadCampaignData = useCallback(async ({ showLoading = false, showErrorToast = false } = {}) => {
    const token = localStorage.getItem(tokenKey);
    if (!token) return;

    try {
      if (showLoading) setIsLoading(true);
      const [pricingResponse, statusResponse] = await Promise.all([
        fetchPricing(token),
        fetchStatus(token)
      ]);
      setPlans(Array.isArray(pricingResponse?.pricing?.campaignPlans) ? pricingResponse.pricing.campaignPlans : []);
      setPromotion(statusResponse?.promotion || null);
      setIsCampaignLocked(Boolean(statusResponse?.isCampaignLocked));
      setRequiredPlans(Array.isArray(statusResponse?.requiredPlans) ? statusResponse.requiredPlans : []);
    } catch (error) {
      if (showErrorToast) toast.error(error?.message || 'Could not load campaign details');
    } finally {
      if (showLoading) setIsLoading(false);
    }
  }, [fetchPricing, fetchStatus, tokenKey]);

  useEffect(() => {
    loadCampaignData({ showLoading: false, showErrorToast: false });
  }, [loadCampaignData]);

  useEffect(() => {
    if (handledCheckoutRef.current) return;
    handledCheckoutRef.current = true;

    const token = localStorage.getItem(tokenKey);
    const searchParams = new URLSearchParams(window.location.search);
    const checkoutState = String(searchParams.get('campaign_checkout') || '').trim().toLowerCase();
    const sessionId = String(searchParams.get('campaign_session_id') || '').trim();

    const clearCheckoutQuery = () => {
      const nextParams = new URLSearchParams(window.location.search);
      nextParams.delete('campaign_checkout');
      nextParams.delete('campaign_session_id');
      const queryString = nextParams.toString();
      window.history.replaceState({}, document.title, `${window.location.pathname}${queryString ? `?${queryString}` : ''}${window.location.hash || ''}`);
    };

    if (checkoutState === 'cancelled') {
      toast.info('Campaign checkout was cancelled');
      clearCheckoutQuery();
      return;
    }

    if (checkoutState !== 'success' || !sessionId || !token) return;

    const confirmPayment = async () => {
      try {
        setIsConfirming(true);
        const response = await confirmCheckoutSession(token, sessionId);
        setPromotion(response?.promotion || null);
        toast.success(response?.message || 'Campaign activated successfully');
      } catch (error) {
        toast.error(error?.message || 'Could not confirm campaign payment');
      } finally {
        setIsConfirming(false);
        clearCheckoutQuery();
        loadCampaignData({ showLoading: false, showErrorToast: false });
      }
    };

    confirmPayment();
  }, [confirmCheckoutSession, loadCampaignData, tokenKey]);

  const handleOpenPlans = async () => {
    setIsPlansOpen(true);
    await loadCampaignData({ showLoading: true, showErrorToast: true });
  };

  const handlePlanCheckout = async (planId) => {
    const token = localStorage.getItem(tokenKey);
    if (!token) return toast.error('Please login again to continue');

    try {
      setProcessingPlanId(planId);
      const response = await createCheckoutSession(token, { planId });
      const checkoutUrl = String(response?.checkoutUrl || '').trim();
      if (!checkoutUrl) throw new Error('Stripe checkout URL is missing');

      const checkoutWindow = window.open(checkoutUrl, '_blank', 'noopener,noreferrer');
      if (!checkoutWindow) throw new Error('Popup was blocked. Please allow popups and try again.');
      toast.info('Opening checkout...');
    } catch (error) {
      toast.error(error?.message || 'Could not start campaign checkout');
    } finally {
      setProcessingPlanId('');
    }
  };

  return (
    <>
      <div className="relative z-10 text-center lg:text-left">
        <h3 className="text-[26px] font-bold text-white mb-3 tracking-tight">{title}</h3>
        <p className="text-white/60 text-[16px] max-w-2xl leading-relaxed">{description}</p>
        {promotion ? (
          <p className="mt-3 text-[13px] font-semibold text-[#1EBDB8]">
            Active: {promotion.planName} until {formatDate(promotion.expiresAt)} ({promotion.daysRemaining} day{promotion.daysRemaining === 1 ? '' : 's'} left)
          </p>
        ) : null}
        {isConfirming ? <p className="mt-3 text-[13px] font-semibold text-[#1EBDB8]">Confirming campaign payment...</p> : null}
      </div>
      <button type="button" onClick={handleOpenPlans} className={buttonClassName}>{buttonLabel}</button>

      {isPlansOpen ? ReactDOM.createPortal(
        <div className="fixed inset-0 z-[1400] bg-black/50 px-4 py-8 flex items-center justify-center">
          <div className="w-full max-w-4xl bg-white rounded-[28px] shadow-2xl overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between gap-4">
              <div>
                <h3 className="text-[22px] font-bold text-[#1F2432]">Choose Campaign Plan</h3>
                <p className="text-[13px] text-gray-500 mt-1">Profiles need rating above 3.5 to buy sponsored promotion.</p>
              </div>
              <button type="button" onClick={() => setIsPlansOpen(false)} className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold">×</button>
            </div>

            <div className="p-6">
              {isCampaignLocked ? (
                <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-[13px] font-semibold text-amber-800">
                  Upgrade to {requiredPlans.length > 0 ? requiredPlans.map((plan) => String(plan || '').toUpperCase()).join(' or ') : 'a paid plan'} to launch campaigns.
                </div>
              ) : null}
              {isLoading ? (
                <div className="py-12 text-center text-[15px] font-semibold text-gray-500">Loading campaign prices...</div>
              ) : activePlans.length === 0 ? (
                <div className="py-12 text-center text-[15px] font-semibold text-gray-500">No campaign plans configured yet.</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {activePlans.map((plan) => (
                    <div key={plan.id} className="rounded-2xl border border-gray-100 bg-[#F8FAFC] p-5 flex flex-col">
                      <h4 className="text-[18px] font-black text-[#1F2432]">{plan.name}</h4>
                      <p className="mt-4 text-[32px] font-black text-[#1EBDB8] leading-none">Rs {formatCurrency(plan.priceInRupees)}</p>
                      <p className="mt-2 text-[14px] font-bold text-gray-500">{plan.durationDays} day{Number(plan.durationDays) === 1 ? '' : 's'} sponsored placement</p>
                      <button
                        type="button"
                        onClick={() => handlePlanCheckout(plan.id)}
                        disabled={processingPlanId === plan.id || isCampaignLocked}
                        className="mt-6 w-full py-3 rounded-xl bg-[#1EBDB8] hover:bg-[#1CAAAE] text-white text-[14px] font-bold disabled:opacity-60 transition-colors"
                      >
                        {processingPlanId === plan.id ? 'Loading...' : isCampaignLocked ? 'Upgrade Required' : 'Pay'}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body
      ) : null}
    </>
  );
}
