import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import apiClient from '../lib/axios';
import { Button } from '../components/common/Button';
import { Spinner } from '../components/common/Spinner';
import { Avatar } from '../components/common/Avatar';
import { LayoutDashboard, Users, ArrowRight, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface InviteInfo {
  id: string;
  inviteeEmail: string;
  role: string;
  board: { id: string; title: string; color: string };
  inviter: { id: string; name: string; email: string; avatar: string | null };
}

const InvitePage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();

  const [invite, setInvite] = useState<InviteInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [accepting, setAccepting] = useState(false);

  useEffect(() => {
    if (token) {
      fetchInvite();
    }
  }, [token]);

  const fetchInvite = async () => {
    try {
      const { data } = await apiClient.get(`/invitations/token/${token}`);
      setInvite(data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid or expired invitation link');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    if (!isAuthenticated) {
      // Redirect to login with return URL
      navigate(`/login?redirect=/invite/${token}`);
      return;
    }

    setAccepting(true);
    try {
      const { data } = await apiClient.post(`/invitations/token/${token}/accept`);
      toast.success('You joined the board!');
      navigate(`/board/${data.data.boardId}`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to accept invitation');
    } finally {
      setAccepting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !invite) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Invalid Invitation</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">{error || 'This invitation link is invalid or has expired.'}</p>
          <Button onClick={() => navigate('/login')}>Go to Login</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Header */}
          <div className="px-8 pt-8 pb-6 text-center" style={{ borderBottom: `3px solid ${invite.board.color}` }}>
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-xl font-bold mx-auto mb-4" style={{ backgroundColor: invite.board.color }}>
              {invite.board.title.charAt(0).toUpperCase()}
            </div>
            <h1 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
              You're invited to join
            </h1>
            <h2 className="text-xl font-bold text-primary-600 dark:text-primary-400">
              {invite.board.title}
            </h2>
          </div>

          {/* Details */}
          <div className="px-8 py-6 space-y-4">
            <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
              <Avatar name={invite.inviter.name} size="md" avatar={invite.inviter.avatar} />
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{invite.inviter.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">invited you as <span className="font-semibold capitalize text-primary-600 dark:text-primary-400">{invite.role}</span></p>
              </div>
            </div>

            {!isAuthenticated && (
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
                <p className="text-xs text-amber-800 dark:text-amber-300">
                  You need to sign in or create an account with <strong>{invite.inviteeEmail}</strong> to accept this invitation.
                </p>
              </div>
            )}

            {isAuthenticated && user?.email !== invite.inviteeEmail && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
                <p className="text-xs text-red-800 dark:text-red-300">
                  This invitation was sent to <strong>{invite.inviteeEmail}</strong>. You're signed in as <strong>{user?.email}</strong>.
                </p>
              </div>
            )}

            <Button
              className="w-full"
              onClick={handleAccept}
              disabled={accepting}
              icon={<ArrowRight className="w-4 h-4" />}
            >
              {!isAuthenticated ? 'Sign in to Accept' : accepting ? 'Accepting...' : 'Accept & Join Board'}
            </Button>

            <button
              onClick={() => navigate(isAuthenticated ? '/dashboard' : '/')}
              className="w-full text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors text-center py-2"
            >
              No thanks
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvitePage;
