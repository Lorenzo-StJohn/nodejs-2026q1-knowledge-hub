import { Role } from '@prisma/client';

export interface UserInterface {
  id: string;
  login: string;
  password: string;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
}
