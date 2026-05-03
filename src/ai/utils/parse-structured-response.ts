import { z } from 'zod';
import { Logger } from '@nestjs/common';

const logger = new Logger('StructuredResponseParser');

export function parseStructuredResponse<T>(
  rawText: string,
  schema: z.ZodSchema<T>,
  fallback: T,
): T {
  try {
    let cleanText = rawText.trim();
    const jsonBlockMatch = cleanText.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonBlockMatch) {
      cleanText = jsonBlockMatch[1].trim();
    }

    const parsed = JSON.parse(cleanText);
    const result = schema.safeParse(parsed);

    if (result.success) {
      return result.data;
    }

    logger.warn(
      `AI response failed schema validation: ${result.error.message}. Using fallback.`,
    );
    return fallback;
  } catch (error) {
    logger.warn(
      `Failed to parse AI response as JSON: ${error && typeof error === 'object' && 'message' in error ? error.message : 'unknown error'}. Using fallback.`,
    );
    return fallback;
  }
}
