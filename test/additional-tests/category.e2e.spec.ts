import { request } from '../lib';
import { StatusCodes } from 'http-status-codes';
import { categoriesRoutes } from '../endpoints';

describe('Category (e2e)', () => {
  const unauthorizedRequest = request;
  const commonHeaders = { Accept: 'application/json' };
  const CATEGORY_NUMBER = 25;

  describe('Pagination', () => {
    const createTestCategories = async (count: number): Promise<string[]> => {
      const createdIds: string[] = [];
      const baseName = `PAGINATION_TEST_${Date.now()}_`;

      for (let i = 1; i <= count; i++) {
        const response = await unauthorizedRequest
          .post(categoriesRoutes.create)
          .set(commonHeaders)
          .send({
            name: `${baseName}${i.toString().padStart(3, '0')}`,
            description: `Test description for category ${i}`,
          });

        expect(response.status).toBe(StatusCodes.CREATED);
        createdIds.push(response.body.id);
      }

      return createdIds;
    };

    const cleanupCategories = async (categoryIds: string[]) => {
      for (const id of categoryIds) {
        await unauthorizedRequest
          .delete(categoriesRoutes.delete(id))
          .set(commonHeaders)
          .expect(StatusCodes.NO_CONTENT);
      }
    };

    let testCategoryIds: string[] = [];

    beforeAll(async () => {
      testCategoryIds = await createTestCategories(CATEGORY_NUMBER);
    });

    afterAll(async () => {
      await cleanupCategories(testCategoryIds);
    });

    describe('GET /categories with pagination', () => {
      it('should return array when page and limit are NOT provided (backward compatibility)', async () => {
        const response = await unauthorizedRequest
          .get(categoriesRoutes.getAll)
          .set(commonHeaders);

        expect(response.status).toBe(StatusCodes.OK);
        expect(response.body).toBeInstanceOf(Array);
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBeGreaterThan(0);
        expect(response.body[0]).toHaveProperty('id');
        expect(response.body[0]).toHaveProperty('name');
      });

      it('should return paginated object when page and limit ARE provided', async () => {
        const response = await unauthorizedRequest
          .get(categoriesRoutes.getAll)
          .query({ page: 1, limit: 10 })
          .set(commonHeaders);

        expect(response.status).toBe(StatusCodes.OK);
        expect(response.body).toBeInstanceOf(Object);
        expect(Array.isArray(response.body)).toBe(false);

        expect(response.body).toHaveProperty('total');
        expect(response.body).toHaveProperty('page');
        expect(response.body).toHaveProperty('limit');
        expect(response.body).toHaveProperty('data');

        expect(typeof response.body.total).toBe('number');
        expect(typeof response.body.page).toBe('number');
        expect(typeof response.body.limit).toBe('number');
        expect(Array.isArray(response.body.data)).toBe(true);

        expect(response.body.page).toBe(1);
        expect(response.body.limit).toBe(10);
        expect(response.body.data.length).toBeLessThanOrEqual(10);
      });

      it('should return correct pagination metadata', async () => {
        const page = 2;
        const limit = 8;

        const response = await unauthorizedRequest
          .get(categoriesRoutes.getAll)
          .query({ page, limit })
          .set(commonHeaders);

        expect(response.status).toBe(StatusCodes.OK);

        const {
          total,
          page: returnedPage,
          limit: returnedLimit,
          data,
        } = response.body;

        expect(returnedPage).toBe(page);
        expect(returnedLimit).toBe(limit);
        expect(typeof total).toBe('number');
        expect(total).toBeGreaterThanOrEqual(testCategoryIds.length);
        expect(Array.isArray(data)).toBe(true);
        expect(data.length).toBeLessThanOrEqual(limit);
      });

      it('should return empty data array for page beyond total pages', async () => {
        const response = await unauthorizedRequest
          .get(categoriesRoutes.getAll)
          .query({ page: 9999, limit: 10 })
          .set(commonHeaders);

        expect(response.status).toBe(StatusCodes.OK);
        expect(response.body.data).toEqual([]);
        expect(response.body.total).toBeGreaterThan(0);
      });

      it('should return BAD_REQUEST for invalid pagination parameters', async () => {
        const invalidCases = [
          { page: -1, limit: 10 },
          { page: 1, limit: -5 },
          { page: 'abc', limit: 10 },
          { page: 1, limit: 'xyz' },
          { page: 1, limit: 0 },
        ];

        for (const query of invalidCases) {
          const response = await unauthorizedRequest
            .get(categoriesRoutes.getAll)
            .query(query)
            .set(commonHeaders);

          expect(response.status).toBe(StatusCodes.BAD_REQUEST);
        }
      });

      it('should work correctly with very large limit (within reasonable bounds)', async () => {
        const response = await unauthorizedRequest
          .get(categoriesRoutes.getAll)
          .query({ page: 1, limit: 50 })
          .set(commonHeaders);

        expect(response.status).toBe(StatusCodes.OK);
        expect(response.body.data.length).toBeLessThanOrEqual(50);
      });
    });
  });

  describe('Sorting', () => {
    const createTestCategoriesForSorting = async (
      count: number,
    ): Promise<string[]> => {
      const createdIds: string[] = [];
      const baseName = `SORT_TEST_${Date.now()}_`;

      for (let i = 0; i < count; i++) {
        const response = await unauthorizedRequest
          .post(categoriesRoutes.create)
          .set(commonHeaders)
          .send({
            name: `${baseName}${String.fromCharCode(65 + (i % 26))}${i}`,
            description: `Description for sorting test ${i}`,
          });

        expect(response.status).toBe(StatusCodes.CREATED);
        createdIds.push(response.body.id);
      }

      return createdIds;
    };

    const cleanupCategories = async (categoryIds: string[]) => {
      for (const id of categoryIds) {
        await unauthorizedRequest
          .delete(categoriesRoutes.delete(id))
          .set(commonHeaders)
          .expect(StatusCodes.NO_CONTENT);
      }
    };

    let testCategoryIds: string[] = [];

    beforeAll(async () => {
      testCategoryIds = await createTestCategoriesForSorting(CATEGORY_NUMBER);
    });

    afterAll(async () => {
      await cleanupCategories(testCategoryIds);
    });

    describe('GET /categories with sorting', () => {
      it('should sort by name ASC', async () => {
        const response = await unauthorizedRequest
          .get(categoriesRoutes.getAll)
          .query({ sortBy: 'name', order: 'ASC' })
          .set(commonHeaders);

        expect(response.status).toBe(StatusCodes.OK);
        expect(Array.isArray(response.body)).toBe(true);

        const names = response.body.map((c: any) => c.name);
        const sortedNames = [...names].sort((a, b) => a.localeCompare(b));
        expect(names).toEqual(sortedNames);
      });

      it('should sort by name DESC', async () => {
        const response = await unauthorizedRequest
          .get(categoriesRoutes.getAll)
          .query({ sortBy: 'name', order: 'DESC' })
          .set(commonHeaders);

        expect(response.status).toBe(StatusCodes.OK);

        const names = response.body.map((c: any) => c.name);
        const sortedNames = [...names].sort((a, b) => b.localeCompare(a));
        expect(names).toEqual(sortedNames);
      });

      it('should sort by id ASC', async () => {
        const response = await unauthorizedRequest
          .get(categoriesRoutes.getAll)
          .query({ sortBy: 'id', order: 'ASC' })
          .set(commonHeaders);

        expect(response.status).toBe(StatusCodes.OK);

        const ids = response.body.map((c: any) => c.id);
        const sortedIds = [...ids].sort((a, b) => a.localeCompare(b));
        expect(ids).toEqual(sortedIds);
      });

      it('should sort by id DESC', async () => {
        const response = await unauthorizedRequest
          .get(categoriesRoutes.getAll)
          .query({ sortBy: 'id', order: 'DESC' })
          .set(commonHeaders);

        expect(response.status).toBe(StatusCodes.OK);

        const ids = response.body.map((c: any) => c.id);
        const sortedIds = [...ids].sort((a, b) => b.localeCompare(a));
        expect(ids).toEqual(sortedIds);
      });

      it('should sort by description ASC', async () => {
        const response = await unauthorizedRequest
          .get(categoriesRoutes.getAll)
          .query({ sortBy: 'description', order: 'ASC' })
          .set(commonHeaders);

        expect(response.status).toBe(StatusCodes.OK);

        const descriptions = response.body.map((c: any) => c.description);
        const sorted = [...descriptions].sort((a, b) => a.localeCompare(b));
        expect(descriptions).toEqual(sorted);
      });

      it('should combine sorting with pagination correctly', async () => {
        const response = await unauthorizedRequest
          .get(categoriesRoutes.getAll)
          .query({
            page: 1,
            limit: 5,
            sortBy: 'name',
            order: 'ASC',
          })
          .set(commonHeaders);

        expect(response.status).toBe(StatusCodes.OK);
        expect(response.body).toHaveProperty('data');
        expect(Array.isArray(response.body.data)).toBe(true);

        const names = response.body.data.map((c: any) => c.name);
        const sortedNames = [...names].sort((a, b) => a.localeCompare(b));

        expect(names).toEqual(sortedNames);
      });

      it('should use default settings when sortBy/order not provided', async () => {
        const response = await unauthorizedRequest
          .get(categoriesRoutes.getAll)
          .set(commonHeaders);

        expect(response.status).toBe(StatusCodes.OK);
        expect(Array.isArray(response.body)).toBe(true);
      });

      it('should return BAD_REQUEST for invalid sortBy', async () => {
        const invalidSortBy = [
          'unknownField',
          'status',
          'title',
          '',
          123,
          null,
        ];

        for (const sortBy of invalidSortBy) {
          const response = await unauthorizedRequest
            .get(categoriesRoutes.getAll)
            .query({ sortBy })
            .set(commonHeaders);

          expect(response.status).toBe(StatusCodes.BAD_REQUEST);
        }
      });

      it('should return BAD_REQUEST for invalid order', async () => {
        const invalidOrders = ['asc', 'desc', 'random', 123, ''];

        for (const order of invalidOrders) {
          const response = await unauthorizedRequest
            .get(categoriesRoutes.getAll)
            .query({ order })
            .set(commonHeaders);

          expect(response.status).toBe(StatusCodes.BAD_REQUEST);
        }
      });

      it('should ignore unknown query parameters', async () => {
        const response = await unauthorizedRequest
          .get(categoriesRoutes.getAll)
          .query({ sortBy: 'name', order: 'ASC', unknownParam: '123' })
          .set(commonHeaders);

        expect(response.status).toBe(StatusCodes.OK);
      });
    });
  });
});
