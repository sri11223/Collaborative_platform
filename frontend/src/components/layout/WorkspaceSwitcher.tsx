import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWorkspaceStore } from '../../store/workspaceStore';
import { useAuthStore } from '../../store/authStore';
import { Avatar } from '../common/Avatar';
import {
  ChevronDown, Plus, Settings, Users, Check, Pencil,
} from 'lucide-react';
import toast from 'react-hot-toast';

const WORKSPACE_COLORS = [
  '#6366f1', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
  '#ec4899', '#06b6d4', '#f97316',
];

export const WorkspaceSwitcher: React.FC = () => {
  const { workspaces, currentWorkspace, setCurrentWorkspace, createWorkspace, updateWorkspace, fetchWorkspaces } =
    useWorkspaceStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState('#6366f1');
  const [editingWsId, setEditingWsId] = useState<string | null>(null);
  const [editingWsName, setEditingWsName] = useState('');
  const editRef = useRef<HTMLInputElement>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setShowCreate(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    try {
      await createWorkspace({ name: newName.trim(), color: newColor });
      setNewName('');
      setShowCreate(false);
      setOpen(false);
    } catch {
      toast.error('Failed to create workspace');
    }
  };

  const startEditingWs = (wsId: string, wsName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingWsId(wsId);
    setEditingWsName(wsName);
    setTimeout(() => editRef.current?.focus(), 50);
  };

  const saveEditingWs = async () => {
    if (!editingWsId || !editingWsName.trim()) {
      setEditingWsId(null);
      return;
    }
    try {
      await updateWorkspace(editingWsId, { name: editingWsName.trim() });
      toast.success('Workspace renamed');
    } catch {
      toast.error('Failed to rename workspace');
    }
    setEditingWsId(null);
  };

  const handleWsEditKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') saveEditingWs();
    if (e.key === 'Escape') setEditingWsId(null);
  };

  const wsInitial = currentWorkspace?.name?.charAt(0)?.toUpperCase() || user?.name?.charAt(0)?.toUpperCase() || 'W';
  const wsColor = currentWorkspace?.color || '#6366f1';

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg hover:bg-white/10 transition-colors group"
      >
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
          style={{ backgroundColor: wsColor }}
        >
          {wsInitial}
        </div>
        <div className="flex-1 min-w-0 text-left">
          <div className="text-sm font-semibold text-gray-900 dark:text-white truncate">
            {currentWorkspace?.name || `${user?.name}'s Workspace`}
          </div>
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-full mt-1 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 py-2 z-50 min-w-[280px]">
          {/* Workspace list */}
          <div className="px-3 py-1.5">
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Workspaces</span>
          </div>
          <div className="max-h-48 overflow-y-auto">
            {workspaces.map((ws) => (
              editingWsId === ws.id ? (
                <div key={ws.id} className="flex items-center gap-2.5 px-3 py-2">
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                    style={{ backgroundColor: ws.color }}
                  >
                    {editingWsName.charAt(0).toUpperCase()}
                  </div>
                  <input
                    ref={editRef}
                    value={editingWsName}
                    onChange={(e) => setEditingWsName(e.target.value)}
                    onBlur={saveEditingWs}
                    onKeyDown={handleWsEditKeyDown}
                    className="flex-1 text-sm bg-white dark:bg-gray-700 border border-indigo-400 rounded px-2 py-1 text-gray-900 dark:text-white outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              ) : (
              <button
                key={ws.id}
                onClick={() => {
                  setCurrentWorkspace(ws);
                  setOpen(false);
                  navigate('/dashboard');
                }}
                className="flex items-center gap-2.5 px-3 py-2 w-full hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group"
              >
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                  style={{ backgroundColor: ws.color }}
                >
                  {ws.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 dark:text-white truncate">{ws.name}</div>
                  <div className="text-[10px] text-gray-400">{ws._count?.boards || 0} boards · {ws._count?.members || 0} members</div>
                </div>
                <button
                  onClick={(e) => startEditingWs(ws.id, ws.name, e)}
                  className="p-1 text-gray-300 opacity-0 group-hover:opacity-100 hover:text-indigo-500 transition-all rounded"
                  title="Rename workspace"
                >
                  <Pencil className="w-3 h-3" />
                </button>
                {currentWorkspace?.id === ws.id && (
                  <Check className="w-4 h-4 text-primary-500 flex-shrink-0" />
                )}
              </button>
              )
            ))}
          </div>

          {/* Divider */}
          <div className="border-t border-gray-100 dark:border-gray-700 my-1" />

          {/* Create new workspace */}
          {showCreate ? (
            <div className="px-3 py-2 space-y-2">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Workspace name..."
                className="w-full text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                autoFocus
                onKeyDown={(e) => { if (e.key === 'Enter') handleCreate(); }}
              />
              <div className="flex items-center gap-1.5">
                {WORKSPACE_COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setNewColor(c)}
                    className={`w-6 h-6 rounded-full border-2 transition-all ${newColor === c ? 'border-gray-800 dark:border-white scale-110' : 'border-transparent'}`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleCreate}
                  disabled={!newName.trim()}
                  className="flex-1 text-sm bg-primary-500 hover:bg-primary-600 disabled:opacity-40 text-white rounded-lg px-3 py-1.5 transition-colors"
                >
                  Create
                </button>
                <button
                  onClick={() => setShowCreate(false)}
                  className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 px-3 py-1.5"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 px-3 py-2 w-full text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create Workspace
            </button>
          )}
        </div>
      )}
    </div>
  );
};
