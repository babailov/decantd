import { useAuthStore } from '@/common/stores/useAuthStore';
import { AuthSession, LoginInput, SignUpInput, User } from '@/common/types/auth';

function getAuthHeaders(): Record<string, string> {
  const token = useAuthStore.getState().token;
  if (token) {
    return { 'x-auth-token': token };
  }
  return {};
}

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
  const response = await fetch('/api/auth/me', {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Not authenticated');
  }

  return response.json();
}

export async function logout(): Promise<void> {
  await fetch('/api/auth/logout', {
    method: 'POST',
    headers: getAuthHeaders(),
  });
}

export async function changePassword(input: {
  currentPassword: string;
  newPassword: string;
}): Promise<{ success: boolean }> {
  const response = await fetch('/api/auth/change-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const error = (await response.json().catch(() => ({ message: 'Failed to change password' }))) as {
      message?: string;
    };
    throw new Error(error.message || 'Failed to change password');
  }

  return response.json();
}

export async function forgotPassword(input: { email: string }): Promise<{ success: boolean }> {
  const response = await fetch('/api/auth/forgot-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const error = (await response.json().catch(() => ({ message: 'Failed to send reset email' }))) as {
      message?: string;
    };
    throw new Error(error.message || 'Failed to send reset email');
  }

  return response.json();
}

export async function resetPassword(input: {
  token: string;
  newPassword: string;
}): Promise<{ success: boolean }> {
  const response = await fetch('/api/auth/reset-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const error = (await response.json().catch(() => ({ message: 'Failed to reset password' }))) as {
      message?: string;
    };
    throw new Error(error.message || 'Failed to reset password');
  }

  return response.json();
}
