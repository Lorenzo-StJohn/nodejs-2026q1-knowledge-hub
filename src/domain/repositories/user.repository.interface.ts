import type { UserInterface } from '../entities/user.interface';

export interface UserRepository {
  findAll(): Promise<UserInterface[]>;
  findById(id: string): Promise<UserInterface | null>;
  create(user: UserInterface): Promise<UserInterface>;
  update(id: string, user: UserInterface): Promise<UserInterface>;
  delete(id: string): Promise<void>;
}

export const USER_REPOSITORY = 'USER_REPOSITORY' as const;
