# Supabase Integration Guide for Golf Matchplay Tracker

## Overview
This guide walks you through adding Supabase as a persistent backend to replace localStorage.

## Prerequisites
1. Supabase account (free tier works): https://supabase.com
2. Node.js and npm installed
3. This project cloned and running locally

---

## Step 1: Create Supabase Project

1. Go to https://supabase.com and sign up/login
2. Click "New Project"
3. Enter project details:
   - **Name**: `golf-matchplay`
   - **Database Password**: Generate strong password (save it!)
   - **Region**: Choose closest to you
4. Wait 2-3 minutes for setup
5. Copy your **Project URL** and **Anon Key** from Settings → API

---

## Step 2: Set Environment Variables

Add to `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

---

## Step 3: Create Database Tables

In Supabase Console → SQL Editor, run:

```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL, -- In production, use bcrypt
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'player',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Seasons table
CREATE TABLE seasons (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  target_wins INTEGER DEFAULT 10,
  status TEXT DEFAULT 'IN_PROGRESS',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Courses table
CREATE TABLE courses (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  par INTEGER DEFAULT 72,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Holes table
CREATE TABLE holes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id TEXT NOT NULL REFERENCES courses(id),
  hole_number INTEGER NOT NULL,
  par INTEGER NOT NULL,
  handicap INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Rounds table
CREATE TABLE rounds (
  id TEXT PRIMARY KEY,
  season_id TEXT NOT NULL REFERENCES seasons(id),
  course_id TEXT REFERENCES courses(id),
  played_at DATE,
  submitted_by TEXT NOT NULL,
  approved_by TEXT,
  status TEXT DEFAULT 'DRAFT',
  winner_id TEXT,
  submission_reason TEXT,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Scores table (hole-by-hole)
CREATE TABLE scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  round_id TEXT NOT NULL REFERENCES rounds(id) ON DELETE CASCADE,
  hole_number INTEGER NOT NULL,
  player_id TEXT NOT NULL,
  score INTEGER NOT NULL,
  putts INTEGER,
  fairway TEXT,
  gir BOOLEAN,
  hazards TEXT,
  penalty_strokes INTEGER,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Clubs table (player equipment)
CREATE TABLE clubs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id TEXT NOT NULL,
  category TEXT NOT NULL,
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  loft TEXT,
  shaft TEXT,
  flex TEXT,
  notes TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Notifications table
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  type TEXT NOT NULL,
  round_id TEXT REFERENCES rounds(id),
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_rounds_season ON rounds(season_id);
CREATE INDEX idx_rounds_status ON rounds(status);
CREATE INDEX idx_scores_round ON scores(round_id);
CREATE INDEX idx_clubs_player ON clubs(player_id);
CREATE INDEX idx_notifications_user ON notifications(user_id);
```

---

## Step 4: Configure Row Level Security (RLS)

In Supabase Console, enable RLS on all tables:

```sql
-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE seasons ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE clubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Create policies (basic example - adapt for your needs)

-- Users: Can read own profile
CREATE POLICY "Users can read own profile" 
  ON users FOR SELECT 
  USING (auth.uid()::text = id);

-- Rounds: Can read all approved rounds, own draft/pending
CREATE POLICY "Users can read published rounds" 
  ON rounds FOR SELECT 
  USING (status = 'APPROVED' OR submitted_by = auth.uid()::text);

-- Scores: Can read own round's scores
CREATE POLICY "Users can read scores from accessible rounds" 
  ON scores FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM rounds 
      WHERE rounds.id = scores.round_id 
      AND (rounds.status = 'APPROVED' OR rounds.submitted_by = auth.uid()::text)
    )
  );
```

---

## Step 5: Install Supabase Package

```bash
npm install @supabase/supabase-js
```

---

## Step 6: Create Supabase Client

Create `src/lib/supabase.ts`:

```typescript
import { createBrowserClient } from '@supabase/ssr'

export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

// Or for server-side:
import { createServerClient } from '@supabase/ssr'
// See Supabase SSR docs for server setup
```

---

## Step 7: Migrate Data to Supabase

Create `src/lib/migrate.ts`:

```typescript
import { supabase } from './supabase'
import { HISTORICAL_ROUNDS_2025_2026, HISTORICAL_ROUNDS_2026, SEASONS } from '@/data/seedData'
import { COURSES } from '@/data/courses'

export async function migrateToSupabase() {
  try {
    // 1. Upload courses
    await supabase.from('courses').insert(COURSES)

    // 2. Upload seasons
    await supabase.from('seasons').insert(SEASONS)

    // 3. Upload all rounds
    const allRounds = [...HISTORICAL_ROUNDS_2025_2026, ...HISTORICAL_ROUNDS_2026]
    await supabase.from('rounds').insert(allRounds)

    // 4. Create users
    await supabase.from('users').insert([
      {
        username: 'stephanmaree',
        password: '0826595953', // Use bcrypt in production!
        name: 'Stephan Maree',
        phone: '082-659-5953',
        role: 'admin'
      },
      {
        username: 'pauldueplessis',
        password: '0722189584',
        name: 'Paul Du Plessis',
        phone: '072-218-9584',
        role: 'player'
      }
    ])

    console.log('✅ Migration complete!')
  } catch (error) {
    console.error('Migration failed:', error)
  }
}
```

---

## Step 8: Update Components to Use Supabase

### Example: Update RoundsPage.tsx

**Before (localStorage):**
```typescript
const rounds = HISTORICAL_ROUNDS_2026
```

**After (Supabase):**
```typescript
import { supabase } from '@/lib/supabase'
import { useEffect, useState } from 'react'

export default function RoundsPage() {
  const [rounds, setRounds] = useState([])

  useEffect(() => {
    async function fetchRounds() {
      const { data, error } = await supabase
        .from('rounds')
        .select('*, scores(*)')
        .order('played_at', { ascending: false })
      
      if (error) console.error(error)
      else setRounds(data || [])
    }
    
    fetchRounds()
  }, [])

  // Rest of component...
}
```

### Example: Update Auth

**Before (localStorage):**
```typescript
function validateCredentials(username: string, password: string) {
  return VALID_USERS.find(u => u.username === username && u.password === password)
}
```

**After (Supabase):**
```typescript
import { supabase } from '@/lib/supabase'

async function validateCredentials(username: string, password: string) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('username', username)
    .eq('password', password)
    .single()

  return data || null
}
```

---

## Step 9: Implement Real-time Subscriptions

Supabase provides real-time updates for collaborative features:

```typescript
// Subscribe to round updates
const subscription = supabase
  .from('rounds')
  .on('*', (payload) => {
    console.log('Round updated:', payload.new)
    setRounds(prev => [...prev, payload.new])
  })
  .subscribe()

