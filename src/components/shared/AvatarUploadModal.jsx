import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

export default function AvatarUploadModal({
  isOpen,
  canClose,
  currentAvatar,
  title,
  description,
  onClose,
  onSave
}) {
  const [previewUrl, setPreviewUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setPreviewUrl(currentAvatar || '');
      setSelectedFile(null);
    }
  }, [isOpen, currentAvatar]);

  if (!isOpen) {
    return null;
  }

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image size must be less than 2MB');
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      setPreviewUrl(typeof reader.result === 'string' ? reader.result : '');
      setSelectedFile(file);
    };

    reader.onerror = () => {
      toast.error('Could not read image file');
    };

    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!selectedFile) {
      toast.error('Please choose a new profile picture to upload');
      return;
    }

    try {
      setIsSaving(true);
      await onSave(selectedFile);
      toast.success('Profile picture updated successfully');
    } catch (error) {
      toast.error(error?.message || 'Could not update profile picture');
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    if (!canClose) {
      return;
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/45 backdrop-blur-sm flex items-center justify-center p-4">
      <div
        className="absolute inset-0"
        onClick={handleClose}
      />

      <div className="relative w-full max-w-[440px] bg-white rounded-3xl border border-gray-100 shadow-[0_20px_50px_rgb(15,23,42,0.22)] p-6 sm:p-7">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <h2 className="text-[22px] font-bold text-[#1F2937]">{title}</h2>
            <p className="text-[13.5px] text-[#6B7280] font-medium mt-1 leading-relaxed">
              {description}
            </p>
          </div>

          {canClose && (
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-[24px] leading-none"
            >
              ×
            </button>
          )}
        </div>

        <div className="flex flex-col items-center gap-4 mt-6">
          <div className="w-[110px] h-[110px] rounded-full overflow-hidden border-2 border-[#1EBDB8]/30 bg-[#1EBDB8]/10">
            {previewUrl ? (
              <img src={previewUrl} alt="Profile preview" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[12px] text-[#1EBDB8] font-bold">
                No image
              </div>
            )}
          </div>

          <label className="cursor-pointer inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-[#1EBDB8]/10 hover:bg-[#1EBDB8]/20 text-[#1EBDB8] text-[13px] font-bold transition-colors">
            Choose Picture
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>

          <p className="text-[12px] text-gray-500 font-medium text-center">
            JPG, PNG, WEBP. Max size 2MB.
          </p>
        </div>

        <div className="flex justify-end gap-3 mt-8">
          {canClose && (
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-[13px] font-bold hover:bg-gray-50"
            >
              Cancel
            </button>
          )}

          <button
            type="button"
            disabled={isSaving}
            onClick={handleSave}
            className="px-5 py-2.5 rounded-xl bg-[#1EBDB8] hover:bg-[#1CAAAE] disabled:opacity-60 disabled:cursor-not-allowed text-white text-[13px] font-bold"
          >
            {isSaving ? 'Saving...' : 'Save Picture'}
          </button>
        </div>
      </div>
    </div>
  );
}
