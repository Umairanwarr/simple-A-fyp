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
import DoctorCard from '../shared/DoctorCard';
import { exploreSpecialties } from '../data/doctorDirectory';
import {
  fetchPatientExploreDoctors,
  fetchPatientExploreStores,
  fetchPatientExploreClinics,
  fetchPatientSponsoredAccounts,
  fetchPatientClinicDoctors,
  createPatientClinicAppointmentPaymentIntent,
  confirmPatientClinicAppointmentPayment
} from '../../../services/authApi';
import { getPatientSessionProfile } from '../../../utils/authSession';

const normalize = (value) => String(value || '').trim().toLowerCase();
const isValidObjectId = (value) => /^[0-9a-fA-F]{24}$/.test(String(value || '').trim());
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

  const isCardDetailsComplete = cardFieldState.cardNumberComplete && cardFieldState.cardExpiryComplete && cardFieldState.cardCvcComplete;
  const canProceedWithPayment = canSubmitBooking && isCardDetailsComplete && !isBookingProcessing && stripe && elements;

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

    const cardNumberElement = elements?.getElement(CardNumberElement);
    if (!stripe || !cardNumberElement) {
      toast.error('Secure payment form is still loading. Please try again in a moment.');
      return;
    }

    await onSubmitPayment({ stripe, cardNumberElement });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <label className="text-[14px] font-semibold text-[#1F2432]">Card Number</label>
        <div className="rounded-[12px] border border-gray-300 bg-white px-4 py-3.5 focus-within:border-[#1EBDB8] focus-within:ring-2 focus-within:ring-[#1EBDB8]/15">
          <CardNumberElement options={{ ...stripeElementStyle, showIcon: true }} onChange={handleStripeFieldChange('cardNumberComplete')} />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-2">
          <label className="text-[14px] font-semibold text-[#1F2432]">Expiry Date</label>
          <div className="rounded-[12px] border border-gray-300 bg-white px-4 py-3.5 focus-within:border-[#1EBDB8] focus-within:ring-2 focus-within:ring-[#1EBDB8]/15">
            <CardExpiryElement options={stripeElementStyle} onChange={handleStripeFieldChange('cardExpiryComplete')} />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-[14px] font-semibold text-[#1F2432]">CVC</label>
          <div className="rounded-[12px] border border-gray-300 bg-white px-4 py-3.5 focus-within:border-[#1EBDB8] focus-within:ring-2 focus:ring-[#1EBDB8]/15">
            <CardCvcElement options={stripeElementStyle} onChange={handleStripeFieldChange('cardCvcComplete')} />
          </div>
        </div>
      </div>
      {cardError ? <p className="text-[12px] font-medium text-red-600">{cardError}</p> : <p className="text-[12px] text-[#6B7280]">Use Stripe test card 4242 4242 4242 4242.</p>}
      {isCardDetailsComplete && (
        <button
          type="button"
          onClick={handlePaymentClick}
          disabled={!canProceedWithPayment}
          className="w-full py-3.5 rounded-[999px] bg-[#1EBDB8] disabled:bg-gray-200 disabled:text-gray-500 disabled:cursor-not-allowed hover:bg-[#1CAAAE] text-white text-[19px] font-bold transition-colors"
        >
          {isBookingProcessing ? 'Processing Payment...' : 'Pay & Book Appointment'}
        </button>
      )}
    </div>
  );
}

const formatCurrency = (amountValue) => {
  const parsedAmount = Number(amountValue);
  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR',
    maximumFractionDigits: 0
  }).format(Number.isFinite(parsedAmount) ? Math.max(0, parsedAmount) : 0);
};

const formatSlotDate = (dateValue) => {
  const parsedDate = new Date(`${String(dateValue || '').trim()}T00:00:00`);
  if (Number.isNaN(parsedDate.getTime())) return String(dateValue || '').trim();

  return parsedDate.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });
};

const createDefaultBookingForm = (profile = null) => ({
  phoneNumber: profile?.phoneNumber || profile?.phone || '',
  streetAddress: '',
  aptSuite: '',
  city: '',
  state: '',
  zip: '',
  termsAccepted: false
});

const mapClinicProviders = (data = {}) => {
  const doctors = Array.isArray(data?.doctors) ? data.doctors : [];
  const services = Array.isArray(data?.services) ? data.services : [];

  const mappedServices = services.map((service) => ({
    id: String(service?.id || ''),
    name: String(service?.name || '').trim() || 'Clinic Service',
    specialty: String(service?.serviceType || '').trim().toLowerCase() === 'facility' ? 'Facility Service' : 'Lab Service',
    specialtyTag: 'Clinic Service',
    image: '',
    slots: Array.isArray(service?.slots) ? service.slots : [],
    providerType: 'service',
    serviceType: String(service?.serviceType || '').trim().toLowerCase() === 'facility' ? 'facility' : 'lab'
  }));

  return [
    ...doctors.map((doctor) => ({ ...doctor, providerType: 'doctor' })),
    ...mappedServices
  ];
};

const getClinicRankingTier = (item) => {
  const isDiamondPriority = Boolean(item?.isDiamondPriority || item?.isVerifiedBadge);
  if (isDiamondPriority) return 0;
  if (Boolean(item?.isSponsored)) return 1;
  return 2;
};

