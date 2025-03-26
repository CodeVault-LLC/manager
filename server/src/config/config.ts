import dotenv from 'dotenv';
import { randomBytes } from 'crypto';
dotenv.config();

const envVars = {
  required: [
    // Postgres
    'POSTGRES_HOST',
    'POSTGRES_PORT',
    'POSTGRES_USER',
    'POSTGRES_PASSWORD',
    'POSTGRES_DB',

    // JWT
    'JWT_SECRET',
    'JWT_EXPIRES_IN',

    // AWS
    'AWS_ACCESS_KEY_ID',
    'AWS_SECRET_ACCESS_KEY',

    // Google
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
    'GOOGLE_REDIRECT_URL',

    // Frontend
    'FRONTEND_URL',
  ] as const,

  optional: [
    // AWS
    'AWS_REGION',
    'AWS_BUCKET_NAME',
    'AWS_ENDPOINT',
    'AWS_FORCE_PATH_STYLE',
  ] as const,
};

type EnvVarConfig = {
  required: Record<(typeof envVars)['required'][number], string>;
  optional: Record<(typeof envVars)['optional'][number], string | undefined>;

  dynamic: {
    GOOGLE_STATE: string;
    GOOGLE_CODE_CHALLENGE: string;
  };
};

export const configuration: EnvVarConfig = {
  required: {} as Record<(typeof envVars)['required'][number], string>,
  optional: {} as Record<
    (typeof envVars)['optional'][number],
    string | undefined
  >,

  dynamic: {
    // Google OAuth state
    GOOGLE_STATE: randomBytes(32).toString('hex'),
    // Google OAuth code challenge
    GOOGLE_CODE_CHALLENGE: randomBytes(32).toString('hex'),
  },
};

export const loadConfigurations = () => {
  // Load required environment variables
  envVars.required.forEach((key) => {
    const value = process.env[key];
    if (!value) {
      throw new Error(`Missing required environment variable: ${key}`);
    }
    configuration.required[key] = value;
  });

  // Load optional environment variables
  envVars.optional.forEach((key) => {
    const value = process.env[key];
    if (!value) {
      console.warn(`Optional environment variable not set: ${key}`);
    }
    configuration.optional[key] = value;
  });
};
