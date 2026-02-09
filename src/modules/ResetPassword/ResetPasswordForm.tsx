'use client';

import { CheckCircle, Wine } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';

import { Button } from '@/common/components/Button';
import { Card } from '@/common/components/Card';
import { Input } from '@/common/components/Input';
import { resetPassword } from '@/common/services/auth-api';

export function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!token) {
    return (
      <Card className="text-center" variant="elevated">
        <Wine className="h-8 w-8 text-primary mx-auto mb-s" />
        <h2 className="font-display text-heading-s text-primary mb-xs">
          Invalid Reset Link
        </h2>
        <p className="text-body-m text-text-secondary mb-m">
          This password reset link is invalid or has expired. Please request a new one.
        </p>
        <Link href="/">
          <Button variant="primary">Go Home</Button>
        </Link>
      </Card>
    );
  }

  if (success) {
    return (
      <Card className="text-center" variant="elevated">
        <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-s" />
        <h2 className="font-display text-heading-s text-primary mb-xs">
          Password Reset
        </h2>
        <p className="text-body-m text-text-secondary mb-m">
          Your password has been updated. You can now sign in with your new password.
        </p>
        <Link href="/">
          <Button variant="primary">Go to Home</Button>
        </Link>
      </Card>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await resetPassword({ token, newPassword });
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card variant="elevated">
      <div className="flex flex-col items-center mb-m">
        <Wine className="h-8 w-8 text-primary mb-xs" />
        <h2 className="font-display text-heading-s text-primary">
          Set New Password
        </h2>
        <p className="text-body-m text-text-secondary mt-xs text-center">
          Enter your new password below.
        </p>
      </div>

      <form className="flex flex-col gap-s" onSubmit={handleSubmit}>
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
          id="confirmPassword"
          label="Confirm Password"
          minLength={8}
          placeholder="Re-enter your password"
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
          Reset Password
        </Button>
      </form>
    </Card>
  );
}
