import { Module } from '@nestjs/common';
import { ConfigModule } from 'src/config/config.module';
import { ChunkingService } from './services/chunking.service';
import { ConversationMemoryService } from './services/conversation-memory.service';
import { EmbeddingService } from './services/embedding.service';
import { IndexingService } from './services/indexing.service';
import { RetrievalService } from './services/retrieval.service';
import { VectorStoreService } from './services/vector-store.service';
import { RagIndexController } from './rag.controller';
import { ArticleModule } from 'src/modules/article/article.module';
import { HttpModule } from '@nestjs/axios';
import { AiModule } from 'src/ai/ai.module';
import { ChatService } from './services/chat.service';
import { HybridSearchService } from './services/hybrid-search.service';
import { RerankerService } from './services/reranker.service';

@Module({
  imports: [
    ConfigModule,
    ArticleModule,
    AiModule,
    HttpModule.register({
      timeout: 15000,
    }),
  ],
  controllers: [RagIndexController],
  providers: [
    ChunkingService,
    ConversationMemoryService,
    EmbeddingService,
    IndexingService,
    RetrievalService,
    VectorStoreService,
    ChatService,
    HybridSearchService,
    RerankerService,
  ],
})
export class RagModule {}
