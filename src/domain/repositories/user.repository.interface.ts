import type { FilterInterface } from 'src/common/entities/filter.interface';
import type { UserInterface } from '../entities/user.interface';
import { PaginatedResponse } from 'src/common/entities/paginated-response.interface';

export interface UserRepository {
  findAll(filter: FilterInterface): Promise<PaginatedResponse<UserInterface>>;
  findById(id: string): Promise<UserInterface | null>;
  create(user: UserInterface): Promise<UserInterface>;
  update(id: string, user: UserInterface): Promise<UserInterface>;
  delete(id: string): Promise<void>;
}

export const USER_REPOSITORY = 'USER_REPOSITORY' as const;
