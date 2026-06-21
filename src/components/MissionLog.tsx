// ============================================
// MissionLog — Activity history log
// Source: UX §10.5
// Newest-first list with expandable overflow
// ============================================

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock } from 'lucide-react';
import { useGameContext } from '../context/GameContext';
import LogCard from './LogCard';

export default function MissionLog() {
  const { state } = useGameContext();
  const { logs } = state;
  const [isExpanded, setIsExpanded] = useState(false);

  // Mobile: max 3, Desktop: max 5 visible before expand
  const maxVisible = 5;
  const visibleLogs = isExpanded ? logs : logs.slice(0, maxVisible);
  const hasMore = logs.length > maxVisible;

  return (
    <section
      id="mission-log"
      className="rounded-xl p-4 flex flex-col gap-3"
      style={{ backgroundColor: 'var(--color-bg-card)' }}
    >
      <h2 className="text-xs font-semibold tracking-widest uppercase text-chrome">
        ◈ Mission Log
      </h2>

      {logs.length === 0 ? (
        // Empty state
        <div className="flex flex-col items-center justify-center py-6 gap-2">
          <Clock size={24} className="text-chrome" />
          <p className="text-[16px] font-medium text-chrome-bright">
            NO MISSIONS LOGGED.
          </p>
          <p className="text-[14px] text-chrome">
            BEGIN FIELD OPERATIONS.
          </p>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-2 max-h-[40vh] lg:max-h-[40vh] overflow-y-auto">
            <AnimatePresence initial={false}>
              {visibleLogs.map((log) => (
                <motion.div
                  key={log.id}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                >
                  <LogCard log={log} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {hasMore && !isExpanded && (
            <button
              onClick={() => setIsExpanded(true)}
              className="text-[14px] text-chrome hover:text-chrome-bright transition-colors cursor-pointer"
            >
              View more ↓ ({logs.length - maxVisible} more)
            </button>
          )}
        </>
      )}
    </section>
  );
}
