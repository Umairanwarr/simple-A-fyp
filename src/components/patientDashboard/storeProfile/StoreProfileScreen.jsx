import React, { useEffect, useMemo, useState } from 'react';
import {
  CardCvcElement,
  CardExpiryElement,
  CardNumberElement,
  Elements,
  useElements,
  useStripe
} from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { toast } from 'react-toastify';
import {
  fetchPatientStoreProfile,
  createPatientStoreOrder
} from '../../../services/authApi';
import { getPatientSessionProfile } from '../../../utils/authSession';

const STRIPE_PUBLISHABLE_KEY = String(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '').trim();
const stripePromise = STRIPE_PUBLISHABLE_KEY ? loadStripe(STRIPE_PUBLISHABLE_KEY) : null;

const formatCurrency = (amount) => {
  const n = Number(amount);
  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR',
    maximumFractionDigits: 0
  }).format(Number.isFinite(n) ? Math.max(0, n) : 0);
};

const stripeElementStyle = {
  style: {
    base: {
      color: '#1F2432',
      fontFamily: 'ui-sans-serif, system-ui, sans-serif',
      fontSize: '15px',
      '::placeholder': { color: '#9CA3AF' }
    },
    invalid: { color: '#DC2626' }
  }
};

// ── Cloudinary unsigned upload ──────────────────────────────────────────────
const CLOUDINARY_CLOUD_NAME = String(import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || '').trim();
const CLOUDINARY_UPLOAD_PRESET = String(import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || '').trim();

