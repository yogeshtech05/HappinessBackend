# Happiness Deliver API

NestJS API for the storefront and admin applications. The API exposes versioned
routes beneath `/api`, with Swagger at `/api/docs`.

## Production deployment order

1. Set `NODE_ENV=production` and all values in `.env.example`.
2. Use a managed PostgreSQL instance and a strong, unique `JWT_SECRET`.
3. Apply the reviewed Prisma migration: `npm run prisma:migrate:deploy`.
4. Run `npm run seed:prisma` only for a new environment. It never overwrites an
   existing bootstrap admin.
5. Start the API and configure probes:
   - Liveness: `GET /api/health/live`
   - Readiness: `GET /api/health/ready`

The application refuses to start in production if its database URL, CORS
origins, JWT secret, or initial-admin password are missing. It also requires a
32-character-or-longer JWT secret and secure cookies.

## Database policy

`prisma/schema.prisma` and `prisma/migrations/` are the versioned database
contract. Never use `prisma db push` against production. Review generated SQL,
commit it with the feature, and apply it with `prisma migrate deploy`.

The runtime uses Prisma exclusively. Keep schema changes in
`prisma/schema.prisma`, create a reviewed migration for each change, and avoid
runtime schema synchronization.
