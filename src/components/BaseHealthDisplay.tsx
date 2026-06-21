// ============================================
// BaseHealthDisplay — The visual core
// Source: UX §10.2, §11 (HP Drama System)
// HP number, bar, state badge, streak, animations
// ============================================

import { useEffect, useRef, useState } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';
import { Flame } from 'lucide-react';
import { useGameContext } from '../context/GameContext';
import { getHPState } from '../utils/hpCalculator';
import { HP_STATE_CONFIG, HP_MAX } from '../constants/hpStates';
import type { HPState } from '../types';

export default function BaseHealthDisplay() {
  const { state, previousHP } = useGameContext();
  const { baseHealth: hp, streak } = state;

  const hpState = getHPState(hp);
  const config = HP_STATE_CONFIG[hpState];
  const prevHPState = useRef<HPState>(hpState);
  const [showScanLine, setShowScanLine] = useState(false);
  const [scanLineKey, setScanLineKey] = useState(0);

  // Framer Motion spring for HP number
  const springHP = useSpring(hp, { stiffness: 200, damping: 25 });
  const displayHP = useTransform(springHP, (v: number) => Math.round(v));
  const [displayValue, setDisplayValue] = useState(hp);

  useEffect(() => {
    springHP.set(hp);
  }, [hp, springHP]);

  useEffect(() => {
    const unsubscribe = displayHP.on('change', (v: number) => {
      setDisplayValue(v);
    });
    return unsubscribe;
  }, [displayHP]);

  // Detect state boundary crossing (Tier 2 drama)
  useEffect(() => {
    const newState = getHPState(hp);
    if (prevHPState.current !== newState) {
      // Tier 2: state crossed — fire scan line
      setShowScanLine(true);
      setScanLineKey((k) => k + 1);
      setTimeout(() => setShowScanLine(false), 700);
      prevHPState.current = newState;
    }
  }, [hp]);

  const isCriticalPulse = hpState === 'CRITICAL';
  const isOptimalGlow = hpState === 'OPTIMAL';

  return (
    <section
      id="base-health-display"
      className="flex flex-col items-center justify-center gap-2 p-6 rounded-xl relative"
      style={{ backgroundColor: 'var(--color-bg-card)' }}
    >
      {/* Scan Line — Tier 2 drama */}
      {showScanLine && (
        <div
          key={scanLineKey}
          className="scan-line"
          style={{ backgroundColor: config.color }}
        />
      )}

      {/* State Badge */}
      <motion.div
        key={hpState}
        initial={{ rotateY: 90 }}
        animate={{ rotateY: 0 }}
        transition={{ duration: 0.2 }}
        className="flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold uppercase tracking-wider"
        style={{
          color: config.color,
          backgroundColor: `${config.color}15`,
        }}
        role="status"
        aria-live="polite"
      >
        <span>{config.badgeIcon}</span>
        <span className="font-body">{config.badgeText}</span>
      </motion.div>

      {/* HP Number */}
      <div
        className={`font-display font-semibold text-[72px] lg:text-[96px] leading-none tabular-nums ${isCriticalPulse ? 'animate-[criticalPulse_1.5s_infinite]' : ''}`}
        style={{ color: config.color }}
      >
        {displayValue}
        <span className="text-[40px] lg:text-[56px] text-[var(--color-chrome-muted)] ml-1">%</span>
      </div>

      {/* HP Bar */}
      <div
        className="relative w-full h-5 lg:h-5 md:h-4 rounded overflow-hidden"
        style={{ backgroundColor: 'var(--color-bg-input)' }}
        role="progressbar"
        aria-valuenow={hp}
        aria-valuemin={0}
        aria-valuemax={HP_MAX}
        aria-label="Base Health Score"
      >
        <motion.div
          className={`absolute inset-y-0 left-0 rounded origin-left ${isOptimalGlow ? 'animate-[optimalGlow_3s_infinite]' : ''}`}
          style={{
            width: '100%',
            backgroundColor: config.barColor,
            willChange: 'transform',
          }}
          animate={{ scaleX: hp / HP_MAX }}
          transition={{ type: 'spring', stiffness: 300, damping: 30, mass: 1 }}
        />
      </div>

      {/* Streak Counter */}
      <div className="flex items-center gap-1.5 mt-1 text-sm">
        {streak > 0 ? (
          <>
            <Flame size={16} className="text-[var(--color-hp-threat)]" />
            <span className="font-body text-[var(--color-chrome-bright)]">
              {streak}-Day Streak
            </span>
          </>
        ) : (
          <span className="text-[var(--color-chrome)] text-[14px]">
            — No streak yet —
          </span>
        )}
      </div>
    </section>
  );
}
