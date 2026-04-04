import { StatusCodes } from 'http-status-codes';
import { request } from '../lib';
import { usersRoutes } from '../endpoints';

describe('User (e2e)', () => {
  const unauthorizedRequest = request;
  const commonHeaders = { Accept: 'application/json' };
  const USER_NUMBER = 25;

  describe('Pagination', () => {
    const createTestUsers = async (count: number): Promise<string[]> => {
      const createdIds: string[] = [];

      for (let i = 1; i <= count; i++) {
        const response = await unauthorizedRequest
          .post(usersRoutes.create)
          .set(commonHeaders)
          .send({
            login: `TEST_USER_PAGINATION_${i}_${Date.now()}`,
            password: 'TEST_PASSWORD',
          });

        expect(response.status).toBe(StatusCodes.CREATED);
        createdIds.push(response.body.id);
      }

      return createdIds;
    };

    const cleanupUsers = async (userIds: string[]) => {
      for (const id of userIds) {
        await unauthorizedRequest
          .delete(usersRoutes.delete(id))
          .set(commonHeaders)
          .expect(StatusCodes.NO_CONTENT);
      }
    };

    let testUserIds: string[] = [];

    beforeAll(async () => {
      testUserIds = await createTestUsers(USER_NUMBER);
    });

    afterAll(async () => {
      await cleanupUsers(testUserIds);
    });

    describe('GET /users with pagination', () => {
      it('should return array when page and limit are NOT provided (backward compatibility)', async () => {
        const response = await unauthorizedRequest
          .get(usersRoutes.getAll)
          .set(commonHeaders);

        expect(response.status).toBe(StatusCodes.OK);
        expect(response.body).toBeInstanceOf(Array);
        expect(Array.isArray(response.body)).toBe(true);

        expect(response.body.length).toBeGreaterThan(0);
        expect(response.body[0]).toHaveProperty('id');
        expect(response.body[0]).toHaveProperty('login');
      });

      it('should return paginated object when page and limit ARE provided', async () => {
        const response = await unauthorizedRequest
          .get(usersRoutes.getAll)
          .query({ page: 1, limit: 10 })
          .set(commonHeaders);

        expect(response.status).toBe(StatusCodes.OK);
        expect(response.body).toBeInstanceOf(Object);
        expect(response.body).not.toBeInstanceOf(Array);

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
        const limit = 7;

        const response = await unauthorizedRequest
          .get(usersRoutes.getAll)
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
        expect(total).toBeGreaterThanOrEqual(testUserIds.length);
        expect(Array.isArray(data)).toBe(true);
        expect(data.length).toBeLessThanOrEqual(limit);
      });

      it('should return first page by default if page=1', async () => {
        const response = await unauthorizedRequest
          .get(usersRoutes.getAll)
          .query({ page: 1, limit: 5 })
          .set(commonHeaders);

        expect(response.body.page).toBe(1);
        expect(response.body.data.length).toBeLessThanOrEqual(5);
      });

      it('should return empty data array when page is too large', async () => {
        const response = await unauthorizedRequest
          .get(usersRoutes.getAll)
          .query({ page: 9999, limit: 10 })
          .set(commonHeaders);

        expect(response.status).toBe(StatusCodes.OK);
        expect(response.body.data).toEqual([]);
        expect(response.body.total).toBeGreaterThan(0);
        expect(response.body.page).toBe(9999);
      });

      it('should return BAD_REQUEST for invalid page or limit values', async () => {
        const invalidCases = [
          { page: -1, limit: 10 },
          { page: 1, limit: -5 },
          { page: 'abc', limit: 10 },
          { page: 1, limit: 'xyz' },
          { page: 1, limit: 0 },
        ];

        for (const query of invalidCases) {
          const response = await unauthorizedRequest
            .get(usersRoutes.getAll)
            .query(query)
            .set(commonHeaders);

          expect(response.status).toBe(StatusCodes.BAD_REQUEST);
        }
      });

      it('should return all users when limit is very large (but within allowed max)', async () => {
        const response = await unauthorizedRequest
          .get(usersRoutes.getAll)
          .query({ page: 1, limit: 50 })
          .set(commonHeaders);

        expect(response.status).toBe(StatusCodes.OK);
        expect(response.body.data.length).toBeGreaterThanOrEqual(
          Math.min(25, testUserIds.length),
        );
      });
    });
  });

  describe('Sorting', () => {
    const createTestUsersForSorting = async (
      count: number,
    ): Promise<string[]> => {
      const createdIds: string[] = [];
      const baseLogin = `SORT_TEST_${Date.now()}_`;

      for (let i = 0; i < count; i++) {
        const login = `${baseLogin}${String.fromCharCode(65 + (i % 26))}${i}`;

        const response = await unauthorizedRequest
          .post(usersRoutes.create)
          .set(commonHeaders)
          .send({
            login,
            password: 'TEST_PASSWORD',
          });

        expect(response.status).toBe(StatusCodes.CREATED);
        createdIds.push(response.body.id);
      }

      return createdIds;
    };

    const cleanupUsers = async (userIds: string[]) => {
      for (const id of userIds) {
        await unauthorizedRequest
          .delete(usersRoutes.delete(id))
          .set(commonHeaders)
          .expect(StatusCodes.NO_CONTENT);
      }
    };

    let testUserIds: string[] = [];

    beforeAll(async () => {
      testUserIds = await createTestUsersForSorting(USER_NUMBER);
    });

    afterAll(async () => {
      await cleanupUsers(testUserIds);
    });

    describe('GET /users with sorting', () => {
      it('should sort by login ASC (explicit)', async () => {
        const response = await unauthorizedRequest
          .get(usersRoutes.getAll)
          .query({ sortBy: 'login', order: 'ASC' })
          .set(commonHeaders);

        expect(response.status).toBe(StatusCodes.OK);
        expect(Array.isArray(response.body)).toBe(true);

        const logins = response.body.map((user: any) => user.login);
        const sortedLogins = [...logins].sort((a, b) => a.localeCompare(b));

        expect(logins).toEqual(sortedLogins);
      });

      it('should sort by login DESC', async () => {
        const response = await unauthorizedRequest
          .get(usersRoutes.getAll)
          .query({ sortBy: 'login', order: 'DESC' })
          .set(commonHeaders);

        expect(response.status).toBe(StatusCodes.OK);

        const logins = response.body.map((user: any) => user.login);
        const sortedLogins = [...logins].sort((a, b) => b.localeCompare(a));

        expect(logins).toEqual(sortedLogins);
      });

      it('should sort by createdAt ASC', async () => {
        const response = await unauthorizedRequest
          .get(usersRoutes.getAll)
          .query({ sortBy: 'createdAt', order: 'ASC' })
          .set(commonHeaders);

        expect(response.status).toBe(StatusCodes.OK);

        const createdAts = response.body.map((user: any) => user.createdAt);
        const sortedCreatedAts = [...createdAts].sort((a, b) => a - b);

        expect(createdAts).toEqual(sortedCreatedAts);
      });

      it('should sort by createdAt DESC', async () => {
        const response = await unauthorizedRequest
          .get(usersRoutes.getAll)
          .query({ sortBy: 'createdAt', order: 'DESC' })
          .set(commonHeaders);

        expect(response.status).toBe(StatusCodes.OK);

        const createdAts = response.body.map((user: any) => user.createdAt);
        const sortedCreatedAts = [...createdAts].sort((a, b) => b - a);

        expect(createdAts).toEqual(sortedCreatedAts);
      });

      it('should sort by id ASC', async () => {
        const response = await unauthorizedRequest
          .get(usersRoutes.getAll)
          .query({ sortBy: 'id', order: 'ASC' })
          .set(commonHeaders);

        expect(response.status).toBe(StatusCodes.OK);

        const ids = response.body.map((user: any) => user.id);
        const sortedIds = [...ids].sort((a, b) => a.localeCompare(b));

        expect(ids).toEqual(sortedIds);
      });

      it('should sort by id DESC', async () => {
        const response = await unauthorizedRequest
          .get(usersRoutes.getAll)
          .query({ sortBy: 'id', order: 'DESC' })
          .set(commonHeaders);

        expect(response.status).toBe(StatusCodes.OK);

        const ids = response.body.map((user: any) => user.id);
        const sortedIds = [...ids].sort((a, b) => b.localeCompare(a));

        expect(ids).toEqual(sortedIds);
      });

      it('should sort by role (all users have same role)', async () => {
        const response = await unauthorizedRequest
          .get(usersRoutes.getAll)
          .query({ sortBy: 'role', order: 'ASC' })
          .set(commonHeaders);

        expect(response.status).toBe(StatusCodes.OK);
        expect(response.body.every((u: any) => u.role === 'viewer')).toBe(true);
      });

      it('should sort by updatedAt ASC/DESC', async () => {
        const userToUpdate = testUserIds[0];
        await unauthorizedRequest
          .put(usersRoutes.update(userToUpdate))
          .set(commonHeaders)
          .send({
            oldPassword: 'TEST_PASSWORD',
            newPassword: 'NEW_PASSWORD_123',
          })
          .expect(StatusCodes.OK);

        const responseAsc = await unauthorizedRequest
          .get(usersRoutes.getAll)
          .query({ sortBy: 'updatedAt', order: 'ASC' })
          .set(commonHeaders);

        const updatedAtsAsc = responseAsc.body.map((u: any) => u.updatedAt);
        expect(updatedAtsAsc).toEqual([...updatedAtsAsc].sort((a, b) => a - b));

        const responseDesc = await unauthorizedRequest
          .get(usersRoutes.getAll)
          .query({ sortBy: 'updatedAt', order: 'DESC' })
          .set(commonHeaders);

        const updatedAtsDesc = responseDesc.body.map((u: any) => u.updatedAt);
        expect(updatedAtsDesc).toEqual(
          [...updatedAtsDesc].sort((a, b) => b - a),
        );
      });

      it('should use default settings when sortBy/order not provided', async () => {
        const response = await unauthorizedRequest
          .get(usersRoutes.getAll)
          .set(commonHeaders);

        expect(response.status).toBe(StatusCodes.OK);
        expect(Array.isArray(response.body)).toBe(true);
      });

      it('should combine sorting with pagination correctly', async () => {
        const response = await unauthorizedRequest
          .get(usersRoutes.getAll)
          .query({
            page: 1,
            limit: 5,
            sortBy: 'login',
            order: 'ASC',
          })
          .set(commonHeaders);

        expect(response.status).toBe(StatusCodes.OK);
        expect(response.body).toHaveProperty('data');
        expect(Array.isArray(response.body.data)).toBe(true);

        const logins = response.body.data.map((user: any) => user.login);
        const sortedLogins = [...logins].sort((a, b) => a.localeCompare(b));

        expect(logins).toEqual(sortedLogins);
        expect(response.body.page).toBe(1);
        expect(response.body.limit).toBe(5);
      });

      it('should return BAD_REQUEST for invalid sortBy', async () => {
        const invalidSortBy = ['unknownField', 'password', '', 123];

        for (const sortBy of invalidSortBy) {
          const response = await unauthorizedRequest
            .get(usersRoutes.getAll)
            .query({ sortBy })
            .set(commonHeaders);

          expect(response.status).toBe(StatusCodes.BAD_REQUEST);
        }
      });

      it('should return BAD_REQUEST for invalid order', async () => {
        const invalidOrders = ['asc', 'desc', 'RANDOM', 123, ''];

        for (const order of invalidOrders) {
          const response = await unauthorizedRequest
            .get(usersRoutes.getAll)
            .query({ order })
            .set(commonHeaders);

          expect(response.status).toBe(StatusCodes.BAD_REQUEST);
        }
      });

      it('should ignore unknown query parameters (no error)', async () => {
        const response = await unauthorizedRequest
          .get(usersRoutes.getAll)
          .query({ sortBy: 'login', order: 'ASC', unknownParam: 'test' })
          .set(commonHeaders);

        expect(response.status).toBe(StatusCodes.OK);
      });
    });
  });
});
