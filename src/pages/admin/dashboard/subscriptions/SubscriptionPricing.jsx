import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import AdminLayout from '../AdminLayout';
import {
  fetchAdminStoreSubscriptionPricing,
  updateAdminStoreSubscriptionPricing,
  fetchAdminClinicSubscriptionPricing,
  updateAdminClinicSubscriptionPricing,
  fetchAdminCampaignPricing,
  updateAdminCampaignPricing
} from '../../../../services/authApi';

const DEFAULT_STORE_PRICING = {
  platinumPriceInRupees: '0',
  goldPriceInRupees: '1999',
  diamondPriceInRupees: '4999'
};

const DEFAULT_CLINIC_PRICING = {
  platinumPriceInRupees: '0',
  goldPriceInRupees: '1999',
  diamondPriceInRupees: '4999'
};

const STORE_PLAN_TEXTS = [
  {
    id: 'platinum',
    label: 'Platinum (Small Pharmacy)',
    priceKey: 'platinumPriceInRupees',
    features: [
      { label: 'Media Uploads', value: '2 Images' },
      { label: 'Analytics', value: 'Basic Orders Overview' }
    ]
  },
  {
    id: 'gold',
    label: 'Gold (Growth)',
    priceKey: 'goldPriceInRupees',
    features: [
      { label: 'Media Uploads', value: '5 Images + 1 Video' },
      { label: 'Analytics', value: 'Orders, Popular Medicines' }
    ]
  },
  {
    id: 'diamond',
    label: 'Diamond (Advanced)',
    priceKey: 'diamondPriceInRupees',
    features: [
      { label: 'Media Uploads', value: 'Unlimited Media' },
      { label: 'Advanced Analytics', value: 'Sales Trends, Customer Demand, Performance Insights' },
      { label: 'Top Store Tag', value: 'Shown on Store Profile and Listing Cards' }
    ]
  }
];

const CLINIC_PLAN_TEXTS = [
  {
    id: 'platinum',
    label: 'Platinum (Starter)',
    priceKey: 'platinumPriceInRupees',
    features: [
      { label: 'Clinic Profile', value: 'Basic (Location, Timings and Services)' },
      { label: 'Media Uploads', value: '2 Images' },
      { label: 'Analytics', value: 'Essential' }
    ]
  },
  {
    id: 'gold',
    label: 'Gold (Growth)',
    priceKey: 'goldPriceInRupees',
    features: [
      { label: 'Clinic Profile', value: 'Enhanced (Services, Labs and Facilities)' },
      { label: 'Clinic Updates System', value: 'Post offers, Announce camps' },
      { label: 'Media Uploads', value: '5 Images' },
      { label: 'Analytics', value: 'Performance Insights' }
    ]
  },
  {
    id: 'diamond',
    label: 'Diamond (Advanced)',
    priceKey: 'diamondPriceInRupees',
    features: [
      { label: 'Media Uploads', value: 'Unlimited Media' },
      { label: 'Advanced Analytics', value: 'Bookings Conversion' },
      { label: 'Verified Badge', value: 'Shown on Clinic Profile and Listing Cards' },
      { label: 'Priority Support', value: 'Highlighted on Clinic Profile and Listing Cards' }
    ]
  }
];

const DEFAULT_CAMPAIGN_PLANS = [
  { id: 'starter', name: 'Starter Boost', priceInRupees: '999', durationDays: '7', isActive: true },
  { id: 'growth', name: 'Growth Boost', priceInRupees: '2499', durationDays: '15', isActive: true },
  { id: 'premium', name: 'Premium Boost', priceInRupees: '4499', durationDays: '30', isActive: true }
];

const readPricingValue = (pricingPayload, key, legacyKey) => {
  return pricingPayload?.[key] ?? pricingPayload?.[legacyKey];
};

const toPriceInputValue = (value, fallbackValue) => {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue) || numericValue < 0) return String(fallbackValue);
  return Number.isInteger(numericValue) ? String(numericValue) : numericValue.toFixed(2);
};

const parsePriceValue = (value) => {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue) || numericValue < 0) return null;
  return Number(numericValue.toFixed(2));
};

const formatUpdatedAtLabel = (value) => {
  if (!value) return 'Not updated yet';
  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) return 'Not updated yet';
  return parsedDate.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });
};

const formatPlanPriceText = (value) => {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue) || numericValue < 0) return 'Rs 0/month';
  return `Rs ${numericValue.toLocaleString('en-PK')}/month`;
};

