import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { Avatar } from '../common/Avatar';
import { Button } from '../common/Button';
import {
  LayoutDashboard, Users, Briefcase, Target, BarChart3,
  MessageSquare, Calendar, Zap, FileText, GitBranch,
  Kanban, Clock, CheckCircle2, ArrowRight, ArrowLeft,
  Sparkles, Send, ChevronRight, Check,
  Trello, Github, Slack,
} from 'lucide-react';
import toast from 'react-hot-toast';

const ONBOARDING_KEY = 'taskflow_onboarding_complete';

// ==================== Step Components ====================

interface StepProps {
  onNext: () => void;
  onBack?: () => void;
  onSkip?: () => void;
}

// Step 1: Welcome & Role
const WelcomeStep: React.FC<StepProps & { userName: string }> = ({ onNext, userName }) => {
  const [role, setRole] = useState('');
  const roles = [
    { id: 'developer', label: 'Developer', icon: GitBranch, desc: 'Building software products' },
    { id: 'designer', label: 'Designer', icon: Target, desc: 'Designing user experiences' },
    { id: 'manager', label: 'Project Manager', icon: Briefcase, desc: 'Managing teams & projects' },
    { id: 'marketing', label: 'Marketing', icon: BarChart3, desc: 'Marketing & growth' },
    { id: 'student', label: 'Student', icon: FileText, desc: 'Learning & studying' },
    { id: 'other', label: 'Other', icon: Users, desc: 'Something else' },
  ];

  return (
    <div className="flex flex-col items-center">
      <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-primary-500/25">
        <Sparkles className="w-8 h-8 text-white" />
      </div>
      <h1 className="text-3xl font-bold text-white mb-2">
        Welcome, {userName}! 🎉
      </h1>
      <p className="text-gray-400 text-lg mb-10 text-center max-w-md">
        Let&apos;s personalize your experience. What best describes your role?
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full max-w-xl mb-8">
        {roles.map((r) => {
          const Icon = r.icon;
          const selected = role === r.id;
          return (
            <button
              key={r.id}
              onClick={() => setRole(r.id)}
              className={`flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 transition-all text-left ${
                selected
                  ? 'border-primary-500 bg-primary-500/10 shadow-lg shadow-primary-500/10'
                  : 'border-gray-700 hover:border-gray-500 bg-gray-800/50'
              }`}
            >
              <div className={`p-2 rounded-lg ${selected ? 'bg-primary-500/20' : 'bg-gray-700'}`}>
                <Icon className={`w-5 h-5 ${selected ? 'text-primary-400' : 'text-gray-400'}`} />
              </div>
              <div>
                <p className={`text-sm font-medium ${selected ? 'text-white' : 'text-gray-300'}`}>{r.label}</p>
                <p className="text-xs text-gray-500">{r.desc}</p>
              </div>
              {selected && (
                <div className="ml-auto">
                  <CheckCircle2 className="w-5 h-5 text-primary-400" />
                </div>
              )}
            </button>
          );
        })}
      </div>
      <Button onClick={onNext} size="lg" className="px-10" disabled={!role}>
        Continue <ArrowRight className="w-4 h-4 ml-2" />
      </Button>
    </div>
  );
};

// Step 2: Features interest
const FeaturesStep: React.FC<StepProps> = ({ onNext, onBack }) => {
  const [selected, setSelected] = useState<string[]>([]);

  const features = [
    { id: 'boards', label: 'Boards & Kanban', icon: Kanban },
    { id: 'tasks', label: 'Task Management', icon: CheckCircle2 },
    { id: 'collaboration', label: 'Team Collaboration', icon: Users },
    { id: 'chat', label: 'Chat & Messages', icon: MessageSquare },
    { id: 'scheduling', label: 'Scheduling', icon: Calendar },
    { id: 'automation', label: 'Automation', icon: Zap },
    { id: 'tracking', label: 'Time Tracking', icon: Clock },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'docs', label: 'Docs & Notes', icon: FileText },
  ];

  const toggle = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  return (
    <div className="flex flex-col items-center">
      <h1 className="text-3xl font-bold text-white mb-2">
        Which features interest you?
      </h1>
      <p className="text-gray-400 text-lg mb-10 text-center max-w-md">
        Select all that apply. Don&apos;t worry, you&apos;ll have access to everything.
      </p>
      <div className="grid grid-cols-3 gap-3 w-full max-w-2xl mb-8">
        {features.map((f) => {
          const Icon = f.icon;
          const isSelected = selected.includes(f.id);
          return (
            <button
              key={f.id}
              onClick={() => toggle(f.id)}
              className={`flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 transition-all ${
                isSelected
                  ? 'border-primary-500 bg-primary-500/10'
                  : 'border-gray-700 hover:border-gray-500 bg-gray-800/50'
              }`}
            >
              <Icon className={`w-5 h-5 flex-shrink-0 ${isSelected ? 'text-primary-400' : 'text-gray-400'}`} />
              <span className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-gray-300'}`}>{f.label}</span>
              {isSelected && (
                <CheckCircle2 className="w-4 h-4 text-primary-400 ml-auto flex-shrink-0" />
              )}
            </button>
          );
        })}
      </div>
      <div className="flex gap-3">
        <Button onClick={onBack} variant="ghost" className="text-gray-400 hover:text-white">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
        <Button onClick={onNext} size="lg" className="px-10">
          Next <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};

