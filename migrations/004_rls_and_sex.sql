-- 004_rls_and_sex.sql

-- Fix: coaches were unable to read their clients' user profiles
-- (the only existing SELECT policy required auth.uid() = id, which excluded coaches)
CREATE POLICY "Coaches can view client profiles" ON users FOR SELECT
  USING (coach_id = auth.uid());

-- Sex field for calorie/macro calculations
ALTER TABLE users ADD COLUMN IF NOT EXISTS sex TEXT CHECK (sex IN ('male', 'female', 'other'));
