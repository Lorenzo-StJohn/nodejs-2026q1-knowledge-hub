export function sanitizeSensitiveData(
  obj: any,
  maxDepth = 10,
  currentDepth = 0,
): any {
  if (!obj || typeof obj !== 'object') return obj;
  if (currentDepth >= maxDepth) return '[Object]';

  const sensitiveFields = [
    'password',
    'refreshtoken',
    'accesstoken',
    'token',
    'secret',
    'newpassword',
    'oldpassword',
    'key',
    'apikey',
  ];

  if (Array.isArray(obj)) {
    return obj.map((item) =>
      sanitizeSensitiveData(item, maxDepth, currentDepth),
    );
  }

  const sanitized = { ...obj };
  for (const key in sanitized) {
    if (sensitiveFields.includes(key.toLowerCase())) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
      sanitized[key] = sanitizeSensitiveData(
        sanitized[key],
        maxDepth,
        currentDepth + 1,
      );
    }
  }
  return sanitized;
}
