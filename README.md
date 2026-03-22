# ApplyNG — OpportunityHub Nigeria

Nigeria's #1 platform for scholarships, jobs, fellowships, internships, and grants.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL database (or Supabase)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/ApplyNG.git
cd ApplyNG

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Edit .env.local with your values
nano .env.local

# Push database schema
npx prisma db push

# Generate Prisma client
npx prisma generate

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🔧 Environment Variables

Copy `.env.example` to `.env.local` and fill in:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/applyng
NEXTAUTH_SECRET=generate-with-openssl-rand-base64-32
NEXTAUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=from-google-console
GOOGLE_CLIENT_SECRET=from-google-console
RESEND_API_KEY=from-resend.com
NEXT_PUBLIC_ADSENSE_ID=ca-pub-your-adsense-id
CRON_SECRET=random-secure-string
ADMIN_EMAIL=admin@yourdomain.com
```

### Generate NEXTAUTH_SECRET
```bash
openssl rand -base64 32
```

## 🗄️ Database Setup (Supabase)

1. Create a new project at [supabase.com](https://supabase.com)
2. Get the connection string from Project Settings → Database
3. Use the **Transaction pooler** URL for `DATABASE_URL`
4. Run `npx prisma db push` to create tables

## 🔐 Google OAuth Setup

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create a new project
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
6. Copy Client ID and Secret to `.env.local`

## 📧 Email Setup (Resend)

1. Sign up at [resend.com](https://resend.com)
2. Create an API key
3. Add to `.env.local` as `RESEND_API_KEY`
4. Verify your sending domain

## 🚀 Deployment (Vercel)

1. Push your code to GitHub
2. Import project at [vercel.com](https://vercel.com)
3. Add all environment variables in Vercel Dashboard
4. Deploy!

## 📁 Project Structure

```
/app                    # Next.js 14 App Router
  /layout.tsx           # Root layout with providers
  /page.tsx             # Homepage
  /[category]/          # Category listing pages
    /[slug]/            # Post detail pages
  /tag/[name]/          # Tag-filtered pages
  /auth/                # Auth pages (signin, signup)
  /dashboard/           # User dashboard
  /admin/               # Admin panel
  /api/                 # API routes
  /submit/              # Submit opportunity page
  /about, /contact, /privacy, /terms

/components
  /layout/              # Navbar, Footer
  /listings/            # PostCard, PostFilter, SkeletonLoader
  /admin/               # RichTextEditor, AdminTable
  /dashboard/           # AlertManager
  /ads/                 # AdBanner, SponsoredBadge

/lib
  /prisma.ts            # Prisma singleton
  /auth.ts              # NextAuth config
  /mail.ts              # Email templates (Resend)
  /utils.ts             # Helper functions
  /constants.ts         # App constants
  /schemas.ts           # Zod validation schemas

/prisma
  /schema.prisma        # Database schema
```

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL + Prisma ORM
- **Auth**: NextAuth.js (Google OAuth + Email)
- **Email**: Resend API
- **Rich Text**: TipTap
- **Validation**: Zod
- **Deployment**: Vercel + Supabase

## 🔒 Security Features

- Input validation with Zod on all API routes
- Parameterized queries (SQL injection prevention)
- DOMPurify for XSS protection in rich text
- Secure HTTP headers (CSP, X-Frame-Options, etc.)
- Rate limiting on public endpoints
- bcrypt password hashing
- HttpOnly + Secure cookies
- Role-based access control (USER/ADMIN)

## 👑 Creating Admin User

After signing up, update your user role in the database:

```sql
UPDATE "User" SET role = 'ADMIN' WHERE email = 'your@email.com';
```

Or with Prisma Studio:
```bash
npx prisma studio
```

## 📊 Cron Jobs

Set up these Vercel Cron jobs:

```json
{
  "crons": [
    {
      "path": "/api/cron/expire",
      "schedule": "0 0 * * *"
    },
    {
      "path": "/api/cron/digest",
      "schedule": "0 8 * * 1"
    }
  ]
}
```

Add Authorization header: `Bearer {CRON_SECRET}`

## 📝 License

MIT License — feel free to use and modify.