// Step 3: Invite team
const InviteStep: React.FC<StepProps> = ({ onNext, onBack }) => {
  const [emails, setEmails] = useState('');

  return (
    <div className="flex flex-col items-center">
      <h1 className="text-3xl font-bold text-white mb-2">
        Invite people to your Workspace
      </h1>
      <p className="text-gray-400 text-lg mb-10 text-center max-w-md">
        Collaboration is better together. Invite your teammates to join.
      </p>
      <div className="w-full max-w-lg mb-6">
        <div className="relative">
          <input
            type="text"
            value={emails}
            onChange={(e) => setEmails(e.target.value)}
            placeholder="Enter email addresses (or paste multiple)"
            className="w-full px-5 py-4 bg-gray-800/50 border-2 border-gray-700 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 text-sm"
          />
          <button className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-primary-400 transition-colors">
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
      <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-5 py-3 mb-10 w-full max-w-lg">
        <p className="text-emerald-400 text-sm flex items-center gap-2">
          <Sparkles className="w-4 h-4 flex-shrink-0" />
          Don&apos;t do it alone - Invite your team to <strong>get started 200% faster.</strong>
        </p>
      </div>
      <div className="flex gap-3">
        <Button onClick={onBack} variant="ghost" className="text-gray-400 hover:text-white">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
        <Button onClick={onNext} size="lg" className="px-10">
          {emails.trim() ? 'Send & Continue' : 'Skip for now'} <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};

// Step 4: Workspace Name
const WorkspaceStep: React.FC<StepProps & { userName: string; onFinish: (name: string) => Promise<void> | void }> = ({
  onBack,
  userName,
  onFinish,
}) => {
  const [workspaceName, setWorkspaceName] = useState(`${userName}'s Workspace`);
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    if (!workspaceName.trim() || creating) return;
    setCreating(true);
    try {
      await onFinish(workspaceName);
    } catch {
      setCreating(false);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <h1 className="text-3xl font-bold text-white mb-2">
        Lastly, what would you like to name your Workspace?
      </h1>
      <p className="text-gray-400 text-lg mb-10 text-center max-w-md">
        Try the name of your company or organization.
      </p>
      <div className="w-full max-w-lg mb-10">
        <input
          type="text"
          value={workspaceName}
          onChange={(e) => setWorkspaceName(e.target.value)}
          placeholder="My Workspace"
          className="w-full px-5 py-4 bg-gray-800/50 border-2 border-gray-700 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 text-lg font-medium"
          autoFocus
        />
      </div>
      <div className="flex gap-3">
        <Button onClick={onBack} variant="ghost" className="text-gray-400 hover:text-white">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
        <Button
          onClick={handleCreate}
          size="lg"
          className="px-10"
          disabled={!workspaceName.trim() || creating}
        >
          {creating ? 'Creating...' : 'Finish'} <Check className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};

// Step 5: Personalizing loading
const PersonalizingStep: React.FC<{ onDone: () => void }> = ({ onDone }) => {
  const [progress, setProgress] = useState(0);
  const messages = [
    'Setting up your workspace...',
    'Personalizing your experience...',
    'Configuring your boards...',
    'Almost ready...',
  ];
  const msgIndex = Math.min(Math.floor(progress / 25), messages.length - 1);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(onDone, 500);
          return 100;
        }
        return prev + 2;
      });
    }, 60);
    return () => clearInterval(interval);
  }, [onDone]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh]">
      <div className="relative w-20 h-20 mb-8">
        {/* ClickUp-style rotating diamond */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-12 h-12 animate-spin" style={{ animationDuration: '3s' }}>
            <svg viewBox="0 0 48 48" fill="none">
              <path d="M24 4L44 24L24 44L4 24Z" fill="url(#grad)" />
              <defs>
                <linearGradient id="grad" x1="4" y1="4" x2="44" y2="44">
                  <stop offset="0%" stopColor="#f43f5e" />
                  <stop offset="50%" stopColor="#8b5cf6" />
                  <stop offset="100%" stopColor="#3b82f6" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>
      </div>
      <p className="text-lg text-gray-300 mb-6 transition-all duration-500">
        <span className="text-white font-medium">Personalizing</span> your{' '}
        <span className="text-gray-500">experience...</span>
      </p>
      <div className="w-64 h-1 bg-gray-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-rose-500 via-purple-500 to-blue-500 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-xs text-gray-500 mt-4">{messages[msgIndex]}</p>
    </div>
  );
};

