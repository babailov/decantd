import { getCloudflareContext } from '@opennextjs/cloudflare';

import { isDevEnvironment } from '@/common/constants/environment';
import { createDbClient, DbClient } from '@/common/db/client';

export async function getDb(): Promise<DbClient | null> {
  let d1: D1Database | null = null;

  if (isDevEnvironment) {
    try {
      const ctx = await getCloudflareContext();
      d1 = ctx.env.DB;
    } catch {
      return null;
    }
  } else {
    const { env } = await getCloudflareContext();
    d1 = env.DB;
  }

  if (!d1) return null;
  return createDbClient(d1);
}
