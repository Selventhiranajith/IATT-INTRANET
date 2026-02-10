import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Eye, EyeOff, LogIn, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [branch, setBranch] = useState('Chennai');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const success = await login(email, password, branch);
      if (success) {
        toast.success('Welcome back!', {
          description: `Logged in to ${branch} branch.`,
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

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 font-sans antialiased text-slate-900 relative overflow-hidden">
      {/* Background Image / Gradient */}
      <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />

      {/* Login Card */}
      <div className="w-full max-w-md relative z-10 animate-scale-in">
        <div className="bg-white border border-slate-100 rounded-[2.5rem] p-10 md:p-12 shadow-2xl shadow-slate-200/50">
          {/* Logo Section */}
          <div className="text-center mb-10">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-primary/10 flex items-center justify-center mb-6 shadow-sm border border-primary/5 p-4">
              <img src="/assets/favicon1.png" alt="IATT Logo" className="w-full h-full object-contain" />
            </div>
            <h1 className="text-3xl font-black text-primary tracking-tight leading-none uppercase">IATT INTRANET</h1>
            <p className="text-slate-400 font-bold text-xs tracking-[0.3em] uppercase mt-2 opacity-80">Portal</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-slate-400 text-[10px] font-black uppercase tracking-widest ml-1">Select Branch</label>
              <select
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                className="w-full px-6 py-4 rounded-2xl bg-white/50 border border-slate-100 text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all font-medium appearance-none"
                required
              >
                <option value="Chennai">Chennai</option>
                <option value="Bangalore">Bangalore</option>
                <option value="Hyderabad">Hyderabad</option>
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
              <a href="#" className="text-primary text-[10px] font-black uppercase tracking-widest hover:text-primary/80 transition-colors">
                Forgot?
              </a>
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

          <p className="text-center text-slate-300 font-black uppercase tracking-[0.3em] text-[10px] mt-8">
            © 2024 PM Systems
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
