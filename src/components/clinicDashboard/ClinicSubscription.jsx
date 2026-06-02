import React, { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import CampaignManager from '../shared/CampaignManager';
import {
  cancelClinicSubscription,
  confirmClinicCampaignCheckoutSession,
  confirmClinicSubscriptionCheckoutSession,
  createClinicCampaignCheckoutSession,
  createClinicSubscriptionCheckoutSession,
  fetchClinicCampaignPricing,
  fetchClinicCampaignStatus,
  fetchClinicSubscriptionPricing,
  fetchClinicSubscriptionStatus
} from '../../services/authApi';
import { saveSessionUser } from '../../utils/authSession';

const DEFAULT_PRICING = {
  platinumPriceInRupees: 0,
  goldPriceInRupees: 1999,
  diamondPriceInRupees: 4999
};

const PLAN_BLUEPRINTS = [
  {
    id: 'platinum',
    name: 'Platinum',
    label: '(Starter)',
    priceKey: 'platinumPriceInRupees',
    features: [
      { label: 'Clinic Profile', value: 'Basic (Location, Timings and Services)' },
      { label: 'Media Uploads', value: '2 Images' },
      { label: 'Analytics', value: 'Essential' }
    ]
  },
  {
    id: 'gold',
    name: 'Gold',
    label: '(Growth)',
    priceKey: 'goldPriceInRupees',
    isPopular: true,
    features: [
      { label: 'Clinic Profile', value: 'Enhanced (Services, Labs and Facilities)' },
      { label: 'Clinic Updates System', value: 'Post offers, Announce camps' },
      { label: 'Media Uploads', value: '5 Images' },
      { label: 'Analytics', value: 'Performance Insights' }
    ]
  },
  {
    id: 'diamond',
    name: 'Diamond',
    label: '(Advanced)',
    priceKey: 'diamondPriceInRupees',
    features: [
      { label: 'Media Uploads', value: 'Unlimited Media' },
      { label: 'Advanced Analytics', value: 'Bookings Conversion' },
      { label: 'Verified Badge', value: 'Shown on Clinic Profile and Listing Cards' },
      { label: 'Priority Support', value: 'Highlighted on Clinic Profile and Listing Cards' }
    ]
  }
];

const normalizePlan = (planValue) => {
  const normalizedPlan = String(planValue || '').trim().toLowerCase();
  return ['platinum', 'gold', 'diamond'].includes(normalizedPlan) ? normalizedPlan : 'platinum';
};

const formatPrice = (value) => {
  const parsed = Number(value);
  const safe = Number.isFinite(parsed) ? Math.max(0, Math.trunc(parsed)) : 0;
  return safe.toLocaleString('en-PK');
};

const formatDate = (value) => {
  if (!value) return 'N/A';
  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) return 'N/A';
  return parsedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

export default function ClinicSubscription() {
  const [pricing, setPricing] = useState(DEFAULT_PRICING);
  const [subscription, setSubscription] = useState(null);
  const [processingPlanId, setProcessingPlanId] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);
  const [isConfirmingCheckout, setIsConfirmingCheckout] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const hasHandledCheckoutCallbackRef = useRef(false);

  const token = localStorage.getItem('clinicToken');

  const syncClinicSession = (clinicPayload) => {
    if (!clinicPayload) return;
    saveSessionUser('clinic', clinicPayload);
    window.dispatchEvent(new Event('clinic-session-updated'));
  };

  const loadSubscriptionData = async ({ showLoader = false } = {}) => {
    if (!token) return;
    try {
      if (showLoader) setIsLoading(true);
      const [pricingResponse, statusResponse] = await Promise.all([
        fetchClinicSubscriptionPricing(token),
        fetchClinicSubscriptionStatus(token)
      ]);

      const incomingPricing = pricingResponse?.pricing || {};
      setPricing({
        platinumPriceInRupees: Number(incomingPricing.platinumPriceInRupees) || 0,
        goldPriceInRupees: Number(incomingPricing.goldPriceInRupees) || 1999,
        diamondPriceInRupees: Number(incomingPricing.diamondPriceInRupees) || 4999
      });
      setSubscription(statusResponse?.subscription || null);
      syncClinicSession(statusResponse?.clinic || null);
    } catch (error) {
      toast.error(error?.message || 'Could not load clinic plans');
    } finally {
      if (showLoader) setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSubscriptionData({ showLoader: true });
  }, []);

  useEffect(() => {
    if (hasHandledCheckoutCallbackRef.current) return;
    hasHandledCheckoutCallbackRef.current = true;

    const searchParams = new URLSearchParams(window.location.search);
    const checkoutState = String(searchParams.get('checkout') || '').trim().toLowerCase();
    const sessionId = String(searchParams.get('session_id') || '').trim();

    const clearCheckoutQuery = () => {
      const nextUrl = `${window.location.pathname}${window.location.hash || ''}`;
      window.history.replaceState({}, document.title, nextUrl);
    };

    if (checkoutState === 'cancelled') {
      toast.info('Checkout was cancelled');
      clearCheckoutQuery();
      return;
    }

    if (checkoutState !== 'success' || !sessionId || !token) {
      return;
    }

    const confirmCheckout = async () => {
      try {
        setIsConfirmingCheckout(true);
        const response = await confirmClinicSubscriptionCheckoutSession(token, sessionId);
        setSubscription(response?.subscription || null);
        syncClinicSession(response?.clinic || null);
        toast.success(response?.message || 'Plan activated');
      } catch (error) {
        toast.error(error?.message || 'Could not confirm payment');
      } finally {
        setIsConfirmingCheckout(false);
        clearCheckoutQuery();
        loadSubscriptionData();
      }
    };

    confirmCheckout();
  }, [token]);

  const handlePlanCheckout = async (planId) => {
    if (!token) return;
    try {
      setProcessingPlanId(planId);
      const response = await createClinicSubscriptionCheckoutSession(token, { plan: planId });
      const checkoutUrl = String(response?.checkoutUrl || '').trim();
      if (!checkoutUrl) throw new Error('Checkout URL missing');

      const checkoutWindow = window.open(checkoutUrl, '_blank', 'noopener,noreferrer');
      if (!checkoutWindow) throw new Error('Popup blocked. Please allow popups and try again.');
      toast.info('Opening checkout...');
    } catch (error) {
      toast.error(error?.message || 'Could not start checkout');
    } finally {
      setProcessingPlanId('');
    }
  };

  const handleCancelPlan = async () => {
    if (!token) return;
    if (!window.confirm('Switch to Platinum plan?')) return;
    try {
      setIsCancelling(true);
      const response = await cancelClinicSubscription(token);
      setSubscription(response?.subscription || null);
      syncClinicSession(response?.clinic || null);
      toast.success(response?.message || 'Plan cancelled');
    } catch (error) {
      toast.error(error?.message || 'Could not cancel plan');
    } finally {
      setIsCancelling(false);
    }
  };

  const plans = useMemo(() => PLAN_BLUEPRINTS.map((plan) => ({
    ...plan,
    price: formatPrice(pricing?.[plan.priceKey] ?? DEFAULT_PRICING[plan.priceKey])
  })), [pricing]);

  const currentPlan = normalizePlan(subscription?.currentPlan);

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-10 min-w-0">
      <div className="max-w-6xl mx-auto bg-white border border-gray-100 rounded-2xl px-6 py-5">
        <p className="text-[13px] font-semibold text-gray-500">Current Clinic Plan</p>
        <h3 className="text-[26px] font-bold text-[#1F2432] mt-1 capitalize">{currentPlan}</h3>
        <p className="text-[13px] text-gray-500 mt-1">
          {subscription?.isPaidPlanActive
            ? `Expires on ${formatDate(subscription?.planExpiresAt)} (${subscription?.daysRemaining || 0} days left).`
            : 'You are on the free Platinum plan.'}
        </p>
      </div>

      {isLoading ? (
        <div className="max-w-6xl mx-auto p-6 bg-gray-50 rounded-2xl border border-gray-100 text-center">
          <p className="text-[14px] font-semibold text-[#6B7280]">Loading plans...</p>
        </div>
      ) : null}

      {isConfirmingCheckout ? (
        <div className="max-w-6xl mx-auto p-4 bg-[#1EBDB8]/10 rounded-2xl border border-[#1EBDB8]/20 text-[#0F766E] text-[13px] font-semibold">
          Confirming your payment...
        </div>
      ) : null}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto items-stretch px-4 min-w-0">
        {plans.map((plan) => {
          const isCurrent = currentPlan === plan.id;
          const isPlatinum = plan.id === 'platinum';
          const showCancel = !isPlatinum && isCurrent && Boolean(subscription?.isPaidPlanActive);
          const buttonLabel = isPlatinum
            ? (isCurrent ? 'Current Plan' : 'Free Plan')
            : currentPlan === 'platinum'
              ? `Choose ${plan.name}`
              : showCancel
                ? 'Cancel Plan'
                : `Switch to ${plan.name}`;

          return (
            <div key={plan.id} className="flex flex-col h-full group min-w-0">
              {plan.isPopular ? (
                <div className="bg-[#1EBDB8] text-white text-[11px] font-bold py-2 px-6 rounded-t-2xl text-center uppercase tracking-wider shrink-0">
                  Most Popular
                </div>
              ) : (
                <div className="h-[35px] shrink-0" />
              )}

              <div className={`flex-1 bg-[#1F2432] p-6 lg:p-8 flex flex-col relative transition-all duration-300 border border-white/5 hover:border-[#1EBDB8]/40 hover:shadow-2xl min-w-0 ${plan.isPopular ? 'rounded-b-2xl ring-1 ring-[#1EBDB8]/10' : 'rounded-2xl'}`}>
                <div className="mb-6 lg:mb-8 text-left min-w-0">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2 min-w-0">
                    <h3 className="text-lg lg:text-xl font-semibold text-white truncate">{plan.name} {plan.label}</h3>
                    {isCurrent && (
                      <span className="text-[10px] font-bold text-[#1EBDB8] bg-[#1EBDB8]/10 px-2 py-0.5 rounded-md uppercase tracking-wider border border-[#1EBDB8]/20 shrink-0">
                        Active
                      </span>
                    )}
                  </div>
                  <div className="flex items-baseline gap-1 mt-4">
                    <span className="text-3xl font-bold text-white leading-none">Rs {plan.price}</span>
                    <span className="text-xs font-medium text-white/50">/mo</span>
                  </div>
                </div>

                <div className="h-px bg-white/5 w-full mb-6 lg:mb-8" />

                <ul className="space-y-3 lg:space-y-4 mb-8 lg:mb-10 flex-1 min-w-0">
                  {plan.features.map((feature) => (
                    <li key={`${plan.id}-${feature.label}`} className="flex items-start gap-2.5 min-w-0">
                      <div className="shrink-0 w-4 h-4 lg:w-5 lg:h-5 rounded-full bg-white/5 flex items-center justify-center text-[#1EBDB8] border border-white/10 mt-0.5">
                        <svg width="10" height="10" className="lg:w-[12px] lg:h-[12px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>
                      <span className="text-[13px] lg:text-[14px] text-white/80 font-normal leading-[1.4] break-words">
                        {feature.label}: <span className="font-semibold text-white">{feature.value}</span>
                      </span>
                    </li>
                  ))}
                </ul>

                {isPlatinum ? (
                  <button className="w-full py-3 lg:py-3.5 rounded-xl font-semibold text-xs lg:text-sm bg-white/5 text-white/30 cursor-default border border-white/5">
                    {buttonLabel}
                  </button>
                ) : (
                  <button
                    onClick={() => (showCancel ? handleCancelPlan() : handlePlanCheckout(plan.id))}
                    disabled={processingPlanId === plan.id || isConfirmingCheckout || isCancelling}
                    className="w-full py-3 lg:py-3.5 rounded-xl font-semibold text-xs lg:text-sm bg-[#1EBDB8] text-white hover:bg-[#1CAAAE] shadow-lg hover:shadow-[#1EBDB8]/30 hover:-translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {processingPlanId === plan.id || isCancelling ? 'Processing...' : buttonLabel}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-12 bg-[#1F2433] p-8 rounded-3xl border border-white/5 relative overflow-hidden group max-w-6xl mx-auto shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <CampaignManager
            tokenKey="clinicToken"
            title="Clinic Campaign Manager"
            description="Promote your clinic and services with sponsored placement to reach more patients in your area."
            buttonLabel="Launch Campaign"
            fetchPricing={fetchClinicCampaignPricing}
            fetchStatus={fetchClinicCampaignStatus}
            createCheckoutSession={createClinicCampaignCheckoutSession}
            confirmCheckoutSession={confirmClinicCampaignCheckoutSession}
            buttonClassName="whitespace-nowrap px-8 py-3.5 bg-[#1EBDB8] text-white text-sm font-semibold rounded-xl hover:bg-[#1CAAAE] transition-all shadow-lg active:scale-95"
          />
        </div>
      </div>
    </div>
  );
}
