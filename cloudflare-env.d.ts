declare global {
  interface CloudflareEnv {
    DB: D1Database;
    ANTHROPIC_API_KEY: string;
    NEXT_PUBLIC_ENV: string;
  }
}

export {};
