-- 002_multi_tenant.sql

-- Update users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'client' CHECK (role IN ('coach', 'client'));
ALTER TABLE users ADD COLUMN IF NOT EXISTS coach_id UUID REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS google_id TEXT UNIQUE;

-- Coaches table
CREATE TABLE IF NOT EXISTS coaches (
  id          UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  coach_code  TEXT UNIQUE NOT NULL,
  bio         TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Coach notes
CREATE TABLE IF NOT EXISTS coach_notes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id    UUID REFERENCES users(id) ON DELETE CASCADE,
  client_id   UUID REFERENCES users(id) ON DELETE CASCADE,
  week_number INTEGER,
  content     TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Update programs
ALTER TABLE programs ADD COLUMN IF NOT EXISTS created_by TEXT DEFAULT 'client' CHECK (created_by IN ('client', 'coach'));

-- Update goal_adjustments
ALTER TABLE goal_adjustments ADD COLUMN IF NOT EXISTS adjusted_by TEXT DEFAULT 'client' CHECK (adjusted_by IN ('client', 'coach'));

-- RLS on new tables
ALTER TABLE coaches ENABLE ROW LEVEL SECURITY;
ALTER TABLE coach_notes ENABLE ROW LEVEL SECURITY;

-- Coaches policies
CREATE POLICY "Coaches manage own profile" ON coaches FOR ALL
  USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE POLICY "Clients can read their coach" ON coaches FOR SELECT
  USING (EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.coach_id = coaches.id));

CREATE POLICY "Anyone can look up coach by code" ON coaches FOR SELECT
  USING (true);

-- Coach notes policies
CREATE POLICY "Coaches manage own notes" ON coach_notes FOR ALL
  USING (auth.uid() = coach_id) WITH CHECK (auth.uid() = coach_id);

CREATE POLICY "Clients can read own notes" ON coach_notes FOR SELECT
  USING (auth.uid() = client_id);

-- Programs — coaches can manage their clients' programs
CREATE POLICY "Coaches manage client programs" ON programs FOR ALL
  USING (EXISTS (SELECT 1 FROM users WHERE users.id = programs.user_id AND users.coach_id = auth.uid()));

-- Check-ins — coaches can read their clients' check-ins
CREATE POLICY "Coaches read client check_ins" ON check_ins FOR SELECT
  USING (EXISTS (SELECT 1 FROM users WHERE users.id = check_ins.user_id AND users.coach_id = auth.uid()));

-- Goal adjustments — coaches can manage their clients' adjustments
CREATE POLICY "Coaches manage client adjustments" ON goal_adjustments FOR ALL
  USING (EXISTS (SELECT 1 FROM users WHERE users.id = goal_adjustments.user_id AND users.coach_id = auth.uid()));
