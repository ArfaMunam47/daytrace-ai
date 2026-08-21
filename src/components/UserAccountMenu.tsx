import React, { useState, useRef, useEffect } from 'react';
import {
  User as UserIcon,
  Settings,
  BookOpen,
  LogOut,
  ChevronUp,
  Sparkles,
  Shield,
  CheckCircle2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SignOutConfirmModal } from './SignOutConfirmModal';

interface UserAccountMenuProps {
  onOpenProfile: () => void;
  onOpenSettings?: () => void;
  onOpenPhilosophy?: () => void;
  className?: string;
  align?: 'bottom' | 'top';
}

export const UserAccountMenu: React.FC<UserAccountMenuProps> = ({
  onOpenProfile,
  onOpenSettings,
  onOpenPhilosophy,
  className = '',
}) => {
  const { user, profile, logout } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Compute authentic display name and initials without fallback placeholders
  const rawFirstName = user?.firstName || profile?.firstName || '';
  const rawLastName = user?.lastName || profile?.lastName || '';
  const fullName =
    rawFirstName || rawLastName
      ? `${rawFirstName} ${rawLastName}`.trim()
      : profile?.name?.trim() || 'DayTrace Member';

  const displayName = fullName;
  const email = user?.email || '';

  // Get authentic initials
  const initials =
    rawFirstName || rawLastName
      ? `${rawFirstName.charAt(0)}${rawLastName.charAt(0)}`.toUpperCase() || 'DT'
      : displayName.charAt(0).toUpperCase() || 'DT';

  const avatarUrl = user?.avatarUrl || profile?.avatarUrl || '';

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleSignOutClick = () => {
    setIsOpen(false);
    setShowSignOutConfirm(true);
  };

  const handleConfirmSignOut = () => {
    setShowSignOutConfirm(false);
    logout();
  };

  return (
    <div className={`relative ${className}`} ref={menuRef} id="daytrace-account-menu-container">
      {/* Trigger Button: User Card in Sidebar */}
      <button
        type="button"
        id="user-account-menu-trigger"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="true"
        aria-expanded={isOpen}
        title="Open account menu"
        className={`w-full flex items-center justify-between p-1.5 rounded-xl transition duration-150 cursor-pointer text-left border ${
          isOpen
            ? 'bg-[#181e2b] border-emerald-500/40 shadow-[0_4px_16px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.12)]'
            : 'bg-[#0f131a] hover:bg-[#151a24] border-white/5 hover:border-white/10'
        }`}
      >
        <div className="flex items-center gap-2 truncate min-w-0">
          {/* Avatar / Picture */}
          <div className="relative shrink-0">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={displayName}
                referrerPolicy="no-referrer"
                className="w-7 h-7 rounded-lg object-cover border border-emerald-500/40 shadow-sm"
              />
            ) : (
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-600 to-emerald-950 border border-emerald-500/40 flex items-center justify-center text-emerald-100 font-bold text-[11px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.25)]">
                {initials}
              </div>
            )}
            {/* Status indicator */}
            <span
              className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 border-2 border-[#0f131a]"
              title="Online & Synchronized"
            />
          </div>

          {/* Name and Email */}
          <div className="truncate min-w-0 flex-1">
            <div className="text-zinc-100 font-semibold text-[11.5px] truncate leading-tight flex items-center gap-1.5">
              <span>{displayName}</span>
            </div>
            <div className="text-[9.5px] text-zinc-400 truncate leading-tight font-medium mt-0.5">
              {email || profile?.occupation || 'Personal Account'}
            </div>
          </div>
        </div>

        {/* Chevron */}
        <div className="text-zinc-400 p-0.5 shrink-0">
          <ChevronUp
            className={`w-3 h-3 transition-transform duration-200 ${
              isOpen ? 'rotate-180 text-emerald-400' : 'text-zinc-500'
            }`}
          />
        </div>
      </button>

      {/* Popover Dropdown Menu */}
      {isOpen && (
        <div
          id="user-account-menu-dropdown"
          className="absolute bottom-full left-0 right-0 mb-2 z-50 clay-card-elevated p-2 border-white/10 shadow-[0_18px_40px_rgba(0,0,0,0.7),0_4px_12px_rgba(0,0,0,0.5)] animate-in fade-in slide-in-from-bottom-2 duration-150 rounded-2xl min-w-[240px]"
        >
          {/* Header Summary */}
          <div className="p-2.5 mb-1.5 rounded-xl bg-[#0e1219] border border-white/5 space-y-1">
            <div className="flex items-center gap-2">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={displayName}
                  referrerPolicy="no-referrer"
                  className="w-9 h-9 rounded-xl object-cover border border-emerald-500/40 shadow-sm shrink-0"
                />
              ) : (
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-950 border border-emerald-500/40 flex items-center justify-center text-emerald-100 font-bold text-xs shrink-0 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]">
                  {initials}
                </div>
              )}
              <div className="truncate min-w-0">
                <div className="text-xs font-bold text-white truncate">{displayName}</div>
                <div className="text-[10px] text-zinc-400 truncate font-mono">{email}</div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1.5 border-t border-white/5 text-[10px] text-zinc-400">
              <span className="flex items-center gap-1 text-emerald-400 font-medium">
                <CheckCircle2 className="w-3 h-3" />
                <span>Account Active</span>
              </span>
              <span className="text-zinc-500">{profile?.occupation || 'Member'}</span>
            </div>
          </div>

          {/* Menu Items */}
          <div className="space-y-0.5">
            {/* My Profile */}
            <button
              type="button"
              id="menu-item-profile"
              onClick={() => {
                setIsOpen(false);
                onOpenProfile();
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-zinc-200 hover:text-white hover:bg-emerald-500/10 rounded-xl transition cursor-pointer group"
            >
              <div className="w-6 h-6 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
                <UserIcon className="w-3.5 h-3.5" />
              </div>
              <div className="flex-1 text-left flex items-center justify-between">
                <span>My Profile</span>
                <span className="text-[9px] text-emerald-400 font-semibold px-1.5 py-0.5 rounded-md bg-emerald-500/10">
                  Edit
                </span>
              </div>
            </button>

            {/* Account Settings */}
            {onOpenSettings && (
              <button
                type="button"
                id="menu-item-settings"
                onClick={() => {
                  setIsOpen(false);
                  onOpenSettings();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-zinc-200 hover:text-white hover:bg-white/5 rounded-xl transition cursor-pointer group"
              >
                <div className="w-6 h-6 rounded-lg bg-white/5 text-zinc-300 flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
                  <Settings className="w-3.5 h-3.5" />
                </div>
                <span className="flex-1 text-left">Account Settings</span>
              </button>
            )}

            {/* How DayTrace Works / Philosophy */}
            {onOpenPhilosophy && (
              <button
                type="button"
                id="menu-item-philosophy"
                onClick={() => {
                  setIsOpen(false);
                  onOpenPhilosophy();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-zinc-200 hover:text-white hover:bg-white/5 rounded-xl transition cursor-pointer group"
              >
                <div className="w-6 h-6 rounded-lg bg-amber-500/10 text-amber-300 flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
                  <BookOpen className="w-3.5 h-3.5" />
                </div>
                <span className="flex-1 text-left">How DayTrace Works</span>
              </button>
            )}

            {/* Divider */}
            <div className="my-1 border-t border-white/5" />

            {/* Sign Out */}
            <button
              type="button"
              id="menu-item-signout"
              onClick={handleSignOutClick}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-rose-300 hover:text-rose-200 hover:bg-rose-950/40 rounded-xl transition cursor-pointer group"
            >
              <div className="w-6 h-6 rounded-lg bg-rose-500/15 text-rose-400 flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
                <LogOut className="w-3.5 h-3.5" />
              </div>
              <span className="flex-1 text-left">Sign Out</span>
            </button>
          </div>
        </div>
      )}

      {/* Sign Out Confirmation Modal */}
      <SignOutConfirmModal
        isOpen={showSignOutConfirm}
        onClose={() => setShowSignOutConfirm(false)}
        onConfirm={handleConfirmSignOut}
        userEmail={email}
        userName={displayName}
      />
    </div>
  );
};