const sortExploreResults = (items = []) => {
  const safeItems = Array.isArray(items) ? [...items] : [];

  safeItems.sort((firstItem, secondItem) => {
    const firstIsClinic = firstItem?.type === 'clinic';
    const secondIsClinic = secondItem?.type === 'clinic';

    if (firstIsClinic && secondIsClinic) {
      const firstTier = getClinicRankingTier(firstItem);
      const secondTier = getClinicRankingTier(secondItem);
      if (firstTier !== secondTier) return firstTier - secondTier;

      const firstRating = Number(firstItem?.rating || 0);
      const secondRating = Number(secondItem?.rating || 0);
      if (secondRating !== firstRating) return secondRating - firstRating;

      return Number(secondItem?.totalReviews || 0) - Number(firstItem?.totalReviews || 0);
    }

    if (firstIsClinic && !secondIsClinic) return -1;
    if (!firstIsClinic && secondIsClinic) return 1;

    return 0;
  });

  return safeItems;
};

export default function ExploreScreen({
  favoriteDoctorIds = [],
  favoriteActionDoctorIds = [],
  onToggleFavoriteDoctor,
  onScheduleDoctor,
  onOrderFromStore
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState('');

  // Clinic detail viewing states
  const [selectedClinic, setSelectedClinic] = useState(null);
  const [selectedClinicProfile, setSelectedClinicProfile] = useState(null);
  const [selectedClinicMedia, setSelectedClinicMedia] = useState([]);
  const [selectedClinicReviews, setSelectedClinicReviews] = useState([]);
  const [activeClinicTab, setActiveClinicTab] = useState('about');
  const [clinicDoctors, setClinicDoctors] = useState([]);
  const [isLoadingClinicDoctors, setIsLoadingClinicDoctors] = useState(false);
  const [selectedClinicDoctor, setSelectedClinicDoctor] = useState(null);
  const [selectedClinicSlot, setSelectedClinicSlot] = useState(null);
  const [isClinicBookingFormOpen, setIsClinicBookingFormOpen] = useState(false);
  const [isBookingAppointment, setIsBookingAppointment] = useState(false);
  const patientProfile = useMemo(() => getPatientSessionProfile(), []);
  const [clinicBookingForm, setClinicBookingForm] = useState(() => createDefaultBookingForm(patientProfile));
  const [initialClinicHandled, setInitialClinicHandled] = useState(false);

  const setClinicIdInUrl = (clinicId) => {
    const params = new URLSearchParams(window.location.search);
    if (clinicId && isValidObjectId(clinicId)) params.set('clinicId', clinicId);
    else params.delete('clinicId');
    const query = params.toString();
    window.history.replaceState({}, document.title, `${window.location.pathname}${query ? `?${query}` : ''}${window.location.hash || ''}`);
  };

  const canSubmitClinicBooking = useMemo(() => {
    return Boolean(
      clinicBookingForm.termsAccepted
      && /^\d{7,15}$/.test(String(clinicBookingForm.phoneNumber || '').trim())
      && String(clinicBookingForm.streetAddress || '').trim()
      && String(clinicBookingForm.city || '').trim()
      && String(clinicBookingForm.state || '').trim()
      && String(clinicBookingForm.zip || '').trim()
    );
  }, [clinicBookingForm]);

  const favoriteDoctorIdSet = useMemo(() => {
    return new Set((Array.isArray(favoriteDoctorIds) ? favoriteDoctorIds : []).map((doctorId) => String(doctorId)));
  }, [favoriteDoctorIds]);

  const favoriteActionDoctorIdSet = useMemo(() => {
    return new Set((Array.isArray(favoriteActionDoctorIds) ? favoriteActionDoctorIds : []).map((doctorId) => String(doctorId)));
  }, [favoriteActionDoctorIds]);

  const hasQuery = normalize(searchQuery).length > 0;
  const hasSpecialtyFilter = Boolean(selectedSpecialty);

  useEffect(() => {
    let isMounted = true;
    const delayTimer = setTimeout(async () => {
      try {
        setIsLoading(true);
        setLoadError('');

        if (!hasQuery && !hasSpecialtyFilter) {
          const sponsoredData = await fetchPatientSponsoredAccounts();
          if (isMounted) {
            setResults(sortExploreResults(Array.isArray(sponsoredData?.sponsored) ? sponsoredData.sponsored : []));
          }
          return;
        }

        if (hasSpecialtyFilter && !hasQuery) {
          const [doctorData, clinicData] = await Promise.all([
            fetchPatientExploreDoctors({
              query: '',
              specialty: selectedSpecialty
            }),
            fetchPatientExploreClinics({
              query: '',
              specialty: selectedSpecialty
            }).catch(() => ({ clinics: [] }))
          ]);

          if (isMounted) {
            const combined = [
              ...(Array.isArray(clinicData?.clinics) ? clinicData.clinics : []),
              ...(Array.isArray(doctorData?.doctors) ? doctorData.doctors : [])
            ];
            setResults(sortExploreResults(combined));
          }
          return;
        }

        const [doctorData, storeData, clinicData] = await Promise.all([
          fetchPatientExploreDoctors({
            query: searchQuery,
            specialty: selectedSpecialty
          }),
          fetchPatientExploreStores({
            query: searchQuery
          }),
          fetchPatientExploreClinics({
            query: searchQuery,
            specialty: selectedSpecialty
          }).catch(() => ({ clinics: [] }))
        ]);

        if (isMounted) {
          const combined = [
            ...(Array.isArray(clinicData?.clinics) ? clinicData.clinics : []),
            ...(Array.isArray(doctorData?.doctors) ? doctorData.doctors : []),
            ...(Array.isArray(storeData?.stores) ? storeData.stores : [])
          ];
          setResults(sortExploreResults(combined));
        }
      } catch (error) {
        if (!isMounted) return;
        setLoadError(error?.message || 'Could not load search results right now');
        setResults([]);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }, 220);

    return () => {
      isMounted = false;
      clearTimeout(delayTimer);
    };
  }, [searchQuery, selectedSpecialty, hasQuery]);

  const handleOpenClinic = async (clinic) => {
    if (!clinic?.id) return;
    try {
      setSelectedClinic(clinic);
      setSelectedClinicProfile(null);
      setSelectedClinicMedia([]);
      setSelectedClinicReviews([]);
      setActiveClinicTab('about');
      setClinicDoctors([]);
      setSelectedClinicDoctor(null);
      setIsLoadingClinicDoctors(true);
      setClinicIdInUrl(clinic.id);

      const data = await fetchPatientClinicDoctors(clinic.id);
      setSelectedClinicProfile(data?.clinic || null);
      setSelectedClinicMedia(Array.isArray(data?.media) ? data.media : []);
      setSelectedClinicReviews(Array.isArray(data?.reviews) ? data.reviews : []);
      const providers = mapClinicProviders(data);
      setClinicDoctors(providers);
      if (providers.length > 0) {
        setSelectedClinicDoctor(providers[0]);
      }
    } catch (err) {
      toast.error(err?.message || 'Could not load clinic doctors list');
    } finally {
      setIsLoadingClinicDoctors(false);
    }
  };

  useEffect(() => {
    if (initialClinicHandled) return;

    const params = new URLSearchParams(window.location.search);
    const clinicIdFromUrl = String(params.get('clinicId') || '').trim();
    if (!isValidObjectId(clinicIdFromUrl)) {
      setInitialClinicHandled(true);
      return;
    }

    let isMounted = true;
    const loadClinicFromUrl = async () => {
      try {
        setIsLoadingClinicDoctors(true);
        const data = await fetchPatientClinicDoctors(clinicIdFromUrl);
        if (!isMounted || !data?.clinic) return;

        const clinic = data.clinic;
        setSelectedClinic({
          id: String(clinic.id || clinicIdFromUrl),
          name: clinic.name,
          specialty: clinic.facilityType,
          location: clinic.address,
          image: clinic.image,
          rating: Number(clinic.rating || 0),
          totalReviews: Math.max(0, Math.trunc(Number(clinic.totalReviews || 0))),
          isVerifiedBadge: Boolean(clinic.isVerifiedBadge),
          hasPrioritySupport: Boolean(clinic.hasPrioritySupport),
          type: 'clinic'
        });
        setSelectedClinicProfile(data?.clinic || null);
        setSelectedClinicMedia(Array.isArray(data?.media) ? data.media : []);
        setSelectedClinicReviews(Array.isArray(data?.reviews) ? data.reviews : []);
        const providers = mapClinicProviders(data);
        setClinicDoctors(providers);
        setSelectedClinicDoctor(providers.length > 0 ? providers[0] : null);
        setActiveClinicTab('about');
      } catch {
        setClinicIdInUrl('');
      } finally {
        if (isMounted) {
          setIsLoadingClinicDoctors(false);
          setInitialClinicHandled(true);
        }
      }
    };

    loadClinicFromUrl();
    return () => {
      isMounted = false;
    };
  }, [initialClinicHandled]);

  const handleClinicBookingFieldChange = (field) => (event) => {
    const value = event?.target?.value || '';
    const normalizedValue = field === 'phoneNumber'
      ? String(value).replace(/\D/g, '').slice(0, 15)
      : value;

    setClinicBookingForm((previousForm) => ({
      ...previousForm,
      [field]: normalizedValue
    }));
  };

  const handleBookClinicDoctorSlot = (slot) => {
    if (!selectedClinic || !selectedClinicDoctor || !slot) return;
    setSelectedClinicSlot(slot);
    setClinicBookingForm(createDefaultBookingForm(patientProfile));
    setIsClinicBookingFormOpen(true);
  };

  const handleSubmitClinicBooking = async ({ stripe, cardNumberElement }) => {
    if (!selectedClinic || !selectedClinicDoctor || !selectedClinicSlot) return;
    const patientToken = localStorage.getItem('patientToken');
    if (!patientToken) {
      toast.error('Please log in again to book an appointment');
      return;
    }

    if (!canSubmitClinicBooking) {
      toast.error('Complete the required fields and accept terms to continue');
      return;
    }

    try {
      setIsBookingAppointment(true);
      const paymentSession = await createPatientClinicAppointmentPaymentIntent(patientToken, {
        clinicId: selectedClinic.id,
        ...(selectedClinicDoctor?.providerType === 'service'
          ? { serviceId: selectedClinicDoctor.id }
          : { doctorId: selectedClinicDoctor.id }),
        slotId: selectedClinicSlot._id || selectedClinicSlot.id,
        phoneNumber: clinicBookingForm.phoneNumber,
        streetAddress: clinicBookingForm.streetAddress,
        aptSuite: clinicBookingForm.aptSuite,
        city: clinicBookingForm.city,
        state: clinicBookingForm.state,
        zip: clinicBookingForm.zip
      });

      const paymentResult = await stripe.confirmCardPayment(paymentSession.clientSecret, {
        payment_method: {
          card: cardNumberElement,
          billing_details: {
            name: patientProfile.name,
            email: patientProfile.email || undefined,
            phone: clinicBookingForm.phoneNumber,
            address: {
              line1: clinicBookingForm.streetAddress,
              line2: clinicBookingForm.aptSuite || undefined,
              city: clinicBookingForm.city,
              state: clinicBookingForm.state,
              postal_code: clinicBookingForm.zip,
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

      await confirmPatientClinicAppointmentPayment(patientToken, paymentSession.paymentIntentId);
      toast.success('Clinic appointment booked and payment confirmed successfully');

      const bookedSlotId = String(selectedClinicSlot._id || selectedClinicSlot.id);
      const updatedSlots = (selectedClinicDoctor.slots || []).filter((s) => String(s._id || s.id) !== bookedSlotId);
      const updatedDoctor = { ...selectedClinicDoctor, slots: updatedSlots };
      setSelectedClinicDoctor(updatedDoctor);

      setClinicDoctors((prev) =>
        prev.map((doc) => (String(doc.id) === String(selectedClinicDoctor.id) ? updatedDoctor : doc))
      );

      setSelectedClinicSlot(null);
      setIsClinicBookingFormOpen(false);
      setClinicBookingForm(createDefaultBookingForm(patientProfile));
      window.dispatchEvent(new Event('patient-appointment-updated'));
      window.dispatchEvent(new Event('clinic-appointments-updated'));
    } catch (err) {
      toast.error(err?.message || 'Could not complete payment right now');
    } finally {
      setIsBookingAppointment(false);
    }
  };

  if (selectedClinic) {
    const clinicProfile = selectedClinicProfile || {
      name: selectedClinic.name,
      facilityType: selectedClinic.specialty,
      address: selectedClinic.location,
      image: selectedClinic.image,
      rating: selectedClinic.rating || 0,
      totalReviews: selectedClinic.totalReviews || 0,
      isVerifiedBadge: Boolean(selectedClinic?.isVerifiedBadge),
      hasPrioritySupport: Boolean(selectedClinic?.hasPrioritySupport),
      about: `${selectedClinic.name} provides ${selectedClinic.specialty || 'clinic'} services.`
    };

    if (isClinicBookingFormOpen && selectedClinicDoctor && selectedClinicSlot) {
      return (
        <div className="pb-24">
          <section className="max-w-[860px] mx-auto space-y-6 sm:space-y-7">
            <button
              type="button"
              onClick={() => setIsClinicBookingFormOpen(false)}
              className="inline-flex items-center gap-1.5 text-[13px] font-bold text-[#6B7280] hover:text-[#1F2432]"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
              Back
            </button>

            <div className="relative overflow-hidden rounded-[20px] border border-[#D8EFF0] bg-gradient-to-r from-[#ECFAFA] via-[#F8FCFF] to-[#EEF6FF] p-5 sm:p-6">
              <div className="relative flex flex-col sm:flex-row items-start gap-4 sm:gap-5">
                <div className="w-[96px] h-[96px] rounded-2xl overflow-hidden bg-white border border-white/60 shadow-sm shrink-0">
                  {selectedClinicDoctor?.providerType === 'service' ? (
                    <div className="w-full h-full flex items-center justify-center text-[#1EBDB8]">
                      <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 3H5a2 2 0 0 0-2 2v4" />
                        <path d="M15 3h4a2 2 0 0 1 2 2v4" />
                        <path d="M9 21H5a2 2 0 0 1-2-2v-4" />
                        <path d="M15 21h4a2 2 0 0 0 2-2v-4" />
                        <path d="M12 8v8" />
                        <path d="M8 12h8" />
                      </svg>
                    </div>
                  ) : (
                    <img src={selectedClinicDoctor.image || '/topdoc.svg'} alt={selectedClinicDoctor.name} className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="space-y-1.5">
                  <h1 className="text-[22px] sm:text-[28px] leading-tight font-bold text-[#1F2432]">
                    {selectedClinicDoctor?.providerType === 'service' ? selectedClinicDoctor.name : `Dr. ${selectedClinicDoctor.name}`}
                  </h1>
                  <p className="text-[19px] font-semibold text-[#374151]">{selectedClinicDoctor.specialty}</p>
                  <p className="text-[15px] text-[#6B7280]">{clinicProfile.name}</p>
                  <p className="text-[14px] font-semibold text-[#1F2432]">
                    {selectedClinicDoctor?.providerType === 'service' ? 'Clinic Service Booking' : 'Clinic Visit'}
                  </p>
                  <p className="text-[13px] text-[#4B5563]">{formatSlotDate(selectedClinicSlot.date)} . {selectedClinicSlot.fromTime} - {selectedClinicSlot.toTime}</p>
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

                <input type="tel" value={clinicBookingForm.phoneNumber} onChange={handleClinicBookingFieldChange('phoneNumber')} placeholder="Phone number" inputMode="numeric" maxLength={15} className="w-full rounded-[12px] border border-gray-300 bg-white px-4 py-3.5 text-[14px] text-[#1F2432] outline-none focus:border-[#1EBDB8] focus:ring-2 focus:ring-[#1EBDB8]/15" />
                <input type="text" value={clinicBookingForm.streetAddress} onChange={handleClinicBookingFieldChange('streetAddress')} placeholder="Street address" className="w-full rounded-[12px] border border-gray-300 bg-white px-4 py-3.5 text-[14px] text-[#1F2432] outline-none focus:border-[#1EBDB8] focus:ring-2 focus:ring-[#1EBDB8]/15" />
                <input type="text" value={clinicBookingForm.aptSuite} onChange={handleClinicBookingFieldChange('aptSuite')} placeholder="Apt. suite, building (optional)" className="w-full rounded-[12px] border border-gray-300 bg-white px-4 py-3.5 text-[14px] text-[#1F2432] outline-none focus:border-[#1EBDB8] focus:ring-2 focus:ring-[#1EBDB8]/15" />
                <input type="text" value={clinicBookingForm.city} onChange={handleClinicBookingFieldChange('city')} placeholder="City" className="w-full rounded-[12px] border border-gray-300 bg-white px-4 py-3.5 text-[14px] text-[#1F2432] outline-none focus:border-[#1EBDB8] focus:ring-2 focus:ring-[#1EBDB8]/15" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input type="text" value={clinicBookingForm.state} onChange={handleClinicBookingFieldChange('state')} placeholder="State" className="w-full rounded-[12px] border border-gray-300 bg-white px-4 py-3.5 text-[14px] text-[#1F2432] outline-none focus:border-[#1EBDB8] focus:ring-2 focus:ring-[#1EBDB8]/15" />
                  <input type="text" value={clinicBookingForm.zip} onChange={handleClinicBookingFieldChange('zip')} placeholder="Zip" className="w-full rounded-[12px] border border-gray-300 bg-white px-4 py-3.5 text-[14px] text-[#1F2432] outline-none focus:border-[#1EBDB8] focus:ring-2 focus:ring-[#1EBDB8]/15" />
                </div>
              </div>

              <div className="space-y-3">
                <h2 className="text-[30px] sm:text-[34px] leading-tight font-bold text-[#1F2432]">Payment Method</h2>
                <div className="rounded-[14px] border border-[#22B8B2] bg-[#ECFCFB] px-4 py-4 flex items-center justify-between gap-3">
                  <span className="text-[26px] leading-none font-semibold text-[#0DA6A2]">Stripe</span>
                  <p className="text-[19px] font-bold text-[#1F2432]">{formatCurrency(selectedClinicSlot.priceInRupees || 0)}</p>
                </div>
              </div>

              <label className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={clinicBookingForm.termsAccepted}
                  onChange={(event) => setClinicBookingForm((previousForm) => ({ ...previousForm, termsAccepted: Boolean(event?.target?.checked) }))}
                  className="mt-1 h-5 w-5 rounded border-gray-300 text-[#1EBDB8] focus:ring-[#1EBDB8]"
                />
                <span className="text-[14px] leading-relaxed text-[#4B5563]">I certify that the payment selected is the one I will be using for this clinic appointment.</span>
              </label>

              {stripePromise ? (
                <Elements stripe={stripePromise}>
                  <StripeCardPaymentForm
                    canSubmitBooking={canSubmitClinicBooking}
                    isBookingProcessing={isBookingAppointment}
                    onSubmitPayment={handleSubmitClinicBooking}
                  />
                </Elements>
              ) : (
                <div className="rounded-[12px] border border-amber-200 bg-amber-50 px-4 py-3">
                  <p className="text-[13px] font-semibold text-amber-700">Stripe publishable key is missing. Set VITE_STRIPE_PUBLISHABLE_KEY.</p>
                </div>
              )}
            </div>
          </section>
        </div>
      );
    }

    return (
      <div className="pb-24">
        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_minmax(420px,560px)] gap-8 items-start">
          <section className="bg-[#F0FCFC] rounded-[30px] p-6 sm:p-8 min-h-[760px]">
            <button
              type="button"
              onClick={() => {
                setSelectedClinic(null);
                setClinicIdInUrl('');
              }}
              className="mb-8 inline-flex items-center justify-center w-11 h-11 rounded-2xl bg-white/80 border border-[#D8EEEE] text-[#1F2432] hover:bg-white transition-colors"
              aria-label="Back to explore"
            >
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            </button>

            <div className="flex flex-col md:flex-row md:items-center gap-8">
              <div className="w-[168px] h-[168px] rounded-full overflow-hidden bg-white border border-white shadow-md shrink-0">
                <img src={clinicProfile.image || '/clinic-placeholder.svg'} alt={clinicProfile.name} className="w-full h-full object-cover" />
              </div>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-[40px] sm:text-[46px] font-extrabold text-[#1F2432] tracking-tight leading-tight">{clinicProfile.name}</h1>
                  {clinicProfile.isVerifiedBadge ? (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#ECFEFF] border border-[#A5F3FC] text-[#0F766E] text-[11px] font-extrabold uppercase tracking-[0.08em]">
                      Verified
                    </span>
                  ) : null}
                  {clinicProfile.hasPrioritySupport ? (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-[11px] font-extrabold uppercase tracking-[0.08em]">
                      Priority Support
                    </span>
                  ) : null}
                </div>
                <p className="text-[22px] font-bold text-[#1F2432] mt-3">{clinicProfile.facilityType || selectedClinic.specialty}</p>
                <p className="text-[19px] font-semibold text-[#6B7280] mt-3">{clinicProfile.address || selectedClinic.location}</p>
                <div className="flex flex-wrap gap-3 mt-4">
                  <span className="inline-flex items-center rounded-full bg-white/80 border border-[#D8EEEE] px-3 py-1.5 text-[13px] font-bold text-[#1F2432]">
                    {clinicProfile.phone || 'Phone not provided'}
                  </span>
                  <span className="inline-flex items-center rounded-full bg-white/80 border border-[#D8EEEE] px-3 py-1.5 text-[13px] font-bold text-[#1F2432]">
                    {clinicProfile.email || 'Email not provided'}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2 mt-4">
                  <span className="text-amber-500 text-[20px]">★</span>
                  <span className="text-[17px] font-bold text-[#1F2432]">{Number(clinicProfile.rating || 0).toFixed(2)}</span>
                  <span className="text-[#9CA3AF]">•</span>
                  <span className="text-[17px] font-semibold text-[#6B7280]">{clinicProfile.totalReviews || 0} reviews</span>
                </div>
                <div className="mt-5">
                  <button
                    type="button"
                    onClick={() => {
                      const clinicId = String(selectedClinic?.id || '').trim();
                      if (!clinicId) return;
                      window.location.href = `/dashboard/chats?chat=clinics&partnerId=${encodeURIComponent(clinicId)}`;
                    }}
                    className="inline-flex items-center gap-2 rounded-full bg-[#1EBDB8] hover:bg-[#19A9A4] text-white px-5 py-2.5 text-[13px] font-bold transition-colors"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                    </svg>
                    Chat with Clinic
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-12 flex items-center gap-10 border-b border-[#D6E8E8]">
              {['about', 'media', 'reviews'].map((tabId) => (
                <button
                  key={tabId}
                  type="button"
                  onClick={() => setActiveClinicTab(tabId)}
                  className={`pb-5 text-[17px] font-bold capitalize border-b-2 transition-colors ${
                    activeClinicTab === tabId
                      ? 'border-[#1F2432] text-[#1F2432]'
                      : 'border-transparent text-[#6B7280] hover:text-[#1F2432]'
                  }`}
                >
                  {tabId === 'media' ? 'Gallery' : tabId}
                </button>
              ))}
            </div>

            <div className="mt-8">
              {activeClinicTab === 'about' && (
                <div className="space-y-5">
                  <p className="text-[16px] leading-7 text-[#1F2937]">{clinicProfile.about}</p>
                </div>
              )}

              {activeClinicTab === 'media' && (
                selectedClinicMedia.length === 0 ? (
                  <p className="text-[15px] font-semibold text-[#6B7280]">No approved clinic media yet.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {selectedClinicMedia.map((item) => (
                      <div key={item.id} className="aspect-[4/3] rounded-2xl overflow-hidden bg-white border border-[#D8EEEE]">
                        {item.mediaType === 'video' ? (
                          <video src={item.url} controls className="w-full h-full object-cover" />
                        ) : (
                          <img src={item.url} alt={item.originalName || 'Clinic media'} className="w-full h-full object-cover" />
                        )}
                      </div>
                    ))}
                  </div>
                )
              )}

              {activeClinicTab === 'reviews' && (
                selectedClinicReviews.length === 0 ? (
                  <p className="text-[15px] font-semibold text-[#6B7280]">No clinic reviews yet.</p>
                ) : (
                  <div className="space-y-3">
                    {selectedClinicReviews.map((review) => (
                      <div key={review.id} className="rounded-2xl bg-white/80 border border-[#D8EEEE] p-4">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-[14px] font-bold text-[#1F2432]">{review.patientName || 'Patient'}</p>
                          <span className="text-[13px] font-bold text-amber-500">★ {review.rating || 0}</span>
                        </div>
                        {review.doctorName && (
                          <p className="text-[12px] font-semibold text-[#6B7280] mt-1">Dr. {review.doctorName}</p>
                        )}
                        <p className="text-[13px] text-[#6B7280] mt-1">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                )
              )}
            </div>
          </section>

          <aside className="bg-white rounded-[30px] border border-gray-100 shadow-sm p-6 sm:p-7">
            <h2 className="text-[28px] font-extrabold text-[#1F2432] tracking-tight">Book clinic services</h2>
            <p className="text-[16px] text-[#6B7280] mt-2">Choose a doctor, lab, or facility and then select an available slot.</p>

            {isLoadingClinicDoctors ? (
              <div className="py-12 text-center">
                <div className="animate-spin inline-block w-8 h-8 border-[3px] border-current border-t-transparent text-[#1EBDB8] rounded-full"></div>
                <p className="text-[14px] font-semibold text-[#6B7280] mt-3">Loading clinic providers...</p>
              </div>
            ) : clinicDoctors.length === 0 ? (
              <div className="mt-8 rounded-2xl border border-dashed border-gray-200 bg-[#F8FAFC] p-8 text-center">
                <p className="text-[15px] font-bold text-[#6B7280]">No doctors, labs, or facilities found at this clinic.</p>
              </div>
            ) : (
              <div className="mt-7 space-y-6">
                <div className="space-y-3">
                  {clinicDoctors.map((doc) => {
                    const isSelected = String(selectedClinicDoctor?.id) === String(doc.id);
                    return (
                      <button
                        key={doc.id}
                        type="button"
                        onClick={() => setSelectedClinicDoctor(doc)}
                        className={`w-full flex items-center justify-between gap-4 p-3 rounded-2xl border transition-all ${
                          isSelected
                            ? 'border-[#1EBDB8] bg-[#E6FAF9]'
                            : 'border-gray-100 bg-white hover:border-[#1EBDB8]/30'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-14 h-14 rounded-2xl overflow-hidden bg-slate-100 border border-gray-100 shrink-0">
                            {doc.providerType === 'service' ? (
                              <div className="w-full h-full flex items-center justify-center text-[#1EBDB8]">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M9 3H5a2 2 0 0 0-2 2v4" />
                                  <path d="M15 3h4a2 2 0 0 1 2 2v4" />
                                  <path d="M9 21H5a2 2 0 0 1-2-2v-4" />
                                  <path d="M15 21h4a2 2 0 0 0 2-2v-4" />
                                  <path d="M12 8v8" />
                                  <path d="M8 12h8" />
                                </svg>
                              </div>
                            ) : (
                              <img src={doc.image || '/topdoc.svg'} alt={doc.name} className="w-full h-full object-cover" />
                            )}
                          </div>
                          <div className="text-left min-w-0">
                            <p className="text-[16px] font-bold text-[#1F2432] truncate">{doc.providerType === 'service' ? doc.name : `Dr. ${doc.name}`}</p>
                            <p className="text-[13px] font-semibold text-[#1EBDB8] truncate">{doc.specialty}</p>
                          </div>
                        </div>
                        <span className="shrink-0 text-[11px] font-extrabold text-[#1EBDB8] uppercase tracking-[0.08em] bg-[#1EBDB8]/10 px-2.5 py-1 rounded-lg">
                          {(doc.slots || []).length} slots
                        </span>
                      </button>
                    );
                  })}
                </div>

                {selectedClinicDoctor && (
                  <div className="border-t border-gray-100 pt-6">
                    <div className="flex items-center gap-3 mb-5">
                      <div className="w-12 h-12 rounded-2xl overflow-hidden bg-slate-100 border border-gray-100 shrink-0">
                        {selectedClinicDoctor?.providerType === 'service' ? (
                          <div className="w-full h-full flex items-center justify-center text-[#1EBDB8]">
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M9 3H5a2 2 0 0 0-2 2v4" />
                              <path d="M15 3h4a2 2 0 0 1 2 2v4" />
                              <path d="M9 21H5a2 2 0 0 1-2-2v-4" />
                              <path d="M15 21h4a2 2 0 0 0 2-2v-4" />
                              <path d="M12 8v8" />
                              <path d="M8 12h8" />
                            </svg>
                          </div>
                        ) : (
                          <img src={selectedClinicDoctor.image || '/topdoc.svg'} alt={selectedClinicDoctor.name} className="w-full h-full object-cover" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-[18px] font-bold text-[#1F2432] truncate">
                          {selectedClinicDoctor?.providerType === 'service' ? selectedClinicDoctor.name : `Dr. ${selectedClinicDoctor.name}`}
                        </h3>
                        <p className="text-[13px] font-semibold text-[#6B7280] truncate">{selectedClinicDoctor.specialty}</p>
                      </div>
                    </div>

                    {(selectedClinicDoctor.slots || []).filter((slot) => String(slot?.consultationMode || '').toLowerCase() === 'offline').length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-gray-200 bg-[#F8FAFC] p-6 text-center">
                        <p className="text-[14px] font-bold text-[#6B7280]">No clinic-visit slots set up</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2 gap-4">
                        {(selectedClinicDoctor.slots || [])
                          .filter((slot) => String(slot?.consultationMode || '').toLowerCase() === 'offline')
                          .map((slot) => (
                          <div key={slot._id || slot.id} className="rounded-2xl border border-gray-100 bg-[#FAFAFB] p-4">
                            <p className="text-[15px] font-extrabold text-[#1F2432]">{formatSlotDate(slot.date)}</p>
                            <p className="text-[14px] font-semibold text-[#4B5563] mt-1">{slot.fromTime} - {slot.toTime}</p>
                            <div className="mt-3 flex flex-wrap items-center gap-2">
                              <span className="inline-flex px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-[10px] font-bold uppercase tracking-[0.08em]">Clinic Visit</span>
                              <span className="text-[14px] font-extrabold text-[#1F2432]">{formatCurrency(slot.priceInRupees || 0)}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleBookClinicDoctorSlot(slot)}
                              disabled={isBookingAppointment}
                              className="mt-4 w-full py-3 rounded-xl bg-[#1EBDB8] hover:bg-[#1CAAAE] text-white text-[14px] font-bold disabled:opacity-60 transition-colors"
                            >
                              {isBookingAppointment ? 'Booking...' : 'Book Timeslot'}
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </aside>
        </div>
      </div>
    );
  }

  const shouldShowSearchResults = hasQuery || hasSpecialtyFilter;
  const effectiveResults = results;

  const resultsToDisplay = shouldShowSearchResults
    ? effectiveResults
    : effectiveResults.slice(0, 3);
  const emptyStateText = (!hasQuery && hasSpecialtyFilter)
    ? 'No doctors here'
    : 'No results found';

  return (
    <div className="space-y-8 pb-24">
      <div className="flex flex-col gap-6">
        <div className="bg-[#1F2432] rounded-full pl-5 pr-2 py-2.5 flex items-center gap-3 shadow-sm">
          <input
            type="text"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search disease, specialists, clinics, or medical stores"
            className="flex-1 bg-transparent text-white placeholder:text-white/60 text-[15px] outline-none"
          />

          <div className="hidden md:flex items-center gap-2 text-white/85 text-[14px] font-semibold border-l border-white/25 pl-4 pr-2">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <span>Mountain View, CA</span>
          </div>

          <button
            type="button"
            className="w-14 h-14 rounded-full bg-[#1EBDB8] hover:bg-[#1CAAAE] text-white flex items-center justify-center transition-colors"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </button>
        </div>
      </div>

      {!hasQuery && (
        <section className="space-y-5">
          <h2 className="text-[#1EBDB8] font-bold text-[24px]">Explore Treatments across specialties</h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {exploreSpecialties.map((specialty) => {
              const isSelected = selectedSpecialty === specialty.id;

              return (
                <button
                  key={specialty.id}
                  type="button"
                  onClick={() => setSelectedSpecialty((prev) => (prev === specialty.id ? '' : specialty.id))}
                  className={`bg-white rounded-[24px] border p-4 h-[132px] shadow-[0px_4px_12px_rgba(0,0,0,0.06)] flex flex-col items-center justify-center gap-3 transition-all ${
                    isSelected
                      ? 'border-[#1EBDB8] ring-2 ring-[#1EBDB8]/25 text-[#1EBDB8]'
                      : 'border-gray-100 text-[#1EBDB8] hover:border-[#1EBDB8]/40'
                  }`}
                >
                  <div className="w-11 h-11 flex items-center justify-center">
                    <img src={specialty.icon} alt={specialty.label} className="w-10 h-10 object-contain" />
                  </div>
                  <span className="text-[13px] font-bold text-center leading-tight text-[#1EBDB8]">
                    {specialty.label}
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      )}

      <section className="space-y-5">
        <h2 className="text-[#1EBDB8] font-bold text-[24px]">
          {shouldShowSearchResults ? 'Search Results' : 'Sponsored'}
        </h2>

        {loadError && (
          <div className="bg-amber-50 border border-amber-200 rounded-[16px] p-4">
            <p className="text-[13px] font-medium text-amber-700">{loadError}</p>
          </div>
        )}

        {isLoading ? (
          <div className="bg-white border border-gray-100 rounded-[20px] p-8 text-center">
            <p className="text-[16px] font-bold text-[#4B5563]">Searching...</p>
          </div>
        ) : resultsToDisplay.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-[20px] p-8 text-center">
            <p className="text-[16px] font-bold text-[#4B5563]">{emptyStateText}</p>
            <p className="text-[13px] text-[#9CA3AF] mt-1">Try another search term or filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {resultsToDisplay.map((item) => (
              <DoctorCard
                key={`${item.type}-${item.id}`}
                doctor={item}
                showFavorite={shouldShowSearchResults && Boolean(onToggleFavoriteDoctor) && isValidObjectId(item.id)}
                isFavorite={favoriteDoctorIdSet.has(String(item.id))}
                isFavoritePending={favoriteActionDoctorIdSet.has(String(item.id))}
                onFavoriteToggle={onToggleFavoriteDoctor}
                actionLabel={item.type === 'clinic' ? 'View Clinic' : item.type === 'doctor' ? 'Schedule Appointment' : 'Order Medicine'}
                onActionClick={
                  item.type === 'clinic'
                    ? () => handleOpenClinic(item)
                    : item.type === 'doctor'
                    ? (isValidObjectId(item.id) ? onScheduleDoctor : undefined) 
                    : (isValidObjectId(item.id) ? () => onOrderFromStore?.(item) : undefined)
                }
                containerClassName="bg-white rounded-[24px] p-6 shadow-[0px_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 flex flex-col relative"
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
