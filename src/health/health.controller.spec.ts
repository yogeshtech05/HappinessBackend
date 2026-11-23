import { ServiceUnavailableException } from '@nestjs/common';
import { HealthController } from './health.controller';

describe('HealthController', () => {
  it('returns a live response without a database call', () => {
    const query = jest.fn();
    const controller = new HealthController({ $queryRawUnsafe: query } as never);

    expect(controller.live().status).toBe('ok');
    expect(query).not.toHaveBeenCalled();
  });

  it('reports readiness when the database is available', async () => {
    const query = jest.fn().mockResolvedValue([{ '?column?': 1 }]);
    const controller = new HealthController({ $queryRawUnsafe: query } as never);

    await expect(controller.ready()).resolves.toEqual({ status: 'ok', database: 'connected' });
    expect(query).toHaveBeenCalledWith('SELECT 1');
  });

  it('returns service unavailable when the database cannot be queried', async () => {
    const controller = new HealthController({ $queryRawUnsafe: jest.fn().mockRejectedValue(new Error()) } as never);

    await expect(controller.ready()).rejects.toBeInstanceOf(ServiceUnavailableException);
  });
});