const uploadPrescriptionToCloudinary = async (file) => {
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
    throw new Error('Cloudinary is not configured. Contact support.');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
  formData.append('folder', 'prescriptions');

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/auto/upload`,
    { method: 'POST', body: formData }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || 'Prescription upload failed');
  }

  return res.json();
};

// ── Stripe payment form ─────────────────────────────────────────────────────
function StripePaymentForm({ canSubmit, isProcessing, onSubmitPayment }) {
  const stripe = useStripe();
  const elements = useElements();
  const [cardError, setCardError] = useState('');
  const [cardState, setCardState] = useState({
    cardNumberComplete: false,
    cardExpiryComplete: false,
    cardCvcComplete: false
  });

  const isCardComplete = cardState.cardNumberComplete && cardState.cardExpiryComplete && cardState.cardCvcComplete;
  const canProceed = canSubmit && isCardComplete && !isProcessing && stripe && elements;

  const handleChange = (field) => (e) => {
    setCardState((prev) => ({ ...prev, [field]: Boolean(e?.complete) }));
    setCardError(e?.error?.message || '');
  };

  const handleClick = async () => {
    if (!canSubmit) { toast.error('Complete all required fields first'); return; }
    if (!isCardComplete) { toast.error('Complete card number, expiry and CVC'); return; }
    if (!stripe || !elements) { toast.error('Payment form is loading, try again in a moment'); return; }

    const cardNumberElement = elements.getElement(CardNumberElement);
    if (!cardNumberElement) { toast.error('Card details not ready'); return; }

    await onSubmitPayment({ stripe, cardNumberElement });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-[14px] font-semibold text-[#1F2432]">Card Number</label>
        <div className="rounded-[12px] border border-gray-300 bg-white px-4 py-3.5 focus-within:border-[#1EBDB8] focus-within:ring-2 focus-within:ring-[#1EBDB8]/15">
          <CardNumberElement options={{ ...stripeElementStyle, showIcon: true }} onChange={handleChange('cardNumberComplete')} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <label className="text-[14px] font-semibold text-[#1F2432]">Expiry</label>
          <div className="rounded-[12px] border border-gray-300 bg-white px-4 py-3.5 focus-within:border-[#1EBDB8] focus-within:ring-2 focus-within:ring-[#1EBDB8]/15">
            <CardExpiryElement options={stripeElementStyle} onChange={handleChange('cardExpiryComplete')} />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-[14px] font-semibold text-[#1F2432]">CVC</label>
          <div className="rounded-[12px] border border-gray-300 bg-white px-4 py-3.5 focus-within:border-[#1EBDB8] focus-within:ring-2 focus-within:ring-[#1EBDB8]/15">
            <CardCvcElement options={stripeElementStyle} onChange={handleChange('cardCvcComplete')} />
          </div>
        </div>
      </div>

      {cardError
        ? <p className="text-[12px] font-medium text-red-600">{cardError}</p>
        : <p className="text-[12px] text-[#6B7280]">Use Stripe test card 4242 4242 4242 4242.</p>
      }

      {isCardComplete ? (
        <button
          type="button"
          onClick={handleClick}
          disabled={!canProceed}
          className={`w-full py-3.5 rounded-[999px] text-[19px] font-bold transition-colors ${
            canProceed
              ? 'bg-[#1EBDB8] hover:bg-[#1CAAAE] text-white shadow-[0_14px_28px_-14px_rgba(30,189,184,0.75)]'
              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
          }`}
        >
          {isProcessing ? 'Placing Order...' : 'Pay & Place Order'}
        </button>
      ) : (
        <p className="text-[12px] font-semibold text-[#6B7280]">Complete all card details to show payment button.</p>
      )}
    </div>
  );
}

// ── Main StoreProfileScreen ─────────────────────────────────────────────────
export default function StoreProfileScreen({ storeId, onBack }) {
  const [store, setStore] = useState(null);
  const [inventory, setInventory] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [reviewsList, setReviewsList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [activeTab, setActiveTab] = useState('inventory');
  const [categoryFilter, setCategoryFilter] = useState('');

  // Cart logic
  const [cart, setCart] = useState([]); // { id, name, price, quantity, maxStock }

  const cartTotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }, [cart]);

  const handleAddToCart = (medicine) => {
    if (medicine.stock <= 0) {
      toast.error('This item is out of stock');
      return;
    }
    setCart((prev) => {
      const existing = prev.find((item) => item.id === medicine.id);
      if (existing) {
        if (existing.quantity >= medicine.stock) {
          toast.error('Cannot add more than available stock');
          return prev;
        }
        return prev.map((item) =>
          item.id === medicine.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { id: medicine.id, name: medicine.name, price: medicine.price, quantity: 1, maxStock: medicine.stock }];
    });
  };

  const removeFromCart = (medicineId) => {
    setCart((prev) => prev.filter((item) => item.id !== medicineId));
  };

  const updateCartQuantity = (medicineId, newQty) => {
    setCart((prev) => {
      const item = prev.find((i) => i.id === medicineId);
      if (!item) return prev;
      const q = Math.max(1, Math.min(newQty, item.maxStock));
      return prev.map((i) => i.id === medicineId ? { ...i, quantity: q } : i);
    });
  };

  // Prescription step
  const [showOrderFlow, setShowOrderFlow] = useState(false);
  const [step, setStep] = useState('prescription'); // 'prescription' | 'details'

  // Prescription
  const [selectedPrescription, setSelectedPrescription] = useState(null); // { id, doctorName, date, attachmentUrl, attachmentFileType, notes }
  const [isUploadingPrescription, setIsUploadingPrescription] = useState(false);
  const [uploadedCloudinary, setUploadedCloudinary] = useState(null);

  // Order form
  const [orderNotes, setOrderNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cod'); // 'cod' | 'stripe'
  const [stripeClientSecret, setStripeClientSecret] = useState(null);
  const [orderForm, setOrderForm] = useState({
    phoneNumber: '',
    streetAddress: '',
    aptSuite: '',
    city: '',
    state: '',
    zip: '',
    termsAccepted: false
  });
  const [isOrderProcessing, setIsOrderProcessing] = useState(false);


  const patientProfile = useMemo(() => getPatientSessionProfile(), []);

  useEffect(() => {
    // Prefill phone if available
    if (patientProfile?.phoneNumber) {
      setOrderForm((prev) => ({ ...prev, phoneNumber: patientProfile.phoneNumber }));
    }
  }, [patientProfile]);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      if (!storeId) {
        setLoadError('Store not found');
        setIsLoading(false);
        return;
      }

      const token = localStorage.getItem('patientToken');
      if (!token) {
        setLoadError('Please sign in again to continue');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setLoadError('');
        const data = await fetchPatientStoreProfile(token, storeId);
        if (!isMounted) return;
        setStore(data?.store || null);
        setInventory(Array.isArray(data?.inventory) ? data.inventory : []);
        setGallery(Array.isArray(data?.gallery) ? data.gallery : []);
        setReviewsList(Array.isArray(data?.reviewsList) ? data.reviewsList : []);
      } catch (err) {
        if (!isMounted) return;
        setLoadError(err?.message || 'Could not load store profile');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    load();
    return () => { isMounted = false; };
  }, [storeId]);

  // Check if store is currently open
  const isStoreOpen = useMemo(() => {
    if (!store?.availability) return true;
    try {
      const now = new Date();
      const cur = now.getHours() * 60 + now.getMinutes();
      const [startStr, endStr] = store.availability.split('-').map(s => s.trim());
      const parse = (t) => {
        const [time, mod] = t.split(' ');
        let [h, m] = time.split(':').map(Number);
        if (mod === 'PM' && h < 12) h += 12;
        if (mod === 'AM' && h === 12) h = 0;
        return h * 60 + m;
      };
      const s = parse(startStr);
      const e = parse(endStr);
      return s < e ? (cur >= s && cur <= e) : (cur >= s || cur <= e);
    } catch { return true; }
  }, [store?.availability]);

  const categories = useMemo(() => {
    const cats = [...new Set(inventory.map(m => m.category).filter(Boolean))];
    return cats.sort();
  }, [inventory]);

  const filteredInventory = useMemo(() => {
    if (!categoryFilter) return inventory;
    return inventory.filter(m => m.category === categoryFilter);
  }, [inventory, categoryFilter]);

  const canSubmitOrder = useMemo(() => Boolean(
    orderForm.termsAccepted
    && /^\d{7,15}$/.test(orderForm.phoneNumber.trim())
    && orderForm.streetAddress.trim()
    && orderForm.city.trim()
    && orderForm.state.trim()
    && orderForm.zip.trim()
  ), [orderForm]);

  const handleFieldChange = (field) => (e) => {
    const val = field === 'phoneNumber'
      ? String(e.target.value).replace(/\D/g, '').slice(0, 15)
      : e.target.value;
    setOrderForm(prev => ({ ...prev, [field]: val }));
  };

  const handleSelectExistingPrescription = (prescription) => {
    setSelectedPrescription({ ...prescription, source: 'existing' });
    setUploadedCloudinary(null);
  };

  const handleUploadNewPrescription = async (file) => {
    if (!file) return;
    const maxMB = 10;
    if (file.size > maxMB * 1024 * 1024) {
      toast.error(`File too large. Max ${maxMB}MB allowed.`);
      return;
    }

    try {
      setIsUploadingPrescription(true);
      const result = await uploadPrescriptionToCloudinary(file);
      setUploadedCloudinary({
        url: result.secure_url,
        publicId: result.public_id,
        resourceType: result.resource_type,
        format: result.format,
        originalName: file.name
      });
      setSelectedPrescription({ source: 'uploaded', attachmentUrl: result.secure_url, attachmentFileType: result.resource_type === 'raw' ? 'raw' : 'image' });
    } catch (err) {
      toast.error(err?.message || 'Could not upload prescription');
    } finally {
      setIsUploadingPrescription(false);
    }
  };

  const handleSubmitOrder = async ({ stripe, cardNumberElement } = {}) => {
    if (!canSubmitOrder) { toast.error('Complete all required fields first'); return; }

    const token = localStorage.getItem('patientToken');
    if (!token) { toast.error('Please sign in again'); return; }

    // Determine prescription data
    let prescriptionData = null;
    if (selectedPrescription?.source === 'uploaded' && uploadedCloudinary) {
      prescriptionData = {
        prescriptionUrl: uploadedCloudinary.url,
        prescriptionPublicId: uploadedCloudinary.publicId,
        prescriptionResourceType: uploadedCloudinary.resourceType,
        prescriptionFormat: uploadedCloudinary.format,
        prescriptionOriginalName: uploadedCloudinary.originalName
      };
    } else if (selectedPrescription?.source === 'existing') {
      prescriptionData = {
        prescriptionUrl: selectedPrescription.attachmentUrl,
        prescriptionPublicId: `existing_${selectedPrescription.id || Date.now()}`,
        prescriptionResourceType: selectedPrescription.attachmentFileType === 'raw' ? 'raw' : 'image',
        prescriptionFormat: null,
        prescriptionOriginalName: 'Existing prescription'
      };
    }

    if (!prescriptionData) { toast.error('Please select or upload a prescription first'); return; }

    setIsOrderProcessing(true);

    try {
      const result = await createPatientStoreOrder(token, storeId, {
        items: cart.map(i => ({ id: i.id, quantity: i.quantity, name: i.name })),
        paymentMethod,
        notes: `Phone: ${orderForm.phoneNumber} | Address: ${orderForm.streetAddress}, ${orderForm.aptSuite ? orderForm.aptSuite + ', ' : ''}${orderForm.city}, ${orderForm.state} ${orderForm.zip}${orderNotes ? ' | Notes: ' + orderNotes : ''}`,
        ...prescriptionData
      });

      // For Stripe: confirm the card payment using the clientSecret from backend
      if (paymentMethod === 'stripe' && stripe && cardNumberElement && result?.stripeClientSecret) {
        const { error: stripeError } = await stripe.confirmCardPayment(result.stripeClientSecret, {
          payment_method: { card: cardNumberElement }
        });
        if (stripeError) {
          toast.error(stripeError.message || 'Card payment failed');
          setIsOrderProcessing(false);
          return;
        }
      }

      toast.success('Order placed! The store will review your prescription and contact you.');
      setShowOrderFlow(false);
      setStep('prescription');
      setSelectedPrescription(null);
      setUploadedCloudinary(null);
      setOrderNotes('');
      setCart([]);
      setPaymentMethod('cod');
      setStripeClientSecret(null);
      setOrderForm({ phoneNumber: patientProfile?.phoneNumber || '', streetAddress: '', aptSuite: '', city: '', state: '', zip: '', termsAccepted: false });
    } catch (err) {
      toast.error(err?.message || 'Could not place order');
    } finally {
      setIsOrderProcessing(false);
    }
  };


  // ── Loading / Error states ──────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="bg-white border border-gray-100 rounded-[24px] p-12 text-center">
        <div className="w-10 h-10 mx-auto rounded-full border-[3px] border-[#1EBDB8] border-t-transparent animate-spin" />
        <p className="text-[14px] font-semibold text-[#6B7280] mt-4">Loading store profile...</p>
      </div>
    );
  }

  if (loadError || !store) {
    return (
      <div className="bg-white border border-gray-100 rounded-[24px] p-8 text-center space-y-3">
        <p className="text-[16px] font-bold text-[#4B5563]">{loadError || 'Store profile is unavailable'}</p>
        <button type="button" onClick={() => onBack?.()} className="inline-flex items-center px-4 py-2 rounded-xl bg-[#1EBDB8] hover:bg-[#1CAAAE] text-white text-[13px] font-bold">
          ← Back
        </button>
      </div>
    );
  }

  // ── Order flow: Prescription step ──────────────────────────────────────
  // (passed as prop from parent; we embed an inline prescription picker)
  if (showOrderFlow && step === 'prescription') {
    return (
      <PrescriptionPickerStep
        onBack={() => { setShowOrderFlow(false); setSelectedPrescription(null); setUploadedCloudinary(null); }}
        store={store}
        selectedPrescription={selectedPrescription}
        onSelectExisting={handleSelectExistingPrescription}
        onUploadNew={handleUploadNewPrescription}
        isUploading={isUploadingPrescription}
        onContinue={() => {
          if (!selectedPrescription) { toast.error('Please select or upload a prescription first'); return; }
          setStep('details');
        }}
      />
    );
  }

  // ── Order flow: Address + Payment step ─────────────────────────────────
  if (showOrderFlow && step === 'details') {
    return (
      <div className="pb-24">
        <section className="max-w-[860px] mx-auto space-y-6 sm:space-y-7">
          <button type="button" onClick={() => setStep('prescription')} className="inline-flex items-center gap-1.5 text-[13px] font-bold text-[#6B7280] hover:text-[#1F2432]">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
            </svg>
            Back to Prescription
          </button>

          {/* Store summary */}
          <div className="relative overflow-hidden rounded-[20px] border border-[#D8EFF0] bg-gradient-to-r from-[#ECFAFA] via-[#F8FCFF] to-[#EEF6FF] p-5 sm:p-6">
            <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-[#C8F3F1]/50 blur-2xl" />
            <div className="relative flex items-start gap-4 sm:gap-5">
              <div className="w-[80px] h-[80px] rounded-2xl overflow-hidden bg-white border border-white/60 shadow-sm shrink-0">
                <img src={store.image} alt={store.name} className="w-full h-full object-cover" />
              </div>
              <div className="space-y-1">
                <h1 className="text-[20px] font-bold text-[#1F2432]">{store.name}</h1>
                <p className="text-[14px] text-[#6B7280]">{store.location}</p>
                <p className="text-[13px] text-[#1EBDB8] font-semibold">Operating Hours: {store.availability}</p>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            {/* Patient Info */}
            <div className="space-y-2">
              <h2 className="text-[30px] sm:text-[34px] font-bold text-[#1F2432]">Patient Information</h2>
              <p className="text-[20px] font-medium text-[#1F2432]">{patientProfile?.name}</p>
            </div>

            {/* Contact */}
            <div className="space-y-4">
              <h2 className="text-[30px] sm:text-[34px] font-bold text-[#1F2432]">Delivery Information</h2>
              <p className="text-[14px] text-[#6B7280]">Where should we deliver your order?</p>

              <div className="space-y-2">
                <p className="text-[13px] font-semibold uppercase tracking-[0.08em] text-[#6B7280]">Email</p>
                <p className="text-[20px] font-medium text-[#1F2432]">{patientProfile?.email || 'Not provided'}</p>
              </div>

              {[
                { id: 'phoneNumber', label: 'Phone Number', type: 'tel', hint: 'Digits only (7-15 numbers)' },
                { id: 'streetAddress', label: 'Street Address', type: 'text' },
                { id: 'aptSuite', label: 'Apt. suite, building (optional)', type: 'text' },
                { id: 'city', label: 'City', type: 'text' }
              ].map(({ id, label, type, hint }) => (
                <div key={id} className="space-y-2">
                  <label htmlFor={id} className="text-[14px] font-semibold text-[#1F2432]">{label}</label>
                  <input
                    id={id} type={type} value={orderForm[id]}
                    onChange={handleFieldChange(id)}
                    className="w-full rounded-[12px] border border-gray-300 bg-white px-4 py-3.5 text-[14px] text-[#1F2432] outline-none focus:border-[#1EBDB8] focus:ring-2 focus:ring-[#1EBDB8]/15"
                  />
                  {hint && <p className="text-[12px] text-[#6B7280]">{hint}</p>}
                </div>
              ))}

              <div className="grid grid-cols-2 gap-4">
                {['state', 'zip'].map((id) => (
                  <div key={id} className="space-y-2">
                    <label htmlFor={id} className="text-[14px] font-semibold text-[#1F2432]">{id === 'state' ? 'State' : 'Zip'}</label>
                    <input
                      id={id} type="text" value={orderForm[id]}
                      onChange={handleFieldChange(id)}
                      className="w-full rounded-[12px] border border-gray-300 bg-white px-4 py-3.5 text-[14px] text-[#1F2432] outline-none focus:border-[#1EBDB8] focus:ring-2 focus:ring-[#1EBDB8]/15"
                    />
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <label htmlFor="orderNotes" className="text-[14px] font-semibold text-[#1F2432]">Additional Notes (optional)</label>
                <textarea
                  id="orderNotes"
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  rows={3}
                  placeholder="Any specific medicines or dosage notes for the store..."
                  className="w-full rounded-[12px] border border-gray-300 bg-white px-4 py-3.5 text-[14px] text-[#1F2432] outline-none focus:border-[#1EBDB8] focus:ring-2 focus:ring-[#1EBDB8]/15 resize-none"
                />
              </div>
            </div>

            {/* Order Summary */}
            <div className="bg-[#F8FCFF] rounded-[16px] border border-[#D8EFF0] p-5 space-y-3">
              <h3 className="text-[14px] font-bold text-[#1F2432]">Order Summary</h3>
              {cart.map((item) => (
                <div key={item.id} className="flex justify-between items-center text-[13px]">
                  <span className="text-[#4B5563]">{item.name} × {item.quantity}</span>
                  <span className="font-semibold text-[#1F2432]">{formatCurrency(item.price * item.quantity)}</span>
                </div>
              ))}
              <div className="border-t border-[#D8EFF0] pt-3 flex justify-between items-center">
                <span className="text-[15px] font-bold text-[#1F2432]">Total</span>
                <span className="text-[18px] font-bold text-[#1EBDB8]">{formatCurrency(cartTotal)}</span>
              </div>
            </div>

            {/* Payment Method */}
            <div className="space-y-3">
              <h3 className="text-[14px] font-bold text-[#1F2432]">Payment Method</h3>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('cod')}
                  className={`rounded-[14px] border-2 p-4 text-left transition-all ${
                    paymentMethod === 'cod' ? 'border-[#1EBDB8] bg-[#F0FDFD]' : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-0.5">
                    <svg className={`w-4 h-4 shrink-0 ${paymentMethod === 'cod' ? 'text-[#1EBDB8]' : 'text-[#6B7280]'}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                    </svg>
                    <p className="text-[13px] font-bold text-[#1F2432]">Cash on Delivery</p>
                  </div>
                  <p className="text-[11px] text-[#6B7280] ml-6">Pay when you receive</p>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('stripe')}
                  className={`rounded-[14px] border-2 p-4 text-left transition-all ${
                    paymentMethod === 'stripe' ? 'border-[#1EBDB8] bg-[#F0FDFD]' : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-0.5">
                    <svg className={`w-4 h-4 shrink-0 ${paymentMethod === 'stripe' ? 'text-[#1EBDB8]' : 'text-[#6B7280]'}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                      <line x1="1" y1="10" x2="23" y2="10" />
                    </svg>
                    <p className="text-[13px] font-bold text-[#1F2432]">Pay Online</p>
                  </div>
                  <p className="text-[11px] text-[#6B7280] ml-6">Stripe · Secure payment</p>
                </button>
              </div>
              {paymentMethod === 'stripe' && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-[12px] text-amber-700">
                  <strong>Note:</strong> The store will confirm your order before charging. You'll receive a payment link at your email.
                </div>
              )}
            </div>

            {/* Terms */}
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={orderForm.termsAccepted}
                onChange={(e) => setOrderForm(prev => ({ ...prev, termsAccepted: e.target.checked }))}
                className="mt-1 h-5 w-5 rounded border-gray-300 text-[#1EBDB8] focus:ring-[#1EBDB8]"
              />
              <span className="text-[14px] leading-relaxed text-[#4B5563]">
                I confirm that the uploaded prescription is authentic and I authorize this order.
              </span>
            </label>

            {/* Place Order — COD or Stripe */}
            {paymentMethod === 'stripe' ? (
              stripePromise ? (
                <Elements stripe={stripePromise}>
                  <StripePaymentForm
                    canSubmit={canSubmitOrder}
                    isProcessing={isOrderProcessing}
                    onSubmitPayment={handleSubmitOrder}
                  />
                </Elements>
              ) : (
                <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-[13px] text-red-600">
                  Stripe is not configured. Please use Cash on Delivery or contact support.
                </div>
              )
            ) : (
              <button
                type="button"
                onClick={() => handleSubmitOrder({})}
                disabled={!canSubmitOrder || isOrderProcessing}
                className={`w-full py-3.5 rounded-[999px] text-[16px] font-bold transition-colors flex items-center justify-center gap-2.5 ${
                  canSubmitOrder && !isOrderProcessing
                    ? 'bg-[#1EBDB8] hover:bg-[#1CAAAE] text-white shadow-[0_14px_28px_-14px_rgba(30,189,184,0.75)]'
                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                }`}
              >
                {isOrderProcessing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Placing Order...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                    </svg>
                    Place Order · COD · {formatCurrency(cartTotal)}
                  </>
                )}
              </button>
            )}
            <p className="text-[12px] text-center text-[#9CA3AF]">
              The store will review your prescription and confirm the order.
            </p>
          </div>
        </section>
      </div>
    );
  }

  // ── Main profile view ────────────────────────────────────────────────────
  return (
    <div className="grid grid-cols-1 xl:grid-cols-[1fr_420px] gap-8 pb-24 items-start bg-[#F4FDFD] -m-6 p-6">

      {/* Left column */}
      <section className="bg-transparent p-4 sm:p-6 lg:p-8 shrink-0">
        {/* Back */}
        <button type="button" onClick={() => onBack?.()} className="mb-6 inline-flex items-center gap-1.5 text-[13px] font-bold text-[#6B7280] hover:text-[#1F2432]">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
          </svg>
          Back
        </button>

        {/* Hero */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-8 mb-10">
          <div className="w-[160px] h-[160px] rounded-full overflow-hidden bg-[#F3F4F6] border-[4px] border-white shadow-sm shrink-0">
            <img src={store.image} alt={store.name} className="w-full h-full object-cover" />
          </div>
          <div className="space-y-1.5 text-center sm:text-left mt-2">
            <h1 className="text-[32px] sm:text-[38px] leading-tight font-bold text-[#1F2432]">{store.name}</h1>
            <p className="text-[18px] font-semibold text-[#1EBDB8]">Medical Store</p>
            <p className="text-[16px] font-medium text-[#6B7280]">{store.location || 'Location not provided'}</p>
            
            {/* Business Info - Left Side */}
            <div className="space-y-1 mt-1">
              <p className="text-[14px] text-[#4B5563] flex items-center gap-2 justify-center sm:justify-start">
                <svg className="w-4 h-4 text-[#1EBDB8]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <span className="font-semibold">{store.availability || store.operatingHours || 'Not specified'}</span>
              </p>
              <p className="text-[14px] text-[#4B5563] flex items-center gap-2 justify-center sm:justify-start">
                <svg className="w-4 h-4 text-[#1EBDB8]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                <span>{store.phone || 'Phone not listed'}</span>
              </p>
            </div>

            <div className="flex items-center justify-center sm:justify-start gap-2 pt-2 text-[15px] font-medium">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="#FBBF24" stroke="#FBBF24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
              <span className="text-[#1F2432] font-semibold">{store.rating || '0.00'}</span>
              <span className="text-[#9CA3AF]">•</span>
              <span className="text-[#6B7280]">{store.reviews || '0 reviews'}</span>
            </div>
            {/* Operating / Closed badge */}
            <div className={`mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[13px] font-semibold ${isStoreOpen ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
              <div className={`w-2 h-2 rounded-full ${isStoreOpen ? 'bg-green-500' : 'bg-red-500'}`} />
              {isStoreOpen ? 'Open Now' : 'Closed'}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-8 border-b border-gray-200/60 flex flex-wrap gap-8 justify-center sm:justify-start">
          {[
            { id: 'inventory', label: `Inventory (${inventory.length})` },
            { id: 'about', label: 'About' },
            { id: 'gallery', label: `Gallery (${gallery.length})` },
            { id: 'reviews', label: `Reviews (${reviewsList.length})` }
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 text-[16px] font-bold border-b-2 transition-colors ${
                activeTab === tab.id ? 'border-[#1F2432] text-[#1F2432]' : 'border-transparent text-[#6B7280] hover:text-[#1F2432]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="min-h-[200px]">
          {activeTab === 'about' && (
            <div className="space-y-6">
              <p className="text-[15px] leading-relaxed text-[#1F2432]">
                {store.bio || 'This store has not provided a description yet.'}
              </p>
            </div>
          )}

          {activeTab === 'inventory' && (
            <div className="space-y-4">
              {/* Category filter */}
              {categories.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setCategoryFilter('')}
                    className={`px-4 py-1.5 rounded-full text-[13px] font-semibold transition-all ${!categoryFilter ? 'bg-[#1EBDB8] text-white' : 'bg-gray-100 text-[#6B7280] hover:bg-gray-200'}`}
                  >
                    All
                  </button>
                  {categories.map(cat => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategoryFilter(cat)}
                      className={`px-4 py-1.5 rounded-full text-[13px] font-semibold transition-all ${categoryFilter === cat ? 'bg-[#1EBDB8] text-white' : 'bg-gray-100 text-[#6B7280] hover:bg-gray-200'}`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              )}

              {filteredInventory.length === 0 ? (
                <div className="bg-white rounded-[20px] p-8 text-center border border-gray-100">
                  <p className="text-[15px] font-bold text-[#4B5563]">No medicines in stock</p>
                  <p className="text-[13px] text-[#9CA3AF] mt-1">The store has no available inventory listed.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {filteredInventory.map((med) => (
                    <div key={med.id} className="bg-white rounded-[16px] p-4 border border-gray-100 shadow-sm flex flex-col gap-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-[15px] font-bold text-[#1F2432]">{med.name}</p>
                          <p className="text-[12px] text-[#6B7280]">{med.brand}</p>
                        </div>
                        <span className="text-[14px] font-bold text-[#1EBDB8]">{formatCurrency(med.price)}</span>
                      </div>
                      {med.category && (
                        <span className="w-fit text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#E8FBFA] text-[#1EBDB8]">{med.category}</span>
                      )}
                      {med.description && (
                        <p className="text-[12px] text-[#6B7280] leading-relaxed">{med.description}</p>
                      )}
                      <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-50">
                        <span className="text-[11px] text-[#9CA3AF]">Stock: {med.stock}</span>
                        {med.status === 'In Stock' && (
                          <button 
                            type="button" 
                            onClick={() => handleAddToCart(med)}
                            className="bg-[#1EBDB8] hover:bg-[#1CAAAE] text-white text-[11px] font-bold px-3 py-1.5 rounded-lg transition-colors"
                          >
                            Add to Cart
                          </button>
                        )}
                        {med.status !== 'In Stock' && (
                          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-red-50 text-red-600">Out of Stock</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'gallery' && (
            <div className="space-y-4">
              {gallery.length === 0 ? (
                <div className="bg-white rounded-[20px] p-8 text-center border border-gray-100 shadow-sm">
                  <p className="text-[15px] font-bold text-[#4B5563]">No images uploaded</p>
                  <p className="text-[13px] text-[#9CA3AF] mt-1">This medical store hasn't shared any photos yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {gallery.map((item) => (
                    <div key={item.id} className="aspect-square rounded-[20px] overflow-hidden border border-gray-100 bg-gray-50 group relative cursor-pointer shadow-sm">
                      {item.type === 'image' ? (
                        <img src={item.url} alt="Store Media" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                      ) : (
                        <video src={item.url} className="w-full h-full object-cover" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-4">
              {reviewsList.length === 0 ? (
                <div className="bg-white rounded-[20px] p-8 text-center border border-gray-100 shadow-sm">
                  <p className="text-[15px] font-bold text-[#4B5563]">No reviews yet</p>
                  <p className="text-[13px] text-[#9CA3AF] mt-1">Be the first to leave a review after your order!</p>
                </div>
              ) : (
                <div className="space-y-4">
                   {reviewsList.map((rev) => (
                     <div key={rev.id} className="bg-white rounded-[20px] p-6 border border-gray-100 shadow-sm space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-[15px] font-bold text-[#1F2432]">{rev.patientName}</p>
                            <p className="text-[12px] text-[#9CA3AF]">{new Date(rev.createdAt).toLocaleDateString()}</p>
                          </div>
                          <div className="flex bg-[#FFFBEB] px-2 py-1 rounded-lg gap-1 items-center">
                            <svg className="w-3 h-3 text-[#FBBF24]" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                            <span className="text-[12px] font-bold text-[#92400E]">{rev.rating}</span>
                          </div>
                        </div>
                        <p className="text-[14px] text-[#4B5563] leading-relaxed italic">{rev.comment || 'No comment provided.'}</p>
                     </div>
                   ))}
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Right column — Order panel */}
      <aside className="xl:sticky xl:top-6 bg-white rounded-[24px] p-6 shadow-[0px_4px_20px_rgba(0,0,0,0.06)] border border-gray-100 space-y-5">
        <h2 className="text-[20px] font-bold text-[#1F2432]">Order Medicine</h2>

        {!isStoreOpen && (
          <div className="rounded-[14px] border border-red-100 bg-red-50 px-4 py-3">
            <p className="text-[13px] font-bold text-red-700">Store is currently closed</p>
            <p className="text-[12px] text-red-600 mt-0.5">Operating hours: {store.availability}</p>
          </div>
        )}

        {/* Cart Summary */}
        <div className="space-y-3">
          <h3 className="text-[14px] font-bold text-[#1F2432] flex justify-between">
            Your Cart
            <span className="text-[#1EBDB8]">{cart.length} items</span>
          </h3>

          {cart.length === 0 ? (
            <p className="text-[12px] text-[#9CA3AF] text-center py-4 border-2 border-dashed border-gray-50 rounded-xl">Your cart is empty. Add medicines from the inventory.</p>
          ) : (
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
              {cart.map((item) => (
                <div key={item.id} className="bg-gray-50 rounded-xl p-3 space-y-2">
                  <div className="flex justify-between items-start gap-2">
                    <p className="text-[13px] font-bold text-[#1F2432] leading-tight truncate">{item.name}</p>
                    <button type="button" onClick={() => removeFromCart(item.id)} className="text-[#9CA3AF] hover:text-red-500">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
                    </button>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <button 
                         type="button" 
                         onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                         className="w-6 h-6 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-[16px] font-bold text-[#1F2432] hover:bg-gray-100"
                      >-</button>
                      <span className="text-[13px] font-bold min-w-[12px] text-center">{item.quantity}</span>
                      <button 
                         type="button" 
                         onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                         className="w-6 h-6 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-[16px] font-bold text-[#1F2432] hover:bg-gray-100"
                      >+</button>
                    </div>
                    <span className="text-[13px] font-bold text-[#1EBDB8]">{formatCurrency(item.price * item.quantity)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {cart.length > 0 && (
            <div className="pt-3 border-t border-gray-100 space-y-2">
              <div className="flex justify-between items-center">
                 <span className="text-[14px] text-[#6B7280]">Subtotal</span>
                 <span className="text-[16px] font-bold text-[#1F2432]">{formatCurrency(cartTotal)}</span>
              </div>
            </div>
          )}
        </div>

        <div className="bg-[#F8FCFF] rounded-[14px] border border-[#D8EFF0] p-4 space-y-2">
          <div className="flex items-start gap-2">
            <svg className="w-5 h-5 text-[#1EBDB8] shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9" />
            </svg>
            <div>
              <p className="text-[14px] font-bold text-[#1F2432]">Prescription Required</p>
              <p className="text-[12px] text-[#6B7280] mt-0.5">Verification required for medicinal items.</p>
            </div>
          </div>
        </div>

        <button
          type="button"
          disabled={!isStoreOpen || cart.length === 0}
          onClick={() => { setShowOrderFlow(true); setStep('prescription'); }}
          className={`w-full py-3.5 rounded-[14px] font-bold text-[15px] transition-all ${
            isStoreOpen && cart.length > 0
              ? 'bg-[#1EBDB8] hover:bg-[#1CAAAE] text-white shadow-[0_8px_20px_-8px_rgba(30,189,184,0.6)]'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          {cart.length === 0
            ? 'Cart is empty'
            : isStoreOpen
              ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  Order Medicine
                </span>
              )
              : 'Store Closed'
          }
        </button>
      </aside>
    </div>
  );
}

// ── PrescriptionPickerStep ──────────────────────────────────────────────────
function PrescriptionPickerStep({ onBack, store, selectedPrescription, onSelectExisting, onUploadNew, isUploading, onContinue }) {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loadingPrescriptions, setLoadingPrescriptions] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      const token = localStorage.getItem('patientToken');
      if (!token) { setLoadingPrescriptions(false); return; }

      try {
        const { fetchPatientPrescriptions } = await import('../../../services/authApi');
        const data = await fetchPatientPrescriptions(token);
        if (isMounted) setPrescriptions(Array.isArray(data?.prescriptions) ? data.prescriptions : []);
      } catch {
        if (isMounted) setPrescriptions([]);
      } finally {
        if (isMounted) setLoadingPrescriptions(false);
      }
    };

    load();
    return () => { isMounted = false; };
  }, []);

  return (
    <div className="pb-24">
      <section className="max-w-[860px] mx-auto space-y-6">
        <button type="button" onClick={onBack} className="inline-flex items-center gap-1.5 text-[13px] font-bold text-[#6B7280] hover:text-[#1F2432]">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
          </svg>
          Back to Store
        </button>

        {/* Store banner */}
        <div className="relative overflow-hidden rounded-[20px] border border-[#D8EFF0] bg-gradient-to-r from-[#ECFAFA] via-[#F8FCFF] to-[#EEF6FF] p-5 sm:p-6">
          <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-[#C8F3F1]/50 blur-2xl" />
          <div className="relative flex items-start gap-4">
            <div className="w-[72px] h-[72px] rounded-2xl overflow-hidden bg-white border border-white/60 shadow-sm shrink-0">
              <img src={store.image} alt={store.name} className="w-full h-full object-cover" />
            </div>
            <div>
              <h1 className="text-[20px] font-bold text-[#1F2432]">Ordering from {store.name}</h1>
              <p className="text-[14px] text-[#6B7280]">{store.location}</p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-[28px] sm:text-[32px] font-bold text-[#1F2432] mb-1">Select Prescription</h2>
          <p className="text-[15px] text-[#6B7280]">A prescription is required to order medicine. Select an existing one or upload a new scan.</p>
        </div>

        {/* Upload new */}
        <div className="space-y-3">
          <h3 className="text-[17px] font-bold text-[#1F2432]">Upload New Prescription</h3>
          <label className={`flex flex-col items-center justify-center gap-3 border-2 border-dashed rounded-[20px] p-8 cursor-pointer transition-all ${selectedPrescription?.source === 'uploaded' ? 'border-[#1EBDB8] bg-[#ECFAFA]' : 'border-gray-300 bg-white hover:border-[#1EBDB8]/60 hover:bg-gray-50'}`}>
            {isUploading ? (
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full border-[2px] border-[#1EBDB8] border-t-transparent animate-spin" />
                <span className="text-[14px] font-semibold text-[#1EBDB8]">Uploading...</span>
              </div>
            ) : selectedPrescription?.source === 'uploaded' ? (
              <>
                <svg className="w-10 h-10 text-[#1EBDB8]" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
                <span className="text-[14px] font-bold text-[#1EBDB8]">Prescription uploaded ✓</span>
                <span className="text-[12px] text-[#6B7280]">Click to replace</span>
                <input type="file" accept="image/*,application/pdf" className="hidden" onChange={(e) => e.target.files?.[0] && onUploadNew(e.target.files[0])} />
              </>
            ) : (
              <>
                <svg className="w-10 h-10 text-[#9CA3AF]" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
                </svg>
                <span className="text-[14px] font-bold text-[#1F2432]">Click to upload prescription</span>
                <span className="text-[12px] text-[#9CA3AF]">JPG, PNG or PDF — max 10 MB</span>
                <input type="file" accept="image/*,application/pdf" className="hidden" onChange={(e) => e.target.files?.[0] && onUploadNew(e.target.files[0])} />
              </>
            )}
          </label>
        </div>

        {/* Existing prescriptions */}
        {loadingPrescriptions ? (
          <div className="flex items-center gap-3 py-4">
            <div className="w-5 h-5 rounded-full border-[2px] border-[#1EBDB8] border-t-transparent animate-spin" />
            <span className="text-[14px] text-[#6B7280]">Loading your prescriptions...</span>
          </div>
        ) : prescriptions.length > 0 ? (
          <div className="space-y-3">
            <h3 className="text-[17px] font-bold text-[#1F2432]">Or select an existing prescription</h3>
            <div className="space-y-3">
              {prescriptions.map((p) => {
                const isSelected = selectedPrescription?.source === 'existing' && selectedPrescription?.id === p._id;
                const doc = p.doctorId || {};
                const hasAttachment = Boolean(p.attachmentUrl);
                return (
                  <button
                    key={p._id}
                    type="button"
                    onClick={() => onSelectExisting({ id: p._id, doctorName: doc.fullName, date: p.createdAt, attachmentUrl: p.attachmentUrl, attachmentFileType: p.attachmentFileType, notes: p.notes })}
                    className={`w-full text-left rounded-[16px] border p-4 transition-all flex items-center gap-4 ${isSelected ? 'border-[#1EBDB8] bg-[#ECFAFA] ring-2 ring-[#1EBDB8]/20' : 'border-gray-200 bg-white hover:border-[#1EBDB8]/50'}`}
                  >
                    {/* Selection indicator */}
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${isSelected ? 'border-[#1EBDB8] bg-[#1EBDB8]' : 'border-gray-300'}`}>
                      {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                    </div>

                    {/* Doctor avatar */}
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 shrink-0">
                      {doc.avatarDocument?.url
                        ? <img src={doc.avatarDocument.url} alt={doc.fullName} className="w-full h-full object-cover" />
                        : <div className="w-full h-full bg-[#1EBDB8] text-white flex items-center justify-center font-bold">{String(doc.fullName || 'D').charAt(0)}</div>
                      }
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-bold text-[#1F2432] truncate">Dr. {doc.fullName || 'Doctor'}</p>
                      <p className="text-[12px] text-[#6B7280]">{new Date(p.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                      {hasAttachment && <p className="text-[11px] text-[#1EBDB8] font-semibold mt-0.5">Has attachment</p>}
                    </div>
                    {isSelected && (
                      <svg className="w-5 h-5 text-[#1EBDB8] shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                      </svg>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="rounded-[16px] border border-amber-100 bg-amber-50 p-4">
            <p className="text-[13px] font-semibold text-amber-700">No existing prescriptions</p>
            <p className="text-[12px] text-amber-600 mt-0.5">Upload a new prescription above to continue.</p>
          </div>
        )}

        {/* Continue button */}
        <button
          type="button"
          onClick={onContinue}
          disabled={!selectedPrescription}
          className={`w-full py-3.5 rounded-[999px] text-[18px] font-bold transition-colors ${
            selectedPrescription
              ? 'bg-[#1EBDB8] hover:bg-[#1CAAAE] text-white shadow-[0_14px_28px_-14px_rgba(30,189,184,0.75)]'
              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
          }`}
        >
          Continue to Delivery Details →
        </button>
      </section>
    </div>
  );
}
