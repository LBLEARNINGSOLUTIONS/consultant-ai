# Deployment Guide - GitHub & Supabase Setup

## Part 1: Push to GitHub

### Option A: Using GitHub CLI (Recommended)

If you have GitHub CLI installed:

```bash
cd /Users/carliegbert/Desktop/consultant-ai

# Create repository on GitHub
gh repo create consultant-ai --public --source=. --remote=origin

# Push code
git push -u origin main
```

### Option B: Using GitHub Website (Manual)

1. **Go to GitHub**: https://github.com/new

2. **Create New Repository**:
   - Repository name: `consultant-ai`
   - Description: `AI-powered interview transcript analysis tool using Claude AI and Supabase`
   - Visibility: Choose **Public** or **Private**
   - ⚠️ **DO NOT** initialize with README, .gitignore, or license (we already have these)
   - Click **"Create repository"**

3. **Copy the repository URL** (it will look like):
   ```
   https://github.com/YOUR-USERNAME/consultant-ai.git
   ```

4. **Connect and push from your terminal**:
   ```bash
   cd /Users/carliegbert/Desktop/consultant-ai

   # Add remote (replace YOUR-USERNAME with your GitHub username)
   git remote add origin https://github.com/YOUR-USERNAME/consultant-ai.git

   # Push code
   git push -u origin main
   ```

5. **Done!** Your code is now on GitHub at:
   ```
   https://github.com/YOUR-USERNAME/consultant-ai
   ```

---

## Part 2: Set Up Supabase Database

### Step 1: Create Supabase Project (if not done already)

1. Go to: https://supabase.com/dashboard
2. Click **"New project"**
3. Fill in:
   - **Name**: `consultant-ai` (or any name you prefer)
   - **Database Password**: Create a strong password (save this!)
   - **Region**: Choose closest to you (e.g., "West US (North California)")
   - **Pricing Plan**: Free (perfect for getting started)
4. Click **"Create new project"**
5. Wait ~2 minutes for project to initialize

### Step 2: Run Database Schema

1. **Open SQL Editor**:
   - In your Supabase project dashboard
   - Click **"SQL Editor"** in the left sidebar
   - Click **"New Query"**

2. **Copy the Schema**:
   - Open the file: `/Users/carliegbert/Desktop/consultant-ai/supabase-schema.sql`
   - Select ALL content (Cmd+A)
   - Copy (Cmd+C)

3. **Paste and Run**:
   - Paste into the SQL Editor
   - Click **"Run"** button (bottom right corner)
   - You should see: ✅ "Success. No rows returned"

4. **Verify Tables Created**:
   - Click **"Table Editor"** in left sidebar
   - You should see 4 tables:
     - ✅ `profiles`
     - ✅ `interviews`
     - ✅ `company_summaries`
     - ✅ `transcript_files`

### Step 3: Get Your API Credentials

1. **Go to Project Settings**:
   - Click the **⚙️ gear icon** in the left sidebar
   - Click **"API"** in the settings menu

2. **Copy These Values**:

   **Project URL**:
   ```
   https://xxxxxxxxxxxxx.supabase.co
   ```

   **anon public key** (under "Project API keys"):
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6...
   ```

### Step 4: Configure Your App

1. **Create `.env` file**:
   ```bash
   cd /Users/carliegbert/Desktop/consultant-ai
   cp .env.example .env
   ```

2. **Edit `.env`** (use any text editor):
   ```bash
   # Open with default editor
   open -a TextEdit .env

   # Or use VS Code
   code .env

   # Or use nano
   nano .env
   ```

3. **Add your credentials**:
   ```env
   # Supabase Configuration (from Step 3)
   VITE_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

   # Anthropic Configuration (get from console.anthropic.com)
   VITE_ANTHROPIC_API_KEY=sk-ant-api03-your-key-here

   # Optional: App Configuration
   VITE_APP_NAME=ConsultantAI
   VITE_MAX_FILE_SIZE_MB=10
   VITE_MAX_CONCURRENT_UPLOADS=3
   ```

4. **Save the file**

### Step 5: Verify Database Connection

1. **Check Table Structure**:
   - In Supabase Dashboard → **Table Editor**
   - Click on `interviews` table
   - You should see columns:
     - id, user_id, title, transcript_text
     - analysis_status, workflows, pain_points, tools, roles
     - training_gaps, handoff_risks
     - raw_analysis_response, error_message
     - analyzed_at, created_at, updated_at

2. **Check RLS Policies**:
   - Click on `interviews` table
   - Click **"RLS"** tab (Row Level Security)
   - You should see 4 policies:
     - ✅ Users can view own interviews
     - ✅ Users can insert own interviews
     - ✅ Users can update own interviews
     - ✅ Users can delete own interviews

3. **Test Authentication** (Optional):
   - Go to **Authentication** → **Users**
   - You should see "0 users" initially
   - After you sign up in the app, users will appear here

---

## Part 3: Get Anthropic API Key

### Step 1: Create Anthropic Account

1. Go to: https://console.anthropic.com
2. Click **"Sign Up"** (or Sign In if you have account)
3. Verify your email

### Step 2: Add Payment Method

⚠️ **Important**: Claude API requires a payment method, but you only pay for what you use.

1. Go to **Billing** in the console
2. Add a credit card
3. (Optional) Set a monthly spending limit (e.g., $10/month for safety)

### Step 3: Create API Key

1. Go to **API Keys** in the console
2. Click **"Create Key"**
3. Give it a name: `ConsultantAI Production`
4. Copy the key (starts with `sk-ant-api03-...`)
5. **⚠️ Save this key somewhere safe** - you can't see it again!

### Step 4: Add Key to .env

Add to your `.env` file:
```env
VITE_ANTHROPIC_API_KEY=sk-ant-api03-xxxxxxxxxxxxxxxxxxxxxxxxx
```

### Pricing Reference

- **Claude 3.5 Sonnet**:
  - Input: $3 per million tokens
  - Output: $15 per million tokens
- **Average transcript** (500 words): ~$0.015 per analysis
- **100 analyses/month**: ~$1.50
- **1000 analyses/month**: ~$15

---

## Part 4: Test Everything Works

### Test 1: Install and Run

```bash
cd /Users/carliegbert/Desktop/consultant-ai

