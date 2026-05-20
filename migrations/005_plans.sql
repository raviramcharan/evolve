-- 005_plans.sql

CREATE TABLE training_plans (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id     UUID REFERENCES users(id) ON DELETE CASCADE,
  program_id    UUID REFERENCES programs(id) ON DELETE CASCADE,
  coach_id      UUID REFERENCES users(id) ON DELETE CASCADE,
  title         TEXT DEFAULT 'Training Plan',
  notes         TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(client_id, program_id)
);

CREATE TABLE training_days (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  training_plan_id  UUID REFERENCES training_plans(id) ON DELETE CASCADE,
  day_of_week       INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Mon, 6=Sun
  is_rest_day       BOOLEAN DEFAULT FALSE,
  workout_name      TEXT,
  notes             TEXT,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(training_plan_id, day_of_week)
);

CREATE TABLE training_exercises (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  training_day_id   UUID REFERENCES training_days(id) ON DELETE CASCADE,
  position          INTEGER NOT NULL,
  name              TEXT NOT NULL,
  sets              INTEGER NOT NULL,
  reps              TEXT NOT NULL,        -- "8-10", "12", "AMRAP"
  weight_kg         NUMERIC(5,2),         -- null = bodyweight
  rest_seconds      INTEGER,
  notes             TEXT,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE nutrition_plans (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id       UUID REFERENCES users(id) ON DELETE CASCADE,
  program_id      UUID REFERENCES programs(id) ON DELETE CASCADE,
  coach_id        UUID REFERENCES users(id) ON DELETE CASCADE,
  title           TEXT DEFAULT 'Nutrition Plan',
  calorie_target  INTEGER NOT NULL,
  protein_target  INTEGER NOT NULL,
  carb_target     INTEGER NOT NULL,
  fat_target      INTEGER NOT NULL,
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(client_id, program_id)
);

CREATE TABLE meals (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nutrition_plan_id   UUID REFERENCES nutrition_plans(id) ON DELETE CASCADE,
  position            INTEGER NOT NULL,
  name                TEXT NOT NULL,
  time_of_day         TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE meal_foods (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meal_id     UUID REFERENCES meals(id) ON DELETE CASCADE,
  position    INTEGER NOT NULL,
  name        TEXT NOT NULL,
  quantity    NUMERIC(7,2) NOT NULL,
  unit        TEXT NOT NULL CHECK (unit IN ('g', 'ml', 'piece', 'scoop', 'tbsp', 'tsp', 'cup')),
  calories    INTEGER NOT NULL,
  protein_g   NUMERIC(5,2) NOT NULL,
  carbs_g     NUMERIC(5,2) NOT NULL,
  fat_g       NUMERIC(5,2) NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE training_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE nutrition_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_foods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Coach manages training plans" ON training_plans FOR ALL USING (auth.uid() = coach_id) WITH CHECK (auth.uid() = coach_id);
CREATE POLICY "Client reads training plan" ON training_plans FOR SELECT USING (auth.uid() = client_id);

CREATE POLICY "Coach manages training days" ON training_days FOR ALL USING (
  EXISTS (SELECT 1 FROM training_plans tp WHERE tp.id = training_days.training_plan_id AND tp.coach_id = auth.uid())
);
CREATE POLICY "Client reads training days" ON training_days FOR SELECT USING (
  EXISTS (SELECT 1 FROM training_plans tp WHERE tp.id = training_days.training_plan_id AND tp.client_id = auth.uid())
);

CREATE POLICY "Coach manages exercises" ON training_exercises FOR ALL USING (
  EXISTS (SELECT 1 FROM training_days td JOIN training_plans tp ON tp.id = td.training_plan_id WHERE td.id = training_exercises.training_day_id AND tp.coach_id = auth.uid())
);
CREATE POLICY "Client reads exercises" ON training_exercises FOR SELECT USING (
  EXISTS (SELECT 1 FROM training_days td JOIN training_plans tp ON tp.id = td.training_plan_id WHERE td.id = training_exercises.training_day_id AND tp.client_id = auth.uid())
);

CREATE POLICY "Coach manages nutrition plans" ON nutrition_plans FOR ALL USING (auth.uid() = coach_id) WITH CHECK (auth.uid() = coach_id);
CREATE POLICY "Client reads nutrition plan" ON nutrition_plans FOR SELECT USING (auth.uid() = client_id);

CREATE POLICY "Coach manages meals" ON meals FOR ALL USING (
  EXISTS (SELECT 1 FROM nutrition_plans np WHERE np.id = meals.nutrition_plan_id AND np.coach_id = auth.uid())
);
CREATE POLICY "Client reads meals" ON meals FOR SELECT USING (
  EXISTS (SELECT 1 FROM nutrition_plans np WHERE np.id = meals.nutrition_plan_id AND np.client_id = auth.uid())
);

CREATE POLICY "Coach manages meal foods" ON meal_foods FOR ALL USING (
  EXISTS (SELECT 1 FROM meals m JOIN nutrition_plans np ON np.id = m.nutrition_plan_id WHERE m.id = meal_foods.meal_id AND np.coach_id = auth.uid())
);
CREATE POLICY "Client reads meal foods" ON meal_foods FOR SELECT USING (
  EXISTS (SELECT 1 FROM meals m JOIN nutrition_plans np ON np.id = m.nutrition_plan_id WHERE m.id = meal_foods.meal_id AND np.client_id = auth.uid())
);