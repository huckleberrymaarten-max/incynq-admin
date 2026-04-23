# InCynq Admin Panel

Standalone admin dashboard for InCynq. Deployed separately to `admin.incynq.app`.

## Local Development

```bash
npm install
npm run dev
```

Opens at `http://localhost:5173`

## Deployment to Vercel

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "InCynq admin panel"
git remote add origin https://github.com/YOUR_USERNAME/incynq-admin.git
git push -u origin main
```

### 2. Deploy to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click **Add New** → **Project**
3. Import your `incynq-admin` repo
4. Vercel auto-detects Vite — click **Deploy**
5. Wait for deployment to finish
6. Copy the production URL (e.g., `incynq-admin.vercel.app`)

### 3. Point admin.incynq.app to Vercel

**In your DNS provider (e.g., Cloudflare, GoDaddy):**

Add a CNAME record:
```
Type:  CNAME
Name:  admin
Value: cname.vercel-dns.com
TTL:   Auto
```

**In Vercel:**
1. Go to your project → **Settings** → **Domains**
2. Click **Add Domain**
3. Enter `admin.incynq.app`
4. Vercel will verify the DNS automatically (takes ~5-10 minutes)

Done! Your admin panel is now live at `https://admin.incynq.app`

## Login

Only accounts with `account_type` set to admin roles can log in:
- `admin`
- `super_admin`
- `moderator`
- `support`
- `finance`
- `content_editor`

To promote an account:
```sql
UPDATE profiles 
SET account_type = 'admin' 
WHERE username = 'your-username';
```

## Tech Stack

- React 18 + Vite
- Supabase (same backend as main app)
- No routing — single-page admin dashboard
- Zero dependencies beyond React + Supabase SDK

## Security Notes

- Requires valid Supabase auth session
- Role-based tab visibility (moderators don't see finance tab, etc.)
- All queries use RLS policies from main database
- No signup — login only with existing InCynq accounts
