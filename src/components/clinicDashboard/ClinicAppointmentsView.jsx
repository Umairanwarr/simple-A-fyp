import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { cancelClinicAppointment, fetchClinicAppointments } from '../../services/authApi';

const formatDate = (dateValue) => {
  const parsedDate = new Date(`${String(dateValue || '').trim()}T00:00:00`);
  if (Number.isNaN(parsedDate.getTime())) return String(dateValue || '').trim();
  return parsedDate.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });
};

export default function ClinicAppointmentsView() {
  const [activeSection, setActiveSection] = useState('upcoming');
  const [isLoading, setIsLoading] = useState(true);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [ongoingAppointments, setOngoingAppointments] = useState([]);
  const [cancelledAppointments, setCancelledAppointments] = useState([]);
  const [cancellingAppointmentId, setCancellingAppointmentId] = useState('');

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      try {
        const clinicToken = localStorage.getItem('clinicToken');
        if (!clinicToken) return;
        if (isMounted) setIsLoading(true);
        const data = await fetchClinicAppointments(clinicToken);
        if (!isMounted) return;
        setUpcomingAppointments(Array.isArray(data?.upcomingAppointments) ? data.upcomingAppointments : []);
        setOngoingAppointments(Array.isArray(data?.ongoingAppointments) ? data.ongoingAppointments : []);
        setCancelledAppointments(Array.isArray(data?.cancelledAppointments) ? data.cancelledAppointments : []);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    load();
    const intervalId = window.setInterval(load, 30000);
    window.addEventListener('clinic-appointments-updated', load);
    return () => {
      isMounted = false;
      window.clearInterval(intervalId);
      window.removeEventListener('clinic-appointments-updated', load);
    };
  }, []);

  const visibleAppointments = useMemo(() => {
    if (activeSection === 'ongoing') return ongoingAppointments;
    if (activeSection === 'cancelled') return cancelledAppointments;
    return upcomingAppointments;
  }, [activeSection, upcomingAppointments, ongoingAppointments, cancelledAppointments]);

  const handleCancelAppointment = async (appointment) => {
    const shouldCancel = window.confirm(`Cancel appointment with ${appointment.patientName || 'this patient'}? The patient will be refunded if payment was collected.`);
    if (!shouldCancel) return;

    try {
      const clinicToken = localStorage.getItem('clinicToken');
      setCancellingAppointmentId(String(appointment.id));
      const response = await cancelClinicAppointment(clinicToken, appointment.id);
      setUpcomingAppointments((items) => items.filter((item) => String(item.id) !== String(appointment.id)));
      setCancelledAppointments((items) => [response?.appointment || { ...appointment, statusCode: 'cancelled', status: 'Cancelled' }, ...items]);
      toast.success(response?.message || 'Appointment cancelled successfully');
      window.dispatchEvent(new Event('clinic-appointments-updated'));
      window.dispatchEvent(new Event('patient-appointment-updated'));
    } catch (error) {
      toast.error(error?.message || 'Could not cancel appointment');
    } finally {
      setCancellingAppointmentId('');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-[30px] border border-gray-100 shadow-sm flex items-center justify-between gap-4">
        <div>
          <h2 className="text-[24px] font-extrabold text-[#1F2432]">Clinic Appointments</h2>
          <p className="text-[14px] text-[#6B7280] mt-1">Track upcoming, ongoing, and cancelled appointments.</p>
        </div>
        <div className="inline-flex p-1 bg-[#F4F7FB] border border-gray-100 rounded-[16px]">
          <button type="button" onClick={() => setActiveSection('upcoming')} className={`px-4 py-2.5 rounded-[12px] text-[12px] font-bold ${activeSection === 'upcoming' ? 'bg-white text-[#111827] shadow-sm' : 'text-[#6B7280]'}`}>Upcoming ({upcomingAppointments.length})</button>
          <button type="button" onClick={() => setActiveSection('ongoing')} className={`px-4 py-2.5 rounded-[12px] text-[12px] font-bold ${activeSection === 'ongoing' ? 'bg-white text-[#111827] shadow-sm' : 'text-[#6B7280]'}`}>Ongoing ({ongoingAppointments.length})</button>
          <button type="button" onClick={() => setActiveSection('cancelled')} className={`px-4 py-2.5 rounded-[12px] text-[12px] font-bold ${activeSection === 'cancelled' ? 'bg-white text-[#111827] shadow-sm' : 'text-[#6B7280]'}`}>Cancelled ({cancelledAppointments.length})</button>
        </div>
      </div>

      <div className="bg-white p-6 sm:p-7 rounded-[30px] border border-gray-100 shadow-sm">
        {isLoading ? (
          <p className="text-center text-[#6B7280] font-semibold py-8">Loading appointments...</p>
        ) : visibleAppointments.length === 0 ? (
          <p className="text-center text-[#6B7280] font-semibold py-8">No {activeSection} appointments found.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {visibleAppointments.map((appointment) => (
              <div key={appointment.id} className="rounded-2xl border border-gray-100 bg-[#F9FAFB] p-5">
                {(() => {
                  const isServiceAppointment = String(appointment?.providerType || '').trim().toLowerCase() === 'service';
                  const serviceType = String(appointment?.serviceType || '').trim().toLowerCase();
                  const providerName = String(appointment?.doctor?.name || '').trim() || (isServiceAppointment ? 'Clinic Service' : 'Doctor');
                  const appointmentTypeLabel = isServiceAppointment
                    ? (serviceType === 'facility' ? 'Facility Appointment' : 'Lab Appointment')
                    : 'Doctor Appointment';
                  return (
                    <>
                      <p className="text-[11px] uppercase tracking-wider font-extrabold text-[#9CA3AF]">{formatDate(appointment.date)}</p>
                      <h4 className="mt-1 text-[17px] font-bold text-[#1F2432]">{appointment.fromTime} - {appointment.toTime}</h4>
                      <p className="text-[14px] text-[#4B5563] mt-3">Patient: <span className="font-bold text-[#1F2432]">{appointment.patientName || 'Patient'}</span></p>
                      <p className="text-[14px] text-[#4B5563]">Provider: <span className="font-bold text-[#1F2432]">{isServiceAppointment ? providerName : `Dr. ${providerName}`}</span></p>
                      <p className="text-[14px] text-[#4B5563]">Type: <span className="font-bold text-[#1F2432]">{appointmentTypeLabel}</span></p>
                      <p className="text-[14px] text-[#4B5563]">Mode: <span className="font-bold text-[#1F2432]">Clinic Visit</span></p>
                    </>
                  );
                })()}
                {activeSection === 'upcoming' && (
                  <button
                    type="button"
                    onClick={() => handleCancelAppointment(appointment)}
                    disabled={cancellingAppointmentId === String(appointment.id)}
                    className="mt-4 w-full rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-[13px] font-bold text-red-600 hover:bg-red-100 disabled:opacity-60"
                  >
                    {cancellingAppointmentId === String(appointment.id) ? 'Cancelling...' : 'Cancel Appointment'}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
