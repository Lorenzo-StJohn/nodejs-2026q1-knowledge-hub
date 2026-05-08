import { Controller, Get } from '@nestjs/common';
import { AiUsageTrackerService } from './ai-usage-tracker.service';
import {
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { UsageStatsResponseDto } from './dto/usage-stats-response.dto';

@ApiTags('AI - Stats')
@Controller('ai')
export class AiStatsController {
  constructor(private readonly usageTracker: AiUsageTrackerService) {}

  @Get('usage')
  @ApiOperation({ summary: 'Get AI usage statistics and observability data' })
  @ApiOkResponse({
    description: 'AI usage metrics',
    type: UsageStatsResponseDto,
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  getUsage() {
    return this.usageTracker.getStats();
  }
}
