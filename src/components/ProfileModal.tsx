import React, { useState, useRef } from 'react';
import {
  X,
  Camera,
  Trash2,
  Lock,
  Check,
  AlertCircle,
  Clock,
  Sparkles,
  Calendar,
  Shield,
  Loader2,
  ArrowLeft,
  User as UserIcon,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const { user, profile, updateProfile, updateAvatar } = useApp();

  const [firstName, setFirstName] = useState(user?.firstName || profile?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || profile?.lastName || '');
  const [occupation, setOccupation] = useState(profile?.occupation || 'Professional / Builder');
  const [dailyCapacity, setDailyCapacity] = useState<number>(profile?.dailyCapacityHours || 4.5);
  const [avatarPreview, setAvatarPreview] = useState<string>(user?.avatarUrl || profile?.avatarUrl || '');

  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync state when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setFirstName(user?.firstName || profile?.firstName || '');
      setLastName(user?.lastName || profile?.lastName || '');
      setOccupation(profile?.occupation || 'Professional / Builder');
      setDailyCapacity(profile?.dailyCapacityHours || 4.5);
      setAvatarPreview(user?.avatarUrl || profile?.avatarUrl || '');
      setSaveSuccess(false);
      setErrorMessage(null);
    }
  }, [isOpen, user, profile]);

  if (!isOpen) return null;

  // Compute initials fallback
  const displayFirstName = firstName || user?.firstName || '';
  const displayLastName = lastName || user?.lastName || '';
  const initials =
    displayFirstName || displayLastName
      ? `${displayFirstName.charAt(0)}${displayLastName.charAt(0)}`.toUpperCase() || 'DT'
      : (profile?.name?.charAt(0) || 'D').toUpperCase();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMessage(null);

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      setErrorMessage('Please select a valid image file (JPEG, PNG, or WebP).');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('Image size exceeds 5MB. Please choose a smaller image.');
      return;
    }

    setIsUploadingPhoto(true);

    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      const img = new Image();
      img.onload = () => {
        // Resize and compress client-side via canvas to ~256x256
        const canvas = document.createElement('canvas');
        const maxDim = 256;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/webp', 0.85);
          setAvatarPreview(compressedDataUrl);
        }
        setIsUploadingPhoto(false);
      };
      img.onerror = () => {
        setErrorMessage('Failed to process the image file. Please try another image.');
        setIsUploadingPhoto(false);
      };
      img.src = loadEvent.target?.result as string;
    };
    reader.onerror = () => {
      setErrorMessage('Failed to read image file.');
      setIsUploadingPhoto(false);
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setAvatarPreview('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      // 1. Update avatar if changed
      if (avatarPreview !== (user?.avatarUrl || profile?.avatarUrl || '')) {
        const avatarRes = await updateAvatar(avatarPreview || null);
        if (!avatarRes.success && avatarRes.error) {
          console.warn('Avatar update notice:', avatarRes.error);
        }
      }

      // 2. Update profile details
      await updateProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        name: `${firstName.trim()} ${lastName.trim()}`.trim(),
        occupation: occupation.trim(),
        dailyCapacityHours: Number(dailyCapacity),
        avatarUrl: avatarPreview || '',
      });

      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to save profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : 'Recent Member';

  return (
    <div
      id="profile-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="profile-modal-title"
    >
      <div
        id="profile-modal-content"
        className="clay-card-elevated w-full max-w-lg p-4 sm:p-6 relative space-y-5 animate-in zoom-in-95 duration-200 my-auto text-xs text-zinc-200 max-h-[92vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header with Back / Close */}
        <div className="flex items-center justify-between pb-3 border-b border-white/5 shrink-0">
          <div className="flex items-center gap-2.5">
            <button
              onClick={onClose}
              type="button"
              className="clay-btn-secondary px-2.5 py-1.5 rounded-xl flex items-center gap-1.5 text-xs font-semibold text-zinc-300 hover:text-white transition cursor-pointer min-h-[36px]"
              title="Return to previous screen"
              aria-label="Back"
            >
              <ArrowLeft className="w-4 h-4 text-emerald-400" />
              <span>Back</span>
            </button>
            <div className="h-4 w-px bg-white/10 mx-1 hidden xs:block" />
            <div>
              <h2 id="profile-modal-title" className="text-base sm:text-lg font-bold text-white tracking-tight">
                My Profile & Account
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            type="button"
            className="p-2 text-zinc-400 hover:text-white hover:bg-white/10 rounded-xl transition cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center"
            title="Close modal"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="flex-1 overflow-y-auto space-y-5 pr-1 scrollbar-thin">
          {/* Error / Success Banners */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 flex items-center gap-2.5 text-rose-300">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span className="text-[11px] font-medium leading-tight">{errorMessage}</span>
            </div>
          )}

          {saveSuccess && (
            <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 flex items-center gap-2.5 text-emerald-300 animate-in fade-in">
              <Check className="w-4 h-4 shrink-0 text-emerald-400" />
              <span className="text-[11px] font-medium leading-tight">
                Profile and settings saved successfully.
              </span>
            </div>
          )}

          {/* Profile Picture Upload Section */}
          <div className="p-4 rounded-2xl bg-[#0f131a] border border-white/5 flex flex-col sm:flex-row items-center gap-4">
            {/* Avatar Preview */}
            <div className="relative group shrink-0">
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt={firstName || 'User Avatar'}
                  referrerPolicy="no-referrer"
                  className="w-20 h-20 rounded-2xl object-cover border-2 border-emerald-500/50 shadow-md"
                />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-600 via-emerald-800 to-emerald-950 border-2 border-emerald-500/40 flex items-center justify-center text-emerald-100 font-extrabold text-2xl shadow-[inset_0_2px_4px_rgba(255,255,255,0.3)]">
                  {initials}
                </div>
              )}

              {isUploadingPhoto && (
                <div className="absolute inset-0 rounded-2xl bg-black/60 flex items-center justify-center text-emerald-400">
                  <Loader2 className="w-6 h-6 animate-spin" />
                </div>
              )}
            </div>

            {/* Avatar Controls */}
            <div className="flex-1 text-center sm:text-left space-y-2">
              <div>
                <h3 className="text-white font-bold text-xs">Profile Picture</h3>
                <p className="text-zinc-400 text-[11px]">
                  Upload a photo (JPG, PNG, or WebP, max 5MB).
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/jpeg,image/png,image/webp,image/jpg"
                  className="hidden"
                  id="profile-photo-file-input"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingPhoto}
                  className="clay-btn-secondary px-3 py-1.5 text-xs font-semibold flex items-center gap-1.5 min-h-[34px]"
                >
                  <Camera className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Change photo</span>
                </button>

                {avatarPreview && (
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    disabled={isUploadingPhoto}
                    className="p-1.5 text-zinc-400 hover:text-rose-400 hover:bg-rose-950/30 rounded-xl transition cursor-pointer min-h-[34px] min-w-[34px] flex items-center justify-center border border-transparent hover:border-rose-500/20"
                    title="Remove photo"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Form Details */}
          <form onSubmit={handleSubmit} id="profile-edit-form" className="space-y-4">
            {/* Name Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-zinc-300 font-semibold mb-1 text-[11px]">
                  First Name
                </label>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="e.g. Alex"
                  className="clay-input w-full px-3.5 py-2 text-white placeholder-zinc-500 text-xs min-h-[38px]"
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-semibold mb-1 text-[11px]">
                  Last Name
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="e.g. Miller"
                  className="clay-input w-full px-3.5 py-2 text-white placeholder-zinc-500 text-xs min-h-[38px]"
                />
              </div>
            </div>

            {/* Email (Read-Only) */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-zinc-300 font-semibold text-[11px]">
                  Email Address
                </label>
                <span className="text-[10px] text-zinc-500 flex items-center gap-1 font-mono">
                  <Lock className="w-2.5 h-2.5" />
                  Read-only
                </span>
              </div>
              <input
                type="email"
                disabled
                value={user?.email || profile?.name || 'user@example.com'}
                className="w-full px-3.5 py-2 bg-[#0c1017] border border-white/5 rounded-xl text-zinc-400 font-mono text-xs cursor-not-allowed select-none"
              />
              <p className="text-[10px] text-zinc-500 mt-1">
                Your email is managed by your authentic account login and cannot be altered here.
              </p>
            </div>

            {/* Occupation / Role */}
            <div>
              <label className="block text-zinc-300 font-semibold mb-1 text-[11px]">
                Occupation / Primary Role
              </label>
              <input
                type="text"
                value={occupation}
                onChange={(e) => setOccupation(e.target.value)}
                placeholder="e.g. Software Engineer / Student / Product Designer"
                className="clay-input w-full px-3.5 py-2 text-white placeholder-zinc-500 text-xs min-h-[38px]"
              />
            </div>

            {/* Daily Focus Capacity Hours */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-zinc-300 font-semibold text-[11px] flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Daily Realistic Focus Target</span>
                </label>
                <span className="font-bold text-emerald-400 font-mono text-xs">
                  {dailyCapacity} hrs / day
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                step="0.5"
                value={dailyCapacity}
                onChange={(e) => setDailyCapacity(parseFloat(e.target.value))}
                className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
              <div className="flex justify-between text-[10px] text-zinc-500 mt-1">
                <span>1h (Light)</span>
                <span>4.5h (Recommended)</span>
                <span>10h (Maximum)</span>
              </div>
            </div>

            {/* Account Metadata / Security Badge */}
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between text-[11px] text-zinc-400">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Isolated User Data</span>
              </div>
              <span className="font-mono text-[10px] text-zinc-500">Joined {memberSince}</span>
            </div>
          </form>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-white/5 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="clay-btn-secondary px-4 py-2 text-xs font-semibold text-zinc-300 hover:text-white flex items-center gap-1.5 min-h-[38px]"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Cancel</span>
          </button>

          <button
            type="submit"
            form="profile-edit-form"
            disabled={isSaving}
            className="clay-btn-primary px-5 py-2 text-xs font-bold flex items-center gap-2 min-h-[38px] disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Save Profile</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
