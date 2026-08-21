import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  Lock,
  Mail,
  User as UserIcon,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Clock,
  Target,
  ShieldCheck,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const AuthView: React.FC = () => {
  const { login, signup, forgotPassword, resetPassword } = useApp();

  const [mode, setMode] = useState<'LOGIN' | 'SIGNUP' | 'FORGOT'>('LOGIN');

  // Form states
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Forgot password sub-step
  const [forgotStep, setForgotStep] = useState<'REQUEST' | 'VERIFY'>('REQUEST');

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const resetMessages = () => {
    setErrorMessage(null);
    setErrorCode(null);
    setSuccessMessage(null);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();

    if (!email.trim() || !password) {
      setErrorMessage('Please enter your email and password.');
      return;
    }

    setIsLoading(true);
    const result = await login(email.trim(), password);
    setIsLoading(false);

    if (!result.success) {
      setErrorMessage(result.error || 'Invalid credentials. Please verify your email and password.');
      if (result.code) {
        setErrorCode(result.code);
      }
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();

    if (!firstName.trim() || !lastName.trim() || !email.trim() || !password) {
      setErrorMessage('All fields are required.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    setIsLoading(true);
    const result = await signup(firstName.trim(), lastName.trim(), email.trim(), password, confirmPassword);
    setIsLoading(false);

    if (!result.success) {
      setErrorMessage(result.error || 'Failed to create your account. Please try again.');
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();

    if (!email.trim()) {
      setErrorMessage('Please enter your account email.');
      return;
    }

    setIsLoading(true);
    const result = await forgotPassword(email.trim());
    setIsLoading(false);

    if (result.success) {
      setSuccessMessage(result.message || 'Reset code generated.');
      if (result.resetCode) {
        setResetCode(result.resetCode);
      }
      setForgotStep('VERIFY');
    } else {
      setErrorMessage(result.error || 'Unable to generate reset code.');
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();

    if (!resetCode.trim() || !password) {
      setErrorMessage('Reset code and new password are required.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('New password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);
    const result = await resetPassword(email.trim(), resetCode.trim(), password);
    setIsLoading(false);

    if (result.success) {
      setSuccessMessage('Password updated successfully! Logging you in...');
      // State transitions automatically to authenticated via AppContext
    } else {
      setErrorMessage(result.error || 'Invalid or expired reset code.');
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#0c0f14] text-zinc-100 flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8 selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Background ambient accents */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 opacity-30">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-emerald-600/20 rounded-full blur-[100px]" />
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-teal-600/20 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="clay-pill inline-flex items-center justify-center gap-2 px-3.5 py-1.5 bg-[#141923] text-xs text-zinc-300 font-medium mb-3.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_#34d399]" />
            <span>DayTrace Productivity Platform</span>
          </div>
          <div className="flex items-center justify-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 border border-white/30 flex items-center justify-center shadow-[0_6px_18px_rgba(16,185,129,0.4),inset_0_1.5px_2px_rgba(255,255,255,0.4)]">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white">DayTrace</h1>
          </div>
          <p className="text-xs sm:text-sm text-zinc-400 mt-2 font-normal">
            Plan less. Do more. Know where your time went.
          </p>
        </div>

        {/* Main Card */}
        <div className="clay-card-elevated p-6 sm:p-8">
          {/* Tab Switcher */}
          {mode !== 'FORGOT' && (
            <div className="clay-inset p-1 rounded-2xl mb-6 flex">
              <button
                type="button"
                onClick={() => {
                  setMode('LOGIN');
                  resetMessages();
                }}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  mode === 'LOGIN'
                    ? 'clay-nav-active text-emerald-300'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Log In
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('SIGNUP');
                  resetMessages();
                }}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  mode === 'SIGNUP'
                    ? 'clay-nav-active text-emerald-300'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Create Account
              </button>
            </div>
          )}

          {/* Feedback Messages */}
          {errorMessage && (
            <div className="mb-4 p-3.5 rounded-2xl bg-gradient-to-r from-rose-950/80 to-rose-900/60 border border-rose-500/40 text-rose-200 text-xs shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                <div className="flex-1">
                  <p className="font-medium leading-relaxed">{errorMessage}</p>
                  {errorCode === 'USER_NOT_FOUND' && (
                    <button
                      type="button"
                      onClick={() => {
                        setMode('SIGNUP');
                        resetMessages();
                      }}
                      className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-semibold border border-emerald-500/30 transition-all cursor-pointer text-xs"
                    >
                      <span>Create account for this email</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {errorCode === 'INVALID_PASSWORD' && (
                    <button
                      type="button"
                      onClick={() => {
                        setMode('FORGOT');
                        setForgotStep('REQUEST');
                        resetMessages();
                      }}
                      className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-semibold border border-amber-500/30 transition-all cursor-pointer text-xs"
                    >
                      <span>Reset your password</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-3 rounded-2xl bg-gradient-to-r from-emerald-950/80 to-emerald-900/60 border border-emerald-500/40 text-emerald-200 text-xs flex items-start gap-2.5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
              <div className="flex-1 font-medium">{successMessage}</div>
            </div>
          )}

          {/* Forms */}
          <AnimatePresence mode="wait">
            {mode === 'LOGIN' && (
              <motion.form
                key="login"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15 }}
                onSubmit={handleLogin}
                className="space-y-4"
              >
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="clay-input w-full pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-zinc-300">Password</label>
                    <button
                      type="button"
                      onClick={() => {
                        setMode('FORGOT');
                        setForgotStep('REQUEST');
                        resetMessages();
                      }}
                      className="text-xs text-emerald-400 hover:text-emerald-300 font-medium transition-colors cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="clay-input w-full pl-10 pr-10 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-3.5 text-zinc-500 hover:text-zinc-300 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="clay-btn-primary w-full mt-3 py-3 px-4 text-sm font-bold flex items-center justify-center gap-2 min-h-[44px]"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Sign In to DayTrace</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <div className="text-center pt-2">
                  <span className="text-xs text-zinc-400">Don't have an account yet? </span>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('SIGNUP');
                      resetMessages();
                    }}
                    className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer"
                  >
                    Create account
                  </button>
                </div>
              </motion.form>
            )}

            {mode === 'SIGNUP' && (
              <motion.form
                key="signup"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15 }}
                onSubmit={handleSignup}
                className="space-y-3.5"
              >
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">
                      First Name
                    </label>
                    <div className="relative">
                      <UserIcon className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-3" />
                      <input
                        type="text"
                        required
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="First"
                        className="clay-input w-full pl-9 pr-3 py-2 text-xs sm:text-sm text-white placeholder:text-zinc-600 focus:outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">
                      Last Name
                    </label>
                    <input
                      type="text"
                      required
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Last"
                      className="clay-input w-full px-3 py-2 text-xs sm:text-sm text-white placeholder:text-zinc-600 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Email Address</label>
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-3" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="clay-input w-full pl-9 pr-3 py-2 text-xs sm:text-sm text-white placeholder:text-zinc-600 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Password</label>
                  <div className="relative">
                    <Lock className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-3" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      className="clay-input w-full pl-9 pr-9 py-2 text-xs sm:text-sm text-white placeholder:text-zinc-600 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-zinc-500 hover:text-zinc-300 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">Confirm Password</label>
                  <div className="relative">
                    <Lock className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-3" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter password"
                      className="clay-input w-full pl-9 pr-3 py-2 text-xs sm:text-sm text-white placeholder:text-zinc-600 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="clay-btn-primary w-full py-2.5 px-4 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 min-h-[44px]"
                  >
                    {isLoading ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Create Free Account</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>

                <div className="text-center pt-1">
                  <span className="text-xs text-zinc-400">Already registered? </span>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('LOGIN');
                      resetMessages();
                    }}
                    className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer"
                  >
                    Sign in to your account
                  </button>
                </div>
              </motion.form>
            )}

            {mode === 'FORGOT' && (
              <motion.div
                key="forgot"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <h3 className="text-sm font-bold text-white">Reset Your Password</h3>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('LOGIN');
                      resetMessages();
                    }}
                    className="text-xs text-zinc-400 hover:text-white font-medium cursor-pointer"
                  >
                    Back to Log In
                  </button>
                </div>

                {forgotStep === 'REQUEST' ? (
                  <form onSubmit={handleForgotPassword} className="space-y-4">
                    <p className="text-xs text-zinc-400">
                      Enter your account email to receive a password reset verification code.
                    </p>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5" />
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="name@example.com"
                          className="clay-input w-full pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="clay-btn-primary w-full py-2.5 px-4 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 min-h-[44px]"
                    >
                      {isLoading ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <span>Generate Reset Code</span>
                      )}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleResetPassword} className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-semibold text-zinc-300">
                          6-Digit Reset Code
                        </label>
                        <button
                          type="button"
                          onClick={() => setForgotStep('REQUEST')}
                          className="text-[11px] text-zinc-400 hover:text-emerald-300 transition-colors cursor-pointer"
                        >
                          Change Email
                        </button>
                      </div>
                      <input
                        type="text"
                        required
                        value={resetCode}
                        onChange={(e) => setResetCode(e.target.value)}
                        placeholder="123456"
                        className="clay-input w-full px-3 py-2.5 text-sm text-white focus:outline-none tracking-widest font-mono text-center"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1">
                        New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="At least 6 characters"
                          className="clay-input w-full pl-3 pr-10 py-2.5 text-sm text-white focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-3 text-zinc-500 hover:text-zinc-300 cursor-pointer"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="clay-btn-primary w-full py-2.5 px-4 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 min-h-[44px]"
                    >
                      {isLoading ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <span>Update Password & Log In</span>
                      )}
                    </button>
                  </form>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Feature Highlights */}
        <div className="mt-8 grid grid-cols-3 gap-3 text-center">
          <div className="clay-card-sm p-3">
            <Clock className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
            <div className="text-[11px] font-bold text-white">Realistic Focus</div>
            <div className="text-[9px] text-zinc-400 font-medium">3.5h–5h daily limits</div>
          </div>
          <div className="clay-card-sm p-3">
            <Target className="w-4 h-4 text-teal-400 mx-auto mb-1" />
            <div className="text-[11px] font-bold text-white">Anti-Overplanning</div>
            <div className="text-[9px] text-zinc-400 font-medium">3-tier task budget</div>
          </div>
          <div className="clay-card-sm p-3">
            <ShieldCheck className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
            <div className="text-[11px] font-bold text-white">Data Isolated</div>
            <div className="text-[9px] text-zinc-400 font-medium">Secure DB isolation</div>
          </div>
        </div>
      </div>
    </div>
  );
};
