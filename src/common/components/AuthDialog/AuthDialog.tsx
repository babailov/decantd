'use client';

import { CheckCircle, Wine } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
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
  const [googleLoading, setGoogleLoading] = useState(false);
  const router = useRouter();
  const { setAuth } = useAuthStore();

  // Check for OAuth error in URL params
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const authError = params.get('auth_error');
    if (authError) {
      const messages: Record<string, string> = {
        access_denied: 'Google sign-in was cancelled.',
        email_not_verified: 'Your Google email is not verified.',
        oauth_not_configured: 'Google sign-in is not available.',
        oauth_error: 'Something went wrong with Google sign-in. Please try again.',
        invalid_state: 'Sign-in session expired. Please try again.',
        missing_params: 'Something went wrong with Google sign-in. Please try again.',
        db_unavailable: 'Service temporarily unavailable. Please try again.',
        user_creation_failed: 'Failed to create account. Please try again.',
      };
      toast.error(messages[authError] || 'Sign-in failed. Please try again.');
      // Clean up URL
      const url = new URL(window.location.href);
      url.searchParams.delete('auth_error');
      window.history.replaceState({}, '', url.pathname + url.search);
    }
  }, []);

  // Reset transient redirect state when navigating back from OAuth flow.
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const resetGoogleLoading = () => setGoogleLoading(false);

    window.addEventListener('pageshow', resetGoogleLoading);
    window.addEventListener('popstate', resetGoogleLoading);

    return () => {
      window.removeEventListener('pageshow', resetGoogleLoading);
      window.removeEventListener('popstate', resetGoogleLoading);
    };
  }, []);

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
        router.push('/');
        onOpenChange(false);
      } else {
        const session = await login({ email, password });
        setAuth(session.user, session.token);
        usePlanHistoryStore.getState().clearHistory();
        toast.success('Welcome back!');
        resetForm();
        router.push('/');
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

      <button
        className={cn(
          'w-full flex items-center justify-center gap-s',
          'px-m py-s rounded-xl border border-border',
          'bg-surface hover:bg-surface-elevated transition-colors',
          'font-body text-body-m text-text-primary font-medium',
          'disabled:opacity-50 disabled:cursor-not-allowed',
        )}
        disabled={googleLoading || loading}
        type="button"
        onClick={() => {
          setGoogleLoading(true);
          window.location.href = '/api/auth/google';
        }}
      >
        <svg className="h-5 w-5" viewBox="0 0 24 24">
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 0 0 1 12c0 1.77.42 3.45 1.18 4.93l2.85-2.22.81-.62z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
          />
        </svg>
        {googleLoading ? 'Redirecting...' : 'Continue with Google'}
      </button>

      <div className="flex items-center gap-s my-s">
        <div className="flex-1 h-px bg-border" />
        <span className="text-body-xs text-text-muted">or</span>
        <div className="flex-1 h-px bg-border" />
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
      setGoogleLoading(false);
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
