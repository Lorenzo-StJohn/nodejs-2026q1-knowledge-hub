import type { FilterInterface } from 'src/common/entities/filter.interface';
import type { UserInterface } from '../entities/user.interface';
import { PaginatedResponse } from 'src/common/entities/paginated-response.interface';
import { SortInterface } from 'src/common/entities/sort.interface';
import { UserFields } from 'src/modules/user/dto/find-user-query.dto';

export interface UserFilters
  extends FilterInterface,
    SortInterface<typeof UserFields> {}

export interface UserRepository {
  findAll(filters: UserFilters): Promise<PaginatedResponse<UserInterface>>;
  findById(id: string): Promise<UserInterface | null>;
  create(user: UserInterface): Promise<UserInterface>;
  update(id: string, user: UserInterface): Promise<UserInterface>;
  delete(id: string): Promise<void>;
}

export const USER_REPOSITORY = 'USER_REPOSITORY' as const;
