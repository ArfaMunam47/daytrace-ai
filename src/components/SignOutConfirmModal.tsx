import React from 'react';
import { LogOut, X, ShieldCheck } from 'lucide-react';

interface SignOutConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  userEmail?: string;
  userName?: string;
}

export const SignOutConfirmModal: React.FC<SignOutConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  userEmail,
  userName,
}) => {
  if (!isOpen) return null;

  return (
    <div
      id="signout-confirm-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="signout-confirm-modal-card"
        className="clay-card-elevated w-full max-w-md p-6 sm:p-7 relative space-y-5 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white hover:bg-white/10 rounded-xl transition cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center"
          title="Close dialog"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Icon & Header */}
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0 shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)]">
            <LogOut className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">Sign out of DayTrace?</h2>
            {userName && (
              <p className="text-xs text-zinc-400 font-medium">
                Signed in as <span className="text-zinc-200 font-semibold">{userName}</span>
              </p>
            )}
          </div>
        </div>

        {/* Safety / History Preservation Assurance */}
        <div className="clay-inset p-3.5 rounded-2xl space-y-2 border border-white/5 bg-[#0f131a]">
          <div className="flex items-start gap-2.5 text-xs text-zinc-300">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed font-medium">
              Your account, task records, reflection logs, and habit history are securely preserved in the database.
            </p>
          </div>
          {userEmail && (
            <div className="text-[11px] text-zinc-400 pl-6 font-mono truncate">
              {userEmail}
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="clay-btn-secondary px-4 py-2.5 text-xs font-semibold text-zinc-300 hover:text-white min-h-[44px]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="clay-btn-danger px-5 py-2.5 text-xs font-semibold flex items-center gap-2 min-h-[44px]"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};
