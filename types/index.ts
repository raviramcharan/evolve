export interface User {
  id: string;
  email: string;
  name: string | null;
  reminder_email: string | null;
  role: 'coach' | 'client';
  coach_id: string | null;
  google_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Coach {
  id: string;
  coach_code: string;
  bio: string | null;
  created_at: string;
  updated_at: string;
}

export interface CoachNote {
  id: string;
  coach_id: string;
  client_id: string;
  week_number: number | null;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface Program {
  id: string;
  user_id: string;
  title: string;
  start_date: string;
  end_date: string;
  start_weight: number;
  goal_weight: number;
  calorie_target: number;
  protein_target: number;
  workout_target: number;
  is_active: boolean;
  created_by: 'client' | 'coach';
  created_at: string;
  updated_at: string;
}

export interface CheckIn {
  id: string;
  user_id: string;
  program_id: string;
  week_number: number;
  check_in_date: string;
  hit_calorie_target: 'yes' | 'mostly' | 'no' | null;
  avg_daily_calories: number | null;
  hit_protein_target: 'yes' | 'mostly' | 'no' | null;
  nutrition_sustainability: number | null;
  drank_alcohol: boolean;
  alcohol_units: number | null;
  workouts_completed: number | null;
  training_intensity: 'low' | 'moderate' | 'high' | null;
  had_injury: boolean;
  injury_notes: string | null;
  avg_sleep_hours: number | null;
  sleep_quality: number | null;
  stress_level: number | null;
  hit_water_target: 'yes' | 'most_days' | 'no' | null;
  energy_level: number | null;
  current_weight: number;
  went_well: string | null;
  was_challenging: string | null;
  do_differently: string | null;
  overall_feeling: number | null;
  created_at: string;
}

export interface ProgressPhoto {
  id: string;
  user_id: string;
  program_id: string;
  week_number: number;
  photo_url: string;
  notes: string | null;
  taken_at: string;
  created_at: string;
}

export interface GoalAdjustment {
  id: string;
  user_id: string;
  program_id: string;
  adjusted_at: string;
  week_number: number;
  calorie_target: number | null;
  protein_target: number | null;
  workout_target: number | null;
  reason: string | null;
  adjusted_by: 'client' | 'coach';
  created_at: string;
}

export type TrackingStatus = 'on_track' | 'ahead' | 'behind';
