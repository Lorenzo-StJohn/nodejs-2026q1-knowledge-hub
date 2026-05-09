import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import { IndexingService } from './services/indexing.service';
import {
  ApiBadRequestResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ReindexRequestDto } from './dto/reindex.dto';
import { VectorStoreService } from './services/vector-store.service';
import {
  NotFoundError,
  ValidationError,
} from 'src/common/exceptions/custom-errors';
import { RetrievalService } from './services/retrieval.service';
import { RagSearchRequestDto } from './dto/search-query.dto';
import { ChatService } from './services/chat.service';
import { RagChatRequestDto } from './dto/chat.dto';
import { ConversationMemoryService } from './services/conversation-memory.service';
import { HybridSearchService } from './services/hybrid-search.service';

@Controller('ai/rag')
@ApiTags('RAG')
export class RagIndexController {
  constructor(
    private readonly indexingService: IndexingService,
    private readonly vectorStore: VectorStoreService,
    private readonly retrievalService: RetrievalService,
    private readonly chatService: ChatService,
    private readonly conversationMemoryService: ConversationMemoryService,
    private readonly hybridSearchService: HybridSearchService,
  ) {}

  @Post('index')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    description: 'Build/refresh vector index',
    summary: 'Build/refresh vector index',
  })
  @ApiOkResponse({
    example: {
      indexedArticles: 1,
      indexedChunks: 10,
      vectorCollection: 'string',
    },
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async reindex(@Body() dto: ReindexRequestDto) {
    return this.indexingService.reindex(dto);
  }

  @Delete('index/articles/:articleId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    description: 'Remove article vectors',
    summary: 'Remove article vectors',
  })
  @ApiNoContentResponse()
  @ApiNotFoundResponse()
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async deleteArticle(@Param('articleId') articleId: string) {
    const count = await this.vectorStore.countPointsForArticle(articleId);
    if (count === 0) throw new NotFoundError();
    await this.vectorStore.deleteByArticleId(articleId);
    return;
  }

  @Post('search')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    description: 'Semantic search in Knowledge Hub',
    summary: 'Semantic search in Knowledge Hub',
  })
  @ApiOkResponse({
    example: {
      results: [
        {
          articleId: '0e2f864e-8611-4e41-9d49-1c94b1df5c95',
          articleTitle: 'string',
          chunk: 'string',
          similarity: 0.945,
        },
      ],
    },
  })
  @ApiBadRequestResponse({ description: 'Validation Error' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async search(@Body() dto: RagSearchRequestDto) {
    if (!dto.query) throw new ValidationError();
    return { results: await this.retrievalService.search(dto) };
  }

  @Post('chat')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    description: 'Chat with Knowledge Hub RAG',
    summary: 'Chat with Knowledge Hub RAG',
  })
  @ApiOkResponse({
    example: {
      answer: 'string',
      sources: [
        {
          articleId: '0e2f864e-8611-4e41-9d49-1c94b1df5c95',
          articleTitle: 'string',
          relevantChunk: 'string',
        },
      ],
      conversationId: 'string',
    },
  })
  @ApiBadRequestResponse({ description: 'Validation Error' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async chat(@Body() dto: RagChatRequestDto) {
    if (!dto.question) throw new ValidationError();
    return this.chatService.chat(dto);
  }

  @Get('chat/:conversationId/history')
  @ApiOperation({
    description: 'Retrieve chat history',
    summary: 'Retrieve chat history',
  })
  @ApiOkResponse({
    example: [
      {
        role: 'user',
        content: 'string',
      },
    ],
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async history(@Param('conversationId') conversationId: string) {
    return this.conversationMemoryService.getHistory(conversationId);
  }

  @Post('hybrid-search')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    description: 'Hybrid (semantic + lexical) search',
    summary: 'Hybrid (semantic + lexical) search',
  })
  @ApiOkResponse({
    example: {
      results: [
        {
          articleId: '8dc1b26b-af02-418b-a4f2-5f1768514a22',
          articleTitle: 'The Rise of Quantum Computing',
          chunk:
            'Discover how quantum computers are set to revolutionize computing and solve problems beyond classical capabilities...',
          similarity: 0.016,
        },
      ],
    },
  })
  async hybridSearch(@Body() dto: RagSearchRequestDto) {
    if (!dto.query) throw new ValidationError();
    return {
      results: await this.hybridSearchService.search(
        dto.query,
        dto.limit || 5,
        {
          articleStatus: dto.articleStatus,
          categoryId: dto.categoryId,
          tags: dto.tags,
        },
      ),
    };
  }
}
