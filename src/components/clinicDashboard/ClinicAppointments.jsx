export { default } from './ClinicAppointmentsPanel';

/*
const EMPTY_FORM = {
  doctorId: '',
  patientName: '',
  patientPhone: '',
  appointmentDate: '',
  fromTime: '',
  toTime: '',
  consultationMode: 'offline',
  notes: ''
};

const formatAppointmentDateLabel = (dateValue) => {
  if (!dateValue) {
    return 'Appointment';
  }

  const parsedDate = new Date(`${dateValue}T00:00:00`);

  if (Number.isNaN(parsedDate.getTime())) {
    return dateValue;
  }

  return parsedDate.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

const sortAppointmentsByDate = (appointments) => {
  const safeAppointments = Array.isArray(appointments) ? [...appointments] : [];

  safeAppointments.sort((firstAppointment, secondAppointment) => {
    const firstDateKey = `${firstAppointment?.date || ''} ${firstAppointment?.fromTime || ''}`;
    const secondDateKey = `${secondAppointment?.date || ''} ${secondAppointment?.fromTime || ''}`;
    return firstDateKey.localeCompare(secondDateKey);
  });

  return safeAppointments;
};

const getConsultationModeLabel = (consultationMode) => {
  const normalizedMode = String(consultationMode || '').trim().toLowerCase();

  if (normalizedMode === 'offline') {
    return 'Clinic Visit';
  }

  if (normalizedMode === 'video') {
    return 'Video Call';
  }

  return 'Online';
};

const getClinicTokenOrThrow = () => {
  const clinicToken = localStorage.getItem('clinicToken');

  if (!clinicToken) {
    throw new Error('Please login again to continue');
  }

  return clinicToken;
};

export default function ClinicAppointments() {
  const [activeSection, setActiveSection] = useState('upcoming');
  const [doctors, setDoctors] = useState([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [ongoingAppointments, setOngoingAppointments] = useState([]);
  const [cancelledAppointments, setCancelledAppointments] = useState([]);
+  const [isLoading, setIsLoading] = useState(true);
+  const [isSubmitting, setIsSubmitting] = useState(false);
+  const [formData, setFormData] = useState(EMPTY_FORM);
+  const [appointmentToCancel, setAppointmentToCancel] = useState(null);
+  const [isCancellingAppointmentId, setIsCancellingAppointmentId] = useState('');
+
+  useEffect(() => {
+    let isMounted = true;
+
+    const loadClinicAppointmentData = async ({ shouldShowLoading = true } = {}) => {
+      try {
+        if (shouldShowLoading && isMounted) {
+          setIsLoading(true);
+        }
+
+        const clinicToken = getClinicTokenOrThrow();
+
+        const [doctorResponse, appointmentResponse] = await Promise.all([
+          fetchClinicDoctors(clinicToken),
+          fetchClinicAppointments(clinicToken)
+        ]);
+
+        if (!isMounted) {
+          return;
+        }
+
+        setDoctors(Array.isArray(doctorResponse?.doctors) ? doctorResponse.doctors : []);
+        setUpcomingAppointments(Array.isArray(appointmentResponse?.upcomingAppointments) ? appointmentResponse.upcomingAppointments : []);
+        setOngoingAppointments(Array.isArray(appointmentResponse?.ongoingAppointments) ? appointmentResponse.ongoingAppointments : []);
+        setCancelledAppointments(Array.isArray(appointmentResponse?.cancelledAppointments) ? appointmentResponse.cancelledAppointments : []);
+      } catch (error) {
+        if (!isMounted) {
+          return;
+        }
+
+        setDoctors([]);
+        setUpcomingAppointments([]);
+        setOngoingAppointments([]);
+        setCancelledAppointments([]);
+
+        if (shouldShowLoading) {
+          toast.error(error?.message || 'Could not load clinic appointments');
+        }
+      } finally {
+        if (isMounted) {
+          setIsLoading(false);
+        }
+      }
+    };
+
+    loadClinicAppointmentData({ shouldShowLoading: true });
+
+    const pollingIntervalId = window.setInterval(() => {
+      loadClinicAppointmentData({ shouldShowLoading: false });
+    }, 30000);
+
+    const refreshHandler = () => {
+      loadClinicAppointmentData({ shouldShowLoading: false });
+    };
+
+    window.addEventListener('clinic-appointments-updated', refreshHandler);
+
+    return () => {
+      isMounted = false;
+      window.clearInterval(pollingIntervalId);
+      window.removeEventListener('clinic-appointments-updated', refreshHandler);
+    };
+  }, []);
+
+  const sortedUpcomingAppointments = useMemo(() => {
+    return sortAppointmentsByDate(upcomingAppointments);
+  }, [upcomingAppointments]);
+
+  const sortedOngoingAppointments = useMemo(() => {
+    return sortAppointmentsByDate(ongoingAppointments);
+  }, [ongoingAppointments]);
+
+  const sortedCancelledAppointments = useMemo(() => {
+    const safeAppointments = Array.isArray(cancelledAppointments) ? [...cancelledAppointments] : [];
+
+    safeAppointments.sort((firstAppointment, secondAppointment) => {
+      const firstKey = String(firstAppointment?.cancelledAt || firstAppointment?.date || '');
+      const secondKey = String(secondAppointment?.cancelledAt || secondAppointment?.date || '');
+
+      return secondKey.localeCompare(firstKey);
+    });
+
+    return safeAppointments;
+  }, [cancelledAppointments]);
+
+  const visibleAppointments = activeSection === 'ongoing'
+    ? sortedOngoingAppointments
+    : activeSection === 'cancelled'
+      ? sortedCancelledAppointments
+      : sortedUpcomingAppointments;
+
+  const canScheduleAppointments = doctors.length > 0;
+  const selectedDoctor = doctors.find((doctor) => String(doctor?.id || '') === String(formData.doctorId || ''));
+
+  const resetForm = () => {
+    setFormData(EMPTY_FORM);
+  };
+
+  const handleSubmit = async (event) => {
+    event.preventDefault();
+
+    if (!canScheduleAppointments) {
+      toast.error('Please register at least one doctor first');
+      return;
+    }
+
+    if (!formData.doctorId || !formData.patientName || !formData.appointmentDate || !formData.fromTime || !formData.toTime) {
+      toast.error('Doctor, patient name, date, and time are required');
+      return;
+    }
+
+    if (formData.fromTime >= formData.toTime) {
+      toast.error('Start time must be earlier than end time');
+      return;
+    }
+
+    try {
+      setIsSubmitting(true);
+      const clinicToken = getClinicTokenOrThrow();
+
+      const response = await createClinicAppointment(clinicToken, {
+        doctorId: formData.doctorId,
+        patientName: String(formData.patientName || '').trim(),
+        patientPhone: String(formData.patientPhone || '').trim(),
+        appointmentDate: formData.appointmentDate,
+        fromTime: formData.fromTime,
+        toTime: formData.toTime,
+        consultationMode: formData.consultationMode,
+        notes: String(formData.notes || '').trim()
+      });
+
+      if (response?.appointment) {
+        setUpcomingAppointments((previousAppointments) => {
+          return sortAppointmentsByDate([response.appointment, ...previousAppointments]);
+        });
+      }
+
+      toast.success(response?.message || 'Appointment scheduled successfully');
+      resetForm();
+      window.dispatchEvent(new Event('clinic-appointments-updated'));
+    } catch (error) {
+      toast.error(error?.message || 'Could not schedule appointment');
+    } finally {
+      setIsSubmitting(false);
+    }
+  };
+
+  const closeCancelModal = () => {
+    if (isCancellingAppointmentId) {
+      return;
+    }
+
+    setAppointmentToCancel(null);
+  };
+
+  const handleConfirmCancelAppointment = async () => {
+    if (!appointmentToCancel?.id || isCancellingAppointmentId) {
+      return;
+    }
+
+    try {
+      setIsCancellingAppointmentId(String(appointmentToCancel.id));
+      const clinicToken = getClinicTokenOrThrow();
+
+      const response = await cancelClinicAppointment(clinicToken, appointmentToCancel.id);
+
+      setUpcomingAppointments((previousAppointments) => {
+        return previousAppointments.filter((appointment) => String(appointment?.id) !== String(appointmentToCancel.id));
+      });
+
+      if (response?.appointment) {
+        setCancelledAppointments((previousAppointments) => [response.appointment, ...previousAppointments]);
+      }
+
+      toast.success(response?.message || 'Appointment cancelled successfully');
+      setAppointmentToCancel(null);
+      window.dispatchEvent(new Event('clinic-appointments-updated'));
+    } catch (error) {
+      toast.error(error?.message || 'Could not cancel appointment');
+    } finally {
+      setIsCancellingAppointmentId('');
+    }
+  };
+
+  return (
+    <div className="space-y-6">
+      <div className="bg-white p-6 rounded-[28px] border border-gray-100 shadow-sm">
+        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
+          <div>
+            <h2 className="text-[26px] leading-tight font-bold text-[#1F2432]">Clinic Appointments</h2>
+            <p className="text-[14px] text-[#6B7280] mt-1">Assign appointments to your clinic doctors and monitor status in real time.</p>
+          </div>
+
+          <div className="inline-flex items-center p-1.5 rounded-[16px] bg-[#F4F7FB] border border-gray-100 w-full md:w-auto">
+            <button
+              type="button"
+              onClick={() => setActiveSection('upcoming')}
+              className={`px-4 py-2.5 rounded-[12px] text-[13px] font-semibold transition w-full md:w-auto ${
+                activeSection === 'upcoming'
+                  ? 'bg-white text-[#111827] shadow-sm'
+                  : 'text-[#6B7280] hover:text-[#111827]'
+              }`}
+            >
+              Upcoming ({sortedUpcomingAppointments.length})
+            </button>
+            <button
+              type="button"
+              onClick={() => setActiveSection('ongoing')}
+              className={`px-4 py-2.5 rounded-[12px] text-[13px] font-semibold transition w-full md:w-auto ${
+                activeSection === 'ongoing'
+                  ? 'bg-white text-[#111827] shadow-sm'
+                  : 'text-[#6B7280] hover:text-[#111827]'
+              }`}
+            >
+              Ongoing ({sortedOngoingAppointments.length})
+            </button>
+            <button
+              type="button"
+              onClick={() => setActiveSection('cancelled')}
+              className={`px-4 py-2.5 rounded-[12px] text-[13px] font-semibold transition w-full md:w-auto ${
+                activeSection === 'cancelled'
+                  ? 'bg-white text-[#111827] shadow-sm'
+                  : 'text-[#6B7280] hover:text-[#111827]'
+              }`}
+            >
+              Cancelled ({sortedCancelledAppointments.length})
+            </button>
+          </div>
+        </div>
+      </div>
+
+      <div className="bg-white p-6 sm:p-7 rounded-[30px] border border-gray-100 shadow-sm">
+        <div className="flex items-center justify-between mb-5">
+          <div>
+            <h3 className="text-[20px] font-bold text-[#1F2432]">Set New Appointment</h3>
+            <p className="text-[13px] text-[#9CA3AF] font-medium mt-1">Select doctor, patient, date, and consultation mode.</p>
+          </div>
+          {!canScheduleAppointments && (
+            <span className="text-[12px] font-bold uppercase tracking-[0.08em] text-amber-700 bg-amber-100 border border-amber-200 px-3 py-1.5 rounded-full">
+              Register doctor first
+            </span>
+          )}
+        </div>
+
+        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
+          <label className="flex flex-col gap-2 md:col-span-2">
+            <span className="text-[13px] font-bold text-[#6B7280]">Doctor</span>
+            <select
+              value={formData.doctorId}
+              disabled={!canScheduleAppointments || isSubmitting}
+              onChange={(event) => {
+                setFormData((previousData) => ({ ...previousData, doctorId: event.target.value }));
+              }}
+              className="w-full bg-[#F8FAFC] border border-gray-200 rounded-xl px-4 py-3 text-[14px] font-medium text-[#1F2432] outline-none focus:border-[#1EBDB8] focus:ring-2 focus:ring-[#1EBDB8]/20"
+              required
+            >
+              <option value="">Select doctor</option>
+              {doctors.map((doctor) => (
+                <option key={doctor.id} value={doctor.id}>{doctor.fullName} ({doctor.specialization})</option>
+              ))}
+            </select>
+          </label>
+
+          <label className="flex flex-col gap-2 md:col-span-2">
+            <span className="text-[13px] font-bold text-[#6B7280]">Patient Name</span>
+            <input
+              type="text"
+              value={formData.patientName}
+              disabled={!canScheduleAppointments || isSubmitting}
+              onChange={(event) => {
+                setFormData((previousData) => ({ ...previousData, patientName: event.target.value }));
+              }}
+              placeholder="e.g., Ahmed Khan"
+              className="w-full bg-[#F8FAFC] border border-gray-200 rounded-xl px-4 py-3 text-[14px] font-medium text-[#1F2432] outline-none focus:border-[#1EBDB8] focus:ring-2 focus:ring-[#1EBDB8]/20"
+              required
+            />
+          </label>
+
+          <label className="flex flex-col gap-2 md:col-span-2">
+            <span className="text-[13px] font-bold text-[#6B7280]">Patient Phone (Optional)</span>
+            <input
+              type="text"
+              value={formData.patientPhone}
+              disabled={!canScheduleAppointments || isSubmitting}
+              onChange={(event) => {
+                setFormData((previousData) => ({ ...previousData, patientPhone: event.target.value }));
+              }}
+              placeholder="03XX XXXXXXX"
+              className="w-full bg-[#F8FAFC] border border-gray-200 rounded-xl px-4 py-3 text-[14px] font-medium text-[#1F2432] outline-none focus:border-[#1EBDB8] focus:ring-2 focus:ring-[#1EBDB8]/20"
+            />
+          </label>
+
+          <label className="flex flex-col gap-2">
+            <span className="text-[13px] font-bold text-[#6B7280]">Date</span>
+            <input
+              type="date"
+              value={formData.appointmentDate}
+              disabled={!canScheduleAppointments || isSubmitting}
+              onChange={(event) => {
+                setFormData((previousData) => ({ ...previousData, appointmentDate: event.target.value }));
+              }}
+              className="w-full bg-[#F8FAFC] border border-gray-200 rounded-xl px-4 py-3 text-[14px] font-medium text-[#1F2432] outline-none focus:border-[#1EBDB8] focus:ring-2 focus:ring-[#1EBDB8]/20"
+              required
+            />
+          </label>
+
+          <label className="flex flex-col gap-2">
+            <span className="text-[13px] font-bold text-[#6B7280]">From</span>
+            <input
+              type="time"
+              value={formData.fromTime}
+              disabled={!canScheduleAppointments || isSubmitting}
+              onChange={(event) => {
+                setFormData((previousData) => ({ ...previousData, fromTime: event.target.value }));
+              }}
+              className="w-full bg-[#F8FAFC] border border-gray-200 rounded-xl px-4 py-3 text-[14px] font-medium text-[#1F2432] outline-none focus:border-[#1EBDB8] focus:ring-2 focus:ring-[#1EBDB8]/20"
+              required
+            />
+          </label>
+
+          <label className="flex flex-col gap-2">
+            <span className="text-[13px] font-bold text-[#6B7280]">To</span>
+            <input
+              type="time"
+              value={formData.toTime}
+              disabled={!canScheduleAppointments || isSubmitting}
+              onChange={(event) => {
+                setFormData((previousData) => ({ ...previousData, toTime: event.target.value }));
+              }}
+              className="w-full bg-[#F8FAFC] border border-gray-200 rounded-xl px-4 py-3 text-[14px] font-medium text-[#1F2432] outline-none focus:border-[#1EBDB8] focus:ring-2 focus:ring-[#1EBDB8]/20"
+              required
+            />
+          </label>
+
+          <label className="flex flex-col gap-2 md:col-span-2">
+            <span className="text-[13px] font-bold text-[#6B7280]">Consultation Mode</span>
+            <select
+              value={formData.consultationMode}
+              disabled={!canScheduleAppointments || isSubmitting}
+              onChange={(event) => {
+                setFormData((previousData) => ({ ...previousData, consultationMode: event.target.value }));
+              }}
+              className="w-full bg-[#F8FAFC] border border-gray-200 rounded-xl px-4 py-3 text-[14px] font-medium text-[#1F2432] outline-none focus:border-[#1EBDB8] focus:ring-2 focus:ring-[#1EBDB8]/20"
+            >
+              <option value="offline">Clinic Visit</option>
+              <option value="online">Online</option>
+              <option value="video">Video Call</option>
+            </select>
+          </label>
+
+          <label className="flex flex-col gap-2 md:col-span-4">
+            <span className="text-[13px] font-bold text-[#6B7280]">Notes (Optional)</span>
+            <input
+              type="text"
+              value={formData.notes}
+              disabled={!canScheduleAppointments || isSubmitting}
+              onChange={(event) => {
+                setFormData((previousData) => ({ ...previousData, notes: event.target.value }));
+              }}
+              placeholder="Add any special instructions"
+              className="w-full bg-[#F8FAFC] border border-gray-200 rounded-xl px-4 py-3 text-[14px] font-medium text-[#1F2432] outline-none focus:border-[#1EBDB8] focus:ring-2 focus:ring-[#1EBDB8]/20"
+            />
+          </label>
+
+          <div className="md:col-span-6 flex flex-wrap items-center justify-between gap-3 mt-1">
+            <p className="text-[12px] text-[#6B7280] font-medium">
+              {selectedDoctor
+                ? `Scheduling with ${selectedDoctor.fullName} (${selectedDoctor.specialization})`
+                : 'Select a doctor to schedule appointment'}
+            </p>
+
+            <button
+              type="submit"
+              disabled={!canScheduleAppointments || isSubmitting}
+              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#1EBDB8] hover:bg-[#1CAAAE] disabled:opacity-60 disabled:cursor-not-allowed text-white text-[13px] font-bold transition-colors"
+            >
+              {isSubmitting ? 'Scheduling...' : 'Schedule Appointment'}
+            </button>
+          </div>
+        </form>
+      </div>
+
+      <div className="bg-white p-6 sm:p-7 rounded-[30px] border border-gray-100 shadow-sm">
+        {isLoading ? (
+          <div className="rounded-2xl border border-gray-100 bg-[#F9FAFB] px-4 py-10 text-center">
+            <p className="text-[14px] font-semibold text-[#6B7280]">Loading appointments...</p>
+          </div>
+        ) : null}
+
+        {!isLoading && visibleAppointments.length === 0 ? (
+          <div className="rounded-2xl border border-gray-100 bg-[#F9FAFB] px-4 py-10 text-center">
+            <p className="text-[14px] font-semibold text-[#6B7280]">
+              {activeSection === 'ongoing'
+                ? 'No ongoing appointments right now.'
+                : activeSection === 'cancelled'
+                  ? 'No cancelled appointments yet.'
+                  : 'No upcoming appointments available.'}
+            </p>
+          </div>
+        ) : null}
+
+        {!isLoading && visibleAppointments.length > 0 ? (
+          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
+            {visibleAppointments.map((appointment) => {
+              const isOngoing = activeSection === 'ongoing';
+              const isCancelled = activeSection === 'cancelled';
+              const canCancel = activeSection === 'upcoming';
+
+              return (
+                <div
+                  key={appointment.id}
+                  className="rounded-2xl border border-gray-100 bg-[#FCFCFD] p-5 shadow-sm flex flex-col gap-4"
+                >
+                  <div className="flex items-start justify-between gap-4">
+                    <div>
+                      <p className="text-[12px] uppercase tracking-[0.08em] font-bold text-[#9CA3AF]">
+                        {formatAppointmentDateLabel(appointment.date)}
+                      </p>
+                      <h3 className="mt-1 text-[20px] font-bold text-[#1F2432]">
+                        {appointment.fromTime} - {appointment.toTime}
+                      </h3>
+                    </div>
+
+                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-[0.08em] ${
+                      isCancelled
+                        ? 'bg-[#FEE2E2] text-[#991B1B]'
+                        : isOngoing
+                        ? 'bg-[#DCFCE7] text-[#166534]'
+                        : 'bg-[#DBEAFE] text-[#1D4ED8]'
+                    }`}>
+                      {isCancelled ? 'Cancelled' : isOngoing ? 'Ongoing' : 'Upcoming'}
+                    </span>
+                  </div>
+
+                  <div className="flex items-center gap-3">
+                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 flex items-center justify-center">
+                      {appointment?.doctor?.avatarUrl ? (
+                        <img src={appointment.doctor.avatarUrl} alt={appointment.doctor.name} className="w-full h-full object-cover" />
+                      ) : (
+                        <span className="text-[14px] font-bold text-[#1EBDB8] uppercase">{String(appointment?.doctor?.name || 'D').charAt(0)}</span>
+                      )}
+                    </div>
+                    <div>
+                      <p className="text-[15px] font-bold text-[#111827]">{appointment?.doctor?.name || 'Doctor'}</p>
+                      <p className="text-[12px] text-[#6B7280] font-medium">{appointment?.doctor?.specialization || 'General'}</p>
+                    </div>
+                  </div>
+
+                  <div className="space-y-1.5">
+                    <p className="text-[15px] font-bold text-[#1F2432]">Patient: {appointment?.patient?.name || 'Patient'}</p>
+                    <p className="text-[13px] text-[#4B5563]">Phone: {appointment?.patient?.phone || 'N/A'}</p>
+                    <p className="text-[13px] text-[#4B5563]">Mode: {getConsultationModeLabel(appointment?.consultationMode)}</p>
+                    {appointment?.notes ? (
+                      <p className="text-[13px] text-[#6B7280]">Notes: {appointment.notes}</p>
+                    ) : null}
+                  </div>
+
+                  {canCancel ? (
+                    <div className="pt-1">
+                      <button
+                        type="button"
+                        onClick={() => setAppointmentToCancel(appointment)}
+                        disabled={Boolean(isCancellingAppointmentId)}
+                        className="inline-flex items-center justify-center px-4 py-2 rounded-full bg-[#FFF1F1] border border-[#E11D48]/30 text-[#E11D48] text-[13px] font-bold transition hover:bg-[#FFE4E6] disabled:opacity-60 disabled:cursor-not-allowed"
+                      >
+                        {isCancellingAppointmentId === String(appointment.id) ? 'Cancelling...' : 'Cancel Appointment'}
+                      </button>
+                    </div>
+                  ) : null}
+                </div>
+              );
+            })}
+          </div>
+        ) : null}
+      </div>
+
+      {appointmentToCancel ? (
+        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
+          <button
+            type="button"
+            className="absolute inset-0 bg-black/40"
+            onClick={closeCancelModal}
+            disabled={Boolean(isCancellingAppointmentId)}
+            aria-label="Close cancel appointment confirmation"
+          />
+
+          <div className="relative w-full max-w-md rounded-[28px] bg-white p-6 sm:p-7 shadow-[0px_20px_50px_rgba(0,0,0,0.2)] border border-gray-100">
+            <h3 className="text-[#111827] text-[22px] font-extrabold tracking-tight">Cancel Appointment?</h3>
+            <p className="mt-3 text-[#4B5563] text-[15px] leading-relaxed">
+              This will remove the appointment from active schedule and move it to cancelled list.
+            </p>
+
+            <div className="mt-7 flex items-center justify-end gap-3">
+              <button
+                type="button"
+                onClick={closeCancelModal}
+                disabled={Boolean(isCancellingAppointmentId)}
+                className="px-4 py-2 rounded-full border border-gray-300 text-[#374151] text-[14px] font-semibold transition hover:bg-gray-50 disabled:opacity-60 disabled:cursor-not-allowed"
+              >
+                Keep Appointment
+              </button>
+
+              <button
+                type="button"
+                onClick={handleConfirmCancelAppointment}
+                disabled={Boolean(isCancellingAppointmentId)}
+                className="px-4 py-2 rounded-full bg-[#E11D48] text-white text-[14px] font-semibold transition hover:bg-[#be123c] disabled:opacity-60 disabled:cursor-not-allowed"
+              >
+                {isCancellingAppointmentId ? 'Cancelling...' : 'Yes, Cancel'}
+              </button>
+            </div>
+          </div>
+        </div>
+      ) : null}
    </div>
  );
}
*/
