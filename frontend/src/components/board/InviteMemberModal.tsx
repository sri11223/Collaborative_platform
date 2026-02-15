import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { invitationApi } from '../../api/invitation.api';
import { Mail, UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';

interface InviteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  boardId: string;
}

export const InviteMemberModal: React.FC<InviteMemberModalProps> = ({
  isOpen,
  onClose,
  boardId,
}) => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('member');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsLoading(true);
    try {
      await invitationApi.createInvitation(boardId, { email: email.trim(), role });
      toast.success(`Invitation sent to ${email}`);
      setEmail('');
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to send invitation');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Invite Team Member">
      <form onSubmit={handleSubmit} className="space-y-5">
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

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Role</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="member">Member — Can edit tasks and lists</option>
            <option value="admin">Admin — Full access</option>
            <option value="viewer">Viewer — Read-only access</option>
          </select>
        </div>

        <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
          <p className="text-xs text-blue-700">
            An invitation will be sent. If the user already has an account, 
            they'll see it in their dashboard. New users will auto-join when they sign up with this email.
          </p>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isLoading} icon={<UserPlus className="w-4 h-4" />}>
            Send Invitation
          </Button>
        </div>
      </form>
    </Modal>
  );
};
