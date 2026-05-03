export const summarizeArticlePrompt = (
  content: string,
  maxLength: string,
): string => `
Summarize the following article in a ${maxLength} manner. 
Return only the summary text, without any extra commentary.

Article:
${content}
`;
