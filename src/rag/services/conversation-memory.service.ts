import { Injectable } from '@nestjs/common';
import { Configuration } from 'src/config/configuration';

export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface Conversation {
  messages: Message[];
  lastAccess: number;
}

@Injectable()
export class ConversationMemoryService {
  private conversations = new Map<string, Conversation>();
  private maxMessages: number;

  constructor(config: Configuration) {
    this.maxMessages = +config.ragConversationMaxMessages;
  }

  getHistory(conversationId: string): Message[] {
    const conv = this.conversations.get(conversationId);
    return conv?.messages || [];
  }

  addMessage(conversationId: string, role: Message['role'], content: string) {
    let conv = this.conversations.get(conversationId);
    if (!conv) {
      conv = { messages: [], lastAccess: Date.now() };
      this.conversations.set(conversationId, conv);
    }
    conv.messages.push({ role, content });
    conv.lastAccess = Date.now();
    if (conv.messages.length > this.maxMessages) {
      conv.messages = conv.messages.slice(
        conv.messages.length - this.maxMessages,
      );
    }
  }
}
