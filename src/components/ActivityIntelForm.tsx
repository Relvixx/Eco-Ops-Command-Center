// ============================================
// ActivityIntelForm — Activity logging form
// Source: UX §10.3
// Category tabs, action list, distance input, submit
// ============================================

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Loader2 } from 'lucide-react';
import { EMISSION_FACTORS, CATEGORY_META } from '../constants/emissionFactors';
import { useGameEngine } from '../hooks/useGameEngine';
import { useAPEX } from '../hooks/useAPEX';
import { useGameContext } from '../context/GameContext';
import { getHPState } from '../utils/hpCalculator';
import { HP_STATE_CONFIG } from '../constants/hpStates';
import type { Category } from '../types';

const CATEGORIES: Category[] = ['Transport', 'Food', 'Energy', 'Offset'];

export default function ActivityIntelForm() {
  const { state } = useGameContext();
  const { submitActivity, isSubmitting, cooldownRemaining } = useGameEngine();
  const { callAPEX } = useAPEX();

  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedFactorId, setSelectedFactorId] = useState<string | null>(null);
  const [distance, setDistance] = useState<string>('');
  const [distanceError, setDistanceError] = useState<string>('');

  const hpState = getHPState(state.baseHealth);
  const accentColor = HP_STATE_CONFIG[hpState].color;

  // Get the selected factor's details
  const selectedFactor = selectedCategory
    ? EMISSION_FACTORS[selectedCategory].find((f) => f.id === selectedFactorId)
    : null;

  const needsDistance = selectedFactor?.maxInput !== null;
  const distanceValue = parseFloat(distance);

  // Can submit?
  const canSubmit =
    selectedCategory !== null &&
    selectedFactorId !== null &&
    !isSubmitting &&
    cooldownRemaining === 0 &&
    (!needsDistance || (distanceValue > 0 && !distanceError));

  const handleCategorySelect = useCallback((cat: Category) => {
    setSelectedCategory(cat);
    setSelectedFactorId(null);
    setDistance('');
    setDistanceError('');
  }, []);

  const handleFactorSelect = useCallback((factorId: string) => {
    setSelectedFactorId(factorId);
    setDistance('');
    setDistanceError('');
  }, []);

  const handleDistanceChange = useCallback(
    (value: string) => {
      setDistance(value);
      const num = parseFloat(value);
      if (value && (isNaN(num) || num <= 0)) {
        setDistanceError('Enter a valid distance');
      } else if (num > 500) {
        setDistanceError('Max 500 km per day');
      } else {
        setDistanceError('');
      }
    },
    [],
  );

  const handleSubmit = useCallback(() => {
    if (!canSubmit || !selectedFactorId) return;

    const km = needsDistance ? Math.min(distanceValue, 500) : undefined;
    const logEntry = submitActivity(selectedFactorId, km);

    if (logEntry) {
      // Fire AI call (non-blocking)
      callAPEX(logEntry);

      // Reset form
      setSelectedFactorId(null);
      setDistance('');
      setDistanceError('');
    }
  }, [canSubmit, selectedFactorId, needsDistance, distanceValue, submitActivity, callAPEX]);

  // Submit button label
  let submitLabel = 'LOG ACTIVITY';
  if (isSubmitting) submitLabel = '';
  if (cooldownRemaining > 0) submitLabel = `COOLING DOWN... ${cooldownRemaining}`;

  return (
    <section
      id="activity-intel-form"
      className="rounded-xl p-4 flex flex-col gap-3"
      style={{ backgroundColor: 'var(--color-bg-card)' }}
    >
      <h2 className="text-xs font-semibold tracking-widest uppercase text-[var(--color-chrome)]">
        ◈ Activity Intel
      </h2>

      {/* Category Tabs */}
      <div
        className="flex overflow-x-auto scrollbar-hidden gap-0 border-b border-[var(--color-chrome)]/20"
        role="tablist"
      >
        {CATEGORIES.map((cat) => {
          const isActive = selectedCategory === cat;
          const meta = CATEGORY_META[cat];
          return (
            <button
              key={cat}
              role="tab"
              aria-selected={isActive}
              onClick={() => handleCategorySelect(cat)}
              className="flex-1 min-w-0 py-2.5 text-center text-[13px] font-medium uppercase tracking-wide transition-colors duration-150 cursor-pointer whitespace-nowrap"
              style={{
                borderBottom: isActive
                  ? `2px solid ${accentColor}`
                  : '2px solid transparent',
                color: isActive
                  ? 'var(--color-chrome-bright)'
                  : 'var(--color-chrome)',
                backgroundColor: isActive ? 'var(--color-bg-card)' : 'transparent',
              }}
            >
              {meta.emoji} {meta.label}
            </button>
          );
        })}
      </div>

      {/* Action List */}
      <AnimatePresence mode="wait">
        {selectedCategory && (
          <motion.div
            key={selectedCategory}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
            role="radiogroup"
            aria-label="Select activity"
          >
            <div className="flex flex-col gap-1.5 py-1">
              {EMISSION_FACTORS[selectedCategory].map((factor) => {
                const isSelected = selectedFactorId === factor.id;
                return (
                  <button
                    key={factor.id}
                    role="radio"
                    aria-checked={isSelected}
                    onClick={() => handleFactorSelect(factor.id)}
                    className="flex items-center justify-between px-3 py-2.5 rounded-lg text-left transition-colors duration-150 cursor-pointer min-h-[44px]"
                    style={{
                      backgroundColor: isSelected
                        ? 'rgba(45, 212, 191, 0.1)'
                        : 'transparent',
                      border: isSelected
                        ? '1px solid rgba(45, 212, 191, 0.3)'
                        : '1px solid transparent',
                    }}
                  >
                    <span className="text-[14px] font-medium text-[var(--color-chrome-bright)]">
                      {factor.label}
                    </span>
                    <span
                      className="text-[13px] font-mono font-medium"
                      style={{
                        color: factor.hpChange > 0 ? '#059669' : '#DC2626',
                      }}
                    >
                      {factor.hpChange > 0 ? '+' : ''}
                      {factor.hpChange} HP
                      {factor.inputUnit ? '/10km' : ''}
                    </span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Distance Input */}
      <AnimatePresence>
        {needsDistance && selectedFactorId && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="flex flex-col gap-1 py-1">
              <label
                htmlFor="distance-input"
                className="text-xs text-[var(--color-chrome)] uppercase tracking-wider"
              >
                Distance (km)
              </label>
              <input
                id="distance-input"
                type="number"
                min="1"
                max="500"
                value={distance}
                onChange={(e) => handleDistanceChange(e.target.value)}
                placeholder="Enter distance in km"
                className="w-full px-3 py-2.5 rounded-lg text-[14px] font-mono border transition-colors duration-150"
                style={{
                  backgroundColor: 'var(--color-bg-input)',
                  color: 'var(--color-chrome-bright)',
                  borderColor: distanceError ? '#DC2626' : 'var(--color-chrome-muted)',
                }}
                aria-describedby="distance-error"
              />
              <span
                id="distance-error"
                className="text-[12px] min-h-[16px]"
                style={{ color: '#DC2626' }}
              >
                {distanceError}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Submit Button */}
      <motion.button
        id="submit-activity"
        onClick={handleSubmit}
        disabled={!canSubmit}
        whileTap={canSubmit ? { scale: 0.97 } : undefined}
        className="w-full h-[52px] md:h-[56px] rounded-lg text-[15px] font-semibold uppercase tracking-wider flex items-center justify-center gap-2 transition-all duration-150 cursor-pointer"
        style={{
          backgroundColor: canSubmit ? accentColor : 'var(--color-chrome)',
          opacity: canSubmit ? 1 : 0.3,
          color: '#0A0C10',
          cursor: canSubmit ? 'pointer' : 'not-allowed',
        }}
        aria-disabled={!canSubmit}
        aria-label={
          cooldownRemaining > 0
            ? `Cooling down, ${cooldownRemaining} seconds remaining`
            : 'Log activity'
        }
      >
        {isSubmitting ? (
          <Loader2 size={18} className="animate-spin" />
        ) : (
          <>
            {cooldownRemaining === 0 && <ChevronDown size={16} />}
            {submitLabel}
          </>
        )}
      </motion.button>
    </section>
  );
}
