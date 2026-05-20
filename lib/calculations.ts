import { CheckIn, Program, TrackingStatus } from '@/types';

export function isOnTrack(
  startWeight: number,
  goalWeight: number,
  currentWeight: number,
  currentWeek: number
): TrackingStatus {
  const totalLoss = startWeight - goalWeight;
  const expectedLoss = (totalLoss / 12) * currentWeek;
  const actualLoss = startWeight - currentWeight;
  const tolerance = 0.5;

  if (actualLoss >= expectedLoss - tolerance && actualLoss <= expectedLoss + tolerance) return 'on_track';
  if (actualLoss > expectedLoss + tolerance) return 'ahead';
  return 'behind';
}

export function habitScore(checkIn: CheckIn, program: Program): number {
  let score = 0;
  if (checkIn.hit_calorie_target === 'yes') score += 25;
  else if (checkIn.hit_calorie_target === 'mostly') score += 15;
  if (checkIn.hit_protein_target === 'yes') score += 20;
  else if (checkIn.hit_protein_target === 'mostly') score += 12;
  if (checkIn.workouts_completed !== null && program.workout_target !== null) {
    const ratio = checkIn.workouts_completed / program.workout_target;
    score += Math.min(25, Math.round(ratio * 25));
  }
  if (checkIn.avg_sleep_hours !== null && checkIn.avg_sleep_hours >= 7) score += 10;
  if (checkIn.hit_water_target === 'yes') score += 10;
  else if (checkIn.hit_water_target === 'most_days') score += 6;
  if (!checkIn.drank_alcohol) score += 10;
  return Math.min(100, score);
}

export function getCurrentWeek(startDate: string): number {
  const start = new Date(startDate);
  const now = new Date();
  const diffMs = now.getTime() - start.getTime();
  const diffWeeks = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 7));
  return Math.min(12, Math.max(1, diffWeeks + 1));
}

export function projectedWeights(
  startWeight: number,
  goalWeight: number
): { week: number; projected: number }[] {
  const totalLoss = startWeight - goalWeight;
  return Array.from({ length: 12 }, (_, i) => ({
    week: i + 1,
    projected: parseFloat((startWeight - (totalLoss / 12) * (i + 1)).toFixed(1))
  }));
}
