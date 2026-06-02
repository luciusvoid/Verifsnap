-- Create archives table
CREATE TABLE archives (
  id TEXT PRIMARY KEY,
  wallet_address TEXT NOT NULL,
  title TEXT NOT NULL,
  domain TEXT NOT NULL,
  url TEXT NOT NULL,
  favicon TEXT NOT NULL,
  thumbnail TEXT NOT NULL,
  timestamp TEXT NOT NULL,
  status TEXT NOT NULL,
  tracking BOOLEAN DEFAULT false,
  collection TEXT,
  "sizeMb" NUMERIC NOT NULL,
  versions INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create activities table
CREATE TABLE activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address TEXT NOT NULL,
  status TEXT NOT NULL,
  details TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE archives ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- Policies for archives table
-- Only allow users to read/insert their own archives based on custom JWT
CREATE POLICY "Users can read own archives"
ON archives FOR SELECT
USING ((auth.jwt()->>'wallet_address') = wallet_address);

CREATE POLICY "Users can insert own archives"
ON archives FOR INSERT
WITH CHECK ((auth.jwt()->>'wallet_address') = wallet_address);

-- Policies for activities table
CREATE POLICY "Users can read own activities"
ON activities FOR SELECT
USING ((auth.jwt()->>'wallet_address') = wallet_address);

CREATE POLICY "Users can insert own activities"
ON activities FOR INSERT
WITH CHECK ((auth.jwt()->>'wallet_address') = wallet_address);
