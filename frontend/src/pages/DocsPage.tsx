import React, { useEffect, useState } from 'react';
import { useWorkspaceStore } from '../store/workspaceStore';
import { documentApi } from '../api/notification.api';
import { useAuthStore } from '../store/authStore';
import { RichTextEditor, RichTextDisplay } from '../components/common/RichTextEditor';
import { Avatar } from '../components/common/Avatar';
import { Spinner } from '../components/common/Spinner';
import {
  FileText, Plus, Trash2, Edit3, Save, X, Search, Clock,
  ChevronRight, File, FolderOpen, Share2, Download, Copy, Link2, Check,
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Document {
  id: string;
  title: string;
  content: string;
  workspaceId: string;
  createdBy: string;
  creator?: { id: string; name: string; email: string; avatar: string | null };
  createdAt: string;
  updatedAt: string;
}

const DocsPage: React.FC = () => {
  const { user } = useAuthStore();
  const { currentWorkspace } = useWorkspaceStore();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  useEffect(() => {
    if (currentWorkspace) {
      loadDocuments();
    }
  }, [currentWorkspace?.id]);

  const loadDocuments = async () => {
    if (!currentWorkspace) return;
    setLoading(true);
    try {
      const { data } = await documentApi.getDocuments(currentWorkspace.id);
      setDocuments(data.data || []);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!currentWorkspace || !newTitle.trim()) return;
    try {
      const { data } = await documentApi.createDocument(currentWorkspace.id, {
        title: newTitle.trim(),
        content: '',
      });
      setDocuments([data.data, ...documents]);
      setSelectedDoc(data.data);
      setIsEditing(true);
      setEditTitle(data.data.title);
      setEditContent(data.data.content);
      setNewTitle('');
      setShowCreateForm(false);
      toast.success('Document created!');
    } catch {
      toast.error('Failed to create document');
    }
  };

  const handleSave = async () => {
    if (!selectedDoc) return;
    try {
      const { data } = await documentApi.updateDocument(selectedDoc.id, {
        title: editTitle.trim() || selectedDoc.title,
        content: editContent,
      });
      const updated = data.data;
      setDocuments(documents.map((d) => d.id === updated.id ? updated : d));
      setSelectedDoc(updated);
      setIsEditing(false);
      toast.success('Document saved!');
    } catch {
      toast.error('Failed to save document');
    }
  };

  const handleDelete = async (docId: string) => {
    try {
      await documentApi.deleteDocument(docId);
      setDocuments(documents.filter((d) => d.id !== docId));
      if (selectedDoc?.id === docId) {
        setSelectedDoc(null);
        setIsEditing(false);
      }
      toast.success('Document deleted');
    } catch {
      toast.error('Failed to delete document');
    }
  };

  const filteredDocs = documents.filter((d) =>
    !searchQuery || d.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days}d ago`;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (!currentWorkspace) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center py-20">
        <FileText className="w-12 h-12 text-gray-400 mb-4" />
        <p className="text-gray-500 dark:text-gray-400">Select a workspace to view documents</p>
      </div>
    );
  }

  return (
    <div className="h-full flex">
      {/* Document list sidebar */}
      <div className="w-72 border-r border-gray-200 dark:border-gray-800 flex flex-col bg-white dark:bg-gray-900 flex-shrink-0">
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary-500" />
              Docs
            </h1>
            <button
              onClick={() => setShowCreateForm(true)}
              className="p-1.5 text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
              title="New document"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search docs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-gray-100 dark:bg-gray-800 border-0 rounded-lg text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        {/* Create form */}
        {showCreateForm && (
          <div className="p-3 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
            <input
              type="text"
              placeholder="Document title..."
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              autoFocus
              className="w-full px-3 py-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 mb-2"
            />
            <div className="flex gap-1">
              <button onClick={handleCreate} className="flex-1 px-2 py-1 text-xs bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors">
                Create
              </button>
              <button onClick={() => { setShowCreateForm(false); setNewTitle(''); }} className="px-2 py-1 text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Document list */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Spinner size="sm" />
            </div>
          ) : filteredDocs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center px-4">
              <FolderOpen className="w-8 h-8 text-gray-300 dark:text-gray-600 mb-2" />
              <p className="text-xs text-gray-400 dark:text-gray-500">
                {searchQuery ? 'No docs found' : 'No documents yet'}
              </p>
              {!searchQuery && (
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="mt-2 text-xs text-primary-500 hover:underline"
                >
                  Create your first doc
                </button>
              )}
            </div>
          ) : (
            <div className="py-1">
              {filteredDocs.map((doc) => (
                <button
                  key={doc.id}
                  onClick={() => { setSelectedDoc(doc); setIsEditing(false); }}
                  className={`flex items-center gap-2 w-full text-left px-4 py-2.5 transition-colors group ${
                    selectedDoc?.id === doc.id
                      ? 'bg-primary-50 dark:bg-primary-900/20 border-r-2 border-primary-500'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  <File className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm truncate ${
                      selectedDoc?.id === doc.id
                        ? 'text-primary-700 dark:text-primary-300 font-medium'
                        : 'text-gray-700 dark:text-gray-300'
                    }`}>
                      {doc.title}
                    </p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3 text-gray-400" />
                      <span className="text-[10px] text-gray-400">{formatDate(doc.updatedAt)}</span>
                    </div>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(doc.id); }}
                    className="p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all rounded"
                    title="Delete"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Document editor/viewer */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {selectedDoc ? (
          <>
            {/* Doc header */}
            <div className="px-6 py-3 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
              <div className="flex-1 min-w-0">
                {isEditing ? (
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="text-lg font-bold text-gray-900 dark:text-white bg-transparent border-0 border-b-2 border-primary-500 focus:outline-none w-full"
                  />
                ) : (
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white truncate">{selectedDoc.title}</h2>
                )}
                <div className="flex items-center gap-2 mt-1">
                  {selectedDoc.creator && (
                    <div className="flex items-center gap-1">
                      <Avatar name={selectedDoc.creator.name} size="xs" avatar={selectedDoc.creator.avatar} />
                      <span className="text-xs text-gray-400">{selectedDoc.creator.name}</span>
                    </div>
                  )}
                  <span className="text-xs text-gray-400">
                    Updated {formatDate(selectedDoc.updatedAt)}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 ml-4">
                {isEditing ? (
                  <>
                    <button
                      onClick={handleSave}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
                    >
                      <Save className="w-3.5 h-3.5" />
                      Save
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => { setIsEditing(true); setEditTitle(selectedDoc.title); setEditContent(selectedDoc.content); }}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      Edit
                    </button>

                    {/* Share button */}
                    <div className="relative">
                      <button
                        onClick={() => { setShowShareMenu(!showShareMenu); setShowExportMenu(false); }}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                        Share
                      </button>
                      {showShareMenu && (
                        <>
                          <div className="fixed inset-0 z-30" onClick={() => setShowShareMenu(false)} />
                          <div className="absolute right-0 top-full mt-1 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 py-2 z-40">
                            <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700">
                              <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">Share Document</p>
                            </div>
                            <button
                              onClick={() => {
                                const shareUrl = `${window.location.origin}/docs?id=${selectedDoc.id}`;
                                navigator.clipboard.writeText(shareUrl);
                                setLinkCopied(true);
                                toast.success('Link copied to clipboard!');
                                setTimeout(() => setLinkCopied(false), 2000);
                              }}
                              className="flex items-center gap-2 px-4 py-2.5 w-full text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                            >
                              {linkCopied ? <Check className="w-4 h-4 text-green-500" /> : <Link2 className="w-4 h-4" />}
                              {linkCopied ? 'Link Copied!' : 'Copy Link'}
                            </button>
                            <button
                              onClick={() => {
                                const text = `${selectedDoc.title}\n\n${selectedDoc.content.replace(/<[^>]+>/g, '')}`;
                                navigator.clipboard.writeText(text);
                                toast.success('Content copied!');
                                setShowShareMenu(false);
                              }}
                              className="flex items-center gap-2 px-4 py-2.5 w-full text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                            >
                              <Copy className="w-4 h-4" />
                              Copy as Text
                            </button>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Export button */}
                    <div className="relative">
                      <button
                        onClick={() => { setShowExportMenu(!showExportMenu); setShowShareMenu(false); }}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Export
                      </button>
                      {showExportMenu && (
                        <>
                          <div className="fixed inset-0 z-30" onClick={() => setShowExportMenu(false)} />
                          <div className="absolute right-0 top-full mt-1 w-52 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 py-2 z-40">
                            <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700">
                              <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">Export As</p>
                            </div>
                            <button
                              onClick={() => {
                                const htmlContent = `<!DOCTYPE html><html><head><title>${selectedDoc.title}</title><style>body{font-family:system-ui,-apple-system,sans-serif;max-width:800px;margin:40px auto;padding:0 20px;color:#333;line-height:1.6;}</style></head><body><h1>${selectedDoc.title}</h1>${selectedDoc.content}</body></html>`;
                                const blob = new Blob([htmlContent], { type: 'text/html' });
                                const url = URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = `${selectedDoc.title}.html`;
                                a.click();
                                URL.revokeObjectURL(url);
                                toast.success('Exported as HTML');
                                setShowExportMenu(false);
                              }}
                              className="flex items-center gap-2 px-4 py-2.5 w-full text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                            >
                              <FileText className="w-4 h-4" />
                              HTML File
                            </button>
                            <button
                              onClick={() => {
                                const textContent = `${selectedDoc.title}\n${'='.repeat(selectedDoc.title.length)}\n\n${selectedDoc.content.replace(/<[^>]+>/g, '')}`;
                                const blob = new Blob([textContent], { type: 'text/plain' });
                                const url = URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = `${selectedDoc.title}.txt`;
                                a.click();
                                URL.revokeObjectURL(url);
                                toast.success('Exported as Text');
                                setShowExportMenu(false);
                              }}
                              className="flex items-center gap-2 px-4 py-2.5 w-full text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                            >
                              <File className="w-4 h-4" />
                              Plain Text
                            </button>
                            <button
                              onClick={() => {
                                // Convert HTML to markdown-like format
                                let md = selectedDoc.content
                                  .replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n\n')
                                  .replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n\n')
                                  .replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n\n')
                                  .replace(/<strong>(.*?)<\/strong>/gi, '**$1**')
                                  .replace(/<b>(.*?)<\/b>/gi, '**$1**')
                                  .replace(/<em>(.*?)<\/em>/gi, '*$1*')
                                  .replace(/<i>(.*?)<\/i>/gi, '*$1*')
                                  .replace(/<li>(.*?)<\/li>/gi, '- $1\n')
                                  .replace(/<br\s*\/?>/gi, '\n')
                                  .replace(/<p>(.*?)<\/p>/gi, '$1\n\n')
                                  .replace(/<[^>]+>/g, '');
                                const blob = new Blob([`# ${selectedDoc.title}\n\n${md}`], { type: 'text/markdown' });
                                const url = URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = `${selectedDoc.title}.md`;
                                a.click();
                                URL.revokeObjectURL(url);
                                toast.success('Exported as Markdown');
                                setShowExportMenu(false);
                              }}
                              className="flex items-center gap-2 px-4 py-2.5 w-full text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                            >
                              <File className="w-4 h-4" />
                              Markdown
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Doc content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="max-w-3xl mx-auto">
                {isEditing ? (
                  <RichTextEditor
                    content={editContent}
                    onChange={setEditContent}
                    placeholder="Start writing..."
                    minHeight="400px"
                  />
                ) : (
                  selectedDoc.content ? (
                    <RichTextDisplay content={selectedDoc.content} />
                  ) : (
                    <p className="text-gray-400 dark:text-gray-500 italic text-sm">
                      No content yet. Click edit to start writing.
                    </p>
                  )
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <FileText className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Select a document</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              or create a new one to get started
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocsPage;
