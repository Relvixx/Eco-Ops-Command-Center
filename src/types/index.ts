// ============================================
// Eco-Ops Command Center — TypeScript Types
// Source of truth for all data contracts
// ============================================

// --- Category Enum ---
export type Category = 'Transport' | 'Food' | 'Energy' | 'Offset';

// --- Emission Factor ---
export interface EmissionFactor {
  id: string;
  label: string;
  hpChange: number;
  maxInput: number | null;  // null = no numeric input needed
  inputUnit: string | null; // "km" or null
}

export type EmissionFactorsMap = Record<Category, EmissionFactor[]>;

// --- HP States ---
export type HPState = 'OPTIMAL' | 'OPERATIONAL' | 'UNDER_THREAT' | 'CRITICAL' | 'DESTROYED';

export interface HPStateColors {
  bar: string;
  glow: string;
  text: string;
  accent: string;
}

// --- Log Entry ---
export interface LogEntry {
  id: string;
  timestamp: string;        // ISO-8601
  category: Category;
  action: string;           // Human-readable label from emissionFactors
  hpChange: number;         // Signed integer — negative = bad, positive = good
  aiTip: string;            // Plain text tip or fallback message
  tipSource: 'gemini' | 'groq' | 'fallback';
}

// --- Game State (localStorage schema) ---
export interface GameState {
  schemaVersion: number;    // Current: 1
  baseHealth: number;       // 0–150, clamped
  streak: number;           // >= 0
  todayNetHP: number;       // Running HP delta for current calendar day
  lastActiveDate: string;   // ISO date "YYYY-MM-DD"
  logs: LogEntry[];         // Max 100 entries
}

// --- Reducer Action Types ---
export const ACTIONS = {
  LOG_ACTIVITY: 'LOG_ACTIVITY',
  LOAD_DEMO: 'LOAD_DEMO',
  RESET_BASE: 'RESET_BASE',
  SET_AI_TIP: 'SET_AI_TIP',
  SET_AI_LOADING: 'SET_AI_LOADING',
} as const;

// --- Action Payloads ---
export interface LogActivityPayload {
  logEntry: LogEntry;
  newHP: number;
  newStreak: number;
  newTodayNetHP: number;
  newLastActiveDate: string;
}

export interface SetAITipPayload {
  logId: string;
  tip: string;
  tipSource: 'gemini' | 'groq' | 'fallback';
}

export interface LoadDemoPayload {
  demoState: GameState;
}

export type GameAction =
  | { type: typeof ACTIONS.LOG_ACTIVITY; payload: LogActivityPayload }
  | { type: typeof ACTIONS.LOAD_DEMO; payload: LoadDemoPayload }
  | { type: typeof ACTIONS.RESET_BASE }
  | { type: typeof ACTIONS.SET_AI_TIP; payload: SetAITipPayload };

export type TipSource = 'gemini' | 'groq' | 'fallback';

// --- AI API Contract ---
export interface APEXRequest {
  currentHP: number;
  recentLogs: {
    category: string;
    action: string;
    hpChange: number;
  }[];
}

export interface APEXResponse {
  tip: string;
  source: 'gemini' | 'groq' | 'fallback';
}

export interface APEXErrorResponse {
  error: string;
  source: 'fallback';
}
