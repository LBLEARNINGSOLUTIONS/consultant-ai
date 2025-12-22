# ConsultantAI - Setup Guide

This guide will walk you through setting up and running your ConsultantAI application.

## 📋 Prerequisites

Before you begin, ensure you have:

- **Node.js 18+** installed ([Download](https://nodejs.org/))
- **Supabase account** ([Sign up](https://supabase.com))
- **Anthropic API key** ([Get key](https://console.anthropic.com))

## 🚀 Quick Start (5 Minutes)

### Step 1: Install Dependencies

```bash
cd /Users/carliegbert/Desktop/consultant-ai
npm install
```

This will install all required packages including:
- React, TypeScript, Vite
- Supabase client
- Anthropic SDK (Claude AI)
- Tailwind CSS
- React PDF renderer
- And more...

### Step 2: Set Up Supabase

1. **Create a new Supabase project:**
   - Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
   - Click "New Project"
   - Choose a name (e.g., "consultant-ai")
   - Set a database password (save this!)
   - Choose a region close to you
   - Wait for the project to be created (~2 minutes)

2. **Run the database schema:**
   - In your Supabase project, go to **SQL Editor** (left sidebar)
   - Click "New Query"
   - Open the file `supabase-schema.sql` in this project
   - Copy the entire contents
   - Paste into the SQL Editor
   - Click "Run" (bottom right)
   - You should see a success message and a table showing 4 tables created

3. **Get your API credentials:**
   - Go to **Project Settings** (gear icon in sidebar)
   - Click **API** in the left menu
   - Copy the following:
     - **Project URL** (e.g., `https://xxxxx.supabase.co`)
     - **anon public** key (long string starting with `eyJ...`)

### Step 3: Get Anthropic API Key

1. Go to [https://console.anthropic.com](https://console.anthropic.com)
2. Sign up or log in
3. Go to **API Keys** in the dashboard
4. Click "Create Key"
5. Give it a name (e.g., "ConsultantAI")
6. Copy the key (starts with `sk-ant-api03-...`)

⚠️ **Important:** You'll be charged for API usage. Claude 3.5 Sonnet costs ~$0.015 per transcript analysis.

### Step 4: Configure Environment Variables

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Edit `.env` and add your credentials:
```bash
# Open in your favorite editor
nano .env
# or
code .env
# or
open -a TextEdit .env
```

3. Replace the placeholders:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_ANTHROPIC_API_KEY=sk-ant-api03-your-key-here
```

4. Save the file

### Step 5: Start the Development Server

```bash
npm run dev
```

You should see:
```
  VITE v5.1.4  ready in 500 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

Open your browser and go to **http://localhost:5173**

## ✅ Verify Everything Works

### Test 1: Sign Up

1. Click "Sign Up" tab
2. Enter:
   - Name: Your name
   - Email: your email
   - Password: at least 6 characters
3. Click "Create Account"
4. Check your email for verification (if enabled in Supabase)

### Test 2: Upload a Transcript

1. Create a test file called `test-interview.txt`:
```
Interviewer: Thanks for joining, Sarah. Can you tell me about your role?

Sarah: Sure. I'm a Senior Account Manager. I spend most of my day in spreadsheets fixing billing errors manually.

Interviewer: Walk me through that process.

Sarah: Sales closes a deal in Salesforce, but they don't fill in half the fields. So I have to chase them for details, then manually type everything into our ERP system, Oracle NetSuite. It takes about 2 hours per client.

Interviewer: That sounds time-consuming.

Sarah: It is. If I make a typo, billing fails a month later and the client gets upset. There's no training on NetSuite either - I just figured it out by Googling error codes.
```

2. Save the file
3. In ConsultantAI, click "Upload Transcripts"
4. Drag and drop `test-interview.txt` or click "browse"
5. Click "Upload & Analyze 1 File"
6. Wait 10-30 seconds for Claude to analyze
7. You should see the interview card update with:
   - Status: "Completed" (green badge)
   - Workflow count
   - Pain points count
   - Tools count
   - Roles count

### Test 3: View Results

Currently, the app shows interview cards with statistics. In the next phase, we'll add detailed views for:
- Workflows tab
- Pain Points tab
- Tools & Roles tab
- PDF export
- Company summaries

## 🏗️ Current Features (MVP)

✅ **Authentication**
- Sign up / Sign in
- Secure session management
- User profiles

✅ **File Upload**
- Drag & drop interface
- Multi-file batch upload
- File validation (size, type)

✅ **AI Analysis**
- Claude 3.5 Sonnet integration
- Automatic transcript analysis
- Structured data extraction:
  - Workflows
  - Pain points
  - Tools & software
  - Roles
  - Training gaps
  - Handoff risks

✅ **Data Persistence**
- Cloud database (Supabase)
- Real-time sync
- Multi-device access

✅ **Interview Management**
- List view with status badges
- Delete interviews
- Statistics summary

## 🚧 Features In Development

The following features are planned but not yet implemented:

⏳ **Analysis Viewer**
- Detailed tabbed interface
- Workflows tab with steps and participants
- Pain Points tab with severity filtering
- Tools & Roles tab
- Inline editing capabilities

⏳ **Company Summaries**
- Aggregate multiple interviews
- Generate strategic insights
- Trend analysis

⏳ **PDF Export**
- Professional PDF reports
- Interview analysis exports
- Company summary reports

⏳ **Enhanced Upload**
- .docx file support
- .pdf file support
- Progress tracking

Would you like me to continue building these features? Just say "keep building" and I'll implement the analysis viewer components next!

## 🛠️ Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## 📊 Database Structure

Your Supabase database has these tables:

- **profiles** - User accounts (linked to auth.users)
- **interviews** - Transcripts and analysis results
- **company_summaries** - Aggregated multi-interview reports
- **transcript_files** - File upload metadata

All tables have Row Level Security (RLS) enabled - users can only access their own data.

## 💰 Cost Estimates

### Claude API (Anthropic)
- **Model:** Claude 3.5 Sonnet
- **Cost per analysis:** ~$0.015 (1.5 cents)
- **100 analyses:** ~$1.50/month
- **1000 analyses:** ~$15/month

### Supabase
- **Free tier:** 500MB database, enough for ~5000 interviews
- **Pro tier:** $25/month (if you need more)

### Total
For typical usage (100 interviews/month): **$1.50/month**

## 🐛 Troubleshooting

### "Missing environment variables" error
- Make sure you created `.env` file
- Check that all three variables are set (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_ANTHROPIC_API_KEY)
- Restart the dev server after changing `.env`

### "Failed to fetch" or CORS errors
- Check your Supabase URL is correct
- Make sure your Supabase project is active
- Check that Row Level Security policies were created (run the schema SQL again)

### "Authentication error" from Claude
- Check your Anthropic API key is correct
- Make sure you have credits in your Anthropic account
- Verify the key starts with `sk-ant-api03-`

### Analysis stays in "Analyzing" forever
- Check browser console for errors (F12 → Console)
- Verify your Anthropic API key has sufficient credits
- Check network tab for failed requests

### Can't sign up / sign in
- Check Supabase project is running
- Verify database schema was created (4 tables should exist)
- Check browser console for errors
- Make sure email confirmation is disabled in Supabase (Settings → Authentication → Email Auth)

## 📁 Project Structure

```
consultant-ai/
├── src/
│   ├── components/          # React components
│   │   ├── auth/           # Login/signup
│   │   ├── upload/         # File upload UI
│   │   └── analysis/       # Analysis display
│   ├── hooks/              # Custom React hooks
│   │   ├── useAuth.ts      # Authentication
│   │   └── useInterviews.ts # Interview management
│   ├── services/           # Business logic
│   │   ├── analysisService.ts # Claude API
│   │   └── uploadService.ts   # File handling
│   ├── lib/                # Core libraries
│   │   ├── supabase.ts     # Supabase client
│   │   └── anthropic.ts    # Claude client
│   ├── types/              # TypeScript types
│   │   ├── database.ts     # Supabase types
│   │   └── analysis.ts     # Analysis types
│   └── utils/              # Helper functions
├── supabase-schema.sql     # Database schema
├── package.json            # Dependencies
└── .env                    # Your credentials (gitignored)
```

## 🔒 Security Notes

- **Never commit `.env` to git** - it's already in `.gitignore`
- Your Supabase anon key is safe to use client-side (protected by RLS)
- Anthropic API key is currently used client-side (for development only)
  - For production, move Claude API calls to a backend/Edge Function
- All database access is protected by Row Level Security

## 📞 Support

If you run into issues:

1. Check the browser console (F12 → Console)
2. Check the network tab (F12 → Network)
3. Verify environment variables are set correctly
4. Make sure Supabase database schema was created successfully
5. Check Anthropic API key has credits

## 🎯 Next Steps

Now that you have the MVP running:

1. ✅ Test with your own interview transcripts
2. ✅ Verify the AI analysis quality
3. 🔜 Request detailed analysis viewer components
4. 🔜 Request PDF export functionality
5. 🔜 Request company summary aggregation

**Ready to continue?** Just say "keep building" and I'll implement the full analysis viewer with tabs, editing, and detailed views!

---

Built with ❤️ using React, TypeScript, Claude AI, and Supabase