export default function SubscriptionPricing() {
  const [storeForm, setStoreForm] = useState(DEFAULT_STORE_PRICING);
  const [storeUpdatedAt, setStoreUpdatedAt] = useState('');
  const [clinicForm, setClinicForm] = useState(DEFAULT_CLINIC_PRICING);
  const [clinicUpdatedAt, setClinicUpdatedAt] = useState('');
  const [campaignPlans, setCampaignPlans] = useState(DEFAULT_CAMPAIGN_PLANS);
  const [campaignUpdatedAt, setCampaignUpdatedAt] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSavingStore, setIsSavingStore] = useState(false);
  const [isSavingClinic, setIsSavingClinic] = useState(false);
  const [isSavingCampaign, setIsSavingCampaign] = useState(false);

  useEffect(() => {
    const adminToken = localStorage.getItem('adminToken');
    if (!adminToken) return;

    const loadData = async () => {
      try {
        setIsLoading(true);
        const [storeRes, clinicRes, campaignRes] = await Promise.all([
          fetchAdminStoreSubscriptionPricing(adminToken),
          fetchAdminClinicSubscriptionPricing(adminToken),
          fetchAdminCampaignPricing(adminToken)
        ]);

        const sp = storeRes?.pricing || {};
        setStoreForm({
          platinumPriceInRupees: toPriceInputValue(sp.platinumPriceInRupees, 0),
          goldPriceInRupees: toPriceInputValue(sp.goldPriceInRupees, 1999),
          diamondPriceInRupees: toPriceInputValue(sp.diamondPriceInRupees, 4999)
        });
        setStoreUpdatedAt(String(sp?.updatedAt || ''));

        const cp = clinicRes?.pricing || {};
        setClinicForm({
          platinumPriceInRupees: toPriceInputValue(cp.platinumPriceInRupees, 0),
          goldPriceInRupees: toPriceInputValue(cp.goldPriceInRupees, 1999),
          diamondPriceInRupees: toPriceInputValue(cp.diamondPriceInRupees, 4999)
        });
        setClinicUpdatedAt(String(cp?.updatedAt || ''));

        const campaignPricing = campaignRes?.pricing || {};
        const incomingCampaignPlans = Array.isArray(campaignPricing?.campaignPlans) && campaignPricing.campaignPlans.length > 0
          ? campaignPricing.campaignPlans
          : DEFAULT_CAMPAIGN_PLANS;
        setCampaignPlans(incomingCampaignPlans.map((plan, index) => ({
          id: String(plan?.id || DEFAULT_CAMPAIGN_PLANS[index]?.id || `plan-${index + 1}`),
          name: String(plan?.name || DEFAULT_CAMPAIGN_PLANS[index]?.name || `Campaign Plan ${index + 1}`),
          priceInRupees: toPriceInputValue(plan?.priceInRupees, DEFAULT_CAMPAIGN_PLANS[index]?.priceInRupees || 999),
          durationDays: String(Math.max(1, Math.trunc(Number(plan?.durationDays || DEFAULT_CAMPAIGN_PLANS[index]?.durationDays || 7)))),
          isActive: plan?.isActive === false ? false : true
        })));
        setCampaignUpdatedAt(String(campaignPricing?.updatedAt || ''));
      } catch (error) {
        toast.error(error?.message || 'Error loading pricing');
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const handleStoreChange = (field) => (e) => setStoreForm({ ...storeForm, [field]: e.target.value });
  const handleClinicChange = (field) => (e) => setClinicForm({ ...clinicForm, [field]: e.target.value });
  const handleCampaignPlanChange = (planIndex, field) => (e) => {
    const value = field === 'isActive' ? Boolean(e.target.checked) : e.target.value;
    setCampaignPlans((previousPlans) => previousPlans.map((plan, index) => index === planIndex ? { ...plan, [field]: value } : plan));
  };

  const handleSaveStore = async () => {
    const token = localStorage.getItem('adminToken');
    const payload = {
      platinumPriceInRupees: parsePriceValue(storeForm.platinumPriceInRupees),
      goldPriceInRupees: parsePriceValue(storeForm.goldPriceInRupees),
      diamondPriceInRupees: parsePriceValue(storeForm.diamondPriceInRupees)
    };
    if (Object.values(payload).some(v => v === null)) return toast.error('Check store prices');

    try {
      setIsSavingStore(true);
      const res = await updateAdminStoreSubscriptionPricing(token, payload);
      setStoreUpdatedAt(String(res?.pricing?.updatedAt || new Date().toISOString()));
      toast.success('Store pricing updated!');
    } catch (e) {
      toast.error(e.message);
    } finally {
      setIsSavingStore(false);
    }
  };

  const handleSaveClinic = async () => {
    const token = localStorage.getItem('adminToken');
    const payload = {
      platinumPriceInRupees: parsePriceValue(clinicForm.platinumPriceInRupees),
      goldPriceInRupees: parsePriceValue(clinicForm.goldPriceInRupees),
      diamondPriceInRupees: parsePriceValue(clinicForm.diamondPriceInRupees)
    };
    if (Object.values(payload).some(v => v === null)) return toast.error('Check clinic prices');

    try {
      setIsSavingClinic(true);
      const res = await updateAdminClinicSubscriptionPricing(token, payload);
      setClinicUpdatedAt(String(res?.pricing?.updatedAt || new Date().toISOString()));
      toast.success('Clinic pricing updated!');
    } catch (e) {
      toast.error(e.message);
    } finally {
      setIsSavingClinic(false);
    }
  };

  const handleSaveCampaign = async () => {
    const token = localStorage.getItem('adminToken');
    const payload = {
      campaignPlans: campaignPlans.map((plan) => ({
        id: String(plan.id || '').trim(),
        name: String(plan.name || '').trim(),
        priceInRupees: parsePriceValue(plan.priceInRupees),
        durationDays: Math.max(1, Math.trunc(Number(plan.durationDays || 0))),
        isActive: Boolean(plan.isActive)
      }))
    };

    if (payload.campaignPlans.some((plan) => !plan.id || !plan.name || plan.priceInRupees === null || !Number.isFinite(plan.durationDays) || plan.durationDays <= 0)) {
      return toast.error('Check campaign plan prices and days');
    }

    try {
      setIsSavingCampaign(true);
      const res = await updateAdminCampaignPricing(token, payload);
      setCampaignUpdatedAt(String(res?.pricing?.updatedAt || new Date().toISOString()));
      toast.success('Campaign pricing updated!');
    } catch (e) {
      toast.error(e.message);
    } finally {
      setIsSavingCampaign(false);
    }
  };

  return (
    <AdminLayout>
      <div className="flex flex-col gap-10 max-w-[1240px]">
        {/* Store Section */}
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-[24px] font-bold text-gray-900">Medical Store Subscriptions</h1>
              <p className="text-[14px] text-gray-500 font-medium mt-1">Configure monthly PKR rates for pharmacies and medical stores.</p>
            </div>
            <span className="px-3 py-1.5 rounded-full bg-gray-100 text-gray-500 text-[12px] font-semibold">
              Updated: {formatUpdatedAtLabel(storeUpdatedAt)}
            </span>
          </div>

          <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-7">
            <div className="mb-5 p-4 rounded-xl bg-[#F0FBFA] border border-[#D1F2F0]">
              <p className="text-[13px] font-semibold text-gray-600 mb-3">Plans and current prices (admin set):</p>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {STORE_PLAN_TEXTS.map((plan) => (
                  <div key={plan.id} className="rounded-lg border border-[#D1F2F0] bg-white px-3 py-3">
                    <p className="text-[12px] font-semibold text-gray-500">{plan.label}</p>
                    <p className="text-[14px] font-bold text-gray-900 mt-0.5">
                      {formatPlanPriceText(storeForm[plan.priceKey])}
                    </p>
                    <ul className="mt-2 space-y-1.5">
                      {plan.features.map((feature) => (
                        <li key={`${plan.id}-${feature.label}`} className="text-[12px] text-gray-700 leading-5">
                          {feature.label}: <span className="font-semibold text-gray-900">{feature.value}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                  { id: 'platinum', label: 'Platinum (Basic)', val: storeForm.platinumPriceInRupees },
                  { id: 'gold', label: 'Gold (Pro)', val: storeForm.goldPriceInRupees },
                  { id: 'diamond', label: 'Diamond (Premium)', val: storeForm.diamondPriceInRupees }
              ].map(plan => (
                <div key={plan.id} className="flex flex-col gap-2 p-4 bg-gray-50/50 rounded-xl border border-gray-100">
                  <span className="text-[12px] font-bold text-gray-400 uppercase tracking-wider">{plan.label}</span>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">Rs</span>
                    <input 
                      type="number" 
                      value={plan.val} 
                      onChange={handleStoreChange(`${plan.id}PriceInRupees`)}
                      className="w-full bg-white py-2.5 pl-10 pr-4 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#1EBDB8]/20 outline-none font-semibold text-gray-900" 
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-end mt-6 pt-6 border-t border-gray-100">
               <button onClick={handleSaveStore} disabled={isSavingStore || isLoading} className="bg-[#1EBDB8] text-white px-8 py-2.5 rounded-xl font-bold hover:bg-[#1AA9A5] transition-colors disabled:opacity-50">
                  {isSavingStore ? 'Saving...' : 'Save Store Prices'}
               </button>
            </div>
          </div>
        </div>

        {/* Clinic Section */}
        <div className="flex flex-col gap-6 mb-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-[24px] font-bold text-gray-900">Clinic Subscriptions</h1>
              <p className="text-[14px] text-gray-500 font-medium mt-1">Configure monthly PKR rates for medical clinics and hospitals.</p>
            </div>
            <span className="px-3 py-1.5 rounded-full bg-gray-100 text-gray-500 text-[12px] font-semibold">
              Updated: {formatUpdatedAtLabel(clinicUpdatedAt)}
            </span>
          </div>

          <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-7">
            <div className="mb-5 p-4 rounded-xl bg-[#F0FBFA] border border-[#D1F2F0]">
              <p className="text-[13px] font-semibold text-gray-600 mb-3">Plans and current prices (admin set):</p>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {CLINIC_PLAN_TEXTS.map((plan) => (
                  <div key={plan.id} className="rounded-lg border border-[#D1F2F0] bg-white px-3 py-3">
                    <p className="text-[12px] font-semibold text-gray-500">{plan.label}</p>
                    <p className="text-[14px] font-bold text-gray-900 mt-0.5">
                      {formatPlanPriceText(clinicForm[plan.priceKey])}
                    </p>
                    <ul className="mt-2 space-y-1.5">
                      {plan.features.map((feature) => (
                        <li key={`${plan.id}-${feature.label}`} className="text-[12px] text-gray-700 leading-5">
                          {feature.label}: <span className="font-semibold text-gray-900">{feature.value}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                  { id: 'platinum', label: 'Platinum (Basic)', val: clinicForm.platinumPriceInRupees },
                  { id: 'gold', label: 'Gold (Pro)', val: clinicForm.goldPriceInRupees },
                  { id: 'diamond', label: 'Diamond (Premium)', val: clinicForm.diamondPriceInRupees }
              ].map(plan => (
                <div key={plan.id} className="flex flex-col gap-2 p-4 bg-gray-50/50 rounded-xl border border-gray-100">
                  <span className="text-[12px] font-bold text-gray-400 uppercase tracking-wider">{plan.label}</span>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">Rs</span>
                    <input 
                      type="number" 
                      value={plan.val} 
                      onChange={handleClinicChange(`${plan.id}PriceInRupees`)}
                      className="w-full bg-white py-2.5 pl-10 pr-4 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#1EBDB8]/20 outline-none font-semibold text-gray-900" 
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-end mt-6 pt-6 border-t border-gray-100">
               <button onClick={handleSaveClinic} disabled={isSavingClinic || isLoading} className="bg-[#1EBDB8] text-white px-8 py-2.5 rounded-xl font-bold hover:bg-[#1AA9A5] transition-colors disabled:opacity-50">
                  {isSavingClinic ? 'Saving...' : 'Save Clinic Prices'}
               </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6 mb-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-[24px] font-bold text-gray-900">Campaign Promotions</h1>
              <p className="text-[14px] text-gray-500 font-medium mt-1">Configure sponsored profile packages used by doctors, clinics, and medical stores.</p>
            </div>
            <span className="px-3 py-1.5 rounded-full bg-gray-100 text-gray-500 text-[12px] font-semibold">
              Updated: {formatUpdatedAtLabel(campaignUpdatedAt)}
            </span>
          </div>

          <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-7">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {campaignPlans.map((plan, index) => (
                <div key={plan.id || index} className="flex flex-col gap-4 p-4 bg-gray-50/50 rounded-xl border border-gray-100">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[12px] font-bold text-gray-400 uppercase tracking-wider">Campaign Plan {index + 1}</span>
                    <label className="flex items-center gap-2 text-[12px] font-bold text-gray-500">
                      <input type="checkbox" checked={Boolean(plan.isActive)} onChange={handleCampaignPlanChange(index, 'isActive')} />
                      Active
                    </label>
                  </div>
                  <input
                    type="text"
                    value={plan.name}
                    onChange={handleCampaignPlanChange(index, 'name')}
                    className="w-full bg-white py-2.5 px-4 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#1EBDB8]/20 outline-none font-semibold text-gray-900"
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">Rs</span>
                      <input
                        type="number"
                        value={plan.priceInRupees}
                        onChange={handleCampaignPlanChange(index, 'priceInRupees')}
                        className="w-full bg-white py-2.5 pl-10 pr-4 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#1EBDB8]/20 outline-none font-semibold text-gray-900"
                      />
                    </div>
                    <div className="relative">
                      <input
                        type="number"
                        value={plan.durationDays}
                        onChange={handleCampaignPlanChange(index, 'durationDays')}
                        className="w-full bg-white py-2.5 px-4 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#1EBDB8]/20 outline-none font-semibold text-gray-900"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-[12px]">days</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-end mt-6 pt-6 border-t border-gray-100">
              <button onClick={handleSaveCampaign} disabled={isSavingCampaign || isLoading} className="bg-[#1EBDB8] text-white px-8 py-2.5 rounded-xl font-bold hover:bg-[#1AA9A5] transition-colors disabled:opacity-50">
                {isSavingCampaign ? 'Saving...' : 'Save Campaign Prices'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
