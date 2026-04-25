/**
 * Generates a DiceBear Adventurer avatar URL for the given seed.
 * 
 * Using the API version for lightweight integration and up-to-date styles.
 * See: https://www.dicebear.com/styles/adventurer/
 */
export const buildAvatarDataUrl = (seed: string): string => {
  const trimmed = seed.trim();
  if (!trimmed) return "";
  
  // Using version 9.x of the adventurer style as requested
  return `https://api.dicebear.com/9.x/adventurer/svg?seed=${encodeURIComponent(trimmed)}`;
};

/**
 * @deprecated Use buildAvatarDataUrl instead. 
 * This returns an empty string as synchronous SVG generation is no longer supported locally 
 * to keep the application lightweight.
 */
export const buildAvatarSvg = (seed: string): string => {
  return "";
};