# Install dependencies
npm install

# Start development server
npm run dev
```

Expected output:
```
  VITE v5.1.4  ready in 500 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

### Test 2: Sign Up

1. Open http://localhost:5173
2. Click **"Sign Up"** tab
3. Enter:
   - Name: Your Name
   - Email: your@email.com
   - Password: testpass123 (or stronger)
4. Click **"Create Account"**
5. You should be logged in automatically

### Test 3: Verify User in Supabase

1. Go to Supabase Dashboard → **Authentication** → **Users**
2. You should see your new user listed
3. Go to **Table Editor** → **profiles**
4. You should see your profile entry

### Test 4: Upload Test Transcript

1. Create `test-interview.txt` with this content:

```
Interviewer: Thanks for joining, Sarah. Tell me about your role.

Sarah: I'm a Senior Account Manager at Acme Logistics. I spend most of my day manually fixing billing errors in spreadsheets.

Interviewer: Walk me through your workflow.

Sarah: Sales closes deals in Salesforce, but they don't fill in all the fields. I have to chase them for details, then manually type everything into Oracle NetSuite. It takes 2 hours per client. If I make a typo, billing fails a month later.

Interviewer: Who else is involved?

Sarah: The Ops team. I send them an email saying "New Client Ready" - there's no formal handoff. Sometimes they miss it and clients wait a week for service.

Interviewer: Any training on these systems?

Sarah: Zero. I learned by Googling error codes.
```

2. In the app, click **"Upload Transcripts"**
3. Drag and drop `test-interview.txt`
4. Click **"Upload & Analyze 1 File"**
5. Wait 10-30 seconds for Claude to analyze

### Test 5: Verify Analysis Results

After analysis completes, you should see:

- ✅ Status badge: **"Completed"** (green)
- ✅ Workflows: **1** (Client onboarding process)
- ✅ Pain Points: **3-4** (manual entry, errors, handoffs, training)
- ✅ Tools: **3** (Salesforce, NetSuite, Excel/spreadsheets)
- ✅ Roles: **3** (Account Manager, Sales, Ops)

### Test 6: Verify in Database

1. Go to Supabase → **Table Editor** → **interviews**
2. You should see 1 row with:
   - title: `test-interview`
   - analysis_status: `completed`
   - workflows: [array of JSON objects]
   - pain_points: [array of JSON objects]
   - analyzed_at: timestamp

---

## ✅ Success Checklist

- [ ] Code pushed to GitHub
- [ ] Supabase project created
- [ ] Database schema executed (4 tables created)
- [ ] API credentials copied
- [ ] `.env` file configured with all 3 keys
- [ ] Dependencies installed (`npm install`)
- [ ] App runs locally (`npm run dev`)
- [ ] Successfully signed up a user
- [ ] User appears in Supabase Authentication
- [ ] Profile created in `profiles` table
- [ ] Test transcript uploaded
- [ ] Claude analysis completed
- [ ] Results visible in app
- [ ] Interview saved in `interviews` table

---

## 🎉 You're Done!

Your ConsultantAI app is now:
- ✅ Backed by Supabase (cloud database)
- ✅ Using Claude AI for analysis
- ✅ Version controlled on GitHub
- ✅ Ready for development

### Next Steps

**Option 1: Start Using It**
- Upload real interview transcripts
- Analyze your data
- Build insights

**Option 2: Continue Building**
- Say "keep building" to add:
  - Detailed analysis viewer with tabs
  - Inline editing
  - Company summaries
  - PDF export

**Option 3: Deploy to Production**
- Deploy to Vercel (recommended): https://vercel.com
- Connect your GitHub repo
- Add environment variables
- Deploy in 2 minutes

---

## 🆘 Troubleshooting

### Can't push to GitHub
```bash
# Check if git remote is set
git remote -v

# If no remote, add it (replace YOUR-USERNAME)
git remote add origin https://github.com/YOUR-USERNAME/consultant-ai.git

# Push again
git push -u origin main
```

### "Missing environment variables" error
- Make sure `.env` file exists in project root
- Check all 3 variables are set (no empty values)
- Restart dev server: `npm run dev`

### "Failed to create user" in Supabase
- Check database schema was run successfully
- Verify `profiles` table exists
- Check RLS policies are enabled

### Claude API errors
- Verify API key starts with `sk-ant-api03-`
- Check you have credits in Anthropic account
- Make sure billing is set up

### Database connection errors
- Verify Supabase URL is correct (ends with `.supabase.co`)
- Check anon key is correct (long JWT string)
- Make sure project is active in Supabase dashboard

---

Need help? Check the other docs:
- **QUICKSTART.txt** - Quick reference
- **SETUP.md** - Detailed setup guide
- **BUILD-STATUS.md** - What's built, what's not
- **README.md** - Project overview
