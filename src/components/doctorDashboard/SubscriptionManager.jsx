import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import {
  cancelDoctorSubscription,
  confirmDoctorSubscriptionCheckoutSession,
  createDoctorSubscriptionCheckoutSession,
  fetchDoctorSubscriptionPricing,
  fetchDoctorSubscriptionStatus
} from '../../services/authApi';
import { saveSessionUser } from '../../utils/authSession';

const DEFAULT_PRICING = {
  platinumPriceInRupees: 0,
  goldPriceInRupees: 999,
  diamondPriceInRupees: 2999
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
      { label: 'Media Uploads', value: '2 Images' },
      { label: 'Video Calls', value: 'No' },
      { label: 'Live Streaming', value: 'No' },
      { label: 'Ads Manager', value: 'Limited' },
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
      { label: 'Media Uploads', value: '5 Images + 1 Video' },
      { label: 'Video Calls', value: 'Yes (1-on-1)' },
      { label: 'Live Streaming', value: 'No' },
      { label: 'Ads Manager', value: 'Standard' },
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
      { label: 'Ranking Boost', value: 'High' },
      { label: 'Media Uploads', value: 'Unlimited Media' },
      { label: 'Video Calls', value: 'Yes (1-on-1)' },
      { label: 'Live Streaming', value: 'Yes (Multi-Guest)' },
      { label: 'Ads Manager', value: 'Full Control' },
      { label: 'Analytics', value: 'Advanced' },
    ],
  },
];

const normalizePlan = (planValue) => {
  const normalizedPlan = String(planValue || '').trim().toLowerCase();
  return ['platinum', 'gold', 'diamond'].includes(normalizedPlan) ? normalizedPlan : 'platinum';
};

const readIncomingPrice = (pricingPayload, key, legacyKey, fallbackValue) => {
  const candidateValue = pricingPayload?.[key] ?? pricingPayload?.[legacyKey];
  const numericValue = Number(candidateValue);

  if (!Number.isFinite(numericValue)) {
    return fallbackValue;
  }

  return Math.max(0, Math.trunc(numericValue));
};

const formatPlanPrice = (value) => {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return '0';
  }

  return Math.max(0, Math.trunc(numericValue)).toLocaleString('en-PK');
};

const formatPlanLabel = (planValue) => {
  const normalizedPlan = normalizePlan(planValue);
  return normalizedPlan.charAt(0).toUpperCase() + normalizedPlan.slice(1);
};

