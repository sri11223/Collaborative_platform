import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { Mail, Lock, LayoutDashboard, ArrowRight, Eye, EyeOff, Sparkles, CheckCircle2, Users, Zap } from 'lucide-react';
import toast from 'react-hot-toast';

const FloatingCard: React.FC<{ delay: number; children: React.ReactNode; className?: string }> = ({ delay, children, className = '' }) => (
  <div
    className={`absolute bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-4 shadow-2xl animate-float ${className}`}
    style={{ animationDelay: `${delay}s` }}
  >
    {children}
  </div>
);

export const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const { login, isLoading } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      toast.success('Welcome back!');
    } catch (err: any) {
      toast.error(err.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Animated Hero */}
      <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500" />

        {/* Animated Mesh */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-0 w-full h-full" style={{
            backgroundImage: `radial-gradient(circle at 20% 50%, rgba(255,255,255,0.15) 0%, transparent 50%),
                             radial-gradient(circle at 80% 20%, rgba(255,255,255,0.1) 0%, transparent 40%),
                             radial-gradient(circle at 40% 80%, rgba(255,255,255,0.1) 0%, transparent 45%)`,
          }} />
        </div>

        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-[0.06]" style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)`,
          backgroundSize: '50px 50px',
        }} />

        {/* Floating Elements */}
        <FloatingCard delay={0} className="top-[15%] left-[10%]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-400/20 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-green-300" />
            </div>
            <div>
              <p className="text-white text-sm font-semibold">Task Completed</p>
              <p className="text-white/60 text-xs">Design system updated</p>
            </div>
          </div>
        </FloatingCard>

        <FloatingCard delay={1} className="top-[32%] right-[8%]">
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah" className="w-8 h-8 rounded-full ring-2 ring-white/20" alt="" />
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Mike" className="w-8 h-8 rounded-full ring-2 ring-white/20" alt="" />
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Emily" className="w-8 h-8 rounded-full ring-2 ring-white/20" alt="" />
            </div>
            <div>
              <p className="text-white text-sm font-semibold">3 Online</p>
              <p className="text-white/60 text-xs">Collaborating now</p>
            </div>
          </div>
        </FloatingCard>

        <FloatingCard delay={2} className="bottom-[28%] left-[15%]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-yellow-400/20 flex items-center justify-center">
              <Zap className="w-5 h-5 text-yellow-300" />
            </div>
            <div>
              <p className="text-white text-sm font-semibold">Real-Time Sync</p>
              <p className="text-white/60 text-xs">Instant updates</p>
            </div>
          </div>
        </FloatingCard>

        <FloatingCard delay={1.5} className="bottom-[12%] right-[12%]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-400/20 flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-300" />
            </div>
            <div>
              <p className="text-white text-sm font-semibold">Team Board</p>
              <p className="text-white/60 text-xs">12 tasks this sprint</p>
            </div>
          </div>
        </FloatingCard>

        {/* Center Content */}
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-white/15 backdrop-blur-lg rounded-xl flex items-center justify-center border border-white/20 shadow-lg">
              <LayoutDashboard className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white tracking-tight">TaskFlow</span>
          </div>

          {/* Main Text */}
          <div className="max-w-lg">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur-lg rounded-full text-xs text-white/90 font-medium mb-6 border border-white/15">
              <Sparkles className="w-3.5 h-3.5" />
              Real-Time Collaboration
            </div>
            <h1 className="text-5xl font-extrabold text-white mb-5 leading-[1.15] tracking-tight">
              Where Teams
              <br />
              <span className="bg-gradient-to-r from-yellow-200 via-pink-200 to-cyan-200 text-transparent bg-clip-text">
                Get Things Done
              </span>
            </h1>
            <p className="text-white/70 text-lg leading-relaxed max-w-md">
              Manage projects with drag-and-drop boards, real-time collaboration,
              and powerful team workflows.
            </p>
          </div>

          {/* Bottom Stats */}
          <div className="flex items-center gap-8">
            {[
              { value: '10K+', label: 'Tasks Managed' },
              { value: '99.9%', label: 'Uptime' },
              { value: '<50ms', label: 'Sync Speed' },
            ].map((s, i) => (
              <div key={i}>
                <p className="text-2xl font-bold text-white">{s.value}</p>
                <p className="text-xs text-white/50 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-8 bg-gray-50 dark:bg-gray-950 relative overflow-hidden">
        {/* Subtle background decoration */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-purple-500/5 rounded-full blur-3xl" />

        <div className="relative w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-2.5 mb-10">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/25">
              <LayoutDashboard className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">TaskFlow</span>
          </div>

          {/* Header */}
          <div className="mb-8">
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2 tracking-tight">
              Welcome back
            </h2>
            <p className="text-gray-500 dark:text-gray-400">Sign in to your account to continue</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
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
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  required
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
            </div>

            <Button
              type="submit"
              className="w-full !py-3 !text-base bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-700 hover:to-indigo-700 shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 transition-all transform hover:scale-[1.02]"
              size="lg"
              isLoading={isLoading}
            >
              Sign In <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200 dark:border-gray-800" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3 text-gray-400 bg-gray-50 dark:bg-gray-950">
                or continue with demo
              </span>
            </div>
          </div>

          {/* Demo accounts */}
          <div className="space-y-3">
            {[
              { name: 'Sarah Johnson', email: 'sarah.johnson@taskflow.demo', seed: 'Sarah', role: 'Engineering Lead' },
              { name: 'Mike Chen', email: 'mike.chen@taskflow.demo', seed: 'Mike', role: 'Marketing & Freelance' },
              { name: 'Emily Rodriguez', email: 'emily.rodriguez@taskflow.demo', seed: 'Emily', role: 'Design & Creative' },
            ].map((demo) => (
              <button
                key={demo.email}
                type="button"
                onClick={() => {
                  setEmail(demo.email);
                  setPassword('Demo123!');
                }}
                className="w-full flex items-center gap-3 p-3.5 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-800 hover:border-primary-300 dark:hover:border-primary-700 bg-white dark:bg-gray-900 hover:bg-primary-50/50 dark:hover:bg-primary-900/10 transition-all group cursor-pointer"
              >
                <img
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${demo.seed}`}
                  alt={demo.name}
                  className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 ring-2 ring-gray-200 dark:ring-gray-700 group-hover:ring-primary-300 dark:group-hover:ring-primary-600 transition-all"
                />
                <div className="text-left flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 group-hover:text-primary-700 dark:group-hover:text-primary-300 transition-colors">
                    {demo.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {demo.role}
                  </p>
                </div>
                <div className="text-xs text-gray-400 group-hover:text-primary-500 transition-colors font-medium whitespace-nowrap">
                  Use →
                </div>
              </button>
            ))}
          </div>

          {/* Sign up link */}
          <p className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
            Don&apos;t have an account?{' '}
            <Link
              to="/signup"
              className="text-primary-600 dark:text-primary-400 font-semibold hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
            >
              Create one free
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
      `}</style>
    </div>
  );
};
