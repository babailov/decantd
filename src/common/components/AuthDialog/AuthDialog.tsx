'use client';

import { CheckCircle, Wine } from 'lucide-react';
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
import { cn } from '@/common/functions/cn';
import { forgotPassword, login, signUp } from '@/common/services/auth-api';
import { useAuthStore } from '@/common/stores/useAuthStore';
import { usePlanHistoryStore } from '@/common/stores/usePlanHistoryStore';

type AuthMode = 'login' | 'signup' | 'forgot';

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultMode?: 'login' | 'signup';
}

export function AuthDialog({ open, onOpenChange, defaultMode = 'signup' }: AuthDialogProps) {
  const [mode, setMode] = useState<AuthMode>(defaultMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [forgotSent, setForgotSent] = useState(false);
  const { setAuth } = useAuthStore();

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setDisplayName('');
    setError('');
    setForgotSent(false);
  };

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode);
    setError('');
    setForgotSent(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (mode === 'forgot') {
        await forgotPassword({ email });
        setForgotSent(true);
      } else if (mode === 'signup') {
        const session = await signUp({ email, password, displayName });
        setAuth(session.user, session.token);
        usePlanHistoryStore.getState().clearHistory();
        toast.success('Welcome to Decantd!');
        resetForm();
        onOpenChange(false);
      } else {
        const session = await login({ email, password });
        setAuth(session.user, session.token);
        usePlanHistoryStore.getState().clearHistory();
        toast.success('Welcome back!');
        resetForm();
        onOpenChange(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const renderForgotMode = () => {
    if (forgotSent) {
      return (
        <div className="flex flex-col items-center text-center">
          <CheckCircle className="h-8 w-8 text-green-600 mb-s" />
          <DialogTitle>Check Your Email</DialogTitle>
          <DialogDescription className="mt-xs">
            If an account exists with that email, we&apos;ve sent a password reset link. Check your inbox and spam folder.
          </DialogDescription>
          <button
            className={cn(
              'text-primary font-medium hover:underline mt-m',
              'focus:outline-none focus-visible:underline',
            )}
            type="button"
            onClick={() => switchMode('login')}
          >
            Back to sign in
          </button>
        </div>
      );
    }

    return (
      <>
        <div className="flex flex-col items-center mb-m">
          <Wine className="h-8 w-8 text-primary mb-xs" />
          <DialogTitle>Forgot Password</DialogTitle>
          <DialogDescription>
            Enter your email and we&apos;ll send you a link to reset your password.
          </DialogDescription>
        </div>

        <form className="flex flex-col gap-s" onSubmit={handleSubmit}>
          <Input
            required
            id="forgotEmail"
            label="Email"
            placeholder="you@example.com"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
            Send Reset Link
          </Button>
        </form>

        <p className="text-body-s text-text-secondary text-center mt-m">
          <button
            className={cn(
              'text-primary font-medium hover:underline',
              'focus:outline-none focus-visible:underline',
            )}
            type="button"
            onClick={() => switchMode('login')}
          >
            Back to sign in
          </button>
        </p>
      </>
    );
  };

  const renderAuthMode = () => (
    <>
      <div className="flex flex-col items-center mb-m">
        <Wine className="h-8 w-8 text-primary mb-xs" />
        <DialogTitle>
          {mode === 'signup' ? 'Join Decantd' : 'Welcome Back'}
        </DialogTitle>
        <DialogDescription>
          {mode === 'signup'
            ? 'Create an account to save your tastings and build your palate profile.'
            : 'Sign in to access your tasting journal and saved plans.'}
        </DialogDescription>
      </div>

      <form className="flex flex-col gap-s" onSubmit={handleSubmit}>
        {mode === 'signup' && (
          <Input
            required
            id="displayName"
            label="Display Name"
            placeholder="Your name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />
        )}

        <Input
          required
          id="email"
          label="Email"
          placeholder="you@example.com"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <div>
          <Input
            required
            id="password"
            label="Password"
            minLength={mode === 'signup' ? 8 : undefined}
            placeholder={mode === 'signup' ? '8+ characters' : 'Your password'}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {mode === 'login' && (
            <button
              className={cn(
                'text-body-xs text-text-muted hover:text-primary mt-1',
                'focus:outline-none focus-visible:underline',
              )}
              type="button"
              onClick={() => switchMode('forgot')}
            >
              Forgot password?
            </button>
          )}
        </div>

        {error && (
          <p className="text-body-s text-alert text-center">{error}</p>
        )}

        <Button
          className="w-full mt-xs"
          loading={loading}
          size="lg"
          type="submit"
        >
          {mode === 'signup' ? 'Create Account' : 'Sign In'}
        </Button>
      </form>

      <p className="text-body-s text-text-secondary text-center mt-m">
        {mode === 'signup' ? 'Already have an account?' : "Don't have an account?"}{' '}
        <button
          className={cn(
            'text-primary font-medium hover:underline',
            'focus:outline-none focus-visible:underline',
          )}
          type="button"
          onClick={() => switchMode(mode === 'signup' ? 'login' : 'signup')}
        >
          {mode === 'signup' ? 'Sign in' : 'Create one'}
        </button>
      </p>
    </>
  );

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      resetForm();
      setMode(defaultMode);
    }
    onOpenChange(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        {mode === 'forgot' ? renderForgotMode() : renderAuthMode()}
      </DialogContent>
    </Dialog>
  );
}
