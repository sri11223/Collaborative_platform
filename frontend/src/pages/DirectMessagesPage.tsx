import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useWorkspaceStore } from '../store/workspaceStore';
import { useAuthStore } from '../store/authStore';
import { messageApi } from '../api/message.api';
import { Avatar } from '../components/common/Avatar';
import { Spinner } from '../components/common/Spinner';
import { getSocket } from '../lib/socket';
import {
  MessageSquare, Send, Search, ArrowLeft, Trash2, Circle,
  Users, Hash,
} from 'lucide-react';
import toast from 'react-hot-toast';

interface DMUser {
  id: string;
  userId: string;
  role: string;
  user: { id: string; name: string; email: string; avatar: string | null };
  lastMessage?: { id: string; content: string; createdAt: string; senderId: string } | null;
  unreadCount: number;
}

interface Message {
  id: string;
  content: string;
  senderId: string;
  receiverId: string;
  read: boolean;
  createdAt: string;
  sender: { id: string; name: string; email: string; avatar: string | null };
  receiver: { id: string; name: string; email: string; avatar: string | null };
}

const DirectMessagesPage: React.FC = () => {
  const { user } = useAuthStore();
  const { currentWorkspace } = useWorkspaceStore();

  const [members, setMembers] = useState<DMUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<DMUser | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isTyping, setIsTyping] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  // Load workspace members
  useEffect(() => {
    if (currentWorkspace) {
      loadMembers();
    }
  }, [currentWorkspace?.id]);

  // Socket listeners for real-time messages
  useEffect(() => {
    const socket = getSocket();

    const handleNewMessage = (message: Message) => {
      setMessages((prev) => {
        // Don't add duplicate
        if (prev.some((m) => m.id === message.id)) return prev;
        return [...prev, message];
      });

      // Update member list's last message
      setMembers((prev) =>
        prev.map((m) => {
          if (m.user.id === message.senderId || m.user.id === message.receiverId) {
            return {
              ...m,
              lastMessage: {
                id: message.id,
                content: message.content,
                createdAt: message.createdAt,
                senderId: message.senderId,
              },
              unreadCount:
                message.senderId !== user?.id && m.user.id === message.senderId
                  ? (selectedUser?.user.id === message.senderId ? m.unreadCount : m.unreadCount + 1)
                  : m.unreadCount,
            };
          }
          return m;
        })
      );
    };

    const handleTyping = (data: { senderId: string }) => {
      if (selectedUser?.user.id === data.senderId) {
        setIsTyping(data.senderId);
      }
    };

    const handleStopTyping = (data: { senderId: string }) => {
      if (isTyping === data.senderId) {
        setIsTyping(null);
      }
    };

    socket.on('dm:new', handleNewMessage);
    socket.on('dm:typing', handleTyping);
    socket.on('dm:stop-typing', handleStopTyping);

    return () => {
      socket.off('dm:new', handleNewMessage);
      socket.off('dm:typing', handleTyping);
      socket.off('dm:stop-typing', handleStopTyping);
    };
  }, [selectedUser, user?.id, isTyping]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadMembers = async () => {
    if (!currentWorkspace) return;
    setLoading(true);
    try {
      const { data } = await messageApi.getWorkspaceMembers(currentWorkspace.id);
      setMembers(data.data || []);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  const loadConversation = async (otherUser: DMUser) => {
    setSelectedUser(otherUser);
    setChatLoading(true);
    try {
      const { data } = await messageApi.getConversation(otherUser.user.id);
      setMessages(data.data.messages || []);
      // Clear unread count for this user
      setMembers((prev) =>
        prev.map((m) => (m.user.id === otherUser.user.id ? { ...m, unreadCount: 0 } : m))
      );
    } catch {
      toast.error('Failed to load conversation');
    } finally {
      setChatLoading(false);
    }
  };

  const handleSend = async () => {
    if (!newMessage.trim() || !selectedUser || sending) return;
    const content = newMessage.trim();
    setNewMessage('');
    setSending(true);

    try {
      await messageApi.sendMessage(selectedUser.user.id, content);
      // Message will arrive via socket
    } catch {
      toast.error('Failed to send message');
      setNewMessage(content);
    } finally {
      setSending(false);
    }

    // Stop typing indicator
    const socket = getSocket();
    socket.emit('dm:stop-typing', { receiverId: selectedUser.user.id });
  };

  const handleTypingEvent = () => {
    if (!selectedUser) return;
    const socket = getSocket();
    socket.emit('dm:typing', { receiverId: selectedUser.user.id });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('dm:stop-typing', { receiverId: selectedUser.user.id });
    }, 2000);
  };

  const handleDeleteMessage = async (messageId: string) => {
    try {
      await messageApi.deleteMessage(messageId);
      setMessages((prev) => prev.filter((m) => m.id !== messageId));
    } catch {
      toast.error('Failed to delete message');
    }
  };

  const filteredMembers = members.filter(
    (m) =>
      !searchQuery ||
      m.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return d.toLocaleDateString('en-US', { weekday: 'short' });
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatMessageTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  const formatDateSeparator = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  };

  // Group messages by date
  const groupedMessages: { date: string; messages: Message[] }[] = [];
  messages.forEach((msg) => {
    const dateKey = new Date(msg.createdAt).toDateString();
    const existing = groupedMessages.find((g) => g.date === dateKey);
    if (existing) {
      existing.messages.push(msg);
    } else {
      groupedMessages.push({ date: dateKey, messages: [msg] });
    }
  });

  if (!currentWorkspace) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center py-20">
        <MessageSquare className="w-12 h-12 text-gray-400 mb-4" />
        <p className="text-gray-500 dark:text-gray-400">Select a workspace to start messaging</p>
      </div>
    );
  }

  return (
    <div className="h-full flex bg-white dark:bg-gray-900">
      {/* Members sidebar */}
      <div className={`w-80 border-r border-gray-200 dark:border-gray-800 flex flex-col bg-white dark:bg-gray-900 flex-shrink-0 ${selectedUser ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          <h1 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-3">
            <MessageSquare className="w-5 h-5 text-primary-500" />
            Direct Messages
          </h1>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search members..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-gray-100 dark:bg-gray-800 border-0 rounded-lg text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Spinner size="sm" />
            </div>
          ) : filteredMembers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center px-4">
              <Users className="w-8 h-8 text-gray-300 dark:text-gray-600 mb-2" />
              <p className="text-xs text-gray-400 dark:text-gray-500">
                {searchQuery ? 'No members found' : 'No other members in this workspace'}
              </p>
            </div>
          ) : (
            <div className="py-1">
              {filteredMembers.map((member) => (
                <button
                  key={member.user.id}
                  onClick={() => loadConversation(member)}
                  className={`flex items-center gap-3 w-full text-left px-4 py-3 transition-colors ${
                    selectedUser?.user.id === member.user.id
                      ? 'bg-primary-50 dark:bg-primary-900/20'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  <div className="relative">
                    <Avatar name={member.user.name} size="sm" avatar={member.user.avatar} />
                    <Circle className="absolute -bottom-0.5 -right-0.5 w-3 h-3 fill-green-400 text-green-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {member.user.name}
                      </p>
                      {member.lastMessage && (
                        <span className="text-[10px] text-gray-400 flex-shrink-0 ml-2">
                          {formatTime(member.lastMessage.createdAt)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-0.5">
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {member.lastMessage
                          ? `${member.lastMessage.senderId === user?.id ? 'You: ' : ''}${member.lastMessage.content}`
                          : member.user.email}
                      </p>
                      {member.unreadCount > 0 && (
                        <span className="bg-primary-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center flex-shrink-0 ml-2">
                          {member.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Chat area */}
      <div className={`flex-1 flex flex-col ${!selectedUser ? 'hidden md:flex' : 'flex'}`}>
        {selectedUser ? (
          <>
            {/* Chat header */}
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800 flex items-center gap-3">
              <button
                onClick={() => setSelectedUser(null)}
                className="md:hidden p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <Avatar name={selectedUser.user.name} size="sm" avatar={selectedUser.user.avatar} />
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {selectedUser.user.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {isTyping === selectedUser.user.id ? (
                    <span className="text-primary-500">typing...</span>
                  ) : (
                    selectedUser.user.email
                  )}
                </p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {chatLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Spinner size="sm" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <MessageSquare className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    No messages yet. Start a conversation!
                  </p>
                </div>
              ) : (
                <>
                  {groupedMessages.map((group) => (
                    <div key={group.date}>
                      {/* Date separator */}
                      <div className="flex items-center gap-3 my-4">
                        <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
                        <span className="text-[10px] font-medium text-gray-400 dark:text-gray-500 uppercase">
                          {formatDateSeparator(group.messages[0].createdAt)}
                        </span>
                        <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
                      </div>

                      {/* Messages in group */}
                      {group.messages.map((msg, idx) => {
                        const isOwn = msg.senderId === user?.id;
                        const showAvatar =
                          idx === 0 || group.messages[idx - 1].senderId !== msg.senderId;

                        return (
                          <div
                            key={msg.id}
                            className={`flex items-end gap-2 mb-1 ${isOwn ? 'flex-row-reverse' : ''}`}
                          >
                            {showAvatar ? (
                              <Avatar
                                name={msg.sender.name}
                                size="xs"
                                avatar={msg.sender.avatar}
                              />
                            ) : (
                              <div className="w-6" />
                            )}
                            <div className={`group max-w-[70%] ${isOwn ? 'items-end' : 'items-start'}`}>
                              {showAvatar && (
                                <p className={`text-[10px] font-medium mb-0.5 ${isOwn ? 'text-right' : ''} text-gray-400`}>
                                  {msg.sender.name}
                                </p>
                              )}
                              <div className="flex items-center gap-1">
                                {isOwn && (
                                  <button
                                    onClick={() => handleDeleteMessage(msg.id)}
                                    className="p-1 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all rounded"
                                    title="Delete"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                )}
                                <div
                                  className={`px-3 py-2 rounded-2xl text-sm ${
                                    isOwn
                                      ? 'bg-primary-500 text-white rounded-br-md'
                                      : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-bl-md'
                                  }`}
                                >
                                  {msg.content}
                                </div>
                              </div>
                              <p className={`text-[10px] text-gray-400 mt-0.5 ${isOwn ? 'text-right' : ''}`}>
                                {formatMessageTime(msg.createdAt)}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message input */}
            <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  placeholder={`Message ${selectedUser.user.name}...`}
                  value={newMessage}
                  onChange={(e) => {
                    setNewMessage(e.target.value);
                    handleTypingEvent();
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  className="flex-1 px-4 py-2.5 text-sm bg-gray-100 dark:bg-gray-800 border-0 rounded-xl text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <button
                  onClick={handleSend}
                  disabled={!newMessage.trim() || sending}
                  className="p-2.5 bg-primary-500 text-white rounded-xl hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-20 h-20 bg-primary-100 dark:bg-primary-900/20 rounded-full flex items-center justify-center mb-4">
              <MessageSquare className="w-10 h-10 text-primary-500" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
              Direct Messages
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm">
              Select a workspace member from the left to start chatting. Messages are private between you and the recipient.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DirectMessagesPage;
