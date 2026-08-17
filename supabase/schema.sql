-- ==========================================
-- Petsogram Production Database Schema & RLS
-- ==========================================

-- Enable pgcrypto for UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==========================================
-- 1. Profiles (Tied to Auth.users)
-- ==========================================
CREATE TABLE profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles are viewable by everyone." ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile." ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile." ON profiles FOR UPDATE USING (auth.uid() = id);

-- ==========================================
-- 2. Rewards (User-Specific Point Economy)
-- ==========================================
CREATE TABLE reward_balances (
    user_id UUID REFERENCES auth.users(id) PRIMARY KEY,
    balance INTEGER DEFAULT 0,
    lifetime INTEGER DEFAULT 0,
    redeemed INTEGER DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE reward_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    action_type TEXT NOT NULL,
    reference_id TEXT NOT NULL,
    points INTEGER NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'credited',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE reward_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE reward_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own reward balance." ON reward_balances FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view own transactions." ON reward_transactions FOR SELECT USING (auth.uid() = user_id);
-- Insert operations for rewards should generally be handled by secure Postgres Functions / RPCs to prevent client spoofing.
CREATE POLICY "Users can insert own transactions." ON reward_transactions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ==========================================
-- 3. Abuse Reports & Emergency Cases (Publicly Accessible)
-- ==========================================
CREATE TABLE abuse_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id TEXT UNIQUE NOT NULL, -- e.g. PS-2026-12345
    category TEXT NOT NULL,
    description TEXT NOT NULL,
    location TEXT NOT NULL,
    evidence_url TEXT,
    status TEXT DEFAULT 'Submitted',
    reporter_id UUID REFERENCES auth.users(id), -- Optional (null if anonymous)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE rescue_cases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id TEXT UNIQUE NOT NULL,
    reporter_location JSONB NOT NULL,
    pickup_point JSONB NOT NULL,
    severity TEXT NOT NULL,
    animal_type TEXT,
    description TEXT,
    status TEXT DEFAULT 'Pending Rescue',
    reporter_id UUID REFERENCES auth.users(id), -- Optional
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE abuse_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE rescue_cases ENABLE ROW LEVEL SECURITY;

-- CRITICAL: Allow completely anonymous inserts to ensure reporting isn't blocked.
CREATE POLICY "Anyone can submit an abuse report." ON abuse_reports FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can submit a rescue case." ON rescue_cases FOR INSERT WITH CHECK (true);

-- Only creators or admins can view them
CREATE POLICY "Users can view own abuse reports." ON abuse_reports FOR SELECT USING (auth.uid() = reporter_id);
CREATE POLICY "Users can view own rescue cases." ON rescue_cases FOR SELECT USING (auth.uid() = reporter_id);


-- ==========================================
-- 4. Animals (Adoption / Missing)
-- ==========================================
CREATE TABLE animals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL, -- 'adoption', 'missing'
    name TEXT NOT NULL,
    species TEXT NOT NULL,
    breed TEXT,
    age TEXT,
    location TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    owner_id UUID REFERENCES auth.users(id) NOT NULL,
    status TEXT DEFAULT 'Available',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE animals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view animals." ON animals FOR SELECT USING (true);
CREATE POLICY "Users can insert animals." ON animals FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Users can update own animals." ON animals FOR UPDATE USING (auth.uid() = owner_id);

-- ==========================================
-- 5. Events (Community Meetups)
-- ==========================================
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    location TEXT NOT NULL,
    price TEXT DEFAULT 'Free',
    participants INTEGER DEFAULT 0,
    image_url TEXT,
    organizer_id UUID REFERENCES auth.users(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE event_registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES events(id) NOT NULL,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(event_id, user_id)
);

ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view events." ON events FOR SELECT USING (true);
CREATE POLICY "Users can create events." ON events FOR INSERT WITH CHECK (auth.uid() = organizer_id);
CREATE POLICY "Users can view their registrations." ON event_registrations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can register for events." ON event_registrations FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ==========================================
-- 6. Marketplace
-- ==========================================
CREATE TABLE marketplace_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category TEXT NOT NULL, -- 'New', 'Pre-Owned', 'Donate'
    name TEXT NOT NULL,
    price TEXT NOT NULL,
    condition TEXT,
    location TEXT,
    image_url TEXT,
    seller_id UUID REFERENCES auth.users(id) NOT NULL,
    status TEXT DEFAULT 'Available',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE marketplace_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view marketplace items." ON marketplace_items FOR SELECT USING (true);
CREATE POLICY "Users can list marketplace items." ON marketplace_items FOR INSERT WITH CHECK (auth.uid() = seller_id);
CREATE POLICY "Users can update own marketplace items." ON marketplace_items FOR UPDATE USING (auth.uid() = seller_id);

-- ==========================================
-- 7. Community Posts
-- ==========================================
CREATE TABLE community_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id UUID REFERENCES auth.users(id) NOT NULL,
    category TEXT NOT NULL,
    content TEXT NOT NULL,
    likes INTEGER DEFAULT 0,
    comments INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view community posts." ON community_posts FOR SELECT USING (true);
CREATE POLICY "Users can create community posts." ON community_posts FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Users can update own posts." ON community_posts FOR UPDATE USING (auth.uid() = author_id);
