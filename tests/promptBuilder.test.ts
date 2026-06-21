import { describe, it, expect } from 'vitest';
import { buildUserPrompt, SYSTEM_PROMPT } from '../src/utils/promptBuilder';

describe('promptBuilder', () => {
  it('SYSTEM_PROMPT is under 45 words', () => {
    const wordCount = SYSTEM_PROMPT.split(/\s+/).length;
    expect(wordCount).toBeLessThanOrEqual(45);
  });

  it('buildUserPrompt formats context correctly', () => {
    const prompt = buildUserPrompt(80, [
      { category: 'Transport', action: 'Flight', hpChange: -25 },
      { category: 'Food', action: 'Vegan Meal', hpChange: -1 }
    ]);

    expect(prompt).toContain('Current Base Health: 80%');
    expect(prompt).toContain('- Transport: Flight (-25 HP)');
    expect(prompt).toContain('- Food: Vegan Meal (-1 HP)');
    expect(prompt).toContain('Provide a tactical tip');
  });

  it('buildUserPrompt formats positive HP changes with a plus sign', () => {
    const prompt = buildUserPrompt(100, [
      { category: 'Offset', action: 'Tree Planted', hpChange: +15 },
    ]);

    expect(prompt).toContain('- Offset: Tree Planted (+15 HP)');
  });
});
