-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─────────────────────────────────────────
-- USERS
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email         TEXT NOT NULL UNIQUE,
  name          TEXT,
  reminder_email TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Row-level security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON users FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id);

-- ─────────────────────────────────────────
-- PROGRAMS
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS programs (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id          UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title            TEXT NOT NULL,
  start_date       DATE NOT NULL,
  end_date         DATE NOT NULL,
  start_weight     NUMERIC(5, 1) NOT NULL,
  goal_weight      NUMERIC(5, 1) NOT NULL,
  calorie_target   INTEGER NOT NULL,
  protein_target   INTEGER NOT NULL,
  workout_target   INTEGER NOT NULL,
  is_active        BOOLEAN NOT NULL DEFAULT TRUE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE programs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own programs"
  ON programs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own programs"
  ON programs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own programs"
  ON programs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own programs"
  ON programs FOR DELETE
  USING (auth.uid() = user_id);

-- ─────────────────────────────────────────
-- CHECK-INS
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS check_ins (
  id                       UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id                  UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  program_id               UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  week_number              INTEGER NOT NULL CHECK (week_number BETWEEN 1 AND 12),
  check_in_date            DATE NOT NULL,

  -- Nutrition
  hit_calorie_target       TEXT CHECK (hit_calorie_target IN ('yes', 'mostly', 'no')),
  avg_daily_calories       NUMERIC(6, 0),
  hit_protein_target       TEXT CHECK (hit_protein_target IN ('yes', 'mostly', 'no')),
  nutrition_sustainability INTEGER CHECK (nutrition_sustainability BETWEEN 1 AND 5),
  drank_alcohol            BOOLEAN NOT NULL DEFAULT FALSE,
  alcohol_units            NUMERIC(5, 1),

  -- Training
  workouts_completed       INTEGER,
  training_intensity       TEXT CHECK (training_intensity IN ('low', 'moderate', 'high')),
  had_injury               BOOLEAN NOT NULL DEFAULT FALSE,
  injury_notes             TEXT,

  -- Lifestyle
  avg_sleep_hours          NUMERIC(3, 1),
  sleep_quality            INTEGER CHECK (sleep_quality BETWEEN 1 AND 5),
  stress_level             INTEGER CHECK (stress_level BETWEEN 1 AND 5),
  hit_water_target         TEXT CHECK (hit_water_target IN ('yes', 'most_days', 'no')),
  energy_level             INTEGER CHECK (energy_level BETWEEN 1 AND 5),

  -- Reflection
  current_weight           NUMERIC(5, 1) NOT NULL,
  went_well                TEXT,
  was_challenging          TEXT,
  do_differently           TEXT,
  overall_feeling          INTEGER CHECK (overall_feeling BETWEEN 1 AND 5),

  created_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(user_id, program_id, week_number)
);

ALTER TABLE check_ins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own check-ins"
  ON check_ins FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own check-ins"
  ON check_ins FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own check-ins"
  ON check_ins FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own check-ins"
  ON check_ins FOR DELETE
  USING (auth.uid() = user_id);

-- ─────────────────────────────────────────
-- PROGRESS PHOTOS
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS progress_photos (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  program_id   UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  week_number  INTEGER NOT NULL CHECK (week_number BETWEEN 1 AND 12),
  photo_url    TEXT NOT NULL,
  notes        TEXT,
  taken_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE progress_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own photos"
  ON progress_photos FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own photos"
  ON progress_photos FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own photos"
  ON progress_photos FOR DELETE
  USING (auth.uid() = user_id);

-- ─────────────────────────────────────────
-- GOAL ADJUSTMENTS
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS goal_adjustments (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id          UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  program_id       UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  adjusted_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  week_number      INTEGER NOT NULL CHECK (week_number BETWEEN 1 AND 12),
  calorie_target   INTEGER,
  protein_target   INTEGER,
  workout_target   INTEGER,
  reason           TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE goal_adjustments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own goal adjustments"
  ON goal_adjustments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own goal adjustments"
  ON goal_adjustments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ─────────────────────────────────────────
-- STORAGE BUCKET POLICY (run separately in Supabase dashboard)
-- ─────────────────────────────────────────
-- CREATE BUCKET progress-photos (public: true)
--
-- INSERT policy: authenticated users can upload to their own folder
-- ( (storage.foldername(name))[1] = auth.uid()::text )
--
-- SELECT policy: public read
-- ( bucket_id = 'progress-photos' )

-- ─────────────────────────────────────────
-- INDEXES
-- ─────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_programs_user_active ON programs(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_check_ins_user_program ON check_ins(user_id, program_id);
CREATE INDEX IF NOT EXISTS idx_check_ins_week ON check_ins(program_id, week_number);
CREATE INDEX IF NOT EXISTS idx_photos_user_program ON progress_photos(user_id, program_id);
CREATE INDEX IF NOT EXISTS idx_goal_adj_program ON goal_adjustments(program_id);

-- ─────────────────────────────────────────
-- AUTO-UPDATE updated_at TRIGGER
-- ─────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_programs_updated_at
  BEFORE UPDATE ON programs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
