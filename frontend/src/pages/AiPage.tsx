import React, { useState, useEffect } from 'react';
import {
  Sparkles, Rocket, Bug, BarChart3, Calendar, Zap, ChevronRight,
  Loader2, CheckCircle2, AlertTriangle, Clock, Users, ArrowRight,
  Target, Brain, Wand2, ListChecks, TrendingUp, AlertCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useWorkspaceStore } from '../store/workspaceStore';
import { boardApi } from '../api/board.api';
import type { Board } from '../types';
import {
  aiApi,
  type WorkloadAnalysis,
  type StandupReport,
  type SprintPlan,
} from '../api/ai.api';

type AiTool =
  | 'project-generator'
  | 'bug-reporter'
  | 'task-breakdown'
  | 'workload'
  | 'standup'
  | 'sprint';

const TOOLS: {
  id: AiTool;
  icon: React.ElementType;
  title: string;
  description: string;
  color: string;
  tag: string;
}[] = [
  {
    id: 'project-generator',
    icon: Rocket,
    title: 'Project Generator',
    description: 'Describe your project and AI creates a full board with lists, tasks, labels, and due dates instantly.',
    color: 'from-indigo-500 to-purple-600',
    tag: 'Create',
  },
  {
    id: 'bug-reporter',
    icon: Bug,
    title: 'Smart Bug Reporter',
    description: 'Describe a bug in plain English. AI detects priority, creates a structured ticket, and assigns it.',
    color: 'from-red-500 to-pink-600',
    tag: 'Report',
  },
  {
    id: 'task-breakdown',
    icon: ListChecks,
    title: 'Task Breakdown',
    description: 'Give a big task and AI splits it into smaller, actionable subtasks with priorities and deadlines.',
    color: 'from-amber-500 to-orange-600',
    tag: 'Plan',
  },
  {
    id: 'workload',
    icon: BarChart3,
    title: 'Workload Analyzer',
    description: 'See who\'s overloaded, who\'s free, and get smart recommendations to balance the team.',
    color: 'from-emerald-500 to-teal-600',
    tag: 'Analyze',
  },
  {
    id: 'standup',
    icon: Calendar,
    title: 'Standup Generator',
    description: 'Auto-generate your daily standup from recent activity. No more scrambling before meetings.',
    color: 'from-blue-500 to-cyan-600',
    tag: 'Report',
  },
  {
    id: 'sprint',
    icon: Zap,
    title: 'Sprint Planner',
    description: 'AI analyzes your backlog, scores tasks, and suggests the optimal sprint plan for your team.',
    color: 'from-violet-500 to-fuchsia-600',
    tag: 'Plan',
  },
];

