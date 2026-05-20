-- 003_client_profile.sql

-- Targets are now set by the coach, not the client at signup
ALTER TABLE programs ALTER COLUMN calorie_target DROP NOT NULL;
ALTER TABLE programs ALTER COLUMN protein_target DROP NOT NULL;
ALTER TABLE programs ALTER COLUMN workout_target DROP NOT NULL;

-- Client profile fields (used by coach to generate targets)
ALTER TABLE users ADD COLUMN IF NOT EXISTS date_of_birth DATE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS height_cm NUMERIC(5,1);

-- Allow week 0 photos (before photos at program start)
ALTER TABLE progress_photos DROP CONSTRAINT IF EXISTS progress_photos_week_number_check;
ALTER TABLE progress_photos ADD CONSTRAINT progress_photos_week_number_check
  CHECK (week_number BETWEEN 0 AND 12);
