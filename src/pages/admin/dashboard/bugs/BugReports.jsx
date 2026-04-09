import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import AdminLayout from '../AdminLayout';
import {
  deleteAdminBugReport,
  fetchAdminBugReports,
  updateAdminBugReportStatus
} from '../../../../services/authApi';

const ROLE_OPTIONS = [
  { value: '', label: 'All Roles' },
  { value: 'patient', label: 'Patients' },
  { value: 'doctor', label: 'Doctors' },
  { value: 'clinic', label: 'Clinics' },
  { value: 'medical-store', label: 'Medical Stores' }
];

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'open', label: 'Open' },
  { value: 'resolved', label: 'Resolved' }
];

const ROLE_LABELS = {
  patient: 'Patient',
  doctor: 'Doctor',
  clinic: 'Clinic',
  'medical-store': 'Medical Store'
};

const formatDateTime = (dateValue) => {
  if (!dateValue) {
    return 'N/A';
  }

  const parsedDate = new Date(dateValue);

  if (Number.isNaN(parsedDate.getTime())) {
    return 'N/A';
  }

  return parsedDate.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });
};

export default function BugReports() {
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [bugReports, setBugReports] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [updatingBugReportId, setUpdatingBugReportId] = useState('');
  const [deletingBugReportId, setDeletingBugReportId] = useState('');

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setSearchQuery(searchInput.trim());
    }, 320);

    return () => window.clearTimeout(timeoutId);
  }, [searchInput]);

  useEffect(() => {
    let isMounted = true;

    const loadBugReports = async () => {
      const adminToken = localStorage.getItem('adminToken');

      if (!adminToken) {
        if (isMounted) {
          setBugReports([]);
          setIsLoading(false);
        }

        return;
      }

      try {
        if (isMounted) {
          setIsLoading(true);
        }

        const response = await fetchAdminBugReports(adminToken, {
          search: searchQuery,
          role: roleFilter,
          status: statusFilter
        });

        if (!isMounted) {
          return;
        }

        setBugReports(Array.isArray(response?.bugReports) ? response.bugReports : []);
      } catch (error) {
        if (isMounted) {
          toast.error(error?.message || 'Could not load bug reports');
          setBugReports([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadBugReports();

    return () => {
      isMounted = false;
    };
  }, [searchQuery, roleFilter, statusFilter]);

  const bugReportCount = useMemo(() => bugReports.length, [bugReports]);

  const handleToggleStatus = async (bugReport) => {
    const adminToken = localStorage.getItem('adminToken');

    if (!adminToken) {
      toast.error('Please login as admin first');
      return;
    }

    const nextStatus = String(bugReport?.status || '').toLowerCase() === 'resolved' ? 'open' : 'resolved';

    try {
      setUpdatingBugReportId(String(bugReport?.id || ''));
      const response = await updateAdminBugReportStatus(adminToken, bugReport?.id, nextStatus);
      const updatedBugReport = response?.bugReport || null;

      if (updatedBugReport) {
        setBugReports((previousBugReports) => {
          return previousBugReports.map((existingReport) => {
            return String(existingReport?.id || '') === String(updatedBugReport?.id || '')
              ? updatedBugReport
              : existingReport;
          });
        });
      }

      toast.success(nextStatus === 'resolved' ? 'Bug marked as resolved' : 'Bug marked as open');
    } catch (error) {
      toast.error(error?.message || 'Could not update bug status');
    } finally {
      setUpdatingBugReportId('');
    }
  };

  const handleDeleteBugReport = async (bugReport) => {
    const adminToken = localStorage.getItem('adminToken');

    if (!adminToken) {
      toast.error('Please login as admin first');
      return;
    }

    const shouldDelete = window.confirm(`Delete bug report: ${bugReport?.subject || 'Untitled bug'}?`);

    if (!shouldDelete) {
      return;
    }

    try {
      setDeletingBugReportId(String(bugReport?.id || ''));
      await deleteAdminBugReport(adminToken, bugReport?.id);
      setBugReports((previousBugReports) => {
        return previousBugReports.filter((existingReport) => {
          return String(existingReport?.id || '') !== String(bugReport?.id || '');
        });
      });
      toast.success('Bug report deleted');
    } catch (error) {
      toast.error(error?.message || 'Could not delete bug report');
    } finally {
      setDeletingBugReportId('');
    }
  };

  return (
    <AdminLayout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-[24px] font-bold text-gray-900">Bug Reports</h1>
            <p className="text-[14px] text-gray-500 font-medium mt-1">
              Review issues submitted by patients, doctors, clinics, and stores.
            </p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-[0_2px_10px_rgb(0,0,0,0.02)] flex flex-col lg:flex-row gap-3 lg:items-center">
          <div className="relative flex-1 w-full">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input
              type="text"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Search by subject, reporter, or description..."
              className="w-full bg-[#FAFAFA] text-[#4B5563] text-[14px] font-medium py-2.5 pl-10 pr-4 rounded-xl outline-none focus:ring-2 focus:ring-[#1EBDB8]/50 border border-gray-200 focus:border-[#1EBDB8] transition-all"
            />
          </div>

          <select
            value={roleFilter}
            onChange={(event) => setRoleFilter(event.target.value)}
            className="bg-[#FAFAFA] text-[#374151] text-[13px] font-semibold py-2.5 px-3 rounded-xl border border-gray-200 outline-none"
          >
            {ROLE_OPTIONS.map((option) => (
              <option key={option.value || 'all-roles'} value={option.value}>{option.label}</option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="bg-[#FAFAFA] text-[#374151] text-[13px] font-semibold py-2.5 px-3 rounded-xl border border-gray-200 outline-none"
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value || 'all-status'} value={option.value}>{option.label}</option>
            ))}
          </select>

          <span className="text-[13px] font-bold text-gray-600 whitespace-nowrap">
            {bugReportCount} report{bugReportCount !== 1 ? 's' : ''}
          </span>
        </div>

        <div className="bg-white border border-gray-100 shadow-[0_2px_10px_rgb(0,0,0,0.02)] rounded-2xl overflow-hidden">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full min-w-[1040px] text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="px-5 py-4 text-[12px] font-bold text-gray-500 uppercase tracking-wider">Reporter</th>
                  <th className="px-5 py-4 text-[12px] font-bold text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-5 py-4 text-[12px] font-bold text-gray-500 uppercase tracking-wider">Subject</th>
                  <th className="px-5 py-4 text-[12px] font-bold text-gray-500 uppercase tracking-wider">Details</th>
                  <th className="px-5 py-4 text-[12px] font-bold text-gray-500 uppercase tracking-wider">Submitted</th>
                  <th className="px-5 py-4 text-[12px] font-bold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-5 py-4 text-[12px] font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {isLoading ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-10 text-center text-sm font-medium text-gray-500">
                      Loading bug reports...
                    </td>
                  </tr>
                ) : null}

                {!isLoading && bugReports.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-10 text-center text-sm font-medium text-gray-500">
                      No bug reports found.
                    </td>
                  </tr>
                ) : null}

                {!isLoading && bugReports.map((bugReport) => {
                  const normalizedStatus = String(bugReport?.status || '').toLowerCase() === 'resolved' ? 'resolved' : 'open';
                  const isUpdating = updatingBugReportId === String(bugReport?.id || '');
                  const isDeleting = deletingBugReportId === String(bugReport?.id || '');

                  return (
                    <tr key={bugReport.id} className="hover:bg-gray-50/40 transition-colors align-top">
                      <td className="px-5 py-4">
                        <p className="font-bold text-[13px] text-gray-900">{bugReport.reporterName || 'User'}</p>
                        <p className="text-[12px] text-gray-500 mt-0.5">{bugReport.reporterEmail || 'No email'}</p>
                      </td>
                      <td className="px-5 py-4 text-[12px] font-bold text-gray-700">
                        {ROLE_LABELS[bugReport.reporterRole] || 'User'}
                      </td>
                      <td className="px-5 py-4 text-[13px] font-semibold text-gray-800 max-w-[240px]">
                        <p className="line-clamp-2">{bugReport.subject || 'Untitled bug'}</p>
                      </td>
                      <td className="px-5 py-4 text-[12px] font-medium text-gray-600 max-w-[300px]">
                        <p className="line-clamp-3">{bugReport.description || '-'}</p>
                      </td>
                      <td className="px-5 py-4 text-[12px] font-medium text-gray-600 whitespace-nowrap">
                        {formatDateTime(bugReport.createdAt)}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          normalizedStatus === 'resolved'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {normalizedStatus === 'resolved' ? 'Resolved' : 'Open'}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="inline-flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(bugReport)}
                            disabled={isUpdating || isDeleting}
                            className="px-3 py-1.5 rounded-lg text-[12px] font-bold text-[#0F766E] border border-[#99F6E4] bg-[#F0FDFA] hover:bg-[#CCFBF1] disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isUpdating ? 'Updating...' : normalizedStatus === 'resolved' ? 'Mark Open' : 'Mark Resolved'}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteBugReport(bugReport)}
                            disabled={isUpdating || isDeleting}
                            className="px-3 py-1.5 rounded-lg text-[12px] font-bold text-red-700 border border-red-200 bg-red-50 hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isDeleting ? 'Deleting...' : 'Delete'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
