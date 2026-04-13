# MyResumeBuilder

A free, AI-powered, bilingual (English/Spanish) resume builder built for underserved job seekers. No account required. Step-by-step 15-question guide transforms raw input into a polished professional resume using Claude AI.

## 1. Project Overview

- **15-step questionnaire**: Contact info, work experience, education, volunteer work, certifications, skills, military, training, awards, employment gaps, accomplishments, interests, references, career goals, availability
- **AI generation**: Claude Sonnet transforms your answers into professional resume language — never fabricates, only enhances
- **Bilingual**: Full English and Spanish support throughout
- **PDF export**: Download a clean black & white letter-size PDF
- **Email delivery**: Send your resume directly to your inbox via Resend
- **Admin dashboard**: Password-gated metrics dashboard at `/admin`

## 2. Quick Start

```bash
# Clone and install
git clone https://github.com/yourusername/myresumebuilder.git
cd myresumebuilder
npm install

# Set up environment variables
cp .env.local.example .env.local
# Edit .env.local with your keys (see below)

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 3. Environment Variables

Copy `.env.local.example` to `.env.local` and fill in:

| Variable | Description | Where to get it |
|---|---|---|
| `ANTHROPIC_API_KEY` | Claude API key | [console.anthropic.com](https://console.anthropic.com/) |
| `SUPABASE_URL` | Supabase project URL | Supabase Dashboard → Settings → API |
| `SUPABASE_ANON_KEY` | Supabase anon/public key | Supabase Dashboard → Settings → API |
| `RESEND_API_KEY` | Resend email service key | [resend.com](https://resend.com/) |
| `ADMIN_PASSWORD` | Password for /admin dashboard | Choose your own |
| `NEXT_PUBLIC_APP_URL` | Your deployed URL | e.g. https://myresumebuilder.org |

**The app runs without Supabase and Resend** — resume generation and PDF download will work. Supabase enables metrics; Resend enables email delivery.

## 4. Supabase Setup

1. Create a free project at [supabase.com](https://supabase.com/)
2. Go to the SQL Editor
3. Run the contents of `supabase-schema.sql`
4. Copy your Project URL and anon key into `.env.local`

## 5. Deploy to Vercel

1. Push your code to a GitHub repository
2. Go to [vercel.com](https://vercel.com/) and import your repository
3. In the Vercel project settings, add all environment variables from `.env.local`
4. Deploy — Vercel will automatically build and deploy

## 6. Resend Email Setup

1. Create a free account at [resend.com](https://resend.com/)
2. Add and verify your sending domain (or use the sandbox for testing)
3. Create an API key and add to `.env.local` as `RESEND_API_KEY`
4. Update the `from` address in `app/api/email/route.ts` to match your verified domain

## 7. Admin Dashboard

Navigate to `/admin` in your browser. Enter the `ADMIN_PASSWORD` from your environment variables.

The dashboard shows:
- Total resumes built, this month, completion rate, average time
- Language breakdown (EN vs ES)
- Recent resumes table with CSV export

## 8. Cost Estimate

With Claude Sonnet (`claude-sonnet-4-5`):
- ~2,000-3,000 input tokens per resume generation
- ~1,000-1,500 output tokens per resume
- Plus ~500 tokens for annotation generation
- **Approximate cost: $0.04-$0.10 per complete resume**

Supabase free tier: 500MB database, unlimited reads/writes for hobby projects
Resend free tier: 3,000 emails/month

## 9. Tech Stack

- **Framework**: Next.js 14 App Router
- **Language**: TypeScript (strict)
- **Styling**: Tailwind CSS
- **AI**: Anthropic Claude Sonnet (`claude-sonnet-4-5`) via `@anthropic-ai/sdk`
- **Database**: Supabase (PostgreSQL) via `@supabase/supabase-js`
- **Email**: Resend via `resend`
- **PDF**: `html2pdf.js` (client-side, dynamic import)
- **i18n**: JSON files (`lib/i18n/en.json`, `lib/i18n/es.json`)
- **Deployment**: Vercel-ready
