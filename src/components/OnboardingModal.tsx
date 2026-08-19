import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  ArrowRight,
  Check,
  Target,
  BrainCircuit,
  HeartHandshake,
  UserCheck,
  Briefcase,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { UserRoleIdentifier } from '../types';

interface RoleOption {
  id: UserRoleIdentifier;
  label: string;
  desc: string;
}

const ROLE_OPTIONS: RoleOption[] = [
  { id: 'student', label: 'Student', desc: 'Academics, exams, learning' },
  { id: 'software_developer', label: 'Software Developer / Engineer', desc: 'Coding, architecture, shipping' },
  { id: 'designer', label: 'Designer', desc: 'UI/UX, visual craft, branding' },
  { id: 'entrepreneur', label: 'Entrepreneur / Founder', desc: 'Building products & startups' },
  { id: 'freelancer', label: 'Freelancer', desc: 'Client deliverables & independent work' },
  { id: 'business_professional', label: 'Business Professional', desc: 'Operations, management, strategy' },
  { id: 'content_creator', label: 'Content Creator', desc: 'Writing, video, media production' },
  { id: 'researcher', label: 'Researcher', desc: 'Analysis, investigations, papers' },
  { id: 'teacher', label: 'Teacher / Educator', desc: 'Curriculum, lecturing, mentoring' },
  { id: 'job_seeker', label: 'Job Seeker', desc: 'Interview prep, upskilling, applications' },
  { id: 'employee', label: 'Professional / Employee', desc: 'Organizational projects & tasks' },
  { id: 'homemaker', label: 'Homemaker', desc: 'Family management & home coordination' },
  { id: 'other', label: 'Other', desc: 'Custom role or multi-disciplinary' },
];

