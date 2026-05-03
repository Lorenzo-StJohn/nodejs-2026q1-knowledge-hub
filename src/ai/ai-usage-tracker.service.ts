import { Injectable } from '@nestjs/common';

interface EndpointStats {
  requests: number;
  cached: number;
  totalTokens?: number;
}

@Injectable()
export class AiUsageTrackerService {
  private total = 0;
  private endpoints: Record<string, EndpointStats> = {};

  increment(endpoint: string, fromCache: boolean, usage?: any) {
    this.total++;
    if (!this.endpoints[endpoint]) {
      this.endpoints[endpoint] = { requests: 0, cached: 0, totalTokens: 0 };
    }
    this.endpoints[endpoint].requests++;
    if (fromCache) {
      this.endpoints[endpoint].cached++;
    }
    if (usage && usage.totalTokenCount) {
      this.endpoints[endpoint].totalTokens =
        (this.endpoints[endpoint].totalTokens || 0) + usage.totalTokenCount;
    }
  }

  getStats() {
    return {
      totalRequests: this.total,
      endpoints: this.endpoints,
    };
  }
}
