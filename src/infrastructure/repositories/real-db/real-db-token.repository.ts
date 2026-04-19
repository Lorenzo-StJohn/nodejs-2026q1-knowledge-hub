import { Injectable } from '@nestjs/common';
import { TokenRepository } from 'src/domain/repositories/token.repository.interface';

import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class RealDbTokenRepository implements TokenRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(token: string, userId: string, expiresAt: Date): Promise<void> {
    await this.prisma.refreshToken.create({
      data: {
        token,
        userId,
        expiresAt,
      },
    });
  }

  async delete(token: string): Promise<void> {
    await this.prisma.refreshToken.deleteMany({
      where: { token },
    });
  }

  async findByToken(
    token: string,
  ): Promise<{ userId: string; expiresAt: Date } | null> {
    const refreshToken = await this.prisma.refreshToken.findUnique({
      where: { token },
      select: { userId: true, expiresAt: true },
    });

    return refreshToken;
  }

  async deleteAllByUserId(userId: string): Promise<void> {
    await this.prisma.refreshToken.deleteMany({
      where: { userId },
    });
  }
}
