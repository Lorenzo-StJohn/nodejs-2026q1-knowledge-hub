export const UserRole = {
  ADMIN: 'admin',
  EDITOR: 'editor',
  VIEWER: 'viewer',
} as const;

export interface UserInterface {
  id: string;
  login: string;
  password: string;
  role: (typeof UserRole)[keyof typeof UserRole];
  createdAt: number;
  updatedAt: number;
}
