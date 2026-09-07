# Stephan vs Paul - Golf Matchplay Tracker

A premium, retro-styled golf matchplay tracking website for two friends competing in an ongoing championship. Built with Next.js, TypeScript, and an 80's aesthetic.

**Live Standings (2026 Season):** Paul 4 - 3 Stephan | **First to 10**

## 🎨 Features

### Core Functionality ✅
- ✅ Private authentication (username/password login)
- ✅ Real-time standings and season tracking
- ✅ Historical round records (2025–2026 season: Paul won 10–8)
- ✅ Player profiles with statistics
- ✅ Responsive design (mobile-first)
- ✅ Static export for GitHub Pages deployment

### New in This Release ✨
- ✅ **New Round Creation** - 18-hole scorecard entry with real-time totals
- ✅ **Course Selector** - Integrated GolfCourseAPI + 6 hardcoded South African courses
- ✅ **Approval Workflow** - Admin approval/rejection with reason tracking
- ✅ **In-App Notifications** - Bell icon with real-time notifications for round updates
- ✅ **Advanced Statistics** - 8 performance metrics, score charts, win rates
- ✅ **Player Equipment** - Manage clubs ("What's in the Bag") with full CRUD
- ✅ **80's Retro UI** - Bold borders, geometric styling, vibrant color palette

### Navigation
```
HOME | ROUNDS | SEASONS | PLAYERS | STATS | BAG | + NEW ROUND
```

## 🏗️ Tech Stack

- **Framework**: Next.js 16.3.4 (App Router)
- **Language**: TypeScript 5 (strict mode)
- **Styling**: SCSS with design tokens (80's retro)
- **State Management**: localStorage (ready for Supabase)
- **API Integration**: GolfCourseAPI
- **Deployment**: Static export (GitHub Pages)

## 🎨 Design System

- **Primary Color**: #241F59 (Deep Purple)
- **Secondary**: #607B7D (Muted Teal)
- **Accent**: #B4869F (Mauve)
- **Background**: #FEF3DC (Cream)
- **Typography**: Uppercase, italic, 900-weight headings
- **Borders**: Bold 2-4px, sharp corners (no radius)
- **Shadows**: Geometric offsets (2-6px) for depth

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm

### Installation
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Export static files
npm run export
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Login Credentials

**For Development:**

| Player  | Username           | Password   | Role  |
|---------|-------------------|-----------|-------|
| Stephan | `stephanmaree`    | `0826595953` | Admin |
| Paul    | `pauldueplessis`  | `0722189584` | Player|

These credentials are demo-only. In production, authentication should use Supabase.

## 🏗️ Architecture

### Tech Stack

- **Framework:** Next.js 16.3.4 with App Router
- **Language:** TypeScript
- **Styling:** SCSS with BEM naming convention
- **Deployment:** GitHub Pages (static export)
- **Auth:** Username/password (demo) → Supabase (planned)
- **Backend:** Supabase (PostgreSQL + Authentication + Row Level Security)

### Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home/Dashboard
│   ├── login/             # Authentication
│   ├── rounds/            # Round history and detail pages
│   ├── seasons/           # Season standings
│   └── players/           # Player profiles
│
├── components/
│   ├── layout/            # Header, Navigation, AppShell
│   └── pages/             # Page-specific components
│
├── lib/
│   ├── auth.ts           # Authentication utilities
│   ├── calculations.ts   # Matchplay calculations
│   └── ...
│
├── styles/
│   ├── globals.scss      # Global styles
│   ├── _variables.scss   # Design tokens
│   └── _mixins.scss      # SCSS mixins
│
├── types/
│   └── index.ts          # TypeScript definitions
│
└── data/
    └── seedData.ts       # Historical round data
```

## 🎨 Design System

### Colors

- **Primary:** `#31533d` (Golf green)
- **Background:** `#f3f1e9` (Cream)
- **Surface:** `#faf9f4` (Off-white)
- **Text:** `#1d241f` (Charcoal)

### Typography

- **Display:** DM Sans or system sans-serif
- **Body:** DM Sans or system sans-serif
- **Monospace:** IBM Plex Mono (for scores)

### Design Principles

- Minimal, editorial aesthetic
- Restrained use of color
- Strong typography hierarchy
- Generous whitespace
- Clean scorecard-inspired layouts
- Mobile-first responsive design

## 📊 Data Model

### Key Entities

**User**
- id, name, phone, role (admin/player), created/updated timestamps

**Season**
- id, name, startDate, endDate, targetWins (10), status (IN_PROGRESS/COMPLETED)

**Round**
- id, seasonId, courseId, playedAt, submittedBy, status, winnerId, scores, timestamps

**HoleScore**
- holeNumber, playerId, score, putts, fairway, gir, hazards, notes

**Course**
- id, externalId, name, clubName, city, par, holes, coordinates

## 🔧 Development

### Available Scripts

```bash
npm run dev      # Start dev server (http://localhost:3000)
npm run build    # Build for production (static export to ./out)
npm run start    # Start production server
npm run lint     # Run ESLint
```

### Building for Static Export

The project is configured for static export (GitHub Pages):

```bash
npm run build
# Output: ./out directory ready for deployment
```

### Environment Variables

Create `.env.local` in the project root:

```env
# Supabase (when ready to add backend)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# GolfCourseAPI (server-side only for course imports)
GOLFCOURSE_API_KEY=3ZF2UCGBNHMFWFJWAFPOYTN3I4
```

**Important:** Never commit real secrets to Git. Use `.env.local` (in `.gitignore`) for local development.

## 📱 Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## 🚢 Deployment

### GitHub Pages

1. Create a GitHub repository
2. Configure GitHub Actions workflow to deploy to GitHub Pages
3. The static build (`./out` directory) will be deployed automatically

Example workflow:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run build
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./out
```

## 🎯 Development Roadmap

- [x] Project setup and scaffolding
- [x] Authentication UI (demo mode)
- [x] Dashboard and season standings
- [x] Rounds and seasons pages
- [x] Player profiles with basic stats
- [ ] New round creation flow
- [ ] Scorecard entry interface
- [ ] Approval workflow with notifications
- [ ] In-app notification system
- [ ] Course selector and GolfCourseAPI integration
- [ ] Player statistics and analytics
- [ ] Club/bag management
- [ ] Supabase integration
- [ ] Production deployment to GitHub Pages
- [ ] Polish and optimization

## 📝 Notes

- Historical 2026 rounds are seeded without detailed scores. Stephan can edit these to add dates, courses, and hole-by-hole scores.
- The 2025–2026 season is complete (Paul won 10–8).
- Authentication currently uses hardcoded credentials for demo. Production should use Supabase Auth.
- Email notifications are not implemented. The app uses in-app notifications instead.

## 📧 Contact

- **Stephan Maree:** stephanmaree@gmail.com, 0826595953
- **Paul Du Plessis:** 0722189584

---

Built with ❤️ for golf enthusiasts. Minimal, fast, and elegant.
