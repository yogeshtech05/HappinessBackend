import { CategoriesService } from './categories.service';

describe('CategoriesService', () => {
  it('maps Prisma snake_case fields to the API contract', async () => {
    const findMany = jest.fn().mockResolvedValue([
      {
        id: 'cat-1', name: 'Birthday', slug: 'birthday', tagline: null, icon: 'Cake',
        package_count: 2, gradient: null, accent_color: '#e11d48', created_at: new Date(),
      },
    ]);
    const service = new CategoriesService({ categories: { findMany } } as never);

    await expect(service.findAll()).resolves.toMatchObject([
      { id: 'cat-1', packageCount: 2, accentColor: '#e11d48' },
    ]);
    expect(findMany).toHaveBeenCalledWith({ orderBy: { created_at: 'asc' } });
  });
});
