import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import AdminLayout from '../AdminLayout';
import {
  fetchAdminDoctorSubscriptionPricing,
  updateAdminDoctorSubscriptionPricing
} from '../../../../services/authApi';

const DEFAULT_FORM_VALUES = {
  platinumPriceInRupees: '0',
  goldPriceInRupees: '999',
  diamondPriceInRupees: '2999'
};

const readPricingValue = (pricingPayload, key, legacyKey) => {
  return pricingPayload?.[key] ?? pricingPayload?.[legacyKey];
};

const toPriceInputValue = (value, fallbackValue) => {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue) || numericValue < 0) {
    return String(fallbackValue);
  }

  return Number.isInteger(numericValue) ? String(numericValue) : numericValue.toFixed(2);
};

const parsePriceValue = (value) => {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue) || numericValue < 0) {
    return null;
  }

  return Number(numericValue.toFixed(2));
};

const formatUpdatedAtLabel = (value) => {
  if (!value) {
    return 'Not updated yet';
  }

  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    return 'Not updated yet';
  }

  return parsedDate.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });
};

export default function SubscriptionPricing() {
  const [formValues, setFormValues] = useState(DEFAULT_FORM_VALUES);
  const [updatedAt, setUpdatedAt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadPricing = async () => {
      const adminToken = localStorage.getItem('adminToken');

      if (!adminToken) {
        if (isMounted) {
          setFormValues(DEFAULT_FORM_VALUES);
          setIsLoading(false);
        }

        return;
      }

      try {
        if (isMounted) {
          setIsLoading(true);
        }

        const response = await fetchAdminDoctorSubscriptionPricing(adminToken);
        const pricing = response?.pricing || {};

        if (!isMounted) {
          return;
        }

        setFormValues({
          platinumPriceInRupees: toPriceInputValue(
            readPricingValue(pricing, 'platinumPriceInRupees', 'platinumPriceInUsd'),
            0
          ),
          goldPriceInRupees: toPriceInputValue(
            readPricingValue(pricing, 'goldPriceInRupees', 'goldPriceInUsd'),
            999
          ),
          diamondPriceInRupees: toPriceInputValue(
            readPricingValue(pricing, 'diamondPriceInRupees', 'diamondPriceInUsd'),
            2999
          )
        });
        setUpdatedAt(String(pricing?.updatedAt || ''));
      } catch (error) {
        if (isMounted) {
          toast.error(error?.message || 'Could not load subscription pricing');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadPricing();

    return () => {
      isMounted = false;
    };
  }, []);

  const hasInvalidValues = useMemo(() => {
    return Object.values(formValues).some((value) => parsePriceValue(value) === null);
  }, [formValues]);

  const handleInputChange = (field) => (event) => {
    const nextValue = event.target.value;

    setFormValues((previousValues) => ({
      ...previousValues,
      [field]: nextValue
    }));
  };

  const handleSave = async () => {
    const adminToken = localStorage.getItem('adminToken');

    if (!adminToken) {
      toast.error('Please login as admin first');
      return;
    }

    const payload = {
      platinumPriceInRupees: parsePriceValue(formValues.platinumPriceInRupees),
      goldPriceInRupees: parsePriceValue(formValues.goldPriceInRupees),
      diamondPriceInRupees: parsePriceValue(formValues.diamondPriceInRupees)
    };

    if (Object.values(payload).some((priceValue) => priceValue === null)) {
      toast.error('All prices must be valid non-negative numbers');
      return;
    }

    try {
      setIsSaving(true);
      const response = await updateAdminDoctorSubscriptionPricing(adminToken, payload);
      const pricing = response?.pricing || {};

      setFormValues({
        platinumPriceInRupees: toPriceInputValue(
          readPricingValue(pricing, 'platinumPriceInRupees', 'platinumPriceInUsd'),
          payload.platinumPriceInRupees
        ),
        goldPriceInRupees: toPriceInputValue(
          readPricingValue(pricing, 'goldPriceInRupees', 'goldPriceInUsd'),
          payload.goldPriceInRupees
        ),
        diamondPriceInRupees: toPriceInputValue(
          readPricingValue(pricing, 'diamondPriceInRupees', 'diamondPriceInUsd'),
          payload.diamondPriceInRupees
        )
      });
      setUpdatedAt(String(pricing?.updatedAt || new Date().toISOString()));
      toast.success(response?.message || 'Subscription pricing updated');
    } catch (error) {
      toast.error(error?.message || 'Could not update subscription pricing');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AdminLayout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-[24px] font-bold text-gray-900">Doctor Subscription Pricing</h1>
            <p className="text-[14px] text-gray-500 font-medium mt-1">
              Update the monthly prices shown in the doctor dashboard subscriptions page (PKR).
            </p>
          </div>
          <span className="inline-flex items-center gap-2 self-start sm:self-auto px-3 py-1.5 rounded-full bg-[#1EBDB8]/10 text-[#0F766E] text-[12px] font-semibold border border-[#1EBDB8]/20">
            Last updated: {formatUpdatedAtLabel(updatedAt)}
          </span>
        </div>

        <div className="bg-white border border-gray-100 shadow-[0_2px_10px_rgb(0,0,0,0.02)] rounded-2xl p-6 sm:p-7 flex flex-col gap-6">
          {isLoading ? (
            <p className="text-[14px] font-medium text-gray-500">Loading pricing...</p>
          ) : null}

          {!isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <label className="flex flex-col gap-2 rounded-xl border border-gray-200 bg-gray-50/60 p-4">
                <span className="text-[12px] font-bold uppercase tracking-wide text-gray-500">Platinum (Basic)</span>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-[14px] font-bold">Rs</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formValues.platinumPriceInRupees}
                    onChange={handleInputChange('platinumPriceInRupees')}
                    className="w-full bg-white text-[15px] text-gray-900 font-semibold py-2.5 pl-12 pr-3 rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-[#1EBDB8]/40"
                  />
                </div>
              </label>

              <label className="flex flex-col gap-2 rounded-xl border border-gray-200 bg-gray-50/60 p-4">
                <span className="text-[12px] font-bold uppercase tracking-wide text-gray-500">Gold (Pro)</span>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-[14px] font-bold">Rs</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formValues.goldPriceInRupees}
                    onChange={handleInputChange('goldPriceInRupees')}
                    className="w-full bg-white text-[15px] text-gray-900 font-semibold py-2.5 pl-12 pr-3 rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-[#1EBDB8]/40"
                  />
                </div>
              </label>

              <label className="flex flex-col gap-2 rounded-xl border border-gray-200 bg-gray-50/60 p-4">
                <span className="text-[12px] font-bold uppercase tracking-wide text-gray-500">Diamond (Premium)</span>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-[14px] font-bold">Rs</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formValues.diamondPriceInRupees}
                    onChange={handleInputChange('diamondPriceInRupees')}
                    className="w-full bg-white text-[15px] text-gray-900 font-semibold py-2.5 pl-12 pr-3 rounded-lg border border-gray-200 outline-none focus:ring-2 focus:ring-[#1EBDB8]/40"
                  />
                </div>
              </label>
            </div>
          ) : null}

          <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={handleSave}
              disabled={isLoading || isSaving || hasInvalidValues}
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-[#1EBDB8] text-white text-[14px] font-bold hover:bg-[#1AA9A5] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSaving ? 'Saving...' : 'Save Prices'}
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
