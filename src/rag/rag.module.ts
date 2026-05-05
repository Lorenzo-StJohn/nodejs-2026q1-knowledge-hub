import { Module } from '@nestjs/common';
import { ConfigModule } from 'src/config/config.module';
import { ChunkingService } from './services/chunking.service';
import { ConversationMemoryService } from './services/conversation-memory.service';
import { EmbeddingService } from './services/embedding.service';
import { IndexingService } from './services/indexing.service';
import { RetrievalService } from './services/retrieval.service';
import { VectorStoreService } from './services/vector-store.service';

@Module({
  imports: [ConfigModule],
  controllers: [],
  providers: [
    ChunkingService,
    ConversationMemoryService,
    EmbeddingService,
    IndexingService,
    RetrievalService,
    VectorStoreService,
  ],
})
export class RagModule {}
