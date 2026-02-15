import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { workspaceApi } from '../../api/workspace.api';
import { Mail, UserPlus, Users } from 'lucide-react';
import toast from 'react-hot-toast';

interface InviteToWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspaceId: string;
  workspaceName: string;
}

export const InviteToWorkspaceModal: React.FC<InviteToWorkspaceModalProps> = ({
  isOpen,
  onClose,
  workspaceId,
  workspaceName,
}) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsLoading(true);
    try {
      await workspaceApi.inviteByEmail(workspaceId, email.trim());
      toast.success(`${email} has been added to "${workspaceName}"`);
      setEmail('');
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to invite member');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Invite to Workspace">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="flex items-center gap-3 p-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg border border-primary-100 dark:border-primary-800">
          <Users className="w-5 h-5 text-primary-500" />
          <div>
            <p className="text-sm font-medium text-primary-700 dark:text-primary-300">
              Inviting to: {workspaceName}
            </p>
            <p className="text-xs text-primary-600 dark:text-primary-400">
              Members will have access to all boards in this workspace
            </p>
          </div>
        </div>

        <Input
          label="Email Address"
          type="email"
          placeholder="colleague@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          icon={<Mail className="w-4 h-4" />}
          required
          autoFocus
        />

        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg p-3">
          <p className="text-xs text-blue-700 dark:text-blue-300">
            The user must already have a TaskFlow account. They will be added as a workspace member immediately.
          </p>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isLoading} icon={<UserPlus className="w-4 h-4" />}>
            Invite Member
          </Button>
        </div>
      </form>
    </Modal>
  );
};
