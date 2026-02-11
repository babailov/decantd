const APP_BASE_URL =
  process.env.NEXT_PUBLIC_ENV === 'production'
    ? 'https://decantd.app'
    : process.env.NEXT_PUBLIC_ENV === 'staging'
      ? 'https://staging.decantd.app'
      : 'http://localhost:5173';

export function getPlanUrl(planId: string): string {
  return `${APP_BASE_URL}/tasting/${planId}`;
}

export function getOgImageUrl(planId: string): string {
  return `${APP_BASE_URL}/api/og?planId=${planId}`;
}

export { APP_BASE_URL };
