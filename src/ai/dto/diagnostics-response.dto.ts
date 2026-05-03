import { ApiProperty } from '@nestjs/swagger';

class EndpointStatsDto {
  @ApiProperty({ example: 10 })
  requests: number;

  @ApiProperty({ example: 4 })
  cached: number;

  @ApiProperty({ example: '40.00%' })
  cacheHitRatio: string;

  @ApiProperty({ example: 1500 })
  totalTokens: number;

  @ApiProperty({ example: 1230.5 })
  avgLatencyMs: number;

  @ApiProperty({ example: 980 })
  minLatencyMs: number;

  @ApiProperty({ example: 2100 })
  maxLatencyMs: number;
}

export class DiagnosticsResponseDto {
  @ApiProperty({ example: '2026-05-03T20:00:00.000Z' })
  timestamp: string;

  @ApiProperty({ example: 10 })
  totalRequests: number;

  @ApiProperty({
    type: 'object',
    additionalProperties: { type: 'object' },
    example: {
      summarize: {
        requests: 5,
        cached: 2,
        cacheHitRatio: '40.00%',
        totalTokens: 800,
        avgLatencyMs: 1350.25,
        minLatencyMs: 980,
        maxLatencyMs: 2100,
      },
    },
  })
  endpoints: Record<string, EndpointStatsDto>;
}
