import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { RetrievalService } from './retrieval.service';
import { ConversationMemoryService } from './conversation-memory.service';
import { GeminiService } from 'src/ai/gemini.service';
import { RagChatRequestDto, RagChatResponseDto } from '../dto/chat.dto';
import { chatPrompt } from '../prompt-templates/chat.template';
import { RerankerService } from './reranker.service';

@Injectable()
export class ChatService {
  constructor(
    private readonly retrievalService: RetrievalService,
    private readonly memoryService: ConversationMemoryService,
    private readonly geminiService: GeminiService,
    private readonly rerankerService: RerankerService,
  ) {}

  async chat(dto: RagChatRequestDto): Promise<RagChatResponseDto> {
    const conversationId = dto.conversationId || uuidv4();

    const searchResults = await this.retrievalService.search({
      query: dto.question,
      limit: 15,
    });

    const chunks = searchResults.map((r) => ({
      articleId: r.articleId,
      articleTitle: r.articleTitle,
      chunk: r.chunk,
      score: r.similarity,
    }));

    const reranked = await this.rerankerService.rerank(dto.question, chunks);

    const topChunks = reranked.slice(0, 5);

    const context = topChunks
      .map((r) => `[Source: ${r.articleTitle}]\n${r.chunk}`)
      .join('\n\n');

    const history = this.memoryService.getHistory(conversationId);
    const historyText = history
      .map((m) => `${m.role}: ${m.content}`)
      .join('\n');

    const prompt = chatPrompt(context, historyText, dto.question);

    let answer: string;
    try {
      const { text } = await this.geminiService.generate(prompt, {
        temperature: 0.3,
      });
      answer = text.trim();
    } catch (error) {
      throw new ServiceUnavailableException('Failed to generate answer');
    }

    this.memoryService.addMessage(conversationId, 'user', dto.question);
    this.memoryService.addMessage(conversationId, 'assistant', answer);

    return {
      answer,
      sources: searchResults.map((r) => ({
        articleId: r.articleId,
        articleTitle: r.articleTitle,
        relevantChunk: r.chunk,
      })),
      conversationId,
    };
  }
}
