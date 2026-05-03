import { Controller, Get } from '@nestjs/common';
import { AiUsageTrackerService } from './ai-usage-tracker.service';

@Controller('ai')
export class AiDiagnosticsController {
  constructor(private readonly usageTracker: AiUsageTrackerService) {}

  @Get('diagnostics')
  getDiagnostics() {
    return {
      timestamp: new Date().toISOString(),
      ...this.usageTracker.getStats(),
    };
  }
}