// ==================== Main Onboarding Flow ====================

interface OnboardingFlowProps {
  onComplete: () => void;
}

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const { user } = useAuthStore();
  const userName = user?.name?.split(' ')[0] || 'there';
  const totalSteps = 5;

  const handleFinish = async (workspaceName: string) => {
    // Actually create the workspace via API
    try {
      const { workspaceApi } = await import('../../api/workspace.api');
      await workspaceApi.createWorkspace({ name: workspaceName });
    } catch (err) {
      console.error('Failed to create workspace during onboarding:', err);
    }
    setStep(4); // Go to personalizing step
  };

  const handleDone = async () => {
    // If user skipped and no workspace was created yet, create a default one
    try {
      const { workspaceApi } = await import('../../api/workspace.api');
      const { data } = await workspaceApi.getWorkspaces();
      if (!data.data || data.data.length === 0) {
        await workspaceApi.createWorkspace({ name: `${userName}'s Workspace` });
      }
    } catch {
      // Non-critical, continue
    }
    localStorage.setItem(ONBOARDING_KEY, 'true');
    onComplete();
  };

  return (
    <div className="fixed inset-0 z-[100] bg-gray-950 flex flex-col">
      {/* Top gradient bar */}
      <div className="h-1 bg-gradient-to-r from-rose-500 via-purple-500 via-blue-500 to-emerald-500" />

      {/* Header */}
      {step < 4 && (
        <div className="flex items-center justify-between px-8 py-5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-purple-600 rounded-lg flex items-center justify-center">
              <LayoutDashboard className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-white">TaskFlow</span>
          </div>
          {step < 3 && (
            <button
              onClick={handleDone}
              className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
            >
              Skip setup
            </button>
          )}
        </div>
      )}

      {/* Progress dots */}
      {step < 4 && (
        <div className="flex items-center justify-center gap-2 py-4">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                i === step
                  ? 'w-8 bg-primary-500'
                  : i < step
                  ? 'w-4 bg-primary-500/50'
                  : 'w-4 bg-gray-700'
              }`}
            />
          ))}
        </div>
      )}

      {/* Step content */}
      <div className="flex-1 flex items-center justify-center px-6 overflow-y-auto">
        {step === 0 && (
          <WelcomeStep userName={userName} onNext={() => setStep(1)} />
        )}
        {step === 1 && (
          <FeaturesStep onNext={() => setStep(2)} onBack={() => setStep(0)} />
        )}
        {step === 2 && (
          <InviteStep onNext={() => setStep(3)} onBack={() => setStep(1)} />
        )}
        {step === 3 && (
          <WorkspaceStep
            userName={userName}
            onBack={() => setStep(2)}
            onFinish={handleFinish}
            onNext={() => {}}
          />
        )}
        {step === 4 && <PersonalizingStep onDone={handleDone} />}
      </div>

      {/* Bottom hint */}
      {step < 4 && (
        <div className="py-4 text-center">
          <p className="text-xs text-gray-600">
            Step {step + 1} of 4
          </p>
        </div>
      )}
    </div>
  );
};

export const isOnboardingComplete = (): boolean => {
  return localStorage.getItem(ONBOARDING_KEY) === 'true';
};

export const resetOnboarding = () => {
  localStorage.removeItem(ONBOARDING_KEY);
};
