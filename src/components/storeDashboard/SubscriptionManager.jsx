import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import {
  cancelStoreSubscription,
  confirmStoreSubscriptionCheckoutSession,
  createStoreSubscriptionCheckoutSession,
  fetchStoreSubscriptionPricing,
  fetchStoreSubscriptionStatus
} from '../../services/authApi';
import { saveSessionUser } from '../../utils/authSession';

const DEFAULT_PRICING = {
  platinumPriceInRupees: 0,
  goldPriceInRupees: 1499,
  diamondPriceInRupees: 3999
};

const DEFAULT_SUBSCRIPTION = {
  currentPlan: 'platinum',
  subscriptionStatus: 'active',
  planActivatedAt: null,
  planExpiresAt: null,
  planCancelledAt: null,
  lastPlanPaymentAt: null,
  isPaidPlanActive: false,
  daysRemaining: 0
};

const PLAN_BLUEPRINTS = [
  {
    id: 'platinum',
    name: 'Platinum',
    label: '(Basic)',
    priceKey: 'platinumPriceInRupees',
    features: [
      { label: 'Ranking Boost', value: 'Low' },
      { label: 'Inventory Display', value: 'Up to 50 Products' },
      { label: 'Media Uploads', value: '2 Images' },
      { label: 'Promotion Ads', value: 'No' },
      { label: 'Delivery Tracking', value: 'Manual' },
      { label: 'Analytics', value: 'Basic' },
    ],
  },
  {
    id: 'gold',
    name: 'Gold',
    label: '(Pro)',
    priceKey: 'goldPriceInRupees',
    features: [
      { label: 'Ranking Boost', value: 'Medium' },
      { label: 'Inventory Display', value: 'Up to 500 Products' },
      { label: 'Media Uploads', value: '5 Images + 1 Video' },
      { label: 'Promotion Ads', value: 'Limited' },
      { label: 'Delivery Tracking', value: 'Standard' },
      { label: 'Analytics', value: 'Standard' },
    ],
    isPopular: true
  },
  {
    id: 'diamond',
    name: 'Diamond',
    label: '(Premium)',
    priceKey: 'diamondPriceInRupees',
    features: [
      { label: 'Ranking Boost', value: 'Extra High' },
      { label: 'Inventory Display', value: 'Unlimited Products' },
      { label: 'Media Uploads', value: 'Unlimited Media' },
      { label: 'Promotion Ads', value: 'Full Control' },
      { label: 'Delivery Tracking', value: 'Priority' },
      { label: 'Analytics', value: 'Advanced' },
    ],
  },
];

const normalizePlan = (planValue) => {
  const normalizedPlan = String(planValue || '').trim().toLowerCase();
  return ['platinum', 'gold', 'diamond'].includes(normalizedPlan) ? normalizedPlan : 'platinum';
};

const formatPlanPrice = (value) => {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) return '0';
  return Math.max(0, Math.trunc(numericValue)).toLocaleString('en-PK');
};

const formatPlanLabel = (planValue) => {
  const normalizedPlan = normalizePlan(planValue);
  return normalizedPlan.charAt(0).toUpperCase() + normalizedPlan.slice(1);
};

const formatDateLabel = (value) => {
  if (!value) return 'N/A';
  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) return 'N/A';
  return parsedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

