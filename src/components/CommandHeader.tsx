// ============================================
// CommandHeader — Global utility bar
// Source: UX §10.1
// Logo, demo/reset controls, compact HP badge
// ============================================

import { Shield } from 'lucide-react';
import { useGameContext } from '../context/GameContext';
import { getHPState } from '../utils/hpCalculator';
import { HP_STATE_CONFIG } from '../constants/hpStates';
import DemoControls from './DemoControls';

export default function CommandHeader() {
  const { state } = useGameContext();
  const hpState = getHPState(state.baseHealth);
  const stateColor = HP_STATE_CONFIG[hpState].color;

  return (
    <header
      id="command-header"
      className="sticky top-0 z-50 flex items-center justify-between px-4 h-[56px] md:h-[48px] border-b border-chrome/20"
      style={{ backgroundColor: 'var(--color-bg-header)' }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2">
        <Shield size={20} className="text-chrome-bright" />
        <span
          className="font-display font-semibold text-[22px] tracking-wide text-chrome-bright"
        >
          ECO-OPS
        </span>
      </div>

      {/* Right side: compact HP badge (mobile) + Demo controls */}
      <div className="flex items-center gap-3">
        {/* Compact HP badge — mobile only */}
        <div className="flex items-center gap-1.5 md:hidden">
          <span
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: stateColor }}
          />
          <span className="font-mono text-[16px] font-medium text-chrome-bright">
            {state.baseHealth}
          </span>
        </div>

        <DemoControls />
      </div>
    </header>
  );
}
