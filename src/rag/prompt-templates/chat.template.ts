export const chatPrompt = (
  context: string,
  historyText: string,
  question: string,
): string => `
You are a helpful assistant that answers questions based only on the provided context. If the answer cannot be found in the context, say "I don't know".
Context:
${context}

Conversation history:
${historyText}

User question: ${question}
Answer:`;