export default function SubscriptionManager() {
  const [pricing, setPricing] = useState(DEFAULT_PRICING);
  const [subscription, setSubscription] = useState(DEFAULT_SUBSCRIPTION);
  const [isLoading, setIsLoading] = useState(true);
  const [processingPlanId, setProcessingPlanId] = useState('');
  const [isCancellingPlan, setIsCancellingPlan] = useState(false);
  const [isConfirmingCheckout, setIsConfirmingCheckout] = useState(false);
  const hasHandledCheckoutCallbackRef = useRef(false);
  const checkoutPollingIntervalRef = useRef(null);

  const syncStoreSession = useCallback((storePayload) => {
    if (!storePayload) return;
    saveSessionUser('medicalStore', storePayload);
    window.dispatchEvent(new Event('medical-store-session-updated'));
  }, []);

  const stopCheckoutPolling = useCallback(() => {
    if (checkoutPollingIntervalRef.current) {
      window.clearInterval(checkoutPollingIntervalRef.current);
      checkoutPollingIntervalRef.current = null;
    }
  }, []);

  const loadSubscriptionData = useCallback(async ({ showLoading = false, showErrorToast = true } = {}) => {
    const token = localStorage.getItem('medicalStoreToken');
    if (!token) {
      setPricing(DEFAULT_PRICING);
      setSubscription(DEFAULT_SUBSCRIPTION);
      setIsLoading(false);
      return;
    }

    try {
      if (showLoading) setIsLoading(true);
      const [pricingResponse, statusResponse] = await Promise.all([
        fetchStoreSubscriptionPricing(),
        fetchStoreSubscriptionStatus(token)
      ]);

      const incomingPricing = pricingResponse?.pricing || {};
      const incomingSubscription = statusResponse?.subscription || {};

      setPricing({
        platinumPriceInRupees: Number(incomingPricing.platinumPriceInRupees) || 0,
        goldPriceInRupees: Number(incomingPricing.goldPriceInRupees) || 1499,
        diamondPriceInRupees: Number(incomingPricing.diamondPriceInRupees) || 3999
      });

      setSubscription({
        currentPlan: normalizePlan(incomingSubscription?.currentPlan),
        subscriptionStatus: String(incomingSubscription?.subscriptionStatus || 'active').trim().toLowerCase(),
        planActivatedAt: incomingSubscription?.planActivatedAt || null,
        planExpiresAt: incomingSubscription?.planExpiresAt || null,
        planCancelledAt: incomingSubscription?.planCancelledAt || null,
        lastPlanPaymentAt: incomingSubscription?.lastPlanPaymentAt || null,
        isPaidPlanActive: Boolean(incomingSubscription?.isPaidPlanActive),
        daysRemaining: Math.max(0, Math.trunc(Number(incomingSubscription?.daysRemaining || 0)))
      });

      syncStoreSession(statusResponse?.store || null);
    } catch (error) {
      if (showErrorToast) toast.error(error?.message || 'Could not load subscription details');
    } finally {
      if (showLoading) setIsLoading(false);
    }
  }, [syncStoreSession]);

  const startCheckoutPolling = useCallback(() => {
    stopCheckoutPolling();
    let pollingAttempts = 0;
    checkoutPollingIntervalRef.current = window.setInterval(() => {
      pollingAttempts += 1;
      loadSubscriptionData({ showLoading: false, showErrorToast: false });
      if (pollingAttempts >= 24) stopCheckoutPolling();
    }, 5000);
  }, [loadSubscriptionData, stopCheckoutPolling]);

  useEffect(() => {
    loadSubscriptionData({ showLoading: true, showErrorToast: true });
    return () => stopCheckoutPolling();
  }, [loadSubscriptionData, stopCheckoutPolling]);

  useEffect(() => {
    if (hasHandledCheckoutCallbackRef.current) return;
    hasHandledCheckoutCallbackRef.current = true;

    const token = localStorage.getItem('medicalStoreToken');
    const searchParams = new URLSearchParams(window.location.search);
    const checkoutState = String(searchParams.get('checkout') || '').trim().toLowerCase();
    const sessionId = String(searchParams.get('session_id') || '').trim();

    const clearCheckoutQuery = () => {
      const nextUrl = window.location.pathname + (window.location.hash || '');
      window.history.replaceState({}, document.title, nextUrl);
    };

    if (checkoutState === 'cancelled') {
        toast.info('Stripe checkout was cancelled');
        clearCheckoutQuery();
        return;
    }

    if (checkoutState !== 'success' || !sessionId || !token) return;

    const confirmCheckout = async () => {
      try {
        setIsConfirmingCheckout(true);
        const response = await confirmStoreSubscriptionCheckoutSession(token, sessionId);
        const incomingSubscription = response?.subscription || {};

        setSubscription({
          currentPlan: normalizePlan(incomingSubscription?.currentPlan),
          subscriptionStatus: String(incomingSubscription?.subscriptionStatus || 'active').trim().toLowerCase(),
          planActivatedAt: incomingSubscription?.planActivatedAt || null,
          planExpiresAt: incomingSubscription?.planExpiresAt || null,
          planCancelledAt: incomingSubscription?.planCancelledAt || null,
          lastPlanPaymentAt: incomingSubscription?.lastPlanPaymentAt || null,
          isPaidPlanActive: Boolean(incomingSubscription?.isPaidPlanActive),
          daysRemaining: Math.max(0, Math.trunc(Number(incomingSubscription?.daysRemaining || 0)))
        });
        syncStoreSession(response?.store || null);
        toast.success(response?.message || 'Subscription confirmed!');
      } catch (error) {
        toast.error(error?.message || 'Could not confirm payment');
      } finally {
        setIsConfirmingCheckout(false);
        clearCheckoutQuery();
        stopCheckoutPolling();
        loadSubscriptionData({ showLoading: false, showErrorToast: false });
      }
    };
    confirmCheckout();
  }, [loadSubscriptionData, stopCheckoutPolling, syncStoreSession]);

  const handlePlanCheckout = async (planId) => {
    const token = localStorage.getItem('medicalStoreToken');
    if (!token) return toast.error('Please login again');

    try {
      setProcessingPlanId(planId);
      const response = await createStoreSubscriptionCheckoutSession(token, { plan: planId });
      const checkoutUrl = response?.checkoutUrl;
      if (!checkoutUrl) throw new Error('Checkout URL missing');
      
      const win = window.open(checkoutUrl, '_blank', 'noopener,noreferrer');
      if (!win) throw new Error('Popup blocked. Please allow popups.');
      
      toast.info('Opening Stripe Checkout...');
      startCheckoutPolling();
    } catch (error) {
      toast.error(error?.message || 'Payment error');
    } finally {
      setProcessingPlanId('');
    }
  };

  const handleCancelPlan = async () => {
    const token = localStorage.getItem('medicalStoreToken');
    if (!token) return;
    if (!window.confirm('Switch back to Platinum?')) return;

    try {
      setIsCancellingPlan(true);
      const response = await cancelStoreSubscription(token);
      const subs = response?.subscription || {};

      setSubscription({
        currentPlan: normalizePlan(subs.currentPlan),
        subscriptionStatus: String(subs.subscriptionStatus || 'active').trim().toLowerCase(),
        planActivatedAt: subs.planActivatedAt || null,
        planExpiresAt: subs.planExpiresAt || null,
        planCancelledAt: subs.planCancelledAt || null,
        lastPlanPaymentAt: subs.lastPlanPaymentAt || null,
        isPaidPlanActive: Boolean(subs.isPaidPlanActive),
        daysRemaining: Math.max(0, Math.trunc(Number(subs.daysRemaining || 0)))
      });
      syncStoreSession(response?.store || null);
      toast.success('Subscription cancelled');
    } catch (error) {
      toast.error(error?.message || 'Error cancelling');
    } finally {
      setIsCancellingPlan(false);
    }
  };

  const plans = useMemo(() => {
    return PLAN_BLUEPRINTS.map(p => ({
      ...p,
      price: formatPlanPrice(pricing?.[p.priceKey] ?? DEFAULT_PRICING[p.priceKey])
    }));
  }, [pricing]);

  const currentPlan = normalizePlan(subscription.currentPlan);
  const currentPlanLabel = formatPlanLabel(currentPlan);

  return (
    <div className="py-4 sm:py-6 lg:py-8 px-0 sm:px-2 space-y-6">
      <div className="max-w-[1340px] mx-auto bg-white border border-gray-100 shadow-[0_2px_10px_rgb(0,0,0,0.02)] rounded-2xl px-5 py-4 sm:px-6 sm:py-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <p className="text-[13px] font-semibold text-gray-500">Current Store Subscription</p>
          <h3 className="text-[24px] font-bold text-[#1F2432] mt-0.5">{currentPlanLabel} Plan</h3>
          <p className="text-[13px] text-gray-500 mt-1">
            {subscription.isPaidPlanActive
              ? `Expires on ${formatDateLabel(subscription.planExpiresAt)} (${subscription.daysRemaining} days left).`
              : 'You are on the free Platinum plan.'}
          </p>
        </div>
      </div>

      {isLoading && (
        <div className="max-w-[1340px] mx-auto p-6 bg-gray-50 rounded-2xl border border-gray-100 text-center">
          <p className="text-[14px] font-semibold text-[#6B7280]">Loading details...</p>
        </div>
      )}

      {isConfirmingCheckout && (
        <div className="max-w-[1340px] mx-auto p-4 bg-[#1EBDB8]/10 rounded-2xl border border-[#1EBDB8]/20 text-[#0F766E] text-[13px] font-semibold">
          Confirming payment...
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-4 lg:gap-8 max-w-[1340px] mx-auto items-stretch">
        {plans.map((plan, idx) => {
          const isCurrent = currentPlan === plan.id;
          const isPlatinum = plan.id === 'platinum';
          const isProc = processingPlanId === plan.id;
          const showCancel = !isPlatinum && isCurrent && subscription.isPaidPlanActive;
          const btnLabel = isPlatinum ? (isCurrent ? 'Current' : 'Free') : currentPlan === 'platinum' ? 'Subscribe' : showCancel ? 'Cancel' : 'Upgrade';

          return (
            <div key={idx} className="flex flex-col h-full group pt-10">
              <div className={`flex-1 bg-[#1F2432] flex flex-col relative transition-all duration-300 border border-white/5 hover:border-[#1EBDB8]/40 hover:shadow-2xl rounded-[32px] overflow-hidden ${plan.isPopular ? 'ring-2 ring-[#1EBDB8]/30 md:-mt-10 md:mb-0' : ''}`}>
                {plan.isPopular && <div className="bg-[#1EBDB8] text-white text-[12px] font-bold py-4 text-center uppercase tracking-widest">Most Popular</div>}
                
                <div className="flex-1 p-6 xl:p-8 flex flex-col">
                  <div className="mb-6 mr-2">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-[24px] font-bold text-white">{plan.name}</h3>
                      {isCurrent && <span className="text-[10px] font-bold text-[#1EBDB8] bg-[#1EBDB8]/10 px-2 py-1 rounded-full border border-[#1EBDB8]/20">ACTIVE</span>}
                    </div>
                    <div className="mt-4 flex items-baseline gap-1">
                      <span className="text-[36px] xl:text-[44px] font-bold text-white">Rs {plan.price}</span>
                      <span className="text-[14px] font-medium text-white/30">/month</span>
                    </div>
                  </div>

                  <div className="h-px bg-white/10 w-full mb-8" />

                  <ul className="space-y-4 mb-10 flex-1">
                    {plan.features.map((f, fi) => (
                      <li key={fi} className="flex items-start gap-3">
                        <div className={`shrink-0 w-5 h-5 rounded-full flex items-center justify-center border mt-0.5 ${f.value === 'No' ? 'bg-white/5 text-white/20 border-white/10' : 'bg-[#1EBDB8]/10 text-[#1EBDB8] border-[#1EBDB8]/20'}`}>
                          {f.value === 'No' ? <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg> : <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><polyline points="20 6 9 17 4 12"/></svg>}
                        </div>
                        <div className="flex flex-col">
                          <span className={`text-[12px] font-medium ${f.value === 'No' ? 'text-white/25' : 'text-white/45'}`}>{f.label}</span>
                          <span className={`text-[15px] font-semibold ${f.value === 'No' ? 'text-white/15' : 'text-white/90'}`}>{f.value}</span>
                        </div>
                      </li>
                    ))}
                  </ul>

                  {!isPlatinum && (
                    <button
                      onClick={() => showCancel ? handleCancelPlan() : handlePlanCheckout(plan.id)}
                      disabled={isProc || isConfirmingCheckout || isCancellingPlan}
                      className={`w-full py-4 rounded-2xl font-bold text-[16px] transition-all duration-300 hover:-translate-y-1 active:scale-95 disabled:opacity-50 ${showCancel ? 'bg-red-500 text-white shadow-lg shadow-red-500/20' : 'bg-[#1EBDB8] text-white shadow-lg shadow-[#1EBDB8]/20 text-white'}`}
                    >
                      {isProc || isCancellingPlan ? 'Processing...' : btnLabel}
                    </button>
                  )}
                  {isPlatinum && (
                    <div className="flex justify-center mt-2">
                       <span className="text-white/20 font-bold text-[14px]">Free Forever</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="mt-10 bg-[#1F2432] p-10 rounded-[32px] border border-white/5 flex flex-col md:flex-row items-center justify-between gap-8 max-w-[1340px] mx-auto relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#1EBDB8]/5 blur-[80px] rounded-full -mr-32 -mt-32" />
        <div className="relative z-10 text-center md:text-left">
          <h3 className="text-[26px] font-bold text-white mb-2">Store Ads & Promotions</h3>
          <p className="text-white/50 text-[16px] max-w-xl">Boost your pharmacy's visibility with featured listings and targeted campaigns to reach more customers.</p>
        </div>
        <button className="relative z-10 px-8 py-4 bg-[#1EBDB8] text-white font-bold rounded-2xl hover:bg-[#1CAAAE] transition-all shadow-xl shadow-[#1EBDB8]/20">Create Campaign</button>
      </div>
    </div>
  );
}