// Cleanup
return () => subscription.unsubscribe()
```

---

## Step 10: Deploy

Once Supabase is integrated:

1. **Update .env.local** with Supabase credentials
2. **Run migration** to seed database
3. **Build & test locally**: `npm run dev`
4. **Deploy to GitHub Pages**: `npm run build`

---

## Important Security Notes

⚠️ **For Production:**
1. Use proper authentication (Supabase Auth, not hardcoded passwords)
2. Hash passwords with bcrypt
3. Enable RLS policies for all data
4. Use environment variables for secrets
5. Set up CORS properly
6. Implement rate limiting

⚠️ **MVP (Current):**
- Hardcoded credentials work for testing
- RLS is recommended but not required for MVP
- localStorage still works as fallback

---

## Next Steps After Supabase

1. ✅ Real-time notifications (WebSocket)
2. ✅ User authentication (Supabase Auth instead of hardcoded)
3. ✅ Persistent storage (automatic sync)
4. ✅ Scalability (can handle multiple users)
5. ✅ Backups (Supabase handles automatically)

---

## Resources

- **Supabase Docs**: https://supabase.com/docs
- **Supabase + Next.js**: https://supabase.com/docs/guides/with-nextjs
- **Database Schemas**: https://supabase.com/docs/guides/database/tables
- **Row Level Security**: https://supabase.com/docs/guides/auth/row-level-security

---

## Questions?

The app is fully functional with localStorage now. Supabase adds:
- **Persistence** across devices
- **Real-time collaboration**
- **Automatic backups**
- **Scalability**

Start with Supabase when you're ready to deploy to production or share access with multiple users.
