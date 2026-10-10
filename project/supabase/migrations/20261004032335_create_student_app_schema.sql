/*
# Student Discount App - Initial Schema

## Overview
Creates the full database schema for a student discount and free food app with authentication.
The app allows students to browse discounts, track Starving Student Card deals, find free food events,
save deals/events, and view everything on an interactive map and calendar.

## Tables Created

### 1. profiles
Stores extended user profile information beyond auth.users.
- id (uuid, PK, references auth.users)
- username (text, unique, not null)
- full_name (text, not null)
- email (text, not null)
- school (text, not null)
- phone (text, nullable)
- avatar_url (text, nullable) - URL to profile picture in storage
- created_at (timestamptz)

### 2. discounts
Stores all student discounts (both Starving Student Card and general discounts).
- id (uuid, PK)
- company (text, not null)
- title (text, not null)
- description (text, not null)
- discount_type (text, not null) - 'free', 'percentage', 'fixed'
- discount_value (text, not null) - e.g. '50%', 'Free', '$5 off'
- category (text, not null) - e.g. 'food', 'tech', 'subscription', 'clothing', 'entertainment'
- access_instructions (text, not null) - how to redeem
- website_url (text, not null) - link to provider
- is_starving_student (boolean, default false) - true for Starving Student Card deals
- is_new (boolean, default false) - flagged as new
- is_ai (boolean, default false) - AI-related deal
- is_subscription (boolean, default false) - subscription-based deal
- image_url (text, nullable)
- location_name (text, nullable) - for map placement
- latitude (double precision, nullable)
- longitude (double precision, nullable)
- created_at (timestamptz)

### 3. food_events
Stores free food events on campus.
- id (uuid, PK)
- title (text, not null)
- description (text, not null)
- food_type (text, not null) - e.g. 'pizza', 'sandwiches', 'snacks'
- date (date, not null) - date of the event
- start_time (text, not null) - e.g. '12:00 PM'
- end_time (text, not null) - e.g. '2:00 PM'
- location_name (text, not null) - building name
- room_number (text, nullable)
- latitude (double precision, nullable)
- longitude (double precision, nullable)
- created_at (timestamptz)

### 4. saved_discounts
Tracks which discounts a user has saved to their hub.
- id (uuid, PK)
- user_id (uuid, not null, references profiles, default auth.uid())
- discount_id (uuid, not null, references discounts)
- created_at (timestamptz)
- UNIQUE(user_id, discount_id)

### 5. saved_events
Tracks which food events a user has saved to their hub.
- id (uuid, PK)
- user_id (uuid, not null, references profiles, default auth.uid())
- event_id (uuid, not null, references food_events)
- created_at (timestamptz)
- UNIQUE(user_id, event_id)

### 6. used_deals
Tracks which Starving Student Card deals a user has marked as used.
- id (uuid, PK)
- user_id (uuid, not null, references profiles, default auth.uid())
- discount_id (uuid, not null, references discounts)
- created_at (timestamptz)
- UNIQUE(user_id, discount_id)

## Security
- RLS enabled on all tables.
- profiles: owner-scoped (auth.uid() = id).
- discounts, food_events: public read (anon + authenticated), no public write.
- saved_discounts, saved_events, used_deals: owner-scoped CRUD.
*/

-- PROFILES TABLE
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  full_name text NOT NULL,
  email text NOT NULL,
  school text NOT NULL,
  phone text,
  avatar_url text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
CREATE POLICY "profiles_select_own" ON profiles FOR SELECT
TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
CREATE POLICY "profiles_insert_own" ON profiles FOR INSERT
TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE
TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_delete_own" ON profiles;
CREATE POLICY "profiles_delete_own" ON profiles FOR DELETE
TO authenticated USING (auth.uid() = id);

-- DISCOUNTS TABLE
CREATE TABLE IF NOT EXISTS discounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company text NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  discount_type text NOT NULL DEFAULT 'percentage',
  discount_value text NOT NULL,
  category text NOT NULL DEFAULT 'food',
  access_instructions text NOT NULL,
  website_url text NOT NULL,
  is_starving_student boolean NOT NULL DEFAULT false,
  is_new boolean NOT NULL DEFAULT false,
  is_ai boolean NOT NULL DEFAULT false,
  is_subscription boolean NOT NULL DEFAULT false,
  image_url text,
  location_name text,
  latitude double precision,
  longitude double precision,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE discounts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "discounts_select_all" ON discounts;
CREATE POLICY "discounts_select_all" ON discounts FOR SELECT
TO anon, authenticated USING (true);

-- FOOD_EVENTS TABLE
CREATE TABLE IF NOT EXISTS food_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  food_type text NOT NULL,
  date date NOT NULL,
  start_time text NOT NULL,
  end_time text NOT NULL,
  location_name text NOT NULL,
  room_number text,
  latitude double precision,
  longitude double precision,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE food_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "food_events_select_all" ON food_events;
CREATE POLICY "food_events_select_all" ON food_events FOR SELECT
TO anon, authenticated USING (true);

-- SAVED_DISCOUNTS TABLE
CREATE TABLE IF NOT EXISTS saved_discounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  discount_id uuid NOT NULL REFERENCES discounts(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, discount_id)
);
ALTER TABLE saved_discounts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "saved_discounts_select_own" ON saved_discounts;
CREATE POLICY "saved_discounts_select_own" ON saved_discounts FOR SELECT
TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "saved_discounts_insert_own" ON saved_discounts;
CREATE POLICY "saved_discounts_insert_own" ON saved_discounts FOR INSERT
TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "saved_discounts_delete_own" ON saved_discounts;
CREATE POLICY "saved_discounts_delete_own" ON saved_discounts FOR DELETE
TO authenticated USING (auth.uid() = user_id);

-- SAVED_EVENTS TABLE
CREATE TABLE IF NOT EXISTS saved_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  event_id uuid NOT NULL REFERENCES food_events(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, event_id)
);
ALTER TABLE saved_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "saved_events_select_own" ON saved_events;
CREATE POLICY "saved_events_select_own" ON saved_events FOR SELECT
TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "saved_events_insert_own" ON saved_events;
CREATE POLICY "saved_events_insert_own" ON saved_events FOR INSERT
TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "saved_events_delete_own" ON saved_events;
CREATE POLICY "saved_events_delete_own" ON saved_events FOR DELETE
TO authenticated USING (auth.uid() = user_id);

-- USED_DEALS TABLE
CREATE TABLE IF NOT EXISTS used_deals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  discount_id uuid NOT NULL REFERENCES discounts(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, discount_id)
);
ALTER TABLE used_deals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "used_deals_select_own" ON used_deals;
CREATE POLICY "used_deals_select_own" ON used_deals FOR SELECT
TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "used_deals_insert_own" ON used_deals;
CREATE POLICY "used_deals_insert_own" ON used_deals FOR INSERT
TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "used_deals_delete_own" ON used_deals;
CREATE POLICY "used_deals_delete_own" ON used_deals FOR DELETE
TO authenticated USING (auth.uid() = user_id);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_discounts_category ON discounts(category);
CREATE INDEX IF NOT EXISTS idx_discounts_starving_student ON discounts(is_starving_student);
CREATE INDEX IF NOT EXISTS idx_food_events_date ON food_events(date);
CREATE INDEX IF NOT EXISTS idx_saved_discounts_user ON saved_discounts(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_events_user ON saved_events(user_id);
CREATE INDEX IF NOT EXISTS idx_used_deals_user ON used_deals(user_id);
