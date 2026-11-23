import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('HTTP API integration', () => {
  let app: INestApplication;
  let agent: ReturnType<typeof request.agent>;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    app.use(cookieParser());
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }));
    await app.init();
    agent = request.agent(app.getHttpServer());
    prisma = app.get(PrismaService);
    await prisma.packages.upsert({
      where: { slug: 'integration-surprise' },
      update: {},
      create: {
        id: 'pkg-integration-surprise', slug: 'integration-surprise', title: 'Integration Surprise', name: 'Integration Surprise', occasion: 'birthday', occasion_label: 'Birthday', category: 'Test', tagline: 'A test package', price: 1499, short_description: 'Integration package', description: 'Integration package for checkout testing', highlights: '[]', inclusions: '[]', features: '[]', addons: JSON.stringify([{ id: 'addon-video', name: 'Video', price: 200 }]),
      },
    });
    await prisma.coupons.upsert({
      where: { code: 'INTEGRATION10' },
      update: { is_active: true, usage_count: 0 },
      create: { id: 'coupon-integration-10', code: 'INTEGRATION10', discount_type: 'PERCENTAGE', discount_value: 10, min_order_value: 0, usage_limit: 100, usage_count: 0, start_date: '2020-01-01', expiry_date: '2030-01-01', is_active: true },
    });
  });

  afterAll(async () => { await app.close(); });

  it('serves liveness and database readiness probes', async () => {
    await request(app.getHttpServer()).get('/api/health/live').expect(200).expect(({ body }) => expect(body.success).toBe(true));
    await request(app.getHttpServer()).get('/api/health/ready').expect(200).expect(({ body }) => expect(body.database).toBe('connected'));
  });

  it('authenticates the seeded administrator and permits protected API access', async () => {
    await agent.post('/api/auth/login').send({ email: 'admin@happinessdeliver.com', password: 'Admin@123456' }).expect(200).expect(({ body, headers }) => { expect(body.data.email).toBe('admin@happinessdeliver.com'); expect(headers['set-cookie']).toBeDefined(); });
    await agent.get('/api/auth/me').expect(200).expect(({ body }) => expect(body.data.roleName).toBe('Super Admin'));
    await agent.get('/api/categories').expect(200).expect(({ body }) => expect(Array.isArray(body.data)).toBe(true));
  });

  it('accepts public contact messages and returns storefront data', async () => {
    await request(app.getHttpServer()).get('/api/storefront/summary').expect(200).expect(({ body }) => expect(body.data).toHaveProperty('packages'));
    await request(app.getHttpServer()).post('/api/storefront/contact').send({ name: 'Integration Test', email: 'integration@example.com', phone: '9000000000', city: 'Mumbai', occasion: 'birthday', message: 'Please call me back about a surprise package.' }).expect(201).expect(({ body }) => expect(body.data.id).toMatch(/^msg-/));
  });

  it('recomputes checkout totals from the catalog instead of client-provided prices', async () => {
    const response = await request(app.getHttpServer()).post('/api/storefront/orders').send({
      customerName: 'Checkout Integration', customerEmail: 'checkout.integration@example.com', customerPhone: '9111111111', recipientName: 'Recipient', recipientPhone: '9222222222', deliveryAddress: '1 Test Street', city: 'Mumbai', pincode: '400001', deliveryDate: '2026-12-01', deliveryTimeSlot: '10:00-12:00',
      couponCode: 'INTEGRATION10', subtotal: 1, addonsTotal: 1, deliveryFee: 1, totalAmount: 1,
      items: [{ packageId: 'pkg-integration-surprise', title: 'Forged title', slug: 'forged', price: 1, quantity: 2, selectedAddons: [{ id: 'addon-video', name: 'Forged add-on', price: 1 }], totalPrice: 1 }],
    }).expect(201);
    expect(response.body.success).toBe(true);
    const order = await prisma.orders.findUniqueOrThrow({ where: { id: response.body.data.id } });
    expect(Number(order.subtotal)).toBe(2998);
    expect(Number(order.addons_total)).toBe(400);
    expect(Number(order.discount_amount)).toBe(339.8);
    expect(Number(order.total_amount)).toBe(3058.2);
  });
});
