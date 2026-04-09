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
  confirmPatientAppointmentPayment,
  createPatientAppointmentPaymentIntent,
  fetchPatientDoctorProfile
} from '../../../services/authApi';
import { getPatientSessionProfile } from '../../../utils/authSession';

const APPOINTMENT_TYPE_OPTIONS = [
  {
    id: 'online',
    label: 'Online'
  },
  {
    id: 'offline',
    label: 'Offline (Clinic Visit)'
  }
];

const STRIPE_PUBLISHABLE_KEY = String(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '').trim();
const stripePromise = STRIPE_PUBLISHABLE_KEY ? loadStripe(STRIPE_PUBLISHABLE_KEY) : null;

const stripeElementStyle = {
  style: {
    base: {
      color: '#1F2432',
      fontFamily: 'ui-sans-serif, system-ui, sans-serif',
      fontSize: '15px',
      '::placeholder': {
        color: '#9CA3AF'
      }
    },
    invalid: {
      color: '#DC2626'
    }
  }
};

function StripeCardPaymentForm({ canSubmitBooking, isBookingProcessing, onSubmitPayment }) {
  const stripe = useStripe();
  const elements = useElements();
  const [cardError, setCardError] = useState('');
  const [cardFieldState, setCardFieldState] = useState({
    cardNumberComplete: false,
    cardExpiryComplete: false,
    cardCvcComplete: false
  });

  const isCardDetailsComplete =
    cardFieldState.cardNumberComplete
    && cardFieldState.cardExpiryComplete
    && cardFieldState.cardCvcComplete;

  const canProceedWithPayment = Boolean(
    canSubmitBooking
    && isCardDetailsComplete
    && !isBookingProcessing
    && stripe
    && elements
  );

  const handleStripeFieldChange = (fieldName) => (event) => {
    setCardFieldState((previousState) => ({
      ...previousState,
      [fieldName]: Boolean(event?.complete)
    }));

    setCardError(event?.error?.message || '');
  };

  const handlePaymentClick = async () => {
    if (!canSubmitBooking) {
      toast.error('Complete the required fields and accept terms to continue');
      return;
    }

    if (!isCardDetailsComplete) {
      toast.error('Complete card number, expiry date, and CVC first');
      return;
    }

    if (!stripe || !elements) {
      toast.error('Secure payment form is still loading. Please try again in a moment.');
      return;
    }

    const cardNumberElement = elements.getElement(CardNumberElement);

    if (!cardNumberElement) {
      toast.error('Card details are not ready yet.');
      return;
    }

    await onSubmitPayment({ stripe, cardNumberElement });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <label className="text-[14px] font-semibold text-[#1F2432]">Card Number</label>
        <div className="rounded-[12px] border border-gray-300 bg-white px-4 py-3.5 focus-within:border-[#1EBDB8] focus-within:ring-2 focus-within:ring-[#1EBDB8]/15">
          <CardNumberElement
            options={{
              ...stripeElementStyle,
              showIcon: true
            }}
            onChange={handleStripeFieldChange('cardNumberComplete')}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-2">
          <label className="text-[14px] font-semibold text-[#1F2432]">Expiry Date</label>
          <div className="rounded-[12px] border border-gray-300 bg-white px-4 py-3.5 focus-within:border-[#1EBDB8] focus-within:ring-2 focus-within:ring-[#1EBDB8]/15">
            <CardExpiryElement
              options={stripeElementStyle}
              onChange={handleStripeFieldChange('cardExpiryComplete')}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[14px] font-semibold text-[#1F2432]">CVC</label>
          <div className="rounded-[12px] border border-gray-300 bg-white px-4 py-3.5 focus-within:border-[#1EBDB8] focus-within:ring-2 focus-within:ring-[#1EBDB8]/15">
            <CardCvcElement
              options={stripeElementStyle}
              onChange={handleStripeFieldChange('cardCvcComplete')}
            />
          </div>
        </div>
      </div>

      {cardError ? (
        <p className="text-[12px] font-medium text-red-600">{cardError}</p>
      ) : (
        <p className="text-[12px] text-[#6B7280]">Use Stripe test card 4242 4242 4242 4242.</p>
      )}

      {isCardDetailsComplete ? (
        <button
          type="button"
          onClick={handlePaymentClick}
          disabled={!canProceedWithPayment}
          className={`w-full py-3.5 rounded-[999px] text-[19px] font-bold transition-colors ${
            canProceedWithPayment
              ? 'bg-[#1EBDB8] hover:bg-[#1CAAAE] text-white shadow-[0_14px_28px_-14px_rgba(30,189,184,0.75)]'
              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
          }`}
        >
          {isBookingProcessing ? 'Processing Payment...' : 'Pay & Book Appointment'}
        </button>
      ) : (
        <p className="text-[12px] font-semibold text-[#6B7280]">
          Complete all card details to show payment button.
        </p>
      )}
    </div>
  );
}

const formatSlotDate = (dateValue) => {
  if (!dateValue) {
    return '';
  }

  const parsedDate = new Date(`${dateValue}T00:00:00`);

  if (Number.isNaN(parsedDate.getTime())) {
    return dateValue;
  }

  return parsedDate.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });
};

