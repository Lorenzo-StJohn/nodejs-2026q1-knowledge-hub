import { Controller, Get } from '@nestjs/common';
import { AiUsageTrackerService } from './ai-usage-tracker.service';
import {
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { DiagnosticsResponseDto } from './dto/diagnostics-response.dto';

@ApiTags('AI - Diagnostics')
@Controller('ai')
export class AiDiagnosticsController {
  constructor(private readonly usageTracker: AiUsageTrackerService) {}

  @Get('diagnostics')
  @ApiOperation({
    summary: 'Get AI diagnostics',
    description:
      'Returns latency metrics, cache hit ratio, and request statistics per endpoint.',
  })
  @ApiOkResponse({
    description: 'AI diagnostics data',
    type: DiagnosticsResponseDto,
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  getDiagnostics() {
    return {
      timestamp: new Date().toISOString(),
      ...this.usageTracker.getStats(),
    };
  }
}