const AiPage: React.FC = () => {
  const [activeTool, setActiveTool] = useState<AiTool | null>(null);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-pink-500/10 dark:from-indigo-500/5 dark:via-purple-500/3 dark:to-pink-500/5" />
        <div className="relative max-w-7xl mx-auto px-6 py-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/25">
              <Brain className="w-6 h-6" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              AI Command Center
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mt-1">
            Automate project planning, analyze team performance, and generate reports — all powered by intelligent task analysis.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pb-12">
        {!activeTool ? (
          <ToolGrid onSelect={setActiveTool} />
        ) : (
          <div>
            <button
              onClick={() => setActiveTool(null)}
              className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 mb-6 transition-colors"
            >
              <ChevronRight className="w-4 h-4 rotate-180" /> Back to all tools
            </button>
            {activeTool === 'project-generator' && <ProjectGenerator navigate={navigate} />}
            {activeTool === 'bug-reporter' && <BugReporter navigate={navigate} />}
            {activeTool === 'task-breakdown' && <TaskBreakdown />}
            {activeTool === 'workload' && <WorkloadAnalyzer />}
            {activeTool === 'standup' && <StandupGenerator />}
            {activeTool === 'sprint' && <SprintPlanner />}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Tool Grid ──────────────────────────────────────────────────────

const ToolGrid: React.FC<{ onSelect: (tool: AiTool) => void }> = ({ onSelect }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
    {TOOLS.map((tool) => (
      <button
        key={tool.id}
        onClick={() => onSelect(tool.id)}
        className="group relative rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 text-left transition-all duration-200 hover:shadow-lg hover:border-indigo-300 dark:hover:border-indigo-600 hover:-translate-y-0.5"
      >
        <div className="flex items-start justify-between mb-4">
          <div className={`p-3 rounded-xl bg-gradient-to-br ${tool.color} text-white shadow-md`}>
            <tool.icon className="w-5 h-5" />
          </div>
          <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
            {tool.tag}
          </span>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
          {tool.title}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
          {tool.description}
        </p>
        <div className="mt-4 flex items-center gap-1 text-sm font-medium text-indigo-600 dark:text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity">
          Launch <ArrowRight className="w-4 h-4" />
        </div>
      </button>
    ))}
  </div>
);

// ─── Project Generator ──────────────────────────────────────────────

const ProjectGenerator: React.FC<{ navigate: ReturnType<typeof useNavigate> }> = ({ navigate }) => {
  const { workspaces, fetchWorkspaces } = useWorkspaceStore();
  const [selectedWorkspace, setSelectedWorkspace] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    fetchWorkspaces();
  }, [fetchWorkspaces]);

  useEffect(() => {
    if (workspaces.length > 0 && !selectedWorkspace) {
      setSelectedWorkspace(workspaces[0].id);
    }
  }, [workspaces, selectedWorkspace]);

  const handleGenerate = async () => {
    if (!description.trim() || !selectedWorkspace) return;
    setLoading(true);
    try {
      const { data } = await aiApi.generateProject(selectedWorkspace, description);
      setResult(data.data);
      toast.success('Project generated successfully!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Generation failed');
    } finally {
      setLoading(false);
    }
  };

  const suggestions = [
    'Build an e-commerce platform with product catalog and checkout',
    'Mobile fitness tracking app with social features',
    'Marketing campaign for Q2 product launch',
    'REST API backend for a SaaS dashboard',
    'Design system and component library for web app',
  ];

  return (
    <div className="max-w-3xl">
      <ToolHeader
        icon={Rocket}
        title="Project Generator"
        subtitle="Describe what you want to build and AI will scaffold a complete project board."
        gradient="from-indigo-500 to-purple-600"
      />

      {!result ? (
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Workspace</label>
            <select
              value={selectedWorkspace}
              onChange={(e) => setSelectedWorkspace(e.target.value)}
              className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              {workspaces.map((ws) => (
                <option key={ws.id} value={ws.id}>{ws.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Describe your project
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., Build a real-time chat application with user authentication, channels, and file sharing..."
              rows={4}
              className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
            />
          </div>

          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Try one of these:</p>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => setDescription(s)}
                  className="text-xs px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading || !description.trim()}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Generating project...
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4" /> Generate Project
              </>
            )}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
            <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-green-800 dark:text-green-300">
                Board "{result.title}" created with {result.lists?.length || 0} lists and{' '}
                {result.lists?.reduce((a: number, l: any) => a + (l.tasks?.length || 0), 0) || 0} tasks
              </p>
            </div>
          </div>

          {result.lists?.map((list: any) => (
            <div
              key={list.id}
              className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 bg-white dark:bg-gray-800"
            >
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                {list.title} ({list.tasks?.length || 0})
              </h4>
              <div className="space-y-1.5">
                {list.tasks?.map((task: any) => (
                  <div
                    key={task.id}
                    className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400"
                  >
                    <PriorityDot priority={task.priority} />
                    <span>{task.title}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => navigate(`/board/${result.id}`)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors"
            >
              Open Board <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => { setResult(null); setDescription(''); }}
              className="px-5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Generate Another
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Bug Reporter ───────────────────────────────────────────────────

const BugReporter: React.FC<{ navigate: ReturnType<typeof useNavigate> }> = ({ navigate }) => {
  const [boards, setBoards] = useState<Board[]>([]);
  const [selectedBoard, setSelectedBoard] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    boardApi.getBoards({ limit: 100 }).then(({ data }) => {
      setBoards(data.data.boards || []);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (boards.length > 0 && !selectedBoard) {
      setSelectedBoard(boards[0].id);
    }
  }, [boards, selectedBoard]);

  const handleReport = async () => {
    if (!description.trim() || !selectedBoard) return;
    setLoading(true);
    try {
      const { data } = await aiApi.createBugReport(selectedBoard, description);
      setResult(data.data);
      toast.success('Bug report created!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create bug report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl">
      <ToolHeader
        icon={Bug}
        title="Smart Bug Reporter"
        subtitle="Describe the bug and AI will create a structured, prioritized ticket."
        gradient="from-red-500 to-pink-600"
      />

      {!result ? (
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Target Board</label>
            <select
              value={selectedBoard}
              onChange={(e) => setSelectedBoard(e.target.value)}
              className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              {boards.map((b) => (
                <option key={b.id} value={b.id}>{b.title}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              What's the bug?
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., Login page crashes when user enters special characters in the email field. Getting a white screen after submit..."
              rows={4}
              className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
            />
          </div>

          <button
            onClick={handleReport}
            disabled={loading || !description.trim()}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-red-500 to-pink-600 text-white font-medium shadow-lg shadow-red-500/25 hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing bug...</>
            ) : (
              <><Bug className="w-4 h-4" /> Create Bug Report</>
            )}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="p-5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {result.task?.title}
              </h3>
              <PriorityBadge priority={result.detectedPriority} />
            </div>
            <div className="flex gap-4 text-sm text-gray-500 dark:text-gray-400">
              <span>List: <strong className="text-gray-700 dark:text-gray-300">{result.assignedToList}</strong></span>
              <span>Priority auto-detected: <strong className="text-gray-700 dark:text-gray-300">{result.detectedPriority}</strong></span>
            </div>
            {result.severity && (
              <span className="text-xs px-2.5 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 font-medium capitalize">
                Severity: {result.severity}
              </span>
            )}
            {result.task?.dueDate && (
              <p className="text-sm text-amber-600 dark:text-amber-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                Due: {new Date(result.task.dueDate).toLocaleDateString()}
              </p>
            )}
          </div>

          {/* Gemini AI Analysis */}
          {result.aiAnalysis && (
            <div className="p-5 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 space-y-3">
              <h4 className="text-sm font-semibold text-indigo-700 dark:text-indigo-300 flex items-center gap-2">
                <Brain className="w-4 h-4" /> Gemini AI Analysis
              </h4>
              {result.aiAnalysis.affectedArea && (
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Affected Area</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{result.aiAnalysis.affectedArea}</p>
                </div>
              )}
              {result.aiAnalysis.possibleCause && (
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Possible Cause</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{result.aiAnalysis.possibleCause}</p>
                </div>
              )}
              {result.aiAnalysis.suggestedFix && (
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Suggested Fix</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{result.aiAnalysis.suggestedFix}</p>
                </div>
              )}
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => navigate(`/board/${selectedBoard}`)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors"
            >
              View in Board <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => { setResult(null); setDescription(''); }}
              className="px-5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Report Another
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Task Breakdown ─────────────────────────────────────────────────

const TaskBreakdown: React.FC = () => {
  const [boards, setBoards] = useState<Board[]>([]);
  const [selectedBoard, setSelectedBoard] = useState('');
  const [selectedList, setSelectedList] = useState('');
  const [parentTitle, setParentTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [boardDetails, setBoardDetails] = useState<any>(null);

  useEffect(() => {
    boardApi.getBoards({ limit: 100 }).then(({ data }) => {
      setBoards(data.data.boards || []);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (boards.length > 0 && !selectedBoard) {
      setSelectedBoard(boards[0].id);
    }
  }, [boards, selectedBoard]);

  // Fetch board details when board changes to get lists
  useEffect(() => {
    if (!selectedBoard) return;
    const fetchDetails = async () => {
      try {
        const { data } = await (await import('../api/board.api')).boardApi.getBoard(selectedBoard);
        setBoardDetails(data.data);
        if (data.data.lists?.length > 0) {
          setSelectedList(data.data.lists[0].id);
        }
      } catch { /* ignore */ }
    };
    fetchDetails();
  }, [selectedBoard]);

  const handleBreakdown = async () => {
    if (!parentTitle.trim() || !description.trim() || !selectedBoard || !selectedList) return;
    setLoading(true);
    try {
      const { data } = await aiApi.breakdownTask(selectedBoard, selectedList, parentTitle, description);
      setResult(data.data);
      toast.success(`Created ${data.data.count} subtasks!`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Breakdown failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl">
      <ToolHeader
        icon={ListChecks}
        title="Task Breakdown"
        subtitle="Big task? Let AI split it into manageable pieces."
        gradient="from-amber-500 to-orange-600"
      />

      {!result ? (
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Board</label>
              <select
                value={selectedBoard}
                onChange={(e) => setSelectedBoard(e.target.value)}
                className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              >
                {boards.map((b) => (
                  <option key={b.id} value={b.id}>{b.title}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Target List</label>
              <select
                value={selectedList}
                onChange={(e) => setSelectedList(e.target.value)}
                className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              >
                {boardDetails?.lists?.map((l: any) => (
                  <option key={l.id} value={l.id}>{l.title}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Task Title</label>
            <input
              type="text"
              value={parentTitle}
              onChange={(e) => setParentTitle(e.target.value)}
              placeholder="e.g., Build user authentication system"
              className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Details / Sub-items (comma or newline separated)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={"e.g., Need to handle:\nSign up with email verification\nLogin with JWT tokens\nPassword reset flow\nOAuth with Google\nSession management"}
              rows={5}
              className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
            />
          </div>

          <button
            onClick={handleBreakdown}
            disabled={loading || !parentTitle.trim() || !description.trim()}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-medium shadow-lg shadow-amber-500/25 hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Breaking down...</>
            ) : (
              <><Zap className="w-4 h-4" /> Break It Down</>
            )}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
            <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
            <p className="text-sm font-medium text-green-800 dark:text-green-300">
              Created {result.count} subtasks for "{result.parentTitle}"
            </p>
          </div>

          {/* AI Plan Summary */}
          {result.aiPlan && (
            <div className="p-5 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 space-y-3">
              <h4 className="text-sm font-semibold text-indigo-700 dark:text-indigo-300 flex items-center gap-2">
                <Brain className="w-4 h-4" /> Gemini AI Plan
              </h4>
              {result.aiPlan.approach && (
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Recommended Approach</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{result.aiPlan.approach}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                {result.aiPlan.totalEstimatedHours && (
                  <div className="p-3 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Estimated Time</p>
                    <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400">{result.aiPlan.totalEstimatedHours}h</p>
                  </div>
                )}
                <div className="p-3 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Subtasks Created</p>
                  <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{result.count}</p>
                </div>
              </div>
              {result.aiPlan.dependencies && (
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Dependencies</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{result.aiPlan.dependencies}</p>
                </div>
              )}
              {result.aiPlan.risks && (
                <div>
                  <p className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Risks</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{result.aiPlan.risks}</p>
                </div>
              )}
            </div>
          )}

          <div className="space-y-2">
            {result.subtasks?.map((task: any, i: number) => (
              <div key={task.id} className="flex items-center gap-3 p-3 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <span className="text-xs font-mono text-gray-400 w-5">{i + 1}</span>
                <PriorityDot priority={task.priority} />
                <span className="text-sm text-gray-700 dark:text-gray-300 flex-1">{task.title}</span>
              </div>
            ))}
          </div>

          <button
            onClick={() => { setResult(null); setParentTitle(''); setDescription(''); }}
            className="px-5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Break Down Another
          </button>
        </div>
      )}
    </div>
  );
};

// ─── Workload Analyzer ──────────────────────────────────────────────

const WorkloadAnalyzer: React.FC = () => {
  const { workspaces, fetchWorkspaces } = useWorkspaceStore();
  const [selectedWorkspace, setSelectedWorkspace] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<WorkloadAnalysis | null>(null);

  useEffect(() => { fetchWorkspaces(); }, [fetchWorkspaces]);
  useEffect(() => {
    if (workspaces.length > 0 && !selectedWorkspace) setSelectedWorkspace(workspaces[0].id);
  }, [workspaces, selectedWorkspace]);

  const handleAnalyze = async () => {
    if (!selectedWorkspace) return;
    setLoading(true);
    try {
      const res = await aiApi.analyzeWorkload(selectedWorkspace);
      setData(res.data.data);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl">
      <ToolHeader
        icon={BarChart3}
        title="Workload Analyzer"
        subtitle="Understand team capacity and spot imbalances before they become problems."
        gradient="from-emerald-500 to-teal-600"
      />

      <div className="flex gap-3 mb-6">
        <select
          value={selectedWorkspace}
          onChange={(e) => { setSelectedWorkspace(e.target.value); setData(null); }}
          className="rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
        >
          {workspaces.map((ws) => (
            <option key={ws.id} value={ws.id}>{ws.name}</option>
          ))}
        </select>
        <button
          onClick={handleAnalyze}
          disabled={loading}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-sm font-medium shadow-md hover:shadow-lg transition-all disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <TrendingUp className="w-4 h-4" />}
          Analyze
        </button>
      </div>

      {data && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="Total Tasks" value={data.summary.totalTasks} icon={Target} />
            <StatCard label="Overdue" value={data.summary.overdueTasks} icon={AlertCircle} color="text-red-500" />
            <StatCard label="Due Soon" value={data.summary.dueSoonTasks} icon={Clock} color="text-amber-500" />
            <StatCard label="Unassigned" value={data.summary.unassignedTasks} icon={Users} color="text-blue-500" />
          </div>

          {/* Priority Distribution */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Priority Distribution</h3>
            <div className="flex gap-2 h-6 rounded-full overflow-hidden">
              {(['urgent', 'high', 'medium', 'low'] as const).map((p) => {
                const count = data.summary.priorityDistribution[p];
                const pct = data.summary.totalTasks > 0 ? (count / data.summary.totalTasks) * 100 : 0;
                if (pct === 0) return null;
                const colors = { urgent: 'bg-red-500', high: 'bg-orange-500', medium: 'bg-yellow-500', low: 'bg-green-500' };
                return (
                  <div
                    key={p}
                    className={`${colors[p]} flex items-center justify-center text-xs text-white font-medium`}
                    style={{ width: `${Math.max(pct, 8)}%` }}
                    title={`${p}: ${count}`}
                  >
                    {count}
                  </div>
                );
              })}
            </div>
            <div className="flex gap-4 mt-2">
              {(['urgent', 'high', 'medium', 'low'] as const).map((p) => {
                const colors = { urgent: 'text-red-500', high: 'text-orange-500', medium: 'text-yellow-600', low: 'text-green-500' };
                return (
                  <span key={p} className={`text-xs ${colors[p]} capitalize`}>{p}: {data.summary.priorityDistribution[p]}</span>
                );
              })}
            </div>
          </div>

          {/* Member Workloads */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Team Workload</h3>
            <div className="space-y-3">
              {data.memberWorkloads.map((m) => {
                const maxTasks = Math.max(...data.memberWorkloads.map((x) => x.totalTasks), 1);
                const pct = (m.totalTasks / maxTasks) * 100;
                return (
                  <div key={m.user.id} className="flex items-center gap-3">
                    <div className="w-32 text-sm text-gray-700 dark:text-gray-300 truncate font-medium">
                      {m.user.name}
                    </div>
                    <div className="flex-1 h-7 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden relative">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full transition-all duration-500 flex items-center justify-end px-2"
                        style={{ width: `${Math.max(pct, 5)}%` }}
                      >
                        <span className="text-xs text-white font-medium">{m.totalTasks}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 text-xs w-32 justify-end">
                      {m.overdue > 0 && (
                        <span className="text-red-500">{m.overdue} overdue</span>
                      )}
                      {m.highPriority > 0 && (
                        <span className="text-orange-500">{m.highPriority} high</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Insights */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">AI Insights</h3>
            <div className="space-y-2">
              {data.insights.map((insight, i) => (
                <p key={i} className="text-sm text-gray-600 dark:text-gray-400 py-1.5 border-b border-gray-100 dark:border-gray-700 last:border-0">
                  {insight}
                </p>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Standup Generator ──────────────────────────────────────────────

const StandupGenerator: React.FC = () => {
  const { workspaces, fetchWorkspaces } = useWorkspaceStore();
  const [selectedWorkspace, setSelectedWorkspace] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<StandupReport | null>(null);

  useEffect(() => { fetchWorkspaces(); }, [fetchWorkspaces]);
  useEffect(() => {
    if (workspaces.length > 0 && !selectedWorkspace) setSelectedWorkspace(workspaces[0].id);
  }, [workspaces, selectedWorkspace]);

  const handleGenerate = async () => {
    if (!selectedWorkspace) return;
    setLoading(true);
    try {
      const res = await aiApi.generateStandup(selectedWorkspace);
      setData(res.data.data);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Generation failed');
    } finally {
      setLoading(false);
    }
  };

  const copyStandup = () => {
    if (!data) return;
    let text = `📅 Standup — ${data.date} (${data.workspace})\n\n`;
    if (data.inProgress.length > 0) {
      text += `🔄 In Progress:\n${data.inProgress.map((t) => `  • ${t.title} (${t.board})`).join('\n')}\n\n`;
    }
    if (data.upcoming.length > 0) {
      text += `📋 Coming Up:\n${data.upcoming.map((t) => `  • ${t.title} — due ${t.dueDate ? new Date(t.dueDate).toLocaleDateString() : 'TBD'}`).join('\n')}\n\n`;
    }
    if (data.overdue.length > 0) {
      text += `⚠️ Overdue:\n${data.overdue.map((t) => `  • ${t.title} — was due ${t.dueDate ? new Date(t.dueDate).toLocaleDateString() : ''}`).join('\n')}\n\n`;
    }
    if (data.blockers.length > 0) {
      text += `🚧 Blockers:\n${data.blockers.map((b) => `  • ${b}`).join('\n')}\n`;
    }
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  return (
    <div className="max-w-3xl">
      <ToolHeader
        icon={Calendar}
        title="Standup Generator"
        subtitle="Instantly generate your daily standup report from actual work data."
        gradient="from-blue-500 to-cyan-600"
      />

      <div className="flex gap-3 mb-6">
        <select
          value={selectedWorkspace}
          onChange={(e) => { setSelectedWorkspace(e.target.value); setData(null); }}
          className="rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {workspaces.map((ws) => (
            <option key={ws.id} value={ws.id}>{ws.name}</option>
          ))}
        </select>
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-600 text-white text-sm font-medium shadow-md hover:shadow-lg transition-all disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          Generate
        </button>
      </div>

      {data && (
        <div className="space-y-5">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                📅 Standup — {data.date}
              </h3>
              <button
                onClick={copyStandup}
                className="text-xs px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-colors"
              >
                Copy to clipboard
              </button>
            </div>

            {data.inProgress.length > 0 && (
              <StandupSection
                title="🔄 In Progress"
                items={data.inProgress.map((t) => `${t.title} — ${t.board}`)}
              />
            )}

            {data.upcoming.length > 0 && (
              <StandupSection
                title="📋 Coming Up (next 3 days)"
                items={data.upcoming.map((t) =>
                  `${t.title} — due ${t.dueDate ? new Date(t.dueDate).toLocaleDateString() : 'TBD'}`
                )}
              />
            )}

            {data.overdue.length > 0 && (
              <StandupSection
                title="⚠️ Overdue"
                items={data.overdue.map((t) =>
                  `${t.title} — was due ${t.dueDate ? new Date(t.dueDate).toLocaleDateString() : ''}`
                )}
                alert
              />
            )}

            {data.blockers.length > 0 && (
              <StandupSection title="🚧 Blockers" items={data.blockers} alert />
            )}

            {data.recentActivity.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
                  👥 Team Activity (last 24h)
                </h4>
                {data.recentActivity.map((person, i) => (
                  <div key={i} className="mb-2">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{person.name}</p>
                    <ul className="ml-4 text-xs text-gray-500 dark:text-gray-400 space-y-0.5">
                      {person.actions.slice(0, 5).map((a, j) => (
                        <li key={j}>• {a}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}

            {data.inProgress.length === 0 && data.upcoming.length === 0 && data.overdue.length === 0 && (
              <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                No active tasks found. Start working on some tasks and they'll show up here!
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Sprint Planner ─────────────────────────────────────────────────

const SprintPlanner: React.FC = () => {
  const { workspaces, fetchWorkspaces } = useWorkspaceStore();
  const [selectedWorkspace, setSelectedWorkspace] = useState('');
  const [sprintDays, setSprintDays] = useState(14);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<SprintPlan | null>(null);

  useEffect(() => { fetchWorkspaces(); }, [fetchWorkspaces]);
  useEffect(() => {
    if (workspaces.length > 0 && !selectedWorkspace) setSelectedWorkspace(workspaces[0].id);
  }, [workspaces, selectedWorkspace]);

  const handlePlan = async () => {
    if (!selectedWorkspace) return;
    setLoading(true);
    try {
      const res = await aiApi.planSprint(selectedWorkspace, sprintDays);
      setData(res.data.data);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Planning failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl">
      <ToolHeader
        icon={Zap}
        title="Sprint Planner"
        subtitle="AI scores and ranks your backlog to suggest the optimal sprint for your team."
        gradient="from-violet-500 to-fuchsia-600"
      />

      <div className="flex gap-3 mb-6 flex-wrap">
        <select
          value={selectedWorkspace}
          onChange={(e) => { setSelectedWorkspace(e.target.value); setData(null); }}
          className="rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-violet-500 focus:border-transparent"
        >
          {workspaces.map((ws) => (
            <option key={ws.id} value={ws.id}>{ws.name}</option>
          ))}
        </select>
        <select
          value={sprintDays}
          onChange={(e) => setSprintDays(Number(e.target.value))}
          className="rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-violet-500 focus:border-transparent"
        >
          <option value={7}>1 week sprint</option>
          <option value={14}>2 week sprint</option>
          <option value={21}>3 week sprint</option>
        </select>
        <button
          onClick={handlePlan}
          disabled={loading}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-600 text-white text-sm font-medium shadow-md hover:shadow-lg transition-all disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
          Plan Sprint
        </button>
      </div>

      {data && (
        <div className="space-y-6">
          {/* Sprint Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="Duration" value={data.sprintDuration} icon={Calendar} isText />
            <StatCard label="Team Size" value={data.teamSize} icon={Users} />
            <StatCard label="Capacity" value={`${data.capacity} tasks`} icon={Target} isText />
            <StatCard label="Candidates" value={data.totalCandidates} icon={ListChecks} />
          </div>

          {/* Sprint Sections */}
          {data.plan.mustDo.length > 0 && (
            <SprintSection
              title="🔴 Must Do"
              subtitle="Critical items — overdue or high priority"
              tasks={data.plan.mustDo}
              color="border-red-300 dark:border-red-800"
              headerColor="text-red-700 dark:text-red-400"
            />
          )}

          {data.plan.shouldDo.length > 0 && (
            <SprintSection
              title="🟡 Should Do"
              subtitle="Important items that fit within capacity"
              tasks={data.plan.shouldDo}
              color="border-amber-300 dark:border-amber-800"
              headerColor="text-amber-700 dark:text-amber-400"
            />
          )}

          {data.plan.couldDo.length > 0 && (
            <SprintSection
              title="🟢 Could Do"
              subtitle="Stretch goals if the team has extra bandwidth"
              tasks={data.plan.couldDo}
              color="border-green-300 dark:border-green-800"
              headerColor="text-green-700 dark:text-green-400"
            />
          )}

          {/* Recommendations */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
              <Brain className="w-4 h-4 text-violet-500" /> AI Recommendations
            </h3>
            <div className="space-y-2">
              {data.recommendations.map((rec, i) => (
                <p key={i} className="text-sm text-gray-600 dark:text-gray-400 py-1.5 border-b border-gray-100 dark:border-gray-700 last:border-0">
                  {rec}
                </p>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Shared Components ──────────────────────────────────────────────

const ToolHeader: React.FC<{
  icon: React.ElementType;
  title: string;
  subtitle: string;
  gradient: string;
}> = ({ icon: Icon, title, subtitle, gradient }) => (
  <div className="flex items-start gap-4 mb-8">
    <div className={`p-3 rounded-xl bg-gradient-to-br ${gradient} text-white shadow-lg`}>
      <Icon className="w-6 h-6" />
    </div>
    <div>
      <h2 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{subtitle}</p>
    </div>
  </div>
);

const PriorityDot: React.FC<{ priority: string }> = ({ priority }) => {
  const colors: Record<string, string> = {
    urgent: 'bg-red-500',
    high: 'bg-orange-500',
    medium: 'bg-yellow-500',
    low: 'bg-green-500',
  };
  return <span className={`w-2 h-2 rounded-full flex-shrink-0 ${colors[priority] || 'bg-gray-400'}`} />;
};

const PriorityBadge: React.FC<{ priority: string }> = ({ priority }) => {
  const styles: Record<string, string> = {
    urgent: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    high: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    low: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  };
  return (
    <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${styles[priority] || ''}`}>
      {priority}
    </span>
  );
};

const StatCard: React.FC<{
  label: string;
  value: string | number;
  icon: React.ElementType;
  color?: string;
  isText?: boolean;
}> = ({ label, value, icon: Icon, color = 'text-gray-700 dark:text-gray-300', isText }) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
    <div className="flex items-center justify-between mb-1">
      <span className="text-xs text-gray-500 dark:text-gray-400">{label}</span>
      <Icon className={`w-4 h-4 ${color}`} />
    </div>
    <p className={`${isText ? 'text-lg' : 'text-2xl'} font-bold ${color}`}>{value}</p>
  </div>
);

const StandupSection: React.FC<{
  title: string;
  items: string[];
  alert?: boolean;
}> = ({ title, items, alert }) => (
  <div>
    <h4 className={`text-sm font-semibold mb-2 ${alert ? 'text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-gray-400'}`}>
      {title}
    </h4>
    <ul className="space-y-1.5 ml-1">
      {items.map((item, i) => (
        <li key={i} className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
          <span className="text-gray-400 mt-0.5">•</span>
          {item}
        </li>
      ))}
    </ul>
  </div>
);

const SprintSection: React.FC<{
  title: string;
  subtitle: string;
  tasks: { id: string; title: string; priority: string; score: number; board: string; assignees: string[]; dueDate: string | null }[];
  color: string;
  headerColor: string;
}> = ({ title, subtitle, tasks, color, headerColor }) => (
  <div className={`bg-white dark:bg-gray-800 rounded-xl border ${color} p-5`}>
    <div className="mb-4">
      <h3 className={`text-sm font-semibold ${headerColor}`}>{title}</h3>
      <p className="text-xs text-gray-500 dark:text-gray-400">{subtitle}</p>
    </div>
    <div className="space-y-2">
      {tasks.map((task) => (
        <div key={task.id} className="flex items-center gap-3 py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
          <PriorityDot priority={task.priority} />
          <div className="flex-1 min-w-0">
            <p className="text-sm text-gray-800 dark:text-gray-200 truncate">{task.title}</p>
            <p className="text-xs text-gray-400">{task.board} {task.assignees.length > 0 && `• ${task.assignees.join(', ')}`}</p>
          </div>
          <div className="flex items-center gap-2">
            {task.dueDate && (
              <span className="text-xs text-gray-400">{new Date(task.dueDate).toLocaleDateString()}</span>
            )}
            <span className="text-xs font-mono text-gray-400 bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded">
              {task.score}
            </span>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default AiPage;
