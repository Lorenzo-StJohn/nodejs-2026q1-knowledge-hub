import { Injectable } from '@nestjs/common';

export interface EndpointStats {
  requests: number;
  cached: number;
  totalTokens?: number;
  totalLatencyMs: number;
  latencyCount: number;
  minLatencyMs: number;
  maxLatencyMs: number;
}

@Injectable()
export class AiUsageTrackerService {
  private total = 0;
  private endpoints: Record<string, EndpointStats> = {};

  private initEndpointStats(): EndpointStats {
    return {
      requests: 0,
      cached: 0,
      totalTokens: 0,
      totalLatencyMs: 0,
      latencyCount: 0,
      minLatencyMs: Infinity,
      maxLatencyMs: -Infinity,
    };
  }

  increment(
    endpoint: string,
    fromCache: boolean,
    usage?: any,
    latencyMs: number = 0,
  ) {
    this.total++;
    if (!this.endpoints[endpoint]) {
      this.endpoints[endpoint] = this.initEndpointStats();
    }
    const stats = this.endpoints[endpoint];
    stats.requests++;
    if (fromCache) {
      stats.cached++;
    }
    if (usage && usage.totalTokenCount) {
      stats.totalTokens += usage.totalTokenCount;
    }

    if (latencyMs >= 0) {
      stats.totalLatencyMs += latencyMs;
      stats.latencyCount++;
      if (latencyMs < stats.minLatencyMs) stats.minLatencyMs = latencyMs;
      if (latencyMs > stats.maxLatencyMs) stats.maxLatencyMs = latencyMs;
    }
  }

  getStats() {
    const result: any = {
      totalRequests: this.total,
      endpoints: {},
    };
    for (const [name, stats] of Object.entries(this.endpoints)) {
      const avgLatency =
        stats.latencyCount > 0 ? stats.totalLatencyMs / stats.latencyCount : 0;
      result.endpoints[name] = {
        requests: stats.requests,
        cached: stats.cached,
        cacheHitRatio:
          stats.requests > 0
            ? ((stats.cached / stats.requests) * 100).toFixed(2) + '%'
            : '0%',
        totalTokens: stats.totalTokens,
        avgLatencyMs: Math.round(avgLatency * 100) / 100,
        minLatencyMs: stats.minLatencyMs === Infinity ? 0 : stats.minLatencyMs,
        maxLatencyMs: stats.maxLatencyMs === -Infinity ? 0 : stats.maxLatencyMs,
      };
    }
    return result;
  }
}
