// ============================================
// Prompt Builder — Pure Functions
// Source: TRD §6.4
// Builds APEX system prompt and user prompt
// ============================================

/**
 * APEX system prompt — defines the AI persona and output constraints.
 * Max 45 words, 2 sentences, tactical command center voice.
 */
export const SYSTEM_PROMPT = `You are APEX, a tactical environmental advisor. Speak in a direct, military tone. Give exactly 2 sentences, max 40 words total. No markdown. Give one actionable carbon reduction tip based on recent activity.`;

/**
 * Build the user-facing prompt sent to the AI model.
 * Includes current HP state and last 1–3 log entries for context.
 *
 * @param currentHP — current base health (0–150)
 * @param recentLogs — last 1–3 activity entries
 * @returns formatted prompt string
 */
export function buildUserPrompt(
  currentHP: number,
  recentLogs: { category: string; action: string; hpChange: number }[],
): string {
  const logsText = recentLogs
    .map((log) => `- ${log.category}: ${log.action} (${log.hpChange > 0 ? '+' : ''}${log.hpChange} HP)`)
    .join('\n');

  return `Current Base Health: ${currentHP}%

Recent activities:
${logsText}

Provide a tactical tip based on these activities.`;
}
