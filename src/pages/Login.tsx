import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Eye, EyeOff, LogIn, Loader2, ArrowLeft, KeyRound, Mail, Lock } from 'lucide-react';
import { toast } from 'sonner';

const API_URL = 'http://localhost:5000/api/auth';

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
  const [generatedOtp, setGeneratedOtp] = useState(''); // Store valid OTP locally for demo/in-app display

  const [currentImage, setCurrentImage] = useState('/assets/login-1.png');

  // Rotate login image on random
  React.useEffect(() => {
    const images = [
      '/assets/login-1.png',
      '/assets/login-2.jpg',
      '/assets/login-3.png',
      '/assets/login-4.png'
    ];
    const randomIndex = Math.floor(Math.random() * images.length);
    setCurrentImage(images[randomIndex]);
  }, []);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const success = await login(email, password, branch);
      if (success) {
        toast.success(`Welcome, ${branch === 'Guindy' ? 'IAT Technologies' : branch === 'Nungambakkam' ? 'IAT Solutions' : 'back!'}`, {
          description: `Successfully logged in to ${branch} branch.`,
        });
        navigate('/dashboard');
      } else {
        toast.error('Login failed', {
          description: 'Invalid email or password. Please try again.',
        });
      }
    } catch {
      toast.error('An error occurred', {
        description: 'Please try again later.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetEmail })
      });
      const data = await response.json();

      if (data.success) {
        setGeneratedOtp(data.data.otp); // Save for display
        setView('forgot-otp');
        toast.success('OTP Generated', {
          description: 'Please check the notification for your OTP.',
        });
        // IN-APP OPT DISPLAY (Since no Email/SMS)
        // We also display it in the UI, so alert is redundant but compliant with "verify inside app"
        // alert(`Your Verification OTP is: ${data.data.otp}`); 
      } else {
        toast.error('Error', { description: data.message });
      }
    } catch (error) {
      toast.error('Network Error', { description: 'Could not connect to server.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetEmail, otp: resetOtp })
      });
      const data = await response.json();

      if (data.success) {
        setView('forgot-new-password');
        toast.success('Verified', { description: 'OTP verified successfully.' });
      } else {
        toast.error('Invalid OTP', { description: data.message });
      }
    } catch (error) {
      toast.error('Network Error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetEmail, otp: resetOtp, newPassword })
      });
      const data = await response.json();

      if (data.success) {
        toast.success('Success', { description: 'Password reset successfully. Please login.' });
        setView('login');
        // Reset states
        setResetEmail('');
        setResetOtp('');
        setNewPassword('');
        setGeneratedOtp('');
      } else {
        toast.error('Error', { description: data.message });
      }
    } catch (error) {
      toast.error('Network Error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 font-sans antialiased text-slate-900 relative overflow-hidden">
      {/* Background Image / Gradient */}
      <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />

      {/* Login Card */}
      <div className="w-full max-w-md relative z-10 animate-scale-in">
        <div className="bg-white border border-slate-100 rounded-[2.5rem] p-10 md:p-12 shadow-2xl shadow-slate-200/50">

          {/* Header Section */}
          <div className="text-center mb-10">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-primary/10 flex items-center justify-center mb-6 shadow-sm border border-primary/5 p-4">
              <img src="/assets/favicon1.png" alt="IATT Logo" className="w-full h-full object-contain" />
            </div>
            <h1 className="text-2xl font-black text-primary tracking-tight leading-none uppercase">
              {view === 'login' ? (
                branch === 'Guindy' ? 'IAT Technologies' : branch === 'Nungambakkam' ? 'IAT Solutions' : 'IATT INTRANET'
              ) : (
                'Reset Password'
              )}
            </h1>
            <p className="text-slate-400 font-bold text-xs tracking-[0.3em] uppercase mt-2 opacity-80">
              {view === 'login' ? 'Portal' : view === 'forgot-email' ? 'Step 1/3' : view === 'forgot-otp' ? 'Step 2/3' : 'Step 3/3'}
            </p>
          </div>

          {/* VIEW: LOGIN */}
          {view === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-slate-400 text-[10px] font-black uppercase tracking-widest ml-1">Select Branch</label>
                <select
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  className="w-full px-6 py-4 rounded-2xl bg-white/50 border border-slate-100 text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all font-medium appearance-none"
                  required
                >
                  <option value="Guindy">Guindy</option>
                  <option value="Nungambakkam">Nungambakkam</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-slate-400 text-[10px] font-black uppercase tracking-widest ml-1">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="w-full px-6 py-4 rounded-2xl bg-white/50 border border-slate-100 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all font-medium"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-slate-400 text-[10px] font-black uppercase tracking-widest ml-1">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full px-6 py-4 rounded-2xl bg-white/50 border border-slate-100 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all font-medium"
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

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase tracking-widest cursor-pointer group">
                  <input type="checkbox" className="w-4 h-4 rounded border-slate-200 text-primary focus:ring-primary/20 cursor-pointer" />
                  <span className="group-hover:text-slate-600 transition-colors">Remember me</span>
                </label>
                <button
                  type="button"
                  onClick={() => setView('forgot-email')}
                  className="text-primary text-[10px] font-black uppercase tracking-widest hover:text-primary/80 transition-colors"
                >
                  Forgot?
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-5 bg-primary text-white rounded-2xl shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center gap-2 font-black uppercase tracking-[0.2em] text-sm disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <LogIn className="w-5 h-5" />
                    Sign In
                  </>
                )}
              </button>
            </form>
          )}

          {/* VIEW: FORGOT - EMAIL */}
          {view === 'forgot-email' && (
            <form onSubmit={handleForgotEmailSubmit} className="space-y-6 animate-in slide-in-from-right duration-300">
              <div className="space-y-2">
                <label className="text-slate-400 text-[10px] font-black uppercase tracking-widest ml-1">Email Address</label>
                <div className="relative">
                  <input
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="Enter your registered email"
                    className="w-full px-6 py-4 rounded-2xl bg-white/50 border border-slate-100 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all font-medium pl-12"
                    required
                    autoFocus
                  />
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-5 bg-primary text-white rounded-2xl shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center gap-2 font-black uppercase tracking-[0.2em] text-sm disabled:opacity-50"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Get OTP'}
              </button>

              <button
                type="button"
                onClick={() => setView('login')}
                className="w-full py-4 text-slate-400 hover:text-slate-600 transition-colors flex items-center justify-center gap-2 font-black uppercase tracking-[0.2em] text-[10px]"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Login
              </button>
            </form>
          )}

          {/* VIEW: FORGOT - OTP */}
          {view === 'forgot-otp' && (
            <form onSubmit={handleOtpSubmit} className="space-y-6 animate-in slide-in-from-right duration-300">
              <div className="bg-blue-50 border border-blue-100 text-blue-800 px-4 py-3 rounded-xl text-center text-sm mb-4">
                <strong>Demo Mode:</strong> Your OTP is <span className="font-bold font-mono text-lg">{generatedOtp}</span>
              </div>

              <div className="space-y-2">
                <label className="text-slate-400 text-[10px] font-black uppercase tracking-widest ml-1">Enter OTP</label>
                <div className="relative">
                  <input
                    type="text"
                    value={resetOtp}
                    onChange={(e) => setResetOtp(e.target.value)}
                    placeholder="6-digit OTP"
                    className="w-full px-6 py-4 rounded-2xl bg-white/50 border border-slate-100 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all font-medium pl-12 tracking-widest text-lg"
                    required
                    maxLength={6}
                    autoFocus
                  />
                  <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-5 bg-primary text-white rounded-2xl shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center gap-2 font-black uppercase tracking-[0.2em] text-sm disabled:opacity-50"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Verify Code'}
              </button>

              <button
                type="button"
                onClick={() => setView('forgot-email')}
                className="w-full py-4 text-slate-400 hover:text-slate-600 transition-colors flex items-center justify-center gap-2 font-black uppercase tracking-[0.2em] text-[10px]"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
            </form>
          )}

          {/* VIEW: FORGOT - NEW PASSWORD */}
          {view === 'forgot-new-password' && (
            <form onSubmit={handleResetPasswordSubmit} className="space-y-6 animate-in slide-in-from-right duration-300">
              <div className="space-y-2">
                <label className="text-slate-400 text-[10px] font-black uppercase tracking-widest ml-1">New Password</label>
                <div className="relative">
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="w-full px-6 py-4 rounded-2xl bg-white/50 border border-slate-100 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all font-medium pl-12"
                    required
                    autoFocus
                  />
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-5 bg-primary text-white rounded-2xl shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center gap-2 font-black uppercase tracking-[0.2em] text-sm disabled:opacity-50"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Reset Password'}
              </button>
            </form>
          )}

          <p className="text-center text-slate-300 font-black uppercase tracking-[0.3em] text-[10px] mt-8">
            © 2024 PM Systems
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
