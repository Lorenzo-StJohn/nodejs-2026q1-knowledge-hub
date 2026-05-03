export const analyzeArticlePrompt = (content: string, task: string): string => {
  let instruction: string;
  switch (task) {
    case 'review':
      instruction =
        'Provide a constructive code review of the following article content.';
      break;
    case 'bugs':
      instruction =
        'Find potential bugs, logical errors, or issues in the following article content.';
      break;
    case 'optimize':
      instruction =
        'Suggest performance or clarity optimizations for the following article content.';
      break;
    case 'explain':
      instruction = 'Explain the following article content in simple terms.';
      break;
    default:
      instruction = 'Review the following article.';
  }
  return `${instruction} Return a JSON object with keys: "analysis" (string), "suggestions" (array of strings), and "severity" (one of "info", "warning", "error"). Only return the JSON, no other text.

Article:
${content}`;
};
