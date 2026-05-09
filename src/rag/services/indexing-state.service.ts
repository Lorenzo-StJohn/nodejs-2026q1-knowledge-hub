import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class IndexingStateService {
  constructor(private readonly prisma: PrismaService) {}

  async getLastFullIndexAt(): Promise<Date | null> {
    const state = await this.prisma.ragIndexingState.findFirst();
    return state?.lastFullIndexAt ?? null;
  }

  async updateLastFullIndexAt(date: Date) {
    await this.prisma.ragIndexingState.upsert({
      where: { id: 1 },
      update: { lastFullIndexAt: date },
      create: { id: 1, lastFullIndexAt: date },
    });
  }

  async updateLastIncrementalIndexAt(date: Date) {
    await this.prisma.ragIndexingState.upsert({
      where: { id: 1 },
      update: { lastIncrementalIndexAt: date },
      create: { id: 1, lastIncrementalIndexAt: date },
    });
  }
}
