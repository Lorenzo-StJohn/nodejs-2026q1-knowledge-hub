import { StatusCodes } from 'http-status-codes';
import { request } from '../lib';

import { articlesRoutes, commentsRoutes } from '../endpoints';

describe('Comments (e2e)', () => {
  const unauthorizedRequest = request;
  const commonHeaders = { Accept: 'application/json' };
  let testArticleId: string | null;
  const COMMENT_NUMBER = 25;

  describe('Pagination', () => {
    const createTestComments = async (count: number): Promise<string[]> => {
      const createdIds: string[] = [];
      const baseContent = `PAGINATION_COMMENT_${Date.now()}_`;

      for (let i = 1; i <= count; i++) {
        const response = await unauthorizedRequest
          .post(commentsRoutes.create)
          .set(commonHeaders)
          .send({
            content: `${baseContent}${i.toString().padStart(3, '0')}`,
            articleId: testArticleId,
            authorId: null,
          });

        expect(response.status).toBe(StatusCodes.CREATED);
        createdIds.push(response.body.id);
      }

      return createdIds;
    };

    const cleanupComments = async (commentIds: string[]) => {
      for (const id of commentIds) {
        await unauthorizedRequest
          .delete(commentsRoutes.delete(id))
          .set(commonHeaders)
          .expect(StatusCodes.NO_CONTENT);
      }
    };

    let testCommentIds: string[] = [];

    beforeAll(async () => {
      const createArticleResponse = await unauthorizedRequest
        .post(articlesRoutes.create)
        .set(commonHeaders)
        .send({
          title: 'TEST_ARTICLE_FOR_COMMENTS',
          content: 'Test content',
          status: 'draft',
          authorId: null,
          categoryId: null,
          tags: [],
        });

      expect(createArticleResponse.status).toBe(StatusCodes.CREATED);
      testArticleId = createArticleResponse.body.id;
      testCommentIds = await createTestComments(COMMENT_NUMBER);
    });

    afterAll(async () => {
      await cleanupComments(testCommentIds);
      if (testArticleId) {
        await unauthorizedRequest
          .delete(articlesRoutes.delete(testArticleId))
          .set(commonHeaders);
        testArticleId = null;
      }
    });

    describe('GET /comments?articleId=... with pagination', () => {
      it('should return array when page and limit are NOT provided (backward compatibility)', async () => {
        const response = await unauthorizedRequest
          .get(commentsRoutes.getByArticle(testArticleId))
          .set(commonHeaders);

        expect(response.status).toBe(StatusCodes.OK);
        expect(response.body).toBeInstanceOf(Array);
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBeGreaterThan(0);
        expect(response.body[0]).toHaveProperty('id');
        expect(response.body[0]).toHaveProperty('content');
        expect(response.body[0]).toHaveProperty('articleId');
      });

      it('should return paginated object when page and limit ARE provided', async () => {
        const response = await unauthorizedRequest
          .get(commentsRoutes.getByArticle(testArticleId))
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
        expect(
          response.body.data.every((c: any) => c.articleId === testArticleId),
        ).toBe(true);
      });

      it('should return correct pagination metadata', async () => {
        const page = 2;
        const limit = 8;

        const response = await unauthorizedRequest
          .get(commentsRoutes.getByArticle(testArticleId))
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
        expect(total).toBeGreaterThanOrEqual(testCommentIds.length);
        expect(Array.isArray(data)).toBe(true);
        expect(data.length).toBeLessThanOrEqual(limit);
      });

      it('should return empty data array for page beyond total pages', async () => {
        const response = await unauthorizedRequest
          .get(commentsRoutes.getByArticle(testArticleId))
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
            .get(commentsRoutes.getByArticle(testArticleId))
            .query(query)
            .set(commonHeaders);

          expect(response.status).toBe(StatusCodes.BAD_REQUEST);
        }
      });

      it('should work correctly with very large limit (within reasonable bounds)', async () => {
        const response = await unauthorizedRequest
          .get(commentsRoutes.getByArticle(testArticleId))
          .query({ page: 1, limit: 50 })
          .set(commonHeaders);

        expect(response.status).toBe(StatusCodes.OK);
        expect(response.body.data.length).toBeLessThanOrEqual(50);
      });
    });
  });

  describe('Sorting', () => {
    const createTestCommentsForSorting = async (
      count: number,
    ): Promise<string[]> => {
      const createdIds: string[] = [];
      const baseContent = `SORT_COMMENT_${Date.now()}_`;

      for (let i = 0; i < count; i++) {
        const response = await unauthorizedRequest
          .post(commentsRoutes.create)
          .set(commonHeaders)
          .send({
            content: `${baseContent}${String.fromCharCode(65 + (i % 26))}${i}`,
            articleId: testArticleId,
            authorId: null,
          });

        expect(response.status).toBe(StatusCodes.CREATED);
        createdIds.push(response.body.id);
      }

      return createdIds;
    };

    const cleanupComments = async (commentIds: string[]) => {
      for (const id of commentIds) {
        await unauthorizedRequest
          .delete(commentsRoutes.delete(id))
          .set(commonHeaders)
          .expect(StatusCodes.NO_CONTENT);
      }
    };

    let testCommentIds: string[] = [];

    beforeAll(async () => {
      const createArticleResponse = await unauthorizedRequest
        .post(articlesRoutes.create)
        .set(commonHeaders)
        .send({
          title: 'TEST_ARTICLE_FOR_COMMENTS',
          content: 'Test content',
          status: 'draft',
          authorId: null,
          categoryId: null,
          tags: [],
        });

      expect(createArticleResponse.status).toBe(StatusCodes.CREATED);
      testArticleId = createArticleResponse.body.id;
      testCommentIds = await createTestCommentsForSorting(COMMENT_NUMBER);
    });

    afterAll(async () => {
      await cleanupComments(testCommentIds);
      if (testArticleId) {
        await unauthorizedRequest
          .delete(articlesRoutes.delete(testArticleId))
          .set(commonHeaders);
        testArticleId = null;
      }
    });

    describe('GET /comments?articleId=... with sorting', () => {
      it('should sort by content ASC', async () => {
        const response = await unauthorizedRequest
          .get(commentsRoutes.getByArticle(testArticleId))
          .query({ sortBy: 'content', order: 'ASC' })
          .set(commonHeaders);

        expect(response.status).toBe(StatusCodes.OK);
        expect(Array.isArray(response.body)).toBe(true);

        const contents = response.body.map((c: any) => c.content);
        const sortedContents = [...contents].sort((a, b) => {
          if (a > b) return 1;
          if (a < b) return -1;
          return 0;
        });
        expect(contents).toEqual(sortedContents);
      });

      it('should sort by content DESC', async () => {
        const response = await unauthorizedRequest
          .get(commentsRoutes.getByArticle(testArticleId))
          .query({ sortBy: 'content', order: 'DESC' })
          .set(commonHeaders);

        expect(response.status).toBe(StatusCodes.OK);

        const contents = response.body.map((c: any) => c.content);
        const sortedContents = [...contents].sort((a, b) => {
          if (a < b) return 1;
          if (a > b) return -1;
          return 0;
        });
        expect(contents).toEqual(sortedContents);
      });

      it('should sort by createdAt ASC', async () => {
        const response = await unauthorizedRequest
          .get(commentsRoutes.getByArticle(testArticleId))
          .query({ sortBy: 'createdAt', order: 'ASC' })
          .set(commonHeaders);

        expect(response.status).toBe(StatusCodes.OK);

        const createdAts = response.body.map((c: any) => c.createdAt);
        const sorted = [...createdAts].sort((a, b) => a - b);
        expect(createdAts).toEqual(sorted);
      });

      it('should sort by createdAt DESC', async () => {
        const response = await unauthorizedRequest
          .get(commentsRoutes.getByArticle(testArticleId))
          .query({ sortBy: 'createdAt', order: 'DESC' })
          .set(commonHeaders);

        expect(response.status).toBe(StatusCodes.OK);

        const createdAts = response.body.map((c: any) => c.createdAt);
        const sorted = [...createdAts].sort((a, b) => b - a);
        expect(createdAts).toEqual(sorted);
      });

      it('should sort by id ASC', async () => {
        const response = await unauthorizedRequest
          .get(commentsRoutes.getByArticle(testArticleId))
          .query({ sortBy: 'id', order: 'ASC' })
          .set(commonHeaders);

        expect(response.status).toBe(StatusCodes.OK);

        const ids = response.body.map((c: any) => c.id);
        const sortedIds = [...ids].sort((a, b) => {
          if (a > b) return 1;
          if (a < b) return -1;
          return 0;
        });
        expect(ids).toEqual(sortedIds);
      });

      it('should combine sorting with pagination correctly', async () => {
        const response = await unauthorizedRequest
          .get(commentsRoutes.getByArticle(testArticleId))
          .query({
            page: 1,
            limit: 5,
            sortBy: 'content',
            order: 'ASC',
          })
          .set(commonHeaders);

        expect(response.status).toBe(StatusCodes.OK);
        expect(response.body).toHaveProperty('data');
        expect(Array.isArray(response.body.data)).toBe(true);

        const contents = response.body.data.map((c: any) => c.content);
        const sortedContents = [...contents].sort((a, b) => {
          if (a > b) return 1;
          if (a < b) return -1;
          return 0;
        });

        expect(contents).toEqual(sortedContents);
        expect(
          response.body.data.every((c: any) => c.articleId === testArticleId),
        ).toBe(true);
      });

      it('should use default settings when sortBy/order not provided', async () => {
        const response = await unauthorizedRequest
          .get(commentsRoutes.getByArticle(testArticleId))
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
            .get(commentsRoutes.getByArticle(testArticleId))
            .query({ sortBy })
            .set(commonHeaders);

          expect(response.status).toBe(StatusCodes.BAD_REQUEST);
        }
      });

      it('should return BAD_REQUEST for invalid order', async () => {
        const invalidOrders = ['asc', 'desc', 'random', 123, ''];

        for (const order of invalidOrders) {
          const response = await unauthorizedRequest
            .get(commentsRoutes.getByArticle(testArticleId))
            .query({ order })
            .set(commonHeaders);

          expect(response.status).toBe(StatusCodes.BAD_REQUEST);
        }
      });

      it('should return BAD_REQUEST if articleId is missing (required field)', async () => {
        const response = await unauthorizedRequest
          .get(commentsRoutes.getByArticle(''))
          .query({ page: 1, limit: 10 })
          .set(commonHeaders);

        expect(response.status).toBe(StatusCodes.BAD_REQUEST);
      });

      it('should ignore unknown query parameters', async () => {
        const response = await unauthorizedRequest
          .get(commentsRoutes.getByArticle(testArticleId))
          .query({ sortBy: 'content', order: 'ASC', unknownParam: '123' })
          .set(commonHeaders);

        expect(response.status).toBe(StatusCodes.OK);
      });
    });
  });
});
