// ============================================
// LogCard — Individual log entry
// Source: UX §10.5
// Left border colored by HP delta, category icon
// ============================================

import { Car, Salad, Zap, Leaf } from 'lucide-react';
import type { LogEntry } from '../types';

const CATEGORY_ICONS: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  Transport: Car,
  Food: Salad,
  Energy: Zap,
  Offset: Leaf,
};

interface LogCardProps {
  log: LogEntry;
}

export default function LogCard({ log }: LogCardProps) {
  const isPositive = log.hpChange > 0;
  const borderColor = isPositive ? '#059669' : '#DC2626';
  const Icon = CATEGORY_ICONS[log.category] || Leaf;

  // Format timestamp as "2:14 PM"
  const time = new Date(log.timestamp).toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  return (
    <div
      className="flex flex-col gap-1 px-3 py-2.5 rounded-lg min-h-[48px] lg:min-h-[64px]"
      style={{
        borderLeft: `3px solid ${borderColor}`,
        backgroundColor: 'var(--color-bg-input)',
      }}
    >
      {/* Main row */}
      <div className="flex items-center gap-2">
        <Icon size={16} className="text-[var(--color-chrome)] shrink-0" />
        <span className="flex-1 text-[14px] font-medium text-[var(--color-chrome-bright)] truncate">
          {log.action}
        </span>
        <span
          className="text-[14px] font-mono font-bold shrink-0"
          style={{ color: isPositive ? '#059669' : '#DC2626' }}
        >
          {isPositive ? '+' : ''}{log.hpChange} HP
        </span>
        <span className="text-[12px] font-mono text-[var(--color-chrome-muted)] shrink-0">
          {time}
        </span>
      </div>

      {/* AI tip preview */}
      {log.aiTip && (
        <p className="text-[13px] text-[var(--color-chrome)] truncate pl-6">
          {log.aiTip}
        </p>
      )}
    </div>
  );
}
