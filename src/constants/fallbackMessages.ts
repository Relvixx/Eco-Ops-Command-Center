// ============================================
// Fallback Messages — Constants
// Source: PRD §9 (3 hardcoded APEX tips)
// Used when both Gemini and Groq fail
// ============================================

export const FALLBACK_MESSAGES: string[] = [
  'Small consistent actions compound into significant environmental impact over time. Focus on one category today.',
  'Consider substituting your highest-impact activity with a lower-carbon alternative this week. Every swap counts.',
  'Tracking awareness is the first step toward meaningful change. Review your log patterns for actionable insights.',
];

let fallbackIndex = 0;

/**
 * Rotates through the 3 fallback messages.
 * Stateful — returns the next message in sequence on each call.
 */
export function getNextFallback(): string {
  const message = FALLBACK_MESSAGES[fallbackIndex];
  fallbackIndex = (fallbackIndex + 1) % FALLBACK_MESSAGES.length;
  return message;
}

/**
 * Resets the rotation index (for testing).
 */
export function resetFallbackIndex(): void {
  fallbackIndex = 0;
}
