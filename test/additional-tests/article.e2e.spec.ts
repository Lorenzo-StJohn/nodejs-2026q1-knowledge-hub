import { request } from '../lib';
import { StatusCodes } from 'http-status-codes';
import { articlesRoutes } from '../endpoints';

const createArticleDto = {
  title: 'TEST_ARTICLE',
  content: 'Test article content',
  status: 'draft',
  authorId: null,
  categoryId: null,
  tags: [],
};

describe('Article (e2e)', () => {
  const unauthorizedRequest = request;
  const commonHeaders = { Accept: 'application/json' };
  const ARTICLE_NUMBER = 25;

  describe('Pagination', () => {
    const createTestArticles = async (count: number): Promise<string[]> => {
      const createdIds: string[] = [];
      const baseTitle = `PAGINATION_TEST_${Date.now()}_`;

      for (let i = 1; i <= count; i++) {
        const response = await unauthorizedRequest
          .post(articlesRoutes.create)
          .set(commonHeaders)
          .send({
            ...createArticleDto,
            title: `${baseTitle}${i.toString().padStart(3, '0')}`,
            status:
              i % 3 === 0 ? 'published' : i % 3 === 1 ? 'draft' : 'archived',
          });

        expect(response.status).toBe(StatusCodes.CREATED);
        createdIds.push(response.body.id);
      }

      return createdIds;
    };

    const cleanupArticles = async (articleIds: string[]) => {
      for (const id of articleIds) {
        await unauthorizedRequest
          .delete(articlesRoutes.delete(id))
          .set(commonHeaders)
          .expect(StatusCodes.NO_CONTENT);
      }
    };

    let testArticleIds: string[] = [];

    beforeAll(async () => {
      testArticleIds = await createTestArticles(ARTICLE_NUMBER);
    });

    afterAll(async () => {
      await cleanupArticles(testArticleIds);
    });

    describe('GET /articles with pagination', () => {
      it('should return array when page and limit are NOT provided (backward compatibility)', async () => {
        const response = await unauthorizedRequest
          .get(articlesRoutes.getAll)
          .set(commonHeaders);

        expect(response.status).toBe(StatusCodes.OK);
        expect(response.body).toBeInstanceOf(Array);
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBeGreaterThan(0);
        expect(response.body[0]).toHaveProperty('id');
        expect(response.body[0]).toHaveProperty('title');
      });

      it('should return paginated object when page and limit ARE provided', async () => {
        const response = await unauthorizedRequest
          .get(articlesRoutes.getAll)
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
          .get(articlesRoutes.getAll)
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
        expect(total).toBeGreaterThanOrEqual(testArticleIds.length);
        expect(Array.isArray(data)).toBe(true);
        expect(data.length).toBeLessThanOrEqual(limit);
      });

      it('should return empty data array for page beyond total pages', async () => {
        const response = await unauthorizedRequest
          .get(articlesRoutes.getAll)
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
            .get(articlesRoutes.getAll)
            .query(query)
            .set(commonHeaders);

          expect(response.status).toBe(StatusCodes.BAD_REQUEST);
        }
      });

      it('should work correctly with very large limit (within reasonable bounds)', async () => {
        const response = await unauthorizedRequest
          .get(articlesRoutes.getAll)
          .query({ page: 1, limit: 50 })
          .set(commonHeaders);

        expect(response.status).toBe(StatusCodes.OK);
        expect(response.body.data.length).toBeLessThanOrEqual(50);
      });
    });
  });

  describe('Sorting', () => {
    const createTestArticlesForSorting = async (
      count: number,
    ): Promise<string[]> => {
      const createdIds: string[] = [];
      const baseTitle = `SORT_TEST_${Date.now()}_`;

      for (let i = 0; i < count; i++) {
        const response = await unauthorizedRequest
          .post(articlesRoutes.create)
          .set(commonHeaders)
          .send({
            ...createArticleDto,
            title: `${baseTitle}${String.fromCharCode(65 + (i % 26))}${i}`,
            status:
              i % 3 === 0 ? 'published' : i % 3 === 1 ? 'draft' : 'archived',
          });

        expect(response.status).toBe(StatusCodes.CREATED);
        createdIds.push(response.body.id);
      }

      return createdIds;
    };

    const cleanupArticles = async (articleIds: string[]) => {
      for (const id of articleIds) {
        await unauthorizedRequest
          .delete(articlesRoutes.delete(id))
          .set(commonHeaders)
          .expect(StatusCodes.NO_CONTENT);
      }
    };

    let testArticleIds: string[] = [];

    beforeAll(async () => {
      testArticleIds = await createTestArticlesForSorting(ARTICLE_NUMBER);
    });

    afterAll(async () => {
      await cleanupArticles(testArticleIds);
    });

    describe('GET /articles with sorting', () => {
      it('should sort by title ASC', async () => {
        const response = await unauthorizedRequest
          .get(articlesRoutes.getAll)
          .query({ sortBy: 'title', order: 'ASC' })
          .set(commonHeaders);

        expect(response.status).toBe(StatusCodes.OK);
        expect(Array.isArray(response.body)).toBe(true);

        const titles = response.body.map((a: any) => a.title);
        const sortedTitles = [...titles].sort((a, b) => a.localeCompare(b));
        expect(titles).toEqual(sortedTitles);
      });

      it('should sort by title DESC', async () => {
        const response = await unauthorizedRequest
          .get(articlesRoutes.getAll)
          .query({ sortBy: 'title', order: 'DESC' })
          .set(commonHeaders);

        expect(response.status).toBe(StatusCodes.OK);

        const titles = response.body.map((a: any) => a.title);
        const sortedTitles = [...titles].sort((a, b) => b.localeCompare(a));
        expect(titles).toEqual(sortedTitles);
      });

      it('should sort by createdAt ASC', async () => {
        const response = await unauthorizedRequest
          .get(articlesRoutes.getAll)
          .query({ sortBy: 'createdAt', order: 'ASC' })
          .set(commonHeaders);

        expect(response.status).toBe(StatusCodes.OK);

        const createdAts = response.body.map((a: any) => a.createdAt);
        const sorted = [...createdAts].sort((a, b) => a - b);
        expect(createdAts).toEqual(sorted);
      });

      it('should sort by createdAt DESC', async () => {
        const response = await unauthorizedRequest
          .get(articlesRoutes.getAll)
          .query({ sortBy: 'createdAt', order: 'DESC' })
          .set(commonHeaders);

        expect(response.status).toBe(StatusCodes.OK);

        const createdAts = response.body.map((a: any) => a.createdAt);
        const sorted = [...createdAts].sort((a, b) => b - a);
        expect(createdAts).toEqual(sorted);
      });

      it('should sort by status ASC', async () => {
        const response = await unauthorizedRequest
          .get(articlesRoutes.getAll)
          .query({ sortBy: 'status', order: 'ASC' })
          .set(commonHeaders);

        expect(response.status).toBe(StatusCodes.OK);

        const statuses = response.body.map((a: any) => a.status);
        const sorted = [...statuses].sort((a, b) => a.localeCompare(b));
        expect(statuses).toEqual(sorted);
      });

      it('should sort by updatedAt DESC', async () => {
        const articleToUpdate = testArticleIds[0];
        await unauthorizedRequest
          .put(articlesRoutes.update(articleToUpdate))
          .set(commonHeaders)
          .send({ title: 'UPDATED_FOR_SORT_TEST', content: 'Updated content' })
          .expect(StatusCodes.OK);

        const response = await unauthorizedRequest
          .get(articlesRoutes.getAll)
          .query({ sortBy: 'updatedAt', order: 'DESC' })
          .set(commonHeaders);

        expect(response.status).toBe(StatusCodes.OK);

        const updatedAts = response.body.map((a: any) => a.updatedAt);
        const sorted = [...updatedAts].sort((a, b) => b - a);
        expect(updatedAts).toEqual(sorted);
      });

      it('should combine sorting with pagination correctly', async () => {
        const response = await unauthorizedRequest
          .get(articlesRoutes.getAll)
          .query({
            page: 1,
            limit: 5,
            sortBy: 'title',
            order: 'ASC',
          })
          .set(commonHeaders);

        expect(response.status).toBe(StatusCodes.OK);
        expect(response.body).toHaveProperty('data');
        expect(Array.isArray(response.body.data)).toBe(true);

        const titles = response.body.data.map((a: any) => a.title);
        const sortedTitles = [...titles].sort((a, b) => a.localeCompare(b));

        expect(titles).toEqual(sortedTitles);
      });

      it('should use default settings when sortBy/order not provided', async () => {
        const response = await unauthorizedRequest
          .get(articlesRoutes.getAll)
          .set(commonHeaders);

        expect(response.status).toBe(StatusCodes.OK);
        expect(Array.isArray(response.body)).toBe(true);
      });

      it('should return BAD_REQUEST for invalid sortBy', async () => {
        const invalidSortBy = [
          'unknownField',
          'password',
          'tags',
          '',
          123,
          null,
        ];

        for (const sortBy of invalidSortBy) {
          const response = await unauthorizedRequest
            .get(articlesRoutes.getAll)
            .query({ sortBy })
            .set(commonHeaders);

          expect(response.status).toBe(StatusCodes.BAD_REQUEST);
        }
      });

      it('should return BAD_REQUEST for invalid order', async () => {
        const invalidOrders = ['asc', 'desc', 'random', 123, ''];

        for (const order of invalidOrders) {
          const response = await unauthorizedRequest
            .get(articlesRoutes.getAll)
            .query({ order })
            .set(commonHeaders);

          expect(response.status).toBe(StatusCodes.BAD_REQUEST);
        }
      });

      it('should ignore unknown query parameters', async () => {
        const response = await unauthorizedRequest
          .get(articlesRoutes.getAll)
          .query({ sortBy: 'title', order: 'ASC', unknownParam: '123' })
          .set(commonHeaders);

        expect(response.status).toBe(StatusCodes.OK);
      });
    });
  });
});