export const OnboardingModal: React.FC = () => {
  const { profile, user, completeOnboarding } = useApp();

  const [step, setStep] = useState<number>(1);
  const [name, setName] = useState<string>(profile.name || (user ? `${user.firstName} ${user.lastName}`.trim() : ''));
  const [selectedRole, setSelectedRole] = useState<UserRoleIdentifier | ''>(profile.role || '');
  const [customRole, setCustomRole] = useState<string>(profile.customRole || profile.custom_role || '');
  const [capacity, setCapacity] = useState<number>(profile.dailyCapacityHours || 4.5);
  const [goalsSummary, setGoalsSummary] = useState<string>(profile.mainGoalsSummary || '');
  
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (!name && (profile.name || user)) {
      setName(profile.name || (user ? `${user.firstName} ${user.lastName}`.trim() : ''));
    }
  }, [profile.name, user]);

  if (profile.onboarded) return null;

  const handleStep1Next = () => {
    setErrorMsg(null);
    if (!name.trim()) {
      setErrorMsg('Please enter your name.');
      return;
    }
    if (!selectedRole) {
      setErrorMsg('Please select the role or profession that best describes you.');
      return;
    }
    if (selectedRole === 'other' && !customRole.trim()) {
      setErrorMsg('Please specify your custom role or title.');
      return;
    }
    setStep(2);
  };

  const handleStep2Next = () => {
    setErrorMsg(null);
    if (!capacity || capacity <= 0 || capacity > 16) {
      setErrorMsg('Please select a realistic deep work capacity between 1 and 16 hours.');
      return;
    }
    setStep(3);
  };

  const handleFinish = async () => {
    setErrorMsg(null);
    setIsSubmitting(true);

    try {
      const selectedRoleObj = ROLE_OPTIONS.find((r) => r.id === selectedRole);
      const occupationName = selectedRole === 'other'
        ? customRole.trim()
        : (selectedRoleObj?.label || selectedRole || 'Professional / Builder');

      const res = await completeOnboarding({
        name: name.trim(),
        role: selectedRole as UserRoleIdentifier,
        customRole: selectedRole === 'other' ? customRole.trim() : undefined,
        occupation: occupationName,
        dailyCapacityHours: capacity,
        mainGoalsSummary: goalsSummary.trim(),
      });

      if (!res.success) {
        setErrorMsg(res.error || 'Failed to save setup data. Please try again.');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'An unexpected error occurred while saving.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div id="onboarding-modal-overlay" className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div id="onboarding-modal-card" className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-lg shadow-2xl p-6 space-y-6 animate-in zoom-in-95 duration-200 text-xs my-8">
        
        {/* Brand Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-sm">
              D
            </div>
            <div>
              <h2 className="font-bold text-zinc-100 text-base tracking-tight">DayTrace Setup</h2>
              <p className="text-[11px] text-zinc-400">Plan realistically. Focus deeply. Trace where time goes.</p>
            </div>
          </div>
          <span className="text-[11px] text-zinc-400 font-mono">Step {step} of 3</span>
        </div>

        {/* Error notification banner */}
        {errorMsg && (
          <div id="onboarding-error-banner" className="p-3 bg-rose-950/40 border border-rose-500/40 rounded-xl text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Step 1: Philosophy & Identity & Role Selection */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="p-3.5 bg-emerald-950/30 border border-emerald-500/30 rounded-xl space-y-1.5 text-zinc-200">
              <div className="font-semibold text-emerald-400 flex items-center gap-1.5">
                <HeartHandshake className="w-4 h-4" />
                <span>The DayTrace Philosophy</span>
              </div>
              <p className="text-zinc-300 text-[11px] leading-relaxed">
                Most apps fail because they treat humans like 24-hour manufacturing lines. DayTrace is built around **reality**: unexpected interruptions happen, focus is finite, and consistency beats perfection.
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-zinc-300 font-medium mb-1">
                  What is your name? <span className="text-emerald-400">*</span>
                </label>
                <input
                  id="onboarding-input-name"
                  type="text"
                  required
                  placeholder="e.g. Maya Chen"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (errorMsg) setErrorMsg(null);
                  }}
                  className="w-full px-3.5 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 text-xs focus:outline-none focus:border-emerald-500 transition"
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-medium mb-1.5">
                  What role best describes you right now? <span className="text-emerald-400">*</span>
                </label>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
                  {ROLE_OPTIONS.map((opt) => {
                    const isSelected = selectedRole === opt.id;
                    return (
                      <button
                        type="button"
                        key={opt.id}
                        onClick={() => {
                          setSelectedRole(opt.id);
                          if (errorMsg) setErrorMsg(null);
                        }}
                        className={`text-left p-2.5 rounded-xl border transition cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? 'bg-emerald-950/50 border-emerald-500 text-zinc-100 ring-1 ring-emerald-500'
                            : 'bg-zinc-800/80 border-zinc-700/80 text-zinc-300 hover:bg-zinc-800 hover:border-zinc-600'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className="font-semibold text-xs text-zinc-100">{opt.label}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 ml-1" />}
                        </div>
                        <span className="text-[10px] text-zinc-400 mt-1 leading-tight">{opt.desc}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {selectedRole === 'other' && (
                <div className="animate-in fade-in duration-150">
                  <label className="block text-zinc-300 font-medium mb-1">
                    Specify your role / profession: <span className="text-emerald-400">*</span>
                  </label>
                  <input
                    id="onboarding-input-custom-role"
                    type="text"
                    required
                    placeholder="e.g. Data Journalist, Quantum Physicist..."
                    value={customRole}
                    onChange={(e) => {
                      setCustomRole(e.target.value);
                      if (errorMsg) setErrorMsg(null);
                    }}
                    className="w-full px-3.5 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                id="onboarding-step1-continue"
                type="button"
                onClick={handleStep1Next}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium transition flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <span>Continue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Realistic Capacity */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="p-3.5 bg-zinc-800/60 border border-zinc-700/60 rounded-xl space-y-1 text-zinc-200">
              <div className="font-semibold text-zinc-100 flex items-center gap-1.5">
                <BrainCircuit className="w-4 h-4 text-emerald-400" />
                <span>Realistic Cognitive Capacity</span>
              </div>
              <p className="text-zinc-400 text-[11px] leading-relaxed">
                Elite developers and creators rarely exceed 4–5 hours of true deep work in a single day. Over-planning 8–10 hours creates daily failure loops.
              </p>
            </div>

            <div>
              <label className="block text-zinc-300 font-medium mb-1">
                Your Target Daily Deep Work Capacity (Hours)
              </label>
              <div className="grid grid-cols-4 gap-2 my-2">
                {[3, 4, 4.5, 6].map((hrs) => (
                  <button
                    type="button"
                    key={hrs}
                    onClick={() => {
                      setCapacity(hrs);
                      if (errorMsg) setErrorMsg(null);
                    }}
                    className={`py-2.5 rounded-lg font-semibold border transition text-center cursor-pointer ${
                      capacity === hrs
                        ? 'bg-emerald-600 border-emerald-500 text-white'
                        : 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-750'
                    }`}
                  >
                    {hrs}h / day
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => {
                  setErrorMsg(null);
                  setStep(1);
                }}
                className="text-zinc-400 hover:text-zinc-200 cursor-pointer"
              >
                Back
              </button>
              <button
                id="onboarding-step2-next"
                type="button"
                onClick={handleStep2Next}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium transition flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <span>Next Step</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Main Goals Summary & Completion */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="p-3.5 bg-zinc-800/60 border border-zinc-700/60 rounded-xl space-y-1 text-zinc-200">
              <div className="font-semibold text-zinc-100 flex items-center gap-1.5">
                <Target className="w-4 h-4 text-emerald-400" />
                <span>Primary Goal</span>
              </div>
              <p className="text-zinc-400 text-[11px] leading-relaxed">
                What is the single most important ambition you want to direct your focus toward over the next 90 days?
              </p>
            </div>

            <div>
              <label className="block text-zinc-300 font-medium mb-1">
                Your Primary Ambition <span className="text-zinc-500 text-[10px]">(Optional)</span>
              </label>
              <textarea
                id="onboarding-input-goal"
                rows={3}
                value={goalsSummary}
                onChange={(e) => setGoalsSummary(e.target.value)}
                placeholder="e.g. Master distributed systems, ship DayTrace MVP, exercise consistently..."
                className="w-full px-3.5 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => {
                  setErrorMsg(null);
                  setStep(2);
                }}
                disabled={isSubmitting}
                className="text-zinc-400 hover:text-zinc-200 cursor-pointer disabled:opacity-50"
              >
                Back
              </button>
              <button
                id="onboarding-submit-button"
                type="button"
                onClick={handleFinish}
                disabled={isSubmitting}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold transition flex items-center gap-1.5 cursor-pointer shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving Setup...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Enter DayTrace</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
