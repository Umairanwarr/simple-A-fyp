import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import AdminLayout from '../AdminLayout';
import {
  fetchAdminDoctorSubscriptionPricing,
  updateAdminDoctorSubscriptionPricing,
  fetchAdminStoreSubscriptionPricing,
  updateAdminStoreSubscriptionPricing
} from '../../../../services/authApi';

const DEFAULT_DOCTOR_PRICING = {
  platinumPriceInRupees: '0',
  goldPriceInRupees: '999',
  diamondPriceInRupees: '2999'
};

const DEFAULT_STORE_PRICING = {
  platinumPriceInRupees: '0',
  goldPriceInRupees: '1499',
  diamondPriceInRupees: '3999'
};

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

export default function SubscriptionPricing() {
  const [doctorForm, setDoctorForm] = useState(DEFAULT_DOCTOR_PRICING);
  const [doctorUpdatedAt, setDoctorUpdatedAt] = useState('');
  const [storeForm, setStoreForm] = useState(DEFAULT_STORE_PRICING);
  const [storeUpdatedAt, setStoreUpdatedAt] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSavingDoctor, setIsSavingDoctor] = useState(false);
  const [isSavingStore, setIsSavingStore] = useState(false);

  useEffect(() => {
    const adminToken = localStorage.getItem('adminToken');
    if (!adminToken) return;

    const loadData = async () => {
      try {
        setIsLoading(true);
        const [docRes, storeRes] = await Promise.all([
          fetchAdminDoctorSubscriptionPricing(adminToken),
          fetchAdminStoreSubscriptionPricing(adminToken)
        ]);

        const dp = docRes?.pricing || {};
        setDoctorForm({
          platinumPriceInRupees: toPriceInputValue(dp.platinumPriceInRupees, 0),
          goldPriceInRupees: toPriceInputValue(dp.goldPriceInRupees, 999),
          diamondPriceInRupees: toPriceInputValue(dp.diamondPriceInRupees, 2999)
        });
        setDoctorUpdatedAt(String(dp?.updatedAt || ''));

        const sp = storeRes?.pricing || {};
        setStoreForm({
          platinumPriceInRupees: toPriceInputValue(sp.platinumPriceInRupees, 0),
          goldPriceInRupees: toPriceInputValue(sp.goldPriceInRupees, 1499),
          diamondPriceInRupees: toPriceInputValue(sp.diamondPriceInRupees, 3999)
        });
        setStoreUpdatedAt(String(sp?.updatedAt || ''));
      } catch (error) {
        toast.error(error?.message || 'Error loading pricing');
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const handleDocChange = (field) => (e) => setDoctorForm({ ...doctorForm, [field]: e.target.value });
  const handleStoreChange = (field) => (e) => setStoreForm({ ...storeForm, [field]: e.target.value });

  const handleSaveDoc = async () => {
    const token = localStorage.getItem('adminToken');
    const payload = {
      platinumPriceInRupees: parsePriceValue(doctorForm.platinumPriceInRupees),
      goldPriceInRupees: parsePriceValue(doctorForm.goldPriceInRupees),
      diamondPriceInRupees: parsePriceValue(doctorForm.diamondPriceInRupees)
    };
    if (Object.values(payload).some(v => v === null)) return toast.error('Check doc prices');

    try {
      setIsSavingDoctor(true);
      const res = await updateAdminDoctorSubscriptionPricing(token, payload);
      setDoctorUpdatedAt(String(res?.pricing?.updatedAt || new Date().toISOString()));
      toast.success('Doctor pricing updated!');
    } catch (e) {
      toast.error(e.message);
    } finally {
      setIsSavingDoctor(false);
    }
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

  return (
    <AdminLayout>
      <div className="flex flex-col gap-10 max-w-[1240px]">
        {/* Doctor Section */}
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-[24px] font-bold text-gray-900">Doctor Subscriptions</h1>
              <p className="text-[14px] text-gray-500 font-medium mt-1">Configure monthly PKR rates for medical practitioners.</p>
            </div>
            <span className="px-3 py-1.5 rounded-full bg-gray-100 text-gray-500 text-[12px] font-semibold">
              Updated: {formatUpdatedAtLabel(doctorUpdatedAt)}
            </span>
          </div>

          <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-7">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                  { id: 'platinum', label: 'Platinum (Basic)', val: doctorForm.platinumPriceInRupees },
                  { id: 'gold', label: 'Gold (Pro)', val: doctorForm.goldPriceInRupees },
                  { id: 'diamond', label: 'Diamond (Premium)', val: doctorForm.diamondPriceInRupees }
              ].map(plan => (
                <div key={plan.id} className="flex flex-col gap-2 p-4 bg-gray-50/50 rounded-xl border border-gray-100">
                  <span className="text-[12px] font-bold text-gray-400 uppercase tracking-wider">{plan.label}</span>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">Rs</span>
                    <input 
                      type="number" 
                      value={plan.val} 
                      onChange={handleDocChange(`${plan.id}PriceInRupees`)}
                      className="w-full bg-white py-2.5 pl-10 pr-4 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#1EBDB8]/20 outline-none font-semibold text-gray-900" 
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-end mt-6 pt-6 border-t border-gray-100">
               <button onClick={handleSaveDoc} disabled={isSavingDoctor || isLoading} className="bg-[#1EBDB8] text-white px-8 py-2.5 rounded-xl font-bold hover:bg-[#1AA9A5] transition-colors disabled:opacity-50">
                  {isSavingDoctor ? 'Saving...' : 'Save Doctor Prices'}
               </button>
            </div>
          </div>
        </div>

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
      </div>
    </AdminLayout>
  );
}
