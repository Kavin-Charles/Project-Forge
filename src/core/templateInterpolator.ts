import { ForgeConfig } from '../types/ForgeConfig';

/**
 * Replaces {{variableName}} in the given string with the corresponding value from ForgeConfig.
 */
export function interpolateString(content: string, config: ForgeConfig): string {
  if (!content) return content;

  return content.replace(/\{\{(.*?)\}\}/g, (match, key) => {
    const trimmedKey = key.trim() as keyof ForgeConfig;
    const value = config[trimmedKey];
    
    // If the config has a value for this key, replace it.
    // Otherwise, leave the original {{key}} alone.
    if (value !== undefined && value !== null) {
      return String(value);
    }
    
    return match;
  });
}
