export const translateArticlePrompt = (
  content: string,
  targetLanguage: string,
  sourceLanguage?: string,
): string => {
  const sourceHint = sourceLanguage
    ? `Translate the following text from ${sourceLanguage} to ${targetLanguage}.`
    : `Translate the following text to ${targetLanguage}.`;
  return `${sourceHint} Return only the translated text, without any extra commentary.

Text:
${content}`;
};
