export interface AppConfig {
  nodeEnv: string;
  port: number;
  apiPrefix: string;
  corsOrigins: string[];
  auth: {
    jwtSecret: string;
    jwtExpiresIn: string;
    cookieName: string;
    cookieSecure: boolean;
    cookieSameSite: 'lax' | 'strict' | 'none';
  };
  throttle: {
    ttl: number;
    limit: number;
  };
  seed: {
    adminName: string;
    adminEmail: string;
    adminPassword: string;
  };
}

/** Fail fast on invalid or unsafe production configuration. */
export function validateEnvironment(env: Record<string, unknown>): Record<string, unknown> {
  const nodeEnv = String(env.NODE_ENV ?? 'development');
  const port = Number(env.PORT ?? 4000);

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('PORT must be an integer between 1 and 65535.');
  }

  if (nodeEnv === 'production') {
    const required = ['DATABASE_URL', 'JWT_SECRET', 'CORS_ORIGINS', 'INITIAL_ADMIN_PASSWORD'];
    const missing = required.filter((key) => !String(env[key] ?? '').trim());
    if (missing.length > 0) {
      throw new Error(`Missing required production environment variables: ${missing.join(', ')}`);
    }
    if (String(env.JWT_SECRET).length < 32) {
      throw new Error('JWT_SECRET must contain at least 32 characters in production.');
    }
    if (String(env.COOKIE_SECURE ?? 'true').toLowerCase() !== 'true') {
      throw new Error('COOKIE_SECURE must be true in production.');
    }
  }

  return env;
}

const toBool = (value: string | undefined, fallback = false): boolean => {
  if (value === undefined) return fallback;
  return ['1', 'true', 'yes', 'on'].includes(value.toLowerCase());
};

const toList = (value: string | undefined, fallback: string[] = []): string[] => {
  if (!value) return fallback;
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
};

export default (): AppConfig => ({
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: parseInt(process.env.PORT ?? '4000', 10),
  apiPrefix: process.env.API_PREFIX ?? 'api',
  corsOrigins: toList(process.env.CORS_ORIGINS, ['http://localhost:3000', 'http://localhost:3001']),
  auth: {
    jwtSecret: process.env.JWT_SECRET ?? 'change_me_super_secret_jwt_key',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '12h',
    cookieName: process.env.ADMIN_COOKIE_NAME ?? 'hd_admin_session',
    cookieSecure: toBool(process.env.COOKIE_SECURE, process.env.NODE_ENV === 'production'),
    cookieSameSite: (process.env.COOKIE_SAME_SITE as 'lax' | 'strict' | 'none') ?? 'lax',
  },
  throttle: {
    ttl: parseInt(process.env.THROTTLE_TTL ?? '60', 10),
    limit: parseInt(process.env.THROTTLE_LIMIT ?? '120', 10),
  },
  seed: {
    adminName: process.env.INITIAL_ADMIN_NAME ?? 'Vedant Sharma',
    adminEmail: process.env.INITIAL_ADMIN_EMAIL ?? 'admin@happinessdeliver.com',
    adminPassword: process.env.INITIAL_ADMIN_PASSWORD ?? 'Admin@123456',
  },
});
