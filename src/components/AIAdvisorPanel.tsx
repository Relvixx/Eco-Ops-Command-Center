// ============================================
// AIAdvisorPanel — APEX tactical advisory
// Source: UX §10.4
// Hidden until first submit, skeleton → tip
// ============================================

import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import { useAPEX } from '../hooks/useAPEX';
import { useGameContext } from '../context/GameContext';

export default function AIAdvisorPanel() {
  const { state } = useGameContext();
  const { isLoading, latestTip, tipSource } = useAPEX();

  // Don't render until first log exists
  const hasLogs = state.logs.length > 0;
  if (!hasLogs && !isLoading) return null;

  // Get the latest tip from the most recent log entry
  const displayTip = latestTip || (state.logs.length > 0 ? state.logs[0].aiTip : '');
  const displaySource = latestTip ? tipSource : (state.logs.length > 0 ? state.logs[0].tipSource : 'fallback');
  const isFallback = displaySource === 'fallback';

  return (
    <AnimatePresence>
      <motion.section
        id="ai-advisor-panel"
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="rounded-xl p-4 flex flex-col gap-3 overflow-hidden"
        style={{ backgroundColor: 'var(--color-bg-card)' }}
      >
        {/* Header */}
        <h2 className="text-xs font-semibold tracking-widest uppercase text-[var(--color-chrome)]">
          ◈ APEX ▪ TACTICAL ADVISORY
        </h2>

        {/* Content */}
        {isLoading ? (
          // Skeleton shimmer
          <div className="flex flex-col gap-2" aria-busy="true">
            <div className="shimmer-bar h-4 w-full" />
            <div className="shimmer-bar h-4 w-4/5" />
          </div>
        ) : displayTip ? (
          // Tip text
          <div role="status" aria-live="polite">
            <p
              className="text-[14px] leading-relaxed font-body"
              style={{
                color: isFallback
                  ? 'var(--color-hp-threat)'
                  : 'var(--color-chrome-bright)',
              }}
            >
              {displayTip}
            </p>

            {/* Source badge */}
            <div className="flex items-center gap-1.5 mt-2">
              {isFallback && (
                <AlertTriangle size={14} className="text-[var(--color-hp-threat)]" />
              )}
              <span
                className="text-[12px] font-mono tracking-wider uppercase"
                style={{
                  color: isFallback
                    ? 'var(--color-hp-threat)'
                    : 'var(--color-accent-teal)',
                }}
              >
                {isFallback
                  ? 'COMMS OFFLINE'
                  : `APEX via ${displaySource.toUpperCase()}`}
              </span>
            </div>
          </div>
        ) : null}
      </motion.section>
    </AnimatePresence>
  );
}
