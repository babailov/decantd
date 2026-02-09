'use client';

import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/common/components/Button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/common/components/Dialog';
import { Input } from '@/common/components/Input';
import { changePassword } from '@/common/services/auth-api';

interface ChangePasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ChangePasswordDialog({ open, onOpenChange }: ChangePasswordDialogProps) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const resetForm = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await changePassword({ currentPassword, newPassword });
      toast.success('Password updated');
      resetForm();
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) resetForm();
        onOpenChange(isOpen);
      }}
    >
      <DialogContent>
        <div className="flex flex-col items-center mb-m">
          <DialogTitle>Change Password</DialogTitle>
          <DialogDescription>
            Enter your current password and choose a new one.
          </DialogDescription>
        </div>

        <form className="flex flex-col gap-s" onSubmit={handleSubmit}>
          <Input
            required
            id="currentPassword"
            label="Current Password"
            placeholder="Your current password"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />

          <Input
            required
            id="newPassword"
            label="New Password"
            minLength={8}
            placeholder="8+ characters"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />

          <Input
            required
            id="confirmNewPassword"
            label="Confirm New Password"
            minLength={8}
            placeholder="Re-enter new password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          {error && (
            <p className="text-body-s text-alert text-center">{error}</p>
          )}

          <Button
            className="w-full mt-xs"
            loading={loading}
            size="lg"
            type="submit"
          >
            Update Password
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
