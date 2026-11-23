import { validateEnvironment } from './configuration';

describe('validateEnvironment', () => {
  const productionEnvironment = {
    NODE_ENV: 'production',
    PORT: '4000',
    DATABASE_URL: 'postgresql://user:password@db:5432/happiness',
    JWT_SECRET: 'a-strong-production-secret-with-at-least-32-characters',
    CORS_ORIGINS: 'https://admin.example.com',
    INITIAL_ADMIN_PASSWORD: 'not-a-default-password',
    COOKIE_SECURE: 'true',
  };

  it('accepts a valid production configuration', () => {
    expect(validateEnvironment(productionEnvironment)).toEqual(productionEnvironment);
  });

  it('rejects a missing production secret', () => {
    expect(() => validateEnvironment({ ...productionEnvironment, JWT_SECRET: '' })).toThrow(
      'JWT_SECRET',
    );
  });

  it('rejects an insecure production cookie', () => {
    expect(() => validateEnvironment({ ...productionEnvironment, COOKIE_SECURE: 'false' })).toThrow(
      'COOKIE_SECURE',
    );
  });

  it('rejects an invalid port in every environment', () => {
    expect(() => validateEnvironment({ NODE_ENV: 'development', PORT: '70000' })).toThrow('PORT');
  });
});
