import React, { useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { Mail, Lock, User, LayoutDashboard, ArrowRight, Eye, EyeOff, Sparkles, Shield, Zap, CheckCircle2, Check } from 'lucide-react';
import toast from 'react-hot-toast';

const FloatingCard: React.FC<{ delay: number; children: React.ReactNode; className?: string }> = ({ delay, children, className = '' }) => (
  <div
    className={`absolute bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-4 shadow-2xl animate-float ${className}`}
    style={{ animationDelay: `${delay}s` }}
  >
    {children}
  </div>
);

export const SignupForm: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const { signup, isLoading } = useAuthStore();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect');

  const passwordStrength = useMemo(() => {
    if (!password) return { score: 0, label: '', color: '' };
    let score = 0;
    if (password.length >= 6) score++;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    if (score <= 1) return { score: 1, label: 'Weak', color: 'bg-red-500' };
    if (score <= 2) return { score: 2, label: 'Fair', color: 'bg-orange-500' };
    if (score <= 3) return { score: 3, label: 'Good', color: 'bg-yellow-500' };
    if (score <= 4) return { score: 4, label: 'Strong', color: 'bg-green-500' };
    return { score: 5, label: 'Excellent', color: 'bg-emerald-500' };
  }, [password]);

  // Live avatar preview from name
  const avatarPreviewUrl = name.trim()
    ? `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name.trim())}`
    : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    try {
      await signup(name, email, password);
      toast.success('Account created successfully!');
    } catch (err: any) {
      toast.error(err.message || 'Signup failed');
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Animated Hero */}
      <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden">
        {/* Gradient Background — different angle from login */}
        <div className="absolute inset-0 bg-gradient-to-bl from-emerald-500 via-teal-600 to-indigo-700" />

        {/* Mesh */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-0 w-full h-full" style={{
            backgroundImage: `radial-gradient(circle at 70% 30%, rgba(255,255,255,0.15) 0%, transparent 50%),
                             radial-gradient(circle at 20% 70%, rgba(255,255,255,0.1) 0%, transparent 40%)`,
          }} />
        </div>

        {/* Grid */}
        <div className="absolute inset-0 opacity-[0.06]" style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)`,
          backgroundSize: '50px 50px',
        }} />

        {/* Floating Elements */}
        <FloatingCard delay={0} className="top-[12%] right-[10%]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-400/20 flex items-center justify-center">
              <Shield className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <p className="text-white text-sm font-semibold">Secure & Private</p>
              <p className="text-white/60 text-xs">End-to-end encrypted</p>
            </div>
          </div>
        </FloatingCard>

        <FloatingCard delay={1.2} className="top-[40%] left-[8%]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-400/20 flex items-center justify-center">
              <Zap className="w-5 h-5 text-cyan-300" />
            </div>
            <div>
              <p className="text-white text-sm font-semibold">Instant Setup</p>
              <p className="text-white/60 text-xs">Ready in 30 seconds</p>
            </div>
          </div>
        </FloatingCard>

        <FloatingCard delay={2} className="bottom-[22%] right-[15%]">
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Luna" className="w-8 h-8 rounded-full ring-2 ring-white/20" alt="" />
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" className="w-8 h-8 rounded-full ring-2 ring-white/20" alt="" />
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Aria" className="w-8 h-8 rounded-full ring-2 ring-white/20" alt="" />
            </div>
            <div>
              <p className="text-white text-sm font-semibold">Join 500+ Teams</p>
              <p className="text-white/60 text-xs">Growing every day</p>
            </div>
          </div>
        </FloatingCard>

        {/* Center Content */}
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-white/15 backdrop-blur-lg rounded-xl flex items-center justify-center border border-white/20 shadow-lg">
              <LayoutDashboard className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white tracking-tight">TaskFlow</span>
          </div>

          <div className="max-w-lg">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur-lg rounded-full text-xs text-white/90 font-medium mb-6 border border-white/15">
              <Sparkles className="w-3.5 h-3.5" />
              Free Forever for Small Teams
            </div>
            <h1 className="text-5xl font-extrabold text-white mb-5 leading-[1.15] tracking-tight">
              Start Building
              <br />
              <span className="bg-gradient-to-r from-yellow-200 via-emerald-200 to-cyan-200 text-transparent bg-clip-text">
                Something Great
              </span>
            </h1>
            <p className="text-white/70 text-lg leading-relaxed max-w-md">
              Create your account in seconds and start managing your projects
              with the most intuitive collaboration tool.
            </p>
          </div>

          {/* Benefits */}
          <div className="space-y-3">
            {['Unlimited boards & tasks', 'Real-time collaboration', 'No credit card required'].map((b, i) => (
              <div key={i} className="flex items-center gap-3 text-white/80">
                <div className="w-5 h-5 rounded-full bg-emerald-400/20 flex items-center justify-center flex-shrink-0">
                  <Check className="w-3 h-3 text-emerald-300" />
                </div>
                <span className="text-sm">{b}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-8 bg-gray-50 dark:bg-gray-950 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-teal-500/5 rounded-full blur-3xl" />

        <div className="relative w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-2.5 mb-10">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/25">
              <LayoutDashboard className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">TaskFlow</span>
          </div>

          {/* Header with live avatar preview */}
          <div className="mb-8 flex items-start gap-4">
            <div className="flex-1">
              <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2 tracking-tight">
                Create your account
              </h2>
              <p className="text-gray-500 dark:text-gray-400">Start collaborating with your team</p>
            </div>
            {avatarPreviewUrl && (
              <div className="flex-shrink-0 animate-fade-in">
                <img
                  src={avatarPreviewUrl}
                  alt="Your avatar"
                  className="w-14 h-14 rounded-full bg-gray-100 dark:bg-gray-800 ring-3 ring-primary-200 dark:ring-primary-800 shadow-lg"
                />
              </div>
            )}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className={`transition-all duration-300 ${focusedField === 'name' ? 'scale-[1.02]' : ''}`}>
              <Input
                label="Full Name"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onFocus={() => setFocusedField('name')}
                onBlur={() => setFocusedField(null)}
                icon={<User className="w-4 h-4" />}
                required
                minLength={2}
              />
            </div>

            <div className={`transition-all duration-300 ${focusedField === 'email' ? 'scale-[1.02]' : ''}`}>
              <Input
                label="Email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField(null)}
                icon={<Mail className="w-4 h-4" />}
                required
              />
            </div>

            <div className={`transition-all duration-300 ${focusedField === 'password' ? 'scale-[1.02]' : ''}`}>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  required
                  minLength={6}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 pl-10 pr-11 py-2.5 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {/* Password strength indicator */}
              {password && (
                <div className="mt-2 space-y-1.5">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                          i <= passwordStrength.score ? passwordStrength.color : 'bg-gray-200 dark:bg-gray-700'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-gray-400">{passwordStrength.label} password</p>
                </div>
              )}
            </div>

            <Button
              type="submit"
              className="w-full !py-3 !text-base bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all transform hover:scale-[1.02]"
              size="lg"
              isLoading={isLoading}
            >
              Create Account <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </form>

          {/* Trust badges */}
          <div className="mt-6 flex items-center justify-center gap-6 text-xs text-gray-400 dark:text-gray-500">
            <span className="flex items-center gap-1">
              <Shield className="w-3.5 h-3.5" /> Secure
            </span>
            <span className="flex items-center gap-1">
              <Zap className="w-3.5 h-3.5" /> Fast
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Free
            </span>
          </div>

          {/* Sign in link */}
          <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
            Already have an account?{' '}
            <Link
              to={redirect ? `/login?redirect=${encodeURIComponent(redirect)}` : '/login'}
              className="text-primary-600 dark:text-primary-400 font-semibold hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>

      {/* CSS Animation */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-12px) rotate(1deg); }
          66% { transform: translateY(6px) rotate(-1deg); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        @keyframes fade-in {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};