const formatAppointmentDateTime = (slot) => {
  if (!slot) {
    return '';
  }

  const slotDateLabel = formatSlotDate(slot.date);
  return `${slotDateLabel} . ${slot.fromTime} - ${slot.toTime}`;
};

const formatCurrency = (amountValue) => {
  const parsedAmount = Number(amountValue);
  const safeAmount = Number.isFinite(parsedAmount)
    ? Math.max(0, parsedAmount)
    : 0;

  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR',
    maximumFractionDigits: 0
  }).format(safeAmount);
};

const createDefaultBookingForm = () => {
  return {
    phoneNumber: '',
    streetAddress: '',
    aptSuite: '',
    city: '',
    state: '',
    zip: '',
    termsAccepted: false
  };
};

const buildModeSlots = (value) => {
  if (!value || typeof value !== 'object') {
    return {
      online: [],
      offline: []
    };
  }

  return {
    online: Array.isArray(value.online) ? value.online : [],
    offline: Array.isArray(value.offline) ? value.offline : []
  };
};

export default function DoctorProfileScreen({ doctorId, onBack }) {
  const [doctor, setDoctor] = useState(null);
  const [slotsByMode, setSlotsByMode] = useState({ online: [], offline: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [selectedMode, setSelectedMode] = useState('online');
  const [selectedSlotId, setSelectedSlotId] = useState('');
  const [activeTab, setActiveTab] = useState('about');
  const [isBookingFormOpen, setIsBookingFormOpen] = useState(false);
  const [bookingForm, setBookingForm] = useState(createDefaultBookingForm());
  const [isBookingProcessing, setIsBookingProcessing] = useState(false);
  const patientProfile = useMemo(() => getPatientSessionProfile(), []);

  useEffect(() => {
    let isMounted = true;

    const loadDoctorProfile = async () => {
      if (!doctorId) {
        if (isMounted) {
          setDoctor(null);
          setSlotsByMode({ online: [], offline: [] });
          setLoadError('Doctor profile could not be opened.');
          setIsLoading(false);
        }

        return;
      }

      const patientToken = localStorage.getItem('patientToken');

      if (!patientToken) {
        if (isMounted) {
          setDoctor(null);
          setSlotsByMode({ online: [], offline: [] });
          setLoadError('Please sign in again to continue.');
          setIsLoading(false);
        }

        return;
      }

      try {
        setIsLoading(true);
        setLoadError('');
        setSelectedSlotId('');
        setIsBookingFormOpen(false);
        setBookingForm(createDefaultBookingForm());
        setIsBookingProcessing(false);

        const data = await fetchPatientDoctorProfile(patientToken, doctorId);

        if (!isMounted) {
          return;
        }

        const normalizedSlots = buildModeSlots(data?.slotsByMode);
        setDoctor(data?.doctor || null);
        setSlotsByMode(normalizedSlots);

        if (normalizedSlots.online.length > 0) {
          setSelectedMode('online');
        } else if (normalizedSlots.offline.length > 0) {
          setSelectedMode('offline');
        } else {
          setSelectedMode('online');
        }
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setDoctor(null);
        setSlotsByMode({ online: [], offline: [] });
        setLoadError(error?.message || 'Could not load doctor profile right now');
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadDoctorProfile();

    return () => {
      isMounted = false;
    };
  }, [doctorId]);

  const selectedModeSlots = useMemo(() => {
    return selectedMode === 'offline' ? slotsByMode.offline : slotsByMode.online;
  }, [selectedMode, slotsByMode]);

  const selectedSlot = useMemo(() => {
    return selectedModeSlots.find((slot) => String(slot.id) === String(selectedSlotId)) || null;
  }, [selectedModeSlots, selectedSlotId]);

  const selectedAppointmentTypeLabel = useMemo(() => {
    return selectedMode === 'offline' ? 'Offline (Clinic Visit)' : 'Online Consultation';
  }, [selectedMode]);

  const selectedSlotFeeLabel = useMemo(() => {
    return formatCurrency(selectedSlot?.priceInRupees || 0);
  }, [selectedSlot]);

  const canSubmitBooking = useMemo(() => {
    return Boolean(
      bookingForm.termsAccepted
      && /^\d{7,15}$/.test(bookingForm.phoneNumber.trim())
      && bookingForm.streetAddress.trim()
      && bookingForm.city.trim()
      && bookingForm.state.trim()
      && bookingForm.zip.trim()
    );
  }, [bookingForm]);

  useEffect(() => {
    if (selectedModeSlots.some((slot) => String(slot.id) === String(selectedSlotId))) {
      return;
    }

    setSelectedSlotId('');
  }, [selectedModeSlots, selectedSlotId]);

  useEffect(() => {
    if (isBookingFormOpen && !selectedSlot) {
      setIsBookingFormOpen(false);
    }
  }, [isBookingFormOpen, selectedSlot]);

  const handleBookingFieldChange = (field) => (event) => {
    const value = event?.target?.value || '';
    const normalizedValue = field === 'phoneNumber'
      ? String(value).replace(/\D/g, '').slice(0, 15)
      : value;

    setBookingForm((previousForm) => ({
      ...previousForm,
      [field]: normalizedValue
    }));
  };

  const handleProceedToBooking = () => {
    if (!selectedSlot) {
      toast.error('Select a slot first to continue');
      return;
    }

    setIsBookingFormOpen(true);
  };

  const handleSubmitBooking = async ({ stripe, cardNumberElement }) => {
    if (!canSubmitBooking) {
      toast.error('Complete the required fields and accept terms to continue');
      return;
    }

    const patientToken = localStorage.getItem('patientToken');

    if (!patientToken) {
      toast.error('Please sign in again to continue');
      return;
    }

    if (!doctor?.id || !selectedSlot?.id) {
      toast.error('Please select an available slot again');
      return;
    }

    setIsBookingProcessing(true);

    try {
      const paymentSession = await createPatientAppointmentPaymentIntent(patientToken, {
        doctorId: doctor.id,
        slotId: selectedSlot.id,
        phoneNumber: bookingForm.phoneNumber,
        streetAddress: bookingForm.streetAddress,
        aptSuite: bookingForm.aptSuite,
        city: bookingForm.city,
        state: bookingForm.state,
        zip: bookingForm.zip
      });

      const paymentResult = await stripe.confirmCardPayment(paymentSession.clientSecret, {
        payment_method: {
          card: cardNumberElement,
          billing_details: {
            name: patientProfile.name,
            email: patientProfile.email || undefined,
            phone: bookingForm.phoneNumber,
            address: {
              line1: bookingForm.streetAddress,
              line2: bookingForm.aptSuite || undefined,
              city: bookingForm.city,
              state: bookingForm.state,
              postal_code: bookingForm.zip,
              country: 'PK'
            }
          }
        }
      });

      if (paymentResult.error) {
        throw new Error(paymentResult.error.message || 'Payment failed');
      }

      if (paymentResult?.paymentIntent?.status !== 'succeeded') {
        throw new Error('Payment did not complete successfully');
      }

      await confirmPatientAppointmentPayment(patientToken, paymentSession.paymentIntentId);

      const bookedSlotId = String(selectedSlot.id);
      setSlotsByMode((previousSlots) => {
        return {
          online: previousSlots.online.filter((slot) => String(slot.id) !== bookedSlotId),
          offline: previousSlots.offline.filter((slot) => String(slot.id) !== bookedSlotId)
        };
      });

      setSelectedSlotId('');
      setIsBookingFormOpen(false);
      setBookingForm(createDefaultBookingForm());
      toast.success('Appointment booked and payment confirmed successfully');
      window.dispatchEvent(new Event('patient-appointment-updated'));
      window.dispatchEvent(new Event('doctor-appointment-updated'));
    } catch (error) {
      toast.error(error?.message || 'Could not complete payment right now');
    } finally {
      setIsBookingProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white border border-gray-100 rounded-[24px] p-8 text-center">
        <p className="text-[16px] font-bold text-[#4B5563]">Loading doctor profile...</p>
      </div>
    );
  }

  if (loadError || !doctor) {
    return (
      <div className="bg-white border border-gray-100 rounded-[24px] p-8 text-center space-y-3">
        <p className="text-[16px] font-bold text-[#4B5563]">{loadError || 'Doctor profile is unavailable'}</p>
        <button
          type="button"
          onClick={() => onBack?.()}
          className="inline-flex items-center px-4 py-2 rounded-xl bg-[#1EBDB8] hover:bg-[#1CAAAE] text-white text-[13px] font-bold"
        >
          Back
        </button>
      </div>
    );
  }

  if (isBookingFormOpen && selectedSlot) {
    return (
      <div className="pb-24">
        <section className="max-w-[860px] mx-auto space-y-6 sm:space-y-7">
          <button
            type="button"
            onClick={() => setIsBookingFormOpen(false)}
            className="inline-flex items-center gap-1.5 text-[13px] font-bold text-[#6B7280] hover:text-[#1F2432]"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            Back
          </button>

          <div className="relative overflow-hidden rounded-[20px] border border-[#D8EFF0] bg-gradient-to-r from-[#ECFAFA] via-[#F8FCFF] to-[#EEF6FF] p-5 sm:p-6">
            <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-[#C8F3F1]/50 blur-2xl" />
            <div className="relative flex flex-col sm:flex-row items-start gap-4 sm:gap-5">
              <div className="w-[96px] h-[96px] rounded-2xl overflow-hidden bg-white border border-white/60 shadow-sm shrink-0">
                <img src={doctor.image} alt={doctor.name} className="w-full h-full object-cover" />
              </div>

              <div className="space-y-1.5">
                <h1 className="text-[22px] sm:text-[28px] leading-tight font-bold text-[#1F2432]">{doctor.name}</h1>
                <p className="text-[19px] font-semibold text-[#374151]">{doctor.specialty}</p>
                <p className="text-[15px] text-[#6B7280]">{doctor.location}</p>
                <p className="text-[14px] font-semibold text-[#1F2432]">{selectedAppointmentTypeLabel}</p>
                <div className="text-[13px] text-[#4B5563]">
                  <span>{formatAppointmentDateTime(selectedSlot)}</span>
                  <button
                    type="button"
                    onClick={() => setIsBookingFormOpen(false)}
                    className="ml-1.5 font-semibold underline hover:text-[#1F2432]"
                  >
                    Update
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="space-y-2">
              <h2 className="text-[30px] sm:text-[34px] leading-tight font-bold text-[#1F2432]">Patient Information</h2>
              <p className="text-[20px] font-medium text-[#1F2432]">{patientProfile.name}</p>
            </div>

            <div className="space-y-4">
              <h2 className="text-[30px] sm:text-[34px] leading-tight font-bold text-[#1F2432]">Contact Information</h2>
              <p className="text-[14px] text-[#6B7280]">Contact where we can reach you</p>

              <div className="space-y-2">
                <p className="text-[13px] font-semibold uppercase tracking-[0.08em] text-[#6B7280]">Email</p>
                <p className="text-[20px] font-medium text-[#1F2432]">{patientProfile.email || 'Not provided'}</p>
              </div>

              <div className="space-y-3">
                <label htmlFor="phoneNumber" className="text-[14px] font-semibold text-[#1F2432]">Phone Number</label>
                <input
                  id="phoneNumber"
                  type="tel"
                  value={bookingForm.phoneNumber}
                  onChange={handleBookingFieldChange('phoneNumber')}
                  placeholder="Enter your phone number"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={15}
                  className="w-full rounded-[12px] border border-gray-300 bg-white px-4 py-3.5 text-[14px] text-[#1F2432] outline-none focus:border-[#1EBDB8] focus:ring-2 focus:ring-[#1EBDB8]/15"
                />
                <p className="text-[12px] text-[#6B7280]">Use digits only (7 to 15 numbers).</p>
              </div>

              <div className="space-y-3">
                <label htmlFor="streetAddress" className="text-[14px] font-semibold text-[#1F2432]">Street Address</label>
                <input
                  id="streetAddress"
                  type="text"
                  value={bookingForm.streetAddress}
                  onChange={handleBookingFieldChange('streetAddress')}
                  className="w-full rounded-[12px] border border-gray-300 bg-white px-4 py-3.5 text-[14px] text-[#1F2432] outline-none focus:border-[#1EBDB8] focus:ring-2 focus:ring-[#1EBDB8]/15"
                />
              </div>

              <div className="space-y-3">
                <label htmlFor="aptSuite" className="text-[14px] font-semibold text-[#1F2432]">Apt. suite, building (optional)</label>
                <input
                  id="aptSuite"
                  type="text"
                  value={bookingForm.aptSuite}
                  onChange={handleBookingFieldChange('aptSuite')}
                  className="w-full rounded-[12px] border border-gray-300 bg-white px-4 py-3.5 text-[14px] text-[#1F2432] outline-none focus:border-[#1EBDB8] focus:ring-2 focus:ring-[#1EBDB8]/15"
                />
              </div>

              <div className="space-y-3">
                <label htmlFor="city" className="text-[14px] font-semibold text-[#1F2432]">City</label>
                <input
                  id="city"
                  type="text"
                  value={bookingForm.city}
                  onChange={handleBookingFieldChange('city')}
                  className="w-full rounded-[12px] border border-gray-300 bg-white px-4 py-3.5 text-[14px] text-[#1F2432] outline-none focus:border-[#1EBDB8] focus:ring-2 focus:ring-[#1EBDB8]/15"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <label htmlFor="state" className="text-[14px] font-semibold text-[#1F2432]">State</label>
                  <input
                    id="state"
                    type="text"
                    value={bookingForm.state}
                    onChange={handleBookingFieldChange('state')}
                    className="w-full rounded-[12px] border border-gray-300 bg-white px-4 py-3.5 text-[14px] text-[#1F2432] outline-none focus:border-[#1EBDB8] focus:ring-2 focus:ring-[#1EBDB8]/15"
                  />
                </div>
                <div className="space-y-3">
                  <label htmlFor="zip" className="text-[14px] font-semibold text-[#1F2432]">Zip</label>
                  <input
                    id="zip"
                    type="text"
                    value={bookingForm.zip}
                    onChange={handleBookingFieldChange('zip')}
                    className="w-full rounded-[12px] border border-gray-300 bg-white px-4 py-3.5 text-[14px] text-[#1F2432] outline-none focus:border-[#1EBDB8] focus:ring-2 focus:ring-[#1EBDB8]/15"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h2 className="text-[30px] sm:text-[34px] leading-tight font-bold text-[#1F2432]">Payment Method</h2>

              <div className="rounded-[14px] border border-[#22B8B2] bg-[#ECFCFB] px-4 py-4 flex items-center justify-between gap-3">
                <div className="inline-flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-[#1EBDB8] text-white inline-flex items-center justify-center">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </span>
                  <span className="text-[26px] leading-none font-semibold text-[#0DA6A2]">Stripe</span>
                </div>
                <p className="text-[19px] font-bold text-[#1F2432]">{selectedSlotFeeLabel}</p>
              </div>

              <p className="text-[13px] text-[#6B7280]">Doctor fee for the selected slot.</p>
            </div>

            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={bookingForm.termsAccepted}
                onChange={(event) => {
                  const isChecked = Boolean(event?.target?.checked);

                  setBookingForm((previousForm) => ({
                    ...previousForm,
                    termsAccepted: isChecked
                  }));
                }}
                className="mt-1 h-5 w-5 rounded border-gray-300 text-[#1EBDB8] focus:ring-[#1EBDB8]"
              />
              <span className="text-[14px] leading-relaxed text-[#4B5563]">
                I certify that the payment selected is the one I will be using when I see this medical professional.
              </span>
            </label>

            {stripePromise ? (
              <Elements stripe={stripePromise}>
                <StripeCardPaymentForm
                  canSubmitBooking={canSubmitBooking}
                  isBookingProcessing={isBookingProcessing}
                  onSubmitPayment={handleSubmitBooking}
                />
              </Elements>
            ) : (
              <div className="rounded-[12px] border border-amber-200 bg-amber-50 px-4 py-3">
                <p className="text-[13px] font-semibold text-amber-700">
                  Stripe publishable key is missing. Set VITE_STRIPE_PUBLISHABLE_KEY in frontend environment variables.
                </p>
              </div>
            )}
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[1fr_500px] gap-8 pb-24 items-start bg-[#F4FDFD] -m-6 p-6">
      {/* Left Column (Profile info) */}
      <section className="bg-transparent p-4 sm:p-6 lg:p-8 shrink-0">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-8 mb-10">
          <div className="w-[180px] h-[180px] rounded-full overflow-hidden bg-[#F3F4F6] border-[4px] border-white shadow-sm shrink-0">
            <img src={doctor.image} alt={doctor.name} className="w-full h-full object-cover" />
          </div>

          <div className="space-y-1.5 text-center sm:text-left mt-2">
            <h1 className="text-[32px] sm:text-[38px] leading-tight font-bold text-[#1F2432]">{doctor.name}</h1>
            <p className="text-[22px] font-semibold text-[#1F2432]">{doctor.specialty} Primary Care Doctor</p>
            <p className="text-[18px] font-medium text-[#6B7280]">{doctor.location || 'Doctors Address'}</p>
            <div className="flex items-center justify-center sm:justify-start gap-2 pt-1 text-[16px] font-medium">
                <span className="text-red-500">Closed</span>
                <span className="text-[#9CA3AF]">•</span>
                <span className="text-[#6B7280]">Opens 9 AM Mon</span>
            </div>
            {/* Keeping rating hidden based on image layout */}
          </div>
        </div>

        <div className="mb-8 border-b border-gray-200/60 flex flex-wrap gap-8 justify-center sm:justify-start">
          <button
            type="button"
            onClick={() => setActiveTab('about')}
            className={`pb-3 text-[16px] font-bold border-b-2 transition-colors ${
              activeTab === 'about'
                ? 'border-[#1F2432] text-[#1F2432]'
                : 'border-transparent text-[#6B7280] hover:text-[#1F2432]'
            }`}
          >
            About
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('reviews')}
            className={`pb-3 text-[16px] font-bold border-b-2 transition-colors ${
              activeTab === 'reviews'
                ? 'border-[#1F2432] text-[#1F2432]'
                : 'border-transparent text-[#6B7280] hover:text-[#1F2432]'
            }`}
          >
            Reviews
          </button>
        </div>

        <div className="min-h-[200px]">
          {activeTab === 'about' && (
            <div className="space-y-4">
              <p className="text-[15px] leading-relaxed text-[#1F2432] pr-0 lg:pr-12">
                {doctor.bio || 'This doctor has not provided a biography yet.'}
              </p>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-4">
              <h2 className="text-[19px] font-bold text-[#1F2432]">Patient Reviews</h2>
              
              {!doctor.reviewsList || doctor.reviewsList.length === 0 ? (
                <div className="bg-[#F9FAFB] rounded-xl p-6 text-center border border-gray-100">
                  <p className="text-[14px] font-medium text-[#6B7280]">No reviews yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {doctor.reviewsList.map((review, idx) => (
                    <div key={idx} className="bg-[#F9FAFB] p-5 rounded-xl border border-gray-100 flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <p className="text-[14px] font-bold text-[#1F2432]">{review.patientName || 'Anonymous Patient'}</p>
                        <div className="flex items-center gap-1">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="#FBBF24" stroke="#FBBF24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                          </svg>
                          <span className="text-[13px] font-bold text-[#4B5563]">{review.rating}</span>
                        </div>
                      </div>
                      <p className="text-[14px] text-[#4B5563] leading-relaxed">{review.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Right Column (Booking card) */}
      <section className="bg-white rounded-3xl p-8 sm:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] m-4 mb-24 max-w-[600px] w-full ml-auto">
        <div className="space-y-2 mb-8">
          <h2 className="text-[28px] leading-tight font-semibold text-[#1F2432]">Book an appointment on Simple</h2>
          <p className="text-[16px] text-[#6B7280]">The office partners with Simple to schedule appointments</p>
        </div>

        <div className="space-y-4 mt-8">
          <h3 className="text-[18px] font-medium text-[#1F2432]">Scheduling details</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {APPOINTMENT_TYPE_OPTIONS.map((option) => {
              const isSelected = selectedMode === option.id;
              const slotCount = option.id === 'online' ? slotsByMode.online.length : slotsByMode.offline.length;

              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setSelectedMode(option.id)}
                  className={`rounded-xl border px-4 py-3.5 text-center transition-colors ${
                    isSelected
                      ? 'border-[#1EBDB8] bg-[#E8FBFA]'
                      : 'border-gray-200 bg-white hover:border-[#1EBDB8]/40'
                  }`}
                >
                  <p className={`text-[14px] font-bold ${isSelected ? 'text-[#1EBDB8]' : 'text-[#1F2432]'}`}>{option.label}</p>
                  <p className="text-[12px] mt-1 text-[#6B7280]">{slotCount} slots</p>
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-4 mt-10">
          <div className="flex items-center justify-between">
            <h3 className="text-[20px] font-medium text-[#1F2432]">Today, Dec 13 - Thu, Dec 26</h3>
            <button type="button" className="p-1">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#1F2432]">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>
          {selectedModeSlots.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-200 bg-[#F8FAFC] px-4 py-6 text-center">
              <p className="text-[13px] font-medium text-[#6B7280]">No slots available for this appointment type.</p>
            </div>
          ) : (
            <div className="grid grid-cols-5 gap-3 mt-4">
              {selectedModeSlots.slice(0, 10).map((slot) => {
                const isSelected = String(selectedSlotId) === String(slot.id);

                return (
                  <button
                    key={slot.id}
                    type="button"
                    onClick={() => setSelectedSlotId(String(slot.id))}
                    className={`rounded-[12px] p-0 flex flex-col overflow-hidden text-center transition-colors h-[100px] ${
                      isSelected
                        ? 'border border-[#1EBDB8]'
                        : 'border-0'
                    }`}
                  >
                    <div className="bg-[#f0f0f0] text-[12px] font-medium text-[#6B7280] w-full py-3 h-1/2 flex items-center justify-center">
                        {formatSlotDate(slot.date)}
                    </div>
                    <div className="bg-[#1EBDB8] text-white text-[13px] font-semibold w-full py-3 h-1/2 flex items-center justify-center">
                        1 appts
                    </div>
                  </button>
                );
              })}
            </div>
          )}
          <div className="pt-6">
              <button className="text-[15px] font-medium text-[#1F2432] underline underline-offset-4 decoration-current hover:opacity-80 transition-opacity">
                  View more availability
              </button>
          </div>
        </div>

        {selectedSlot ? (
          <button
            type="button"
            onClick={handleProceedToBooking}
            className="w-full bg-[#1EBDB8] hover:bg-[#1CAAAE] text-white py-4 rounded-[12px] text-[16px] font-bold transition-colors mt-8"
          >
            Continue Booking
          </button>
        ) : null}
      </section>
    </div>
  );
}
