import { ApiProperty } from '@nestjs/swagger';

class EndpointStatsDto {
  @ApiProperty()
  requests: number;

  @ApiProperty()
  cached: number;

  @ApiProperty({ example: '40.00%' })
  cacheHitRatio: string;

  @ApiProperty()
  totalTokens: number;

  @ApiProperty()
  avgLatencyMs: number;

  @ApiProperty()
  minLatencyMs: number;

  @ApiProperty()
  maxLatencyMs: number;
}

export class UsageStatsResponseDto {
  @ApiProperty()
  totalRequests: number;

  @ApiProperty({ type: () => Object, additionalProperties: { type: 'object' } })
  endpoints: Record<string, EndpointStatsDto>;
}
