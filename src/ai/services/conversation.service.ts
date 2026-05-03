// src/ai/services/conversation.service.ts
import { Injectable } from '@nestjs/common';
import { AppLogger } from '../../common/logger/logger.service';

interface Message {
  role: 'user' | 'model';
  text: string;
}

interface SessionEntry {
  messages: Message[];
  lastAccess: number;
}

@Injectable()
export class ConversationService {
  private sessions = new Map<string, SessionEntry>();
  private readonly maxMessages = 20; // ограничение контекста
  private readonly ttlMs = 30 * 60 * 1000; // 30 минут жизни сессии

  constructor(private readonly logger: AppLogger) {
    setInterval(() => this.cleanup(), 5 * 60 * 1000);
  }

  getHistory(sessionId: string): Message[] {
    const entry = this.sessions.get(sessionId);
    if (entry) {
      entry.lastAccess = Date.now();
      return entry.messages;
    }
    return [];
  }

  addMessage(sessionId, role, text) {
    let entry = this.sessions.get(sessionId);
    if (!entry) {
      entry = { messages: [], lastAccess: Date.now() };
      this.sessions.set(sessionId, entry);
    }
    entry.messages.push({ role, text });
    entry.lastAccess = Date.now();

    if (entry.messages.length > this.maxMessages) {
      entry.messages.splice(0, entry.messages.length - this.maxMessages);
    }
  }

  clearSession(sessionId: string): void {
    this.sessions.delete(sessionId);
    this.logger.log(`Session ${sessionId} cleared`);
  }

  private cleanup() {
    const now = Date.now();
    for (const [sid, entry] of this.sessions.entries()) {
      if (now - entry.lastAccess > this.ttlMs) {
        this.sessions.delete(sid);
        this.logger.log(`Session ${sid} expired and removed`);
      }
    }
  }
}
