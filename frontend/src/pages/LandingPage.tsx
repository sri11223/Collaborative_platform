import React, { useEffect, useRef, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import {
  LayoutDashboard, ArrowRight, Zap, Shield, Users, Layers,
  CheckCircle2, Github, Star, Clock, Sparkles, Globe,
  ChevronRight, Play, Sun, Moon, GripVertical, MessageSquare,
  UserPlus, Bell, BarChart3, Lock, Smartphone, ArrowUpRight,
  Kanban, Check
} from 'lucide-react';

const LandingPage: React.FC = () => {
  const { isAuthenticated } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const [scrollY, setScrollY] = useState(0);
  const [activeFeature, setActiveFeature] = useState(0);
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set());
  const heroRef = useRef<HTMLDivElement>(null);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % 4);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Intersection Observer for scroll-reveal animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleSections((prev) => new Set(prev).add(entry.target.id));
          }
        });
      },
      { threshold: 0.15 }
    );
    document.querySelectorAll('[data-reveal]').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const features = [
    {
      icon: <Layers className="w-6 h-6" />,
      title: 'Kanban Boards',
      description: 'Organize tasks visually with drag-and-drop boards, lists, and cards — just like Trello.',
      color: 'from-blue-500 to-indigo-600',
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: 'Real-Time Sync',
      description: 'See changes instantly with WebSocket-powered live collaboration. No refresh needed.',
      color: 'from-amber-500 to-orange-600',
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: 'Team Collaboration',
      description: 'Invite members, assign tasks, and track who\'s working on what in real-time.',
      color: 'from-emerald-500 to-green-600',
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'Role-Based Access',
      description: 'Control permissions with owner, admin, member, and viewer roles per board.',
      color: 'from-purple-500 to-violet-600',
    },
  ];

  const stats = [
    { value: '99.9%', label: 'Uptime SLA' },
    { value: '<50ms', label: 'Real-time Sync' },
    { value: '∞', label: 'Boards & Tasks' },
    { value: 'Free', label: 'Getting Started' },
  ];

  const capabilities = [
    { icon: <GripVertical className="w-5 h-5" />, text: 'Drag & Drop Tasks' },
    { icon: <MessageSquare className="w-5 h-5" />, text: 'Task Comments' },
    { icon: <UserPlus className="w-5 h-5" />, text: 'Invite Members' },
    { icon: <Bell className="w-5 h-5" />, text: 'Activity Feed' },
    { icon: <BarChart3 className="w-5 h-5" />, text: 'Priority Levels' },
    { icon: <Lock className="w-5 h-5" />, text: 'Secure Auth (JWT)' },
    { icon: <Clock className="w-5 h-5" />, text: 'Due Date Tracking' },
    { icon: <Smartphone className="w-5 h-5" />, text: 'Responsive Design' },
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Product Manager',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
      text: 'TaskFlow transformed how our team manages sprints. The real-time sync is incredibly smooth.',
    },
    {
      name: 'Mike Chen',
      role: 'Tech Lead',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike',
      text: 'The drag-and-drop Kanban boards make it easy to visualize progress at a glance.',
    },
    {
      name: 'Emily Rodriguez',
      role: 'Designer',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emily',
      text: 'Clean, intuitive interface. I love how easy it is to organize tasks and collaborate with my team.',
    },
  ];

  const revealClass = (id: string) =>
    `transition-all duration-700 ${visibleSections.has(id) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`;

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 overflow-x-hidden transition-colors">
      {/* ===== Navbar ===== */}
      <nav className="fixed top-0 inset-x-0 z-50 transition-all duration-300"
        style={{
          backgroundColor: scrollY > 50 
            ? theme === 'dark' ? 'rgba(15,23,42,0.92)' : 'rgba(255,255,255,0.92)'
            : 'transparent',
          backdropFilter: scrollY > 50 ? 'blur(16px) saturate(180%)' : 'none',
          borderBottom: scrollY > 50 ? '1px solid' : 'none',
          borderColor: theme === 'dark' ? 'rgba(55,65,81,0.5)' : 'rgba(229,231,235,0.5)',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/25">
                <LayoutDashboard className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">
                Task<span className="text-primary-500">Flow</span>
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Features</a>
              <a href="#capabilities" className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Capabilities</a>
              <a href="#testimonials" className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Testimonials</a>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <Link
                to="/login"
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                className="px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-primary-600 to-primary-500 rounded-xl hover:from-primary-700 hover:to-primary-600 shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 transition-all transform hover:scale-105"
              >
                Get Started Free
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* ===== Hero Section with Enhanced Parallax ===== */}
      <section ref={heroRef} className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden">
        {/* Animated background orbs */}
        <div className="absolute inset-0 overflow-hidden">
          <div
            className="absolute -top-40 -right-40 w-[700px] h-[700px] rounded-full opacity-20 dark:opacity-10"
            style={{
              background: 'radial-gradient(circle, #6366f1 0%, transparent 70%)',
              transform: `translate(${scrollY * 0.06}px, ${scrollY * -0.1}px) rotate(${scrollY * 0.02}deg)`,
            }}
          />
          <div
            className="absolute -bottom-20 -left-40 w-[600px] h-[600px] rounded-full opacity-15 dark:opacity-10"
            style={{
              background: 'radial-gradient(circle, #8b5cf6 0%, transparent 70%)',
              transform: `translate(${scrollY * -0.04}px, ${scrollY * 0.06}px) rotate(${scrollY * -0.01}deg)`,
            }}
          />
          <div
            className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[900px] h-[900px] rounded-full opacity-5"
            style={{
              background: 'radial-gradient(circle, #06b6d4 0%, transparent 60%)',
              transform: `translate(-50%, 0%) scale(${1 + scrollY * 0.0003})`,
            }}
          />
          <div
            className="absolute top-20 left-20 w-[300px] h-[300px] rounded-full opacity-10 dark:opacity-5"
            style={{
              background: 'radial-gradient(circle, #ec4899 0%, transparent 70%)',
              transform: `translate(${scrollY * 0.08}px, ${scrollY * 0.03}px)`,
            }}
          />
          {/* Grid pattern with parallax */}
          <div
            className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
            style={{
              backgroundImage: `linear-gradient(rgba(99,102,241,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.3) 1px, transparent 1px)`,
              backgroundSize: '64px 64px',
              transform: `translateY(${scrollY * 0.12}px)`,
            }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div
              className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full text-sm font-medium mb-8 border border-primary-200 dark:border-primary-800"
              style={{
                opacity: Math.max(0, 1 - scrollY * 0.003),
                transform: `translateY(${scrollY * -0.08}px)`,
              }}
            >
              <Sparkles className="w-4 h-4 animate-pulse" />
              Real-Time Collaboration Platform
              <ArrowUpRight className="w-3.5 h-3.5" />
            </div>

            <h1
              className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6"
              style={{ transform: `translateY(${scrollY * -0.18}px)` }}
            >
              <span className="block">Manage Tasks</span>
              <span className="block bg-gradient-to-r from-primary-600 via-purple-500 to-pink-500 text-transparent bg-clip-text animate-gradient-x">
                Together, Seamlessly.
              </span>
            </h1>

            <p
              className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed"
              style={{ transform: `translateY(${scrollY * -0.12}px)` }}
            >
              The collaborative task management platform with real-time sync,
              drag-and-drop kanban boards, and seamless team workflows.
              Built for teams that move fast.
            </p>

            <div
              className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
              style={{ transform: `translateY(${scrollY * -0.06}px)` }}
            >
              <Link
                to="/signup"
                className="group flex items-center gap-2.5 px-8 py-4 text-base font-semibold text-white bg-gradient-to-r from-primary-600 to-primary-500 rounded-2xl shadow-xl shadow-primary-500/25 hover:shadow-primary-500/40 hover:from-primary-700 hover:to-primary-600 transition-all transform hover:scale-105"
              >
                Start for Free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/login"
                className="group flex items-center gap-2.5 px-8 py-4 text-base font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl hover:border-primary-300 dark:hover:border-primary-600 hover:shadow-lg transition-all"
              >
                <Play className="w-5 h-5 text-primary-600" />
                View Demo
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-2xl mx-auto mb-16">
              {stats.map((stat, i) => (
                <div
                  key={i}
                  className="text-center group"
                  style={{ transform: `translateY(${scrollY * -0.03 * (i + 1)}px)` }}
                >
                  <div className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Hero Image - Kanban Board Preview with deeper parallax */}
          <div
            className="relative max-w-5xl mx-auto"
            style={{ transform: `translateY(${scrollY * -0.06}px)` }}
          >
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl shadow-gray-200/50 dark:shadow-black/30 border border-gray-200 dark:border-gray-800 p-4 sm:p-6">
              {/* Browser frame */}
              <div className="flex items-center gap-2 mb-4 pb-4 border-b border-gray-100 dark:border-gray-800">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-amber-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                <div className="flex-1 mx-4">
                  <div className="bg-gray-100 dark:bg-gray-800 rounded-lg px-4 py-1.5 text-xs text-gray-400 dark:text-gray-500 text-center">
                    taskflow.app/board/product-launch
                  </div>
                </div>
              </div>

              {/* Kanban Columns */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* To Do */}
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">To Do <span className="text-gray-400 font-normal">3</span></h4>
                    <div className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600" />
                  </div>
                  {['Design landing page', 'Write API docs', 'Set up CI/CD pipeline'].map((t, i) => (
                    <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-3 mb-2 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow cursor-grab">
                      <div className="flex gap-1.5 mb-2">
                        <span className={`w-8 h-1.5 rounded-full ${i === 0 ? 'bg-blue-400' : i === 1 ? 'bg-purple-400' : 'bg-amber-400'}`} />
                      </div>
                      <p className="text-sm text-gray-800 dark:text-gray-200 font-medium">{t}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${i === 2 ? 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400' : 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'}`}>
                          {i === 2 ? 'Urgent' : 'Medium'}
                        </span>
                        <div className="w-5 h-5 rounded-full ring-2 ring-white dark:ring-gray-800 overflow-hidden">
                          <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${['Ella','Jack','Ruby'][i]}`} className="w-full h-full bg-gray-100" alt="" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* In Progress */}
                <div className="bg-blue-50/50 dark:bg-blue-900/10 rounded-xl p-3 ring-2 ring-blue-200/50 dark:ring-blue-900/30">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">In Progress <span className="text-gray-400 font-normal">2</span></h4>
                    <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                  </div>
                  {['Build auth system', 'Implement WebSocket'].map((t, i) => (
                    <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-3 mb-2 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
                      <div className="flex gap-1.5 mb-2">
                        <span className={`w-8 h-1.5 rounded-full ${i === 0 ? 'bg-green-400' : 'bg-indigo-400'}`} />
                      </div>
                      <p className="text-sm text-gray-800 dark:text-gray-200 font-medium">{t}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400 font-medium">High</span>
                        <div className="flex -space-x-1">
                          <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Alex" className="w-5 h-5 rounded-full ring-2 ring-white dark:ring-gray-800 bg-gray-100" alt="" />
                          <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Lisa" className="w-5 h-5 rounded-full ring-2 ring-white dark:ring-gray-800 bg-gray-100" alt="" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Done */}
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Done <span className="text-gray-400 font-normal">2</span></h4>
                    <div className="w-2 h-2 rounded-full bg-green-400" />
                  </div>
                  {['Project setup', 'Database schema'].map((t, i) => (
                    <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-3 mb-2 shadow-sm border border-gray-100 dark:border-gray-700 opacity-75">
                      <div className="flex gap-1.5 mb-2">
                        <span className="w-8 h-1.5 rounded-full bg-green-400" />
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 font-medium line-through">{t}</p>
                      <div className="flex items-center justify-between mt-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i === 0 ? 'Nolan' : 'Felix'}`} className="w-5 h-5 rounded-full ring-2 ring-white dark:ring-gray-800 bg-gray-100" alt="" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Floating elements with DiceBear avatars */}
            <div
              className="absolute -right-4 top-16 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-3 hidden lg:flex items-center gap-2"
              style={{
                transform: `translateY(${scrollY * 0.1}px)`,
                animation: 'float 6s ease-in-out infinite',
              }}
            >
              <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-900 dark:text-white">Task Completed</p>
                <p className="text-[10px] text-gray-400">Just now</p>
              </div>
            </div>

            <div
              className="absolute -left-4 bottom-20 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-3 hidden lg:flex items-center gap-2"
              style={{
                transform: `translateY(${scrollY * -0.08}px)`,
                animation: 'float 6s ease-in-out infinite 1s',
              }}
            >
              <div className="flex -space-x-1.5">
                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah" className="w-6 h-6 rounded-full ring-2 ring-white dark:ring-gray-800 bg-gray-100" alt="" />
                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Mike" className="w-6 h-6 rounded-full ring-2 ring-white dark:ring-gray-800 bg-gray-100" alt="" />
                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Emily" className="w-6 h-6 rounded-full ring-2 ring-white dark:ring-gray-800 bg-gray-100" alt="" />
              </div>
              <p className="text-xs font-medium text-gray-900 dark:text-white">3 online now</p>
            </div>

            <div
              className="absolute right-8 bottom-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-3 hidden lg:flex items-center gap-2"
              style={{
                transform: `translateY(${scrollY * 0.06}px)`,
                animation: 'float 6s ease-in-out infinite 2s',
              }}
            >
              <div className="w-8 h-8 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                <Zap className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-900 dark:text-white">Real-time sync</p>
                <p className="text-[10px] text-gray-400">Instant updates</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Features Section ===== */}
      <section id="features" className="py-24 bg-gray-50 dark:bg-gray-900/50 relative">
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 1px)`,
            backgroundSize: '32px 32px',
            transform: `translateY(${scrollY * 0.03}px)`,
          }}
        />
        <div id="sec-features" data-reveal className={`relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${revealClass('sec-features')}`}>
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Everything you need to
              <span className="bg-gradient-to-r from-primary-600 to-purple-500 text-transparent bg-clip-text"> ship faster</span>
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              A complete project management toolkit designed for modern development teams.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => (
              <div
                key={i}
                onClick={() => setActiveFeature(i)}
                className={`group relative rounded-2xl p-6 cursor-pointer transition-all duration-300 border ${
                  activeFeature === i
                    ? 'bg-white dark:bg-gray-800 border-primary-200 dark:border-primary-700 shadow-xl shadow-primary-100/50 dark:shadow-primary-900/20 scale-[1.02]'
                    : 'bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 hover:border-primary-200 dark:hover:border-primary-700 hover:shadow-lg'
                }`}
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center text-white mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">{feature.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{feature.description}</p>
                {activeFeature === i && (
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-gradient-to-r from-primary-500 to-purple-500 rounded-t-full" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Capabilities Grid ===== */}
      <section id="capabilities" className="py-24 relative">
        <div id="sec-cap" data-reveal className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${revealClass('sec-cap')}`}>
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Packed with 
              <span className="bg-gradient-to-r from-emerald-500 to-teal-500 text-transparent bg-clip-text"> powerful features</span>
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Every feature you'd expect from a world-class project management tool, and more.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {capabilities.map((cap, i) => (
              <div
                key={i}
                className="group flex items-center gap-4 p-5 rounded-xl bg-white dark:bg-gray-800/80 border border-gray-100 dark:border-gray-800 hover:border-primary-200 dark:hover:border-primary-700 hover:shadow-lg transition-all duration-300"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 flex items-center justify-center group-hover:bg-primary-100 dark:group-hover:bg-primary-900/50 group-hover:scale-110 transition-all">
                  {cap.icon}
                </div>
                <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{cap.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Tech Stack Section ===== */}
      <section className="py-24 bg-gray-50 dark:bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Built with
              <span className="bg-gradient-to-r from-orange-500 to-red-500 text-transparent bg-clip-text"> modern tech</span>
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Production-grade architecture using the best tools in the ecosystem.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { name: 'React 18', desc: 'UI Library', color: 'text-cyan-500' },
              { name: 'TypeScript', desc: 'Type Safety', color: 'text-blue-500' },
              { name: 'Node.js', desc: 'Runtime', color: 'text-green-500' },
              { name: 'Prisma', desc: 'ORM', color: 'text-indigo-500' },
              { name: 'Socket.io', desc: 'Real-time', color: 'text-gray-700 dark:text-gray-300' },
              { name: 'Tailwind', desc: 'Styling', color: 'text-teal-500' },
            ].map((tech, i) => (
              <div key={i} className="text-center p-6 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-800 hover:shadow-lg transition-all group">
                <div className={`text-2xl font-bold ${tech.color} mb-1 group-hover:scale-110 transition-transform inline-block`}>
                  {'</>'}
                </div>
                <div className="text-sm font-semibold text-gray-900 dark:text-white">{tech.name}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{tech.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Testimonials Section ===== */}
      <section id="testimonials" className="py-24 bg-gray-50 dark:bg-gray-900/50 relative overflow-hidden">
        {/* Subtle decorative orbs */}
        <div className="absolute top-20 left-10 w-64 h-64 bg-primary-200/20 dark:bg-primary-800/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-72 h-72 bg-purple-200/20 dark:bg-purple-800/10 rounded-full blur-3xl" />

        <div id="sec-testimonials" data-reveal className={`relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${revealClass('sec-testimonials')}`}>
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 text-sm font-medium rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 mb-4">
              <Star className="w-3.5 h-3.5" />
              Loved by Teams
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              What our users <span className="bg-gradient-to-r from-amber-500 to-orange-600 bg-clip-text text-transparent">say</span>
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              See how teams around the world are transforming their workflow with TaskFlow
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((t, i) => (
              <div
                key={i}
                className="relative bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100 dark:border-gray-700/50 group"
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                {/* Quote mark */}
                <div className="absolute -top-3 left-8 text-5xl font-serif text-primary-200 dark:text-primary-800 select-none">"</div>

                {/* Stars */}
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>

                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6 italic">
                  "{t.text}"
                </p>

                <div className="flex items-center gap-3 pt-4 border-t border-gray-100 dark:border-gray-700/50">
                  <img
                    src={t.avatar}
                    alt={t.name}
                    className="w-11 h-11 rounded-full bg-gray-100 dark:bg-gray-700 ring-2 ring-primary-100 dark:ring-primary-800 group-hover:ring-primary-300 dark:group-hover:ring-primary-600 transition-all"
                  />
                  <div>
                    <div className="font-semibold text-sm">{t.name}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA Section ===== */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-600 via-purple-600 to-pink-600" />
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `linear-gradient(rgba(255,255,255,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.2) 1px, transparent 1px)`,
              backgroundSize: '48px 48px',
              transform: `translateY(${scrollY * 0.15}px)`,
            }}
          />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-5xl font-bold text-white mb-6">
            Ready to transform how<br />your team works?
          </h2>
          <p className="text-lg text-white/80 max-w-xl mx-auto mb-10">
            Join TaskFlow today and experience seamless real-time collaboration. 
            Free forever for small teams.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/signup"
              className="group flex items-center gap-2 px-8 py-4 text-base font-semibold bg-white text-primary-700 rounded-2xl shadow-xl hover:shadow-2xl transition-all transform hover:scale-105"
            >
              Get Started — It's Free
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/login"
              className="flex items-center gap-2 px-8 py-4 text-base font-semibold text-white/90 border-2 border-white/30 rounded-2xl hover:bg-white/10 hover:border-white/50 transition-all"
            >
              Sign In with Demo
            </Link>
          </div>
          <p className="text-sm text-white/60 mt-6 flex items-center justify-center gap-2">
            <Lock className="w-3.5 h-3.5" />
            No credit card required · Free forever
          </p>
        </div>
      </section>

      {/* ===== Footer ===== */}
      <footer className="py-12 bg-gray-900 dark:bg-gray-950 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
                <LayoutDashboard className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold text-white">
                Task<span className="text-primary-400">Flow</span>
              </span>
            </div>

            <div className="flex items-center gap-6 text-sm text-gray-400">
              <span>Built with React, Node.js & Socket.io</span>
              <span>·</span>
              <a
                href="https://github.com/sri11223/Collaborative_platform"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 hover:text-white transition-colors"
              >
                <Github className="w-4 h-4" />
                GitHub
              </a>
            </div>

            <p className="text-sm text-gray-500">
              © {new Date().getFullYear()} TaskFlow. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* Global animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          33% { transform: translateY(-12px) rotate(1deg); }
          66% { transform: translateY(6px) rotate(-1deg); }
        }
        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 4s ease infinite;
        }
      `}</style>
    </div>
  );
};

export default LandingPage;
