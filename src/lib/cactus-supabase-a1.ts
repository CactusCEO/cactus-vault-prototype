export type A1Env = Record<string, string | undefined>;

export type A1Readiness = {
  ready: boolean;
  missing: string[];
  optionalMissing: string[];
  providerEnvReady: boolean;
  migrationEnvReady: boolean;
  message: string;
};

export const requiredProviderEnv = ["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"] as const;
export const requiredMigrationEnv = ["CACTUS_SUPABASE_PROJECT_REF", "SUPABASE_ACCESS_TOKEN"] as const;

export function redactEnvValue(key: string, value: string | undefined): string {
  if (!value) return "";
  if (/KEY|TOKEN|SECRET|PASSWORD/i.test(key)) return "[REDACTED]";
  if (value.length <= 12) return value;
  return `${value.slice(0, 6)}…${value.slice(-4)}`;
}

export function getA1Readiness(env: A1Env): A1Readiness {
  const missingProvider = requiredProviderEnv.filter((key) => !env[key]);
  const missingMigration = requiredMigrationEnv.filter((key) => !env[key]);
  const providerEnvReady = missingProvider.length === 0;
  const migrationEnvReady = missingMigration.length === 0;
  const missing = [...missingProvider];
  const optionalMissing = [...missingMigration];
  const ready = providerEnvReady;
  const message = ready
    ? migrationEnvReady
      ? "Supabase provider and migration env are ready. You can link/push migrations and verify provider=supabase."
      : "Supabase provider env is ready. Migration env is missing, so skip CLI push and verify provider=supabase after migration is applied manually."
    : "Supabase provider env is missing. Cactus will keep using local-json fallback until SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set server-side.";
  return { ready, missing, optionalMissing, providerEnvReady, migrationEnvReady, message };
}

export function buildSupabaseCliCommands(env: A1Env): string[] {
  const readiness = getA1Readiness(env);
  if (!readiness.migrationEnvReady) return [];
  return [
    `SUPABASE_ACCESS_TOKEN=${shellQuote(env.SUPABASE_ACCESS_TOKEN ?? "")} npx supabase@latest link --project-ref ${shellQuote(env.CACTUS_SUPABASE_PROJECT_REF ?? "")}`,
    `SUPABASE_ACCESS_TOKEN=${shellQuote(env.SUPABASE_ACCESS_TOKEN ?? "")} npx supabase@latest db push`,
  ];
}

export function shellQuote(value: string): string {
  return `'${value.replace(/'/g, `'"'"'`)}'`;
}

export function publicA1EnvSummary(env: A1Env): Record<string, string> {
  return Object.fromEntries([...requiredProviderEnv, ...requiredMigrationEnv].map((key) => [key, redactEnvValue(key, env[key])])) as Record<string, string>;
}
