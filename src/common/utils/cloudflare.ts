export function hasDbBinding(
  env: CloudflareEnv,
): env is CloudflareEnv & { DB: D1Database } {
  return 'DB' in env && env.DB !== undefined;
}

export function hasAnthropicKey(
  env: CloudflareEnv,
): env is CloudflareEnv & { ANTHROPIC_API_KEY: string } {
  return 'ANTHROPIC_API_KEY' in env && !!env.ANTHROPIC_API_KEY;
}
