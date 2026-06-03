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
import {
  fetchPatientExploreDoctors,
  fetchPatientExploreStores,
  fetchPatientExploreClinics,
  fetchPatientClinicDoctors,
  createPatientClinicAppointmentPaymentIntent,
  confirmPatientClinicAppointmentPayment,
  submitDirectClinicReview
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

const DOCTOR_SPECIALTY_CATEGORIES = [
  { title: 'Primary Care', value: 'All', icon: '/top1.svg', color: 'from-blue-500/10 to-cyan-500/10', iconColor: 'text-blue-400' },
  { title: 'Cardiologist', value: 'Cardiologist', icon: '/top5.svg', color: 'from-red-500/10 to-rose-500/10', iconColor: 'text-red-400' },
  { title: 'Dermatologist', value: 'Dermatologist', icon: '/top8.svg', color: 'from-pink-500/10 to-fuchsia-500/10', iconColor: 'text-pink-400' },
  { title: 'Endocrinologist', value: 'Endocrinologist', icon: '/top2.svg', color: 'from-purple-500/10 to-pink-500/10', iconColor: 'text-purple-400' },
  { title: 'Gastroenterologist', value: 'Gastroenterologist', icon: '/top9.svg', color: 'from-orange-500/10 to-red-500/10', iconColor: 'text-orange-400' },
  { title: 'Neurologist', value: 'Neurologist', icon: '/top6.svg', color: 'from-amber-500/10 to-yellow-500/10', iconColor: 'text-amber-400' },
  { title: 'Orthopedic', value: 'Orthopedic', icon: '/top7.svg', color: 'from-green-500/10 to-lime-500/10', iconColor: 'text-green-400' },
  { title: 'Pediatrician', value: 'Pediatrician', icon: '/top1.svg', color: 'from-blue-500/10 to-cyan-500/10', iconColor: 'text-blue-400' },
  { title: 'Psychiatrist', value: 'Psychiatrist', icon: '/top3.svg', color: 'from-indigo-500/10 to-violet-500/10', iconColor: 'text-indigo-400' },
  { title: 'Pulmonologist', value: 'Pulmonologist', icon: '/top10.svg', color: 'from-cyan-500/10 to-blue-500/10', iconColor: 'text-cyan-400' },
  { title: 'Radiologist', value: 'Radiologist', icon: '/top4.svg', color: 'from-teal-500/10 to-emerald-500/10', iconColor: 'text-teal-400' },
  { title: 'Surgeon', value: 'Surgeon', icon: '/top3.svg', color: 'from-indigo-500/10 to-violet-500/10', iconColor: 'text-indigo-400' },
  { title: 'Urologist', value: 'Urologist', icon: '/top10.svg', color: 'from-cyan-500/10 to-blue-500/10', iconColor: 'text-cyan-400' }
];

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
      {cardError ? <p className="text-[12px] font-medium text-red-600">{cardError}</p> : null}
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

const formatTimeToAMPM = (timeValue) => {
  const value = String(timeValue || '').trim();
  if (!value) return '';

  const [hoursRaw, minutesRaw = '0'] = value.split(':');
  const hours = Number(hoursRaw);
  const minutes = Number(minutesRaw);

  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return value;

  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  const displayMinutes = String(minutes).padStart(2, '0');
  return `${displayHours}:${displayMinutes} ${period}`;
};

const createDefaultBookingForm = (profile = null) => ({
  phoneNumber: profile?.phoneNumber || profile?.phone || '',
  streetAddress: '',
  aptSuite: '',
  city: '',
  state: '',
  zip: '',
  bookingReason: '',
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
    image: String(service?.image || '').trim(),
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
  if (item?.isSponsored) return 1;
  return 2;
};

const parseReviewCount = (item) => {
  const totalReviewsValue = Number(item?.totalReviews);
  if (Number.isFinite(totalReviewsValue)) return totalReviewsValue;

  const reviewsValue = item?.reviews;
  if (typeof reviewsValue === 'number' && Number.isFinite(reviewsValue)) return reviewsValue;
  if (typeof reviewsValue === 'string') {
    const matched = reviewsValue.match(/\d+/);
    return matched ? Number(matched[0]) : 0;
  }

  return 0;
};

const sortByRatingAndReviews = (items = []) => {
  return [...(Array.isArray(items) ? items : [])].sort((firstItem, secondItem) => {
    const firstRating = Number(firstItem?.rating || 0);
    const secondRating = Number(secondItem?.rating || 0);
    if (secondRating !== firstRating) return secondRating - firstRating;

    return parseReviewCount(secondItem) - parseReviewCount(firstItem);
  });
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
  const [selectedDoctorSpecialty, setSelectedDoctorSpecialty] = useState('All');
  const [selectedClinicSpecialty, setSelectedClinicSpecialty] = useState('All');
  const [activeResultType, setActiveResultType] = useState('doctor');
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
  const [previewImage, setPreviewImage] = useState(null);

  // Direct Review States & Helpers
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const patientUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('patient') || '{}');
    } catch {
      return {};
    }
  }, []);
  const patientId = patientUser?.id || patientUser?._id;

  const hasPatientReviewedClinic = useMemo(() => {
    if (!patientId || !selectedClinicReviews) return false;
    return selectedClinicReviews.some(
      (review) => String(review?.patientId || '') === String(patientId)
    );
  }, [patientId, selectedClinicReviews]);

  useEffect(() => {
    if (!selectedClinic || !clinicDoctors || clinicDoctors.length === 0) return;
    let filtered = [];
    if (activeClinicTab === 'doctor') {
      filtered = clinicDoctors.filter(doc => doc.providerType === 'doctor');
    } else if (activeClinicTab === 'laboratory') {
      filtered = clinicDoctors.filter(doc => doc.providerType === 'service' && doc.serviceType === 'lab');
    } else if (activeClinicTab === 'facility') {
      filtered = clinicDoctors.filter(doc => doc.providerType === 'service' && doc.serviceType === 'facility');
    } else {
      return;
    }
    setSelectedClinicDoctor(filtered.length > 0 ? filtered[0] : null);
  }, [activeClinicTab, clinicDoctors, selectedClinic]);

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
      && String(clinicBookingForm.bookingReason || '').trim().length >= 3
    );
  }, [clinicBookingForm]);

  const favoriteDoctorIdSet = useMemo(() => {
    return new Set((Array.isArray(favoriteDoctorIds) ? favoriteDoctorIds : []).map((doctorId) => String(doctorId)));
  }, [favoriteDoctorIds]);

  const favoriteActionDoctorIdSet = useMemo(() => {
    return new Set((Array.isArray(favoriteActionDoctorIds) ? favoriteActionDoctorIds : []).map((doctorId) => String(doctorId)));
  }, [favoriteActionDoctorIds]);

  const hasQuery = normalize(searchQuery).length > 0;
  const selectedDoctorSpecialtyValue = selectedDoctorSpecialty === 'All' ? '' : selectedDoctorSpecialty;
  const selectedClinicSpecialtyValue = selectedClinicSpecialty === 'All' ? '' : selectedClinicSpecialty;
  const hasActiveFilters = hasQuery || Boolean(selectedDoctorSpecialtyValue) || Boolean(selectedClinicSpecialtyValue);

  useEffect(() => {
    let isMounted = true;
    const delayTimer = setTimeout(async () => {
      try {
        setIsLoading(true);
        setLoadError('');

        const [doctorData, storeData, clinicData] = await Promise.all([
          fetchPatientExploreDoctors({
            query: searchQuery,
            specialty: selectedDoctorSpecialtyValue
          }),
          fetchPatientExploreStores({
            query: searchQuery
          }),
          fetchPatientExploreClinics({
            query: searchQuery,
            specialty: selectedClinicSpecialtyValue
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
  }, [searchQuery, selectedDoctorSpecialtyValue, selectedClinicSpecialtyValue]);

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

  const openReviewModal = () => {
    setReviewRating(0);
    setReviewComment('');
    setIsReviewModalOpen(true);
  };

  const handleReviewSubmit = async () => {
    if (reviewRating < 1 || reviewRating > 5) {
      toast.error('Please select a rating between 1 and 5 stars');
      return;
    }
    if (reviewComment.trim().length < 3) {
      toast.error('Feedback comment must be at least 3 characters long');
      return;
    }
    const token = localStorage.getItem('patientToken');
    if (!token) {
      toast.error('You must be logged in as a patient to leave a review');
      return;
    }

    try {
      setIsSubmittingReview(true);
      const res = await submitDirectClinicReview(token, selectedClinic.id, {
        rating: reviewRating,
        comment: reviewComment.trim()
      });
      toast.success(res?.message || 'Review submitted successfully!');
      setIsReviewModalOpen(false);

      // Refresh clinic profile & reviews
      const data = await fetchPatientClinicDoctors(selectedClinic.id);
      setSelectedClinicProfile(data?.clinic || null);
      setSelectedClinicReviews(Array.isArray(data?.reviews) ? data.reviews : []);
    } catch (err) {
      toast.error(err?.message || 'Failed to submit review');
    } finally {
      setIsSubmittingReview(false);
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
        zip: clinicBookingForm.zip,
        bookingReason: clinicBookingForm.bookingReason
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

  const shouldShowSearchResults = hasActiveFilters;
  const filteredResults = useMemo(() => {
    if (activeResultType === 'clinic') {
      return results.filter((item) => item?.type === 'clinic');
    }

    if (activeResultType === 'store') {
      return results.filter((item) => item?.type === 'store');
    }

    return results.filter((item) => item?.type === 'doctor');
  }, [results, activeResultType]);

  const resultTypeCounts = useMemo(() => {
    return {
      doctor: results.filter((item) => item?.type === 'doctor').length,
      clinic: results.filter((item) => item?.type === 'clinic').length,
      store: results.filter((item) => item?.type === 'store').length
    };
  }, [results]);

  const sponsoredResults = useMemo(() => {
    return sortByRatingAndReviews(filteredResults.filter((item) => Boolean(item?.isSponsored)));
  }, [filteredResults]);

  const remainingResults = useMemo(() => {
    return sortByRatingAndReviews(filteredResults.filter((item) => !item?.isSponsored));
  }, [filteredResults]);

  const sponsoredResultsToDisplay = shouldShowSearchResults
    ? sponsoredResults
    : sponsoredResults.slice(0, 3);

  const remainingResultsToDisplay = shouldShowSearchResults
    ? remainingResults
    : remainingResults.slice(0, 3);

  const hasDisplayResults = sponsoredResultsToDisplay.length > 0 || remainingResultsToDisplay.length > 0;
  const activeResultTypeLabel = activeResultType === 'clinic'
    ? 'Clinics'
    : activeResultType === 'store'
    ? 'Medical Stores'
    : 'Doctors';
  const emptyStateText = hasQuery
    ? `No ${activeResultTypeLabel.toLowerCase()} found for your search`
    : `No ${activeResultTypeLabel.toLowerCase()} available right now`;

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
                  <p className="text-[13px] text-[#4B5563]">
                    {formatSlotDate(selectedClinicSlot.date)} . {formatTimeToAMPM(selectedClinicSlot.fromTime)} - {formatTimeToAMPM(selectedClinicSlot.toTime)}
                  </p>
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
                <textarea
                  value={clinicBookingForm.bookingReason}
                  onChange={handleClinicBookingFieldChange('bookingReason')}
                  placeholder="Reason for appointment"
                  rows={4}
                  maxLength={500}
                  className="w-full rounded-[12px] border border-gray-300 bg-white px-4 py-3.5 text-[14px] text-[#1F2432] outline-none focus:border-[#1EBDB8] focus:ring-2 focus:ring-[#1EBDB8]/15"
                />
                <p className="text-[12px] text-[#6B7280]">Minimum 3 characters. This will be shared with the clinic provider.</p>
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
      <>
        <div className="pb-24">
          <div className="grid grid-cols-1 gap-8 items-start">
          <section className="min-w-0 bg-[#F0FCFC] rounded-[30px] p-6 sm:p-8 min-h-[760px]">
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

            <div className="flex flex-col sm:flex-row md:items-center gap-8">
              <div className="w-[168px] h-[168px] rounded-full overflow-hidden bg-white border border-white shadow-md shrink-0">
                <img src={clinicProfile.image || '/clinic-placeholder.svg'} alt={clinicProfile.name} className="w-full h-full object-cover" />
              </div>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-[32px] sm:text-[40px] font-extrabold text-[#1F2432] tracking-tight leading-tight">{clinicProfile.name}</h1>
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
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5 text-[#1EBDB8] shrink-0">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                    {clinicProfile.phone || 'Phone not provided'}
                  </span>
                  <span className="inline-flex items-center rounded-full bg-white/80 border border-[#D8EEEE] px-3 py-1.5 text-[13px] font-bold text-[#1F2432]">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5 text-[#1EBDB8] shrink-0">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                      <polyline points="22,6 12,13 2,6" />
                    </svg>
                    {clinicProfile.email || 'Email not provided'}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-4 mt-4">
                  <div className="flex items-center gap-2">
                    <span className="text-amber-500 text-[20px]">★</span>
                    <span className="text-[17px] font-bold text-[#1F2432]">{Number(clinicProfile.rating || 0).toFixed(2)}</span>
                    <span className="text-[#9CA3AF]">•</span>
                    <span className="text-[17px] font-semibold text-[#6B7280]">{clinicProfile.totalReviews || 0} reviews</span>
                  </div>
                  <div>
                    {hasPatientReviewedClinic ? (
                      <button
                        type="button"
                        disabled
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-xl bg-gray-100 text-gray-400 text-[12.5px] font-bold cursor-not-allowed border border-gray-200"
                      >
                        <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24" className="text-gray-300">
                          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                        </svg>
                        Already Rated
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={openReviewModal}
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-xl bg-[#1EBDB8] hover:bg-[#1CAAAE] text-white text-[12.5px] font-bold transition-all shadow-sm active:scale-95 duration-150"
                      >
                        <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                        </svg>
                        Rate & Review Clinic
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-12 flex items-center gap-10 border-b border-[#D6E8E8] overflow-x-auto scrollbar-none">
              {['about', 'doctor', 'laboratory', 'facility', 'media', 'reviews'].map((tabId) => (
                <button
                  key={tabId}
                  type="button"
                  onClick={() => setActiveClinicTab(tabId)}
                  className={`pb-5 text-[17px] font-bold capitalize border-b-2 transition-colors shrink-0 ${
                    activeClinicTab === tabId
                      ? 'border-[#1F2432] text-[#1F2432]'
                      : 'border-transparent text-[#6B7280] hover:text-[#1F2432]'
                  }`}
                >
                  {tabId === 'media' ? 'Gallery' : tabId === 'doctor' ? 'Doctors' : tabId === 'laboratory' ? 'Laboratory' : tabId === 'facility' ? 'Facility' : tabId}
                </button>
              ))}
            </div>

            <div className="mt-8">
              {activeClinicTab === 'about' && (
                <div className="space-y-5">
                  <p className="text-[16px] leading-7 text-[#1F2937]">{clinicProfile.about}</p>
                </div>
              )}

              {['doctor', 'laboratory', 'facility'].includes(activeClinicTab) && (
                <div className="space-y-4">
                  {isLoadingClinicDoctors ? (
                    <div className="py-12 text-center">
                      <div className="animate-spin inline-block w-8 h-8 border-[3px] border-current border-t-transparent text-[#1EBDB8] rounded-full"></div>
                      <p className="text-[14px] font-semibold text-[#6B7280] mt-3">Loading clinic providers...</p>
                    </div>
                  ) : (
                    (() => {
                      const filtered = clinicDoctors.filter((doc) => {
                        if (activeClinicTab === 'doctor') return doc.providerType === 'doctor';
                        if (activeClinicTab === 'laboratory') return doc.providerType === 'service' && doc.serviceType === 'lab';
                        if (activeClinicTab === 'facility') return doc.providerType === 'service' && doc.serviceType === 'facility';
                        return false;
                      });

                      if (filtered.length === 0) {
                        return (
                          <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-8 text-center">
                            <p className="text-[15px] font-bold text-[#6B7280]">
                              No {activeClinicTab === 'doctor' ? 'doctors' : activeClinicTab === 'laboratory' ? 'laboratories' : 'facilities'} found.
                            </p>
                          </div>
                        );
                      }

                      return (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                          {filtered.map((doc) => {
                            const isSelected = selectedClinicDoctor?.id === doc.id;
                            const minPrice = doc.slots && doc.slots.length > 0
                              ? Math.min(...doc.slots.map(s => s.priceInRupees || 0))
                              : null;

                            return (
                              <div
                                key={doc.id}
                                onClick={() => setSelectedClinicDoctor(doc)}
                                className={`flex flex-col bg-white rounded-3xl border overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-[#1EBDB8]/30 group cursor-pointer relative ${
                                  isSelected
                                    ? 'border-[#1EBDB8] ring-2 ring-[#1EBDB8]/15 shadow-md'
                                    : 'border-gray-100 shadow-[0px_4px_20px_rgba(0,0,0,0.02)]'
                                }`}
                              >
                                {/* Top Image Section */}
                                <div
                                  onClick={(e) => {
                                    if (doc.image) {
                                      e.stopPropagation();
                                      setPreviewImage(doc.image);
                                    }
                                  }}
                                  className={`h-44 w-full relative overflow-hidden bg-slate-50 shrink-0 group/img ${
                                    doc.image ? 'cursor-zoom-in' : ''
                                  }`}
                                >
                                  {doc.image ? (
                                    <>
                                      <img
                                        src={doc.image}
                                        alt={doc.name}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                      />
                                      <div className="absolute inset-0 bg-black/25 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                                        <svg className="w-7 h-7 text-white filter drop-shadow-md" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                                        </svg>
                                      </div>
                                    </>
                                  ) : doc.providerType === 'service' ? (
                                    doc.serviceType === 'facility' ? (
                                      <div className="w-full h-full bg-gradient-to-br from-teal-50/70 to-cyan-100/50 flex items-center justify-center">
                                        <svg className="w-12 h-12 text-[#1EBDB8] transition-transform duration-500 group-hover:scale-110" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 21v-4.875c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125V21m0 0h4.5V3.545M2.25 21h19.5M3 3.545c0-.621.504-1.125 1.125-1.125h15.75c.621 0 1.125.504 1.125 1.125v17.455M5.25 6h1.5m-1.5 3h1.5m-1.5 3h1.5M17.25 6h1.5m-1.5 3h1.5m-1.5 3h1.5" />
                                        </svg>
                                      </div>
                                    ) : (
                                      <div className="w-full h-full bg-gradient-to-br from-emerald-50/70 to-teal-100/50 flex items-center justify-center">
                                        <svg className="w-12 h-12 text-[#10B981] transition-transform duration-500 group-hover:scale-110" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                          <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v11.896m0-11.896a1.5 1.5 0 013 0v11.896m-3-11.896H6.18c-.496 0-.974.198-1.324.55a1.5 1.5 0 00-.45 1.06v11.89c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125v-11.89a1.5 1.5 0 00-.45-1.06 1.5 1.5 0 00-1.324-.55H12.75m-3 11.896h3" />
                                          <circle cx="12" cy="18" r="1.5" />
                                        </svg>
                                      </div>
                                    )
                                  ) : (
                                    <img
                                      src="/topdoc.svg"
                                      alt={doc.name}
                                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                  )}
                                </div>

                                {/* Body Section */}
                                <div className="p-5 flex flex-col flex-1 justify-between bg-white">
                                  <div className="space-y-1">
                                    {/* Name & Pricing Row */}
                                    <div className="flex items-start justify-between gap-2">
                                      <p className="text-[16px] font-extrabold text-[#1F2432] leading-tight truncate group-hover:text-[#1EBDB8] transition-colors">
                                        {doc.providerType === 'service' ? doc.name : doc.name.startsWith('Dr.') ? doc.name : `Dr. ${doc.name}`}
                                      </p>
                                      {minPrice !== null && (
                                        <p className="text-[15.5px] font-black text-[#1F2432] whitespace-nowrap shrink-0">
                                          {formatCurrency(minPrice)}
                                        </p>
                                      )}
                                    </div>
                                    {/* Specialty */}
                                    <p className="text-[13px] font-semibold text-[#6B7280] truncate">
                                      {doc.specialty}
                                    </p>
                                  </div>

                                  {/* Availability Slots / Inline Booking */}
                                  {doc.slots && doc.slots.length > 0 && (
                                    <div className="mt-4 pt-4 border-t border-gray-100">
                                      <div className="flex flex-wrap gap-1.5">
                                        {doc.slots.slice(0, 3).map((slot) => (
                                          <button
                                            key={slot._id || slot.id}
                                            type="button"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleBookClinicDoctorSlot(slot);
                                            }}
                                            className="px-2.5 py-1.5 text-[11px] font-extrabold rounded-xl bg-[#ECFAFA] hover:bg-[#1EBDB8] text-[#1EBDB8] hover:text-white border border-[#D5EFF0] hover:border-transparent transition-all shadow-sm"
                                          >
                                            {formatTimeToAMPM(slot.fromTime)}
                                          </button>
                                        ))}
                                        {doc.slots.length > 3 && (
                                          <button
                                            type="button"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setSelectedClinicDoctor(doc);
                                            }}
                                            className="px-2.5 py-1.5 text-[11px] font-extrabold rounded-xl bg-slate-50 hover:bg-slate-100 text-[#6B7280] border border-gray-100 transition-all shadow-sm"
                                          >
                                            +{doc.slots.length - 3} more
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })()
                  )}
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
        </div>
      </div>
      {previewImage && (
        <div
          className="fixed inset-0 z-[150] bg-black/80 backdrop-blur-[2px] flex items-center justify-center p-4"
          onClick={() => setPreviewImage(null)}
        >
          <div
            className="relative w-full max-w-4xl max-h-[90vh] bg-black rounded-2xl overflow-hidden shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setPreviewImage(null)}
              className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-black/50 text-white hover:bg-black/80 transition-colors flex items-center justify-center"
              aria-label="Close preview"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
            <div className="w-full h-full flex items-center justify-center p-2">
              <img src={previewImage} alt="Preview" className="max-w-full max-h-[85vh] object-contain rounded-lg" />
            </div>
          </div>
        </div>
      )}

      {isReviewModalOpen && (
        <div
          className="fixed inset-0 z-[150] bg-black/50 backdrop-blur-[4px] flex items-center justify-center p-4"
          onClick={() => setIsReviewModalOpen(false)}
        >
          <div
            className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl relative border border-gray-100"
            onClick={(event) => event.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[20px] font-extrabold text-[#1F2432]">Rate & Review</h3>
              <button
                type="button"
                onClick={() => setIsReviewModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-50 text-[#6B7280] hover:text-[#1F2432] transition-colors flex items-center justify-center"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            {/* Stars Selector */}
            <div className="space-y-4">
              <p className="text-[14px] font-bold text-[#4B5563] text-center">How was your experience at {clinicProfile.name}?</p>
              <div className="flex justify-center gap-2 py-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setReviewRating(star)}
                    className="text-[36px] transition-transform hover:scale-110 focus:outline-none"
                  >
                    <span className={star <= reviewRating ? 'text-amber-500' : 'text-gray-200'}>
                      ★
                    </span>
                  </button>
                ))}
              </div>

              {/* Comment Textarea */}
              <div className="space-y-1.5">
                <label className="text-[13px] font-bold uppercase tracking-[0.08em] text-[#6B7280]">Your Feedback</label>
                <textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Share your thoughts about this clinic's doctors, services, or facilities..."
                  rows={4}
                  maxLength={500}
                  className="w-full rounded-[16px] border border-gray-200 bg-slate-50/50 px-4 py-3.5 text-[14px] text-[#1F2432] outline-none focus:border-[#1EBDB8] focus:bg-white transition-all resize-none"
                />
                <div className="flex justify-between text-[11px] text-[#9CA3AF]">
                  <span>Minimum 3 characters</span>
                  <span>{reviewComment.length}/500</span>
                </div>
              </div>

              {/* Submit / Cancel Buttons */}
              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsReviewModalOpen(false)}
                  className="flex-1 py-3 rounded-xl border border-gray-200 hover:bg-slate-50 text-[#6B7280] text-[14px] font-bold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleReviewSubmit}
                  disabled={isSubmittingReview || reviewRating === 0 || reviewComment.trim().length < 3}
                  className="flex-1 py-3 rounded-xl bg-[#1EBDB8] disabled:bg-gray-100 disabled:text-gray-400 hover:bg-[#1CAAAE] text-white text-[14px] font-bold transition-all shadow-sm flex items-center justify-center gap-2"
                >
                  {isSubmittingReview ? (
                    <>
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                      Submitting...
                    </>
                  ) : (
                    'Submit Review'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      </>
    );
  }

  const renderExploreCard = (item, isSponsoredSection = false) => (
    <DoctorCard
      key={`${item.type}-${item.id}`}
      doctor={item}
      showFavorite={Boolean(onToggleFavoriteDoctor) && isValidObjectId(item.id)}
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
      containerClassName={`bg-white rounded-[24px] p-6 shadow-[0px_4px_20px_rgba(0,0,0,0.03)] border flex flex-col relative ${
        isSponsoredSection ? 'border-[#1EBDB8]/40 shadow-[0px_8px_24px_rgba(30,189,184,0.12)]' : 'border-gray-100'
      }`}
    />
  );

  return (
    <>
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

      <section className="space-y-5">
        <div className="rounded-[22px] border border-[#CFEFF0] bg-gradient-to-r from-[#ECFAFA] via-[#F8FEFE] to-[#EEF8FF] p-4 sm:p-5">
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-[#1F2432] font-extrabold text-[22px] sm:text-[24px]">
                {shouldShowSearchResults ? `${activeResultTypeLabel} Results` : `Explore ${activeResultTypeLabel}`}
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {[
                { id: 'doctor', label: 'Doctors', count: resultTypeCounts.doctor },
                { id: 'clinic', label: 'Clinics', count: resultTypeCounts.clinic },
                { id: 'store', label: 'Medical Stores', count: resultTypeCounts.store }
              ].map((tab) => {
                const isActive = activeResultType === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveResultType(tab.id)}
                    className={`w-full rounded-2xl border px-4 py-3 text-left transition-all ${
                      isActive
                        ? 'bg-[#1EBDB8] border-[#1EBDB8] text-white shadow-[0px_10px_18px_rgba(30,189,184,0.25)]'
                        : 'bg-white border-[#D8E6E8] text-[#1F2432] hover:border-[#1EBDB8]/40'
                    }`}
                  >
                    <p className="text-[13px] font-extrabold">{tab.label}</p>
                  </button>
                );
              })}
            </div>

            {(activeResultType === 'doctor' || activeResultType === 'clinic') ? (
              <div className="overflow-x-auto overflow-y-visible pt-2 pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                <div className="flex items-stretch gap-4 sm:gap-5 lg:grid lg:grid-cols-5 min-w-max lg:min-w-0 pr-1">
                  {DOCTOR_SPECIALTY_CATEGORIES.map((specialty) => {
                    const selectedSpecialty = activeResultType === 'clinic'
                      ? selectedClinicSpecialty
                      : selectedDoctorSpecialty;
                    const isActive = selectedSpecialty === specialty.value;
                    return (
                      <button
                        key={specialty.title}
                        type="button"
                        onClick={() => {
                          if (activeResultType === 'clinic') {
                            setSelectedClinicSpecialty(specialty.value);
                            return;
                          }
                          setSelectedDoctorSpecialty(specialty.value);
                        }}
                        className={`relative group h-full w-[156px] sm:w-[168px] lg:w-auto rounded-[2rem] border p-4 sm:p-5 flex flex-col items-center justify-center gap-3 transition-all duration-300 overflow-hidden shadow-[0_4px_20px_-10px_rgba(0,0,0,0.08)] ${
                          isActive
                            ? 'bg-white border-[#1EBDB8]'
                            : 'bg-white border-gray-100 hover:border-[#1EBDB8]/40'
                        }`}
                      >
                        <div className={`absolute inset-0 bg-gradient-to-br ${specialty.color} ${isActive ? 'opacity-40' : 'opacity-0 group-hover:opacity-40'} transition-opacity duration-300 pointer-events-none`} />
                        <div className={`relative w-[62px] h-[62px] rounded-2xl bg-gradient-to-br ${specialty.color} flex items-center justify-center border border-white/60 ${isActive ? 'ring-4 ring-white/50' : ''}`}>
                          <img src={specialty.icon} alt={specialty.title} className="w-9 h-9 object-contain" />
                        </div>
                        <span className={`relative text-[13px] font-extrabold text-center leading-tight transition-colors ${isActive ? specialty.iconColor : 'text-[#1E232F]'}`}>
                          {specialty.title}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : null}
          </div>
        </div>

        {loadError && (
          <div className="bg-amber-50 border border-amber-200 rounded-[16px] p-4">
            <p className="text-[13px] font-medium text-amber-700">{loadError}</p>
          </div>
        )}

        {isLoading ? (
          <div className="bg-white border border-gray-100 rounded-[20px] p-8 text-center">
            <p className="text-[16px] font-bold text-[#4B5563]">Searching...</p>
          </div>
        ) : !hasDisplayResults ? (
          <div className="bg-white border border-gray-100 rounded-[20px] p-8 text-center space-y-1.5">
            <p className="text-[17px] font-extrabold text-[#1F2432]">{emptyStateText}</p>
            <p className="text-[13px] text-[#6B7280]">Try a different search term.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {sponsoredResultsToDisplay.length > 0 ? (
              <div className="space-y-4 rounded-[24px] border border-[#D5F3F2] bg-[#F3FCFC] p-4 sm:p-5">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-[18px] font-extrabold text-[#1F2432]">Sponsored Results</h3>
                  <span className="inline-flex items-center rounded-full bg-white border border-[#D8EEEE] px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.08em] text-[#1EBDB8]">
                    Top Placement
                  </span>
                </div>
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                  {sponsoredResultsToDisplay.map((item) => renderExploreCard(item, true))}
                </div>
              </div>
            ) : null}

            {remainingResultsToDisplay.length > 0 ? (
              <div className="space-y-4">
                <h3 className="text-[18px] font-extrabold text-[#1F2432]">Other Profiles</h3>
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                  {remainingResultsToDisplay.map((item) => renderExploreCard(item, false))}
                </div>
              </div>
            ) : null}
          </div>
        )}
      </section>
    </div>
    {previewImage && (
      <div
        className="fixed inset-0 z-[150] bg-black/80 backdrop-blur-[2px] flex items-center justify-center p-4"
        onClick={() => setPreviewImage(null)}
      >
        <div
          className="relative w-full max-w-4xl max-h-[90vh] bg-black rounded-2xl overflow-hidden shadow-2xl"
          onClick={(event) => event.stopPropagation()}
        >
          <button
            type="button"
            onClick={() => setPreviewImage(null)}
            className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-black/50 text-white hover:bg-black/80 transition-colors flex items-center justify-center"
            aria-label="Close preview"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
          <div className="w-full h-full flex items-center justify-center p-2">
            <img src={previewImage} alt="Preview" className="max-w-full max-h-[85vh] object-contain rounded-lg" />
          </div>
        </div>
      </div>
    )}
    </>
  );
}
