import { AuthSession, LoginInput, SignUpInput, User } from '@/common/types/auth';

export async function signUp(input: SignUpInput): Promise<AuthSession> {
  const response = await fetch('/api/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const error = (await response.json().catch(() => ({ message: 'Failed to sign up' }))) as {
      message?: string;
    };
    throw new Error(error.message || 'Failed to sign up');
  }

  return response.json();
}

export async function login(input: LoginInput): Promise<AuthSession> {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const error = (await response.json().catch(() => ({ message: 'Failed to log in' }))) as {
      message?: string;
    };
    throw new Error(error.message || 'Failed to log in');
  }

  return response.json();
}

export async function getMe(): Promise<{ user: User }> {
  const response = await fetch('/api/auth/me');

  if (!response.ok) {
    throw new Error('Not authenticated');
  }

  return response.json();
}

export async function logout(): Promise<void> {
  await fetch('/api/auth/logout', { method: 'POST' });
}
