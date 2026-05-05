import { Injectable } from '@nestjs/common';

@Injectable()
export class Configuration {
  get port(): number {
    return parseInt(process.env.PORT || '4000', 10);
  }

  get isMemoryMode(): boolean {
    return process.env.MODE === 'memory';
  }

  get isProduction(): boolean {
    return process.env.NODE_ENV === 'production';
  }

  get apiVariables() {
    return {
      url:
        process.env.GEMINI_API_BASE ??
        'https://generativelanguage.googleapis.com',
      key: process.env.GEMINI_API_KEY,
      model: process.env.GEMINI_MODEL ?? 'gemini-2.5-flash',
    };
  }

  get apiEmbedding() {
    return {
      url:
        process.env.GEMINI_API_BASE ??
        'https://generativelanguage.googleapis.com',
      key: process.env.GEMINI_API_KEY,
      model: process.env.GEMINI_EMBEDDING_MODEL ?? 'text-embedding-004',
    };
  }

  get aiCacheTtlSec() {
    return parseInt(process.env.AI_CACHE_TTL_SEC ?? '300');
  }

  get aiRateLimitRpm() {
    return parseInt(process.env.AI_RATE_LIMIT_RPM ?? '20');
  }

  get ragChunkSize() {
    return parseInt(process.env.RAG_CHUNK_SIZE ?? '800');
  }

  get ragChunkOverlap() {
    return parseInt(process.env.RAG_CHUNK_OVERLAP ?? '200');
  }

  get ragVectorCollection() {
    return process.env.RAG_VECTOR_COLLECTION ?? 'knowledge_hub_articles';
  }

  get ragVectorDbUrl() {
    return process.env.RAG_VECTOR_DB_URL ?? 'http://vectordb:6333';
  }
}
