import { useAuthStore } from '@/common/stores/useAuthStore';
import { TastingPlan, TastingPlanInput } from '@/common/types/tasting';

function getAuthHeaders(): Record<string, string> {
  const token = useAuthStore.getState().token;
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['x-auth-token'] = token;
  return headers;
}

export async function generateTastingPlan(
  input: TastingPlanInput,
): Promise<TastingPlan> {
  const response = await fetch('/api/tasting/generate', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to generate plan' })) as { message?: string };
    throw new Error(error.message || 'Failed to generate plan');
  }

  return response.json();
}

export async function getTastingPlan(id: string): Promise<TastingPlan> {
  const response = await fetch(`/api/tasting/${id}`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Plan not found');
  }

  return response.json();
}
