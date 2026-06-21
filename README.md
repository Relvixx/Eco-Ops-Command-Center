# Eco-Ops Command Center

Eco-Ops Command Center is a gamified carbon footprint tracker that transforms daily environmental decisions into a tactical mission. By logging activities, users manage their "Base Health" (HP) and receive actionable, AI-powered insights from their tactical advisor, **APEX**.

## Architecture & Tech Stack

- **Frontend:** React 18 (TypeScript), Vite
- **Styling:** Tailwind CSS v4, Framer Motion (for "HP Drama" system animations)
- **Icons:** Lucide React
- **Backend / API:** Vercel Serverless Functions (`api/apex-advisor.ts`)
- **AI Models:** 
  - Primary: Google Gemini (`gemini-2.5-flash`)
  - Secondary/Fallback: Groq (`llama3-8b-8192`)
- **State Management:** React `useReducer` for atomic state transitions
- **Persistence:** Local Storage (`eco_ops_v1`)

## Key Features

1. **HP Drama System:** Real-time visual feedback based on the user's Base Health, with specific animations (Scan Lines, Screen Flickers, Pulses) based on their threshold (Optimal, Operational, Under Threat, Critical, Destroyed).
2. **APEX AI Advisor:** Uses Google Gemini (with Groq Llama 3 fallback) to provide hyper-contextual, tactical tips (strictly 2 sentences, under 45 words) based on the user's latest logged activities.
3. **Resilient Offline Architecture:** If offline or API fails, APEX smoothly falls back to a rotating list of hardcoded environmental tips without breaking the UI.
4. **Judge Demo Mode:** Instantly injects pre-configured data (62 HP, 3 logs) and puts the system into an isolated "Demo Mode" for rapid review without touching local storage.

## How to Run Locally

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Configure Environment:**
   Create a `.env.local` file in the root directory and add your API keys:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   GROQ_API_KEY=your_groq_api_key_here
   ```

3. **Start Development Server:**
   ```bash
   npm run dev
   ```

## Testing

Vitest is configured for unit testing of core business logic utilities:

```bash
npm run test
```

## Deployment to Vercel

This repository is pre-configured for Vercel deployment with `vercel.json` providing custom headers and a strict 15-second serverless timeout configuration.

```bash
npx vercel --prod
```
