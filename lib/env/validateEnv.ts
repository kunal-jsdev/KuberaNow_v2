export function getGoogleScriptUrl(): string {
  const url = process.env.GOOGLE_SCRIPT_URL;
  if (!url) {
    throw new Error('GOOGLE_SCRIPT_URL environment variable is not configured');
  }
  return url;
}

export function getFormSecret(): string {
  const secret = process.env.FORM_SECRET;
  if (!secret) {
    throw new Error('FORM_SECRET environment variable is not configured');
  }
  return secret;
}

export function getPayloadSecret(): string {
  const secret = process.env.PAYLOAD_SECRET;
  if (!secret) {
    throw new Error('PAYLOAD_SECRET environment variable is not configured');
  }
  return secret;
}

export function getDatabaseUrl(): string {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error('DATABASE_URL environment variable is not configured');
  }
  return url;
}

export function validateSMTPVariables() {
  const requiredVars = [
    'SMTP_HOST',
    'SMTP_PORT',
    'SMTP_USER',
    'SMTP_PASSWORD',
    'SMTP_FROM_EMAIL',
    'SMTP_FROM_NAME',
    'SMTP_TO_EMAIL',
    'SMTP_SECURE',
  ];
  const missingVars = requiredVars.filter((v) => !process.env[v]);
  if (missingVars.length > 0) {
    throw new Error(`Missing SMTP variables: ${missingVars.join(', ')}`);
  }
  return {
    SMTP_HOST: process.env.SMTP_HOST as string,
    SMTP_PORT: parseInt(process.env.SMTP_PORT || '465', 10),
    SMTP_USER: process.env.SMTP_USER as string,
    SMTP_PASSWORD: process.env.SMTP_PASSWORD as string,
    SMTP_FROM_EMAIL: process.env.SMTP_FROM_EMAIL as string,
    SMTP_FROM_NAME: process.env.SMTP_FROM_NAME as string,
    SMTP_TO_EMAIL: process.env.SMTP_TO_EMAIL as string,
    SMTP_SECURE: process.env.SMTP_SECURE === 'true',
  };
}

/**
 * Shared secret for driving the Payload job queue over HTTP
 * (GET /api/payload-jobs/run). Optional: on the AWS server the built-in
 * `autoRun` cron is the worker, and this is only needed when an external
 * scheduler triggers the queue instead. Returns undefined when unset so the
 * endpoint simply stays closed to unauthenticated callers.
 */
export function getCronSecret(): string | undefined {
  return process.env.CRON_SECRET || undefined;
}
