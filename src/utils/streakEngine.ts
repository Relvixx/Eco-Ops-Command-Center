// ============================================
// Streak Engine — Pure Function
// Source: PRD §9, TRD §6.3
// Calculates streak based on date transitions
// ============================================

/**
 * Compute the new streak value.
 *
 * Rules:
 * - Same day, positive net HP → streak stays at least 1 (first action of the day starts streak)
 * - Consecutive day (yesterday), positive → streak + 1
 * - Day skipped, positive → streak resets to 1 (new streak starts)
 * - Negative net HP for the day → streak = 0
 *
 * @param currentStreak — current streak count
 * @param lastActiveDate — ISO date string "YYYY-MM-DD" of last activity
 * @param todayNetHP — running HP delta for the current calendar day (AFTER this action)
 * @returns new streak value
 */
export function computeStreak(
  currentStreak: number,
  lastActiveDate: string,
  todayNetHP: number,
): number {
  // If net HP for today is negative or zero, no streak
  if (todayNetHP <= 0) return 0;

  const today = new Date().toISOString().split('T')[0];
  const lastDate = lastActiveDate;

  // Same day — maintain or start streak
  if (lastDate === today) {
    return Math.max(currentStreak, 1);
  }

  // Calculate day difference
  const todayTime = new Date(today + 'T00:00:00Z').getTime();
  const lastTime = new Date(lastDate + 'T00:00:00Z').getTime();
  const daysDiff = Math.round((todayTime - lastTime) / (1000 * 60 * 60 * 24));

  if (daysDiff === 1) {
    // Consecutive day — increment streak
    return currentStreak + 1;
  }

  // Skipped one or more days — new streak starts at 1
  return 1;
}
