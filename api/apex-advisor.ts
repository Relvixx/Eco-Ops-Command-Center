// api/apex-advisor.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Groq from 'groq-sdk';

const SYSTEM_PROMPT = `You are APEX, a Tactical Eco-Advisor AI embedded inside a carbon defense command center called Eco-Ops. Your mission is to help the operator protect their Base Health score.

Rules you MUST follow:
Respond ONLY with exactly 2 sentences. Never more, never less.
Sentence 1: Briefly assess the threat level of their recent activity pattern — reference the specific action if possible.
Sentence 2: Issue ONE concrete, specific, actionable recovery mission for tomorrow — not a vague suggestion.
Use a sharp, direct, military-strategic tone — like a field commander briefing an operator.
Never use bullet points, markdown, headers, or any special characters in your response.
Keep total word count under 45 words.`;

const FALLBACK_MESSAGES = [
  'Comms link down. Tactical advice offline. Stick to public transport and skip the meat — base will hold.',
  'Signal corrupted. Default protocol: walk or cycle tomorrow, choose a plant-based meal. Base integrity maintained.',
  'Transmission jammed. Operational order: reduce vehicle usage by 50% tomorrow to stabilize base health.',
];

let fallbackIdx = 0;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function getNextFallback(): string {
  return FALLBACK_MESSAGES[fallbackIdx++ % FALLBACK_MESSAGES.length];
}

function sanitize(text: string): string {
  if (typeof text !== 'string') return '';
  return text
    .replace(/<[^>]*>/g, '')
    .replace(/[*_`#~|]/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/\n{2,}/g, ' ')
    .replace(/\n/g, ' ')
    .trim()
    .slice(0, 300);
}

function buildUserPrompt(currentHP: number, recentLogs: Array<{category: string; action: string; hpChange: number}>): string {
  const logSummary = recentLogs
    .slice(0, 3)
    .map((l, i) => `${i + 1}. ${l.category}: ${l.action} (HP ${l.hpChange > 0 ? '+' : ''}${l.hpChange})`)
    .join(', ');
  return `Operator Status Report: Base Health is currently ${currentHP}%. Recent Activity Log: ${logSummary || 'No recent activity'}. Assess and issue recovery orders.`;
}

function isValidRequest(currentHP: unknown, recentLogs: unknown): boolean {
  if (typeof currentHP !== 'number') return false;
  if (currentHP < 0 || currentHP > 150) return false;
  if (!Array.isArray(recentLogs)) return false;
  if (recentLogs.length === 0 || recentLogs.length > 3) return false;
  const validCats = ['Transport', 'Food', 'Energy', 'Offset'];
  return recentLogs.every((l: unknown) => {
    if (typeof l !== 'object' || l === null) return false;
    const log = l as Record<string, unknown>;
    return (
      typeof log.action === 'string' &&
      log.action.length <= 100 &&
      validCats.includes(log.category as string) &&
      typeof log.hpChange === 'number'
    );
  });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { currentHP, recentLogs } = req.body ?? {};

  if (!isValidRequest(currentHP, recentLogs)) {
    console.warn('[APEX] Invalid payload rejected');
    return res.status(400).json({ error: 'Invalid request body' });
  }

  const userPrompt = buildUserPrompt(currentHP as number, recentLogs);

  // Attempt 1: Gemini
  const geminiKey = process.env.GEMINI_API_KEY;
  if (geminiKey) {
    try {
      const genAI = new GoogleGenerativeAI(geminiKey);
      const model = genAI.getGenerativeModel(
        { model: 'gemini-1.5-flash' },
        { timeout: 10000 }
      );
      const chat = model.startChat({
        history: [
          { role: 'user', parts: [{ text: SYSTEM_PROMPT }] },
          { role: 'model', parts: [{ text: 'APEX online. Awaiting operator status report.' }] },
        ],
      });
      const result = await chat.sendMessage(userPrompt);
      const tip = sanitize(result.response.text());
      if (tip.length > 10) {
        return res.status(200).json({ tip, source: 'gemini' });
      }
    } catch (err) {
      console.error('[APEX] Gemini failed:', (err as Error).message);
    }
  }

  // Attempt 2: Groq
  const groqKey = process.env.GROQ_API_KEY;
  if (groqKey) {
    try {
      const groq = new Groq({ apiKey: groqKey });
      const completion = await groq.chat.completions.create({
        model: 'llama3-8b-8192',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userPrompt },
        ],
        max_tokens: 120,
        temperature: 0.7,
      });
      const tip = sanitize(completion.choices[0]?.message?.content ?? '');
      if (tip.length > 10) {
        return res.status(200).json({ tip, source: 'groq' });
      }
    } catch (err) {
      console.error('[APEX] Groq failed:', (err as Error).message);
    }
  }

  // Attempt 3: Hardcoded fallback
  console.warn('[APEX] All providers failed — returning hardcoded fallback');
  return res.status(503).json({ error: 'All AI providers unavailable', source: 'fallback' });
}
