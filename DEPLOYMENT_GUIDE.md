# 🚀 Deployment Guide - Golf Matchplay Tracker

Your MVP is complete and ready for deployment. Choose your deployment option below.

---

## Option 1: GitHub Pages (Recommended for MVP) ⭐

**Cost**: FREE  
**Time**: 10 minutes  
**Best for**: Quick launch, no backend needed

### Steps:

1. **Create GitHub Repository**
   ```bash
   git init
   git add .
   git commit -m "Initial commit: MVP golf matchplay tracker"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/matchplay.git
   git push -u origin main
   ```

2. **Enable GitHub Pages**
   - Go to repository → Settings → Pages
   - **Source**: Deploy from branch
   - **Branch**: `main` → `/root`
   - Click Save

3. **Build & Deploy**
   ```bash
   npm run build
   ```
   This creates `./out` directory ready for GitHub Pages

4. **Access Your App**
   ```
   https://YOUR_USERNAME.github.io/matchplay
   ```

### Troubleshooting:
- Build failing? Check `next.config.ts` has `output: 'export'`
- Images not loading? Check `images.unoptimized: true`
- Routes 404? Check `trailingSlash: true`

---

## Option 2: Vercel (Easiest) ✨

**Cost**: FREE tier available  
**Time**: 5 minutes  
**Best for**: Zero-config deployment, automatic updates

### Steps:

1. Push code to GitHub (see Option 1)

2. Go to https://vercel.com/import

3. Select your GitHub repository

4. Click "Import" → Vercel auto-configures everything

5. Set environment variables:
   ```
   NEXT_PUBLIC_GOLFCOURSE_API_KEY = 3ZF2UCGBNHMFWFJWAFPOYTN3I4
   ```

6. Click "Deploy"

**Your app is live!** Vercel gives you: `https://matchplay.vercel.app`

---

## Option 3: Netlify

**Cost**: FREE  
**Time**: 15 minutes  
**Best for**: CDN performance, PR previews

### Steps:

1. Build locally: `npm run build`

2. Go to https://app.netlify.com/drop

3. Drag & drop the `./out` folder

4. Netlify auto-deploys

**Alternative: Connect GitHub:**
- Connect your GitHub account
- Select repository
- Build command: `npm run build`
- Publish directory: `out`

---

## Option 4: Supabase + Vercel (Production) 🔧

**Cost**: FREE tier (generous)  
**Time**: 2 hours setup  
**Best for**: Persistent data, multiple users, production

### Setup:

See `SUPABASE_SETUP.md` for complete guide.

**In Summary:**
1. Create Supabase project
2. Set up PostgreSQL database
3. Add `.env.local` with Supabase credentials
4. Update components to use `@supabase/supabase-js`
5. Deploy to Vercel

---

## Pre-Deployment Checklist

- [ ] All environment variables set
- [ ] Build succeeds locally: `npm run build`
- [ ] No TypeScript errors
- [ ] Tested on mobile device
- [ ] Login credentials work (stephanmaree / 0826595953)
- [ ] Can create new rounds
- [ ] Can approve/reject rounds
- [ ] No console errors

---

## Post-Deployment Testing

After deployment, test these flows:

### Authentication
```
1. Navigate to login
2. Try wrong credentials → Error message
3. Login with: stephanmaree / 0826595953
4. Should redirect to home
```

### New Round
```
1. Click "+ NEW ROUND"
2. Select date and course
3. Enter scores for all 18 holes
4. Click "Save as Draft"
5. Verify round appears in /rounds list
```

### Approval
```
1. Log out and log back in
2. Navigate to newly created round
3. If status is "PENDING_APPROVAL":
   - Click "✓ Approve Round"
   - Check notification bell
   - Should see notification
```

### Stats
```
1. Go to /stats
2. See player stats and charts
3. Verify calculations are correct
```

---

## Environment Variables

**For any deployment, ensure these are set:**

```bash
# GitHub Pages (no API needed for MVP)
# Build succeeds without these

# Vercel / Netlify
NEXT_PUBLIC_GOLFCOURSE_API_KEY=3ZF2UCGBNHMFWFJWAFPOYTN3I4

# Supabase (optional, for persistent backend)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

---

## Performance Tips

### Local Development
```bash
# Fast rebuilds
npm run dev

# Production-like build
npm run build
npm run start
```

### Production
- Images are pre-optimized
- CSS is minified
- JavaScript is tree-shaken
- All 25 round pages are pre-rendered

**Lighthouse Score Target:**
- Performance: 95+
- Accessibility: 90+
- Best Practices: 90+
- SEO: 90+

---

## Custom Domain (GitHub Pages)

If you have a custom domain:

1. Buy domain (GoDaddy, Namecheap, etc.)

2. Add DNS records:
   ```
   CNAME: username.github.io
   ```

3. GitHub Settings → Pages → Custom domain: `yourdomain.com`

4. GitHub auto-generates SSL certificate

---

## Troubleshooting

### Build Fails
```bash
# Clear cache and rebuild
rm -rf .next out
npm run build
```

### "Cannot find module" errors
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Port 3000 already in use
```bash
# Kill process on port 3000
# Mac/Linux:
lsof -ti:3000 | xargs kill -9

# Then restart:
npm run dev
```

### Authentication loop (keeps redirecting to login)
- Check `localStorage` has auth data
- Verify credentials match VALID_USERS in auth.ts
- Clear browser cache and try again

---

## Recommended Deployment

**For this project, I recommend:**

1. **MVP Launch** → GitHub Pages (free, instant, no backend)
2. **User Testing** → Share link, get feedback
3. **Production** → Vercel + Supabase (persistent data, real auth)

**Timeline:**
- GitHub Pages: 10 min ⚡
- Vercel: 5 min ⚡⚡
- Supabase integration: 2 hours 🔧

---

## Support Resources

- **Next.js Docs**: https://nextjs.org/docs
- **Vercel Deployment**: https://vercel.com/docs
- **GitHub Pages**: https://pages.github.com
- **Netlify Deploy**: https://docs.netlify.com
- **Supabase Setup**: See `SUPABASE_SETUP.md`

---

## Need Help?

If deployment fails:

1. Check build output: `npm run build 2>&1 | tail -50`
2. Verify environment variables
3. Clear cache: `npm run build --clean`
4. Check Node version: `node --version` (should be 18+)

**You've got this!** The hardest part is done. Deployment is just sharing. 🚀
