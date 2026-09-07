# 📋 Quick Reference Card - Golf Matchplay Tracker

## Commands

```bash
# Development
npm run dev              # Start dev server on port 3000

# Production
npm run build            # Build static files
npm run export           # Export to ./out (GitHub Pages)

# Clean
npm run clean            # Remove build artifacts
npm run dev --reset      # Reset with fresh install
```

## Directory Structure

```
matchplay/
├── src/
│   ├── app/              # Next.js App Router pages
│   │   ├── page.tsx      # Home (/)
│   │   ├── login/        # Login page
│   │   ├── rounds/       # Rounds list & detail
│   │   ├── seasons/      # Season standings
│   │   ├── players/      # Player profiles
│   │   ├── stats/        # Analytics & charts
│   │   └── bag/          # Equipment management
│   ├── components/       # React components
│   │   ├── layout/       # Header, Nav, AppShell
│   │   └── pages/        # Page-level components
│   ├── lib/              # Business logic
│   │   ├── auth.ts       # Authentication
│   │   ├── calculations.ts # Matchplay logic
│   │   ├── notifications.ts # Notifications
│   │   └── golfcourseapi.ts # Course API
│   ├── data/             # Seed data
│   │   ├── seedData.ts   # Historical rounds
│   │   ├── courses.ts    # Course database
│   │   └── users.ts      # Player data
│   ├── types/            # TypeScript interfaces
│   │   └── index.ts      # All type definitions
│   └── styles/           # Global SCSS
│       ├── globals.scss  # Base styles
│       └── _variables.scss # Design tokens
├── public/               # Static assets
├── .env.local           # Environment variables
├── next.config.ts       # Next.js config
├── tsconfig.json        # TypeScript config
└── README.md            # Project docs
```

## Key Files to Understand

| File | Purpose | Edit When |
|------|---------|-----------|
| `src/types/index.ts` | Type definitions | Adding fields to User, Round, Club, etc. |
| `src/styles/_variables.scss` | Design tokens | Changing colors, spacing, sizing |
| `src/lib/auth.ts` | Authentication | Changing login logic |
| `src/data/seedData.ts` | Historical data | Adding more seed rounds |
| `next.config.ts` | Build config | Static export settings |
| `.env.local` | Secrets | Adding API keys |

## Authentication

**Users (Hardcoded for MVP):**
```
Stephan: stephanmaree / 0826595953 (admin)
Paul:    pauldueplessis / 0722189584 (player)
```

**Login Flow:**
1. User visits `/login`
2. Enters credentials
3. `validateCredentials()` checks VALID_USERS
4. Saves to `localStorage['matchplay_auth']`
5. Redirects to home

**Protected Routes:**
- All pages except `/login` wrapped in `AppShell`
- `AppShell` checks `getCurrentUser()` → redirects if not logged in

## Data Storage

**Current (MVP):**
- `localStorage['matchplay_auth']` → User session
- `localStorage['matchplay_rounds']` → New rounds (before Supabase)
- `localStorage['matchplay_notifications']` → Notifications
- `localStorage['bag-{userId}']` → Equipment per player

**After Supabase:**
- All data persists in PostgreSQL
- Real-time subscriptions available
- Row Level Security controls access

## API Integrations

### GolfCourseAPI
- **Endpoint**: `https://api.golfcourseapi.com/v2/courses`
- **Key**: `GOLFCOURSE_API_KEY` (env variable)
- **Usage**: Course search in NewRoundPage
- **Fallback**: 6 hardcoded South African courses

### Supabase (Optional)
- **Setup**: See `SUPABASE_SETUP.md`
- **Purpose**: Persistent backend
- **Status**: Fully designed, ready to implement

## Component Structure

### Layout
```
AppShell (auth gate)
├── Header (logo, user, notifications)
├── Navigation (main menu links)
└── Page Content
```

