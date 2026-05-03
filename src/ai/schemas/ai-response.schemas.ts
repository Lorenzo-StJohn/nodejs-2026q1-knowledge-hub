import { z } from 'zod';

export const analyzeResponseSchema = z.object({
  analysis: z.string(),
  suggestions: z.array(z.string()),
  severity: z.enum(['info', 'warning', 'error']),
});

export const translateResponseSchema = z.object({
  translatedText: z.string(),
  detectedLanguage: z.string(),
});

export type AnalyzeResponse = z.infer<typeof analyzeResponseSchema>;
export type TranslateResponse = z.infer<typeof translateResponseSchema>;
