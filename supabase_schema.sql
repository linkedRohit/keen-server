
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

--------------------------------------------------------------
-- 1. people
--------------------------------------------------------------
CREATE TABLE people (
  id           uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name         text NOT NULL,
  persona_tags text[] DEFAULT '{}',
  created_at   timestamp with time zone DEFAULT now()
);

-- RLS: people
ALTER TABLE people ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create their own people"
ON people FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own people"
ON people FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own people"
ON people FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own people"
ON people FOR DELETE
USING (auth.uid() = user_id);


--------------------------------------------------------------
-- 2. meetings
--------------------------------------------------------------
CREATE TABLE meetings (
  id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  person_id       uuid NOT NULL REFERENCES people(id) ON DELETE CASCADE,
  title           text NOT NULL,
  meeting_time    timestamp with time zone NOT NULL,
  reflection_text text NOT NULL,
  created_at      timestamp with time zone DEFAULT now()
);

-- RLS: meetings
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create their own meetings"
ON meetings FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own meetings"
ON meetings FOR SELECT
USING (auth.uid() = user_id);

-- (Optional) Update/Delete
CREATE POLICY "Users can update their own meetings"
ON meetings FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own meetings"
ON meetings FOR DELETE
USING (auth.uid() = user_id);


--------------------------------------------------------------
-- 3. insights
--------------------------------------------------------------
CREATE TABLE insights (
  id            uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  meeting_id    uuid NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
  -- We track user_id here too for simpler RLS, though it's technically redundant via meeting_id
  user_id       uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  json_payload  jsonb NOT NULL,
  meeting_score int,
  created_at    timestamp with time zone DEFAULT now()
);

-- RLS: insights
ALTER TABLE insights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert insights (usually server-side, but good for consistency)"
ON insights FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own insights"
ON insights FOR SELECT
USING (auth.uid() = user_id);

-- Optional: If we strictly want insights to be server-generated only,
-- we could restrict INSERTs further, but checking auth.uid() = user_id is standard baseline.

--------------------------------------------------------------
-- STORAGE / BUCKETS (If needed, none requested yet)
--------------------------------------------------------------

-- End of Schema
