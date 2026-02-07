import { TastingPlan, TastingPlanInput } from '@/common/types/tasting';

export async function generateTastingPlan(
  input: TastingPlanInput,
): Promise<TastingPlan> {
  const response = await fetch('/api/tasting/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to generate plan' })) as { message?: string };
    throw new Error(error.message || 'Failed to generate plan');
  }

  return response.json();
}

export async function getTastingPlan(id: string): Promise<TastingPlan> {
  const response = await fetch(`/api/tasting/${id}`);

  if (!response.ok) {
    throw new Error('Plan not found');
  }

  return response.json();
}
