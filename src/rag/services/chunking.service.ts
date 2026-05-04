import { Injectable } from '@nestjs/common';
import { Configuration } from 'src/config/configuration';

export interface Chunk {
  text: string;
  index: number;
}

@Injectable()
export class ChunkingService {
  private readonly chunkSize: number;
  private readonly overlap: number;

  constructor(private readonly config: Configuration) {
    this.chunkSize = +this.config.ragChunkSize;
    this.overlap = +this.config.ragChunkOverlap;
  }

  splitText(content: string): Chunk[] {
    const chunks: Chunk[] = [];
    let start = 0;
    let index = 0;

    while (start < content.length) {
      let end = start + this.chunkSize;
      if (end < content.length) {
        const nextSpace = content.lastIndexOf(' ', end);
        if (nextSpace > start) end = nextSpace;
      }
      const text = content.slice(start, end).trim();
      if (text) {
        chunks.push({ text, index });
        index++;
      }
      start = end - this.overlap > start ? end - this.overlap : end;
    }
    return chunks;
  }
}
