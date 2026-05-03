// ai-stats.controller.ts
import { Controller, Get } from '@nestjs/common';
import { AiUsageTrackerService } from './ai-usage-tracker.service';

@Controller('ai')
export class AiStatsController {
  constructor(private readonly usageTracker: AiUsageTrackerService) {}

  @Get('usage')
  getUsage() {
    return this.usageTracker.getStats();
  }
}
