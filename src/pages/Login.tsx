import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';

import { Eye, EyeOff, LogIn, Loader2, ArrowLeft, KeyRound, Mail, Lock, Building2 } from 'lucide-react';
import { toast } from 'react-toastify';




type ViewState = 'login' | 'forgot-email' | 'forgot-otp' | 'forgot-new-password';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  // Login State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [branch, setBranch] = useState('Guindy');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Forgot Password State
  const [view, setView] = useState<ViewState>('login');
  const [resetEmail, setResetEmail] = useState('');
  const [resetOtp, setResetOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const success = await login(email, password, branch);
      if (success) {
        toast.success(`Welcome, ${branch === 'Guindy' ? 'IAT Technologies' : branch === 'Nungambakkam' ? 'IAT Solutions' : 'back!'} (Successfully logged in to ${branch} branch.)`);
        navigate('/dashboard');
      } else {
        toast.error('Login failed: Invalid email or password. Please try again.');
      }
    } catch {
      toast.error('An error occurred: Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const data = await api.post<any>('/auth/forgot-password', { email: resetEmail });

      if (data.success) {
        setGeneratedOtp(data.data.otp);
        setView('forgot-otp');
        toast.success('OTP Generated: Please check the notification for your OTP.');
      } else {
        toast.error(`Error: ${data.message}`);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Network Error: Could not connect to server.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const data = await api.post<any>('/auth/verify-otp', { email: resetEmail, otp: resetOtp });

      if (data.success) {
        setView('forgot-new-password');
        toast.success('Verified: OTP verified successfully.');
      } else {
        toast.error(`Invalid OTP: ${data.message}`);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Network Error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const data = await api.post<any>('/auth/reset-password', { email: resetEmail, otp: resetOtp, newPassword });

      if (data.success) {
        toast.success('Success: Password reset successfully. Please login.');
        setView('login');
        setResetEmail('');
        setResetOtp('');
        setNewPassword('');
        setGeneratedOtp('');
      } else {
        toast.error(`Error: ${data.message}`);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Network Error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans antialiased">
      {/* Design Container */}
      <div className="w-full max-w-[850px] h-[540px] bg-white rounded-[40px] shadow-2xl overflow-hidden flex flex-col md:flex-row relative animate-scale-in">

        {/* Left Side: Brand & Visuals */}
        <div className="hidden md:flex md:w-[45%] bg-primary relative flex-col items-center justify-center p-12 text-white overflow-hidden">
          {/* Animated Background Blobs */}
          <div className="absolute top-[-10%] left-[-10%] w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>

          {/* Content */}
          <div className="relative z-10 text-center space-y-8 animate-fade-in">
            <div className="flex flex-col items-center space-y-2">
              <div className="w-24 h-24 bg-white rounded-[2rem] p-4 shadow-xl flex items-center justify-center animate-float">
                <img src="/assets/favicon1.png" alt="IATT Logo" className="w-full h-full object-contain" />
              </div>
              <div className="text-center">
                <h1 className="text-2xl font-black tracking-tighter uppercase leading-none md:text-3xl">IATT INTRANET</h1>
                <p className="text-[10px] font-bold uppercase tracking-[0.5em] mt-1 opacity-80">Portal</p>
              </div>
            </div>
          </div>

          {/* Wavy/Cloud Border Separator */}
          <div className="absolute top-0 right-0 h-full w-20 transform translate-x-1 pointer-events-none overflow-hidden">
            <svg className="h-full w-full fill-white" viewBox="0 0 100 800" preserveAspectRatio="none">
              <path d="M100,0 C60,50 60,150 100,200 C60,250 60,350 100,400 C60,450 60,550 100,600 C60,650 60,750 100,800 L100,0 Z" />
            </svg>
            <svg className="h-full w-full fill-white/20 absolute top-0 right-2" viewBox="0 0 100 800" preserveAspectRatio="none">
              <path d="M100,0 C40,50 40,150 100,200 C40,250 40,350 100,400 C40,450 40,550 100,600 C40,650 40,750 100,800 L100,0 Z" />
            </svg>
          </div>
        </div>

        {/* Right Side: Form Content */}
        <div className="flex-1 p-6 md:p-10 flex flex-col justify-center bg-white relative">

          <div className="mb-6 text-center pt-8">
            <h2 className="text-2xl font-black text-primary tracking-tight leading-none uppercase">
              {view === 'login' ? (branch === 'Guindy' ? 'IAT TECHNOLOGIES' : 'IAT SOLUTIONS') : 'Reset Password'}
            </h2>
            <p className="text-slate-400 font-bold text-[10px] tracking-[0.3em] uppercase mt-2 opacity-60">
              {view === 'login' ? 'Portal Access' : view === 'forgot-email' ? 'Step 1/3' : view === 'forgot-otp' ? 'Step 2/3' : 'Step 3/3'}
            </p>
          </div>

          {/* VIEW: LOGIN */}
          {view === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-6 max-w-sm mx-auto w-full">
              <div className="space-y-4">
                {/* Branch Selection */}
                <div className="space-y-1.5 pl-1">
                  <label className="text-slate-400 text-[11px] font-black uppercase tracking-widest">Select Branch</label>
                  <div className="relative group">
                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                    <select
                      value={branch}
                      onChange={(e) => setBranch(e.target.value)}
                      className="w-full pl-12 pr-6 py-3.5 rounded-2xl bg-slate-50 border border-transparent border-b-2 border-b-slate-100 text-slate-900 focus:outline-none focus:border-b-primary transition-all font-medium appearance-none cursor-pointer"
                      required
                    >
                      <option value="Guindy">Guindy</option>
                      <option value="Nungambakkam">Nungambakkam</option>
                    </select>
                  </div>
                </div>

                {/* Email Address */}
                <div className="space-y-1.5 pl-1">
                  <label className="text-slate-400 text-[11px] font-black uppercase tracking-widest">Email Address</label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="w-full pl-12 pr-6 py-3.5 rounded-2xl bg-slate-50 border border-transparent border-b-2 border-b-slate-100 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-b-primary transition-all font-medium"
                      required
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-1.5 pl-1">
                  <div className="flex justify-between items-center">
                    <label className="text-slate-400 text-[11px] font-black uppercase tracking-widest">Password</label>
                    <button
                      type="button"
                      onClick={() => setView('forgot-email')}
                      className="text-primary text-[10px] font-bold uppercase tracking-wider hover:underline transition-all"
                    >
                      Forgot?
                    </button>
                  </div>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter password"
                      className="w-full pl-12 pr-12 py-3.5 rounded-2xl bg-slate-50 border border-transparent border-b-2 border-b-slate-100 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-b-primary transition-all font-medium"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-4 bg-primary text-white rounded-[2rem] shadow-xl shadow-primary/20 hover:shadow-2xl hover:shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 font-black uppercase tracking-[0.2em] text-sm disabled:opacity-50"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <LogIn className="w-5 h-5" />
                      Log In
                    </>
                  )}
                </button>
              </div>

              <p className="text-center text-slate-300 font-bold uppercase tracking-[0.3em] text-[10px] mt-6">
                © 2024 {branch === 'Guindy' ? 'IAT Technologies' : 'IAT Solutions'}. All rights reserved.
              </p>
            </form>
          )}

          {/* VIEW: FORGOT - EMAIL */}
          {view === 'forgot-email' && (
            <form onSubmit={handleForgotEmailSubmit} className="space-y-6 max-w-sm mx-auto w-full animate-in slide-in-from-right duration-300">
              <div className="space-y-1.5">
                <label className="text-slate-400 text-[11px] font-black uppercase tracking-widest pl-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="Enter registered email"
                    className="w-full pl-12 pr-6 py-4 rounded-2xl bg-slate-50 border-b-2 border-b-slate-100 focus:outline-none focus:border-b-primary transition-all font-medium"
                    required
                    autoFocus
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-5 bg-primary text-white rounded-[2rem] shadow-xl shadow-primary/25 hover:scale-[1.02] transition-all font-black uppercase tracking-[0.2em] text-sm disabled:opacity-50"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Get OTP'}
              </button>

              <button
                type="button"
                onClick={() => setView('login')}
                className="w-full py-2 text-slate-400 hover:text-primary transition-colors flex items-center justify-center gap-2 font-black uppercase tracking-[0.1em] text-[10px]"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Login
              </button>
            </form>
          )}

          {/* VIEW: FORGOT - OTP */}
          {view === 'forgot-otp' && (
            <form onSubmit={handleOtpSubmit} className="space-y-6 max-w-sm mx-auto w-full animate-in slide-in-from-right duration-300">
              <div className="bg-blue-50 border border-blue-100 text-blue-800 px-4 py-3 rounded-2xl text-center text-sm mb-4 font-medium">
                Verify Inside: OTP is <span className="font-bold font-mono text-lg">{generatedOtp}</span>
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-400 text-[11px] font-black uppercase tracking-widest pl-1">Verification Code</label>
                <div className="relative">
                  <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type="text"
                    value={resetOtp}
                    onChange={(e) => setResetOtp(e.target.value)}
                    placeholder="6-digit OTP"
                    className="w-full pl-12 pr-6 py-4 rounded-2xl bg-slate-50 border-b-2 border-b-slate-100 text-slate-900 focus:outline-none focus:border-b-primary transition-all font-medium tracking-widest text-lg"
                    required
                    maxLength={6}
                    autoFocus
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-5 bg-primary text-white rounded-[2rem] shadow-xl shadow-primary/25 hover:scale-[1.02] transition-all font-black uppercase tracking-[0.2em] text-sm disabled:opacity-50"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Verify Code'}
              </button>
            </form>
          )}

          {/* VIEW: FORGOT - NEW PASSWORD */}
          {view === 'forgot-new-password' && (
            <form onSubmit={handleResetPasswordSubmit} className="space-y-6 max-w-sm mx-auto w-full animate-in slide-in-from-right duration-300">
              <div className="space-y-1.5">
                <label className="text-slate-400 text-[11px] font-black uppercase tracking-widest pl-1">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Set new password"
                    className="w-full pl-12 pr-6 py-4 rounded-2xl bg-slate-50 border-b-2 border-b-slate-100 text-slate-900 focus:outline-none focus:border-b-primary transition-all font-medium"
                    required
                    autoFocus
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-5 bg-primary text-white rounded-[2rem] shadow-xl shadow-primary/25 hover:scale-[1.02] transition-all font-black uppercase tracking-[0.2em] text-sm disabled:opacity-50"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Reset Password'}
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};

export default Login;