const formatDateLabel = (value) => {
  if (!value) {
    return 'N/A';
  }

  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    return 'N/A';
  }

  return parsedDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
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

  const syncDoctorSession = useCallback((doctorPayload) => {
    if (!doctorPayload) {
      return;
    }

    saveSessionUser('doctor', doctorPayload);
    window.dispatchEvent(new Event('doctor-session-updated'));
  }, []);

  const stopCheckoutPolling = useCallback(() => {
    if (checkoutPollingIntervalRef.current) {
      window.clearInterval(checkoutPollingIntervalRef.current);
      checkoutPollingIntervalRef.current = null;
    }
  }, []);

  const loadSubscriptionData = useCallback(async ({ showLoading = false, showErrorToast = true } = {}) => {
    const doctorToken = localStorage.getItem('doctorToken');

    if (!doctorToken) {
      setPricing(DEFAULT_PRICING);
      setSubscription(DEFAULT_SUBSCRIPTION);
      setIsLoading(false);
      return;
    }

    try {
      if (showLoading) {
        setIsLoading(true);
      }

      const [pricingResponse, statusResponse] = await Promise.all([
        fetchDoctorSubscriptionPricing(doctorToken),
        fetchDoctorSubscriptionStatus(doctorToken)
      ]);
      const incomingPricing = pricingResponse?.pricing || {};
      const incomingSubscription = statusResponse?.subscription || {};

      setPricing({
        platinumPriceInRupees: readIncomingPrice(
          incomingPricing,
          'platinumPriceInRupees',
          'platinumPriceInUsd',
          DEFAULT_PRICING.platinumPriceInRupees
        ),
        goldPriceInRupees: readIncomingPrice(
          incomingPricing,
          'goldPriceInRupees',
          'goldPriceInUsd',
          DEFAULT_PRICING.goldPriceInRupees
        ),
        diamondPriceInRupees: readIncomingPrice(
          incomingPricing,
          'diamondPriceInRupees',
          'diamondPriceInUsd',
          DEFAULT_PRICING.diamondPriceInRupees
        )
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

      syncDoctorSession(statusResponse?.doctor || null);
    } catch (error) {
      if (showErrorToast) {
        toast.error(error?.message || 'Could not load subscription details');
      }
    } finally {
      if (showLoading) {
        setIsLoading(false);
      }
    }
  }, [syncDoctorSession]);

  const startCheckoutPolling = useCallback(() => {
    stopCheckoutPolling();

    let pollingAttempts = 0;

    checkoutPollingIntervalRef.current = window.setInterval(() => {
      pollingAttempts += 1;
      loadSubscriptionData({ showLoading: false, showErrorToast: false });

      if (pollingAttempts >= 24) {
        stopCheckoutPolling();
      }
    }, 5000);
  }, [loadSubscriptionData, stopCheckoutPolling]);

  useEffect(() => {
    loadSubscriptionData({ showLoading: true, showErrorToast: true });

    return () => {
      stopCheckoutPolling();
    };
  }, [loadSubscriptionData, stopCheckoutPolling]);

  useEffect(() => {
    if (hasHandledCheckoutCallbackRef.current) {
      return;
    }

    hasHandledCheckoutCallbackRef.current = true;

    const doctorToken = localStorage.getItem('doctorToken');
    const searchParams = new URLSearchParams(window.location.search);
    const checkoutState = String(searchParams.get('checkout') || '').trim().toLowerCase();
    const sessionId = String(searchParams.get('session_id') || '').trim();

    const clearCheckoutQuery = () => {
      const nextUrl = `${window.location.pathname}${window.location.hash || ''}`;
      window.history.replaceState({}, document.title, nextUrl);
    };

    if (checkoutState === 'cancelled') {
      toast.info('Stripe checkout was cancelled');
      clearCheckoutQuery();
      return;
    }

    if (checkoutState !== 'success' || !sessionId || !doctorToken) {
      return;
    }

    const confirmCheckout = async () => {
      try {
        setIsConfirmingCheckout(true);
        const response = await confirmDoctorSubscriptionCheckoutSession(doctorToken, sessionId);
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
        syncDoctorSession(response?.doctor || null);
        toast.success(response?.message || 'Subscription payment confirmed successfully');
      } catch (error) {
        toast.error(error?.message || 'Could not confirm subscription payment');
      } finally {
        setIsConfirmingCheckout(false);
        clearCheckoutQuery();
        stopCheckoutPolling();
        loadSubscriptionData({ showLoading: false, showErrorToast: false });
      }
    };

    confirmCheckout();
  }, [loadSubscriptionData, stopCheckoutPolling, syncDoctorSession]);

  const handlePlanCheckout = async (planId) => {
    const doctorToken = localStorage.getItem('doctorToken');

    if (!doctorToken) {
      toast.error('Please login again to continue');
      return;
    }

    try {
      setProcessingPlanId(planId);
      const response = await createDoctorSubscriptionCheckoutSession(doctorToken, { plan: planId });
      const checkoutUrl = String(response?.checkoutUrl || '').trim();

      if (!checkoutUrl) {
        throw new Error('Stripe checkout URL is missing');
      }

      const checkoutWindow = window.open(checkoutUrl, '_blank', 'noopener,noreferrer');

      if (!checkoutWindow) {
        throw new Error('Popup was blocked. Please allow popups and try again.');
      }

      toast.info('Loading...');
      startCheckoutPolling();
    } catch (error) {
      toast.error(error?.message || 'Could not open Stripe checkout');
    } finally {
      setProcessingPlanId('');
    }
  };

  const handleCancelPlan = async () => {
    const doctorToken = localStorage.getItem('doctorToken');

    if (!doctorToken) {
      toast.error('Please login again to continue');
      return;
    }

    const shouldCancel = window.confirm('Cancel your current paid plan and switch back to Platinum?');

    if (!shouldCancel) {
      return;
    }

    try {
      setIsCancellingPlan(true);
      const response = await cancelDoctorSubscription(doctorToken);
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
      syncDoctorSession(response?.doctor || null);
      toast.success(response?.message || 'Subscription cancelled successfully');
    } catch (error) {
      toast.error(error?.message || 'Could not cancel plan');
    } finally {
      setIsCancellingPlan(false);
    }
  };

  const plans = useMemo(() => {
    return PLAN_BLUEPRINTS.map((plan) => ({
      ...plan,
      price: formatPlanPrice(pricing?.[plan.priceKey] ?? DEFAULT_PRICING[plan.priceKey])
    }));
  }, [pricing]);

  const currentPlan = normalizePlan(subscription.currentPlan);
  const currentPlanLabel = formatPlanLabel(currentPlan);

  return (
    <div className="py-4 sm:py-6 lg:py-8 px-0 sm:px-2 space-y-6">
      <div className="max-w-[1340px] mx-auto bg-white border border-gray-100 shadow-[0_2px_10px_rgb(0,0,0,0.02)] rounded-2xl px-5 py-4 sm:px-6 sm:py-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <p className="text-[13px] font-semibold text-gray-500">Current Subscription</p>
          <h3 className="text-[24px] font-bold text-[#1F2432] mt-0.5">{currentPlanLabel} Plan</h3>
          <p className="text-[13px] text-gray-500 mt-1">
            {subscription.isPaidPlanActive
              ? `Expires on ${formatDateLabel(subscription.planExpiresAt)} (${subscription.daysRemaining} day${subscription.daysRemaining === 1 ? '' : 's'} left).`
              : 'You are on the free Platinum plan.'}
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="max-w-[1340px] mx-auto p-6 bg-gray-50 rounded-2xl border border-gray-100 text-center">
          <p className="text-[14px] font-semibold text-[#6B7280]">Loading subscription details...</p>
        </div>
      ) : null}

      {isConfirmingCheckout ? (
        <div className="max-w-[1340px] mx-auto p-4 bg-[#1EBDB8]/10 rounded-2xl border border-[#1EBDB8]/20 text-[#0F766E] text-[13px] font-semibold">
          Confirming your Stripe payment. Please wait...
        </div>
      ) : null}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-4 lg:gap-5 xl:gap-8 max-w-[1340px] mx-auto items-stretch">
        {plans.map((plan, idx) => {
          const isCurrentPlan = currentPlan === plan.id;
          const isPlatinumPlan = plan.id === 'platinum';
          const isProcessingThisPlan = processingPlanId === plan.id;
          const showCancelAction = !isPlatinumPlan && isCurrentPlan && subscription.isPaidPlanActive;
          const planButtonLabel = isPlatinumPlan
            ? (isCurrentPlan ? 'Already using' : 'Free plan')
            : currentPlan === 'platinum'
              ? 'Buy now'
              : showCancelAction
                ? 'Cancel'
                : 'Update Plan';

          return (
            <div key={idx} className="flex flex-col h-full group pt-10">
              <div className={`flex-1 bg-[#1F2432] flex flex-col relative transition-all duration-300 border border-white/5 hover:border-[#1EBDB8]/40 hover:shadow-2xl rounded-[24px] sm:rounded-[32px] overflow-hidden ${plan.isPopular ? 'ring-2 ring-[#1EBDB8]/30 md:-mt-10 md:mb-0' : 'mt-0'}`}>
                {plan.isPopular ? (
                  <div className="bg-[#1EBDB8] text-white text-[11px] xl:text-[12px] font-bold py-3.5 sm:py-4 xl:py-4.5 text-center uppercase tracking-[0.2em] shadow-lg shrink-0">
                    Most Popular
                  </div>
                ) : null}

                <div className="flex-1 p-5 md:p-4 lg:p-5 xl:p-8 flex flex-col">
                  <div className="mb-5 sm:mb-8">
                    <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-2 mb-2">
                      <div className="flex items-baseline gap-1.5 flex-wrap min-w-0">
                        <h3 className="text-[18px] md:text-[16px] lg:text-[18px] xl:text-[24px] font-bold text-white tracking-tight leading-none break-words">{plan.name}</h3>
                        <span className="text-[11px] md:text-[10px] lg:text-[11px] xl:text-[14px] text-white/30 font-medium">{plan.label}</span>
                      </div>
                      {isCurrentPlan ? (
                        <span className="inline-block self-start xl:self-auto text-[8px] xl:text-[9px] font-bold text-[#1EBDB8] bg-[#1EBDB8]/10 px-2 py-1 rounded-full uppercase tracking-wider border border-[#1EBDB8]/20 shrink-0">
                          Active
                        </span>
                      ) : null}
                    </div>
                    <div className="mt-4 sm:mt-6 flex flex-col xl:flex-row xl:items-baseline gap-1">
                      <span className="text-[24px] md:text-[22px] lg:text-[28px] xl:text-[44px] font-bold text-white leading-none tracking-tight">Rs {plan.price}</span>
                      <span className="text-[11px] md:text-[10px] lg:text-[12px] xl:text-[15px] font-medium text-white/30 tracking-tight">/month</span>
                    </div>
                  </div>

                  <div className="h-px bg-white/10 w-full mb-6 sm:mb-8" />

                  <ul className="space-y-3 sm:space-y-4 mb-8 sm:mb-10 flex-1">
                    {plan.features.map((feature, fidx) => (
                      <li key={fidx} className="flex items-start gap-2.5 xl:gap-3.5">
                        <div className={`shrink-0 w-3.5 h-3.5 sm:w-4 sm:h-4 xl:w-5 xl:h-5 rounded-full flex items-center justify-center border mt-0.5 ${feature.value === 'No' ? 'bg-white/5 text-white/20 border-white/10' : 'bg-[#1EBDB8]/10 text-[#1EBDB8] border-[#1EBDB8]/20'}`}>
                          {feature.value === 'No' ? (
                            <svg width="7" height="7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                            </svg>
                          ) : (
                            <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          )}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className={`text-[10px] md:text-[9px] lg:text-[11px] xl:text-[13px] font-medium leading-[1.3] ${feature.value === 'No' ? 'text-white/25' : 'text-white/45'}`}>{feature.label}</span>
                          <span className={`text-[12px] md:text-[11px] lg:text-[12px] xl:text-[15px] font-semibold leading-[1.4] break-words ${feature.value === 'No' ? 'text-white/15' : 'text-white/90'}`}>{feature.value}</span>
                        </div>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-auto pt-4">
                    {isPlatinumPlan ? (
                      <div className="flex justify-center">
                        <div className="w-[104px] h-[104px] rounded-full border-2 border-white/10 flex items-center justify-center text-center p-2 bg-white/5 shrink-0">
                          <span className="text-[11px] font-bold text-white/30 leading-tight">{planButtonLabel}</span>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          if (showCancelAction) {
                            handleCancelPlan();
                            return;
                          }

                          handlePlanCheckout(plan.id);
                        }}
                        disabled={isProcessingThisPlan || isConfirmingCheckout || isCancellingPlan}
                        className={`w-full py-3.5 md:py-3 lg:py-4 xl:py-4.5 rounded-[14px] md:rounded-[16px] lg:rounded-[20px] xl:rounded-[24px] font-bold text-[15px] md:text-[13px] lg:text-[15px] xl:text-[17px] transition-all duration-300 hover:-translate-y-1 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 ${showCancelAction ? 'bg-red-500 text-white hover:bg-red-600 shadow-[0_12px_24px_-8px_rgba(239,68,68,0.45)]' : 'bg-[#1EBDB8] text-white hover:bg-[#1CAAAE] shadow-[0_12px_24px_-8px_rgba(30,189,184,0.4)]'}`}
                      >
                        {showCancelAction
                          ? (isCancellingPlan ? 'Cancelling...' : planButtonLabel)
                          : isProcessingThisPlan
                            ? 'Loading...'
                            : planButtonLabel}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-10 bg-[#1F2432] p-8 sm:p-10 rounded-[32px] border border-white/5 flex flex-col lg:flex-row items-center justify-between gap-8 max-w-7xl mx-auto overflow-hidden relative group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#1EBDB8]/5 blur-[80px] rounded-full -mr-32 -mt-32" />
        <div className="relative z-10 text-center lg:text-left">
          <h3 className="text-[26px] font-bold text-white mb-3 tracking-tight">Ads & Promotion Manager</h3>
          <p className="text-white/60 text-[16px] max-w-2xl leading-relaxed">Boost your profile visibility and attract more patients with targeted medical ads and featured listings.</p>
        </div>
        <button className="relative z-10 whitespace-nowrap px-10 py-4.5 bg-white text-[#1F2432] font-bold rounded-full hover:bg-gray-100 transition-all duration-300 shadow-xl hover:shadow-white/10 hover:-translate-y-1 active:scale-[0.98]">
          Launch Campaign
        </button>
      </div>
    </div>
  );
}
