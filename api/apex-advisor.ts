// ============================================
// APEX Advisor API Endpoint (Vercel Serverless Function)
// Source: TRD §6.4
// Integrates Google Gemini with Groq fallback
// ============================================

import { GoogleGenerativeAI } from '@google/generative-ai';
import { Groq } from 'groq-sdk';
import { SYSTEM_PROMPT, buildUserPrompt } from '../src/utils/promptBuilder';
import { sanitize } from '../src/utils/sanitizer';

// Initialize SDKs
const gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || '' });

// Model Constants
const GEMINI_MODEL = 'gemini-2.5-flash';
const GROQ_MODEL = 'llama3-8b-8192';

const GEMINI_TIMEOUT_MS = 10000; // 10 seconds
const GROQ_TIMEOUT_MS = 8000;    // 8 seconds

export default async function handler(req: any, res: any) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { currentHP, recentLogs } = req.body;

    // Validate payload
    if (typeof currentHP !== 'number' || !Array.isArray(recentLogs)) {
      return res.status(400).json({ error: 'Invalid payload' });
    }

    const userPrompt = buildUserPrompt(currentHP, recentLogs);
    console.log('[API] Processing APEX request. HP:', currentHP, 'Logs:', recentLogs.length);

    // ==========================================
    // 1. Attempt Primary: Google Gemini
    // ==========================================
    try {
      console.log(`[API] Attempting ${GEMINI_MODEL}...`);
      const model = gemini.getGenerativeModel({ model: GEMINI_MODEL });
      
      const promptPromise = model.generateContent({
        contents: [
          { role: 'user', parts: [{ text: SYSTEM_PROMPT + '\n\n' + userPrompt }] }
        ],
        generationConfig: {
          maxOutputTokens: 150,
          temperature: 0.7,
        }
      });

      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Gemini timeout')), GEMINI_TIMEOUT_MS)
      );

      const result = await Promise.race([promptPromise, timeoutPromise]) as any;
      const text = result.response.text();
      
      console.log(`[API] ${GEMINI_MODEL} SUCCESS.`);
      return res.status(200).json({
        tip: sanitize(text),
        source: 'gemini'
      });

    } catch (geminiError) {
      console.warn(`[API] ${GEMINI_MODEL} FAILED:`, (geminiError as Error).message);
      
      // ==========================================
      // 2. Attempt Fallback: Groq (Llama 3)
      // ==========================================
      try {
        console.log(`[API] Attempting fallback ${GROQ_MODEL}...`);
        
        const groqPromise = groq.chat.completions.create({
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: userPrompt }
          ],
          model: GROQ_MODEL,
          max_tokens: 150,
          temperature: 0.7,
        });

        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Groq timeout')), GROQ_TIMEOUT_MS)
        );

        const result = await Promise.race([groqPromise, timeoutPromise]) as any;
        const text = result.choices[0]?.message?.content || '';

        console.log(`[API] ${GROQ_MODEL} SUCCESS.`);
        return res.status(200).json({
          tip: sanitize(text),
          source: 'groq'
        });

      } catch (groqError) {
        console.error(`[API] ${GROQ_MODEL} FAILED:`, (groqError as Error).message);
        
        // Both failed — client handles 503 by using static fallback
        return res.status(503).json({ 
          error: 'AI Services Unavailable', 
          source: 'fallback' 
        });
      }
    }

  } catch (error) {
    console.error('[API] Fatal Error:', (error as Error).message);
    return res.status(500).json({ 
      error: 'Internal Server Error', 
      source: 'fallback' 
    });
  }
}
