import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import AvatarUploadModal from '../../components/shared/AvatarUploadModal';
import ReportBugButton from '../../components/shared/ReportBugButton';
import ReportBugModal from '../../components/shared/ReportBugModal';
import { submitBugReport, updateMedicalStoreAvatar } from '../../services/authApi';
import {
  clearRoleSession,
  getMedicalStoreSessionProfile,
  hasSessionAvatar,
	saveSessionUser
} from '../../utils/authSession';

export default function StoreDashboard() {
	const navigate = useNavigate();
	const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
	const [isAvatarMandatory, setIsAvatarMandatory] = useState(false);
	const [isBugReportModalOpen, setIsBugReportModalOpen] = useState(false);
	const [isSubmittingBugReport, setIsSubmittingBugReport] = useState(false);

	const {
		name: storeName,
		email: storeEmail,
		avatarUrl: storeAvatarUrl
	} = getMedicalStoreSessionProfile();

	useEffect(() => {
		if (!hasSessionAvatar('medicalStore')) {
			setIsAvatarMandatory(true);
			setIsAvatarModalOpen(true);
		}
	}, []);

	const handleLogout = () => {
		clearRoleSession({ tokenKey: 'medicalStoreToken', userKey: 'medicalStore' });
		toast.success('Logged out successfully');
		navigate('/signin');
	};

	const handleOpenAvatarModal = () => {
		setIsAvatarMandatory(!hasSessionAvatar('medicalStore'));
		setIsAvatarModalOpen(true);
	};

	const handleCloseAvatarModal = () => {
		if (isAvatarMandatory) {
			return;
		}

		setIsAvatarModalOpen(false);
	};

	const handleAvatarSave = async (avatarFile) => {
		const medicalStoreToken = localStorage.getItem('medicalStoreToken');

		if (!medicalStoreToken) {
			throw new Error('Please login again to update avatar');
		}

		const data = await updateMedicalStoreAvatar(medicalStoreToken, avatarFile);
		saveSessionUser('medicalStore', data.medicalStore);
		setIsAvatarMandatory(false);
		setIsAvatarModalOpen(false);
	};

	const handleSubmitBugReport = async (payload) => {
		const medicalStoreToken = localStorage.getItem('medicalStoreToken');

		if (!medicalStoreToken) {
			toast.error('Please login again to continue');
			navigate('/signin');
			return;
		}

		try {
			setIsSubmittingBugReport(true);
			await submitBugReport(medicalStoreToken, payload);
			toast.success('Bug report submitted successfully');
			setIsBugReportModalOpen(false);
		} catch (error) {
			toast.error(error?.message || 'Could not submit bug report');
		} finally {
			setIsSubmittingBugReport(false);
		}
	};

	return (
		<div className="min-h-screen bg-[#F8FAFC] font-sans px-6 py-10">
			<div className="max-w-[980px] mx-auto bg-white border border-gray-100 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 sm:p-10">
				<div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
					<div>
						<h1 className="text-[30px] sm:text-[36px] font-bold text-[#1F2937] leading-tight">
							Welcome, <span className="text-[#1EBDB8]">{storeName}</span>
						</h1>
					</div>

					<button
						type="button"
						onClick={handleOpenAvatarModal}
						className="flex items-center gap-3 bg-[#F8FAFC] border border-gray-100 rounded-2xl px-4 py-3 w-fit"
					>
						<div className="w-12 h-12 rounded-xl overflow-hidden border border-[#1EBDB8]/30 bg-[#1EBDB8]/10">
							<img src={storeAvatarUrl} alt={storeName} className="w-full h-full object-cover" />
						</div>
						<div>
							<p className="text-[14px] font-bold text-[#1F2937]">{storeName}</p>
							<p className="text-[12px] text-[#6B7280] font-medium">{storeEmail || 'Medical Store Account'}</p>
						</div>
					</button>
				</div>

				<p className="mt-3 text-[15px] text-[#6B7280] font-medium">
					You are now signed in to your medical store dashboard.
				</p>

				<div className="mt-8 flex flex-wrap gap-3">
					<button
						type="button"
						onClick={() => navigate('/')}
						className="px-5 py-2.5 rounded-xl bg-[#1EBDB8] hover:bg-[#1CAAAE] text-white font-bold text-[14px] transition-colors"
					>
						Go to Home
					</button>
					<button
						type="button"
						onClick={handleLogout}
						className="px-5 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-bold text-[14px] transition-colors"
					>
						Sign Out
					</button>
				</div>
			</div>

			<AvatarUploadModal
				isOpen={isAvatarModalOpen}
				canClose={!isAvatarMandatory}
				currentAvatar={hasSessionAvatar('medicalStore') ? getMedicalStoreSessionProfile().avatarUrl : ''}
				title="Upload Profile Picture"
				description="Please upload your store profile picture to continue."
				onClose={handleCloseAvatarModal}
				onSave={handleAvatarSave}
			/>

			<ReportBugButton onClick={() => setIsBugReportModalOpen(true)} />

			<ReportBugModal
				isOpen={isBugReportModalOpen}
				isSubmitting={isSubmittingBugReport}
				onClose={() => {
					if (!isSubmittingBugReport) {
						setIsBugReportModalOpen(false);
					}
				}}
				onSubmit={handleSubmitBugReport}
			/>
		</div>
	);
}
