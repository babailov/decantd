import { useAuthStore } from '@/common/stores/useAuthStore';
import type { SavedGuidedTasting } from '@/common/types/explore';

function getAuthHeaders(): Record<string, string> {
  const token = useAuthStore.getState().token;
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['x-auth-token'] = token;
  return headers;
}

export async function saveGuidedTasting(
  data: Omit<SavedGuidedTasting, 'id' | 'userId' | 'createdAt' | 'updatedAt'>,
): Promise<SavedGuidedTasting> {
  const response = await fetch('/api/guided-tastings', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to save tasting' })) as { message?: string };
    throw new Error(error.message || 'Failed to save tasting');
  }

  return response.json();
}

export async function updateGuidedTasting(
  id: string,
  data: Partial<Omit<SavedGuidedTasting, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>,
): Promise<SavedGuidedTasting> {
  const response = await fetch(`/api/guided-tastings/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to update tasting' })) as { message?: string };
    throw new Error(error.message || 'Failed to update tasting');
  }

  return response.json();
}

export async function fetchGuidedTasting(id: string): Promise<SavedGuidedTasting> {
  const response = await fetch(`/api/guided-tastings/${id}`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Tasting not found');
  }

  return response.json();
}

export async function fetchGuidedTastings(): Promise<{ tastings: SavedGuidedTasting[] }> {
  const response = await fetch('/api/guided-tastings', {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch tastings');
  }

  return response.json();
}