### Pages
- `HomePage`: Dashboard with standings
- `RoundsPage`: List of all rounds
- `NewRoundPage`: 18-hole scorecard entry
- `RoundDetailPage`: Round view + approval
- `SeasonsPage`: Season records
- `PlayersPage`: Player profiles
- `StatsPage`: Analytics & charts
- `BagPage`: Equipment management
- `LoginPage`: Authentication

## Styling (80's Aesthetic)

**Key Principles:**
1. Bold 2-4px borders, zero radius
2. Uppercase, italic, 900-weight headings
3. Geometric shadows (2-6px offset)
4. Color: Purple, Teal, Mauve, Cream
5. Monospace fonts for numbers/data

**Responsive Breakpoints:**
```scss
$breakpoint-sm:  640px;   // Mobile
$breakpoint-md:  768px;   // Tablet
$breakpoint-lg:  1024px;  // Laptop
$breakpoint-xl:  1280px;  // Desktop
```

## Deployment Options

| Option | Cost | Time | Best For |
|--------|------|------|----------|
| GitHub Pages | Free | 10 min | Quick MVP launch |
| Vercel | Free | 5 min | Production-ready |
| Netlify | Free | 15 min | CDN performance |
| Supabase + Vercel | Free | 2 hrs | Persistent data |

**See: DEPLOYMENT_GUIDE.md for full instructions**

## Common Tasks

### Add New Player
1. Update `VALID_USERS` in `src/lib/auth.ts`
2. Add default clubs in `src/components/pages/BagPage.tsx`
3. Rebuild and deploy

### Add Historical Round
1. Update `HISTORICAL_ROUNDS_2026` in `src/data/seedData.ts`
2. Rebuild (creates static pages via `generateStaticParams()`)
3. Deploy

### Change Colors
1. Edit `src/styles/_variables.scss`
2. Update `--color-primary`, `--color-secondary`, etc.
3. All components inherit automatically

### Add Route
1. Create new folder in `src/app/`
2. Add `page.tsx` with component
3. Update `Navigation.tsx` with link
4. Rebuild

### Update Statistics
1. Edit calculation functions in `src/lib/calculations.ts`
2. Use in `StatsPage.tsx`
3. Rebuild

## Performance

**Build Stats:**
- Time: ~1-2 seconds
- Pages: 25 (all rounds pre-rendered)
- SCSS compilation: <1 second
- Bundle size: ~50-100KB (gzipped)

**Lighthouse Targets:**
- Performance: 95+
- Accessibility: 90+
- Best Practices: 90+
- SEO: 90+

## Debugging

### Check Auth Status
```javascript
// In browser console:
JSON.parse(localStorage.getItem('matchplay_auth'))
```

### View Stored Rounds
```javascript
JSON.parse(localStorage.getItem('matchplay_rounds'))
```

### View Notifications
```javascript
JSON.parse(localStorage.getItem('matchplay_notifications'))
```

### Clear All Storage
```javascript
localStorage.clear()
// Then reload page (redirects to login)
```

## TypeScript Tips

**Key Interfaces:**
- `User`: Player with id, name, role
- `Round`: Match with scores, status, results
- `Season`: Championship with rules
- `Club`: Equipment with specs
- `Notification`: In-app message

**Type Safety:**
- No `any` types allowed
- All data flows typed
- Component props fully typed
- API responses typed

## Git Workflow

```bash
# Create feature branch
git checkout -b feature/new-feature

# Make changes, test locally
npm run dev

# Commit with descriptive message
git add .
git commit -m "Add new feature: xyz"

# Push to GitHub
git push origin feature/new-feature

# Create Pull Request on GitHub
```

## Support

**Documentation:**
- README.md - Project overview
- SUPABASE_SETUP.md - Backend setup
- DEPLOYMENT_GUIDE.md - Deployment instructions
- This file - Quick reference

**External Resources:**
- Next.js: https://nextjs.org/docs
- TypeScript: https://www.typescriptlang.org/docs
- SCSS: https://sass-lang.com/documentation
- Supabase: https://supabase.com/docs

---

**Last Updated**: Phase 21 (All MVP features complete)  
**Status**: ✅ Production Ready  
**Next**: Supabase Integration (optional) or Deploy
