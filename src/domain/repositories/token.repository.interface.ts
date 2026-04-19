export interface TokenRepository {
  create(token: string, userId: string, expiresAt: Date): Promise<void>;
  delete(token: string): Promise<void>;
  findByToken(
    token: string,
  ): Promise<{ userId: string; expiresAt: Date } | null>;
  deleteAllByUserId(userId: string): Promise<void>;
}

export const TOKEN_REPOSITORY = 'TOKEN_REPOSITORY' as const;
