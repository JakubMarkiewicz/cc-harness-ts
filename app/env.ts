export const ENV = {
  OPENROUTER_API_KEY: getEnvValue("OPENROUTER_API_KEY"),
  OPENROUTER_MODEL: getEnvValue(
    "OPENROUTER_MODEL",
    "anthropic/claude-haiku-5.5",
  ),
  OPENROUTER_BASE_URL: getEnvValue(
    "OPENROUTER_BASE_URL",
    "https://openrouter.ai/api/v1",
  ),
} as const;

function getEnvValue(env: string, defaultVal?: string): string {
  const envVal = process.env[env] || defaultVal;

  if (!envVal) {
    throw new Error(`Missing env: ${env}`);
  }

  return envVal;
}
