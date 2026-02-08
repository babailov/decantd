'use client';

import { Wine } from 'lucide-react';
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
import { login, signUp } from '@/common/services/auth-api';
import { useAuthStore } from '@/common/stores/useAuthStore';

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultMode?: 'login' | 'signup';
}

export function AuthDialog({ open, onOpenChange, defaultMode = 'signup' }: AuthDialogProps) {
  const [mode, setMode] = useState<'login' | 'signup'>(defaultMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { setAuth } = useAuthStore();

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setDisplayName('');
    setError('');
  };

  const toggleMode = () => {
    setMode(mode === 'login' ? 'signup' : 'login');
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (mode === 'signup') {
        const session = await signUp({ email, password, displayName });
        setAuth(session.user, session.token);
        toast.success('Welcome to Decantd!');
      } else {
        const session = await login({ email, password });
        setAuth(session.user, session.token);
        toast.success('Welcome back!');
      }
      resetForm();
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
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
              id="displayName"
              label="Display Name"
              placeholder="Your name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
            />
          )}

          <Input
            id="email"
            label="Email"
            placeholder="you@example.com"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Input
            id="password"
            label="Password"
            placeholder={mode === 'signup' ? '8+ characters' : 'Your password'}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={mode === 'signup' ? 8 : undefined}
            required
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
            onClick={toggleMode}
            type="button"
          >
            {mode === 'signup' ? 'Sign in' : 'Create one'}
          </button>
        </p>
      </DialogContent>
    </Dialog>
  );
}
