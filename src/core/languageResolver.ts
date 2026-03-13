export const FRAMEWORK_LANGUAGE_MAP: Record<string, string> = {
  // Frontend
  react: 'node',
  vue: 'node',
  nextjs: 'node',
  svelte: 'node',

  // Backend
  express: 'node',
  fastify: 'node',
  fiber: 'go',
  gin: 'go',
  django: 'python',
  fastapi: 'python',

  // Mobile
  'react-native': 'node',
  flutter: 'dart',
  swift: 'swift',
  kotlin: 'kotlin',
};

export function resolveLanguage(framework?: string): string {
  if (!framework) return 'generic';
  return FRAMEWORK_LANGUAGE_MAP[framework.toLowerCase()] || 'generic';
}
